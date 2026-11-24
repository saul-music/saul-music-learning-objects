// Lógica de «Cejilla en movimiento»: la forma de E y la de A, movidas por el mástil. Sin DOM ni audio.
import { buildChoices, pick } from "@saul-music/chord-core/theory";

const NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
export const nameAt = (semitone) => NAMES[((semitone % 12) + 12) % 12];

/** Las formas con cejilla: la de E (raíz en la cuerda 6) y la de A (raíz en la cuerda 5). */
export const FORMS = {
  E: { label: "E", string: 6, rootPc: 4, frets: { major: (n) => [n, n + 2, n + 2, n + 1, n, n], minor: (n) => [n, n + 2, n + 2, n, n, n] }, fingers: { major: [1, 3, 4, 2, 1, 1], minor: [1, 3, 4, 1, 1, 1] }, changing: 3 },
  A: { label: "A", string: 5, rootPc: 9, frets: { major: (n) => [-1, n, n + 2, n + 2, n + 2, n], minor: (n) => [-1, n, n + 2, n + 2, n + 1, n] }, fingers: { major: [0, 1, 2, 3, 4, 1], minor: [0, 1, 3, 4, 2, 1] }, changing: 2 },
};

/** Diagrama de una forma con cejilla en el traste `fret`. */
export const shapeOf = (form, quality, fret) => ({ f: FORMS[form].frets[quality](fret), d: FORMS[form].fingers[quality], b: [fret] });
export const rootOf = (form, fret) => nameAt(FORMS[form].rootPc + fret);
export const nameOf = (form, quality, fret) => `${rootOf(form, fret)}${quality === "minor" ? "m" : ""}`;
const FRETS = [1, 2, 3, 4, 5, 6, 7];

/** Dado el diagrama (forma y traste), ¿qué acorde es? */
export function nameQuestion(rng) {
  const form = pick(["E", "A"], rng);
  const quality = pick(["major", "minor"], rng);
  const fret = pick(FRETS, rng);
  const answer = nameOf(form, quality, fret);
  const wrong = [nameOf(form, quality, fret + 1), nameOf(form, quality, fret - 1), nameOf(form, quality === "major" ? "minor" : "major", fret), nameOf(form === "E" ? "A" : "E", quality, fret)];
  const { choices, correct } = buildChoices(answer, wrong, rng);
  return {
    type: "name", form, quality, fret, eyebrow: `Forma de ${form} · cejilla en el traste ${fret}`, big: "?", ask: "¿Qué acorde es?", choices, correct, answer, choiceKind: "chord",
    shape: shapeOf(form, quality, fret),
    explain: `La cuerda ${FORMS[form].string} en el traste ${fret} es ${rootOf(form, fret)}: la forma de ${form}${quality === "minor" ? " menor" : ""} da ${answer}.`,
  };
}

/** ¿En qué traste va la cejilla para tocar tal acorde con tal forma? */
export function fretQuestion(rng) {
  const form = pick(["E", "A"], rng);
  const quality = pick(["major", "minor"], rng);
  const fret = pick(FRETS, rng);
  const answer = String(fret);
  const { choices, correct } = buildChoices(answer, [fret + 1, fret - 1, fret + 2, fret - 2].filter((n) => n >= 1 && n <= 9).map(String), rng);
  return {
    type: "fret", form, quality, fret, eyebrow: `Con la forma de ${form}${quality === "minor" ? " menor" : ""}`, big: nameOf(form, quality, fret), bigKind: "chord", ask: "¿En qué traste va la cejilla?", choices, correct, answer, choiceKind: "number",
    explain: `En la forma de ${form}, la raíz está en la cuerda ${FORMS[form].string}. Esa cuerda suena ${rootOf(form, fret)} en el traste ${fret}: ahí va la cejilla.`,
  };
}

/** Mayor a menor con cejilla: ¿qué cuerda baja medio tono? */
export function changeQuestion(rng) {
  const form = pick(["E", "A"], rng);
  const fret = pick(FRETS, rng);
  const answer = `La cuerda ${FORMS[form].changing}`;
  const { choices, correct } = buildChoices(answer, ["La cuerda 1", "La cuerda 2", "La cuerda 3", "La cuerda 4", "La cuerda 6"].filter((x) => x !== answer), rng);
  return {
    type: "change", form, fret, eyebrow: "De mayor a menor", big: "?", ask: "La 3ª baja medio tono. ¿Qué cuerda cambia?", choices, correct, answer, choiceKind: "text",
    shape: shapeOf(form, "major", fret), shapeAnswered: shapeOf(form, "minor", fret),
    explain: `En la forma de ${form}, la 3ª está en la cuerda ${FORMS[form].changing}: baja del traste ${fret + (form === "E" ? 1 : 2)} al ${fret + (form === "E" ? 0 : 1)}.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.45) return nameQuestion(rng);
  if (r < 0.8) return fretQuestion(rng);
  return changeQuestion(rng);
}
