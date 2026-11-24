// OA «La tonalidad»: el juego usa la pieza compartida de la ruta Intermedio (chord-core).
import { mountTheoryGame } from "@saul-music/chord-core";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

const demo = {
  visual: { kind: "text", lines: ["C mayor: C · Dm · Em · F · G · Am · Bdim", "1 mayor · 2 menor · 3 menor · 4 mayor · 5 mayor · 6 menor · 7 disminuido"] },
  caption: "Un acorde sobre cada nota de la escala da los siete acordes de la tonalidad. El orden de los tipos es el mismo en todas.",
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-tonality" });
