import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Simula lo que hace iOS: una sesión de audio y un contexto que parte suspendido.
const calls = [];
class FakeContext {
  constructor() {
    calls.push(`crear (sesión: ${globalThis.navigator.audioSession.type})`);
    this.state = "suspended";
    this.sampleRate = 48000;
  }
  resume() {
    calls.push("resume");
    this.state = "running";
    return Promise.resolve();
  }
}

let mod;
beforeAll(async () => {
  Object.defineProperty(globalThis.navigator, "audioSession", { value: { type: "auto" }, configurable: true });
  globalThis.AudioContext = FakeContext;
  mod = await import("../src/context.js");
});
afterAll(() => {
  delete globalThis.AudioContext;
  delete globalThis.navigator.audioSession;
});

describe("contexto de audio para iPhone", () => {
  it("declara la sesión como «playback» antes de crear el contexto (si no, el interruptor de silencio lo calla)", () => {
    const c = mod.audioContext();
    expect(calls[0]).toBe("crear (sesión: playback)");
    expect(c.state).toBe("suspended");
  });

  it("usa un solo contexto para guitarra y efectos", () => {
    expect(mod.audioContext()).toBe(mod.audioContext());
    expect(calls.filter((c) => c.startsWith("crear"))).toHaveLength(1);
  });

  it("reanuda el contexto en un gesto si iOS lo suspendió o lo interrumpió", () => {
    const c = mod.resumeAudio();
    expect(calls).toContain("resume");
    expect(c.state).toBe("running");
    c.state = "interrupted";
    mod.resumeAudio();
    expect(c.state).toBe("running");
  });

  it("decodifica con promesa aunque Safari antiguo solo llame callbacks", async () => {
    const oldSafari = { decodeAudioData: (_ab, ok) => { ok("buffer"); return undefined; } };
    await expect(mod.decodeAudio(oldSafari, new ArrayBuffer(8))).resolves.toBe("buffer");
  });
});
