// Nombres de notas. Regla de los OA: clave americana siempre; la latina solo para decirla.
export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
export const LATIN = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };

const ACCIDENTAL = { "": "", "#": " sostenido", "##": " doble sostenido", b: " bemol", bb: " doble bemol" };

/** Cómo se dice en español una nota escrita en clave americana: «C#» → «Do sostenido». */
export function spoken(name) {
  const letter = name[0].toUpperCase();
  const acc = name.slice(1).replace(/\d+$/, "");
  return LATIN[letter] + (ACCIDENTAL[acc] ?? acc);
}
