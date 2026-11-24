// Lógica de «maj7 y acordes de 6». Sin DOM ni audio.
import { Note } from "tonal";
import { buildChoices, buildQuestion, differenceQuestion, earQuestion, identifyQuestion, midisOf, nameOf, noteAt, pick, pickRoot } from "@saul-music/chord-core/theory";

export const POOL = ["maj7", "7", "m7", "6", "m6"];

/** C6 tiene las mismas notas que Am7. */
export function twinQuestion(rng) {
  const root = pickRoot(rng, "6", ["C", "D", "E", "F", "G", "A", "Bb", "Eb"]);
  const rel = noteAt(root, "6M");
  const answer = nameOf(rel, "m7");
  const { choices, correct } = buildChoices(answer, [nameOf(rel, ""), nameOf(rel, "m"), nameOf(rel, "7"), nameOf(rel, "m6")], rng);
  return {
    type: "twin", eyebrow: "Mismas notas", big: nameOf(root, "6"), bigKind: "chord", ask: "Tiene las mismas notas que otro acorde. ¿Cuál?", choices, correct, answer, choiceKind: "chord",
    play: { label: `▶ Oír ${nameOf(root, "6")} y ${answer}`, chords: [midisOf(root, "6"), midisOf(rel, "m7")], gap: 1.5 }, playOnAnswer: true,
    explain: `${nameOf(root, "6")} y ${answer} suenan con las mismas notas. Cambia cuál es la más grave: el oído la toma como raíz.`,
  };
}

/** La 6ª está a 9 semitonos; la 7ª mayor, a 11. */
export function distanceQuestion(rng) {
  const suffix = pick(["6", "maj7"], rng);
  const root = pickRoot(rng, suffix);
  const answer = suffix === "6" ? "9" : "11";
  const { choices, correct } = buildChoices(answer, ["8", "9", "10", "11", "12"], rng);
  const note = noteAt(root, suffix === "6" ? "6M" : "7M");
  return {
    type: "distance", eyebrow: suffix === "6" ? "La 6ª" : "La 7ª mayor", big: `${root} → ${note}`, ask: "¿Cuántos semitonos hay sobre la raíz?", choices, correct, answer, choiceKind: "number",
    explain: `De ${root} a ${note} hay ${answer} semitonos: ${suffix === "6" ? "la 6ª" : "la 7ª mayor"}.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.18) return buildQuestion(rng, POOL);
  if (r < 0.36) return identifyQuestion(rng, POOL);
  if (r < 0.52) return differenceQuestion(rng, [["7", "maj7"], ["", "6"], ["m", "m6"], ["m7", "m6"]]);
  if (r < 0.66) return twinQuestion(rng);
  if (r < 0.8) return distanceQuestion(rng);
  return earQuestion(rng, ["", "7", "maj7", "6"]);
}
