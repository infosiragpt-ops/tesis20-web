// Zorrito del desierto (fennec) sentado, de orejas enormes y cola esponjosa enroscada a un lado.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "zorro";
export const label = "Zorro";

export function build() {
  const g = new THREE.Group();
  const sand = mat("#f1c27f");
  const cream = mat("#fff4e2");
  const pink = mat("#f2bfae");
  const black = mat("#1c1a22", { rough: 0.35 });

  // Cuerpo en huevo, sentado
  const body = blob(0.085, sand, { y: 0.115 });
  body.scale.set(1, 1.3, 0.9);
  g.add(body);
  // Panza y pecho blancos
  const belly = blob(0.06, cream, { y: 0.1, z: 0.045 });
  belly.scale.set(0.95, 1.25, 0.6);
  g.add(belly);
  // Ancas y patas traseras
  [-1, 1].forEach((side) => {
    const haunch = blob(0.045, sand, { x: side * 0.065, y: 0.048, z: 0.01 });
    haunch.scale.set(0.9, 1, 1.25);
    g.add(haunch);
    const hindPaw = blob(0.02, sand, { x: side * 0.075, y: 0.018, z: 0.055 });
    hindPaw.scale.set(1, 0.8, 1.3);
    g.add(hindPaw);
  });
  // Patas delanteras rectas
  [-1, 1].forEach((side) => {
    g.add(cyl(0.017, 0.017, 0.12, sand, { x: side * 0.035, y: 0.075, z: 0.062, rx: -0.15 }, 16));
    const paw = blob(0.021, sand, { x: side * 0.035, y: 0.02, z: 0.075 });
    paw.scale.set(1, 0.8, 1.3);
    g.add(paw);
  });
  // Cabeza
  const head = blob(0.068, sand, { y: 0.258 });
  head.scale.set(1.1, 0.9, 0.95);
  g.add(head);
  // Hocico y mejillas blancos, nariz negra
  const muzzle = blob(0.034, cream, { y: 0.238, z: 0.054 });
  muzzle.scale.set(1.15, 0.85, 1.1);
  g.add(muzzle);
  [-1, 1].forEach((side) => {
    const cheek = blob(0.029, cream, { x: side * 0.032, y: 0.236, z: 0.044 });
    cheek.scale.set(1, 0.9, 0.8);
    g.add(cheek);
  });
  g.add(blob(0.014, black, { y: 0.246, z: 0.094 }));
  eyes(g, { x: 0.028, y: 0.27, z: 0.057, r: 0.013 });
  // Orejas enormes con interior rosado
  [-1, 1].forEach((side) => {
    const ear = cone(0.038, 0.14, sand, { x: side * 0.05, y: 0.375, z: -0.005, rz: side * -0.28 }, 16);
    ear.scale.set(1, 1, 0.42);
    g.add(ear);
    const inner = cone(0.026, 0.105, pink, { x: side * 0.05, y: 0.365, z: 0.012, rz: side * -0.28 }, 16);
    inner.scale.set(1, 1, 0.35);
    g.add(inner);
  });
  // Cola gruesa enroscada por el lado derecho, con punta blanca
  g.add(blob(0.035, sand, { y: 0.035, z: -0.07 }));
  g.add(mesh(new THREE.TorusGeometry(0.08, 0.034, 14, 28, Math.PI), sand, { x: 0.05, y: 0.034, z: -0.01, rx: Math.PI / 2, rz: (-2 * Math.PI) / 3 }));
  g.add(blob(0.038, cream, { x: 0.09, y: 0.036, z: 0.059 }));

  return fit(g, 0.3);
}
