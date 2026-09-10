// Cactus de juguete en su maceta de barro: dos brazos alegres y una flor en la punta.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "cactus";
export const label = "Cactus";

export function build() {
  const g = new THREE.Group();
  const green = mat("#5aac4e");
  const rib = mat("#3f8f3c");
  const clay = mat("#e07f3f", { rough: 0.8 });
  const clayDark = mat("#cf6d33", { rough: 0.8 });
  const soil = mat("#5a3c2b", { rough: 0.95 });
  const white = mat("#fff7ea", { rough: 0.5 });
  const yellow = mat("#f6c445", { rough: 0.5 });

  // Maceta con borde y tierra
  g.add(cyl(0.082, 0.064, 0.125, clay, { y: 0.0625 }, 32));
  g.add(cyl(0.096, 0.093, 0.034, clayDark, { y: 0.137 }, 32));
  const mound = blob(0.088, soil, { y: 0.15 });
  mound.scale.set(1, 0.25, 1);
  g.add(mound);

  // Tronco y líneas verticales
  const trunkR = 0.058;
  g.add(mesh(new THREE.CapsuleGeometry(trunkR, 0.2, 8, 32), green, { y: 0.283 }));
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    g.add(mesh(new THREE.CapsuleGeometry(0.0055, 0.16, 4, 8), rib, { x: Math.sin(a) * 0.0555, y: 0.283, z: Math.cos(a) * 0.0555 }));
  }

  // Brazos curvados hacia arriba (codo de toro)
  const armR = 0.034;
  const bend = 0.036;
  const reach = 0.075;
  [[1, 0.29, 0.05], [-1, 0.245, 0.075]].forEach(([s, y, up]) => {
    g.add(mesh(new THREE.CapsuleGeometry(armR, 0.06, 6, 20), green, { x: s * (reach - 0.03), y, rz: Math.PI / 2 }));
    g.add(mesh(new THREE.TorusGeometry(bend, armR, 16, 20, Math.PI / 2), green, { x: s * reach, y: y + bend, rz: s > 0 ? -Math.PI / 2 : Math.PI }));
    const ax = s * (reach + bend);
    const ay = y + bend + up / 2;
    g.add(mesh(new THREE.CapsuleGeometry(armR, up, 6, 20), green, { x: ax, y: ay }));
    g.add(mesh(new THREE.CapsuleGeometry(0.0045, up * 0.7, 4, 8), rib, { x: ax, y: ay, z: armR - 0.002 }));
    g.add(mesh(new THREE.CapsuleGeometry(0.0045, up * 0.7, 4, 8), rib, { x: ax + s * (armR - 0.002), y: ay }));
  });

  // Flor blanca con centro amarillo
  const top = 0.283 + 0.1 + trunkR;
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    const petal = blob(0.028, white, { x: Math.sin(a) * 0.036, y: top + 0.01, z: Math.cos(a) * 0.036 });
    petal.scale.set(0.8, 0.5, 1.35);
    petal.rotation.set(-0.5, a, 0, "YXZ");
    g.add(petal);
  }
  const center = blob(0.024, yellow, { y: top + 0.024 });
  center.scale.set(1, 0.8, 1);
  g.add(center);

  return fit(g, 0.3);
}
