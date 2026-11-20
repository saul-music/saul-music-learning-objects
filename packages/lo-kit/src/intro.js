// Pantalla de título de un OA: portada, nombre, récord y estrellas, botón «Jugar», la misión (objetivo)
// y «Cómo se juega» (ejemplo y contenido). Todo sale de metadata.json (componentes internos del OA).
import { el } from "./dom.js";
import { LETTERS, noteLabel, spoken } from "./notes.js";
import { rich, starIcon } from "./quiz.js";

const LEVEL = { easy: "Fácil", medium: "Media", difficult: "Difícil" };
const INSTRUMENT = { guitar: "Guitarra", theory: "Teoría", ear: "Oído", piano: "Piano" };

export const minutesOf = (iso) => iso.replace("PT", "").replace("M", " min");
export const levelOf = (difficulty) => LEVEL[difficulty] ?? difficulty;
export const instrumentOf = (key) => INSTRUMENT[key] ?? key;

/** Fila animada de la clave americana: C … B, con su nombre latino debajo. */
function notesFigure() {
  return el("div", { class: "lo-keys" },
    LETTERS.map((n, k) => el("span", { class: "lo-key", style: `--k:${k}` }, noteLabel(n), el("small", {}, spoken(n)))));
}

/**
 * @param {HTMLElement} screen
 * @param {object} o
 * @param {object} o.metadata
 * @param {number} o.rounds
 * @param {string} [o.cover]  URL de la portada
 * @param {{points: number, stars: number, plays: number}} [o.best]
 * @param {{node: Element, caption: string, onReplay?: () => void, replayLabel?: string}} [o.demo]
 * @param {() => void} o.onStart
 * @param {string} [o.hint]  consejo junto al botón final
 */
export function renderIntro(screen, { metadata, rounds, cover, best, demo, onStart, hint }) {
  const p = metadata.pedagogy;
  const e = metadata.educational;
  const stagger = (i) => `--i:${i}`;
  const requires = (metadata.relation ?? []).filter((r) => r.kind === "requires");
  const played = best && best.plays > 0;

  const tip = (c, i) => el("li", { class: "lo-tip", style: stagger(i + 4) },
    el("span", { class: "lo-tip__num" }, String(i + 1)),
    el("h4", {}, c.title),
    c.figure === "notes" ? notesFigure() : "",
    el("p", {}, rich(c.text)));

  const play = el("button", { class: "lo-btn lo-btn--play", onclick: onStart }, el("span", { class: "lo-btn--play__icon", "aria-hidden": "true" }, "▶"), "Jugar");

  screen.replaceChildren(el("div", { class: "lo-intro" },
    el("header", { class: "lo-title", style: stagger(0) },
      cover ? el("div", { class: "lo-title__art" }, el("img", { src: cover, alt: "" })) : "",
      el("div", { class: "lo-title__text" },
        el("p", { class: "lo-kicker" }, metadata.general.subtitle ?? ""),
        el("h2", {}, metadata.general.title),
        el("p", { class: "lo-lead" }, metadata.general.description),
        el("ul", { class: "lo-chips" },
          el("li", {}, instrumentOf(e.instrument)),
          el("li", {}, `⏱ ${minutesOf(e.typicalLearningTime)}`),
          el("li", {}, levelOf(e.difficulty)),
          el("li", {}, `${rounds} rondas`)),
        el("div", { class: "lo-title__record" },
          el("span", { class: "lo-title__stars", "aria-label": `${best?.stars ?? 0} de 3 estrellas` }, [0, 1, 2].map((i) => starIcon(i < (best?.stars ?? 0)))),
          el("span", {}, played ? `Récord: ${best.points.toLocaleString("es-CL")} pts` : "Aún sin jugar")),
        play)),
    el("div", { class: "lo-goal", style: stagger(1) },
      el("span", { class: "lo-label" }, "Tu misión"),
      el("p", {}, rich(p.objective))),
    requires.length
      ? el("div", { class: "lo-requires", style: stagger(2) },
        el("span", { class: "lo-label" }, "Conviene haber jugado antes"),
        requires.map((r) => el("p", {}, rich(r.resource.description))))
      : "",
    el("h3", { class: "lo-subhead", style: stagger(3) }, "Cómo se juega"),
    demo
      ? el("figure", { class: "lo-demo", style: stagger(3) },
        el("div", { class: "lo-panel" }, demo.node),
        el("figcaption", {}, rich(demo.caption), " ",
          demo.onReplay ? el("button", { class: "lo-btn lo-btn--ghost lo-btn--sm lo-listen", onclick: demo.onReplay }, demo.replayLabel ?? "▶ Oír el ejemplo") : ""))
      : "",
    el("ol", { class: "lo-tips" }, p.content.map(tip)),
    el("div", { class: "lo-start", style: stagger(p.content.length + 4) },
      el("p", { class: "lo-start__hint" }, hint ?? "Acierta rápido para sumar bono y encadena aciertos para el combo. Puedes responder con las teclas 1 a 4."),
      el("button", { class: "lo-btn lo-btn--play lo-btn--play-sm", onclick: onStart }, el("span", { class: "lo-btn--play__icon", "aria-hidden": "true" }, "▶"), "Jugar")),
  ));
}
