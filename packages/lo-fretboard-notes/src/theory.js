// Lógica del OA «La misma nota en otra cuerda». Sin DOM ni audio: se prueba sola.
import { Note } from "tonal";

/** Afinación estándar, por número de cuerda (1 = la más aguda). Valores MIDI. */
export const OPEN_STRINGS = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };

const LATIN = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };

/** Número MIDI de una posición (cuerda, traste). */
export function midiAt(string, fret) {
  return OPEN_STRINGS[string] + fret;
}

/**
 * Nombre de la nota en clave americana (C, D, E, …), con sostenidos.
 * La clave americana es la notación de todos los OA: es la que se usa en todo el mundo.
 */
export function noteName(midi) {
  return Note.pitchClass(Note.fromMidiSharps(midi)); // "A", "C#"
}

/** Cómo se dice la nota en español (forma latina), solo como apoyo hablado: «La», «Do#». */
export function spokenName(midi) {
  const pc = noteName(midi);
  return LATIN[pc[0]] + pc.slice(1);
}

/** Trastes de `string` (0..maxFret) donde suena la misma nota (misma clase de altura). */
export function positionsOf(midi, string, maxFret = 12) {
  const chroma = midi % 12;
  const out = [];
  for (let fret = 0; fret <= maxFret; fret++) {
    if (midiAt(string, fret) % 12 === chroma) out.push(fret);
  }
  return out;
}

/** ¿Es correcta la respuesta? Vale cualquier octava de la misma nota. */
export function isCorrect(question, fret) {
  return midiAt(question.target, fret) % 12 === question.midi % 12;
}

/** Relación de altura entre la nota mostrada y la respuesta, en palabras. */
export function octaveRelation(fromMidi, toMidi) {
  const diff = toMidi - fromMidi;
  if (diff === 0) return "el mismo sonido exacto (unísono)";
  const n = Math.abs(diff) / 12;
  const dir = diff > 0 ? "más aguda" : "más grave";
  return n === 1 ? `la misma nota, una octava ${dir}` : `la misma nota, ${n} octavas ${dir}`;
}

const isNatural = (midi) => !Note.fromMidiSharps(midi).includes("#");

/**
 * Arma una pregunta al azar.
 * @param {() => number} rng  generador en [0, 1); se inyecta para poder probar
 * @param {{maxFret?: number, naturalsOnly?: boolean}} opts
 */
export function makeQuestion(rng = Math.random, { maxFret = 12, naturalsOnly = true } = {}) {
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const strings = [1, 2, 3, 4, 5, 6];
  const candidates = [];
  for (const s of strings) {
    for (let f = 0; f <= maxFret; f++) {
      if (!naturalsOnly || isNatural(midiAt(s, f))) candidates.push([s, f]);
    }
  }
  const [source, fret] = pick(candidates);
  const midi = midiAt(source, fret);
  const target = pick(strings.filter((s) => s !== source));
  return { source, fret, midi, target, answers: positionsOf(midi, target, maxFret) };
}
