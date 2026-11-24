// OA «Séptimas»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { keyboardVisual, midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: keyboardVisual("C", "7"),
  caption: "C7 es C mayor (C E G) más una nota: la 7ª menor, Bb. Con ella el acorde suena inquieto y pide ir a otro.",
  play: { label: "▶ Oír C7", chords: [midisOf("C", "7")] },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-sevenths" });
