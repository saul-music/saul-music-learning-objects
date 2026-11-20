// Lógica de «Pulso»: figuras del rasgueo (redonda, blancas, negras, blanca con punto) y la regla
// con que la guitarra de Acordia rasguea cada compás. Sin DOM ni audio.
import { buildChoices, pick } from "@saul-music/lo-kit";

export const METERS = { "4/4": 4, "3/4": 3 };

/** Figuras: cuántos tiempos dura cada golpe y en qué tiempos cae dentro del compás. */
export const FIGURES = {
  redonda: { name: "Redonda", plural: "Redonda", beats: 4, meters: ["4/4"] },
  blanca: { name: "Blanca", plural: "Blancas", beats: 2, meters: ["4/4"] },
  "blanca-punto": { name: "Blanca con punto", plural: "Blanca con punto", beats: 3, meters: ["3/4"] },
  negra: { name: "Negra", plural: "Negras", beats: 1, meters: ["4/4", "3/4"] },
};

/** Tiempos (desde 0) en que suena un golpe, para una figura en un compás. */
export function strumBeats(meter, figure) {
  const n = METERS[meter];
  const step = FIGURES[figure].beats;
  return Array.from({ length: n / step }, (_, i) => i * step);
}

export const figuresFor = (meter) => Object.keys(FIGURES).filter((k) => FIGURES[k].meters.includes(meter));

/**
 * La regla del rasgueo de Acordia (la del laboratorio MIDI):
 * un acorde en el compás → un golpe al inicio (redonda en 4/4, blanca con punto en 3/4);
 * dos acordes de medio compás (4/4) → un golpe al empezar cada uno (blancas);
 * cualquier otro reparto → un golpe por tiempo (negras).
 */
export function strumRule(meter, chordsInBar) {
  if (chordsInBar === 1) return meter === "3/4" ? "blanca-punto" : "redonda";
  if (chordsInBar === 2 && meter === "4/4") return "blanca";
  return "negra";
}

const BARS = {
  1: ["C", "Am", "G", "Dm", "F", "E7"],
  2: ["C-G", "Am-F", "Dm-G7", "F-C", "Em-Am"],
  3: ["C-G-Am", "F-G-C", "Am-Dm-E7"],
  4: ["C-G-Am-F", "Dm-G-C-Am", "F-G-Em-Am"],
};

/** Escuchas un rasgueo con metrónomo: «¿Qué figura toca la guitarra?». */
export function listenQuestion(rng) {
  const meter = rng() < 0.7 ? "4/4" : "3/4";
  const figure = pick(figuresFor(meter), rng);
  const answer = FIGURES[figure].plural;
  const pool = Object.values(FIGURES).map((f) => f.plural);
  const { choices, correct } = buildChoices(answer, pool, rng, 4);
  const beats = strumBeats(meter, figure);
  const explain = `Era ${answer.toLowerCase()}: ${beats.length} ${beats.length === 1 ? "golpe" : "golpes"} por compás de ${meter}, cada uno de ${FIGURES[figure].beats} ${FIGURES[figure].beats === 1 ? "tiempo" : "tiempos"}.`;
  return { type: "listen", meter, figure, beats, answer, choices, correct, explain };
}

/** Ves un compás con sus acordes: «¿Cómo lo rasguea la guitarra?» (la regla). */
export function ruleQuestion(rng) {
  const meter = rng() < 0.75 ? "4/4" : "3/4";
  const counts = meter === "4/4" ? [1, 2, 3, 4] : [1, 3];
  const n = pick(counts, rng);
  const bar = pick(BARS[n], rng);
  const figure = strumRule(meter, n);
  const answer = FIGURES[figure].plural;
  const pool = meter === "4/4" ? ["Redonda", "Blancas", "Negras"] : ["Blanca con punto", "Negras", "Blancas"];
  const { choices, correct } = buildChoices(answer, pool, rng, 3);
  const why = n === 1
    ? "un solo acorde en el compás: un golpe al inicio, que dura todo el compás"
    : n === 2 && meter === "4/4"
      ? "dos acordes de medio compás: un golpe al empezar cada uno"
      : `${n} acordes en el compás: un golpe por tiempo`;
  return { type: "rule", meter, bar, chords: n, figure, beats: strumBeats(meter, figure), answer, choices, correct, explain: `En ${answer.toLowerCase()}: ${why}.` };
}

const COUNTS = [
  { ask: "¿Cuántos tiempos dura una redonda?", answer: 4, explain: "La redonda dura 4 tiempos: un compás entero de 4/4." },
  { ask: "¿Cuántos tiempos dura una blanca?", answer: 2, explain: "La blanca dura 2 tiempos: media redonda." },
  { ask: "¿Cuántos tiempos dura una negra?", answer: 1, explain: "La negra dura 1 tiempo: es el pulso." },
  { ask: "¿Cuántos tiempos dura una blanca con punto?", answer: 3, explain: "El punto suma la mitad: 2 + 1 = 3 tiempos, un compás entero de 3/4." },
  { ask: "¿Cuántas negras caben en un compás de 3/4?", answer: 3, explain: "3/4 tiene 3 tiempos y la negra dura 1: caben 3." },
  { ask: "¿Cuántas blancas caben en un compás de 4/4?", answer: 2, explain: "4/4 tiene 4 tiempos y la blanca dura 2: caben 2." },
  { ask: "¿Cuántas negras caben en un compás de 4/4?", answer: 4, explain: "4/4 tiene 4 tiempos y la negra dura 1: caben 4." },
];

/** Contar tiempos: duración de las figuras y cuántas caben en un compás. */
export function countQuestion(rng) {
  const c = pick(COUNTS, rng);
  const answer = String(c.answer);
  const { choices, correct } = buildChoices(answer, ["1", "2", "3", "4", "6"], rng);
  return { type: "count", ask: c.ask, answer, choices, correct, explain: c.explain };
}

/** Una pregunta al azar (escuchar pesa más: es el corazón del juego). */
export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.45) return listenQuestion(rng);
  if (r < 0.8) return ruleQuestion(rng);
  return countQuestion(rng);
}
