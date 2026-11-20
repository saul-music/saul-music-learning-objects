// OA «La misma nota en otra cuerda»: contenido, actividad y evaluación.
// Uso: mount(elemento, { sampler, sfx, metadata, cover, next }) → devuelve una función para desmontar.
import {
  celebrate, countdown, createRun, createShell, el, feedback, hud, loadBest, noteLabel, pretty, questionCard,
  renderIntro, renderResults, saveResult, svg,
} from "@saul-music/lo-kit";
import { isCorrect, makeQuestion, midiAt, noteName, octaveRelation, spokenName } from "./theory.js";

export * from "./theory.js";

const ROUNDS = 10;
const MAX_FRET = 12;

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
    // Onda que late alrededor de la nota mostrada, para que el ojo la encuentre.
    if (m.kind === "source") g.append(circle(along(m.fret), across(m.string), { r: 16, class: "pulse" }));
    g.append(circle(along(m.fret), across(m.string), { r: 16, class: "dot" }));
    g.append(text(along(m.fret), across(m.string), {}, m.label));
    root.append(g);
  }
  return root;
}

/** Ejemplo de la intro: la misma nota en dos cuerdas, unidas por un arco que se dibuja. */
function buildDemo(example, orientation, play) {
  const exMidi = midiAt(example.from.string, example.from.fret);
  const node = drawFretboard({
    orientation,
    highlight: example.to.string,
    marks: [
      { kind: "source", string: example.from.string, fret: example.from.fret, label: noteName(exMidi) },
      { kind: "answer", string: example.to.string, fret: example.to.fret, label: noteName(exMidi) },
    ],
  });
  // Recorte a los trastes 0 a 8: el ejemplo no necesita más y así se lee en celular.
  const g = geometry(orientation);
  const cut = g.L.nut + 8 * g.fretW + 4;
  node.setAttribute("viewBox", g.v ? `0 0 ${g.L.width} ${cut}` : `0 0 ${cut} ${g.L.height}`);
  // Arco entre las dos notas, curvado hacia afuera del mástil y recortado al borde de cada círculo.
  const P1 = g.pt(g.along(example.from.fret), g.across(example.from.string));
  const P2 = g.pt(g.along(example.to.fret), g.across(example.to.string));
  const dx = P2.x - P1.x, dy = P2.y - P1.y, len = Math.hypot(dx, dy);
  let nx = -dy / len, ny = dx / len;
  if (g.v ? nx < 0 : ny > 0) { nx = -nx; ny = -ny; } // horizontal: hacia arriba; vertical: hacia la derecha
  const ux = dx / len, uy = dy / len, r = 24;
  const A = { x: P1.x + ux * r, y: P1.y + uy * r };
  const B = { x: P2.x - ux * r, y: P2.y - uy * r };
  const bend = len * 0.45;
  const Cx = (A.x + B.x) / 2 + nx * bend, Cy = (A.y + B.y) / 2 + ny * bend;
  node.insertBefore(svg("path", { d: `M${A.x},${A.y} Q${Cx},${Cy} ${B.x},${B.y}`, class: "demo-arc", pathLength: 1 }), node.querySelector(".mark"));
  node.classList.add("lo-fn__board--demo");
  const onReplay = () => {
    node.classList.remove("is-playing");
    void node.getBoundingClientRect(); // reinicia la animación
    node.classList.add("is-playing");
    play(exMidi);
    play(midiAt(example.to.string, example.to.fret), 0.9);
  };
  requestAnimationFrame(() => node.classList.add("is-playing"));
  return { node, caption: example.caption, onReplay };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  const run = createRun(ROUNDS);
  const play = (midi, delay = 0) => sampler?.play(midi, { delay });
  const { root, screen } = createShell(container, "lo-quiz lo-fn");
  let q = null;
  let fresh = false;
  let playing = false;

  const orientation = () => (screen.clientWidth < VERTICAL_BELOW ? "vertical" : "horizontal");
  let shown = null; // orientación dibujada en la pregunta actual (null fuera de una pregunta)
  let lastResult;
  // Se espera a que el tamaño se asiente: un cambio pasajero no debe redibujar (y cortar la animación).
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (shown && shown !== orientation()) render(lastResult); }, 150);
  };
  addEventListener("resize", onResize);

  function intro() {
    shown = null;
    playing = false;
    renderIntro(screen, {
      metadata, rounds: ROUNDS, cover, best: loadBest(metadata.id),
      demo: buildDemo(metadata.pedagogy.example, orientation(), play), onStart: start,
      hint: "Toca el traste en el mástil. Acierta rápido para sumar bono y encadena aciertos para el combo.",
    });
  }

  async function start() {
    sfx?.unlock();
    sampler?.preload();
    run.reset();
    screen.replaceChildren();
    await countdown(root, sfx);
    playing = true;
    nextQuestion();
  }

  function nextQuestion() {
    run.round += 1;
    q = makeQuestion(Math.random, { maxFret: MAX_FRET });
    fresh = true;
    render(null);
    run.startQuestion();
    play(q.midi);
  }

  function pick(fret) {
    if (!playing || q.answered) return;
    q.answered = true;
    const ok = isCorrect(q, fret);
    const answerFret = ok ? fret : q.answers[0];
    const result = run.record(ok, `${noteName(q.midi)} (${ordinal(q.source)} cuerda, traste ${q.fret}) → en la ${ordinal(q.target)} cuerda: traste ${q.answers.join(" o ")}. Elegiste el ${fret}.`);
    play(q.midi);
    play(midiAt(q.target, answerFret), 0.8);
    render({ ...result, picked: fret, answerFret }, true);
  }

  function render(result, justAnswered = false) {
    lastResult = result;
    shown = orientation();
    const entering = fresh;
    fresh = false;
    const name = noteName(q.midi);
    const label = pretty(name);
    const marks = [{ kind: "source", string: q.source, fret: q.fret, label }];
    let text = "";
    if (result) {
      for (const f of q.answers) marks.push({ kind: "answer", string: q.target, fret: f, label });
      if (!result.ok) marks.push({ kind: "miss", string: q.target, fret: result.picked, label: "✕" });
      const rel = octaveRelation(q.midi, midiAt(q.target, result.answerFret));
      const where = q.answers.map((f) => `traste ${f}`).join(" y ");
      text = result.ok
        ? `Es ${rel}.`
        : `En el traste ${result.picked} suena ${noteName(midiAt(q.target, result.picked))}. ${name} está en el ${where}: ${rel}.`;
    }
    const board = drawFretboard({
      orientation: shown,
      highlight: q.target,
      marks,
      targets: result ? [] : Array.from({ length: MAX_FRET + 1 }, (_, f) => f),
      onPick: pick,
    });
    const wrap = el("div", { class: `lo-panel lo-fn__board-wrap${entering ? " is-entering" : ""}` }, board);
    const stage = el("div", { class: "lo-stage" }, wrap);
    screen.replaceChildren(
      hud(run, { sfx, answered: Boolean(result), gained: justAnswered ? result?.gained ?? 0 : 0 }),
      questionCard({
        eyebrow: "Esta nota es",
        big: noteLabel(name),
        spoken: spokenName(q.midi),
        sub: `${ordinal(q.source)} cuerda · traste ${q.fret}`,
        ask: ["¿Dónde está en la ", el("strong", {}, `${ordinal(q.target)} cuerda`), "?"],
        entering,
      }),
      stage,
      feedback(text, result ? result.ok : null),
      el("div", { class: "lo-actions" },
        el("button", { class: "lo-btn lo-btn--ghost", onclick: () => play(q.midi) }, "▶ Escuchar la nota"),
        result ? el("button", { class: "lo-btn lo-btn--game lo-btn--next", onclick: advance }, run.last ? "Ver resultado" : "Siguiente", el("kbd", {}, "Enter")) : ""),
    );
    if (result && justAnswered) {
      const anchor = stage.querySelector(result.ok ? ".mark--answer .dot" : ".mark--miss .dot");
      celebrate({ host: root, stage, result, anchor, shake: wrap, sfx });
    }
  }

  function advance() {
    if (!playing || !q?.answered) return;
    if (run.last) summary();
    else nextQuestion();
  }

  function summary() {
    shown = null;
    playing = false;
    renderResults(screen, run, { sfx, next, save: (r) => saveResult(metadata.id, r), onRestart: start, onBack: intro });
  }

  function onKey(e) {
    if (e.key === "Enter" && playing && q?.answered && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      advance();
    }
  }
  addEventListener("keydown", onKey);

  intro();
  return () => {
    removeEventListener("resize", onResize);
    removeEventListener("keydown", onKey);
    clearTimeout(resizeTimer);
    container.replaceChildren();
  };
}
