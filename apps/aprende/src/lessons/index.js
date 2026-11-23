import { BASICO } from "./basico.js";

/** Las rutas con lecciones, en orden. */
export const PATHS = [BASICO];

/** Rutas anunciadas que aún no existen (C32): se muestran como «Pronto». */
export const COMING = [
  { id: "intermedio", title: "Intermedio", blurb: "Escalas, tonalidades y acordes de séptima." },
  { id: "avanzado", title: "Avanzado", blurb: "Armonía, extensiones y voces." },
];

export const pathById = (id) => PATHS.find((p) => p.id === id) ?? null;
export const lessonById = (path, id) => path?.lessons.find((l) => l.id === id) ?? null;
