import { BASICO } from "./basico.js";
import { INTERMEDIO } from "./intermedio.js";

/** Las rutas con lecciones, en orden. */
export const PATHS = [BASICO, INTERMEDIO];

/**
 * Rutas anunciadas que aún no existen: se muestran como «Pronto». Por ahora no se anuncia ninguna (solo existe
 * «Básico», decisión del usuario, 2026-11-24); para anunciar una, se agrega aquí con `{ id, title, blurb }`.
 */
export const COMING = [];

export const pathById = (id) => PATHS.find((p) => p.id === id) ?? null;
export const lessonById = (path, id) => path?.lessons.find((l) => l.id === id) ?? null;
