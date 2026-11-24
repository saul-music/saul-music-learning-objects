import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { notesOf } from "@saul-music/chord-core/theory";
import { makeQuestion } from "../src/theory.js";

describe("Acordes de paso", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["build", "identify", "difference", "distance", "twin", "ear"] });
  });
  it("dim7 apila terceras menores, m7b5 baja la 5ª y aug la sube", () => {
    expect(notesOf("B", "dim7")).toEqual(["B", "D", "F", "Ab"]);
    expect(notesOf("B", "m7b5")).toEqual(["B", "D", "F", "A"]);
    expect(notesOf("C", "aug")).toEqual(["C", "E", "G#"]);
    expect(notesOf("A", "mmaj7")).toEqual(["A", "C", "E", "G#"]);
  });
});
