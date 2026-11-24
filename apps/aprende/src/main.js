// Aprende (C44): rutas de lecciones cortas que terminan en un juego. Solo con cuenta (C23, C24): la sesión y el consentimiento
// los gestiona la página de entrada del sitio; aquí se lee la sesión y se guarda el avance por `/api/me/progress` (S103).
import "@saul-music/theme/acordia.css";
import "@saul-music/theme/base.css";
import "@saul-music/lo-kit/kit.css";
import "./aprende.css";
import { createSampler, createSfx, GUITAR_NYLON_NOTES, installGestureUnlock, resumeAudio } from "@saul-music/audio";
import { shapeMidis } from "@saul-music/lo-chord-shapes";
import { el, rich } from "@saul-music/lo-kit";
import { ApiError, createApi } from "./api.js";
import { createAuth } from "./auth.js";
import { previewApi } from "./preview.js";
import { COMING, PATHS, lessonById, pathById } from "./lessons/index.js";
import { OBJECTS } from "./objects.js";
import { lessonMinutes, nextLesson, pathSummary, recommendedLesson, resultOf, withResult } from "./progress.js";
import { messageView, slideCard, stars } from "./views.js";

const app = document.getElementById("app");
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY ?? "";
// La dirección de retorno va codificada: un `#` sin codificar sería el fragmento de esta URL y no parte de `volver`.
const LOGIN = (hash = location.hash) => `/entrar.html?volver=${encodeURIComponent(`/aprende/${hash}`).replace(/%2F/g, "/")}`;

const guitar = createSampler({ baseUrl: `${import.meta.env.BASE_URL}samples/guitar-nylon`, notes: GUITAR_NYLON_NOTES });
const sfx = createSfx();
installGestureUnlock(document);

const state = { api: null, auth: null, progress: {} };
let unmount = null;

// --- tema
const themeBtn = document.getElementById("ap-theme");
themeBtn.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "light";
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  themeBtn.textContent = dark ? "Noche" : "Marfil";
});

const show = (...nodes) => app.replaceChildren(...nodes);
const link = (href, cls, ...children) => el("a", { href, class: cls }, ...children);

// --- inicio: las rutas
function home() {
  const total = PATHS.reduce((acc, p) => {
    const s = pathSummary(state.progress, p);
    return { stars: acc.stars + s.stars, max: acc.max + s.maxStars, points: acc.points + s.points };
  }, { stars: 0, max: 0, points: 0 });
  show(
    el("header", { class: "ap-hero" },
      el("p", { class: "ap-kicker" }, "Aprende"),
      el("h1", {}, "Música, paso a paso"),
      el("p", { class: "ap-lead" }, "Lecciones cortas para aprender música paso a paso. Elige un nivel y avanza a tu ritmo: tu avance queda guardado en tu cuenta."),
      el("p", { class: "ap-total" }, stars(Math.round((total.stars / Math.max(1, total.max)) * 3)), `${total.stars}/${total.max} estrellas · ${total.points} puntos`)),
    el("ul", { class: "ap-paths" },
      PATHS.map((p) => {
        const s = pathSummary(state.progress, p);
        const hasGames = s.total > 0;
        const basicDone = pathSummary(state.progress, PATHS[0]).complete;
        // Una etiqueta que orienta: por dónde empezar, qué sigue.
        const tag = p.level === 1
          ? (s.complete ? "Completado" : s.played ? "En curso" : "Empieza aquí")
          : (basicDone ? "Siguiente nivel" : "Después del Básico");
        return el("li", { class: "ap-path", "data-path": p.id },
          link(`#/${p.id}`, "ap-path__card",
            el("div", { class: "ap-path__top" },
              el("span", { class: "ap-level", "aria-hidden": "true" }, String(p.level)),
              el("span", { class: "ap-path__tag" }, tag)),
            el("p", { class: "ap-kicker" }, `Nivel ${p.level}`),
            el("h2", {}, p.title), el("p", { class: "ap-path__blurb" }, p.blurb),
            el("ul", { class: "ap-chips" }, [`${p.lessons.length} lecciones`, ...(p.chips ?? [])].map((c) => el("li", {}, c))),
            el("p", { class: "ap-meta" }, hasGames ? `${s.played}/${s.total} lecciones jugadas · ${s.stars}/${s.maxStars} estrellas` : "Sin puntos todavía: por ahora son lecciones para leer"),
            el("span", { class: "lo-btn lo-btn--game ap-go" }, s.played ? "Continuar" : "Empezar")));
      }),
      COMING.map((c) => el("li", { class: "ap-path is-soon" },
        el("div", { class: "ap-path__card" }, el("h2", {}, c.title), el("p", {}, c.blurb), el("span", { class: "ap-soon" }, "Pronto"))))));
}

// --- una ruta: el mapa de lecciones
function pathView(path) {
  const s = pathSummary(state.progress, path);
  const next = recommendedLesson(state.progress, path);
  show(
    link("#/", "ap-back", "← Rutas"),
    el("header", { class: "ap-hero" },
      el("div", { class: "ap-hero__level" },
        el("span", { class: "ap-level", "aria-hidden": "true" }, String(path.level)),
        el("p", { class: "ap-kicker" }, `Nivel ${path.level}`),
        el("ul", { class: "ap-chips" }, (path.chips ?? []).map((c) => el("li", {}, c)))),
      el("h1", {}, path.title),
      el("p", { class: "ap-lead" }, path.blurb),
      el("p", { class: "ap-total" }, s.total ? `${s.played}/${s.total} lecciones · ${s.stars}/${s.maxStars} estrellas · ${s.points} puntos` : `${path.lessons.length} lecciones de lectura`)),
    el("ol", { class: "ap-map" },
      path.lessons.map((l, i) => {
        const best = resultOf(state.progress, path.id, l.id);
        const oa = OBJECTS[l.oa];
        const href = `#/${path.id}/${l.id}`;
        const isNext = Boolean(oa) && next?.id === l.id;
        return el("li", { class: `ap-step ${i % 2 ? "is-right" : "is-left"}${best ? " is-played" : ""}${isNext ? " is-next" : ""}`, style: `--i:${i}` },
          link(href, "ap-step__card",
            el("p", { class: "ap-step__kicker" }, `Lección ${i + 1}`),
            el("h2", {}, rich(l.title)),
            el("p", { class: "ap-step__desc" }, rich(l.summary)),
            oa ? el("p", { class: "ap-step__meta" }, best ? [stars(best.stars), `${best.points} pts`] : "Sin jugar") : "",
            el("p", { class: "ap-meta" }, `⏱ ${lessonMinutes(l, oa?.metadata.educational.typicalLearningTime)} min · ${l.slides.length} diapositivas${oa ? " y un juego" : ""}`),
            isNext ? el("span", { class: "ap-step__badge" }, best ? "" : "¡Sigue aquí!") : ""),
          el("a", { href, class: "ap-step__node", tabindex: "-1", "aria-hidden": "true" },
            el("span", { class: `ap-step__disc${oa ? "" : " is-badge"}` }, oa?.cover ? el("img", { src: oa.cover, alt: "", loading: "lazy" }) : el("span", { class: "ap-step__badgeText" }, l.badge ?? "♪")),
            el("span", { class: "ap-step__num" }, String(i + 1))),
          el("span", { class: "ap-step__spacer" }));
      })));
}

// --- una lección: diapositivas y, al final, el juego
function lessonView(path, lesson, startAt = 0) {
  const oa = OBJECTS[lesson.oa];
  const n = lesson.slides.length;
  const steps = oa ? n + 1 : n; // con juego, el último paso es el juego; sin él, la lección termina en la última diapositiva
  let at = Math.min(Math.max(0, startAt), steps - 1);
  const eyebrow = `Lección ${path.lessons.indexOf(lesson) + 1} · ${lesson.title}`;
  // «Continuar» (C30): al abrir una lección se anota; si falla, no importa (no hay que molestar a nadie por esto).
  state.api?.saveContinue({ lesson: { path: path.id, lesson: lesson.id } }).catch(() => {});
  const host = el("div", { class: "ap-lesson-host" });
  let gameUnmount = null;
  show(link(`#/${path.id}`, "ap-back", `← ${path.title}`), host);

  const dots = () => el("ol", { class: "ap-dots", "aria-label": "Progreso de la lección" },
    Array.from({ length: steps }, (_, i) => el("li", { class: `${i < at ? "is-done" : ""}${i === at ? " is-here" : ""}`, "aria-current": i === at ? "step" : null }, el("span", { class: "ap-sr" }, i === n ? "Juego" : `Diapositiva ${i + 1}`))));

  const listen = ({ notes, shapes, gap }) => {
    resumeAudio();
    guitar.preload();
    if (shapes) shapes.forEach((shape, i) => guitar.chord(shapeMidis(shape), { delay: i * (gap ?? 1.4), strum: 0.045 }));
    else guitar.sequence(notes, { gap: gap ?? 0.45 });
  };

  function slides() {
    gameUnmount?.();
    gameUnmount = null;
    const last = at === n - 1;
    host.replaceChildren(
      dots(),
      slideCard(lesson.slides[at], { eyebrow, onListen: listen }),
      el("div", { class: "ap-nav-row" },
        el("button", { class: "lo-btn lo-btn--ghost", type: "button", disabled: at === 0 ? "" : null, onclick: () => go(at - 1) }, "← Anterior"),
        el("button", { class: "lo-btn lo-btn--game", type: "button", onclick: () => (last && !oa ? finish() : go(at + 1)) }, last ? (oa ? "¡A jugar! ▶" : "Terminar lección ✓") : "Siguiente →")));
  }

  function game() {
    const status = el("p", { class: "ap-save", role: "status" });
    const stage = el("div");
    host.replaceChildren(
      dots(),
      el("button", { class: "ap-back ap-back--btn", type: "button", onclick: () => go(n - 1) }, "← Volver a la lección"),
      stage,
      status);
    const after = nextLesson(path, lesson.id);
    stage.addEventListener("lo:result", async (event) => {
      const { points, stars: got } = event.detail;
      status.textContent = "Guardando tu avance…";
      try {
        const saved = await state.api.saveResult({ path: path.id, lesson: lesson.id, points, stars: got });
        state.progress = withResult(state.progress, path.id, lesson.id, saved);
        status.textContent = `Avance guardado: tu mejor resultado en esta lección es ${saved.points} puntos y ${saved.stars} de 3 estrellas.`;
      } catch (error) {
        status.textContent = error instanceof ApiError && error.status === 403
          ? "Tu consentimiento no está al día: entra de nuevo desde Mi cuenta para guardar tu avance."
          : "No pudimos guardar tu avance (revisa tu conexión). Este resultado no quedó guardado.";
      }
    });
    gameUnmount?.();
    gameUnmount = oa.module.mount(stage, {
      sampler: guitar,
      sfx,
      metadata: oa.metadata,
      cover: oa.cover,
      next: after ? { title: after.title, go: () => { location.hash = `#/${path.id}/${after.id}`; } } : null,
    });
  }

  // Lección de solo lectura: al terminar pasa a la siguiente (o vuelve al camino si era la última).
  function finish() {
    const after = nextLesson(path, lesson.id);
    location.hash = after ? `#/${path.id}/${after.id}` : `#/${path.id}`;
  }

  function go(i, { focus = true } = {}) {
    at = Math.min(Math.max(0, i), steps - 1);
    scrollTo(0, 0);
    oa && at === n ? game() : slides();
    // El foco pasa al título de la diapositiva (o al del juego) para quien navega con teclado o lector de pantalla;
    // al abrir la lección no, para no quitarle el foco al enlace con el que llegó.
    if (focus) host.querySelector(".ap-slide h2, .lo-intro h2")?.focus({ preventScroll: true });
  }

  const onKey = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || (oa && at === n) || e.target instanceof HTMLButtonElement) return;
    if (e.key === "ArrowRight") go(Math.min(at + 1, steps - 1));
    else if (e.key === "ArrowLeft") go(at - 1);
  };
  addEventListener("keydown", onKey);
  // Al salir de la lección (otra ruta de la barra de direcciones) se apaga el juego y las flechas del teclado.
  unmount = () => {
    gameUnmount?.();
    removeEventListener("keydown", onKey);
  };
  go(at, { focus: false });
}

function route() {
  unmount?.();
  unmount = null;
  scrollTo(0, 0);
  const [pathId, lessonId] = location.hash.replace(/^#\/?/, "").split("/");
  const path = pathById(pathId);
  // El color y la forma de cada ruta salen de este atributo (ver aprende.css).
  if (path) app.dataset.path = path.id;
  else delete app.dataset.path;
  if (!pathId) return home();
  if (!path) return show(messageView({ title: "No encontramos esa ruta", text: "Puede que aún no exista.", action: { href: "#/", label: "Ver las rutas" } }));
  if (!lessonId) return pathView(path);
  const lesson = lessonById(path, lessonId);
  if (!lesson) return pathView(path);
  lessonView(path, lesson);
}

// --- arranque: sesión, consentimiento y avance
async function boot() {
  // Vista previa local de las lecciones (`npm run dev:preview`): sin sesión ni servidor. Solo existe si la variable se define al
  // construir; el pipeline no la define, así que en producción este bloque no queda en el paquete.
  if (import.meta.env.VITE_LOCAL_PREVIEW) {
    state.api = previewApi();
    addEventListener("hashchange", route);
    return route();
  }
  if (!apiKey) {
    return show(messageView({ title: "Aprende no está disponible aquí", text: "Esta copia no tiene configurado el inicio de sesión. Entra desde la dirección oficial del sitio." }));
  }
  show(el("p", { class: "ap-loading" }, "Cargando…"));
  try {
    state.auth = await createAuth(apiKey);
  } catch {
    return show(messageView({ title: "No pudimos cargar tu sesión", text: "Revisa tu conexión e inténtalo de nuevo.", action: { label: "Reintentar", onclick: () => location.reload() } }));
  }
  // «Hay una sesión»: las páginas de tema del sitio solo cargan Firebase si existe esta marca (sin datos personales).
  try {
    state.auth.user ? localStorage.setItem("acordia-session", "1") : localStorage.removeItem("acordia-session");
  } catch { /* sin almacenamiento */ }
  if (!state.auth.user) {
    return show(messageView({
      title: "Entra para aprender",
      text: "Aprende guarda tu avance en tu cuenta, así que necesitas una (es gratis y puedes eliminarla cuando quieras).",
      action: { href: LOGIN(), label: "Entrar o crear mi cuenta" },
    }));
  }
  document.getElementById("ap-account").hidden = false;
  state.api = createApi({ getToken: state.auth.getToken });
  try {
    const consent = await state.api.consent();
    if (consent.accepted !== consent.current) {
      return show(messageView({
        title: "Un paso más antes de empezar",
        text: "Para guardar tu avance necesitamos que aceptes el aviso de privacidad vigente.",
        action: { href: LOGIN(), label: "Revisar y aceptar" },
      }));
    }
    state.progress = await state.api.progress();
  } catch (error) {
    return show(messageView({
      title: "No pudimos consultar tu cuenta",
      text: error instanceof ApiError && error.status === 404 ? "El sitio no reconoció tu sesión. Entra de nuevo." : "Inténtalo de nuevo en un minuto.",
      action: error instanceof ApiError && error.status === 404 ? { href: LOGIN(), label: "Entrar de nuevo" } : { label: "Reintentar", onclick: () => location.reload() },
    }));
  }
  addEventListener("hashchange", route);
  route();
}

boot();
