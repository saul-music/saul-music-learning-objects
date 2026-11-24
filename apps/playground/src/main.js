// Playground: banco de OA. La galería lista cada objeto desde sus metadatos y lo monta en #/<id>.
import "@saul-music/theme/acordia.css";
import "@saul-music/theme/base.css";
import "@saul-music/lo-kit/kit.css";
import "./playground.css";
import { createSampler, currentAudioContext, createSfx, GUITAR_NYLON_NOTES, installGestureUnlock, resumeAudio } from "@saul-music/audio";
import { instrumentOf, levelOf, loadBest, minutesOf, richText, starIcon } from "@saul-music/lo-kit";

import * as americanNotation from "@saul-music/lo-american-notation";
import americanNotationMeta from "@saul-music/lo-american-notation/metadata.json";
import americanNotationCover from "@saul-music/lo-american-notation/cover.svg";
import "@saul-music/lo-american-notation/style.css";
import * as intervals from "@saul-music/lo-intervals";
import intervalsMeta from "@saul-music/lo-intervals/metadata.json";
import intervalsCover from "@saul-music/lo-intervals/cover.svg";
import "@saul-music/lo-intervals/style.css";
import * as enharmonic from "@saul-music/lo-enharmonic-spelling";
import enharmonicMeta from "@saul-music/lo-enharmonic-spelling/metadata.json";
import enharmonicCover from "@saul-music/lo-enharmonic-spelling/cover.svg";
import "@saul-music/lo-enharmonic-spelling/style.css";
import * as fretboardNotes from "@saul-music/lo-fretboard-notes";
import fretboardNotesMeta from "@saul-music/lo-fretboard-notes/metadata.json";
import fretboardNotesCover from "@saul-music/lo-fretboard-notes/cover.svg";
import "@saul-music/lo-fretboard-notes/style.css";
import * as arpeggios from "@saul-music/lo-arpeggios";
import arpeggiosMeta from "@saul-music/lo-arpeggios/metadata.json";
import arpeggiosCover from "@saul-music/lo-arpeggios/cover.svg";
import "@saul-music/lo-arpeggios/style.css";
import * as majorMinorEar from "@saul-music/lo-major-minor-ear";
import majorMinorEarMeta from "@saul-music/lo-major-minor-ear/metadata.json";
import majorMinorEarCover from "@saul-music/lo-major-minor-ear/cover.svg";
import "@saul-music/lo-major-minor-ear/style.css";
import * as chordShapes from "@saul-music/lo-chord-shapes";
import chordShapesMeta from "@saul-music/lo-chord-shapes/metadata.json";
import chordShapesCover from "@saul-music/lo-chord-shapes/cover.svg";
import "@saul-music/lo-chord-shapes/style.css";
import * as powerChords from "@saul-music/lo-power-chords";
import powerChordsMeta from "@saul-music/lo-power-chords/metadata.json";
import powerChordsCover from "@saul-music/lo-power-chords/cover.svg";
import "@saul-music/lo-power-chords/style.css";
import * as dimAug from "@saul-music/lo-dim-aug";
import dimAugMeta from "@saul-music/lo-dim-aug/metadata.json";
import dimAugCover from "@saul-music/lo-dim-aug/cover.svg";
import "@saul-music/lo-dim-aug/style.css";
import * as readBars from "@saul-music/lo-read-bars";
import readBarsMeta from "@saul-music/lo-read-bars/metadata.json";
import readBarsCover from "@saul-music/lo-read-bars/cover.svg";
import "@saul-music/lo-read-bars/style.css";
import * as strumRhythm from "@saul-music/lo-strum-rhythm";
import strumRhythmMeta from "@saul-music/lo-strum-rhythm/metadata.json";
import strumRhythmCover from "@saul-music/lo-strum-rhythm/cover.svg";
import "@saul-music/lo-strum-rhythm/style.css";

// Registro explícito, en el orden del recorrido. Los prerrequisitos (LOM relation «requires») marcan ese orden.
const OBJECTS = [
  { module: americanNotation, metadata: americanNotationMeta, cover: americanNotationCover },
  { module: intervals, metadata: intervalsMeta, cover: intervalsCover },
  { module: enharmonic, metadata: enharmonicMeta, cover: enharmonicCover },
  { module: fretboardNotes, metadata: fretboardNotesMeta, cover: fretboardNotesCover },
  { module: arpeggios, metadata: arpeggiosMeta, cover: arpeggiosCover },
  { module: majorMinorEar, metadata: majorMinorEarMeta, cover: majorMinorEarCover },
  { module: chordShapes, metadata: chordShapesMeta, cover: chordShapesCover },
  { module: powerChords, metadata: powerChordsMeta, cover: powerChordsCover },
  { module: dimAug, metadata: dimAugMeta, cover: dimAugCover },
  { module: readBars, metadata: readBarsMeta, cover: readBarsCover },
  { module: strumRhythm, metadata: strumRhythmMeta, cover: strumRhythmCover },
];

const guitar = createSampler({
  baseUrl: `${import.meta.env.BASE_URL}samples/guitar-nylon`,
  notes: GUITAR_NYLON_NOTES,
});
const sfx = createSfx();
// iPhone: cada toque reanuda el audio y lo declara «reproducción» (si no, el interruptor de silencio lo calla).
installGestureUnlock(document);

/** Diagnóstico de audio: agrega ?debug=audio a la dirección para ver el estado y probar el sonido. */
function audioDebugPanel() {
  if (!new URLSearchParams(location.search).has("debug")) return;
  const box = h("aside", "pg-debug");
  const info = h("pre", "pg-debug__info");
  const paint = () => {
    const c = currentAudioContext();
    const session = navigator.audioSession ? navigator.audioSession.type : "no disponible";
    info.textContent = [
      `contexto: ${c ? c.state : "sin crear"}`,
      `sesión de audio: ${session}`,
      `frecuencia: ${c ? c.sampleRate : "-"} Hz`,
      `efectos: ${sfx.muted ? "silenciados" : "activos"}`,
    ].join("\n");
  };
  const btn = (label, fn) => {
    const b = h("button", "lo-btn lo-btn--ghost lo-btn--sm", label);
    b.addEventListener("click", () => { resumeAudio(); fn(); setTimeout(paint, 300); });
    return b;
  };
  box.append(h("b", "", "Diagnóstico de audio"), info,
    btn("Pitido", () => guitar.click({ accent: true, gain: 0.5 })),
    btn("Guitarra (A)", () => guitar.play(57)),
    btn("Efecto", () => { sfx.unlock(); sfx.correct(2); }));
  document.body.append(box);
  paint();
  setInterval(paint, 1000);
}
audioDebugPanel();

const app = document.getElementById("app");
let unmount = null;

/** Crea un elemento; el texto pasa por richText para escribir las notas en tipografía musical. */
function h(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.append(...richText(text));
  return n;
}

/** El siguiente nivel recomendado: el primero sin jugar cuyos prerrequisitos ya se jugaron. */
function recommended(bests) {
  return OBJECTS.findIndex(({ metadata: m }, i) => {
    if (bests[i].plays > 0) return false;
    return (m.relation ?? []).filter((r) => r.kind === "requires").every((r) => {
      const j = OBJECTS.findIndex((o) => o.metadata.id === r.resource.identifier);
      return j < 0 || bests[j].plays > 0;
    });
  });
}

function level({ metadata: m, cover }, i, best, isNext) {
  const li = h("li", `pg-level ${i % 2 ? "is-right" : "is-left"}${best.plays ? " is-played" : ""}${isNext ? " is-next" : ""}`);
  li.style.setProperty("--i", i);
  const href = `#/${m.id}`;

  const node = h("a", "pg-level__node");
  node.href = href;
  node.tabIndex = -1;
  node.setAttribute("aria-hidden", "true");
  const img = h("img");
  img.src = cover;
  img.alt = "";
  img.loading = "lazy";
  const disc = h("span", "pg-level__disc");
  disc.append(img);
  node.append(disc, h("span", "pg-level__num", String(i + 1)));

  const card = h("a", "pg-level__card");
  card.href = href;
  const stars = h("span", "pg-level__stars");
  stars.setAttribute("aria-label", `${best.stars} de 3 estrellas`);
  stars.append(...[0, 1, 2].map((k) => starIcon(k < best.stars)));
  const meta = h("p", "pg-level__meta");
  meta.append(stars, h("span", "", best.plays ? `Récord ${best.points.toLocaleString("es-CL")}` : "Sin jugar"));
  const chips = h("ul", "pg-level__chips");
  for (const t of [instrumentOf(m.educational.instrument), `⏱ ${minutesOf(m.educational.typicalLearningTime)}`, levelOf(m.educational.difficulty)]) chips.append(h("li", "", t));
  card.append(h("p", "pg-level__kicker", m.general.subtitle ?? ""), h("h2", "", m.general.title), h("p", "pg-level__desc", m.general.description), meta, chips);
  for (const r of (m.relation ?? []).filter((x) => x.kind === "requires")) {
    const req = OBJECTS.find((o) => o.metadata.id === r.resource.identifier);
    card.append(h("p", "pg-requires", `Antes: ${req ? req.metadata.general.title : r.resource.description.split(":")[0]}`));
  }
  if (isNext) card.append(h("span", "pg-level__badge", best.plays ? "" : "¡Juega aquí!"));
  li.append(card, node, h("span", "pg-level__spacer"));
  return li;
}

function gallery() {
  const bests = OBJECTS.map((o) => loadBest(o.metadata.id));
  const totalStars = bests.reduce((a, b) => a + b.stars, 0);
  const totalPoints = bests.reduce((a, b) => a + b.points, 0);
  const next = recommended(bests);
  const head = h("header", "pg-hero");
  const score = h("div", "pg-hero__score");
  const starsBox = h("span", "pg-hero__stars");
  starsBox.append(starIcon(true), h("b", "", `${totalStars}/${OBJECTS.length * 3}`));
  score.append(starsBox, h("span", "", `${totalPoints.toLocaleString("es-CL")} puntos`));
  head.append(
    h("p", "pg-kicker", "Playground · Objetos de aprendizaje"),
    h("h1", "", "Mapa de niveles"),
    h("p", "pg-lead", "Siete juegos cortos para aprender música, cada uno con una misión. Síguelos en orden: cada nivel prepara el siguiente."),
    score);
  const map = h("ol", "pg-map");
  map.append(...OBJECTS.map((o, i) => level(o, i, bests[i], i === next)));
  app.replaceChildren(head, map);
}

function route() {
  unmount?.();
  unmount = null;
  const id = location.hash.replace(/^#\/?/, "");
  const idx = OBJECTS.findIndex((o) => o.metadata.id === id);
  scrollTo(0, 0);
  if (idx < 0) return gallery();
  const found = OBJECTS[idx];
  const after = OBJECTS[idx + 1];
  const back = h("a", "pg-back", "← Mapa de niveles");
  back.href = "#/";
  const host = h("div");
  app.replaceChildren(back, host);
  unmount = found.module.mount(host, {
    sampler: guitar,
    sfx,
    metadata: found.metadata,
    cover: found.cover,
    next: after ? { title: after.metadata.general.title, go: () => { location.hash = `#/${after.metadata.id}`; } } : null,
  });
}

const themeBtn = document.querySelector(".pg-theme");
themeBtn.addEventListener("click", () => {
  const html = document.documentElement;
  const dark = html.dataset.theme !== "light";
  html.dataset.theme = dark ? "light" : "dark";
  themeBtn.textContent = dark ? "Noche" : "Marfil";
});

addEventListener("hashchange", route);
route();
