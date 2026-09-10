// Lobo gris sentado, con hocico largo, panza clara, orejas grandes y cola esponjosa.
import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, eyes, fit } from "./_shared.js";

export const id = "lobo";
export const label = "Lobo";

export function build() {
  const g = new THREE.Group();
  const fur = mat("#7d8494");
  const furDark = mat("#5d6373");
  const cream = mat("#e6e6ea");
  const black = mat("#1c1a22", { rough: 0.35 });

  // Cuerpo sentado
  const body = blob(0.09, fur, { y: 0.12 });
  body.scale.set(1, 1.35, 0.9);
  g.add(body);
  const belly = blob(0.062, cream, { y: 0.105, z: 0.045 });
  belly.scale.set(0.9, 1.25, 0.6);
  g.add(belly);
  // Ancas, patas traseras y delanteras
  [-1, 1].forEach((side) => {
    const haunch = blob(0.048, fur, { x: side * 0.07, y: 0.05, z: 0.01 });
    haunch.scale.set(0.9, 1, 1.25);
    g.add(haunch);
    const hindPaw = blob(0.022, furDark, { x: side * 0.08, y: 0.018, z: 0.06 });
    hindPaw.scale.set(1, 0.8, 1.3);
    g.add(hindPaw);
    g.add(cyl(0.018, 0.018, 0.13, fur, { x: side * 0.038, y: 0.08, z: 0.065, rx: -0.15 }, 16));
    const paw = blob(0.022, furDark, { x: side * 0.038, y: 0.02, z: 0.08 });
    paw.scale.set(1, 0.8, 1.3);
    g.add(paw);
  });
  // Cabeza y hocico largo
  const head = blob(0.07, fur, { y: 0.275 });
  head.scale.set(1.05, 0.95, 0.95);
  g.add(head);
  const muzzle = blob(0.036, cream, { y: 0.25, z: 0.07 });
  muzzle.scale.set(1.05, 0.8, 1.5);
  g.add(muzzle);
  g.add(blob(0.015, black, { y: 0.262, z: 0.12 }));
  eyes(g, { x: 0.03, y: 0.292, z: 0.058, r: 0.013 });
  // Cejas de pillo
  [-1, 1].forEach((side) => {
    const brow = cyl(0.004, 0.004, 0.03, furDark, { x: side * 0.03, y: 0.312, z: 0.062, rz: side * 0.5 }, 8);
    g.add(brow);
  });
  // Orejas grandes con interior rosado
  [-1, 1].forEach((side) => {
    const ear = cone(0.03, 0.09, fur, { x: side * 0.048, y: 0.36, z: -0.01, rz: side * -0.3 }, 14);
    ear.scale.set(1, 1, 0.5);
    g.add(ear);
    const inner = cone(0.018, 0.06, mat("#c9a0b0"), { x: side * 0.048, y: 0.352, z: 0.004, rz: side * -0.3 }, 14);
    inner.scale.set(1, 1, 0.4);
    g.add(inner);
  });
  // Cola esponjosa enroscada a un lado
  g.add(blob(0.036, furDark, { y: 0.036, z: -0.075 }));
  g.add(mesh(new THREE.TorusGeometry(0.075, 0.032, 14, 28, Math.PI), furDark, { x: -0.05, y: 0.034, z: -0.015, rx: Math.PI / 2, rz: (2 * Math.PI) / 3 }));
  g.add(blob(0.036, cream, { x: -0.09, y: 0.036, z: 0.055 }));

  return fit(g, 0.3);
}
