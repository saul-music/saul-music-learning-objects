# Escalera del acorde

![Portada de «Escalera del acorde»](cover.svg)

**Arpegios: 1ª, 3ª, 5ª y 8ª** · paso 4 del recorrido · teoría · 5 min · dificultad media

Un acorde es una escalera de cuatro peldaños: 1ª, 3ª, 5ª y la octava. Sube por ella en acordes mayores y menores.

## Objetivo

Construir el arpegio 1ª – 3ª – 5ª – 8ª de acordes mayores y menores y reconocer qué paso ocupa cada nota.

## Contenido

1. **La 1ª.** Es la raíz: la nota que le da nombre al acorde. En D mayor, la 1ª es D.
2. **La 3ª.** Decide el color: a 4 semitonos de la raíz es mayor (D – F#); a 3 es menor (D – F).
3. **La 5ª.** Está a 7 semitonos de la raíz (5ª justa) y es igual en mayor y en menor: en D, es A.
4. **La 8ª.** La octava es la raíz otra vez, 12 semitonos más arriba. Mismo nombre, más aguda.

## Actividad

Diez preguntas: completar la nota que falta, decir cuál es un paso del arpegio y qué paso ocupa una nota.

## Evaluación

Retroalimentación inmediata con la escalera, el teclado y el arpegio sonando; al final, el puntaje y un repaso de los errores.

## Prerrequisitos

- [El misterio de E#](../lo-intervals/README.md): medios tonos e intervalos (3ª mayor, 3ª menor, 5ª justa).

Prepara para: [Luz y sombra](../lo-major-minor-ear/README.md).

## Uso

```js
import { mount } from "@saul-music/lo-arpeggios";
import metadata from "@saul-music/lo-arpeggios/metadata.json";
import "@saul-music/lo-kit/kit.css";
import "@saul-music/lo-arpeggios/style.css";

const unmount = mount(document.getElementById("juego"), { sampler, metadata });
```

`sampler` es opcional (sin él, el juego funciona en silencio); el playground usa `createSampler` de
`@saul-music/audio` con las muestras de guitarra de nailon.

## Estructura

- `metadata.json`: metadatos (subconjunto de IEEE LOM) y componentes pedagógicos.
- `src/theory.js`: lógica pura de las preguntas, probada en `test/` con Vitest.
- `src/index.js`: la vista (tarjeta, figura y sonido) sobre el cuestionario de `@saul-music/lo-kit`.
- `cover.svg`: portada de la galería.

## Licencia

CC BY 4.0, © 2026 Acordia (SAÚL música): puedes usarlo y adaptarlo dando crédito. Ver [`LICENSE`](../../LICENSE).
