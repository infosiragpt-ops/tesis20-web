import * as THREE from "three";
import { mat, blob, cone, fit } from "./_shared.js";
export const id = "pelicano";
export const label = "Pelícano";
export function build() {
  const g = new THREE.Group();
  const feather = mat("#eee4d2", { rough: 0.74 });
  const wingMat = mat("#817b78", { rough: 0.72 });
  const gold = mat("#e9b44e", { rough: 0.4 });
  const body = blob(0.085, feather, { y: 0.10 }); body.scale.set(0.76, 1, 0.95); g.add(body);
  const neck = blob(0.034, feather, { y: 0.205, z: 0.015 }); neck.scale.y = 1.65; g.add(neck);
  g.add(blob(0.044, feather, { y: 0.256, z: 0.017 }));
  const beak = cone(0.025, 0.15, gold, { y: 0.24, z: 0.105 }); beak.rotation.x = Math.PI / 2; g.add(beak);
  const pouch = blob(0.036, gold, { y: 0.219, z: 0.095 }); pouch.scale.set(0.7, 0.55, 1.5); g.add(pouch);
  [-1, 1].forEach(side => {
    const wing = blob(0.065, wingMat, { x: side * 0.055, y: 0.105 }); wing.scale.set(0.25, 1, 0.8); g.add(wing);
    g.add(blob(0.007, mat("#222433", { rough: 0.2 }), { x: side * 0.033, y: 0.264, z: 0.042 }));
    const foot = blob(0.025, gold, { x: side * 0.032, y: 0.018, z: 0.025 }); foot.scale.set(1, 0.3, 1.5); g.add(foot);
  });
  return fit(g, 0.32);
}
