import { describe, expect, it } from "vitest";
import { ApiError, createApi } from "../src/api.js";

function fake(status, body) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return { calls, api: createApi({ getToken: async () => "tok", fetchImpl }) };
}

describe("cliente de la API", () => {
  it("manda el token en la cabecera y nunca en la dirección", async () => {
    const { api, calls } = fake(200, { current: "v3", accepted: "v3" });
    await api.consent();
    expect(calls[0].url).toBe("/api/me/consent");
    expect(calls[0].options.headers.Authorization).toBe("Bearer tok");
    expect(calls[0].url).not.toContain("tok");
  });

  it("lee el avance, y si falta devuelve un objeto vacío", async () => {
    expect(await fake(200, { progress: { basico: { a: { points: 1, stars: 0, plays: 1 } } } }).api.progress()).toHaveProperty("basico.a");
    expect(await fake(200, {}).api.progress()).toEqual({});
  });

  it("guarda un resultado con exactamente los cuatro campos y devuelve el mejor", async () => {
    const { api, calls } = fake(200, { path: "basico", lesson: "a", points: 90, stars: 3, plays: 2 });
    const saved = await api.saveResult({ path: "basico", lesson: "a", points: 70, stars: 2, extra: "no" });
    expect(calls[0].options.method).toBe("PUT");
    expect(JSON.parse(calls[0].options.body)).toEqual({ path: "basico", lesson: "a", points: 70, stars: 2 });
    expect(saved).toEqual({ points: 90, stars: 3, plays: 2 });
  });

  it("un error del servidor sale como ApiError con su estado", async () => {
    for (const status of [403, 404, 422, 429, 500]) {
      await expect(fake(status, {}).api.progress()).rejects.toMatchObject({ status });
    }
    await expect(fake(404, {}).api.consent()).rejects.toBeInstanceOf(ApiError);
  });
});
