// Tambor de madera de juguete con cordones en zigzag y dos baquetas cruzadas encima.
import * as THREE from "three";
import { mat, mesh, blob, cyl, fit } from "./_shared.js";

export const id = "tambor";
export const label = "Tambor";

const UP = new THREE.Vector3(0, 1, 0);

function rod(a, b, radius, material) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const m = cyl(radius, radius, len, material, { x: mid.x, y: mid.y, z: mid.z }, 8);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

export function build() {
  const g = new THREE.Group();
  const wood = mat("#c9955c", { rough: 0.7 });
  const cream = mat("#f4e8cf", { rough: 0.8 });
  const blue = mat("#3f6fb5", { rough: 0.55 });
  const red = mat("#d9463c", { rough: 0.6 });
  const gold = mat("#f0c050", { rough: 0.4 });
  const stickWood = mat("#dcae72", { rough: 0.65 });
  const stickTip = mat("#f7ecd6", { rough: 0.6 });

  const R = 0.09;
  const H = 0.16;
  const hoopR = R + 0.004;
  const tube = 0.011;

  // Cuerpo del tambor
  g.add(cyl(R, R, H, wood, { y: H / 2 }, 32));
  // Parche superior
  g.add(cyl(R + 0.003, R + 0.003, 0.014, cream, { y: H + 0.002 }, 32));
  // Aros superior e inferior
  [tube, H].forEach((y) => {
    g.add(mesh(new THREE.TorusGeometry(hoopR, tube, 12, 40), blue, { y, rx: Math.PI / 2 }));
  });

  // Cordones en zigzag y remaches
  const N = 10;
  const cordR = 0.005;
  const ringR = R + cordR + 0.002;
  const pt = (angle, y) => new THREE.Vector3(Math.cos(angle) * ringR, y, Math.sin(angle) * ringR);
  for (let i = 0; i < N; i += 1) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = a0 + Math.PI / N;
    const a2 = a0 + (2 * Math.PI) / N;
    g.add(rod(pt(a0, H), pt(a1, tube), cordR, red));
    g.add(rod(pt(a1, tube), pt(a2, H), cordR, red));
    const kr = ringR + 0.0035;
    g.add(blob(0.01, gold, { x: Math.cos(a0) * kr, y: H, z: Math.sin(a0) * kr }));
    g.add(blob(0.01, gold, { x: Math.cos(a1) * kr, y: tube, z: Math.sin(a1) * kr }));
  }

  // Baquetas cruzadas apoyadas sobre el aro (puntas hacia el frente)
  const rimTop = H + tube;
  const stickR = 0.0065;
  const stickLen = 0.22;
  const tipR = 0.012;
  const stick = (ry, y, tilt, tipSide) => {
    const s = new THREE.Group();
    s.add(cyl(stickR, stickR * 0.85, stickLen, stickWood, { rz: Math.PI / 2 }, 12));
    s.add(blob(tipR, stickTip, { x: tipSide * (stickLen / 2 + tipR * 0.6) }));
    s.position.set(0, y, 0);
    s.rotation.set(0, ry, tilt);
    return s;
  };
  g.add(stick(-0.44, rimTop + stickR, 0, 1));
  g.add(stick(0.96, rimTop + stickR * 3, Math.asin((stickR * 2) / (stickLen / 2)), -1));

  return fit(g, 0.3);
}
