// OA «Acordes de paso»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { keyboardVisual, midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: keyboardVisual("B", "dim7"),
  caption: "Bdim7 apila terceras menores: B D F Ab. Es un acorde tenso, de paso, que pide ir a otro.",
  play: { label: "▶ Oír Bdim7", chords: [midisOf("B", "dim7")] },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-passing-chords" });
