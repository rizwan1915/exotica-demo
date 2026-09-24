import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Fragrance variants configuration: [Display Title, Liquid Color Hex, Phase Offset, Description Subtitle]
const variants = {
  noir: ["NOIR SULTANA", 0x240612, 0.0, "Damask Rose · Smoked Oud · Amber"],
  oud: ["OUD ROYALE", 0x3d1709, 1.8, "Cambodian Oud · Saffron · Leather"],
  rose: ["ROSE SULTANA", 0x6e142a, 3.4, "Taif Rose · Raspberry · Musk"],
  amber: ["AMBER D'OR", 0x78360f, 5.1, "Golden Amber · Vanilla · Tonka"],
};

const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

// Generate high-resolution bespoke parchment label for the bottle
function createLabelTexture(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");

  // Rich textured parchment background
  ctx.fillStyle = "#f3e8d2";
  ctx.fillRect(0, 0, 640, 760);

  // Subtle parchment gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 760);
  grad.addColorStop(0, "rgba(255, 250, 240, 0.5)");
  grad.addColorStop(1, "rgba(214, 180, 119, 0.25)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 760);

  // Elegant double gold foil border
  ctx.strokeStyle = "#b89255";
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 592, 712);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, 568, 688);

  // Corner decorative accents
  const corners = [
    [36, 36],
    [604, 36],
    [36, 724],
    [604, 724],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = "#b89255";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Typography
  ctx.textAlign = "center";
  ctx.fillStyle = "#300f1c";

  // Crest Crown Motif
  ctx.strokeStyle = "#b89255";
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
  ctx.font = "500 21px Georgia, serif";
  ctx.fillStyle = "#5c2234";
  ctx.fillText("H O U S E   O F   V I V I A N", 320, 150);

  // "EXOTICA"
  ctx.font = "bold 64px Georgia, serif";
  ctx.fillStyle = "#260813";
  ctx.fillText("EXOTICA", 320, 245);

  // Divider line with diamond center
  ctx.strokeStyle = "#b89255";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(130, 290);
  ctx.lineTo(290, 290);
  ctx.moveTo(350, 290);
  ctx.lineTo(510, 290);
  ctx.stroke();

  ctx.fillStyle = "#b89255";
  ctx.beginPath();
  ctx.moveTo(320, 283);
  ctx.lineTo(327, 290);
  ctx.lineTo(320, 297);
  ctx.lineTo(313, 290);
  ctx.closePath();
  ctx.fill();

  // Fragrance Name
  ctx.font = "bold 38px Georgia, serif";
  ctx.fillStyle = "#260813";
  ctx.fillText(name, 320, 410);

  // Concentration and Volume
  ctx.font = "500 19px Georgia, serif";
  ctx.fillStyle = "#6e2b3e";
  ctx.fillText("E A U   D E   P A R F U M", 320, 520);

  ctx.font = '16px "Times New Roman", serif';
  ctx.fillStyle = "#8f6840";
  ctx.fillText("100 ML   ·   3.4 FL. OZ.", 320, 575);

  ctx.font = "italic 15px Georgia, serif";
  ctx.fillText("Maison de Parfum  ·  Lahore", 320, 640);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate soft contactless floating shadow texture
function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, "rgba(10, 2, 5, 0.72)");
  gradient.addColorStop(0.35, "rgba(25, 6, 14, 0.45)");
  gradient.addColorStop(0.7, "rgba(40, 10, 20, 0.16)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate gold stardust particle texture
function createParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255, 235, 180, 1)");
  gradient.addColorStop(0.3, "rgba(235, 190, 110, 0.7)");
  gradient.addColorStop(0.7, "rgba(200, 150, 70, 0.2)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function mount(host, { poster = false } = {}) {
  const variantKey = host.dataset.bottle || "noir";
  const [name, liquidColor, phase] = variants[variantKey] || variants.noir;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: poster,
    });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = false;
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
      envMapIntensity: 1.4,
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xfffcf7,
      metalness: 0.0,
      roughness: 0.04,
      transmission: 0,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      thickness: 0.32,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: 0xfbf2e2,
      attenuationDistance: 1.2,
    });

    const liquid = new THREE.MeshPhysicalMaterial({
      color: liquidColor,
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 0.85,
      transmission: 0,
      ior: 1.38,
    });

    // Helper: Rounded box mesh builder
    function createBox(w, h, d, r, mat, x, y, z) {
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = mat !== glass;
      bottleGroup.add(mesh);
      return mesh;
    }

    // Outer Glass Flacon
    createBox(1.48, 2.05, 0.82, 0.14, glass, 0, 0, 0);

    // Inner Perfume Liquid Body
    createBox(1.24, 1.68, 0.58, 0.1, liquid, 0, -0.06, 0);

    // Polished Gold Foot Plate
    createBox(1.44, 0.055, 0.78, 0.02, gold, 0, -1.02, 0);

    // Polished Gold Shoulder Cap
    createBox(1.38, 0.045, 0.72, 0.02, gold, 0, 1.02, 0);

    // Collar Neck
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.22, 48),
      gold,
    );
    collar.position.y = 1.14;
    collar.castShadow = true;
    bottleGroup.add(collar);

    // Fluted Royal Cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.52, 64),
      gold,
    );
    cap.position.y = 1.48;
    cap.castShadow = true;
    bottleGroup.add(cap);

    // Ribbed Fluting along the cap circumference
    const ribGeometry = new THREE.BoxGeometry(0.02, 0.48, 0.028);
    const ribMatrix = new THREE.Object3D();
    const ribs = new THREE.InstancedMesh(ribGeometry, gold, 48);
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      ribMatrix.position.set(
        Math.sin(angle) * 0.358,
        1.48,
        Math.cos(angle) * 0.358,
      );
      ribMatrix.rotation.y = angle;
      ribMatrix.updateMatrix();
      ribs.setMatrixAt(i, ribMatrix.matrix);
    }
    ribs.castShadow = true;
    bottleGroup.add(ribs);

    // Faceted Top Medallion
    const topCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.37, 0.06, 64),
      gold,
    );
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
      new THREE.MeshBasicMaterial({
        map: createLabelTexture(name),
        toneMapped: false,
      }),
    );
    labelMesh.position.set(0, -0.02, 0.418);
    bottleGroup.add(labelMesh);

    // Back Label Subtle Silhouette
    const backLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.96, 1.12),
      new THREE.MeshStandardMaterial({
        color: 0xefdfbc,
        roughness: 0.8,
      }),
    );
    backLabelMesh.position.set(0, -0.02, -0.417);
    backLabelMesh.rotation.y = Math.PI;
    bottleGroup.add(backLabelMesh);

    // Soft Contactless Floating Shadow Plane on the ground below
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createShadowTexture(),
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.0),
      shadowMat,
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.08;
    scene.add(shadowMesh);

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
    bottleGroup.rotation.y = -0.22;

    const canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      `${name} interactive floating 3D perfume bottle. Drag to inspect.`,
    );
    canvas.tabIndex = 0;
    canvas.style.touchAction = "pan-y";
    canvas.style.cursor = "grab";
    host.appendChild(canvas);

    let frame = 0,
      visible = false,
      paused = false,
      drag = null;
    let rotation = -0.22,
      last = 0,
      elapsed = 0,
      disposed = false;
    canvas.setAttribute(
      "aria-label",
      `${name} bottle. Use left and right arrow keys to rotate.`,
    );
    function draw() {
      renderer.render(scene, camera);
    }
    function resize() {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, 2.45, Math.max(7.2, 4.2 / camera.aspect));
      camera.lookAt(0, 1.6, 0);
      camera.updateProjectionMatrix();
      draw();
    }
    function tick(now) {
      frame = 0;
      if (
        disposed ||
        !visible ||
        document.hidden ||
        paused ||
        motionQuery.matches ||
        poster
      )
        return;
      if (now - last >= 32) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        elapsed += dt;
        bottleGroup.rotation.y =
          rotation + (drag ? 0 : Math.sin(elapsed * 0.35) * 0.085);
        floatGroup.position.y = Math.sin(elapsed * 0.65) * 0.025;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (
        !disposed &&
        visible &&
        !document.hidden &&
        !paused &&
        !motionQuery.matches &&
        !poster
      ) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", sync);
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      drag = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    });
    canvas.addEventListener("pointermove", (e) => {
      if (drag === null) return;
      rotation = THREE.MathUtils.clamp(
        rotation + (e.clientX - drag) * 0.006,
        -0.9,
        0.9,
      );
      drag = e.clientX;
      bottleGroup.rotation.y = rotation;
      draw();
    });
    function release() {
      drag = null;
      canvas.style.cursor = "grab";
    }
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
      canvas.addEventListener(type, release),
    );
    canvas.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) return;
      e.preventDefault();
      rotation =
        e.key === "Home"
          ? -0.22
          : THREE.MathUtils.clamp(
              rotation + (e.key === "ArrowLeft" ? -0.15 : 0.15),
              -0.9,
              0.9,
            );
      bottleGroup.rotation.y = rotation;
      draw();
    });
    const pause = host.parentElement.querySelector("[data-motion-toggle]");
    function toggle() {
      paused = !paused;
      pause.textContent = paused ? "Resume motion" : "Pause motion";
      pause.setAttribute("aria-pressed", String(paused));
      sync();
    }
    pause?.addEventListener("click", toggle);
    if (pause && !poster) pause.hidden = false;
    function dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", sync);
      pause?.removeEventListener("click", toggle);
      if (pause) pause.hidden = true;
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        for (const mat of [].concat(obj.material || [])) {
          mat.map?.dispose();
          mat.dispose();
        }
      });
      environment.dispose();
      renderer.dispose();
      canvas.remove();
      host.classList.remove("model-ready");
    }
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      dispose();
    });
    resize();
    host.classList.add("model-ready");
    return dispose;
  } catch (error) {
    renderer?.dispose();
    host.querySelector("canvas")?.remove();
    console.warn("Bottle image retained: 3D preview unavailable.", error);
    return () => {};
  }
}
