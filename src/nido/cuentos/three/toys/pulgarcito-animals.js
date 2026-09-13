import * as THREE from "three";
import { mat, mesh, blob, cyl, cone, fit } from "./_shared.js";

function farmAnimal(cow = false) {
  const g = new THREE.Group();
  const coat = mat(cow ? "#f7efe0" : "#a87246"), dark = mat(cow ? "#49423e" : "#4c3326"), hoof = mat("#433b35");
  g.add(blob(.085, coat, { y: .16, z: -.005, s: [.88, .88, 1.5] }));
  for (const x of [-.045, .045]) for (const z of [-.082, .07]) {
    const leg = new THREE.Group(); leg.position.set(x, .13, z); leg.userData.leg = Math.sign(x * z);
    leg.add(cyl(.018, .022, .11, coat, { y: -.055 }));
    leg.add(blob(.023, hoof, { y: -.111, z: .006, s: [1, .7, 1.15] }));
    g.add(leg);
  }
  g.add(blob(.041, coat, { y: .228, z: .085, s: [1, 1.55, .95], rx: -.25 }));
  const head = new THREE.Group(); head.position.set(0, .275, .105); head.userData.head = true;
  head.add(blob(.057, coat, { s: [1, 1.05, 1.2] }));
  head.add(blob(.046, cow ? mat("#dfa29c") : coat, { y: -.022, z: .05, s: [1.12, .66, .83] }));
  for (const side of [-1, 1]) {
    head.add(blob(.025, coat, { x: side * .055, y: .038, s: [1.2, cow ? .45 : 1.25, .48], rz: side * -.6 }));
    const eye = new THREE.Group(); eye.position.set(side * .032, .008, .048); eye.userData.eye = true;
    eye.add(blob(.01, dark, { s: [.85, 1.1, .8] }));
    eye.add(blob(.0033, mat("#fffef5"), { x: .002, y: .004, z: .008 }));
    head.add(eye);
    head.add(blob(.0045, dark, { x: side * .017, y: -.016, z: .084, s: [1, .6, .5] }));
    if (cow) head.add(cone(.013, .035, mat("#d5ba85"), { x: side * .037, y: .066, rz: side * -.35 }));
  }
  g.add(head);
  const tail = new THREE.Group(); tail.position.set(0, .177, -.122); tail.userData.tail = 1;
  tail.add(cyl(.009, .009, .07, coat, { y: -.016, rz: .3 }));
  tail.add(blob(.019, dark, { x: .011, y: -.062, s: [.7, 1.4, .7] })); g.add(tail);
  if (cow) {
    for (const side of [-1, 1]) for (const z of [-.04, .04]) g.add(blob(.034, dark, { x: side * .065, y: .177, z, s: [.15, .8, 1.2] }));
    g.add(mesh(new THREE.TorusGeometry(.043, .008, 8, 24), mat("#a64134"), { y: .235, z: .078, rx: Math.PI / 2 }));
    g.add(cone(.015, .026, mat("#d9ac53", { metal: .35, rough: .4 }), { y: .205, z: .119 }));
  } else {
    for (let i = 0; i < 6; i++) g.add(blob(.021, dark, { y: .31 - i * .019, z: .058 - i * .006, s: [.65, 1, 1.2] }));
    head.add(blob(.016, mat("#fff0d5"), { y: .014, z: .062, s: [.5, 1.5, .12] }));
  }
  return fit(g, .31);
}

function snail(empty = false) {
  const g = new THREE.Group(); const shell = mat("#b77943", { rough: .48 }), gold = mat("#e2b979", { rough: .6 });
  const body = mat("#bdac77", { rough: .58 });
  const y = empty ? .081 : .13;
  g.add(blob(.079, shell, { y, z: -.025, s: [.9, 1, 1.05] }));
  const points = [];
  for (let i = 0; i <= 90; i++) {
    const t = i / 90, a = t * Math.PI * 5, r = .007 + t * .064;
    points.push(new THREE.Vector3(Math.cos(a) * r, y + Math.sin(a) * r, .04 + (1 - t) * .012));
  }
  // Espiral volumétrica orientada al frente.
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, .0045, 7, false), gold));
  if (empty) {
    g.add(blob(.034, mat("#4c3628"), { y: .027, z: .045, s: [1, .8, .3] }));
    g.add(mesh(new THREE.TorusGeometry(.034, .005, 8, 24), gold, { y: .029, z: .047, s: [1, .8, 1] }));
  } else {
    g.add(blob(.09, body, { y: .033, z: .02, s: [.65, .36, 1.9] }));
    const head = new THREE.Group(); head.position.set(0, .078, .118); head.userData.head = true;
    head.add(blob(.03, body, { s: [.85, 1.6, .8] }));
    for (const side of [-1, 1]) {
      head.add(cyl(.004, .006, .064, body, { x: side * .02, y: .056, z: .002, rz: -side * .3 }));
      const eye = new THREE.Group(); eye.position.set(side * .03, .086, .002); eye.userData.eye = true;
      eye.add(blob(.008, mat("#2d2a26")));
      eye.add(blob(.0025, mat("#fff8df"), { y: .003, z: .006 }));
      head.add(eye);
    }
    g.add(head);
  }
  return fit(g, .3);
}

export const caballo = { id: "caballo", label: "Caballo", build: () => farmAnimal(false) };
export const vaca = { id: "vaca", label: "Vaca", build: () => farmAnimal(true) };
export const caracol = { id: "caracol", label: "Caracol", build: () => snail(false) };
export const concha = { id: "concha-caracol", label: "Concha de caracol", build: () => snail(true) };
