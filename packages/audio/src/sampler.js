// Sampler mínimo sobre Web Audio: carga muestras por nota y toca cualquier MIDI
// con la muestra más cercana, ajustando la velocidad de reproducción.
// No es un OA: es infraestructura compartida por los OA que suenan.

const NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/** Nombre de archivo de una muestra para un número MIDI (60 = C4), con bemoles. */
export function sampleName(midi) {
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Muestra disponible más cercana a `midi` y los semitonos que hay que desplazarla. */
export function nearestSample(midi, available) {
  let best = available[0];
  for (const m of available) {
    if (Math.abs(m - midi) < Math.abs(best - midi)) best = m;
  }
  return { sample: best, shift: midi - best };
}

/**
 * @param {object} opts
 * @param {string} opts.baseUrl  carpeta con los mp3 (`A2.mp3`, `Bb3.mp3`, ...)
 * @param {number[]} opts.notes  números MIDI de las muestras que existen
 */
export function createSampler({ baseUrl, notes }) {
  let ctx = null;
  const buffers = new Map();
  let loading = null;

  function context() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  async function load(midi) {
    if (buffers.has(midi)) return buffers.get(midi);
    const res = await fetch(`${baseUrl}/${sampleName(midi)}.mp3`);
    const buf = await context().decodeAudioData(await res.arrayBuffer());
    buffers.set(midi, buf);
    return buf;
  }

  return {
    /** Precarga todas las muestras (llamar tras un gesto del usuario). */
    preload() {
      context();
      loading ??= Promise.all(notes.map(load));
      return loading;
    },
    /** Toca una nota MIDI ahora (o dentro de `delay` segundos). */
    async play(midi, { delay = 0, duration = 1.6, gain = 0.9 } = {}) {
      const c = context();
      const { sample, shift } = nearestSample(midi, notes);
      const buf = await load(sample);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 2 ** (shift / 12);
      const g = c.createGain();
      const t = c.currentTime + delay;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      src.connect(g).connect(c.destination);
      src.start(t);
      src.stop(t + duration);
    },
    /** Acorde rasgueado: las notas entran con `strum` segundos de diferencia, de grave a agudo. */
    chord(midis, { delay = 0, strum = 0.035, duration = 2.4, gain = 0.7 } = {}) {
      [...midis].sort((a, b) => a - b).forEach((m, i) => this.play(m, { delay: delay + i * strum, duration, gain }));
    },
    /** Clic de metrónomo sintetizado (sin muestras); `accent` marca el tiempo 1. */
    click({ delay = 0, accent = false, gain = 0.35 } = {}) {
      const c = context();
      const t = c.currentTime + delay;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.frequency.value = accent ? 1760 : 1175;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(g).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    },
    /** Segundos del reloj de audio (para sincronizar la vista con lo que suena). */
    now() {
      return context().currentTime;
    },
    /** Notas una tras otra (un arpegio), separadas por `gap` segundos. */
    sequence(midis, { delay = 0, gap = 0.45, duration = 1.4, gain = 0.9 } = {}) {
      midis.forEach((m, i) => this.play(m, { delay: delay + i * gap, duration, gain }));
    },
  };
}

/** Muestras de guitarra de nailon de Acordia (FluidR3_GM, CC BY 3.0): E2 a E6. */
export const GUITAR_NYLON_NOTES = (() => {
  const out = [];
  // Mismo inventario de archivos que acordia_render/web.
  const have = "A2 A3 A4 A5 Ab2 Ab3 Ab4 Ab5 B2 B3 B4 B5 Bb2 Bb3 Bb4 Bb5 C3 C4 C5 C6 D3 D4 D5 D6 Db3 Db4 Db5 Db6 E2 E3 E4 E5 E6 Eb3 Eb4 Eb5 Eb6 F2 F3 F4 F5 G2 G3 G4 G5 Gb2 Gb3 Gb4 Gb5";
  for (const n of have.split(" ")) {
    const pc = NAMES.indexOf(n.slice(0, -1));
    out.push((Number(n.at(-1)) + 1) * 12 + pc);
  }
  return out.sort((a, b) => a - b);
})();
