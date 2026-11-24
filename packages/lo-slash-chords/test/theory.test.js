import { describe, expect, it } from "vitest";
import { checkQuestions, seeded } from "@saul-music/chord-core/testing";
import { makeQuestion as mq } from "../src/theory.js";
import { makeQuestion } from "../src/theory.js";

describe("Acordes con bajo", () => {
  it("las preguntas son coherentes y salen todos los tipos", () => {
    checkQuestions(makeQuestion, { types: ["bass", "degree", "identify", "line"] });
  });
  it("las preguntas de bajo dicen siempre una nota del acorde", () => {
    for (let i = 0; i < 200; i++) {
      const q = mq(seeded(i + 1));
      if (q.type === "bass") expect(q.explain).toContain(q.answer);
      if (q.type === "line") expect(q.answer).toMatch(/^[A-G][b#]?m\/[A-G][b#]?$/);
    }
  });
});
