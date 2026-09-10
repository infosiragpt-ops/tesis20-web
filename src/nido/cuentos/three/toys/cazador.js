// Cazador: chaqueta verde, botas, barba castaña y sombrero con pluma roja.
import * as THREE from "three";
import { mat, blob, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "cazador";
export const label = "Cazador";

export function build() {
  const g = new THREE.Group();
  const green = mat("#4f7a3a", { rough: 0.8 });
  const greenDark = mat("#3c5f2c", { rough: 0.8 });
  const brown = mat("#5b4a3a", { rough: 0.85 });
  const skin = mat("#d8a172");
  const beard = mat("#6b3f26", { rough: 0.9 });
  const boots = mat("#3a2a20", { rough: 0.7 });
  const gold = mat("#f2c14e", { rough: 0.5 });
  const feather = mat("#d9483f", { rough: 0.7 });

  // Piernas y botas
  [-1, 1].forEach((side) => {
    g.add(cyl(0.02, 0.022, 0.09, brown, { x: side * 0.028, y: 0.06 }, 16));
    const boot = blob(0.024, boots, { x: side * 0.028, y: 0.016, z: 0.01 });
    boot.scale.set(0.9, 0.6, 1.4);
    g.add(boot);
  });
  // Chaqueta y cinturón
  g.add(cyl(0.048, 0.056, 0.13, green, { y: 0.165 }, 28));
  g.add(cyl(0.057, 0.057, 0.014, mat("#8a5a33"), { y: 0.115 }, 28));
  g.add(blob(0.007, gold, { y: 0.115, z: 0.056 }));
  // Brazos
  [-1, 1].forEach((side) => {
    g.add(cyl(0.014, 0.014, 0.09, green, { x: side * 0.068, y: 0.16, rz: side * 0.25 }, 12));
    g.add(blob(0.014, skin, { x: side * 0.08, y: 0.115 }));
  });
  // Cabeza, barba, sombrero con pluma
  g.add(blob(0.05, skin, { y: 0.275 }));
  const chin = blob(0.04, beard, { y: 0.252, z: 0.02 });
  chin.scale.set(1.1, 0.75, 1);
  g.add(chin);
  eyes(g, { x: 0.018, y: 0.285, z: 0.043, r: 0.006 });
  g.add(cyl(0.075, 0.078, 0.01, greenDark, { y: 0.312 }, 32));
  g.add(cone(0.05, 0.075, green, { y: 0.35 }, 32));
  const plume = blob(0.03, feather, { x: 0.05, y: 0.36, z: -0.01, rz: -0.9 });
  plume.scale.set(1.6, 0.25, 0.4);
  g.add(plume);

  return fit(g, 0.3);
}
