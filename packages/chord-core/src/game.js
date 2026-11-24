// Pieza de interfaz compartida: convierte una pregunta «de datos» (ver testing.js) en lo que dibuja `mountChoiceQuiz`.
// Pregunta: { type, eyebrow, big, bigKind?, ask, choices: string[], correct, choiceKind?, explain, recap?,
//   visual?, visualAnswered?, play?, autoplay?, playOnAnswer? }
// visual: { kind: "keyboard", marks, from, to } | { kind: "shapes", items: [{ name, shape }] } | { kind: "text", lines: [string] }
// play: { label?, chords?: [midis[]], notes?: [midi], gap? }
import "./style.css";
import { drawChordBox } from "@saul-music/lo-chord-shapes";
import { chordLabel, drawKeyboard, el, mountChoiceQuiz, richText } from "@saul-music/lo-kit";

export function visualNode(v) {
  if (v.kind === "keyboard") return el("div", { class: "lo-cc" }, drawKeyboard({ marks: v.marks, from: v.from, to: v.to, letters: true }));
  if (v.kind === "shapes") {
    return el("div", { class: "lo-cc lo-cc--shapes" },
      v.items.map((it) => el("figure", { class: "lo-cc__shape" }, drawChordBox(it.shape, { label: `Diagrama de ${it.name}` }), el("figcaption", {}, it.name ? chordLabel(it.name) : ""))));
  }
  return el("div", { class: "lo-cc" }, v.lines.map((l) => el("p", { class: "lo-cc__line" }, ...richText(l))));
}

/** Reproduce lo que pide `play`: acordes seguidos o una nota tras otra. */
export const playFn = (play) => (sampler) => {
  if (!sampler || !play) return;
  const gap = play.gap ?? 1.3;
  if (play.notes) sampler.sequence(play.notes, { gap: play.gap ?? 0.45 });
  (play.chords ?? []).forEach((m, i) => sampler.chord(m, { delay: i * gap, strum: 0.04, duration: gap * 1.7 }));
};

export function toQuiz(spec) {
  const { play, autoplay, playOnAnswer, visual, visualAnswered, ...rest } = spec;
  const q = { ...rest, recap: spec.recap ?? spec.explain };
  if (visual) q.visual = (answered) => visualNode(answered && visualAnswered ? visualAnswered : visual);
  if (play) {
    const run = playFn(play);
    q.replay = { label: play.label ?? "▶ Oír", play: run };
    if (autoplay) q.onShow = run;
    if (playOnAnswer) q.onAnswer = run;
  }
  return q;
}

/**
 * @param {HTMLElement} container
 * @param {{sampler, sfx, metadata, cover, next}} ctx
 * @param {{ makeQuestion: (rng) => object, demo?: object, className?: string }} game
 */
export function mountTheoryGame(container, { sampler, sfx, metadata, cover, next }, { makeQuestion, demo, className = "lo-cc-game" }) {
  return mountChoiceQuiz(container, {
    metadata, sampler, sfx, cover, next, className,
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: demo && (({ sampler: s }) => ({
      node: visualNode(demo.visual),
      caption: demo.caption,
      onReplay: demo.play ? () => playFn(demo.play)(s) : undefined,
      replayLabel: demo.play?.label,
    })),
  });
}
