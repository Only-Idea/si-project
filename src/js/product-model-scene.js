import {
  Box3, Color, DirectionalLight, HemisphereLight, MeshStandardMaterial,
  PerspectiveCamera, Scene, Spherical, Vector3, WebGLRenderer,
} from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const modelRoot = `${import.meta.env.BASE_URL}models/line-holder/`;
const bodyMaterial = 'Farba_—_emalia,_połysk_(zielona)';

export async function createProductModel(host, { label, onContextLost }) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', label);
  host.replaceChildren(canvas);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.01, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minDistance = 1.5;
  controls.maxDistance = 9;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI - 0.05;
  controls.zoomSpeed = 0.8;
  const painted = new Set();
  const materials = new Set();
  let visible = false;
  let disposed = false;
  let object;
  let resizeObserver;
  let defaultDistance = 4;

  scene.add(new HemisphereLight(0xffffff, 0xa3b1c3, 2.8));
  for (const [position, intensity] of [[[3, 5, 4], 3.2], [[-4, 1, -2], 2], [[1, -3, 2], 0.8]]) {
    const light = new DirectionalLight(0xffffff, intensity);
    light.position.set(...position);
    scene.add(light);
  }

  // Render only when the user changes the view, finish, or viewport size.
  function render() {
    if (!disposed && visible && !document.hidden) renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || disposed) return;
    camera.aspect = width / height;
    const fov = camera.fov * Math.PI / 180;
    const limitingFov = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect));
    const fittedDistance = 1.2 / Math.sin(limitingFov / 2);
    camera.position.sub(controls.target).multiplyScalar(fittedDistance / defaultDistance).add(controls.target);
    defaultDistance = fittedDistance;
    controls.maxDistance = Math.max(9, defaultDistance * 2);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  function reset() {
    camera.position.set(-1.5, 0.85, 1.1).normalize().multiplyScalar(defaultDistance);
    controls.target.set(0, 0, 0);
    controls.update();
    render();
  }
  function action(name) {
    if (name === 'reset') return reset();
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new Spherical().setFromVector3(offset);
    if (name === 'left') spherical.theta -= Math.PI / 8;
    if (name === 'right') spherical.theta += Math.PI / 8;
    if (name === 'up') spherical.phi -= Math.PI / 12;
    if (name === 'down') spherical.phi += Math.PI / 12;
    if (name === 'in') spherical.radius *= 0.8;
    if (name === 'out') spherical.radius /= 0.8;
    spherical.phi = Math.max(controls.minPolarAngle, Math.min(controls.maxPolarAngle, spherical.phi));
    spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, spherical.radius));
    camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
    controls.update();
    render();
  }
  function keydown(event) {
    const name = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', Home: 'reset' }[event.key];
    if (!name) return;
    event.preventDefault();
    action(name);
  }
  function contextLost(event) {
    event.preventDefault();
    onContextLost();
  }
  function dispose() {
    disposed = true;
    resizeObserver?.disconnect();
    controls.dispose();
    controls.removeEventListener('change', render);
    canvas.removeEventListener('keydown', keydown);
    canvas.removeEventListener('webglcontextlost', contextLost);
    document.removeEventListener('visibilitychange', render);
    object?.traverse(child => child.geometry?.dispose());
    materials.forEach(material => material.dispose());
    renderer.dispose();
    canvas.remove();
  }

  try {
    const [mtlText, objText] = await Promise.all(['model.mtl', 'model.obj'].map(async file => {
      const response = await fetch(modelRoot + file);
      if (!response.ok) throw new Error(`Could not load ${file}`);
      return response.text();
    }));
    const library = new MTLLoader().parse(mtlText, modelRoot);
    object = new OBJLoader().setMaterials(library).parse(objText);
    const converted = new Map();
    object.traverse(child => {
      if (!child.isMesh) return;
      function convert(original) {
        if (converted.has(original)) return converted.get(original);
        const isBody = original.name === bodyMaterial;
        const isBlack = original.name.includes('(czarna)');
        const material = new MeshStandardMaterial({
          name: original.name,
          color: original.color,
          metalness: isBody || isBlack ? 0 : 0.65,
          roughness: isBody || isBlack ? 0.48 : 0.32,
        });
        if (isBody) painted.add(material);
        materials.add(material);
        converted.set(original, material);
        original.dispose();
        return material;
      }
      child.material = Array.isArray(child.material) ? child.material.map(convert) : convert(child.material);
    });
    if (!painted.size) throw new Error('The model is missing its body material');
    const bounds = new Box3().setFromObject(object);
    const size = bounds.getSize(new Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    object.position.copy(bounds.getCenter(new Vector3())).multiplyScalar(-scale);
    object.scale.setScalar(scale);
    scene.add(object);
    controls.addEventListener('change', render);
    canvas.addEventListener('keydown', keydown);
    canvas.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', render);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    reset();
    return {
      action,
      setColor(color) {
        painted.forEach(material => material.color.copy(new Color(color.hex)));
        render();
      },
      setVisible(value) {
        visible = value;
        controls.enabled = value;
        if (value) { resize(); render(); }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
