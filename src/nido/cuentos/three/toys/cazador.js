// Cazador: chaqueta verde, botas, barba castaña y sombrero con pluma roja.
// Cabeza (userData.head) con ojos grandes, cejas y bigote; brazos (arm) y
// piernas (leg) en grupos con pivote en hombro y cadera.
import * as THREE from "three";
import { mat, blob, cyl, cone, fit, eyeball, brow, cheek } from "./_shared.js";

export const id = "cazador";
export const label = "Cazador";

export function build() {
  const g = new THREE.Group();
  const green = mat("#4f7a3a", { rough: 0.8 , surface: "cloth" });
  const greenDark = mat("#3c5f2c", { rough: 0.8 , surface: "cloth" });
  const brown = mat("#5b4a3a", { rough: 0.85 , surface: "cloth" });
  const skin = mat("#d8a172", { surface: "skin" });
  const beard = mat("#6b3f26", { rough: 0.9 , surface: "fur" });
  const boots = mat("#3a2a20", { rough: 0.7 });
  const gold = mat("#f2c14e", { rough: 0.5 });
  const feather = mat("#d9483f", { rough: 0.7 });

  /* ----------------------- piernas articuladas ------------------------ */
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.028, 0.105, 0);
    leg.userData.leg = side;
    leg.add(cyl(0.02, 0.022, 0.09, brown, { y: -0.045 }, 16));
    const boot = blob(0.024, boots, { y: -0.089, z: 0.01 });
    boot.scale.set(0.9, 0.6, 1.4);
    leg.add(boot);
    g.add(leg);
  });

  /* ------------------------------ chaqueta ---------------------------- */
  g.add(cyl(0.048, 0.056, 0.13, green, { y: 0.165 }, 28));
  g.add(cyl(0.057, 0.057, 0.014, mat("#8a5a33"), { y: 0.115 }, 28));
  g.add(blob(0.007, gold, { y: 0.115, z: 0.056 }));
  [0, 1].forEach((n) => g.add(blob(0.004, gold, { y: 0.19 - n * 0.025, z: 0.052 })));

  /* ------------------------ brazos articulados ------------------------ */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.06, 0.2, 0);
    arm.userData.arm = side;
    arm.add(cyl(0.014, 0.014, 0.09, green, { x: side * 0.008, y: -0.04, rz: side * 0.25 }, 12));
    arm.add(blob(0.014, skin, { x: side * 0.02, y: -0.085 }));
    g.add(arm);
  });

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.275, 0);
  headG.userData.head = 1;
  headG.add(blob(0.05, skin, {}));
  const chin = blob(0.04, beard, { y: -0.023, z: 0.02 });
  chin.scale.set(1.1, 0.75, 1);
  headG.add(chin);
  [-1, 1].forEach((side) => {
    const mustache = blob(0.011, beard, { x: side * 0.012, y: -0.008, z: 0.047 });
    mustache.scale.set(1.2, 0.5, 0.5);
    headG.add(mustache);
    eyeball(headG, { x: side * 0.018, y: 0.01, z: 0.044, r: 0.0095, iris: "#3a2418", squash: 0.6 });
    brow(headG, { x: side * 0.018, y: 0.027, z: 0.046, r: 0.008, thick: 0.0018, color: "#6b3f26", tilt: 0.2, side });
    cheek(headG, { x: side * 0.03, y: -0.002, z: 0.038, r: 0.008, color: "#e2957a" });
  });
  headG.add(blob(0.007, skin, { y: 0.0, z: 0.05 }));
  headG.add(cyl(0.075, 0.078, 0.01, greenDark, { y: 0.037 }, 32));
  headG.add(cone(0.05, 0.075, green, { y: 0.075 }, 32));
  const plume = blob(0.03, feather, { x: 0.05, y: 0.085, z: -0.01, rz: -0.9 });
  plume.scale.set(1.6, 0.25, 0.4);
  headG.add(plume);
  g.add(headG);

  return fit(g, 0.3);
}
