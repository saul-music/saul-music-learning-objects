// Cuestionario de alternativas: el OA solo aporta las preguntas (y, si quiere, un ejemplo para la intro).
import { el } from "./dom.js";
import { renderIntro } from "./intro.js";
import { celebrate, createRun, feedback, progress, questionCard, renderSummary } from "./quiz.js";

/**
 * Forma de una pregunta (la arma el OA):
 * {
 *   eyebrow?, big?, spoken?, sub?, ask,       // tarjeta
 *   choices: (string | {text: string, node: () => Element})[], correct: number,
 *                                             // alternativas (texto o figura, p. ej. un diagrama) y la correcta
 *   explain: string,                          // se muestra al responder (acierto o error)
 *   recap?: string,                           // línea del resumen si se falla
 *   visual?: (answered: boolean) => Element,  // figura bajo la tarjeta (teclado, escalera…)
 *   onShow?: (sampler) => void,               // al aparecer (p. ej. tocar un acorde)
 *   onAnswer?: (sampler, ok) => void,         // al responder
 *   replay?: { label: string, play: (sampler) => void },   // botón para volver a oír
 *   extras?: { label: string, play: (sampler) => void }[], // botones que aparecen al responder
 * }
 *
 * @param {HTMLElement} container
 * @param {object} o
 * @param {object} o.metadata
 * @param {object} [o.sampler]
 * @param {(rng: () => number) => object} o.makeQuestion
 * @param {(ctx: {sampler: object}) => object} [o.demo]  ejemplo de la intro ({node, caption, onReplay})
 * @param {number} [o.rounds]
 * @param {string} [o.className]
 */
export function mountChoiceQuiz(container, { metadata, sampler, makeQuestion, demo, rounds = 10, className = "" }) {
  const root = el("section", { class: `lo-quiz ${className}` });
  container.replaceChildren(root);
  const run = createRun(rounds);
  let q = null;
  let fresh = false;
  const textOf = (c) => (typeof c === "string" ? c : c.text);

  function intro() {
    renderIntro(root, { metadata, rounds, demo: demo?.({ sampler }), onStart: start });
  }

  function start() {
    sampler?.preload();
    run.reset();
    next();
  }

  function next() {
    run.round += 1;
    q = makeQuestion(Math.random);
    fresh = true;
    render(null);
    q.onShow?.(sampler);
  }

  function pick(i) {
    if (q.picked != null) return;
    q.picked = i;
    const ok = i === q.correct;
    run.record(ok, q.recap ?? `${q.ask} → ${textOf(q.choices[q.correct])}`);
    q.onAnswer?.(sampler, ok);
    render({ ok, chosen: i });
  }

  function render(result) {
    const entering = fresh;
    fresh = false;
    const figures = q.choices.some((c) => typeof c !== "string");
    const choices = el("div", { class: `lo-choices${figures ? " lo-choices--figures" : ""}`, role: "group", "aria-label": "Alternativas" },
      q.choices.map((label, i) => {
        let cls = figures ? "lo-choice lo-choice--figure" : "lo-choice";
        if (result) {
          if (i === q.correct) cls += " is-ok";
          else if (i === result.chosen) cls += " is-miss";
          else cls += " is-dim";
        }
        const content = typeof label === "string" ? label : label.node();
        return el("button", { class: cls, style: `--i:${i}`, disabled: result ? "" : null, "aria-label": figures ? textOf(label) : null, onclick: () => pick(i) }, content);
      }));
    const stage = el("div", { class: "lo-stage" },
      q.visual ? el("div", { class: `lo-panel${entering ? " is-entering" : ""}` }, q.visual(Boolean(result))) : "",
      choices);
    let text = "";
    if (result) text = result.ok ? `¡Bien! ${q.explain}` : `No era ${textOf(q.choices[result.chosen])}. ${q.explain}`;
    root.replaceChildren(
      progress(run, { bump: result?.ok }),
      questionCard({ ...q, entering }),
      stage,
      feedback(text, result ? result.ok : null),
      el("div", { class: "lo-actions" },
        q.replay ? el("button", { class: "lo-btn lo-btn--ghost", onclick: () => q.replay.play(sampler) }, q.replay.label) : "",
        result ? (q.extras ?? []).map((x) => el("button", { class: "lo-btn lo-btn--ghost", onclick: () => x.play(sampler) }, x.label)) : "",
        result ? el("button", { class: "lo-btn", onclick: run.last ? summary : next }, run.last ? "Ver resultado" : "Siguiente →") : ""),
    );
    if (result) {
      const buttons = choices.querySelectorAll(".lo-choice");
      celebrate({ stage, ok: result.ok, streak: run.streak, anchor: buttons[result.chosen], shake: choices });
    }
  }

  function summary() {
    renderSummary(root, run, { onRestart: start, onBack: intro });
  }

  intro();
  return () => container.replaceChildren();
}
