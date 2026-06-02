/**
 * game.js — Tutti Frutti adaptado para 1º grado
 * Categorías: ¿Qué es? · ¿Cómo es? · ¿Qué hace?
 * Puntaje: ❌ (0) · ⭐ (5) · 🏆 (10)
 */

'use strict';

// =============================================
// CONFIGURACIÓN
// =============================================

const CATEGORIES = ['que-es', 'como-es', 'que-hace'];
const CAT_LABEL  = {
  'que-es':   '¿QUÉ ES?',
  'como-es':  '¿CÓMO ES?',
  'que-hace': '¿QUÉ HACE?',
};

// Opciones de puntaje: valor numérico + emoji mostrado
const SCORE_OPTS = [
  { val: 0,  emoji: '❌', label: 'Nada' },
  { val: 5,  emoji: '⭐', label: 'Repetida' },
  { val: 10, emoji: '🏆', label: 'Única' },
];

// =============================================
// ESTADO
// =============================================

let playerName    = '';
let totalRounds   = 5;
let currentRound  = 0;
let currentLetter = '';
let rounds        = [];
let roundLocked   = false;

// =============================================
// HELPERS
// =============================================

function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function scoreEmoji(val) {
  const opt = SCORE_OPTS.find(o => o.val === val);
  return opt ? opt.emoji : '—';
}

function scoreBorderColor(val) {
  if (val === 0)  return '#e8365d';
  if (val === 5)  return '#f5a623';
  if (val === 10) return '#5cb85c';
  return '#ecdcc8';
}

// =============================================
// PANTALLA DE INICIO
// =============================================

let roundCount = 5;

document.querySelectorAll('.round-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const delta = parseInt(btn.dataset.val);
    roundCount = Math.min(15, Math.max(2, roundCount + delta));
    $('roundDisplay').textContent = roundCount;
  });
});

$('startBtn').addEventListener('click', () => {
  const name = $('playerName').value.trim().toUpperCase();
  if (!name) {
    $('playerName').focus();
    $('playerName').style.borderColor = '#e8365d';
    setTimeout(() => $('playerName').style.borderColor = '', 1000);
    return;
  }
  playerName   = name;
  totalRounds  = roundCount;
  rounds       = [];
  currentRound = 0;
  startRound();
});

// Forzar mayúsculas en el nombre
$('playerName').addEventListener('input', function() {
  const pos = this.selectionStart;
  this.value = this.value.toUpperCase();
  this.setSelectionRange(pos, pos);
});

// =============================================
// RONDA
// =============================================

function startRound() {
  roundLocked   = false;
  currentLetter = '';

  $('headerName').textContent      = '👤 ' + playerName;
  $('currentRoundNum').textContent  = currentRound + 1;
  $('totalRoundsNum').textContent   = totalRounds;

  const badge = $('letterBadge');
  badge.textContent = '?';
  badge.style.background = 'linear-gradient(135deg, #e8365d, #f5a623)';

  $('letterInput').value = '';
  $('letterInputBar').classList.remove('hidden');
  setTimeout(() => $('letterInput').focus(), 100);

  $('finishRoundBtn').classList.remove('hidden');
  $('nextRoundBtn').classList.add('hidden');
  $('endGameBtn').classList.add('hidden');

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
  void badge.offsetWidth;
  badge.classList.add('pop');

  document.querySelectorAll('.row-letter').forEach(el => {
    el.textContent = currentLetter;
  });

  const firstInput = document.querySelector('.word-input:not(:disabled)');
  if (firstInput) firstInput.focus();
}

// ── Construir tabla ──
function buildTable() {
  const tbody = $('tableBody');
  tbody.innerHTML = '';
  rounds.forEach((r, idx) => tbody.appendChild(buildHistoryRow(r, idx)));
  tbody.appendChild(buildActiveRow());
  updateGrandTotal();
}

function buildHistoryRow(round, idx) {
  const tr = document.createElement('tr');
  tr.className  = 'row-done';
  tr.dataset.round = idx;

  CATEGORIES.forEach(cat => {
    const td    = document.createElement('td');
    const input = document.createElement('input');
    input.type      = 'text';
    input.className = 'word-input';
    input.value     = round.words[cat] || '';
    input.disabled  = true;
    input.style.borderColor = scoreBorderColor(round.scores[cat]);
    td.appendChild(input);

    // Mostrar emoji de puntaje debajo del input en historial
    const scoreSpan = document.createElement('div');
    scoreSpan.className   = 'cell-score-emoji';
    scoreSpan.textContent = scoreEmoji(round.scores[cat]);
    td.appendChild(scoreSpan);

    tr.appendChild(td);
  });

  const tdScore = document.createElement('td');
  tdScore.className = 'row-score-cell';
  const rowTotal = CATEGORIES.reduce((s, c) => s + (round.scores[c] || 0), 0);
  tdScore.innerHTML = `<span class="row-score">${rowTotal}</span>`;
  tr.appendChild(tdScore);

  return tr;
}

function buildActiveRow() {
  const tr = document.createElement('tr');
  tr.id = 'activeRow';

  CATEGORIES.forEach(cat => {
    const td = document.createElement('td');

    const badge = document.createElement('span');
    badge.className   = 'row-letter';
    badge.textContent = currentLetter || '?';

    const input = document.createElement('input');
    input.type         = 'text';
    input.className    = 'word-input';
    input.dataset.cat  = cat;
    input.maxLength    = 30;
    input.autocomplete = 'off';
    input.placeholder  = CAT_LABEL[cat];

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const inputs = [...document.querySelectorAll('#activeRow .word-input')];
        const i      = inputs.indexOf(e.target);
        if (i < inputs.length - 1) inputs[i + 1].focus();
      }
    });

    input.addEventListener('input', () => {
      const pos   = input.selectionStart;
      input.value = input.value.toUpperCase();
      input.setSelectionRange(pos, pos);
    });

    td.appendChild(badge);
    td.appendChild(input);
    tr.appendChild(td);
  });

  const tdScore = document.createElement('td');
  tdScore.id        = 'activeScoreCell';
  tdScore.innerHTML = `<span class="row-score" id="activeRowScore">—</span>`;
  tr.appendChild(tdScore);

  return tr;
}

// ── Terminar ronda ──
$('finishRoundBtn').addEventListener('click', finishRound);

function finishRound() {
  if (roundLocked) return;

  const words = {};
  document.querySelectorAll('#activeRow .word-input').forEach(input => {
    words[input.dataset.cat] = input.value.trim().toUpperCase();
  });

  document.querySelectorAll('#activeRow .word-input').forEach(input => {
    input.disabled = true;
  });

  roundLocked = true;

  // Mostrar botones de puntaje con emoji
  const activeRow = $('activeRow');
  CATEGORIES.forEach((cat, colIdx) => {
    const td = activeRow.children[colIdx];

    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-cell';
    scoreDiv.id        = `score-cell-${cat}`;

    SCORE_OPTS.forEach(opt => {
      const btn = document.createElement('button');
      btn.className       = 'score-opt';
      btn.dataset.val     = opt.val;
      btn.dataset.cat     = cat;
      btn.textContent     = opt.emoji;
      btn.title           = opt.label;

      // Pre-seleccionar ❌ si no hay palabra
      if (!words[cat] && opt.val === 0) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        scoreDiv.querySelectorAll('.score-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateActiveRowScore();
        const inp = td.querySelector('.word-input');
        if (inp) inp.style.borderColor = scoreBorderColor(opt.val);
      });

      scoreDiv.appendChild(btn);
    });

    td.appendChild(scoreDiv);
  });

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
    const cell   = $(`score-cell-${cat}`);
    if (!cell) return;
    const active = cell.querySelector('.score-opt.active');
    if (active) total += parseInt(active.dataset.val);
  });
  $('activeRowScore').textContent = total;
  updateGrandTotal();
}

function updateGrandTotal() {
  let grand = rounds.reduce((s, r) =>
    s + CATEGORIES.reduce((rs, c) => rs + (r.scores[c] || 0), 0), 0);

  CATEGORIES.forEach(cat => {
    const cell   = $(`score-cell-${cat}`);
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
  const grand       = rounds.reduce((s, r) =>
    s + CATEGORIES.reduce((rs, c) => rs + (r.scores[c] || 0), 0), 0);
  const maxPossible = totalRounds * CATEGORIES.length * 10;
  const pct         = grand / maxPossible;

  let emoji, title;
  if (pct >= 0.9)      { emoji = '🏆'; title = '¡EXCELENTE!'; }
  else if (pct >= 0.7) { emoji = '🌟'; title = '¡MUY BIEN!'; }
  else if (pct >= 0.5) { emoji = '😊'; title = '¡BIEN HECHO!'; }
  else                 { emoji = '💪'; title = '¡SEGUÍ PRACTICANDO!'; }

  $('resultEmoji').textContent = emoji;
  $('resultTitle').textContent = title;
  $('resultName').textContent  = playerName;
  $('finalScore').textContent  = grand;
  $('finalMax').textContent    = `DE ${maxPossible} PUNTOS POSIBLES`;

  const hist = $('resultHistory');
  hist.innerHTML = '';
  rounds.forEach((r, i) => {
    const rowTotal = CATEGORIES.reduce((s, c) => s + (r.scores[c] || 0), 0);
    const chip     = document.createElement('div');
    chip.className = 'history-chip';
    chip.innerHTML = `<span class="chip-letter">${r.letter || '?'}</span>RONDA ${i+1}: ${rowTotal} PTS`;
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

