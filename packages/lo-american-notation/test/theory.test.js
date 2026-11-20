import { describe, expect, it } from "vitest";
import { makeQuestion, midiOf, nextLetterQuestion, toLetterQuestion, toSpokenQuestion } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

describe("Do es C", () => {
  it("de letra a nombre: la respuesta es el nombre latino", () => {
    const rng = seeded(1);
    for (let i = 0; i < 300; i++) {
      const q = toSpokenQuestion(rng);
      expect(q.choices).toHaveLength(4);
      expect(q.explain).toContain(q.choices[q.correct]);
    }
  });

  it("de nombre a letra: la respuesta es la letra", () => {
    const rng = seeded(2);
    for (let i = 0; i < 300; i++) {
      const q = toLetterQuestion(rng);
      expect(q.choices[q.correct]).toBe(q.name);
    }
  });

  it("el alfabeto musical da la vuelta: después de G viene A y antes de A viene G", () => {
    let found = { forward: false, backward: false };
    const rng = seeded(3);
    for (let i = 0; i < 500; i++) {
      const q = nextLetterQuestion(rng);
      if (q.name === "G" && q.forward) { expect(q.answer).toBe("A"); found.forward = true; }
      if (q.name === "A" && !q.forward) { expect(q.answer).toBe("G"); found.backward = true; }
    }
    expect(found).toEqual({ forward: true, backward: true });
  });

  it("toda nota del juego cabe en la octava del teclado (C4 a B4)", () => {
    const rng = seeded(4);
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion(rng);
      const m = midiOf(q.name);
      expect(m).toBeGreaterThanOrEqual(60);
      expect(m).toBeLessThanOrEqual(71);
    }
  });
});
