// Caracola marina en espiral de crema y rosa, con la boca al frente, sobre un montoncito de arena.
import * as THREE from "three";
import { mat, mesh, blob, fit } from "./_shared.js";

export const id = "caracola";
export const label = "Caracola";

export function build() {
  const g = new THREE.Group();
  const cream = new THREE.Color("#f7e9d0");
  const rose = new THREE.Color("#ec97a3");
  const sand = mat("#e7cfa1", { rough: 0.95 });
  const lipMat = mat("#fbf3e2", { rough: 0.5 });
  const stripe = mat("#e98496", { rough: 0.55 });
  const inside = mat("#d6607a", { rough: 0.7 });

  // Montoncito de arena
  const R = 0.15;
  const H = 0.03;
  const profile = [];
  for (let i = 0; i <= 14; i += 1) {
    const t = i / 14;
    profile.push(new THREE.Vector2(0.004 + (1 - t) * R, H * (0.5 - 0.5 * Math.cos(Math.PI * t ** 0.8))));
  }
  g.add(mesh(new THREE.LatheGeometry(profile, 40), sand));
  [[0.13, 0.05], [-0.1, 0.11], [0.03, -0.14], [-0.12, -0.08]].forEach(([x, z]) => {
    g.add(blob(0.01, mat("#f3e1b8", { rough: 0.9 }), { x, z, y: 0.011 }));
  });

  // Espiral de esferas decrecientes (eje local Y, boca hacia +z)
  const shell = new THREE.Group();
  const N = 26;
  const perTurn = 8;
  const s0 = 0.085;
  const centers = [];
  let y = 0;
  for (let k = 0; k < N; k += 1) {
    const t = k / (N - 1);
    const s = s0 * Math.exp(-2.4 * t);
    const th = -(k / perTurn) * Math.PI * 2;
    const r = s * 0.64;
    const p = new THREE.Vector3(r * Math.cos(th), y, r * Math.sin(th));
    centers.push({ p, s });
    if (k > 0) shell.add(blob(s, mat(cream.clone().lerp(rose, t), { rough: 0.5 }), { x: p.x, y: p.y, z: p.z }));
    const sNext = s0 * Math.exp(-2.4 * (k + 1) / (N - 1));
    y += (s + sNext) * 0.13;
  }
  // Anillos rosados que marcan la espiral
  for (let k = 3; k < N - 2; k += 3) {
    const { p, s } = centers[k];
    const tangent = centers[k + 1].p.clone().sub(centers[k - 1].p).normalize();
    const ring = mesh(new THREE.TorusGeometry(s * 0.95, s * 0.11, 10, 28), stripe, { x: p.x, y: p.y, z: p.z });
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    shell.add(ring);
  }
  // Cuerpo: casco crema con hendidura rosa (la boca) y labio claro, todo sobre el mismo eje
  const body = new THREE.Group();
  const rimA = 2.55;
  const hull = [];
  for (let i = 0; i <= 18; i += 1) {
    const a = (i / 18) * rimA;
    hull.push(new THREE.Vector2(Math.sin(a) * s0, -Math.cos(a) * s0));
  }
  body.add(mesh(new THREE.LatheGeometry(hull, 36), mat(cream, { rough: 0.5 }), { rx: Math.PI / 2 }));
  const dent = [[Math.sin(rimA), -Math.cos(rimA)], [0.5, 0.76], [0.4, 0.65], [0.28, 0.55], [0.14, 0.48], [0, 0.46]]
    .map(([x, z]) => new THREE.Vector2(x * s0, z * s0));
  body.add(mesh(new THREE.LatheGeometry(dent, 36), inside, { rx: Math.PI / 2 }));
  body.add(mesh(new THREE.TorusGeometry(Math.sin(rimA) * s0, s0 * 0.085, 12, 36), lipMat, { z: -Math.cos(rimA) * s0 }));
  body.scale.set(0.86, 1.16, 1);
  body.rotation.x = 0.3;
  body.position.copy(centers[0].p);
  shell.add(body);

  // Tumbada sobre la arena: espira hacia arriba-izquierda-atrás, boca al frente
  shell.rotation.set(-0.35, 0.15, 0.62);
  shell.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(shell, true);
  shell.position.y = H - 0.008 - bounds.min.y;
  shell.position.x = -(bounds.min.x + bounds.max.x) / 2 + 0.02;
  shell.position.z = -(bounds.min.z + bounds.max.z) / 2 + 0.01;
  g.add(shell);

  return fit(g, 0.3);
}
