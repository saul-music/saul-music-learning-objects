import { describe, expect, it, vi } from "vitest";
import { centerOnPhone } from "../src/quiz.js";

const win = (phone, calm = false) => ({
  matchMedia: (q) => ({ matches: q.includes("max-width") ? phone : calm }),
});

describe("centerOnPhone", () => {
  it("en teléfono centra la pregunta con animación suave", () => {
    const node = { scrollIntoView: vi.fn() };
    expect(centerOnPhone(node, win(true))).toBe(true);
    expect(node.scrollIntoView).toHaveBeenCalledWith({ block: "center", behavior: "smooth" });
  });
  it("sin animación si se pidió menos movimiento", () => {
    const node = { scrollIntoView: vi.fn() };
    centerOnPhone(node, win(true, true));
    expect(node.scrollIntoView).toHaveBeenCalledWith({ block: "center", behavior: "auto" });
  });
  it("en escritorio no hace nada", () => {
    const node = { scrollIntoView: vi.fn() };
    expect(centerOnPhone(node, win(false))).toBe(false);
    expect(node.scrollIntoView).not.toHaveBeenCalled();
  });
  it("sin window (pruebas en node) no falla", () => {
    expect(centerOnPhone({ scrollIntoView: vi.fn() }, undefined)).toBe(false);
  });
});
