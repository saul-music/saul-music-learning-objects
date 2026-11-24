import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMING, PATHS, lessonById, pathById } from "../src/lessons/index.js";

const SLUG = /^[a-z][a-z-]{0,23}$/; // lo que acepta el servidor (S103)
const root = new URL("../../../", import.meta.url);
const lessons = PATHS.flatMap((p) => p.lessons.map((l) => ({ path: p, lesson: l })));

describe("lecciones", () => {
  it("las rutas y las lecciones tienen identificadores que el servidor acepta y no se repiten", () => {
    expect(new Set(PATHS.map((p) => p.id)).size).toBe(PATHS.length);
    for (const p of PATHS) {
      expect(p.id).toMatch(SLUG);
      expect(new Set(p.lessons.map((l) => l.id)).size).toBe(p.lessons.length);
      for (const l of p.lessons) expect(l.id, l.id).toMatch(SLUG);
    }
  });

  it("el path básico tiene una lección por cada juego, en el orden del recorrido", () => {
    expect(pathById("basico").lessons.map((l) => l.oa)).toEqual([
      "lo-american-notation", "lo-intervals", "lo-enharmonic-spelling", "lo-fretboard-notes",
      "lo-arpeggios", "lo-major-minor-ear", "lo-chord-shapes", "lo-power-chords", "lo-dim-aug", "lo-read-bars",
    ]);
  });

  it("cada lección usa un juego que existe y su título coincide con el del juego", () => {
    for (const { lesson } of lessons) {
      const file = new URL(`packages/${lesson.oa}/metadata.json`, root);
      expect(existsSync(file), lesson.oa).toBe(true);
      expect(JSON.parse(readFileSync(file, "utf8")).general.title, lesson.id).toBe(lesson.title);
    }
  });

  it("cada lección tiene exactamente 6 diapositivas con título y texto", () => {
    for (const { lesson } of lessons) {
      expect(lesson.slides.length, lesson.id).toBe(6);
      for (const s of lesson.slides) {
        expect(s.title?.length, `${lesson.id}: título`).toBeGreaterThan(0);
        expect(s.text.length, `${lesson.id}/${s.title}`).toBeGreaterThan(0);
        for (const t of s.text) expect(typeof t).toBe("string");
      }
      expect(lesson.summary.length).toBeGreaterThan(10);
      expect(lesson.readMinutes).toBeGreaterThan(0);
    }
  });

  it("las figuras y los botones de oír tienen la forma que la app sabe dibujar", () => {
    for (const { lesson } of lessons) {
      for (const s of lesson.slides) {
        const f = s.figure;
        if (f) {
          expect(["keyboard", "notes", "table"]).toContain(f.type);
          if (f.type === "keyboard") {
            expect(f.from).toBeLessThan(f.to);
            for (const m of f.marks) expect(m.midi, `${lesson.id}/${s.title}`).toBeGreaterThanOrEqual(f.from);
          }
          if (f.type === "table") for (const row of f.rows) expect(row.length, `${lesson.id}/${s.title}`).toBe(f.head.length);
        }
        for (const l of s.listen ?? []) {
          expect(l.label.length).toBeGreaterThan(0);
          expect(l.notes.length).toBeGreaterThan(0);
          for (const n of l.notes) expect(Number.isInteger(n) && n >= 36 && n <= 96, `${lesson.id}: nota ${n}`).toBe(true);
        }
      }
    }
  });

  it("clave americana siempre: nada de «Do#», «Reb» ni notas latinas escritas como cifrado", () => {
    const text = lessons.flatMap(({ lesson }) => [lesson.title, lesson.summary, ...lesson.slides.flatMap((s) => [s.title, ...s.text])]).join("\n");
    expect(text).not.toMatch(/\b(Do|Re|Mi|Fa|Sol|La|Si)(#|b)\b/);
  });

  it("repo público: ninguna lección trae letras, títulos de canciones ni datos de personas", () => {
    const text = JSON.stringify(PATHS);
    expect(text).not.toMatch(/@|https?:\/\//);
  });

  it("por ahora solo existe la ruta Básico y no se anuncia ninguna otra", () => {
    expect(PATHS.map((p) => p.id)).toEqual(["basico"]);
    expect(COMING).toEqual([]);
  });

  it("las rutas anunciadas (si las hay) no chocan con las que existen", () => {
    for (const c of COMING) {
      expect(c.id).toMatch(SLUG);
      expect(pathById(c.id)).toBeNull();
    }
    expect(lessonById(pathById("basico"), "lee-los-compases")?.oa).toBe("lo-read-bars");
    expect(lessonById(pathById("basico"), "pulso")).toBeNull();
    expect(lessonById(pathById("basico"), "no-existe")).toBeNull();
  });
});
