import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BOOKS } from '../../src/nido/cuentos/cuentos-data.js';
import { buildToy } from '../../src/nido/cuentos/three/toys/index.js';
import { RIG_KEYS, isRigPivot } from '../../src/nido/cuentos/three/toys/rig-keys.js';
import { bakeToy, materialKey, releaseResources } from '../../src/nido/cuentos/three/toys/bake.js';

// El horneado (toys/bake.js) funde piezas estáticas por pivote y material.
// Cada figura del reparto se construye una vez sin hornear y otra horneada, y
// se comparan: misma silueta, mismos triángulos, mismas articulaciones.
const cast = [...new Set(BOOKS.flatMap((book) => book.pages.flatMap((page) => page.cast || [])))];
const pairs = cast.map((id) => ({ id, raw: buildToy(id, { bake: false }), baked: buildToy(id) }));

const meshes = (root) => { const list = []; root.traverse((obj) => { if (obj.isMesh) list.push(obj); }); return list; };
const tagged = (root, key) => { const list = []; root.traverse((obj) => { if (obj.userData[key]) list.push(obj); }); return list; };
function triangles(root) {
  return meshes(root).reduce((sum, obj) => sum + ((obj.geometry.index?.count ?? obj.geometry.attributes.position.count) / 3) * (obj.isInstancedMesh ? obj.count : 1), 0);
}
function ownerOf(obj, root) {
  let node = obj.parent;
  while (node && node !== root && !isRigPivot(node)) node = node.parent;
  return node || root;
}
// Triángulos cuya cara geométrica contradice sus normales: el horneado no
// puede crear ninguno nuevo (matrices espejadas, geometría sin índice).
function flippedTriangles(root) {
  let flipped = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), face = new THREE.Vector3();
  for (const obj of meshes(root)) {
    if (obj.isInstancedMesh) continue;
    const { position, normal } = obj.geometry.attributes;
    const index = obj.geometry.index;
    const count = index ? index.count : position.count;
    const det = obj.matrixWorld.determinant();
    for (let i = 0; i < count; i += 3) {
      const [ia, ib, ic] = [0, 1, 2].map((k) => (index ? index.getX(i + k) : i + k));
      a.fromBufferAttribute(position, ia).applyMatrix4(obj.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(obj.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(obj.matrixWorld);
      face.subVectors(c, b).cross(a.clone().sub(b));
      if (face.lengthSq() < 1e-20) continue;
      const nm = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
      n.fromBufferAttribute(normal, ia).add(b.fromBufferAttribute(normal, ib)).add(c.fromBufferAttribute(normal, ic)).applyMatrix3(nm);
      // three.js invierte el sentido de las caras si la malla está espejada.
      if (face.dot(n) * Math.sign(det || 1) < 0) flipped += 1;
    }
  }
  return flipped;
}

test('el horneado conserva silueta, triángulos y articulaciones de cada figura', () => {
  for (const { id, raw, baked } of pairs) {
    raw.updateMatrixWorld(true);
    baked.updateMatrixWorld(true);
    // Silueta real (vértices): idéntica.
    const exactRaw = new THREE.Box3().setFromObject(raw, true);
    const exactBaked = new THREE.Box3().setFromObject(baked, true);
    assert.ok(exactRaw.min.distanceTo(exactBaked.min) < 1e-6 && exactRaw.max.distanceTo(exactBaked.max) < 1e-6, `${id}: la silueta cambió`);
    // Caja rápida (la que usó fit() para apoyar la figura): misma altura y
    // apoyo; nunca más estrecha, para que la cartela y el raycast no recorten.
    const quickRaw = new THREE.Box3().setFromObject(raw);
    const quickBaked = new THREE.Box3().setFromObject(baked);
    assert.ok(Math.abs(quickRaw.min.y - quickBaked.min.y) < 1e-6 && Math.abs(quickRaw.max.y - quickBaked.max.y) < 1e-6, `${id}: altura o apoyo distintos`);
    assert.ok(quickBaked.clone().expandByScalar(1e-6).containsBox(quickRaw), `${id}: caja rápida más estrecha que la original`);
    assert.equal(triangles(baked), triangles(raw), `${id}: triángulos distintos`);
    for (const key of RIG_KEYS) assert.equal(tagged(baked, key).length, tagged(raw, key).length, `${id}: pivotes «${key}»`);
    assert.deepEqual(baked.userData.sculpted, raw.userData.sculpted, `${id}: metadatos de anatomía`);
    assert.ok(meshes(baked).length <= meshes(raw).length, `${id}: el horneado no puede sumar dibujos`);
  }
});

test('las geometrías fundidas son finitas y conservan el sentido de sus caras', () => {
  for (const { id, raw, baked } of pairs) {
    for (const obj of meshes(baked)) {
      if (obj.name !== 'baked') continue;
      for (const name of ['position', 'normal', 'uv']) {
        const values = obj.geometry.attributes[name]?.array;
        assert.ok(values, `${id}: falta ${name}`);
        for (const value of values) assert.ok(Number.isFinite(value), `${id}: ${name} no finito`);
      }
      assert.ok(obj.geometry.boundingSphere && Number.isFinite(obj.geometry.boundingSphere.radius), `${id}: sin esfera envolvente`);
    }
    assert.equal(flippedTriangles(baked), flippedTriangles(raw), `${id}: caras invertidas tras hornear`);
  }
});

test('matrices espejadas, geometría sin índice y sin uv se funden sin invertir caras', () => {
  // Ninguna figura actual usa estos casos: se fuerzan en una figura sintética.
  const root = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: '#c0a060' });
  const arm = new THREE.Group();
  arm.userData.arm = 1;
  arm.position.set(0.1, 0.2, 0);
  arm.rotation.z = 0.4;
  root.add(arm);
  const mirroredBall = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), paint);
  mirroredBall.scale.set(-1, 1.4, 0.8);
  mirroredBall.position.set(0.02, -0.05, 0);
  const flatBox = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.03).toNonIndexed(), paint);
  flatBox.rotation.set(0.3, -0.7, 0.1);
  const bare = new THREE.SphereGeometry(0.02, 8, 6);
  bare.deleteAttribute('uv');
  const uvless = new THREE.Mesh(bare, paint);
  uvless.position.y = -0.1;
  const nested = new THREE.Group();
  nested.scale.set(1, -1, 1);
  nested.add(new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 10), paint));
  arm.add(mirroredBall, flatBox, uvless, nested);
  root.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), paint), new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), paint));
  root.updateMatrixWorld(true);
  const before = { triangles: triangles(root), flipped: flippedTriangles(root), box: new THREE.Box3().setFromObject(root, true) };
  const result = bakeToy(root);
  root.updateMatrixWorld(true);
  assert.equal(result.drawsBefore, 6);
  assert.equal(result.drawsAfter, 2, 'una malla por pivote y material');
  assert.equal(triangles(root), before.triangles);
  assert.equal(flippedTriangles(root), before.flipped);
  const after = new THREE.Box3().setFromObject(root, true);
  assert.ok(after.min.distanceTo(before.box.min) < 1e-6 && after.max.distanceTo(before.box.max) < 1e-6);
  assert.equal(arm.children.length, 1, 'el grupo espejado vacío se retira');
  assert.equal(tagged(root, 'arm').length, 1, 'el pivote sigue en su sitio');
});

test('ningún pivote conserva dos piezas fundibles con el mismo material', () => {
  for (const { id, baked } of pairs) {
    const seen = new Set();
    baked.traverse((obj) => {
      if (!obj.isMesh || obj.isInstancedMesh || obj.children.length || isRigPivot(obj) || Array.isArray(obj.material)) return;
      const key = materialKey(obj.material);
      if (key === null) return;
      const slot = `${ownerOf(obj, baked).uuid}|${key}`;
      assert.ok(!seen.has(slot), `${id}: dos piezas con el mismo material bajo un pivote`);
      seen.add(slot);
    });
  }
});

test('la esclerótica sigue siendo la primera malla de cada ojo', () => {
  for (const { id, raw, baked } of pairs) {
    const rawEyes = tagged(raw, 'eye');
    const bakedEyes = tagged(baked, 'eye');
    bakedEyes.forEach((eye, i) => {
      const first = (root) => { let found = null; root.traverse((obj) => { if (!found && obj.isMesh) found = obj; }); return found; };
      const before = first(rawEyes[i]);
      const after = first(eye);
      assert.ok(after, `${id}: ojo sin mallas`);
      assert.equal(after.material.color.getHexString(), before.material.color.getHexString(), `${id}: la primera malla del ojo ya no es la esclerótica`);
    });
  }
});

test('los materiales se comparten solo dentro de una figura, nunca entre figuras', () => {
  const owners = new Map();
  for (const { id, baked } of pairs) {
    for (const obj of meshes(baked)) {
      for (const material of Array.isArray(obj.material) ? obj.material : [obj.material]) {
        const previous = owners.get(material);
        assert.ok(!previous || previous === id, `${id} comparte un material con ${previous}`);
        owners.set(material, id);
      }
    }
  }
  // Dos construcciones de la misma figura tampoco comparten materiales.
  const a = buildToy('pipo');
  const b = buildToy('pipo');
  const materialsA = new Set(meshes(a).map((obj) => obj.material));
  assert.ok(meshes(b).every((obj) => !materialsA.has(obj.material)), 'dos Pipos no pueden compartir material (nameActor)');
});

test('liberar una figura horneada nunca desecha recursos compartidos y libera cada textura una vez', () => {
  const toy = buildToy('dragon');
  const shared = new THREE.Texture();
  shared.userData.nidoShared = true;
  const surface = new THREE.Texture();
  surface.userData.nidoSharedSurface = true;
  const sharedGeometry = new THREE.BufferGeometry();
  sharedGeometry.userData.nidoShared = true;
  const privateMap = new THREE.Texture();
  let sharedDisposed = 0;
  let surfaceDisposed = 0;
  let geometryDisposed = 0;
  let privateDisposed = 0;
  let microDisposed = 0;
  shared.addEventListener('dispose', () => sharedDisposed++);
  surface.addEventListener('dispose', () => surfaceDisposed++);
  sharedGeometry.addEventListener('dispose', () => geometryDisposed++);
  privateMap.addEventListener('dispose', () => privateDisposed++);
  const list = meshes(toy).filter((obj) => !obj.isInstancedMesh);
  let skin = null;
  toy.traverse((obj) => { if (obj.material?.bumpMap) skin = obj.material; });
  skin.bumpMap.addEventListener('dispose', () => microDisposed++);
  list[0].material.normalMap = shared;
  list[1].material.map = surface;
  list[list.length - 1].material.alphaMap = privateMap;
  // Un aro de luz del escenario reutiliza una geometría compartida.
  const ring = new THREE.Mesh(sharedGeometry, new THREE.MeshBasicMaterial());
  toy.add(ring);
  releaseResources(toy);
  assert.equal(sharedDisposed, 0, 'no se desecha una textura nidoShared');
  assert.equal(surfaceDisposed, 0, 'no se desecha un mapa de superficie compartido');
  assert.equal(geometryDisposed, 0, 'no se desecha una geometría nidoShared');
  assert.equal(privateDisposed, 1, 'la textura privada se libera una sola vez');
  assert.equal(microDisposed, 1, 'el relieve del dragón se libera una sola vez');
});

test('hornear dos veces no cambia nada y buildToy acepta { bake: false }', () => {
  const toy = buildToy('caperucita');
  const again = bakeToy(toy);
  assert.equal(again.drawsAfter, again.drawsBefore);
  const raw = buildToy('caperucita', { bake: false });
  const result = bakeToy(raw);
  assert.ok(result.drawsAfter < result.drawsBefore, 'caperucita debe ganar con el horneado');
  assert.equal(result.drawsAfter, meshes(toy).length);
});
