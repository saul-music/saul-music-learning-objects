// OA «La misma nota en otra cuerda»: contenido, actividad y evaluación.
// Uso: mount(elemento, { sampler, metadata }) → devuelve una función para desmontar.
import { isCorrect, makeQuestion, midiAt, noteName, octaveRelation } from "./theory.js";

export * from "./theory.js";

const ROUNDS = 10;
const MAX_FRET = 12;
const SVG_NS = "http://www.w3.org/2000/svg";

// Geometría del mástil (unidades del viewBox). Dos orientaciones con la misma lógica:
// «along» recorre el mástil (trastes) y «across» lo cruza (cuerdas).
// Horizontal: cuerda 1 arriba, como una tablatura. Vertical: cuerda 6 a la izquierda, como un
// diagrama de acorde; se usa en pantallas angostas para que quepan los 12 trastes sin desplazar.
const LAYOUTS = {
  horizontal: { width: 1000, height: 262, nut: 90, end: 980, open: 55, first: 30, gap: 36 },
  vertical: { width: 330, height: 760, nut: 90, end: 745, open: 58, first: 70, gap: 44 },
};
const VERTICAL_BELOW = 600; // px de ancho del contenedor

function geometry(orientation) {
  const L = LAYOUTS[orientation];
  const v = orientation === "vertical";
  const fretW = (L.end - L.nut) / MAX_FRET;
  const across = (s) => L.first + (v ? 6 - s : s - 1) * L.gap;
  const along = (f) => (f === 0 ? L.open : L.nut + (f - 0.5) * fretW);
  const pt = (a, c) => (v ? { x: c, y: a } : { x: a, y: c });
  return { L, v, fretW, across, along, pt };
}

const ordinal = (n) => `${n}ª`;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}

/** Dibuja el mástil. `marks` son círculos; `targets` las posiciones que se pueden tocar. */
function drawFretboard({ orientation, highlight, marks = [], targets = [], onPick }) {
  const { L, v, fretW, across, along, pt } = geometry(orientation);
  const root = svg("svg", {
    viewBox: `0 0 ${L.width} ${L.height}`,
    class: `lo-fn__board lo-fn__board--${orientation}`,
    role: "group",
    "aria-label": "Mástil de la guitarra, trastes 0 a 12",
  });
  const circle = (a, c, attrs) => { const p = pt(a, c); return svg("circle", { cx: p.x, cy: p.y, ...attrs }); };
  const text = (a, c, attrs, t) => { const p = pt(a, c); return svg("text", { x: p.x, y: p.y + 5, ...attrs }, t); };
  const line = (a1, c1, a2, c2, attrs) => {
    const p = pt(a1, c1), q = pt(a2, c2);
    return svg("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, ...attrs });
  };
  const mid = (s1, s2) => (across(s1) + across(s2)) / 2;
  const edgeA = Math.min(across(1), across(6));
  const edgeB = Math.max(across(1), across(6));

  for (const f of [3, 5, 7, 9]) root.append(circle(along(f), mid(3, 4), { r: 7, class: "inlay" }));
  root.append(circle(along(12), mid(2, 3), { r: 7, class: "inlay" }));
  root.append(circle(along(12), mid(4, 5), { r: 7, class: "inlay" }));
  for (let f = 0; f <= MAX_FRET; f++) {
    const a = L.nut + f * fretW;
    root.append(line(a, edgeA, a, edgeB, { class: f === 0 ? "nut" : "fret" }));
    // Número de traste: debajo del mástil (horizontal) o a su izquierda (vertical).
    root.append(text(along(f), v ? edgeA - 42 : edgeB + 38, { class: "fret-num" }, String(f)));
  }
  for (let s = 1; s <= 6; s++) {
    const target = s === highlight;
    root.append(line(L.open - 22, across(s), L.end, across(s), { class: target ? "string string--target" : "string", "stroke-width": 1 + s * 0.45 }));
    // Número de cuerda: a la izquierda (horizontal) o arriba (vertical).
    const label = v ? text(18, across(s), {}, ordinal(s)) : text(0, across(s), { x: 16 }, ordinal(s));
    label.setAttribute("class", `string-num${target ? " string-num--target" : ""}${v ? " string-num--top" : ""}`);
    root.append(label);
  }
  for (const f of targets) {
    const hit = circle(along(f), across(highlight), { r: v ? 19 : 15, class: "target", tabindex: 0, role: "button", "aria-label": `Traste ${f} de la ${ordinal(highlight)} cuerda` });
    hit.addEventListener("click", () => onPick(f));
    hit.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(f); }
    });
    root.append(hit);
  }
  for (const m of marks) {
    const g = svg("g", { class: `mark mark--${m.kind}` });
    g.append(circle(along(m.fret), across(m.string), { r: 16 }));
    g.append(text(along(m.fret), across(m.string), {}, m.label));
    root.append(g);
  }
  return root;
}

export function mount(container, { sampler, metadata }) {
  const state = { notation: "both", naturalsOnly: true, round: 0, score: 0, misses: [], q: null, answered: false };
  const name = (midi) => noteName(midi, state.notation);
  const play = (midi, delay = 0) => sampler?.play(midi, { delay });

  const root = el("section", { class: "lo-fn" });
  container.replaceChildren(root);

  const orientation = () => (root.clientWidth < VERTICAL_BELOW ? "vertical" : "horizontal");
  let shown = null; // orientación dibujada en la pregunta actual (null fuera de una pregunta)
  let lastResult;
  const onResize = () => { if (shown && shown !== orientation()) render(lastResult); };
  addEventListener("resize", onResize);

  function intro() {
    shown = null;
    const p = metadata.pedagogy;
    const notation = el("select", { onchange: (e) => (state.notation = e.target.value), "aria-label": "Notación" },
      el("option", { value: "both" }, "Latina y americana"),
      el("option", { value: "latin" }, "Latina (Do, Re, Mi)"),
      el("option", { value: "american" }, "Americana (C, D, E)"));
    notation.value = state.notation;
    const sharps = el("input", { type: "checkbox", onchange: (e) => (state.naturalsOnly = !e.target.checked) });
    sharps.checked = !state.naturalsOnly;
    root.replaceChildren(
      el("h2", {}, metadata.general.title),
      el("p", { class: "lo-fn__objective" }, el("strong", {}, "Objetivo: "), p.objective),
      el("h3", {}, "Antes de empezar"),
      el("ul", { class: "lo-fn__content" }, ...p.content.map((c) => el("li", {}, c))),
      el("div", { class: "lo-fn__options" },
        el("label", {}, "Notación ", notation),
        el("label", {}, sharps, " Incluir notas con sostenido")),
      el("button", { class: "lo-btn", onclick: start }, `Empezar (${ROUNDS} preguntas)`),
    );
  }

  function start() {
    sampler?.preload();
    Object.assign(state, { round: 0, score: 0, misses: [] });
    next();
  }

  function next() {
    state.round += 1;
    state.answered = false;
    state.q = makeQuestion(Math.random, { maxFret: MAX_FRET, naturalsOnly: state.naturalsOnly });
    render();
    play(state.q.midi);
  }

  function pick(fret) {
    if (state.answered) return;
    state.answered = true;
    const q = state.q;
    const ok = isCorrect(q, fret);
    const answerFret = ok ? fret : q.answers[0];
    if (ok) state.score += 1;
    else state.misses.push({ ...q, picked: fret });
    play(q.midi);
    play(midiAt(q.target, answerFret), 0.8);
    render({ picked: fret, ok, answerFret });
  }

  function render(result) {
    const q = state.q;
    lastResult = result;
    shown = orientation();
    const marks = [{ kind: "source", string: q.source, fret: q.fret, label: noteName(q.midi, "american") }];
    let feedback = "";
    if (result) {
      for (const f of q.answers) marks.push({ kind: "answer", string: q.target, fret: f, label: noteName(q.midi, "american") });
      if (!result.ok) marks.push({ kind: "miss", string: q.target, fret: result.picked, label: "✕" });
      const rel = octaveRelation(q.midi, midiAt(q.target, result.answerFret));
      const where = q.answers.map((f) => `traste ${f}`).join(" y ");
      feedback = result.ok
        ? `¡Bien! Es ${rel}.`
        : `No: en el traste ${result.picked} suena ${name(midiAt(q.target, result.picked))}. ${name(q.midi)} está en el ${where}: ${rel}.`;
    }
    const board = drawFretboard({
      orientation: shown,
      highlight: q.target,
      marks,
      targets: result ? [] : Array.from({ length: MAX_FRET + 1 }, (_, f) => f),
      onPick: pick,
    });
    const last = state.round === ROUNDS;
    root.replaceChildren(
      el("p", { class: "lo-fn__progress" }, `Pregunta ${state.round} de ${ROUNDS} · Aciertos: ${state.score}`),
      el("p", { class: "lo-fn__prompt" },
        "Esta es ", el("strong", {}, name(q.midi)), `, en la ${ordinal(q.source)} cuerda, traste ${q.fret}. `,
        "¿Dónde está la misma nota en la ", el("strong", {}, `${ordinal(q.target)} cuerda`), "?"),
      el("div", { class: "lo-fn__board-wrap" }, board),
      el("p", { class: `lo-fn__feedback ${result ? (result.ok ? "is-ok" : "is-miss") : ""}`, "aria-live": "polite" }, feedback),
      el("div", { class: "lo-fn__actions" },
        el("button", { class: "lo-btn lo-btn--ghost", onclick: () => play(q.midi) }, "▶ Escuchar la nota"),
        result ? el("button", { class: "lo-btn", onclick: last ? summary : next }, last ? "Ver resultado" : "Siguiente") : ""),
    );
  }

  function summary() {
    shown = null;
    const items = state.misses.map((m) =>
      el("li", {}, `${name(m.midi)} (${ordinal(m.source)} cuerda, traste ${m.fret}) → en la ${ordinal(m.target)} cuerda: traste ${m.answers.join(" o ")}. Elegiste el ${m.picked}.`));
    root.replaceChildren(
      el("h2", {}, `${state.score} de ${ROUNDS}`),
      el("p", {}, state.score === ROUNDS ? "Todas correctas." : "Repasa las que fallaste:"),
      items.length ? el("ul", { class: "lo-fn__misses" }, ...items) : "",
      el("div", { class: "lo-fn__actions" },
        el("button", { class: "lo-btn", onclick: start }, "Jugar otra vez"),
        el("button", { class: "lo-btn lo-btn--ghost", onclick: intro }, "Volver al inicio")),
    );
  }

  intro();
  return () => {
    removeEventListener("resize", onResize);
    container.replaceChildren();
  };
}
