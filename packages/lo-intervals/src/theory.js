// Lógica de «El misterio de E#»: medios tonos, sostenidos y bemoles, enarmonía, intervalos
// y por qué existen notas raras como E# o Cb. Sin DOM ni audio.
import { buildChoices, LETTERS, pick } from "@saul-music/lo-kit";
import { Note, Scale } from "tonal";

export const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const RARE = ["E#", "B#", "Fb", "Cb"];

/** Intervalos que se enseñan, con su nombre y sus semitonos. */
export const INTERVALS = [
  { ivl: "2m", name: "2ª menor", semis: 1 },
  { ivl: "2M", name: "2ª mayor", semis: 2 },
  { ivl: "3m", name: "3ª menor", semis: 3 },
  { ivl: "3M", name: "3ª mayor", semis: 4 },
  { ivl: "4P", name: "4ª justa", semis: 5 },
  { ivl: "5P", name: "5ª justa", semis: 7 },
  { ivl: "6M", name: "6ª mayor", semis: 9 },
  { ivl: "8P", name: "8ª (octava)", semis: 12 },
];

const chroma = (n) => Note.chroma(n);
const familyOf = (name) => (name.includes("b") ? FLAT_NAMES : SHARP_NAMES);
const ordinal = (n) => `${n}ª`;

/** Nombres a ±1 y ±2 semitonos, escritos como la respuesta (sin dos nombres para el mismo sonido). */
function neighbors(answer, extra = []) {
  const fam = familyOf(answer);
  const c = chroma(answer);
  return [...extra, ...[-2, -1, 1, 2].map((d) => fam[(c + d + 12) % 12])].filter((n) => chroma(n) !== c);
}

/** Los pasos cromáticos de `from` a `to` subiendo: «A → A# → B → C → C#». */
export function chromaticSteps(from, semis) {
  const fam = familyOf(from);
  const start = chroma(from);
  return [from, ...Array.from({ length: semis }, (_, i) => fam[(start + i + 1) % 12])];
}

/** «¿Qué nota está medio tono arriba de E?» → F. */
export function halfStepQuestion(rng) {
  const from = pick(SHARP_NAMES, rng);
  const up = rng() < 0.5;
  const answer = SHARP_NAMES[(chroma(from) + (up ? 1 : 11)) % 12];
  const { choices, correct } = buildChoices(answer, neighbors(answer, [from]), rng);
  const noBlack = (up && (from === "E" || from === "B")) || (!up && (from === "F" || from === "C"));
  const explain = noBlack
    ? `Entre ${up ? from : answer} y ${up ? answer : from} no hay tecla negra: están a medio tono.`
    : `Medio tono es la tecla (o el traste) vecina: ${up ? `${from} → ${answer}` : `${answer} ← ${from}`}.`;
  return { type: "halfStep", from, up, answer, choices, correct, explain, semis: up ? 1 : -1 };
}

/** «E# suena igual que…» → F. También C# = Db. */
export function enharmonicQuestion(rng) {
  const from = rng() < 0.5 ? pick(RARE, rng) : pick([...SHARP_NAMES, ...FLAT_NAMES].filter((n) => n.length === 2), rng);
  const answer = RARE.includes(from) ? SHARP_NAMES[chroma(from)] : Note.enharmonic(from);
  const { choices, correct } = buildChoices(answer, neighbors(answer, [from[0]]), rng);
  let explain;
  if (RARE.includes(from)) {
    const raised = from.includes("#");
    explain = `${from} es ${from[0]} ${raised ? "subida" : "bajada"} medio tono. Entre ${raised ? `${from[0]} y ${answer}` : `${answer} y ${from[0]}`} no hay tecla negra, así que ${from} cae en la tecla de ${answer}: suenan igual (enarmonía).`;
  } else {
    explain = `${from} y ${answer} son la misma tecla negra: dos nombres para el mismo sonido (enarmonía).`;
  }
  return { type: "enharmonic", from, answer, choices, correct, explain };
}

/** «¿Cuántos semitonos hay de A a C#?» → 4. */
export function semitonesQuestion(rng) {
  const from = pick(SHARP_NAMES, rng);
  const { semis } = pick(INTERVALS.filter((i) => i.semis < 12), rng);
  const to = SHARP_NAMES[(chroma(from) + semis) % 12];
  const answer = String(semis);
  const others = [semis - 2, semis - 1, semis + 1, semis + 2].filter((n) => n >= 1 && n <= 11).map(String);
  const { choices, correct } = buildChoices(answer, others, rng);
  const steps = chromaticSteps(from, semis);
  return { type: "semitones", from, to, semis, answer, choices, correct, explain: `De ${from} a ${to} hay ${semis} semitonos: ${steps.join(" → ")}.` };
}

/** «¿Qué intervalo hay de E a G#?» → 3ª mayor. */
export function intervalNameQuestion(rng) {
  const from = pick(LETTERS, rng);
  const it = pick(INTERVALS, rng);
  const to = Note.pitchClass(Note.transpose(from, it.ivl));
  const { choices, correct } = buildChoices(it.name, INTERVALS.map((i) => i.name), rng);
  const explain = `De ${from} a ${to} hay ${it.semis} semitonos: es una ${it.name}.`;
  return { type: "intervalName", from, to, semis: it.semis, answer: it.name, choices, correct, explain };
}

/** «En la escala de F# mayor, ¿cómo se escribe la 7ª nota?» → E#. Explica por qué existen las notas raras. */
export function scaleSpellingQuestion(rng) {
  const key = pick(["G", "D", "A", "E", "B", "F#", "C#", "F#", "C#"], rng);
  const notes = Scale.get(`${key} major`).notes;
  // En F# y C# se pregunta de preferencia por la nota rara (E#, B#): es el punto del juego.
  const rareIdx = notes.map((n, i) => (RARE.includes(n) ? i : -1)).filter((i) => i >= 0);
  const idx = rareIdx.length && rng() < 0.7 ? pick(rareIdx, rng) : 1 + Math.floor(rng() * 6);
  const answer = notes[idx];
  const enh = Note.enharmonic(answer);
  const distractors = [enh, answer[0], ...neighbors(answer)].filter((n) => n !== answer);
  const { choices, correct } = buildChoices(answer, distractors, rng);
  const why = enh !== answer && enh[0] !== answer[0]
    ? ` Por eso se escribe ${answer} y no ${enh}: ${enh[0]} ya está usada en la escala.`
    : "";
  const explain = `La escala de ${key} mayor es ${notes.join(" ")}. Cada letra aparece una sola vez.${why}`;
  return { type: "scaleSpelling", key, notes, degree: idx + 1, answer, choices, correct, explain };
}

export const QUESTION_TYPES = [halfStepQuestion, enharmonicQuestion, semitonesQuestion, intervalNameQuestion, scaleSpellingQuestion];

/** Una pregunta al azar de cualquiera de los cinco tipos. */
export function makeQuestion(rng = Math.random) {
  return pick(QUESTION_TYPES, rng)(rng);
}

/** Etiqueta del grado para el enunciado. */
export const degreeLabel = (d) => ordinal(d);

/** Semitonos (0–11) que separan dos notas, subiendo. Útil para dibujarlas. */
export const semitonesUp = (from, to) => (chroma(to) - chroma(from) + 12) % 12;

