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
    // Marca para el parpadeo del escenario (escala en y durante un instante).
    eye.userData.eye = 1;
    group.add(eye);
    const shine = blob(r * 0.38, white, { x: side * x * spread + r * 0.35, y: y + r * 0.35, z: z + r * 0.75 });
    shine.userData.eye = 1;
    group.add(shine);
  });
}

/**
 * Ojo de cuento (como los cerditos de la portada): globo blanco achatado, iris
 * oscuro y un brillo. Las tres piezas llevan `userData.eye` para el parpadeo.
 * `look` desplaza el iris en x (−1 izquierda … 1 derecha) para dar intención.
 */
export function eyeball(group, { x, y, z, r, iris = "#3a2418", sclera = "#ffffff", look = 0, squash = 0.75, tall = 1.15 }) {
  const white = mat(sclera, { rough: 0.25 });
  const irisMat = mat(iris, { rough: 0.3 });
  const shine = mat("#ffffff", { rough: 0.1 });
  const ball = blob(r, white, { x, y, z });
  ball.scale.set(1, tall, squash);
  ball.userData.eye = 1;
  group.add(ball);
  const pupil = blob(r * 0.55, irisMat, { x: x + look * r * 0.25, y: y - r * 0.05, z: z + r * 0.62 });
  pupil.scale.set(1, tall, 0.5);
  pupil.userData.eye = 1;
  group.add(pupil);
  const dot = blob(r * 0.2, shine, { x: x + look * r * 0.25 + r * 0.22, y: y + r * 0.3, z: z + r * 0.9 });
  dot.userData.eye = 1;
  group.add(dot);
  return ball;
}

/** Ceja: arco fino sobre el ojo. `tilt` inclina el arco (positivo = ceja alzada hacia fuera). */
export function brow(group, { x, y, z, r = 0.014, thick = 0.0025, color = "#3a2418", tilt = 0, side = 1 }) {
  const arc = mesh(new THREE.TorusGeometry(r, thick, 8, 20, Math.PI * 0.8), mat(color, { rough: 0.6 }), { x, y, z, rz: side * tilt + Math.PI * 0.1 });
  group.add(arc);
  return arc;
}

/** Sonrisa: arco hacia abajo, centrado en (x, y, z), de radio `r`. */
export function smile(group, { x = 0, y, z, r = 0.02, thick = 0.003, color = "#5b2a30", span = Math.PI, rx = 0 }) {
  const arc = mesh(new THREE.TorusGeometry(r, thick, 8, 24, span), mat(color, { rough: 0.5 }), { x, y, z, rz: Math.PI + (Math.PI - span) / 2, rx });
  group.add(arc);
  return arc;
}

/** Mejilla sonrosada: disco suave sobre la cara. */
export function cheek(group, { x, y, z, r = 0.014, color = "#f0a2a2" }) {
  const spot = blob(r, mat(color, { rough: 0.7 }), { x, y, z });
  spot.scale.set(1, 0.7, 0.45);
  group.add(spot);
  return spot;
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
