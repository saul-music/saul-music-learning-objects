// OA «Disminuidos y aumentados»: la 5ª baja (dim) o sube (aug) medio tono.
import { drawKeyboard, el, mountChoiceQuiz } from "@saul-music/lo-kit";
import { chordName, joinNotes, makeQuestion, notesOf, voicing } from "./theory.js";

export * from "./theory.js";

const play = (midis) => (s) => { s?.chord(midis); s?.sequence(midis.slice(0, 3), { delay: 1.5, gap: 0.42 }); };
const keys = (root, kind, hot = -1) => drawKeyboard({
  marks: voicing(root, kind).slice(0, 3).map((m, i) => ({ midi: m, kind: i === hot ? "answer" : i === 0 ? "source" : "hint", label: notesOf(root, kind)[i] })),
});

function toQuiz(t) {
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain };
  const mid = voicing(t.root, t.kind ?? t.to);
  if (t.type === "identify") {
    return {
      ...base, eyebrow: "Mira las notas", big: joinNotes(t.notes), ask: "¿Qué acorde es?", choiceKind: "chord",
      visual: () => el("div", { class: "lo-da" }, keys(t.root, t.kind)),
      onShow: play(mid), replay: { label: "▶ Oír el acorde", play: play(mid) },
    };
  }
  if (t.type === "fifth") {
    return {
      ...base, eyebrow: "Acorde", big: chordName(t.root, t.kind), bigKind: "chord", ask: "¿Cuál es su 5ª?", choiceKind: "note",
      visual: (answered) => el("div", { class: "lo-da" }, keys(t.root, t.kind, answered ? 2 : -1)),
      onAnswer: play(mid), replay: { label: "▶ Oír el acorde", play: play(mid) },
    };
  }
  const fromMidi = voicing(t.root, t.from);
  return {
    ...base, eyebrow: `De ${chordName(t.root, t.from)} a ${chordName(t.root, t.to)}`, big: "?", ask: "¿Qué cambia?", choiceKind: "text",
    visual: (answered) => el("div", { class: "lo-da" }, keys(t.root, answered ? t.to : t.from, answered ? 2 : -1)),
    onShow: play(fromMidi), replay: { label: `▶ Oír ${chordName(t.root, t.from)}`, play: play(fromMidi) },
    extras: [{ label: `▶ ${chordName(t.root, t.to)}`, play: play(mid) }],
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata, sampler, sfx, cover, next, className: "lo-dimaug",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => ({
      node: el("div", { class: "lo-da" }, keys("C", "dim", 2)),
      caption: "Cdim es C – E♭ – G♭: como Cm, pero con la 5ª medio tono más abajo. Caug sube esa 5ª: C – E – G♯.",
      onReplay: () => play(voicing("C", "dim"))(s),
      replayLabel: "▶ Oír Cdim",
    }),
  });
}
