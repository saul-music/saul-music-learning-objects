// Lógica de «Tensiones»: 9, 11 y 13, y las alteradas b9, #9, #11 y b13. Sin DOM ni audio.
import { buildChoices, buildQuestion, identifyQuestion, midisOf, nameOf, noteAt, notesOf, pick, pickRoot } from "@saul-music/chord-core/theory";

export const POOL = ["7(b9)", "7(#9)", "7(b13)", "maj7#11", "madd11", "13", "m11", "9"];
const TENSIONS = { 9: { iv: "9M", from: "la 2ª" }, 11: { iv: "11P", from: "la 4ª" }, 13: { iv: "13M", from: "la 6ª" } };
const ALTERED = { b9: { iv: "9m", text: "la 9ª bajada medio tono" }, "#9": { iv: "9A", text: "la 9ª subida medio tono" }, "#11": { iv: "11A", text: "la 11ª subida medio tono" }, b13: { iv: "13m", text: "la 13ª bajada medio tono" } };
const ROOTS = ["C", "D", "E", "F", "G", "A", "Bb"];

/** ¿Qué nota es la 9ª, 11ª o 13ª? (son la 2ª, la 4ª y la 6ª una octava arriba). */
export function degreeQuestion(rng) {
  const t = pick(Object.keys(TENSIONS), rng);
  const root = pick(ROOTS, rng);
  const { iv, from } = TENSIONS[t];
  const answer = noteAt(root, iv);
  const base = { 9: ["2m", "3m", "4P"], 11: ["3M", "5P", "4A"], 13: ["6m", "7m", "5P"] }[t];
  const { choices, correct } = buildChoices(answer, base.map((i) => noteAt(root, i)), rng);
  return {
    type: "degree", eyebrow: `La ${t}ª`, big: `${root} → ?`, ask: `¿Qué nota es la ${t}ª de ${root}? (${from}, una octava arriba)`, choices, correct, answer, choiceKind: "note",
    explain: `La ${t}ª es ${from} una octava arriba: en ${root} es ${answer}.`,
  };
}

/** ¿Qué nota es la b9, #9, #11 o b13? */
export function alterQuestion(rng) {
  const t = pick(Object.keys(ALTERED), rng);
  const root = pick(["C", "D", "E", "G", "A", "F"], rng);
  const { iv, text } = ALTERED[t];
  const answer = noteAt(root, iv);
  const natural = { b9: "9M", "#9": "9M", "#11": "11P", b13: "13M" }[t];
  const { choices, correct } = buildChoices(answer, [noteAt(root, natural), noteAt(root, t.startsWith("#") ? iv === "9A" ? "3m" : "5P" : iv === "9m" ? "2M" : "6M"), noteAt(root, t === "b9" ? "2A" : t === "#9" ? "2m" : t === "#11" ? "5P" : "6M"), noteAt(root, t === "b13" ? "5A" : "4P")], rng);
  return {
    type: "alter", eyebrow: "Tensión alterada", big: `${root} → ?`, ask: `¿Qué nota es la ${t} sobre ${root}? (${text})`, choices, correct, answer, choiceKind: "note",
    explain: `La ${t} es ${text}: sobre ${root}, ${answer}.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.2) return buildQuestion(rng, POOL, ["7(b9)", "7(#9)", "7(b13)", "maj7#11", "madd11", "13"]);
  if (r < 0.4) return identifyQuestion(rng, POOL, ["7(b9)", "7(#9)", "7(b13)", "maj7#11", "madd11", "13"]);
  if (r < 0.7) return degreeQuestion(rng);
  return alterQuestion(rng);
}
