// OA «Manos de acorde»: formas de guitarra de acordes mayores, menores y de séptima.
import { chordLabel, el, mountChoiceQuiz, svg } from "@saul-music/lo-kit";
import { makeQuestion, shapeMidis, shapesOf, stringNumber, TUNING } from "./theory.js";

export * from "./theory.js";

const X0 = 26; // primera cuerda (6ª) en x
const GAP = 18; // separación entre cuerdas
const Y0 = 40; // cejuela
const FRET_H = 24;
const ROWS = 5;

/**
 * Diagrama de acorde vertical: cuerdas de la 6ª (izquierda) a la 1ª, trastes hacia abajo.
 * @param {{f: number[], d: number[], b: number[]}} shape
 * @param {{mark?: number, label?: string}} [o]  mark: índice de cuerda a destacar (0 = 6ª)
 */
export function drawChordBox(shape, { mark = -1, label } = {}) {
  const played = shape.f.filter((f) => f > 0);
  const max = Math.max(0, ...played);
  const base = max > ROWS ? Math.min(...played) : 1; // traste de la primera fila
  const root = svg("svg", { viewBox: `0 0 ${X0 * 2 + GAP * 5} ${Y0 + FRET_H * ROWS + 20}`, class: "lo-cs__box", role: "img", "aria-label": label ?? "Diagrama de acorde" });
  const xOf = (i) => X0 + i * GAP;
  const yOf = (fret) => Y0 + (fret - base + 0.5) * FRET_H;

  for (let r = 0; r <= ROWS; r++) {
    root.append(svg("line", { x1: xOf(0), y1: Y0 + r * FRET_H, x2: xOf(5), y2: Y0 + r * FRET_H, class: r === 0 && base === 1 ? "nut" : "fret" }));
  }
  for (let i = 0; i < 6; i++) {
    root.append(svg("line", { x1: xOf(i), y1: Y0, x2: xOf(i), y2: Y0 + ROWS * FRET_H, class: i === mark ? "string is-mark" : "string" }));
    const f = shape.f[i];
    if (f <= 0) root.append(svg("text", { x: xOf(i), y: Y0 - 10, class: f < 0 ? "muted" : "open" }, f < 0 ? "×" : "○"));
  }
  if (base > 1) root.append(svg("text", { x: X0 - 14, y: yOf(base) + 5, class: "base" }, `${base}`));
  for (const b of shape.b) {
    const strings = shape.f.map((f, i) => (f === b ? i : -1)).filter((i) => i >= 0);
    if (strings.length < 2) continue;
    root.append(svg("rect", { x: xOf(strings[0]) - 8, y: yOf(b) - 8, width: xOf(strings.at(-1)) - xOf(strings[0]) + 16, height: 16, rx: 8, class: "barre" }));
  }
  shape.f.forEach((f, i) => {
    if (f <= 0) return;
    const inBarre = shape.b.includes(f) && shape.f.filter((x) => x === f).length > 1 && shape.d[i] === shape.d[shape.f.indexOf(f)];
    if (!inBarre) root.append(svg("circle", { cx: xOf(i), cy: yOf(f), r: 7.5, class: i === mark ? "dot is-mark" : "dot" }));
    if (shape.d[i] && !inBarre) root.append(svg("text", { x: xOf(i), y: yOf(f) + 4, class: "finger" }, String(shape.d[i])));
  });
  if (mark >= 0) {
    root.append(svg("text", { x: xOf(mark), y: Y0 + ROWS * FRET_H + 16, class: "mark-label" }, `${stringNumber(mark)}ª`));
  }
  return root;
}

const strum = (sampler, shape, delay = 0) => sampler?.chord(shapeMidis(shape), { delay, strum: 0.045 });

function toQuiz(t) {
  const play = (s) => strum(s, t.shape);
  const base = { correct: t.correct, explain: t.explain, recap: t.explain, onAnswer: play, replay: { label: "▶ Oír el acorde", play } };
  if (t.type === "nameShape") {
    return {
      ...base,
      choices: t.choices,
      choiceKind: "chord",
      eyebrow: "Mira la forma",
      ask: "¿Qué acorde es?",
      visual: () => el("div", { class: "lo-cs__single" }, drawChordBox(t.shape, { label: "Forma del acorde" })),
    };
  }
  if (t.type === "pickShape") {
    return {
      ...base,
      choices: t.choices.map((c) => ({ text: c.symbol, figure: true, node: () => el("div", { class: "lo-cs__option" }, drawChordBox(c.shape, { label: "Forma de un acorde" })) })),
      eyebrow: "Busca la forma de",
      big: t.symbol,
      bigKind: "chord",
      ask: "¿Cuál es su forma?",
      visual: undefined,
      onAnswer: (s) => strum(s, t.shape),
    };
  }
  return {
    ...base,
    choices: t.choices,
    choiceKind: "note",
    eyebrow: `En esta forma de ${t.symbol}`,
    ask: ["¿Qué nota suena en la ", el("strong", {}, `${t.string}ª cuerda`), "?"],
    visual: () => el("div", { class: "lo-cs__single" }, drawChordBox(t.shape, { mark: t.stringIdx, label: `Forma de ${t.symbol} con la ${t.string}ª cuerda destacada` })),
    onAnswer: (s) => { s?.play(TUNING[t.stringIdx] + t.fret); strum(s, t.shape, 0.9); },
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    sfx,
    cover,
    next,
    className: "lo-chord-shapes",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const pairs = [["E", "major"], ["E", "minor"], ["E", "7"]];
      const node = el("div", { class: "lo-cs__demo" },
        pairs.map(([r, q], i) => el("button", { class: "lo-cs__demo-item lo-listen", style: `--i:${i}`, onclick: () => strum(s, shapesOf(r, q)[0]) },
          drawChordBox(shapesOf(r, q)[0], { label: `${r}${q === "major" ? "" : q === "minor" ? "m" : "7"}` }),
          chordLabel(`${r}${q === "major" ? "" : q === "minor" ? "m" : "7"}`))));
      return {
        node,
        caption: "E, Em y E7: un dedo cambia el color. En Em se levanta el dedo de la 3ª cuerda (G# baja a G); en E7 se suelta la 4ª cuerda (suena D, la 7ª). Toca cada uno.",
      };
    },
  });
}
