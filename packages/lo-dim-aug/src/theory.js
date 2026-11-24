// Lógica de «Disminuidos y aumentados»: tríadas con la 5ª alterada. Sin DOM ni audio.
//   mayor: 1 – 3M – 5J   menor: 1 – 3m – 5J   disminuido (dim): 1 – 3m – 5dim   aumentado (aug): 1 – 3M – 5aum
import { buildChoices, pick } from "@saul-music/lo-kit";
import { Note } from "tonal";

const CANDIDATES = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab", "Db", "C#", "F#", "G#", "D#", "A#"];
const INTERVALS = { major: ["3M", "5P"], minor: ["3m", "5P"], dim: ["3m", "5d"], aug: ["3M", "5A"] };
export const SUFFIX = { major: "", minor: "m", dim: "dim", aug: "aug" };
export const WORD = { major: "mayor", minor: "menor", dim: "disminuido", aug: "aumentado" };

const pc = (n) => Note.pitchClass(n);
const T = (n, ivl) => pc(Note.transpose(n, ivl));

export function notesOf(root, kind) {
  const [third, fifth] = INTERVALS[kind];
  return [root, T(root, third), T(root, fifth)];
}
export const chordName = (root, kind) => `${root}${SUFFIX[kind]}`;
export const joinNotes = (notes) => notes.join(" – ");

/** Raíces cuyos acordes disminuido y aumentado se escriben sin dobles alteraciones. */
export const ROOTS = CANDIDATES.filter((r) => ["dim", "aug"].every((k) => !/##|bb/.test(notesOf(r, k).join(""))));

export function voicing(root, kind) {
  const r = Note.midi(`${root}3`);
  const up = (n) => { let m = Note.midi(`${n}3`); while (m < r) m += 12; while (m - r >= 12) m -= 12; return m; };
  const [, t, f] = notesOf(root, kind);
  return [r, up(t), up(f), r + 12];
}

export function describe(root, kind) {
  const n = notesOf(root, kind);
  const why = {
    major: "3ª mayor y 5ª justa",
    minor: "3ª menor y 5ª justa",
    dim: "3ª menor y 5ª disminuida (6 semitonos): la 5ª baja medio tono",
    aug: "3ª mayor y 5ª aumentada (8 semitonos): la 5ª sube medio tono",
  }[kind];
  return `${chordName(root, kind)} es ${joinNotes(n)}: ${why}.`;
}

/** Se muestran las notas; ¿qué acorde es? (dim y aug siempre entre las alternativas). */
export function identifyQuestion(rng) {
  const root = pick(ROOTS, rng);
  const kind = pick(["dim", "dim", "aug", "aug", "minor", "major"], rng);
  const names = ["major", "minor", "dim", "aug"].map((k) => chordName(root, k));
  return { type: "identify", root, kind, notes: notesOf(root, kind), choices: names, correct: names.indexOf(chordName(root, kind)), answer: chordName(root, kind), explain: describe(root, kind) };
}

/** «¿Cuál es la 5ª de Xdim / Xaug?» */
export function fifthQuestion(rng) {
  const root = pick(ROOTS, rng);
  const kind = rng() < 0.5 ? "dim" : "aug";
  const answer = notesOf(root, kind)[2];
  const just = T(root, "5P");
  const raw = [just, T(root, kind === "dim" ? "5A" : "5d"), T(root, "4P"), T(root, "6M")];
  const distract = raw.filter((n) => Note.chroma(n) !== Note.chroma(answer) || n === just);
  const { choices, correct } = buildChoices(answer, distract.filter((n) => n !== answer), rng);
  return { type: "fifth", root, kind, choices, correct, answer, explain: describe(root, kind) };
}

/** «¿Qué cambia al pasar de X a Xaug (o de Xm a Xdim)?» → la 5ª. Distingue cuál nota se mueve. */
export function changeQuestion(rng) {
  const root = pick(ROOTS, rng);
  const from = pick(["major", "minor"], rng);
  const to = from === "major" ? "aug" : "dim";
  const choices = from === "major" ? ["La 5ª sube medio tono", "La 5ª baja medio tono", "La 3ª sube medio tono"] : ["La 5ª baja medio tono", "La 5ª sube medio tono", "La 3ª baja medio tono"];
  const { choices: shuffled, correct } = buildChoices(choices[0], choices.slice(1), rng);
  return { type: "change", root, from, to, choices: shuffled, correct, answer: choices[0], explain: `${chordName(root, from)} → ${chordName(root, to)}: ${joinNotes(notesOf(root, from))} pasa a ${joinNotes(notesOf(root, to))}. Cambia solo la 5ª.` };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.45) return identifyQuestion(rng);
  if (r < 0.8) return fifthQuestion(rng);
  return changeQuestion(rng);
}
