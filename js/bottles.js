import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Fragrance variants configuration: [Display Title, Liquid Color Hex, Phase Offset, Description Subtitle]
const variants = {
  noir:  ['NOIR SULTANA', 0x240612, 0.0, 'Damask Rose · Smoked Oud · Amber'],
  oud:   ['OUD ROYALE',   0x3d1709, 1.8, 'Cambodian Oud · Saffron · Leather'],
  rose:  ['ROSE SULTANA', 0x6e142a, 3.4, 'Taif Rose · Raspberry · Musk'],
  amber: ['AMBER D\'OR',  0x78360f, 5.1, 'Golden Amber · Vanilla · Tonka']
};

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

// Generate high-resolution bespoke parchment label for the bottle
function createLabelTexture(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  // Rich textured parchment background
  ctx.fillStyle = '#f3e8d2';
  ctx.fillRect(0, 0, 640, 760);

  // Subtle parchment gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 760);
  grad.addColorStop(0, 'rgba(255, 250, 240, 0.5)');
  grad.addColorStop(1, 'rgba(214, 180, 119, 0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 760);

  // Elegant double gold foil border
  ctx.strokeStyle = '#b89255';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 592, 712);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, 568, 688);

  // Corner decorative accents
  const corners = [[36, 36], [604, 36], [36, 724], [604, 724]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#b89255';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Typography
  ctx.textAlign = 'center';
  ctx.fillStyle = '#300f1c';

  // Crest Crown Motif
  ctx.strokeStyle = '#b89255';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 100);
  ctx.lineTo(310, 80);
  ctx.lineTo(320, 95);
  ctx.lineTo(330, 80);
  ctx.lineTo(340, 100);
  ctx.closePath();
  ctx.stroke();

  // "HOUSE OF VIVIAN"
  ctx.font = '500 21px Georgia, serif';
  ctx.fillStyle = '#5c2234';
  ctx.fillText('H O U S E   O F   V I V I A N', 320, 150);

  // "EXOTICA"
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillStyle = '#260813';
  ctx.fillText('EXOTICA', 320, 245);

  // Divider line with diamond center
  ctx.strokeStyle = '#b89255';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(130, 290);
  ctx.lineTo(290, 290);
  ctx.moveTo(350, 290);
  ctx.lineTo(510, 290);
  ctx.stroke();

  ctx.fillStyle = '#b89255';
  ctx.beginPath();
  ctx.moveTo(320, 283);
  ctx.lineTo(327, 290);
  ctx.lineTo(320, 297);
  ctx.lineTo(313, 290);
  ctx.closePath();
  ctx.fill();

  // Fragrance Name
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillStyle = '#260813';
  ctx.fillText(name, 320, 410);

  // Concentration and Volume
  ctx.font = '500 19px Georgia, serif';
  ctx.fillStyle = '#6e2b3e';
  ctx.fillText('E A U   D E   P A R F U M', 320, 520);

  ctx.font = '16px "Times New Roman", serif';
  ctx.fillStyle = '#8f6840';
  ctx.fillText('100 ML   ·   3.4 FL. OZ.', 320, 575);

  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText('Maison de Parfum  ·  Lahore', 320, 640);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate soft contactless floating shadow texture
function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(10, 2, 5, 0.72)');
  gradient.addColorStop(0.35, 'rgba(25, 6, 14, 0.45)');
  gradient.addColorStop(0.7, 'rgba(40, 10, 20, 0.16)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate gold stardust particle texture
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  gradient.addColorStop(0, 'rgba(255, 235, 180, 1)');
  gradient.addColorStop(0.3, 'rgba(235, 190, 110, 0.7)');
  gradient.addColorStop(0.7, 'rgba(200, 150, 70, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function mount(host) {
  const variantKey = host.dataset.bottle || 'noir';
  const [name, liquidColor, phase] = variants[variantKey] || variants.noir;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

    // Studio Environment lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.95;
    room.dispose();
    pmrem.dispose();

    // The Floating Root Group (Levitation physics applied here)
    const floatGroup = new THREE.Group();
    scene.add(floatGroup);

    // The Interactive Rotate Group (User drag & tilt applied here)
    const bottleGroup = new THREE.Group();
    floatGroup.add(bottleGroup);

    // Elevated position so it floats in the air above the shadow
    bottleGroup.position.y = 1.32;

    // Luxury Materials
    const gold = new THREE.MeshStandardMaterial({
      color: 0xdeb86b,
      metalness: 0.96,
      roughness: 0.18,
      envMapIntensity: 1.4
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xfffcf7,
      metalness: 0.0,
      roughness: 0.04,
      transmission: 0.97,
      thickness: 0.32,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: 0xfbf2e2,
      attenuationDistance: 1.2
    });

    const liquid = new THREE.MeshPhysicalMaterial({
      color: liquidColor,
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 0.85,
      transmission: 0.25,
      ior: 1.38
    });

    // Helper: Rounded box mesh builder
    function createBox(w, h, d, r, mat, x, y, z) {
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = (mat !== glass);
      bottleGroup.add(mesh);
      return mesh;
    }

    // Outer Glass Flacon
    createBox(1.48, 2.05, 0.82, 0.14, glass, 0, 0, 0);

    // Inner Perfume Liquid Body
    createBox(1.24, 1.68, 0.58, 0.10, liquid, 0, -0.06, 0);

    // Polished Gold Foot Plate
    createBox(1.44, 0.055, 0.78, 0.02, gold, 0, -1.02, 0);

    // Polished Gold Shoulder Cap
    createBox(1.38, 0.045, 0.72, 0.02, gold, 0, 1.02, 0);

    // Collar Neck
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.22, 48), gold);
    collar.position.y = 1.14;
    collar.castShadow = true;
    bottleGroup.add(collar);

    // Fluted Royal Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.52, 64), gold);
    cap.position.y = 1.48;
    cap.castShadow = true;
    bottleGroup.add(cap);

    // Ribbed Fluting along the cap circumference
    const ribGeometry = new THREE.BoxGeometry(0.02, 0.48, 0.028);
    const ribMatrix = new THREE.Object3D();
    const ribs = new THREE.InstancedMesh(ribGeometry, gold, 48);
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      ribMatrix.position.set(Math.sin(angle) * 0.358, 1.48, Math.cos(angle) * 0.358);
      ribMatrix.rotation.y = angle;
      ribMatrix.updateMatrix();
      ribs.setMatrixAt(i, ribMatrix.matrix);
    }
    ribs.castShadow = true;
    bottleGroup.add(ribs);

    // Faceted Top Medallion
    const topCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.37, 0.06, 64), gold);
    topCrown.position.y = 1.76;
    bottleGroup.add(topCrown);

    // Arch Finial on top
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 16), gold);
    finial.position.y = 1.84;
    finial.scale.set(1.1, 0.6, 1.1);
    bottleGroup.add(finial);

    // Front Parchment Label
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.98, 1.14),
      new THREE.MeshStandardMaterial({
        map: createLabelTexture(name),
        roughness: 0.65,
        metalness: 0.05
      })
    );
    labelMesh.position.set(0, -0.02, 0.418);
    bottleGroup.add(labelMesh);

    // Back Label Subtle Silhouette
    const backLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.96, 1.12),
      new THREE.MeshStandardMaterial({
        color: 0xefdfbc,
        roughness: 0.8
      })
    );
    backLabelMesh.position.set(0, -0.02, -0.417);
    backLabelMesh.rotation.y = Math.PI;
    bottleGroup.add(backLabelMesh);

    // Soft Contactless Floating Shadow Plane on the ground below
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createShadowTexture(),
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.08;
    scene.add(shadowMesh);

    // Golden Floating Stardust Air Motes (35 particles floating around the bottle)
    const particleCount = 36;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 3.4;
      particlePositions[i * 3 + 1] = Math.random() * 3.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
      particleSpeeds[i] = 0.003 + Math.random() * 0.006;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: createParticleTexture(),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting Setup
    // Key Warm Spot
    const keyLight = new THREE.SpotLight(0xfff1d6, 75, 22, 0.52, 0.7, 2);
    keyLight.position.set(-3.5, 6.5, 4.5);
    keyLight.target.position.set(0, 1.3, 0);
    scene.add(keyLight, keyLight.target);

    // Golden Rim Backlight
    const rimLight = new THREE.DirectionalLight(0xffdfa8, 3.2);
    rimLight.position.set(3.2, 4.0, -3.0);
    scene.add(rimLight);

    // Soft Ambient Fill Light
    const fillLight = new THREE.DirectionalLight(0xffd5d5, 1.6);
    fillLight.position.set(-3.0, 2.0, 3.0);
    scene.add(fillLight);

    // Top Highlight Light
    const topLight = new THREE.PointLight(0xfff7e6, 2.0, 8);
    topLight.position.set(0, 3.8, 1.2);
    scene.add(topLight);

    // Initial orientation
    bottleGroup.rotation.y = -0.32;

    const canvas = renderer.domElement;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${name} interactive floating 3D perfume bottle. Drag to inspect.`);
    canvas.tabIndex = 0;
    canvas.style.touchAction = 'pan-y';
    canvas.style.cursor = 'grab';
    host.appendChild(canvas);

    // Animation & Interaction State
    const clock = new THREE.Clock();
    let isVisible = false;
    let animFrameId = 0;
    let drag = null;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let failed = false;

    // Main 60fps Floating In Air Animation Loop
    function animate() {
      if (!isVisible || failed) {
        animFrameId = 0;
        return;
      }

      const elapsed = clock.getElapsedTime() + phase;

      // 1. Weightless Air Floating Physics
      if (!motionQuery.matches) {
        // Vertical sinusoidal levitation
        const floatOffset = Math.sin(elapsed * 1.5) * 0.13;
        floatGroup.position.y = floatOffset;

        // Subtle organic roll and pitch
        floatGroup.rotation.z = Math.sin(elapsed * 1.1) * 0.042;
        floatGroup.rotation.x = Math.cos(elapsed * 1.3) * 0.028;

        // Reactive contactless ground shadow:
        // As bottle rises higher, shadow gets larger and softer; as it dips lower, shadow contracts and sharpens
        const shadowScale = 1.0 - floatOffset * 0.45;
        shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
        shadowMat.opacity = 0.46 - floatOffset * 0.35;

        // Animate floating gold stardust motes
        const posArr = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          posArr[i * 3 + 1] += particleSpeeds[i];
          posArr[i * 3 + 0] += Math.sin(elapsed * 0.8 + particlePhases[i]) * 0.0015;
          // Wrap around top
          if (posArr[i * 3 + 1] > 3.4) {
            posArr[i * 3 + 1] = 0.1;
            posArr[i * 3 + 0] = (Math.random() - 0.5) * 3.2;
          }
        }
        particleGeometry.attributes.position.needsUpdate = true;
      }

      // 2. Continuous Idle Air Spin + Inertia Decay
      if (drag) {
        // Being actively rotated by user
        dragVelocityX = 0;
        dragVelocityY = 0;
      } else {
        // Inertia decay if user spun it with momentum
        if (Math.abs(dragVelocityX) > 0.0001) {
          bottleGroup.rotation.y += dragVelocityX;
          dragVelocityX *= 0.94;
        } else {
          // Slow continuous luxury idle spin
          bottleGroup.rotation.y += 0.0065;
        }

        if (Math.abs(dragVelocityY) > 0.0001) {
          bottleGroup.rotation.x = THREE.MathUtils.clamp(bottleGroup.rotation.x + dragVelocityY, -0.22, 0.22);
          dragVelocityY *= 0.92;
        }
      }

      // 3. Smooth Cursor Interactive Tilt (Spring Lerp)
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;
      bottleGroup.position.x = currentTiltX * 0.12;
      bottleGroup.position.z = currentTiltY * 0.08;

      try {
        renderer.render(scene, camera);
      } catch (err) {
        fail(err);
        return;
      }

      animFrameId = requestAnimationFrame(animate);
    }

    function startLoop() {
      if (!animFrameId && isVisible && !failed) {
        animFrameId = requestAnimationFrame(animate);
      }
    }

    function stopLoop() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = 0;
      }
    }

    // Viewport Resize Handler
    function resize() {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, 2.7, Math.max(6.2, 5.2 / camera.aspect));
      camera.lookAt(0, 1.35, 0);
      camera.updateProjectionMatrix();
      if (!animFrameId) renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // Visibility Observer (Stops rendering when scrolled out of view to save battery/GPU)
    const visibilityObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    }, { threshold: 0.05 });
    visibilityObserver.observe(host);

    // Mouse Move Hover Gravity Effect
    host.addEventListener('pointermove', (e) => {
      const rect = host.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetTiltX = THREE.MathUtils.clamp(nx, -1, 1);
      targetTiltY = THREE.MathUtils.clamp(ny, -1, 1);
    });

    host.addEventListener('pointerleave', () => {
      targetTiltX = 0;
      targetTiltY = 0;
    });

    // Interactive Drag to Rotate
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && !e.isPrimary) return;
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, prevX: e.clientX, prevY: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const deltaX = e.clientX - drag.prevX;
      const deltaY = e.clientY - drag.prevY;
      bottleGroup.rotation.y += deltaX * 0.009;
      if (!motionQuery.matches) {
        bottleGroup.rotation.x = THREE.MathUtils.clamp(bottleGroup.rotation.x + deltaY * 0.004, -0.22, 0.22);
      }
      dragVelocityX = deltaX * 0.007;
      dragVelocityY = deltaY * 0.004;
      drag.prevX = e.clientX;
      drag.prevY = e.clientY;
    });

    function releaseDrag() {
      if (!drag) return;
      drag = null;
      canvas.style.cursor = 'grab';
    }

    canvas.addEventListener('pointerup', releaseDrag);
    canvas.addEventListener('pointercancel', releaseDrag);
    canvas.addEventListener('lostpointercapture', releaseDrag);

    // Keyboard Arrow Controls
    canvas.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dragVelocityX = -0.04;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        dragVelocityX = 0.04;
      } else if (e.key === 'Home') {
        e.preventDefault();
        bottleGroup.rotation.set(0, -0.32, 0);
        dragVelocityX = 0;
        dragVelocityY = 0;
      }
    });

    // Quick Manual Rotate Buttons
    const controls = document.createElement('div');
    controls.className = 'model-controls';
    [
      ['Rotate left', -0.3, '←'],
      ['Rotate right', 0.3, '→']
    ].forEach(([label, amount, text]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `${label} ${name}`);
      btn.textContent = text;
      btn.addEventListener('click', () => {
        dragVelocityX = amount * 0.15;
      });
      controls.appendChild(btn);
    });
    host.appendChild(controls);

    function fail(error) {
      if (failed) return;
      failed = true;
      stopLoop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.classList.remove('model-ready');
      canvas.remove();
      renderer.dispose();
      console.warn('3D bottle preview fallback triggered:', error);
    }

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      fail('WebGL context lost');
    });

    resize();
    renderer.render(scene, camera);
    host.classList.add('model-ready');

  } catch (err) {
    renderer?.dispose();
    host.querySelector('canvas')?.remove();
    console.warn('3D bottle preview unavailable:', err);
  }
}

// Progressive enhancement: Mount bottles when scrolled near viewport
const loadObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadObserver.unobserve(entry.target);
      mount(entry.target);
    }
  });
}, { rootMargin: '250px' });

document.querySelectorAll('[data-bottle]').forEach((host) => {
  loadObserver.observe(host);
});
