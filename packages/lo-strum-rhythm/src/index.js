// OA «Pulso»: figuras del rasgueo y la regla con que la guitarra de Acordia rasguea cada compás.
import { el, mountChoiceQuiz, svg } from "@saul-music/lo-kit";
import { FIGURES, makeQuestion, METERS, strumBeats } from "./theory.js";

export * from "./theory.js";

const BPM = 84;
const BEAT = 60 / BPM;
const C_MAJOR = [48, 52, 55, 60, 64]; // forma abierta de C en guitarra

/** Figura musical en SVG: redonda, blanca, negra o blanca con punto. */
export function drawFigure(figure) {
  const root = svg("svg", { viewBox: "0 0 40 64", class: "lo-sr__figure", role: "img", "aria-label": FIGURES[figure].name });
  const filled = figure === "negra";
  root.append(svg("ellipse", { cx: 16, cy: 50, rx: 10, ry: 7, transform: "rotate(-20 16 50)", class: filled ? "head is-filled" : "head" }));
  if (figure !== "redonda") root.append(svg("line", { x1: 25, y1: 48, x2: 25, y2: 6, class: "stem" }));
  if (figure === "blanca-punto") root.append(svg("circle", { cx: 34, cy: 50, r: 3, class: "dot" }));
  return root;
}

/** Un compás: casillas por tiempo, con la figura en cada golpe (si se muestra). */
function measure(meter, { figure, beats = [], show = false, chords } = {}) {
  const n = METERS[meter];
  const chordList = chords ? chords.split("-") : [];
  return el("div", { class: "lo-sr__bar", style: `--n:${n}` },
    el("span", { class: "lo-sr__meter" }, el("b", {}, String(n)), el("b", {}, "4")),
    Array.from({ length: n }, (_, i) => {
      const hit = beats.includes(i);
      // En la regla, los acordes se reparten en partes iguales del compás.
      const chord = chordList.length ? chordList[Math.floor((i * chordList.length) / n)] : "";
      const showChord = chordList.length && Math.floor((i * chordList.length) / n) !== Math.floor(((i - 1) * chordList.length) / n);
      return el("div", { class: `lo-sr__beat${show && hit ? " is-hit" : ""}`, "data-beat": i },
        el("small", {}, String(i + 1)),
        showChord ? el("span", { class: "lo-sr__chord" }, chord) : el("span", { class: "lo-sr__chord" }, ""),
        show && hit ? drawFigure(figure) : "");
    }));
}

/** Suena `bars` compases: clic en cada tiempo (acento en el 1) y el acorde en los golpes; ilumina el tiempo. */
function playBars(sampler, meter, beats, { bars = 2, node } = {}) {
  if (!sampler) return;
  const n = METERS[meter];
  const lead = 0.15;
  for (let b = 0; b < bars; b++) {
    for (let i = 0; i < n; i++) {
      const t = lead + (b * n + i) * BEAT;
      sampler.click({ delay: t, accent: i === 0 });
      if (beats.includes(i)) sampler.chord(C_MAJOR, { delay: t, strum: 0.02, duration: BEAT * 2.2 });
      if (node) {
        setTimeout(() => {
          for (const cell of node.querySelectorAll(".lo-sr__beat")) cell.classList.toggle("is-now", Number(cell.dataset.beat) === i);
        }, t * 1000);
      }
    }
  }
  if (node) setTimeout(() => node.querySelectorAll(".lo-sr__beat").forEach((c) => c.classList.remove("is-now")), (lead + bars * n * BEAT) * 1000);
}

function toQuiz(t) {
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain };
  if (t.type === "count") {
    return { ...base, eyebrow: "Cuenta los tiempos", ask: t.ask, visual: undefined };
  }
  let node = null;
  const visual = (answered) => {
    node = el("div", { class: "lo-sr" }, measure(t.meter, { figure: t.figure, beats: t.beats, show: answered, chords: t.type === "rule" ? t.bar : undefined }));
    if (answered) node.querySelector(".lo-sr__bar").classList.add("is-revealed");
    return node;
  };
  const play = (s) => playBars(s, t.meter, t.beats, { node });
  if (t.type === "listen") {
    return {
      ...base,
      eyebrow: `Compás de ${t.meter}`,
      ask: "¿Qué figura toca la guitarra?",
      visual,
      onShow: (s) => setTimeout(() => play(s), 350),
      replay: { label: "▶ Oír otra vez", play },
    };
  }
  return {
    ...base,
    eyebrow: `Un compás de ${t.meter} con`,
    big: t.bar.replaceAll("-", " – "),
    ask: "¿Cómo lo rasguea la guitarra?",
    visual,
    onAnswer: (s) => setTimeout(() => play(s), 200),
    replay: { label: "▶ Oír cómo suena", play },
  };
}

export function mount(container, { sampler, metadata }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    className: "lo-strum-rhythm",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const rows = ["redonda", "blanca", "negra"].map((f, i) => {
        const row = el("div", { class: "lo-sr__demo-row", style: `--i:${i}` },
          el("span", { class: "lo-sr__demo-name" }, FIGURES[f].plural),
          measure("4/4", { figure: f, beats: strumBeats("4/4", f), show: true }));
        row.prepend(el("button", { class: "lo-btn lo-btn--ghost lo-btn--sm", onclick: () => playBars(s, "4/4", strumBeats("4/4", f), { node: row, bars: 1 }), "aria-label": `Oír ${FIGURES[f].plural}` }, "▶"));
        return row;
      });
      return {
        node: el("div", { class: "lo-sr__demo" }, rows),
        caption: "El mismo compás de 4/4 rasgueado de tres maneras: un golpe que dura los 4 tiempos (redonda), dos de 2 (blancas) o cuatro de 1 (negras).",
      };
    },
  });
}
