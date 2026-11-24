// OA «sus y add9»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: { kind: "text", lines: ["D = D F# A", "Dsus2 = D E A · Dsus4 = D G A", "Dadd9 = D F# A E"] },
  caption: "sus cambia la 3ª por la 2ª o la 4ª; add9 conserva la 3ª y suma la 9ª, sin 7ª.",
  play: { label: "▶ Oír D, Dsus4, Dsus2 y Dadd9", chords: [midisOf("D", ""), midisOf("D", "sus4"), midisOf("D", "sus2"), midisOf("D", "add9")], gap: 1.3 },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-sus-add9" });
