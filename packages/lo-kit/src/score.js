// Puntuación del juego (lógica pura, se prueba sola). Las preguntas y el orden no cambian:
// la puntuación premia acertar y hacerlo rápido. Es templada (C44): hasta 10 puntos por acierto
// y, con 10 preguntas, hasta 100 por partida. La racha no multiplica: solo se celebra.

export const SCORING = {
  base: 7, // puntos por acierto
  speedMax: 3, // bono máximo por rapidez (base + bono = 10 como máximo)
  speedWindow: 12000, // ms: después de esto el bono es 0 (no se pierde la pregunta)
  fastMs: 3000, // responder antes de esto cuenta como «rápido»
  perAnswer: 10, // lo máximo que vale una respuesta
  perGame: 100, // lo máximo que vale una partida completa, sea cual sea el número de rondas
};

/** Nivel de celebración según la racha (contando el acierto actual). No cambia los puntos. */
export function comboMultiplier(streak) {
  if (streak >= 8) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

/** Bono por rapidez: completo al instante, baja parejo hasta 0 en `speedWindow`. */
export function speedBonus(ms) {
  const f = Math.max(0, 1 - ms / SCORING.speedWindow);
  return Math.round(SCORING.speedMax * f);
}

/** Puntos de una respuesta: la base más el bono por rapidez. Un error no da nada. */
export function pointsFor({ ok, ms }) {
  if (!ok) return 0;
  return SCORING.base + speedBonus(ms);
}

/** Puntos de una partida llevados a la escala de 0 a 100, aunque tenga otro número de rondas. */
export function gamePoints(points, rounds) {
  if (!rounds) return 0;
  return Math.min(SCORING.perGame, Math.round((points * SCORING.perGame) / (rounds * SCORING.perAnswer)));
}

/** Estrellas por aciertos: 3 con 9 o 10 de 10, 2 con 7 u 8, 1 con 4 a 6. */
export function starsFor(correct, rounds) {
  const acc = rounds ? correct / rounds : 0;
  if (acc >= 0.9) return 3;
  if (acc >= 0.7) return 2;
  if (acc >= 0.4) return 1;
  return 0;
}

/** Estado de una partida. `now` se inyecta para poder probar. */
export function createRun(rounds, now = () => performance.now()) {
  return {
    rounds,
    round: 0,
    score: 0, // aciertos
    points: 0,
    streak: 0,
    maxStreak: 0,
    results: [],
    misses: [],
    t0: 0,
    lastMs: 0,
    reset() {
      Object.assign(this, { round: 0, score: 0, points: 0, streak: 0, maxStreak: 0, results: [], misses: [], t0: 0, lastMs: 0 });
    },
    /** Marca el inicio de la pregunta (para el bono por rapidez). */
    startQuestion() {
      this.t0 = now();
    },
    elapsed() {
      return now() - this.t0;
    },
    /** Registra una respuesta y devuelve lo ganado. */
    record(ok, missText) {
      const ms = this.elapsed();
      this.lastMs = ms;
      this.results.push(ok);
      this.streak = ok ? this.streak + 1 : 0;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      const gained = pointsFor({ ok, ms });
      this.points += gained;
      if (ok) this.score += 1;
      else if (missText) this.misses.push(missText);
      return { ok, ms, gained, multiplier: ok ? comboMultiplier(this.streak) : 1, fast: ok && ms < SCORING.fastMs, streak: this.streak };
    },
    get last() {
      return this.round === this.rounds;
    },
  };
}

// Récords por juego, guardados solo en este navegador (sin datos personales).
// v2: la escala cambió de miles a cientos (C44); los récords viejos no sirven de comparación.
const KEY = (id) => `acordia-lo:v2:${id}`;

export function loadBest(id, storage = globalThis.localStorage) {
  try {
    return JSON.parse(storage?.getItem(KEY(id)) ?? "null") ?? { points: 0, stars: 0, plays: 0 };
  } catch {
    return { points: 0, stars: 0, plays: 0 };
  }
}

/** Guarda el resultado y avisa si es récord. */
export function saveResult(id, { points, stars }, storage = globalThis.localStorage) {
  const prev = loadBest(id, storage);
  const best = { points: Math.max(prev.points, points), stars: Math.max(prev.stars, stars), plays: prev.plays + 1 };
  try {
    storage?.setItem(KEY(id), JSON.stringify(best));
  } catch {
    /* sin almacenamiento: se juega igual */
  }
  return { best, newRecord: points > prev.points && prev.plays > 0, first: prev.plays === 0 };
}
