import { describe, expect, it } from "vitest";
import {
  isCorrect,
  makeQuestion,
  midiAt,
  noteName,
  spokenName,
  octaveRelation,
  positionsOf,
} from "../src/theory.js";

describe("mástil", () => {
  it("A en la 6ª cuerda, traste 5, es la misma nota que la 4ª cuerda, traste 7", () => {
    expect(noteName(midiAt(6, 5))).toBe("A");
    expect(positionsOf(midiAt(6, 5), 4)).toEqual([7]);
    expect(octaveRelation(midiAt(6, 5), midiAt(4, 7))).toBe("la misma nota, una octava más aguda");
  });

  it("la regla del traste 5: 6ª/5 suena igual que la 5ª al aire", () => {
    expect(midiAt(6, 5)).toBe(midiAt(5, 0));
    expect(octaveRelation(midiAt(6, 5), midiAt(5, 0))).toBe("el mismo sonido exacto (unísono)");
  });

  it("la excepción del traste 4: 3ª/4 suena igual que la 2ª al aire", () => {
    expect(midiAt(3, 4)).toBe(midiAt(2, 0));
  });

  it("entre 0 y 12 una nota puede aparecer dos veces en la misma cuerda", () => {
    expect(positionsOf(midiAt(1, 0), 6)).toEqual([0, 12]);
  });

  it("nombra en clave americana y da la forma latina solo para decirla", () => {
    expect(noteName(61)).toBe("C#");
    expect(noteName(57)).toBe("A");
    expect(spokenName(61)).toBe("Do#");
    expect(spokenName(71)).toBe("Si");
  });

  it("acepta cualquier octava de la nota en la cuerda pedida", () => {
    const q = { source: 1, fret: 0, midi: midiAt(1, 0), target: 6 };
    expect(isCorrect(q, 0)).toBe(true);
    expect(isCorrect(q, 12)).toBe(true);
    expect(isCorrect(q, 5)).toBe(false);
  });
});

describe("preguntas", () => {
  // Generador determinista (LCG) para que las pruebas no dependan del azar.
  const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);

  it("siempre tienen respuesta y la cuerda pedida es otra", () => {
    const rng = seeded(42);
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion(rng);
      expect(q.target).not.toBe(q.source);
      expect(q.answers.length).toBeGreaterThan(0);
      for (const f of q.answers) expect(isCorrect(q, f)).toBe(true);
    }
  });

  it("con solo naturales, nunca muestran una nota alterada", () => {
    const rng = seeded(7);
    for (let i = 0; i < 500; i++) {
      expect(noteName(makeQuestion(rng).midi)).not.toContain("#");
    }
  });

  it("con alteraciones, a veces muestran una nota alterada", () => {
    const rng = seeded(7);
    const names = Array.from({ length: 200 }, () =>
      noteName(makeQuestion(rng, { naturalsOnly: false }).midi),
    );
    expect(names.some((n) => n.includes("#"))).toBe(true);
  });
});
