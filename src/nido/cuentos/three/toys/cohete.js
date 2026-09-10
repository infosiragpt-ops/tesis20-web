// Cohete de juguete retro: cuerpo blanco con punta roja, tres aletas, ventanita azul y llama encendida, listo para despegar.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit } from "./_shared.js";

export const id = "cohete";
export const label = "Cohete";

function lathe(profile, material, opts = {}, segments = 40) {
  const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
  return mesh(new THREE.LatheGeometry(points, segments), material, opts);
}

export function build() {
  const g = new THREE.Group();
  const white = mat("#f7f5ee", { rough: 0.5 });
  const red = mat("#d9463b");
  const blue = mat("#3574d4");
  const silver = mat("#c3c7cf", { rough: 0.35, metal: 0.3 });
  const dark = mat("#4a4a54", { rough: 0.55 });
  const glass = mat("#5db4f0", { rough: 0.2 });
  const flameOut = mat("#ff7f24", { rough: 0.3, emissive: "#ff4a0f", emissiveIntensity: 1.6, opacity: 0.7 });
  const glow = mat("#ffb347", { rough: 0.3, opacity: 0.28, emissive: "#ff9a2e", emissiveIntensity: 1.2 });
  const flameIn = mat("#ffe36b", { rough: 0.3, emissive: "#ffb300", emissiveIntensity: 1.8 });

  // Cuerpo blanco con panza y hombros redondeados (tapas con arista nítida)
  g.add(lathe([
    [0, 0.12], [0.04, 0.12], [0.04, 0.12], [0.058, 0.135], [0.068, 0.15], [0.072, 0.165],
    [0.072, 0.29], [0.065, 0.313], [0.056, 0.33], [0.056, 0.33], [0, 0.33],
  ], white));
  // Punta roja ojival y bolita plateada
  g.add(lathe([
    [0, 0.325], [0.058, 0.325], [0.058, 0.325], [0.056, 0.36], [0.048, 0.395],
    [0.034, 0.425], [0.017, 0.448], [0, 0.46],
  ], red));
  g.add(blob(0.011, silver, { y: 0.46 }));
  g.add(cyl(0.06, 0.06, 0.012, silver, { y: 0.33 }, 40));

  // Franjas
  g.add(cyl(0.0745, 0.0745, 0.024, red, { y: 0.195 }, 40));
  g.add(cyl(0.0745, 0.0745, 0.008, blue, { y: 0.172 }, 40));

  // Ventanita redonda azul mirando al frente
  g.add(mesh(new THREE.TorusGeometry(0.027, 0.007, 12, 32), silver, { y: 0.25, z: 0.07 }));
  g.add(cyl(0.024, 0.024, 0.012, glass, { y: 0.25, z: 0.071, rx: Math.PI / 2 }, 32));
  g.add(blob(0.005, mat("#ffffff", { rough: 0.2 }), { x: -0.008, y: 0.258, z: 0.078 }));

  // Collar y tobera
  g.add(cyl(0.05, 0.057, 0.035, dark, { y: 0.115 }, 32));
  g.add(cyl(0.03, 0.046, 0.032, silver, { y: 0.084 }, 32));

  // Tres aletas rojas (dos delante a ±60°, una detrás)
  const fin = new THREE.Shape();
  fin.moveTo(0.046, 0.215);
  fin.lineTo(0.046, 0.1);
  fin.quadraticCurveTo(0.052, 0.03, 0.082, 0.004);
  fin.lineTo(0.125, 0.004);
  fin.quadraticCurveTo(0.135, 0.004, 0.132, 0.016);
  fin.quadraticCurveTo(0.115, 0.13, 0.046, 0.215);
  fin.closePath();
  const finGeo = new THREE.ExtrudeGeometry(fin, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3 });
  finGeo.translate(0, 0, -0.006);
  [Math.PI / 3, -Math.PI / 3, Math.PI].forEach((phi) => {
    g.add(mesh(finGeo, red, { ry: phi - Math.PI / 2 }));
  });

  // Llama naranja con núcleo amarillo saliendo por la tobera
  g.add(blob(0.028, flameIn, { y: 0.07, s: [1, 0.5, 1] }));
  g.add(cone(0.03, 0.046, flameIn, { y: 0.049, rx: Math.PI }, 16));
  g.add(cone(0.045, 0.064, flameOut, { y: 0.04, rx: Math.PI }, 20));
  g.add(blob(0.038, glow, { y: 0.056, s: [1, 0.7, 1] }));

  return fit(g, 0.3);
}
