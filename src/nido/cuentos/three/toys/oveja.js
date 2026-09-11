// Ovejita rechoncha de lana blanca con cara y patas oscuras y un lacito rojo.
// Cabeza (userData.head) con ojos grandes, orejas caídas (ear) y patas (leg)
// articuladas para mirar arriba, trotar y escuchar.
import * as THREE from "three";
import { mat, blob, cyl, fit, eyeball, smile } from "./_shared.js";

export const id = "oveja";
export const label = "Oveja";

export function build() {
  const g = new THREE.Group();
  const wool = mat("#faf6ee", { rough: 0.85 , surface: "wool" });
  const dark = mat("#3b3a42", { rough: 0.7 , surface: "fur" });
  const pink = mat("#e98da3", { rough: 0.6 });
  const red = mat("#d9363f", { rough: 0.5 });

  /* --------------------------- cuerpo de lana ------------------------- */
  const body = blob(0.1, wool, { y: 0.155 });
  body.scale.set(1.05, 0.9, 1.25);
  g.add(body);
  [
    [0, 0.23, 0.02, 0.05], [0.06, 0.22, 0.06, 0.045], [-0.06, 0.22, 0.06, 0.045], [0.065, 0.215, -0.05, 0.047], [-0.065, 0.215, -0.05, 0.047],
    [0.1, 0.155, 0.03, 0.045], [-0.1, 0.155, 0.03, 0.045], [0.095, 0.145, -0.06, 0.042], [-0.095, 0.145, -0.06, 0.042], [0, 0.185, -0.125, 0.048],
    [0.04, 0.125, 0.115, 0.038], [-0.04, 0.125, 0.115, 0.038],
  ].forEach(([x, y, z, r]) => g.add(blob(r, wool, { x, y, z })));
  const tail = new THREE.Group();
  tail.position.set(0, 0.2, -0.14);
  tail.userData.tail = "y";
  tail.add(blob(0.028, wool, { z: -0.02 }));
  g.add(tail);

  /* -------------------------- patas articuladas ----------------------- */
  [[-0.05, 0.065, 1], [0.05, 0.065, -1], [-0.05, -0.065, -1], [0.05, -0.065, 1]].forEach(([x, z, pair]) => {
    const leg = new THREE.Group();
    leg.position.set(x, 0.14, z);
    leg.userData.leg = pair;
    leg.add(cyl(0.021, 0.021, 0.095, dark, { y: -0.0925 }, 12));
    leg.add(cyl(0.025, 0.025, 0.025, dark, { y: -0.1275 }, 12));
    g.add(leg);
  });

  /* ------------------------- cabeza articulada ------------------------ */
  const headG = new THREE.Group();
  headG.position.set(0, 0.232, 0.145);
  headG.userData.head = 1;
  const head = blob(0.064, dark, {});
  head.scale.set(0.95, 0.92, 1.05);
  headG.add(head);
  const tuft = blob(0.044, wool, { y: 0.048, z: -0.027 });
  tuft.scale.set(1.15, 0.7, 1);
  headG.add(tuft);
  headG.add(blob(0.029, wool, { x: 0.032, y: 0.055 }));
  headG.add(blob(0.029, wool, { x: -0.032, y: 0.055 }));
  [-1, 1].forEach((side) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.06, 0.012, -0.017);
    ear.userData.ear = side;
    ear.userData.sway = side;
    const outer = blob(0.028, dark, { x: side * 0.018, y: -0.002, ry: side * 0.55, rz: side * -0.55 });
    outer.scale.set(1.5, 0.65, 0.5);
    ear.add(outer);
    const inner = blob(0.017, pink, { x: side * 0.024, y: -0.004, z: 0.012, ry: side * 0.55, rz: side * -0.55 });
    inner.scale.set(1.5, 0.55, 0.35);
    ear.add(inner);
    headG.add(ear);
    eyeball(headG, { x: side * 0.027, y: 0.01, z: 0.052, r: 0.015, iris: "#1c1a22", sclera: "#fffaf0", squash: 0.6 });
  });
  const nose = blob(0.012, pink, { y: -0.024, z: 0.061 });
  nose.scale.set(1.3, 0.8, 0.8);
  headG.add(nose);
  smile(headG, { y: -0.036, z: 0.058, r: 0.008, thick: 0.0018, color: "#1c1a22" });
  g.add(headG);

  /* ------------------------------- lacito ----------------------------- */
  [-1, 1].forEach((side) => {
    const loop = blob(0.021, red, { x: side * 0.028, y: 0.168, z: 0.168, rz: side * 0.2 });
    loop.scale.set(1.25, 0.85, 0.55);
    g.add(loop);
    const end = blob(0.011, red, { x: side * 0.014, y: 0.145, z: 0.172, rz: side * 0.35 });
    end.scale.set(0.7, 1.5, 0.5);
    g.add(end);
  });
  g.add(blob(0.012, red, { y: 0.168, z: 0.18 }));

  return fit(g, 0.3);
}
