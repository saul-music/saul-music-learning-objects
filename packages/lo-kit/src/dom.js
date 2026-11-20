// Ayudantes mínimos para armar DOM y SVG sin framework.
const SVG_NS = "http://www.w3.org/2000/svg";

/** Crea un elemento HTML. `on*` agrega oyentes; los hijos falsos se ignoran. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.append(...children.flat().filter((c) => c !== "" && c != null && c !== false));
  return node;
}

/** Crea un elemento SVG. */
export function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}
