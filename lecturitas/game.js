/* ============================================================
   LECTURITAS — game.js
   ============================================================ */

const STORAGE_KEY = 'lecturitas_progress';

let currentItem = null;
let foundCount = 0;
let totalCount = 0;
let audioCtx = null;

/* ---------- Progreso guardado (localStorage) ---------- */
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function markCompleted(id) {
  const progress = getProgress();
  progress[id] = true;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) {}
}

/* ---------- Sonidos simples (Web Audio, sin archivos externos) ---------- */
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
function playTone(freq, duration, delay, type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.value = 0.001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const start = ctx.currentTime + (delay || 0);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}
function playCorrectSound() {
  playTone(523.25, 0.14, 0, 'triangle');   // do
  playTone(659.25, 0.16, 0.1, 'triangle'); // mi
  playTone(783.99, 0.2, 0.2, 'triangle');  // sol
}
function playWinSound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, 0.22, i * 0.12, 'triangle'));
}
function playErrorSound() {
  playTone(180, 0.22, 0, 'sawtooth');
}

/* ---------- Menú de textos ---------- */
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const progress = getProgress();
  grid.innerHTML = '';

  wordSearchTexts.forEach(item => {
    const card = document.createElement('div');
    card.className = 'text-card';
    card.addEventListener('click', () => openText(item.id));

    const done = progress[item.id]
      ? '<div class="text-card-done">✅</div>'
      : '';

    card.innerHTML = `
      ${done}
      <div class="text-card-emoji">${item.emoji}</div>
      <div class="text-card-title">${item.title}</div>
      <div class="text-card-word">Buscá: <b>${item.targetWord}</b></div>
    `;
    grid.appendChild(card);
  });
}

/* ---------- Tokenizado del texto y armado del párrafo clickeable ---------- */
function buildStoryHTML(item) {
  const wordRegex = /\p{L}+/gu;
  const target = item.targetWord.toLocaleLowerCase('es');
  let html = '';
  let lastIndex = 0;
  let match;
  let targetTotal = 0;

  while ((match = wordRegex.exec(item.text)) !== null) {
    const word = match[0];
    const isTarget = word.toLocaleLowerCase('es') === target;
    if (isTarget) targetTotal++;

    // texto sin tocar entre la última palabra y esta (espacios, puntuación)
    html += escapeHtml(item.text.slice(lastIndex, match.index));

    const cls = isTarget ? 'word target' : 'word';
    html += `<span class="${cls}" data-target="${isTarget}">${escapeHtml(word)}</span>`;

    lastIndex = wordRegex.lastIndex;
  }
  html += escapeHtml(item.text.slice(lastIndex));

  return { html, targetTotal };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ---------- Abrir un texto ---------- */
function openText(id) {
  const item = wordSearchTexts.find(t => t.id === id);
  if (!item) return;
  currentItem = item;
  startGame();

  document.getElementById('screenMenu').hidden = true;
  document.getElementById('screenGame').hidden = false;
  document.getElementById('headerSubtitle').textContent =
    '¡Tocá cada vez que encuentres la palabra en el texto!';
}

function startGame() {
  const item = currentItem;
  if (!item) return; // nada seleccionado todavía, no hacer nada
  const { html, targetTotal } = buildStoryHTML(item);

  foundCount = 0;
  totalCount = targetTotal;

  document.getElementById('storyEmoji').textContent = item.emoji;
  document.getElementById('storyTitle').textContent = item.title;
  document.getElementById('storyText').innerHTML = html;
  document.getElementById('targetWordLabel').textContent = item.targetWord;
  document.getElementById('foundCount').textContent = '0';
  document.getElementById('totalCount').textContent = String(totalCount);

  attachWordHandlers();
}

function attachWordHandlers() {
  const spans = document.querySelectorAll('#storyText .word');
  spans.forEach(span => {
    span.addEventListener('click', onWordClick);
  });
}

/* ---------- Manejo de clics en palabras ---------- */
function onWordClick(e) {
  const span = e.currentTarget;
  const isTarget = span.dataset.target === 'true';

  if (isTarget) {
    if (span.classList.contains('found')) return; // ya contada
    span.classList.add('found');
    spawnFloatingEmoji(span, pickStar(), 'star-pop');
    playCorrectSound();

    foundCount++;
    document.getElementById('foundCount').textContent = String(foundCount);

    if (foundCount >= totalCount) {
      setTimeout(showWin, 500);
    }
  } else {
    span.classList.remove('shake');
    void span.offsetWidth; // reinicia animación
    span.classList.add('shake');
    spawnFloatingEmoji(span, '🤔', 'oops-pop');
    playErrorSound();
  }
}

function pickStar() {
  const options = ['⭐', '🌟', '✨'];
  return options[Math.floor(Math.random() * options.length)];
}

function spawnFloatingEmoji(anchorEl, emoji, className) {
  const rect = anchorEl.getBoundingClientRect();
  const parent = document.getElementById('storyText');
  const parentRect = parent.getBoundingClientRect();

  const el = document.createElement('span');
  el.className = className;
  el.textContent = emoji;
  el.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
  el.style.top = (rect.top - parentRect.top) + 'px';
  parent.style.position = 'relative';
  parent.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ---------- Pantalla de victoria ---------- */
function showWin() {
  if (currentItem) markCompleted(currentItem.id);
  playWinSound();
  document.getElementById('winOverlay').hidden = false;
}

function hideWin() {
  document.getElementById('winOverlay').hidden = true;
}

/* ---------- Navegación ---------- */
function backToMenu() {
  document.getElementById('screenGame').hidden = true;
  document.getElementById('screenMenu').hidden = false;
  document.getElementById('headerSubtitle').textContent =
    '¡Elegí un texto y encontrá la palabra escondida!';
  renderMenu();
}

/* ---------- Listeners generales ---------- */
document.getElementById('btnBackToMenu').addEventListener('click', backToMenu);
document.getElementById('btnGoMenu').addEventListener('click', () => {
  hideWin();
  backToMenu();
});
document.getElementById('btnRetry').addEventListener('click', () => {
  hideWin();
  startGame();
});

/* ---------- Inicio ---------- */
document.getElementById('winOverlay').hidden = true;
document.getElementById('screenGame').hidden = true;
document.getElementById('screenMenu').hidden = false;
renderMenu();
