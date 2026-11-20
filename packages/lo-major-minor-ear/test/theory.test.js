import { describe, expect, it } from "vitest";
import { makeQuestion, triad, voicing } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

describe("Luz y sombra", () => {
  it("A menor es A C E y A mayor es A C# E", () => {
    expect(triad("A", "minor")).toEqual(["A", "C", "E"]);
    expect(triad("A", "major")).toEqual(["A", "C#", "E"]);
  });

  it("la 3ª del voicing está a 4 semitonos (mayor) o 3 (menor) y todo cabe en las muestras", () => {
    for (const q of ["major", "minor"]) {
      const [r, t, f, o] = voicing("C", q);
      expect(t - r).toBe(q === "major" ? 4 : 3);
      expect([f - r, o - r]).toEqual([7, 12]);
    }
    const rng = seeded(1);
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion(rng);
      expect(Math.min(...q.midis)).toBeGreaterThanOrEqual(40); // E2, la muestra más grave
      expect(Math.max(...q.midis)).toBeLessThanOrEqual(88); // E6, la más aguda
    }
  });

  it("salen mayores y menores, con la respuesta correcta", () => {
    const rng = seeded(2);
    const seen = { major: 0, minor: 0 };
    for (let i = 0; i < 400; i++) {
      const q = makeQuestion(rng);
      seen[q.quality] += 1;
      expect(q.choices[q.correct]).toBe(q.quality === "major" ? "Mayor" : "Menor");
    }
    expect(seen.major).toBeGreaterThan(120);
    expect(seen.minor).toBeGreaterThan(120);
  });
});
