import { describe, expect, it } from "vitest";
import { lessonMinutes, nextLesson, pathSummary, recommendedLesson, resultOf, withResult } from "../src/progress.js";

const path = { id: "basico", lessons: [{ id: "a", readMinutes: 2 }, { id: "b", readMinutes: 3 }, { id: "c", readMinutes: 1 }] };
const r = (points, stars, plays = 1) => ({ points, stars, plays });

describe("avance", () => {
  it("sin avance no hay resultados ni resumen", () => {
    expect(resultOf({}, "basico", "a")).toBeNull();
    expect(resultOf(undefined, "basico", "a")).toBeNull();
    expect(pathSummary({}, path)).toEqual({ played: 0, total: 3, stars: 0, maxStars: 9, points: 0, complete: false });
  });

  it("el resumen suma estrellas y puntos de lo jugado", () => {
    const progress = { basico: { a: r(80, 2), b: r(100, 3) } };
    expect(pathSummary(progress, path)).toMatchObject({ played: 2, stars: 5, points: 180, complete: false });
    expect(pathSummary({ basico: { a: r(1, 0), b: r(1, 0), c: r(1, 0) } }, path).complete).toBe(true);
  });

  it("una lección con 0 estrellas cuenta como jugada", () => {
    expect(pathSummary({ basico: { a: r(10, 0) } }, path).played).toBe(1);
  });

  it("recomienda la primera lección sin jugar, aunque haya huecos", () => {
    expect(recommendedLesson({}, path).id).toBe("a");
    expect(recommendedLesson({ basico: { a: r(50, 1) } }, path).id).toBe("b");
    expect(recommendedLesson({ basico: { b: r(50, 1) } }, path).id).toBe("a");
    expect(recommendedLesson({ basico: { a: r(1, 0), b: r(1, 0), c: r(1, 0) } }, path)).toBeNull();
  });

  it("la siguiente lección sigue el orden de la ruta", () => {
    expect(nextLesson(path, "a").id).toBe("b");
    expect(nextLesson(path, "c")).toBeNull();
    expect(nextLesson(path, "no-existe")).toBeNull();
  });

  it("guardar un resultado no modifica el avance anterior", () => {
    const before = { basico: { a: r(80, 2) } };
    const after = withResult(before, "basico", "b", r(60, 1));
    expect(before).toEqual({ basico: { a: r(80, 2) } });
    expect(after.basico).toEqual({ a: r(80, 2), b: r(60, 1) });
    expect(withResult({}, "otra", "x", r(1, 0))).toEqual({ otra: { x: r(1, 0) } });
  });

  it("los minutos suman la lectura y el juego", () => {
    expect(lessonMinutes(path.lessons[0], "PT4M")).toBe(6);
    expect(lessonMinutes(path.lessons[0], undefined)).toBe(2);
    expect(lessonMinutes(path.lessons[0], "algo raro")).toBe(2);
  });
});
