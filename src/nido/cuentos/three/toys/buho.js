// Búho de juguete sobre un tronquito: el sabio del bosque de nubes.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "buho";
export const label = "Búho";

export function build() {
  const g = new THREE.Group();
  const brown = mat("#7a563a");
  const light = mat("#d9b98f");
  const dark = mat("#4e3524");
  const orange = mat("#e0a24a");

  // Tronco (peana)
  const log = cyl(0.06, 0.065, 0.16, dark, { z: 0, y: 0.03, rx: Math.PI / 2 }, 14);
  g.add(log);
  g.add(cyl(0.062, 0.062, 0.01, mat("#b98756"), { y: 0.03, z: 0.08, rx: Math.PI / 2 }, 14));

  // Cuerpo en forma de huevo
  const body = blob(0.1, brown, { y: 0.17 });
  body.scale.set(1, 1.25, 0.92);
  g.add(body);
  // Pecho claro
  const chest = blob(0.072, light, { y: 0.15, z: 0.045 });
  chest.scale.set(1, 1.3, 0.55);
  g.add(chest);
  // Alas
  [-1, 1].forEach((side) => {
    const wing = blob(0.045, dark, { x: side * 0.095, y: 0.17, z: 0 });
    wing.scale.set(0.55, 1.6, 0.8);
    wing.rotation.z = side * -0.25;
    g.add(wing);
  });
  // Cabeza
  const head = blob(0.085, brown, { y: 0.31 });
  head.scale.set(1.1, 0.95, 0.95);
  g.add(head);
  // Discos faciales
  [-1, 1].forEach((side) => {
    const disc = blob(0.04, light, { x: side * 0.036, y: 0.32, z: 0.06 });
    disc.scale.set(1, 1, 0.5);
    g.add(disc);
  });
  eyes(g, { x: 0.036, y: 0.322, z: 0.082, r: 0.018 });
  // Pico
  g.add(cone(0.014, 0.03, orange, { y: 0.295, z: 0.095, rx: Math.PI / 2 }, 8));
  // Orejas / plumas
  [-1, 1].forEach((side) => {
    g.add(cone(0.02, 0.06, brown, { x: side * 0.06, y: 0.39, z: -0.01, rz: side * -0.35 }, 8));
  });
  // Patas
  [-1, 1].forEach((side) => {
    g.add(cyl(0.008, 0.008, 0.04, orange, { x: side * 0.03, y: 0.085, z: 0.02, rx: 0.4 }, 8));
  });

  return fit(g, 0.3);
}
