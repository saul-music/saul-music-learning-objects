// Lógica de «Estudia un tema Original»: ordenar la práctica y saber a qué familia pertenece cada acorde. Sin DOM ni audio.
import { buildChoices, nameOf, notesOf, pick, pickRoot, shuffle } from "@saul-music/chord-core/theory";

export const FAMILIES = {
  cejilla: "Cejilla",
  septima: "Séptima",
  maj7: "maj7 o de 6",
  bajo: "Con bajo",
  paso: "De paso",
  sus: "sus o add9",
  novena: "Novena o 6/9",
  tension: "Tensión",
};
const SAMPLE = {
  cejilla: ["F", "Fm", "Bm", "Bb", "B", "F#m", "C#m", "G#m"].map((n) => [n]),
  septima: [["7"], ["m7"]].flatMap(([s]) => ["A", "E", "G", "D", "B"].map((r) => [r + s])),
  maj7: ["Cmaj7", "Amaj7", "Dmaj7", "Gmaj7", "C6", "Am6", "Fmaj7", "G6"].map((n) => [n]),
  bajo: ["G/B", "D/F#", "C/E", "Dm/F", "Dm/C", "Am/G", "A/C#", "Bm/A"].map((n) => [n]),
  paso: ["Bdim7", "Bm7b5", "Caug", "Ammaj7", "Ebdim7", "F#m7b5", "Ddim7", "Eaug"].map((n) => [n]),
  sus: ["Dsus2", "Dsus4", "Asus4", "Cadd9", "Asus2", "Gsus4", "Dadd9", "G7sus4"].map((n) => [n]),
  novena: ["E9", "Em9", "Cmaj9", "C6/9", "D9", "Am9", "Gmaj9", "A9"].map((n) => [n]),
  tension: ["E7(b9)", "E7(#9)", "A13", "A7(b13)", "Dmadd#11", "Cmaj7#11", "G7(b9)", "B7(#9)"].map((n) => [n]),
};
const HINT = {
  cejilla: "una forma que viaja por el mástil con el índice de cejilla",
  septima: "un acorde con 7ª menor",
  maj7: "un acorde con 7ª mayor o con la 6ª",
  bajo: "el acorde se toca con otra nota en el bajo",
  paso: "un acorde tenso que lleva al siguiente",
  sus: "un acorde sin 3ª (sus) o con la 9ª sumada (add9)",
  novena: "un acorde con la 9ª sumada a una séptima, o 6/9",
  tension: "un acorde con una tensión alterada o con 11ª o 13ª",
};

/** ¿A qué familia de acordes pertenece este símbolo? */
export function familyQuestion(rng) {
  const family = pick(Object.keys(SAMPLE), rng);
  const [chord] = pick(SAMPLE[family], rng);
  const answer = FAMILIES[family];
  const { choices, correct } = buildChoices(answer, Object.values(FAMILIES).filter((x) => x !== answer), rng);
  return {
    type: "family", eyebrow: "Tu lista de acordes nuevos", big: chord, bigKind: "chord", ask: "¿A qué familia pertenece este acorde?", choices, correct, answer, choiceKind: "text",
    explain: `${chord} es de la familia «${answer}»: ${HINT[family]}.`,
  };
}

const SCENARIOS = [
  { eyebrow: "Por dónde empezar", ask: "Vas a estudiar un tema nuevo con muchos acordes. ¿Por qué versión conviene empezar?", answer: "Por la Simplificada y, cuando fluya, la Original", wrong: ["Por la Original, directo", "Por el final del tema", "Da lo mismo"], explain: "La Simplificada te da la estructura con mayores, menores y de quinta. Cuando fluye, pasas a la Original." },
  { eyebrow: "Repetir una parte", ask: "Quieres repetir una sección una y otra vez hasta que salga. ¿Qué usas?", answer: "El botón de loop de la sección", wrong: ["Cambiar de versión", "Apagar el metrónomo", "Subir el tempo al máximo"], explain: "El loop (⟲) repite la sección sin que tengas que volver a apretar play." },
  { eyebrow: "Partir de un compás", ask: "Quieres empezar desde el compás 9, no desde el principio. ¿Qué haces?", answer: "Toco ese compás para marcar «Desde aquí»", wrong: ["Arrastro el tempo hasta el compás 9", "Cambio de versión", "Reinicio la página"], explain: "Al tocar un compás se marca «Desde aquí» y el tema parte de ahí." },
  { eyebrow: "Un cambio difícil", ask: "Un cambio de acorde te falla siempre. ¿Qué haces?", answer: "Lo aíslo: dos acordes, despacio, hasta que salga limpio", wrong: ["Toco el tema entero más rápido", "Salto ese cambio", "Subo el tempo para llegar a tiempo"], explain: "Aísla el cambio, practícalo despacio y sube el tempo cuando salga limpio diez veces seguidas." },
  { eyebrow: "Casilla en gris", ask: "Ves una casilla con el acorde en gris. ¿Qué significa?", answer: "Repite el compás anterior", wrong: ["Es un silencio", "El acorde está mal escrito", "Es un acorde opcional"], explain: "Un acorde en gris es una casilla que repite el compás anterior." },
  { eyebrow: "Un acorde que no conoces", ask: "Aparece un acorde que no conoces. ¿Qué haces primero?", answer: "Lo abro para ver su diagrama y lo escucho", wrong: ["Lo salto", "Toco el acorde mayor y listo", "Paro de estudiar el tema"], explain: "Al abrir el acorde ves su diagrama y puedes escucharlo antes de tocarlo." },
  { eyebrow: "El tempo", ask: "Empiezas a practicar un tema que se te hace rápido. ¿Qué haces con el tempo?", answer: "Lo bajo y lo subo de a poco", wrong: ["Lo dejo siempre como está", "Lo subo antes de aprender los acordes", "Apago el metrónomo"], explain: "Baja el tempo con el metrónomo y sube de a poco cuando todo salga limpio." },
  { eyebrow: "Modo estudio", ask: "Tienes la guitarra en las manos y no alcanzas a leer los compases. ¿Qué usas?", answer: "El modo estudio, con los compases en grande", wrong: ["Imprimo la pantalla", "Cambio de tema", "Bajo el brillo"], explain: "El modo estudio muestra los compases en grande, pensado para tocar con la guitarra en las manos." },
];

/** Una situación de estudio: ¿qué haces? */
export function scenarioQuestion(rng) {
  const s = pick(SCENARIOS, rng);
  const { choices, correct } = buildChoices(s.answer, s.wrong, rng);
  return { type: "scenario", eyebrow: s.eyebrow, big: "?", ask: s.ask, choices, correct, answer: s.answer, choiceKind: "text", explain: s.explain };
}

export function makeQuestion(rng = Math.random) {
  return rng() < 0.55 ? familyQuestion(rng) : scenarioQuestion(rng);
}
