import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { seventhAt, triadAt, kindOf } from "../src/theory.js";
import { makeQuestion } from "../src/theory.js";

describe("La tonalidad", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["degree", "grade", "outsider", "relative", "seventh", "kind"] });
  });
  it("los acordes de G mayor y sus grados", () => {
    expect([1, 2, 3, 4, 5, 6].map((d) => triadAt("G", d))).toEqual(["G", "Am", "Bm", "C", "D", "Em"]);
    expect(seventhAt("G", 5)).toBe("D7");
    expect(seventhAt("C", 1)).toBe("Cmaj7");
    expect(kindOf(7)).toBe("disminuido");
    expect(triadAt("A", 6)).toBe("F#m");
  });
});
