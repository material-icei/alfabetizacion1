Adaptaciones para 1º grado:

Todo el texto está en MAYÚSCULAS (palabras, etiquetas, instrucciones, placeholder)
Las palabras son más simples y cortas: GATO, LUNA, CASA, SAPO, SOL, FLOR, etc.
Las opciones son más claras y el distractor incorrecto es más obvio

Cambio de actividad:

Ya no pide escribir una oración completa
En cambio, pide escribir una nueva palabra que rime (por ejemplo: GATO → PATO → ¿otra? → RATO)
Aparece un ejemplo de rimas posibles como pista debajo del campo
El resultado muestra la cadena de tres rimas: GATO — PATO — RATO
Se puede confirmar con Enter además del botón

Al abrir el modal, el hint queda invisible (oculto con visibility: hidden).
A los 10 segundos, si el campo sigue vacío, el hint aparece con una transición suave de opacidad.
Si el niño empieza a escribir antes de los 10 segundos, el timer se cancela y el hint nunca aparece.
Al guardar o reiniciar, el timer también se cancela para evitar que aparezca sobre la siguiente rima.