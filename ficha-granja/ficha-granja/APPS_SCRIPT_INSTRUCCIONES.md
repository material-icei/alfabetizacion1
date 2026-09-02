# Cómo conectar la ficha con Google Sheets

Cuando quieras que las respuestas se guarden en una planilla, seguí estos pasos.

## 1. Crear la planilla
1. Andá a Google Sheets y creá una planilla nueva (podés llamarla "Respuestas — Ficha de la Granja").
2. En la primera fila, escribí estos encabezados, uno por columna:
   `Fecha | Nombre alumno | Grado | Animal | Nombre escrito | Oración 1 | Oración 2`

## 2. Crear el script
1. En la planilla, andá a **Extensiones → Apps Script**.
2. Borrá lo que haya en el editor y pegá este código:

```javascript
function doPost(e) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const datos = e.parameter;

  hoja.appendRow([
    datos.fecha || new Date().toISOString(),
    datos.nombreAlumno || "",
    datos.grado || "",
    datos.animal || "",
    datos.nombreEscrito || "",
    datos.oracion1 || "",
    datos.oracion2 || "",
  ]);

  return ContentService.createTextOutput("OK");
}
```

3. Guardá el proyecto (ícono de disquete). Ponele un nombre, por ejemplo "Ficha Granja".

## 3. Publicar como aplicación web
1. Hacé clic en **Implementar → Nueva implementación**.
2. En "Seleccionar tipo", elegí **Aplicación web**.
3. Configurá:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. Hacé clic en **Implementar**.
5. Google te va a pedir autorización la primera vez: aceptá los permisos con tu cuenta.
6. Copiá la **URL de la aplicación web** que te muestra al final (empieza con `https://script.google.com/macros/s/.../exec`).

## 4. Pegar la URL en la ficha
1. Abrí el archivo `config.js` de la carpeta de la actividad.
2. Reemplazá la línea:
   ```javascript
   SCRIPT_URL: "",
   ```
   por:
   ```javascript
   SCRIPT_URL: "PEGÁ_ACÁ_TU_URL_COPIADA",
   ```
3. Guardá el archivo y subí la carpeta actualizada a GitHub Pages (o reemplazá solo `config.js`).

## Notas
- Mientras `SCRIPT_URL` esté vacía, la actividad funciona igual: cada respuesta queda guardada en el navegador (localStorage) como backup, pero no llega a la planilla.
- Si en algún momento cambiás de planilla, repetí los pasos 2 y 3 y actualizá la URL en `config.js`.
- No hace falta tocar nada del resto del código.
