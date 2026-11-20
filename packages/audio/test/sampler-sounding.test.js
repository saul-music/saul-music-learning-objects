import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Contexto falso con reloj controlado: lo que suena se mide contra `currentTime`.
let now = 0;
class FakeContext {
  state = "running";
  get currentTime() { return now; }
  get destination() { return {}; }
  createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (n) => n }; }
  createOscillator() { return { frequency: {}, connect: (n) => n, start() {}, stop() {} }; }
  createBufferSource() { return { playbackRate: {}, connect: (n) => n, start() {}, stop() {} }; }
  decodeAudioData() { return Promise.resolve({}); }
}

let createSampler;
beforeAll(async () => {
  globalThis.AudioContext = FakeContext;
  globalThis.fetch = () => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)) });
  ({ createSampler } = await import("../src/sampler.js"));
});
afterAll(() => {
  delete globalThis.AudioContext;
  delete globalThis.fetch;
});

describe("sampler: estado «sonando»", () => {
  it("queda sonando hasta que termina lo agendado y avisa al empezar y al terminar", async () => {
    vi.useFakeTimers();
    now = 0;
    const s = createSampler({ baseUrl: "x", notes: [60] });
    const seen = [];
    s.onSounding((on) => seen.push(on));
    expect(s.isSounding()).toBe(false);
    s.play(60, { duration: 1.5 });
    expect(s.isSounding()).toBe(true);
    now = 1.5;
    await vi.advanceTimersByTimeAsync(1600);
    expect(s.isSounding()).toBe(false);
    expect(seen).toEqual([true, false]);
    vi.useRealTimers();
  });

  it("una secuencia dura hasta su última nota", async () => {
    vi.useFakeTimers();
    now = 10;
    const s = createSampler({ baseUrl: "x", notes: [60] });
    s.sequence([60, 62, 64], { gap: 0.5, duration: 1 }); // termina en 10 + 1 + 1 = 12
    now = 11;
    await vi.advanceTimersByTimeAsync(1100);
    expect(s.isSounding()).toBe(true);
    now = 12;
    await vi.advanceTimersByTimeAsync(1100);
    expect(s.isSounding()).toBe(false);
    vi.useRealTimers();
  });
});
