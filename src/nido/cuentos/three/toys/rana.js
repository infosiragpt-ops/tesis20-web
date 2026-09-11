// Ranita verde rechoncha y sonriente, de ojos saltones, sentada sobre una hoja de nenúfar con una florecita rosada al lado.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "rana";
export const label = "Rana";

export function build() {
  const g = new THREE.Group();
  const green = mat("#6cc04a", { surface: "skin" });
  const light = mat("#d8ec9f", { surface: "skin" });
  const padGreen = mat("#2e7d4f", { rough: 0.7 });
  const dark = mat("#2b4d2e", { rough: 0.5 });
  const black = mat("#1c1a22", { rough: 0.3 });
  const white = mat("#ffffff", { rough: 0.25 });
  const pink = mat("#f48fb1");
  const yellow = mat("#ffd54a");
  const stemGreen = mat("#4c9c47");
  const blush = mat("#f4a0a0");

  // Hoja de nenúfar con muesca al frente
  const R = 0.15;
  const notch = 0.24;
  const leaf = new THREE.Shape();
  leaf.moveTo(0, -0.08);
  leaf.lineTo(R * Math.cos(-Math.PI / 2 + notch), R * Math.sin(-Math.PI / 2 + notch));
  leaf.absarc(0, 0, R, -Math.PI / 2 + notch, (3 * Math.PI) / 2 - notch, false);
  leaf.closePath();
  const leafGeo = new THREE.ExtrudeGeometry(leaf, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 48 });
  g.add(mesh(leafGeo, padGreen, { y: 0.004, rx: -Math.PI / 2 }));

  const frog = new THREE.Group();
  frog.position.y = 0.02;
  frog.userData.body = 1;
  frog.userData.head = 1;
  g.add(frog);

  // Cuerpo rechoncho (cabeza y cuerpo en un solo bulto)
  const body = blob(0.1, green, { y: 0.105 });
  body.scale.set(1.15, 1.1, 0.95);
  frog.add(body);
  // Panza clara
  const belly = blob(0.058, light, { y: 0.045, z: 0.052 });
  belly.scale.set(1.1, 1, 0.7);
  frog.add(belly);

  // Ojos saltones: bola blanca, párpado verde, pupila y brillo
  [-1, 1].forEach((side) => {
    const x = side * 0.048;
    const ball = blob(0.03, white, { x, y: 0.215, z: 0.035 });
    ball.userData.eye = 1;
    frog.add(ball);
    frog.add(mesh(new THREE.SphereGeometry(0.0325, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), green, { x, y: 0.215, z: 0.035, rx: -0.75 }));
    const pupil = blob(0.012, black, { x, y: 0.214, z: 0.062 });
    pupil.userData.eye = 1;
    frog.add(pupil);
    const shine = blob(0.0045, white, { x: x + 0.0045, y: 0.219, z: 0.0705 });
    shine.userData.eye = 1;
    frog.add(shine);
  });

  // Sonrisa ancha, nariz y mejillas
  frog.add(mesh(new THREE.TorusGeometry(0.045, 0.0055, 10, 32, Math.PI - 0.6), dark, { y: 0.135, z: 0.09, rz: Math.PI + 0.3 }));
  [-1, 1].forEach((side) => {
    frog.add(blob(0.0045, dark, { x: side * 0.014, y: 0.175, z: 0.082 }));
    const cheek = blob(0.013, blush, { x: side * 0.062, y: 0.135, z: 0.079 });
    cheek.scale.set(1, 0.8, 0.5);
    frog.add(cheek);
  });

  // Bracitos delanteros con patita de tres dedos
  [-1, 1].forEach((side) => {
    const x = side * 0.055;
    frog.add(cyl(0.015, 0.015, 0.07, green, { x, y: 0.04, z: 0.078, rx: -0.4 }, 14));
    const foot = blob(0.022, green, { x, y: 0.008, z: 0.095 });
    foot.scale.set(1.1, 0.55, 1.4);
    frog.add(foot);
    [-1, 0, 1].forEach((t) => {
      const toe = blob(0.008, green, { x: x + t * 0.015, y: 0.006, z: 0.124 });
      toe.scale.set(1, 0.8, 1.2);
      frog.add(toe);
    });
  });

  // Ancas dobladas a los lados y patas traseras hacia delante
  [-1, 1].forEach((side) => {
    const haunch = blob(0.04, green, { x: side * 0.09, y: 0.045, z: -0.02 });
    haunch.scale.set(0.85, 1, 1.25);
    frog.add(haunch);
    const ry = -side * 0.4;
    const foot = blob(0.024, green, { x: side * 0.096, y: 0.008, z: 0.032, ry });
    foot.scale.set(0.9, 0.5, 1.4);
    frog.add(foot);
    const dx = Math.cos(ry), dz = -Math.sin(ry);
    const tipX = side * 0.096 + Math.sin(ry) * 0.034, tipZ = 0.032 + Math.cos(ry) * 0.034;
    [-1, 0, 1].forEach((t) => {
      const toe = blob(0.008, green, { x: tipX + t * 0.014 * dx, y: 0.006, z: tipZ + t * 0.014 * dz, ry });
      toe.scale.set(1, 0.8, 1.2);
      frog.add(toe);
    });
  });

  // Florecita rosada al lado, inclinada hacia el frente
  const flower = new THREE.Group();
  flower.position.set(0.128, 0.02, 0.03);
  g.add(flower);
  flower.add(cyl(0.004, 0.005, 0.05, stemGreen, { y: 0.025, rz: -0.12 }, 8));
  const head = new THREE.Group();
  head.position.set(0.004, 0.05, 0.004);
  head.rotation.set(0.75, 0, -0.35);
  flower.add(head);
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    const petal = blob(0.012, pink, { x: Math.sin(a) * 0.015, z: Math.cos(a) * 0.015, ry: a });
    petal.scale.set(1, 0.45, 1.3);
    head.add(petal);
  }
  const center = blob(0.008, yellow, { y: 0.004 });
  center.scale.set(1, 0.6, 1);
  head.add(center);

  // Es una figura ancha y baja: un poco más chica para no tapar al protagonista.
  return fit(g, 0.27);
}
