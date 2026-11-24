// Lógica de «Séptimas»: el 7 y el m7. Sin DOM ni audio.
import { Interval, Note } from "tonal";
import { buildChoices, buildQuestion, differenceQuestion, earQuestion, identifyQuestion, joinNotes, keyboardVisual, midisOf, nameOf, noteAt, notesOf, pick, pickRoot } from "@saul-music/chord-core/theory";

export const POOL = ["", "m", "7", "m7"];

/** El 7 pide resolver: va al acorde una 4ª arriba (G7 → C). */
export function resolveQuestion(rng) {
  const root = pickRoot(rng, "7", ["C", "D", "E", "G", "A", "B", "F", "Bb"]);
  const target = noteAt(root, "4P");
  const answer = target;
  const { choices, correct } = buildChoices(answer, [noteAt(root, "2M"), noteAt(root, "5P"), noteAt(root, "3M"), noteAt(root, "4A")], rng);
  return {
    type: "resolve", eyebrow: "Resolver el 7", big: nameOf(root, "7"), bigKind: "chord", ask: "Un acorde con 7 apunta a otro. ¿A cuál va?", choices, correct, answer, choiceKind: "chord",
    visual: { kind: "text", lines: [`${nameOf(root, "7")} → ?`] },
    play: { label: `▶ Oír ${nameOf(root, "7")} y ${target}`, chords: [midisOf(root, "7"), midisOf(target, "")], gap: 1.5 }, playOnAnswer: true,
    explain: `${nameOf(root, "7")} va a ${target}: la 3ª (${notesOf(root, "7")[1]}) sube medio tono y la 7ª (${notesOf(root, "7")[3]}) baja medio tono.`,
  };
}

/** ¿Qué nota suma el acorde menor para ser m7? */
export function seventhQuestion(rng) {
  const suffix = pick(["", "m"], rng);
  const root = pickRoot(rng, "7");
  const seventh = noteAt(root, "7m");
  const { choices, correct } = buildChoices(seventh, [noteAt(root, "7M"), noteAt(root, "6M"), noteAt(root, "2M"), noteAt(root, "6m")], rng);
  const to = suffix === "m" ? "m7" : "7";
  return {
    type: "seventh", eyebrow: "Sumar la 7ª", big: nameOf(root, to), bigKind: "chord", ask: "¿Qué nota se suma? (la 7ª menor)", choices, correct, answer: seventh, choiceKind: "note",
    visualAnswered: keyboardVisual(root, to),
    explain: `La 7ª menor está 10 semitonos sobre la raíz: en ${root} es ${seventh}. ${nameOf(root, to)} = ${joinNotes(notesOf(root, to))}.`,
  };
}

/** ¿Cuántos semitonos hay de la raíz a la 7ª menor? */
export function intervalQuestion(rng) {
  const root = pickRoot(rng, "7");
  const answer = String(Interval.semitones("7m"));
  const { choices, correct } = buildChoices(answer, ["9", "11", "12", "8"], rng);
  return {
    type: "interval", eyebrow: "La 7ª menor", big: `${root} → ${noteAt(root, "7m")}`, ask: "¿Cuántos semitonos hay de la raíz a la 7ª menor?", choices, correct, answer, choiceKind: "number",
    explain: `De ${root} a ${noteAt(root, "7m")} hay 10 semitonos: es la 7ª menor, la nota extra del 7 y del m7.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.18) return buildQuestion(rng, POOL);
  if (r < 0.36) return identifyQuestion(rng, POOL);
  if (r < 0.5) return differenceQuestion(rng, [["", "7"], ["m", "m7"]]);
  if (r < 0.64) return seventhQuestion(rng);
  if (r < 0.78) return resolveQuestion(rng);
  if (r < 0.9) return earQuestion(rng, POOL);
  return intervalQuestion(rng);
}
