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

## O5 · Kit común `lo-kit` (2026-11-20)

Lo que comparten los OA (introducción, cuestionario de alternativas, avance, efectos de acierto y error, resumen,
teclado de piano y nombres de notas) vive en `packages/lo-kit`. Cada OA aporta su lógica, su figura y sus
metadatos; así un OA nuevo no repite la interfaz y todos se ven y se comportan igual.

## O6 · Recorrido y nombres de los juegos (2026-11-20)

Cinco OA en orden, encadenados por sus prerrequisitos: 1 «Do es C» (clave americana), 2 «El misterio de E#»
(intervalos, alteraciones y notas raras), 3 «Eco en el mástil» (la misma nota en otra cuerda), 4 «Escalera del
acorde» (arpegio 1ª–3ª–5ª–8ª) y 5 «Luz y sombra» (mayor o menor de oído). El segundo juego pedido se dividió en
cuatro OA por granularidad (un objetivo por OA). El tercer juego (a partir de `saul-music-site-midi`) queda para el
segundo incremento.

## O7 · Licencia CC BY 4.0 (2026-11-20)

Todo el repo (código, juegos, textos, portadas y metadatos) se publica bajo CC BY 4.0, © Acordia (SAÚL música):
cualquiera puede usarlo y adaptarlo, con cualquier fin, **siempre que dé crédito**. Lo pidió el usuario («de CC,
pero que siempre tengan que darme créditos»). Nota: Creative Commons no recomienda sus licencias para software
(no tratan patentes ni distribución de código fuente); se acepta porque aquí pesa más el contenido educativo y el
crédito. Quedan fuera las muestras (CC BY 3.0), las dependencias (MIT) y las fuentes (OFL).
