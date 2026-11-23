// Ruta «Básico» de Aprende (C32, C44). Lecciones de 3 a 6 diapositivas que terminan en un juego (un OA de packages/).
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
  blurb: "Las notas, los intervalos, el mástil, los acordes y el pulso. Ocho lecciones cortas; cada una termina en un juego.",
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
      ],
    },
    {
      id: "pulso",
      oa: "lo-strum-rhythm",
      title: "Pulso",
      summary: "Las figuras del rasgueo y la regla del compás.",
      readMinutes: 3,
      slides: [
        {
          title: "El pulso",
          text: [
            "Es el latido parejo de la música. Cada latido es un tiempo: un compás de 4/4 tiene 4 tiempos y uno de 3/4 tiene 3.",
          ],
        },
        {
          title: "Las figuras",
          text: ["Cada figura dura una cantidad de tiempos. El punto suma la mitad de lo que dura."],
          figure: {
            type: "table",
            head: ["Figura", "Tiempos"],
            rows: [["Redonda", "4"], ["Blanca con punto", "3"], ["Blanca", "2"], ["Negra", "1"]],
          },
        },
        {
          title: "La regla del rasgueo",
          text: [
            "Un acorde en el compás: un golpe al inicio que dura todo el compás.",
            "Dos acordes de medio compás: un golpe al empezar cada uno (blancas).",
            "Más acordes: un golpe por tiempo (negras).",
          ],
        },
        {
          title: "Escucha el clic",
          text: [
            "El metrónomo marca cada tiempo y suena más agudo en el 1. Cuenta los golpes de guitarra entre un 1 y el siguiente.",
          ],
        },
      ],
    },
  ],
};
