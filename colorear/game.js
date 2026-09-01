// ============================================================
// Colorear por Letras - motor principal
// ============================================================

const STORAGE_KEY = "colorear_letras_custom_activities";
const TOLERANCE = 55; // tolerancia de color para el relleno tipo balde

let customActivities = [];
let currentActivity = null;
let selectedColor = null;
let canvas, ctx;
let originalImageData = null; // para "reiniciar"
let uploadedImageDataUrl = null;

// ---------------- utilidades ----------------

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function loadCustomActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    customActivities = raw ? JSON.parse(raw) : [];
  } catch (e) {
    customActivities = [];
  }
}

function saveCustomActivities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customActivities));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------------- galería ----------------

function renderGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const allActivities = [...PRESET_ACTIVITIES, ...customActivities];

  allActivities.forEach(activity => {
    const card = document.createElement("div");
    card.className = "card" + (activity.custom ? " card-delete" : "");

    if (activity.custom) {
      const del = document.createElement("button");
      del.className = "remove-x";
      del.textContent = "✕";
      del.title = "Eliminar";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("¿Eliminar este dibujo?")) {
          customActivities = customActivities.filter(a => a.id !== activity.id);
          saveCustomActivities();
          renderGallery();
        }
      });
      card.appendChild(del);
    }

    const thumb = document.createElement("div");
    thumb.className = "card-thumb";
    const img = document.createElement("img");
    img.src = activity.image;
    thumb.appendChild(img);
    card.appendChild(thumb);

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = activity.name;
    card.appendChild(title);

    card.addEventListener("click", () => startActivity(activity));
    gallery.appendChild(card);
  });

  // tarjeta para subir nueva imagen
  const addCard = document.createElement("div");
  addCard.className = "card card-add";
  addCard.innerHTML = `
    <div class="card-thumb">➕</div>
    <div class="card-title">SUBIR IMAGEN</div>
  `;
  addCard.addEventListener("click", openUploadScreen);
  gallery.appendChild(addCard);
}

// ---------------- pantalla de juego ----------------

function startActivity(activity) {
  currentActivity = activity;
  document.getElementById("game-title").textContent = activity.name;

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  img.src = activity.image;

  renderPalette(activity.legend);
  showScreen("screen-game");
}

function renderPalette(legend) {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";
  selectedColor = null;

  legend.forEach((entry, index) => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    const labelClass = entry.letter.length > 3 ? "label-text long-label" : "label-text";
    btn.innerHTML = `<span class="color-swatch" style="background:${entry.color}"></span><span class="${labelClass}">${entry.letter}</span>`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedColor = entry.color;
    });
    palette.appendChild(btn);
    if (index === 0) btn.click(); // selecciona el primer color por defecto
  });
}

function getCanvasCoords(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  return {
    x: Math.floor((clientX - rect.left) * scaleX),
    y: Math.floor((clientY - rect.top) * scaleY)
  };
}

function floodFill(startX, startY, fillHex) {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const [fr, fg, fb] = hexToRgb(fillHex);

  const startIdx = (startY * width + startX) * 4;
  const tr = data[startIdx];
  const tg = data[startIdx + 1];
  const tb = data[startIdx + 2];

  // si ya es (aprox) el color elegido, no hacer nada
  if (Math.abs(tr - fr) < 8 && Math.abs(tg - fg) < 8 && Math.abs(tb - fb) < 8) return;

  const tolSq = TOLERANCE * TOLERANCE;
  const visited = new Uint8Array(width * height);
  const stack = [[startX, startY]];

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const pos = y * width + x;
    if (visited[pos]) continue;

    const idx = pos * 4;
    const dr = data[idx] - tr;
    const dg = data[idx + 1] - tg;
    const db = data[idx + 2] - tb;
    const distSq = dr * dr + dg * dg + db * db;
    if (distSq > tolSq) continue;

    visited[pos] = 1;
    data[idx] = fr;
    data[idx + 1] = fg;
    data[idx + 2] = fb;
    data[idx + 3] = 255;

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

function handleCanvasClick(evt) {
  if (!selectedColor) return;
  const { x, y } = getCanvasCoords(evt);
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  try {
    floodFill(x, y, selectedColor);
  } catch (err) {
    if (err && err.name === "SecurityError") {
      alert(
        "No se puede pintar porque la página se abrió como archivo local (file://).\n\n" +
        "Abrí la app con un servidor local (por ejemplo 'python3 -m http.server' o la extensión Live Server) " +
        "o subila a GitHub Pages: ahí va a funcionar sin problemas."
      );
    } else {
      console.error("Error al rellenar la zona:", err);
    }
  }
}

function resetCanvas() {
  if (originalImageData) {
    ctx.putImageData(originalImageData, 0, 0);
  }
}

// ---------------- subir nueva imagen ----------------

function openUploadScreen() {
  document.getElementById("upload-step-1").style.display = "flex";
  document.getElementById("upload-step-2").style.display = "none";
  document.getElementById("upload-preview").innerHTML = "";
  document.getElementById("file-input").value = "";
  document.getElementById("activity-name").value = "";
  uploadedImageDataUrl = null;
  resetLegendRows();
  showScreen("screen-upload");
}

function resetLegendRows() {
  const container = document.getElementById("legend-rows");
  container.innerHTML = "";
  const defaults = [
    { letter: "A", color: "#ff5c5c" },
    { letter: "B", color: "#4ecdc4" },
    { letter: "C", color: "#ffe066" },
    { letter: "D", color: "#7b6cf6" }
  ];
  defaults.forEach(d => addLegendRow(d.letter, d.color));
}

function addLegendRow(letter = "", color = "#ff5c5c") {
  const container = document.getElementById("legend-rows");
  const row = document.createElement("div");
  row.className = "legend-row";
  row.innerHTML = `
    <input type="text" maxlength="2" value="${letter}" placeholder="A">
    <input type="color" value="${color}">
    <button class="remove-row" title="Quitar">✕</button>
  `;
  row.querySelector(".remove-row").addEventListener("click", () => row.remove());
  container.appendChild(row);
}

function handleFileSelected(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageDataUrl = e.target.result;
    document.getElementById("upload-preview").innerHTML = `<img src="${uploadedImageDataUrl}">`;
    document.getElementById("upload-step-2").style.display = "flex";
  };
  reader.readAsDataURL(file);
}

function saveNewActivity() {
  const name = document.getElementById("activity-name").value.trim().toUpperCase();
  if (!name) { alert("Poné un nombre para el dibujo."); return; }
  if (!uploadedImageDataUrl) { alert("Elegí una imagen primero."); return; }

  const rows = document.querySelectorAll("#legend-rows .legend-row");
  const legend = [];
  rows.forEach(row => {
    const letter = row.querySelector('input[type="text"]').value.trim().toUpperCase();
    const color = row.querySelector('input[type="color"]').value;
    if (letter) legend.push({ letter, color });
  });

  if (legend.length === 0) { alert("Agregá al menos una letra con su color."); return; }

  const activity = {
    id: "custom-" + Date.now(),
    name,
    image: uploadedImageDataUrl,
    legend,
    custom: true
  };

  customActivities.push(activity);
  saveCustomActivities();
  renderGallery();
  showScreen("screen-selector");
}

// ---------------- inicialización ----------------

document.addEventListener("DOMContentLoaded", () => {
  loadCustomActivities();
  renderGallery();

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener("click", handleCanvasClick);

  document.getElementById("btn-back").addEventListener("click", () => showScreen("screen-selector"));
  document.getElementById("btn-reset").addEventListener("click", resetCanvas);

  document.getElementById("btn-upload-cancel").addEventListener("click", () => showScreen("screen-selector"));
  document.getElementById("file-input").addEventListener("change", handleFileSelected);
  document.getElementById("btn-add-row").addEventListener("click", () => addLegendRow());
  document.getElementById("btn-save-activity").addEventListener("click", saveNewActivity);
});
