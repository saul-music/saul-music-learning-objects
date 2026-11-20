import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { chordNotes, makeQuestion, QUALITIES, ROOTS, shapeMidis, shapesOf, stringNoteQuestion } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const repeat = (n, seed, fn) => { const rng = seeded(seed); for (let i = 0; i < n; i++) fn(rng); };

describe("Manos de acorde", () => {
  it("cada forma de chords-db suena solo con notas de su acorde", () => {
    for (const r of ROOTS) for (const q of QUALITIES) for (const shape of shapesOf(r, q)) {
      const chromas = new Set(chordNotes(r, q).map((n) => Note.chroma(n)));
      for (const m of shapeMidis(shape)) expect(chromas.has(m % 12)).toBe(true);
    }
  });

  it("C#7 se escribe con E# (las notas raras aparecen en los acordes)", () => {
    expect(chordNotes("C#", "7")).toEqual(["C#", "E#", "G#", "B"]);
  });

  it("las alternativas tienen la respuesta, sin repetir", () => {
    repeat(600, 1, (rng) => {
      const q = makeQuestion(rng);
      const texts = q.choices.map((c) => (typeof c === "string" ? c : c.symbol));
      expect(new Set(texts).size).toBe(texts.length);
      expect(texts[q.correct]).toBe(q.answer);
    });
  });

  it("la nota de la cuerda marcada es una nota del acorde y ninguna alternativa suena igual", () => {
    repeat(400, 2, (rng) => {
      const q = stringNoteQuestion(rng);
      expect(chordNotes(q.root, q.quality)).toContain(q.answer);
      const same = q.choices.filter((c) => Note.chroma(c) === Note.chroma(q.answer));
      expect(same).toHaveLength(1);
    });
  });
});
