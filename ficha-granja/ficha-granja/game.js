// game.js — Lógica de "Mi Ficha de Animales de la Granja"

const state = {
  nombreAlumno: "",
  grado: "",
  animalActual: null,
  completados: new Set(), // se reinicia al recargar: pensado para uso compartido del Chromebook
};

// ---------- Sonidos (Web Audio API, sin archivos externos) ----------
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tono(frecuencia, duracion = 0.15, tipo = "sine", volumen = 0.25) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = frecuencia;
    gain.gain.value = volumen;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);
    osc.stop(ctx.currentTime + duracion);
  } catch (e) { /* audio no disponible: seguimos sin sonido */ }
}

function sonidoExito() {
  tono(523.25, 0.12); // do
  setTimeout(() => tono(659.25, 0.12), 120); // mi
  setTimeout(() => tono(783.99, 0.2), 240);  // sol
}

function sonidoClick() {
  tono(440, 0.08, "triangle", 0.2);
}

// ---------- Navegación entre pantallas ----------
function mostrarPantalla(id) {
  document.querySelectorAll(".pantalla").forEach((p) => p.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
}

// ---------- Pantalla 1: datos del alumno ----------
const inputNombreAlumno = document.getElementById("input-nombre-alumno");
const inputGrado = document.getElementById("input-grado");
const errorInicio = document.getElementById("error-inicio");

document.getElementById("btn-empezar").addEventListener("click", () => {
  const nombre = inputNombreAlumno.value.trim();
  const grado = inputGrado.value.trim();

  if (!nombre || !grado) {
    errorInicio.hidden = false;
    return;
  }
  errorInicio.hidden = true;

  state.nombreAlumno = nombre;
  state.grado = grado;

  sonidoClick();
  document.getElementById("saludo-alumno").textContent =
    `¡HOLA, ${nombre.toUpperCase()}! (${grado.toUpperCase()})`;

  renderGrilla();
  mostrarPantalla("pantalla-selector");
});

// ---------- Pantalla 2: selector de animales ----------
const grilla = document.getElementById("grilla-animales");

function renderGrilla() {
  grilla.innerHTML = "";
  ANIMALS.forEach((animal) => {
    const card = document.createElement("div");
    card.className = "animal-card" + (state.completados.has(animal.id) ? " completado" : "");
    card.innerHTML = `
      <div class="check">✔</div>
      <img src="${animal.imagen}" alt="${animal.nombre}" />
      <div class="animal-nombre">${animal.nombre.toUpperCase()}</div>
    `;
    card.addEventListener("click", () => abrirFicha(animal));
    grilla.appendChild(card);
  });
}

// ---------- Pantalla 3: ficha del animal ----------
const fichaImagen = document.getElementById("ficha-imagen");
const inputNombreAnimal = document.getElementById("input-nombre-animal");
const inputOracion1 = document.getElementById("input-oracion-1");
const inputOracion2 = document.getElementById("input-oracion-2");
const errorFicha = document.getElementById("error-ficha");

// Los campos en letra cursiva empiezan con mayúscula, como se enseña la cursiva
function capitalizarPrimeraLetra(el) {
  el.addEventListener("blur", () => {
    const v = el.value;
    if (v.length > 0) {
      el.value = v.charAt(0).toUpperCase() + v.slice(1);
    }
  });
}
[inputNombreAnimal, inputOracion1, inputOracion2].forEach(capitalizarPrimeraLetra);

function abrirFicha(animal) {
  sonidoClick();
  state.animalActual = animal;
  fichaImagen.src = animal.imagen;
  fichaImagen.alt = animal.nombre;
  inputNombreAnimal.value = "";
  inputOracion1.value = "";
  inputOracion2.value = "";
  errorFicha.hidden = true;
  mostrarPantalla("pantalla-ficha");
}

document.getElementById("btn-volver").addEventListener("click", () => {
  sonidoClick();
  mostrarPantalla("pantalla-selector");
});

document.getElementById("btn-guardar").addEventListener("click", () => {
  const nombreAnimal = inputNombreAnimal.value.trim();
  const oracion1 = inputOracion1.value.trim();
  const oracion2 = inputOracion2.value.trim();

  if (!nombreAnimal || !oracion1 || !oracion2) {
    errorFicha.hidden = false;
    return;
  }
  errorFicha.hidden = true;

  const respuesta = {
    nombreAlumno: state.nombreAlumno,
    grado: state.grado,
    animal: state.animalActual.nombre,
    nombreEscrito: nombreAnimal,
    oracion1,
    oracion2,
    fecha: new Date().toISOString(),
  };

  guardarLocal(respuesta);
  enviarAGoogleSheets(respuesta);

  state.completados.add(state.animalActual.id);
  sonidoExito();
  mostrarModalExito();
});

// ---------- Backup local (por si aún no está configurada la planilla) ----------
function guardarLocal(respuesta) {
  try {
    const clave = "ficha-granja-respuestas";
    const previas = JSON.parse(localStorage.getItem(clave) || "[]");
    previas.push(respuesta);
    localStorage.setItem(clave, JSON.stringify(previas));
  } catch (e) { /* localStorage no disponible: no bloqueamos la actividad */ }
}

// ---------- Envío a Google Sheets vía Apps Script ----------
function enviarAGoogleSheets(respuesta) {
  if (!CONFIG.SCRIPT_URL) return; // aún no configurada: queda solo el backup local

  const datos = new URLSearchParams(respuesta);

  fetch(CONFIG.SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // los Web Apps de Apps Script no permiten leer la respuesta desde fetch
    body: datos,
  }).catch(() => {
    // si falla la red, la respuesta ya quedó guardada en localStorage como backup
  });
}

// ---------- Modal de éxito ----------
const modalExito = document.getElementById("modal-exito");

function mostrarModalExito() {
  modalExito.hidden = false;
}

document.getElementById("btn-modal-continuar").addEventListener("click", () => {
  sonidoClick();
  modalExito.hidden = true;
  renderGrilla();
  mostrarPantalla("pantalla-selector");
});

// ---------- Inicio ----------
mostrarPantalla("pantalla-inicio");
