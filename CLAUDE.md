# saul-music-learning-objects

Monorepo **público** de objetos de aprendizaje (OA) musicales de Acordia y su playground (GitHub Pages).
Repo hijo de `saul-music-development-control` (contexto, decisiones globales y estado del proyecto).

## Qué es un OA aquí

Un paquete en `packages/lo-*`: autocontenido, reutilizable y con propósito educativo. Cada uno trae:

- `metadata.json`: estructura externa (subconjunto de IEEE LOM: `general`, `educational`, `rights`,
  `relation` con `kind: "requires"` para los prerrequisitos) y los componentes internos en `pedagogy`
  (`objective`, `content`, `activity`, `evaluation`).
- `src/theory.js` (lógica pura, con pruebas en `test/`) y `src/index.js` (`mount(elemento, { sampler, metadata })`).
- `cover.svg` (portada de la galería) y `README.md`.

Granularidad: un objetivo por OA. Si un juego enseña varias cosas, son varios OA.

## Reglas

- **Clave americana siempre** (C, D, E…). La forma latina solo como apoyo hablado («se dice La»).
- Colores y fuentes solo desde `@saul-music/theme` (tokens `--ac-*` copiados de `acordia_render`). Estilo plano:
  sin sombras ni brillos. Animaciones con `prefers-reduced-motion`.
- **Repo público:** nada de datos, comentarios de YouTube, títulos de covers, acordes ni letras de canciones (M9).
  Solo ejercicios sintéticos.
- npm solo del registro público: `npm install --userconfig=/dev/null` y `grep -c artifactory package-lock.json` = 0.
- Git: ramas `feat/`, `fix/`, `docs/` y PR a `main`. Pipeline único y secuencial: tests -> build -> deploy (D45).
- Documentación en español; identificadores en inglés. Estado: `docs/status.md`; decisiones: `docs/decisions.md`.
