// OA «Cejilla en movimiento»: el juego usa la pieza compartida de la ruta Intermedio (chord-core), con diagramas de guitarra.
import { mountTheoryGame } from "@saul-music/chord-core";
import { shapeMidis } from "@saul-music/lo-chord-shapes";
import { FORMS, makeQuestion as makeRaw, nameOf, shapeOf } from "./theory.js";

export * from "./theory.js";

/** Pasa la pregunta de datos al formato del juego: diagrama (antes y después de responder) y sonido. */
export function makeQuestion(rng) {
  const q = makeRaw(rng);
  if (!q.shape) return q;
  const item = (shape, name = "") => ({ kind: "shapes", items: [{ name, shape }] });
  return {
    ...q,
    visual: item(q.shape, q.type === "change" ? nameOf(q.form, "major", q.fret) : ""),
    visualAnswered: q.type === "name" ? item(q.shape, q.answer) : { kind: "shapes", items: [{ name: nameOf(q.form, "major", q.fret), shape: q.shape }, { name: nameOf(q.form, "minor", q.fret), shape: q.shapeAnswered }] },
    play: { label: "▶ Oír el acorde", chords: [shapeMidis(q.shapeAnswered ?? q.shape)] }, playOnAnswer: true,
  };
}

const demo = {
  visual: { kind: "shapes", items: [{ name: "E", shape: { f: [0, 2, 2, 1, 0, 0], d: [0, 2, 3, 1, 0, 0], b: [] } }, { name: "F", shape: shapeOf("E", "major", 1) }] },
  caption: "Sube la forma de E un traste y el índice hace de cejilla: sale F. La raíz está en la cuerda 6, así que el traste de la cejilla da el nombre.",
  play: { label: "▶ Oír E y F", chords: [shapeMidis({ f: [0, 2, 2, 1, 0, 0] }), shapeMidis(shapeOf("E", "major", 1))], gap: 1.4 },
};

export const mount = (container, ctx) => mountTheoryGame(container, ctx, { makeQuestion, demo, className: "lo-barre-chords" });
