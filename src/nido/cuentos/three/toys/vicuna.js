// Vicuña de juguete: esbelta, dorada, de cuello largo y pecho blanco, sobre una peana de pasto.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "vicuna";
export const label = "Vicuña";

export function build() {
  const g = new THREE.Group();
  const tan = mat("#dea35a");
  const cream = mat("#fff6e6");
  const hoof = mat("#5a3f2e", { rough: 0.7 });
  const grass = mat("#6dbb57", { rough: 0.85 });
  const blade = mat("#8ed86a", { rough: 0.85 });
  const black = mat("#1c1a22", { rough: 0.35 });

  // Peana de pasto con briznas
  g.add(cyl(0.1, 0.106, 0.024, grass, { y: 0.012 }, 32));
  [[0.075, 0.035, 0.3], [0.085, -0.02, -0.25], [-0.07, 0.05, -0.3], [-0.08, -0.03, 0.2], [0.02, 0.085, -0.15], [-0.03, -0.085, 0.25], [0.06, -0.07, -0.2], [-0.055, 0.075, 0.3]].forEach(([x, z, rz]) => {
    g.add(cone(0.007, 0.032, blade, { x, y: 0.038, z, rz, rx: rz * 0.5 }, 6));
  });

  // Patas finas con pezuñas
  [[-0.03, 0.055], [0.03, 0.055], [-0.03, -0.06], [0.03, -0.06]].forEach(([x, z]) => {
    g.add(cyl(0.011, 0.013, 0.11, tan, { x, y: 0.079, z }, 12));
    g.add(cyl(0.014, 0.014, 0.014, hoof, { x, y: 0.031, z }, 12));
  });

  // Cuerpo esbelto (cápsula tumbada) y panza blanca
  g.add(mesh(new THREE.CapsuleGeometry(0.041, 0.115, 8, 20), tan, { y: 0.152, rx: Math.PI / 2 }));
  const belly = blob(0.039, cream, { y: 0.133 });
  belly.scale.set(1, 0.7, 2.25);
  g.add(belly);
  // Colita
  const tail = blob(0.017, tan, { y: 0.16, z: -0.1 });
  tail.scale.set(0.8, 1.3, 0.8);
  g.add(tail);

  // Cuello largo inclinado hacia adelante y pechera blanca
  g.add(cyl(0.017, 0.027, 0.17, tan, { y: 0.242, z: 0.088, rx: 0.22 }, 20));
  g.add(mesh(new THREE.CylinderGeometry(0.0195, 0.0285, 0.13, 20, 1, true, -Math.PI / 2, Math.PI), cream, { y: 0.222, z: 0.0835, rx: 0.22 }));
  const chest = blob(0.03, cream, { y: 0.158, z: 0.08 });
  chest.scale.set(1.25, 0.85, 0.7);
  g.add(chest);

  // Cabeza pequeña con hocico, nariz y ojos
  const head = blob(0.028, tan, { y: 0.328, z: 0.118 });
  head.scale.set(1, 0.9, 1.25);
  g.add(head);
  const muzzle = blob(0.016, tan, { y: 0.318, z: 0.148 });
  muzzle.scale.set(0.85, 0.75, 1.05);
  g.add(muzzle);
  g.add(blob(0.006, black, { y: 0.32, z: 0.164 }));
  eyes(g, { x: 0.02, y: 0.334, z: 0.137, r: 0.0085 });
  // Orejitas puntiagudas y erguidas
  [-1, 1].forEach((side) => {
    g.add(cone(0.0075, 0.038, tan, { x: side * 0.018, y: 0.362, z: 0.106, rz: side * -0.2, rx: -0.12 }, 8));
  });

  return fit(g, 0.3);
}
