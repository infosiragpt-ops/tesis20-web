// Authored, lightweight sculpting primitives. +Y up, +Z semantic front.
import * as THREE from 'three';
import { mat, fit } from './_shared.js';

export { mat };
export function part(parent, key, value, position) {
  const g = new THREE.Group(); g.position.set(...position);
  if (key) g.userData[key] = value;
  parent.add(g); return g;
}
export function ell(parent, material, position, scale, rotation = [0, 0, 0], detail = 16) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, detail, Math.max(8, Math.floor(detail * .65))), material);
  mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.set(...rotation);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function tube(parent, material, points, radii, { segments = 16, sides = 8, flatten = 1 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const frames = curve.computeFrenetFrames(segments, false), positions = [], uv = [], indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, p = curve.getPointAt(t), k = t * (radii.length - 1), n = Math.min(radii.length - 2, Math.floor(k));
    const r = THREE.MathUtils.lerp(radii[n], radii[n + 1], k - n);
    for (let j = 0; j <= sides; j++) {
      const a = j / sides * Math.PI * 2;
      const v = p.clone().addScaledVector(frames.normals[i], Math.cos(a) * r).addScaledVector(frames.binormals[i], Math.sin(a) * r * flatten);
      positions.push(v.x, v.y, v.z); uv.push(j / sides, t);
      if (i < segments && j < sides) { const q = i * (sides + 1) + j; indices.push(q, q + 1, q + sides + 1, q + 1, q + sides + 2, q + sides + 1); }
    }
  }
  for (const start of [true, false]) {
    const index = positions.length / 3, p = curve.getPointAt(start ? 0 : 1), ring = start ? 0 : segments * (sides + 1);
    positions.push(p.x, p.y, p.z); uv.push(.5, start ? 0 : 1);
    for (let j = 0; j < sides; j++) indices.push(index, ring + j + (start ? 1 : 0), ring + j + (start ? 0 : 1));
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(indices); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function eyePair(head, { spread = .08, y = .02, z = .10, radius = .026, iris = '#564229' } = {}) {
  const wet = mat('#1c2019', { rough: .2, clearcoat: .9 });
  const irisMat = mat(iris, { rough: .32, clearcoat: .6 });
  const glint = mat('#fff7e6', { rough: .15 });
  for (const s of [-1, 1]) {
    const eye = part(head, 'eye', 1, [s * spread, y, z]);
    ell(eye, wet, [0, 0, 0], [radius, radius * 1.02, radius * .56]);
    ell(eye, irisMat, [0, -.001, radius * .46], [radius * .67, radius * .76, radius * .2]);
    ell(eye, wet, [0, 0, radius * .60], [radius * .36, radius * .52, radius * .18]);
    ell(eye, glint, [-radius * .25, radius * .28, radius * .72], [radius * .14, radius * .14, radius * .12], [0, 0, 0], 8);
  }
}
export function finish(root, family, anatomy = {}) {
  // Present animal bodies in three-quarter view; the outer holder remains
  // available to the stage for gaze, travel and user-triggered turns.
  if (['quadruped', 'reptile', 'aquatic'].includes(family)) root.rotation.y = .52;
  const holder = fit(root, .30);
  // A turtle or butterfly is naturally lower than a standing person. Fit the
  // full silhouette uniformly instead of stretching every species to 30 cm.
  const size = new THREE.Box3().setFromObject(holder).getSize(new THREE.Vector3());
  const envelope = Math.min(1, .31 / size.x, .38 / size.z);
  holder.scale.setScalar(envelope);
  holder.userData.sculpted = { revision: 1, family, ...anatomy };
  return holder;
}

// Instanced details keep plumage, spots and scales to one extra draw call.
export function details(parent, material, specs) {
  if (!specs.length) return;
  const result = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 5), material, specs.length);
  const transform = new THREE.Object3D();
  specs.forEach((spec, i) => {
    transform.position.set(...spec.p); transform.scale.set(...spec.s); transform.rotation.set(...(spec.r || [0, 0, 0])); transform.updateMatrix(); result.setMatrixAt(i, transform.matrix);
    if (spec.c) result.setColorAt(i, new THREE.Color(spec.c));
  });
  result.castShadow = true; result.receiveShadow = true; parent.add(result); return result;
}
