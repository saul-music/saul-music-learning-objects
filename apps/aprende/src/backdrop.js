// Fondo animado del hilo de una ruta: figuras musicales que flotan despacio sobre un pentagrama tenue.
// Básico flota notas y alteraciones; Intermedio, diagramas de acorde, púas y nombres de acorde. Todo SVG y CSS (sin librerías),
// con el color de la ruta (`--tone`) y sin movimiento si la persona pidió menos animación (ver aprende.css).
import { el, svg } from "@saul-music/lo-kit";

/** Generador pseudoaleatorio con semilla: el fondo se ve igual cada vez que se entra a la ruta. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const S = (children, { stroke = false } = {}) => {
  const root = svg("svg", { viewBox: "0 0 40 40", "aria-hidden": "true", ...(stroke ? { fill: "none", stroke: "currentColor", "stroke-width": 2.4, "stroke-linecap": "round", "stroke-linejoin": "round" } : { fill: "currentColor" }) });
  root.append(...children);
  return root;
};
const P = (d, extra = {}) => svg("path", { d, ...extra });
const E = (cx, cy, rx, ry, rot) => svg("ellipse", { cx, cy, rx, ry, transform: `rotate(${rot} ${cx} ${cy})` });
const R = (x, y, width, height) => svg("rect", { x, y, width, height, rx: 1 });

const FIGURES = {
  quarter: () => S([E(14, 31, 7.5, 5.5, -20), R(19.8, 6, 2.6, 25)]),
  eighth: () => S([E(14, 31, 7.5, 5.5, -20), R(19.8, 6, 2.6, 25), P("M22.4 6C30 10 34 16 31 24 30 19 27 16 22.4 15Z")]),
  beamed: () => S([E(10, 31, 6.5, 5, -20), R(14.8, 7, 2.6, 24), E(28, 28, 6.5, 5, -20), R(32.8, 4, 2.6, 24), P("M14.8 6 36 2V8L14.8 12Z")]),
  sharp: () => S([P("M15 6V34M25 4V32M9 17L31 12M9 28L31 23", { "stroke-width": 3 })], { stroke: true }),
  flat: () => S([P("M13 4V33C24 28 31 22 24 17 20 14 14 18 13 24")], { stroke: true }),
  pick: () => S([P("M20 36C8 28 5 14 10 9 15 5 25 5 30 9 35 14 32 28 20 36Z")], { stroke: true }),
  chord: () => S([
    P("M8 8H32", { "stroke-width": 3.4 }), P("M8 16H32M8 24H32M8 32H32", { "stroke-width": 1.6 }), P("M8 8V32M14 8V32M20 8V32M26 8V32M32 8V32", { "stroke-width": 1.6 }),
    svg("circle", { cx: 14, cy: 16, r: 3, fill: "currentColor", stroke: "none" }), svg("circle", { cx: 20, cy: 24, r: 3, fill: "currentColor", stroke: "none" }), svg("circle", { cx: 26, cy: 16, r: 3, fill: "currentColor", stroke: "none" }),
  ], { stroke: true }),
};
const LABELS = ["7", "maj7", "sus", "dim7", "#9", "9", "G/B", "m7", "add9", "6"];

const SETS = {
  basico: { shapes: ["quarter", "eighth", "beamed", "quarter", "eighth", "sharp", "flat", "beamed"], labels: false, seed: 11 },
  intermedio: { shapes: ["chord", "pick", "chord", "sharp", "flat", "pick", "beamed"], labels: true, seed: 29 },
};

/** El fondo de una ruta: una capa decorativa (aria-hidden) con ~30 figuras repartidas a lo largo del hilo. */
export function backdrop(pathId, count = 30) {
  const set = SETS[pathId] ?? SETS.basico;
  const rand = rng(set.seed);
  const layer = el("div", { class: "ap-backdrop", "aria-hidden": "true" });
  for (let i = 0; i < count; i++) {
    const useLabel = set.labels && i % 3 === 1;
    const size = 32 + rand() * 40;
    const fig = el("span", {
      class: `ap-fig${useLabel ? " is-label" : ""}`,
      style: [
        `--x:${(3 + rand() * 91).toFixed(1)}%`,
        `--y:${(((i + rand() * 0.8) / count) * 96 + 1).toFixed(1)}%`,
        `--s:${size.toFixed(0)}px`,
        `--r:${(rand() * 40 - 20).toFixed(0)}deg`,
        `--d:${(10 + rand() * 12).toFixed(1)}s`,
        `--delay:${(rand() * -20).toFixed(1)}s`,
        `--o:${(0.24 + rand() * 0.22).toFixed(2)}`,
      ].join(";"),
    }, useLabel ? LABELS[Math.floor(rand() * LABELS.length)] : FIGURES[set.shapes[Math.floor(rand() * set.shapes.length)]]());
    layer.append(fig);
  }
  return layer;
}
