import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { notesOf } from "@saul-music/chord-core/theory";
import { makeQuestion } from "../src/theory.js";

describe("Séptimas", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["build", "identify", "difference", "seventh", "resolve", "ear", "interval"] });
  });
  it("las séptimas: A7 = A C# E G y Am7 = A C E G", () => {
    expect(notesOf("A", "7")).toEqual(["A", "C#", "E", "G"]);
    expect(notesOf("A", "m7")).toEqual(["A", "C", "E", "G"]);
    expect(notesOf("C", "7")).toEqual(["C", "E", "G", "Bb"]);
  });
});
