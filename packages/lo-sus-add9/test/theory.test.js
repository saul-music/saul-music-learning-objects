import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { notesOf } from "@saul-music/chord-core/theory";
import { makeQuestion } from "../src/theory.js";

describe("sus y add9", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["build", "identify", "difference", "replaced", "resolve", "compare", "ear"] });
  });
  it("sus cambia la 3ª y add9 la conserva", () => {
    expect(notesOf("D", "sus2")).toEqual(["D", "E", "A"]);
    expect(notesOf("D", "sus4")).toEqual(["D", "G", "A"]);
    expect(notesOf("D", "add9")).toEqual(["D", "F#", "A", "E"]);
    expect(notesOf("G", "7sus4")).toEqual(["G", "C", "D", "F"]);
  });
});
