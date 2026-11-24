// OA «maj7 y acordes de 6»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { keyboardVisual, midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: keyboardVisual("C", "maj7"),
  caption: "Cmaj7 suma B, la 7ª mayor, a C mayor. C7 suma Bb: solo cambia una nota, por medio tono.",
  play: { label: "▶ Oír C, Cmaj7 y C7", chords: [midisOf("C", ""), midisOf("C", "maj7"), midisOf("C", "7")], gap: 1.5 },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-maj7-sixths" });
