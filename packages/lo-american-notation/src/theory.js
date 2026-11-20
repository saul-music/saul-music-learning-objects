// Lógica de «Do es C»: pasar de la clave americana a la latina y al revés. Sin DOM ni audio.
import { buildChoices, LETTERS, pick, spoken } from "@saul-music/lo-kit";
import { Note } from "tonal";

const NATURALS = LETTERS;
const SHARPS = ["C#", "D#", "F#", "G#", "A#"];
const FLATS = ["Db", "Eb", "Gb", "Ab", "Bb"];
// Las naturales pesan el doble: son la base; las alteradas aparecen, pero menos.
const POOL = [...NATURALS, ...NATURALS, ...SHARPS, ...FLATS];
const ALL = [...NATURALS, ...SHARPS, ...FLATS];

/** MIDI de la nota en la 4ª octava (para dibujarla y oírla). */
export const midiOf = (name) => Note.midi(`${name}4`);

/** La misma letra con la alteración contraria o sin ella: los distractores más útiles. */
function sameLetter(name) {
  const l = name[0];
  return [l, `${l}#`, `${l}b`].filter((n) => n !== name);
}

/** «G» → «¿Cómo se dice?» → «Sol». */
export function toSpokenQuestion(rng) {
  const name = pick(POOL, rng);
  const distractors = [...sameLetter(name), ...ALL].map(spoken);
  const { choices, correct } = buildChoices(spoken(name), distractors, rng);
  return { type: "toSpoken", name, choices, correct, explain: `${name} se dice ${spoken(name)}.` };
}

/** «Sol» → «¿Cómo se escribe?» → «G». */
export function toLetterQuestion(rng) {
  const name = pick(POOL, rng);
  const { choices, correct } = buildChoices(name, [...sameLetter(name), ...ALL], rng);
  return { type: "toLetter", name, choices, correct, explain: `${spoken(name)} se escribe ${name}.` };
}

/** «¿Qué letra viene después de G?» → «A»: el alfabeto musical da la vuelta. */
export function nextLetterQuestion(rng) {
  const i = Math.floor(rng() * 7);
  const forward = rng() < 0.6;
  const name = LETTERS[i];
  const answer = LETTERS[(i + (forward ? 1 : 6)) % 7];
  const { choices, correct } = buildChoices(answer, LETTERS, rng);
  const wraps = (forward && name === "G") || (!forward && name === "A");
  const explain = wraps
    ? `${forward ? "Después de G vuelve A" : "Antes de A viene G"}: el alfabeto musical tiene solo 7 letras, de A a G, y da la vuelta.`
    : `${forward ? `Después de ${name} viene ${answer}` : `Antes de ${name} viene ${answer}`} (${spoken(name)} → ${spoken(answer)}).`;
  return { type: "nextLetter", name, forward, answer, choices, correct, explain };
}

/** Una pregunta al azar: la mitad son de nombre a letra o al revés; el resto, el orden de las letras. */
export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.4) return toSpokenQuestion(rng);
  if (r < 0.8) return toLetterQuestion(rng);
  return nextLetterQuestion(rng);
}
