# saul-music-learning-objects

Monorepo de **objetos de aprendizaje (OA)** musicales de Acordia y su playground.

**Playground:** https://saul-music.github.io/saul-music-learning-objects/

Un OA es una pieza autocontenida y reutilizable, con propósito educativo: un objetivo, un contenido breve, una
actividad y su evaluación, más sus metadatos (subconjunto de IEEE LOM) para catalogarlo y ordenarlo.

## Recorrido

| Paso | Juego | Qué enseña | Antes |
|---|---|---|---|
| 1 | [Do es C](packages/lo-american-notation/README.md) | Clave americana y nombres latinos | — |
| 2 | [El misterio de E#](packages/lo-intervals/README.md) | Intervalos, sostenidos, bemoles y notas raras | Do es C |
| 3 | [Nombra bien la nota](packages/lo-enharmonic-spelling/README.md) | La letra correcta y cuándo usar sostenido o bemol | El misterio de E# |
| 4 | [Eco en el mástil](packages/lo-fretboard-notes/README.md) | La misma nota en otra cuerda | Nombra bien la nota |
| 5 | [Escalera del acorde](packages/lo-arpeggios/README.md) | Arpegios: 1ª, 3ª, 5ª y 8ª | El misterio de E# |
| 6 | [Luz y sombra](packages/lo-major-minor-ear/README.md) | Acordes mayores y menores de oído | Escalera del acorde |
| 7 | [Manos de acorde](packages/lo-chord-shapes/README.md) | Formas de acordes en la guitarra | Escalera del acorde |
| 8 | [Pulso](packages/lo-strum-rhythm/README.md) | Figuras del rasgueo y la regla del compás | Manos de acorde |

## Paquetes

- `packages/lo-*`: un OA por paquete (metadatos, lógica, vista, portada y README).
- `packages/lo-kit`: el juego común a los OA (pantalla de título, cuenta regresiva, marcador con puntos y combo,
  fichas de respuesta, efectos de acierto y error, resultados con estrellas y récord, teclado de piano y
  tipografía musical).
- `packages/theme`: colores y tipografía de Acordia (copiados de `acordia_render`) y botones base.
- `packages/audio`: sampler sobre Web Audio con las muestras de guitarra de nailon (FluidR3_GM, CC BY 3.0) y
  efectos de sonido sintetizados.
- `apps/playground`: la galería (Vite), publicada en GitHub Pages por el pipeline.

## Desarrollo

```sh
npm install --userconfig=/dev/null   # solo npm público (.npmrc del repo); comprobar: grep -c artifactory package-lock.json → 0
npm test                             # Vitest
npm run dev                          # playground en local
npm run build                        # apps/playground/dist (base relativa)
```

## Licencia

**CC BY 4.0**, © 2026 Acordia (SAÚL música): puedes copiar, adaptar y usar estos juegos con cualquier fin,
**siempre que des crédito**. Crédito sugerido: «Nombre del juego», de Acordia (SAÚL música),
https://github.com/saul-music/saul-music-learning-objects, CC BY 4.0. Las muestras de guitarra (CC BY 3.0), las
dependencias y las fuentes conservan sus licencias: ver `NOTICE.md`, `LICENSE` y `THIRD_PARTY_NOTICES.md`.

Reglas del repo: `CLAUDE.md`. Estado: `docs/status.md`. Decisiones: `docs/decisions.md`. Avisos de terceros:
`THIRD_PARTY_NOTICES.md`.
