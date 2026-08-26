/* ============================================================
   LECTURITAS — Banco de textos
   ------------------------------------------------------------
   Para agregar un texto nuevo, sumá un objeto más al array.
   No hace falta contar ocurrencias ni tocar game.js:
   el juego detecta y cuenta solas las repeticiones de
   "targetWord" dentro de "text" (sin importar mayúsculas).

   Campos:
     id         → identificador único (número)
     title      → título corto que se ve en el menú
     emoji      → ícono decorativo de la tarjeta
     targetWord → la palabra que el alumno debe encontrar
     text       → el texto breve a leer (tal cual, con mayúsculas
                  y puntuación normales, para que se lea natural)
   ============================================================ */

const wordSearchTexts = [
  {
    id: 1,
    title: "El barco viajero",
    emoji: "⛵",
    targetWord: "barco",
    text: "Al barco le gusta viajar hacia islas lejanas. Un pez rojo nada junto al barco y lo acompaña en la travesía. Cuando el viento sopla, el barco avanza muy rápido. Al final del día, el barco regresa tranquilo al puerto. ¡Qué bonito viaje hizo el barco!"
  },
  {
    id: 2,
    title: "El monito curioso",
    emoji: "🐒",
    targetWord: "mono",
    text: "En la selva vive un mono muy travieso. A este mono le gusta saltar de rama en rama. El mono come una banana rica y dulce. Un día, el mono encontró un espejo en el suelo. El mono se miró, hizo una mueca y le dio risa. ¡Qué gracioso es este mono juguetón!"
  },
  {
    id: 3,
    title: "El sol brillante",
    emoji: "☀️",
    targetWord: "sol",
    text: "Hoy ha salido un sol muy brillante. El sol ilumina todo el bosque. A los animales les gusta sentir el calor del sol. Una mariposa vuela feliz bajo el sol. Por la tarde, el sol se esconde despacio detrás de la montaña. Todos le dicen adiós al sol hasta mañana. ¡Gracias por tu luz, querido sol!"
  },
  {
    id: 4,
    title: "El tambor de Mateo",
    emoji: "🥁",
    targetWord: "tambor",
    text: "El mono Mateo tiene un tambor. A Mateo le encanta tocar el tambor todo el día. El tambor suena pum, pum, pum. Todos los animales bailan cuando escuchan el tambor. El tambor es rojo y brillante. Mateo guarda su tambor debajo de la cama antes de dormir. ¡Qué divertido es jugar con el tambor!"
  },
  {
    id: 5,
    title: "El pájaro cantor",
    emoji: "🐦",
    targetWord: "pájaro",
    text: "En el árbol vive un pájaro azul. Este pájaro canta todas las mañanas. Al pájaro le gusta volar muy alto cerca de las nubes. El pájaro busca ramitas suaves para su nido. Un niño mira al pájaro desde la ventana y le da migas de pan. El pájaro dice pío pío para dar las gracias."
  }
];
