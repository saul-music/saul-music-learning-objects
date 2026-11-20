// OA «Escalera del acorde»: el arpegio 1ª – 3ª – 5ª – 8ª.
import { drawKeyboard, el, mountChoiceQuiz } from "@saul-music/lo-kit";
import { Note } from "tonal";
import { arpeggio, makeQuestion, qualityLabel, semitonesOf, STEPS } from "./theory.js";

export * from "./theory.js";

const midisOf = (root, quality) => {
  const base = Note.midi(`${root}3`);
  return semitonesOf(quality).map((s) => base + s);
};

/** La escalera: cuatro peldaños que suben, con la nota de cada paso. */
function ladder(notes, { hide = -1, highlight = -1, answered = false } = {}) {
  return el("ol", { class: "lo-arp__ladder" },
    notes.map((n, i) => {
      let cls = "lo-arp__rung";
      if (i === hide || i === highlight) cls += answered ? " is-answer" : " is-asked";
      return el("li", { class: cls, style: `--i:${i}` },
        el("small", {}, `${STEPS[i]}ª`),
        el("b", {}, i === hide && !answered ? "?" : n));
    }));
}

function toQuiz(t) {
  const midis = midisOf(t.root, t.quality);
  const playArp = (s) => { s?.sequence(midis, { gap: 0.4 }); s?.chord(midis.slice(0, 3), { delay: 1.8 }); };
  const idx = STEPS.indexOf(t.step);
  const title = `${t.root} ${qualityLabel(t.quality)}`;
  // Antes de responder, las etiquetas no deben delatar la respuesta (en «¿qué paso es?», ni por descarte).
  const stepLabel = (i, answered) => {
    if (answered) return `${STEPS[i]}ª`;
    if (t.type === "whichStep") return i === idx ? t.note : undefined;
    return i === idx ? "?" : `${STEPS[i]}ª`;
  };
  const keyboard = (answered) => drawKeyboard({
    marks: midis.map((m, i) => ({
      midi: m,
      kind: i === idx ? (answered ? "answer" : "source") : "hint",
      label: stepLabel(i, answered),
    })),
  });
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain, replay: { label: "▶ Oír el arpegio", play: playArp } };
  if (t.type === "missing") {
    return {
      ...base,
      eyebrow: "Arpegio de",
      big: title,
      ask: `¿Qué nota falta en la ${t.step}ª?`,
      visual: (answered) => el("div", { class: "lo-arp" }, ladder(t.notes, { hide: idx, answered }), keyboard(answered)),
      onAnswer: playArp,
    };
  }
  if (t.type === "step") {
    return {
      ...base,
      eyebrow: "Arpegio de",
      big: title,
      ask: `¿Cuál es su ${t.step}ª${t.step === 8 ? " (octava)" : ""}?`,
      visual: (answered) => el("div", { class: "lo-arp" },
        ladder(arpeggio(t.root, t.quality).map((n, i) => (i === 0 || answered ? n : "·")), { highlight: idx, hide: answered ? -1 : idx, answered }),
        keyboard(answered)),
      onAnswer: playArp,
    };
  }
  return {
    ...base,
    eyebrow: `En ${title}`,
    big: t.note,
    ask: "¿Qué paso del arpegio es?",
    visual: (answered) => el("div", { class: "lo-arp" },
      ladder(t.notes.map((n, i) => (i === idx || answered ? n : "·")), { highlight: idx, answered }),
      keyboard(answered)),
    onAnswer: playArp,
  };
}

export function mount(container, { sampler, metadata }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    className: "lo-arpeggios",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const notes = arpeggio("C", "major");
      const midis = midisOf("C", "major");
      const node = el("div", { class: "lo-arp lo-arp--demo" },
        ladder(notes),
        drawKeyboard({ marks: midis.map((m, i) => ({ midi: m, kind: "answer", label: `${STEPS[i]}ª` })) }));
      return {
        node,
        caption: "C mayor: C (1ª), E (3ª), G (5ª) y otra vez C (8ª). Cuatro peldaños que forman el acorde.",
        onReplay: () => { s?.sequence(midis, { gap: 0.4 }); s?.chord(midis.slice(0, 3), { delay: 1.8 }); },
        replayLabel: "▶ Oír el arpegio",
      };
    },
  });
}
