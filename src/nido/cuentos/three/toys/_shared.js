// Utilidades compartidas por las figuras de juguete en 3D.
// Cada figura es un THREE.Group apoyado en y = 0, centrado en x = z = 0,
// de unos 0.26–0.32 unidades de alto (la repisa mide 6 de ancho). Colores
// planos, superficies mate: estética de juguete de madera pintada.

import * as THREE from "three";

export function mat(color, { rough = 0.62, metal = 0, emissive = null, emissiveIntensity = 0.6, flat = false, opacity = 1 } = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
    flatShading: flat,
    transparent: opacity < 1,
    opacity,
  });
  if (emissive) {
    material.emissive = new THREE.Color(emissive);
    material.emissiveIntensity = emissiveIntensity;
  }
  return material;
}

/** Crea un mesh con sombras activadas. */
export function mesh(geometry, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  if (Array.isArray(s)) m.scale.set(s[0], s[1], s[2]);
  else m.scale.setScalar(s);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Esfera achatable: útil para cuerpos, cabezas, copas de árbol. */
export function blob(radius, material, opts = {}) {
  return mesh(new THREE.SphereGeometry(radius, 24, 18), material, opts);
}

export function box(w, h, d, material, opts = {}) {
  return mesh(new THREE.BoxGeometry(w, h, d), material, opts);
}

export function cyl(rTop, rBottom, h, material, opts = {}, segments = 24) {
  return mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material, opts);
}

export function cone(r, h, material, opts = {}, segments = 24) {
  return mesh(new THREE.ConeGeometry(r, h, segments), material, opts);
}

/** Dos ojos brillantes (negro con reflejo) mirando hacia +z. */
export function eyes(group, { x = 0.03, y = 0.2, z = 0.08, r = 0.014, spread = 1 } = {}) {
  const black = mat("#1c1a22", { rough: 0.3 });
  const white = mat("#ffffff", { rough: 0.2 });
  [-1, 1].forEach((side) => {
    const eye = blob(r, black, { x: side * x * spread, y, z });
    group.add(eye);
    group.add(blob(r * 0.38, white, { x: side * x * spread + r * 0.35, y: y + r * 0.35, z: z + r * 0.75 }));
  });
}

/** Escala uniformemente el grupo para que su altura sea `height`, apoyado en y = 0. */
export function fit(group, height = 0.28) {
  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = height / Math.max(size.y, 0.0001);
  group.scale.setScalar(scale);
  bounds.setFromObject(group);
  group.position.y -= bounds.min.y;
  group.position.x -= (bounds.min.x + bounds.max.x) / 2;
  group.position.z -= (bounds.min.z + bounds.max.z) / 2;
  const holder = new THREE.Group();
  holder.add(group);
  return holder;
}

/** Peana redonda de madera, común a varias figuras. */
export function base(radius = 0.09, material = mat("#b98756", { rough: 0.8 })) {
  return cyl(radius, radius * 1.05, 0.03, material, { y: 0.015 });
}
