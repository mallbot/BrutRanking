// Configuración
const API_URL = window.location.origin;

// Referencias a elementos
const formNuevaPersona = document.getElementById('form-nueva-persona');
const formIncidencia = document.getElementById('form-incidencia');
const selectPersona = document.getElementById('select-persona');
const inputFoto = document.getElementById('foto');
const previewContainer = document.getElementById('preview-container');

// === FUNCIONES DE NOTIFICACIÓN ===

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = `toast toast-${tipo} show`;

  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// === FUNCIONES DE API ===

async function cargarPersonas() {
  try {
    const response = await fetch(`${API_URL}/api/personas`);
    const personas = await response.json();

    // Actualizar el select
    selectPersona.innerHTML = '<option value="">-- Selecciona --</option>';
    personas.forEach(persona => {
      const option = document.createElement('option');
      option.value = persona.id;
      option.textContent = persona.nombre;
      selectPersona.appendChild(option);
    });

    return personas;
  } catch (error) {
    console.error('Error al cargar personas:', error);
    mostrarToast('Error al cargar personas', 'error');
  }
}

async function cargarRanking() {
  try {
    const response = await fetch(`${API_URL}/api/ranking`);
    const ranking = await response.json();
    mostrarRankingAdmin(ranking);
  } catch (error) {
    console.error('Error al cargar ranking:', error);
  }
}

async function cargarHistorial() {
  try {
    const [incidenciasRes, personasRes] = await Promise.all([
      fetch(`${API_URL}/api/incidencias`),
      fetch(`${API_URL}/api/personas`)
    ]);

    const incidencias = await incidenciasRes.json();
    const personas = await personasRes.json();

    mostrarHistorial(incidencias, personas);
  } catch (error) {
    console.error('Error al cargar historial:', error);
  }
}

// === FUNCIONES DE INTERFAZ ===

function mostrarRankingAdmin(ranking) {
  const container = document.getElementById('admin-ranking');

  if (ranking.length === 0) {
    container.innerHTML = '<p class="empty-message">No hay personas registradas todavía.</p>';
    return;
  }

  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Pos</th>
        <th>Nombre</th>
        <th>Puntos</th>
        <th>Última Incidencia</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  ranking.forEach((persona, index) => {
    const tr = document.createElement('tr');
    const ultimaIncidencia = persona.ultimaIncidencia
      ? new Date(persona.ultimaIncidencia).toLocaleDateString('es-ES')
      : 'Nunca';

    tr.innerHTML = `
      <td class="rank-number">${index + 1}</td>
      <td><strong>${persona.nombre}</strong></td>
      <td class="points-cell">${persona.puntos}</td>
      <td>${ultimaIncidencia}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="eliminarPersona('${persona.id}', '${persona.nombre}')">
          Eliminar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  container.appendChild(table);
}

function mostrarHistorial(incidencias, personas) {
  const container = document.getElementById('historial-incidencias');

  if (incidencias.length === 0) {
    container.innerHTML = '<p class="empty-message">No hay incidencias registradas todavía.</p>';
    return;
  }

  // Ordenar por fecha más reciente
  incidencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Mostrar solo las 20 más recientes
  const recientes = incidencias.slice(0, 20);

  container.innerHTML = '';

  recientes.forEach(incidencia => {
    const persona = personas.find(p => p.id === incidencia.personaId);
    const fecha = new Date(incidencia.fecha);

    const card = document.createElement('div');
    card.className = 'incidencia-card';

    card.innerHTML = `
      <div class="incidencia-header">
        <div>
          <strong>${persona ? persona.nombre : 'Desconocido'}</strong>
          <span class="incidencia-fecha">${fecha.toLocaleString('es-ES')}</span>
        </div>
        <button class="btn btn-danger btn-sm" onclick="eliminarIncidencia('${incidencia.id}')">
          ✕ Eliminar
        </button>
      </div>
      ${incidencia.descripcion ? `<p class="incidencia-desc">${incidencia.descripcion}</p>` : ''}
      ${incidencia.foto ? `
        <div class="incidencia-foto">
          <img src="${incidencia.foto}" alt="Evidencia" onclick="abrirImagen('${incidencia.foto}')">
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

// === MANEJADORES DE EVENTOS ===

// Añadir nueva persona
formNuevaPersona.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre-persona').value.trim();

  try {
    const response = await fetch(`${API_URL}/api/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre })
    });

    if (response.ok) {
      mostrarToast(`✅ Persona "${nombre}" añadida correctamente`);
      formNuevaPersona.reset();
      await cargarPersonas();
      await cargarRanking();
    } else {
      const error = await response.json();
      mostrarToast(error.error || 'Error al añadir persona', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al añadir persona', 'error');
  }
});

// Registrar incidencia
formIncidencia.addEventListener('submit', async (e) => {
  e.preventDefault();

  const personaId = selectPersona.value;
  const descripcion = document.getElementById('descripcion').value.trim();
  const foto = inputFoto.files[0];

  if (!personaId) {
    mostrarToast('Debes seleccionar una persona', 'error');
    return;
  }

  if (!foto) {
    mostrarToast('Debes añadir una foto de evidencia', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('personaId', personaId);
  formData.append('descripcion', descripcion);
  formData.append('foto', foto);

  try {
    const response = await fetch(`${API_URL}/api/incidencias`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const personaNombre = selectPersona.options[selectPersona.selectedIndex].text;
      mostrarToast(`✅ Punto añadido a ${personaNombre}`);
      formIncidencia.reset();
      previewContainer.innerHTML = '';
      await cargarRanking();
      await cargarHistorial();
    } else {
      const error = await response.json();
      mostrarToast(error.error || 'Error al registrar incidencia', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al registrar incidencia', 'error');
  }
});

// Preview de imagen
inputFoto.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewContainer.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
      `;
    };
    reader.readAsDataURL(file);
  }
});

// === FUNCIONES GLOBALES ===

async function eliminarPersona(id, nombre) {
  if (!confirm(`¿Estás seguro de eliminar a "${nombre}"? Se eliminarán también todas sus incidencias.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/personas/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      mostrarToast(`✅ Persona "${nombre}" eliminada`);
      await cargarPersonas();
      await cargarRanking();
      await cargarHistorial();
    } else {
      mostrarToast('Error al eliminar persona', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al eliminar persona', 'error');
  }
}

async function eliminarIncidencia(id) {
  if (!confirm('¿Estás seguro de eliminar esta incidencia?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/incidencias/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      mostrarToast('✅ Incidencia eliminada');
      await cargarRanking();
      await cargarHistorial();
    } else {
      mostrarToast('Error al eliminar incidencia', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al eliminar incidencia', 'error');
  }
}

function abrirImagen(url) {
  window.open(url, '_blank');
}

// === INICIALIZACIÓN ===

async function inicializar() {
  await cargarPersonas();
  await cargarRanking();
  await cargarHistorial();
}

inicializar();

// Actualizar cada 30 segundos
setInterval(() => {
  cargarRanking();
  cargarHistorial();
}, 30000);
