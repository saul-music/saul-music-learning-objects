// OA «Acordes con bajo»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { midisOf, mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: { kind: "text", lines: ["G/B se lee «G sobre B»", "Notas: G – B – D · bajo: B"] },
  caption: "El acorde es G (G B D) y la nota más grave es B, su 3ª. Las notas de arriba no cambian.",
  play: { label: "▶ Oír G y G/B", chords: [midisOf("G", ""), midisOf("G", "", { bass: "B" })], gap: 1.5 },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-slash-chords" });
