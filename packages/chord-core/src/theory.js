// Teoría compartida de la ruta Intermedio: de un acorde («C» + «maj7») salen sus notas bien escritas, su sonido y sus
// alternativas de respuesta. Sin DOM ni audio. Sufijos como los escribe Acordia.
import { buildChoices, pick, shuffle } from "@saul-music/lo-kit";
import { Interval, Note } from "tonal";

/** Cada sufijo: nombre en español, intervalos y la «receta» en palabras. */
export const QUALITIES = {
  "": { name: "mayor", iv: ["1P", "3M", "5P"], recipe: "1ª, 3ª mayor y 5ª" },
  m: { name: "menor", iv: ["1P", "3m", "5P"], recipe: "1ª, 3ª menor y 5ª" },
  7: { name: "con 7ª menor", iv: ["1P", "3M", "5P", "7m"], recipe: "mayor + 7ª menor" },
  m7: { name: "menor con 7ª menor", iv: ["1P", "3m", "5P", "7m"], recipe: "menor + 7ª menor" },
  maj7: { name: "con 7ª mayor", iv: ["1P", "3M", "5P", "7M"], recipe: "mayor + 7ª mayor" },
  6: { name: "de 6", iv: ["1P", "3M", "5P", "6M"], recipe: "mayor + 6ª" },
  m6: { name: "menor de 6", iv: ["1P", "3m", "5P", "6M"], recipe: "menor + 6ª mayor" },
  dim7: { name: "disminuido con 7ª", iv: ["1P", "3m", "5d", "7d"], recipe: "3ª menor, 5ª bemol y 7ª doble bemol" },
  m7b5: { name: "semidisminuido", iv: ["1P", "3m", "5d", "7m"], recipe: "m7 con la 5ª bajada medio tono" },
  aug: { name: "aumentado", iv: ["1P", "3M", "5A"], recipe: "mayor con la 5ª subida medio tono" },
  mmaj7: { name: "menor con 7ª mayor", iv: ["1P", "3m", "5P", "7M"], recipe: "menor + 7ª mayor" },
  sus2: { name: "sus2", iv: ["1P", "2M", "5P"], recipe: "la 2ª en lugar de la 3ª" },
  sus4: { name: "sus4", iv: ["1P", "4P", "5P"], recipe: "la 4ª en lugar de la 3ª" },
  add9: { name: "add9", iv: ["1P", "3M", "5P", "9M"], recipe: "mayor + 9ª, sin 7ª" },
  madd9: { name: "menor con 9ª", iv: ["1P", "3m", "5P", "9M"], recipe: "menor + 9ª, sin 7ª" },
  "7sus4": { name: "7sus4", iv: ["1P", "4P", "5P", "7m"], recipe: "sus4 + 7ª menor" },
  9: { name: "novena", iv: ["1P", "3M", "5P", "7m", "9M"], recipe: "7 + 9ª" },
  m9: { name: "menor novena", iv: ["1P", "3m", "5P", "7m", "9M"], recipe: "m7 + 9ª" },
  maj9: { name: "maj9", iv: ["1P", "3M", "5P", "7M", "9M"], recipe: "maj7 + 9ª" },
  "6/9": { name: "6/9", iv: ["1P", "3M", "5P", "6M", "9M"], recipe: "6 + 9ª, sin 7ª" },
  "7(b9)": { name: "7 con b9", iv: ["1P", "3M", "5P", "7m", "9m"], recipe: "7 + 9ª bemol" },
  "7(#9)": { name: "7 con #9", iv: ["1P", "3M", "5P", "7m", "9A"], recipe: "7 + 9ª sostenida" },
  "7(b13)": { name: "7 con b13", iv: ["1P", "3M", "5P", "7m", "13m"], recipe: "7 + 13ª bemol" },
  13: { name: "13", iv: ["1P", "3M", "5P", "7m", "13M"], recipe: "7 + 13ª (la 9ª suele omitirse)" },
  madd11: { name: "menor con 11ª", iv: ["1P", "3m", "5P", "11P"], recipe: "menor + 11ª, sin 7ª" },
  "maj7#11": { name: "maj7 con #11", iv: ["1P", "3M", "5P", "7M", "11A"], recipe: "maj7 + 11ª sostenida" },
  m11: { name: "menor 11", iv: ["1P", "3m", "5P", "7m", "9M", "11P"], recipe: "m9 + 11ª" },
};

export const ROOT_POOL = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab", "F#", "C#"];

/** Notas del acorde, escritas por grados (sin dobles alteraciones salvo que el sufijo lo pida). */
export const notesOf = (root, suffix) => QUALITIES[suffix].iv.map((i) => Note.transpose(root, i));
export const noteAt = (root, interval) => Note.transpose(root, interval);
const clean = (notes) => notes.every((n) => !/bb|##|^(Cb|Fb|E#|B#)$/.test(n));

/** Raíces donde el acorde se escribe sin dobles alteraciones. */
export const safeRoots = (suffix, pool = ROOT_POOL) => pool.filter((r) => clean(notesOf(r, suffix)));
export const pickRoot = (rng, suffix, pool = ROOT_POOL) => pick(safeRoots(suffix, pool), rng);

export const nameOf = (root, suffix) => `${root}${suffix}`;
export const joinNotes = (notes) => notes.join(" – ");

/** MIDI para oír el acorde: raíz en la octava 3, cada nota por encima; `bass` agrega una nota grave debajo. */
export function midisOf(root, suffix, { bass } = {}) {
  const r = Note.midi(`${root}3`);
  const up = QUALITIES[suffix].iv.map((i) => r + Interval.semitones(i));
  return bass ? [Note.midi(`${bass}2`), ...up] : up;
}

/** Rango de teclado (teclas blancas) que contiene esas notas. */
export function keyRange(midis, pad = 1) {
  const white = (m) => [0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12);
  let from = Math.min(...midis) - pad;
  let to = Math.max(...midis) + pad;
  while (!white(from)) from -= 1;
  while (!white(to)) to += 1;
  return { from, to };
}

/** Marcas de teclado: la primera nota «source» (la raíz) y las demás «answer». */
export const marksOf = (midis, labels) => midis.map((m, i) => ({ midi: m, kind: i === 0 ? "source" : "answer", label: labels[i] }));

/** Alternativas con el mismo `root` y otros sufijos; la respuesta es `answerSuffix`. */
export function chordChoices(rng, root, answerSuffix, pool, n = 4) {
  const others = pool.filter((s) => s !== answerSuffix);
  const { choices, correct } = buildChoices(nameOf(root, answerSuffix), others.map((s) => nameOf(root, s)), rng, n);
  return { choices, correct };
}

/** Alternativas de notas: la lista correcta frente a las de otros acordes con la misma raíz. */
export function notesChoices(rng, root, answerSuffix, pool, n = 4) {
  const others = pool.filter((s) => s !== answerSuffix).map((s) => joinNotes(notesOf(root, s)));
  const answer = joinNotes(notesOf(root, answerSuffix));
  return { ...buildChoices(answer, others.filter((x) => x !== answer), rng, n), answer };
}

const keyboardVisual = (root, suffix) => {
  const midis = midisOf(root, suffix);
  return { kind: "keyboard", ...keyRange(midis), marks: marksOf(midis, notesOf(root, suffix)) };
};
export { keyboardVisual };

const spanish = (n) => (n === 1 ? "1 tiempo" : `${n} tiempos`);
export { spanish };

/** «¿Qué notas forman X?» La respuesta es la lista de notas; el teclado aparece al responder. */
export function buildQuestion(rng, pool, suffixes = pool) {
  const suffix = pick(suffixes, rng);
  const root = pickRoot(rng, suffix);
  const { choices, correct, answer } = notesChoices(rng, root, suffix, pool);
  const q = QUALITIES[suffix];
  return {
    type: "build", eyebrow: `Acorde ${q.name}`, big: nameOf(root, suffix), bigKind: "chord",
    ask: "¿Qué notas lo forman?", choices, correct, answer, choiceKind: "text",
    visualAnswered: keyboardVisual(root, suffix), visual: { kind: "text", lines: [`Receta: ${q.recipe}`] },
    play: { label: "▶ Oír el acorde", chords: [midisOf(root, suffix)] }, playOnAnswer: true,
    explain: `${nameOf(root, suffix)} es ${q.recipe}: ${joinNotes(notesOf(root, suffix))}.`,
  };
}

/** «Mira las notas: ¿qué acorde es?» (con teclado y sonido). */
export function identifyQuestion(rng, pool, suffixes = pool) {
  const suffix = pick(suffixes, rng);
  const root = pickRoot(rng, suffix);
  const { choices, correct } = chordChoices(rng, root, suffix, pool);
  return {
    type: "identify", eyebrow: "Mira las notas", big: joinNotes(notesOf(root, suffix)), ask: "¿Qué acorde es?", choices, correct, answer: nameOf(root, suffix), choiceKind: "chord",
    visual: keyboardVisual(root, suffix), play: { label: "▶ Oír el acorde", chords: [midisOf(root, suffix)] }, autoplay: true,
    explain: `${joinNotes(notesOf(root, suffix))} es ${nameOf(root, suffix)}: ${QUALITIES[suffix].recipe}.`,
  };
}

/** De oído: suena un acorde de la raíz dada y hay que decir cuál es. */
export function earQuestion(rng, pool, suffixes = pool) {
  const suffix = pick(suffixes, rng);
  const root = pickRoot(rng, suffix, ["C", "D", "E", "G", "A", "F"]);
  const { choices, correct } = chordChoices(rng, root, suffix, pool, 3);
  return {
    type: "ear", eyebrow: "De oído", big: "♪", ask: `Escucha el acorde. ¿Cuál de estos es?`, choices, correct, answer: nameOf(root, suffix), choiceKind: "chord",
    visualAnswered: keyboardVisual(root, suffix), play: { label: "▶ Oír el acorde", chords: [midisOf(root, suffix)] }, autoplay: true,
    explain: `Sonaba ${nameOf(root, suffix)}: ${joinNotes(notesOf(root, suffix))}.`,
  };
}

/** «¿Qué nota tiene B que no tiene A?» para pares de acordes que se diferencian en una nota. */
export function differenceQuestion(rng, pairs) {
  const [a, b] = pick(pairs, rng);
  const root = pickRoot(rng, b, safeRoots(a));
  const na = notesOf(root, a);
  const nb = notesOf(root, b);
  const added = nb.filter((n) => !na.includes(n));
  const answer = added[0];
  const wrong = [Note.transpose(answer, "2m"), Note.transpose(answer, "-2m"), Note.transpose(answer, "2M"), Note.transpose(answer, "-2M"), ...na.filter((n) => !nb.includes(n))];
  const { choices, correct } = buildChoices(answer, wrong.filter((n) => !nb.includes(n) || n === answer), rng);
  return {
    type: "difference", eyebrow: "Qué cambia entre dos acordes", big: "?", ask: `¿Qué nota tiene ${nameOf(root, b)} que no tiene ${nameOf(root, a)}?`, choices, correct, answer, choiceKind: "note",
    visual: { kind: "text", lines: [`${nameOf(root, a)} = ${joinNotes(na)}`] },
    visualAnswered: { kind: "text", lines: [`${nameOf(root, a)} = ${joinNotes(na)}`, `${nameOf(root, b)} = ${joinNotes(nb)}`] },
    play: { label: `▶ Oír ${nameOf(root, a)} y ${nameOf(root, b)}`, chords: [midisOf(root, a), midisOf(root, b)], gap: 1.5 }, playOnAnswer: true,
    explain: `${nameOf(root, b)} suma ${answer}: ${QUALITIES[b].recipe}.`,
  };
}

export { buildChoices, pick, shuffle };
