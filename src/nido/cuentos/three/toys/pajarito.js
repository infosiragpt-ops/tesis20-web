// Pajarito rojo posado en una ramita, con pico naranja, alas y cola en abanico.
import * as THREE from "three";
import { mat, blob, box, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "pajarito";
export const label = "Pajarito";

export function build() {
  const g = new THREE.Group();
  const red = mat("#e2453b", { rough: 0.6 });
  const redDark = mat("#b12d2d", { rough: 0.6 });
  const beak = mat("#f2a13c", { rough: 0.5 });
  const wood = mat("#8a5a33", { rough: 0.9 });
  const leaf = mat("#5cb56a", { rough: 0.6 });

  // Ramita con hojas
  g.add(cyl(0.012, 0.014, 0.22, wood, { y: 0.02, rz: Math.PI / 2 }, 12));
  [-0.07, 0.06].forEach((x, i) => {
    const l = blob(0.022, leaf, { x, y: 0.032, z: i ? 0.02 : -0.02, rz: i ? 0.5 : -0.5 });
    l.scale.set(1.5, 0.25, 0.8);
    g.add(l);
  });
  // Patitas
  [-1, 1].forEach((side) => g.add(cyl(0.004, 0.004, 0.035, beak, { x: side * 0.018, y: 0.045 }, 8)));
  // Cuerpo, cabeza, pico, alas y cola
  const body = blob(0.055, red, { y: 0.1 });
  body.scale.set(1, 0.9, 1.25);
  g.add(body);
  g.add(blob(0.04, red, { y: 0.15, z: 0.04 }));
  g.add(cone(0.014, 0.035, beak, { y: 0.148, z: 0.09, rx: Math.PI / 2 }, 12));
  eyes(g, { x: 0.018, y: 0.16, z: 0.07, r: 0.006 });
  [-1, 1].forEach((side) => {
    const wing = blob(0.035, redDark, { x: side * 0.045, y: 0.105, z: -0.005, rz: side * 0.3 });
    wing.scale.set(0.5, 0.6, 1.2);
    g.add(wing);
  });
  const tail = box(0.05, 0.012, 0.07, redDark, { y: 0.105, z: -0.085, rx: -0.45 });
  g.add(tail);
  // Pancita clara
  const belly = blob(0.035, mat("#f7d9c4"), { y: 0.085, z: 0.035 });
  belly.scale.set(0.9, 0.9, 0.7);
  g.add(belly);

  return fit(g, 0.22);
}
