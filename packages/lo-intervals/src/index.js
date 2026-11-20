// OA «El misterio de E#»: intervalos, sostenidos, bemoles y notas raras.
import { drawKeyboard, el, mountChoiceQuiz, spoken } from "@saul-music/lo-kit";
import { Note } from "tonal";
import { chromaticSteps, degreeLabel, makeQuestion } from "./theory.js";

export * from "./theory.js";

/** MIDI de una nota cerca de la 4ª octava, dentro del teclado (C3 a B4). */
function midiOf(name, octave = 4) {
  let m = Note.midi(`${name}${octave}`);
  while (m > 71) m -= 12;
  while (m < 48) m += 12;
  return m;
}

/** MIDI ascendentes de una lista de notas, empezando en la octava 3. */
function ascending(names) {
  const out = [Note.midi(`${names[0]}3`)];
  for (const n of names.slice(1)) {
    const prev = out.at(-1);
    out.push(prev + (((Note.chroma(n) - (prev % 12)) + 12) % 12 || 12));
  }
  return out;
}

const kb = (marks, extra = {}) => drawKeyboard({ marks, ...extra });

function toQuiz(t) {
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain };
  if (t.type === "halfStep") {
    const a = midiOf(t.from);
    const b = a + t.semis;
    return {
      ...base,
      eyebrow: `Medio tono ${t.up ? "arriba" : "abajo"} de`,
      big: t.from,
      spoken: spoken(t.from),
      ask: `¿Qué nota está medio tono ${t.up ? "arriba" : "abajo"}?`,
      visual: (answered) => kb([{ midi: a, kind: "source", label: t.from }, ...(answered ? [{ midi: b, kind: "answer", label: t.answer }] : [])]),
      onShow: (s) => s?.play(a),
      onAnswer: (s) => s?.sequence([a, b]),
      replay: { label: "▶ Oír la nota", play: (s) => s?.play(a) },
    };
  }
  if (t.type === "enharmonic") {
    const m = midiOf(t.from);
    return {
      ...base,
      eyebrow: "Dos nombres, un sonido",
      big: t.from,
      spoken: spoken(t.from),
      ask: "¿Con qué otra nota suena igual?",
      visual: (answered) => kb([{ midi: m, kind: answered ? "answer" : "source", label: answered ? t.answer : "?" }], { letters: answered }),
      onShow: (s) => s?.play(m),
      replay: { label: "▶ Oír la nota", play: (s) => s?.play(m) },
    };
  }
  if (t.type === "semitones" || t.type === "intervalName") {
    const a = midiOf(t.from, 3);
    const b = a + t.semis;
    const steps = t.type === "semitones" ? chromaticSteps(t.from, t.semis) : [];
    const both = (s) => { s?.sequence([a, b]); s?.chord([a, b], { delay: 1.1 }); };
    return {
      ...base,
      eyebrow: t.type === "semitones" ? "Cuenta los medios tonos" : "Nombra el intervalo",
      big: `${t.from} → ${t.to}`,
      ask: t.type === "semitones" ? "¿Cuántos semitonos hay, subiendo?" : "¿Qué intervalo es?",
      visual: (answered) => kb([
        ...(answered ? steps.slice(1, -1).map((n, i) => ({ midi: a + i + 1, kind: "hint" })) : []),
        { midi: a, kind: "source", label: t.from },
        { midi: b, kind: answered ? "answer" : "source", label: t.to },
      ]),
      onShow: both,
      replay: { label: "▶ Oír el intervalo", play: both },
    };
  }
  // Escala: por qué existen las notas raras.
  const midis = ascending(t.notes);
  return {
    ...base,
    eyebrow: "En la escala de",
    big: `${t.key} mayor`,
    ask: `¿Cómo se escribe su ${degreeLabel(t.degree)} nota?`,
    visual: (answered) => el("div", { class: "lo-iv" },
      el("ol", { class: "lo-iv__scale" },
        t.notes.map((n, i) => {
          const isAsked = i + 1 === t.degree;
          const cls = isAsked ? (answered ? " is-answer" : " is-asked") : "";
          return el("li", { class: `lo-iv__step${cls}`, style: `--i:${i}` },
            el("small", {}, degreeLabel(i + 1)), el("b", {}, isAsked && !answered ? "?" : n));
        })),
      kb(midis.map((m, i) => ({ midi: m, kind: i + 1 === t.degree ? (answered ? "answer" : "source") : "hint", label: i + 1 === t.degree && !answered ? "?" : undefined })))),
    onAnswer: (s) => s?.sequence([...midis, midis[0] + 12], { gap: 0.32 }),
    replay: { label: "▶ Oír la escala", play: (s) => s?.sequence([...midis, midis[0] + 12], { gap: 0.32 }) },
  };
}

export function mount(container, { sampler, metadata }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    className: "lo-intervals",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      // E y F son vecinas sin tecla negra: E# cae en F.
      const e = midiOf("E");
      const node = drawKeyboard({
        from: 60, to: 71, letters: true,
        marks: [{ midi: e, kind: "source", label: "E" }, { midi: e + 1, kind: "answer", label: "E#" }],
      });
      return {
        node,
        caption: "Entre E y F no hay tecla negra: si subes E medio tono, llegas a la tecla de F. Por eso E# suena igual que F.",
        onReplay: () => s?.sequence([e, e + 1]),
        replayLabel: "▶ Oír E y E#",
      };
    },
  });
}

