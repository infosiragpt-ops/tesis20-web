import * as THREE from "three";
import { mat, blob, cone, cyl, fit } from "./_shared.js";
export const id = "carpintero";
export const label = "Pájaro carpintero";
export function build() {
  const g = new THREE.Group();
  const dark = mat("#293342", { rough: 0.55 });
  const cream = mat("#fff1ce", { rough: 0.72 });
  const red = mat("#dc4749", { rough: 0.45 });
  const trunk = cyl(0.052, 0.06, 0.21, mat("#88603b"), { x: 0.075, y: 0.105, z: -0.035 }); g.add(trunk);
  const body = blob(0.069, dark, { y: 0.113 }); body.scale.set(.75, 1.2, .72); g.add(body);
  const chest = blob(0.049, cream, { y: 0.111, z: 0.031 }); chest.scale.set(.77, 1.3, .4); g.add(chest);
  g.add(blob(0.042, dark, { y: 0.205, z: 0.012 }));
  const crest = cone(0.025, 0.067, red, { y: 0.25, z: -0.002 }); crest.rotation.z = -0.32; g.add(crest);
  g.add(cone(0.013, 0.07, mat("#bc9c66"), { y: 0.202, z: 0.068, rx: Math.PI / 2 }));
  [-1, 1].forEach(side => {
    const wing = blob(0.048, dark, { x: side * .04, y: .11 }); wing.scale.set(.24, 1.3, .7); g.add(wing);
    g.add(blob(0.012, cream, { x: side * .031, y: .213, z: .03 }));
    g.add(blob(0.005, dark, { x: side * .034, y: .214, z: .04 }));
    const foot = blob(0.019, mat("#c19c69"), { x: side * .021, y: .022, z: .024 }); foot.scale.set(.8, .3, 1.4); g.add(foot);
  });
  return fit(g, .31);
}
