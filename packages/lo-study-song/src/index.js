// OA «Estudia un tema Original»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: { kind: "text", lines: ["1) Simplificada · 2) lista de acordes nuevos", "3) tempo bajo, loop y «Desde aquí» · 4) sube el tempo"] },
  caption: "Un tema se estudia por etapas: estructura primero, acordes nuevos después, y el tempo al final.",
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-study-song" });
