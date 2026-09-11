// Búho de juguete sobre un tronquito: el sabio del bosque de nubes. Ojos
// grandes de ámbar, cejas de pluma, pecho escamado y alas articuladas
// (userData.wing) que baten; cabeza (head) y penachos (ear) giran solos.
import * as THREE from "three";
import { mat, blob, cyl, cone, fit, eyeball, brow } from "./_shared.js";

export const id = "buho";
export const label = "Búho";

export function build() {
  const g = new THREE.Group();
  const brown = mat("#7a563a", { surface: "feathers" });
  const brownDark = mat("#5e3f2a", { surface: "feathers" });
  const light = mat("#e3c7a0", { surface: "feathers" });
  const dark = mat("#4e3524", { surface: "feathers" });
  const orange = mat("#e0a24a");

  /* ------------------------------ tronco ------------------------------ */
  g.add(cyl(0.06, 0.065, 0.16, dark, { y: 0.03, rx: Math.PI / 2 }, 14));
  g.add(cyl(0.062, 0.062, 0.01, mat("#b98756"), { y: 0.03, z: 0.08, rx: Math.PI / 2 }, 14));
  g.add(cyl(0.062, 0.062, 0.01, mat("#b98756"), { y: 0.03, z: -0.08, rx: Math.PI / 2 }, 14));
  g.add(blob(0.012, mat("#8ec36a", { rough: 0.8 }), { x: 0.05, y: 0.066, z: 0.05 }));

  /* ------------------------------ cuerpo ------------------------------ */
  const body = blob(0.1, brown, { y: 0.17 });
  body.scale.set(1, 1.25, 0.92);
  g.add(body);
  const chest = blob(0.072, light, { y: 0.15, z: 0.045 });
  chest.scale.set(1, 1.3, 0.55);
  g.add(chest);
  // Plumitas del pecho en filas alternadas
  [[0.095, 0], [0.13, 1], [0.165, 0], [0.2, 1]].forEach(([y, odd]) => {
    const xs = odd ? [-0.03, 0, 0.03] : [-0.015, 0.015];
    xs.forEach((x) => {
      const feather = blob(0.011, brownDark, { x, y, z: 0.045 + Math.sqrt(Math.max(0, 0.072 * 0.072 - x * x - ((y - 0.15) / 1.3) ** 2)) * 0.55 });
      feather.scale.set(1, 0.6, 0.35);
      g.add(feather);
    });
  });

  /* --------------------------- alas articuladas ----------------------- */
  [-1, 1].forEach((side) => {
    const wing = new THREE.Group();
    wing.position.set(side * 0.082, 0.235, 0);
    wing.userData.wing = side;
    const feather = blob(0.045, dark, { x: side * 0.012, y: -0.07 });
    feather.scale.set(0.55, 1.6, 0.8);
    feather.rotation.z = side * -0.25;
    wing.add(feather);
    const tip = blob(0.02, brownDark, { x: side * 0.02, y: -0.135, z: 0.008 });
    tip.scale.set(0.7, 1, 0.6);
    wing.add(tip);
    g.add(wing);
  });

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.31, 0);
  headG.userData.head = 1;
  const head = blob(0.085, brown, {});
  head.scale.set(1.1, 0.95, 0.95);
  headG.add(head);
  [-1, 1].forEach((side) => {
    const disc = blob(0.042, light, { x: side * 0.036, y: 0.008, z: 0.06 });
    disc.scale.set(1, 1.05, 0.5);
    headG.add(disc);
    eyeball(headG, { x: side * 0.036, y: 0.012, z: 0.084, r: 0.021, iris: "#1c1a22", sclera: "#f6c65a", squash: 0.6 });
    brow(headG, { x: side * 0.037, y: 0.042, z: 0.086, r: 0.017, thick: 0.003, color: "#4e3524", tilt: 0.55, side });
    // Penachos articulados
    const ear = new THREE.Group();
    ear.position.set(side * 0.06, 0.07, -0.01);
    ear.userData.ear = side;
    ear.add(cone(0.02, 0.06, brown, { y: 0.012, rz: side * -0.35 }, 8));
    headG.add(ear);
  });
  headG.add(cone(0.013, 0.03, orange, { y: -0.012, z: 0.095, rx: Math.PI / 2 }, 8));
  g.add(headG);

  /* ------------------------------- patas ------------------------------ */
  [-1, 1].forEach((side) => {
    g.add(cyl(0.008, 0.008, 0.04, orange, { x: side * 0.03, y: 0.085, z: 0.02, rx: 0.4 }, 8));
    [-1, 0, 1].forEach((t) => g.add(cyl(0.004, 0.004, 0.022, orange, { x: side * 0.03 + t * 0.009, y: 0.068, z: 0.04, rx: Math.PI / 2 + 0.2, ry: t * 0.4 }, 6)));
  });

  return fit(g, 0.3);
}
