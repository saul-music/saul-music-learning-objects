import { mkdtempSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lessonsCatalog } from "../src/catalog.js";
import { PATHS } from "../src/lessons/index.js";

describe("catálogo público", () => {
  it("lista cada ruta y cada lección con su título y nada del contenido", () => {
    const catalog = lessonsCatalog();
    expect(catalog.map((p) => p.id)).toEqual(PATHS.map((p) => p.id));
    for (const [i, p] of catalog.entries()) {
      expect(Object.keys(p).sort()).toEqual(["id", "lessons", "title"]);
      expect(p.lessons.map((l) => l.id)).toEqual(PATHS[i].lessons.map((l) => l.id));
      for (const l of p.lessons) expect(Object.keys(l).sort()).toEqual(["id", "title"]);
    }
    expect(JSON.stringify(catalog)).not.toMatch(/slides|text|figure|listen/);
  });

  it("el script lo escribe como lessons.json válido en la carpeta pedida", () => {
    const dist = mkdtempSync(join(tmpdir(), "aprende-dist-"));
    execFileSync("node", ["apps/aprende/scripts/lessons-json.mjs", dist]);
    const written = JSON.parse(readFileSync(join(dist, "lessons.json"), "utf8"));
    expect(written).toEqual(lessonsCatalog());
    expect(written[0].lessons.length).toBe(10);
  });
});
