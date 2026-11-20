import { describe, expect, it } from "vitest";
import { countQuestion, FIGURES, figuresFor, listenQuestion, makeQuestion, METERS, ruleQuestion, strumBeats, strumRule } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const repeat = (n, seed, fn) => { const rng = seeded(seed); for (let i = 0; i < n; i++) fn(rng); };

describe("Pulso", () => {
  it("los golpes caen en los tiempos de cada figura", () => {
    expect(strumBeats("4/4", "redonda")).toEqual([0]);
    expect(strumBeats("4/4", "blanca")).toEqual([0, 2]);
    expect(strumBeats("4/4", "negra")).toEqual([0, 1, 2, 3]);
    expect(strumBeats("3/4", "blanca-punto")).toEqual([0]);
    expect(strumBeats("3/4", "negra")).toEqual([0, 1, 2]);
  });

  it("cada figura llena exactamente su compás", () => {
    for (const [meter, n] of Object.entries(METERS)) {
      for (const f of figuresFor(meter)) expect(strumBeats(meter, f).length * FIGURES[f].beats).toBe(n);
    }
  });

  it("la regla del laboratorio: 1 acorde → redonda, 2 → blancas, más → negras", () => {
    expect(strumRule("4/4", 1)).toBe("redonda");
    expect(strumRule("4/4", 2)).toBe("blanca");
    expect(strumRule("4/4", 3)).toBe("negra");
    expect(strumRule("4/4", 4)).toBe("negra");
    expect(strumRule("3/4", 1)).toBe("blanca-punto");
    expect(strumRule("3/4", 3)).toBe("negra");
  });

  it("el compás de la regla tiene tantos acordes como dice", () => {
    repeat(300, 1, (rng) => {
      const q = ruleQuestion(rng);
      expect(q.bar.split("-")).toHaveLength(q.chords);
      expect(q.choices[q.correct]).toBe(q.answer);
    });
  });

  it("las preguntas tienen su respuesta entre las alternativas, sin repetir", () => {
    repeat(600, 2, (rng) => {
      const q = makeQuestion(rng);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      expect(q.choices[q.correct]).toBe(q.answer);
    });
    repeat(100, 3, (rng) => expect(Number(countQuestion(rng).answer)).toBeGreaterThan(0));
    repeat(100, 4, (rng) => {
      const q = listenQuestion(rng);
      expect(figuresFor(q.meter)).toContain(q.figure);
    });
  });
});
