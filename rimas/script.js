// =============================================
//  ¿QUÉ RIMA CON...? — 1º grado primaria
//  8 pares de rimas con emojis
//  Flujo: elegir imagen correcta → escribir nueva palabra que rime
// =============================================

// Cada par:
//  clue    = imagen/palabra dada
//  options = 3 opciones (1 correcta + 2 distractoras)
//  correct = índice de la opción correcta (0, 1, 2)
//  hint    = sugerencia de otras palabras que riman

var PAIRS = [
  {
    clue:    { emoji: '🐱', word: 'GATO' },
    options: [
      { emoji: '🦆', word: 'PATO' },
      { emoji: '🌳', word: 'ÁRBOL' },
      { emoji: '🍎', word: 'MANZANA' },
    ],
    correct: 0,   // PATO rima con GATO
    hint: 'Ejemplos: RATO, PLATO, ZAPATO...'
  },
  {
    clue:    { emoji: '🌙', word: 'LUNA' },
    options: [
      { emoji: '🌊', word: 'CUNA' },
      { emoji: '🍀', word: 'TRÉBOL' },
      { emoji: '🐟', word: 'PEZ' },
    ],
    correct: 0,   // CUNA rima con LUNA
    hint: 'Ejemplos: UNA, TUNA, LAGUNA...'
  },
  {
    clue:    { emoji: '🏠', word: 'CASA' },
    options: [
      { emoji: '🥣', word: 'TAZA' },
      { emoji: '🌸', word: 'ROSA' },
      { emoji: '🍋', word: 'LIMÓN' },
    ],
    correct: 0,   // TAZA rima con CASA
    hint: 'Ejemplos: MASA, PASA, RASA...'
  },
  {
    clue:    { emoji: '🐸', word: 'SAPO' },
    options: [
      { emoji: '🧥', word: 'TRAPO' },
      { emoji: '🧤', word: 'GUANTE' },
      { emoji: '🎈', word: 'GLOBO' },
    ],
    correct: 0,   // TRAPO rima con SAPO
    hint: 'Ejemplos: GUAPO, MAPO, GARRAPO...'
  },
  {
    clue:    { emoji: '🌞', word: 'SOL' },
    options: [
      { emoji: '🔥', word: 'FAROL' },
      { emoji: '🌧️', word: 'LLUVIA' },
      { emoji: '🌲', word: 'ÁRBOL' },
    ],
    correct: 0,   // COL rima con SOL
    hint: 'Ejemplos: ROL, GOL, CARACOL...'
  },
  {
    clue:    { emoji: '🦁', word: 'LEÓN' },
    options: [
      { emoji: '🎈', word: 'AVIÓN' },
      { emoji: '🐭', word: 'RATÓN' },
      { emoji: '🧦', word: 'MEDIA' },
    ],
    correct: 1,   // RATÓN rima con LEÓN
    hint: 'Ejemplos: CAMIÓN, SILLÓN, BOTÓN...'
  },
  {
    clue:    { emoji: '🌹', word: 'FLOR' },
    options: [
      { emoji: '❤️', word: 'AMOR' },
      { emoji: '🌿', word: 'HOJA' },
      { emoji: '🍋', word: 'LIMÓN' },
    ],
    correct: 0,   // AMOR rima con FLOR
    hint: 'Ejemplos: CALOR, COLOR, VAPOR...'
  },
  {
    clue:    { emoji: '🎻', word: 'VIOLÍN' },
    options: [
      { emoji: '🥁', word: 'TAMBOR' },
      { emoji: '🌹', word: 'JARDÍN' },
      { emoji: '🎸', word: 'GUITARRA' },
    ],
    correct: 1,   // JARDÍN rima con VIOLÍN
    hint: 'Ejemplos: FESTÍN, PATÍN, CALCETÍN...'
  },
];

// ---- ESTADO ----
var completed  = new Array(PAIRS.length).fill(false);
var rhymes     = new Array(PAIRS.length).fill('');
var currentPair = null;
var score      = 0;
var hintTimer  = null;   // temporizador del hint

// ---- INIT ----
function init() {
  completed   = new Array(PAIRS.length).fill(false);
  rhymes      = new Array(PAIRS.length).fill('');
  score       = 0;
  currentPair = null;

  document.getElementById('cel').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('pf').style.width = '0%';
  document.getElementById('pl').textContent = '0 / ' + PAIRS.length;

  buildCards();
}

// ---- CONSTRUIR TARJETAS ----
function buildCards() {
  var container = document.getElementById('cards');
  container.innerHTML = '';

  PAIRS.forEach(function(pair, pi) {
    var shuffled = shuffleOptions(pair.options, pair.correct);

    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'card-' + pi;
    card.dataset.shuffled = JSON.stringify(shuffled);

    card.innerHTML =
      '<div class="clue-side">' +
        '<div class="clue-tag">¿QUÉ RIMA CON...?</div>' +
        '<div class="clue-emoji">' + pair.clue.emoji + '</div>' +
        '<div class="clue-word">' + pair.clue.word + '</div>' +
      '</div>' +
      '<div class="card-div">🎵</div>' +
      '<div class="opts-side" id="opts-' + pi + '">' +
        shuffled.map(function(opt, oi) {
          return '<button class="opt-btn" id="ob-' + pi + '-' + oi + '" ' +
            'onclick="onOptionClick(' + pi + ',' + oi + ',' + opt.isCorrect + ')">' +
            '<span class="opt-emoji">' + opt.emoji + '</span>' +
            '<span class="opt-word">' + opt.word + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="rhyme-result" id="rr-' + pi + '">' +
        '<span class="rr-icon">✏️</span>' +
        '<span id="rt-' + pi + '"></span>' +
      '</div>';

    container.appendChild(card);
  });
}

// ---- BARAJAR OPCIONES ----
function shuffleOptions(options, correctIdx) {
  var arr = options.map(function(opt, i) {
    return { emoji: opt.emoji, word: opt.word, isCorrect: (i === correctIdx) };
  });
  // Fisher-Yates
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

// ---- CLICK EN OPCIÓN ----
function onOptionClick(pi, oi, isCorrect) {
  if (completed[pi]) return;

  var btn = document.getElementById('ob-' + pi + '-' + oi);

  if (isCorrect) {
    btn.classList.add('correct');
    document.querySelectorAll('#opts-' + pi + ' .opt-btn').forEach(function(b) {
      b.disabled = true;
    });

    var shuffled = JSON.parse(document.getElementById('card-' + pi).dataset.shuffled);
    currentPair = {
      pi: pi,
      clueWord: PAIRS[pi].clue.word,
      clueEmoji: PAIRS[pi].clue.emoji,
      rhymeWord: shuffled[oi].word,
      rhymeEmoji: shuffled[oi].emoji,
    };

    setTimeout(function() { openModal(pi, shuffled[oi]); }, 400);

  } else {
    btn.classList.add('wrong');
    setTimeout(function() { btn.classList.remove('wrong'); }, 500);
  }
}

// ---- ABRIR MODAL ----
function openModal(pi, correctOpt) {
  var pair = PAIRS[pi];
  document.getElementById('mpair').textContent = pair.clue.emoji + ' — ' + correctOpt.emoji;
  document.getElementById('mtitle').textContent = '¡' + pair.clue.word + ' RIMA CON ' + correctOpt.word + '! ✨';
  document.getElementById('mclue').textContent  = pair.clue.emoji + ' ' + pair.clue.word;
  document.getElementById('mrhyme').textContent = correctOpt.emoji + ' ' + correctOpt.word;
  document.getElementById('hint-txt').textContent = PAIRS[pi].hint;

  var inp = document.getElementById('rhy-in');
  inp.value = '';
  inp.className = 'rhy-input';
  inp.placeholder = 'ESCRIBÍ AQUÍ...';

  // Ocultar hint al abrir; se mostrará solo si el niño no escribió en 10 segundos
  var hintEl = document.getElementById('hint-txt');
  hintEl.style.visibility = 'hidden';
  hintEl.style.opacity = '0';
  hintEl.style.transition = 'opacity .6s';

  clearTimeout(hintTimer);
  hintTimer = setTimeout(function() {
    if (inp.value.trim().length === 0) {
      hintEl.style.visibility = 'visible';
      hintEl.style.opacity = '1';
    }
  }, 10000);

  // Cancelar el hint cuando el niño empiece a escribir
  inp.oninput = function() {
    if (inp.value.trim().length > 0) {
      clearTimeout(hintTimer);
      hintEl.style.visibility = 'hidden';
      hintEl.style.opacity = '0';
    }
  };

  document.getElementById('modal').classList.remove('hidden');
  setTimeout(function() { inp.focus(); }, 100);
}

// ---- CONFIRMAR RIMA ----
function confirmRhyme() {
  var inp = document.getElementById('rhy-in');
  var val = inp.value.trim().toUpperCase();

  if (val.length < 2) {
    inp.classList.add('err');
    setTimeout(function() { inp.classList.remove('err'); }, 500);
    return;
  }

  var pi = currentPair.pi;
  rhymes[pi]    = val;
  completed[pi] = true;
  score++;

  // Mostrar resultado en la tarjeta
  var rr = document.getElementById('rr-' + pi);
  document.getElementById('rt-' + pi).textContent =
    currentPair.clueWord + ' — ' + currentPair.rhymeWord + ' — ' + val;
  rr.classList.add('show');

  // Marcar tarjeta como completa
  document.getElementById('card-' + pi).classList.add('done');

  // Cancelar timer del hint y cerrar modal
  clearTimeout(hintTimer);
  document.getElementById('modal').classList.add('hidden');

  // Actualizar progreso
  document.getElementById('pf').style.width = (score / PAIRS.length * 100) + '%';
  document.getElementById('pl').textContent = score + ' / ' + PAIRS.length;

  if (score === PAIRS.length) {
    setTimeout(showCelebration, 600);
  }
}

// ---- CELEBRACIÓN ----
function showCelebration() {
  var sum = document.getElementById('sum');
  sum.innerHTML = PAIRS.map(function(p, i) {
    var correctOpt = p.options[p.correct];
    return '<div class="sum-item">' +
      '<span>' + p.clue.emoji + '</span>' +
      '<p>' + p.clue.word + ' — ' + correctOpt.word + ' — ' + rhymes[i] + '</p>' +
    '</div>';
  }).join('');

  document.getElementById('cel').classList.remove('hidden');
}

// ---- RESET ----
function resetAll() {
  clearTimeout(hintTimer);
  init();
}

// ---- ENTER PARA CONFIRMAR ----
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !document.getElementById('modal').classList.contains('hidden')) {
    confirmRhyme();
  }
});

// ---- ARRANCAR ----
init();
