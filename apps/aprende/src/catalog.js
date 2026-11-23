// El catálogo público de Aprende: rutas y lecciones con sus títulos, sin el contenido (que tiene derechos reservados).
// Se publica como `/aprende/lessons.json` para que «Mi cuenta» del sitio muestre títulos reales (S104, C30).
import { PATHS } from "./lessons/index.js";

export function lessonsCatalog(paths = PATHS) {
  return paths.map((p) => ({
    id: p.id,
    title: p.title,
    lessons: p.lessons.map((l) => ({ id: l.id, title: l.title })),
  }));
}
