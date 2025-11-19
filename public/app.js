// Configuración
const API_URL = window.location.origin;
const REFRESH_INTERVAL = 10000; // Actualizar cada 10 segundos

// Función para obtener el ranking
async function obtenerRanking() {
  try {
    const response = await fetch(`${API_URL}/api/ranking`);
    const ranking = await response.json();
    mostrarRanking(ranking);
    actualizarTimestamp();
  } catch (error) {
    console.error('Error al obtener ranking:', error);
  }
}

// Función para mostrar el ranking
function mostrarRanking(ranking) {
  const podium = document.getElementById('podium');
  const rankingList = document.getElementById('ranking-list');

  // Limpiar contenido anterior
  podium.innerHTML = '';
  rankingList.innerHTML = '';

  if (ranking.length === 0) {
    rankingList.innerHTML = '<div class="empty-state">¡Aún no hay datos! La oficina está limpia 🎉</div>';
    return;
  }

  // Mostrar top 3 en el podio
  const top3 = ranking.slice(0, 3);
  const positions = [1, 0, 2]; // Orden: 2do, 1ro, 3ro para efecto visual

  // Reordenar para el podio visual
  const podiumOrder = [
    top3[1] || null, // 2do lugar
    top3[0] || null, // 1er lugar (centro)
    top3[2] || null  // 3er lugar
  ];

  podiumOrder.forEach((persona, index) => {
    if (persona) {
      const realPosition = positions[index] + 1;
      const podiumItem = crearPodiumItem(persona, realPosition);
      podium.appendChild(podiumItem);
    }
  });

  // Mostrar el resto del ranking
  if (ranking.length > 3) {
    const resto = ranking.slice(3);
    resto.forEach((persona, index) => {
      const item = crearRankingItem(persona, index + 4);
      rankingList.appendChild(item);
    });
  }
}

// Crear elemento del podio
function crearPodiumItem(persona, posicion) {
  const div = document.createElement('div');
  div.className = `podium-item position-${posicion}`;

  const medallas = ['🥇', '🥈', '🥉'];
  const heights = ['280px', '320px', '240px'];

  div.innerHTML = `
    <div class="podium-person">
      <div class="medal">${medallas[posicion - 1]}</div>
      <div class="avatar">${persona.nombre.charAt(0).toUpperCase()}</div>
      <div class="name">${persona.nombre}</div>
      <div class="points">${persona.puntos} ${persona.puntos === 1 ? 'punto' : 'puntos'}</div>
    </div>
    <div class="podium-base" style="height: ${heights[posicion - 1]}">
      <div class="position-number">${posicion}</div>
    </div>
  `;

  return div;
}

// Crear elemento de la lista
function crearRankingItem(persona, posicion) {
  const div = document.createElement('div');
  div.className = 'ranking-item';

  div.innerHTML = `
    <div class="rank-position">${posicion}</div>
    <div class="rank-avatar">${persona.nombre.charAt(0).toUpperCase()}</div>
    <div class="rank-name">${persona.nombre}</div>
    <div class="rank-points">${persona.puntos} ${persona.puntos === 1 ? 'punto' : 'puntos'}</div>
  `;

  return div;
}

// Actualizar timestamp
function actualizarTimestamp() {
  const timestamp = document.getElementById('last-update');
  const ahora = new Date();
  timestamp.textContent = ahora.toLocaleTimeString('es-ES');
}

// Inicializar
obtenerRanking();

// Actualizar periódicamente
setInterval(obtenerRanking, REFRESH_INTERVAL);
