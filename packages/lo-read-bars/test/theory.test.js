import { describe, expect, it } from "vitest";
import { barBeats, chordBeats, chordMidis, COLUMNS, hits, makeBar, makeQuestion, restBeats } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

describe("Lee los compases", () => {
  it("un compás siempre suma su clave de tiempo", () => {
    expect(barBeats(makeBar(["C"]))).toBe(4);
    expect(barBeats(makeBar(["C", "G", "Am"], { meter: 3 }))).toBe(3);
    const rng = seeded(3);
    for (let i = 0; i < 400; i++) {
      const q = makeQuestion(rng);
      for (const b of [q.bar, ...(q.bars ?? [])].filter(Boolean)) {
        if (q.type === "order" || q.type === "next" || q.type === "section") continue;
        if (q.type === "symbol") continue;
        expect([b.meter, barBeats(b)]).toEqual([b.meter, b.meter]);
      }
    }
  });
  it("duración del acorde: reparto, partes anchas y ligados", () => {
    expect(chordBeats(makeBar([["C", 4]]), 0)).toBe(4);
    expect(chordBeats(makeBar([["C", 2], ["G", 2]]), 1)).toBe(2);
    expect(chordBeats(makeBar([["C", 1], ["_", 1], ["G", 2]]), 0)).toBe(2);
    expect(restBeats(makeBar([["C", 2], [".", 2]]))).toBe(2);
  });
  it("oír el compás: cada golpe de acorde cae donde empieza su casilla", () => {
    const bar = makeBar([["C", 3], ["G", 1]]);
    expect(hits(bar)).toEqual([{ at: 0, chord: "C", beats: 3 }, { at: 3, chord: "G", beats: 1 }]);
    expect(hits(makeBar([["C", 2], ["_", 1], ["G", 1]]))).toEqual([{ at: 0, chord: "C", beats: 3 }, { at: 3, chord: "G", beats: 1 }]);
    expect(chordMidis("Am")).toHaveLength(4);
    expect(chordMidis("Am")[1] - chordMidis("Am")[0]).toBe(3);
    expect(chordMidis("C")[1] - chordMidis("C")[0]).toBe(4);
  });
  it("las preguntas son coherentes y sus alternativas no se repiten", () => {
    const rng = seeded(11);
    const seen = new Set();
    for (let i = 0; i < 1500; i++) {
      const q = makeQuestion(rng);
      seen.add(q.type);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      expect(q.choices[q.correct]).toBe(q.answer);
      expect(q.explain.length).toBeGreaterThan(10);
      if (q.type === "split") expect(q.choices[q.correct]).toBe(String(chordBeats(q.bar, q.part)));
      if (q.type === "order") {
        expect(q.marked).toBeGreaterThanOrEqual(COLUMNS);
        expect(q.answer).toBe(String(q.marked + 1));
      }
      if (q.type === "next") expect(q.answer).toBe(q.bars[COLUMNS].slots[0].chord);
      if (q.type === "section") expect(Number(q.answer)).toBe(q.bars.length * q.times);
      if (q.type === "meter") expect(q.answer).toBe(String(q.bar.meter));
      if (q.type === "ear") expect(q.bars).toHaveLength(3);
    }
    expect([...seen].sort()).toEqual(["ear", "meter", "next", "order", "section", "split", "symbol"]);
  });
  it("sin texto de partitura: nada de %, _ ni guiones en lo que ve el usuario", () => {
    const rng = seeded(5);
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion(rng);
      expect(q.explain).not.toMatch(/ % |\bx2\b/);
    }
  });
});
