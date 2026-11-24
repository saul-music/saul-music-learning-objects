import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { makeQuestion, notesOf, ROOTS } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const semis = (a, b) => (Note.chroma(b) - Note.chroma(a) + 12) % 12;

describe("Disminuidos y aumentados", () => {
  it("las tríadas conocidas", () => {
    expect(notesOf("C", "dim")).toEqual(["C", "Eb", "Gb"]);
    expect(notesOf("C", "aug")).toEqual(["C", "E", "G#"]);
    expect(notesOf("A", "dim")).toEqual(["A", "C", "Eb"]);
    expect(notesOf("E", "aug")).toEqual(["E", "G#", "B#"]);
  });
  it("dim tiene 5ª de 6 semitonos y aug de 8; todas las raíces se escriben sin dobles alteraciones", () => {
    expect(ROOTS.length).toBeGreaterThanOrEqual(6);
    for (const r of ROOTS) {
      expect(semis(r, notesOf(r, "dim")[2])).toBe(6);
      expect(semis(r, notesOf(r, "aug")[2])).toBe(8);
      for (const k of ["dim", "aug"]) expect(notesOf(r, k).join("")).not.toMatch(/##|bb/);
    }
  });
  it("las alternativas incluyen la respuesta una sola vez", () => {
    const rng = seeded(11);
    for (let i = 0; i < 800; i++) {
      const q = makeQuestion(rng);
      expect(q.choices[q.correct]).toBe(q.answer);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      if (q.type === "fifth") expect(new Set(q.choices.map((c) => Note.chroma(c))).size).toBe(q.choices.length);
    }
  });
});
