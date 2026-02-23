/* Three.js Hero Canvas — Particle field + wireframe geometry */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 6);

  /* ---------- Particles ---------- */
  const particleCount = 8000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const goldColor = new THREE.Color(0xD4A853);
  const blueColor = new THREE.Color(0x4a90a4);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 3 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const mix = Math.random();
    const c = mix < 0.5 ? goldColor.clone().lerp(blueColor, mix * 2) : blueColor.clone().lerp(goldColor, (mix - 0.5) * 2);
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---------- Wireframe Bridge / Icosahedron ---------- */
  const geoIco = new THREE.IcosahedronGeometry(1.3, 1);
  const matWire = new THREE.MeshBasicMaterial({
    color: 0xD4A853,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const meshIco = new THREE.Mesh(geoIco, matWire);
  meshIco.position.set(2.8, -0.3, -2);
  scene.add(meshIco);

  /* Torus knot */
  const geoKnot = new THREE.TorusKnotGeometry(0.7, 0.22, 80, 12);
  const matKnot = new THREE.MeshBasicMaterial({
    color: 0x4a90a4,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const meshKnot = new THREE.Mesh(geoKnot, matKnot);
  meshKnot.position.set(-3, 0.5, -3);
  scene.add(meshKnot);

  /* Octahedron */
  const geoOcta = new THREE.OctahedronGeometry(0.9);
  const matOcta = new THREE.MeshBasicMaterial({
    color: 0xD4A853,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const meshOcta = new THREE.Mesh(geoOcta, matOcta);
  meshOcta.position.set(-0.5, 2, -2.5);
  scene.add(meshOcta);

  /* ---------- Mouse interaction ---------- */
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 0.4;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  /* ---------- Animation loop ---------- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    particles.rotation.y = t * 0.04 + mouse.x;
    particles.rotation.x = t * 0.02 + mouse.y;

    meshIco.rotation.x = t * 0.3;
    meshIco.rotation.y = t * 0.5;

    meshKnot.rotation.x = t * 0.4;
    meshKnot.rotation.y = -t * 0.25;

    meshOcta.rotation.x = -t * 0.35;
    meshOcta.rotation.z = t * 0.3;

    // Gentle camera sway
    camera.position.x = Math.sin(t * 0.15) * 0.3 + mouse.x * 0.5;
    camera.position.y = Math.cos(t * 0.12) * 0.2 - mouse.y * 0.5;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  /* ---------- Resize ---------- */
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
})();
