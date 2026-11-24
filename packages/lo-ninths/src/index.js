// OA «Novenas y 6/9»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: { kind: "text", lines: ["C9 = C E G Bb D", "Cm9 = C Eb G Bb D", "Cmaj9 = C E G B D", "C6/9 = C E G A D"] },
  caption: "La 9ª (D, la 2ª una octava arriba) se suma a la séptima. El 6/9 es un acorde de 6 con 9ª y sin 7ª.",
  play: { label: "▶ Oír C9", chords: [midisOf("C", "9")] },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-ninths" });
