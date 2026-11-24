// Lógica de «Lee los compases»: cómo se lee la grilla de acordes de un tema desde el punto de vista de quien
// escucha y toca (no de quien escribe la partitura). Sin DOM ni audio. Ejercicios sintéticos.
import { buildChoices, pick, shuffle } from "@saul-music/lo-kit";
import { Note } from "tonal";

export const POOL = ["C", "G", "Am", "F", "Em", "Dm", "D", "A", "E"];
export const COLUMNS = 4; // la grilla del tema tiene 4 casillas por fila
const BEAT = 0.6;

/**
 * Un compás tal como se ve: partes con su duración en tiempos.
 * kind: «chord» (acorde que se toca), «tie» (ligado: sigue sonando el anterior), «rest» (silencio).
 * `repeat` marca la casilla que repite el compás anterior (se ve atenuada).
 */
export function makeBar(parts, { meter = 4, repeat = false } = {}) {
  const equal = parts.every((p) => !Array.isArray(p)); // sin duraciones: partes iguales
  const slots = parts.map((p) => {
    const [name, given] = Array.isArray(p) ? p : [p];
    const beats = given ?? (equal ? meter / parts.length : 1);
    return { kind: name === "_" ? "tie" : name === "." ? "rest" : "chord", chord: name === "_" || name === "." ? null : name, beats };
  });
  return { meter, repeat, slots };
}

/** Cuántos tiempos suma el compás (siempre es su clave de tiempo). */
export const barBeats = (bar) => bar.slots.reduce((n, s) => n + s.beats, 0);

/** Cuántos tiempos dura el acorde de la parte `i`: lo suyo más los ligados que le siguen. */
export function chordBeats(bar, i) {
  let total = bar.slots[i].beats;
  for (let k = i + 1; k < bar.slots.length && bar.slots[k].kind === "tie"; k++) total += bar.slots[k].beats;
  return total;
}

/** Tiempos de silencio en el compás. */
export const restBeats = (bar) => bar.slots.filter((s) => s.kind === "rest").reduce((n, s) => n + s.beats, 0);

const chordsOf = (rng, n) => shuffle(POOL, rng).slice(0, n);
const nums = (answer, extra = []) => [...new Set([1, 2, 3, 4, ...extra])].filter((n) => n !== answer).map(String);

/** MIDI de un acorde mayor o menor (para oír el compás). */
export function chordMidis(name) {
  const minor = name.endsWith("m");
  const r = Note.midi(`${minor ? name.slice(0, -1) : name}3`);
  return [r, r + (minor ? 3 : 4), r + 7, r + 12];
}

/** Cuándo (en tiempos) suena cada golpe de acorde del compás y cuánto dura. */
export function hits(bar) {
  const out = [];
  let t = 0;
  bar.slots.forEach((s, i) => {
    if (s.kind === "chord") out.push({ at: t, chord: s.chord, beats: chordBeats(bar, i) });
    t += s.beats;
  });
  return out;
}

/** Reparto: ¿cuántos tiempos dura el acorde marcado? */
export function splitQuestion(rng) {
  const [a, b, c, d] = chordsOf(rng, 4);
  const cases = [
    { bar: makeBar([a]), part: 0, why: "un acorde solo ocupa todo el compás" },
    { bar: makeBar([a, b]), part: 1, why: "dos acordes se reparten el compás en partes iguales" },
    { bar: makeBar([a, b, c, d]), part: 2, why: "cuatro acordes, uno por tiempo" },
    { bar: makeBar([[a, 2], b, c]), part: 0, why: "la casilla de {c} es el doble de ancha: dura 2 tiempos" },
    { bar: makeBar([a, [b, 3]]), part: 1, why: "la casilla de {c} ocupa tres cuartos del compás: 3 tiempos" },
    { bar: makeBar([a, b, c], { meter: 3 }), part: 1, why: "en 3/4 hay tres tiempos: tres acordes, uno por tiempo" },
  ];
  const cs = pick(cases, rng);
  const part = cs.part;
  const chord = cs.bar.slots[part].chord;
  const answer = chordBeats(cs.bar, part);
  const { choices, correct } = buildChoices(String(answer), nums(answer), rng);
  const unit = answer === 1 ? "tiempo" : "tiempos";
  return {
    type: "split", bar: cs.bar, part, chord, choices, correct, answer: String(answer),
    explain: `${chord} dura ${answer} ${unit}: ${cs.why.replace("{c}", chord)}.`,
  };
}

/** Grilla de `n` compases en filas de 4, sin símbolos raros (cada casilla un acorde). */
function gridOf(rng, n) {
  const names = chordsOf(rng, n);
  return names.map((c) => makeBar([c]));
}

/** Orden de lectura: ¿qué número de compás es el marcado? (se lee en filas, de izquierda a derecha). */
export function orderQuestion(rng) {
  const total = pick([6, 8], rng);
  const bars = gridOf(rng, total);
  const marked = pick(Array.from({ length: total - COLUMNS }, (_, i) => i + COLUMNS), rng); // en la 2ª fila
  const row = Math.floor(marked / COLUMNS);
  const col = marked % COLUMNS;
  const rows = Math.ceil(total / COLUMNS);
  const answer = marked + 1;
  const byColumns = col * rows + row + 1; // error típico: leer hacia abajo
  const { choices, correct } = buildChoices(String(answer), [String(byColumns), String(answer - 1), String(answer + 1), String(col + 1), String(row + 1)], rng);
  return {
    type: "order", bars, marked, choices, correct, answer: String(answer),
    explain: `Se lee por filas, de izquierda a derecha, y al terminar una fila se sigue con la de abajo: la primera fila trae 4 compases, así que esta casilla es el compás ${answer}.`,
  };
}

/** Qué viene después: al terminar la primera fila, ¿qué acorde suena? */
export function nextQuestion(rng) {
  const total = pick([6, 8], rng);
  const bars = gridOf(rng, total);
  const answer = bars[COLUMNS].slots[0].chord;
  const { choices, correct } = buildChoices(answer, [...bars.map((b) => b.slots[0].chord), ...POOL].filter((c) => c !== answer), rng);
  return {
    type: "next", bars, marked: COLUMNS - 1, choices, correct, answer,
    explain: `Tras el último compás de la fila sigue el primero de la fila de abajo: ${answer}.`,
  };
}

export const MEANINGS = {
  tie: "Sigue sonando el acorde anterior, sin volver a tocarlo",
  repeat: "Repite el compás anterior",
  rest: "Silencio: no suena nada",
  change: "Cambia a otro acorde",
};

/** Símbolos que ve quien lee: arco (ligado), acorde en gris (repite) e ícono de silencio. */
export function symbolQuestion(rng) {
  const [a, b] = chordsOf(rng, 2);
  const kind = pick(["tie", "repeat", "rest", "change"], rng);
  const before = makeBar([a]);
  const marked = kind === "tie" ? makeBar(["_"]) : kind === "repeat" ? makeBar([a], { repeat: true }) : kind === "rest" ? makeBar(["."]) : makeBar([b]);
  const answer = MEANINGS[kind];
  const { choices, correct } = buildChoices(answer, Object.values(MEANINGS), rng);
  const why = {
    tie: `El arco marca un ligado: ${a} sigue sonando, se ve atenuado y no se vuelve a tocar.`,
    repeat: `Un acorde en gris es la casilla que repite el compás anterior: vuelve a sonar ${a}.`,
    rest: "El ícono de silencio dice que ese tiempo no suena nada.",
    change: `Es un acorde nuevo, ${b}, que se toca al empezar el compás.`,
  }[kind];
  return { type: "symbol", kind, bars: [before, marked], marked: 1, choices, correct, answer, explain: why };
}

/** Sección repetida: «× 2» junto al título → ¿cuántos compases suenan en total? */
export function sectionQuestion(rng) {
  const n = pick([2, 3, 4], rng);
  const bars = chordsOf(rng, n).map((c) => makeBar([c]));
  const title = pick(["Estrofa", "Coro", "Puente", "Intro"], rng);
  const answer = n * 2;
  const { choices, correct } = buildChoices(String(answer), [String(n), String(answer + 2), String(answer - 1), String(n * 3)], rng);
  return {
    type: "section", title, times: 2, bars, choices, correct, answer: String(answer),
    explain: `La sección tiene ${n} compases y el × 2 junto al título la toca dos veces: ${n} × 2 = ${answer} compases.`,
  };
}

/** Clave de tiempo: el 4/4 o el 3/4 de la esquina dicen cuántos tiempos tiene cada compás. */
export function meterQuestion(rng) {
  const meter = pick([3, 4], rng);
  const [a, b, c] = chordsOf(rng, 3);
  const bar = meter === 3 ? makeBar([a, b, c], { meter }) : makeBar([a, b], { meter });
  const answer = String(meter);
  const { choices, correct } = buildChoices(answer, ["2", "3", "4", "6"], rng);
  return {
    type: "meter", bar, choices, correct, answer,
    explain: `La clave ${meter}/4 de la esquina dice que cada compás tiene ${meter} tiempos: ${meter === 3 ? "tres" : "cuatro"} negras al contar.`,
  };
}

const EAR_PATTERNS = [
  { id: "whole", label: "un acorde por compás", make: ([a]) => makeBar([a]) },
  { id: "half", label: "dos acordes", make: ([a, b]) => makeBar([a, b]) },
  { id: "quarters", label: "cuatro acordes", make: ([a, b, c, d]) => makeBar([a, b, c, d]) },
  { id: "rest", label: "un acorde y silencio", make: ([a]) => makeBar([a, "."]) },
  { id: "ring", label: "un acorde largo y uno corto", make: ([a, b]) => makeBar([[a, 3], b]) },
];

/** De oído: suena un compás con el clic y hay que elegir la casilla que lo dibuja. */
export function earQuestion(rng) {
  const chosen = shuffle(EAR_PATTERNS, rng).slice(0, 3);
  const chords = chordsOf(rng, 4);
  const bars = chosen.map((p) => p.make(chords));
  const correct = Math.floor(rng() * 3);
  return {
    type: "ear", bars, choices: bars.map((_, i) => `Casilla ${i + 1}`), correct, answer: `Casilla ${correct + 1}`,
    explain: `Sonaba ${chosen[correct].label}: así se dibuja ese compás.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.2) return splitQuestion(rng);
  if (r < 0.34) return orderQuestion(rng);
  if (r < 0.44) return nextQuestion(rng);
  if (r < 0.66) return symbolQuestion(rng);
  if (r < 0.78) return sectionQuestion(rng);
  if (r < 0.88) return meterQuestion(rng);
  return earQuestion(rng);
}
