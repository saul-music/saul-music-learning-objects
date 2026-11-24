// OA «Lee la partitura»: cómo se leen las líneas de acordes de Acordia.
import { chordLabel, el, mountChoiceQuiz } from "@saul-music/lo-kit";
import { makeQuestion } from "./theory.js";

export * from "./theory.js";

/** Un compás como en la partitura: acordes en tipografía musical y símbolos tal cual. */
function barNode(text, { asked = false, focus = -1 } = {}) {
  const parts = text.split("-");
  return el("li", { class: `lo-rc__bar${asked ? " is-asked" : ""}` },
    parts.map((p, i) => [
      i ? el("span", { class: "lo-rc__dash", "aria-hidden": "true" }, "-") : "",
      /^[A-G]/.test(p) ? el("span", { class: i === focus ? "lo-rc__hot" : "" }, chordLabel(p)) : el("b", { class: "lo-rc__sym" }, p),
    ]));
}

function toQuiz(t) {
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain, choiceKind: t.type === "which" ? "chord" : t.type === "meaning" ? "text" : "number" };
  const line = (label, bars, opts = {}) => el("div", { class: "lo-rc" },
    el("p", { class: "lo-rc__label" }, label),
    el("ol", { class: "lo-rc__bars" }, bars.map((b, i) => barNode(b, { asked: opts.asked === i, focus: opts.focus ?? -1 }))));
  const sign = `${t.beats}/4`;
  if (t.type === "which") {
    return { ...base, eyebrow: `Compás de ${sign}`, big: "?", ask: `¿Qué acorde suena en el compás ${t.ask + 1}?`,
      visual: (a) => line("Estrofa:", t.bars, { asked: a ? -1 : t.ask }) };
  }
  if (t.type === "beats") {
    return { ...base, eyebrow: `Compás de ${sign}`, big: t.chord, bigKind: "chord", ask: `¿Cuántos tiempos dura ${t.chord} en este compás?`,
      visual: () => line("Un compás:", t.bars, { focus: t.focus }) };
  }
  if (t.type === "sound") {
    return { ...base, eyebrow: `Compás de ${sign}`, big: "?", ask: "¿Cuántos tiempos suenan (sin contar el silencio)?",
      visual: () => line("Un compás:", t.bars) };
  }
  if (t.type === "total") {
    return { ...base, eyebrow: "Sección repetida", big: "x2", ask: "Esta sección se toca dos veces. ¿Cuántos compases son en total?",
      visual: () => line("Coro x2:", t.bars) };
  }
  return { ...base, eyebrow: "Símbolo de la partitura", big: t.symbol, ask: "¿Qué significa?", visual: () => el("span") };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata, sampler, sfx, cover, next, className: "lo-readchart",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: () => ({
      node: el("div", { class: "lo-rc" },
        el("p", { class: "lo-rc__label" }, "Estrofa x2:"),
        el("ol", { class: "lo-rc__bars" }, ["C", "%", "G-Am", "F-_-G-."].map((b) => barNode(b)))),
      caption: "Cada espacio separa un compás. C, y % lo repite; G-Am son dos acordes de 2 tiempos; en F-_-G-. el _ alarga F y el . es un silencio. Todo x2.",
    }),
  });
}
