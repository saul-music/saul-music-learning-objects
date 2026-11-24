import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { shapeOf, rootOf, nameOf } from "../src/theory.js";
import { makeQuestion } from "../src/theory.js";

describe("Cejilla en movimiento", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["name", "fret", "change"] });
  });
  it("la forma de E con cejilla en el traste 1 es F y la de A en el 2 es B", () => {
    expect(nameOf("E", "major", 1)).toBe("F");
    expect(nameOf("E", "minor", 2)).toBe("F#m");
    expect(nameOf("A", "major", 2)).toBe("B");
    expect(nameOf("A", "minor", 1)).toBe("Bbm");
    expect(rootOf("E", 3)).toBe("G");
    expect(shapeOf("E", "major", 1).f).toEqual([1, 3, 3, 2, 1, 1]);
    expect(shapeOf("A", "minor", 2).f).toEqual([-1, 2, 4, 4, 3, 2]);
  });
});
