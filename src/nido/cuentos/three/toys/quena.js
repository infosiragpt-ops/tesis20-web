// Quena andina de caña, inclinada sobre un atril de madera de dos patas, con agujeros e hilos de colores anudados.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, fit } from "./_shared.js";

export const id = "quena";
export const label = "Quena";

export function build() {
  const g = new THREE.Group();
  const cane = mat("#ecd5a4", { rough: 0.7 });
  const knot = mat("#cfb07a", { rough: 0.7 });
  const dark = mat("#3b2c22", { rough: 0.8 });
  const plank = mat("#d9b98f", { rough: 0.8 });
  const wood = mat("#a5723f", { rough: 0.75 });
  const walnut = mat("#6e4a2a", { rough: 0.7 });
  const red = mat("#e2463a", { rough: 0.55 });
  const yellow = mat("#f7c843", { rough: 0.5 });
  const green = mat("#4caf6d", { rough: 0.55 });
  const blue = mat("#3f7fe0", { rough: 0.5 });
  const pink = mat("#e0559b", { rough: 0.55 });

  const R = 0.017;
  const L = 0.36;
  const tilt = 0.85;
  const sin = Math.sin(tilt);
  const cos = Math.cos(tilt);
  const cy = 0.16;

  // Atril: tabla y dos patas torneadas rematadas en horquilla
  g.add(box(0.3, 0.02, 0.12, plank, { x: 0.01, y: 0.01 }));
  [-0.085, 0.075].forEach((px) => {
    const axisY = cy - (px / sin) * cos;
    const ballY = axisY - R / cos - 0.013;
    g.add(cyl(0.021, 0.024, 0.01, walnut, { x: px, y: 0.025 }, 20));
    g.add(cyl(0.011, 0.013, ballY - 0.03, wood, { x: px, y: (ballY + 0.03) / 2 }, 16));
    g.add(blob(0.0145, walnut, { x: px, y: ballY }));
    [-1, 1].forEach((s) => {
      const a = s * 0.3;
      const len = 0.042;
      g.add(cyl(0.005, 0.005, len, wood, { x: px, y: ballY + (Math.cos(a) * len) / 2, z: s * 0.012 + (Math.sin(a) * len) / 2, rx: a }, 10));
      g.add(blob(0.0065, walnut, { x: px, y: ballY + Math.cos(a) * len, z: s * 0.012 + Math.sin(a) * len }));
    });
  });

  // Tubo de caña inclinado (eje local y), abierto en los extremos con ánima oscura
  const flute = new THREE.Group();
  flute.position.set(0, cy, 0);
  flute.rotation.z = tilt;
  g.add(flute);
  flute.add(mesh(new THREE.CylinderGeometry(R, R, L, 32, 1, true), cane));
  flute.add(cyl(R - 0.004, R - 0.004, L - 0.008, dark, {}, 24));
  [-1, 1].forEach((e) => {
    flute.add(mesh(new THREE.TorusGeometry(R - 0.0025, 0.0028, 10, 32), cane, { y: (e * L) / 2, rx: Math.PI / 2 }));
  });
  // Muesca de la embocadura y agujeros, girados un poco hacia arriba para verse mejor
  const front = new THREE.Group();
  front.rotation.y = 0.3;
  flute.add(front);
  front.add(box(0.011, 0.015, 0.008, dark, { y: L / 2 - 0.006, z: R - 0.003 }));
  [-0.115, -0.083, -0.051, -0.008, 0.024, 0.056].forEach((t) => {
    front.add(cyl(0.0055, 0.0055, 0.005, dark, { y: t, z: R - 0.0022, rx: Math.PI / 2 }, 14));
  });
  // Nudo de la caña
  flute.add(mesh(new THREE.TorusGeometry(R + 0.0005, 0.002, 8, 32), knot, { y: 0.095, rx: Math.PI / 2 }));
  // Bandas de hilo anudadas
  [[0.125, red], [0.135, yellow], [0.145, green], [-0.15, blue], [-0.16, pink]].forEach(([t, m]) => {
    flute.add(mesh(new THREE.TorusGeometry(R + 0.001, 0.0035, 10, 32), m, { y: t, rx: Math.PI / 2 }));
  });
  front.add(blob(0.0055, yellow, { y: 0.135, z: R + 0.0025 }));
  front.add(blob(0.0055, blue, { y: -0.15, z: R + 0.0025 }));

  // Borlas colgando de las bandas superiores (verticales en el mundo)
  [[0.128, red], [0.142, yellow]].forEach(([t, m]) => {
    const wx = -t * sin - 0.0085 * cos;
    const wy = cy + t * cos - 0.0085 * sin;
    g.add(cyl(0.0025, 0.0025, 0.045, m, { x: wx, y: wy + 0.005 - 0.0225, z: 0.0145 }, 8));
    g.add(blob(0.0055, m, { x: wx, y: wy + 0.005 - 0.045, z: 0.0145 }));
  });

  return fit(g, 0.3);
}
