// Pelícano de juguete posado en una roca: cuerpo crema, alas grises
// articuladas (userData.wing), cuello y cabeza en un grupo (head) con pico y
// buche dorados, ojos grandes y cejas.
import * as THREE from "three";
import { mat, blob, cyl, cone, fit, eyeball, brow } from "./_shared.js";

export const id = "pelicano";
export const label = "Pelícano";

export function build() {
  const g = new THREE.Group();
  const feather = mat("#eee4d2", { rough: 0.74 , surface: "feathers" });
  const wingMat = mat("#817b78", { rough: 0.72 , surface: "feathers" });
  const gold = mat("#e9b44e", { rough: 0.4 });
  const goldDark = mat("#d09a36", { rough: 0.45 });
  const rock = mat("#8c8a86", { rough: 0.9 });

  /* ------------------------------- roca ------------------------------- */
  const stone = blob(0.1, rock, { y: 0.02 });
  stone.scale.set(1.15, 0.4, 0.95);
  g.add(stone);
  const pebble = blob(0.035, mat("#9d9b96", { rough: 0.9 }), { x: 0.075, y: 0.03, z: 0.055 });
  pebble.scale.set(1, 0.5, 1);
  g.add(pebble);

  /* ------------------------------ cuerpo ------------------------------ */
  const body = blob(0.085, feather, { y: 0.13 });
  body.scale.set(0.78, 1, 1);
  g.add(body);
  const tail = cone(0.03, 0.07, wingMat, { y: 0.14, z: -0.095, rx: -Math.PI / 2 - 0.3 });
  tail.scale.set(1, 1, 0.4);
  g.add(tail);

  /* --------------------------- alas articuladas ----------------------- */
  [-1, 1].forEach((side) => {
    const wing = new THREE.Group();
    wing.position.set(side * 0.05, 0.19, -0.01);
    wing.userData.wing = side;
    const feathers = blob(0.065, wingMat, { x: side * 0.012, y: -0.055 });
    feathers.scale.set(0.25, 1, 0.8);
    wing.add(feathers);
    const tip = blob(0.02, mat("#6b6562", { rough: 0.72 }), { x: side * 0.014, y: -0.115, z: -0.01 });
    tip.scale.set(0.6, 1, 0.5);
    wing.add(tip);
    g.add(wing);
    // Patas palmeadas
    g.add(cyl(0.006, 0.006, 0.03, gold, { x: side * 0.03, y: 0.06, z: 0.02 }, 8));
    const foot = blob(0.025, gold, { x: side * 0.032, y: 0.046, z: 0.028 });
    foot.scale.set(1, 0.3, 1.5);
    g.add(foot);
  });

  /* --------------------- cuello y cabeza articulados ------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.2, 0.015);
  headG.userData.head = 1;
  const neck = blob(0.034, feather, { y: 0.035 });
  neck.scale.y = 1.65;
  headG.add(neck);
  headG.add(blob(0.046, feather, { y: 0.086, z: 0.002 }));
  headG.add(cone(0.025, 0.15, gold, { y: 0.07, z: 0.09, rx: Math.PI / 2 }));
  const pouch = blob(0.036, goldDark, { y: 0.049, z: 0.08 });
  pouch.scale.set(0.7, 0.55, 1.5);
  headG.add(pouch);
  [-1, 1].forEach((side) => {
    eyeball(headG, { x: side * 0.03, y: 0.094, z: 0.036, r: 0.011, iris: "#222433", squash: 0.6 });
    brow(headG, { x: side * 0.03, y: 0.112, z: 0.036, r: 0.008, thick: 0.0015, color: "#5b4e46", tilt: 0.2, side });
  });
  [0, 1, 2].forEach((i) => headG.add(cone(0.008, 0.03, wingMat, { x: (i - 1) * 0.012, y: 0.12, z: -0.024, rx: -0.6 - i * 0.1 }, 6)));
  g.add(headG);

  return fit(g, 0.32);
}
