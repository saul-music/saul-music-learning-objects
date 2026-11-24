import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { FAMILIES } from "../src/theory.js";
import { makeQuestion } from "../src/theory.js";

describe("Estudia un tema Original", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["family", "scenario"] });
  });
  it("hay una familia por cada lección del path", () => {
    expect(Object.keys(FAMILIES)).toHaveLength(8);
  });
});
