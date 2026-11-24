// OA «Tensiones»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: { kind: "text", lines: ["9 = la 2ª · 11 = la 4ª · 13 = la 6ª", "b9 y b13 bajan medio tono; #9 y #11 suben medio tono"] },
  caption: "Las tensiones son las notas por encima de la 7ª. Alteradas, suman más tensión antes de resolver.",
  play: { label: "▶ Oír C7 y C7(b9)", chords: [midisOf("C", "7"), midisOf("C", "7(b9)")], gap: 1.5 },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-tensions" });
