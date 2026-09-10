// Olla negra de tres patas con sopa naranja humeante y dos asas.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "olla";
export const label = "Olla de sopa";

export function build() {
  const g = new THREE.Group();
  const iron = mat("#3a3f4c", { rough: 0.55, metal: 0.2 });
  const ironDark = mat("#2b2f3a", { rough: 0.6, metal: 0.2 });
  const soup = mat("#e8a24a", { rough: 0.3, emissive: "#ff8a1f", emissiveIntensity: 0.25 });
  const steam = mat("#ffffff", { rough: 1, opacity: 0.35 });
  steam.depthWrite = false;

  // Cuerpo torneado
  const pts = [
    [0, 0.05], [0.05, 0.05], [0.085, 0.07], [0.1, 0.11], [0.098, 0.17], [0.088, 0.2], [0.096, 0.215],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(pts, 40), iron));
  g.add(mesh(new THREE.TorusGeometry(0.094, 0.009, 12, 40), ironDark, { y: 0.215, rx: Math.PI / 2 }));
  g.add(cyl(0.086, 0.086, 0.006, soup, { y: 0.205 }, 40));
  // Patas
  [0, 1, 2].forEach((i) => {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    g.add(cyl(0.008, 0.01, 0.06, ironDark, { x: Math.cos(a) * 0.06, y: 0.03, z: Math.sin(a) * 0.06, rx: Math.sin(a) * 0.25, rz: -Math.cos(a) * 0.25 }, 10));
  });
  // Asas
  [-1, 1].forEach((side) => g.add(mesh(new THREE.TorusGeometry(0.026, 0.007, 10, 24, Math.PI), ironDark, { x: side * 0.1, y: 0.17, rz: side * -Math.PI / 2 })));
  // Vapor
  [[0.02, 0.26, 0.026], [-0.03, 0.3, 0.02], [0.01, 0.34, 0.016]].forEach(([x, y, r]) => {
    const puff = blob(r, steam, { x, y });
    puff.castShadow = false;
    puff.receiveShadow = false;
    g.add(puff);
  });

  return fit(g, 0.28);
}
