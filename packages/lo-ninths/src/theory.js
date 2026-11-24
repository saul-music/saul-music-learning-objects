// Lógica de «Novenas y 6/9»: 9, m9, maj9 y 6/9. Sin DOM ni audio.
import { buildChoices, buildQuestion, differenceQuestion, earQuestion, identifyQuestion, midisOf, nameOf, noteAt, notesOf, pick, pickRoot } from "@saul-music/chord-core/theory";

export const POOL = ["9", "m9", "maj9", "6/9", "7", "m7", "maj7", "6"];
const NINTHS = ["9", "m9", "maj9", "6/9"];

/** La 9ª es la 2ª una octava arriba. */
export function ninthQuestion(rng) {
  const suffix = pick(NINTHS, rng);
  const root = pickRoot(rng, suffix);
  const ninth = noteAt(root, "9M");
  const { choices, correct } = buildChoices(ninth, [noteAt(root, "2m"), noteAt(root, "3m"), noteAt(root, "2A"), noteAt(root, "4P")], rng);
  return {
    type: "ninth", eyebrow: "La 9ª", big: nameOf(root, suffix), bigKind: "chord", ask: `¿Qué nota es la 9ª sobre ${root}? (la 2ª, una octava arriba)`, choices, correct, answer: ninth, choiceKind: "note",
    visualAnswered: { kind: "text", lines: [`${nameOf(root, suffix)} = ${notesOf(root, suffix).join(" – ")}`] },
    explain: `La 9ª de ${root} es ${ninth}: es la 2ª, 14 semitonos arriba. ${nameOf(root, suffix)} = ${notesOf(root, suffix).join(" – ")}.`,
  };
}

/** ¿Lleva 7ª este acorde? (el 6/9 no, los demás sí). */
export function seventhQuestion(rng) {
  const suffix = pick(["9", "m9", "maj9", "6/9", "add9"], rng);
  const root = pickRoot(rng, suffix);
  const has = !["6/9", "add9"].includes(suffix);
  const answer = has ? "Sí, lleva 7ª" : "No, no lleva 7ª";
  const { choices, correct } = buildChoices(answer, ["Sí, lleva 7ª", "No, no lleva 7ª"], rng, 2);
  return {
    type: "seventh", eyebrow: "¿Con 7ª?", big: nameOf(root, suffix), bigKind: "chord", ask: "¿Este acorde lleva 7ª?", choices, correct, answer, choiceKind: "text",
    explain: `${nameOf(root, suffix)} = ${notesOf(root, suffix).join(" – ")}. ${has ? "Es una séptima con la 9ª sumada." : "Suma la 9ª sin 7ª."}`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.18) return buildQuestion(rng, POOL, NINTHS);
  if (r < 0.36) return identifyQuestion(rng, POOL, NINTHS);
  if (r < 0.52) return differenceQuestion(rng, [["7", "9"], ["m7", "m9"], ["maj7", "maj9"], ["6", "6/9"]]);
  if (r < 0.68) return ninthQuestion(rng);
  if (r < 0.8) return seventhQuestion(rng);
  return earQuestion(rng, POOL, ["9", "m9", "maj9", "6/9"]);
}
