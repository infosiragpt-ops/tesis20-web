// Cerdito rosado de pie, orejitas, hocico redondo, colita en espiral y overol celeste.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "cerdito";
export const label = "Cerdito";

export function build() {
  const g = new THREE.Group();
  const pink = mat("#f7b4c4");
  const pinkDark = mat("#e58fa6");
  const denim = mat("#5aa0d8", { rough: 0.75 });
  const dark = mat("#b5637e", { rough: 0.4 });

  // Cuerpo redondo y overol
  const body = blob(0.085, pink, { y: 0.135 });
  body.scale.set(1, 1.05, 0.92);
  g.add(body);
  const bib = blob(0.083, denim, { y: 0.11 });
  bib.scale.set(1.02, 0.7, 0.95);
  g.add(bib);
  [-1, 1].forEach((side) => g.add(box(0.016, 0.07, 0.01, denim, { x: side * 0.03, y: 0.17, z: 0.074, rx: -0.2 })));
  // Patas con pezuñas
  [-1, 1].forEach((side) => {
    g.add(cyl(0.02, 0.022, 0.07, pink, { x: side * 0.035, y: 0.04 }, 16));
    const hoof = blob(0.022, pinkDark, { x: side * 0.035, y: 0.012, z: 0.004 });
    hoof.scale.set(1, 0.55, 1.1);
    g.add(hoof);
  });
  // Bracitos
  [-1, 1].forEach((side) => g.add(cyl(0.014, 0.016, 0.075, pink, { x: side * 0.085, y: 0.14, z: 0.02, rz: side * 0.5 }, 14)));
  // Cabeza
  const head = blob(0.072, pink, { y: 0.27 });
  head.scale.set(1.08, 0.98, 0.98);
  g.add(head);
  // Hocico y fosas
  const snout = cyl(0.03, 0.026, 0.028, pinkDark, { y: 0.252, z: 0.078, rx: Math.PI / 2 }, 24);
  g.add(snout);
  [-1, 1].forEach((side) => g.add(blob(0.006, dark, { x: side * 0.011, y: 0.254, z: 0.093 })));
  eyes(g, { x: 0.028, y: 0.288, z: 0.06, r: 0.012 });
  // Orejas triangulares con interior oscuro
  [-1, 1].forEach((side) => {
    const ear = cone(0.028, 0.06, pink, { x: side * 0.05, y: 0.34, z: -0.005, rz: side * -0.45, rx: -0.2 }, 12);
    ear.scale.set(1, 1, 0.45);
    g.add(ear);
    const inner = cone(0.018, 0.042, pinkDark, { x: side * 0.05, y: 0.337, z: 0.004, rz: side * -0.45, rx: -0.2 }, 12);
    inner.scale.set(1, 1, 0.4);
    g.add(inner);
  });
  // Mejillas
  [-1, 1].forEach((side) => {
    const cheek = blob(0.012, pinkDark, { x: side * 0.046, y: 0.258, z: 0.05 });
    cheek.scale.set(1, 0.7, 0.6);
    g.add(cheek);
  });
  // Colita en espiral
  g.add(mesh(new THREE.TorusGeometry(0.014, 0.005, 10, 24, Math.PI * 1.5), pinkDark, { y: 0.15, z: -0.085, rx: 0.3, ry: Math.PI / 2 }));

  return fit(g, 0.29);
}
