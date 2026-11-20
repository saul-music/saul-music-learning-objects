# Decisiones de saul-music-learning-objects

Las decisiones no se borran: se reemplazan. Prefijo **O**. Las globales viven en el control (C16).

## O1 · Stack del monorepo (2026-11-20)

npm workspaces, Vite (playground), `tonal` (teoría), Web Audio con las muestras de guitarra de Acordia,
DOM + SVG para los juegos (sin motor de juegos) y Vitest. Todo MIT salvo las muestras (CC BY 3.0). Descartados:
`webaudiofont` (GPL), Phaser y Kaplay (sobran para cuestionarios), Tone.js (no hace falta). Postergados: VexFlow
(partitura) y Web MIDI (Safari no lo soporta).

## O2 · Un OA por objetivo, con metadatos LOM (2026-11-20)

Cada OA declara sus metadatos (subconjunto de IEEE LOM) y sus componentes internos (objetivo, contenido,
actividad, evaluación). Los prerrequisitos van en `relation` con `kind: "requires"`; el playground los muestra.

## O3 · Clave americana siempre (2026-11-20)

Las notas se muestran en clave americana; la latina solo como apoyo hablado. Sin selector de notación.

## O4 · Sostenidos siempre en el mástil (2026-11-20)

«La misma nota en otra cuerda» usa las 12 notas y exige haber pasado el OA de intervalos y alteraciones.
