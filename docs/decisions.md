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

## O8 · Tercer juego en dos OA: «Manos de acorde» y «Pulso» (2026-11-20)

Lo que había en `saul-music-site-midi` (formas de acordes de chords-db, la regla de rasgueo del laboratorio y la
guitarra) se convierte en dos OA, a pedido del usuario: 6 «Manos de acorde» (formas de acordes mayores, menores y de
séptima, y qué nota suena en cada cuerda; subconjunto de chords-db, MIT) y 7 «Pulso» (redonda, blancas, negras y
blanca con punto, la regla «1 acorde → un golpe, 2 → blancas, más → negras» y contar tiempos, con metrónomo). El kit
admite alternativas con figura (diagramas) y el sampler suma un clic de metrónomo sintetizado. `LICENSE` queda con el
texto oficial de CC BY 4.0 (para que GitHub la reconozca) y el aviso de crédito pasa a `NOTICE.md`.

## O9 · Look de juego, con la misma funcionalidad (2026-11-20)

Pedido del usuario: que los OA se sientan como juegos y no como encuestas animadas, sin cambiar lo que enseñan.
Se cambia el núcleo visual (`lo-kit`), no la lógica de los OA (sus `theory.js` y pruebas quedan iguales):

- **Pantallas de juego:** título (portada, récord, estrellas y botón «Jugar»), cuenta regresiva «3, 2, 1, ¡Ya!»,
  marcador (ronda, pista de 10 casillas gana/pierde, puntos que cuentan, combo y sonido), resultados (1 a 3
  estrellas, puntos, récord, racha máxima, precisión, repaso y «Siguiente juego»). La galería pasa a ser un
  **mapa de niveles** con el progreso y el siguiente nivel recomendado.
- **Puntuación:** 100 por acierto + bono por rapidez (hasta 100, baja en 12 s; el tiempo **no** corta la pregunta)
  × combo (×2 desde 3 aciertos seguidos, ×3 desde 5, ×4 desde 8). Estrellas solo por aciertos (3 con 9–10, 2 con
  7–8, 1 con 4–6). Récord y estrellas en `localStorage` del navegador (sin datos personales ni servidor).
- **Tipografía musical:** notas y cifrados en Petaluma Script (la de acordes de Acordia, OFL) con ♯ y ♭ reales;
  figuras y claves en Noto Music (OFL, Google Fonts). El texto corrido reconoce notas alteradas, cifrados y notas
  en listas.
- **Colores de ganar y perder:** extensión del tema (`--ac-win` jade y `--ac-lose` terracota, en Noche y Marfil);
  la marca no cambia. Estilo plano: el volumen de botones y fichas es un canto inferior sólido, sin sombras difusas.
- **Efectos de sonido** sintetizados con Web Audio (sin archivos), aparte de la música, con silencio recordado.
- **Atajos:** teclas 1 a 4 para responder y Enter para seguir. Todo respeta `prefers-reduced-motion`.

## O10 · Audio preparado para iPhone (2026-11-20)

En iPhone no sonaba nada. Causa más probable: iOS calla Web Audio con el interruptor de silencio del costado, y el
playground no declaraba la sesión de audio como reproducción (el reproductor de Acordia sí lo hace). Se corrige en
`packages/audio/src/context.js`:

- `navigator.audioSession.type = "playback"` antes de crear el contexto y en cada gesto (Safari 16.4+); en iOS más
  antiguo, un `<audio>` silencioso en el primer toque cumple el mismo papel.
- **Un solo contexto** para guitarra y efectos (antes había dos).
- **Reanudar en cada toque**: iOS suspende o «interrumpe» el contexto al cambiar de app y solo un gesto lo reanuda.
- Respaldo `webkitAudioContext` y `decodeAudioData` con callbacks para Safari antiguo; cada muestra se baja una vez.
- Diagnóstico: `?debug=audio` en la dirección muestra el estado del contexto y la sesión, con botones de prueba.
