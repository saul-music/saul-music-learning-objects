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

## O11 · Un sonido a la vez y cuenta regresiva sin recorte (2026-11-20)

- La cuenta regresiva recortaba el «¡Ya!»: el escenario estaba vacío y la capa absoluta medía ~65 px. Ahora el escenario toma altura mínima mientras cuenta.
- El sampler expone `isSounding()` y `onSounding()`. Mientras algo suena, los botones `lo-listen` («Oír…») quedan bloqueados y aparece el cartel animado «Reproduciendo…» (`bindSound` en `lo-kit`, desde `createShell`).

## O12 · «Nombra bien la nota» (2026-11-20)

Nuevo OA `lo-enharmonic-spelling`, paso 3 del recorrido (requiere «El misterio de E#»; «Eco en el mástil» pasa a requerirlo).
Enseña ortografía enarmónica práctica: cada letra una vez, sostenido o bemol según la tonalidad (con el criterio «si dudas, bemol»,
sin regla dura) y por qué casi nunca se ven E#, B#, Fb y Cb. Cuatro tipos de pregunta; tonalidades mayores hasta 3 alteraciones más F# y Gb
(y C#/Cb solo como respuesta de las notas raras). Sin menores por ahora. Decisiones mías, revisables: la dirección de la estrategia
(sostenido al subir en tonalidades de sostenidos, bemol al bajar en las de bemoles) y la portada.

## O13 · Cuatro errores de interfaz (2026-11-20)

- **Do es C (alfabeto):** el anillo de letras mostraba la vecina de la nota de partida, o sea la respuesta. Antes de responder solo se ve la letra de partida; el resto son casillas «?».
- **Luz y sombra y demás descripciones:** el `figcaption` era `flex` y partía el texto en cada nota; ahora es texto corrido. Las tarjetas que suenan de la demo (Luz y sombra y Manos de acorde) pasan a `lo-listen`: esperan a que termine el sonido (O11).
- **Pulso:** `el()` aplanaba un solo nivel de hijos y mostraba `[object HTMLSpanElement]`; ahora aplana todos.
- **Nombra bien la nota:** las alternativas de acorde dibujan cada nota en tipografía musical (la G suelta salía en texto chico).

## O14 · Puntaje templado y evento de resultado (2026-11-23)

**Decisión del usuario (C44, cierra C37 del control).** Los números eran demasiado grandes (hasta 800 por acierto y miles por partida).

- **Escala nueva:** un acierto vale **7 puntos más hasta 3 por rapidez** (10 como máximo); un error, 0. Con 10 rondas, una partida vale **hasta 100**. Las estrellas no cambian (3 con 9 o 10 aciertos, 2 con 7 u 8, 1 con 4 a 6).
- **La racha ya no multiplica los puntos:** se sigue celebrando (el marcador dice «racha», el banner «racha de N» desde 3 y el sonido sube de nivel), pero no cambia el puntaje. `comboMultiplier` queda solo como nivel de celebración.
- **`gamePoints(puntos, rondas)`** lleva cualquier número de rondas a la escala de 0 a 100 (con otras rondas, una partida también vale como máximo 100).
- **Récords del navegador en una clave nueva** (`acordia-lo:v2:<id>`): los récords viejos, en miles, no sirven de comparación y habrían impedido todo «nuevo récord». Se pierden los récords locales anteriores; eran de prueba.
- **Evento `lo:result`:** al mostrar los resultados, el kit lanza en la pantalla del juego un `CustomEvent` que burbujea, con `detail: { points (0 a 100), stars (0 a 3), correct, rounds }`. Así quien aloje un juego (las lecciones de Aprende) guarda el avance **sin tocar ningún OA**: ninguno cambió. Lo usan todos los juegos, porque pasan por `renderResults`.
- **Pruebas:** la escala (nunca más de 10 por respuesta, sea cual sea la racha), `gamePoints` con otras rondas, el récord con la clave nueva.
- **Sin comprobar:** el aspecto del marcador con «racha» en un celular real.

## O15 · Aprende: la app de lecciones (2026-11-23)

**Decisión del usuario (C44; control C20 a C25, C32).** Una app con rutas de lecciones cortas que terminan en un juego, en `apps/aprende/`.

- **Qué es:** inicio con las rutas (Básico, y «Pronto» Intermedio y Avanzado), mapa de lecciones de la ruta con estrellas y puntos, y la lección: **de 3 a 6 diapositivas** (texto, figuras de teclado o tablas y botones «Oír» con la guitarra) y, al final, **el juego** del OA correspondiente, montado tal cual. El juego lanza `lo:result` (O14) y la app guarda el avance.
- **Path básico:** ocho lecciones, una por juego, en el orden del recorrido: Do es C, El misterio de E#, Nombra bien la nota, Eco en el mástil, Escalera del acorde, Luz y sombra, Manos de acorde y Pulso. El orden se **recomienda** (insignia «Sigue aquí» en la primera sin jugar) pero **no se bloquea**.
- **Solo con cuenta (C23, C24):** la app lee la sesión de Firebase (mismo origen que `/entrar.html`, así que la comparte); sin sesión o sin el aviso vigente aceptado, manda a `/entrar.html?volver=/aprende/…`, que regresa al terminar. El progreso va a `GET` y `PUT /api/me/progress` del sitio (S103): nada de Firestore en el navegador.
- **Datos:** `{ ruta: { lección: { points 0 a 100, stars 0 a 3, plays } } }`. Los identificadores de lección tienen como máximo 24 caracteres (lo exige el servidor); una prueba lo comprueba (de ahí `misterio-de-e` y no `el-misterio-de-e-sostenido`).
- **Servicio:** archivos estáticos con `base: /aprende/` y rutas por `#/`, así que **no necesita reglas de reescritura**. `scripts/deploy-hosting.mjs` los publica en Firebase Hosting: toma la configuración de la versión vigente (el rewrite `** -> musicsite` y `noindex` los fija infra, `hosting.sh`), crea una versión nueva con esa configuración y solo los archivos de `/aprende/`, sube lo que falta, finaliza y lanza. **Se niega** si la versión vigente no tiene rewrites o trae archivos ajenos a `/aprende/` (se perderían). Pipeline: tests, build, Pages y por último «publicar Aprende», solo en main, con Workload Identity Federation (cuenta `aprende-deployer`, infra I18) y la llave pública del navegador desde la variable `FIREBASE_SITE_API_KEY`.
- **Licencia (C22):** `apps/aprende/` es **todos los derechos reservados** (`apps/aprende/LICENSE`); el resto del repo sigue CC BY 4.0 y `NOTICE.md` y el README lo dicen. El código es público (el repo lo es), pero las lecciones no se pueden copiar ni redistribuir.
- **Contenido:** original de Acordia, sin letras ni canciones (M9); clave americana siempre; una prueba rechaza «Do#», «Reb» y similares.
- **Pruebas:** lógica de avance, cliente de API (token solo en la cabecera, errores con su estado), forma y consistencia de las lecciones (3 a 6 diapositivas, el juego existe y su título coincide, identificadores válidos, notas MIDI en rango, figuras y tablas bien formadas) y el despliegue contra una API de Hosting falsa (10 casos). Además se probó en un navegador real, con la API y el SDK de Firebase simulados: sin sesión, inicio, ruta, lección, juego completo con un único `PUT`, avance visible al volver, flechas del teclado y celular sin desborde.
- **Sin comprobar:** con cuentas reales en producción, el audio en un celular real (y en iPhone), el aspecto en Safari, y que `versions` y `populateFiles` se comporten en la API real como en la simulada (se verá en el primer despliegue).

## O16 · Las URLs reservadas de Firebase no cuentan como archivos ajenos (2026-11-23)

**Hallazgo del primer despliegue real de Aprende (O15).** El guardián de `deploy-hosting.mjs` se negó, sin publicar nada, porque la versión vigente traía 2 archivos que no eran de `/aprende/`: `/__/firebase/init.js` y similares. Son **URLs reservadas que Firebase Hosting agrega solo a cada versión** (de ahí salen `/__/auth/handler` y `/__/firebase/init.json`, de los que depende el login del sitio). No son archivos de nadie.

- **Arreglo:** el guardián ignora todo lo que empiece con `/__/`. Una prueba lo cubre.
- **Comprobación posterior (smoke):** el pipeline verifica que `/__/firebase/init.json` responda 200 y que `/__/auth/handler` traiga Firebase, además de `/privacidad.html` (que pasa por el rewrite a Cloud Run). Si una versión perdiera las URLs reservadas, el login se rompería y el pipeline lo diría.
- **Lección:** el guardián hizo su trabajo (falló cerrado antes de tocar nada) y la suposición «versión sin archivos propios = 0 archivos» era falsa. Se descubrió porque el pipeline corre contra el Hosting real; con la API falsa no se veía.

## O17 · Primer despliegue real de Aprende y su comprobación (2026-11-23)

**Aprende quedó publicado en `https://saulapp-music.web.app/aprende/`** tras tres intentos; cada uno enseñó algo y ninguno dañó el sitio (el guardián falló cerrado antes de tocar nada):

1. Se negó por las URLs reservadas de Firebase (`/__/…`): O16 e infra I20.
2. Hosting respondió 403 por falta de `run.services.get` sobre `musicsite`: infra I21 (`roles/run.viewer`).
3. Publicó (53 archivos, 736 KB comprimidos), pero **la comprobación posterior falló** porque corrió justo al lanzar la versión y el CDN aún no la servía. Ahora **reintenta hasta 2 minutos**.

- **Verificado en producción tras publicar:** `/aprende/` 200; el JS, el CSS y las muestras de guitarra con su tipo correcto; `/aprende` redirige a `/aprende/`; cabecera `noindex`; el sitio, una página de canción, `/privacidad.html`, `/entrar.html`, `/__/firebase/init.json` y `/__/auth/handler` siguen en 200; la API sin token da 404. Con un navegador real y el **SDK de Firebase real**: sin errores de consola, sin sesión pide entrar y el enlace lleva a `/entrar.html?volver=/aprende/`.
- **Sin comprobar:** con una cuenta real (entrar, aceptar el aviso v3, jugar y guardar el avance), el audio en un celular real y en iPhone, y Safari.

## O18 · Foco en la diapositiva (2026-11-23)

Accesibilidad de Aprende: al avanzar o retroceder, el foco pasa al **título de la diapositiva** (o al del juego), para que quien usa teclado o lector de pantalla sepa dónde está; al abrir una lección no se mueve el foco. El título lleva `tabindex="-1"` (recibe foco por programa, no entra en el orden del Tab) y sin contorno, porque no es un control. Comprobado en un navegador real. **Sin comprobar:** con un lector de pantalla real (VoiceOver, TalkBack).

## O19 · Catálogo público, «continuar» y enlace a «Mi cuenta» (2026-11-24)

**Tanda 1 de «Mi Acordia» (control C45, site S104).** Aprende se integra con la cuenta del sitio:

- **`/aprende/lessons.json`:** el build lo escribe después de Vite (`scripts/lessons-json.mjs`, a partir de `src/catalog.js`) con las rutas y las lecciones **solo con id y título**: nada del contenido, que tiene derechos reservados. «Mi cuenta» lo lee para mostrar títulos reales; sin él, muestra lo guardado.
- **«Continuar»:** al abrir una lección, Aprende anota `PUT /api/me/continue` con `{ lesson: { path, lesson } }`. Es de disparar y olvidar: si falla, no se le muestra nada a la persona.
- **Marca de sesión:** con sesión deja `localStorage["acordia-session"] = "1"` (sin datos personales) y sin sesión la quita; las páginas de tema del sitio solo cargarán Firebase si existe (tanda 2).
- **«Mi cuenta»** del encabezado va ahora a `/mi-acordia.html`.
- **Pruebas:** el catálogo (solo id y título, sin contenido), el script que escribe el archivo y el cliente (`saveContinue`); y una corrida de navegador: abrir una lección anota «continuar», con sesión queda la marca y sin sesión no, y el enlace apunta a la página nueva.

## O20 · Por ahora solo la ruta «Básico» (2026-11-24)

**Decisión del usuario.** Se quitan de la portada de Aprende las tarjetas «Pronto» de Intermedio y Avanzado (C32 las anunciaba): hoy solo existe **Básico** y no se anuncia nada que no exista. `COMING` queda vacío y una prueba lo fija; para anunciar una ruta futura se agrega ahí. Los destinos por nivel del botón «Aprende teoría» siguen yendo al path básico.


## O21 · Seis diapositivas por lección y pregunta centrada en el teléfono (2026-11-24)

- **Decisión (del usuario):** todas las lecciones de Aprende tienen exactamente 6 diapositivas antes del juego (antes, de 3 a 5), y en el teléfono cada pregunta del juego se centra en la pantalla.
- **Contenido:** 13 diapositivas nuevas, originales, en clave americana y sin datos de terceros. La prueba de `lessons.test.js` exige 6 (antes aceptaba de 3 a 6). Su exactitud teórica la revisa el usuario.
- **Centrado:** `centerOnPhone` en `lo-kit` (`scrollIntoView` al centro) tras renderizar cada pregunta nueva, solo con ancho ≤ 700 px y sin animación con `prefers-reduced-motion`. Va en el kit, así que lo heredan los ocho juegos. No se mueve la pantalla al responder, solo al aparecer la pregunta.

## O22 · Path básico a diez lecciones, camino visual y el doble de tiempo (2026-11-24)

**Decisión del usuario.** Se retira «Pulso» de Aprende (sigue en el playground), se agregan tres juegos y se rehace la ruta como camino.

- **Tres juegos nuevos (un OA cada uno, con portada, README y pruebas):** «Acordes de quinta» (`lo-power-chords`: X5 = raíz + 5ª, sin 3ª), «Disminuidos y aumentados» (`lo-dim-aug`: la 5ª baja o sube medio tono desde el menor o el mayor; solo raíces sin dobles alteraciones, así que `E aug` se escribe E – G♯ – B♯) y «Lee la partitura» (`lo-read-chart`, elegido por Claude). Orden: tras «Manos de acorde», en ese orden (el de quinta antes de alterar la 5ª).
- **Por qué «Lee la partitura»:** el objetivo es poder leer cualquier tema básico de la Biblioteca. Se midió en la publicación vigente (42 temas, solo la versión de partitura simple): los acordes son **solo mayores, menores y `X5`** (2.480 compases con mayor o menor, 12 con `X5` en un tema) y las marcas son `%` (502), `-` (partes del compás), `_` (157), `.` (29), `x2` y los nombres de sección; compases 4/4 (39), 3/4 (2) y 6/8 (1). Las notas, los acordes y el 5 ya estaban cubiertos; faltaba leer la línea. «Pulso» salió, así que la lección explica de qué dura cada parte del compás. Los datos no entran al repo (es público): los ejercicios son sintéticos. 6/8 queda fuera del juego.
- **Diez lecciones**, seis diapositivas cada una (O21). El avance guardado de «Pulso» no se borra: simplemente no cuenta en la ruta.
- **Tiempo doble:** la ventana del bono de rapidez pasa de 12 a 24 s y «rápido» de 3 a 6 s. Sigue sin perder la pregunta por tiempo (duda 1 de O9 resuelta: no hay modo contrarreloj). El récord guardado no cambia de escala.
- **Camino visual:** la ruta ya no es una lista de tarjetas: nodos con la portada del juego, tarjetas a izquierda y derecha, línea punteada, estado jugado (jade) y siguiente (oro, con «¡Sigue aquí!»), como el mapa de niveles del playground. No bloquea el orden. Los tres juegos nuevos también están en el playground, antes de «Pulso».
- **Sin comprobar:** el texto nuevo de las lecciones lo revisa el usuario; celular real, iPhone y audio de los tres juegos a oído; el camino con una cuenta real en producción.

## O23 · «Lee la partitura» se archiva y entra «Lee los compases» (2026-11-24)

**Decisión del usuario.** Quien aprende no escribe partituras: escribir con la notación de Acordia es trabajo del equipo editorial. Ese juego servirá más adelante para un onboarding privado.

- **Archivado:** `lo-read-chart` queda en `packages/` con sus pruebas y una nota de archivado (`metadata.json` y README), sin carpeta nueva. Ya no se importa ni en Aprende ni en el playground.
- **Nuevo OA `lo-read-bars` («Lee los compases»):** enseña a leer la grilla que ve quien toca un tema: la casilla es un compás; el reparto de tiempos (el ancho de cada parte es su duración); el orden de lectura (por filas, de izquierda a derecha); el arco (ligado), el acorde en gris (repite el compás anterior) y el ícono de silencio; el «× 2» de una sección; y la clave de tiempo (4/4 y 3/4). Una de cada diez preguntas es de oído (suena un compás con clic y se elige la casilla que lo dibuja). Las figuras se dibujan como las del sitio y **no aparece texto de partitura** (`%`, `_`, `.`, guiones). 6/8 queda fuera.
- **Aprende:** la lección `lee-la-partitura` se reemplaza por `lee-los-compases` en la misma posición (sigue en diez lecciones de seis diapositivas). El avance guardado de la lección vieja no cuenta en la ruta.
- **Sin comprobar:** el texto de la lección, el oído del juego y celular real, a cargo del usuario.
