// Bufeo de juguete: delfín rosado del Amazonas saltando sobre una peana de
// olitas. Ojos grandes con brillo, mejillas y sonrisa larga; la cabeza
// (userData.head) y la cola (tail) van en grupos articulados y las aletas
// reman (flutter) para que nade y salte al ritmo del cuento.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit, eyeball, cheek } from "./_shared.js";

export const id = "bufeo";
export const label = "Bufeo";

function wavyDisc(radius, amp, waves, phase, depth, bevel, material, y) {
  const shape = new THREE.Shape();
  const steps = 112;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const r = radius + amp * Math.cos(waves * t + phase);
    if (i === 0) shape.moveTo(Math.cos(t) * r, Math.sin(t) * r);
    else shape.lineTo(Math.cos(t) * r, Math.sin(t) * r);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4 });
  return mesh(geo, material, { y: y + bevel, rx: -Math.PI / 2 });
}

export function build() {
  const g = new THREE.Group();
  const pink = mat("#f3a3b5");
  const pinkLight = mat("#f9cbd6");
  const pinkDark = mat("#e88ea6");
  const teal = mat("#5fb8b4");
  const tealLight = mat("#93d8d2");
  const foam = mat("#f4fbfa", { rough: 0.5 });
  const line = mat("#b8556f", { rough: 0.5 });

  /* ------------------------------ olitas ------------------------------ */
  g.add(wavyDisc(0.13, 0.012, 8, 0, 0.022, 0.006, teal, 0));
  g.add(wavyDisc(0.105, 0.011, 8, Math.PI / 8, 0.01, 0.005, tealLight, 0.034));
  g.add(mesh(new THREE.TorusGeometry(0.04, 0.01, 12, 32), teal, { y: 0.052, z: 0.06, rx: Math.PI / 2 }));
  g.add(cyl(0.026, 0.04, 0.09, teal, { y: 0.09, z: 0.06 }, 16));
  const splash = blob(0.03, foam, { y: 0.128, z: 0.06 });
  splash.scale.set(1.15, 0.5, 1.15);
  g.add(splash);
  const tailWave = blob(0.03, tealLight, { y: 0.034, z: -0.115 });
  tailWave.scale.set(1.4, 0.7, 1.1);
  g.add(tailWave);
  g.add(blob(0.01, foam, { x: 0.055, y: 0.056, z: 0.03 }));
  g.add(blob(0.008, foam, { x: -0.05, y: 0.055, z: 0.05 }));
  g.add(blob(0.008, foam, { x: 0.03, y: 0.055, z: -0.05 }));

  /* ------------------------------ delfín ------------------------------ */
  const d = new THREE.Group();
  d.userData.body = 1;
  const body = blob(0.055, pink, { z: 0 });
  body.scale.set(1, 0.95, 2);
  d.add(body);
  const belly = blob(0.05, pinkLight, { y: -0.018, z: 0.01 });
  belly.scale.set(0.9, 0.75, 1.8);
  d.add(belly);
  const hump = blob(0.034, pink, { y: 0.045, z: -0.02 });
  hump.scale.set(0.55, 0.7, 1.6);
  d.add(hump);
  // Aletas pectorales anchas que reman
  [-1, 1].forEach((side) => {
    const fin = blob(0.034, pinkDark, { x: side * 0.058, y: -0.018, z: 0.03, ry: side * 0.2, rz: side * -0.4 });
    fin.scale.set(1.4, 0.22, 0.95);
    fin.userData.flutter = side * 0.25;
    d.add(fin);
  });

  // Cabeza articulada: melón, hocico largo, ojos grandes y sonrisa
  const headG = new THREE.Group();
  headG.position.set(0, 0.004, 0.05);
  headG.userData.head = 1;
  const head = blob(0.05, pink, { z: 0.02 });
  head.scale.set(0.95, 0.9, 1.25);
  headG.add(head);
  headG.add(cyl(0.009, 0.02, 0.085, pinkDark, { y: -0.012, z: 0.1025, rx: Math.PI / 2 }, 14));
  headG.add(blob(0.0085, pinkDark, { y: -0.012, z: 0.144 }));
  [-1, 1].forEach((side) => {
    headG.add(cyl(0.002, 0.002, 0.08, line, { x: side * 0.0138, y: -0.016, z: 0.1, rx: Math.PI / 2, ry: side * -0.129 }, 6));
    eyeball(headG, { x: side * 0.037, y: 0.014, z: 0.052, r: 0.012, iris: "#2a1b2e", squash: 0.6, look: -side * 0.6 });
    cheek(headG, { x: side * 0.03, y: -0.008, z: 0.064, r: 0.009, color: "#ec8fa8" });
  });
  d.add(headG);

  // Cola articulada: pedúnculo y aletas horizontales
  const tail = new THREE.Group();
  tail.position.set(0, 0, -0.08);
  tail.userData.tail = "x";
  tail.add(cyl(0.032, 0.013, 0.08, pink, { z: -0.04, rx: Math.PI / 2 }, 16));
  [-1, 1].forEach((side) => {
    const fluke = blob(0.028, pinkDark, { x: side * 0.036, z: -0.085, ry: side * 0.55 });
    fluke.scale.set(1.8, 0.3, 1);
    tail.add(fluke);
  });
  d.add(tail);

  d.rotation.x = -0.5;
  d.position.set(0, 0.165, 0.035);
  g.add(d);

  return fit(g, 0.3);
}
