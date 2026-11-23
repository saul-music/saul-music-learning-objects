import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectFiles, publish } from "../scripts/deploy-hosting.mjs";

const CONFIG = { rewrites: [{ glob: "**", run: { serviceId: "musicsite", region: "southamerica-west1" } }], headers: [{ glob: "**", headers: { "X-Robots-Tag": "noindex" } }] };

function build() {
  const dir = mkdtempSync(join(tmpdir(), "aprende-"));
  mkdirSync(join(dir, "assets"));
  writeFileSync(join(dir, "index.html"), "<h1>hola</h1>");
  writeFileSync(join(dir, "assets", "app.js"), "console.log(1)");
  writeFileSync(join(dir, ".oculto"), "no");
  return dir;
}

/** Hosting falso: guarda lo que se le manda para poder comprobarlo. */
async function fakeHosting({ config = CONFIG, liveFiles = [], alreadyThere = [], finalStatus = "FINALIZED", noRelease = false } = {}) {
  const log = { calls: [], created: null, populated: null, uploads: [], released: null, tokens: new Set() };
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    log.tokens.add(req.headers.authorization);
    const url = new URL(req.url, "http://x");
    const send = (body, status = 200) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
    log.calls.push(`${req.method} ${url.pathname}`);
    const base = `http://127.0.0.1:${server.address().port}`;
    if (req.method === "GET" && url.pathname.endsWith("/releases")) return send(noRelease ? {} : { releases: [{ version: { name: "sites/s/versions/v1", config } }] });
    if (req.method === "GET" && url.pathname.endsWith("/files")) return send({ files: liveFiles.map((path) => ({ path })) });
    if (req.method === "POST" && url.pathname.endsWith("/versions")) { log.created = JSON.parse(raw); return send({ name: "sites/s/versions/v2" }); }
    if (req.method === "POST" && url.pathname.endsWith(":populateFiles")) {
      log.populated = JSON.parse(raw).files;
      const need = Object.values(log.populated).filter((h) => !alreadyThere.includes(h));
      return send({ uploadRequiredHashes: need, uploadUrl: `${base}/upload/v2/files` });
    }
    if (req.method === "POST" && url.pathname.startsWith("/upload/")) { log.uploads.push(url.pathname.split("/").pop()); return send({}); }
    if (req.method === "PATCH") return send({ status: finalStatus });
    if (req.method === "POST" && url.pathname.endsWith("/releases")) { log.released = url.searchParams.get("versionName"); return send({}); }
    send({ error: { message: "ruta no prevista" } }, 404);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { log, base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

let fake;
afterEach(() => fake?.close());
const run = (extra = {}) => publish({ dir: build(), token: "tok-secreto", site: "s", apiBase: fake.base, log: () => {}, ...extra });

describe("publicar Aprende en Hosting", () => {
  it("recoge los archivos con su ruta pública, sin ocultos, con hash del contenido comprimido", () => {
    const files = collectFiles(build());
    expect(files.map((f) => f.path)).toEqual(["/aprende/assets/app.js", "/aprende/index.html"]);
    expect(files[0].hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("conserva la configuración vigente, sube lo que falta, finaliza y recién entonces lanza", async () => {
    fake = await fakeHosting();
    const result = await run();
    expect(fake.log.created).toEqual({ config: CONFIG }); // el rewrite a musicsite y noindex siguen
    expect(Object.keys(fake.log.populated).sort()).toEqual(["/aprende/assets/app.js", "/aprende/index.html"]);
    expect(fake.log.uploads.length).toBe(2);
    expect(fake.log.released).toBe("sites/s/versions/v2");
    const order = fake.log.calls.map((c) => c.split(" ")[0] + c.split("/").pop());
    expect(order.indexOf("PATCHv2")).toBeLessThan(order.lastIndexOf("POSTreleases"));
    expect(result.uploaded).toBe(2);
  });

  it("no vuelve a subir lo que Hosting ya tiene", async () => {
    const dir = build();
    const [app] = collectFiles(dir); // el mismo contenido da el mismo hash: la compresión es determinista
    fake = await fakeHosting({ alreadyThere: [app.hash] });
    const result = await publish({ dir, token: "t", site: "s", apiBase: fake.base, log: () => {} });
    expect(result.uploaded).toBe(1);
    expect(fake.log.uploads).not.toContain(app.hash);
    expect(Object.keys(fake.log.populated)).toContain(app.path); // igual se declara en la versión nueva
  });

  it("se niega si la versión vigente no tiene rewrites: el sitio quedaría sin rutas", async () => {
    fake = await fakeHosting({ config: {} });
    await expect(run()).rejects.toThrow(/sin rutas/);
    expect(fake.log.created).toBeNull();
    expect(fake.log.released).toBeNull();
  });

  it("se niega si hay archivos ajenos a /aprende/ en la versión vigente: se perderían", async () => {
    fake = await fakeHosting({ liveFiles: ["/aprende/index.html", "/otra/cosa.html"] });
    await expect(run()).rejects.toThrow(/se perderían/);
    expect(fake.log.released).toBeNull();
  });

  it("las URLs reservadas de Firebase (/__/…) no cuentan como archivos ajenos", async () => {
    fake = await fakeHosting({ liveFiles: ["/__/firebase/init.js", "/__/firebase/init.json", "/aprende/index.html"] });
    await expect(run()).resolves.toMatchObject({ dryRun: false });
    expect(fake.log.released).toBe("sites/s/versions/v2");
  });

  it("se niega si no hay versión vigente", async () => {
    fake = await fakeHosting({ noRelease: true });
    await expect(run()).rejects.toThrow(/hosting\.sh on/);
  });

  it("si la versión no finaliza, no la lanza", async () => {
    fake = await fakeHosting({ finalStatus: "CREATED" });
    await expect(run()).rejects.toThrow(/no quedó finalizada/);
    expect(fake.log.released).toBeNull();
  });

  it("con --dry-run no crea ni sube nada", async () => {
    fake = await fakeHosting();
    expect(await run({ dryRun: true })).toMatchObject({ dryRun: true });
    expect(fake.log.created).toBeNull();
    expect(fake.log.uploads).toEqual([]);
  });

  it("sin index.html no publica (el build no corrió)", async () => {
    fake = await fakeHosting();
    const empty = mkdtempSync(join(tmpdir(), "vacio-"));
    await expect(publish({ dir: empty, token: "t", site: "s", apiBase: fake.base, log: () => {} })).rejects.toThrow(/index\.html/);
  });

  it("solo habla con un servidor local en las pruebas y nunca imprime el token", async () => {
    await expect(publish({ dir: build(), token: "t", site: "s", apiBase: "https://evil.example", log: () => {} })).rejects.toThrow(/127\.0\.0\.1/);
    fake = await fakeHosting();
    const lines = [];
    await publish({ dir: build(), token: "tok-secreto", site: "s", apiBase: fake.base, log: (m) => lines.push(m) });
    expect(lines.join("\n")).not.toContain("tok-secreto");
  });
});
