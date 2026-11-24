// Lógica de «sus y add9». Sin DOM ni audio.
import { buildChoices, buildQuestion, differenceQuestion, earQuestion, identifyQuestion, midisOf, nameOf, noteAt, notesOf, pick, pickRoot } from "@saul-music/chord-core/theory";

export const POOL = ["", "sus2", "sus4", "add9"];
const ROOTS = ["C", "D", "E", "F", "G", "A", "Bb"];

/** ¿Qué nota de D desaparece en Dsus4? (la 3ª) */
export function replacedQuestion(rng) {
  const suffix = pick(["sus2", "sus4"], rng);
  const root = pickRoot(rng, suffix, ROOTS);
  const third = noteAt(root, "3M");
  const { choices, correct } = buildChoices(third, [root, noteAt(root, "5P"), noteAt(root, "2M"), noteAt(root, "4P")].filter((n) => n !== (suffix === "sus2" ? noteAt(root, "2M") : noteAt(root, "4P"))), rng);
  return {
    type: "replaced", eyebrow: "Qué nota desaparece", big: nameOf(root, suffix), bigKind: "chord", ask: `${root} = ${notesOf(root, "").join(" – ")}. ¿Qué nota desaparece?`, choices, correct, answer: third, choiceKind: "note",
    visualAnswered: { kind: "text", lines: [`${root} = ${notesOf(root, "").join(" – ")}`, `${nameOf(root, suffix)} = ${notesOf(root, suffix).join(" – ")}`] },
    play: { label: `▶ Oír ${root} y ${nameOf(root, suffix)}`, chords: [midisOf(root, ""), midisOf(root, suffix)], gap: 1.5 }, playOnAnswer: true,
    explain: `${nameOf(root, suffix)} cambia la 3ª (${third}) por ${suffix === "sus2" ? "la 2ª" : "la 4ª"} (${noteAt(root, suffix === "sus2" ? "2M" : "4P")}): sin 3ª no es ni mayor ni menor.`,
  };
}

/** El sus4 resuelve al mayor: la 4ª baja medio tono hasta la 3ª. */
export function resolveQuestion(rng) {
  const root = pick(ROOTS, rng);
  const fourth = noteAt(root, "4P");
  const { choices, correct } = buildChoices(fourth, [root, noteAt(root, "5P"), noteAt(root, "3M"), noteAt(root, "2M")], rng);
  return {
    type: "resolve", eyebrow: "Resolver el sus4", big: "↓", ask: `Al pasar de ${nameOf(root, "sus4")} a ${root}, ¿qué nota baja medio tono?`, choices, correct, answer: fourth, choiceKind: "note",
    play: { label: `▶ Oír ${nameOf(root, "sus4")} y ${root}`, chords: [midisOf(root, "sus4"), midisOf(root, "")], gap: 1.4 }, playOnAnswer: true,
    explain: `La 4ª (${fourth}) baja medio tono a la 3ª (${noteAt(root, "3M")}): ese alivio es lo que hace querer volver al mayor.`,
  };
}

/** ¿Cuál es la diferencia entre sus2 y add9? */
export function compareQuestion(rng) {
  const root = pick(ROOTS, rng);
  const keep = rng() < 0.5; // pregunta por la 3ª
  const suffix = keep ? "add9" : "sus2";
  const answer = keep ? "Sí, conserva la 3ª" : "No, no tiene 3ª";
  const { choices, correct } = buildChoices(answer, ["Sí, conserva la 3ª", "No, no tiene 3ª", "Tiene la 3ª y la 4ª", "Tiene la 3ª bajada"], rng, 2);
  return {
    type: "compare", eyebrow: "¿Tiene 3ª?", big: nameOf(root, suffix), bigKind: "chord", ask: "¿Este acorde conserva la 3ª?", choices, correct, answer, choiceKind: "text",
    explain: `${nameOf(root, suffix)} = ${notesOf(root, suffix).join(" – ")}. ${keep ? `El add9 suma ${noteAt(root, "9M")} y conserva ${noteAt(root, "3M")}.` : `El sus2 cambia ${noteAt(root, "3M")} por ${noteAt(root, "2M")}.`}`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.16) return buildQuestion(rng, POOL, ["sus2", "sus4", "add9"]);
  if (r < 0.32) return identifyQuestion(rng, POOL, ["sus2", "sus4", "add9"]);
  if (r < 0.46) return differenceQuestion(rng, [["", "sus2"], ["", "sus4"], ["", "add9"]]);
  if (r < 0.62) return replacedQuestion(rng);
  if (r < 0.76) return resolveQuestion(rng);
  if (r < 0.86) return compareQuestion(rng);
  return earQuestion(rng, POOL, ["sus2", "sus4", "add9", ""]);
}
