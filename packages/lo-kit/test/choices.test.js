import { describe, expect, it } from "vitest";
import { buildChoices, shuffle } from "../src/choices.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

describe("alternativas", () => {
  it("incluyen la respuesta una vez y sin repetidos", () => {
    const rng = seeded(3);
    for (let i = 0; i < 200; i++) {
      const { choices, correct } = buildChoices("F", ["E", "F", "F#", "E", "G", "D"], rng);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices[correct]).toBe("F");
    }
  });

  it("barajar no pierde elementos", () => {
    expect(shuffle([1, 2, 3, 4], seeded(1)).sort()).toEqual([1, 2, 3, 4]);
  });
});
