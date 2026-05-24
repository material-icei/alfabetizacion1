/**
 * game.js — Tutti Frutti (1º grado)
 * Categorías: Animales · Objetos · Nombres · Colores · Frutas/Verduras
 * Puntaje por ronda: 0 (sin palabra) · 5 (repetida) · 10 (única)
 */

'use strict';

// =============================================
// CONFIGURACIÓN
// =============================================

const CATEGORIES = ['animal', 'objeto', 'nombre', 'color', 'fruta'];
const CAT_LABEL  = {
  animal: 'Animales',
  objeto: 'Objetos',
  nombre: 'Nombres',
  color:  'Colores',
  fruta:  'Frutas / Verduras',
};

// =============================================
// ESTADO
// =============================================

let playerName   = '';
let totalRounds  = 5;
let currentRound = 0;          // 0-based
let currentLetter = '';
let rounds       = [];         // [{letter, words:{animal,objeto,...}, scores:{...}}]
let roundLocked  = false;      // true cuando se terminó la ronda (inputs bloqueados)

// =============================================
// HELPERS
// =============================================

function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

// =============================================
// PANTALLA DE INICIO
// =============================================

const roundDisplay = $('roundDisplay');
let roundCount = 5;

document.querySelectorAll('.round-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const delta = parseInt(btn.dataset.val);
    roundCount = Math.min(15, Math.max(2, roundCount + delta));
    roundDisplay.textContent = roundCount;
  });
});

$('startBtn').addEventListener('click', () => {
  const name = $('playerName').value.trim();
  if (!name) {
    $('playerName').focus();
    $('playerName').style.borderColor = '#e8365d';
    setTimeout(() => $('playerName').style.borderColor = '', 1000);
    return;
  }
  playerName  = name;
  totalRounds = roundCount;
  rounds      = [];
  currentRound = 0;
  startRound();
});

// =============================================
// RONDA
// =============================================

function startRound() {
  roundLocked   = false;
  currentLetter = '';

  // Header
  $('headerName').textContent     = '👤 ' + playerName;
  $('currentRoundNum').textContent = currentRound + 1;
  $('totalRoundsNum').textContent  = totalRounds;

  // Badge
  const badge = $('letterBadge');
  badge.textContent = '?';
  badge.style.background = 'linear-gradient(135deg, #e8365d, #f5a623)';

  // Barra de letra
  $('letterInput').value = '';
  $('letterInputBar').classList.remove('hidden');
  setTimeout(() => $('letterInput').focus(), 100);

  // Botones
  $('finishRoundBtn').classList.remove('hidden');
  $('nextRoundBtn').classList.add('hidden');
  $('endGameBtn').classList.add('hidden');

  // Construir tabla
  buildTable();

  showScreen('game-screen');
}

// ── Confirmar letra ──
$('setLetterBtn').addEventListener('click', confirmLetter);
$('letterInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmLetter();
});

function confirmLetter() {
  const raw = $('letterInput').value.trim().toUpperCase();
  if (!raw) return;
  currentLetter = raw.charAt(0);

  const badge = $('letterBadge');
  badge.textContent = currentLetter;
  badge.classList.remove('pop');
  void badge.offsetWidth; // reflow
  badge.classList.add('pop');

  // Actualizar rótulos de ronda en la tabla
  document.querySelectorAll('.row-letter').forEach(el => {
    el.textContent = currentLetter;
  });

  // Enfocar primer input vacío
  const firstInput = document.querySelector('.word-input:not(:disabled)');
  if (firstInput) firstInput.focus();
}

// ── Construir tabla ──
function buildTable() {
  const tbody = $('tableBody');
  tbody.innerHTML = '';

  // Una fila por ronda completada (lectura) + fila activa
  // Pero mostramos UNA fila por ronda: la activa es la última
  // Historial: filas anteriores (solo lectura)
  rounds.forEach((r, idx) => {
    tbody.appendChild(buildHistoryRow(r, idx));
  });

  // Fila activa
  tbody.appendChild(buildActiveRow());
  updateGrandTotal();
}

function buildHistoryRow(round, idx) {
  const tr = document.createElement('tr');
  tr.className = 'row-done';
  tr.dataset.round = idx;

  CATEGORIES.forEach(cat => {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type        = 'text';
    input.className   = 'word-input';
    input.value       = round.words[cat] || '';
    input.disabled    = true;
    input.style.borderColor = scoreColor(round.scores[cat]);
    td.appendChild(input);
    tr.appendChild(td);
  });

  // Puntaje de la fila
  const tdScore = document.createElement('td');
  tdScore.className = 'row-score-cell';
  const rowTotal = CATEGORIES.reduce((s, c) => s + (round.scores[c] || 0), 0);
  tdScore.innerHTML = `<span class="row-score">${rowTotal}</span>`;
  tr.appendChild(tdScore);

  return tr;
}

function scoreColor(val) {
  if (val === 0)  return '#e8365d';
  if (val === 5)  return '#f5a623';
  if (val === 10) return '#5cb85c';
  return '#ecdcc8';
}

function buildActiveRow() {
  const tr = document.createElement('tr');
  tr.id = 'activeRow';

  CATEGORIES.forEach(cat => {
    const td = document.createElement('td');

    // Badge de letra
    const badge = document.createElement('span');
    badge.className   = 'row-letter';
    badge.textContent = currentLetter || '?';

    const input = document.createElement('input');
    input.type        = 'text';
    input.className   = 'word-input';
    input.dataset.cat = cat;
    input.maxLength   = 30;
    input.autocomplete = 'off';
    input.placeholder = CAT_LABEL[cat].split(' ')[0] + '...';

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        // Mover al siguiente input
        const inputs = [...document.querySelectorAll('#activeRow .word-input')];
        const idx    = inputs.indexOf(e.target);
        if (idx < inputs.length - 1) inputs[idx + 1].focus();
      }
    });

    // Forzar mayúsculas mientras escribe
    input.addEventListener('input', () => {
      const pos = input.selectionStart;
      input.value = input.value.toUpperCase();
      input.setSelectionRange(pos, pos);
    });

    td.appendChild(badge);
    td.appendChild(input);
    tr.appendChild(td);
  });

  // Celda de puntaje (vacía hasta que se termine la ronda)
  const tdScore = document.createElement('td');
  tdScore.id = 'activeScoreCell';
  tdScore.innerHTML = `<span class="row-score" id="activeRowScore">—</span>`;
  tr.appendChild(tdScore);

  return tr;
}

// ── Terminar ronda ──
$('finishRoundBtn').addEventListener('click', finishRound);

function finishRound() {
  if (roundLocked) return;

  // Recoger palabras
  const words = {};
  document.querySelectorAll('#activeRow .word-input').forEach(input => {
    words[input.dataset.cat] = input.value.trim().toUpperCase();
  });

  // Bloquear inputs
  document.querySelectorAll('#activeRow .word-input').forEach(input => {
    input.disabled = true;
  });

  roundLocked = true;

  // Mostrar selector de puntaje por categoría
  const activeRow = $('activeRow');
  CATEGORIES.forEach((cat, colIdx) => {
    const td = activeRow.children[colIdx];

    // Quitar el input (ya bloqueado) y añadir botones de puntaje
    const scoreDiv = document.createElement('div');
    scoreDiv.className   = 'score-cell';
    scoreDiv.id          = `score-cell-${cat}`;

    [0, 5, 10].forEach(val => {
      const btn = document.createElement('button');
      btn.className    = 'score-opt';
      btn.dataset.val  = val;
      btn.dataset.cat  = cat;
      btn.textContent  = val;

      // Si no hay palabra, pre-seleccionar 0
      if (!words[cat] && val === 0) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        // Desactivar hermanos
        scoreDiv.querySelectorAll('.score-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateActiveRowScore();
        // Colorear borde del input
        const inp = td.querySelector('.word-input');
        if (inp) inp.style.borderColor = scoreColor(val);
      });

      scoreDiv.appendChild(btn);
    });

    td.appendChild(scoreDiv);
  });

  // Ocultar botón terminar, mostrar siguiente o final
  $('finishRoundBtn').classList.add('hidden');

  if (currentRound + 1 < totalRounds) {
    $('nextRoundBtn').classList.remove('hidden');
  } else {
    $('endGameBtn').classList.remove('hidden');
  }
}

function updateActiveRowScore() {
  let total = 0;
  CATEGORIES.forEach(cat => {
    const cell = $(`score-cell-${cat}`);
    if (!cell) return;
    const active = cell.querySelector('.score-opt.active');
    if (active) total += parseInt(active.dataset.val);
  });
  $('activeRowScore').textContent = total;
  updateGrandTotal();
}

function updateGrandTotal() {
  // Sumar historial + fila activa
  let grand = rounds.reduce((s, r) =>
    s + CATEGORIES.reduce((rs, c) => rs + (r.scores[c] || 0), 0), 0);

  // Fila activa (si ya hay puntajes seleccionados)
  CATEGORIES.forEach(cat => {
    const cell = $(`score-cell-${cat}`);
    if (!cell) return;
    const active = cell.querySelector('.score-opt.active');
    if (active) grand += parseInt(active.dataset.val);
  });

  $('grandTotal').textContent = grand;
}

// ── Siguiente ronda ──
$('nextRoundBtn').addEventListener('click', () => {
  saveCurrentRound();
  currentRound++;
  startRound();
});

// ── Terminar juego ──
$('endGameBtn').addEventListener('click', () => {
  saveCurrentRound();
  showResults();
});

function saveCurrentRound() {
  const words  = {};
  const scores = {};

  document.querySelectorAll('#activeRow .word-input').forEach(input => {
    words[input.dataset.cat] = input.value.trim().toUpperCase();
  });

  CATEGORIES.forEach(cat => {
    const cell   = $(`score-cell-${cat}`);
    const active = cell ? cell.querySelector('.score-opt.active') : null;
    scores[cat]  = active ? parseInt(active.dataset.val) : 0;
  });

  rounds.push({ letter: currentLetter, words, scores });
}

// =============================================
// RESULTADO FINAL
// =============================================

function showResults() {
  const grand = rounds.reduce((s, r) =>
    s + CATEGORIES.reduce((rs, c) => rs + (r.scores[c] || 0), 0), 0);

  const maxPossible = totalRounds * CATEGORIES.length * 10;
  const pct = grand / maxPossible;

  // Emoji y título según rendimiento
  let emoji, title;
  if (pct >= 0.9)      { emoji = '🏆'; title = '¡Excelente!'; }
  else if (pct >= 0.7) { emoji = '🌟'; title = '¡Muy bien!'; }
  else if (pct >= 0.5) { emoji = '😊'; title = '¡Bien hecho!'; }
  else                 { emoji = '💪'; title = '¡Seguí practicando!'; }

  $('resultEmoji').textContent = emoji;
  $('resultTitle').textContent = title;
  $('resultName').textContent  = playerName;
  $('finalScore').textContent  = grand;
  $('finalMax').textContent    = `de ${maxPossible} puntos posibles`;

  // Historial por rondas
  const hist = $('resultHistory');
  hist.innerHTML = '';
  rounds.forEach((r, i) => {
    const rowTotal = CATEGORIES.reduce((s, c) => s + (r.scores[c] || 0), 0);
    const chip = document.createElement('div');
    chip.className = 'history-chip';
    chip.innerHTML = `<span class="chip-letter">${r.letter || '?'}</span>Ronda ${i+1}: ${rowTotal} pts`;
    hist.appendChild(chip);
  });

  showScreen('result-screen');
}

$('playAgainBtn').addEventListener('click', () => {
  rounds       = [];
  currentRound = 0;
  showScreen('setup-screen');
});

// =============================================
// INICIO
// =============================================

showScreen('setup-screen');
