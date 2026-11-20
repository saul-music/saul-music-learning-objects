// Piezas de la actividad y la evaluación comunes a los OA: avance, tarjeta de la pregunta,
// retroalimentación, efecto de acierto o error y resumen final.
import { el } from "./dom.js";

/** Estado de una partida. */
export function createRun(rounds) {
  return {
    rounds,
    round: 0,
    score: 0,
    streak: 0,
    results: [],
    misses: [],
    reset() {
      Object.assign(this, { round: 0, score: 0, streak: 0, results: [], misses: [] });
    },
    record(ok, missText) {
      this.results.push(ok);
      this.streak = ok ? this.streak + 1 : 0;
      if (ok) this.score += 1;
      else if (missText) this.misses.push(missText);
    },
    get last() {
      return this.round === this.rounds;
    },
  };
}

/** Cinta de puntos: jade si acertaste, gris si fallaste, oro latiendo en la pregunta actual. */
export function progress(run, { bump = false } = {}) {
  const dots = Array.from({ length: run.rounds }, (_, i) => {
    const r = run.results[i];
    const cls = r === true ? "is-ok" : r === false ? "is-miss" : i === run.round - 1 ? "is-current" : "";
    return el("li", { class: `lo-dot ${cls}` });
  });
  return el("div", { class: "lo-progress" },
    el("span", { class: "lo-progress__count" }, `${run.round}/${run.rounds}`),
    el("ol", { class: "lo-dots", "aria-label": `Pregunta ${run.round} de ${run.rounds}, ${run.score} aciertos` }, dots),
    el("span", { class: `lo-progress__score${bump ? " is-bump" : ""}` }, `★ ${run.score}`));
}

/** Tarjeta grande de la pregunta. `ask` puede ser texto o una lista de nodos. */
export function questionCard({ eyebrow, big, spoken, sub, ask, entering }) {
  return el("div", { class: `lo-card${entering ? " is-entering" : ""}` },
    eyebrow ? el("p", { class: "lo-card__eyebrow" }, eyebrow) : "",
    big != null ? el("p", { class: "lo-card__big" }, big) : "",
    spoken ? el("p", { class: "lo-card__spoken" }, `se dice «${spoken}»`) : "",
    sub ? el("p", { class: "lo-card__sub" }, sub) : "",
    ask ? el("p", { class: "lo-card__ask" }, ask) : "");
}

/** Texto de retroalimentación (vacío antes de responder, para que no salte el diseño). */
export function feedback(text, ok) {
  const cls = ok == null ? "" : ok ? " is-ok" : " is-miss";
  return el("p", { class: `lo-feedback${cls}`, "aria-live": "polite" }, text ?? "");
}

/**
 * Efecto de juego: confeti y «¡Correcto!» al acertar; temblor y «¡Uy!» al fallar.
 * @param {object} o
 * @param {HTMLElement} o.stage   contenedor con `position: relative` donde se dibuja el efecto
 * @param {boolean} o.ok
 * @param {number} o.streak
 * @param {Element} [o.anchor]    de dónde sale el confeti y a qué altura va el cartel
 * @param {HTMLElement} [o.shake] qué tiembla al fallar
 */
export function celebrate({ stage, ok, streak, anchor, shake }) {
  let fx = stage.querySelector(":scope > .lo-fx");
  if (!fx) {
    fx = el("div", { class: "lo-fx", "aria-hidden": "true" });
    stage.append(fx);
  }
  fx.replaceChildren();
  const box = stage.getBoundingClientRect();
  let at = { x: box.width / 2, y: box.height / 2 };
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    at = { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  }
  const banner = el("div", { class: `lo-banner ${ok ? "is-ok" : "is-miss"}` },
    ok ? "¡Correcto!" : "¡Uy!",
    ok && streak >= 2 ? el("span", { class: "lo-banner__streak" }, `Racha ×${streak}`) : "");
  banner.style.top = `${Math.min(Math.max(at.y - 70, box.height * 0.2), box.height * 0.8)}px`;
  fx.append(banner);
  if (!ok) {
    shake?.classList.add("is-shaking");
    return;
  }
  const pieces = 22 + Math.min(streak, 5) * 4; // más confeti con racha
  for (let i = 0; i < pieces; i++) {
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
    const dist = 60 + Math.random() * 90;
    fx.append(el("i", {
      class: `lo-confetti${i % 3 === 0 ? " is-jade" : ""}`,
      style: `left:${at.x}px;top:${at.y}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 30}px;--rot:${Math.random() * 720 - 360}deg;--delay:${Math.random() * 80}ms`,
    }));
  }
}

/** Resumen final: puntaje y repaso de lo que se falló. */
export function renderSummary(root, run, { onRestart, onBack }) {
  const perfect = run.score === run.rounds;
  root.replaceChildren(el("div", { class: "lo-summary" },
    el("p", { class: "lo-card__eyebrow" }, "Resultado"),
    el("h2", { class: "lo-summary__score" }, `${run.score} de ${run.rounds}`),
    el("p", {}, perfect ? "Todas correctas. ¡Excelente!" : "Repasa las que fallaste:"),
    run.misses.length ? el("ul", { class: "lo-summary__misses" }, run.misses.map((m) => el("li", {}, m))) : "",
    el("div", { class: "lo-actions" },
      el("button", { class: "lo-btn", onclick: onRestart }, "Jugar otra vez"),
      el("button", { class: "lo-btn lo-btn--ghost", onclick: onBack }, "Volver al inicio"))));
}
