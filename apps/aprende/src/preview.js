// Servidor falso para revisar las lecciones en local (`npm run dev:preview`). No guarda nada: todo vive en memoria.
export function previewApi() {
  const saved = {};
  return {
    saveContinue: async () => ({}),
    saveResult: async ({ points, stars }) => ({ points, stars, plays: (saved.plays = (saved.plays ?? 0) + 1) }),
    consent: async () => ({ accepted: 1, current: 1 }),
    progress: async () => ({}),
  };
}
