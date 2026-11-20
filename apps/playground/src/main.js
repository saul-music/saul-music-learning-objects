// Playground: banco de OA. Lista cada objeto desde sus metadatos y lo monta en #/<id>.
import "@saul-music/theme/acordia.css";
import "@saul-music/theme/base.css";
import "./playground.css";
import { createSampler, GUITAR_NYLON_NOTES } from "@saul-music/audio";
import * as fretboardNotes from "@saul-music/lo-fretboard-notes";
import fretboardNotesMeta from "@saul-music/lo-fretboard-notes/metadata.json";
import "@saul-music/lo-fretboard-notes/style.css";

// Registro explícito: un OA nuevo se agrega aquí con su módulo y sus metadatos.
const OBJECTS = [{ module: fretboardNotes, metadata: fretboardNotesMeta }];

const guitar = createSampler({
  baseUrl: `${import.meta.env.BASE_URL}samples/guitar-nylon`,
  notes: GUITAR_NYLON_NOTES,
});

const app = document.getElementById("app");
let unmount = null;

function card({ metadata: m }) {
  const a = document.createElement("a");
  a.className = "pg-card";
  a.href = `#/${m.id}`;
  const e = m.educational;
  a.innerHTML = `<h2></h2><p></p><dl>
    <div><dt>Tiempo</dt><dd>${e.typicalLearningTime.replace("PT", "").replace("M", " min")}</dd></div>
    <div><dt>Dificultad</dt><dd>${{ easy: "Fácil", medium: "Media", difficult: "Difícil" }[e.difficulty]}</dd></div>
    <div><dt>Tipo</dt><dd>Cuestionario</dd></div></dl>`;
  a.querySelector("h2").textContent = m.general.title;
  a.querySelector("p").textContent = m.general.description;
  // Prerrequisitos (LOM relation «requires»). Si el OA requerido aún no está en el banco, se marca «pronto».
  for (const r of (m.relation ?? []).filter((x) => x.kind === "requires")) {
    const ready = OBJECTS.some((o) => o.metadata.id === r.resource.identifier);
    const req = document.createElement("p");
    req.className = "pg-requires";
    req.textContent = `Antes: ${r.resource.description.split(":")[0]}${ready ? "" : " (pronto)"}`;
    a.append(req);
  }
  return a;
}

function route() {
  unmount?.();
  unmount = null;
  const id = location.hash.replace(/^#\/?/, "");
  const found = OBJECTS.find((o) => o.metadata.id === id);
  if (!found) {
    const intro = document.createElement("p");
    intro.className = "pg-lead";
    intro.textContent = "Cada objeto de aprendizaje es una pieza autocontenida y reutilizable, con un objetivo, un contenido breve, una actividad y su evaluación.";
    const grid = document.createElement("div");
    grid.className = "pg-grid";
    grid.append(...OBJECTS.map(card));
    app.replaceChildren(intro, grid);
    return;
  }
  const back = document.createElement("a");
  back.href = "#/";
  back.className = "pg-back";
  back.textContent = "← Todos los objetos";
  const host = document.createElement("div");
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
