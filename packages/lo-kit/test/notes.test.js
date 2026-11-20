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

import { pretty, prettyText, splitName } from "../src/notes.js";

describe("tipografía de notas", () => {
  it("escribe las alteraciones con sus signos", () => {
    expect(pretty("C#")).toBe("C♯");
    expect(pretty("Bbm")).toBe("B♭m");
    expect(pretty("G")).toBe("G");
    expect(splitName("C#7")).toEqual({ letter: "C", acc: "#", rest: "7" });
  });

  it("encuentra notas en un texto sin tocar palabras", () => {
    expect(prettyText("E# suena como F; Bb y F#m también. Abajo, Cada, Do#")).toBe("E♯ suena como F; B♭ y F♯m también. Abajo, Cada, Do#");
    expect(prettyText("De A a C# hay 4 semitonos: A → A# → B → C → C#.")).toBe("De A a C♯ hay 4 semitonos: A → A♯ → B → C → C♯.");
  });

  it("reconoce cifrados y notas en listas, pero no la preposición «A»", async () => {
    const { notesIn } = await import("../src/notes.js");
    const notes = (t) => [...notesIn(t)].map((n) => n.name);
    expect(notes("B7 lleva B – D# – F# – A.")).toEqual(["B7", "B", "D#", "F#", "A"]);
    expect(notes("A veces suena Am (A – C – E).")).toEqual(["Am", "A", "C", "E"]);
    expect(notes("A en la 6ª cuerda")).toEqual([]);
  });
});
