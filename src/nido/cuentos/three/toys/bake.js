// Horneado de figuras: menos llamadas de dibujo sin cambiar la silueta.
//
// 1. Materiales idénticos DENTRO de una figura pasan a ser uno solo. Nunca
//    entre figuras: el escenario enciende `emissive` en cada material de la
//    figura nombrada (stage.nameActor) y un caché global la contagiaría.
// 2. Las mallas estáticas que cuelgan del mismo pivote articulado (cabeza,
//    brazo, pata…; ver rig-keys.js) y comparten material se funden en una sola
//    geometría expresada en el espacio de ese pivote. Los pivotes siguen
//    moviéndose igual: lo que se funde es lo que ya se movía junto.
import * as THREE from 'three';
import { isRigPivot } from './rig-keys.js';

/** Texturas que se liberan con un material (salvo las compartidas). */
export const TEXTURE_SLOTS = Object.freeze(['map', 'normalMap', 'bumpMap', 'alphaMap', 'emissiveMap']);
// Por debajo de este radio (unidades de figura, ~0.30 de alto) la pieza es un
// brillo, una uña o una pestaña: su sombra no se ve y cuesta un dibujo.
const TINY_SHADOW_RADIUS = 0.006;
const DEFAULT_ON_BEFORE_COMPILE = THREE.Material.prototype.onBeforeCompile;

export const isSharedResource = (resource) => Boolean(resource?.userData?.nidoShared || resource?.userData?.nidoSharedSurface);

const materialsOf = (obj) => (Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : []);

// Propiedades que deben coincidir para fundir dos materiales (las de la
// especificación WP2, más discriminadores de seguridad que hoy valen siempre
// lo mismo en las figuras: si una figura futura los cambia, ya no son iguales).
const MATERIAL_KEY = (
  'type color roughness metalness clearcoat clearcoatRoughness sheen sheenRoughness sheenColor opacity '
  + 'transparent side flatShading emissive emissiveIntensity normalScale map normalMap bumpMap alphaMap '
  + 'bumpScale vertexColors depthWrite depthTest alphaTest blending wireframe visible toneMapped envMapIntensity '
  + 'polygonOffset polygonOffsetFactor polygonOffsetUnits transmission ior thickness specularIntensity specularColor '
  + 'iridescence anisotropy dispersion emissiveMap roughnessMap metalnessMap aoMap envMap name'
).split(' ');
const keyPart = (value) => (value?.isColor ? `${value.r},${value.g},${value.b}` : value?.isVector2 ? `${value.x},${value.y}` : value?.isTexture ? value.uuid : String(value));

function hasCustomBehaviour(material) {
  return Object.keys(material.userData || {}).length > 0
    || material.onBeforeCompile !== DEFAULT_ON_BEFORE_COMPILE
    || Object.prototype.hasOwnProperty.call(material, 'customProgramCacheKey')
    // Un material que libera recursos al desecharse (el relieve del dragón)
    // no puede sustituirse: desechar el duplicado liberaría lo compartido.
    || Boolean(material._listeners?.dispose?.length);
}

/** Clave de igualdad de un material, o null si no debe fusionarse nunca. */
export function materialKey(material) {
  if (!material?.isMaterial || isSharedResource(material) || hasCustomBehaviour(material)) return null;
  return MATERIAL_KEY.map((name) => keyPart(material[name])).join('|');
}

function dedupeMaterials(root) {
  const canonical = new Map();
  const duplicates = new Set();
  const canon = (material) => {
    const key = materialKey(material);
    if (key === null) return material;
    const kept = canonical.get(key);
    if (!kept) {
      canonical.set(key, material);
      return material;
    }
    if (kept !== material) duplicates.add(material);
    return kept;
  };
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.material = Array.isArray(obj.material) ? obj.material.map(canon) : canon(obj.material);
  });
  // Sus texturas (si las hay) son las mismas que usa el material conservado.
  duplicates.forEach((material) => material.dispose());
}

function isCandidate(mesh) {
  if (!mesh.isMesh || mesh.isInstancedMesh || mesh.isSkinnedMesh || mesh.children.length) return false;
  if (isRigPivot(mesh) || mesh.userData.noBake || mesh.morphTargetInfluences?.length) return false;
  if (Array.isArray(mesh.material) || !mesh.material || !mesh.visible || mesh.renderOrder !== 0) return false;
  if (mesh.layers.mask !== 1 || mesh.frustumCulled === false || mesh.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender) return false;
  const geometry = mesh.geometry;
  // Con un solo material three.js dibuja la geometría entera en una llamada e
  // ignora sus grupos (los de Box/Cylinder/Cone solo separan tapas): fundirla
  // no cambia nada. Las mallas multimaterial ya quedaron fuera arriba.
  if (!geometry?.isBufferGeometry || isSharedResource(geometry)) return false;
  if (Object.keys(geometry.morphAttributes).length) return false;
  const names = Object.keys(geometry.attributes);
  if (!names.includes('position') || !names.includes('normal')) return false;
  if (!names.every((name) => name === 'position' || name === 'normal' || name === 'uv')) return false;
  if (geometry.drawRange.start !== 0 || geometry.drawRange.count !== Infinity) return false;
  return names.every((name) => {
    const attribute = geometry.attributes[name];
    return !attribute.isInterleavedBufferAttribute && attribute.itemSize === (name === 'uv' ? 2 : 3);
  });
}

/** Pivote dueño (el antepasado articulado más cercano o la raíz) si todo el camino es visible. */
function ownerOf(mesh, root) {
  let node = mesh.parent;
  while (node && node !== root) {
    if (!node.visible) return null;
    if (isRigPivot(node)) return node;
    node = node.parent;
  }
  return node === root ? root : null;
}

function topLevelUnder(owner, mesh) {
  let node = mesh;
  while (node.parent && node.parent !== owner) node = node.parent;
  return node;
}

const _toOwner = new THREE.Matrix4();
const _normalMatrix = new THREE.Matrix3();
const _vector = new THREE.Vector3();
const _box = new THREE.Box3();

function mergeBucket(owner, meshes) {
  const ownerInverse = new THREE.Matrix4().copy(owner.matrixWorld).invert();
  let vertexCount = 0;
  let indexCount = 0;
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const count = geometry.attributes.position.count;
    vertexCount += count;
    indexCount += geometry.index ? geometry.index.count : count;
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = vertexCount > 65535 ? new Uint32Array(indexCount) : new Uint16Array(indexCount);
  let vertexOffset = 0;
  let indexOffset = 0;
  let castShadow = false;
  let receiveShadow = false;
  const bounds = new THREE.Box3();
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv;
    _toOwner.multiplyMatrices(ownerInverse, mesh.matrixWorld);
    _normalMatrix.getNormalMatrix(_toOwner);
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    bounds.union(_box.copy(geometry.boundingBox).applyMatrix4(_toOwner));
    for (let i = 0; i < position.count; i += 1) {
      const p = (vertexOffset + i) * 3;
      _vector.fromBufferAttribute(position, i).applyMatrix4(_toOwner);
      positions[p] = _vector.x;
      positions[p + 1] = _vector.y;
      positions[p + 2] = _vector.z;
      _vector.fromBufferAttribute(normal, i).applyMatrix3(_normalMatrix).normalize();
      normals[p] = _vector.x;
      normals[p + 1] = _vector.y;
      normals[p + 2] = _vector.z;
      if (uv) {
        uvs[(vertexOffset + i) * 2] = uv.getX(i);
        uvs[(vertexOffset + i) * 2 + 1] = uv.getY(i);
      }
    }
    // Una matriz espejada invierte el sentido de giro: se reordena cada
    // triángulo para que la cara visible siga siendo la exterior.
    const mirrored = _toOwner.determinant() < 0;
    const source = geometry.index;
    const triangles = (source ? source.count : position.count) / 3;
    for (let t = 0; t < triangles; t += 1) {
      const a = source ? source.getX(t * 3) : t * 3;
      const b = source ? source.getX(t * 3 + 1) : t * 3 + 1;
      const c = source ? source.getX(t * 3 + 2) : t * 3 + 2;
      indices[indexOffset] = vertexOffset + a;
      indices[indexOffset + 1] = vertexOffset + (mirrored ? c : b);
      indices[indexOffset + 2] = vertexOffset + (mirrored ? b : c);
      indexOffset += 3;
    }
    vertexOffset += position.count;
    castShadow ||= mesh.castShadow;
    receiveShadow ||= mesh.receiveShadow;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeBoundingSphere();
  // Caja rápida (Box3.setFromObject sin `precise`) igual a la de las piezas
  // sueltas: fit() apoyó la figura en el suelo con esas cajas, y la cámara de
  // cine, la cartela y las pruebas de apoyo siguen midiendo lo mismo.
  merged.boundingBox = bounds;

  const baked = new THREE.Mesh(merged, meshes[0].material);
  baked.name = 'baked';
  baked.receiveShadow = receiveShadow;
  const radius = merged.boundingSphere.radius * owner.matrixWorld.getMaxScaleOnAxis();
  baked.castShadow = castShadow && radius >= TINY_SHADOW_RADIUS;

  // Mismo lugar entre los hijos del pivote que la primera pieza fundida: la
  // esclerótica sigue siendo la primera malla de cada ojo.
  const anchor = topLevelUnder(owner, meshes[0]);
  const at = owner.children.indexOf(anchor);
  owner.add(baked);
  owner.children.splice(owner.children.indexOf(baked), 1);
  owner.children.splice(at, 0, baked);
  baked.updateMatrixWorld(true);

  for (const mesh of meshes) {
    let parent = mesh.parent;
    parent.remove(mesh);
    mesh.geometry.dispose();
    // Grupos sin función que quedan vacíos se retiran (nunca un pivote).
    while (parent && parent !== owner && !parent.children.length && !isRigPivot(parent) && !parent.isMesh) {
      const next = parent.parent;
      next?.remove(parent);
      parent = next;
    }
  }
}

function countDraws(root) {
  let draws = 0;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.visible) return;
    draws += Array.isArray(obj.material) ? Math.max(1, obj.geometry.groups.length) : 1;
  });
  return draws;
}

/**
 * Hornea una figura recién construida (una vez, en buildToy). Devuelve las
 * llamadas de dibujo antes y después. Triángulos, caja y silueta no cambian.
 */
export function bakeToy(root) {
  root.updateMatrixWorld(true);
  const drawsBefore = countDraws(root);
  dedupeMaterials(root);
  const buckets = new Map();
  root.traverse((obj) => {
    if (!isCandidate(obj)) return;
    const owner = ownerOf(obj, root);
    if (!owner) return;
    let byMaterial = buckets.get(owner);
    if (!byMaterial) buckets.set(owner, (byMaterial = new Map()));
    const list = byMaterial.get(obj.material);
    if (list) list.push(obj);
    else byMaterial.set(obj.material, [obj]);
  });
  buckets.forEach((byMaterial, owner) => {
    byMaterial.forEach((meshes) => {
      if (meshes.length >= 2) mergeBucket(owner, meshes);
    });
  });
  return { drawsBefore, drawsAfter: countDraws(root) };
}

/**
 * Libera geometrías, materiales y texturas de un árbol (figura retirada del
 * escenario). Nunca toca recursos marcados `nidoShared`/`nidoSharedSurface`
 * y libera cada recurso una sola vez, aunque varias mallas lo compartan.
 */
export function releaseResources(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((obj) => {
    if (obj.isInstancedMesh) obj.dispose();
    if (obj.geometry && !isSharedResource(obj.geometry)) geometries.add(obj.geometry);
    for (const material of materialsOf(obj)) {
      if (isSharedResource(material)) continue;
      materials.add(material);
      for (const slot of TEXTURE_SLOTS) {
        const texture = material[slot];
        if (texture?.isTexture && !isSharedResource(texture)) textures.add(texture);
      }
    }
  });
  // Un material puede liberar su propia textura al desecharse (el dragón):
  // se anota para no liberarla dos veces.
  const released = new Set();
  const mark = (event) => released.add(event.target);
  textures.forEach((texture) => texture.addEventListener('dispose', mark));
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => {
    if (!released.has(texture)) texture.dispose();
    texture.removeEventListener('dispose', mark);
  });
  return { geometries: geometries.size, materials: materials.size, textures: textures.size };
}
