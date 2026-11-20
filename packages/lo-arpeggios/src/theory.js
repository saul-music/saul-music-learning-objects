// Lógica de «Escalera del acorde»: el arpegio 1ª – 3ª – 5ª – 8ª de los acordes mayores y menores.
import { buildChoices, pick } from "@saul-music/lo-kit";
import { Note } from "tonal";

// Raíces con escritura simple (sin dobles alteraciones en el arpegio).
export const MAJOR_ROOTS = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab", "Db", "F#"];
export const MINOR_ROOTS = ["A", "B", "C", "D", "E", "F", "G", "C#", "F#", "G#", "Bb"];
export const STEPS = [1, 3, 5, 8];
const SEMIS = { major: [0, 4, 7, 12], minor: [0, 3, 7, 12] };

const pc = (n) => Note.pitchClass(n);
const T = (n, ivl) => pc(Note.transpose(n, ivl));

export const qualityLabel = (q) => (q === "major" ? "mayor" : "menor");
export const chordName = (root, q) => `${root}${q === "minor" ? "m" : ""}`;

/** Notas del arpegio: [1ª, 3ª, 5ª, 8ª]. La 8ª tiene el mismo nombre que la 1ª, una octava arriba. */
export function arpeggio(root, quality) {
  return [root, T(root, quality === "major" ? "3M" : "3m"), T(root, "5P"), root];
}

/** Semitonos desde la raíz de cada paso del arpegio. */
export const semitonesOf = (quality) => SEMIS[quality];

/** Explicación completa del arpegio. */
export function describe(root, quality) {
  const [r, t, f] = arpeggio(root, quality);
  const third = quality === "major" ? "3ª mayor, 4 semitonos" : "3ª menor, 3 semitonos";
  return `${root} ${qualityLabel(quality)}: ${r} (1ª) · ${t} (${third}) · ${f} (5ª justa, 7) · ${r} (8ª, 12).`;
}

function chord(rng) {
  const quality = rng() < 0.55 ? "major" : "minor";
  const root = pick(quality === "major" ? MAJOR_ROOTS : MINOR_ROOTS, rng);
  return { root, quality, notes: arpeggio(root, quality) };
}

/** Distractores que no suenan igual que la respuesta (sin enarmónicas). */
function distinct(answer, list) {
  return list.filter((n) => Note.chroma(n) !== Note.chroma(answer));
}

/** «D mayor: D · ? · A · D» → F#. Falta la 3ª o la 5ª. */
export function missingQuestion(rng) {
  const c = chord(rng);
  const idx = rng() < 0.6 ? 1 : 2;
  const answer = c.notes[idx];
  const raw = idx === 1
    ? [T(c.root, c.quality === "major" ? "3m" : "3M"), T(c.root, "2M"), T(c.root, "4P"), answer[0]]
    : [T(c.root, "4P"), T(c.root, "6m"), T(c.root, "6M"), T(c.root, "5d"), answer[0]];
  const { choices, correct } = buildChoices(answer, distinct(answer, raw), rng);
  return { type: "missing", ...c, step: STEPS[idx], answer, choices, correct, explain: describe(c.root, c.quality) };
}

/** «En el arpegio de E menor, ¿cuál es la 5ª?» → B. */
export function stepQuestion(rng) {
  const c = chord(rng);
  const idx = pick([1, 2, 2, 3], rng); // 3ª, 5ª o 8ª
  const answer = c.notes[idx];
  const raw = [...c.notes, T(c.root, "4P"), T(c.root, c.quality === "major" ? "3m" : "3M"), T(c.root, "2M")];
  const { choices, correct } = buildChoices(answer, distinct(answer, raw), rng);
  const extra = idx === 3 ? " La 8ª (octava) es la misma nota que la 1ª, más aguda." : "";
  return { type: "step", ...c, step: STEPS[idx], answer, choices, correct, explain: describe(c.root, c.quality) + extra };
}

/** «En C mayor, ¿qué paso es G?» → 5ª. */
export function whichStepQuestion(rng) {
  const c = chord(rng);
  const idx = rng() < 0.5 ? 1 : 2;
  const answer = `${STEPS[idx]}ª`;
  const { choices, correct } = buildChoices(answer, ["1ª", "3ª", "5ª", "7ª"], rng);
  return { type: "whichStep", ...c, step: STEPS[idx], note: c.notes[idx], answer, choices, correct, explain: describe(c.root, c.quality) };
}

/** Una pregunta al azar. */
export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.45) return missingQuestion(rng);
  if (r < 0.8) return stepQuestion(rng);
  return whichStepQuestion(rng);
}
