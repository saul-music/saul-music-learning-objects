// OA «Pulso»: figuras del rasgueo y la regla con que la guitarra de Acordia rasguea cada compás.
import { chordLabel, el, mountChoiceQuiz } from "@saul-music/lo-kit";
import { FIGURES, makeQuestion, METERS, strumBeats } from "./theory.js";

export * from "./theory.js";

const BPM = 84;
const BEAT = 60 / BPM;
const C_MAJOR = [48, 52, 55, 60, 64]; // forma abierta de C en guitarra

// Figuras en tipografía musical (Noto Music, bloque de símbolos musicales de Unicode).
const GLYPH = { redonda: "\u{1D15D}", blanca: "\u{1D15E}", negra: "\u{1D15F}", "blanca-punto": "\u{1D15E}" };
const FIGURE_BY_PLURAL = Object.fromEntries(Object.entries(FIGURES).map(([k, f]) => [f.plural, k]));

/** Figura musical: redonda, blanca, negra o blanca con punto. */
export function drawFigure(figure) {
  return el("span", { class: "lo-sr__figure", role: "img", "aria-label": FIGURES[figure].name },
    GLYPH[figure], figure === "blanca-punto" ? el("span", { class: "lo-sr__dot", "aria-hidden": "true" }) : "");
}

/** Ficha de respuesta con la figura y su nombre. */
function figureChoice(plural) {
  const key = FIGURE_BY_PLURAL[plural];
  return { text: plural, node: () => el("span", { class: "lo-sr__choice" }, drawFigure(key), el("b", {}, plural)) };
}

/** Un compás: casillas por tiempo, con la figura en cada golpe (si se muestra). */
function measure(meter, { figure, beats = [], show = false, chords } = {}) {
  const n = METERS[meter];
  const chordList = chords ? chords.split("-") : [];
  return el("div", { class: "lo-sr__bar", style: `--n:${n}` },
    el("span", { class: "lo-sr__meter", "aria-label": `Compás de ${n}/4` }, el("b", {}, String(n)), el("b", {}, "4")),
    Array.from({ length: n }, (_, i) => {
      const hit = beats.includes(i);
      // En la regla, los acordes se reparten en partes iguales del compás.
      const chord = chordList.length ? chordList[Math.floor((i * chordList.length) / n)] : "";
      const showChord = chordList.length && Math.floor((i * chordList.length) / n) !== Math.floor(((i - 1) * chordList.length) / n);
      return el("div", { class: `lo-sr__beat${show && hit ? " is-hit" : ""}`, "data-beat": i },
        el("small", {}, String(i + 1)),
        el("span", { class: "lo-sr__chord" }, showChord ? chordLabel(chord) : ""),
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
    return { ...base, choiceKind: "number", eyebrow: "Cuenta los tiempos", ask: t.ask, visual: undefined };
  }
  base.choices = t.choices.map(figureChoice);
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
    big: el("span", { class: "lo-sr__bar-chords" }, t.bar.split("-").map((c, i) => [i ? el("span", { class: "lo-sr__sep", "aria-hidden": "true" }, "·") : "", chordLabel(c)])),
    ask: "¿Cómo lo rasguea la guitarra?",
    visual,
    onAnswer: (s) => setTimeout(() => play(s), 200),
    replay: { label: "▶ Oír cómo suena", play },
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    sfx,
    cover,
    next,
    className: "lo-strum-rhythm",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const rows = ["redonda", "blanca", "negra"].map((f, i) => {
        const row = el("div", { class: "lo-sr__demo-row", style: `--i:${i}` },
          el("span", { class: "lo-sr__demo-name" }, FIGURES[f].plural),
          measure("4/4", { figure: f, beats: strumBeats("4/4", f), show: true }));
        row.prepend(el("button", { class: "lo-btn lo-btn--ghost lo-btn--sm lo-listen", onclick: () => playBars(s, "4/4", strumBeats("4/4", f), { node: row, bars: 1 }), "aria-label": `Oír ${FIGURES[f].plural}` }, "▶"));
        return row;
      });
      return {
        node: el("div", { class: "lo-sr__demo" }, rows),
        caption: "El mismo compás de 4/4 rasgueado de tres maneras: un golpe que dura los 4 tiempos (redonda), dos de 2 (blancas) o cuatro de 1 (negras).",
      };
    },
  });
}
