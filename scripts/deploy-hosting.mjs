#!/usr/bin/env node
// Publica Aprende en Firebase Hosting bajo /aprende/ (C20, C21, infra I18, I19).
//
// Hosting guarda UNA versión del sitio entera (reglas y archivos): publicar archivos reemplaza la versión vigente. Por eso:
//  1. toma la configuración (rewrites y cabeceras) de la versión vigente y la conserva tal cual: el rewrite `** -> musicsite`
//     lo fija infra/hosting.sh y este script no lo toca;
//  2. crea una versión nueva con esa configuración y SOLO los archivos de Aprende;
//  3. se niega si la versión vigente no tiene rewrites (el sitio quedaría sin rutas) o si trae archivos que no son de
//     /aprende/ (se perderían);
//  4. sube solo lo que Hosting no tiene, finaliza y recién entonces lanza. Una versión que no finaliza no se lanza.
//
// Uso: node scripts/deploy-hosting.mjs <carpeta-dist> [--dry-run]
// Entorno: AUTH_ACCESS_TOKEN (token de OAuth; no se imprime), PROJECT_ID (saulapp-music), SITE_ID (= PROJECT_ID), PREFIX (/aprende).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";

const LOCAL = /^http:\/\/127\.0\.0\.1:\d+$/;

/** Los archivos de `dir`, comprimidos, con su ruta pública y su hash (sha256 del contenido comprimido, como pide Hosting). */
export function collectFiles(dir, prefix = "/aprende") {
  const out = [];
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      if (name.startsWith(".")) continue;
      const full = join(current, name);
      if (statSync(full).isDirectory()) walk(full);
      else {
        const gz = gzipSync(readFileSync(full), { level: 9 });
        out.push({ path: `${prefix}/${relative(dir, full).split(sep).join("/")}`, gz, hash: createHash("sha256").update(gz).digest("hex") });
      }
    }
  };
  walk(dir);
  return out;
}

/**
 * @param {object} o
 * @param {string} o.dir carpeta con el build
 * @param {string} o.token
 * @param {string} o.site
 * @param {string} [o.prefix]
 * @param {string} [o.apiBase]    solo para pruebas: http://127.0.0.1:<puerto>
 * @param {boolean} [o.dryRun]
 * @param {(m: string) => void} [o.log]
 */
export async function publish({ dir, token, site, project = site, prefix = "/aprende", apiBase = "", dryRun = false, log = console.log }) {
  if (apiBase && !LOCAL.test(apiBase)) throw new Error("apiBase solo admite http://127.0.0.1:<puerto>");
  const API = `${apiBase || "https://firebasehosting.googleapis.com"}/v1beta1`;

  async function call(method, url, { body, headers = {}, raw = false } = {}) {
    const response = await fetch(url.startsWith("http") ? url : `${API}/${url}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "x-goog-user-project": project, ...(body && !raw ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
      let message = "";
      try { message = JSON.parse(text).error?.message ?? ""; } catch { /* sin detalle */ }
      throw new Error(`la API de Hosting respondió ${response.status}: ${message.slice(0, 200) || "sin detalle"}`);
    }
    return text ? JSON.parse(text) : {};
  }

  const files = collectFiles(dir, prefix);
  if (!files.some((f) => f.path === `${prefix}/index.html`)) throw new Error(`${dir} no tiene index.html: ¿corriste el build?`);

  const { releases = [] } = await call("GET", `sites/${site}/releases?pageSize=1`);
  const live = releases[0]?.version;
  if (!live?.name) throw new Error("no hay una versión vigente: corre infra/bootstrap/hosting.sh on primero");
  const config = live.config ?? {};
  if (!(config.rewrites ?? []).length) throw new Error("la versión vigente no tiene rewrites: el sitio quedaría sin rutas; no se publica nada");
  const foreign = [];
  let pageToken = "";
  do {
    const page = await call("GET", `${live.name}/files?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`);
    for (const f of page.files ?? []) if (!f.path.startsWith(`${prefix}/`)) foreign.push(f.path);
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);
  if (foreign.length) throw new Error(`la versión vigente tiene ${foreign.length} archivo(s) que no son de ${prefix}/ (p. ej. ${foreign[0]}) y se perderían; no se publica nada`);

  log(`→ ${files.length} archivos de ${prefix}/ (${Math.round(files.reduce((n, f) => n + f.gz.length, 0) / 1024)} KB comprimidos); configuración vigente conservada`);
  if (dryRun) return { dryRun: true, files: files.length };

  const version = await call("POST", `sites/${site}/versions`, { body: { config } });
  const populate = await call("POST", `${version.name}:populateFiles`, { body: { files: Object.fromEntries(files.map((f) => [f.path, f.hash])) } });
  const need = new Set(populate.uploadRequiredHashes ?? []);
  for (const f of files.filter((x) => need.has(x.hash))) {
    await call("POST", `${populate.uploadUrl}/${f.hash}`, { body: f.gz, raw: true, headers: { "Content-Type": "application/octet-stream" } });
  }
  log(`→ subidos ${need.size} de ${files.length} (el resto ya estaba en Hosting)`);
  const done = await call("PATCH", `${version.name}?updateMask=status`, { body: { status: "FINALIZED" } });
  if (done.status !== "FINALIZED") throw new Error(`la versión no quedó finalizada (${done.status}); no se publica`);
  await call("POST", `sites/${site}/releases?versionName=${encodeURIComponent(version.name)}`, { body: {} });
  log(`→ publicado: https://${site}.web.app${prefix}/`);
  return { dryRun: false, files: files.length, uploaded: need.size, version: version.name };
}

async function main() {
  const [dir, flag] = process.argv.slice(2);
  if (!dir) throw new Error("uso: node scripts/deploy-hosting.mjs <carpeta-dist> [--dry-run]");
  const token = process.env.AUTH_ACCESS_TOKEN;
  if (!token) throw new Error("falta AUTH_ACCESS_TOKEN");
  const project = process.env.PROJECT_ID ?? "saulapp-music";
  await publish({ dir, token, project, site: process.env.SITE_ID ?? project, prefix: process.env.PREFIX ?? "/aprende", dryRun: flag === "--dry-run" });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  });
}
