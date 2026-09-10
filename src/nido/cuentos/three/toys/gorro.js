// Gorro de dormir de la abuelita: tela blanca con volante y pompón dorado caído a un lado.
import * as THREE from "three";
import { mat, mesh, blob, fit } from "./_shared.js";

export const id = "gorro";
export const label = "Gorro de dormir";

export function build() {
  const g = new THREE.Group();
  const linen = mat("#ffffff", { rough: 0.85 });
  const frill = mat("#f4e4c8", { rough: 0.85 });
  const pom = mat("#f2c14e", { rough: 0.9 });

  // Copa del gorro: torneado que se inclina hacia un lado
  const pts = [[0, 0], [0.095, 0], [0.098, 0.03], [0.085, 0.09], [0.06, 0.15], [0.03, 0.2], [0.012, 0.23], [0, 0.235]].map(([x, y]) => new THREE.Vector2(x, y));
  const cap = mesh(new THREE.LatheGeometry(pts, 36), linen, { y: 0.006, rz: -0.35 });
  g.add(cap);
  // Volante en la base
  g.add(mesh(new THREE.TorusGeometry(0.096, 0.014, 12, 40), frill, { y: 0.012, rx: Math.PI / 2 }));
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const bump = blob(0.016, frill, { x: Math.cos(a) * 0.104, y: 0.012, z: Math.sin(a) * 0.104 });
    bump.scale.set(1, 0.7, 1);
    g.add(bump);
  }
  // Pompón en la punta (la punta gira con rz = -0.35 alrededor del origen)
  const tipY = 0.235 * Math.cos(-0.35) + 0.006;
  const tipX = -0.235 * Math.sin(-0.35);
  g.add(blob(0.028, pom, { x: tipX, y: tipY, z: 0 }));

  return fit(g, 0.22);
}
