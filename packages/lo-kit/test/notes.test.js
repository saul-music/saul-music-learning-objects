import { describe, expect, it } from "vitest";
import { spoken } from "../src/notes.js";

describe("spoken", () => {
  it("dice la nota en español", () => {
    expect(spoken("C")).toBe("Do");
    expect(spoken("F#")).toBe("Fa sostenido");
    expect(spoken("Bb")).toBe("Si bemol");
    expect(spoken("E#")).toBe("Mi sostenido");
    expect(spoken("Fx".replace("x", "##"))).toBe("Fa doble sostenido");
    expect(spoken("G4")).toBe("Sol");
  });
});
