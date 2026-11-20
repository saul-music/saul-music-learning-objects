import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { arpeggio, MAJOR_ROOTS, makeQuestion, MINOR_ROOTS, missingQuestion, stepQuestion } from "../src/theory.js";

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const repeat = (n, seed, fn) => { const rng = seeded(seed); for (let i = 0; i < n; i++) fn(rng); };
const semis = (a, b) => (Note.chroma(b) - Note.chroma(a) + 12) % 12;

describe("Escalera del acorde", () => {
  it("C mayor es C E G C y A menor es A C E A", () => {
    expect(arpeggio("C", "major")).toEqual(["C", "E", "G", "C"]);
    expect(arpeggio("A", "minor")).toEqual(["A", "C", "E", "A"]);
    expect(arpeggio("D", "major")).toEqual(["D", "F#", "A", "D"]);
  });

  it("todas las raíces dan 3ª de 4 (mayor) o 3 (menor) semitonos, 5ª de 7, y sin dobles alteraciones", () => {
    for (const r of MAJOR_ROOTS) {
      const [a, t, f] = arpeggio(r, "major");
      expect([semis(a, t), semis(a, f)]).toEqual([4, 7]);
      expect(t + f).not.toMatch(/##|bb/);
    }
    for (const r of MINOR_ROOTS) {
      const [a, t, f] = arpeggio(r, "minor");
      expect([semis(a, t), semis(a, f)]).toEqual([3, 7]);
      expect(t + f).not.toMatch(/##|bb/);
    }
  });

  it("las alternativas tienen la respuesta y ninguna suena igual que ella", () => {
    repeat(800, 1, (rng) => {
      const q = makeQuestion(rng);
      expect(q.choices[q.correct]).toBe(q.answer);
      if (q.type !== "whichStep") {
        const same = q.choices.filter((c) => Note.chroma(c) === Note.chroma(q.answer));
        expect(same).toHaveLength(1);
      }
    });
  });

  it("si falta la 3ª, la 3ª de la otra calidad es un distractor posible", () => {
    let seen = false;
    repeat(400, 2, (rng) => {
      const q = missingQuestion(rng);
      if (q.step === 3) {
        const other = arpeggio(q.root, q.quality === "major" ? "minor" : "major")[1];
        if (q.choices.includes(other)) seen = true;
      }
    });
    expect(seen).toBe(true);
  });

  it("la 8ª tiene el mismo nombre que la 1ª", () => {
    repeat(400, 3, (rng) => {
      const q = stepQuestion(rng);
      if (q.step === 8) expect(q.answer).toBe(q.root);
    });
  });
});
