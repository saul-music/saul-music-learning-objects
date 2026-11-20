import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { makeQuestion, spellingQuestion, strategyQuestion, triadMisspellings, triadQuestion, whichKeyQuestion } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const repeat = (n, seed, fn) => { const rng = seeded(seed); for (let i = 0; i < n; i++) fn(rng); };

describe("Nombra bien la nota", () => {
  it("toda pregunta trae 4 alternativas distintas y la correcta está en su lugar", () => {
    repeat(1500, 1, (rng) => {
      const q = makeQuestion(rng);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices[q.correct]).toBe(q.answer);
    });
  });

  it("en la escala, la respuesta es la letra que toca y su gemela enarmónica convive como distractor", () => {
    let withTwin = 0;
    repeat(600, 2, (rng) => {
      const q = spellingQuestion(rng);
      expect(q.answer).toBe(q.notes[q.degree - 1]);
      // cada letra una sola vez
      expect(new Set(q.notes.map((n) => n[0])).size).toBe(7);
      if (q.choices.some((c) => c !== q.answer && Note.chroma(c) === Note.chroma(q.answer))) withTwin++;
    });
    expect(withTwin).toBeGreaterThan(300);
  });

  it("F mayor tiene Bb (no A#) y F# mayor tiene E# (no F)", () => {
    const seen = new Set();
    repeat(800, 3, (rng) => {
      const q = spellingQuestion(rng);
      if (q.key === "F" && q.degree === 4) { expect(q.answer).toBe("Bb"); seen.add("Bb"); }
      if (q.key === "F#" && q.degree === 7) { expect(q.answer).toBe("E#"); seen.add("E#"); }
    });
    expect(seen).toEqual(new Set(["Bb", "E#"]));
  });

  it("estrategia: entre E y F, y entre B y C, nunca se responde con una nota rara", () => {
    repeat(800, 4, (rng) => {
      const q = strategyQuestion(rng);
      expect(["E#", "B#", "Fb", "Cb"]).not.toContain(q.answer);
      if (q.up && (q.from === "E" || q.from === "B")) expect(q.answer).toBe(q.from === "E" ? "F" : "C");
      if (!q.up && (q.from === "F" || q.from === "C")) expect(q.answer).toBe(q.from === "F" ? "E" : "B");
      // la respuesta suena un semitono arriba o abajo de la nota de partida
      const d = (Note.chroma(q.answer) - Note.chroma(q.from) + 12) % 12;
      expect(d).toBe(q.up ? 1 : 11);
    });
  });

  it("la nota rara aparece en la tonalidad correcta", () => {
    const homes = {};
    repeat(400, 5, (rng) => {
      const q = whichKeyQuestion(rng);
      expect(q.notes[q.degree - 1]).toBe(q.rareNote);
      homes[q.rareNote] = q.answer;
    });
    expect(homes).toEqual({ "E#": "F#", Cb: "Gb", "B#": "C#", Fb: "Cb" });
  });

  it("acordes: la respuesta usa letras alternadas y los errores suenan igual", () => {
    repeat(600, 6, (rng) => {
      const q = triadQuestion(rng);
      const letters = q.triad.map((n) => n[0]);
      expect(new Set(letters).size).toBe(3);
      for (const c of q.choices) {
        expect(c.split(" ").map((n) => Note.chroma(n))).toEqual(q.triad.map((n) => Note.chroma(n)));
      }
    });
  });

  it("variantes mal escritas sin dobles alteraciones", () => {
    expect(triadMisspellings(["Bb", "D", "F"])).toContain("A# D F");
    for (const v of triadMisspellings(["A", "C#", "E"])) expect(v).not.toMatch(/##|bb/);
  });
});
