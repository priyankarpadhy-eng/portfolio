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
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const mix = Math.random();
    const c = mix < 0.5 ? goldColor.clone().lerp(blueColor, mix * 2) : blueColor.clone().lerp(goldColor, (mix - 0.5) * 2);
    colors[i3] = c.r;
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

  /* ---------- 3D Solid/Wireframe Cityscape, Ground & Crane ---------- */
  const cityGroup = new THREE.Group();
  scene.add(cityGroup);

  // --- Ground / Land ---
  const groundGeo = new THREE.CylinderGeometry(7.5, 7.5, 0.4, 32);
  const groundSolidMat = new THREE.MeshBasicMaterial({ color: 0x0A0F14, transparent: true, opacity: 0.9 });
  const groundSolid = new THREE.Mesh(groundGeo, groundSolidMat);
  groundSolid.position.y = -3.7; // Just below the buildings (Y=-3.5)
  cityGroup.add(groundSolid);

  // Wireframe grid on the ground
  const groundWireMat = new THREE.LineBasicMaterial({ color: 0x4a90a4, transparent: true, opacity: 0.2 });
  const groundEdges = new THREE.EdgesGeometry(groundGeo);
  const groundWire = new THREE.LineSegments(groundEdges, groundWireMat);
  groundWire.position.y = -3.7;
  cityGroup.add(groundWire);

  // Inner grid details on the top face
  const gridGeo = new THREE.CircleGeometry(7.5, 32);
  const gridEdges = new THREE.EdgesGeometry(gridGeo);
  const gridWire = new THREE.LineSegments(gridEdges, groundWireMat);
  gridWire.rotation.x = -Math.PI / 2;
  gridWire.position.y = -3.5; // Exactly at the base of the buildings
  cityGroup.add(gridWire);

  // Solid wall materials
  const wallMat1 = new THREE.MeshBasicMaterial({ color: 0x1A1A1A, transparent: true, opacity: 0.8 });
  const wallMat2 = new THREE.MeshBasicMaterial({ color: 0x0F1922, transparent: true, opacity: 0.8 });

  // Wireframe edge materials
  const edgeMat1 = new THREE.LineBasicMaterial({ color: 0xD4A853, transparent: true, opacity: 0.3 });
  const edgeMat2 = new THREE.LineBasicMaterial({ color: 0x4a90a4, transparent: true, opacity: 0.3 });

  // Store buildings for animation
  const buildingsList = [];
  const buildingCount = 40;

  for (let i = 0; i < buildingCount; i++) {
    const isBlue = Math.random() > 0.6;
    const wMat = isBlue ? wallMat2 : wallMat1;
    const eMat = isBlue ? edgeMat2 : edgeMat1;

    const w = 0.6 + Math.random() * 1.2;
    const d = 0.6 + Math.random() * 1.2;
    const h = 1.0 + Math.random() * 4.5;

    // Complex Group to hold detailed architecture
    const buildingGroup = new THREE.Group();

    // Core Tower
    const widthSegments = Math.max(1, Math.floor(w * 3));
    const heightSegments = Math.max(1, Math.floor(h * 4));
    const depthSegments = Math.max(1, Math.floor(d * 3));

    const bGeo = new THREE.BoxGeometry(w, h, d, widthSegments, heightSegments, depthSegments);
    const buildingSolid = new THREE.Mesh(bGeo, wMat);

    // Wireframe edges for windows
    const edges = new THREE.EdgesGeometry(bGeo);
    const buildingWireframe = new THREE.LineSegments(edges, eMat);

    buildingGroup.add(buildingSolid);
    buildingGroup.add(buildingWireframe);

    // Add side wings (for larger bases/complex shapes)
    if (Math.random() > 0.5 && w > 1.2) {
      const wingW = w * 0.4;
      const wingH = h * (0.3 + Math.random() * 0.4);
      const wingD = d + (Math.random() * 0.4);

      const wingGeo = new THREE.BoxGeometry(wingW, wingH, wingD, Math.max(1, Math.floor(wingW * 3)), Math.max(1, Math.floor(wingH * 4)), Math.max(1, Math.floor(wingD * 3)));
      const wingSolid1 = new THREE.Mesh(wingGeo, wMat);
      const wingWire1 = new THREE.LineSegments(new THREE.EdgesGeometry(wingGeo), eMat);

      const wingSolid2 = new THREE.Mesh(wingGeo, wMat);
      const wingWire2 = new THREE.LineSegments(new THREE.EdgesGeometry(wingGeo), eMat);

      // Position wings on sides
      wingSolid1.position.set((w / 2) + (wingW / 2) - 0.1, (wingH - h) / 2, 0);
      wingWire1.position.copy(wingSolid1.position);

      wingSolid2.position.set(-(w / 2) - (wingW / 2) + 0.1, (wingH - h) / 2, 0);
      wingWire2.position.copy(wingSolid2.position);

      buildingGroup.add(wingSolid1, wingWire1, wingSolid2, wingWire2);
    }

    // Crown/tier (Stepped Architecture)
    if (Math.random() > 0.3 && h > 2.0) {
      const tiers = Math.floor(1 + Math.random() * 3);
      let currentY = h / 2;
      let currentW = w;
      let currentD = d;

      for (let t = 0; t < tiers; t++) {
        currentW *= (0.6 + Math.random() * 0.2);
        currentD *= (0.6 + Math.random() * 0.2);
        const tierH = 0.4 + Math.random() * 0.8;

        const tGeo = new THREE.BoxGeometry(currentW, tierH, currentD, Math.max(1, Math.floor(currentW * 3)), Math.max(1, Math.floor(tierH * 4)), Math.max(1, Math.floor(currentD * 3)));
        const tSolid = new THREE.Mesh(tGeo, wMat);
        const tWireframe = new THREE.LineSegments(new THREE.EdgesGeometry(tGeo), eMat);

        tSolid.position.y = currentY + (tierH / 2);
        tWireframe.position.y = currentY + (tierH / 2);

        buildingGroup.add(tSolid, tWireframe);

        currentY += tierH;

        // Add antenna on the very top tier
        if (t === tiers - 1 && Math.random() > 0.4) {
          const aGeo = new THREE.CylinderGeometry(0.01, 0.03, 0.8 + Math.random() * 1.5, 4);
          const aSolid = new THREE.Mesh(aGeo, eMat); // Use edge color for highlight
          aSolid.position.y = tSolid.position.y + (tierH / 2) + (aGeo.parameters.height / 2);
          buildingGroup.add(aSolid);
        }
      }
    }

    const angle = Math.random() * Math.PI * 2;
    const radiusPos = 1.3 + Math.random() * 5.0; // Keep slightly away from center
    buildingGroup.position.x = Math.cos(angle) * radiusPos;
    buildingGroup.position.z = Math.sin(angle) * radiusPos;
    // Set base of building to Y=0 for scaling, then translate down
    buildingGroup.position.y = -3.5;

    // Adjust inner meshes to scale from bottom up
    buildingGroup.children.forEach(child => {
      child.position.y += (h / 2);
    });

    buildingGroup.rotation.y = Math.random() * Math.PI;

    // Initial scale for animation
    buildingGroup.scale.set(1, 0.001, 1);

    cityGroup.add(buildingGroup);

    // Store data for staggered animation
    buildingsList.push({
      mesh: buildingGroup,
      delay: Math.random() * 3.0, // random start delay
      speed: 0.3 + Math.random() * 0.5,
      buildingState: 0 // 0 to 1
    });
  }

  // --- Tower Crane ---
  const craneGroup = new THREE.Group();
  const craneMat = new THREE.MeshBasicMaterial({ color: 0xD4A853, wireframe: true, transparent: true, opacity: 0.4 });

  // Mast
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.0, 0.2), craneMat);
  mast.position.y = 2.5 - 3.5;
  craneGroup.add(mast);

  // Jib (Front Arm)
  const jib = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.2, 0.2), craneMat);
  jib.position.set(1.9, 5.0 - 3.5, 0);
  craneGroup.add(jib);

  // Counter-jib (Back Arm)
  const counterJib = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.2), craneMat);
  counterJib.position.set(-0.7, 5.0 - 3.5, 0);
  craneGroup.add(counterJib);

  // Hoist Cable
  const cable = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.5, 0.02), craneMat);
  cable.position.set(3.5, 3.75 - 3.5, 0);
  craneGroup.add(cable);

  // Hook block
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), craneMat);
  block.position.set(3.5, 2.5 - 3.5, 0);
  craneGroup.add(block);

  craneGroup.position.set(0, 0, 0); // Center of the city
  cityGroup.add(craneGroup);

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
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    particles.rotation.y = t * 0.04 + mouse.x;
    particles.rotation.x = t * 0.02 + mouse.y;

    // Rotate cityscape slowly
    cityGroup.rotation.y = t * 0.05;

    // Animate building construction (scale up from 0 to 1)
    buildingsList.forEach(b => {
      if (t > b.delay && b.buildingState < 1.0) {
        b.buildingState += b.speed * dt;
        if (b.buildingState > 1.0) b.buildingState = 1.0;

        // Easing function (easeOutExpo-like)
        const scaleY = b.buildingState === 1.0 ? 1.0 : 1 - Math.pow(2, -10 * b.buildingState);
        b.mesh.scale.set(1, Math.max(0.001, scaleY), 1);
      }
    });

    // Rotate crane jib (craneGroup itself) to show it's working
    craneGroup.rotation.y = t * 0.2;

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
