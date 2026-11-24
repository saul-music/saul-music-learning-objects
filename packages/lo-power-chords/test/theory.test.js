import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { makeQuestion, notesOf, ROOTS, voicing } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const semis = (a, b) => (Note.chroma(b) - Note.chroma(a) + 12) % 12;

describe("Acordes de quinta", () => {
  it("X5 es raíz y 5ª (7 semitonos), sin dobles alteraciones", () => {
    expect(notesOf("E", "power")).toEqual(["E", "B"]);
    expect(notesOf("C", "power")).toEqual(["C", "G"]);
    for (const r of ROOTS) {
      const [a, b] = notesOf(r, "power");
      expect(semis(a, b)).toBe(7);
      expect(a + b).not.toMatch(/##|bb/);
      expect(voicing(r, "power")).toHaveLength(3);
    }
  });
  it("las alternativas incluyen la respuesta una sola vez", () => {
    const rng = seeded(7);
    for (let i = 0; i < 600; i++) {
      const q = makeQuestion(rng);
      expect(q.choices[q.correct]).toBe(q.answer);
      expect(new Set(q.choices).size).toBe(q.choices.length);
    }
  });
});
