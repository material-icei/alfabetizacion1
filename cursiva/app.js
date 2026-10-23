/* ============================================================
   ¡Jugamos con la cursiva! — Lógica de la aplicación
   Módulos: Almacen (progreso local) · Navegación · Lienzo (dibujo táctil)
            · Guías y modelos · Juegos · Recompensas · Pantallas de progreso
   Para agregar contenido (palabras, medallas, mensajes) editar data.js.
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const FUENTE = "PlaywriteAR";
  const COLORES_LAPIZ = [
    { c: "#1f3352", n: "Azul" }, { c: "#7e57c2", n: "Violeta" },
    { c: "#00897b", n: "Verde agua" }, { c: "#e64a19", n: "Naranja" }
  ];
  const NOMBRE_JUEGO = {
    una: "Practico una letra", recorro: "Recorro el abecedario", par: "Mayúscula y minúscula",
    copio: "Copio la letra", desafio: "Desafío de letras", palabras: "Palabras sencillas"
  };
  const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const letraDe = (base, caso) => (caso === "may" ? base : base.toLowerCase());

  /* ==========================================================
     ALMACÉN — progreso guardado sólo en este dispositivo
     ========================================================== */
  const CLAVE = "cursiva_progreso_v1";
  const vacio = () => ({
    v: 1, estrellas: 0, letras: { may: {}, min: {} }, quiero: { may: [], min: [] },
    palabras: {}, pares: 0, medallas: [],
    pref: { escritura: "guiado", tipo: "min", color: 0 }
  });
  function cargar() {
    try {
      const t = localStorage.getItem(CLAVE);
      if (t) {
        const o = JSON.parse(t), base = vacio();
        return Object.assign(base, o, {
          letras: Object.assign(base.letras, o.letras || {}),
          quiero: Object.assign(base.quiero, o.quiero || {}),
          pref: Object.assign(base.pref, o.pref || {})
        });
      }
    } catch (e) { /* sin almacenamiento: se juega igual */ }
    return vacio();
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(P)); } catch (e) { } }
  let P = cargar();

  function estadisticas() {
    const may = Object.keys(P.letras.may).length, min = Object.keys(P.letras.min).length;
    return { may, min, letrasTotal: may + min, estrellas: P.estrellas, pares: P.pares, palabras: Object.keys(P.palabras).length };
  }

  /* ==========================================================
     NAVEGACIÓN
     ========================================================== */
  let actual = "inicio";
  const alEntrar = {};
  function ir(id) {
    detenerAnimacion();
    $$(".pantalla").forEach((s) => s.classList.toggle("activa", s.id === id));
    actual = id;
    refrescarComunes();
    if (alEntrar[id]) alEntrar[id]();
  }

  function refrescarComunes() {
    $$(".contador-estrellas").forEach((e) => (e.textContent = "⭐ " + P.estrellas));
    $$(".selector-tipo").forEach(pintarSelectorTipo);
    $$("[data-modo-escritura]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.modoEscritura === P.pref.escritura)));
  }

  function pintarSelectorTipo(cont) {
    if (!cont.children.length) {
      cont.innerHTML =
        '<button role="radio" data-set-tipo="may"><span class="cursiva">A</span>Mayúscula</button>' +
        '<button role="radio" data-set-tipo="min"><span class="cursiva">a</span>Minúscula</button>';
    }
    $$("button", cont).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.setTipo === P.pref.tipo)));
  }

  function cambiarTipo(tipo) {
    if (P.pref.tipo === tipo) return;
    P.pref.tipo = tipo; guardar(); refrescarComunes();
    if (actual === "abc") pintarAbecedario();
    if (actual === "album") pintarAlbum();
    if (actual === "practica" && J.juego !== "par" && J.juego !== "palabras") recargar();
  }

  /* ==========================================================
     ESTADO DEL JUEGO ACTUAL
     ========================================================== */
  const J = { juego: "una", idx: 0, parPaso: 0, palabra: 0 };

  function objetivo() {
    if (J.juego === "palabras") {
      return { texto: PALABRAS[J.palabra].palabra, palabra: true, caso: "min", trazos: null };
    }
    const caso = J.juego === "par" ? (J.parPaso === 0 ? "may" : "min") : P.pref.tipo;
    const base = ABECEDARIO[J.idx];
    const texto = letraDe(base, caso);
    return { texto, base, caso, trazos: TRAZOS[texto] || null, palabra: false };
  }

  /* ==========================================================
     LIENZOS
     ========================================================== */
  const lienzo = $("#lienzo");
  const cG = $("#canvas-guias"), cD = $("#canvas-dibujo"), cM = $("#canvas-modelo");
  const gG = cG.getContext("2d");
  const gD = cD.getContext("2d", { desynchronized: true });
  const gM = cM.getContext("2d");
  let W = 0, H = 0, DPR = 1;

  function ajustarCanvas(cv, ctx) {
    const r = cv.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = Math.max(1, Math.round(r.width * DPR));
    cv.height = Math.max(1, Math.round(r.height * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return r;
  }
  function ajustarTodo() {
    if (actual !== "practica") return;
    const r = ajustarCanvas(cG, gG); ajustarCanvas(cD, gD);
    W = r.width; H = r.height;
    ajustarCanvas(cM, gM);
    calcularDisposicion();
    redibujarGuias();
    redibujarDibujo();
    dibujarModeloLateral();
  }
  const ro = new ResizeObserver(() => requestAnimationFrame(ajustarTodo));
  ro.observe(lienzo); ro.observe($("#tarjeta-modelo"));
  window.addEventListener("resize", () => requestAnimationFrame(ajustarTodo));

  /* ---------- Geometría de letras ---------- */
  const INF = -650;                            // margen inferior en unidades em
  const supDe = (caja) => (caja && caja.y1 > 1120 ? 1330 : 1160);   // más espacio arriba sólo si hay tilde (Ñ)
  const L_ALTA = 1060, L_MEDIA = 500, L_BASE = 0, L_BAJA = -560;

  function cajaTrazos(trazos) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    trazos.forEach((t) => t.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
    return { x0, x1, y0, y1 };
  }
  function medirTexto(texto, k) {
    gG.font = `${1000 * k}px ${FUENTE}`;
    return gG.measureText(texto).width / k;    // ancho en em
  }

  // Disposición: lista de "renglones" y "casilleros"
  let D = null;
  function calcularDisposicion() {
    const o = objetivo();
    D = { renglones: [], casilleros: [] };
    if (o.palabra) {
      const SUP = supDe(null);
      let k = (H * 0.47) / (SUP - INF);
      const ancho = medirTexto(o.texto, k);
      k = Math.min(k, (W * 0.86) / (ancho + 200));
      const alto = (SUP - INF) * k, sep = (H - 2 * alto) / 3;
      for (let i = 0; i < 2; i++) {
        const top = sep + i * (alto + sep);
        D.renglones.push({ k, base: top + SUP * k });
      }
      const ox = W / 2 - (ancho / 2) * k;
      D.casilleros.push({ rol: "modelo", k, base: D.renglones[0].base, ox, ancho });
      D.casilleros.push({ rol: "escribir", k, base: D.renglones[1].base, ox, ancho });
      return;
    }
    const caja = o.trazos ? cajaTrazos(o.trazos) : { x0: 0, x1: 700, y0: 0, y1: 500 };
    const anchoL = caja.x1 - caja.x0;
    const SUP = supDe(caja);
    let k = (H * 0.96) / (SUP - INF);
    const dos = J.juego === "copio";
    const anchoDisp = dos ? W * 0.42 : W * 0.8;
    k = Math.min(k, anchoDisp / (anchoL + 160));
    const base = (H - (SUP - INF) * k) / 2 + SUP * k;
    D.renglones.push({ k, base });
    const centros = dos ? [W * 0.27, W * 0.73] : [W / 2];
    centros.forEach((cx, i) => {
      D.casilleros.push({
        rol: dos && i === 0 ? "modelo" : "escribir", k, base,
        ox: cx - ((caja.x0 + caja.x1) / 2) * k, caja
      });
    });
  }
  const aPx = (cas, x, y) => [cas.ox + x * cas.k, cas.base - y * cas.k];

  /* ---------- Letra modelo (fuente + entrada desde el renglón, o forma dibujada) ---------- */
  const GROSOR_FUENTE = 86;                    // grosor del trazo de la fuente, en unidades em
  const capa = document.createElement("canvas");
  const entradaDe = (t) => (typeof ENTRADAS !== "undefined" && ENTRADAS[t]) || null;
  const formaDe = (t) => (typeof FORMAS !== "undefined" && FORMAS[t]) || null;
  const margenEntrada = (t) => { const e = entradaDe(t); return e ? Math.max(0, -Math.min(...e.map((p) => p[0]))) : 0; };
  const anchoForma = (f) => Math.max(...f.flat().map((p) => p[0])) + 60;
  function anchoLetra(ctx, t, k) {             // ancho en unidades em
    const f = formaDe(t);
    if (f) return anchoForma(f);
    ctx.font = `${1000 * k}px ${FUENTE}`;
    return ctx.measureText(t).width / k + margenEntrada(t);
  }
  function lineas(c, lista, x, base, k) {
    c.lineWidth = GROSOR_FUENTE * k; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath();
    lista.forEach((l) => l.forEach(([ex, ey], i) => (i ? c.lineTo(x + ex * k, base - ey * k) : c.moveTo(x + ex * k, base - ey * k))));
    c.stroke();
  }
  function pintarLetra(ctx, t, x, base, k, color, alfa = 1) {
    const f = formaDe(t), e = entradaDe(t);
    const dibujar = (c) => {
      c.fillStyle = color; c.strokeStyle = color;
      if (f) { lineas(c, f, x, base, k); return; }
      c.font = `${1000 * k}px ${FUENTE}`; c.fillText(t, x, base);
      if (e) lineas(c, [e], x, base, k);
    };
    if (!(e || f) || alfa >= 1) { ctx.save(); ctx.globalAlpha = alfa; dibujar(ctx); ctx.restore(); return; }
    // con transparencia: se dibuja opaco en una capa aparte para que los cruces no queden más oscuros
    if (capa.width !== ctx.canvas.width || capa.height !== ctx.canvas.height) { capa.width = ctx.canvas.width; capa.height = ctx.canvas.height; }
    const c = capa.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, capa.width, capa.height); c.setTransform(ctx.getTransform());
    dibujar(c);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alfa; ctx.drawImage(capa, 0, 0); ctx.restore();
  }

  /* Letra para usar en botones y tarjetas (HTML): texto con la fuente, o SVG si es una forma dibujada */
  function letraHTML(texto) {
    return Array.from(texto).map((t) => {
      const f = formaDe(t);
      if (!f) return t;
      const w = anchoForma(f) + 60;
      const d = f.map((l) => "M" + l.map(([x, y]) => `${x} ${-y}`).join("L")).join("");
      return `<svg class="letra-svg" viewBox="-60 -1200 ${w} 1500" style="width:${(w / 1000).toFixed(2)}em" aria-label="${t}" role="img"><path d="${d}" fill="none" stroke="currentColor" stroke-width="${GROSOR_FUENTE}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }).join("");
  }

  /* ---------- Guías (renglones) ---------- */
  function dibujarRenglon(ctx, k, base, x0, x1) {
    const y = (v) => base - v * k;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#9fc6e6"; ctx.lineWidth = Math.max(1.5, 5 * k);
    ctx.beginPath(); ctx.moveTo(x0, y(L_ALTA)); ctx.lineTo(x1, y(L_ALTA)); ctx.stroke();
    ctx.strokeStyle = "#c7dcee"; ctx.setLineDash([2, 0]);
    ctx.beginPath(); ctx.moveTo(x0, y(L_BAJA)); ctx.lineTo(x1, y(L_BAJA)); ctx.stroke();
    ctx.strokeStyle = "#f2a99b"; ctx.lineWidth = Math.max(1.5, 5 * k); ctx.setLineDash([12 * k * 3, 10 * k * 3]);
    ctx.beginPath(); ctx.moveTo(x0, y(L_MEDIA)); ctx.lineTo(x1, y(L_MEDIA)); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = "#3d7cc9"; ctx.lineWidth = Math.max(2.5, 8 * k);
    ctx.beginPath(); ctx.moveTo(x0, y(L_BASE)); ctx.lineTo(x1, y(L_BASE)); ctx.stroke();
    ctx.restore();
  }

  function zonaDeLetra(caja) {
    const arriba = caja.y1 > 700 ? L_ALTA : L_MEDIA;
    const abajo = caja.y0 < -200 ? L_BAJA : L_BASE;
    return [abajo, arriba];
  }

  function rectRedondeado(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // Estado de ayudas visuales
  const V = { paso: "solo", verModelo: false, lateralVisible: true, animando: null, progresoAnim: null };

  function redibujarGuias(progreso) {
    if (!D) return;
    const ctx = gG, o = objetivo();
    ctx.clearRect(0, 0, W, H);
    // Zona de la letra (guía de tamaño y ubicación)
    if (!o.palabra && o.trazos) {
      D.casilleros.forEach((cas) => {
        const [a, b] = zonaDeLetra(cas.caja);
        const [x0, yTop] = aPx(cas, cas.caja.x0 - 90, b), [x1, yBot] = aPx(cas, cas.caja.x1 + 90, a);
        ctx.fillStyle = cas.rol === "modelo" ? "rgba(79,195,247,0.10)" : "rgba(255,213,79,0.20)";
        rectRedondeado(ctx, x0, yTop, x1 - x0, yBot - yTop, 14);
        ctx.fill();
        if (J.juego === "copio" && cas.rol === "escribir") {
          ctx.save(); ctx.setLineDash([10, 9]); ctx.strokeStyle = "#ffb300"; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
          ctx.fillStyle = "#b07d00"; ctx.font = `700 ${Math.max(14, H * 0.04)}px Nunito, sans-serif`; ctx.textAlign = "center";
          ctx.fillText("✍️ ¡Escribila acá!", (x0 + x1) / 2, yTop - H * 0.02);
          ctx.textAlign = "start";
        }
      });
    }
    D.renglones.forEach((r) => dibujarRenglon(ctx, r.k, r.base, W * 0.02, W * 0.98));

    D.casilleros.forEach((cas) => {
      const esModelo = cas.rol === "modelo";
      // Modelo fijo (copio / palabras)
      if (esModelo && V.verModelo) {
        pintarLetra(ctx, o.texto, cas.ox, cas.base, cas.k, "#1f3352");
      }
      if (esModelo && !V.verModelo) {
        ctx.fillStyle = "#90a4ae"; ctx.font = `700 ${Math.max(14, H * 0.045)}px Nunito, sans-serif`; ctx.textAlign = "center";
        const cx = o.palabra ? W / 2 : cas.ox + ((cas.caja.x0 + cas.caja.x1) / 2) * cas.k;
        ctx.fillText("🙈 ¿Te acordás cómo era?", cx, cas.base - 300 * cas.k); ctx.textAlign = "start";
      }
      // Sombra del modelo para repasar
      const modeloAparte = J.juego === "copio" || o.palabra;   // el modelo está en otro casillero
      if (!esModelo && ((V.verModelo && !modeloAparte) || (o.palabra && V.paso === "repasar"))) {
        pintarLetra(ctx, o.texto, cas.ox, cas.base, cas.k, "#7e57c2", o.palabra && V.paso === "repasar" ? 0.2 : 0.16);
      }
      // Animación / punteado
      if (o.trazos && (esModelo || J.juego !== "copio")) {
        if (V.paso === "mirar" && progreso != null) dibujarAnimacion(ctx, cas, o.trazos, progreso);
        else if (V.paso === "repasar" && !esModelo) dibujarPunteado(ctx, cas, o.trazos);
      }
    });
  }

  /* ---------- Trazado de referencia ---------- */
  function trazarSuave(ctx, pts) {
    if (pts.length === 1) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[0][0] + 0.1, pts[0][1]); return; }
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const u = pts[pts.length - 1]; ctx.lineTo(u[0], u[1]);
  }
  function longitudes(t) {
    const L = [0];
    for (let i = 1; i < t.length; i++) L.push(L[i - 1] + Math.hypot(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1]));
    return L;
  }
  function insignia(ctx, x, y, r, n, color) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.18); ctx.strokeStyle = "#fff"; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `800 ${r * 1.25}px Nunito, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(n), x, y + r * 0.05); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  }
  function flecha(ctx, x, y, ang, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(-s, -s * 0.75); ctx.lineTo(s * 0.3, 0); ctx.lineTo(-s, s * 0.75);
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.42; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); ctx.restore();
  }
  function esPunto(t) { return t.length === 2 && Math.hypot(t[0][0] - t[1][0], t[0][1] - t[1][1]) < 40; }

  function dibujarPunteado(ctx, cas, trazos) {
    const k = cas.k, lw = Math.max(5, 40 * k);
    trazos.forEach((t, i) => {
      const pts = t.map(([x, y]) => aPx(cas, x, y));
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (esPunto(t)) {
        ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], lw * 0.9, 0, Math.PI * 2); ctx.fillStyle = "rgba(126,87,194,0.55)"; ctx.fill();
      } else {
        ctx.setLineDash([0.1, lw * 2.1]); ctx.lineWidth = lw; ctx.strokeStyle = "rgba(126,87,194,0.55)";
        ctx.beginPath(); trazarSuave(ctx, pts); ctx.stroke(); ctx.setLineDash([]);
        // flechas de sentido
        const L = longitudes(t), paso = 300; let sig = 170 + 130 * i;   // desfasado por trazo para que no se encimen
        for (let j = 1; j < t.length; j++) {
          while (L[j] >= sig && sig < L[L.length - 1] - 60) {
            const f = (sig - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]);
            const x = t[j - 1][0] + (t[j][0] - t[j - 1][0]) * f, y = t[j - 1][1] + (t[j][1] - t[j - 1][1]) * f;
            const [px, py] = aPx(cas, x, y);
            const ang = Math.atan2(-(t[j][1] - t[j - 1][1]), t[j][0] - t[j - 1][0]);
            flecha(ctx, px, py, ang, lw * 0.9, "#5e35b1");
            sig += paso;
          }
        }
      }
      ctx.restore();
      insignia(ctx, pts[0][0], pts[0][1], Math.max(10, lw * 1.05), i + 1, "#2e9e44");
    });
  }

  function dibujarAnimacion(ctx, cas, trazos, prog) {
    // prog: { trazo, dist }
    const k = cas.k, lw = Math.max(6, 46 * k);
    // modelo tenue de fondo
    pintarLetra(ctx, objetivo().texto, cas.ox, cas.base, k, "#1f3352", 0.07);
    let punta = null;
    for (let i = 0; i <= Math.min(prog.trazo, trazos.length - 1); i++) {
      const t = trazos[i], L = longitudes(t), tot = L[L.length - 1];
      const d = i < prog.trazo ? tot : prog.dist;
      const pts = [];
      for (let j = 0; j < t.length; j++) {
        if (L[j] <= d) pts.push(t[j]);
        else {
          const f = (d - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]);
          pts.push([t[j - 1][0] + (t[j][0] - t[j - 1][0]) * f, t[j - 1][1] + (t[j][1] - t[j - 1][1]) * f]);
          break;
        }
      }
      const pp = pts.map(([x, y]) => aPx(cas, x, y));
      ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = lw; ctx.strokeStyle = "#7e57c2";
      if (esPunto(t)) { ctx.beginPath(); ctx.arc(pp[0][0], pp[0][1], lw * 0.8, 0, Math.PI * 2); ctx.fillStyle = "#7e57c2"; ctx.fill(); }
      else { ctx.beginPath(); trazarSuave(ctx, pp); ctx.stroke(); }
      ctx.restore();
      const p0 = aPx(cas, t[0][0], t[0][1]);
      insignia(ctx, p0[0], p0[1], Math.max(10, lw * 0.95), i + 1, "#2e9e44");
      if (i === prog.trazo) punta = pp[pp.length - 1];
    }
    if (punta) {
      ctx.beginPath(); ctx.arc(punta[0], punta[1], lw * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = "#ff7043"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.stroke();
    }
  }

  /* ---------- Animación "Mirar" ---------- */
  function detenerAnimacion() { if (V.animando) { cancelAnimationFrame(V.animando.raf); clearTimeout(V.animando.to); V.animando = null; } }

  function animar() {
    detenerAnimacion();
    const o = objetivo();
    if (!o.trazos || !D) return;
    const tr = o.trazos, tot = tr.map((t) => { const L = longitudes(t); return L[L.length - 1]; });
    const velocidad = 900;                         // unidades em por segundo
    const A = { raf: 0, to: 0, trazo: 0, t0: performance.now() };
    V.animando = A;
    mostrarGlobo("👀 Mirá cómo se escribe");
    const cuadro = (ahora) => {
      if (V.animando !== A) return;
      const d = Math.max(0, ((ahora - A.t0) / 1000) * velocidad);
      if (d >= tot[A.trazo]) {
        redibujarGuias({ trazo: A.trazo, dist: tot[A.trazo] });
        if (A.trazo >= tr.length - 1) {
          A.to = setTimeout(() => {
            if (V.animando !== A) return;
            V.animando = null;
            if (J.juego === "copio") { V.paso = "solo"; redibujarGuias(); mostrarGlobo("✍️ ¡Ahora escribila en el cuadro!"); }
            else { elegirPaso("repasar"); mostrarGlobo("☝️ ¡Ahora seguí los puntitos!"); }
          }, 700);
          return;
        }
        A.to = setTimeout(() => { if (V.animando !== A) return; A.trazo++; A.t0 = performance.now(); A.raf = requestAnimationFrame(cuadro); }, 380);
        return;
      }
      redibujarGuias({ trazo: A.trazo, dist: d });
      A.raf = requestAnimationFrame(cuadro);
    };
    A.raf = requestAnimationFrame(cuadro);
  }

  /* ---------- Globo de ayuda ---------- */
  let globoTO = 0;
  function mostrarGlobo(txt, ms = 2600) {
    const g = $("#globo-ayuda"); g.textContent = txt; g.classList.add("visible");
    clearTimeout(globoTO); globoTO = setTimeout(() => g.classList.remove("visible"), ms);
  }

  /* ==========================================================
     DIBUJO TÁCTIL
     ========================================================== */
  // Trazos del alumno en coordenadas independientes del tamaño: u=(x-W/2)/H, v=y/H
  let trazosAlumno = [];
  let activo = null, trazoActual = null;
  const grosor = () => Math.max(6, H * 0.024 * (objetivo().palabra ? 0.75 : 1));
  const aU = (x, y) => [(x - W / 2) / H, y / H];
  const dePU = ([u, v]) => [u * H + W / 2, v * H];

  function puntoEvento(e) {
    const r = cD.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function estilo(ctx, color) {
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = grosor();
  }
  function pintarTrazoCompleto(t) {
    const pts = t.pts.map(dePU);
    estilo(gD, t.color);
    if (pts.length === 1) { gD.beginPath(); gD.arc(pts[0][0], pts[0][1], grosor() / 2, 0, Math.PI * 2); gD.fill(); return; }
    gD.beginPath(); trazarSuave(gD, pts); gD.stroke();
  }
  function redibujarDibujo() {
    gD.clearRect(0, 0, W, H);
    trazosAlumno.forEach(pintarTrazoCompleto);
  }
  function segmentoNuevo(t) {
    const p = t.pts, n = p.length;
    if (n < 2) return;
    const a = dePU(p[Math.max(0, n - 3)]), b = dePU(p[n - 2]), c = dePU(p[n - 1]);
    const m1 = n >= 3 ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : b;
    const m2 = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    estilo(gD, t.color);
    gD.beginPath(); gD.moveTo(m1[0], m1[1]);
    if (n >= 3) gD.quadraticCurveTo(b[0], b[1], m2[0], m2[1]); else gD.lineTo(m2[0], m2[1]);
    gD.stroke();
  }

  cD.addEventListener("pointerdown", (e) => {
    if (activo !== null) return;                       // un solo dedo a la vez (ignora la palma)
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    activo = e.pointerId;
    try { cD.setPointerCapture(e.pointerId); } catch (_) { }
    if (V.paso === "mirar" && V.animando) {           // si empieza a dibujar, pasamos a repasar
      detenerAnimacion();
      if (J.juego === "copio") { V.paso = "solo"; redibujarGuias(); } else elegirPaso("repasar");
    }
    const [x, y] = puntoEvento(e);
    trazoActual = { color: COLORES_LAPIZ[P.pref.color].c, pts: [aU(x, y)] };
    trazosAlumno.push(trazoActual);
    estilo(gD, trazoActual.color);
    gD.beginPath(); gD.arc(x, y, grosor() / 2, 0, Math.PI * 2); gD.fill();
    $("#globo-ayuda").classList.remove("visible");
  }, { passive: false });

  cD.addEventListener("pointermove", (e) => {
    if (e.pointerId !== activo || !trazoActual) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (evs.length ? evs : [e]).forEach((ev) => {
      const [x, y] = puntoEvento(ev);
      const ult = dePU(trazoActual.pts[trazoActual.pts.length - 1]);
      if (Math.hypot(x - ult[0], y - ult[1]) < 1.2) return;
      trazoActual.pts.push(aU(x, y));
      segmentoNuevo(trazoActual);
    });
  }, { passive: false });

  function finTrazo(e) {
    if (e.pointerId !== activo) return;
    if (trazoActual && trazoActual.pts.length >= 2) {
      // cerrar el último tramo
      const pts = trazoActual.pts.map(dePU), u = pts[pts.length - 1], a = pts[pts.length - 2];
      estilo(gD, trazoActual.color); gD.beginPath(); gD.moveTo((a[0] + u[0]) / 2, (a[1] + u[1]) / 2); gD.lineTo(u[0], u[1]); gD.stroke();
    }
    activo = null; trazoActual = null;
  }
  cD.addEventListener("pointerup", finTrazo);
  cD.addEventListener("pointercancel", finTrazo);
  cD.addEventListener("lostpointercapture", finTrazo);
  cD.addEventListener("contextmenu", (e) => e.preventDefault());

  // Bloquear zoom, desplazamiento y gestos del navegador mientras se juega
  document.addEventListener("touchmove", (e) => { if (e.touches.length > 1 || e.target === cD) e.preventDefault(); }, { passive: false });
  document.addEventListener("touchstart", (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  ["gesturestart", "gesturechange", "gestureend"].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault()));
  document.addEventListener("wheel", (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  document.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) e.preventDefault(); });
  document.addEventListener("dblclick", (e) => e.preventDefault());

  function tinta() {
    let L = 0;
    trazosAlumno.forEach((t) => { for (let i = 1; i < t.pts.length; i++) L += Math.hypot(t.pts[i][0] - t.pts[i - 1][0], t.pts[i][1] - t.pts[i - 1][1]); });
    return L * H;
  }
  function borrarDibujo() { trazosAlumno = []; activo = null; trazoActual = null; redibujarDibujo(); }

  /* ==========================================================
     PANTALLA DE PRÁCTICA
     ========================================================== */
  function elegirPaso(p) {
    detenerAnimacion();
    V.paso = p;
    $$("#pasos-guiado button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.paso === p)));
    if (p === "mirar") { redibujarGuias({ trazo: 0, dist: 0 }); animar(); }
    else {
      redibujarGuias();
      if (p === "solo") mostrarGlobo(objetivo().palabra ? "✍️ ¡Ahora sin ayuda!" : "✍️ ¡Ahora escribila sin ayuda!");
    }
  }

  function iniciarAyudas() {
    const o = objetivo(), guiado = P.pref.escritura === "guiado";
    const pasos = $("#pasos-guiado");
    const sinPasos = !guiado || J.juego === "copio";
    pasos.classList.toggle("oculto", sinPasos);
    $('[data-paso="mirar"]', pasos).hidden = !o.trazos;
    V.verModelo = J.juego === "copio" || o.palabra;    // en copio y palabras el modelo está a la vista
    $("#btn-modelo").setAttribute("aria-pressed", String(V.verModelo));
    $("#btn-modelo span").textContent = V.verModelo ? "Ocultar modelo" : "Ver modelo";
    if (!guiado) { V.paso = "solo"; redibujarGuias(); return; }
    if (J.juego === "copio") { V.paso = "mirar"; animar(); return; }
    elegirPaso(o.trazos ? "mirar" : "repasar");
  }

  function prepararPractica() {
    detenerAnimacion();
    borrarDibujo();
    const o = objetivo();
    // Cabecera
    $("#p-juego").textContent = NOMBRE_JUEGO[J.juego];
    let paso = "";
    if (J.juego === "recorro") paso = `Letra ${J.idx + 1} de ${ABECEDARIO.length}`;
    else if (J.juego === "par") paso = J.parPaso === 0 ? "Paso 1 de 2 · la MAYÚSCULA" : "Paso 2 de 2 · la minúscula";
    else if (J.juego === "copio") paso = "Mirá el modelo y escribilo al lado";
    else if (J.juego === "desafio") paso = "🎲 ¡Letra sorpresa!";
    else if (J.juego === "palabras") paso = "Copiá la palabra en el renglón de abajo";
    else paso = o.caso === "may" ? "Cursiva mayúscula" : "Cursiva minúscula";
    $("#p-paso").textContent = paso;
    $("#p-volver").textContent = o.palabra ? "◀ Palabras" : "◀ Abecedario";
    $("#p-selector-tipo").style.display = J.juego === "par" || o.palabra ? "none" : "";
    // Etiqueta del modelo
    const et = $("#etiqueta-caso");
    et.textContent = o.palabra ? "palabra" : o.caso === "may" ? "MAYÚSCULA" : "minúscula";
    et.classList.toggle("min", o.caso === "min");
    // Navegación
    const desafio = J.juego === "desafio";
    $(".p-nav").style.display = desafio ? "none" : "";
    $("#btn-dado").classList.toggle("visible", desafio);
    $("#btn-siguiente span").textContent = J.juego === "recorro" ? "Saltear" : "Siguiente";
    // Quiero practicarla más
    const q = $("#btn-quiero");
    q.style.display = o.palabra ? "none" : "";
    if (!o.palabra) {
      const marcado = P.quiero[o.caso].includes(o.base);
      q.setAttribute("aria-pressed", String(marcado));
      q.textContent = marcado ? "❤️ Quiero practicarla más" : "🤍 Quiero practicarla más";
    }
    pintarColores();
  }

  function recargar() { prepararPractica(); ajustarTodo(); iniciarAyudas(); }
  function abrirPractica() { ir("practica"); recargar(); }

  /* ---------- Modelo lateral ---------- */
  function dibujarModeloLateral() {
    const r = cM.getBoundingClientRect(), w = r.width, h = r.height;
    if (!w || !h) return;
    gM.clearRect(0, 0, w, h);
    const o = objetivo();
    const items = J.juego === "par"
      ? [{ t: ABECEDARIO[J.idx], on: J.parPaso === 0 }, { t: ABECEDARIO[J.idx].toLowerCase(), on: J.parPaso === 1 }]
      : [{ t: o.texto, on: true }];
    const SUP = supDe(o.trazos ? cajaTrazos(o.trazos) : null);
    let k = (h * 0.9) / (SUP - INF);
    const anchos = items.map((it) => anchoLetra(gM, it.t, k));
    const total = anchos.reduce((a, b) => a + b, 0) + 300 * (items.length - 1);
    k = Math.min(k, (w * 0.9) / (total + 100));
    const base = (h - (SUP - INF) * k) / 2 + SUP * k;
    dibujarRenglon(gM, k, base, w * 0.03, w * 0.97);
    let x = w / 2 - (total / 2) * k;
    items.forEach((it, i) => {
      pintarLetra(gM, it.t, x + margenEntrada(it.t) * k, base, k, "#1f3352", it.on ? 1 : 0.3);
      x += (anchos[i] + 300) * k;
    });
    if (o.palabra) {
      gM.font = `${h * 0.16}px sans-serif`; gM.textAlign = "center";
      gM.fillText(PALABRAS[J.palabra].emoji, w / 2, h * 0.2); gM.textAlign = "start";
    }
  }

  /* ---------- Colores del lápiz ---------- */
  function pintarColores() {
    const c = $(".colores");
    if (!c.children.length) {
      c.innerHTML = COLORES_LAPIZ.map((x, i) => `<button role="radio" data-color="${i}" aria-label="Lápiz ${x.n}" style="background:${x.c}"></button>`).join("");
    }
    $$("button", c).forEach((b) => b.setAttribute("aria-checked", String(Number(b.dataset.color) === P.pref.color)));
  }

  /* ==========================================================
     RECOMPENSAS
     ========================================================== */
  function registrarLogro() {
    const o = objetivo(), extra = [];
    P.estrellas += 1;
    if (o.palabra) {
      P.palabras[o.texto] = (P.palabras[o.texto] || 0) + 1;
    } else {
      const reg = P.letras[o.caso][o.base];
      if (!reg) extra.push("📒 ¡Nueva figurita en tu álbum!");
      P.letras[o.caso][o.base] = { n: (reg ? reg.n : 0) + 1 };
      if (J.juego === "par" && J.parPaso === 1) P.pares += 1;
    }
    const e = estadisticas();
    MEDALLAS.forEach((m) => {
      if (!P.medallas.includes(m.id) && m.cumple(e)) { P.medallas.push(m.id); extra.unshift(`${m.icono} ¡Ganaste la medalla «${m.nombre}»!`); }
    });
    guardar();
    return extra;
  }

  function confeti() {
    const c = $("#confeti"); c.innerHTML = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const col = ["#4fc3f7", "#26c6da", "#ffd54f", "#66bb6a", "#ff8a65", "#9575cd"];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = col[i % col.length];
      p.style.animationDelay = Math.random() * 0.5 + "s";
      p.style.animationDuration = 1.4 + Math.random() * 0.9 + "s";
      c.appendChild(p);
    }
  }

  function festejar(extra) {
    const o = objetivo();
    const parIntermedio = J.juego === "par" && J.parPaso === 0;
    $("#festejo-msg").textContent = parIntermedio ? "¡Muy bien! Ahora la minúscula" : azar(MENSAJES);
    $("#festejo-extra").textContent = extra.join("  ·  ");
    const sig = $("#f-siguiente"), abc = $("#f-abc");
    sig.textContent = parIntermedio ? "▶ Ahora la minúscula"
      : J.juego === "desafio" ? "🎲 Otro desafío"
        : o.palabra ? "▶ Siguiente palabra" : "▶ Siguiente letra";
    abc.textContent = o.palabra ? "📝 Volver a palabras" : "🔤 Volver al abecedario";
    $("#festejo").hidden = false;
    confeti();
    setTimeout(() => sig.focus(), 50);
  }
  function cerrarFestejo() { $("#festejo").hidden = true; $("#confeti").innerHTML = ""; }

  function avanzar(delta) {
    if (J.juego === "palabras") J.palabra = (J.palabra + delta + PALABRAS.length) % PALABRAS.length;
    else if (J.juego === "desafio") J.idx = otraAlAzar();
    else { J.idx = (J.idx + delta + ABECEDARIO.length) % ABECEDARIO.length; J.parPaso = 0; }
    recargar();
  }
  function otraAlAzar() {
    let i; do { i = Math.floor(Math.random() * ABECEDARIO.length); } while (i === J.idx && ABECEDARIO.length > 1);
    return i;
  }

  /* ==========================================================
     CONFIRMACIÓN
     ========================================================== */
  let alConfirmar = null;
  function confirmar(texto, siTexto, cb) {
    $("#confirmar-texto").textContent = texto;
    $("#confirmar-si").textContent = siTexto;
    alConfirmar = cb; $("#confirmar").hidden = false;
  }
  $("#confirmar-no").addEventListener("click", () => { $("#confirmar").hidden = true; alConfirmar = null; });
  $("#confirmar-si").addEventListener("click", () => { $("#confirmar").hidden = true; const f = alConfirmar; alConfirmar = null; if (f) f(); });

  /* ==========================================================
     ABECEDARIO, PALABRAS, PROGRESO Y ÁLBUM
     ========================================================== */
  function pintarAbecedario() {
    const caso = P.pref.tipo;
    $("#abc-titulo").textContent = J.juego === "par" ? "Elegí una letra (grande y chica)" : J.juego === "copio" ? "Elegí la letra para copiar" : "Elegí una letra";
    $("#abc-grid").innerHTML = ABECEDARIO.map((b, i) => {
      const reg = P.letras[caso][b], q = P.quiero[caso].includes(b);
      const texto = J.juego === "par" ? `${b}${b.toLowerCase()}` : letraDe(b, caso);
      const ins = (reg ? '<span title="Ya la practicaste">⭐</span>' : "") + (q ? '<span title="Quiero practicarla más">❤️</span>' : "");
      return `<button class="tarjeta-letra ${caso} ${reg ? "practicada" : ""}" data-idx="${i}" aria-label="Letra ${b}${reg ? ", ya practicada" : ""}">
        <span class="tl-letra">${letraHTML(texto)}</span><span class="tl-insignias">${ins}</span>${reg ? `<span class="tl-veces">×${reg.n}</span>` : ""}</button>`;
    }).join("");
  }
  alEntrar.abc = pintarAbecedario;

  function pintarPalabras() {
    $("#palabras-grid").innerHTML = PALABRAS.map((p, i) => {
      const n = P.palabras[p.palabra] || 0;
      return `<button class="tarjeta-palabra ${n ? "hecha" : ""}" data-palabra="${i}" aria-label="Palabra ${p.palabra}">
        <span class="tp-emoji" aria-hidden="true">${p.emoji}</span><span class="tp-texto">${p.palabra}</span>
        ${n ? `<span class="tl-insignias"><span>⭐</span></span><span class="tl-veces">×${n}</span>` : ""}</button>`;
    }).join("");
  }
  alEntrar.palabras = pintarPalabras;

  function pintarProgreso() {
    const e = estadisticas();
    const barra = (nom, n, tot) => `<div class="barra-avance"><span>${nom}</span><div class="ba-fondo"><div class="ba-lleno" style="width:${Math.round((n / tot) * 100)}%"></div></div><span>${n} de ${tot}</span></div>`;
    const mini = (caso) => `<div class="mini-abc">${ABECEDARIO.map((b) => `<span class="${P.letras[caso][b] ? "si" : ""}">${letraHTML(letraDe(b, caso))}</span>`).join("")}</div>`;
    const quiero = ["may", "min"].flatMap((c) => P.quiero[c].map((b) => ({ c, b })));
    $("#progreso-cuerpo").innerHTML = `
      <div class="prog-tiles">
        <div class="tile"><span class="t-icono">✍️</span><div><div class="t-num">${e.letrasTotal}</div><div class="t-txt">letras practicadas (de 54)</div></div></div>
        <div class="tile"><span class="t-icono">⭐</span><div><div class="t-num">${e.estrellas}</div><div class="t-txt">estrellas</div></div></div>
        <div class="tile"><span class="t-icono">🏅</span><div><div class="t-num">${P.medallas.length}</div><div class="t-txt">medallas (de ${MEDALLAS.length})</div></div></div>
        <div class="tile"><span class="t-icono">📝</span><div><div class="t-num">${e.palabras}</div><div class="t-txt">palabras copiadas</div></div></div>
      </div>
      <div class="panel">
        <h3>Mi avance</h3>
        ${barra("🔠 Mayúscula", e.may, 27)}
        ${barra("🔡 Minúscula", e.min, 27)}
        ${barra("📝 Palabras", e.palabras, PALABRAS.length)}
        <p class="leyenda">★ = letra que ya practiqué</p>
        ${mini("may")}${mini("min")}
      </div>
      <div class="panel">
        <h3>❤️ Quiero seguir practicando</h3>
        ${quiero.length ? `<div class="lista-quiero">${quiero.map((q) => `<button data-quiero-caso="${q.c}" data-quiero-letra="${q.b}" aria-label="Practicar ${q.b}">${letraHTML(letraDe(q.b, q.c))}</button>`).join("")}</div>`
        : `<p class="vacio">Tocá «🤍 Quiero practicarla más» cuando estés practicando una letra y aparece acá.</p>`}
        <h3>🏅 Mis medallas</h3>
        <div class="medallas-mini">${MEDALLAS.map((m) => `<span class="${P.medallas.includes(m.id) ? "ganada" : ""}" title="${m.nombre}: ${m.desc}" aria-label="${m.nombre}${P.medallas.includes(m.id) ? " (ganada)" : " (por ganar)"}">${m.icono}</span>`).join("")}</div>
      </div>`;
  }
  alEntrar.progreso = pintarProgreso;

  function pintarAlbum() {
    const caso = P.pref.tipo;
    $("#album-grid").innerHTML = ABECEDARIO.map((b, i) => {
      const reg = P.letras[caso][b];
      const col = ["#e1f5fe", "#e0f7fa", "#fff8e1", "#e8f5e9", "#fbe9e7", "#ede7f6"][i % 6];
      return `<button class="figurita ${reg ? "pegada" : ""}" data-idx="${i}" style="${reg ? `background:${col}` : ""}" aria-label="Figurita ${b}${reg ? ", pegada" : ", por conseguir"}">
        <span class="fg-letra">${letraHTML(letraDe(b, caso))}</span>
        ${reg ? `<span class="fg-estrellas">⭐ ${reg.n}</span>` : `<span class="fg-falta">por pegar</span>`}</button>`;
    }).join("");
    $("#medallas-estante").innerHTML = "<h3>🏅 Medallas</h3>" + MEDALLAS.map((m) => {
      const g = P.medallas.includes(m.id);
      return `<div class="medalla ${g ? "" : "bloq"}" title="${m.desc}${g ? "" : " (por ganar)"}"><span class="md-icono">${m.icono}</span><span class="md-txt"><b>${m.nombre}</b><small>${m.desc}</small></span></div>`;
    }).join("");
  }
  alEntrar.album = pintarAlbum;

  /* ==========================================================
     EVENTOS
     ========================================================== */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button, a");
    if (!b) return;
    const d = b.dataset;

    if (d.ir) { ir(d.ir); return; }
    if (d.modoEscritura) {
      P.pref.escritura = d.modoEscritura; guardar(); refrescarComunes();
      if (actual === "practica") { borrarDibujo(); iniciarAyudas(); }
      return;
    }
    if (d.setTipo) { cambiarTipo(d.setTipo); return; }
    if (d.tipo) {
      P.pref.tipo = d.tipo; guardar();
      $$(".tarjeta-tipo").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.tipo === d.tipo)));
      setTimeout(() => ir("menu"), 150);
      return;
    }
    if (d.juego) {
      J.juego = d.juego; J.parPaso = 0;
      if (d.juego === "palabras") { ir("palabras"); return; }
      if (d.juego === "recorro") {
        const i = ABECEDARIO.findIndex((x) => !P.letras[P.pref.tipo][x]);
        J.idx = i < 0 ? 0 : i; abrirPractica(); return;
      }
      if (d.juego === "desafio") { J.idx = otraAlAzar(); abrirPractica(); return; }
      ir("abc"); return;
    }
    if (d.idx !== undefined && (b.classList.contains("tarjeta-letra") || b.classList.contains("figurita"))) {
      if (b.classList.contains("figurita")) J.juego = "una";
      J.idx = Number(d.idx); J.parPaso = 0; abrirPractica(); return;
    }
    if (d.palabra !== undefined) { J.juego = "palabras"; J.palabra = Number(d.palabra); abrirPractica(); return; }
    if (d.quieroLetra) {
      J.juego = "una"; P.pref.tipo = d.quieroCaso; guardar();
      J.idx = ABECEDARIO.indexOf(d.quieroLetra); abrirPractica(); return;
    }
    if (d.color !== undefined) { P.pref.color = Number(d.color); guardar(); pintarColores(); return; }
    if (d.paso) { borrarDibujo(); elegirPaso(d.paso); return; }
    if (d.accion === "reiniciar") {
      confirmar("¿Borrar todas las estrellas, letras y medallas de este dispositivo?", "✔ Sí, borrar", () => {
        const pref = P.pref; P = vacio(); P.pref = pref; guardar(); ir("progreso");
      });
      return;
    }
    if (d.accion === "nuevo-jugador") {
      confirmar("¿Empieza un nuevo jugador? Se borra el progreso guardado en esta computadora.", "✔ Sí, empezar", () => {
        P = vacio(); guardar(); ir("inicio");
      });
    }
  });

  $("#p-volver").addEventListener("click", () => ir(objetivo().palabra ? "palabras" : "abc"));
  $("#btn-anterior").addEventListener("click", () => avanzar(-1));
  $("#btn-siguiente").addEventListener("click", () => avanzar(1));
  $("#btn-dado").addEventListener("click", () => avanzar(1));
  $("#btn-deshacer").addEventListener("click", () => {
    if (!trazosAlumno.length) { mostrarGlobo("No hay nada para deshacer"); return; }
    trazosAlumno.pop(); redibujarDibujo();
  });
  $("#btn-borrar").addEventListener("click", () => borrarDibujo());
  $("#btn-modelo").addEventListener("click", () => {
    V.verModelo = !V.verModelo;
    $("#btn-modelo").setAttribute("aria-pressed", String(V.verModelo));
    $("#btn-modelo span").textContent = V.verModelo ? "Ocultar modelo" : "Ver modelo";
    if (!V.animando) redibujarGuias();
  });
  $("#btn-otra-vez").addEventListener("click", () => {
    borrarDibujo();
    if (P.pref.escritura === "guiado" && objetivo().trazos) {
      if (J.juego === "copio") { V.paso = "mirar"; animar(); } else elegirPaso("mirar");
    } else { redibujarGuias(); mostrarGlobo("¡Probemos otra vez! ✍️"); }
  });
  $("#btn-listo").addEventListener("click", () => {
    if (tinta() < Math.max(25, H * 0.06)) { mostrarGlobo("✍️ ¡Primero escribí con tu dedo!"); return; }
    detenerAnimacion();
    festejar(registrarLogro());
    refrescarComunes();
  });
  $("#btn-quiero").addEventListener("click", () => {
    const o = objetivo(), lista = P.quiero[o.caso], i = lista.indexOf(o.base);
    if (i >= 0) lista.splice(i, 1); else lista.push(o.base);
    guardar(); prepararPractica();
    mostrarGlobo(i >= 0 ? "Listo, la sacamos de tu lista" : "❤️ ¡Guardada en tu lista!");
  });
  $("#btn-ojo").addEventListener("click", () => {
    V.lateralVisible = !V.lateralVisible;
    $("#tarjeta-modelo").classList.toggle("oculto", !V.lateralVisible);
    $("#btn-ojo").setAttribute("aria-pressed", String(!V.lateralVisible));
    $("#btn-ojo").textContent = V.lateralVisible ? "🙈 Ocultar" : "👁️ Mostrar";
  });

  // Botones del festejo
  $("#f-otra-vez").addEventListener("click", () => {
    cerrarFestejo();
    if (J.juego === "par" && J.parPaso === 1) J.parPaso = 0;
    recargar();
  });
  $("#f-siguiente").addEventListener("click", () => {
    cerrarFestejo();
    if (J.juego === "par" && J.parPaso === 0) { J.parPaso = 1; recargar(); return; }
    avanzar(1);
  });
  $("#f-abc").addEventListener("click", () => { cerrarFestejo(); ir(objetivo().palabra ? "palabras" : "abc"); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!$("#confirmar").hidden) $("#confirmar-no").click(); else if (!$("#festejo").hidden) cerrarFestejo(); }
  });

  /* ==========================================================
     INICIO
     ========================================================== */
  $$(".tt-muestra").forEach((m) => (m.innerHTML = letraHTML(m.textContent)));
  alEntrar.tipo = () => $$(".tarjeta-tipo").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.tipo === P.pref.tipo)));
  alEntrar.practica = () => { };

  const listo = document.fonts && document.fonts.load
    ? Promise.race([document.fonts.load(`400 60px ${FUENTE}`, "AaÑñá"), new Promise((r) => setTimeout(r, 3000))])
    : Promise.resolve();
  listo.then(() => { refrescarComunes(); pintarColores(); });
  refrescarComunes();
})();
