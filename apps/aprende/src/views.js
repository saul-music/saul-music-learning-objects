// Piezas de pantalla de Aprende. Todo texto entra al DOM con nodos de texto (`el`/`rich`), nunca con innerHTML.
import { drawKeyboard, el, LETTERS, noteLabel, rich, spoken, starIcon } from "@saul-music/lo-kit";

export const stars = (n) => el("span", { class: "ap-stars", role: "img", "aria-label": `${n} de 3 estrellas` }, [0, 1, 2].map((i) => starIcon(i < n)));

/** Dibuja la figura de una diapositiva (ver lessons/basico.js). */
export function figureNode(figure) {
  if (figure.type === "keyboard") return el("div", { class: "ap-figure" }, drawKeyboard(figure));
  if (figure.type === "notes") {
    return el("div", { class: "ap-figure lo-keys" },
      LETTERS.map((n, k) => el("span", { class: "lo-key", style: `--k:${k}` }, noteLabel(n), el("small", {}, spoken(n)))));
  }
  return el("table", { class: "ap-table" },
    el("thead", {}, el("tr", {}, figure.head.map((h) => el("th", { scope: "col" }, rich(h))))),
    el("tbody", {}, figure.rows.map((row) => el("tr", {}, row.map((c) => el("td", {}, rich(c)))))));
}

/** Una diapositiva: título, párrafos, figura y botones de oír. */
export function slideCard(slide, { eyebrow, onListen }) {
  return el("article", { class: "ap-slide" },
    el("p", { class: "ap-kicker" }, rich(eyebrow)),
    el("h2", { tabindex: "-1" }, rich(slide.title)), // tabindex -1: se le pasa el foco al cambiar de diapositiva
    slide.text.map((t) => el("p", {}, rich(t))),
    slide.figure ? figureNode(slide.figure) : "",
    slide.listen?.length
      ? el("div", { class: "ap-listen" }, slide.listen.map((l) => el("button", { class: "lo-btn lo-btn--ghost lo-btn--sm", type: "button", onclick: () => onListen(l) }, l.label)))
      : "");
}

/** Pantalla con un mensaje y, si hace falta, una acción (entrar, reintentar). */
export function messageView({ title, text, action }) {
  return el("section", { class: "ap-message" },
    el("h1", {}, title),
    el("p", {}, text),
    action ? el(action.href ? "a" : "button", { class: "lo-btn lo-btn--game", href: action.href, type: action.href ? null : "button", onclick: action.onclick }, action.label) : "");
}
