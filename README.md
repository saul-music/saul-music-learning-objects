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
| 3 | [Eco en el mástil](packages/lo-fretboard-notes/README.md) | La misma nota en otra cuerda | El misterio de E# |
| 4 | [Escalera del acorde](packages/lo-arpeggios/README.md) | Arpegios: 1ª, 3ª, 5ª y 8ª | El misterio de E# |
| 5 | [Luz y sombra](packages/lo-major-minor-ear/README.md) | Acordes mayores y menores de oído | Escalera del acorde |

## Paquetes

- `packages/lo-*`: un OA por paquete (metadatos, lógica, vista, portada y README).
- `packages/lo-kit`: lo común a los OA (introducción, cuestionario de alternativas, efectos de acierto y error,
  resumen y teclado de piano).
- `packages/theme`: colores y tipografía de Acordia (copiados de `acordia_render`) y botones base.
- `packages/audio`: sampler sobre Web Audio con las muestras de guitarra de nailon (FluidR3_GM, CC BY 3.0).
- `apps/playground`: la galería (Vite), publicada en GitHub Pages por el pipeline.

## Desarrollo

```sh
npm install --userconfig=/dev/null   # solo npm público (.npmrc del repo); comprobar: grep -c artifactory package-lock.json → 0
npm test                             # Vitest
npm run dev                          # playground en local
npm run build                        # apps/playground/dist (base relativa)
```

Reglas del repo: `CLAUDE.md`. Estado: `docs/status.md`. Decisiones: `docs/decisions.md`. Avisos de terceros:
`THIRD_PARTY_NOTICES.md`.
