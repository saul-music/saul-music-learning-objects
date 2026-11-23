// Cliente de `/api/me/*` del sitio (S103). El navegador nunca habla con Firestore: todo pasa por el sitio.

export class ApiError extends Error {
  constructor(status) {
    super(`la API respondió ${status}`);
    this.status = status;
  }
}

/**
 * @param {{ getToken: () => Promise<string>, fetchImpl?: typeof fetch, base?: string }} o
 */
export function createApi({ getToken, fetchImpl = (...a) => fetch(...a), base = "" }) {
  async function call(path, options = {}) {
    const token = await getToken();
    const response = await fetchImpl(`${base}/api/me/${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new ApiError(response.status);
    return response.json();
  }
  return {
    /** `{ current, accepted }`: si `accepted` no es `current`, hay que aceptar el aviso en la página de entrada. */
    consent: () => call("consent"),
    /** `{ ruta: { lección: { points, stars, plays } } }` */
    async progress() {
      return (await call("progress")).progress ?? {};
    },
    /** Anota lo último que la persona vio: `{ lesson: { path, lesson } }` o `{ song }` (S104). */
    async saveContinue(value) {
      await call("continue", { method: "PUT", body: JSON.stringify(value) });
    },
    /** Guarda el resultado de una lección y devuelve el mejor (`{ points, stars, plays }`). */
    async saveResult({ path, lesson, points, stars }) {
      const saved = await call("progress", { method: "PUT", body: JSON.stringify({ path, lesson, points, stars }) });
      return { points: saved.points, stars: saved.stars, plays: saved.plays };
    },
  };
}
