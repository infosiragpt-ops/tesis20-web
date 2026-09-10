// Escalera de tijera de madera, con peldaños al frente y travesaños detrás.
import * as THREE from "three";
import { mat, box, cyl, fit } from "./_shared.js";

export const id = "escalera";
export const label = "Escalera";

export function build() {
  const g = new THREE.Group();
  const wood = mat("#c9955c", { rough: 0.8 });
  const woodDark = mat("#a8743f", { rough: 0.85 });
  const H = 0.3;
  const tilt = 0.28;
  const W = 0.12;

  [-1, 1].forEach((front) => {
    const side = new THREE.Group();
    [-1, 1].forEach((s) => side.add(box(0.016, H, 0.016, wood, { x: s * W / 2, y: H / 2 })));
    const rungs = front > 0 ? 4 : 2;
    for (let i = 0; i < rungs; i += 1) {
      const y = 0.05 + (i * (H - 0.09)) / Math.max(rungs - 1, 1);
      side.add(front > 0 ? box(W, 0.014, 0.03, woodDark, { y }) : cyl(0.006, 0.006, W, woodDark, { y, rz: Math.PI / 2 }, 10));
    }
    side.rotation.x = -front * tilt;
    side.position.z = front * 0.004;
    g.add(side);
  });
  // Bisagra superior
  g.add(cyl(0.012, 0.012, W + 0.02, woodDark, { y: H * Math.cos(tilt), rz: Math.PI / 2 }, 14));

  return fit(g, 0.3);
}
