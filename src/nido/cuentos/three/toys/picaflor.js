// Picaflor esmeralda y turquesa suspendido sobre una flor rosada: el mensajero veloz del jardín.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, eyes, fit, base } from "./_shared.js";

export const id = "picaflor";
export const label = "Picaflor";

function leafShape(L, w, dir = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, -w * 0.35);
  s.quadraticCurveTo(dir * L * 0.5, -w * 0.6, dir * L, 0);
  s.quadraticCurveTo(dir * L * 0.5, w * 0.6, 0, w * 0.35);
  s.quadraticCurveTo(-dir * w * 0.25, 0, 0, -w * 0.35);
  return s;
}

function petalShape(L, w) {
  const s = new THREE.Shape();
  s.moveTo(0, -w * 0.25);
  s.bezierCurveTo(L * 0.5, -w * 0.75, L * 1.05, -w * 0.35, L * 1.05, 0);
  s.bezierCurveTo(L * 1.05, w * 0.35, L * 0.5, w * 0.75, 0, w * 0.25);
  s.quadraticCurveTo(-w * 0.15, 0, 0, -w * 0.25);
  return s;
}

function orient(obj, span, normal) {
  const x = span.clone().normalize();
  const y = new THREE.Vector3().crossVectors(normal, x).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

function plate(shape, d, material, opts = {}) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: d * 0.35, bevelSize: d * 0.35, bevelSegments: 2, curveSegments: 12 });
  geo.translate(0, 0, -d / 2);
  return mesh(geo, material, opts);
}

export function build() {
  const g = new THREE.Group();
  const emerald = mat("#1fa36d");
  const emeraldDark = mat("#147a52");
  const turquoise = mat("#2fc6c4");
  const cream = mat("#f9eaa6");
  const black = mat("#1c1a22", { rough: 0.35 });
  const pink = mat("#f48cb6");
  const yellow = mat("#ffd24a");
  const green = mat("#4aa64a");
  const greenDark = mat("#3c8f3c");
  const grey = mat("#4a4548");

  // Peana y tallo
  g.add(base(0.09));
  g.add(cyl(0.01, 0.013, 0.16, green, { y: 0.11, rz: 0.06 }));
  // Hojas
  const leafA = new THREE.Group();
  leafA.position.set(0.006, 0.08, 0);
  leafA.rotation.set(0, 0.5, 0.55);
  leafA.add(plate(leafShape(0.055, 0.03), 0.006, greenDark, { rx: -Math.PI / 2 }));
  g.add(leafA);
  const leafB = new THREE.Group();
  leafB.position.set(-0.004, 0.125, 0);
  leafB.rotation.set(0, Math.PI + 0.9, -0.5);
  leafB.add(plate(leafShape(0.05, 0.028), 0.006, greenDark, { rx: -Math.PI / 2 }));
  g.add(leafB);

  // Flor: cáliz, pétalos en copa y centro
  g.add(cyl(0.03, 0.012, 0.03, greenDark, { y: 0.19 }));
  for (let i = 0; i < 7; i += 1) {
    const petal = new THREE.Group();
    petal.position.set(0, 0.204, 0);
    petal.rotation.set(0, (i * Math.PI * 2) / 7 + 0.2, 0.32);
    petal.add(plate(petalShape(0.066, 0.042), 0.007, pink, { rx: -Math.PI / 2 }));
    g.add(petal);
  }
  g.add(blob(0.024, yellow, { y: 0.209 }));

  // Colibrí (construido mirando a +z y luego inclinado como en vuelo)
  const bird = new THREE.Group();
  bird.position.set(0, 0.292, -0.012);
  bird.rotation.x = -0.45;
  const body = blob(0.05, emerald, { y: 0 });
  body.scale.set(0.82, 0.82, 1.4);
  bird.add(body);
  const chest = blob(0.04, cream, { y: -0.012, z: 0.032 });
  chest.scale.set(0.85, 0.85, 0.75);
  bird.add(chest);
  const head = blob(0.036, turquoise, { y: 0.02, z: 0.066 });
  bird.add(head);
  bird.add(cone(0.005, 0.085, black, { y: 0.008, z: 0.14, rx: Math.PI / 2 + 0.2 }, 10));
  eyes(bird, { x: 0.021, y: 0.03, z: 0.092, r: 0.009 });
  // Alas abiertas hacia atrás
  [-1, 1].forEach((side) => {
    const wing = new THREE.Group();
    wing.position.set(side * 0.028, 0.02, -0.01);
    orient(wing, new THREE.Vector3(side * 0.95, 0.78, -0.32), new THREE.Vector3(side * 0.3, 0.25, 0.9));
    wing.add(plate(leafShape(0.12, 0.056), 0.007, turquoise));
    bird.add(wing);
  });
  // Cola en abanico
  [-1, 0, 1].forEach((side) => {
    const feather = blob(0.034, emeraldDark, { x: side * 0.02, y: -0.012, z: -0.092, ry: side * 0.55, rx: 0.3 });
    feather.scale.set(0.42, 0.18, 1);
    bird.add(feather);
  });
  g.add(bird);
  // Patitas sobre la flor
  [-1, 1].forEach((side) => {
    g.add(cyl(0.0045, 0.0045, 0.05, grey, { x: side * 0.013, y: 0.245, z: 0.014, rx: 0.15 }, 8));
  });

  return fit(g, 0.3);
}
