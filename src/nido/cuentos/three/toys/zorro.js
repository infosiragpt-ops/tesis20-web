// Zorrito del desierto (fennec) sentado, de orejas enormes y cola esponjosa.
// Ojos grandes con brillo, cejas, sonrisa y mejillas; cabeza (userData.head),
// orejas (ear), patas delanteras (arm) y cola (tail) articuladas.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit, eyeball, brow, smile, cheek } from "./_shared.js";

export const id = "zorro";
export const label = "Zorro";

export function build() {
  const g = new THREE.Group();
  const sand = mat("#f1c27f", { surface: "fur" });
  const cream = mat("#fff4e2", { surface: "fur" });
  const pink = mat("#f2bfae");
  const black = mat("#1c1a22", { rough: 0.35 });

  /* ------------------------------ cuerpo ------------------------------ */
  const body = blob(0.085, sand, { y: 0.115 });
  body.scale.set(1, 1.3, 0.9);
  g.add(body);
  const belly = blob(0.06, cream, { y: 0.1, z: 0.045 });
  belly.scale.set(0.95, 1.25, 0.6);
  g.add(belly);
  [-1, 1].forEach((side) => {
    const haunch = blob(0.045, sand, { x: side * 0.065, y: 0.048, z: 0.01 });
    haunch.scale.set(0.9, 1, 1.25);
    g.add(haunch);
    const hindPaw = blob(0.02, sand, { x: side * 0.075, y: 0.018, z: 0.055 });
    hindPaw.scale.set(1, 0.8, 1.3);
    g.add(hindPaw);
  });

  /* ------------------ patas delanteras articuladas -------------------- */
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.035, 0.135, 0.05);
    arm.userData.arm = side;
    arm.add(cyl(0.017, 0.017, 0.12, sand, { y: -0.06, z: 0.012, rx: -0.15 }, 16));
    const paw = blob(0.021, sand, { y: -0.115, z: 0.025 });
    paw.scale.set(1, 0.8, 1.3);
    arm.add(paw);
    g.add(arm);
  });

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.258, 0);
  headG.userData.head = 1;
  const head = blob(0.068, sand, {});
  head.scale.set(1.1, 0.9, 0.95);
  headG.add(head);
  const muzzle = blob(0.034, cream, { y: -0.02, z: 0.054 });
  muzzle.scale.set(1.15, 0.85, 1.1);
  headG.add(muzzle);
  [-1, 1].forEach((side) => {
    const jowl = blob(0.029, cream, { x: side * 0.032, y: -0.022, z: 0.044 });
    jowl.scale.set(1, 0.9, 0.8);
    headG.add(jowl);
    eyeball(headG, { x: side * 0.03, y: 0.014, z: 0.058, r: 0.016, iris: "#2a1b12", squash: 0.65 });
    brow(headG, { x: side * 0.03, y: 0.04, z: 0.06, r: 0.011, color: "#b5834a", tilt: 0.2, side });
    cheek(headG, { x: side * 0.052, y: -0.004, z: 0.048, r: 0.011, color: "#f3a08a" });
    // Orejas enormes articuladas, con interior rosado
    const ear = new THREE.Group();
    ear.position.set(side * 0.05, 0.05, -0.005);
    ear.userData.ear = side;
    const outer = cone(0.038, 0.14, sand, { y: 0.067, rz: side * -0.28 }, 16);
    outer.scale.set(1, 1, 0.42);
    ear.add(outer);
    const inner = cone(0.026, 0.105, pink, { y: 0.057, z: 0.017, rz: side * -0.28 }, 16);
    inner.scale.set(1, 1, 0.35);
    ear.add(inner);
    headG.add(ear);
  });
  headG.add(blob(0.014, black, { y: -0.012, z: 0.094 }));
  smile(headG, { y: -0.028, z: 0.088, r: 0.011, thick: 0.0022, color: "#3b2a2e" });
  g.add(headG);

  /* ------------------------------- cola ------------------------------- */
  const tail = new THREE.Group();
  tail.position.set(0, 0.035, -0.07);
  tail.userData.tail = "y";
  tail.add(blob(0.035, sand, {}));
  tail.add(mesh(new THREE.TorusGeometry(0.08, 0.034, 14, 28, Math.PI), sand, { x: 0.05, y: -0.001, z: 0.06, rx: Math.PI / 2, rz: (-2 * Math.PI) / 3 }));
  tail.add(blob(0.038, cream, { x: 0.09, y: 0.001, z: 0.129 }));
  g.add(tail);

  return fit(g, 0.3);
}
