// =====================================================
//  LABERINTOS — lógica del juego
//  El laberinto (imagen) y el dibujo (canvas) están en capas separadas:
//  la goma y "Borrar todo" sólo afectan al dibujo, nunca a la imagen.
// =====================================================
(function () {
  const $ = (id) => document.getElementById(id);

  const pantallaMenu  = $('pantalla-menu');
  const pantallaJuego = $('pantalla-juego');
  const grilla  = $('grilla');
  const lienzo  = $('lienzo');
  const img     = $('img-laberinto');
  const canvas  = $('canvas-trazo');
  const ctx     = canvas.getContext('2d');

  const estado = {
    herramienta: 'lapiz',
    color: '#e63946',
    dibujando: false,
    ultimo: null,
    grosorLapiz: 10,
    grosorGoma: 30
  };

  // Estado inicial de ventanas (evita que se muestren por CSS)
  $('modal-borrar').hidden = true;
  $('modal-festejo').hidden = true;

  // ---------- Menú ----------
  function armarMenu() {
    grilla.innerHTML = '';
    LABERINTOS.forEach((lab, i) => {
      const t = document.createElement('button');
      t.className = 'tarjeta';
      t.innerHTML =
        `<span class="num">${i + 1}</span>` +
        `<img src="${lab.imagen}" alt="">` +
        `<span class="nombre">${lab.titulo}</span>`;
      t.addEventListener('click', () => abrirLaberinto(i));
      grilla.appendChild(t);
    });
  }

  // ---------- Abrir laberinto ----------
  function abrirLaberinto(i) {
    const lab = LABERINTOS[i];
    $('titulo-juego').textContent = lab.titulo;
    $('consigna-juego').textContent = lab.consigna || '';
    pantallaMenu.hidden = true;
    pantallaJuego.hidden = false;

    img.onload = () => {
      // Resolución interna del dibujo: proporcional a la imagen, mínimo 1400 px de lado mayor
      const escala = Math.max(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width  = Math.round(img.naturalWidth * escala);
      canvas.height = Math.round(img.naturalHeight * escala);
      const base = Math.max(canvas.width, canvas.height);
      estado.grosorLapiz = Math.round(base * 0.008);
      estado.grosorGoma  = Math.round(base * 0.03);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ajustarTamano();
    };
    img.src = lab.imagen;
  }

  // Ajusta imagen y canvas al espacio disponible manteniendo la proporción
  function ajustarTamano() {
    if (!img.naturalWidth || pantallaJuego.hidden) return;
    const caja = lienzo.getBoundingClientRect();
    const r = Math.min(caja.width / img.naturalWidth, caja.height / img.naturalHeight);
    const w = Math.floor(img.naturalWidth * r);
    const h = Math.floor(img.naturalHeight * r);
    [img, canvas].forEach(el => { el.style.width = w + 'px'; el.style.height = h + 'px'; });
  }
  window.addEventListener('resize', ajustarTamano);

  // ---------- Dibujo ----------
  function punto(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * canvas.width / r.width,
      y: (e.clientY - r.top) * canvas.height / r.height
    };
  }

  function prepararPincel() {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (estado.herramienta === 'goma') {
      ctx.globalCompositeOperation = 'destination-out'; // borra sólo el trazo
      ctx.lineWidth = estado.grosorGoma;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = estado.grosorLapiz;
      ctx.strokeStyle = estado.color;
      ctx.fillStyle = estado.color;
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    estado.dibujando = true;
    prepararPincel();
    const p = punto(e);
    estado.ultimo = p;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!estado.dibujando) return;
    const eventos = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    eventos.forEach(ev => {
      const p = punto(ev);
      ctx.beginPath();
      ctx.moveTo(estado.ultimo.x, estado.ultimo.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      estado.ultimo = p;
    });
  });

  const terminar = () => { estado.dibujando = false; estado.ultimo = null; };
  canvas.addEventListener('pointerup', terminar);
  canvas.addEventListener('pointercancel', terminar);

  // ---------- Herramientas ----------
  document.querySelectorAll('.herr[data-herr]').forEach(b => {
    b.addEventListener('click', () => elegirHerramienta(b.dataset.herr));
  });

  function elegirHerramienta(h) {
    estado.herramienta = h;
    document.querySelectorAll('.herr[data-herr]').forEach(x =>
      x.classList.toggle('activa', x.dataset.herr === h));
    canvas.classList.toggle('goma', h === 'goma');
  }

  document.querySelectorAll('.color').forEach(b => {
    b.addEventListener('click', () => {
      estado.color = b.dataset.color;
      document.querySelectorAll('.color').forEach(x => x.classList.toggle('activo', x === b));
      elegirHerramienta('lapiz');
    });
  });

  // Borrar todo
  $('btn-borrar-todo').addEventListener('click', () => { $('modal-borrar').hidden = false; });
  $('borrar-no').addEventListener('click', () => { $('modal-borrar').hidden = true; });
  $('borrar-si').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $('modal-borrar').hidden = true;
  });

  // ¡Terminé!
  $('btn-termine').addEventListener('click', () => {
    $('modal-festejo').hidden = false;
    sonidoFestejo();
  });
  $('festejo-seguir').addEventListener('click', () => { $('modal-festejo').hidden = true; });
  $('festejo-otro').addEventListener('click', () => { $('modal-festejo').hidden = true; volverAlMenu(); });

  $('btn-atras').addEventListener('click', volverAlMenu);

  function volverAlMenu() {
    pantallaJuego.hidden = true;
    pantallaMenu.hidden = false;
    elegirHerramienta('lapiz');
  }

  // ---------- Sonido (Web Audio, sin archivos) ----------
  let audio;
  function sonidoFestejo() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        const t = audio.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g).connect(audio.destination);
        o.start(t); o.stop(t + 0.32);
      });
    } catch (err) { /* sin sonido */ }
  }

  armarMenu();
})();
