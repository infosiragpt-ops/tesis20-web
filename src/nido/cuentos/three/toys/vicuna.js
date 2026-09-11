// Vicuña de juguete: esbelta, dorada, de cuello largo y pecho blanco, sobre una
// peana de pasto. Ojos grandes con pestañas y sonrisa; el cuello con la cabeza
// (userData.head), las orejas (ear), las patas (leg) y la colita (tail) van
// articulados para que mire al cielo, trote y escuche.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit, eyeball, brow, smile } from "./_shared.js";

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

  /* ------------------------------ peana ------------------------------- */
  g.add(cyl(0.1, 0.106, 0.024, grass, { y: 0.012 }, 32));
  [[0.075, 0.035, 0.3], [0.085, -0.02, -0.25], [-0.07, 0.05, -0.3], [-0.08, -0.03, 0.2], [0.02, 0.085, -0.15], [-0.03, -0.085, 0.25], [0.06, -0.07, -0.2], [-0.055, 0.075, 0.3]].forEach(([x, z, rz]) => {
    g.add(cone(0.007, 0.032, blade, { x, y: 0.038, z, rz, rx: rz * 0.5 }, 6));
  });
  g.add(blob(0.008, mat("#f6d35a", { rough: 0.6 }), { x: -0.06, y: 0.045, z: 0.06 }));
  g.add(blob(0.007, mat("#f38bb1", { rough: 0.6 }), { x: 0.07, y: 0.044, z: -0.05 }));

  /* ------------------------ patas articuladas ------------------------- */
  [[-0.03, 0.055, 1], [0.03, 0.055, -1], [-0.03, -0.06, -1], [0.03, -0.06, 1]].forEach(([x, z, pair]) => {
    const leg = new THREE.Group();
    leg.position.set(x, 0.135, z);
    leg.userData.leg = pair;
    leg.add(cyl(0.011, 0.013, 0.11, tan, { y: -0.056 }, 12));
    leg.add(cyl(0.014, 0.014, 0.014, hoof, { y: -0.104 }, 12));
    g.add(leg);
  });

  /* ------------------------------ cuerpo ------------------------------ */
  g.add(mesh(new THREE.CapsuleGeometry(0.041, 0.115, 8, 20), tan, { y: 0.152, rx: Math.PI / 2 }));
  const belly = blob(0.039, cream, { y: 0.133 });
  belly.scale.set(1, 0.7, 2.25);
  g.add(belly);
  const chest = blob(0.03, cream, { y: 0.158, z: 0.08 });
  chest.scale.set(1.25, 0.85, 0.7);
  g.add(chest);
  const tail = new THREE.Group();
  tail.position.set(0, 0.165, -0.095);
  tail.userData.tail = "y";
  const tuft = blob(0.017, tan, { y: -0.005, z: -0.006 });
  tuft.scale.set(0.8, 1.3, 0.8);
  tail.add(tuft);
  g.add(tail);

  /* --------------------- cuello y cabeza articulados ------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.165, 0.075);
  headG.userData.head = 1;
  headG.add(cyl(0.017, 0.027, 0.17, tan, { y: 0.077, z: 0.013, rx: 0.22 }, 20));
  headG.add(mesh(new THREE.CylinderGeometry(0.0195, 0.0285, 0.13, 20, 1, true, -Math.PI / 2, Math.PI), cream, { y: 0.057, z: 0.0085, rx: 0.22 }));
  const head = blob(0.028, tan, { y: 0.163, z: 0.043 });
  head.scale.set(1, 0.9, 1.25);
  headG.add(head);
  const muzzle = blob(0.016, tan, { y: 0.153, z: 0.073 });
  muzzle.scale.set(0.85, 0.75, 1.05);
  headG.add(muzzle);
  headG.add(blob(0.006, black, { y: 0.155, z: 0.089 }));
  smile(headG, { y: 0.145, z: 0.084, r: 0.006, thick: 0.0015, color: "#6b4a35" });
  [-1, 1].forEach((side) => {
    eyeball(headG, { x: side * 0.02, y: 0.169, z: 0.061, r: 0.0095, iris: "#231710", squash: 0.6 });
    brow(headG, { x: side * 0.021, y: 0.181, z: 0.064, r: 0.008, thick: 0.0015, color: "#231710", tilt: 0.25, side });
    const ear = new THREE.Group();
    ear.position.set(side * 0.018, 0.18, 0.031);
    ear.userData.ear = side;
    ear.add(cone(0.0075, 0.038, tan, { y: 0.017, rz: side * -0.2, rx: -0.12 }, 8));
    ear.add(cone(0.004, 0.024, mat("#f2bfae"), { y: 0.015, z: 0.003, rz: side * -0.2, rx: -0.12 }, 8));
    headG.add(ear);
  });
  g.add(headG);

  return fit(g, 0.3);
}
