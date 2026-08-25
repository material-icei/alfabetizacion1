// =====================================================
//  SEPARÁ EN SÍLABAS — 1º grado primaria
//  Flujo: arrastrar sobre letras → marcar sílabas en orden
//  4 niveles progresivos, desbloqueados secuencialmente
//  Tecnología: HTML5 + CSS3 + JS puro
// =====================================================


// ══════════════════════════════════════════════════
//  1. BANCO DE PALABRAS POR NIVEL
//
//  Cada entrada:
//    word    : palabra en MAYÚSCULAS
//    silabas : array con cada sílaba (define la respuesta correcta)
//    emoji   : ícono representativo
// ══════════════════════════════════════════════════

var NIVELES = [

  // ── NIVEL 1: palabras de 2 sílabas ──────────────
  {
    nombre: 'NIVEL 1',
    desc:   'Palabras de 2 sílabas',
    emoji:  '🌟',
    estrellas: '⭐ Fácil',
    palabras: [
      { word: 'GATO',   silabas: ['GA','TO'],   emoji: '🐱' },
      { word: 'MESA',   silabas: ['ME','SA'],   emoji: '🪑' },
      { word: 'LUNA',   silabas: ['LU','NA'],   emoji: '🌙' },
      { word: 'PERRO',  silabas: ['PE','RRO'],  emoji: '🐶' },
      { word: 'LIBRO',  silabas: ['LI','BRO'],  emoji: '📚' },
      { word: 'FLOR',   silabas: ['FLOR'],      emoji: '🌸' },   // monosílabo especial: sólo 1 sílaba
      { word: 'MANO',   silabas: ['MA','NO'],   emoji: '✋' },
      { word: 'NIÑO',   silabas: ['NI','ÑO'],   emoji: '👦' },
      { word: 'BOCA',   silabas: ['BO','CA'],   emoji: '👄' },
      { word: 'PATO',   silabas: ['PA','TO'],   emoji: '🦆' },
    ]
  },

  // ── NIVEL 2: palabras de 3 sílabas ──────────────
  {
    nombre: 'NIVEL 2',
    desc:   'Palabras de 3 sílabas',
    emoji:  '🚀',
    estrellas: '⭐⭐ Medio',
    palabras: [
      { word: 'CAMINO',   silabas: ['CA','MI','NO'],   emoji: '🛤️' },
      { word: 'CONEJO',   silabas: ['CO','NE','JO'],   emoji: '🐰' },
      { word: 'MANZANA',  silabas: ['MAN','ZA','NA'],  emoji: '🍎' },
      { word: 'PALOMA',   silabas: ['PA','LO','MA'],   emoji: '🕊️' },
      { word: 'COMETA',   silabas: ['CO','ME','TA'],   emoji: '☄️' },
      { word: 'TOMATE',   silabas: ['TO','MA','TE'],   emoji: '🍅' },
      { word: 'CABALLO',  silabas: ['CA','BA','LLO'],  emoji: '🐴' },
      { word: 'MARIPOSA', silabas: ['MA','RI','PO','SA'], emoji: '🦋' }, // 4 sílabas de bonus
      { word: 'PELOTA',   silabas: ['PE','LO','TA'],   emoji: '⚽' },
      { word: 'FAMILIA',  silabas: ['FA','MI','LIA'],  emoji: '👨‍👩‍👧' },
    ]
  },

  // ── NIVEL 3: palabras de 4 sílabas ──────────────
  {
    nombre: 'NIVEL 3',
    desc:   'Palabras de 4 sílabas',
    emoji:  '🦋',
    estrellas: '⭐⭐⭐ Difícil',
    palabras: [
      { word: 'MARIPOSA',    silabas: ['MA','RI','PO','SA'],    emoji: '🦋' },
      { word: 'CHOCOLATE',   silabas: ['CHO','CO','LA','TE'],   emoji: '🍫' },
      { word: 'COMPUTADORA', silabas: ['COM','PU','TA','DO','RA'], emoji: '💻' },
      { word: 'ELEFANTE',    silabas: ['E','LE','FAN','TE'],    emoji: '🐘' },
      { word: 'TELEVISION',  silabas: ['TE','LE','VI','SION'],  emoji: '📺' },
      { word: 'BIBLIOTECA',  silabas: ['BI','BLIO','TE','CA'],  emoji: '📖' },
      { word: 'CALABAZA',    silabas: ['CA','LA','BA','ZA'],    emoji: '🎃' },
      { word: 'TORTUGA',     silabas: ['TOR','TU','GA'],        emoji: '🐢' }, // 3 sílabas de revisión
      { word: 'CAMISETA',    silabas: ['CA','MI','SE','TA'],    emoji: '👕' },
      { word: 'HELICOPTERO', silabas: ['HE','LI','COP','TE','RO'], emoji: '🚁' },
    ]
  },

  // ── NIVEL 4: sonidos compuestos ──────────────────
  {
    nombre: 'NIVEL 4',
    desc:   'Sonidos compuestos',
    emoji:  '🎓',
    estrellas: '⭐⭐⭐ Experto',
    palabras: [
      { word: 'PLANTA',         silabas: ['PLAN','TA'],           emoji: '🌿' },
      { word: 'FLAUTA',         silabas: ['FLAU','TA'],           emoji: '🎵' },
      { word: 'GLOBO',          silabas: ['GLO','BO'],            emoji: '🎈' },
      { word: 'ESCRIBIR',       silabas: ['ES','CRI','BIR'],      emoji: '✍️' },
      { word: 'CRONOMETRO',     silabas: ['CRO','NO','ME','TRO'], emoji: '⏱️' },
      { word: 'TREN',           silabas: ['TREN'],                emoji: '🚂' },
      { word: 'DRAGON',         silabas: ['DRA','GON'],           emoji: '🐉' },
      { word: 'TELETRANSPORTAR',silabas: ['TE','LE','TRANS','POR','TAR'], emoji: '🚀' },
      { word: 'BLOQUE',         silabas: ['BLO','QUE'],           emoji: '🧱' },
      { word: 'PRINCIPE',       silabas: ['PRIN','CI','PE'],      emoji: '🤴' },
    ]
  },
];

// Cuántas palabras por sesión de nivel
var PALABRAS_POR_NIVEL = 5;


// ══════════════════════════════════════════════════
//  2. ESTADO GLOBAL
// ══════════════════════════════════════════════════

var state = {
  nivelActual:   0,          // índice del nivel activo (0-3)
  nivelDesbloq:  0,          // índice del nivel más alto desbloqueado
  palabrasRonda: [],         // palabras elegidas para la sesión actual
  palabraIdx:    0,          // índice de la palabra actual en la ronda
  silabaIdx:     0,          // índice de la sílaba que hay que marcar ahora
  silabasMarcadas: [],       // sílabas confirmadas en la palabra actual
  dragging:      false,      // ¿está el alumno arrastrando?
  letrasDrag:    [],         // índices de letras bajo el drag actual
  letrasAsig:    [],         // índices de letras ya asignadas a sílabas
};

// Persistencia simple en localStorage
var LS_KEY = 'silabas_nivel_desbloq';


// ══════════════════════════════════════════════════
//  3. ARRANQUE
// ══════════════════════════════════════════════════

window.addEventListener('load', function() {
  // Recuperar progreso guardado
  var guardado = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
  state.nivelDesbloq = Math.min(guardado, NIVELES.length - 1);
  renderLevelSelector();
});


// ══════════════════════════════════════════════════
//  4. PANTALLA SELECTOR DE NIVELES
// ══════════════════════════════════════════════════

function renderLevelSelector() {
  var grid = document.getElementById('levels-grid');
  grid.innerHTML = '';

  NIVELES.forEach(function(niv, i) {
    var desbloqueado = i <= state.nivelDesbloq;
    var card = document.createElement('div');
    card.className = 'level-card' + (desbloqueado ? '' : ' locked');

    card.innerHTML =
      '<div class="lc-accent">' +
        (desbloqueado ? niv.emoji : '<span class="lock-icon">🔒</span>') +
      '</div>' +
      '<div class="lc-badge">' + niv.nombre + '</div>' +
      '<div class="lc-title">' + niv.desc + '</div>' +
      '<div class="lc-stars">' + niv.estrellas + '</div>';

    if (desbloqueado) {
      card.addEventListener('click', function() { startLevel(i); });
    }
    grid.appendChild(card);
  });
}

function goToLevels() {
  document.getElementById('screen-game').classList.add('hidden');
  document.getElementById('overlay-level').classList.add('hidden');
  document.getElementById('screen-levels').classList.remove('hidden');
  renderLevelSelector();
}

function goHome() {
  window.location.href = '../index.html';
}

function resetAll() {
  localStorage.setItem(LS_KEY, '0');
  state.nivelDesbloq = 0;
  document.getElementById('overlay-final').classList.add('hidden');
  goToLevels();
}


// ══════════════════════════════════════════════════
//  5. INICIAR UN NIVEL
// ══════════════════════════════════════════════════

function startLevel(nivelIdx) {
  state.nivelActual = nivelIdx;
  var niv = NIVELES[nivelIdx];

  // Elegir PALABRAS_POR_NIVEL palabras al azar (sin repetición)
  var pool = niv.palabras.slice();
  shuffleArray(pool);
  state.palabrasRonda = pool.slice(0, PALABRAS_POR_NIVEL);
  state.palabraIdx    = 0;

  // Actualizar label de nivel
  document.getElementById('game-level-label').textContent = niv.nombre;

  // Mostrar pantalla de juego
  document.getElementById('screen-levels').classList.add('hidden');
  document.getElementById('screen-game').classList.remove('hidden');

  loadPalabra();
}


// ══════════════════════════════════════════════════
//  6. CARGAR PALABRA ACTUAL
// ══════════════════════════════════════════════════

function loadPalabra() {
  var total   = state.palabrasRonda.length;
  var idx     = state.palabraIdx;
  var entrada = state.palabrasRonda[idx];

  // Resetear estado de sílabas
  state.silabaIdx      = 0;
  state.silabasMarcadas = [];
  state.dragging       = false;
  state.letrasDrag     = [];
  state.letrasAsig     = [];

  // Progreso
  document.getElementById('game-progress-label').textContent =
    'Palabra ' + (idx + 1) + ' de ' + total;
  document.getElementById('word-prog-fill').style.width =
    (idx / total * 100) + '%';

  // Emoji
  document.getElementById('word-emoji').textContent = entrada.emoji;

  // Renderizar letras
  renderLetras(entrada.word);

  // Limpiar sílabas marcadas y feedback
  document.getElementById('silabas-marcadas').innerHTML = '';
  hideFeedback();

  // Instrucción inicial
  updateInstruccion(entrada);
}

function renderLetras(word) {
  var container = document.getElementById('word-display');
  container.innerHTML = '';

  for (var i = 0; i < word.length; i++) {
    var span = document.createElement('span');
    span.className = 'letra';
    span.textContent = word[i];
    span.dataset.idx = i;

    // Eventos de drag sobre cada letra
    span.addEventListener('mouseenter',  onLetraEnter);
    span.addEventListener('touchmove',   onLetraTouchMove, { passive: false });

    container.appendChild(span);
  }

  // Iniciar drag con mousedown/touchstart en el contenedor
  container.addEventListener('mousedown',  onDragStart);
  container.addEventListener('mouseup',    onDragEnd);
  container.addEventListener('mouseleave', onContainerLeave);
  container.addEventListener('touchstart', onTouchStart,  { passive: false });
  container.addEventListener('touchend',   onTouchEnd,    { passive: false });
}

function updateInstruccion(entrada) {
  var si = state.silabaIdx;
  var total = entrada.silabas.length;
  var ordinal = ['1ª','2ª','3ª','4ª','5ª'][si] || (si+1) + 'ª';
  var instr = document.getElementById('instruccion');

  if (si >= total) {
    instr.innerHTML = '¡Muy bien! Completaste la palabra.';
    return;
  }

  instr.innerHTML =
    'Marcá la <strong>' + ordinal + ' sílaba</strong>: arrastrá sobre las letras';
}


// ══════════════════════════════════════════════════
//  7. EVENTOS DE DRAG (mouse)
// ══════════════════════════════════════════════════

function onDragStart(e) {
  // Solo reaccionar en letras no asignadas
  var target = e.target.closest('.letra');
  if (!target || target.classList.contains('asignada')) return;

  state.dragging   = true;
  state.letrasDrag = [];
  clearSelecting();
  addLetraToSelection(target);
}

function onLetraEnter(e) {
  if (!state.dragging) return;
  if (this.classList.contains('asignada')) return;
  addLetraToSelection(this);
}

function onDragEnd(e) {
  if (!state.dragging) return;
  state.dragging = false;
  confirmSelection();
}

function onContainerLeave(e) {
  // Si el mouse sale del contenedor, terminar drag
  if (state.dragging) {
    state.dragging = false;
    confirmSelection();
  }
}


// ══════════════════════════════════════════════════
//  8. EVENTOS DE DRAG (touch — trackpad Chromebook)
// ══════════════════════════════════════════════════

function onTouchStart(e) {
  e.preventDefault();
  var touch  = e.touches[0];
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  var letra  = target && target.closest('.letra');
  if (!letra || letra.classList.contains('asignada')) return;

  state.dragging   = true;
  state.letrasDrag = [];
  clearSelecting();
  addLetraToSelection(letra);
}

function onLetraTouchMove(e) {
  // No usado directamente; se usa el touchmove del document
}

// touchmove global para capturar el deslizamiento sobre letras
document.addEventListener('touchmove', function(e) {
  if (!state.dragging) return;
  e.preventDefault();
  var touch  = e.touches[0];
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  var letra  = target && target.closest('.letra');
  if (letra && !letra.classList.contains('asignada')) {
    addLetraToSelection(letra);
  }
}, { passive: false });

function onTouchEnd(e) {
  if (!state.dragging) return;
  state.dragging = false;
  confirmSelection();
}


// ══════════════════════════════════════════════════
//  9. SELECCIÓN DE LETRAS
// ══════════════════════════════════════════════════

function addLetraToSelection(letraEl) {
  var idx = parseInt(letraEl.dataset.idx, 10);
  // Evitar duplicados
  if (state.letrasDrag.indexOf(idx) !== -1) return;
  state.letrasDrag.push(idx);
  letraEl.classList.add('selecting');
}

function clearSelecting() {
  document.querySelectorAll('.letra.selecting').forEach(function(el) {
    el.classList.remove('selecting');
  });
}


// ══════════════════════════════════════════════════
//  10. CONFIRMAR SELECCIÓN
// ══════════════════════════════════════════════════

function confirmSelection() {
  if (state.letrasDrag.length === 0) return;

  var entrada  = state.palabrasRonda[state.palabraIdx];
  var silabaEsperada = entrada.silabas[state.silabaIdx];

  // Construir el texto seleccionado (en orden de índice)
  var idxOrdenados = state.letrasDrag.slice().sort(function(a,b){ return a-b; });
  var textoSelec   = idxOrdenados.map(function(i) {
    return entrada.word[i];
  }).join('');

  var esCorrecta = textoSelec.toUpperCase() === silabaEsperada.toUpperCase();

  clearSelecting();

  if (esCorrecta) {
    onSilabaCorrecta(idxOrdenados, silabaEsperada);
  } else {
    onSilabaIncorrecta(textoSelec, silabaEsperada);
  }

  state.letrasDrag = [];
}

function onSilabaCorrecta(idxs, silaba) {
  // Marcar letras como asignadas
  idxs.forEach(function(i) {
    state.letrasAsig.push(i);
    var el = document.querySelector('.letra[data-idx="' + i + '"]');
    if (el) el.classList.add('asignada');
  });

  // Agregar chip verde
  addChip(silaba, 'ok');

  state.silabasMarcadas.push(silaba);
  state.silabaIdx++;

  var entrada = state.palabrasRonda[state.palabraIdx];

  if (state.silabaIdx >= entrada.silabas.length) {
    // Palabra completada
    setTimeout(onPalabraCompleta, 500);
  } else {
    // Siguiente sílaba
    hideFeedback();
    updateInstruccion(entrada);
    showFeedback('✅ ¡Correcto!', 'ok');
    setTimeout(hideFeedback, 900);
  }
}

function onSilabaIncorrecta(seleccionado, esperado) {
  addChip(seleccionado, 'err');
  showFeedback('❌ Intentá de nuevo — volvé a marcar la misma sílaba', 'err');
  // El chip rojo desaparece tras 800ms
  setTimeout(function() {
    var chips = document.querySelectorAll('.chip.err');
    chips.forEach(function(c) { c.remove(); });
    hideFeedback();
  }, 1000);
}

function addChip(texto, tipo) {
  var chip = document.createElement('div');
  chip.className = 'chip ' + tipo;
  chip.textContent = texto;
  document.getElementById('silabas-marcadas').appendChild(chip);
}


// ══════════════════════════════════════════════════
//  11. PALABRA COMPLETADA → SIGUIENTE PALABRA
// ══════════════════════════════════════════════════

function onPalabraCompleta() {
  hideFeedback();
  showFeedback('🎉 ¡Muy bien! ¡Palabra completa!', 'ok');

  state.palabraIdx++;
  var total = state.palabrasRonda.length;

  if (state.palabraIdx >= total) {
    // Nivel completado
    setTimeout(onNivelCompletado, 900);
  } else {
    // Siguiente palabra
    setTimeout(function() {
      hideFeedback();
      loadPalabra();
    }, 900);
  }
}

function retryWord() {
  hideFeedback();
  loadPalabra();
}


// ══════════════════════════════════════════════════
//  12. NIVEL COMPLETADO
// ══════════════════════════════════════════════════

function onNivelCompletado() {
  var nivelIdx = state.nivelActual;
  var esUltimo = nivelIdx >= NIVELES.length - 1;

  // Desbloquear siguiente nivel
  if (nivelIdx + 1 > state.nivelDesbloq && !esUltimo) {
    state.nivelDesbloq = nivelIdx + 1;
    localStorage.setItem(LS_KEY, state.nivelDesbloq);
  }

  // Barra de progreso al 100%
  document.getElementById('word-prog-fill').style.width = '100%';

  if (esUltimo) {
    document.getElementById('overlay-final').classList.remove('hidden');
  } else {
    var overlay = document.getElementById('overlay-level');
    document.getElementById('ol-emo').textContent   = '🎉';
    document.getElementById('ol-title').textContent = '¡NIVEL COMPLETADO!';
    document.getElementById('ol-sub').textContent   =
      'Completaste ' + NIVELES[nivelIdx].nombre;
    var btnNext = document.getElementById('ol-btn-next');
    btnNext.textContent = '➡️ NIVEL ' + (nivelIdx + 2);
    overlay.classList.remove('hidden');
  }
}

function nextLevel() {
  document.getElementById('overlay-level').classList.add('hidden');
  startLevel(state.nivelActual + 1);
}


// ══════════════════════════════════════════════════
//  13. FEEDBACK VISUAL
// ══════════════════════════════════════════════════

function showFeedback(msg, tipo) {
  var el = document.getElementById('feedback');
  el.textContent = msg;
  el.className   = 'feedback ' + tipo;
}
function hideFeedback() {
  var el = document.getElementById('feedback');
  el.className = 'feedback hidden';
}


// ══════════════════════════════════════════════════
//  14. UTILIDADES
// ══════════════════════════════════════════════════

// Fisher-Yates shuffle
function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
}
