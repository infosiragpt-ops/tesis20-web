import * as THREE from "three";
import { mat, blob, fit } from "./_shared.js";
export const id = "mariposa";
export const label = "Mariposa";
export function build() {
  const g = new THREE.Group();
  const amber = mat("#f3b64c", { rough: 0.38 });
  const coral = mat("#da7755", { rough: 0.42 });
  const dark = mat("#5d3b40", { rough: 0.5 });
  const body = blob(0.025, dark, { y: 0.14 }); body.scale.set(0.65, 2.2, 0.7); g.add(body);
  [-1, 1].forEach(side => {
    const wing = new THREE.Group(); wing.position.set(side * 0.01, 0.15, 0);
    wing.userData.flutter = side;
    const top = blob(0.065, amber, { x: side * 0.053, y: 0.035 }); top.scale.set(1, 1.2, 0.12); wing.add(top);
    const lower = blob(0.044, coral, { x: side * 0.035, y: -0.052 }); lower.scale.z = 0.16; wing.add(lower);
    for (let i = 0; i < 3; i++) { const dot = blob(0.009, dark, { x: side * (0.045 + i * 0.017), y: 0.05 - i * 0.018, z: 0.009 }); dot.scale.z = 0.2; wing.add(dot); }
    g.add(wing);
    const antenna = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(side * 0.01, 0.19, 0), new THREE.Vector3(side * 0.025, 0.24, 0), new THREE.Vector3(side * 0.04, 0.23, 0)), 12, 0.002, 6, false), dark); g.add(antenna);
  });
  g.add(blob(0.022, dark, { y: 0.198, z: 0.005 }));
  [-1, 1].forEach(side => g.add(blob(0.005, mat("#ffffff"), { x: side * 0.01, y: 0.204, z: 0.023 })));
  return fit(g, 0.29);
}
