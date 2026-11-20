// Teclado de piano en SVG, para mostrar notas, medios tonos e intervalos.
import { svg } from "./dom.js";
import { pretty } from "./notes.js";

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
const LETTER = { 0: "C", 2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 11: "B" };
const W = 44; // ancho de tecla blanca (unidades del viewBox)
const H = 170;
const BW = 26;
const BH = 106;

const isWhite = (midi) => WHITE_PCS.includes(((midi % 12) + 12) % 12);

/**
 * @param {object} o
 * @param {number} [o.from]   primera tecla (MIDI, debe ser blanca); por defecto C3
 * @param {number} [o.to]     última tecla (MIDI, blanca); por defecto B4
 * @param {{midi: number, kind: "source"|"answer"|"miss"|"hint", label?: string}[]} [o.marks]
 * @param {boolean} [o.letters] escribe la letra en cada tecla blanca
 * @param {string} [o.label]  nombre accesible
 */
export function drawKeyboard({ from = 48, to = 71, marks = [], letters = false, label = "Teclado de piano" } = {}) {
  const whites = [];
  for (let m = from; m <= to; m++) if (isWhite(m)) whites.push(m);
  const width = whites.length * W;
  const root = svg("svg", { viewBox: `0 0 ${width + 2} ${H + 2}`, class: "lo-keyboard", role: "img", "aria-label": label });
  const xOf = new Map();
  whites.forEach((m, i) => xOf.set(m, 1 + i * W));
  const markOf = new Map(marks.map((k) => [k.midi, k]));

  for (const m of whites) {
    const mark = markOf.get(m);
    root.append(svg("rect", { x: xOf.get(m), y: 1, width: W, height: H, rx: 3, class: `white${mark ? ` is-${mark.kind}` : ""}` }));
    if (letters) root.append(svg("text", { x: xOf.get(m) + W / 2, y: H - 12, class: "key-letter" }, LETTER[m % 12]));
  }
  const blacks = [];
  for (let m = from; m <= to; m++) {
    if (isWhite(m) || !xOf.has(m - 1)) continue;
    const x = xOf.get(m - 1) + W - BW / 2;
    const mark = markOf.get(m);
    root.append(svg("rect", { x, y: 1, width: BW, height: BH, rx: 2, class: `black${mark ? ` is-${mark.kind}` : ""}` }));
    blacks.push([m, x]);
  }
  // Marcas con etiqueta: círculo sobre la tecla.
  for (const k of marks) {
    if (!k.label) continue;
    let cx;
    let cy;
    if (isWhite(k.midi)) {
      if (!xOf.has(k.midi)) continue;
      cx = xOf.get(k.midi) + W / 2;
      cy = H - (letters ? 46 : 26);
    } else {
      const b = blacks.find(([m]) => m === k.midi);
      if (!b) continue;
      cx = b[1] + BW / 2;
      cy = BH - 20;
    }
    root.append(svg("circle", { cx, cy, r: 15, class: `key-mark is-${k.kind}` }));
    // Las notas van con ♯/♭ reales en tipografía musical; lo demás («1ª», «?») en la del marcador.
    const isNote = /^[A-G](##|#|bb|b)?$/.test(k.label);
    root.append(svg("text", { x: cx, y: cy + 5, class: `key-mark-text is-${k.kind}${isNote ? "" : " is-step"}` }, isNote ? pretty(k.label) : k.label));
  }
  return root;
}
