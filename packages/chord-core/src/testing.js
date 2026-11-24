// Comprobaciones comunes de las pruebas de los juegos de Intermedio.
import { expect } from "vitest";

export const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

/** Las preguntas son coherentes: alternativas únicas, la correcta es la respuesta, hay explicación y todo es texto. */
export function checkQuestions(makeQuestion, { n = 900, seed = 7, types } = {}) {
  const rng = seeded(seed);
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const q = makeQuestion(rng);
    seen.add(q.type);
    expect(q.choices.length, JSON.stringify(q)).toBeGreaterThanOrEqual(2);
    expect(new Set(q.choices).size, q.type).toBe(q.choices.length);
    expect(q.choices[q.correct], q.type).toBe(q.answer);
    expect(q.explain?.length, q.type).toBeGreaterThan(10);
    expect(q.ask?.length, q.type).toBeGreaterThan(5);
    for (const c of q.choices) expect(typeof c).toBe("string");
    for (const m of [...(q.play?.chords?.flat() ?? []), ...(q.play?.notes ?? [])]) expect(Number.isInteger(m) && m >= 24 && m <= 96, `midi ${m}`).toBe(true);
  }
  if (types) expect([...seen].sort()).toEqual([...types].sort());
}
