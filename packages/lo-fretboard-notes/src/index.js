// OA «La misma nota en otra cuerda»: contenido, actividad y evaluación.
// Uso: mount(elemento, { sampler, metadata }) → devuelve una función para desmontar.
import { isCorrect, makeQuestion, midiAt, noteName, octaveRelation, spokenName } from "./theory.js";

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
    // Onda que late alrededor de la nota mostrada, para que el ojo la encuentre.
    if (m.kind === "source") g.append(circle(along(m.fret), across(m.string), { r: 16, class: "pulse" }));
    g.append(circle(along(m.fret), across(m.string), { r: 16, class: "dot" }));
    g.append(text(along(m.fret), across(m.string), {}, m.label));
    root.append(g);
  }
  return root;
}

export function mount(container, { sampler, metadata }) {
  const state = { naturalsOnly: true, round: 0, score: 0, misses: [], results: [], streak: 0, q: null, answered: false, fresh: false, celebrate: false };
  const name = noteName;
  const play = (midi, delay = 0) => sampler?.play(midi, { delay });

  const root = el("section", { class: "lo-fn" });
  container.replaceChildren(root);

  const orientation = () => (root.clientWidth < VERTICAL_BELOW ? "vertical" : "horizontal");
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
    const p = metadata.pedagogy;
    const e = metadata.educational;
    const minutes = e.typicalLearningTime.replace("PT", "").replace("M", " min");
    const level = { easy: "Fácil", medium: "Media", difficult: "Difícil" }[e.difficulty];
    const stagger = (i) => `--i:${i}`;

    // Ejemplo animado: la misma nota en dos cuerdas, unidas por un arco que se dibuja.
    const ex = p.example;
    const exMidi = midiAt(ex.from.string, ex.from.fret);
    const demoOrientation = orientation();
    const demo = drawFretboard({
      orientation: demoOrientation,
      highlight: ex.to.string,
      marks: [
        { kind: "source", string: ex.from.string, fret: ex.from.fret, label: noteName(exMidi) },
        { kind: "answer", string: ex.to.string, fret: ex.to.fret, label: noteName(exMidi) },
      ],
    });
    // Recorte a los trastes 0 a 8: el ejemplo no necesita más y así se lee en celular.
    const g = geometry(demoOrientation);
    const cut = g.L.nut + 8 * g.fretW + 4;
    demo.setAttribute("viewBox", g.v ? `0 0 ${g.L.width} ${cut}` : `0 0 ${cut} ${g.L.height}`);
    // Arco entre las dos notas, curvado hacia afuera del mástil y recortado al borde de cada círculo.
    const P1 = g.pt(g.along(ex.from.fret), g.across(ex.from.string));
    const P2 = g.pt(g.along(ex.to.fret), g.across(ex.to.string));
    const dx = P2.x - P1.x, dy = P2.y - P1.y, len = Math.hypot(dx, dy);
    let nx = -dy / len, ny = dx / len;
    if (g.v ? nx < 0 : ny > 0) { nx = -nx; ny = -ny; } // horizontal: hacia arriba; vertical: hacia la derecha
    const ux = dx / len, uy = dy / len, r = 24;
    const A = { x: P1.x + ux * r, y: P1.y + uy * r };
    const B = { x: P2.x - ux * r, y: P2.y - uy * r };
    const bend = len * 0.45;
    const Cx = (A.x + B.x) / 2 + nx * bend, Cy = (A.y + B.y) / 2 + ny * bend;
    const arc = svg("path", { d: `M${A.x},${A.y} Q${Cx},${Cy} ${B.x},${B.y}`, class: "demo-arc", pathLength: 1 });
    demo.insertBefore(arc, demo.querySelector(".mark"));
    demo.classList.add("lo-fn__board--demo");
    const replay = () => {
      demo.classList.remove("is-playing");
      void demo.getBoundingClientRect(); // reinicia la animación
      demo.classList.add("is-playing");
      play(exMidi);
      play(midiAt(ex.to.string, ex.to.fret), 0.9);
    };

    const tip = (c, i) => el("li", { class: "lo-fn__tip", style: stagger(i + 3) },
      el("span", { class: "lo-fn__tip-num" }, String(i + 1)),
      el("h4", {}, c.title),
      c.figure === "notes"
        ? el("div", { class: "lo-fn__keys" }, ...["C", "D", "E", "F", "G", "A", "B"].map((n, k) =>
          el("span", { class: "lo-fn__key", style: `--k:${k}` }, el("b", {}, n), el("small", {}, spokenName(57 + [3, 5, 7, 8, 10, 0, 2][k])))))
        : "",
      el("p", {}, c.text));

    const sharps = el("input", { type: "checkbox", onchange: (ev) => (state.naturalsOnly = !ev.target.checked) });
    sharps.checked = !state.naturalsOnly;

    root.replaceChildren(el("div", { class: "lo-fn__intro" },
      el("header", { class: "lo-fn__hero", style: stagger(0) },
        el("ul", { class: "lo-fn__chips" },
          el("li", {}, "Guitarra"), el("li", {}, `⏱ ${minutes}`), el("li", {}, level), el("li", {}, `${ROUNDS} preguntas`)),
        el("h2", {}, metadata.general.title),
        el("p", { class: "lo-fn__lead" }, metadata.general.description)),
      el("figure", { class: "lo-fn__demo", style: stagger(1) },
        el("div", { class: "lo-fn__board-wrap" }, demo),
        el("figcaption", {}, ex.caption, " ",
          el("button", { class: "lo-btn lo-btn--ghost lo-btn--sm", onclick: replay }, "▶ Oír el ejemplo"))),
      el("div", { class: "lo-fn__goal", style: stagger(2) },
        el("span", { class: "lo-fn__goal-label" }, "Objetivo"),
        el("p", {}, p.objective)),
      el("h3", { style: stagger(3) }, "Antes de empezar"),
      el("ol", { class: "lo-fn__tips" }, ...p.content.map(tip)),
      el("div", { class: "lo-fn__start", style: stagger(p.content.length + 3) },
        el("label", { class: "lo-fn__switch" }, sharps, el("span", { class: "lo-fn__switch-ui", "aria-hidden": "true" }), "Incluir notas con sostenido (#)"),
        el("button", { class: "lo-btn lo-btn--cta", onclick: start }, "Empezar ", el("span", { "aria-hidden": "true" }, "→"))),
    ));
    requestAnimationFrame(() => demo.classList.add("is-playing"));
  }

  function start() {
    sampler?.preload();
    Object.assign(state, { round: 0, score: 0, misses: [], results: [], streak: 0 });
    next();
  }

  function next() {
    state.round += 1;
    state.answered = false;
    state.fresh = true;
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
    state.results.push(ok);
    state.streak = ok ? state.streak + 1 : 0;
    state.celebrate = true;
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
    const marks = [{ kind: "source", string: q.source, fret: q.fret, label: noteName(q.midi) }];
    let feedback = "";
    if (result) {
      for (const f of q.answers) marks.push({ kind: "answer", string: q.target, fret: f, label: noteName(q.midi) });
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
    // La entrada se anima solo con una pregunta nueva (no al responder ni al girar la pantalla).
    const enter = state.fresh ? " is-entering" : "";
    state.fresh = false;
    const dots = Array.from({ length: ROUNDS }, (_, i) => {
      const r = state.results[i];
      const cls = r === true ? "is-ok" : r === false ? "is-miss" : i === state.round - 1 ? "is-current" : "";
      return el("li", { class: `lo-fn__dot ${cls}` });
    });
    root.replaceChildren(
      el("div", { class: "lo-fn__progress" },
        el("span", { class: "lo-fn__count" }, `${state.round}/${ROUNDS}`),
        el("ol", { class: "lo-fn__dots", "aria-label": `Pregunta ${state.round} de ${ROUNDS}, ${state.score} aciertos` }, ...dots),
        el("span", { class: `lo-fn__score${result?.ok ? " is-bump" : ""}` }, `★ ${state.score}`)),
      el("div", { class: `lo-fn__card${enter}` },
        el("p", { class: "lo-fn__eyebrow" }, "Esta nota es"),
        el("p", { class: "lo-fn__note" }, name(q.midi)),
        el("p", { class: "lo-fn__spoken" }, `se dice «${spokenName(q.midi)}»`),
        el("p", { class: "lo-fn__where" }, `${ordinal(q.source)} cuerda · traste ${q.fret}`),
        el("p", { class: "lo-fn__ask" }, "¿Dónde está en la ", el("strong", {}, `${ordinal(q.target)} cuerda`), "?")),
      el("div", { class: "lo-fn__stage" }, el("div", { class: `lo-fn__board-wrap${enter}` }, board), el("div", { class: "lo-fn__fx", "aria-hidden": "true" })),
      el("p", { class: `lo-fn__feedback ${result ? (result.ok ? "is-ok" : "is-miss") : ""}`, "aria-live": "polite" }, feedback),
      el("div", { class: "lo-fn__actions" },
        el("button", { class: "lo-btn lo-btn--ghost", onclick: () => play(q.midi) }, "▶ Escuchar la nota"),
        result ? el("button", { class: "lo-btn", onclick: last ? summary : next }, last ? "Ver resultado" : "Siguiente →") : ""),
    );
    if (result && state.celebrate) {
      state.celebrate = false;
      celebrate(result.ok, state.streak);
    }
  }

  /** Efecto de juego sobre el mástil: confeti y «¡Correcto!» al acertar; temblor y «¡Uy!» al fallar. */
  function celebrate(ok, streak) {
    const stage = root.querySelector(".lo-fn__stage");
    const fx = stage.querySelector(".lo-fn__fx");
    const banner = el("div", { class: `lo-fn__banner ${ok ? "is-ok" : "is-miss"}` },
      ok ? "¡Correcto!" : "¡Uy!",
      ok && streak >= 2 ? el("span", { class: "lo-fn__streak" }, `Racha ×${streak}`) : "");
    const box = stage.getBoundingClientRect();
    const center = (node) => {
      const r = node.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    };
    // El cartel sale a la altura de donde se tocó (importa en el mástil vertical, que es largo).
    const touched = center(stage.querySelector(ok ? ".mark--answer .dot" : ".mark--miss .dot"));
    banner.style.top = `${Math.min(Math.max(touched.y - 70, box.height * 0.2), box.height * 0.8)}px`;
    fx.append(banner);
    if (!ok) {
      stage.querySelector(".lo-fn__board-wrap").classList.add("is-shaking");
      return;
    }
    // Confeti desde la posición correcta.
    const { x, y } = touched;
    const pieces = 22 + Math.min(streak, 5) * 4; // más confeti con racha
    for (let i = 0; i < pieces; i++) {
      const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
      const dist = 60 + Math.random() * 90;
      fx.append(el("i", {
        class: `lo-fn__confetti ${i % 3 === 0 ? "is-jade" : ""}`,
        style: `left:${x}px;top:${y}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 30}px;--rot:${Math.random() * 720 - 360}deg;--delay:${Math.random() * 80}ms`,
      }));
    }
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
    clearTimeout(resizeTimer);
    container.replaceChildren();
  };
}
