// Avance de la persona en Aprende (lógica pura, se prueba sola). Forma de lo que guarda el servidor (S103):
// { ruta: { lección: { points (0 a 100), stars (0 a 3), plays } } }

export const MAX_STARS = 3;

/** El mejor resultado de una lección, o `null` si aún no la jugó. */
export function resultOf(progress, pathId, lessonId) {
  return progress?.[pathId]?.[lessonId] ?? null;
}

/** Devuelve el avance con el resultado guardado de una lección (sin modificar el original). */
export function withResult(progress, pathId, lessonId, saved) {
  return { ...progress, [pathId]: { ...(progress?.[pathId] ?? {}), [lessonId]: saved } };
}

/** Resumen de una ruta: lecciones jugadas, estrellas y puntos (los mejores de cada lección). */
export function pathSummary(progress, path) {
  const results = path.lessons.map((l) => resultOf(progress, path.id, l.id));
  const played = results.filter(Boolean);
  return {
    played: played.length,
    total: path.lessons.length,
    stars: played.reduce((n, r) => n + r.stars, 0),
    maxStars: path.lessons.length * MAX_STARS,
    points: played.reduce((n, r) => n + r.points, 0),
    complete: played.length === path.lessons.length,
  };
}

/** La lección recomendada: la primera que aún no se jugó. `null` si ya se jugaron todas. */
export function recommendedLesson(progress, path) {
  return path.lessons.find((l) => !resultOf(progress, path.id, l.id)) ?? null;
}

/** La lección que sigue a otra en la ruta, o `null` si es la última. */
export function nextLesson(path, lessonId) {
  const i = path.lessons.findIndex((l) => l.id === lessonId);
  return i >= 0 ? (path.lessons[i + 1] ?? null) : null;
}

/** Minutos de una lección: leerla más el juego (el tiempo típico del OA, en formato ISO «PT5M»). */
export function lessonMinutes(lesson, oaIsoTime) {
  const game = Number(/^PT(\d+)M$/.exec(oaIsoTime ?? "")?.[1] ?? 0);
  return lesson.readMinutes + game;
}
