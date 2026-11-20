import { describe, expect, it } from "vitest";
import { comboMultiplier, createRun, loadBest, pointsFor, saveResult, speedBonus, starsFor } from "../src/score.js";

const memoryStorage = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
};

describe("puntuación", () => {
  it("el combo sube con la racha", () => {
    expect([1, 2, 3, 4, 5, 7, 8, 12].map(comboMultiplier)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("el bono por rapidez baja parejo hasta 0 y nunca es negativo", () => {
    expect(speedBonus(0)).toBe(100);
    expect(speedBonus(6000)).toBe(50);
    expect(speedBonus(12000)).toBe(0);
    expect(speedBonus(60000)).toBe(0);
  });

  it("un error no da puntos; un acierto lento da al menos la base", () => {
    expect(pointsFor({ ok: false, ms: 100, streak: 0 })).toBe(0);
    expect(pointsFor({ ok: true, ms: 60000, streak: 1 })).toBe(100);
    expect(pointsFor({ ok: true, ms: 0, streak: 3 })).toBe(400);
  });

  it("las estrellas dependen solo de los aciertos", () => {
    expect([10, 9, 8, 7, 6, 4, 3, 0].map((c) => starsFor(c, 10))).toEqual([3, 3, 2, 2, 1, 1, 0, 0]);
  });

  it("la partida acumula aciertos, puntos y la racha máxima", () => {
    let t = 0;
    const run = createRun(10, () => t);
    for (const ok of [true, true, true, false, true]) {
      run.startQuestion();
      t += 1000;
      run.record(ok, ok ? null : "fallo");
    }
    expect(run.score).toBe(4);
    expect(run.maxStreak).toBe(3);
    expect(run.misses).toEqual(["fallo"]);
    // 192 + 192 + 384 (combo ×2) + 0 + 192
    expect(run.points).toBe(192 + 192 + 384 + 192);
  });

  it("guarda el récord y avisa cuando se supera", () => {
    const s = memoryStorage();
    expect(loadBest("x", s)).toEqual({ points: 0, stars: 0, plays: 0 });
    expect(saveResult("x", { points: 500, stars: 1 }, s)).toMatchObject({ first: true, newRecord: false });
    expect(saveResult("x", { points: 300, stars: 2 }, s)).toMatchObject({ newRecord: false, best: { points: 500, stars: 2, plays: 2 } });
    expect(saveResult("x", { points: 900, stars: 1 }, s)).toMatchObject({ newRecord: true, best: { points: 900, stars: 2, plays: 3 } });
  });
});
