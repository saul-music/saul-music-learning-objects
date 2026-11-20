// Lógica de «Luz y sombra»: reconocer de oído si un acorde es mayor o menor. Sin DOM ni audio.
import { pick } from "@saul-music/lo-kit";
import { Note } from "tonal";

export const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
export const CHOICES = ["Mayor", "Menor"];
const THIRD = { major: 4, minor: 3 };

/** Notas del acorde (raíz, 3ª y 5ª) bien escritas. */
export function triad(root, quality) {
  const t = Note.pitchClass(Note.transpose(root, quality === "major" ? "3M" : "3m"));
  return [root, t, Note.pitchClass(Note.transpose(root, "5P"))];
}

/** MIDI del acorde en la 3ª octava, con la raíz repetida arriba (suena más lleno en guitarra). */
export function voicing(root, quality) {
  const r = Note.midi(`${root}3`);
  return [r, r + THIRD[quality], r + 7, r + 12];
}

export const chordSymbol = (root, quality) => `${root}${quality === "minor" ? "m" : ""}`;

/** Una pregunta: suena un acorde y hay que decir si es mayor o menor. */
export function makeQuestion(rng = Math.random) {
  const quality = rng() < 0.5 ? "major" : "minor";
  const root = pick(ROOTS, rng);
  const notes = triad(root, quality);
  const label = quality === "major" ? "mayor" : "menor";
  const explain = `Era ${chordSymbol(root, quality)} (${notes.join(" – ")}): la 3ª está a ${THIRD[quality]} semitonos de la raíz, por eso suena ${label}.`;
  return { root, quality, notes, midis: voicing(root, quality), choices: CHOICES, correct: quality === "major" ? 0 : 1, answer: CHOICES[quality === "major" ? 0 : 1], explain };
}
