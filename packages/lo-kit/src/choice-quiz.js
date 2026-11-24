// Juego de alternativas: el OA solo aporta las preguntas (y, si quiere, un ejemplo para la intro).
// El kit pone el juego: título, cuenta regresiva, marcador, cronómetro, efectos y resultados.
import { el } from "./dom.js";
import { renderIntro } from "./intro.js";
import { chordLabel, noteLabel } from "./notes.js";
import { celebrate, centerOnPhone, countdown, createRun, createShell, feedback, hud, questionCard, renderResults, rich } from "./quiz.js";
import { loadBest, saveResult } from "./score.js";

/**
 * Forma de una pregunta (la arma el OA):
 * {
 *   eyebrow?, big?, spoken?, sub?, ask,       // tarjeta (texto o nodos)
 *   bigKind?: "note" | "chord" | "text",      // cómo se escribe `big` si es texto (notas en tipografía musical)
 *   choices: (string | {text: string, node: () => Element, figure?: boolean})[], correct: number,
 *   choiceKind?: "note" | "chord" | "number" | "text",  // cómo se escriben las alternativas de texto
 *   explain: string,                          // se muestra al responder (acierto o error)
 *   recap?: string,                           // línea del repaso si se falla
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
 * @param {object} [o.sampler]  música del OA (guitarra)
 * @param {object} [o.sfx]      efectos de sonido del juego
 * @param {string} [o.cover]    portada (URL)
 * @param {{title: string, go: () => void}} [o.next]  siguiente juego del recorrido
 * @param {(rng: () => number) => object} o.makeQuestion
 * @param {(ctx: {sampler: object}) => object} [o.demo]
 * @param {number} [o.rounds]
 * @param {string} [o.className]
 */
export function mountChoiceQuiz(container, { metadata, sampler, sfx, cover, next, makeQuestion, demo, rounds = 10, className = "" }) {
  const { root, screen } = createShell(container, `lo-quiz ${className}`, sampler);
  const run = createRun(rounds);
  let q = null;
  let fresh = false;
  let playing = false;
  const textOf = (c) => (typeof c === "string" ? c : c.text);

  function intro() {
    playing = false;
    renderIntro(screen, { metadata, rounds, cover, best: loadBest(metadata.id), demo: demo?.({ sampler }), onStart: start });
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
    q = makeQuestion(Math.random);
    fresh = true;
    render(null);
    centerOnPhone(screen);
    run.startQuestion();
    q.onShow?.(sampler);
  }

  function pick(i) {
    if (!playing || q.picked != null) return;
    q.picked = i;
    const result = run.record(i === q.correct, q.recap ?? `${q.ask} → ${textOf(q.choices[q.correct])}`);
    q.onAnswer?.(sampler, result.ok);
    render({ ...result, chosen: i });
  }

  function label(c) {
    if (typeof c !== "string") return c.node();
    if (q.choiceKind === "note") return noteLabel(c);
    if (q.choiceKind === "chord") return chordLabel(c);
    return el("span", { class: q.choiceKind === "number" ? "lo-tile__num" : "lo-tile__text" }, rich(c));
  }

  function bigOf() {
    if (q.big == null || typeof q.big !== "string") return q.big;
    if (q.bigKind === "note") return noteLabel(q.big);
    if (q.bigKind === "chord") return chordLabel(q.big);
    return q.big;
  }

  function render(result) {
    const entering = fresh;
    fresh = false;
    const figures = q.choices.some((c) => typeof c !== "string" && c.figure);
    const tiles = el("div", { class: `lo-tiles${figures ? " lo-tiles--figures" : ""} n${q.choices.length}`, role: "group", "aria-label": "Alternativas" },
      q.choices.map((c, i) => {
        let cls = "lo-tile";
        if (result) {
          if (i === q.correct) cls += result.ok ? " is-win" : " is-answer";
          else if (i === result.chosen) cls += " is-lose";
          else cls += " is-dim";
        }
        return el("button", {
          class: cls, style: `--i:${i}`, disabled: result ? "" : null, "aria-label": typeof c === "string" ? null : textOf(c),
          onclick: () => pick(i),
        }, el("span", { class: "lo-tile__key", "aria-hidden": "true" }, String(i + 1)), label(c));
      }));
    const stage = el("div", { class: "lo-stage" },
      q.visual ? el("div", { class: `lo-panel${entering ? " is-entering" : ""}` }, q.visual(Boolean(result))) : "",
      tiles);
    let text = "";
    if (result) text = result.ok ? q.explain : `Era ${textOf(q.choices[q.correct])}. ${q.explain}`;
    screen.replaceChildren(
      hud(run, { sfx, answered: Boolean(result), gained: result?.gained ?? 0 }),
      questionCard({ ...q, big: bigOf(), bigClass: q.bigKind && q.bigKind !== "text" ? "is-music" : "", entering }),
      stage,
      feedback(text, result ? result.ok : null),
      el("div", { class: "lo-actions" },
        q.replay ? el("button", { class: "lo-btn lo-btn--ghost lo-listen", onclick: () => q.replay.play(sampler) }, rich(q.replay.label)) : "",
        result ? (q.extras ?? []).map((x) => el("button", { class: "lo-btn lo-btn--ghost lo-listen", onclick: () => x.play(sampler) }, rich(x.label))) : "",
        result ? el("button", { class: "lo-btn lo-btn--game lo-btn--next", onclick: advance }, run.last ? "Ver resultado" : "Siguiente", el("kbd", {}, "Enter")) : ""),
    );
    if (result) {
      const buttons = tiles.querySelectorAll(".lo-tile");
      celebrate({ host: root, stage, result, anchor: buttons[result.chosen], shake: tiles, sfx });
    }
  }

  function advance() {
    if (!playing || q?.picked == null) return;
    if (run.last) summary();
    else nextQuestion();
  }

  function summary() {
    playing = false;
    renderResults(screen, run, { sfx, next, save: (r) => saveResult(metadata.id, r), onRestart: start, onBack: intro });
  }

  // Atajos de teclado: 1 a 4 eligen; Enter pasa a la siguiente.
  function onKey(e) {
    if (!playing || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^[1-9]$/.test(e.key) && q && q.picked == null) {
      const i = Number(e.key) - 1;
      if (i < q.choices.length) {
        e.preventDefault();
        pick(i);
      }
    } else if (e.key === "Enter" && q?.picked != null && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      advance();
    }
  }
  addEventListener("keydown", onKey);

  intro();
  return () => {
    removeEventListener("keydown", onKey);
    container.replaceChildren();
  };
}
