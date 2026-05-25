/**
 * game.js — Lógica del Bingo de las Letras (1º grado)
 * Depende de: data.js (WORDS, ALPHABET, FREE_CELL, constantes)
 */

'use strict';

// =============================================
// ESTADO GLOBAL
// =============================================

let selectedPlayer  = null;
let currentLetter   = null;
let boards          = {};
let markedState     = {};

// =============================================
// UTILIDADES
// =============================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =============================================
// GENERACIÓN DE TABLEROS
// =============================================

function generateBoard(playerId) {
  const allLetters = shuffle([...ALPHABET]);
  let pool = [];

  for (const letter of allLetters) {
    const words = shuffle(WORDS[letter] || []);
    const take = Math.random() > 0.5 ? 2 : 1;
    pool.push(...words.slice(0, take).map(w => ({ ...w, letter })));
    if (pool.length >= WORD_CELLS + 8) break;
  }

  if (pool.length < WORD_CELLS) {
    for (const letter of allLetters) {
      const words = shuffle(WORDS[letter] || []);
      pool.push(...words.slice(0, 3).map(w => ({ ...w, letter })));
      if (pool.length >= WORD_CELLS + 4) break;
    }
  }

  pool = shuffle(pool).slice(0, WORD_CELLS);

  const positions     = shuffle([...Array(TOTAL_CELLS).keys()]);
  const wordPositions = new Set(positions.slice(0, WORD_CELLS));

  const cells  = [];
  let wordIdx  = 0;

  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (wordPositions.has(i)) {
      cells.push({ ...pool[wordIdx++], isFree: false });
    } else {
      cells.push({ ...FREE_CELL });
    }
  }

  return cells;
}

function initBoards() {
  for (let i = 1; i <= TOTAL_BOARDS; i++) {
    boards[i]      = generateBoard(i);
    markedState[i] = boards[i].map(cell => cell.isFree);
  }
}

// =============================================
// LÓGICA DE LÍNEA Y BINGO
// =============================================

function checkLinea(playerId) {
  const m     = markedState[playerId];
  const cells = boards[playerId];

  for (let r = 0; r < GRID_ROWS; r++) {
    let rowComplete = true;
    let hasObjects  = false;

    for (let c = 0; c < GRID_COLS; c++) {
      const idx  = r * GRID_COLS + c;
      const cell = cells[idx];
      if (!cell.isFree) {
        hasObjects = true;
        if (!m[idx]) { rowComplete = false; break; }
      }
    }
    if (hasObjects && rowComplete) return true;
  }
  return false;
}

function checkBingo(playerId) {
  const m     = markedState[playerId];
  const cells = boards[playerId];
  return cells.every((cell, i) => cell.isFree || m[i]);
}

function getBoardState(playerId) {
  if (checkBingo(playerId)) return 'bingo';
  if (checkLinea(playerId)) return 'linea';
  return null;
}

function toggleMark(playerId, idx) {
  markedState[playerId][idx] = !markedState[playerId][idx];
  renderBoard(playerId);
  updateBanners(playerId);
}

function updateBanners(playerId) {
  const state = getBoardState(playerId);
  document.getElementById('lineaBanner').classList.toggle('hidden', state !== 'linea');
  document.getElementById('bingoBanner').classList.toggle('hidden', state !== 'bingo');
}

// =============================================
// CONTADORES
// =============================================

function updateCounts(playerId) {
  const m     = markedState[playerId];
  const cells = boards[playerId];

  const totalMarked = m.filter((v, i) => v && !cells[i].isFree).length;

  const correctMarked = currentLetter
    ? m.filter((v, i) => v && !cells[i].isFree &&
        normalizeFirst(cells[i].w) === currentLetter).length
    : 0;

  document.getElementById('markedCount').textContent  = totalMarked;
  document.getElementById('correctCount').textContent = correctMarked;
}

function normalizeFirst(word) {
  const map = { 'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U' };
  const first = word.charAt(0).toUpperCase();
  return map[first] || first;
}

// =============================================
// RENDERIZADO DEL TABLERO
// =============================================

function renderBoard(playerId) {
  const board  = document.getElementById('bingoBoard');
  const cells  = boards[playerId];
  const marked = markedState[playerId];

  board.innerHTML = '';

  cells.forEach((cell, idx) => {
    const div = document.createElement('div');

    let cls = 'cell';
    if (cell.isFree)       cls += ' free-space';
    else if (marked[idx])  cls += ' marked';

    div.className = cls;
    div.setAttribute('role', 'gridcell');
    div.setAttribute('aria-label', cell.w);

    if (cell.isFree) {
      div.innerHTML = `<span style="font-size:1.6rem">⭐</span>`;
    } else {
      div.innerHTML = `
        <span class="cell-emoji" aria-hidden="true">${cell.e}</span>
        <span class="cell-word">${cell.w.toUpperCase()}</span>
      `;
      div.addEventListener('click', () => toggleMark(playerId, idx));
    }

    board.appendChild(div);
  });

  updateCounts(playerId);
}

// =============================================
// SELECTOR DE LETRAS
// =============================================

function buildLetterBtns() {
  const container = document.getElementById('letterBtns');
  container.innerHTML = '';

  ALPHABET.forEach(letter => {
    const btn = document.createElement('button');
    btn.className    = 'lbtn';
    btn.textContent  = letter;
    btn.dataset.letter = letter;
    btn.setAttribute('aria-label', `Letra ${letter}`);
    btn.addEventListener('click', () => selectLetter(letter));
    container.appendChild(btn);
  });
}

function selectLetter(letter) {
  currentLetter = letter;
  document.getElementById('currentLetterBig').textContent = letter;
  document.getElementById('letterDisplay').classList.remove('hidden');

  document.querySelectorAll('.lbtn').forEach(btn => {
    btn.classList.toggle('active-letter', btn.dataset.letter === letter);
  });

  if (selectedPlayer !== null) updateCounts(selectedPlayer);
}

// =============================================
// TABS DE TABLEROS
// =============================================


function switchBoard(id) {
  selectedPlayer = id;
  document.getElementById('boardTitle').textContent = `Tablero ${id}`;
  renderBoard(id);
  updateBanners(id);
}

// =============================================
// PANTALLA DE CONFIGURACIÓN
// =============================================

function buildPlayerGrid() {
  const grid = document.getElementById('playerGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= TOTAL_BOARDS; i++) {
    const btn = document.createElement('button');
    btn.className   = 'player-btn';
    btn.textContent = `${i}`;
    btn.setAttribute('aria-label', `Tablero ${i}`);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPlayer = i;
      document.getElementById('startBtn').disabled = false;
    });

    grid.appendChild(btn);
  }
}

// =============================================
// NAVEGACIÓN
// =============================================

function startGame(playerId) {
  selectedPlayer = playerId;

  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('game-screen').classList.remove('hidden');

  document.getElementById('boardTitle').textContent = `Tablero ${playerId}`;
  document.getElementById('bingoBanner').classList.add('hidden');
  document.getElementById('lineaBanner').classList.add('hidden');
  document.getElementById('letterDisplay').classList.add('hidden');

  buildLetterBtns();
  renderBoard(playerId);
}

function goBack() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('setup-screen').style.display = 'flex';
  selectedPlayer = null;
  currentLetter  = null;
}

function resetCurrentBoard() {
  if (selectedPlayer === null) return;
  markedState[selectedPlayer] = boards[selectedPlayer].map(cell => cell.isFree);
  document.getElementById('bingoBanner').classList.add('hidden');
  document.getElementById('lineaBanner').classList.add('hidden');
  renderBoard(selectedPlayer);
}

// =============================================
// INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initBoards();
  buildPlayerGrid();

  document.getElementById('startBtn').addEventListener('click', () => {
    if (selectedPlayer !== null) startGame(selectedPlayer);
  });

  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('resetBoardBtn').addEventListener('click', resetCurrentBoard);
});
