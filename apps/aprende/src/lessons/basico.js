// Ruta «Básico» de Aprende (C32, C44). Lecciones de 6 diapositivas que terminan en un juego (un OA de packages/).
// Contenido original de Acordia, con derechos reservados (C22). Clave americana siempre (C, D, E…): la forma latina solo
// como apoyo hablado. Los números de nota son MIDI (C4 = 60) y solo sirven para el botón «Oír».
//
// Diapositiva: { title, text: [párrafos], figure?, listen?: [{ label, notes: [midi], gap? }] }
// Figuras: { type: "keyboard", from, to, marks: [{ midi, kind, label }], letters? } | { type: "notes" } |
//          { type: "table", head: [..], rows: [[..]] }

const C_MAJOR = [60, 62, 64, 65, 67, 69, 71];

export const BASICO = {
  id: "basico",
  title: "Básico",
  level: 1,
  chips: ["Con juegos"],
  blurb: "Las notas, los intervalos, el mástil, los acordes y la lectura de partituras. Diez lecciones cortas; cada una termina en un juego. Al final podrás leer los temas básicos de la Biblioteca.",
  lessons: [
    {
      id: "do-es-c",
      oa: "lo-american-notation",
      title: "Do es C",
      summary: "Las notas se escriben con letras. Aprende a pasar de C D E a Do Re Mi.",
      readMinutes: 2,
      slides: [
        {
          title: "Siete letras",
          text: [
            "En todo el mundo, las notas se escriben con siete letras: C D E F G A B.",
            "En español las decimos Do Re Mi Fa Sol La Si. Son los mismos sonidos con otro nombre.",
          ],
          figure: { type: "notes" },
          listen: [{ label: "▶ Oír de C a B", notes: C_MAJOR, gap: 0.35 }],
        },
        {
          title: "Las siete equivalencias",
          text: ["Cada letra tiene su nombre en español. Apréndelas en este orden, que es el de la escala:"],
          figure: {
            type: "table",
            head: ["Letra", "Se dice"],
            rows: [["C", "Do"], ["D", "Re"], ["E", "Mi"], ["F", "Fa"], ["G", "Sol"], ["A", "La"], ["B", "Si"]],
          },
        },
        {
          title: "Acordia escribe con letras",
          text: [
            "En Acordia las notas y los acordes siempre van en letras: así los verás en las canciones y en los cifrados.",
            "Cuando hablas, puedes decirlas en español. Si ves G, se dice Sol; si ves A, se dice La.",
          ],
        },
        {
          title: "Sostenido y bemol",
          text: [
            "# se llama sostenido y sube la nota medio tono: C# es Do sostenido.",
            "b se llama bemol y la baja medio tono: Bb es Si bemol.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 71, letters: true,
            marks: [{ midi: 60, kind: "source", label: "C" }, { midi: 61, kind: "hint", label: "C#" }],
          },
          listen: [{ label: "▶ Oír C y C#", notes: [60, 61], gap: 0.6 }],
        },
        {
          title: "El alfabeto da la vuelta",
          text: [
            "Solo hay siete letras. Después de G vuelve A, y antes de A viene G, como las horas en un reloj.",
            "Eso es lo que practicarás: de letra a nombre, de nombre a letra y qué letra viene antes o después.",
          ],
        },
        {
          title: "Los acordes usan las mismas letras",
          text: [
            "Un acorde se nombra con la letra de su nota principal: G es el acorde de Sol y C es el de Do.",
            "Una m después de la letra lo vuelve menor: Am es La menor. Verás esto en todos los cifrados.",
          ],
        },
      ],
    },
    {
      id: "misterio-de-e",
      oa: "lo-intervals",
      title: "El misterio de E#",
      summary: "Medios tonos, notas con dos nombres y por qué existe una nota llamada E#.",
      readMinutes: 3,
      slides: [
        {
          title: "El medio tono",
          text: [
            "Es la distancia más corta entre dos notas: la tecla vecina en el piano, o el traste vecino en la guitarra.",
            "Dos medios tonos hacen un tono.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 71, letters: true,
            marks: [{ midi: 60, kind: "source", label: "C" }, { midi: 61, kind: "hint", label: "C#" }, { midi: 62, kind: "answer", label: "D" }],
          },
          listen: [{ label: "▶ Oír C, C# y D", notes: [60, 61, 62], gap: 0.5 }],
        },
        {
          title: "Donde no hay tecla negra",
          text: [
            "Entre E y F, y entre B y C, no hay tecla negra: ya están a medio tono una de otra.",
            "Por eso, si subes medio tono desde E, llegas a F.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 71, letters: true,
            marks: [{ midi: 64, kind: "source", label: "E" }, { midi: 65, kind: "answer", label: "F" }],
          },
        },
        {
          title: "Dos nombres, un sonido",
          text: [
            "C# y Db son la misma tecla. Se llaman notas enarmónicas: suenan igual y solo cambia cómo se escriben.",
          ],
          figure: {
            type: "keyboard", from: 60, to: 71, letters: true,
            marks: [{ midi: 61, kind: "hint", label: "C#/Db" }],
          },
        },
        {
          title: "Los intervalos",
          text: ["Un intervalo es la distancia entre dos notas. Se mide en medios tonos:"],
          figure: {
            type: "table",
            head: ["Intervalo", "Medios tonos"],
            rows: [["2ª menor", "1"], ["2ª mayor", "2"], ["3ª menor", "3"], ["3ª mayor", "4"], ["4ª justa", "5"], ["5ª justa", "7"], ["6ª mayor", "9"], ["8ª", "12"]],
          },
        },
        {
          title: "El patrón de la escala mayor",
          text: [
            "La escala mayor sube en este orden: tono, tono, medio tono, tono, tono, tono, medio tono.",
            "En C mayor los dos medios tonos caen justo donde no hay tecla negra: entre E y F, y entre B y C.",
          ],
          listen: [{ label: "▶ Oír la escala de C mayor", notes: C_MAJOR.concat([72]), gap: 0.35 }],
        },
        {
          title: "¿Por qué existen E# y compañía?",
          text: [
            "En una escala cada letra aparece una sola vez. F# mayor es F# G# A# B C# D# E#: la séptima nota tiene que ser una E, y suena en F.",
            "Por eso se escribe E# y no F. Lo mismo pasa con B#, Fb y Cb, que casi nunca ves.",
          ],
        },
      ],
    },
    {
      id: "nombra-bien-la-nota",
      oa: "lo-enharmonic-spelling",
      title: "Nombra bien la nota",
      summary: "Sostenido o bemol: cómo elegir el nombre correcto de cada nota.",
      readMinutes: 3,
      slides: [
        {
          title: "Cada letra, una vez",
          text: [
            "Una escala mayor usa las siete letras, cada una una sola vez y en orden.",
            "En F mayor la cuarta nota es una B: se escribe Bb y no A#, porque la A ya está usada.",
          ],
          figure: { type: "table", head: ["Escala", "Notas"], rows: [["F mayor", "F G A Bb C D E"]] },
        },
        {
          title: "El nombre sigue a la tonalidad",
          text: [
            "Las tonalidades con sostenidos (G, D, A) escriben sostenidos; las de bemoles (F, Bb, Eb) escriben bemoles.",
            "Si dudas, el bemol suele ser lo más cómodo: Bb, Eb y Ab son muy comunes.",
          ],
        },
        {
          title: "Las notas raras",
          text: [
            "E# suena como F, B# como C, Fb como E y Cb como B. Solo aparecen cuando la tonalidad las pide.",
          ],
          figure: {
            type: "table",
            head: ["Nota rara", "Aparece en"],
            rows: [["E#", "F# mayor"], ["B#", "C# mayor"], ["Cb", "Gb mayor"], ["Fb", "Cb mayor"]],
          },
        },
        {
          title: "Elige el nombre simple",
          text: [
            "Fuera de esas tonalidades, entre E y F y entre B y C no hay tecla negra: la nota que sigue es F o C, no E# ni B#.",
          ],
        },
        {
          title: "Los acordes también",
          text: [
            "Un acorde mayor usa letras alternadas: Bb mayor es Bb D F, no A# D F.",
            "Si un acorde suena bien pero se ve raro, probablemente esté mal escrito.",
          ],
        },
        {
          title: "Tres preguntas antes de nombrar",
          text: [
            "1. ¿En qué tonalidad estoy? Ella decide si toca sostenido o bemol.",
            "2. ¿Qué letra toca? Cada letra se usa una sola vez y en orden.",
            "3. ¿Qué signo necesita esa letra (# o b) para sonar donde suena? Ese es el nombre correcto.",
          ],
        },
      ],
    },
    {
      id: "eco-en-el-mastil",
      oa: "lo-fretboard-notes",
      title: "Eco en el mástil",
      summary: "La misma nota en otra cuerda: encuéntrala en la guitarra.",
      readMinutes: 3,
      slides: [
        {
          title: "Las cuerdas al aire",
          text: [
            "La guitarra tiene seis cuerdas. De la más grave (6ª) a la más aguda (1ª) suenan: E A D G B E.",
            "Es el punto de partida para encontrar cualquier nota en el mástil.",
          ],
          figure: {
            type: "table",
            head: ["Cuerda", "Nota al aire"],
            rows: [["6ª", "E"], ["5ª", "A"], ["4ª", "D"], ["3ª", "G"], ["2ª", "B"], ["1ª", "E"]],
          },
          listen: [{ label: "▶ Oír las cuerdas al aire", notes: [40, 45, 50, 55, 59, 64], gap: 0.5 }],
        },
        {
          title: "Medio tono por traste",
          text: [
            "En la guitarra, cada traste sube medio tono. Entre dos letras vecinas hay una nota con sostenido (C, C#, D…), salvo entre E y F y entre B y C.",
          ],
        },
        {
          title: "El traste 12",
          text: [
            "En el traste 12 vuelve la nota de la cuerda al aire, una octava más aguda: mismo nombre, sonido más agudo.",
          ],
        },
        {
          title: "La regla del traste 5",
          text: [
            "El traste 5 de una cuerda suena igual que la cuerda vecina más aguda al aire: la 6ª cuerda en el traste 5 es la 5ª al aire.",
            "La excepción es la 3ª cuerda: se iguala con la 2ª al aire en el traste 4.",
          ],
          figure: {
            type: "table",
            head: ["Cuerda", "Traste", "Suena como"],
            rows: [["6ª", "5", "5ª al aire"], ["5ª", "5", "4ª al aire"], ["4ª", "5", "3ª al aire"], ["3ª", "4", "2ª al aire"], ["2ª", "5", "1ª al aire"]],
          },
        },
        {
          title: "Una nota, muchos lugares",
          text: [
            "La misma nota aparece en varias cuerdas: a veces con el mismo sonido exacto (unísono) y a veces una o más octavas arriba o abajo.",
          ],
        },
        {
          title: "Cómo practicar",
          text: [
            "Elige una nota, por ejemplo A. Encuéntrala en la 5ª cuerda al aire y de nuevo en la 6ª cuerda, traste 5.",
            "Tócalas una tras otra: suenan igual. Eso es el eco que da nombre al juego.",
          ],
        },
      ],
    },
    {
      id: "escalera-del-acorde",
      oa: "lo-arpeggios",
      title: "Escalera del acorde",
      summary: "Los cuatro peldaños de un arpegio: 1ª, 3ª, 5ª y 8ª.",
      readMinutes: 3,
      slides: [
        {
          title: "Un acorde se puede subir como una escalera",
          text: [
            "Si tocas las notas de un acorde una por una, de la más grave a la más aguda, haces un arpegio.",
            "Los peldaños son cuatro: la 1ª, la 3ª, la 5ª y la 8ª.",
          ],
          listen: [{ label: "▶ Oír el arpegio de D mayor", notes: [62, 66, 69, 74], gap: 0.45 }],
        },
        {
          title: "La 1ª",
          text: ["Es la raíz: la nota que le da nombre al acorde. En D mayor, la 1ª es D."],
        },
        {
          title: "La 3ª decide el color",
          text: [
            "A 4 medios tonos de la raíz es mayor (D – F#). A 3 medios tonos es menor (D – F).",
          ],
          listen: [
            { label: "▶ D mayor", notes: [62, 66, 69], gap: 0.45 },
            { label: "▶ D menor", notes: [62, 65, 69], gap: 0.45 },
          ],
        },
        {
          title: "La 5ª",
          text: ["Está a 7 medios tonos de la raíz (5ª justa) y es igual en mayor y en menor. En D, es A."],
        },
        {
          title: "La 8ª",
          text: ["La octava es la raíz otra vez, 12 medios tonos más arriba: mismo nombre, sonido más agudo."],
        },
        {
          title: "Pruébalo con A menor",
          text: [
            "La 1ª es A, la 3ª menor es C, la 5ª es E y la 8ª es A otra vez: A – C – E – A.",
            "Con la misma receta puedes armar el arpegio de cualquier acorde mayor o menor.",
          ],
          listen: [{ label: "▶ Oír el arpegio de A menor", notes: [57, 60, 64, 69], gap: 0.45 }],
        },
      ],
    },
    {
      id: "luz-y-sombra",
      oa: "lo-major-minor-ear",
      title: "Luz y sombra",
      summary: "Distingue de oído un acorde mayor de uno menor.",
      readMinutes: 2,
      slides: [
        {
          title: "Una sola nota cambia",
          text: [
            "Un acorde mayor y uno menor comparten la 1ª y la 5ª. Solo cambia la 3ª: 4 medios tonos en el mayor y 3 en el menor.",
          ],
        },
        {
          title: "Mayor y menor, lado a lado",
          text: ["Mira las notas de C mayor y de C menor. Solo cambia la del medio:"],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["C mayor", "C E G"], ["C menor", "C Eb G"]],
          },
        },
        {
          title: "Luz y sombra",
          text: [
            "Muchas personas oyen el mayor más abierto y luminoso, y el menor más oscuro y melancólico. Usa la imagen que a ti te sirva.",
          ],
          listen: [
            { label: "▶ C mayor", notes: [60, 64, 67], gap: 0.45 },
            { label: "▶ C menor", notes: [60, 63, 67], gap: 0.45 },
          ],
        },
        {
          title: "Cómo se escribe",
          text: [
            "La letra sola es el acorde mayor: C, D, G. Con una m es menor: Cm, Dm, Gm.",
            "Así los verás en las canciones, y así los reconocerás de oído.",
          ],
        },
        {
          title: "Compara antes de decidir",
          text: [
            "Si dudas, imagina el otro acorde: ¿la nota del medio subiría o bajaría? Si el acorde te suena más oscuro que el mayor que conoces, es menor.",
          ],
          listen: [
            { label: "▶ D mayor", notes: [62, 66, 69], gap: 0.45 },
            { label: "▶ D menor", notes: [62, 65, 69], gap: 0.45 },
          ],
        },
        {
          title: "Escucha la 3ª",
          text: [
            "En el juego, cada acorde suena rasgueado y luego en arpegio. Fíjate en la segunda nota del arpegio: es la 3ª, y ahí está la respuesta.",
            "Al responder puedes oír el mismo acorde en mayor y en menor, uno tras otro, para comparar.",
          ],
        },
      ],
    },
    {
      id: "manos-de-acorde",
      oa: "lo-chord-shapes",
      title: "Manos de acorde",
      summary: "Cómo se leen las formas de los acordes en la guitarra.",
      readMinutes: 3,
      slides: [
        {
          title: "Los primeros acordes",
          text: ["Estos cuatro acordes abiertos son la base de muchísimas canciones. Cada uno son solo tres notas:"],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["C", "C E G"], ["G", "G B D"], ["Am", "A C E"], ["Em", "E G B"]],
          },
        },
        {
          title: "Cómo se lee un diagrama",
          text: [
            "Las líneas verticales son las cuerdas (la 6ª a la izquierda) y las horizontales, los trastes.",
            "Los puntos son los dedos; ○ es una cuerda al aire y × una cuerda que no se toca.",
          ],
        },
        {
          title: "Una forma, tres notas",
          text: [
            "Toda forma de acorde repite, en distintas cuerdas, solo las notas del acorde: la 1ª, la 3ª y la 5ª (y la 7ª en los de séptima).",
          ],
        },
        {
          title: "Un dedo cambia el color",
          text: [
            "De E a Em solo cambia la 3ª: G# baja a G. De E a E7 se suma la 7ª: aparece D.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["E", "E G# B"], ["Em", "E G B"], ["E7", "E G# B D"]],
          },
        },
        {
          title: "La cejilla",
          text: [
            "Una barra sobre varias cuerdas es una cejilla: el índice las aprieta todas en el mismo traste. Así una misma forma sirve para varios acordes.",
          ],
        },
        {
          title: "Cambiar de acorde",
          text: [
            "Para cambiar rápido, busca los dedos que pueden quedarse quietos y mueve solo los demás.",
            "Practica despacio: primero que suene limpio, después que suene rápido.",
          ],
        },
      ],
    },
    {
      id: "acordes-de-quinta",
      oa: "lo-power-chords",
      title: "Acordes de quinta",
      summary: "Dos notas bastan: la raíz y la 5ª. Así suena y así se escribe E5.",
      readMinutes: 3,
      slides: [
        {
          title: "Dos notas bastan",
          text: ["Un acorde de quinta usa solo dos notas: la raíz y la 5ª. E5 son E y B."],
          figure: {
            type: "keyboard", from: 64, to: 71,
            marks: [{ midi: 64, kind: "source", label: "E" }, { midi: 71, kind: "answer", label: "B" }],
          },
          listen: [{ label: "▶ Oír E5", notes: [64, 71], gap: 0.5 }],
        },
        {
          title: "La fórmula",
          text: ["X5 = raíz + 5ª. La 5ª está a 7 semitonos de la raíz, igual que en los acordes mayores y menores."],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["C5", "C G"], ["A5", "A E"], ["D5", "D A"], ["G5", "G D"]],
          },
        },
        {
          title: "¿Dónde quedó la 3ª?",
          text: [
            "El mayor y el menor tienen 3ª (la nota del medio). El acorde de quinta no la tiene.",
            "Sin 3ª no es ni mayor ni menor: no suena alegre ni triste.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "Notas"],
            rows: [["E", "E G# B"], ["Em", "E G B"], ["E5", "E B"]],
          },
        },
        {
          title: "Cómo suena",
          text: ["Compara los tres. El de quinta suena abierto y firme: por eso se usa tanto en el rock."],
          listen: [
            { label: "▶ E mayor", notes: [64, 68, 71], gap: 0.45 },
            { label: "▶ E menor", notes: [64, 67, 71], gap: 0.45 },
            { label: "▶ E5", notes: [64, 71], gap: 0.45 },
          ],
        },
        {
          title: "Cómo se escribe",
          text: [
            "La letra con un 5: E5, A5, D5. Así lo verás en las canciones de Acordia, por ejemplo «E5 % A5 %».",
            "El 5 viene de la 5ª, la única nota que acompaña a la raíz.",
          ],
        },
        {
          title: "¿Tiene 3ª?",
          text: [
            "En el juego verás las notas de un acorde y tendrás que decir cuál es: mayor, menor o de quinta.",
            "Cuenta las notas: si hay tres, hay 3ª y es mayor o menor. Si hay solo dos, la raíz y la 5ª, es de quinta.",
          ],
        },
      ],
    },
    {
      id: "disminuidos-y-aumentados",
      oa: "lo-dim-aug",
      title: "Disminuidos y aumentados",
      summary: "Si la 5ª baja medio tono, el acorde es disminuido; si sube, aumentado.",
      readMinutes: 4,
      slides: [
        {
          title: "Dos acordes más",
          text: [
            "Los acordes mayores y menores tienen una 5ª justa. Si la 5ª cambia medio tono, nacen dos acordes nuevos.",
          ],
          figure: {
            type: "table",
            head: ["Acorde", "3ª", "5ª"],
            rows: [["Mayor", "mayor", "justa"], ["Menor", "menor", "justa"], ["Disminuido", "menor", "disminuida"], ["Aumentado", "mayor", "aumentada"]],
          },
        },
        {
          title: "Disminuido",
          text: ["Parte del menor y baja la 5ª medio tono: Cm es C E♭ G; Cdim es C E♭ G♭."],
          figure: {
            type: "keyboard", from: 60, to: 67,
            marks: [
              { midi: 60, kind: "source", label: "C" }, { midi: 63, kind: "hint", label: "Eb" }, { midi: 66, kind: "answer", label: "Gb" },
            ],
          },
          listen: [
            { label: "▶ C menor", notes: [60, 63, 67], gap: 0.45 },
            { label: "▶ C disminuido", notes: [60, 63, 66], gap: 0.45 },
          ],
        },
        {
          title: "Aumentado",
          text: ["Parte del mayor y sube la 5ª medio tono: C es C E G; Caug es C E G♯."],
          figure: {
            type: "keyboard", from: 60, to: 68,
            marks: [
              { midi: 60, kind: "source", label: "C" }, { midi: 64, kind: "hint", label: "E" }, { midi: 68, kind: "answer", label: "G#" },
            ],
          },
          listen: [
            { label: "▶ C mayor", notes: [60, 64, 67], gap: 0.45 },
            { label: "▶ C aumentado", notes: [60, 64, 68], gap: 0.45 },
          ],
        },
        {
          title: "Cuenta los semitonos",
          text: ["Lo que cambia es siempre la 5ª. Mide desde la raíz:"],
          figure: {
            type: "table",
            head: ["5ª", "Semitonos"],
            rows: [["Disminuida", "6"], ["Justa", "7"], ["Aumentada", "8"]],
          },
        },
        {
          title: "Cómo se escriben",
          text: [
            "Con un sufijo: Cdim y Caug (el aumentado también se escribe C+).",
            "Lo oirás tenso, con ganas de resolver: por eso suelen ser acordes de paso entre otros dos.",
          ],
        },
        {
          title: "Nombres con sorpresa",
          text: [
            "La letra de cada nota sigue el orden 1ª, 3ª, 5ª. Por eso E aug es E G♯ B♯: la 5ª lleva la letra B.",
            "B♯ suena igual que C, como viste en «El misterio de E#», pero se escribe con la letra que toca.",
          ],
        },
      ],
    },
    {
      id: "lee-los-compases",
      oa: "lo-read-bars",
      title: "Lee los compases",
      summary: "Cómo se lee la grilla de un tema: casillas, tiempos, orden, arco, silencio y × 2.",
      readMinutes: 4,
      slides: [
        {
          title: "Una casilla, un compás",
          text: [
            "En la página de un tema, los acordes están en una grilla de casillas. Cada casilla es un compás.",
            "Un acorde solo ocupa toda la casilla: en 4/4 son 4 tiempos. Cuatro casillas con acordes distintos son cuatro compases.",
          ],
        },
        {
          title: "Varios acordes en una casilla",
          text: [
            "Si una casilla tiene dos acordes, se reparten el ancho en partes iguales: cada uno dura 2 tiempos en 4/4.",
            "Con cuatro acordes, uno por tiempo. Y si un acorde se ve más ancho que otro, dura más: el ancho de cada parte es su duración.",
          ],
          figure: {
            type: "table",
            head: ["En la casilla", "Cada acorde dura"],
            rows: [["1 acorde (4/4)", "4 tiempos"], ["2 acordes (4/4)", "2 tiempos"], ["4 acordes (4/4)", "1 tiempo"], ["3 acordes (3/4)", "1 tiempo"]],
          },
        },
        {
          title: "En qué orden se lee",
          text: [
            "La grilla se lee como un texto: de izquierda a derecha, y al terminar una fila se sigue con la de abajo.",
            "Con 4 casillas por fila, la primera casilla de la segunda fila es el compás 5.",
          ],
        },
        {
          title: "Arco, gris y silencio",
          text: [
            "Un arco junto a un acorde atenuado es un ligado: ese acorde sigue sonando, sin volver a tocarlo.",
            "Un acorde en gris es una casilla que repite el compás anterior. Y el ícono de silencio es un tiempo en que no suena nada.",
          ],
        },
        {
          title: "Secciones y clave de tiempo",
          text: [
            "Cada grupo de casillas lleva el nombre de su sección: Intro, Estrofa, Coro, Puente. Un × 2 junto al nombre toca la sección dos veces.",
            "El número de la esquina, como 4/4 o 3/4, dice cuántos tiempos tiene cada compás. En 3/4 se cuenta 1, 2, 3.",
          ],
        },
        {
          title: "Ya puedes leer un tema",
          text: [
            "Recorre la grilla casilla a casilla: ¿cuántos acordes hay?, ¿hay arco, gris o silencio?, ¿cuántas veces se repite la sección?",
            "Con las notas, los acordes mayores, menores y de quinta y esta lectura, ya puedes seguir la versión simplificada de los temas de la Biblioteca.",
          ],
        },
      ],
    },
  ],
};
