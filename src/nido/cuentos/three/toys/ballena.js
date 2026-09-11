// Ballena azul rechoncha con chorrito de agua, sobre una peana de olitas.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit, eyeball } from "./_shared.js";

export const id = "ballena";
export const label = "Ballena";

function bodyGeometry() {
  const profile = [[0, -0.14], [0.032, -0.135], [0.048, -0.115], [0.068, -0.085], [0.086, -0.04], [0.097, 0], [0.1, 0.04], [0.096, 0.08], [0.08, 0.115], [0.05, 0.14], [0, 0.152]];
  const curve = new THREE.CatmullRomCurve3(profile.map(([r, z]) => new THREE.Vector3(r, z, 0)));
  const points = curve.getPoints(48).map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y));
  return new THREE.LatheGeometry(points, 36);
}

export function build() {
  const g = new THREE.Group();
  const blue = mat("#3b82d4", { surface: "skin" });
  const belly = mat("#e3f2fb", { surface: "skin" });
  const navy = mat("#1f3a63", { rough: 0.4 });
  const pink = mat("#f2a3b0");
  const spray = mat("#9fdff8", { rough: 0.35 });
  const sea = mat("#a6d6f2", { rough: 0.75 });
  const foam = mat("#c4e5f8", { rough: 0.75 });

  // Peana de olitas (disco ovalado + crestas alrededor)
  const disc = cyl(0.11, 0.115, 0.03, sea, { y: 0.015 }, 32);
  disc.scale.z = 1.15;
  g.add(disc);
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const r = i % 2 ? 0.026 : 0.021;
    const wave = blob(r, foam, { x: Math.cos(a) * 0.103, y: 0.03, z: Math.sin(a) * 0.12 });
    wave.scale.set(1, 0.55, 1);
    g.add(wave);
  }

  // La ballena entera es un grupo articulado: escucha, canta y nada como un solo cuerpo.
  const whale = new THREE.Group();
  whale.userData.head = 1;
  whale.userData.body = 1;
  g.add(whale);

  // Cuerpo torneado (eje a lo largo de z) y panza clara desplazada hacia abajo
  const shape = bodyGeometry();
  whale.add(mesh(shape, blue, { y: 0.125, rx: Math.PI / 2, s: [1, 1, 0.92] }));
  whale.add(mesh(shape, belly, { y: 0.095, z: 0.004, rx: Math.PI / 2, s: [0.965, 0.99, 0.9] }));

  // Cara
  [-1, 1].forEach((side) => eyeball(g, { x: side * 0.052, y: 0.15, z: 0.128, r: 0.017, iris: "#1f3a63", squash: 0.6 }));
  whale.add(mesh(new THREE.TorusGeometry(0.034, 0.0055, 8, 24, Math.PI), navy, { y: 0.1, z: 0.149, rz: Math.PI }));
  [-1, 1].forEach((side) => {
    const cheek = blob(0.017, pink, { x: side * 0.072, y: 0.118, z: 0.12 });
    cheek.scale.set(1, 0.8, 0.5);
    whale.add(cheek);
  });

  // Aletas laterales y aleta dorsal redondeada
  [-1, 1].forEach((side) => {
    const fin = blob(0.042, blue, { x: side * 0.1, y: 0.1, z: 0.04, rz: side * -0.42, ry: side * 0.25 });
    fin.scale.set(1.3, 0.35, 0.8);
    whale.add(fin);
  });
  const dorsal = blob(0.045, blue, { y: 0.21, z: -0.065, rx: -0.5 });
  dorsal.scale.set(0.36, 1, 0.8);
  whale.add(dorsal);

  // Cola levantada con dos lóbulos, articulada desde la base
  const tail = new THREE.Group();
  tail.position.set(0, 0.14, -0.1);
  tail.userData.tail = "x";
  tail.add(cyl(0.024, 0.052, 0.11, blue, { y: 0.019, z: -0.044, rx: -0.55 }, 16));
  [-1, 1].forEach((side) => {
    const lobe = blob(0.05, blue, { x: side * 0.05, y: 0.082, z: -0.08, rx: 1.02, ry: side * -0.3 });
    lobe.scale.set(1.25, 0.28, 0.85);
    tail.add(lobe);
  });
  whale.add(tail);

  // Chorrito de agua (crece cuando la ballena canta)
  const jet = new THREE.Group();
  jet.position.set(0, 0.215, 0.04);
  jet.userData.spray = 1;
  jet.add(cyl(0.011, 0.012, 0.04, spray, { y: 0.02 }, 10));
  jet.add(blob(0.015, spray, { y: 0.047 }));
  [-1, 1].forEach((side) => {
    jet.add(cyl(0.008, 0.009, 0.04, spray, { x: side * 0.013, y: 0.053, rz: side * -0.7 }, 10));
    jet.add(blob(0.014, spray, { x: side * 0.028, y: 0.072 }));
  });
  whale.add(jet);

  return fit(g, 0.3);
}
