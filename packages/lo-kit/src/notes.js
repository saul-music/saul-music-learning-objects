// Nombres de notas. Regla de los OA: clave americana siempre; la latina solo para decirla.
// Al mostrarlas, las alteraciones van con sus signos reales (C♯, B♭) en tipografía musical.
import { el } from "./dom.js";

export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
export const LATIN = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };

const ACCIDENTAL = { "": "", "#": " sostenido", "##": " doble sostenido", b: " bemol", bb: " doble bemol" };
const SIGN = { "#": "♯", "##": "𝄪", b: "♭", bb: "𝄫" };

/** Cómo se dice en español una nota escrita en clave americana: «C#» → «Do sostenido». */
export function spoken(name) {
  const letter = name[0].toUpperCase();
  const acc = name.slice(1).replace(/\d+$/, "");
  return LATIN[letter] + (ACCIDENTAL[acc] ?? acc);
}

/** Separa «C#m7» en letra, alteración y resto: { letter: "C", acc: "#", rest: "m7" }. */
export function splitName(name) {
  const m = /^([A-G])(##|#|bb|b)?(.*)$/.exec(name);
  if (!m) return { letter: name, acc: "", rest: "" };
  return { letter: m[1], acc: m[2] ?? "", rest: m[3] ?? "" };
}

/** Texto con signos reales: «C#» → «C♯», «Bbm» → «B♭m». */
export function pretty(name) {
  const { letter, acc, rest } = splitName(name);
  return letter + (SIGN[acc] ?? acc) + rest;
}

/** Nombre de nota o acorde en tipografía musical (Petaluma Script), con la alteración elevada. */
export function noteLabel(name, { cls = "" } = {}) {
  const { letter, acc, rest } = splitName(name);
  return el("span", { class: `lo-note ${cls}`.trim(), "aria-label": spoken(letter + acc) + (rest ? ` ${rest}` : "") },
    el("span", { class: "lo-note__letter", "aria-hidden": "true" }, letter),
    acc ? el("span", { class: "lo-note__acc", "aria-hidden": "true" }, SIGN[acc] ?? acc) : "",
    rest ? el("span", { class: "lo-note__rest", "aria-hidden": "true" }, rest) : "");
}

/** Cifrado de acorde (Am, G7, C#7) en tipografía musical. */
export const chordLabel = (symbol) => noteLabel(symbol, { cls: "lo-note--chord" });

// Notas dentro de un texto: una letra A–G sola, con alteración o cifrado (C♯, B♭, Am, G7, F♯m7).
const TOKEN = /(^|[^A-Za-z0-9])([A-G](?:##|#|bb|b)?(?:maj7|m7|m|7)?)(?![A-Za-z0-9])/g;
const LIST_MARK = /[–→(·]/;

/**
 * ¿Es una nota este token? Con alteración o cifrado, sí. Una letra sola, solo si va en una lista de
 * notas («B – D♯ – F♯ – A», «C → E») o entre paréntesis: así «A» como preposición no se confunde.
 */
function isNoteToken(text, start, token) {
  if (token.length > 1) return true;
  const before = text.slice(0, start).trimEnd().slice(-1);
  const after = text.slice(start + 1).trimStart().slice(0, 1);
  return LIST_MARK.test(before) || /[–→)·]/.test(after);
}

/** Notas que hay en un texto, con su posición (lógica pura). */
export function* notesIn(text) {
  for (const m of String(text).matchAll(TOKEN)) {
    const start = m.index + m[1].length;
    if (isNoteToken(text, start, m[2])) yield { start, name: m[2] };
  }
}

/** Parte un texto y escribe sus notas en tipografía musical. Devuelve nodos y textos. */
export function richText(text) {
  const str = String(text);
  const out = [];
  let last = 0;
  for (const { start, name } of notesIn(str)) {
    if (start > last) out.push(str.slice(last, start));
    out.push(noteLabel(name, { cls: "lo-note--inline" }));
    last = start + name.length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

/** Variante de texto plano (para lectores de pantalla, títulos o SVG): las notas con signos reales. */
export function prettyText(text) {
  const str = String(text);
  let out = "";
  let last = 0;
  for (const { start, name } of notesIn(str)) {
    out += str.slice(last, start) + pretty(name);
    last = start + name.length;
  }
  return out + str.slice(last);
}
