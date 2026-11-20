// Capa de juego común a los OA: escenario, marcador, cronómetro, cuenta regresiva, efectos de acierto
// y error, y pantalla de resultados. La lógica de cada OA no cambia; esto es cómo se juega y se siente.
import { bindSound } from "./sound.js";
import { el, svg } from "./dom.js";
import { richText } from "./notes.js";
import { SCORING, starsFor } from "./score.js";

export { createRun } from "./score.js";

const fmt = (n) => Math.round(n).toLocaleString("es-CL");
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Texto con las notas alteradas en tipografía musical (acepta también nodos o listas). */
export const rich = (x) => (typeof x === "string" ? richText(x) : x);

/**
 * Escenario del juego: un fondo con símbolos musicales que flotan (fijo) y una pantalla que cambia.
 * @returns {{ root: HTMLElement, screen: HTMLElement }}
 */
export function createShell(container, className = "", sampler) {
  const glyphs = ["♪", "♫", "♩", "♯", "♭", "𝄞", "♬", "𝄢"];
  const bg = el("div", { class: "lo-bg", "aria-hidden": "true" },
    glyphs.concat(glyphs).map((g, i) => el("span", { style: `--x:${(i * 37) % 100}%;--d:${14 + (i % 5) * 3}s;--delay:${-i * 2.1}s;--s:${0.8 + (i % 4) * 0.35}` }, g)));
  const screen = el("div", { class: "lo-screen" });
  const root = el("section", { class: `lo-game ${className}`.trim() }, bg, screen);
  container.replaceChildren(root);
  bindSound(root, sampler);
  return { root, screen };
}

/** Anima un número de `from` a `to`. */
export function animateNumber(node, from, to, dur = 650) {
  if (reducedMotion() || from === to) {
    node.textContent = fmt(to);
    return;
  }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    node.textContent = fmt(from + (to - from) * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Botón de efectos de sonido (encendido/apagado). */
function soundToggle(sfx) {
  if (!sfx) return "";
  const btn = el("button", { class: "lo-hud__sound", type: "button" });
  const paint = () => {
    // Parlante plano en SVG (sin emoji): con ondas si suena, tachado si está en silencio.
    const icon = svg("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" });
    icon.append(svg("path", { d: "M4 9h4l5-4v14l-5-4H4z", class: "body" }));
    if (sfx.muted) icon.append(svg("path", { d: "M16 9l5 6M21 9l-5 6", class: "wave" }));
    else icon.append(svg("path", { d: "M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12", class: "wave" }));
    btn.replaceChildren(icon);
    btn.setAttribute("aria-label", sfx.muted ? "Activar efectos de sonido" : "Silenciar efectos de sonido");
    btn.setAttribute("aria-pressed", String(!sfx.muted));
  };
  btn.addEventListener("click", () => {
    sfx.setMuted(!sfx.muted);
    paint();
    sfx.tap();
  });
  paint();
  return btn;
}

/**
 * Marcador: ronda, pista de 10 casillas (gana/pierde), puntos, combo y sonido; debajo, el cronómetro
 * del bono por rapidez (no corta la pregunta: solo baja el bono).
 */
export function hud(run, { sfx, answered = false, gained = 0, timer = true } = {}) {
  const track = el("ol", { class: "lo-hud__track", "aria-hidden": "true" },
    Array.from({ length: run.rounds }, (_, i) => {
      const r = run.results[i];
      const cls = r === true ? "is-win" : r === false ? "is-lose" : i === run.round - 1 ? "is-current" : "";
      return el("li", { class: cls });
    }));
  const num = el("b", { class: "lo-hud__num" }, fmt(run.points - gained));
  if (gained) requestAnimationFrame(() => animateNumber(num, run.points - gained, run.points));
  const combo = run.streak >= 3
    ? el("span", { class: `lo-hud__combo x${Math.min(4, run.streak >= 8 ? 4 : run.streak >= 5 ? 3 : 2)}`, title: `Racha de ${run.streak}` },
      `×${run.streak >= 8 ? 4 : run.streak >= 5 ? 3 : 2}`, el("small", {}, "combo"))
    : el("span", { class: "lo-hud__combo" });
  const bar = el("div", { class: "lo-hud" },
    el("div", { class: "lo-hud__round" }, el("span", { class: "lo-hud__label" }, "Ronda"), el("b", {}, `${run.round}/${run.rounds}`)),
    track,
    combo,
    el("div", { class: "lo-hud__points", "aria-label": `${run.points} puntos` }, el("span", { class: "lo-hud__label" }, "Puntos"), num),
    soundToggle(sfx));
  if (!timer) return bar;
  // Al responder, el cronómetro queda congelado donde iba.
  const frac = answered ? Math.min(1, run.lastMs / SCORING.speedWindow) : 0;
  const fill = el("i", { style: answered ? `width:${(1 - frac) * 100}%` : `animation-duration:${SCORING.speedWindow}ms` });
  return el("div", { class: "lo-hud-wrap" }, bar,
    el("div", { class: `lo-timer${answered ? " is-stopped" : ""}`, role: "presentation", title: "Bono por rapidez" }, fill));
}

/** Tarjeta grande de la pregunta. `big` y `ask` pueden ser texto o nodos. */
export function questionCard({ eyebrow, big, spoken, sub, ask, entering, bigClass = "" }) {
  return el("div", { class: `lo-card${entering ? " is-entering" : ""}` },
    eyebrow ? el("p", { class: "lo-card__eyebrow" }, rich(eyebrow)) : "",
    big != null ? el("p", { class: `lo-card__big ${bigClass}`.trim() }, rich(big)) : "",
    spoken ? el("p", { class: "lo-card__spoken" }, `se dice «${spoken}»`) : "",
    sub ? el("p", { class: "lo-card__sub" }, rich(sub)) : "",
    ask ? el("p", { class: "lo-card__ask" }, rich(ask)) : "");
}

/** Texto de retroalimentación (vacío antes de responder, para que no salte el diseño). */
export function feedback(text, ok) {
  const cls = ok == null ? "" : ok ? " is-win" : " is-lose";
  return el("div", { class: `lo-feedback${cls}`, "aria-live": "polite" },
    ok == null ? "" : el("span", { class: "lo-feedback__icon", "aria-hidden": "true" }, ok ? "✓" : "✕"),
    el("p", {}, rich(text ?? "")));
}

/** Cuenta regresiva «3, 2, 1, ¡Ya!» sobre el escenario. */
export function countdown(host, sfx) {
  return new Promise((resolve) => {
    if (reducedMotion()) return resolve();
    const layer = el("div", { class: "lo-countdown", "aria-live": "assertive" });
    // El escenario está vacío mientras cuenta: sin altura propia la capa se recorta.
    const prevMin = host.style.minHeight;
    host.style.minHeight = "min(70vh, 26rem)";
    host.append(layer);
    const steps = ["3", "2", "1", "¡Ya!"];
    steps.forEach((s, i) => {
      setTimeout(() => {
        layer.replaceChildren(el("span", { class: i === 3 ? "is-go" : "" }, s));
        if (i === 3) sfx?.go();
        else sfx?.tick();
      }, i * 560);
    });
    setTimeout(() => {
      layer.remove();
      host.style.minHeight = prevMin;
      resolve();
    }, steps.length * 560);
  });
}

/** Destello de color (gana/pierde) sobre todo el escenario. */
function flash(host, ok) {
  const f = el("div", { class: `lo-flash ${ok ? "is-win" : "is-lose"}`, "aria-hidden": "true" });
  host.append(f);
  setTimeout(() => f.remove(), 700);
}

/**
 * Efecto de juego al responder: destello, cartel, puntos que suben, confeti y sonido al acertar;
 * destello, temblor y sonido al fallar.
 */
export function celebrate({ host, stage, result, anchor, shake, sfx }) {
  const { ok, gained, multiplier, fast, streak } = result;
  flash(host, ok);
  if (ok) sfx?.correct(multiplier);
  else sfx?.wrong();
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
  const word = ok
    ? fast && streak >= 3 ? "¡IMPARABLE!" : fast ? "¡RÁPIDO!" : streak >= 5 ? "¡EN LLAMAS!" : streak >= 3 ? "¡EN RACHA!" : pickOne(["¡CORRECTO!", "¡BIEN!", "¡ESO ES!"])
    : pickOne(["¡UY!", "¡CASI!", "¡OH, NO!"]);
  const banner = el("div", { class: `lo-banner ${ok ? "is-win" : "is-lose"}` },
    el("span", { class: "lo-banner__word" }, word),
    ok ? el("span", { class: "lo-banner__sub" }, `+${fmt(gained)} puntos${multiplier > 1 ? ` · combo ×${multiplier}` : ""}`) : "",
    !ok ? el("span", { class: "lo-banner__sub" }, "Mira la respuesta") : "");
  banner.style.top = `${Math.min(Math.max(at.y - 80, box.height * 0.18), box.height * 0.78)}px`;
  fx.append(banner);
  if (!ok) {
    shake?.classList.add("is-shaking");
    return;
  }
  const pieces = 26 + Math.min(streak, 6) * 5;
  for (let i = 0; i < pieces; i++) {
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
    const dist = 70 + Math.random() * 110;
    const kind = ["", " is-win", " is-ivory"][i % 3];
    fx.append(el("i", {
      class: `lo-confetti${kind}${i % 4 === 0 ? " is-round" : ""}`,
      style: `left:${at.x}px;top:${at.y}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 40}px;--rot:${Math.random() * 720 - 360}deg;--delay:${Math.random() * 90}ms`,
    }));
  }
}

/** Estrella para resultados y mapa. */
export function starIcon(filled, { cls = "" } = {}) {
  const s = svg("svg", { viewBox: "0 0 24 24", class: `lo-star${filled ? " is-on" : ""} ${cls}`.trim(), "aria-hidden": "true" });
  s.append(svg("path", { d: "M12 2.6l2.9 6 6.5.9-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.1 1.1-6.5L2.6 9.5l6.5-.9z" }));
  return s;
}

/**
 * Pantalla de resultados: estrellas que aparecen una a una, puntos que cuentan, récord,
 * estadísticas, repaso de errores y botones (siguiente juego, otra vez, inicio).
 */
export function renderResults(screen, run, { sfx, save, next, onRestart, onBack }) {
  const stars = starsFor(run.score, run.rounds);
  const saved = save ? save({ points: run.points, stars }) : { newRecord: false, best: { points: run.points } };
  const title = stars === 3 ? "¡Nivel perfecto!" : stars >= 1 ? "¡Nivel completado!" : "¡Sigue practicando!";
  const starRow = el("div", { class: "lo-results__stars" }, [0, 1, 2].map((i) => starIcon(i < stars, { cls: `s${i}` })));
  const num = el("b", { class: "lo-results__points" }, "0");
  const misses = run.misses.length
    ? el("details", { class: "lo-results__review" },
      el("summary", {}, `Para repasar (${run.misses.length})`),
      el("ul", {}, run.misses.map((m) => el("li", {}, rich(m)))))
    : el("p", { class: "lo-results__perfect" }, "Sin errores. ¡Así se hace!");
  screen.replaceChildren(el("div", { class: `lo-results stars-${stars}` },
    el("p", { class: "lo-kicker" }, "Resultado"),
    el("h2", {}, title),
    starRow,
    el("div", { class: "lo-results__score" }, num, el("span", {}, "puntos")),
    saved.newRecord ? el("p", { class: "lo-badge" }, "¡Nuevo récord!")
      : saved.first ? el("p", { class: "lo-badge lo-badge--first" }, "¡Tu primer récord!")
        : el("p", { class: "lo-results__best" }, `Récord: ${fmt(saved.best.points)}`),
    el("dl", { class: "lo-results__stats" },
      el("div", {}, el("dt", {}, "Aciertos"), el("dd", {}, `${run.score}/${run.rounds}`)),
      el("div", {}, el("dt", {}, "Racha máxima"), el("dd", {}, String(run.maxStreak))),
      el("div", {}, el("dt", {}, "Precisión"), el("dd", {}, `${Math.round((run.score / run.rounds) * 100)}%`))),
    misses,
    el("div", { class: "lo-actions lo-actions--center" },
      next ? el("button", { class: "lo-btn lo-btn--game", onclick: next.go }, rich(`Siguiente: ${next.title} →`)) : "",
      el("button", { class: next ? "lo-btn lo-btn--game lo-btn--alt" : "lo-btn lo-btn--game", onclick: onRestart }, "↻ Jugar otra vez"),
      el("button", { class: "lo-btn lo-btn--ghost", onclick: onBack }, "Volver al inicio"))));
  sfx?.fanfare();
  requestAnimationFrame(() => animateNumber(num, 0, run.points, 1200));
  starRow.querySelectorAll(".lo-star.is-on").forEach((_, i) => setTimeout(() => sfx?.star(i), 450 + i * 320));
}
