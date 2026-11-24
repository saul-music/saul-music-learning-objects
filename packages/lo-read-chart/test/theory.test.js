import { describe, expect, it } from "vitest";
import { chordBeats, makeQuestion, parseBar, restBeats } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

describe("Lee la partitura", () => {
  it("un compás partido reparte los tiempos y % y _ alargan el acorde anterior", () => {
    expect(chordBeats(parseBar("C-G"), 0)).toBe(2);
    expect(chordBeats(parseBar("C-G-Am-F"), 2)).toBe(1);
    expect(chordBeats(parseBar("C-%-G-Am"), 0)).toBe(2);
    expect(chordBeats(parseBar("C-G-%-%"), 1)).toBe(3);
    expect(chordBeats(parseBar("C-_-G-Am"), 0)).toBe(2);
    expect(chordBeats(parseBar("C-G-Am", 3), 2)).toBe(1);
  });
  it("los silencios cuentan aparte", () => {
    expect(restBeats(parseBar("G-."))).toBe(2);
    expect(restBeats(parseBar("G-.-.-."))).toBe(3);
    expect(restBeats(parseBar("G-Am-.-."))).toBe(2);
  });
  it("las preguntas son coherentes: respuesta única entre las alternativas", () => {
    const rng = seeded(5);
    const seen = new Set();
    for (let i = 0; i < 1500; i++) {
      const q = makeQuestion(rng);
      seen.add(q.type);
      expect(q.choices[q.correct]).toBe(q.answer);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      if (q.type === "which") expect(q.bars[q.ask]).toBe("%");
    }
    expect([...seen].sort()).toEqual(["beats", "meaning", "sound", "total", "which"]);
  });
  it("«which»: la respuesta es el acorde del compás anterior", () => {
    const rng = seeded(9);
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion(rng);
      if (q.type !== "which") continue;
      let k = q.ask;
      while (q.bars[k] === "%") k -= 1;
      expect(q.bars[k]).toBe(q.answer);
    }
  });
});
