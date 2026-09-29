// Seguimiento de lectura sobre la hoja del libro 3D sin volver a subir la
// textura de la página (1024×1448 RGBA, ~5,9 MB) en cada palabra.
//
// Antes (textures.js, highlightStoryWord) se repintaba el lienzo con un
// «multiply» y se subía entero. Ahora hay dos dibujos pegados a la hoja:
// - las palabras ya leídas: un InstancedMesh de rectángulos;
// - la palabra que suena: un rectángulo de esquinas redondeadas.
// Ambos vuelven a sombrear la MISMA hoja (misma textura ya subida, mismo
// material, luz, sombras y tono) con el color de la hoja multiplicado por el
// tinte. Así el resultado es el del lienzo multiplicado, antes de la luz y del
// mapeo de tonos, tanto en el modo libro como en el de cine. Un «multiply»
// sobre la imagen final oscurecía el ámbar (el papel iluminado se comprime).
// Al cambiar de palabra solo cambia cuántas instancias se dibujan y dónde
// está el rectángulo activo; las matrices se suben una vez por página.
import * as THREE from 'three';

// Tintes en sRGB, como los pintaba el lienzo: `readColor` es el blanco llevado
// un 55 % hacia #e2c480 (rgba(226,196,128,.55) en «multiply»); la palabra
// activa, #f4c95d opaco.
const READ_RGB = [226, 196, 128].map((c) => (255 + (c - 255) * 0.55) / 255);
export const HIGHLIGHT = Object.freeze({
  readColor: new THREE.Color().setRGB(READ_RGB[0], READ_RGB[1], READ_RGB[2], THREE.SRGBColorSpace),
  activeColor: new THREE.Color('#f4c95d'),
  capacity: 200,
  // Casi coplanar con la hoja: la textura se lee en el mismo punto que se ve
  // debajo (0.0006 desplazaba el texto ~1 px en la vista oblicua). El
  // polygonOffset −2 de los materiales es lo que gana la prueba de
  // profundidad; esta holgura mínima solo la refuerza.
  lift: 0.00002,
  easeMs: 90,
  // Radio de las esquinas del rectángulo activo, en píxeles del lienzo.
  cornerPx: 14,
});

/** Rectángulo de la palabra activa (roundRect(x-10, y, w+20, h)) en el plano de la hoja. */
export function wordBoxToPlane(box, canvasW, canvasH, planeW, planeH) {
  return {
    x: ((box.x + box.w / 2) / canvasW - 0.5) * planeW,
    y: (0.5 - (box.y + box.h / 2) / canvasH) * planeH,
    w: ((box.w + 20) / canvasW) * planeW,
    h: (box.h / canvasH) * planeH,
  };
}

/** Rectángulo de una palabra leída (fillRect(x-3, y+.2h, w+6, .72h)) en el plano de la hoja. */
export function readBoxToPlane(box, canvasW, canvasH, planeW, planeH) {
  return {
    x: ((box.x + box.w / 2) / canvasW - 0.5) * planeW,
    y: (0.5 - (box.y + box.h * 0.56) / canvasH) * planeH,
    w: ((box.w + 6) / canvasW) * planeW,
    h: ((box.h * 0.72) / canvasH) * planeH,
  };
}

// Máscara compartida de 64×32 con las esquinas redondeadas (canal verde =
// opacidad). Se estira en nueve partes: las esquinas conservan su radio con
// palabras cortas o largas.
const CORNER_U = HIGHLIGHT.cornerPx / 64;
const CORNER_V = HIGHLIGHT.cornerPx / 32;
let roundedMask;
function sharedRoundedMask() {
  if (roundedMask !== undefined) return roundedMask;
  roundedMask = null;
  if (typeof document === 'undefined') return roundedMask;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return roundedMask;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 32);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(0, 0, 64, 32, HIGHLIGHT.cornerPx);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.userData.nidoShared = true;
  roundedMask = texture;
  return roundedMask;
}

/**
 * Copia del material de la hoja con el color multiplicado por `tint`. El
 * vértice calcula la coordenada de textura desde su posición sobre la hoja
 * (las instancias no tienen uv propias), así se lee el mismo texel de la
 * página que hay debajo.
 */
export function pageShadeMaterial(pageMaterial, tint, planeSize, extra = {}) {
  const material = pageMaterial?.isMaterial ? pageMaterial.clone() : new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.92 });
  material.color.multiply(tint);
  Object.assign(material, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide }, extra);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.hlPlaneSize = planeSize;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform vec2 hlPlaneSize;')
      .replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        '#ifdef USE_MAP',
        '  #ifdef USE_INSTANCING',
        '    vec2 hlPagePos = ( instanceMatrix * vec4( transformed, 1.0 ) ).xy;',
        '  #else',
        '    vec2 hlPagePos = transformed.xy;',
        '  #endif',
        '  vMapUv = ( mapTransform * vec3( hlPagePos / hlPlaneSize + 0.5, 1.0 ) ).xy;',
        '#endif',
      ].join('\n'));
  };
  return material;
}

// Malla de 4×4 vértices: las filas y columnas interiores marcan el radio de
// las esquinas, de modo que solo se estira la parte central. Las posiciones
// van ya en coordenadas de la hoja (la malla queda en el origen).
function nineSliceGeometry() {
  const geometry = new THREE.BufferGeometry();
  const us = [0, CORNER_U, 1 - CORNER_U, 1];
  const vs = [1, 1 - CORNER_V, CORNER_V, 0];
  const uv = [];
  const normal = [];
  const index = [];
  for (let iy = 0; iy < 4; iy += 1) {
    for (let ix = 0; ix < 4; ix += 1) {
      uv.push(us[ix], vs[iy]);
      normal.push(0, 0, 1);
      if (ix < 3 && iy < 3) {
        const a = iy * 4 + ix;
        index.push(a, a + 4, a + 1, a + 1, a + 4, a + 5);
      }
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(16 * 3), 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  return geometry;
}

function layoutNineSlice(geometry, rect, cornerW, cornerH) {
  const { x, y, w, h } = rect;
  const cx = Math.min(cornerW, w / 2);
  const cy = Math.min(cornerH, h / 2);
  const xs = [x - w / 2, x - w / 2 + cx, x + w / 2 - cx, x + w / 2];
  const ys = [y + h / 2, y + h / 2 - cy, y - h / 2 + cy, y - h / 2];
  const position = geometry.attributes.position;
  for (let iy = 0; iy < 4; iy += 1) for (let ix = 0; ix < 4; ix += 1) position.setXYZ(iy * 4 + ix, xs[ix], ys[iy], 0);
  position.needsUpdate = true;
}

const easeOut = (k) => 1 - (1 - k) * (1 - k);

/**
 * `storyPageMesh` es la hoja de texto del libro (book3d.js, `storyPage`).
 * `reduceMotion()` y `now()` se inyectan (pruebas y movimiento reducido).
 */
export function createWordHighlight(storyPageMesh, { reduceMotion = () => false, now = () => globalThis.performance?.now?.() ?? Date.now() } = {}) {
  const planeW = storyPageMesh?.geometry?.parameters?.width ?? 1;
  const planeH = storyPageMesh?.geometry?.parameters?.height ?? 1;
  const planeSize = { value: new THREE.Vector2(planeW, planeH) };
  const pageMaterial = storyPageMesh?.material;
  const group = new THREE.Group();
  group.name = 'word-highlight';
  group.position.z = HIGHLIGHT.lift;
  storyPageMesh?.add(group);

  const unitPlane = new THREE.PlaneGeometry(1, 1);
  const readMaterial = pageShadeMaterial(pageMaterial, HIGHLIGHT.readColor, planeSize);
  let capacity = HIGHLIGHT.capacity;
  let read = createReadMesh(capacity);

  const mask = sharedRoundedMask();
  const activeMaterial = pageShadeMaterial(pageMaterial, HIGHLIGHT.activeColor, planeSize, mask ? { alphaMap: mask, transparent: true, depthWrite: false } : {});
  const activeGeometry = nineSliceGeometry();
  const active = new THREE.Mesh(activeGeometry, activeMaterial);
  active.name = 'word-highlight-active';
  active.visible = false;
  active.frustumCulled = false;
  active.receiveShadow = true;
  group.add(active);

  let boxes = [];
  let canvasW = 1;
  let canvasH = 1;
  let index = -1;
  // Rectángulo activo mostrado ahora y su animación hacia la palabra nueva.
  const shown = { x: 0, y: 0, w: 0, h: 0 };
  let tween = null;

  function createReadMesh(size) {
    const mesh = new THREE.InstancedMesh(unitPlane, readMaterial, size);
    mesh.name = 'word-highlight-read';
    mesh.count = 0;
    mesh.visible = false;
    mesh.receiveShadow = true;
    // Las matrices cambian por página; la hoja entera siempre está en cuadro
    // cuando se lee, así que no vale la pena recalcular esferas envolventes.
    mesh.frustumCulled = false;
    group.add(mesh);
    return mesh;
  }

  // Los dos materiales leen la textura que la hoja tenga ahora.
  function followPageTexture() {
    const map = pageMaterial?.map ?? null;
    for (const material of [readMaterial, activeMaterial]) {
      if (material.map === map) continue;
      if (Boolean(material.map) !== Boolean(map)) material.needsUpdate = true;
      material.map = map;
    }
  }

  const cornerW = () => (HIGHLIGHT.cornerPx / canvasW) * planeW;
  const cornerH = () => (HIGHLIGHT.cornerPx / canvasH) * planeH;
  function place(rect) {
    Object.assign(shown, rect);
    layoutNineSlice(activeGeometry, rect, cornerW(), cornerH());
  }

  function setWords(nextBoxes = [], width = 1, height = 1) {
    boxes = Array.isArray(nextBoxes) ? nextBoxes : [];
    canvasW = width || 1;
    canvasH = height || 1;
    followPageTexture();
    if (boxes.length > capacity) {
      group.remove(read);
      read.dispose();
      capacity = boxes.length;
      read = createReadMesh(capacity);
    }
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3(1, 1, 1);
    const rotation = new THREE.Quaternion();
    boxes.forEach((box, i) => {
      const rect = readBoxToPlane(box, canvasW, canvasH, planeW, planeH);
      position.set(rect.x, rect.y, 0);
      scale.set(rect.w, rect.h, 1);
      read.setMatrixAt(i, matrix.compose(position, rotation, scale));
    });
    if (boxes.length) read.instanceMatrix.needsUpdate = true;
    index = -2;
    setIndex(-1);
  }

  function setIndex(next) {
    const value = Number.isInteger(next) ? next : -1;
    if (value === index) return false;
    const previous = index;
    index = value;
    const readCount = Math.max(0, Math.min(value, boxes.length));
    read.count = readCount;
    read.visible = readCount > 0;
    const box = value >= 0 ? boxes[value] : null;
    if (!box) {
      active.visible = false;
      tween = null;
      return true;
    }
    const target = wordBoxToPlane(box, canvasW, canvasH, planeW, planeH);
    const animate = active.visible && previous >= 0 && !reduceMotion() && HIGHLIGHT.easeMs > 0;
    active.visible = true;
    if (animate) tween = { from: { ...shown }, to: target, start: now() };
    else {
      tween = null;
      place(target);
    }
    return true;
  }

  /** Avanza la animación del rectángulo activo (una vez por fotograma). */
  function update() {
    if (!tween) return false;
    const k = Math.min(1, (now() - tween.start) / HIGHLIGHT.easeMs);
    const e = easeOut(k);
    const { from, to } = tween;
    place({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
    if (k >= 1) tween = null;
    return true;
  }

  function dispose() {
    group.parent?.remove(group);
    read.dispose();
    unitPlane.dispose();
    readMaterial.dispose();
    activeGeometry.dispose();
    activeMaterial.dispose();
  }

  return {
    setWords,
    setIndex,
    update,
    dispose,
    get index() {
      return index;
    },
    get hasWords() {
      return boxes.length > 0;
    },
    /** Rectángulo activo mostrado (coordenadas de la hoja), para pruebas. */
    get activeRect() {
      return active.visible ? { ...shown } : null;
    },
    /** Para pruebas y depuración. */
    get meshes() {
      return { group, read, active };
    },
  };
}
