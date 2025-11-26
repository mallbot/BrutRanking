// 3D Background with Three.js
// Vortex Tunnel with Floating Trash

let scene, camera, renderer;
let tunnel;
let particles = [];
const particleCount = 50;
const tunnelRadius = 10;
const tunnelLength = 100;

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    // Fog to hide the end of the tunnel - Dark Purple/Brown
    scene.fog = new THREE.FogExp2(0x3e2723, 0.02);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 0;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Create Tunnel
    createTunnel();

    // Create Floating Trash
    createTrashParticles();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 1, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);
}

function createTunnel() {
    // Generate a "dirty" texture procedurally
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    // Base color - Dark Purple/Brown sludge
    context.fillStyle = '#4a3b52';
    context.fillRect(0, 0, 512, 512);

    // Add noise/dirt - Green/Brown splotches
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 60 + 20;
        // Mix of sludge green, poop brown, and dark purple
        const colors = ['#556B2F', '#6d4c41', '#7b1fa2', '#827717'];
        context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        context.globalAlpha = 0.4;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }

    // Add streaks - Slime trails
    for (let i = 0; i < 50; i++) {
        context.strokeStyle = '#9e9d24'; // Slime green
        context.lineWidth = Math.random() * 15 + 5;
        context.globalAlpha = 0.2;
        context.beginPath();
        context.moveTo(0, Math.random() * 512);
        context.bezierCurveTo(
            170, Math.random() * 512,
            340, Math.random() * 512,
            512, Math.random() * 512
        );
        context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 20);

    // Cylinder geometry for the tunnel
    // radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded
    const geometry = new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, tunnelLength, 32, 32, true);

    // Invert geometry to see inside
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        fog: true
    });

    tunnel = new THREE.Mesh(geometry, material);
    tunnel.rotation.x = Math.PI / 2; // Rotate to look down the tube
    scene.add(tunnel);
}

function createTrashParticles() {
    const emojis = ['💩', '🗑️', '🪰', '🦠', '🍕', '☕', '🦴', '🧦'];

    for (let i = 0; i < particleCount; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const sprite = createTextSprite(emoji);

        // Random position inside the tunnel
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (tunnelRadius - 2); // Keep inside tunnel
        const z = Math.random() * tunnelLength - (tunnelLength / 2);

        sprite.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            z
        );

        // Custom properties for animation
        sprite.userData = {
            velocity: (Math.random() * 0.1) + 0.05,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            radius: radius,
            angle: angle
        };

        scene.add(sprite);
        particles.push(sprite);
    }
}

function createTextSprite(message) {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    context.font = '80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'white'; // Emoji color is natural, but this helps if fallback
    context.fillText(message, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 2, 1);
    return sprite;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Move tunnel texture to simulate forward movement
    if (tunnel) {
        tunnel.material.map.offset.y -= 0.005;
        tunnel.rotation.z += 0.002; // Slight rotation of the whole tunnel
    }

    // Animate particles
    particles.forEach(p => {
        p.position.z += p.userData.velocity * 5; // Move towards camera
        p.material.rotation += p.userData.rotationSpeed;

        // Spiral motion
        p.userData.angle += 0.01;
        p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
        p.position.y = Math.sin(p.userData.angle) * p.userData.radius;

        // Reset if behind camera
        if (p.position.z > 5) {
            p.position.z = -tunnelLength / 2;
            // Randomize position again
            p.userData.angle = Math.random() * Math.PI * 2;
            p.userData.radius = Math.random() * (tunnelRadius - 2);
        }
    });

    renderer.render(scene, camera);
}
