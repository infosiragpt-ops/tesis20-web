// Manzana roja, brillante, con tallo y una hoja verde.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "manzana";
export const label = "Manzana";

export function build() {
  const g = new THREE.Group();
  const red = mat("#e2453b", { rough: 0.35 });
  const stem = mat("#6b4a2a", { rough: 0.8 });
  const leaf = mat("#5cb56a", { rough: 0.6 });

  const apple = blob(0.1, red, { y: 0.1 });
  apple.scale.set(1, 0.92, 1);
  g.add(apple);
  // Hoyuelo superior: una esfera hundida en el mismo rojo un poco más oscuro
  const dimple = blob(0.03, mat("#c93a31", { rough: 0.5 }), { y: 0.185 });
  dimple.scale.set(1.3, 0.3, 1.3);
  g.add(dimple);
  g.add(cyl(0.006, 0.008, 0.055, stem, { y: 0.205, rz: 0.15 }, 10));
  const hoja = mesh(new THREE.SphereGeometry(0.03, 20, 12), leaf, { x: 0.03, y: 0.215, z: 0.006, rz: -0.6 });
  hoja.scale.set(1.6, 0.25, 0.9);
  g.add(hoja);

  return fit(g, 0.24);
}
