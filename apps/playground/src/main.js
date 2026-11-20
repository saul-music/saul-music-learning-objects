// Playground: banco de OA. La galería lista cada objeto desde sus metadatos y lo monta en #/<id>.
import "@saul-music/theme/acordia.css";
import "@saul-music/theme/base.css";
import "@saul-music/lo-kit/kit.css";
import "./playground.css";
import { createSampler, GUITAR_NYLON_NOTES } from "@saul-music/audio";
import { instrumentOf, levelOf, minutesOf } from "@saul-music/lo-kit";

import * as americanNotation from "@saul-music/lo-american-notation";
import americanNotationMeta from "@saul-music/lo-american-notation/metadata.json";
import americanNotationCover from "@saul-music/lo-american-notation/cover.svg";
import "@saul-music/lo-american-notation/style.css";
import * as intervals from "@saul-music/lo-intervals";
import intervalsMeta from "@saul-music/lo-intervals/metadata.json";
import intervalsCover from "@saul-music/lo-intervals/cover.svg";
import "@saul-music/lo-intervals/style.css";
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

// Registro explícito, en el orden del recorrido. Los prerrequisitos (LOM relation «requires») marcan ese orden.
const OBJECTS = [
  { module: americanNotation, metadata: americanNotationMeta, cover: americanNotationCover },
  { module: intervals, metadata: intervalsMeta, cover: intervalsCover },
  { module: fretboardNotes, metadata: fretboardNotesMeta, cover: fretboardNotesCover },
  { module: arpeggios, metadata: arpeggiosMeta, cover: arpeggiosCover },
  { module: majorMinorEar, metadata: majorMinorEarMeta, cover: majorMinorEarCover },
];
const byId = new Map(OBJECTS.map((o) => [o.metadata.id, o]));

const guitar = createSampler({
  baseUrl: `${import.meta.env.BASE_URL}samples/guitar-nylon`,
  notes: GUITAR_NYLON_NOTES,
});

const app = document.getElementById("app");
let unmount = null;

function h(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function card({ metadata: m, cover }, i) {
  const a = h("a", "pg-card");
  a.href = `#/${m.id}`;
  a.style.setProperty("--i", i);
  const img = h("img", "pg-card__cover");
  img.src = cover;
  img.alt = "";
  img.loading = "lazy";
  const figure = h("div", "pg-card__figure");
  figure.append(img, h("span", "pg-card__step", String(i + 1)));
  const body = h("div", "pg-card__body");
  body.append(h("p", "pg-card__kicker", m.general.subtitle ?? ""), h("h2", "", m.general.title), h("p", "pg-card__desc", m.general.description));
  const chips = h("ul", "pg-card__chips");
  for (const t of [instrumentOf(m.educational.instrument), `⏱ ${minutesOf(m.educational.typicalLearningTime)}`, levelOf(m.educational.difficulty)]) chips.append(h("li", "", t));
  body.append(chips);
  for (const r of (m.relation ?? []).filter((x) => x.kind === "requires")) {
    const req = byId.get(r.resource.identifier);
    body.append(h("p", "pg-requires", `Antes: ${req ? req.metadata.general.title : r.resource.description.split(":")[0]}${req ? "" : " (pronto)"}`));
  }
  a.append(figure, body);
  return a;
}

function gallery() {
  const head = h("header", "pg-hero");
  head.append(
    h("p", "pg-kicker", "Playground"),
    h("h1", "", "Objetos de aprendizaje"),
    h("p", "pg-lead", "Juegos cortos para aprender música, cada uno con un objetivo. Síguelos en orden: cada uno prepara el siguiente."));
  const grid = h("div", "pg-grid");
  grid.append(...OBJECTS.map(card));
  app.replaceChildren(head, grid);
}

function route() {
  unmount?.();
  unmount = null;
  const id = location.hash.replace(/^#\/?/, "");
  const found = byId.get(id);
  scrollTo(0, 0);
  if (!found) return gallery();
  const back = h("a", "pg-back", "← Todos los juegos");
  back.href = "#/";
  const host = h("div");
  app.replaceChildren(back, host);
  unmount = found.module.mount(host, { sampler: guitar, metadata: found.metadata });
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
