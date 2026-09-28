// =============================================
//  Producción escrita — Pantalla de selección
// =============================================
//
// Para agregar un cuento nuevo:
//  1) Crear una carpeta con sus archivos (index.html, style.css, script.js e imágenes).
//  2) Copiar una <a class="story-card ..."> en index.html y cambiar href, emoji y textos.
//  3) Agregar en menu.css los colores de la nueva tarjeta (.card-nombre).

// Tarjetas: tocar/enter abre el cuento con un pequeño efecto de "click"
document.querySelectorAll('.story-card').forEach(function(card) {
  card.addEventListener('click', function(e) {
    var href = card.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    card.style.transform = 'scale(0.94)';
    setTimeout(function() { window.location.href = href; }, 130);
  });
});
