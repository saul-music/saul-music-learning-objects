// OA «Luz y sombra»: reconocer de oído acordes mayores y menores.
import { drawKeyboard, el, mountChoiceQuiz, svg } from "@saul-music/lo-kit";
import { chordSymbol, makeQuestion, voicing } from "./theory.js";

export * from "./theory.js";

/** Cómo suena: rasgueo y luego arpegio, para que se oiga bien la 3ª. */
function playChord(sampler, midis) {
  sampler?.chord(midis);
  sampler?.sequence(midis.slice(0, 3), { delay: 1.5, gap: 0.42 });
}

/** Disco de escucha: ondas que laten mientras se oye el acorde. */
function listenDisc(onClick) {
  const node = svg("svg", { viewBox: "0 0 200 200", class: "lo-ear__disc", role: "button", tabindex: 0, "aria-label": "Volver a oír el acorde" });
  for (const r of [92, 74, 56]) node.append(svg("circle", { cx: 100, cy: 100, r, class: "ring" }));
  node.append(svg("circle", { cx: 100, cy: 100, r: 44, class: "core" }));
  node.append(svg("text", { x: 100, y: 116, class: "note" }, "♪"));
  node.addEventListener("click", onClick);
  node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } });
  return node;
}

export function mount(container, { sampler, metadata }) {
  const toQuiz = (t) => {
    const play = (s) => playChord(s, t.midis);
    return {
      choices: t.choices,
      correct: t.correct,
      explain: t.explain,
      recap: t.explain,
      eyebrow: "Escucha el acorde",
      big: "?",
      ask: "¿Es mayor o menor?",
      visual: (answered) => answered
        ? el("div", { class: "lo-ear__reveal" },
          el("p", { class: "lo-ear__symbol" }, chordSymbol(t.root, t.quality)),
          drawKeyboard({ marks: t.midis.slice(0, 3).map((m, i) => ({ midi: m, kind: i === 1 ? "answer" : "hint", label: t.notes[i] })) }))
        : el("div", { class: "lo-ear__listen" }, listenDisc(() => play(sampler))),
      onShow: play,
      replay: { label: "▶ Oír otra vez", play },
      extras: [
        { label: `▶ ${chordSymbol(t.root, "major")} (mayor)`, play: (s) => playChord(s, voicing(t.root, "major")) },
        { label: `▶ ${chordSymbol(t.root, "minor")} (menor)`, play: (s) => playChord(s, voicing(t.root, "minor")) },
      ],
    };
  };
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    className: "lo-ear",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const node = el("div", { class: "lo-ear__demo" },
        el("button", { class: "lo-ear__pair is-major", onclick: () => playChord(s, voicing("C", "major")) },
          el("b", {}, "C"), el("span", {}, "mayor · luz"), el("small", {}, "C – E – G")),
        el("button", { class: "lo-ear__pair is-minor", onclick: () => playChord(s, voicing("C", "minor")) },
          el("b", {}, "Cm"), el("span", {}, "menor · sombra"), el("small", {}, "C – Eb – G")));
      return {
        node,
        caption: "Solo cambia una nota: la 3ª. En C mayor es E (4 semitonos sobre C); en C menor baja a Eb (3). Toca cada uno y compáralos.",
      };
    },
  });
}
