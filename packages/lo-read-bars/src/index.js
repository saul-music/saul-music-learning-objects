// OA «Lee los compases»: cómo se lee la grilla de acordes de un tema (para quien toca, no para quien escribe).
import { chordLabel, el, mountChoiceQuiz, svg } from "@saul-music/lo-kit";
import { chordMidis, COLUMNS, hits, makeBar, makeQuestion } from "./theory.js";

export * from "./theory.js";

const BEAT = 0.6;

const restIcon = () => {
  const s = svg("svg", { viewBox: "0 0 24 28", width: 14, height: 22, fill: "none", stroke: "currentColor", "stroke-width": 2.2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" });
  s.append(svg("path", { d: "M9 2l7 7-6 6 6 6c-4-1-6 1-5 5" }));
  return el("span", { class: "lo-rb__rest", role: "img", "aria-label": "silencio" }, s);
};
const tieArc = () => {
  const s = svg("svg", { class: "lo-rb__arc", viewBox: "0 0 20 8", width: 16, height: 7, fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "aria-hidden": "true" });
  s.append(svg("path", { d: "M2 2c4 5 12 5 16 0" }));
  return s;
};

/** Un compás como lo dibuja el sitio: acordes por partes, ligado con arco, silencio con ícono, repetición en gris. */
function barNode(bar, { marked = false, clef = false, held = null } = {}) {
  const split = bar.slots.length > 1;
  let sounding = held;
  const parts = bar.slots.map((s) => {
    if (s.kind === "chord") sounding = s.chord;
    const body = s.kind === "chord" ? chordLabel(s.chord) : s.kind === "rest" ? restIcon() : el("span", { class: "lo-rb__tie" }, tieArc(), sounding ? chordLabel(sounding) : "");
    return el("span", { class: `lo-rb__part${s.kind === "tie" ? " is-tie" : ""}`, style: `flex:${s.beats}` }, body);
  });
  return el("div", { class: `lo-rb__bar${split ? " is-split" : ""}${bar.repeat ? " is-repeat" : ""}${marked ? " is-marked" : ""}${clef ? " has-clef" : ""}`, ...(marked ? { "data-marked": "1" } : {}) },
    clef ? el("span", { class: "lo-rb__clef", "aria-label": `Compás de ${bar.meter}/4` }, el("b", {}, String(bar.meter)), el("b", {}, "4")) : "",
    parts);
}

const grid = (bars, { marked = -1, title = "", times = 1, clef = false } = {}) =>
  el("div", { class: "lo-rb" },
    title ? el("p", { class: "lo-rb__title" }, title, times > 1 ? el("span", { class: "lo-rb__times" }, `× ${times}`) : "") : "",
    el("div", { class: "lo-rb__grid", style: `--cols:${COLUMNS}` }, bars.map((b, i) => barNode(b, { marked: i === marked, clef: clef && i === 0 }))));

/** Suena el compás dos veces con el clic en cada tiempo (acento en el 1). */
function playBar(bar) {
  return (s) => {
    if (!s) return;
    const lead = 0.15;
    const n = bar.meter;
    for (let rep = 0; rep < 2; rep++) {
      for (let i = 0; i < n; i++) s.click({ delay: lead + (rep * n + i) * BEAT, accent: i === 0 });
      for (const h of hits(bar)) s.chord(chordMidis(h.chord), { delay: lead + (rep * n + h.at) * BEAT, strum: 0.02, duration: h.beats * BEAT * 0.95 });
    }
  };
}

function toQuiz(t) {
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain };
  if (t.type === "split") {
    return { ...base, eyebrow: `Compás de ${t.bar.meter}/4`, big: t.chord, bigKind: "chord", ask: `¿Cuántos tiempos dura ${t.chord}?`, choiceKind: "number",
      visual: () => el("div", { class: "lo-rb" }, el("div", { class: "lo-rb__grid lo-rb__grid--one" }, barNode(t.bar, { clef: true })), el("p", { class: "lo-rb__hint" }, "Cuenta: la casilla más ancha dura más tiempos.")) };
  }
  if (t.type === "order") {
    return { ...base, eyebrow: "Orden de lectura", big: "?", ask: "¿Qué número de compás es la casilla marcada?", choiceKind: "number",
      visual: () => grid(t.bars, { marked: t.marked, title: "Estrofa" }) };
  }
  if (t.type === "next") {
    return { ...base, eyebrow: "Orden de lectura", big: "→", ask: "Termina el último compás de la primera fila. ¿Qué acorde suena después?", choiceKind: "chord",
      visual: () => grid(t.bars, { marked: t.marked, title: "Estrofa" }) };
  }
  if (t.type === "symbol") {
    const held = t.bars[0].slots[0].chord;
    return { ...base, eyebrow: "Símbolos de la grilla", big: "?", ask: "¿Qué pasa en la casilla marcada?", choiceKind: "text",
      visual: () => el("div", { class: "lo-rb" }, el("div", { class: "lo-rb__grid lo-rb__grid--two" }, barNode(t.bars[0]), barNode(t.bars[1], { marked: true, held }))) };
  }
  if (t.type === "section") {
    return { ...base, eyebrow: "Sección repetida", big: `× ${t.times}`, ask: `«${t.title} × ${t.times}»: ¿cuántos compases suenan en total?`, choiceKind: "number",
      visual: () => grid(t.bars, { title: t.title, times: t.times }) };
  }
  if (t.type === "meter") {
    return { ...base, eyebrow: "Clave de tiempo", big: "?", ask: "¿Cuántos tiempos tiene este compás?", choiceKind: "number",
      visual: () => el("div", { class: "lo-rb" }, el("div", { class: "lo-rb__grid lo-rb__grid--one" }, barNode(t.bar, { clef: true }))) };
  }
  const bars = t.bars;
  const replay = { label: "▶ Oír el compás", play: playBar(bars[t.correct]) };
  return {
    ...base, eyebrow: "De oído", big: "♪", ask: "Escucha el compás. ¿Cuál de estas casillas es?",
    choices: bars.map((b, i) => ({ text: `Casilla ${i + 1}`, figure: true, node: () => barNode(b) })),
    onShow: replay.play, replay,
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata, sampler, sfx, cover, next, className: "lo-readbars",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const bars = [makeBar(["C"]), makeBar(["_"]), makeBar([["G", 2], "Am"]), makeBar(["F", "."])];
      return {
        node: grid(bars, { title: "Estrofa", times: 2, clef: true }),
        caption: "Una casilla es un compás de 4 tiempos. Un acorde solo lo ocupa todo; el arco liga con el anterior; en la tercera, G ocupa el doble de ancho que Am; el ícono es un silencio. Y el × 2 repite toda la sección.",
        onReplay: () => playBar(makeBar([["G", 2], "Am"]))(s),
        replayLabel: "▶ Oír un compás",
      };
    },
  });
}
