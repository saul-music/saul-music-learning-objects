// Arma alternativas barajadas sin repetir (lógica pura, se prueba sola).

/** Baraja una copia del arreglo (Fisher-Yates) con el generador dado. */
export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Elige un elemento al azar. */
export const pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];

/**
 * Devuelve `{ choices, correct }` con la respuesta y hasta `n - 1` distractores distintos.
 * Los distractores repetidos o iguales a la respuesta se descartan.
 */
export function buildChoices(answer, distractors, rng = Math.random, n = 4) {
  const pool = shuffle([...new Set(distractors)].filter((d) => d !== answer), rng).slice(0, n - 1);
  const choices = shuffle([answer, ...pool], rng);
  return { choices, correct: choices.indexOf(answer) };
}
