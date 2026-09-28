// =============================================
//  EL CUENTO DEL PERRITO — Script interactivo
// =============================================
//
//
// ---- CHIPS: insertar sugerencia en el textarea ----
document.querySelectorAll('.chip').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var targetId = btn.getAttribute('data-target');
    var text     = btn.getAttribute('data-text');
    var ta       = document.getElementById(targetId);
    if (!ta) return;

    var start = ta.selectionStart;
    var end   = ta.selectionEnd;
    var current = ta.value;

    if (current.trim() === '') {
      ta.value = text;
    } else {
      // Insertar en la posición del cursor
      ta.value = current.slice(0, start) + text + current.slice(end);
    }

    // Mover cursor al final del texto insertado
    var newPos = start + text.length;
    ta.setSelectionRange(newPos, newPos);
    ta.focus();

    updateWordCount(ta);

    // Animación visual del chip
    btn.style.transform = 'scale(0.88)';
    setTimeout(function() { btn.style.transform = ''; }, 150);
  });
});

// ---- CONTADOR DE PALABRAS ----
function countWords(str) {
  var trimmed = str.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

function updateWordCount(ta) {
  var map = {
    'ta-inicio':    'wc-inicio',
    'ta-conflicto': 'wc-conflicto',
    'ta-desenlace': 'wc-desenlace'
  };
  var spanId = map[ta.id];
  if (spanId) {
    document.getElementById(spanId).textContent = countWords(ta.value);
  }
}

['ta-inicio', 'ta-conflicto', 'ta-desenlace'].forEach(function(id) {
  var ta = document.getElementById(id);
  if (ta) {
    ta.addEventListener('input', function() { updateWordCount(ta); });
  }
});

// ---- VER MI CUENTO (modal) ----
function showPreview() {
  var inicio    = document.getElementById('ta-inicio').value.trim();
  var conflicto = document.getElementById('ta-conflicto').value.trim();
  var desenlace = document.getElementById('ta-desenlace').value.trim();

  var empty = !inicio && !conflicto && !desenlace;

  document.getElementById('mp-inicio-text').textContent    = inicio    || '(sin texto)';
  document.getElementById('mp-conflicto-text').textContent = conflicto || '(sin texto)';
  document.getElementById('mp-desenlace-text').textContent = desenlace || '(sin texto)';

  // Ocultar/mostrar secciones
  document.getElementById('modal-empty').classList.toggle('hidden', !empty);
  document.querySelector('.modal-content').style.display = empty ? 'none' : '';

  var allFilled = inicio && conflicto && desenlace;
  document.getElementById('congrats').classList.toggle('hidden', !allFilled);

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal(event) {
  if (!event || event.target === document.getElementById('modal-overlay') || event.currentTarget === document.querySelector('.modal-close')) {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
}

document.querySelector('.modal-close').addEventListener('click', function() {
  document.getElementById('modal-overlay').classList.add('hidden');
});

// Cerrar con tecla Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
});

// ---- BORRAR TODO ----
function clearAll() {
  var confirmed = confirm('¿Seguro que querés borrar todo el cuento? Esta acción no se puede deshacer.');
  if (!confirmed) return;
  ['ta-inicio', 'ta-conflicto', 'ta-desenlace'].forEach(function(id) {
    var ta = document.getElementById(id);
    if (ta) {
      ta.value = '';
      updateWordCount(ta);
    }
  });
}

// ---- ENVIAR A GOOGLE SHEETS ----
//
function enviarCuento() {

  var nombre    = document.getElementById('nombre').value.trim();
  var curso     = document.getElementById('curso').value.trim();
  var titulo    = document.getElementById('titulo').value.trim();
  var inicio    = document.getElementById('ta-inicio').value.trim();
  var conflicto = document.getElementById('ta-conflicto').value.trim();
  var desenlace = document.getElementById('ta-desenlace').value.trim();

  // Validación completa
  if (!nombre || !curso || !titulo || !inicio || !conflicto || !desenlace) {
    alert('¡Completá todos los campos antes de enviar! 📝');
    return;
  }

  var data = {
    fecha: new Date().toLocaleString(),
    nombre: nombre,
    curso: curso,
    titulo: titulo,
    inicio: inicio,
    conflicto: conflicto,
    desenlace: desenlace,
    
  };

  var url = "https://script.google.com/macros/s/AKfycbyzV2G9JEBqZlA4LVyoO6ZPGDTPl34xdIHJgzc5SpQmIn-RE8ZU8nYnB0-v2wYVntm_/exec";

  fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(function() {
    alert("¡Cuento enviado! 🎉");

    clearAll();
    document.getElementById('nombre').value = '';
    document.getElementById('curso').value = '';
    document.getElementById('titulo').value = '';

  })
  .catch(function(error) {
    alert("Error al enviar 😢");
    console.error(error);
  });
}

