// Casita de juguete: paredes crema, techo rosado a dos aguas, puerta de madera con corazón y postigos celestes.
import * as THREE from "three";
import { mat, mesh, blob, box, cyl, fit } from "./_shared.js";

export const id = "casa";
export const label = "Casita";

export function build() {
  const g = new THREE.Group();
  const cream = mat("#f7efdf");
  const roof = mat("#e86b7a");
  const roofDark = mat("#cb4f63");
  const wood = mat("#a9703f", { rough: 0.7 });
  const white = mat("#ffffff", { rough: 0.5 });
  const glass = mat("#bfe6f6", { rough: 0.25 });
  const sky = mat("#7cc4e8");
  const brick = mat("#c5645b");
  const stone = mat("#cbbca6", { rough: 0.8 });
  const green = mat("#7cc46b");

  const W = 0.26, D = 0.18, H = 0.16, R = 0.11, T = 0.02;
  const L = Math.hypot(W / 2, R);
  const ang = Math.atan2(R, W / 2);
  // Punto sobre la vertiente `side`, a fracción f del alero (0) a la cumbrera (1), desplazado n por la normal
  const slope = (side, f, n) => ({ x: side * ((W / 2) * (1 - f) + n * (R / L)), y: H + R * f + n * ((W / 2) / L) });

  // Cuerpo: paredes y hastiales en una sola pieza
  const body = new THREE.Shape([
    new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, H),
    new THREE.Vector2(0, H + R), new THREE.Vector2(-W / 2, H),
  ]);
  g.add(mesh(new THREE.ExtrudeGeometry(body, { depth: D, bevelEnabled: false }), cream, { z: -D / 2 }));

  // Techo: dos faldones con hileras de tejas y cumbrera
  [-1, 1].forEach((side) => {
    const c = slope(side, 0.5 - 0.015 / L, T / 2 - 0.004);
    g.add(box(L + 0.05, T, D + 0.05, roof, { x: c.x, y: c.y, rz: -side * ang }));
    [0.14, 0.38, 0.62, 0.86].forEach((f) => {
      const p = slope(side, f, T - 0.004 + 0.001);
      g.add(cyl(0.0045, 0.0045, D + 0.042, roofDark, { x: p.x, y: p.y, rx: Math.PI / 2 }, 12));
    });
  });
  g.add(cyl(0.017, 0.017, D + 0.05, roofDark, { y: H + R + 0.015, rx: Math.PI / 2 }, 16));

  // Chimenea sobre el faldón derecho, hacia atrás
  const ch = slope(1, 0.5, T - 0.004);
  g.add(box(0.036, 0.09, 0.036, brick, { x: ch.x, y: ch.y + 0.025, z: -0.045 }));
  g.add(box(0.044, 0.012, 0.044, roofDark, { x: ch.x, y: ch.y + 0.075, z: -0.045 }));

  // Puerta de madera con arco, corazón y pomo
  const zf = D / 2;
  const door = new THREE.Shape();
  door.moveTo(-0.025, 0);
  door.lineTo(0.025, 0);
  door.lineTo(0.025, 0.07);
  door.absarc(0, 0.07, 0.025, 0, Math.PI, false);
  door.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(door, { depth: 0.012, bevelEnabled: false, curveSegments: 16 }), wood, { z: zf - 0.001 }));
  const hs = new THREE.Shape();
  hs.moveTo(5, 5);
  hs.bezierCurveTo(5, 5, 4, 0, 0, 0);
  hs.bezierCurveTo(-6, 0, -6, 7, -6, 7);
  hs.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  hs.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
  hs.bezierCurveTo(16, 7, 16, 0, 10, 0);
  hs.bezierCurveTo(7, 0, 5, 5, 5, 5);
  const heart = new THREE.ExtrudeGeometry(hs, { depth: 4, bevelEnabled: false });
  heart.center();
  g.add(mesh(heart, cream, { y: 0.06, z: zf + 0.012, rz: Math.PI, s: 0.0009 }));
  g.add(blob(0.004, mat("#f2c14e", { rough: 0.3 }), { x: 0.017, y: 0.04, z: zf + 0.013 }));
  g.add(box(0.07, 0.012, 0.03, stone, { y: 0.006, z: zf + 0.014 }));

  // Ventanas con postigos celestes: dos al frente y una en el lateral derecho
  const win = (x, y, z, ry = 0) => {
    const w = new THREE.Group();
    w.add(box(0.044, 0.044, 0.01, white, { z: 0.004 }));
    w.add(box(0.034, 0.034, 0.008, glass, { z: 0.007 }));
    w.add(box(0.004, 0.034, 0.003, white, { z: 0.0115 }));
    w.add(box(0.034, 0.004, 0.003, white, { z: 0.0115 }));
    [-1, 1].forEach((s) => w.add(box(0.015, 0.048, 0.01, sky, { x: s * 0.031, z: 0.004 })));
    w.position.set(x, y, z);
    w.rotation.y = ry;
    g.add(w);
  };
  win(-0.08, 0.1, zf);
  win(0.08, 0.1, zf);
  win(W / 2, 0.1, -0.01, Math.PI / 2);

  // Arbustos con flor en las esquinas del frente
  [-1, 1].forEach((side) => {
    const bush = blob(0.022, green, { x: side * 0.115, y: 0.02, z: 0.1 });
    bush.scale.set(1, 0.85, 1);
    g.add(bush);
    g.add(blob(0.0055, mat(side > 0 ? "#f28fb1" : "#f9d56e"), { x: side * 0.118, y: 0.041, z: 0.114 }));
  });

  return fit(g, 0.3);
}
