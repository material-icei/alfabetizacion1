# 🎯 Bingo de las Letras — 1º Grado

Juego interactivo de bingo para trabajar el abecedario en el aula.  
Diseñado para 1º grado (6-7 años), optimizado para Chromebooks en modo horizontal.

## ¿Cómo funciona?

1. **Cada alumno/a** abre la página en su Chromebook y elige su número de tablero (del 1 al 20).
2. **La docente** gira la ruleta de letras proyectada en la pizarra.
3. Los alumnos **seleccionan la letra** en su pantalla y tocan los objetos de la cuadrícula que comiencen con esa letra.
4. Si completan una fila entera → ¡**BINGO**! 🎉

## Características

- **20 tableros únicos** generados aleatoriamente con distribución diferente de objetos.
- **Cuadrícula 3 × 9** (27 casillas): 15 objetos con emoji + palabra, 12 casillas libres.
- **Abecedario completo** (sin K, W, X): palabras apropiadas para 1º grado.
- **Panel de letras** para que la docente/alumno registre la letra activa.
- **Tabs de tableros** para que la docente supervise desde una sola pantalla.
- **Contadores** de casillas marcadas y marcadas correctas con la letra.
- **Sin dependencias externas** — funciona sin conexión a internet (excepto fuentes de Google Fonts).

## Estructura de archivos

```
bingo-letras/
├── index.html   → Estructura de la página
├── style.css    → Estilos (diseño alegre, tipografía grande)
├── data.js      → Vocabulario por letra (emojis + palabras)
├── game.js      → Lógica del juego
└── README.md    → Este archivo
```

## Cómo subir a GitHub Pages

1. Crear un repositorio en GitHub (ej. `bingo-letras`).
2. Subir los cuatro archivos a la rama `main`.
3. Ir a **Settings → Pages → Source**: seleccionar `main` / `/ (root)`.
4. La URL del juego será: `https://tu-usuario.github.io/bingo-letras/`

## Uso en el aula

- Compartir la URL con los alumnos por Google Classroom u otro medio.
- Asignar un número de tablero a cada alumno/a (del 1 al 16 mínimo).
- La docente puede ver todos los tableros usando las pestañas en la parte superior.

## Personalización

Para agregar o modificar palabras, editá el archivo `data.js`.  
Cada letra tiene un array de objetos `{ e: '🍎', w: 'Manzana' }`.

---

Creado para uso educativo 🍎
