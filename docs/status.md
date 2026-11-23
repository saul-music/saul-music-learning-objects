# Estado de saul-music-learning-objects

> Registro vivo. Última actualización: 2026-11-20.

## Paso actual

- Repo creado y publicado en GitHub Pages (https://saul-music.github.io/saul-music-learning-objects/).
- Cinco OA en un recorrido (O6), sobre el kit común (O5): «Do es C», «El misterio de E#», «Eco en el mástil»,
  «Escalera del acorde» y «Luz y sombra», cada uno con portada y README.
- Tercer juego en dos OA (O8): «Manos de acorde» y «Pulso». Siete juegos en el recorrido.
- Ocho juegos: «Nombra bien la nota» (O12) es el paso 3, entre «El misterio de E#» y «Eco en el mástil».
- Un solo sonido a la vez y cuenta regresiva sin recorte (O11).
- Look de juego (O9): pantallas de título, cuenta regresiva, marcador con puntos y combo, resultados con estrellas
  y récord, mapa de niveles, tipografía musical (Petaluma, Noto Music), colores de ganar/perder y efectos de sonido.

## Pendientes

- Probar en iPhone y Android reales, y oírlo (también los efectos de sonido y el volumen frente a la guitarra).
- El playground muestra los prerrequisitos pero no bloquea el orden: decidir si se guarda el avance y se bloquea.

## Bitácora

```text
2026-11-20 · creación · prototipo del playground y primer OA; pipeline tests -> build -> deploy · O1 a O4
2026-11-20 · segundo juego · kit común y cuatro OA nuevos con portada y README; recorrido en la galería · O5, O6
2026-11-20 · licencia · CC BY 4.0 con crédito a Acordia (SAÚL música) para código y contenido · O7
2026-11-20 · tercer juego · «Manos de acorde» (chords-db) y «Pulso» (regla de rasgueo); LICENSE oficial y NOTICE.md · O8
2026-11-20 · look de juego · núcleo visual nuevo en lo-kit con la misma lógica; mapa de niveles; puntuación, récords y estrellas; tipografía musical y colores de ganar/perder · O9
2026-11-20 · audio en iPhone · sesión «playback» (interruptor de silencio), un solo contexto, reanudar en cada toque y ?debug=audio · O10
```
2026-11-20 · arreglos de juego y juego nuevo · cuenta regresiva sin recorte y un sonido a la vez con «Reproduciendo…» (PR #5, O11); «Nombra bien la nota», ortografía enarmónica (O12) · pendiente: ojo y oído en celular real
2026-11-20 · errores de la carpeta BUGS · alfabeto sin delatar la vecina, descripción y tarjetas de «Luz y sombra» (texto en línea, un sonido a la vez), `[object HTMLSpanElement]` en «Pulso», notas de acordes en tipografía musical en «Nombra bien la nota» (O13) · pendiente: celular real
2026-11-23 · puntaje templado (O14) · hasta 10 por acierto y 100 por partida, la racha no multiplica, récords del navegador en clave nueva y evento `lo:result` para alojar los juegos en Aprende; 63 pruebas y build en verde · pendiente: verlo a ojo en celular real · O14, C44
2026-11-23 · Aprende, path básico (O15, en PR) · `apps/aprende/`: inicio, mapa de lecciones, diapositivas con figuras y sonido y el juego de cada lección; 8 lecciones del path básico; solo con cuenta, avance por `/api/me/progress`; despliegue a Hosting bajo `/aprende/` (script que conserva la configuración vigente, WIF, solo main); derechos reservados en esa carpeta; 92 pruebas y una corrida de navegador completa · pendiente: primer despliegue real, cuentas reales, celular real · O15, C44
2026-11-23 · Aprende en producción (O17) · publicado en `https://saulapp-music.web.app/aprende/` tras tres intentos (URLs reservadas, `run.viewer`, y una comprobación que no esperaba al CDN); verificado con `curl` y con un navegador real y el SDK real: sin sesión pide entrar · pendiente: probarlo con una cuenta real (entrar, aceptar v3, jugar, guardar), celular real, iPhone · O17, O16, O15, C44
2026-11-24 · Aprende y Mi cuenta (O19, en PR) · publica `/aprende/lessons.json` (solo id y título), anota «continuar» al abrir una lección, deja la marca de sesión y enlaza a `/mi-acordia.html`; 96 pruebas y corrida de navegador · pendiente: cuenta real · O19, C45

