import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { notesOf } from "@saul-music/chord-core/theory";
import { makeQuestion } from "../src/theory.js";

describe("Tensiones", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["build", "identify", "degree", "alter"] });
  });
  it("las alteradas suben o bajan medio tono la tensión", () => {
    expect(notesOf("C", "7(b9)")).toEqual(["C", "E", "G", "Bb", "Db"]);
    expect(notesOf("C", "7(#9)")).toEqual(["C", "E", "G", "Bb", "D#"]);
    expect(notesOf("C", "7(b13)")).toEqual(["C", "E", "G", "Bb", "Ab"]);
    expect(notesOf("C", "maj7#11")).toEqual(["C", "E", "G", "B", "F#"]);
  });
});
