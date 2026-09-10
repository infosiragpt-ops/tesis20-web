// Campana dorada colgando de un pequeño pórtico de madera, inclinada como si acabara de sonar.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, fit } from "./_shared.js";

export const id = "campana";
export const label = "Campana";

export function build() {
  const g = new THREE.Group();
  const wood = mat("#d9b98f", { rough: 0.8 });
  const beam = mat("#a5723f", { rough: 0.75 });
  const blue = mat("#5b8fc9");
  const red = mat("#d9534f");
  const gold = mat("#f0b840", { rough: 0.42, metal: 0.1 });
  const copper = mat("#c4772c", { rough: 0.45, metal: 0.1 });
  const bronze = mat("#6e4a1e", { rough: 0.5 });

  // Peana de madera con dos tacos de apoyo para los postes
  g.add(box(0.32, 0.03, 0.15, wood, { y: 0.015 }));
  // Postes con capitel y bola roja arriba
  [-1, 1].forEach((side) => {
    g.add(cyl(0.02, 0.02, 0.014, beam, { x: side * 0.12, y: 0.037 }, 16));
    g.add(cyl(0.017, 0.019, 0.31, blue, { x: side * 0.12, y: 0.185 }, 16));
    g.add(cyl(0.024, 0.024, 0.012, beam, { x: side * 0.12, y: 0.346 }, 16));
    g.add(blob(0.028, red, { x: side * 0.12, y: 0.376 }));
  });
  // Travesaño
  g.add(cyl(0.015, 0.015, 0.26, beam, { y: 0.325, rz: Math.PI / 2 }, 16));

  // Campana colgada del travesaño, balanceándose hacia el frente
  const bell = new THREE.Group();
  bell.position.set(0, 0.325, 0);
  bell.rotation.set(-0.42, 0, 0.12);
  bell.add(mesh(new THREE.TorusGeometry(0.024, 0.006, 10, 24), bronze, { ry: Math.PI / 2 }));
  bell.add(cyl(0.006, 0.006, 0.036, bronze, { y: -0.04 }, 10));
  bell.add(blob(0.017, gold, { y: -0.06 }));
  // Perfil con grosor: interior (bajando) y exterior (subiendo)
  const profile = [
    [0, 0.126], [0.028, 0.122], [0.038, 0.095], [0.043, 0.06], [0.056, 0.03], [0.068, 0.006], [0.076, 0],
    [0.08, 0.008], [0.075, 0.02], [0.063, 0.042], [0.055, 0.068], [0.051, 0.092], [0.047, 0.112],
    [0.039, 0.13], [0.022, 0.142], [0, 0.146],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  bell.add(mesh(new THREE.LatheGeometry(profile, 40), gold, { y: -0.208 }));
  bell.add(mesh(new THREE.TorusGeometry(0.077, 0.009, 12, 40), copper, { y: -0.205, rx: Math.PI / 2 }));
  bell.add(mesh(new THREE.TorusGeometry(0.058, 0.005, 10, 40), copper, { y: -0.15, rx: Math.PI / 2 }));
  // Badajo
  bell.add(cyl(0.005, 0.005, 0.15, bronze, { y: -0.16 }, 10));
  bell.add(blob(0.021, bronze, { y: -0.238 }));
  g.add(bell);

  return fit(g, 0.3);
}
