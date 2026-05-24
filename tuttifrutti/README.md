# 🍉 Tutti Frutti — 1º Grado

Juego interactivo del Tutti Frutti para trabajar vocabulario en el aula.  
Diseñado para 1º grado (6-7 años), optimizado para Chromebooks.

## ¿Cómo funciona?

1. El alumno ingresa su nombre y la docente elige cuántas rondas habrá.
2. La docente gira la **ruleta de letras** proyectada en la pizarra.
3. Cada alumno escribe la letra sorteada en su pantalla y completa las 5 categorías.
4. Al terminar la ronda, hace clic en **"Terminar ronda"** y luego puntúa cada casilla:
   - **0** → no escribió una palabra
   - **5** → la palabra está repetida con otro compañero
   - **10** → nadie más puso esa palabra
5. El puntaje de la ronda se calcula automáticamente.
6. Al terminar todas las rondas, aparece el **puntaje total** con mensaje de felicitación.

## Categorías

| Columna | Categoría |
|---------|-----------|
| 🐾 | Animales |
| 📦 | Objetos |
| 👦 | Nombres |
| 🎨 | Colores |
| 🍓 | Frutas / Verduras |
| ⭐ | Puntaje de la ronda |

## Estructura de archivos

```
tutti-frutti/
├── index.html   → Estructura de la página
├── style.css    → Estilos (diseño colorido y alegre)
├── game.js      → Lógica del juego
└── README.md    → Este archivo
```

## Cómo subir a GitHub Pages

1. Crear un repositorio en GitHub (ej. `tutti-frutti`).
2. Subir los tres archivos a la rama `main`.
3. Ir a **Settings → Pages → Source**: seleccionar `main` / `/ (root)`.
4. La URL del juego será: `https://tu-usuario.github.io/tutti-frutti/`

## Uso en el aula

- Compartir la URL con los alumnos por Google Classroom.
- Cada alumno juega de forma individual en su Chromebook.
- La docente proyecta la ruleta de letras en la pizarra.
- Al terminar cada ronda, la docente anota en el pizarrón las palabras de cada alumno para determinar los puntajes (0/5/10).

---

Creado para uso educativo 🍉
