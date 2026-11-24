import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { notesOf } from "@saul-music/chord-core/theory";
import { makeQuestion } from "../src/theory.js";

describe("maj7 y acordes de 6", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["build", "identify", "difference", "twin", "distance", "ear"] });
  });
  it("maj7 suma la 7ª mayor y C6 tiene las notas de Am7", () => {
    expect(notesOf("C", "maj7")).toEqual(["C", "E", "G", "B"]);
    expect(notesOf("C", "6").slice().sort()).toEqual(notesOf("A", "m7").slice().sort());
    expect(notesOf("A", "m6")).toEqual(["A", "C", "E", "F#"]);
  });
});
