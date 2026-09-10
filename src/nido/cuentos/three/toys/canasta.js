// Canasta de mimbre con asa, un mantelito a cuadros y un pastel con mermelada.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, fit } from "./_shared.js";

export const id = "canasta";
export const label = "Canasta";

export function build() {
  const g = new THREE.Group();
  const wicker = mat("#c9955c", { rough: 0.85 });
  const wickerDark = mat("#a5713f", { rough: 0.9 });
  const cloth = mat("#f4e4c8", { rough: 0.8 });
  const check = mat("#d63b3b", { rough: 0.8 });
  const cake = mat("#f1d7a2", { rough: 0.7 });
  const jam = mat("#c9303a", { rough: 0.35 });

  const pts = [[0, 0.01], [0.075, 0.01], [0.095, 0.05], [0.105, 0.11]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(pts, 32), wicker));
  // Tejido: aros horizontales
  [0.03, 0.06, 0.09].forEach((y, i) => g.add(mesh(new THREE.TorusGeometry(0.082 + i * 0.008, 0.004, 8, 40), wickerDark, { y, rx: Math.PI / 2 })));
  g.add(mesh(new THREE.TorusGeometry(0.105, 0.007, 10, 40), wickerDark, { y: 0.11, rx: Math.PI / 2 }));
  // Asa
  g.add(mesh(new THREE.TorusGeometry(0.1, 0.008, 10, 40, Math.PI), wickerDark, { y: 0.11 }));
  // Mantel a cuadros asomando y pastel
  const napkin = box(0.15, 0.008, 0.13, cloth, { y: 0.108, rz: 0.06 });
  g.add(napkin);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => g.add(box(0.04, 0.009, 0.04, check, { x: sx * 0.04, y: 0.109, z: sz * 0.035, rz: 0.06 }))));
  g.add(cyl(0.045, 0.045, 0.035, cake, { y: 0.128 }, 28));
  const top = blob(0.04, jam, { y: 0.147 });
  top.scale.set(1, 0.25, 1);
  g.add(top);
  g.add(blob(0.008, jam, { x: 0.02, y: 0.152, z: 0.012 }));

  return fit(g, 0.24);
}
