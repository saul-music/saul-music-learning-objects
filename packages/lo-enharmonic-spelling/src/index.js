// OA «Nombra bien la nota»: ortografía enarmónica práctica (cada letra una vez; sostenidos o bemoles según la tonalidad).
import { chordLabel, el, mountChoiceQuiz, noteLabel, spoken } from "@saul-music/lo-kit";
import { Note } from "tonal";
import { degreeLabel, makeQuestion } from "./theory.js";

export * from "./theory.js";

/** MIDI ascendentes de una lista de notas, desde la octava 3. */
function ascending(names) {
  const out = [Note.midi(`${names[0]}3`)];
  for (const n of names.slice(1)) {
    const prev = out.at(-1);
    out.push(prev + (((Note.chroma(n) - (prev % 12)) + 12) % 12 || 12));
  }
  return out;
}

const scaleMidis = (notes) => { const m = ascending(notes); return [...m, m[0] + 12]; };

/** La escala con una casilla por letra: la pregunta es una de ellas. */
function scaleStrip(notes, asked, answered) {
  return el("div", { class: "lo-es" },
    el("ol", { class: "lo-es__scale" },
      notes.map((n, i) => {
        const isAsked = i + 1 === asked;
        const cls = isAsked ? (answered ? " is-answer" : " is-asked") : "";
        return el("li", { class: `lo-es__step${cls}`, style: `--i:${i}` },
          el("small", {}, degreeLabel(i + 1)),
          el("b", {}, isAsked && !answered ? "?" : noteLabel(n)),
          el("span", { class: "lo-es__letter", "aria-hidden": "true" }, n[0]));
      })));
}

function toQuiz(t) {
  const base = { choices: t.choices, correct: t.correct, explain: t.explain, recap: t.explain };
  if (t.type === "spelling") {
    const play = (s) => s?.sequence(scaleMidis(t.notes), { gap: 0.32 });
    return {
      ...base,
      eyebrow: "En la escala de",
      big: el("span", { class: "lo-es__pair" }, noteLabel(t.key), el("span", { class: "lo-es__word" }, "mayor")),
      choiceKind: "note",
      ask: `¿Cómo se escribe su ${degreeLabel(t.degree)} nota?`,
      visual: (answered) => scaleStrip(t.notes, t.degree, answered),
      onAnswer: play,
      replay: { label: "▶ Oír la escala", play },
    };
  }
  if (t.type === "strategy") {
    const a = Note.midi(`${t.from}3`);
    const b = a + (t.up ? 1 : -1);
    const play = (s) => s?.sequence([a, b], { gap: 0.6 });
    return {
      ...base,
      eyebrow: `Estás en ${t.key} mayor y ${t.up ? "subes" : "bajas"} medio tono desde`,
      big: t.from,
      bigKind: "note",
      choiceKind: "note",
      spoken: spoken(t.from),
      ask: "¿Cómo escribes la nota que llegas a tocar?",
      onShow: play,
      replay: { label: "▶ Oír los dos sonidos", play },
    };
  }
  if (t.type === "whichKey") {
    const play = (s) => s?.sequence(scaleMidis(t.notes), { gap: 0.3 });
    return {
      ...base,
      eyebrow: "La nota rara",
      big: t.rareNote,
      bigKind: "note",
      choiceKind: "note",
      spoken: spoken(t.rareNote),
      ask: "¿En qué tonalidad mayor aparece?",
      visual: (answered) => (answered ? scaleStrip(t.notes, t.degree, true) : el("p", { class: "lo-es__hint" }, "Pista: casi nunca se usa; solo en tonalidades con muchas alteraciones.")),
      onAnswer: play,
      extras: [{ label: "▶ Oír la escala", play }], // solo tras responder: oírla antes delataría la tonalidad
    };
  }
  // Acorde: cómo se escribe.
  const midis = ascending(t.triad);
  const play = (s) => s?.chord(midis);
  return {
    ...base,
    eyebrow: "Acorde mayor",
    big: t.root,
    bigKind: "chord",
    choiceKind: "text",
    ask: ["¿Qué notas lleva el acorde de ", chordLabel(t.root), " mayor?"],
    onShow: play,
    replay: { label: "▶ Oír el acorde", play },
  };
}

export function mount(container, { sampler, sfx, metadata, cover, next }) {
  return mountChoiceQuiz(container, {
    metadata,
    sampler,
    sfx,
    cover,
    next,
    className: "lo-enharmonic",
    makeQuestion: (rng) => toQuiz(makeQuestion(rng)),
    demo: ({ sampler: s }) => {
      // Una sola tecla negra, dos nombres: en F mayor la B es bemol porque la A ya se usó.
      const notes = ["F", "G", "A", "Bb", "C", "D", "E"];
      const node = el("div", { class: "lo-es" },
        el("ol", { class: "lo-es__scale" }, notes.map((n, i) =>
          el("li", { class: `lo-es__step${n === "Bb" ? " is-answer" : ""}`, style: `--i:${i}` },
            el("small", {}, degreeLabel(i + 1)), el("b", {}, noteLabel(n)), el("span", { class: "lo-es__letter", "aria-hidden": "true" }, n[0])))));
      return {
        node,
        caption: "En F mayor cada letra se usa una vez: F G A B C D E. La cuarta es una B, y como la tonalidad pide bemol, se escribe Bb. Escribir A# repetiría la A.",
        onReplay: () => s?.sequence(scaleMidis(notes), { gap: 0.32 }),
        replayLabel: "▶ Oír F mayor",
      };
    },
  });
}
