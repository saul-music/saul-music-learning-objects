// Lógica de «Acordes de paso»: dim7, m7b5, aug y mmaj7. Sin DOM ni audio.
import { Note } from "tonal";
import { buildChoices, buildQuestion, differenceQuestion, earQuestion, identifyQuestion, midisOf, nameOf, noteAt, notesOf, pick, pickRoot } from "@saul-music/chord-core/theory";

export const POOL = ["dim7", "m7b5", "aug", "mmaj7", "m7"];

/** El dim7 se repite cada 3 semitonos; el aug, cada 4. */
export function distanceQuestion(rng) {
  const suffix = pick(["dim7", "aug"], rng);
  const root = pickRoot(rng, suffix);
  const answer = suffix === "dim7" ? "3" : "4";
  const { choices, correct } = buildChoices(answer, ["2", "3", "4", "5"], rng);
  return {
    type: "distance", eyebrow: "Simetría", big: nameOf(root, suffix), bigKind: "chord", ask: "Entre cada nota del acorde y la siguiente, ¿cuántos semitonos hay?", choices, correct, answer, choiceKind: "number",
    visualAnswered: { kind: "text", lines: [notesOf(root, suffix).join(" – ")] },
    explain: suffix === "dim7" ? `El dim7 apila terceras menores (3 semitonos): ${notesOf(root, suffix).join(" – ")}.` : `El aumentado apila terceras mayores (4 semitonos): ${notesOf(root, suffix).join(" – ")}.`,
  };
}

/** Cuántos trastes se repite la misma forma (dim7: 3; aug: 4). */
export function twinQuestion(rng) {
  const suffix = pick(["dim7", "aug"], rng);
  const step = suffix === "dim7" ? "3m" : "3M";
  const root = pickRoot(rng, suffix, ["C", "D", "E", "F", "G", "A", "B", "Eb", "F#", "Ab"].filter((r) => notesOf(noteAt(r, step), suffix).every((n) => !/bb|##|^(Cb|Fb|E#|B#)$/.test(n))));
  const twin = noteAt(root, step);
  const answer = nameOf(twin, suffix);
  const wrong = [nameOf(noteAt(root, "2M"), suffix), nameOf(noteAt(root, "4P"), suffix), nameOf(noteAt(root, "5P"), suffix), nameOf(noteAt(root, "2m"), suffix)];
  const { choices, correct } = buildChoices(answer, wrong, rng);
  return {
    type: "twin", eyebrow: "Mismas notas", big: nameOf(root, suffix), bigKind: "chord", ask: "Suena igual que otro acorde de la misma familia. ¿Cuál?", choices, correct, answer, choiceKind: "chord",
    play: { label: `▶ Oír ${nameOf(root, suffix)} y ${answer}`, chords: [midisOf(root, suffix), midisOf(twin, suffix)], gap: 1.5 }, playOnAnswer: true,
    explain: `${nameOf(root, suffix)} y ${answer} tienen las mismas notas (${notesOf(root, suffix).join(" – ")}): ${suffix === "dim7" ? "el dim7 se repite cada 3 trastes" : "el aumentado se repite cada 4 trastes"}.`,
  };
}

export function makeQuestion(rng = Math.random) {
  const r = rng();
  if (r < 0.2) return buildQuestion(rng, POOL, ["dim7", "m7b5", "aug", "mmaj7"]);
  if (r < 0.4) return identifyQuestion(rng, POOL, ["dim7", "m7b5", "aug", "mmaj7"]);
  if (r < 0.55) return differenceQuestion(rng, [["m7", "m7b5"], ["m7", "mmaj7"], ["", "aug"]]);
  if (r < 0.68) return distanceQuestion(rng);
  if (r < 0.8) return twinQuestion(rng);
  return earQuestion(rng, POOL, ["dim7", "m7b5", "aug", "mmaj7"]);
}
