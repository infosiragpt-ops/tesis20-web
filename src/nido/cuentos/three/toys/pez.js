// Pez linterna de juguete: pececito rechoncho con antena luminosa sobre olitas.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit } from "./_shared.js";

export const id = "pez";
export const label = "Pez linterna";

export function build() {
  const g = new THREE.Group();
  const skin = mat("#7ccdf5");
  const belly = mat("#e8f7ff");
  const fin = mat("#2f86d2");
  const deep = mat("#1d4b8c");
  const wave = mat("#2a62b0");
  const foam = mat("#d7efff");
  const glow = mat("#c8f6ff", { emissive: "#7fe6ff", emissiveIntensity: 1.4, rough: 0.3 });

  // Peana de olitas
  g.add(cyl(0.105, 0.11, 0.03, deep, { y: 0.015 }));
  const swell = blob(0.05, wave, { y: 0.045 });
  swell.scale.set(1.3, 0.6, 1.3);
  g.add(swell);
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const r = i % 2 ? 0.022 : 0.028;
    const crest = blob(r, wave, { x: Math.cos(a) * 0.08, y: 0.03 + r * 0.45, z: Math.sin(a) * 0.08, ry: -a });
    crest.scale.set(1.35, 0.9, 0.85);
    g.add(crest);
    if (i % 2 === 0) g.add(blob(0.007, foam, { x: Math.cos(a) * 0.084, y: 0.03 + r * 1.3, z: Math.sin(a) * 0.084 }));
  }

  // El pez entero es un grupo articulado: asiente, mira y nada como un solo cuerpo.
  const fish = new THREE.Group();
  fish.userData.head = 1;
  fish.userData.body = 1;
  g.add(fish);

  // Cuerpo rechoncho y barriga clara
  const body = blob(0.1, skin, { y: 0.16 });
  body.scale.set(0.82, 0.92, 1.22);
  fish.add(body);
  const tummy = blob(0.08, belly, { y: 0.135, z: 0.02 });
  tummy.scale.set(0.74, 0.68, 1.12);
  fish.add(tummy);

  // Cola en V, girada hacia un lado como si nadara
  const tail = new THREE.Group();
  tail.position.set(0, 0.16, -0.09);
  tail.rotation.y = -0.55;
  tail.userData.tail = "y";
  [-1, 1].forEach((side) => {
    tail.add(cone(0.05, 0.12, fin, { y: side * 0.028, z: -0.075, rx: Math.PI / 2 + side * 0.55, s: [0.22, 1, 1] }, 12));
  });
  fish.add(tail);
  // Aleta dorsal
  fish.add(cone(0.04, 0.085, fin, { y: 0.265, z: -0.025, rx: -0.55, s: [0.28, 1, 1] }, 12));
  // Aletas pectorales
  [-1, 1].forEach((side) => {
    const pec = blob(0.038, fin, { x: side * 0.085, y: 0.14, z: 0.015, ry: side * -0.75, rz: side * 0.25 });
    pec.scale.set(0.28, 0.6, 1);
    pec.userData.flutter = side * 0.35;
    fish.add(pec);
  });

  // Ojos grandes
  const white = mat("#ffffff", { rough: 0.25 });
  const black = mat("#1c1a22", { rough: 0.3 });
  [-1, 1].forEach((side) => {
    [blob(0.025, white, { x: side * 0.058, y: 0.19, z: 0.078 }), blob(0.013, black, { x: side * 0.064, y: 0.192, z: 0.097 }), blob(0.005, white, { x: side * 0.06, y: 0.2, z: 0.108 })].forEach((part) => {
      part.userData.eye = 1;
      fish.add(part);
    });
  });
  // Boca sonriente
  fish.add(mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 16, Math.PI), deep, { y: 0.145, z: 0.113, rx: -0.3, rz: Math.PI }));

  // Antena curva con esfera luminosa
  const path = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0.245, 0.03),
    new THREE.Vector3(0, 0.37, 0.04),
    new THREE.Vector3(0, 0.35, 0.13),
  );
  fish.add(mesh(new THREE.TubeGeometry(path, 16, 0.006, 8, false), deep));
  fish.add(blob(0.012, deep, { y: 0.248, z: 0.03 }));
  fish.add(blob(0.022, glow, { y: 0.35, z: 0.135 }));
  const halo = blob(0.032, mat("#9fecff", { opacity: 0.25, emissive: "#7fe6ff", emissiveIntensity: 0.5 }), { y: 0.35, z: 0.135 });
  halo.castShadow = false;
  fish.add(halo);

  return fit(g, 0.3);
}
