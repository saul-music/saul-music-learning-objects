// Un solo sonido a la vez: mientras algo suena, los botones «Oír…» (clase `lo-listen`) quedan
// bloqueados y aparece «Reproduciendo…». Funciona con cualquier sampler que ofrezca
// `isSounding()` y `onSounding(fn)` (ver @saul-music/audio).
import { el } from "./dom.js";

export const LISTEN = "lo-listen";

/**
 * @param {HTMLElement} root  escenario del juego
 * @param {{ isSounding(): boolean, onSounding(fn: (on: boolean) => void): () => void }} [sampler]
 * @returns {() => void} para soltar los oyentes
 */
export function bindSound(root, sampler) {
  if (!sampler?.onSounding) return () => {};
  const badge = el("div", { class: "lo-sounding", role: "status", "aria-live": "polite", hidden: "" },
    el("span", { class: "lo-sounding__bars", "aria-hidden": "true" }, el("i"), el("i"), el("i"), el("i")),
    el("span", {}, "Reproduciendo…"));
  root.append(badge);

  const sync = () => {
    const on = sampler.isSounding();
    root.classList.toggle("is-sounding", on);
    badge.hidden = !on;
    for (const b of root.querySelectorAll(`.${LISTEN}`)) {
      if (b instanceof HTMLButtonElement) b.disabled = on;
      b.setAttribute("aria-disabled", String(on));
    }
  };
  const off = sampler.onSounding(sync);
  // Los botones se vuelven a dibujar en cada pregunta: se sincronizan los nuevos.
  const watch = new MutationObserver(sync);
  watch.observe(root, { childList: true, subtree: true });
  // Respaldo para lo que no es <button> (p. ej. el disco de escucha) y para clics antes del bloqueo.
  const block = (e) => {
    if (sampler.isSounding() && e.target.closest?.(`.${LISTEN}`)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };
  root.addEventListener("click", block, true);
  root.addEventListener("keydown", block, true);
  sync();
  return () => {
    off();
    watch.disconnect();
    root.removeEventListener("click", block, true);
    root.removeEventListener("keydown", block, true);
    badge.remove();
  };
}
