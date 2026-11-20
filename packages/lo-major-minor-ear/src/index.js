// OA «Luz y sombra»: reconocer de oído acordes mayores y menores.
import { chordLabel, drawKeyboard, el, mountChoiceQuiz, richText, svg } from "@saul-music/lo-kit";
import { chordSymbol, makeQuestion, voicing } from "./theory.js";

export * from "./theory.js";

/** Cómo suena: rasgueo y luego arpegio, para que se oiga bien la 3ª. */
function playChord(sampler, midis) {
  sampler?.chord(midis);
  sampler?.sequence(midis.slice(0, 3), { delay: 1.5, gap: 0.42 });
}

/** Disco de escucha: ondas que laten mientras se oye el acorde. */
function listenDisc(onClick) {
  const node = svg("svg", { viewBox: "0 0 200 200", class: "lo-ear__disc lo-listen", role: "button", tabindex: 0, "aria-label": "Volver a oír el acorde" });
  for (const r of [92, 74, 56]) node.append(svg("circle", { cx: 100, cy: 100, r, class: "ring" }));
  node.append(svg("circle", { cx: 100, cy: 100, r: 44, class: "core" }));
  node.append(svg("text", { x: 100, y: 116, class: "note" }, "♪"));
  node.addEventListener("click", onClick);
  node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } });
  return node;
}

/** Ficha de respuesta con su ícono: sol para mayor, luna para menor. */
function moodChoice(text, major) {
  return {
    text,
    node: () => {
      const icon = svg("svg", { viewBox: "0 0 40 40", class: "lo-ear__mood", "aria-hidden": "true" });
      if (major) {
        icon.append(svg("circle", { cx: 20, cy: 20, r: 8.5, class: "sun" }));
        for (let k = 0; k < 8; k++) {
          const a = (Math.PI / 4) * k;
          icon.append(svg("line", { x1: 20 + Math.cos(a) * 13, y1: 20 + Math.sin(a) * 13, x2: 20 + Math.cos(a) * 18, y2: 20 + Math.sin(a) * 18, class: "ray" }));
        }
      } else {
        icon.append(svg("path", { d: "M25 6a14 14 0 1 0 9 22A11 11 0 0 1 25 6z", class: "moon" }));
      }
      return el("span", { class: `lo-ear__choice ${major ? "is-major" : "is-minor"}` }, icon, el("b", {}, text));
    },
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  const toQuiz = (t) => {
    const play = (s) => playChord(s, t.midis);
    return {
      choices: [moodChoice("Mayor", true), moodChoice("Menor", false)],
      correct: t.correct,
      explain: t.explain,
      recap: t.explain,
      eyebrow: "Escucha el acorde",
      big: "?",
      ask: "¿Es mayor o menor?",
      visual: (answered) => answered
        ? el("div", { class: "lo-ear__reveal" },
          el("p", { class: "lo-ear__symbol" }, chordLabel(chordSymbol(t.root, t.quality))),
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
    sfx,
    cover,
    next,
    className: "lo-ear",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const node = el("div", { class: "lo-ear__demo" },
        el("button", { class: "lo-ear__pair is-major lo-listen", onclick: () => playChord(s, voicing("C", "major")) },
          el("b", {}, chordLabel("C")), el("span", {}, "mayor · luz"), el("small", {}, richText("C – E – G"))),
        el("button", { class: "lo-ear__pair is-minor lo-listen", onclick: () => playChord(s, voicing("C", "minor")) },
          el("b", {}, chordLabel("Cm")), el("span", {}, "menor · sombra"), el("small", {}, richText("C – Eb – G"))));
      return {
        node,
        caption: "Solo cambia una nota: la 3ª. En C mayor es E (4 semitonos sobre C); en C menor baja a Eb (3). Toca cada uno y compáralos.",
      };
    },
  });
}
