// Lógica de «Acordes con bajo»: G/B se lee «G sobre B». Sin DOM ni audio.
import { Interval, Note } from "tonal";
import { buildChoices, joinNotes, keyRange, marksOf, midisOf, nameOf, noteAt, notesOf, pick } from "@saul-music/chord-core/theory";

const DEGREES = { "1P": "la raíz", "3M": "la 3ª", "3m": "la 3ª", "5P": "la 5ª", "7m": "la 7ª" };
const SLASH_ROOTS = ["C", "D", "E", "F", "G", "A", "Bb", "Eb"];
const slash = (root, suffix, bass) => `${nameOf(root, suffix)}/${bass}`;

/** Un acorde con bajo: el bajo es una nota del acorde (la raíz, la 3ª, la 5ª o la 7ª). */
function make(rng, suffix, degrees) {
  const root = pick(SLASH_ROOTS, rng);
  const interval = pick(degrees, rng);
  const bass = noteAt(root, interval);
  return { root, suffix, interval, bass };
}

const visualOf = ({ root, suffix, bass }) => {
  const up = midisOf(root, suffix, { bass });
  const labels = [bass, ...notesOf(root, suffix)];
  return { kind: "keyboard", ...keyRange(up), marks: up.map((m, i) => ({ midi: m, kind: i === 0 ? "source" : "answer", label: labels[i] })) };
};
const playOf = (c) => ({ label: "▶ Oír el acorde", chords: [midisOf(c.root, c.suffix, { bass: c.bass })] });

/** «¿Qué nota va en el bajo de G/B?» */
export function bassQuestion(rng) {
  const c = make(rng, pick(["", "m"], rng), ["3M", "5P"].map((x) => x));
  const interval = c.suffix === "m" ? (c.interval === "3M" ? "3m" : c.interval) : c.interval;
  const bass = noteAt(c.root, interval);
  const notes = notesOf(c.root, c.suffix);
  const { choices, correct } = buildChoices(bass, [...notes.filter((n) => n !== bass), noteAt(c.root, "2M"), noteAt(c.root, "7m")], rng);
  const name = slash(c.root, c.suffix, bass);
  return {
    type: "bass", eyebrow: "Acorde con bajo", big: name, bigKind: "chord", ask: "¿Qué nota va en el bajo (la más grave)?", choices, correct, answer: bass, choiceKind: "note",
    visualAnswered: visualOf({ ...c, interval, bass }), play: playOf({ ...c, bass }), playOnAnswer: true,
    explain: `En ${name} se lee «${nameOf(c.root, c.suffix)} sobre ${bass}»: el acorde es ${nameOf(c.root, c.suffix)} (${joinNotes(notes)}) y el bajo es ${bass}.`,
  };
}

/** ¿Qué lugar ocupa el bajo en el acorde? */
export function degreeQuestion(rng) {
  const suffix = pick(["", "m"], rng);
  const interval = pick(["3", "5", "7"], rng);
  const iv = interval === "3" ? (suffix === "m" ? "3m" : "3M") : interval === "5" ? "5P" : "7m";
  const root = pick(SLASH_ROOTS, rng);
  const bass = noteAt(root, iv);
  const answer = DEGREES[iv];
  const { choices, correct } = buildChoices(answer, ["la raíz", "la 3ª", "la 5ª", "la 7ª"].filter((x) => x !== answer), rng);
  const name = slash(root, suffix, bass);
  return {
    type: "degree", eyebrow: "El bajo en el acorde", big: name, bigKind: "chord", ask: `${bass} es la nota grave de ${nameOf(root, suffix)}. ¿Qué lugar ocupa en el acorde?`, choices, correct, answer, choiceKind: "text",
    explain: `${nameOf(root, suffix)} = ${joinNotes(notesOf(root, suffix))}${iv === "7m" ? " y la 7ª menor es " + bass : ""}. ${bass} es ${answer} del acorde.`,
  };
}

/** Notas de un acorde y su nota más grave: ¿qué acorde es? */
export function identifyQuestion(rng) {
  const c = make(rng, "", ["1P", "3M", "5P"]);
  const root = c.root;
  const bass = c.bass;
  const answer = bass === root ? root : slash(root, "", bass);
  const options = [root, slash(root, "", noteAt(root, "3M")), slash(root, "", noteAt(root, "5P")), nameOf(noteAt(root, "6M"), "m")];
  const { choices, correct } = buildChoices(answer, options, rng);
  return {
    type: "identify", eyebrow: "Mira las notas y el bajo", big: `${joinNotes(notesOf(root, ""))} · bajo ${bass}`, ask: "¿Qué acorde es?", choices, correct, answer, choiceKind: "chord",
    visual: visualOf({ ...c, suffix: "" }), play: playOf({ ...c, suffix: "" }), autoplay: true,
    explain: bass === root ? `El bajo es la raíz: es ${root} a secas.` : `Las notas son las de ${root} y la más grave es ${bass}: ${answer}.`,
  };
}

const LINE_KEYS = ["C", "G", "D", "A", "F"];

/** C, G/B, Am, ?: el bajo baja de grado en grado. */
export function lineQuestion(rng) {
  const k = pick(LINE_KEYS, rng);
  const g = noteAt(k, "5P");
  const b = noteAt(k, "7M");
  const am = noteAt(k, "6M");
  const chords = [k, `${g}/${b}`, `${am}m`];
  const answer = `${am}m/${g}`;
  const { choices, correct } = buildChoices(answer, [`${am}m`, `${am}m/${noteAt(am, "3m")}`, `${g}/${noteAt(g, "3M")}`, `${k}/${noteAt(k, "3M")}`], rng);
  return {
    type: "line", eyebrow: "El bajo camina", big: `${chords.join(" · ")} · ?`, ask: `El bajo baja de grado en grado: ${k}, ${b}, ${am}… ¿cuál sigue?`, choices, correct, answer, choiceKind: "chord",
    play: { label: "▶ Oír la línea", chords: [midisOf(k, "", {}), midisOf(g, "", { bass: b }), midisOf(am, "m", {}), midisOf(am, "m", { bass: g })], gap: 1.1 }, playOnAnswer: true,
    explain: `El bajo hace ${k}, ${b}, ${am} y ${g}: el cuarto acorde es ${answer} (el acorde de ${am}m con ${g} en el bajo).`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.28) return bassQuestion(rng);
  if (r < 0.52) return degreeQuestion(rng);
  if (r < 0.78) return identifyQuestion(rng);
  return lineQuestion(rng);
}
