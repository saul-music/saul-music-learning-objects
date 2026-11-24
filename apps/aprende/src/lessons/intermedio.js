// Ruta «Intermedio» de Aprende. Diez lecciones de 6 diapositivas, de solo lectura por ahora: el juego de cada una llega en una segunda
// etapa (por eso `oa` falta). El objetivo es poder tocar los temas de nivel «medio» de la Biblioteca en su versión Original.
// Contenido original de Acordia, con derechos reservados (C22). Clave americana siempre. Los acordes se dibujan como diagramas
// (`figure.type = "chords"`; `f` = traste por cuerda de la 6ª a la 1ª, -1 no se toca, `d` = dedos, `b` = trastes con cejilla).
//
// Diapositiva: { title, text: [párrafos], figure?, listen?: [{ label, notes: [midi], gap? } | { label, shapes: [forma], gap? }] }
// Figuras: keyboard | table (como en basico.js) y { type: "chords", items: [{ name, shape, note? }] }.

// --- formas de guitarra (afinación estándar)
const sh = (f, d = [0, 0, 0, 0, 0, 0], b = []) => ({ f, d, b });
const SHAPES = {
  E: sh([0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
  F: sh([1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], [1]),
  Fm: sh([1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], [1]),
  "F#m": sh([2, 4, 4, 2, 2, 2], [1, 3, 4, 1, 1, 1], [2]),
  A: sh([-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]),
  Bb: sh([-1, 1, 3, 3, 3, 1], [0, 1, 2, 3, 4, 1], [1]),
  B: sh([-1, 2, 4, 4, 4, 2], [0, 1, 2, 3, 4, 1], [2]),
  Bm: sh([-1, 2, 4, 4, 3, 2], [0, 1, 3, 4, 2, 1], [2]),
  C: sh([-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
  G: sh([3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]),
  D: sh([-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]),
  Am: sh([-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]),
  // séptimas
  A7: sh([-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]),
  Am7: sh([-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]),
  E7: sh([0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),
  Em7: sh([0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]),
  G7: sh([3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]),
  C7: sh([-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]),
  // maj7 y 6
  Cmaj7: sh([-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]),
  Amaj7: sh([-1, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0]),
  Dmaj7: sh([-1, -1, 0, 2, 2, 2], [0, 0, 0, 1, 2, 3]),
  Gmaj7: sh([3, 2, 0, 0, 0, 2], [3, 2, 0, 0, 0, 1]),
  C6: sh([-1, 3, 2, 2, 1, 0], [0, 4, 2, 3, 1, 0]),
  Am6: sh([-1, 0, 2, 2, 1, 2], [0, 0, 2, 3, 1, 4]),
  // bajo
  "G/B": sh([-1, 2, 0, 0, 3, 3], [0, 1, 0, 0, 3, 4]),
  "D/F#": sh([2, -1, 0, 2, 3, 2], [1, 0, 0, 2, 4, 3]),
  "C/E": sh([0, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
  "Am/G": sh([3, 0, 2, 2, 1, 0], [4, 0, 2, 3, 1, 0]),
  // de paso
  Bdim7: sh([-1, 2, 3, 1, 3, -1], [0, 2, 3, 1, 4, 0]),
  Bm7b5: sh([-1, 2, 3, 2, 3, -1], [0, 1, 3, 2, 4, 0]),
  Caug: sh([-1, 3, 2, 1, 1, 0], [0, 4, 3, 1, 2, 0]),
  Ammaj7: sh([-1, 0, 2, 1, 1, 0], [0, 0, 3, 1, 1, 0], [1]),
  // sus y add9
  Dsus2: sh([-1, -1, 0, 2, 3, 0], [0, 0, 0, 1, 2, 0]),
  Dsus4: sh([-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3]),
  Asus2: sh([-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0]),
  Asus4: sh([-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 4, 0]),
  Cadd9: sh([-1, 3, 2, 0, 3, 0], [0, 2, 1, 0, 3, 0]),
  // novenas y tensiones
  E9: sh([0, 2, 0, 1, 0, 2]),
  D9: sh([-1, 5, 4, 5, 5, -1]),
  Em9: sh([0, 2, 0, 0, 0, 2]),
  Cmaj9: sh([-1, 3, 2, 4, 3, 0]),
  "C6/9": sh([-1, 3, 2, 2, 3, 3]),
  "E7b9": sh([0, 2, 0, 1, 0, 1]),
  "E7#9": sh([0, 2, 0, 1, 3, 3]),
  A13: sh([-1, 0, 2, 0, 2, 2]),
};
const chords = (...names) => ({ type: "chords", items: names.map((n) => (Array.isArray(n) ? { name: n[0], shape: SHAPES[n[1] ?? n[0]], note: n[2] } : { name: n, shape: SHAPES[n] })) });
const shapes = (...names) => names.map((n) => SHAPES[n]);

export const INTERMEDIO = {
  id: "intermedio",
  title: "Intermedio",
  level: 2,
  chips: ["Para leer", "Juegos próximamente"],
  blurb: "Cejilla, séptimas, acordes con bajo, tensiones y tonalidad. Diez lecciones para leer: al terminar podrás tocar los temas de nivel medio de la Biblioteca en su versión Original.",
  lessons: [
    {
      id: "cejilla-en-movimiento",
      title: "Cejilla en movimiento",
      summary: "Dos formas que viajan por el mástil y te dan F, Bm, F#m, Bb y muchos más.",
      readMinutes: 5,
      badge: "F",
      slides: [
        {
          title: "Acordes que viajan",
          text: [
            "En los temas de este nivel aparecen F, Bm, F#m, Bb… acordes que no se pueden tocar con cuerdas al aire. Son acordes de cejilla.",
            "Una cejilla es una forma que se mueve por el mástil. Con solo dos formas, la de E y la de A, tienes casi todos.",
          ],
        },
        {
          title: "La forma de E, con cejilla",
          text: [
            "Toma E y súbela un traste. Ya no quedan cuerdas al aire, así que el índice las reemplaza: aprieta las seis cuerdas en el traste 1.",
            "El resultado es F. El dedo índice hace de cejuela y los otros tres dibujan la forma de E.",
          ],
          figure: chords(["E", "E", "Cuerdas al aire"], ["F", "F", "Cejilla en el traste 1"]),
          listen: [{ label: "▶ Oír E y F", shapes: shapes("E", "F") }],
        },
        {
          title: "La forma de A",
          text: [
            "Lo mismo con A: la forma se sube y el índice hace de cejilla sobre cinco cuerdas (la 6 no se toca).",
            "En el traste 1 es Bb; en el traste 2, B.",
          ],
          figure: chords(["A", "A", "Cuerdas al aire"], ["Bb", "Bb", "Cejilla en el traste 1"], ["B", "B", "Cejilla en el traste 2"]),
          listen: [{ label: "▶ Oír A, Bb y B", shapes: shapes("A", "Bb", "B") }],
        },
        {
          title: "Mayor y menor: un dedo",
          text: [
            "Igual que con los abiertos, el menor baja la 3ª medio tono. De F a Fm, la cuerda 3 pasa del traste 2 al 1: queda bajo la cejilla.",
            "De B a Bm, la cuerda 2 baja del traste 4 al 3. La forma entera se mueve y el cambio sigue siendo de un solo dedo.",
          ],
          figure: chords(["F", "F"], ["Fm", "Fm", "La cuerda 3 baja al traste 1"], ["F#m", "F#m", "Forma de Em en el traste 2"], ["Bm", "Bm", "Forma de Am en el traste 2"]),
        },
        {
          title: "El nombre lo da la cuerda grave",
          text: [
            "La forma de E tiene su raíz en la cuerda 6 y la de A en la cuerda 5. Así que el nombre del acorde es la nota de esa cuerda en el traste de la cejilla.",
            "Son las mismas notas que viste en «Eco en el mástil».",
          ],
          figure: {
            type: "table",
            head: ["Traste de la cejilla", "Forma de E (cuerda 6)", "Forma de A (cuerda 5)"],
            rows: [["1", "F", "Bb"], ["2", "F#", "B"], ["3", "G", "C"], ["4", "G#", "C#"], ["5", "A", "D"]],
          },
        },
        {
          title: "Para que suene limpio",
          text: [
            "Pon la cejilla pegada al traste, no en el medio del espacio. Gira un poco el índice hacia su lado, donde el hueso es más firme, y presiona con el peso del brazo, no con el pulgar.",
            "Si una cuerda zumba, no es falta de fuerza: revisa dónde cae esa cuerda bajo el dedo. Empieza con F y Bm, despacio, y cambia de acorde sin apuro. La fuerza llega con los días.",
          ],
        },
      ],
    },
    {
      id: "septimas",
      title: "Séptimas",
      summary: "El 7 y el m7: un acorde de siempre con una nota más.",
      readMinutes: 5,
      badge: "7",
      slides: [
        {
          title: "Una nota más",
          text: [
            "Muchos temas de este nivel usan acordes de séptima: A7, Em7, B7… Son el acorde de siempre con una nota extra, la 7ª.",
            "El 7 suena inquieto, con ganas de ir a otro acorde. El m7 suena más suave y redondo.",
          ],
        },
        {
          title: "El 7: mayor con 7ª menor",
          text: [
            "C7 es C mayor más una 7ª menor: la nota que está 10 semitonos sobre la raíz. En C, esa nota es Bb.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 71, letters: true,
            marks: [{ midi: 60, kind: "source", label: "C" }, { midi: 64, kind: "hint", label: "E" }, { midi: 67, kind: "hint", label: "G" }, { midi: 70, kind: "answer", label: "Bb" }],
          },
          listen: [{ label: "▶ Oír C7 nota a nota", notes: [60, 64, 67, 70], gap: 0.45 }],
        },
        {
          title: "El m7: menor con 7ª menor",
          text: [
            "Am7 es Am más la misma 7ª menor. Am = A C E; Am7 = A C E G.",
            "Cada séptima se arma igual: la triada que ya conoces y una nota encima.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["A", "A C# E"], ["A7", "A C# E G"], ["Am", "A C E"], ["Am7", "A C E G"]],
          },
        },
        {
          title: "Cómo se tocan",
          text: [
            "Los cuatro salen de formas que ya conoces, con un dedo menos. Mira qué cuerda cambia en cada uno.",
          ],
          figure: chords(["A7", "A7", "A sin el dedo de la cuerda 3"], ["Am7", "Am7", "Am sin el dedo de la cuerda 3"], ["E7", "E7", "E sin el dedo de la cuerda 4"], ["Em7", "Em7", "Em con un solo dedo"]),
          listen: [{ label: "▶ Oír A7 y Am7", shapes: shapes("A7", "Am7") }],
        },
        {
          title: "El 7 pide resolver",
          text: [
            "G7 tiene dos notas, B y F, a una distancia de tres tonos: la más inestable. Al pasar a C, B sube a C y F baja a E, y todo descansa.",
            "Por eso un acorde con 7 suele apuntar a otro: G7 va a C, E7 va a A.",
          ],
          figure: chords("G7", "C"),
          listen: [{ label: "▶ Oír G7 y C", shapes: shapes("G7", "C") }],
        },
        {
          title: "Cómo se leen",
          text: [
            "En la partitura de Acordia, un 7 sin más siempre lleva la 7ª menor. La 7ª mayor se escribe aparte con «maj7», y la verás en la próxima lección.",
          ],
          figure: {
            type: "table",
            head: ["Se escribe", "Qué es", "Notas en C"],
            rows: [["C7", "Mayor + 7ª menor", "C E G Bb"], ["Cm7", "Menor + 7ª menor", "C Eb G Bb"]],
          },
        },
      ],
    },
    {
      id: "septima-mayor-y-seis",
      title: "maj7 y acordes de 6",
      summary: "La 7ª mayor, el color soñador de maj7 y los acordes de 6.",
      readMinutes: 5,
      badge: "maj7",
      slides: [
        {
          title: "Dos colores luminosos",
          text: [
            "El maj7 suena abierto y suave, casi soñador. Los acordes de 6 son sencillos y brillantes.",
            "Los dos aparecen una y otra vez en los temas de este nivel, a veces en lugar de un mayor o un menor.",
          ],
        },
        {
          title: "7 o maj7: medio tono",
          text: [
            "Cmaj7 es C mayor más una 7ª mayor: la nota B, 11 semitonos sobre la raíz. C7 lleva Bb. Entre un acorde y otro solo cambia una nota, y por medio tono.",
            "Escucha las tres versiones seguidas: C, Cmaj7 y C7.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 71, letters: true,
            marks: [{ midi: 60, kind: "source", label: "C" }, { midi: 64, kind: "hint", label: "E" }, { midi: 67, kind: "hint", label: "G" }, { midi: 70, kind: "hint", label: "Bb" }, { midi: 71, kind: "answer", label: "B" }],
          },
          listen: [{ label: "▶ Oír C, Cmaj7 y C7", shapes: shapes("C", "Cmaj7", "C7"), gap: 1.5 }],
        },
        {
          title: "Formas de maj7",
          text: [
            "Los maj7 abiertos usan una cuerda al aire que da la 7ª. Fíjate en que Cmaj7 y Gmaj7 se parecen a C y a G con un dedo de menos.",
          ],
          figure: chords("Cmaj7", "Amaj7", "Dmaj7", "Gmaj7"),
        },
        {
          title: "Los acordes de 6",
          text: [
            "Un acorde de 6 es el mayor más la 6ª, 9 semitonos sobre la raíz. C6 = C E G A. Si es menor, Am6 = A C E F#: el menor más una 6ª mayor.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["C", "C E G"], ["C6", "C E G A"], ["Am", "A C E"], ["Am6", "A C E F#"]],
          },
        },
        {
          title: "Dos nombres, las mismas notas",
          text: [
            "C6 tiene las mismas notas que Am7: A C E G. Lo que cambia es cuál suena más grave, y el oído toma esa nota como raíz.",
            "No importa cómo lo llames para tocarlo: lo importante es reconocer su sonido y su forma.",
          ],
          figure: chords(["C6", "C6", "Raíz en la cuerda 5"], ["Am6", "Am6", "Menor con 6ª mayor"]),
          listen: [{ label: "▶ Oír C6 y Am6", shapes: shapes("C6", "Am6") }],
        },
        {
          title: "Cómo se leen",
          text: [
            "Un resumen de las familias que has visto, con C como ejemplo:",
          ],
          figure: {
            type: "table",
            head: ["Se escribe", "Fórmula", "Notas en C"],
            rows: [["maj7", "Mayor + 7ª mayor", "C E G B"], ["7", "Mayor + 7ª menor", "C E G Bb"], ["m7", "Menor + 7ª menor", "C Eb G Bb"], ["6", "Mayor + 6ª", "C E G A"], ["m6", "Menor + 6ª", "C Eb G A"]],
          },
        },
      ],
    },
    {
      id: "acordes-con-bajo",
      title: "Acordes con bajo",
      summary: "Qué significa la barra de G/B y D/F#, y cómo se tocan.",
      readMinutes: 5,
      badge: "G/B",
      slides: [
        {
          title: "La barra",
          text: [
            "Cuando lees G/B, se dice «G sobre B»: el acorde es G, pero la nota más grave es B en lugar de G.",
            "La barra no divide nada. Solo indica qué nota va en el bajo.",
          ],
        },
        {
          title: "El bajo no es la raíz",
          text: [
            "G son las notas G B D. En G/B las notas son las mismas, y lo único que cambia es cuál suena más grave.",
            "En G/B el bajo es la 3ª del acorde. También hay G/D, con la 5ª abajo.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas", "Nota más grave"],
            rows: [["G", "G B D", "G"], ["G/B", "G B D", "B"], ["G/D", "G B D", "D"]],
          },
        },
        {
          title: "Cómo se tocan",
          text: [
            "Los acordes con bajo más comunes ponen la 3ª en la cuerda grave. Para los tres basta mover el bajo de la forma.",
          ],
          figure: chords(["G/B", "G/B", "Bajo en la cuerda 5"], ["D/F#", "D/F#", "Bajo en la cuerda 6"], ["C/E", "C/E", "C con la cuerda 6 al aire"]),
        },
        {
          title: "Para qué sirven",
          text: [
            "El bajo que cambia de a poco conecta los acordes. En C, G/B, Am y Am/G, el bajo baja de grado en grado: C, B, A, G.",
            "Es como si el acorde de arriba se quedara casi quieto y el bajo caminara por debajo.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Bajo"],
            rows: [["C", "C"], ["G/B", "B"], ["Am", "A"], ["Am/G", "G"]],
          },
          listen: [{ label: "▶ Oír el bajo que baja", shapes: shapes("C", "G/B", "Am", "Am/G"), gap: 1.1 }],
        },
        {
          title: "Si no llegas al bajo",
          text: [
            "Puedes tocar el acorde sin la nota del bajo, o con su raíz, por ejemplo G en lugar de G/B. La armonía es la misma, aunque pierdes la línea del bajo.",
            "Si hay un bajista, él lleva esa nota. Lo importante es que las notas de arriba sean las del acorde.",
          ],
        },
        {
          title: "Cómo se escribe",
          text: [
            "El bajo es siempre una sola nota, con # o b si hace falta. También lo llevan los acordes con extensión, como Dadd9/F#.",
            "El bajo puede ser cualquier nota del acorde, incluso la 7ª: Dm/C lleva C en el bajo, y D F A C es Dm7.",
          ],
          figure: {
            type: "table",
            head: ["Se escribe", "Se lee"],
            rows: [["G/B", "G sobre B"], ["D/F#", "D sobre F#"], ["Dm/F", "Dm sobre F"], ["Dm/C", "Dm sobre C"]],
          },
        },
      ],
    },
    {
      id: "acordes-de-paso",
      title: "Acordes de paso",
      summary: "dim7, m7b5, aug y mmaj7: tensión que lleva al acorde siguiente.",
      readMinutes: 5,
      badge: "dim7",
      slides: [
        {
          title: "Acordes que no se quedan",
          text: [
            "Hay acordes que suenan tensos y piden moverse: dim7, m7b5, aug y mmaj7. Suelen aparecer entre dos acordes más tranquilos y los unen.",
            "No tienes que cantarles: casi siempre te llevan al acorde que sigue.",
          ],
        },
        {
          title: "dim7",
          text: [
            "Es un disminuido con 7ª: 1ª, 3ª menor, 5ª bemol y 7ª doble bemol. Bdim7 es B D F Ab, y entre cada nota hay 3 semitonos.",
            "Como todas las distancias son iguales, la misma forma se repite cada tres trastes: Bdim7, Ddim7, Fdim7 y Abdim7 tienen las mismas notas.",
          ],
          figure: chords(["Bdim7", "Bdim7", "La misma forma sube de 3 en 3 trastes"]),
          listen: [{ label: "▶ Oír Bdim7", shapes: shapes("Bdim7") }],
        },
        {
          title: "m7b5",
          text: [
            "Es un m7 con la 5ª bajada medio tono. Bm7 es B D F# A; Bm7b5 es B D F A.",
            "A veces se le llama semidisminuido: a medio camino entre un menor con 7ª y un dim7.",
          ],
          figure: chords(["Bm7b5", "Bm7b5", "Cambia solo la 5ª"]),
          listen: [{ label: "▶ Oír Bm7b5", shapes: shapes("Bm7b5") }],
        },
        {
          title: "aug",
          text: [
            "El aumentado ya lo viste en el básico: la 5ª sube medio tono. C aug es C E G#; también se escribe C+.",
            "Las distancias son todas de 4 semitonos, así que la forma se repite cada cuatro trastes: C aug, E aug y G# aug suenan igual.",
          ],
          figure: chords(["Caug", "Caug", "Aumentado: 5ª sube medio tono"]),
          listen: [{ label: "▶ Oír C aug", shapes: shapes("Caug") }],
        },
        {
          title: "mmaj7",
          text: [
            "Es un menor con 7ª mayor: Am(maj7) es A C E G#. Es un menor con un toque misterioso, casi de película.",
            "En Acordia se escribe «mmaj7» (a veces «mMaj7»).",
          ],
          figure: chords(["Ammaj7", "Ammaj7", "Menor con 7ª mayor"]),
          listen: [{ label: "▶ Oír Am con maj7", shapes: shapes("Ammaj7") }],
        },
        {
          title: "Cómo reconocerlos",
          text: [
            "Los cuatro, uno junto al otro:",
          ],
          figure: {
            type: "table",
            head: ["Se escribe", "Fórmula", "Sensación"],
            rows: [["dim7", "1  3m  5b  7bb", "Tenso y simétrico"], ["m7b5", "1  3m  5b  7m", "Oscuro, a medio camino"], ["aug", "1  3  5#", "Inquieto, abierto"], ["mmaj7", "1  3m  5  7M", "Misterioso"]],
          },
        },
      ],
    },
    {
      id: "sus-y-novena-agregada",
      title: "sus y add9",
      summary: "Cambiar la 3ª con sus2 y sus4, o sumar una 9ª con add9.",
      readMinutes: 5,
      badge: "sus",
      slides: [
        {
          title: "Sin 3ª, o con una más",
          text: [
            "La 3ª es la nota que hace que un acorde sea mayor o menor. Los acordes sus la reemplazan por otra nota; los add9 la dejan y suman una.",
            "Son acordes simples de tocar, con un color abierto muy usado.",
          ],
        },
        {
          title: "sus2 y sus4",
          text: [
            "«sus» viene de suspendido: la 3ª se cambia por la 2ª (sus2) o por la 4ª (sus4). Sin 3ª, el acorde no es ni mayor ni menor.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["D", "D F# A"], ["Dsus2", "D E A"], ["Dsus4", "D G A"]],
          },
        },
        {
          title: "Cómo se tocan",
          text: [
            "Los sus abiertos salen de mover un dedo de los acordes que ya conoces.",
          ],
          figure: chords("Dsus2", "Dsus4", "Asus2", "Asus4"),
        },
        {
          title: "Querer resolver",
          text: [
            "El sus4 suele volver al mayor: en Dsus4 → D, la 4ª (G) baja medio tono a la 3ª (F#). Ese «pequeño alivio» es muy usado.",
            "Escucha Dsus4, D, Dsus2 y D seguidos.",
          ],
          figure: chords("Dsus4", "D"),
          listen: [{ label: "▶ Oír Dsus4, D, Dsus2, D", shapes: shapes("Dsus4", "D", "Dsus2", "D"), gap: 1.2 }],
        },
        {
          title: "add9",
          text: [
            "El add9 conserva la 3ª y suma la 9ª, que es la 2ª una octava arriba. No lleva 7ª. Cadd9 = C E G D.",
            "Suena más lleno que C. Se diferencia del sus2, que quita la 3ª: Csus2 = C D G.",
          ],
          figure: chords(["C", "C"], ["Cadd9", "Cadd9", "C con la 9ª (D)"]),
          listen: [{ label: "▶ Oír C y Cadd9", shapes: shapes("C", "Cadd9") }],
        },
        {
          title: "Cómo se escriben",
          text: [
            "Con el sufijo pegado al acorde. Cuando hay 7ª, el sus4 se escribe 7sus4: G7sus4 es G C D F.",
          ],
          figure: {
            type: "table",
            head: ["Se escribe", "Qué es"],
            rows: [["Dsus2", "Sin 3ª, con la 2ª"], ["Dsus4", "Sin 3ª, con la 4ª"], ["Dadd9", "Mayor con la 9ª"], ["Dmadd9", "Menor con la 9ª"], ["G7sus4", "sus4 con 7ª menor"]],
          },
        },
      ],
    },
    {
      id: "novenas-y-seis-nueve",
      title: "Novenas y 6/9",
      summary: "9, m9, maj9 y 6/9: la 9ª sumada a las séptimas.",
      readMinutes: 5,
      badge: "9",
      slides: [
        {
          title: "Más allá de la 7ª",
          text: [
            "La 9ª es la nota 2 una octava arriba. Si a una séptima le sumas la 9ª, tienes una novena: más rica, más color.",
            "En los temas de este nivel se usan todas: 9, m9, maj9 y 6/9.",
          ],
        },
        {
          title: "Cuatro familias",
          text: [
            "La regla es simple: 9 = 7 + 9ª, m9 = m7 + 9ª, maj9 = maj7 + 9ª. El 6/9 es un acorde de 6 con 9ª y sin 7ª.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas en C"],
            rows: [["C9", "C E G Bb D"], ["Cm9", "C Eb G Bb D"], ["Cmaj9", "C E G B D"], ["C6/9", "C E G A D"]],
          },
        },
        {
          title: "9 y m9",
          text: [
            "E9 es E7 con la 9ª (F#) en la cuerda 1, y Em9 es Em7 con esa misma nota. D9 es una forma que sube por el mástil.",
          ],
          figure: chords(["E9", "E9", "E7 con la 9ª"], ["Em9", "Em9", "Em7 con la 9ª"], ["D9", "D9", "Cuatro cuerdas centrales"]),
          listen: [{ label: "▶ Oír E7, E9 y Em9", shapes: shapes("E7", "E9", "Em9"), gap: 1.3 }],
        },
        {
          title: "maj9 y 6/9",
          text: [
            "Cmaj9 es el maj7 más la 9ª. C6/9 deja la 7ª afuera: es C con la 6ª y la 9ª.",
            "Los dos suenan muy abiertos: son de esos acordes que se dejan sonar.",
          ],
          figure: chords("Cmaj9", "C6/9"),
          listen: [{ label: "▶ Oír Cmaj9 y C6/9", shapes: shapes("Cmaj9", "C6/9") }],
        },
        {
          title: "Tres formas de escribir 6/9",
          text: [
            "En Acordia puedes ver D6/9, D(6/9) o D69. Son el mismo acorde.",
            "No lo confundas con un acorde con bajo: la barra de 6/9 no indica ninguna nota grave, es parte del nombre.",
          ],
        },
        {
          title: "Cuando no te salga",
          text: [
            "Un acorde de novena sin la 9ª es el acorde con 7ª: E9 sin la 9ª es E7. Suena parecido, aunque menos lleno.",
            "No confundas la 9ª con el add9: C9 lleva 7ª menor y Cadd9 no. Las dos comparten la nota D.",
          ],
        },
      ],
    },
    {
      id: "tensiones",
      title: "Tensiones",
      summary: "9, 11 y 13, y las alteradas b9, #9, #11 y b13.",
      readMinutes: 5,
      badge: "#9",
      slides: [
        {
          title: "Notas por encima de la 7ª",
          text: [
            "Sobre la 7ª hay tres notas más que se llaman tensiones: la 9ª, la 11ª y la 13ª. Son la 2ª, la 4ª y la 6ª una octava arriba.",
          ],
          figure: {
            type: "table",
            head: ["Tensión", "Es la", "Ejemplo en C"],
            rows: [["9", "2ª", "D"], ["11", "4ª", "F"], ["13", "6ª", "A"]],
          },
        },
        {
          title: "Subirlas o bajarlas",
          text: [
            "Algunas tensiones se pueden alterar medio tono: la 9ª puede bajar (b9) o subir (#9), la 11ª puede subir (#11) y la 13ª puede bajar (b13).",
            "Se usan sobre acordes con 7ª para dar más tensión antes de resolver.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas en C"],
            rows: [["C7(b9)", "C E G Bb Db"], ["C7(#9)", "C E G Bb D#"], ["C7(b13)", "C E G Bb Ab"]],
          },
        },
        {
          title: "7(b9) y 7(#9)",
          text: [
            "E7(b9) es E7 con la cuerda 1 en el traste 1 (F). E7(#9) lleva las cuerdas 1 y 2 en el traste 3 (G y D).",
            "Escucha E7 y luego sus dos versiones alteradas.",
          ],
          figure: chords(["E7", "E7"], ["E7b9", "E7b9", "La 9ª baja"], ["E7#9", "E7#9", "La 9ª sube"]),
          listen: [{ label: "▶ Oír E7, E7(b9) y E7(#9)", shapes: shapes("E7", "E7b9", "E7#9"), gap: 1.4 }],
        },
        {
          title: "11 y #11",
          text: [
            "La 11ª es la 4ª, y choca con la 3ª mayor. Por eso se usa con acordes menores (madd11, m11) o se sube medio tono (#11).",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["Cmadd11", "C Eb G F"], ["Cm11", "C Eb G Bb D F"], ["Cmaj7#11", "C E G B F#"], ["Dmadd#11", "D F A G#"]],
          },
        },
        {
          title: "13 y 7(b13)",
          text: [
            "El 13 es el 7 con la 6ª una octava arriba. A13 son A C# E G más F#; la 9ª suele omitirse. En A7(b13) la 13ª baja medio tono: A C# E G F.",
          ],
          figure: chords(["A13", "A13", "La 13ª (F#) en la cuerda 1"]),
          listen: [{ label: "▶ Oír A13", shapes: shapes("A13") }],
        },
        {
          title: "Los paréntesis",
          text: [
            "En Acordia, las tensiones van entre paréntesis: G7(b9), G7(#9), D(6/9). Si son varias, se separan con comas o barras: G7(b9,#11,13).",
            "Cuando un acorde no se parece a nada que conozcas, ábrelo en el reproductor para ver su diagrama y escúchalo.",
          ],
        },
      ],
    },
    {
      id: "la-tonalidad",
      title: "La tonalidad",
      summary: "El campo armónico: qué acordes son «de la casa» y cómo anticiparlos.",
      readMinutes: 6,
      badge: "I IV V",
      slides: [
        {
          title: "Un tema vive en una tonalidad",
          text: [
            "Casi todos los acordes de un tema pertenecen a una misma escala, su tonalidad. Eso explica por qué unos acordes suenan bien juntos.",
            "En la mayoría de los temas de este nivel casi todo es de la tonalidad. Unos pocos acordes salen de ella.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 72, letters: true,
            marks: [60, 62, 64, 65, 67, 69, 71].map((m, i) => ({ midi: m, kind: i === 0 ? "source" : "hint", label: "CDEFGAB"[i] })),
          },
          listen: [{ label: "▶ Oír la escala de C", notes: [60, 62, 64, 65, 67, 69, 71, 72], gap: 0.35 }],
        },
        {
          title: "La escala marca los acordes",
          text: [
            "Si armas un acorde sobre cada nota de la escala, usando solo notas de la escala, salen siete acordes. En C mayor:",
          ],
          figure: {
            type: "table",
            head: ["Grado", "Acorde", "Tipo"],
            rows: [["1", "C", "Mayor"], ["2", "Dm", "Menor"], ["3", "Em", "Menor"], ["4", "F", "Mayor"], ["5", "G", "Mayor"], ["6", "Am", "Menor"], ["7", "Bdim", "Disminuido"]],
          },
        },
        {
          title: "Con séptimas",
          text: [
            "Si a cada uno le sumas la 7ª de la escala, salen los acordes de las lecciones anteriores: maj7, m7, el 7 y el m7b5.",
          ],
          figure: {
            type: "table",
            head: ["Grado", "Acorde en C", "Tipo"],
            rows: [["1", "Cmaj7", "maj7"], ["2", "Dm7", "m7"], ["3", "Em7", "m7"], ["4", "Fmaj7", "maj7"], ["5", "G7", "7"], ["6", "Am7", "m7"], ["7", "Bm7b5", "m7b5"]],
          },
        },
        {
          title: "Misma regla, otra tonalidad",
          text: [
            "El orden de los tipos no cambia: 1, 4 y 5 son mayores y el 6 es menor. Solo se cambian las notas. Estas son las tonalidades más usadas con guitarra:",
          ],
          figure: {
            type: "table",
            head: ["Tonalidad", "Grado 1", "Grado 4", "Grado 5", "Grado 6"],
            rows: [["C", "C", "F", "G", "Am"], ["G", "G", "C", "D", "Em"], ["D", "D", "G", "A", "Bm"], ["A", "A", "D", "E", "F#m"], ["E", "E", "A", "B", "C#m"]],
          },
        },
        {
          title: "El relativo menor",
          text: [
            "Cada tonalidad mayor tiene un relativo menor con los mismos acordes. Am tiene los acordes de C mayor: Am, Bdim, C, Dm, Em, F y G. La diferencia es cuál suena como «casa».",
            "El relativo es el acorde del grado 6 de cada tonalidad mayor.",
          ],
          figure: {
            type: "table",
            head: ["Mayor", "Relativo menor"],
            rows: [["C", "Am"], ["G", "Em"], ["D", "Bm"], ["A", "F#m"], ["E", "C#m"]],
          },
        },
        {
          title: "Úsalo para estudiar",
          text: [
            "Antes de tocar un tema: 1) deduce la tonalidad (el primer y el último acorde suelen ser «la casa»); 2) escribe los acordes de esa tonalidad; 3) marca los que no están en la lista.",
            "Los acordes que no están son los prestados de otra tonalidad. No hace falta explicarlos: apréndelos como acordes nuevos y el tema se vuelve mucho más corto.",
          ],
        },
      ],
    },
    {
      id: "estudia-un-tema-original",
      title: "Estudia un tema Original",
      summary: "De la versión Simplificada a la Original: cómo organizar tu práctica.",
      readMinutes: 6,
      badge: "▶",
      slides: [
        {
          title: "Original y Simplificada",
          text: [
            "Casi todos los temas tienen dos versiones. La Simplificada usa solo mayores, menores y de quinta; la Original trae todos los acordes del tema.",
            "Empieza por la Simplificada para aprender la estructura y, cuando fluya, pasa a la Original.",
          ],
        },
        {
          title: "Tu lista de acordes nuevos",
          text: [
            "Recorre la versión Original y marca los acordes que aún no conoces. Ábrelos uno por uno para ver su diagrama, y agrúpalos por familia: séptimas, maj7, sus, bajos, tensiones.",
            "Casi siempre son pocos acordes distintos que se repiten, así que aprenderlos primero hace el resto más fácil.",
          ],
        },
        {
          title: "Qué más trae la partitura",
          text: [
            "Un ligado se ve con un arco: el acorde sigue sonando. Un silencio tiene su ícono. Una casilla en gris repite la anterior.",
            "En la versión Original, una parte puede llevar dos acordes pequeños juntos: el segundo entra a mitad del tiempo. Si el compás cambia (por ejemplo, de 4/4 a 3/4), el cambio aparece dibujado en la casilla.",
          ],
        },
        {
          title: "Practica con el reproductor",
          text: [
            "Baja el tempo con el metrónomo y sube de a poco. Toca un compás para partir desde ahí, y repite una sección con el botón de loop hasta que salga.",
            "El modo estudio muestra los compases en grande, ideal para tocar con la guitarra en las manos.",
          ],
        },
        {
          title: "Los cambios difíciles",
          text: [
            "Aísla el cambio que te falla: dos acordes, despacio, hasta que salga limpio diez veces seguidas. Busca los dedos que pueden quedarse quietos, como en «Manos de acorde».",
            "Entre secciones puede haber tips: tarjetas con un consejo del tema, como un adorno o una forma de tocar un acorde.",
          ],
        },
        {
          title: "Cuando ya fluye",
          text: [
            "Ya conoces todos los tipos de acorde que aparecen en los temas de este nivel, y sabes leer la partitura y ordenar tu práctica.",
            "Elige un tema de la Biblioteca, abre la versión Original y tócalo con el reproductor. Cuando salga, sube el tempo.",
          ],
        },
      ],
    },
  ],
};
