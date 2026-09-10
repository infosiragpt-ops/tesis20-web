// Caperucita: figurita con capa roja con capucha, vestido crema y canasta en la mano.
import * as THREE from "three";
import { mat, mesh, blob, cyl, eyes, fit } from "./_shared.js";

export const id = "caperucita";
export const label = "Caperucita";

export function build() {
  const g = new THREE.Group();
  const red = mat("#d63b3b", { rough: 0.7 });
  const redDark = mat("#b12d2d", { rough: 0.7 });
  const skin = mat("#f2c9a8");
  const hair = mat("#6b3f26", { rough: 0.8 });
  const cream = mat("#f4e4c8");
  const wicker = mat("#c9955c", { rough: 0.85 });
  const shoe = mat("#5b3a2a", { rough: 0.8 });

  // Capa: cono truncado que llega casi al suelo, con dobladillo oscuro
  g.add(cyl(0.045, 0.1, 0.2, red, { y: 0.12 }, 32));
  g.add(cyl(0.101, 0.104, 0.014, redDark, { y: 0.027 }, 32));
  // Vestido asomando y zapatitos
  g.add(cyl(0.06, 0.07, 0.03, cream, { y: 0.03 }, 24));
  [-1, 1].forEach((side) => {
    const foot = blob(0.02, shoe, { x: side * 0.03, y: 0.014, z: 0.045 });
    foot.scale.set(1, 0.6, 1.4);
    g.add(foot);
  });
  // Cabeza, pelo y capucha
  const head = blob(0.05, skin, { y: 0.245, z: 0.012 });
  g.add(head);
  const hairCap = blob(0.052, hair, { y: 0.252, z: 0.004 });
  hairCap.scale.set(1, 0.9, 1);
  hairCap.position.y = 0.26;
  g.add(hairCap);
  [-1, 1].forEach((side) => g.add(cyl(0.012, 0.014, 0.06, hair, { x: side * 0.045, y: 0.22, z: 0.02 }, 12)));
  const hood = blob(0.064, red, { y: 0.262, z: -0.018 });
  hood.scale.set(1, 1.05, 0.95);
  g.add(hood);
  // Cara: la capucha se abre al frente con un hueco (esfera de piel más adelante)
  g.add(blob(0.044, skin, { y: 0.242, z: 0.03 }));
  eyes(g, { x: 0.016, y: 0.25, z: 0.068, r: 0.007 });
  g.add(blob(0.006, mat("#f39a9a"), { x: -0.03, y: 0.235, z: 0.058 }));
  g.add(blob(0.006, mat("#f39a9a"), { x: 0.03, y: 0.235, z: 0.058 }));
  // Bracito con la canasta
  g.add(cyl(0.011, 0.011, 0.07, red, { x: 0.075, y: 0.135, z: 0.02, rz: 0.55 }, 12));
  g.add(blob(0.012, skin, { x: 0.095, y: 0.104, z: 0.028 }));
  const basket = cyl(0.03, 0.022, 0.04, wicker, { x: 0.105, y: 0.07, z: 0.03 }, 20);
  g.add(basket);
  g.add(mesh(new THREE.TorusGeometry(0.03, 0.004, 8, 24, Math.PI), wicker, { x: 0.105, y: 0.09, z: 0.03 }));
  g.add(cyl(0.02, 0.02, 0.012, cream, { x: 0.105, y: 0.095, z: 0.03 }, 16));

  return fit(g, 0.3);
}
