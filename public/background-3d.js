// Fondo 3D animado con tema escatológico
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

// Ajustar tamaño del canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Partículas de fondo
class Particle3D {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -50;
    this.z = Math.random() * 1000;
    this.size = Math.random() * 3 + 1;
    this.speedY = Math.random() * 0.5 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;

    // Colores tóxicos/suciedad
    const colors = [
      '#8B4513', // Marrón
      '#654321', // Marrón oscuro
      '#556B2F', // Verde oliva
      '#6B8E23', // Verde sucio
      '#8B7355', // Beige sucio
      '#708238', // Verde limón sucio
      '#665D1E', // Amarillo sucio
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    // Efecto 3D de perspectiva
    const perspective = 1000;
    const scale = perspective / (perspective + this.z);

    this.y += this.speedY / scale;
    this.x += this.speedX / scale;
    this.z -= 1;
    this.rotation += this.rotationSpeed;

    // Reset si sale de la pantalla
    if (this.y > canvas.height + 50 || this.z < 1) {
      this.reset();
    }
  }

  draw() {
    const perspective = 1000;
    const scale = perspective / (perspective + this.z);
    const size = this.size * scale * 8;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity * scale;

    // Dibujar forma irregular (como manchas)
    ctx.fillStyle = this.color;
    ctx.beginPath();

    const points = 6;
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points;
      const radius = size * (0.5 + Math.random() * 0.5);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();

    // Sombra para efecto 3D
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetX = 3 * scale;
    ctx.shadowOffsetY = 3 * scale;

    ctx.restore();
  }
}

// Ondas de fondo
class BackgroundWave {
  constructor(y, speed, color, amplitude) {
    this.y = y;
    this.speed = speed;
    this.color = color;
    this.amplitude = amplitude;
    this.offset = 0;
  }

  update() {
    this.offset += this.speed;
  }

  draw() {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.1;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x += 10) {
      const y = this.y + Math.sin((x + this.offset) * 0.01) * this.amplitude;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Burbujas tóxicas
class ToxicBubble {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 50;
    this.radius = Math.random() * 30 + 10;
    this.speedY = -(Math.random() * 1 + 0.5);
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.3 + 0.2;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.pulse += 0.05;

    if (this.y < -50) {
      this.reset();
    }
  }

  draw() {
    const pulseSize = Math.sin(this.pulse) * 3;
    const currentRadius = this.radius + pulseSize;

    ctx.save();

    // Gradiente tóxico
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, currentRadius
    );
    gradient.addColorStop(0, `rgba(139, 195, 74, ${this.opacity})`);
    gradient.addColorStop(0.5, `rgba(85, 107, 47, ${this.opacity * 0.5})`);
    gradient.addColorStop(1, 'rgba(85, 107, 47, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Brillo
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
    ctx.beginPath();
    ctx.arc(this.x - currentRadius * 0.3, this.y - currentRadius * 0.3, currentRadius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Inicializar elementos
const particles = [];
const waves = [];
const bubbles = [];

for (let i = 0; i < 100; i++) {
  particles.push(new Particle3D());
}

for (let i = 0; i < 5; i++) {
  waves.push(new BackgroundWave(
    canvas.height * 0.2 * (i + 1),
    Math.random() * 0.5 + 0.2,
    `hsl(${Math.random() * 60 + 30}, 50%, 30%)`,
    50 + Math.random() * 50
  ));
}

for (let i = 0; i < 20; i++) {
  bubbles.push(new ToxicBubble());
}

// Gradiente de fondo animado
let hueShift = 0;

function drawBackground() {
  hueShift += 0.1;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, `hsl(${270 + Math.sin(hueShift * 0.01) * 20}, 60%, 25%)`);
  gradient.addColorStop(0.5, `hsl(${250 + Math.sin(hueShift * 0.015) * 20}, 50%, 20%)`);
  gradient.addColorStop(1, `hsl(${230 + Math.sin(hueShift * 0.02) * 20}, 55%, 15%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Animación principal
function animate() {
  drawBackground();

  // Dibujar ondas
  waves.forEach(wave => {
    wave.update();
    wave.draw();
  });

  // Dibujar burbujas
  bubbles.forEach(bubble => {
    bubble.update();
    bubble.draw();
  });

  // Dibujar partículas
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

animate();
