import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { WebGLPathTracer, GradientEquirectTexture, DenoiseMaterial } from 'three-gpu-pathtracer';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

function plasticTextures() {
  const size = 512;
  const normal = new Uint8Array(size * size * 4);
  const roughness = new Uint8Array(size * size * 4);
  const albedo = new Uint8Array(size * size * 4);
  let seed = 1947;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const ridge = Math.cos(y / size * Math.PI * 2 * 12);
      const nx = (random() - 0.5) * 0.055;
      const ny = ridge * 0.65 + (random() - 0.5) * 0.025;
      const nz = Math.sqrt(1 - nx * nx - ny * ny);
      normal.set([Math.round((nx * 0.5 + 0.5) * 255), Math.round((ny * 0.5 + 0.5) * 255), Math.round((nz * 0.5 + 0.5) * 255), 255], i);
      const value = Math.round(222 + ridge * 8 + (random() - 0.5) * 16);
      roughness.set([value, value, value, 255], i);
      const tone = Math.round(241 + ridge * 7 + (random() - 0.5) * 8);
      albedo.set([tone, tone, tone, 255], i);
    }
  }
  return [normal, roughness, albedo].map((data, index) => {
    const texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    if (index === 2) texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  });
}

function printUVs(geometry) {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const uv = new Float32Array(positions.count * 2);
  // A four-millimetre texture patch. Only shading coordinates change.
  for (let i = 0; i < positions.count; i += 3) {
    // Preserve the print texture's original CAD coordinates after the OBJ rotation.
    const nx = Math.abs(normals.getY(i));
    const ny = Math.abs(normals.getX(i));
    const nz = Math.abs(normals.getZ(i));
    for (let j = i; j < i + 3; j++) {
      uv[j * 2] = (nx > Math.max(ny, nz) || ny >= nz ? positions.getZ(j) : -positions.getX(j)) / 4;
      uv[j * 2 + 1] = (nx > Math.max(ny, nz) ? -positions.getX(j) : positions.getY(j) - 60) / 4;
    }
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// Offline image production only; this module is not part of the website bundle.
export async function createStudio({ width = 1536, height = 1024, pixelRatio = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.body.style.cssText = 'margin:0; overflow:hidden';
  document.body.replaceChildren(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f4f3f1');
  const environment = new GradientEquirectTexture(256);
  environment.topColor.set('#ffffff');
  environment.bottomColor.set('#8c8d90');
  environment.update();
  scene.environment = environment;
  scene.environmentIntensity = 0.8;

  const [obj, mtl] = await Promise.all(['obj', 'mtl'].map(async ext => {
    const response = await fetch(`/models/line-holder/model.${ext}`);
    if (!response.ok) throw new Error(`Cannot load model.${ext}`);
    return response.text();
  }));
  const model = new OBJLoader().setMaterials(new MTLLoader().parse(mtl, '')).parse(obj);
  const painted = new Set();
  const converted = new Map();
  const [normalMap, roughnessMap, albedoMap] = plasticTextures();
  model.traverse(mesh => {
    if (!mesh.isMesh) return;
    const convert = original => {
      if (converted.has(original)) return converted.get(original);
      const body = original.name === 'Farba_—_emalia,_połysk_(zielona)';
      const black = original.name.includes('(czarna)');
      const material = new THREE.MeshStandardMaterial({
        name: original.name,
        color: body ? '#ff7900' : black ? '#17191b' : '#bfc2c5',
        roughness: body ? 0.36 : black ? 0.34 : 0.16,
        metalness: body || black ? 0 : 1,
        normalMap: body || black ? normalMap : null,
        map: body || black ? albedoMap : null,
        normalScale: new THREE.Vector2(1, 1),
        roughnessMap: body || black ? roughnessMap : null,
      });
      if (body) painted.add(material);
      converted.set(original, material);
      original.dispose();
      return material;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(convert) : convert(mesh.material);
    if ((Array.isArray(mesh.material) ? mesh.material : [mesh.material]).some(material => material.normalMap)) printUVs(mesh.geometry);
  });
  if (!painted.size) throw new Error('Recolorable body material missing');
  // The path tracer expects one material per mesh. Split OBJ material groups
  // without moving, simplifying, or changing any triangles.
  const multiMaterial = [];
  model.traverse(mesh => { if (mesh.isMesh && Array.isArray(mesh.material)) multiMaterial.push(mesh); });
  for (const mesh of multiMaterial) {
    const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    for (const group of source.groups) {
      const geometry = new THREE.BufferGeometry();
      for (const [name, attribute] of Object.entries(source.attributes)) {
        const start = group.start * attribute.itemSize;
        const end = (group.start + group.count) * attribute.itemSize;
        geometry.setAttribute(name, new THREE.BufferAttribute(attribute.array.slice(start, end), attribute.itemSize, attribute.normalized));
      }
      const part = new THREE.Mesh(geometry, mesh.material[group.materialIndex]);
      part.name = `${mesh.name}-${group.materialIndex}`;
      part.position.copy(mesh.position);
      part.quaternion.copy(mesh.quaternion);
      part.scale.copy(mesh.scale);
      mesh.parent.add(part);
    }
    mesh.removeFromParent();
    source.dispose();
  }
  // The OBJ is already upright (Y-up); only scale and ground it here.
  let bounds = new THREE.Box3().setFromObject(model);
  model.scale.setScalar(2 / bounds.getSize(new THREE.Vector3()).y);
  bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -bounds.min.y, -center.z);
  scene.add(model);

  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.13, 2.05), new THREE.MeshStandardMaterial({ color: '#e4e1da', roughness: 0.83 }));
  pedestal.position.set(-0.1, -0.065, 0.05);
  scene.add(pedestal);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#f7f6f3', roughness: 0.65 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.132;
  scene.add(floor);
  function softbox(position, target, power, width, height) {
    const light = new THREE.RectAreaLight('#ffffff', power, width, height);
    light.position.set(...position);
    light.lookAt(...target);
    scene.add(light);
  }
  softbox([-3, 5, -3], [0, 0.8, 0], 7, 3, 4);
  softbox([-1, 3, 4], [0, 1, 0], 1.5, 2, 3);
  softbox([3, 4, 0], [0, 1, 0], 4, 2, 3);

  const frameHeight = 2.65;
  const camera = new THREE.PerspectiveCamera(18, width / height, 0.01, 100);
  const direction = new THREE.Vector3(-6, 1.8, 2.1);
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
  const target = new THREE.Vector3(0, 0.95, 0).addScaledVector(right, -0.78);
  camera.position.copy(target).addScaledVector(direction.normalize(), frameHeight / (2 * Math.tan(THREE.MathUtils.degToRad(9))));
  camera.lookAt(target);
  const tracer = new WebGLPathTracer(renderer);
  tracer.bounces = 5;
  tracer.filterGlossyFactor = 0.5;
  tracer.renderDelay = 0;
  tracer.fadeDuration = 0;
  tracer.minSamples = 1;
  tracer.tiles.set(1, 1);
  tracer.setScene(scene, camera);
  const denoise = new FullScreenQuad(new DenoiseMaterial({ sigma: 1.5, kSigma: 2, threshold: 0.04 }));

  return {
    async render(hex, samples) {
      painted.forEach(material => material.color.set(hex.toLowerCase() === '#000000' ? '#111213' : hex));
      tracer.updateMaterials();
      tracer.reset();
      while (tracer.samples < samples) {
        tracer.renderSample();
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      denoise.material.map = tracer.target.texture;
      denoise.render(renderer);
      const output = document.createElement('canvas');
      output.width = width;
      output.height = height;
      const context = output.getContext('2d');
      context.imageSmoothingQuality = 'high';
      context.drawImage(renderer.domElement, 0, 0, width, height);
      return output.toDataURL('image/webp', 0.97).split(',')[1];
    },
  };
}
