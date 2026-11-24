import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { notesOf } from "@saul-music/chord-core/theory";
import { makeQuestion } from "../src/theory.js";

describe("Novenas y 6/9", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["build", "identify", "difference", "ninth", "seventh", "ear"] });
  });
  it("las novenas suman la 9ª; el 6/9 no lleva 7ª", () => {
    expect(notesOf("C", "9")).toEqual(["C", "E", "G", "Bb", "D"]);
    expect(notesOf("C", "m9")).toEqual(["C", "Eb", "G", "Bb", "D"]);
    expect(notesOf("C", "maj9")).toEqual(["C", "E", "G", "B", "D"]);
    expect(notesOf("C", "6/9")).toEqual(["C", "E", "G", "A", "D"]);
  });
});
