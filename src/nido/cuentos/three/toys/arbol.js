// Árbol de juguete: copa de esferas verde claro como una nube, tronco gordito con raíces, sobre una rodaja de tronco.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "arbol";
export const label = "Árbol";

export function build() {
  const g = new THREE.Group();
  const bark = mat("#7a563a", { rough: 0.85 });
  const wood = mat("#dcbc8e", { rough: 0.8 });
  const ring = mat("#b98756", { rough: 0.8 });
  const trunk = mat("#8b5a3c", { rough: 0.7 });
  const knot = mat("#5a3a26", { rough: 0.7 });
  const leafA = mat("#8fcc5c");
  const leafB = mat("#9ed66a");
  const apple = mat("#e5483f", { rough: 0.45 });

  // Peana: rodaja de tronco con corteza y anillos de crecimiento
  g.add(cyl(0.115, 0.12, 0.03, bark, { y: 0.015 }, 32));
  g.add(cyl(0.105, 0.105, 0.008, wood, { y: 0.032 }, 32));
  [0.075, 0.045].forEach((r) => {
    g.add(mesh(new THREE.TorusGeometry(r, 0.003, 8, 40), ring, { y: 0.036, rx: Math.PI / 2 }));
  });

  // Tronco corto y grueso, con un nudo mirando al frente
  g.add(cyl(0.045, 0.058, 0.17, trunk, { y: 0.12 }, 20));
  const eye = blob(0.012, knot, { y: 0.11, z: 0.049 });
  eye.scale.set(1, 1.3, 0.4);
  g.add(eye);
  // Raíces: bultos que salen del tronco y se apoyan en la rodaja
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const root = blob(0.022, trunk, { x: Math.cos(a) * 0.06, y: 0.05, z: Math.sin(a) * 0.06, ry: -a });
    root.scale.set(1.9, 0.65, 1);
    g.add(root);
  }

  // Copa: nube de esferas
  g.add(blob(0.11, leafA, { y: 0.275 }));
  g.add(blob(0.082, leafB, { x: -0.085, y: 0.245, z: 0.01 }));
  g.add(blob(0.082, leafB, { x: 0.085, y: 0.25, z: -0.01 }));
  g.add(blob(0.072, leafB, { y: 0.245, z: 0.08 }));
  g.add(blob(0.07, leafA, { y: 0.255, z: -0.085 }));
  g.add(blob(0.082, leafB, { x: 0.01, y: 0.355 }));

  // Manzanas apoyadas en la superficie de la copa
  [
    [0.031, 0.262, 0.139],
    [-0.043, 0.223, 0.133],
    [0.146, 0.275, 0.038],
    [-0.142, 0.278, 0.058],
    [0.051, 0.396, 0.058],
  ].forEach(([x, y, z]) => g.add(blob(0.016, apple, { x, y, z })));

  return fit(g, 0.3);
}
