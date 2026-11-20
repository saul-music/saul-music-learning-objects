// Un solo contexto de audio para todo el playground (guitarra y efectos), preparado para iPhone.
//
// Por qué: en iOS, Web Audio respeta el interruptor de silencio del costado; con el teléfono en
// silencio no suena nada aunque el volumen esté alto. El reproductor de Acordia lo resuelve
// declarando la sesión de audio como reproducción («playback», Safari 16.4+); aquí se hace lo mismo
// y, en iOS más antiguo, se toca un <audio> silencioso en el primer toque, que cambia la sesión.
// Además, iOS suspende o «interrumpe» el contexto al cambiar de app: solo un gesto lo reanuda, así
// que se reanuda en cada toque.

// 20 ms de silencio en WAV (8 bits, 8 kHz): solo sirve para cambiar la sesión de audio en iOS antiguo.
const SILENT_WAV = "data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

let ctx = null;
let htmlUnlocked = false;
const listeners = new Set();

/** Declara la sesión de audio como reproducción: así iOS no la calla con el interruptor de silencio. */
export function setPlaybackSession() {
  try {
    if (globalThis.navigator?.audioSession) globalThis.navigator.audioSession.type = "playback";
  } catch {
    /* sin soporte: se usa el <audio> silencioso */
  }
}

/** El contexto si ya existe, sin crearlo (para mirar su estado). */
export const currentAudioContext = () => ctx;

/** El contexto compartido (se crea la primera vez). Devuelve null si el navegador no tiene Web Audio. */
export function audioContext() {
  if (ctx) return ctx;
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctor) return null;
  setPlaybackSession();
  ctx = new Ctor();
  ctx.onstatechange = () => listeners.forEach((f) => f(ctx.state));
  return ctx;
}

/** iOS antiguo (sin audioSession): un <audio> silencioso tocado en un gesto pasa la sesión a reproducción. */
function unlockHtmlAudio() {
  if (htmlUnlocked || globalThis.navigator?.audioSession || typeof Audio === "undefined") return;
  htmlUnlocked = true;
  try {
    const a = new Audio(SILENT_WAV);
    a.setAttribute("x-webkit-airplay", "deny");
    a.preload = "auto";
    const p = a.play();
    if (p?.catch) p.catch(() => { htmlUnlocked = false; });
  } catch {
    htmlUnlocked = false;
  }
}

/** Reanuda el audio. Llamar dentro de un gesto del usuario (toque, clic, tecla). */
export function resumeAudio() {
  setPlaybackSession();
  unlockHtmlAudio();
  const c = audioContext();
  if (c && c.state !== "running" && c.resume) {
    try {
      const p = c.resume();
      if (p?.catch) p.catch(() => {});
    } catch {
      /* se intentará en el próximo gesto */
    }
  }
  return c;
}

/** Reanuda el audio en cada toque, clic o tecla de la página (iOS lo suspende al cambiar de app). */
export function installGestureUnlock(target = globalThis.document) {
  if (!target) return () => {};
  const handler = () => resumeAudio();
  const types = ["pointerdown", "touchend", "keydown"];
  types.forEach((t) => target.addEventListener(t, handler, { capture: true, passive: true }));
  return () => types.forEach((t) => target.removeEventListener(t, handler, { capture: true }));
}

/** Avisa cuando cambia el estado del contexto (para el diagnóstico). */
export function onAudioState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** decodeAudioData con promesa también en Safari antiguo (que solo acepta callbacks). */
export function decodeAudio(c, arrayBuffer) {
  return new Promise((resolve, reject) => {
    const p = c.decodeAudioData(arrayBuffer, resolve, reject);
    if (p?.then) p.then(resolve, reject);
  });
}
