/**
 * PuriClor – hero 3D scene (Three.js + GLB bottle), CDN modules
 */
(async function () {
  let THREE, GLTFLoader;
  try {
    const threeMod = await import('https://esm.sh/three@0.160.0');
    THREE = threeMod.default || threeMod;
    const loaderMod = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
    GLTFLoader = loaderMod.GLTFLoader;
  } catch (e) {
    console.error('[hero-3d] Failed to load Three.js:', e);
    return;
  }

  const container = document.getElementById('hero-3d');
  if (!container) {
    console.error('[hero-3d] Container #hero-3d not found');
    return;
  }

  function getSize() {
    const w = Math.max(container.clientWidth || 300, 300);
    const h = Math.max(container.clientHeight || 300, 300);
    return { w, h };
  }

  const scene = new THREE.Scene();
  const { w: initW, h: initH } = getSize();

  const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(initW, initH);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);
  const hemisphere = new THREE.HemisphereLight(0xe8f4fc, 0x6b8a9e, 0.4);
  scene.add(hemisphere);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(2, 4, 5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(-3, 2, -4);
  scene.add(rimLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
  fillLight.position.set(-1.5, 0, 2);
  scene.add(fillLight);

  let model = null;
  let modelLoadTime = null;

  const clock = new THREE.Clock();
  const FLOAT_PERIOD_Y = 6;
  const FLOAT_AMP_Y = 0.022;
  const DRIFT_PERIOD_X = 11;
  const DRIFT_AMP_X = 0.08;
  const MICRO_Y_PERIOD = 12;
  const MICRO_Y_AMP = 0.028;
  const MICRO_Z_PERIOD = 10;
  const MICRO_Z_AMP = 0.016;
  const BASE_ROT_Y = (54 * Math.PI) / 180;
  const BASE_ROT_Z = (-22 * Math.PI) / 180;
  const BASE_ROT_X = (18 * Math.PI) / 180;
  const RISE_DURATION = 2.4;
  const RISE_START_Y = -0.28;

  function animate() {
    requestAnimationFrame(animate);
    const now = clock.getElapsedTime();
    if (model) {
      let baseY = 0;
      if (modelLoadTime != null) {
        const riseProgress = Math.min((now - modelLoadTime) / RISE_DURATION, 1);
        const ease = riseProgress * riseProgress * (3 - 2 * riseProgress);
        baseY = RISE_START_Y + (0 - RISE_START_Y) * ease;
      }
      const floatY = Math.sin((now * Math.PI * 2) / FLOAT_PERIOD_Y) * FLOAT_AMP_Y;
      model.position.y = baseY + floatY;
      model.position.x = Math.sin((now * Math.PI * 2) / DRIFT_PERIOD_X) * DRIFT_AMP_X;
      model.rotation.x = BASE_ROT_X;
      model.rotation.y = BASE_ROT_Y + Math.sin((now * Math.PI * 2) / MICRO_Y_PERIOD) * MICRO_Y_AMP;
      model.rotation.z = BASE_ROT_Z + Math.sin((now * Math.PI * 2) / MICRO_Z_PERIOD) * -MICRO_Z_AMP;
    }
    renderer.render(scene, camera);
  }
  animate();

  const modelPath = new URL('../models/puriclor-bottle.glb', import.meta.url).href;
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      model = gltf.scene;

      function applyMaterialFlags(m) {
        m.side = THREE.DoubleSide;
        m.depthWrite = true;
        m.needsUpdate = true;
      }

      model.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
          child.frustumCulled = false;
          if (child.material) {
            const m = child.material;
            if (Array.isArray(m)) m.forEach(applyMaterialFlags);
            else applyMaterialFlags(m);
          }
        }
      });

      if (model.scale.x === 0 && model.scale.y === 0 && model.scale.z === 0) {
        model.scale.setScalar(1);
      }

      scene.add(model);
      model.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);
      model.updateMatrixWorld(true);

      let box2 = new THREE.Box3().setFromObject(model);
      const sphere = new THREE.Sphere();
      box2.getBoundingSphere(sphere);
      let radius = sphere.radius;

      const fovRad = (camera.fov * Math.PI) / 180;
      const heroHeightFraction = 0.35;
      const normalizedRadius = 1;
      const scaleFactor = normalizedRadius / Math.max(radius, 0.01);
      model.scale.multiplyScalar(scaleFactor);
      model.updateMatrixWorld(true);

      box2 = new THREE.Box3().setFromObject(model);
      box2.getBoundingSphere(sphere);
      radius = sphere.radius;

      const safeRadius = Math.max(radius, 0.01);
      const distance = safeRadius / (Math.tan(fovRad / 2) * heroHeightFraction);
      const camDist = Math.max(distance, 0.5);
      camera.position.set(0, 0, camDist);
      camera.lookAt(0, 0, 0);
      camera.near = Math.max(0.001, camDist - safeRadius - 1);
      camera.far = Math.max(camera.near + 1, camDist + safeRadius + 100);
      camera.updateProjectionMatrix();

      const size2 = new THREE.Vector3();
      box2.getSize(size2);
      const shadowGeo = new THREE.PlaneGeometry(1, 1);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x0a0a0a,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.rotation.z = 0.04;
      shadowPlane.position.set(0, -size2.y / 2 - 0.008, 0);
      shadowPlane.scale.set(2.6, 1, 1.5);
      model.add(shadowPlane);

      modelLoadTime = clock.getElapsedTime();
    },
    undefined,
    (err) => {
      console.error('[hero-3d] GLB load failed:', err);
    }
  );

  function onResize() {
    const { w, h } = getSize();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  const ro = new ResizeObserver(onResize);
  ro.observe(container);
})();
