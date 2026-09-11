// Caperucita: figurita con capa roja con capucha, vestido crema y canasta en
// la mano. Cabeza (userData.head) con ojos grandes, cejas, mejillas y sonrisa;
// los dos brazos (arm) en grupos con pivote en el hombro.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit, eyeball, brow, smile, cheek } from "./_shared.js";

export const id = "caperucita";
export const label = "Caperucita";

export function build() {
  const g = new THREE.Group();
  const red = mat("#d63b3b", { rough: 0.7 });
  const redDark = mat("#b12d2d", { rough: 0.7 });
  const skin = mat("#f2c9a8");
  const hair = mat("#6b3f26", { rough: 0.8 });
  const cream = mat("#f4e4c8");
  const wicker = mat("#c9955c", { rough: 0.85 });
  const shoe = mat("#5b3a2a", { rough: 0.8 });

  /* ------------------------------- capa ------------------------------- */
  g.add(cyl(0.045, 0.1, 0.2, red, { y: 0.12 }, 32));
  g.add(cyl(0.101, 0.104, 0.014, redDark, { y: 0.027 }, 32));
  g.add(cyl(0.06, 0.07, 0.03, cream, { y: 0.03 }, 24));
  [-1, 1].forEach((side) => {
    const foot = blob(0.02, shoe, { x: side * 0.03, y: 0.014, z: 0.045 });
    foot.scale.set(1, 0.6, 1.4);
    g.add(foot);
  });
  g.add(blob(0.008, mat("#f2c14e", { rough: 0.5 }), { y: 0.205, z: 0.052 }));

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.245, 0.012);
  headG.userData.head = 1;
  headG.add(blob(0.05, skin, {}));
  const hairCap = blob(0.052, hair, { y: 0.015, z: -0.008 });
  hairCap.scale.set(1, 0.9, 1);
  headG.add(hairCap);
  [-1, 1].forEach((side) => headG.add(cyl(0.012, 0.014, 0.06, hair, { x: side * 0.045, y: -0.025, z: 0.008 }, 12)));
  const hood = blob(0.064, red, { y: 0.017, z: -0.03 });
  hood.scale.set(1, 1.05, 0.95);
  headG.add(hood);
  headG.add(blob(0.044, skin, { y: -0.003, z: 0.018 }));
  headG.add(blob(0.006, skin, { y: -0.003, z: 0.061 }));
  smile(headG, { y: -0.015, z: 0.058, r: 0.009, thick: 0.0016, color: "#a3413f" });
  [-1, 1].forEach((side) => {
    eyeball(headG, { x: side * 0.017, y: 0.008, z: 0.056, r: 0.011, iris: "#3a2418", squash: 0.6 });
    brow(headG, { x: side * 0.017, y: 0.025, z: 0.058, r: 0.008, thick: 0.0016, color: "#6b3f26", tilt: 0.15, side });
    cheek(headG, { x: side * 0.03, y: -0.01, z: 0.05, r: 0.008, color: "#f39a9a" });
  });
  g.add(headG);

  /* ------------------------ brazos articulados ------------------------ */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.06, 0.16, 0.02);
    arm.userData.arm = side;
    arm.add(cyl(0.011, 0.011, 0.07, red, { x: side * 0.015, y: -0.025, rz: side * 0.55 }, 12));
    arm.add(blob(0.012, skin, { x: side * 0.035, y: -0.056, z: 0.008 }));
    if (side > 0) {
      arm.add(cyl(0.03, 0.022, 0.04, wicker, { x: 0.045, y: -0.09, z: 0.01 }, 20));
      arm.add(mesh(new THREE.TorusGeometry(0.03, 0.004, 8, 24, Math.PI), wicker, { x: 0.045, y: -0.07, z: 0.01 }));
      arm.add(cyl(0.02, 0.02, 0.012, cream, { x: 0.045, y: -0.065, z: 0.01 }, 16));
      arm.add(blob(0.008, mat("#d9483f", { rough: 0.6 }), { x: 0.05, y: -0.06, z: 0.02 }));
    }
    g.add(arm);
  });

  return fit(g, 0.3);
}
