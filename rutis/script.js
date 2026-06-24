// =====================================================
//  PRE-TRAZOS — Escritura Cursiva 1º Grado
//  Canvas HTML5 + JS puro — sin frameworks
//  GitHub Pages / Chromebook landscape
// =====================================================

// ══════════════════════════════════════════════════
//  1. DEFINICIÓN DE LOS CINCO PRE-TRAZOS
//
//  Coordenadas normalizadas 0-1 (origen arriba-izq).
//  Cada segmento: [x0,y0, cx1,cy1, cx2,cy2, x1,y1]
//  (Bézier cúbica)
//
//  Basadas en las imágenes de referencia:
//
//  RUTI       : curva cóncava simple, izq-abajo → der-arriba
//  RUTI-BAJA  : sube exponencial izq, pico der-arriba, baja vertical
//  RUTI-SHA-B : arco suave amplio izq→der, baja vertical
//  RUTI-SHA-SHA: sube amplio der, gancho cerrado arriba-der
//  RUTI-VUELTA: arco grande izq→der-arriba, gancho cerrado abajo-der
// ══════════════════════════════════════════════════

var STROKE_DEFS = [

  // ── 1. RUTI ─────────────────────────────────────
  // Curva ascendente cóncava: empieza abajo-izquierda,
  // el primer control permanece bajo (casi horizontal),
  // el segundo control sube a media altura,
  // y termina arriba-derecha.
  // Fiel a la imagen de referencia (Bézier cúbica):
  //   inicio   = (30/320,  180/200) = (0.094, 0.900)
  //   control1 = (120/320, 190/200) = (0.375, 0.950)  ← se mantiene bajo
  //   control2 = (230/320, 120/200) = (0.719, 0.600)  ← sube a media altura
  //   fin      = (290/320,  20/200) = (0.906, 0.100)  ← arriba-derecha
  {
    id:    'ruti',
    label: 'RUTI',
    color: '#e53935',
    emoji: '🔴',
    segments: [
      // ┌─ PARÁMETROS MODIFICABLES ──────────────────────────────────────┐
      // │  [x0,    y0,    cx1,   cy1,   cx2,   cy2,   x1,    y1  ]      │
      // │   inicio         control1       control2       fin             │
      // └────────────────────────────────────────────────────────────────┘
      [0.094, 0.900,   0.375, 0.950,   0.719, 0.600,   0.906, 0.100]
    ],
    hint: 'EMPEZÁ ABAJO A LA IZQUIERDA Y SUBÍ CURVANDO HACIA LA DERECHA'
  },

  // ── 2. RUTI-BAJA ────────────────────────────────
  // Sube con curva exponencial desde abajo-izquierda
  // hasta un pico en arriba-derecha, luego baja
  // verticalmente (casi recto) hacia abajo-derecha.
  {
    id:    'ruti-baja',
    label: 'RUTI-BAJA',
    color: '#f9a825',
    emoji: '🟡',
    segments: [
      // tramo ascendente: curva exponencial izq→pico
      [0.094, 0.900,   0.375, 0.950,   0.719, 0.600,    0.65, 0.12],
      // tramo descendente: casi vertical desde pico
      [0.65, 0.12,   0.65, 0.40,   0.68, 0.70,   0.68, 0.88]
    ],
    hint: 'SUBÍ CURVANDO DESDE LA IZQUIERDA Y BAJÁ RECTO POR LA DERECHA'
  },

  // ── 3. RUTI-SHA-BAJA ────────────────────────────
  // Trazo en tres partes según la imagen de referencia:
  //
  // TRAMO 1 — Ascenso suave (Bézier cúbica):
  //   arranque casi horizontal en la base izquierda,
  //   curvatura creciente hasta el punto alto.
  //   inicio  = (0.10, 0.88)
  //   ctrl1   = (0.30, 0.88)  ← se mantiene bajo al principio
  //   ctrl2   = (0.42, 0.25)  ← sube con curvatura creciente
  //   cima    = (0.45, 0.12)
  //
  // TRAMO 2 — Gancho cerrado (Bézier cúbica):
  //   sale hacia arriba desde la cima, curva hacia la
  //   derecha y cierra bajando (arco compacto).
  //   inicio  = (0.45, 0.12)
  //   ctrl1   = (0.48, 0.05)  ← sale hacia arriba
  //   ctrl2   = (0.68, 0.05)  ← curva hacia la derecha
  //   fin     = (0.70, 0.22)  ← cierra hacia abajo
  //
  // TRAMO 3 — Bajada vertical (Bézier degenerada):
  //   x constante = 0.70; línea recta perfecta.
  //   inicio  = (0.70, 0.22)
  //   fin     = (0.70, 0.88)
  {
    id:    'ruti-sha-baja',
    label: 'RUTI-SHA-BAJA',
    color: '#7b1fa2',
    emoji: '🟣',
    segments: [
      // ┌─ TRAMO 1: ascenso suave ───────────────────────────────────────┐
      // │  [x0,   y0,    cx1,   cy1,   cx2,   cy2,   x1,    y1  ]      │
      // └───────────────────────────────────────────────────────────────┘
      [0.10, 0.88,   0.30, 0.88,   0.42, 0.25,   0.45, 0.12],

      // ┌─ TRAMO 2: gancho cerrado ──────────────────────────────────────┐
      [0.45, 0.12,   0.48, 0.05,   0.68, 0.05,   0.70, 0.22],

      // ┌─ TRAMO 3: bajada vertical (controles = extremos → línea recta)┐
      [0.70, 0.22,   0.70, 0.22,   0.70, 0.88,   0.70, 0.88]
    ],
    hint: 'SUBÍ SUAVEMENTE, HACÉ EL GANCHO Y BAJÁ RECTO'
  },

  // ── 4. RUTI-SHA-SHA ─────────────────────────────
  // Empieza abajo-izquierda, sube en amplia curva
  // hacia arriba-derecha (casi horizontal en la cima),
  // luego hace un gancho cerrado curvando hacia adentro.
  {
    id:    'ruti-sha-sha',
    label: 'RUTI-SHA-SHA',
    color: '#2e7d32',
    emoji: '🟢',
    segments: [
 // ┌─ TRAMO 1: ascenso suave ───────────────────────────────────────┐
      // │  [x0,   y0,    cx1,   cy1,   cx2,   cy2,   x1,    y1  ]      │
      // └───────────────────────────────────────────────────────────────┘
      [0.10, 0.88,   0.30, 0.88,   0.42, 0.25,   0.72, 0.22],
      // gancho final: curva cerrada hacia adentro y abajo
      [0.72, 0.22,   0.82, 0.22,   0.82, 0.42,   0.68, 0.48]
    ],
    hint: 'SUBÍ AMPLIO Y HACÉ UN GANCHO HACIA ADENTRO ARRIBA'
  },

  // ── 5. RUTI-VUELTA ──────────────────────────────
  // Trazo en dos partes: curva convexa ascendente
  // y gancho tipo "l cursiva" hacia arriba y atrás.
  //
  // TRAMO 1 — Curva convexa ascendente:
  //   Los controles se desplazan hacia abajo-derecha
  //   respecto a la diagonal, arqueando la curva hacia
  //   ese lado (convexa).
  //   inicio = (0.10, 0.88)  abajo-izquierda
  //   ctrl1  = (0.35, 0.78)  ← bajo y a la derecha
  //   ctrl2  = (0.58, 0.38)  ← bajo y a la derecha
  //   fin    = (0.62, 0.12)  pico arriba-derecha
  //
  // TRAMO 2 — Gancho tipo "l cursiva" (G1 continuo):
  //   ctrl1 alineado con ctrl2_seg1 y el punto de unión
  //   → tangente continua, unión imperceptible.
  //   sube brevemente, curva hacia la izquierda por arriba
  //   y termina bajando sin cruzar el tramo 1.
  //   ctrl1  = (0.636, 0.016) ← misma tangente, lado opuesto
  //   ctrl2  = (0.42,  0.02)  ← cierra el arco hacia la izq
  //   fin    = (0.35,  0.18)  ← baja sin cruzar la curva
  {
    id:    'ruti-vuelta',
    label: 'RUTI-VUELTA',
    color: '#1565c0',
    emoji: '🔵',
    segments: [
      // ┌─ TRAMO 1: curva convexa ascendente ───────────────────────────┐
      // │  [x0,   y0,    cx1,   cy1,   cx2,   cy2,   x1,    y1  ]     │
      // └───────────────────────────────────────────────────────────────┘
      [0.10, 0.88,   0.35, 0.78,   0.58, 0.38,   0.62, 0.12],

      // ┌─ TRAMO 2: gancho tipo l cursiva (unión G1 suave) ─────────────┐
      [0.62, 0.12,   0.636, 0.016,   0.42, 0.02,   0.35, 0.18]
    ],
    hint: 'SUBÍ CURVANDO Y HACÉ UN GANCHO HACIA ARRIBA Y ATRÁS'
  },
];

// ── Cuántas repeticiones por fila ──
var REPS = 5;

// ── Tolerancia de seguimiento (fracción del ancho del canvas) ──
// 0.10 = 10% del ancho. Generoso para niños pequeños.
var TOLERANCE_FACTOR = 0.10;

// ── Puntos muestreados sobre la curva guía ──
var GUIDE_SAMPLES = 120;

// ── Umbral mínimo de puntos OK para validar el trazo (70%) ──
var OK_THRESHOLD = 0.70;


// ══════════════════════════════════════════════════
//  2. ESTADO GLOBAL
// ══════════════════════════════════════════════════

var state = {
  strokeIdx:  0,       // índice del pre-trazo actual (0-4)
  repsDone:   0,       // repeticiones completadas en la fila
  activeRep:  0,       // repetición actualmente activa
  canvases:   [],      // elementos <canvas>
  ctxs:       [],      // contextos 2D
  guides:     [],      // puntos [{x,y}] muestreados de la guía
  drawing:    false,   // ¿el usuario está arrastrando?
  // pathSegments: array de {x,y,ok} — cada punto con su estado
  pathSegments: [],
  startOk:    false,   // ¿el drag empezó en el punto de inicio?
  // animación demostrativa
  animRafId:  null,    // requestAnimationFrame ID activo (para cancelar)
  animRunning: false,  // ¿hay animación en curso?
};


// ══════════════════════════════════════════════════
//  3. ARRANQUE
// ══════════════════════════════════════════════════

window.addEventListener('load', function() {
  buildProgressDots();
  loadStroke(0);
});

window.addEventListener('resize', function() {
  redrawAllCanvases();
});


// ══════════════════════════════════════════════════
//  4. CARGAR UN PRE-TRAZO (fila de REPS canvas)
// ══════════════════════════════════════════════════

function loadStroke(idx) {
  stopDemoAnimation();
  state.strokeIdx   = idx;
  state.repsDone    = 0;
  state.activeRep   = 0;
  state.drawing     = false;
  state.pathSegments = [];
  state.canvases    = [];
  state.ctxs        = [];
  state.guides      = [];

  var def = STROKE_DEFS[idx];

  // Instrucción
  document.getElementById('instr-icon').textContent = def.emoji;
  document.getElementById('instr-text').textContent =
    def.label + ' — ' + def.hint;

  // Progreso
  document.getElementById('prog-label').textContent =
    'TRAZO ' + (idx + 1) + ' DE ' + STROKE_DEFS.length;
  document.getElementById('prog-fill').style.width =
    (idx / STROKE_DEFS.length * 100) + '%';
  updateProgressDots(idx);

  // Construir canvas
  var row = document.getElementById('canvas-row');
  row.innerHTML = '';

  for (var i = 0; i < REPS; i++) {
    var wrapper = document.createElement('div');
    wrapper.className = 'trace-wrapper';

    var badge = document.createElement('div');
    badge.className = 'trace-badge' + (i === 0 ? ' active' : '');
    badge.id = 'badge-' + i;
    badge.textContent = i + 1;

    var canvas = document.createElement('canvas');
    canvas.className = 'trace-canvas' + (i === 0 ? ' active' : ' locked');
    canvas.id = 'cv-' + i;
    canvas.dataset.rep = i;

    wrapper.appendChild(badge);
    wrapper.appendChild(canvas);
    row.appendChild(wrapper);
    state.canvases.push(canvas);
  }

  // Ajustar dimensiones reales y computar guías
  requestAnimationFrame(function() {
    for (var j = 0; j < REPS; j++) {
      var cv = state.canvases[j];
      cv.width  = cv.offsetWidth;
      cv.height = cv.offsetHeight;
      state.ctxs.push(cv.getContext('2d'));
      state.guides.push(
        sampleGuide(def, cv.width, cv.height)
      );
    }
    redrawAllCanvases();
    attachEvents(state.canvases[0]);
  });
}


// ══════════════════════════════════════════════════
//  5. MUESTREO DE LA CURVA GUÍA (Bézier → puntos)
// ══════════════════════════════════════════════════

function sampleGuide(def, W, H) {
  var pts  = [];
  var segs = def.segments;
  var samplesPerSeg = Math.ceil(GUIDE_SAMPLES / segs.length);

  for (var s = 0; s < segs.length; s++) {
    var sg  = segs[s];
    var x0  = sg[0]*W,  y0  = sg[1]*H;
    var cx1 = sg[2]*W,  cy1 = sg[3]*H;
    var cx2 = sg[4]*W,  cy2 = sg[5]*H;
    var x1  = sg[6]*W,  y1  = sg[7]*H;

    for (var k = 0; k <= samplesPerSeg; k++) {
      var t = k / samplesPerSeg;
      pts.push(bezierPoint(t, x0,y0,cx1,cy1,cx2,cy2,x1,y1));
    }
  }
  return pts;
}

function bezierPoint(t, x0,y0,cx1,cy1,cx2,cy2,x1,y1) {
  var mt = 1 - t;
  return {
    x: mt*mt*mt*x0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x1,
    y: mt*mt*mt*y0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y1,
  };
}


// ══════════════════════════════════════════════════
//  6. DIBUJO EN CANVAS
// ══════════════════════════════════════════════════

function redrawAllCanvases() {
  for (var i = 0; i < state.canvases.length; i++) {
    var cv = state.canvases[i];
    if (cv.offsetWidth !== cv.width || cv.offsetHeight !== cv.height) {
      cv.width  = cv.offsetWidth;
      cv.height = cv.offsetHeight;
      state.guides[i] = sampleGuide(
        STROKE_DEFS[state.strokeIdx], cv.width, cv.height
      );
    }
    drawCanvas(i);
  }
}

function drawCanvas(rep) {
  var cv  = state.canvases[rep];
  var ctx = state.ctxs[rep];
  var W   = cv.width,  H = cv.height;
  var def = STROKE_DEFS[state.strokeIdx];
  var isDone   = cv.classList.contains('done');
  var isActive = rep === state.activeRep;

  ctx.clearRect(0, 0, W, H);

  // 1. Línea guía punteada
  drawGuide(ctx, def, W, H, isDone);

  // 2. Trazo del alumno (ACUMULADO, segmento a segmento verde/rojo)
  if (isActive && state.pathSegments.length > 1) {
    drawUserPath(ctx, state.pathSegments);
  }

  // 3. Trayectoria completada (canvas done): mostrar en verde permanente
  if (isDone) {
    drawCompletedOverlay(ctx, W, H, def.color);
  }

  // 4. Puntos de inicio / fin (solo en el canvas activo no terminado)
  if (isActive && !isDone) {
    drawEndpoints(ctx, state.guides[rep], W);
  }
}

// ── Guía punteada ──
function drawGuide(ctx, def, W, H, completed) {
  ctx.save();
  ctx.setLineDash([9, 7]);
  ctx.lineWidth   = Math.max(3, W * 0.022);
  ctx.strokeStyle = completed
    ? 'rgba(67,160,71,0.25)'
    : 'rgba(150,150,175,0.55)';
  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';

  for (var s = 0; s < def.segments.length; s++) {
    var sg = def.segments[s];
    ctx.beginPath();
    ctx.moveTo(sg[0]*W, sg[1]*H);
    ctx.bezierCurveTo(
      sg[2]*W, sg[3]*H,
      sg[4]*W, sg[5]*H,
      sg[6]*W, sg[7]*H
    );
    ctx.stroke();
  }
  ctx.restore();
}

// ── Trazo del alumno: colorea CADA SEGMENTO según su estado ok/err ──
// pathSegments = [{x, y, ok}]   (el primer punto no tiene color aún)
function drawUserPath(ctx, segs) {
  if (segs.length < 2) return;
  var lw = Math.max(5, ctx.canvas.width * 0.042);

  for (var i = 1; i < segs.length; i++) {
    var prev = segs[i - 1];
    var curr = segs[i];
    var ok   = curr.ok;           // color según el punto actual

    ctx.save();
    ctx.lineWidth   = lw;
    ctx.strokeStyle = ok ? '#29c46a' : '#f03e3e';
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.shadowColor = ok ? 'rgba(41,196,106,.35)' : 'rgba(240,62,62,.25)';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Superposición tenue cuando el canvas está completo ──
function drawCompletedOverlay(ctx, W, H, color) {
  ctx.save();
  ctx.font         = Math.round(Math.min(W,H) * 0.30) + 'px sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha  = 0.18;
  ctx.fillText('✓', W/2, H/2);
  ctx.restore();
}

// ── Punto de inicio (verde) y fin (naranja) ──
function drawEndpoints(ctx, guide, W) {
  if (!guide || guide.length === 0) return;
  var r  = Math.max(10, W * 0.065);
  var r2 = r * 0.62;
  var start = guide[0];
  var end   = guide[guide.length - 1];

  // Halo exterior
  ctx.save();
  ctx.beginPath();
  ctx.arc(start.x, start.y, r, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(67,160,71,0.22)';
  ctx.fill();

  // Círculo verde de inicio
  ctx.beginPath();
  ctx.arc(start.x, start.y, r2, 0, Math.PI*2);
  ctx.fillStyle = '#43a047';
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Ícono ▶
  ctx.fillStyle    = 'white';
  ctx.font         = 'bold ' + Math.round(r2 * 0.95) + 'px sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶', start.x, start.y);
  ctx.restore();

  // Círculo naranja de fin
  ctx.save();
  ctx.beginPath();
  ctx.arc(end.x, end.y, r2, 0, Math.PI*2);
  ctx.fillStyle   = '#ff7043';
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.fillStyle    = 'white';
  ctx.font         = 'bold ' + Math.round(r2 * 0.95) + 'px sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('■', end.x, end.y);
  ctx.restore();
}


// ══════════════════════════════════════════════════
//  7. ANIMACIÓN DEMOSTRATIVA
//
//  Al activarse un canvas (attachEvents), se lanza
//  una animación que muestra un punto recorriendo
//  la trayectoria guía una sola vez, siguiendo el
//  sentido correcto del trazo. Al llegar al final
//  se detiene y habilita la interacción del alumno.
//
//  Parámetros ajustables:
//    ANIM_DURATION_MS  : duración total del recorrido
//    ANIM_DOT_RADIUS   : radio del punto animado
//    ANIM_DOT_COLOR    : color del punto
//    ANIM_TRAIL_LENGTH : cuántos puntos de "estela" deja
// ══════════════════════════════════════════════════

var ANIM_DURATION_MS  = 1800;   // ms que tarda en recorrer la curva
var ANIM_DOT_RADIUS   = 0.055;  // fracción del ancho del canvas
var ANIM_DOT_COLOR    = '#e53935'; // igual que el color del trazo Ruti por defecto
var ANIM_TRAIL_LENGTH = 18;     // puntos de estela detrás del punto

function runDemoAnimation(rep) {
  // Cancelar cualquier animación previa
  stopDemoAnimation();

  var guide = state.guides[rep];
  if (!guide || guide.length === 0) return;

  var canvas = state.canvases[rep];
  var ctx    = state.ctxs[rep];
  var color  = STROKE_DEFS[state.strokeIdx].color;
  var dotR   = canvas.width * ANIM_DOT_RADIUS;
  var startTime = null;

  state.animRunning = true;

  function frame(timestamp) {
    if (!state.animRunning) return;

    if (!startTime) startTime = timestamp;
    var elapsed  = timestamp - startTime;
    var progress = Math.min(elapsed / ANIM_DURATION_MS, 1); // 0 → 1

    // Usar easing suave (ease-in-out) para que el punto
    // arranque y frene de forma natural
    var eased = easeInOut(progress);

    // Índice del punto guía correspondiente al progreso
    var ptIdx = Math.floor(eased * (guide.length - 1));
    var pt    = guide[ptIdx];

    // Redibujar el canvas base (guía + endpoints)
    drawCanvas(rep);

    // ── Estela de puntos decrecientes ──
    for (var t = ANIM_TRAIL_LENGTH; t >= 1; t--) {
      var trailIdx = Math.max(0, ptIdx - t * 2);
      var trailPt  = guide[trailIdx];
      var alpha    = (1 - t / ANIM_TRAIL_LENGTH) * 0.5;
      var trailR   = dotR * (1 - t / ANIM_TRAIL_LENGTH) * 0.7;
      ctx.save();
      ctx.beginPath();
      ctx.arc(trailPt.x, trailPt.y, trailR, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.fill();
      ctx.restore();
    }

    // ── Punto principal ──
    // Halo exterior pulsante
    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, dotR * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.20);
    ctx.fill();

    // Círculo sólido
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = hexToRgba(color, 0.5);
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.restore();

    // ── Flecha de dirección (en el punto actual) ──
    if (ptIdx < guide.length - 2) {
      var nextPt = guide[Math.min(ptIdx + 6, guide.length - 1)];
      drawArrowHead(ctx, pt, nextPt, dotR * 0.9, color);
    }

    if (progress < 1) {
      state.animRafId = requestAnimationFrame(frame);
    } else {
      // Animación terminada: redibujar limpio y habilitar al alumno
      state.animRunning = false;
      drawCanvas(rep);
    }
  }

  state.animRafId = requestAnimationFrame(frame);
}

// Detener animación en curso (si hay)
function stopDemoAnimation() {
  state.animRunning = false;
  if (state.animRafId) {
    cancelAnimationFrame(state.animRafId);
    state.animRafId = null;
  }
}

// Easing cúbico ease-in-out
function easeInOut(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Dibuja una punta de flecha en la dirección (from → to)
function drawArrowHead(ctx, from, to, size, color) {
  var angle = Math.atan2(to.y - from.y, to.x - from.x);
  var ax    = to.x - Math.cos(angle) * size;
  var ay    = to.y - Math.sin(angle) * size;

  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(size,      0);
  ctx.lineTo(-size * 0.5,  size * 0.6);
  ctx.lineTo(-size * 0.5, -size * 0.6);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.restore();
}

// Convierte hex (#rrggbb) a rgba(r,g,b,a)
function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}


// ══════════════════════════════════════════════════
//  8. EVENTOS DE MOUSE Y TOUCH
// ══════════════════════════════════════════════════

function attachEvents(canvas) {
  // Reemplazar el nodo para limpiar listeners anteriores
  var clone = canvas.cloneNode(true);
  canvas.parentNode.replaceChild(clone, canvas);
  state.canvases[state.activeRep] = clone;
  state.ctxs[state.activeRep]     = clone.getContext('2d');

  clone.width  = clone.offsetWidth;
  clone.height = clone.offsetHeight;
  state.guides[state.activeRep] = sampleGuide(
    STROKE_DEFS[state.strokeIdx], clone.width, clone.height
  );

  clone.addEventListener('mousedown',  onDown);
  clone.addEventListener('mousemove',  onMove);
  clone.addEventListener('mouseup',    onUp);
  clone.addEventListener('mouseleave', onLeave);

  clone.addEventListener('touchstart',  onTouchStart,  { passive: false });
  clone.addEventListener('touchmove',   onTouchMove,   { passive: false });
  clone.addEventListener('touchend',    onTouchEnd,    { passive: false });
  clone.addEventListener('touchcancel', onTouchCancel, { passive: false });

  drawCanvas(state.activeRep);

  // Lanzar la animación demostrativa al activar el canvas.
  // El alumno puede interrumpirla en cualquier momento
  // haciendo clic en el punto de inicio.
  runDemoAnimation(state.activeRep);
}

function getPos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width  / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  };
}
function getTouchPos(canvas, touch) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * (canvas.width  / rect.width),
    y: (touch.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

function onDown(e)  { e.preventDefault(); startDrag(this, getPos(this, e)); }
function onMove(e)  { if (!state.drawing) return; e.preventDefault(); continueDrag(this, getPos(this, e)); }
function onUp(e)    { if (!state.drawing) return; endDrag(this, getPos(this, e)); }
function onLeave(e) { if (state.drawing) cancelDrag(this); }

function onTouchStart(e)  { e.preventDefault(); if (e.touches.length === 1) startDrag(this, getTouchPos(this, e.touches[0])); }
function onTouchMove(e)   { if (!state.drawing) return; e.preventDefault(); if (e.touches.length === 1) continueDrag(this, getTouchPos(this, e.touches[0])); }
function onTouchEnd(e)    { if (!state.drawing) return; e.preventDefault(); endDrag(this, getTouchPos(this, e.changedTouches[0])); }
function onTouchCancel(e) { if (state.drawing) cancelDrag(this); }


// ══════════════════════════════════════════════════
//  8. LÓGICA DE DRAG
// ══════════════════════════════════════════════════

function startDrag(canvas, pos) {
  var guide = state.guides[state.activeRep];
  if (!guide || guide.length === 0) return;

  var startPt   = guide[0];
  var tolerance = canvas.width * TOLERANCE_FACTOR;
  var dist      = Math.hypot(pos.x - startPt.x, pos.y - startPt.y);

  if (dist > tolerance * 1.6) {
    flashWrongStart(canvas);
    return;
  }

  // Detener la animación demostrativa si sigue corriendo
  stopDemoAnimation();

  state.drawing      = true;
  state.startOk      = true;
  // Primer punto: marcado como ok (está en el inicio)
  state.pathSegments = [{ x: pos.x, y: pos.y, ok: true }];

  canvas.classList.remove('drawing-err');
  canvas.classList.add('drawing-ok');
  drawCanvas(state.activeRep);
}

function continueDrag(canvas, pos) {
  if (!state.drawing || !state.startOk) return;

  var guide     = state.guides[state.activeRep];
  var tolerance = canvas.width * TOLERANCE_FACTOR;
  var ok        = isNearGuide(pos, guide, tolerance);

  // Agregar punto con su estado ok/err
  state.pathSegments.push({ x: pos.x, y: pos.y, ok: ok });

  // Borde del canvas según el último punto
  canvas.classList.toggle('drawing-ok',  ok);
  canvas.classList.toggle('drawing-err', !ok);

  drawCanvas(state.activeRep);
}

function endDrag(canvas, pos) {
  if (!state.drawing || !state.startOk) return;
  state.drawing = false;

  var guide     = state.guides[state.activeRep];
  var tolerance = canvas.width * TOLERANCE_FACTOR;
  var endPt     = guide[guide.length - 1];
  var distEnd   = Math.hypot(pos.x - endPt.x, pos.y - endPt.y);
  var reachedEnd = distEnd <= tolerance * 2.2;

  // Contar puntos que estuvieron bien
  var okCount = 0;
  for (var i = 0; i < state.pathSegments.length; i++) {
    if (state.pathSegments[i].ok) okCount++;
  }
  var pctOk  = state.pathSegments.length > 0
    ? okCount / state.pathSegments.length : 0;
  var traceOk = pctOk >= OK_THRESHOLD;

  canvas.classList.remove('drawing-ok', 'drawing-err');

  if (reachedEnd && traceOk && state.pathSegments.length > 6) {
    completeRep(canvas);
  } else {
    // NO borramos el trazo: queda visible para que el alumno
    // vea qué salió bien (verde) y qué salió mal (rojo).
    // Solo mostramos feedback de borde y un botón implícito
    // (el alumno puede hacer clic de nuevo para reintentar).
    showFailFeedback(canvas);
  }
}

function cancelDrag(canvas) {
  state.drawing = false;
  // No borramos el trazo: queda para que el alumno vea su progreso.
  canvas.classList.remove('drawing-ok', 'drawing-err');
  drawCanvas(state.activeRep);
}


// ══════════════════════════════════════════════════
//  9. PROXIMIDAD A LA GUÍA
// ══════════════════════════════════════════════════

function isNearGuide(pt, guide, tolerance) {
  for (var i = 0; i < guide.length; i++) {
    if (Math.hypot(pt.x - guide[i].x, pt.y - guide[i].y) <= tolerance) {
      return true;
    }
  }
  return false;
}


// ══════════════════════════════════════════════════
//  10. COMPLETAR UNA REPETICIÓN
// ══════════════════════════════════════════════════

function completeRep(canvas) {
  var rep = state.activeRep;

  canvas.classList.remove('active', 'drawing-ok', 'drawing-err');
  canvas.classList.add('done');
  document.getElementById('badge-' + rep).className = 'trace-badge done';

  // Mantener el trazo verde visible y dibujar encima el overlay
  drawCanvas(rep);

  state.pathSegments = [];
  state.repsDone++;

  if (state.repsDone >= REPS) {
    setTimeout(showCongrats, 450);
  } else {
    state.activeRep++;
    var next = state.canvases[state.activeRep];
    next.classList.remove('locked');
    next.classList.add('active');
    document.getElementById('badge-' + state.activeRep).className = 'trace-badge active';
    attachEvents(next);
  }
}


// ══════════════════════════════════════════════════
//  11. FEEDBACK DE FALLO
//  El trazo NO se borra — queda verde/rojo para
//  que el alumno vea dónde estuvo bien y dónde no.
//  Se agita el borde brevemente y luego el alumno
//  puede volver a intentarlo haciendo clic en el
//  punto de inicio (el trazo anterior se limpia
//  cuando empieza un nuevo drag).
// ══════════════════════════════════════════════════

function showFailFeedback(canvas) {
  canvas.classList.add('drawing-err');
  // Dejar el trazo visible unos segundos
  setTimeout(function() {
    canvas.classList.remove('drawing-err');
    // NO limpiamos pathSegments aquí:
    // el alumno verá su trazo hasta que inicie uno nuevo.
    drawCanvas(state.activeRep);
  }, 800);
}

function flashWrongStart(canvas) {
  canvas.style.outline = '4px solid #f03e3e';
  setTimeout(function() { canvas.style.outline = ''; }, 400);
}

// Limpiar trazo anterior cuando el alumno empieza uno nuevo
// (se llama en startDrag, que ya resetea pathSegments)


// ══════════════════════════════════════════════════
//  12. FELICITACIÓN Y AVANCE
// ══════════════════════════════════════════════════

function showCongrats() {
  var overlay = document.getElementById('congrats-overlay');
  var isLast  = state.strokeIdx >= STROKE_DEFS.length - 1;

  if (isLast) {
    // ── Pantalla final: dos botones ──
    document.getElementById('congrats-emo').textContent   = '🏆';
    document.getElementById('congrats-title').textContent = '¡FELICITACIONES!';
    document.getElementById('congrats-sub').textContent   = '¡COMPLETASTE TODOS LOS PRE-TRAZOS!';

    // Ocultar el botón único y mostrar los dos botones finales
    document.getElementById('btn-next').style.display     = 'none';
    document.getElementById('btn-final-wrap').style.display = 'flex';

  } else {
    // ── Pantalla intermedia: mensaje simple, un botón ──
    document.getElementById('congrats-emo').textContent   = '🎉';
    document.getElementById('congrats-title').textContent = '¡EXCELENTE!';
    document.getElementById('congrats-sub').textContent   = 'PASEMOS AL SIGUIENTE DESAFÍO';

    document.getElementById('btn-next').style.display     = '';
    document.getElementById('btn-next').textContent       = '➡️ SIGUIENTE';
    document.getElementById('btn-next').onclick           = nextStroke;
    document.getElementById('btn-final-wrap').style.display = 'none';
  }

  overlay.classList.remove('hidden');
}

function nextStroke() {
  document.getElementById('congrats-overlay').classList.add('hidden');
  var next = state.strokeIdx + 1;
  if (next < STROKE_DEFS.length) {
    document.getElementById('prog-fill').style.width =
      (next / STROKE_DEFS.length * 100) + '%';
    updateProgressDots(next);
    loadStroke(next);
  }
}

// Reinicia completamente desde el primer trazo
function volverAJugar() {
  document.getElementById('congrats-overlay').classList.add('hidden');
  document.getElementById('prog-fill').style.width = '0%';
  updateProgressDots(0);
  loadStroke(0);
}


// ══════════════════════════════════════════════════
//  13. REINTENTAR FILA ACTUAL
// ══════════════════════════════════════════════════

function retryRow() {
  document.getElementById('congrats-overlay').classList.add('hidden');
  loadStroke(state.strokeIdx);
}


// ══════════════════════════════════════════════════
//  14. BARRA DE PROGRESO
// ══════════════════════════════════════════════════

function buildProgressDots() {
  var container = document.getElementById('prog-dots');
  container.innerHTML = '';
  for (var i = 0; i < STROKE_DEFS.length; i++) {
    var dot = document.createElement('div');
    dot.className = 'prog-dot' + (i === 0 ? ' active' : '');
    dot.id    = 'dot-' + i;
    dot.title = STROKE_DEFS[i].label;
    container.appendChild(dot);
  }
}

function updateProgressDots(activeIdx) {
  for (var i = 0; i < STROKE_DEFS.length; i++) {
    var dot = document.getElementById('dot-' + i);
    if (!dot) continue;
    dot.className = 'prog-dot';
    if (i < activeIdx)        dot.classList.add('done');
    else if (i === activeIdx) dot.classList.add('active');
  }
}
