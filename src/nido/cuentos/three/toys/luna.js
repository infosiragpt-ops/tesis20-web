// Luna creciente gordita y dormida, de pie sobre una peana beige con estrellitas doradas.
import * as THREE from "three";
import { mat, mesh, blob, fit } from "./_shared.js";

export const id = "luna";
export const label = "Luna";

function crescentShape(R, r, d) {
  const x = (R * R - r * r + d * d) / (2 * d);
  const y = Math.sqrt(R * R - x * x);
  const a = Math.atan2(y, -x);
  const b = Math.atan2(y, d - x);
  const s = new THREE.Shape();
  s.absarc(0, 0, R, -a, a, false);
  s.absarc(-d, 0, r, b, -b, true);
  return s;
}

function strokeArc(rMid, halfW, a1, a2) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rMid + halfW, a1, a2, false);
  s.absarc(rMid * Math.cos(a2), rMid * Math.sin(a2), halfW, a2, a2 + Math.PI, false);
  s.absarc(0, 0, rMid - halfW, a2, a1, true);
  s.absarc(rMid * Math.cos(a1), rMid * Math.sin(a1), halfW, a1 + Math.PI, a1 + 2 * Math.PI, false);
  return new THREE.ExtrudeGeometry(s, { depth: 0.0015, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.0008, bevelSegments: 2, curveSegments: 12 });
}

function starShape(ro, ri) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? ro : ri;
    const ang = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) s.moveTo(Math.cos(ang) * ro, Math.sin(ang) * ro);
    else s.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
  }
  s.closePath();
  return s;
}

export function build() {
  const g = new THREE.Group();
  const cream = mat("#fff5dc", { rough: 0.6, emissive: "#fff0c2", emissiveIntensity: 0.14 });
  const beige = mat("#cdb083", { rough: 0.85 });
  const gold = mat("#e9b949", { rough: 0.45, metal: 0.2 });
  const dark = mat("#5a4034", { rough: 0.5 });
  const pink = mat("#f19cab", { rough: 0.7 });

  // Peana torneada con borde redondeado
  const baseH = 0.03;
  const profile = [
    new THREE.Vector2(0, 0), new THREE.Vector2(0.1, 0), new THREE.Vector2(0.1, 0.017),
    new THREE.Vector2(0.096, 0.026), new THREE.Vector2(0.087, baseH), new THREE.Vector2(0, baseH),
  ];
  g.add(mesh(new THREE.LatheGeometry(profile, 48), beige));

  // Luna creciente extruida con bisel gordo
  const R = 0.115, r = 0.092, d = 0.062, depth = 0.05, bevel = 0.017, tilt = 0.44;
  const moonGeo = new THREE.ExtrudeGeometry(crescentShape(R, r, d), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel - 0.002, bevelSegments: 6, curveSegments: 64,
  });
  moonGeo.translate(0, 0, -depth / 2);
  const cy = baseH + R + bevel - 0.01;
  g.add(mesh(moonGeo, cream, { y: cy, rz: -tilt }));

  // Carita dormida, recta, sobre el bulto de la luna
  const fc = (R - d + r) / 2, fa = 0.2 - tilt;
  const fx = fc * Math.cos(fa);
  const fy = cy + fc * Math.sin(fa);
  const fz = depth / 2 + bevel - 0.0005;
  const eyeGeo = strokeArc(0.013, 0.0022, Math.PI * 1.15, Math.PI * 1.85);
  [-1, 1].forEach((side) => {
    g.add(mesh(eyeGeo, dark, { x: fx + side * 0.02, y: fy + 0.02, z: fz }));
    const cheek = blob(0.011, pink, { x: fx + side * 0.029, y: fy - 0.008, z: fz + 0.001 });
    cheek.scale.set(1, 0.8, 0.45);
    g.add(cheek);
  });
  g.add(mesh(strokeArc(0.007, 0.0016, Math.PI * 1.1, Math.PI * 1.9), dark, { x: fx, y: fy - 0.016, z: fz }));

  // Estrellitas doradas pegadas en la peana
  const starGeo = new THREE.ExtrudeGeometry(starShape(0.015, 0.0065), {
    depth: 0.004, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0012, bevelSegments: 2,
  });
  [[0.056, 0.042, 0.3], [-0.05, 0.048, 1.1], [0.064, -0.034, 2.0], [-0.06, -0.034, 0.7], [0.004, 0.066, 1.6]].forEach(([x, z, spin]) => {
    g.add(mesh(starGeo, gold, { x, y: baseH - 0.0005, z, rx: -Math.PI / 2, rz: spin }));
  });

  return fit(g, 0.3);
}
