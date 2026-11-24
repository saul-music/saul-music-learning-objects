// Lógica de «Acordes de quinta»: X5 = raíz + 5ª, sin 3ª (ni mayor ni menor). Sin DOM ni audio.
import { buildChoices, pick } from "@saul-music/lo-kit";
import { Note } from "tonal";

export const ROOTS = ["E", "A", "D", "G", "C", "B", "F", "F#", "Bb", "C#", "Eb", "G#"];
const pc = (n) => Note.pitchClass(n);
const T = (n, ivl) => pc(Note.transpose(n, ivl));

export const chordName = (root, kind) => `${root}${kind === "minor" ? "m" : kind === "power" ? "5" : ""}`;

/** Notas del acorde (sin la 8ª). */
export function notesOf(root, kind) {
  if (kind === "power") return [root, T(root, "5P")];
  return [root, T(root, kind === "minor" ? "3m" : "3M"), T(root, "5P")];
}

/** MIDI para oírlo: raíz, 5ª (y 3ª si la hay) y la raíz arriba. */
export function voicing(root, kind) {
  const r = Note.midi(`${root}3`);
  return kind === "power" ? [r, r + 7, r + 12] : [r, r + (kind === "minor" ? 3 : 4), r + 7, r + 12];
}

export const joinNotes = (notes) => notes.join(" – ");

export function describe(root, kind) {
  const n = notesOf(root, kind);
  if (kind === "power") return `${root}5 es ${joinNotes(n)}: la raíz y la 5ª (7 semitonos). Sin 3ª no es ni mayor ni menor.`;
  return `${chordName(root, kind)} es ${joinNotes(n)}: tiene 3ª (${kind === "minor" ? "menor" : "mayor"}), por eso no es de quinta.`;
}

/** Se muestran las notas; ¿cuál es el acorde: X, Xm o X5? */
export function identifyQuestion(rng) {
  const root = pick(ROOTS, rng);
  const kind = pick(["power", "power", "major", "minor"], rng);
  const choices = [chordName(root, "major"), chordName(root, "minor"), chordName(root, "power")];
  return { type: "identify", root, kind, notes: notesOf(root, kind), choices, correct: choices.indexOf(chordName(root, kind)), answer: chordName(root, kind), explain: describe(root, kind) };
}

/** «¿Qué notas forman X5?» */
export function notesQuestion(rng) {
  const root = pick(ROOTS, rng);
  const answer = joinNotes(notesOf(root, "power"));
  const raw = [joinNotes(notesOf(root, "major")), joinNotes(notesOf(root, "minor")), joinNotes([root, T(root, "4P")]), joinNotes([root, T(root, "3M")])];
  const { choices, correct } = buildChoices(answer, [...new Set(raw)].filter((c) => c !== answer), rng);
  return { type: "notes", root, kind: "power", choices, correct, answer, explain: describe(root, "power") };
}

/** «¿Qué nota desaparece al pasar de X (o Xm) a X5?» */
export function missingQuestion(rng) {
  const root = pick(ROOTS, rng);
  const from = rng() < 0.5 ? "major" : "minor";
  const third = notesOf(root, from)[1];
  const { choices, correct } = buildChoices("La 3ª", ["La 5ª", "La raíz"], rng);
  return {
    type: "missing", root, from, kind: "power", third, choices, correct, answer: "La 3ª",
    explain: `De ${chordName(root, from)} a ${root}5 sale la 3ª (${third}); quedan la raíz y la 5ª: ${joinNotes(notesOf(root, "power"))}.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.45) return identifyQuestion(rng);
  if (r < 0.8) return notesQuestion(rng);
  return missingQuestion(rng);
}
