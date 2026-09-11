// Abuelita: vestido morado, chal claro, moño blanco, lentes y bastón. Cabeza
// (userData.head) con ojos grandes tras los lentes, mejillas y sonrisa; brazos
// (arm) en grupos con pivote en el hombro, el bastón va con la mano derecha.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit, eyeball, brow, smile, cheek } from "./_shared.js";

export const id = "abuelita";
export const label = "Abuelita";

export function build() {
  const g = new THREE.Group();
  const dress = mat("#7a5aa8", { rough: 0.8 , surface: "cloth" });
  const shawl = mat("#f1e2cf", { rough: 0.85 , surface: "wool" });
  const skin = mat("#efc3a3", { surface: "skin" });
  const hair = mat("#e9e4e0", { rough: 0.9 , surface: "wool" });
  const frame = mat("#5a4a3a", { rough: 0.4, metal: 0.2 });
  const wood = mat("#8a5a33", { rough: 0.8 });
  const shoe = mat("#4a2f22", { rough: 0.8 });

  /* ------------------------------ vestido ----------------------------- */
  g.add(cyl(0.05, 0.095, 0.19, dress, { y: 0.115 }, 32));
  [-1, 1].forEach((side) => {
    const foot = blob(0.02, shoe, { x: side * 0.03, y: 0.014, z: 0.045 });
    foot.scale.set(1, 0.6, 1.4);
    g.add(foot);
  });
  const cape = blob(0.062, shawl, { y: 0.2 });
  cape.scale.set(1.05, 0.45, 1);
  g.add(cape);
  g.add(blob(0.007, mat("#d9a95a", { rough: 0.5 }), { y: 0.205, z: 0.058 }));

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.245, 0.004);
  headG.userData.head = 1;
  headG.add(blob(0.048, skin, {}));
  const cap = blob(0.05, hair, { y: 0.013, z: -0.012 });
  cap.scale.set(1, 0.8, 0.95);
  headG.add(cap);
  headG.add(blob(0.026, hair, { y: 0.06, z: -0.014 }));
  headG.add(blob(0.006, skin, { y: -0.004, z: 0.049 }));
  smile(headG, { y: -0.017, z: 0.045, r: 0.009, thick: 0.0016, color: "#b0554f" });
  [-1, 1].forEach((side) => {
    eyeball(headG, { x: side * 0.017, y: 0.006, z: 0.042, r: 0.0095, iris: "#3a2418", squash: 0.6 });
    headG.add(mesh(new THREE.TorusGeometry(0.013, 0.0022, 8, 20), frame, { x: side * 0.017, y: 0.006, z: 0.051 }));
    brow(headG, { x: side * 0.017, y: 0.023, z: 0.045, r: 0.008, thick: 0.0015, color: "#bdb5ae", tilt: 0.1, side });
    cheek(headG, { x: side * 0.03, y: -0.01, z: 0.036, r: 0.008, color: "#f39a9a" });
  });
  headG.add(cyl(0.002, 0.002, 0.012, frame, { y: 0.006, z: 0.051, rz: Math.PI / 2 }, 6));
  g.add(headG);

  /* ------------------------ brazos articulados ------------------------ */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.06, 0.175, 0.01);
    arm.userData.arm = side;
    arm.add(cyl(0.011, 0.011, 0.07, dress, { x: side * 0.01, y: -0.025, rz: side * 0.35 }, 12));
    arm.add(blob(0.012, skin, { x: side * 0.025, y: -0.06, z: 0.005 }));
    if (side > 0) {
      arm.add(cyl(0.006, 0.007, 0.13, wood, { x: 0.032, y: -0.11, z: 0.01 }, 10));
      arm.add(mesh(new THREE.TorusGeometry(0.012, 0.005, 8, 16, Math.PI), wood, { x: 0.04, y: -0.045, z: 0.01, rz: Math.PI / 2 }));
    }
    g.add(arm);
  });

  return fit(g, 0.3);
}
