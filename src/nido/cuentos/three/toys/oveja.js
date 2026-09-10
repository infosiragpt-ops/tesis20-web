// Ovejita rechoncha de lana blanca con cara y patas oscuras y un lacito rojo.
import * as THREE from "three";
import { mat, blob, cyl, fit } from "./_shared.js";

export const id = "oveja";
export const label = "Oveja";

export function build() {
  const g = new THREE.Group();
  const wool = mat("#faf6ee", { rough: 0.85 });
  const dark = mat("#3b3a42", { rough: 0.7 });
  const pink = mat("#e98da3", { rough: 0.6 });
  const red = mat("#d9363f", { rough: 0.5 });
  const black = mat("#1c1a22", { rough: 0.3 });
  const white = mat("#ffffff", { rough: 0.2 });

  // Cuerpo de lana: ovoide central más bultos alrededor
  const body = blob(0.1, wool, { y: 0.155 });
  body.scale.set(1.05, 0.9, 1.25);
  g.add(body);
  const bumps = [
    [0, 0.23, 0.02, 0.05],
    [0.06, 0.22, 0.06, 0.045],
    [-0.06, 0.22, 0.06, 0.045],
    [0.065, 0.215, -0.05, 0.047],
    [-0.065, 0.215, -0.05, 0.047],
    [0.1, 0.155, 0.03, 0.045],
    [-0.1, 0.155, 0.03, 0.045],
    [0.095, 0.145, -0.06, 0.042],
    [-0.095, 0.145, -0.06, 0.042],
    [0, 0.185, -0.125, 0.048],
    [0.04, 0.125, 0.115, 0.038],
    [-0.04, 0.125, 0.115, 0.038],
  ];
  bumps.forEach(([x, y, z, r]) => g.add(blob(r, wool, { x, y, z })));
  // Colita
  g.add(blob(0.028, wool, { y: 0.2, z: -0.16 }));

  // Patas cortas y oscuras con pezuña
  [[-0.05, 0.065], [0.05, 0.065], [-0.05, -0.065], [0.05, -0.065]].forEach(([x, z]) => {
    g.add(cyl(0.021, 0.021, 0.095, dark, { x, y: 0.0475, z }, 12));
    g.add(cyl(0.025, 0.025, 0.025, dark, { x, y: 0.0125, z }, 12));
  });

  // Cabeza oscura al frente
  const head = blob(0.064, dark, { y: 0.232, z: 0.145 });
  head.scale.set(0.95, 0.92, 1.05);
  g.add(head);
  // Copete de lana sobre la cabeza
  const tuft = blob(0.044, wool, { y: 0.28, z: 0.118 });
  tuft.scale.set(1.15, 0.7, 1);
  g.add(tuft);
  g.add(blob(0.029, wool, { x: 0.032, y: 0.287, z: 0.145 }));
  g.add(blob(0.029, wool, { x: -0.032, y: 0.287, z: 0.145 }));
  // Orejas caídas hacia los lados, con el interior rosa mirando al frente
  [-1, 1].forEach((side) => {
    const ear = blob(0.028, dark, { x: side * 0.078, y: 0.242, z: 0.128, ry: side * 0.55, rz: side * -0.55 });
    ear.scale.set(1.5, 0.65, 0.5);
    ear.userData.sway = side;
    g.add(ear);
    const inner = blob(0.017, pink, { x: side * 0.084, y: 0.24, z: 0.14, ry: side * 0.55, rz: side * -0.55 });
    inner.scale.set(1.5, 0.55, 0.35);
    inner.userData.sway = side;
    g.add(inner);
  });
  // Ojos blancos con pupila
  [-1, 1].forEach((side) => {
    g.add(blob(0.017, white, { x: side * 0.027, y: 0.24, z: 0.196 }));
    g.add(blob(0.0095, black, { x: side * 0.028, y: 0.24, z: 0.209 }));
    g.add(blob(0.0035, white, { x: side * 0.031, y: 0.244, z: 0.216 }));
  });
  // Nariz
  const nose = blob(0.012, pink, { y: 0.208, z: 0.206 });
  nose.scale.set(1.3, 0.8, 0.8);
  g.add(nose);

  // Lacito rojo en el cuello: dos lazadas, nudo y colitas
  [-1, 1].forEach((side) => {
    const loop = blob(0.021, red, { x: side * 0.028, y: 0.168, z: 0.168, rz: side * 0.2 });
    loop.scale.set(1.25, 0.85, 0.55);
    g.add(loop);
    const tail = blob(0.011, red, { x: side * 0.014, y: 0.145, z: 0.172, rz: side * 0.35 });
    tail.scale.set(0.7, 1.5, 0.5);
    g.add(tail);
  });
  g.add(blob(0.012, red, { y: 0.168, z: 0.18 }));

  return fit(g, 0.3);
}
