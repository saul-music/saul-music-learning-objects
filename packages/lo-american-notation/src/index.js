// OA «Do es C»: clave americana y nombres latinos.
import { drawKeyboard, el, LETTERS, mountChoiceQuiz, spoken } from "@saul-music/lo-kit";
import { makeQuestion, midiOf } from "./theory.js";

export * from "./theory.js";

/** Convierte la pregunta de la teoría en la pregunta del cuestionario (tarjeta, teclado, sonido). */
function toQuiz(t) {
  const midi = midiOf(t.name);
  const play = (sampler) => sampler?.play(midi);
  const base = { choices: t.choices, correct: t.correct, explain: t.explain };
  if (t.type === "toSpoken") {
    return {
      ...base,
      eyebrow: "En clave americana",
      big: t.name,
      ask: "¿Cómo se dice en español?",
      recap: `${t.name} se dice ${spoken(t.name)}.`,
      visual: (answered) => drawKeyboard({ from: 60, to: 71, marks: [{ midi, kind: answered ? "answer" : "source", label: t.name }], letters: answered }),
      onShow: play,
      replay: { label: "▶ Oír la nota", play },
    };
  }
  if (t.type === "toLetter") {
    return {
      ...base,
      eyebrow: "En español se dice",
      big: spoken(t.name),
      ask: "¿Cómo se escribe en clave americana?",
      recap: `${spoken(t.name)} se escribe ${t.name}.`,
      // Antes de responder, el teclado no lleva letras: delatarían la respuesta.
      visual: (answered) => drawKeyboard({ from: 60, to: 71, marks: [{ midi, kind: answered ? "answer" : "source", label: answered ? t.name : "?" }], letters: answered }),
      onShow: play,
      replay: { label: "▶ Oír la nota", play },
    };
  }
  const answerMidi = midiOf(t.answer);
  return {
    ...base,
    eyebrow: "El alfabeto musical",
    big: t.name,
    ask: t.forward ? "¿Qué letra viene después?" : "¿Qué letra viene antes?",
    recap: t.explain,
    visual: (answered) => el("div", { class: "lo-an__ring" },
      LETTERS.map((l) => el("span", {
        class: `lo-an__letter${l === t.name ? " is-source" : ""}${answered && l === t.answer ? " is-answer" : ""}`,
      }, l))),
    onShow: (sampler) => sampler?.play(midi),
    onAnswer: (sampler) => {
      // Hacia adelante sube y hacia atrás baja, aunque el alfabeto dé la vuelta (G → A, A → G).
      let to = answerMidi;
      if (t.forward && to < midi) to += 12;
      if (!t.forward && to > midi) to -= 12;
      sampler?.sequence([midi, to]);
    },
  };
}

export function mount(container, { sampler, metadata }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    className: "lo-an",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      const node = drawKeyboard({ from: 60, to: 71, letters: true, marks: LETTERS.map((l) => ({ midi: midiOf(l), kind: "hint", label: spoken(l).slice(0, 3) })) });
      return {
        node,
        caption: "Siete letras, siete nombres: C D E F G A B se dicen Do Re Mi Fa Sol La Si.",
        onReplay: () => s?.sequence(LETTERS.map(midiOf).sort((a, b) => a - b), { gap: 0.35 }),
        replayLabel: "▶ Oír de C a B",
      };
    },
  });
}
