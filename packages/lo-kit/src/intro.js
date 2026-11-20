// Introducción común de los OA: ficha, ejemplo animado, objetivo, contenido en tarjetas,
// prerrequisitos y botón para empezar. Todo sale de metadata.json (componentes internos del OA).
import { el } from "./dom.js";
import { LETTERS, spoken } from "./notes.js";

const LEVEL = { easy: "Fácil", medium: "Media", difficult: "Difícil" };
const INSTRUMENT = { guitar: "Guitarra", theory: "Teoría", ear: "Oído", piano: "Piano" };

export const minutesOf = (iso) => iso.replace("PT", "").replace("M", " min");
export const levelOf = (difficulty) => LEVEL[difficulty] ?? difficulty;
export const instrumentOf = (key) => INSTRUMENT[key] ?? key;

/** Fila animada de la clave americana: C … B, con su nombre latino debajo. */
function notesFigure() {
  return el("div", { class: "lo-keys" },
    LETTERS.map((n, k) => el("span", { class: "lo-key", style: `--k:${k}` }, el("b", {}, n), el("small", {}, spoken(n)))));
}

/**
 * @param {HTMLElement} root
 * @param {object} o
 * @param {object} o.metadata
 * @param {number} o.rounds
 * @param {{node: Element, caption: string, onReplay?: () => void, replayLabel?: string}} [o.demo]
 * @param {() => void} o.onStart
 */
export function renderIntro(root, { metadata, rounds, demo, onStart }) {
  const p = metadata.pedagogy;
  const e = metadata.educational;
  const stagger = (i) => `--i:${i}`;
  const requires = (metadata.relation ?? []).filter((r) => r.kind === "requires");

  const tip = (c, i) => el("li", { class: "lo-tip", style: stagger(i + 3) },
    el("span", { class: "lo-tip__num" }, String(i + 1)),
    el("h4", {}, c.title),
    c.figure === "notes" ? notesFigure() : "",
    el("p", {}, c.text));

  root.replaceChildren(el("div", { class: "lo-intro" },
    el("header", { class: "lo-hero", style: stagger(0) },
      el("ul", { class: "lo-chips" },
        el("li", {}, instrumentOf(e.instrument)),
        el("li", {}, `⏱ ${minutesOf(e.typicalLearningTime)}`),
        el("li", {}, levelOf(e.difficulty)),
        el("li", {}, `${rounds} preguntas`)),
      el("h2", {}, metadata.general.title),
      el("p", { class: "lo-lead" }, metadata.general.description)),
    demo
      ? el("figure", { class: "lo-demo", style: stagger(1) },
        el("div", { class: "lo-panel" }, demo.node),
        el("figcaption", {}, demo.caption, " ",
          demo.onReplay ? el("button", { class: "lo-btn lo-btn--ghost lo-btn--sm", onclick: demo.onReplay }, demo.replayLabel ?? "▶ Oír el ejemplo") : ""))
      : "",
    el("div", { class: "lo-goal", style: stagger(2) },
      el("span", { class: "lo-label" }, "Objetivo"),
      el("p", {}, p.objective)),
    el("h3", { class: "lo-subhead", style: stagger(3) }, "Antes de empezar"),
    el("ol", { class: "lo-tips" }, p.content.map(tip)),
    el("div", { class: "lo-start", style: stagger(p.content.length + 3) },
      requires.length
        ? el("div", { class: "lo-requires" },
          el("span", { class: "lo-label" }, "Antes de este juego"),
          requires.map((r) => el("p", {}, r.resource.description)))
        : el("span"),
      el("button", { class: "lo-btn lo-btn--cta", onclick: onStart }, "Empezar ", el("span", { "aria-hidden": "true" }, "→"))),
  ));
}
