// Efectos de sonido del juego, sintetizados con Web Audio (sin archivos): acierto, error, combo,
// cuenta regresiva, estrellas y fanfarria. Son aparte de la música del OA (el sampler) y se pueden
// silenciar; la preferencia se recuerda en este navegador.

import { audioContext, resumeAudio } from "./context.js";

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12); // MIDI → Hz

export function createSfx({ storageKey = "acordia-lo:sfx" } = {}) {
  let muted = false;
  try {
    muted = globalThis.localStorage?.getItem(storageKey) === "off";
  } catch {
    /* sin almacenamiento: se queda con sonido */
  }

  // El mismo contexto que la guitarra (context.js): uno solo, preparado para iPhone.
  function context() {
    const c = audioContext();
    if (c && c.state !== "running") resumeAudio();
    return c;
  }

  /** Un tono con envolvente corta. `slide` lleva la frecuencia a otro valor durante el tono. */
  function tone(freq, { at = 0, dur = 0.14, type = "triangle", gain = 0.16, slide } = {}) {
    if (muted) return;
    const c = context();
    if (!c) return;
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(value) {
      muted = Boolean(value);
      try {
        globalThis.localStorage?.setItem(storageKey, muted ? "off" : "on");
      } catch {
        /* nada */
      }
    },
    /** Llamar en un gesto del usuario (iOS solo deja sonar después de uno). */
    unlock() {
      resumeAudio();
    },
    /** Acierto: arpegio que sube; con combo suma notas más agudas. */
    correct(multiplier = 1) {
      const notes = [72, 76, 79, 84, 88].slice(0, 2 + Math.min(multiplier, 3));
      notes.forEach((n, i) => tone(NOTE(n), { at: i * 0.07, dur: 0.18, gain: 0.14 }));
    },
    /** Error: dos golpes graves que bajan. */
    wrong() {
      tone(NOTE(52), { dur: 0.16, type: "square", gain: 0.07, slide: NOTE(47) });
      tone(NOTE(45), { at: 0.15, dur: 0.28, type: "square", gain: 0.07, slide: NOTE(40) });
    },
    /** Cuenta regresiva: «3, 2, 1» y «¡Ya!». */
    tick() {
      tone(NOTE(81), { dur: 0.08, type: "sine", gain: 0.12 });
    },
    go() {
      tone(NOTE(88), { dur: 0.25, type: "sine", gain: 0.14 });
      tone(NOTE(93), { at: 0.06, dur: 0.25, type: "sine", gain: 0.1 });
    },
    /** Cada estrella del resultado suena más aguda. */
    star(i = 0) {
      tone(NOTE(84 + i * 4), { dur: 0.22, type: "triangle", gain: 0.13 });
      tone(NOTE(91 + i * 4), { at: 0.05, dur: 0.2, type: "sine", gain: 0.06 });
    },
    /** Nivel completado. */
    fanfare() {
      [60, 64, 67, 72].forEach((n, i) => tone(NOTE(n), { at: i * 0.11, dur: 0.22, type: "triangle", gain: 0.12 }));
      [72, 76, 79].forEach((n) => tone(NOTE(n), { at: 0.5, dur: 0.6, type: "triangle", gain: 0.08 }));
    },
    /** Toque suave para botones. */
    tap() {
      tone(NOTE(76), { dur: 0.05, type: "sine", gain: 0.05 });
    },
  };
}
