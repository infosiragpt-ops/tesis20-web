// Abuelita: vestido morado, chal claro, moño blanco, lentes y bastón.
import * as THREE from "three";
import { mat, mesh, blob, cyl, eyes, fit } from "./_shared.js";

export const id = "abuelita";
export const label = "Abuelita";

export function build() {
  const g = new THREE.Group();
  const dress = mat("#7a5aa8", { rough: 0.8 });
  const shawl = mat("#f1e2cf", { rough: 0.85 });
  const skin = mat("#efc3a3");
  const hair = mat("#e9e4e0", { rough: 0.9 });
  const frame = mat("#5a4a3a", { rough: 0.4, metal: 0.2 });
  const wood = mat("#8a5a33", { rough: 0.8 });
  const shoe = mat("#4a2f22", { rough: 0.8 });

  // Vestido acampanado y zapatitos
  g.add(cyl(0.05, 0.095, 0.19, dress, { y: 0.115 }, 32));
  [-1, 1].forEach((side) => {
    const foot = blob(0.02, shoe, { x: side * 0.03, y: 0.014, z: 0.045 });
    foot.scale.set(1, 0.6, 1.4);
    g.add(foot);
  });
  // Chal sobre los hombros
  const cape = blob(0.062, shawl, { y: 0.2 });
  cape.scale.set(1.05, 0.45, 1);
  g.add(cape);
  // Cabeza, moño, lentes
  g.add(blob(0.048, skin, { y: 0.245, z: 0.004 }));
  const cap = blob(0.05, hair, { y: 0.258, z: -0.008 });
  cap.scale.set(1, 0.8, 0.95);
  g.add(cap);
  g.add(blob(0.026, hair, { y: 0.305, z: -0.01 }));
  eyes(g, { x: 0.017, y: 0.25, z: 0.045, r: 0.006 });
  [-1, 1].forEach((side) => g.add(mesh(new THREE.TorusGeometry(0.012, 0.0022, 8, 20), frame, { x: side * 0.017, y: 0.25, z: 0.05 })));
  g.add(cyl(0.002, 0.002, 0.012, frame, { y: 0.25, z: 0.05, rz: Math.PI / 2 }, 6));
  [-1, 1].forEach((side) => g.add(blob(0.006, mat("#f39a9a"), { x: side * 0.03, y: 0.235, z: 0.04 })));
  // Brazos y bastón
  [-1, 1].forEach((side) => g.add(cyl(0.011, 0.011, 0.07, dress, { x: side * 0.07, y: 0.15, z: 0.01, rz: side * 0.35 }, 12)));
  g.add(blob(0.012, skin, { x: 0.085, y: 0.115, z: 0.015 }));
  g.add(cyl(0.006, 0.007, 0.13, wood, { x: 0.092, y: 0.065, z: 0.02 }, 10));
  g.add(mesh(new THREE.TorusGeometry(0.012, 0.005, 8, 16, Math.PI), wood, { x: 0.1, y: 0.13, z: 0.02, rz: Math.PI / 2 }));

  return fit(g, 0.3);
}
