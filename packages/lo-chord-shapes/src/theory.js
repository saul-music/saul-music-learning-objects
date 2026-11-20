// Lógica de «Manos de acorde»: formas reales de guitarra (chords-db, MIT) para acordes mayores,
// menores y de séptima. Sin DOM ni audio.
import { buildChoices, pick } from "@saul-music/lo-kit";
import { Chord, Note } from "tonal";
import data from "../data/chords.json";

export const TUNING = data.tuning; // MIDI de las cuerdas al aire, de la 6ª a la 1ª
export const ROOTS = Object.keys(data.chords);
export const QUALITIES = ["major", "minor", "7"];
const SUFFIX = { major: "", minor: "m", 7: "7" };
export const QUALITY_NAME = { major: "mayor", minor: "menor", 7: "de séptima" };
const DEGREE = ["1ª", "3ª", "5ª", "7ª"];

export const symbolOf = (root, quality) => `${root}${SUFFIX[quality]}`;
export const shapesOf = (root, quality) => data.chords[root][quality];
/** Número de cuerda (6 = la más grave) a partir del índice en la forma (0 = 6ª). */
export const stringNumber = (idx) => 6 - idx;

/** MIDI de lo que suena en la forma, de grave a agudo (las cuerdas que no se tocan no suenan). */
export function shapeMidis(shape) {
  return shape.f.map((f, i) => (f < 0 ? null : TUNING[i] + f)).filter((m) => m != null);
}

/** Notas del acorde bien escritas (para Eb: Eb G Bb, no D# G A#). */
export function chordNotes(root, quality) {
  return Chord.get(symbolOf(root, quality)).notes;
}

/** Nombre de la nota que suena en un MIDI, escrita como en el acorde. */
export function spelledIn(midi, root, quality) {
  const chroma = midi % 12;
  return chordNotes(root, quality).find((n) => Note.chroma(n) === chroma) ?? Note.pitchClass(Note.fromMidiSharps(midi));
}

function randomShape(rng) {
  const root = pick(ROOTS, rng);
  const quality = pick(QUALITIES, rng);
  const shapes = shapesOf(root, quality);
  const pos = rng() < 0.65 ? 0 : shapes.length - 1; // la primera posición es la más común
  return { root, quality, pos, shape: shapes[pos], symbol: symbolOf(root, quality) };
}

/** Acordes parecidos para confundir: misma raíz con otra calidad, y raíces vecinas con la misma calidad. */
function similarSymbols(root, quality) {
  const i = ROOTS.indexOf(root);
  return [
    ...QUALITIES.filter((q) => q !== quality).map((q) => symbolOf(root, q)),
    ...[-5, -2, 2, 5, 7].map((d) => symbolOf(ROOTS[(i + d + 12) % 12], quality)),
  ];
}

const parse = (symbol) => {
  const quality = symbol.endsWith("7") ? "7" : symbol.endsWith("m") ? "minor" : "major";
  const root = quality === "major" ? symbol : symbol.slice(0, -1);
  return { root, quality };
};

/** Ves una forma: «¿Qué acorde es?». */
export function nameShapeQuestion(rng) {
  const c = randomShape(rng);
  const { choices, correct } = buildChoices(c.symbol, similarSymbols(c.root, c.quality), rng);
  const notes = chordNotes(c.root, c.quality);
  return { type: "nameShape", ...c, answer: c.symbol, choices, correct, explain: `Es ${c.symbol} (${c.root} ${QUALITY_NAME[c.quality]}): ${notes.join(" – ")}.` };
}

/** Ves un nombre: «¿Cuál es su forma?». Las alternativas son formas de otros acordes. */
export function pickShapeQuestion(rng) {
  const c = randomShape(rng);
  const { choices: symbols, correct } = buildChoices(c.symbol, similarSymbols(c.root, c.quality), rng);
  const choices = symbols.map((s) => {
    const p = parse(s);
    const shapes = shapesOf(p.root, p.quality);
    return { symbol: s, shape: s === c.symbol ? c.shape : shapes[Math.min(c.pos, shapes.length - 1)] };
  });
  const notes = chordNotes(c.root, c.quality);
  return { type: "pickShape", ...c, answer: c.symbol, choices, correct, explain: `${c.symbol} lleva ${notes.join(" – ")}. Las demás formas eran ${symbols.filter((s) => s !== c.symbol).join(", ")}.` };
}

/** «En esta forma de E, ¿qué nota suena en la 3ª cuerda?» → G#, la 3ª del acorde. */
export function stringNoteQuestion(rng) {
  const c = randomShape(rng);
  const played = c.shape.f.map((f, i) => (f >= 0 ? i : -1)).filter((i) => i >= 0);
  const idx = pick(played, rng);
  const fret = c.shape.f[idx];
  const midi = TUNING[idx] + fret;
  const answer = spelledIn(midi, c.root, c.quality);
  const notes = chordNotes(c.root, c.quality);
  const others = [...notes, ...[1, 2, 10, 11].map((d) => Note.pitchClass(Note.fromMidiSharps(midi + d)))]
    .filter((n) => Note.chroma(n) !== Note.chroma(answer));
  const { choices, correct } = buildChoices(answer, others, rng);
  const degree = DEGREE[notes.findIndex((n) => Note.chroma(n) === Note.chroma(answer))] ?? "";
  const open = Note.pitchClass(Note.fromMidiSharps(TUNING[idx]));
  const where = fret === 0 ? "al aire" : `en el traste ${fret}`;
  return {
    type: "stringNote", ...c, string: stringNumber(idx), stringIdx: idx, fret, answer, choices, correct,
    explain: `La ${stringNumber(idx)}ª cuerda (${open} al aire) ${where} suena ${answer}: es la ${degree} de ${c.symbol} (${notes.join(" – ")}).`,
  };
}

/** Una pregunta al azar. */
export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.4) return nameShapeQuestion(rng);
  if (r < 0.75) return pickShapeQuestion(rng);
  return stringNoteQuestion(rng);
}
