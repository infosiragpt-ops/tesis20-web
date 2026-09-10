// Ramo de flores del bosque atado con una cinta roja: tallos verdes y cinco corolas.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit } from "./_shared.js";

export const id = "ramo";
export const label = "Ramo de flores";

export function build() {
  const g = new THREE.Group();
  const stem = mat("#4f8a3a", { rough: 0.7 });
  const paper = mat("#f4e4c8", { rough: 0.8 });
  const ribbon = mat("#d63b3b", { rough: 0.5 });
  const colors = ["#f2c14e", "#f28fb1", "#9fd0ff", "#ffffff", "#f2a13c"];
  const centers = mat("#c98b1f", { rough: 0.5 });

  // Cono de papel que envuelve los tallos
  g.add(cone(0.075, 0.16, paper, { y: 0.08, rx: Math.PI }, 32));
  g.add(mesh(new THREE.TorusGeometry(0.036, 0.008, 10, 32), ribbon, { y: 0.05, rx: Math.PI / 2 }));
  g.add(blob(0.012, ribbon, { y: 0.05, z: 0.04 }));
  // Tallos y flores abriéndose en abanico
  colors.forEach((color, i) => {
    const a = ((i - 2) / 2) * 0.55;
    const tilt = ((i % 2) - 0.5) * 0.35;
    const len = 0.19 + (i % 3) * 0.02;
    const x = Math.sin(a) * len * 0.55;
    const z = Math.sin(tilt) * len * 0.3;
    g.add(cyl(0.005, 0.006, len, stem, { x: x / 2, y: 0.06 + len / 2, z: z / 2, rz: -a * 0.5, rx: tilt * 0.5 }, 8));
    const head = blob(0.028, mat(color, { rough: 0.6 }), { x, y: 0.06 + len, z });
    head.scale.set(1, 0.55, 1);
    g.add(head);
    g.add(blob(0.009, centers, { x, y: 0.075 + len, z }));
  });
  // Hojitas
  [-1, 1].forEach((side) => {
    const leaf = blob(0.03, stem, { x: side * 0.045, y: 0.15, z: 0.02, rz: side * 0.6 });
    leaf.scale.set(1.4, 0.2, 0.7);
    g.add(leaf);
  });

  return fit(g, 0.28);
}
