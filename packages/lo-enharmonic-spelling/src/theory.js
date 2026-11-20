// Lógica de «Nombra bien la nota»: ortografía enarmónica práctica (cada letra una vez, cuándo usar
// sostenidos o bemoles y por qué casi nunca se ven E#, B#, Fb y Cb). Sin DOM ni audio.
import { buildChoices, pick } from "@saul-music/lo-kit";
import { Note, Scale } from "tonal";

/** Tonalidades mayores que se preguntan: hasta 3 alteraciones y dos «raras» (F# y Gb). */
export const KEYS = ["G", "D", "A", "F", "Bb", "Eb", "F#", "Gb"];
const SHARP_KEYS = ["G", "D", "A"];
const FLAT_KEYS = ["F", "Bb", "Eb"];

/** Notas raras y la tonalidad mayor donde sí aparecen. */
export const RARE_HOME = { "E#": "F#", Cb: "Gb", "B#": "C#", Fb: "Cb" };
const ALL_KEYS_FOR_RARE = ["G", "D", "A", "F", "Bb", "Eb", "F#", "Gb", "C#", "Cb"];

const ordinal = (n) => `${n}ª`;
export const degreeLabel = ordinal;
const accidentals = (n) => (n.match(/[#b]/g) ?? []).length;
const scaleOf = (key) => Scale.get(`${key} major`).notes;
// tonal solo da la gemela de las notas con alteración; las naturales con gemela son E, F, B y C.
const NATURAL_TWIN = { E: "Fb", F: "E#", B: "Cb", C: "B#" };
const flip = (n) => (accidentals(n) ? Note.enharmonic(n) : NATURAL_TWIN[n] ?? n);
/** Nombres con a lo sumo una alteración (los dobles sostenidos/bemoles no se enseñan aquí). */
const simple = (n) => n && accidentals(n) <= 1;

/** «En la escala de F mayor, ¿cómo se escribe la 4ª nota?» → Bb (no A#). */
export function spellingQuestion(rng) {
  const key = pick(KEYS, rng);
  const notes = scaleOf(key);
  const withAcc = notes.map((n, i) => (accidentals(n) ? i : -1)).filter((i) => i > 0);
  const rare = notes.map((n, i) => (n in RARE_HOME ? i : -1)).filter((i) => i > 0);
  const idx = rare.length && rng() < 0.6 ? pick(rare, rng) : withAcc.length && rng() < 0.85 ? pick(withAcc, rng) : 1 + Math.floor(rng() * 6);
  const answer = notes[idx];
  const twin = flip(answer);
  // La gemela enarmónica va primero: es el error típico. Después, la letra sola, con # y con b, y las vecinas.
  const near = [-1, 1].map((d) => Note.pitchClass(Note.fromMidi(Note.midi(`${answer}4`) + d)));
  const distractors = [simple(twin) ? twin : null, answer[0], `${answer[0]}#`, `${answer[0]}b`, ...near]
    .filter((n) => n && n !== answer);
  const { choices, correct } = buildChoices(answer, distractors, rng);
  const why = simple(twin) && twin[0] !== answer[0]
    ? ` Se escribe ${answer} y no ${twin}: la letra ${twin[0]} ya tiene su lugar en la escala.`
    : "";
  return {
    type: "spelling", key, notes, degree: idx + 1, answer, choices, correct,
    explain: `La escala de ${key} mayor es ${notes.join(" ")}: cada letra aparece una sola vez.${why}`,
  };
}

/**
 * «Estás en G y subes medio tono desde E» → F (no E#). En tonalidades de sostenidos se sube con
 * sostenido; en las de bemoles se baja con bemol; si la nota no necesita alteración, se prefiere el nombre simple.
 */
export function strategyQuestion(rng) {
  const key = pick([...SHARP_KEYS, ...FLAT_KEYS, "C"], rng);
  const up = key === "C" ? rng() < 0.5 : SHARP_KEYS.includes(key);
  const naturals = scaleOf(key).filter((n) => accidentals(n) === 0);
  const from = pick(naturals, rng);
  const sameLetter = `${from}${up ? "#" : "b"}`;
  const noBlack = up ? from === "E" || from === "B" : from === "F" || from === "C";
  let answer;
  let others;
  let explain;
  if (noBlack) {
    answer = up ? (from === "E" ? "F" : "C") : from === "F" ? "E" : "B";
    others = [sameLetter, up ? `${answer}#` : `${answer}b`, from];
    explain = `Entre ${up ? `${from} y ${answer}` : `${answer} y ${from}`} no hay tecla negra: el nombre simple es ${answer}. ${sameLetter} existe, pero solo lo usarías si la tonalidad lo pidiera.`;
  } else {
    answer = sameLetter;
    const twin = flip(sameLetter);
    others = [twin, from, up ? `${from}b` : `${from}#`];
    explain = `${up ? "Subiendo" : "Bajando"} desde ${from} se usa ${up ? "sostenido" : "bemol"}: ${answer}, no ${twin}. Así la nota sigue el movimiento de la melodía y no cambias de letra sin motivo.`;
  }
  const { choices, correct } = buildChoices(answer, others.filter((n) => n !== answer), rng);
  return { type: "strategy", key, up, from, answer, choices, correct, explain };
}

/** «¿En qué tonalidad mayor aparece E#?» → F#. Cómo se explica por qué existe. */
export function whichKeyQuestion(rng) {
  const rareNote = pick(Object.keys(RARE_HOME), rng);
  const answer = RARE_HOME[rareNote];
  const notes = scaleOf(answer);
  const idx = notes.indexOf(rareNote);
  const twin = flip(rareNote);
  const heavy = accidentals(answer) && (answer === "C#" || answer === "Cb");
  const { choices, correct } = buildChoices(answer, ALL_KEYS_FOR_RARE, rng);
  const explain = `${answer} mayor es ${notes.join(" ")}. Su ${ordinal(idx + 1)} nota tiene que ser una ${rareNote[0]} (la ${twin[0]} ya se usó) y suena como ${twin}.`
    + (heavy ? ` Son tonalidades de 7 alteraciones: por eso ${rareNote} casi nunca aparece.` : " Fuera de estas tonalidades, casi siempre hay un nombre más simple.");
  return { type: "whichKey", rareNote, answer, notes, degree: idx + 1, choices, correct, explain };
}

/** Todas las formas «mal escritas» de un acorde mayor: cambiando una, dos o todas sus notas por su enarmónica. */
export function triadMisspellings(triad) {
  const out = new Set();
  const n = triad.length;
  for (let mask = 1; mask < 2 ** n; mask++) {
    const variant = triad.map((note, i) => (mask & (1 << i) ? flip(note) : note));
    const text = variant.join(" ");
    if (variant.every(simple) && text !== triad.join(" ")) out.add(text);
  }
  return [...out];
}

export const TRIAD_ROOTS = ["F", "Bb", "Eb", "Ab", "Db", "A", "E", "F#", "Gb"];

/** «¿Cómo se escribe el acorde de Bb mayor?» → Bb D F (no A# D F). */
export function triadQuestion(rng) {
  const root = pick(TRIAD_ROOTS, rng);
  const notes = scaleOf(root);
  const triad = [notes[0], notes[2], notes[4]];
  const answer = triad.join(" ");
  const wrong = triadMisspellings(triad);
  const { choices, correct } = buildChoices(answer, wrong, rng);
  const letters = triad.map((n) => n[0]).join(", ");
  return {
    type: "triad", root, triad, answer, choices, correct,
    explain: `Un acorde mayor apila 1ª, 3ª y 5ª de la escala, con letras alternadas (${letters}). Por eso es ${triad.join(" – ")}.`,
  };
}

export const QUESTION_TYPES = [spellingQuestion, strategyQuestion, whichKeyQuestion, triadQuestion];

/** Una pregunta al azar de cualquiera de los cuatro tipos. */
export function makeQuestion(rng = Math.random) {
  return pick(QUESTION_TYPES, rng)(rng);
}
