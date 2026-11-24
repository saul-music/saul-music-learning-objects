// Lógica de «La tonalidad»: los siete acordes de una escala mayor. Sin DOM ni audio.
import { Key, Note } from "tonal";
import { buildChoices, pick, shuffle } from "@saul-music/chord-core/theory";

export const KEYS = ["C", "G", "D", "A", "E", "F", "Bb"];
const KIND = { 0: "mayor", 1: "menor", 2: "menor", 3: "mayor", 4: "mayor", 5: "menor", 6: "disminuido" };
const triadsOf = (key) => Key.majorKey(key).triads;
const sevenths = (key) => Key.majorKey(key).chords;
export const kindOf = (degree) => KIND[degree - 1];
export const triadAt = (key, degree) => triadsOf(key)[degree - 1];
export const seventhAt = (key, degree) => sevenths(key)[degree - 1];

/** En tal tonalidad, ¿qué acorde es el grado N? */
export function degreeQuestion(rng) {
  const key = pick(KEYS, rng);
  const degree = pick([1, 2, 3, 4, 5, 6], rng);
  const answer = triadAt(key, degree);
  const wrong = triadsOf(key).filter((_, i) => i !== degree - 1).slice(0, 6);
  const { choices, correct } = buildChoices(answer, wrong, rng);
  return {
    type: "degree", eyebrow: `Tonalidad de ${key} mayor`, big: `${degree}`, ask: `En ${key} mayor, ¿qué acorde es el grado ${degree}?`, choices, correct, answer, choiceKind: "chord",
    explain: `Si numeras la escala de ${key} mayor, el grado ${degree} es ${answer}. Los acordes de la tonalidad son ${triadsOf(key).join(", ")}.`,
  };
}

/** Un acorde de la tonalidad: ¿qué grado es? */
export function gradeQuestion(rng) {
  const key = pick(KEYS, rng);
  const degree = pick([1, 2, 3, 4, 5, 6], rng);
  const chord = triadAt(key, degree);
  const answer = String(degree);
  const { choices, correct } = buildChoices(answer, [1, 2, 3, 4, 5, 6, 7].map(String), rng);
  return {
    type: "grade", eyebrow: `Tonalidad de ${key} mayor`, big: chord, bigKind: "chord", ask: `En ${key} mayor, ¿qué grado es ${chord}?`, choices, correct, answer, choiceKind: "number",
    explain: `${chord} es el grado ${degree} de ${key} mayor: ${triadsOf(key).join(" · ")}.`,
  };
}

/** ¿Cuál de estos acordes no es de la tonalidad? */
export function outsiderQuestion(rng) {
  const key = pick(KEYS, rng);
  const inKey = shuffle(triadsOf(key).slice(0, 6), rng).slice(0, 3);
  const roots = new Set(Key.majorKey(key).scale.map((n) => Note.chroma(n)));
  const outPool = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].filter((n) => !roots.has(Note.chroma(n)));
  const out = pick(outPool, rng);
  const { choices, correct } = buildChoices(out, inKey, rng);
  return {
    type: "outsider", eyebrow: `Tonalidad de ${key} mayor`, big: "?", ask: `Tres de estos acordes son de ${key} mayor. ¿Cuál no lo es?`, choices, correct, answer: out, choiceKind: "chord",
    visual: { kind: "text", lines: [`Escala de ${key}: ${Key.majorKey(key).scale.join(" ")}`] },
    explain: `${out} no es una nota de la escala de ${key} mayor (${Key.majorKey(key).scale.join(" ")}): es un acorde prestado de otra tonalidad.`,
  };
}

/** El relativo menor es el acorde del grado 6. */
export function relativeQuestion(rng) {
  const key = pick(KEYS, rng);
  const answer = triadAt(key, 6);
  const wrong = [triadAt(key, 2), triadAt(key, 3), `${key}m`, `${triadAt(key, 5)}m`];
  const { choices, correct } = buildChoices(answer, wrong, rng);
  return {
    type: "relative", eyebrow: "Relativo menor", big: key, bigKind: "chord", ask: `¿Cuál es el relativo menor de ${key} mayor?`, choices, correct, answer, choiceKind: "chord",
    explain: `El relativo menor de ${key} es ${answer}: el acorde del grado 6, con los mismos acordes de la tonalidad.`,
  };
}

/** Con séptima, el grado N de la tonalidad. */
export function seventhQuestion(rng) {
  const key = pick(KEYS, rng);
  const degree = pick([1, 2, 5, 6], rng);
  const answer = seventhAt(key, degree);
  const wrong = [triadAt(key, degree), ...sevenths(key).filter((_, i) => i !== degree - 1)];
  const { choices, correct } = buildChoices(answer, wrong, rng);
  return {
    type: "seventh", eyebrow: `Tonalidad de ${key} mayor`, big: `${degree}`, ask: `En ${key} mayor, ¿qué acorde es el grado ${degree} con séptima?`, choices, correct, answer, choiceKind: "chord",
    explain: `Con séptima, el grado ${degree} de ${key} mayor es ${answer}. El 1 y el 4 llevan maj7, el 2, 3 y 6 llevan m7 y el 5 lleva 7.`,
  };
}

/** ¿Es mayor, menor o disminuido el acorde del grado N? */
export function kindQuestion(rng) {
  const degree = pick([1, 2, 3, 4, 5, 6, 7], rng);
  const answer = kindOf(degree);
  const { choices, correct } = buildChoices(answer, ["mayor", "menor", "disminuido"], rng, 3);
  return {
    type: "kind", eyebrow: "Tipo de acorde", big: `${degree}`, ask: `En cualquier tonalidad mayor, ¿qué tipo de acorde es el grado ${degree}?`, choices, correct, answer, choiceKind: "text",
    explain: "En toda tonalidad mayor el orden es el mismo: 1 mayor, 2 menor, 3 menor, 4 mayor, 5 mayor, 6 menor y 7 disminuido.",
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.2) return degreeQuestion(rng);
  if (r < 0.38) return gradeQuestion(rng);
  if (r < 0.56) return outsiderQuestion(rng);
  if (r < 0.7) return relativeQuestion(rng);
  if (r < 0.85) return seventhQuestion(rng);
  return kindQuestion(rng);
}
