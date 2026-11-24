// Lógica de «Lee la partitura»: cómo se leen las líneas de acordes de Acordia (compás, `-`, `%`, `_`, `.`, `x2`).
// Ejercicios sintéticos (sin canciones). Sin DOM ni audio.
import { buildChoices, pick, shuffle } from "@saul-music/lo-kit";

export const POOL = ["C", "G", "Am", "F", "Em", "Dm", "D", "A", "E", "Bm", "B", "Gm"];

/** Meanings of the symbols, en el orden en que se presentan. */
export const MEANINGS = {
  "%": "Repite el compás anterior",
  _: "El acorde sigue sonando, sin volver a tocarlo",
  ".": "Silencio",
  "-": "Parte el compás en partes iguales",
};

/** Un compás como texto («C-%-G-Am») → partes con su tipo y su duración en tiempos. */
export function parseBar(text, beats = 4) {
  const raw = text.split("-");
  const per = beats / raw.length;
  const parts = raw.map((r) => ({ text: r, kind: r === "%" ? "extend" : r === "_" ? "tie" : r === "." ? "rest" : "chord", beats: per }));
  return { text, parts, per };
}

/** Cuántos tiempos dura el acorde de la parte `i` (suma los «%» y «_» que le siguen). */
export function chordBeats(bar, i) {
  let total = bar.parts[i].beats;
  for (let k = i + 1; k < bar.parts.length && ["extend", "tie"].includes(bar.parts[k].kind); k++) total += bar.parts[k].beats;
  return total;
}

/** Cuántos tiempos del compás son silencio. */
export const restBeats = (bar) => bar.parts.filter((p) => p.kind === "rest").reduce((n, p) => n + p.beats, 0);

const chordsOf = (rng, n) => shuffle(POOL, rng).slice(0, n);

export function describe(q) {
  return q.explain;
}

/** «Estrofa: C % G Am» → ¿qué acorde suena en el compás 2? (el `%` repite el anterior). */
export function whichQuestion(rng) {
  const [a, b, c] = chordsOf(rng, 3);
  const templates = [
    { bars: [a, "%", b, c], ask: 1, from: 0 },
    { bars: [a, b, "%", c], ask: 2, from: 1 },
    { bars: [a, "%", b, "%"], ask: 3, from: 2 },
    { bars: [a, b, c, "%"], ask: 3, from: 2 },
  ];
  const t = pick(templates, rng);
  const answer = t.bars[t.from];
  const others = POOL.filter((x) => !t.bars.includes(x));
  const { choices, correct } = buildChoices(answer, [...new Set(t.bars.filter((x) => x !== "%" && x !== answer)), pick(others, rng)], rng);
  return {
    type: "which", beats: 4, bars: t.bars, ask: t.ask, choices, correct, answer,
    explain: `El % repite el compás anterior: en el compás ${t.ask + 1} suena ${answer}, igual que en el compás ${t.ask}.`,
  };
}

/** Compás partido: ¿cuántos tiempos dura un acorde? */
export function beatsQuestion(rng) {
  const [a, b, c, d] = chordsOf(rng, 4);
  const cases = [
    { beats: 4, text: `${a}-${b}`, part: 0, note: "dos partes iguales de 2 tiempos" },
    { beats: 4, text: `${a}-${b}-${c}-${d}`, part: 1, note: "cuatro partes de 1 tiempo" },
    { beats: 4, text: `${a}-%-${b}-${c}`, part: 0, note: "el % dentro del compás alarga el acorde anterior (1 + 1)" },
    { beats: 4, text: `${a}-${b}-%-%`, part: 1, note: "cada % alarga el acorde anterior: 1 + 1 + 1" },
    { beats: 4, text: `${a}-_-${b}-${c}`, part: 0, note: "el _ liga: el acorde sigue sonando sin tocarlo de nuevo (1 + 1)" },
    { beats: 3, text: `${a}-${b}-${c}`, part: 2, note: "tres partes de 1 tiempo" },
    { beats: 3, text: `${a}-%-${b}`, part: 0, note: "el % alarga el acorde anterior (1 + 1)" },
  ];
  const cs = pick(cases, rng);
  const bar = parseBar(cs.text, cs.beats);
  const answer = chordBeats(bar, cs.part);
  const chord = bar.parts[cs.part].text;
  const nums = [1, 2, 3, 4].filter((n) => n !== answer);
  const { choices, correct } = buildChoices(String(answer), nums.map(String), rng);
  return {
    type: "beats", beats: cs.beats, bars: [cs.text], focus: cs.part, chord, choices, correct, answer: String(answer),
    explain: `En ${cs.beats}/4, ${chord} dura ${answer} ${answer === 1 ? "tiempo" : "tiempos"}: ${cs.note}.`,
  };
}

/** Compás con silencio: ¿cuántos tiempos suenan? */
export function soundQuestion(rng) {
  const [a, b] = chordsOf(rng, 2);
  const cases = [
    { beats: 4, text: `${a}-.`, rest: 2 },
    { beats: 4, text: `.-${a}`, rest: 2 },
    { beats: 4, text: `${a}-.-.-.`, rest: 3 },
    { beats: 4, text: `${a}-${b}-.-.`, rest: 2 },
    { beats: 3, text: `${a}-.-.`, rest: 2 },
  ];
  const cs = pick(cases, rng);
  const sounding = cs.beats - cs.rest;
  const nums = [1, 2, 3, 4].filter((n) => n !== sounding);
  const { choices, correct } = buildChoices(String(sounding), nums.map(String), rng);
  return {
    type: "sound", beats: cs.beats, bars: [cs.text], choices, correct, answer: String(sounding),
    explain: `El . es silencio. De los ${cs.beats} tiempos, ${cs.rest} son silencio y suenan ${sounding}.`,
  };
}

/** «Coro x2: …» → ¿cuántos compases se tocan en total? */
export function totalQuestion(rng) {
  const n = pick([2, 4], rng);
  const cs = chordsOf(rng, n);
  const bars = n === 4 ? [cs[0], "%", cs[1], cs[2]] : [cs[0], cs[1]];
  const answer = bars.length * 2;
  const { choices, correct } = buildChoices(String(answer), [String(bars.length), String(answer + 2), String(answer * 2), String(answer - 1)], rng);
  return {
    type: "total", beats: 4, bars, choices, correct, answer: String(answer),
    explain: `La sección tiene ${bars.length} compases (el % también cuenta) y x2 la toca dos veces: ${answer} compases.`,
  };
}

/** ¿Qué significa este símbolo? */
export function meaningQuestion(rng) {
  const symbol = pick(Object.keys(MEANINGS), rng);
  const answer = MEANINGS[symbol];
  const { choices, correct } = buildChoices(answer, Object.values(MEANINGS), rng);
  return { type: "meaning", beats: 4, symbol, choices, correct, answer, explain: `${symbol} → ${answer}.` };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.28) return whichQuestion(rng);
  if (r < 0.58) return beatsQuestion(rng);
  if (r < 0.7) return soundQuestion(rng);
  if (r < 0.82) return totalQuestion(rng);
  return meaningQuestion(rng);
}
