// OA «Acordes de quinta»: X5 = raíz + 5ª, sin 3ª.
import { drawKeyboard, el, mountChoiceQuiz } from "@saul-music/lo-kit";
import { chordName, joinNotes, makeQuestion, notesOf, voicing } from "./theory.js";

export * from "./theory.js";

const play = (midis) => (s) => { s?.chord(midis); s?.sequence(midis.slice(0, -1), { delay: 1.5, gap: 0.42 }); };
const marks = (root, kind) => {
  const midis = voicing(root, kind).slice(0, -1);
  const names = notesOf(root, kind);
  return midis.map((m, i) => ({ midi: m, kind: i === 0 ? "source" : "answer", label: names[i] }));
};

function toQuiz(t) {
  const midis = voicing(t.root, t.kind);
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain };
  if (t.type === "identify") {
    return {
      ...base, eyebrow: "Mira las notas", big: joinNotes(t.notes), ask: "¿Qué acorde es?", choiceKind: "chord",
      visual: () => el("div", { class: "lo-pw" }, drawKeyboard({ marks: marks(t.root, t.kind) })),
      onShow: play(midis), replay: { label: "▶ Oír el acorde", play: play(midis) },
    };
  }
  if (t.type === "notes") {
    return {
      ...base, eyebrow: "Acorde de quinta", big: chordName(t.root, "power"), bigKind: "chord", ask: "¿Qué notas lo forman?", choiceKind: "text",
      visual: (answered) => el("div", { class: "lo-pw" }, answered ? drawKeyboard({ marks: marks(t.root, "power") }) : el("p", { class: "lo-pw__hint" }, "X5 = raíz + 5ª")),
      onAnswer: play(midis), replay: { label: "▶ Oír el acorde", play: play(midis) },
    };
  }
  const fromMidis = voicing(t.root, t.from);
  return {
    ...base, eyebrow: `De ${t.root}${t.from === "minor" ? "m" : ""} a ${t.root}5`, big: "?", ask: "¿Qué nota desaparece?", choiceKind: "text",
    visual: (answered) => el("div", { class: "lo-pw" }, drawKeyboard({ marks: voicing(t.root, t.from).slice(0, -1).map((m, i) => ({ midi: m, kind: i === 1 ? (answered ? "answer" : "source") : "hint", label: notesOf(t.root, t.from)[i] })) })),
    onShow: play(fromMidis), replay: { label: `▶ Oír ${t.root}${t.from === "minor" ? "m" : ""}`, play: play(fromMidis) },
    extras: [{ label: `▶ ${t.root}5`, play: play(midis) }],
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata, sampler, sfx, cover, next, className: "lo-power",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => ({
      node: el("div", { class: "lo-pw" }, drawKeyboard({ marks: marks("E", "power") })),
      caption: "E5 son solo E y B: la raíz y la 5ª. Sin 3ª, ni mayor ni menor: suena abierto y firme.",
      onReplay: () => play(voicing("E", "power"))(s),
      replayLabel: "▶ Oír E5",
    }),
  });
}
