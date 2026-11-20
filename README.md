# saul-music-learning-objects (prototipo temporal)

Monorepo de **objetos de aprendizaje (OA)** musicales de Acordia y su playground.
Prototipo local para validar el stack antes de crear el repo definitivo (paso B).

- `packages/theme`: tokens de color y tipografía de Acordia (copiados de `acordia_render`) y botones base.
- `packages/audio`: sampler sobre Web Audio con las muestras de guitarra de nailon (FluidR3_GM, CC BY 3.0).
- `packages/lo-fretboard-notes`: OA 1, «La misma nota en otra cuerda» (`metadata.json` = subconjunto de IEEE LOM
  más objetivo, contenido, actividad y evaluación).
- `apps/playground`: Vite; banco de OA que lista cada objeto desde sus metadatos.

```sh
npm install --userconfig=/dev/null   # solo npm público (.npmrc del repo); comprobar: grep -c artifactory package-lock.json → 0
npm test                             # Vitest
npm run dev                          # playground en local
npm run build                        # dist/ estático (base relativa, sirve en GitHub Pages)
```
