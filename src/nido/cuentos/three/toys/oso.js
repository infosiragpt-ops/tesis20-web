// Osito de anteojos sentado: pelaje oscuro, anillos crema en los ojos, hocico y pecho claros.
import * as THREE from "three";
import { mat, mesh, blob, eyes, fit } from "./_shared.js";

export const id = "oso";
export const label = "Oso de anteojos";

const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);

function onHead(ox, oy, center, radius, inset = 0) {
  const oz = Math.sqrt(radius * radius - ox * ox - oy * oy);
  const n = new THREE.Vector3(ox, oy, oz).normalize();
  return center.clone().addScaledVector(n, radius + inset).toArray();
}

function limb(from, to, r, material) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = mesh(new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 6, 16), material);
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

export function build() {
  const g = new THREE.Group();
  const fur = mat("#33211a", { rough: 0.7 });
  const cream = mat("#f3e2b8");
  const tan = mat("#dcbf92");
  const inner = mat("#7a5442");
  const black = mat("#1c1a22", { rough: 0.3 });

  // Cadera y cuerpo sentado
  const hips = blob(0.11, fur, { y: 0.062 });
  hips.scale.set(1.1, 0.55, 1);
  g.add(hips);
  const body = blob(0.115, fur, { y: 0.155 });
  body.scale.set(1, 1.05, 0.92);
  g.add(body);
  // Pechera crema
  const bib = blob(0.06, cream, { y: 0.2, z: 0.08, rx: -0.35 });
  bib.scale.set(1, 1.2, 0.45);
  g.add(bib);
  // Cola
  g.add(blob(0.025, fur, { y: 0.06, z: -0.115 }));

  // Patas traseras hacia adelante, algo abiertas, con planta clara
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.112, 0.045, 0.06);
    leg.rotation.y = side * 0.22;
    const thigh = blob(0.048, fur, {});
    thigh.scale.set(0.9, 0.8, 1.35);
    leg.add(thigh);
    leg.add(blob(0.034, fur, { y: 0.004, z: 0.045 }));
    const sole = blob(0.026, tan, { y: 0.008, z: 0.07 });
    sole.scale.set(0.9, 1.05, 0.35);
    leg.add(sole);
    g.add(leg);
  });

  // Patas delanteras hacia adelante
  [-1, 1].forEach((side) => {
    g.add(limb([side * 0.088, 0.185, 0.035], [side * 0.05, 0.035, 0.115], 0.03, fur));
    const paw = blob(0.033, fur, { x: side * 0.05, y: 0.032, z: 0.118 });
    paw.scale.set(1, 0.8, 1.1);
    g.add(paw);
  });

  // Cabeza
  const HC = new THREE.Vector3(0, 0.315, 0.01);
  const HR = 0.09;
  g.add(blob(HR, fur, { x: HC.x, y: HC.y, z: HC.z }));
  // Orejas redondas
  [-1, 1].forEach((side) => {
    g.add(blob(0.03, fur, { x: side * 0.072, y: 0.38, z: 0.005 }));
    const disc = blob(0.017, inner, { x: side * 0.072, y: 0.38, z: 0.031 });
    disc.scale.set(1, 1, 0.5);
    g.add(disc);
  });
  // Hocico claro y nariz
  const muzzle = blob(0.045, tan, { y: 0.278, z: 0.085 });
  muzzle.scale.set(1.15, 0.85, 1);
  g.add(muzzle);
  const nose = blob(0.016, black, { y: 0.3, z: 0.127 });
  nose.scale.set(1.2, 0.8, 0.8);
  g.add(nose);
  g.add(mesh(new THREE.TorusGeometry(0.011, 0.0025, 8, 16, Math.PI), black, { y: 0.284, z: 0.128, rz: Math.PI }));

  // Anillos crema (los "anteojos") pegados a la curva de la cabeza
  [-1, 1].forEach((side) => {
    const ox = side * 0.04;
    const oy = 0.008;
    const oz = Math.sqrt(HR * HR - ox * ox - oy * oy);
    const n = new THREE.Vector3(ox, oy, oz).normalize();
    const ring = mesh(new THREE.TorusGeometry(0.028, 0.009, 12, 32), cream);
    ring.position.copy(HC).addScaledVector(n, HR - 0.003);
    ring.quaternion.setFromUnitVectors(FRONT, n);
    g.add(ring);
    // Franja que baja del anillo por la mejilla hasta la pechera
    const top = onHead(side * 0.058, -0.018, HC, HR, -0.004);
    const bottom = onHead(side * 0.03, -0.072, HC, HR, -0.004);
    g.add(limb(top, bottom, 0.0085, cream));
  });
  eyes(g, { x: 0.04, y: HC.y + 0.008, z: HC.z + 0.083, r: 0.011 });

  return fit(g, 0.3);
}
