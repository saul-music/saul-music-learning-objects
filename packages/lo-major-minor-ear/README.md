# Luz y sombra

![Portada de «Luz y sombra»](cover.svg)

**Acordes mayores y menores de oído** · paso 5 del recorrido · oído · 5 min · dificultad media

Escucha un acorde y decide: ¿luz o sombra? Entrena el oído para distinguir mayores y menores.

## Objetivo

Reconocer de oído si un acorde es mayor o menor, atendiendo a su 3ª.

## Contenido

1. **Una sola nota cambia.** Mayor y menor comparten la 1ª y la 5ª. Solo cambia la 3ª: 4 semitonos en mayor, 3 en menor.
2. **Luz y sombra.** Muchos oyen el mayor más abierto o luminoso y el menor más oscuro o melancólico. Usa la imagen que te sirva.
3. **Escucha la 3ª.** Cada acorde suena rasgueado y luego en arpegio: fíjate en la segunda nota del arpegio, es la 3ª.
4. **Compara.** Al responder puedes oír el mismo acorde en mayor y en menor, uno tras otro.

## Actividad

Diez acordes en guitarra, con raíces al azar: decide si cada uno es mayor o menor.

## Evaluación

Retroalimentación inmediata con el nombre del acorde, sus notas en el teclado y la comparación mayor/menor; al final, el puntaje y un repaso de los errores.

## Prerrequisitos

- [Escalera del acorde](../lo-arpeggios/README.md): la 3ª mayor y la 3ª menor dentro del arpegio.

Prepara para: —.

## Uso

```js
import { mount } from "@saul-music/lo-major-minor-ear";
import metadata from "@saul-music/lo-major-minor-ear/metadata.json";
import "@saul-music/lo-kit/kit.css";
import "@saul-music/lo-major-minor-ear/style.css";

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
