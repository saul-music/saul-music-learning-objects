import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import {
  chromaticSteps,
  enharmonicQuestion,
  halfStepQuestion,
  intervalNameQuestion,
  makeQuestion,
  scaleSpellingQuestion,
  semitonesQuestion,
} from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const repeat = (n, seed, fn) => { const rng = seeded(seed); for (let i = 0; i < n; i++) fn(rng); };

describe("El misterio de E#", () => {
  it("las alternativas nunca traen dos nombres del mismo sonido", () => {
    repeat(800, 1, (rng) => {
      const q = makeQuestion(rng);
      expect(q.choices[q.correct]).toBe(q.answer);
      if (["halfStep", "enharmonic", "scaleSpelling"].includes(q.type)) {
        const chromas = q.choices.map((c) => Note.chroma(c));
        // En la escala, la respuesta rara (E#) convive a propósito con su enarmónica (F) como distractor.
        if (q.type !== "scaleSpelling") expect(new Set(chromas).size).toBe(4);
      }
    });
  });

  it("medio tono arriba de E es F y arriba de B es C", () => {
    repeat(600, 2, (rng) => {
      const q = halfStepQuestion(rng);
      if (q.from === "E" && q.up) expect(q.answer).toBe("F");
      if (q.from === "B" && q.up) expect(q.answer).toBe("C");
      if (q.from === "C" && !q.up) expect(q.answer).toBe("B");
    });
  });

  it("E# suena como F, Cb como B, y C# como Db", () => {
    repeat(600, 3, (rng) => {
      const q = enharmonicQuestion(rng);
      expect(Note.chroma(q.answer)).toBe(Note.chroma(q.from));
      expect(q.answer).not.toBe(q.from);
      if (q.from === "E#") expect(q.answer).toBe("F");
      if (q.from === "Cb") expect(q.answer).toBe("B");
      if (q.from === "C#") expect(q.answer).toBe("Db");
    });
  });

  it("cuenta semitonos y nombra los pasos", () => {
    expect(chromaticSteps("A", 4)).toEqual(["A", "A#", "B", "C", "C#"]);
    repeat(300, 4, (rng) => {
      const q = semitonesQuestion(rng);
      expect(Number(q.answer)).toBe(q.semis);
      expect(q.explain.split(" → ")).toHaveLength(q.semis + 1);
    });
  });

  it("nombra intervalos bien escritos (de E a G# es 3ª mayor)", () => {
    repeat(400, 5, (rng) => {
      const q = intervalNameQuestion(rng);
      expect(q.to).not.toMatch(/##|bb/);
      if (q.from === "E" && q.answer === "3ª mayor") expect(q.to).toBe("G#");
    });
  });

  it("en F# mayor la 7ª es E#, porque cada letra va una vez", () => {
    let sawRare = false;
    repeat(400, 6, (rng) => {
      const q = scaleSpellingQuestion(rng);
      expect(new Set(q.notes.map((n) => n[0])).size).toBe(7);
      if (q.key === "F#" && q.degree === 7) {
        expect(q.answer).toBe("E#");
        expect(q.explain).toContain("no F");
        sawRare = true;
      }
    });
    expect(sawRare).toBe(true);
  });
});
