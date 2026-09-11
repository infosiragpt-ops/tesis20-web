// Pájaro carpintero sobre su tronco: cresta roja, pecho crema, alas
// articuladas (userData.wing) y cabeza (head) que picotea; ojos grandes con
// brillo y mancha roja en la mejilla.
import * as THREE from "three";
import { mat, blob, cone, cyl, fit, eyeball, cheek } from "./_shared.js";

export const id = "carpintero";
export const label = "Pájaro carpintero";

export function build() {
  const g = new THREE.Group();
  const dark = mat("#293342", { rough: 0.55 , surface: "feathers" });
  const cream = mat("#fff1ce", { rough: 0.72 , surface: "feathers" });
  const red = mat("#dc4749", { rough: 0.45 });
  const tan = mat("#bc9c66");
  const bark = mat("#88603b", { rough: 0.9 });

  /* ------------------------------ tronco ------------------------------ */
  g.add(cyl(0.052, 0.06, 0.21, bark, { x: 0.075, y: 0.105, z: -0.035 }));
  [[0.05, 0.15, 0.012], [0.06, 0.07, 0.014]].forEach(([x, y, z]) => {
    const hole = blob(0.012, mat("#4a3320", { rough: 0.95 }), { x, y, z });
    hole.scale.set(1, 1.2, 0.3);
    g.add(hole);
  });
  g.add(blob(0.014, mat("#7fb85c", { rough: 0.85 }), { x: 0.11, y: 0.2, z: 0.0 }));

  /* ------------------------------ cuerpo ------------------------------ */
  const body = blob(0.069, dark, { y: 0.113 });
  body.scale.set(0.75, 1.2, 0.72);
  g.add(body);
  const chest = blob(0.049, cream, { y: 0.111, z: 0.031 });
  chest.scale.set(0.77, 1.3, 0.4);
  g.add(chest);
  const tail = cone(0.02, 0.06, dark, { y: 0.045, z: -0.03, rx: 0.5 });
  tail.scale.set(1.4, 1, 0.5);
  g.add(tail);

  /* --------------------------- alas articuladas ----------------------- */
  [-1, 1].forEach((side) => {
    const wing = new THREE.Group();
    wing.position.set(side * 0.038, 0.16, -0.005);
    wing.userData.wing = side;
    const feathers = blob(0.048, dark, { x: side * 0.004, y: -0.05 });
    feathers.scale.set(0.24, 1.3, 0.7);
    wing.add(feathers);
    const bar = blob(0.012, cream, { x: side * 0.008, y: -0.06, z: 0.02 });
    bar.scale.set(0.5, 1, 0.3);
    wing.add(bar);
    g.add(wing);
    const foot = blob(0.019, tan, { x: side * 0.021, y: 0.022, z: 0.024 });
    foot.scale.set(0.8, 0.3, 1.4);
    g.add(foot);
  });

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.17, 0.01);
  headG.userData.head = 1;
  headG.add(blob(0.042, dark, { y: 0.035, z: 0.002 }));
  const crest = cone(0.025, 0.067, red, { y: 0.08, z: -0.004 });
  crest.rotation.z = -0.32;
  headG.add(crest);
  headG.add(cone(0.013, 0.07, tan, { y: 0.032, z: 0.058, rx: Math.PI / 2 }));
  [-1, 1].forEach((side) => {
    eyeball(headG, { x: side * 0.026, y: 0.043, z: 0.031, r: 0.0095, iris: "#1c1a22", squash: 0.6 });
    cheek(headG, { x: side * 0.034, y: 0.026, z: 0.024, r: 0.009, color: "#dc4749" });
  });
  g.add(headG);

  return fit(g, 0.31);
}
