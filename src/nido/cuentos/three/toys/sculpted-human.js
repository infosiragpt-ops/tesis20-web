import * as THREE from 'three';
import { mat, part, ell, tube, eyePair, finish, details } from './sculpting.js';

function garment(parent, material, rings, pleats = 0, segments = 28) {
  const positions = [], uv = [], index = [];
  rings.forEach(([y, rx, rz], r) => {
    for (let i = 0; i <= segments; i++) {
      const a = i / segments * Math.PI * 2;
      const fold = 1 + Math.cos(a * 12) * pleats * (1 - r / Math.max(1, rings.length - 1));
      positions.push(Math.sin(a) * rx * fold, y, Math.cos(a) * rz * fold);
      uv.push(i / segments, r / (rings.length - 1));
      if (r < rings.length - 1 && i < segments) {
        const q = r * (segments + 1) + i;
        index.push(q, q + 1, q + segments + 1, q + 1, q + segments + 2, q + segments + 1);
      }
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function hand(arm, skin, nail, side) {
  ell(arm, skin, [side * .004, -.078, .011], [.009, .013, .007]);
  tube(arm, skin, [
    [side * .002, -.072, .016],
    [side * .011, -.076, .018],
    [side * .014, -.083, .016],
  ], [.0032, .0026, .0021], { segments: 7, sides: 6 });
  ell(arm, nail, [side * .014, -.084, .017], [.0016, .0022, .0012], [0, 0, 0], 8);
  for (let f = 0; f < 4; f++) {
    const x = side * .004 + (f - 1.5) * .0036;
    const reach = .094 + (f === 1 || f === 2 ? .004 : 0);
    tube(arm, skin, [
      [x, -.081, .013],
      [x + side * .001, -.088, .014],
      [x + side * .001, -reach, .012],
    ], [.0023, .002, .0016], { segments: 6, sides: 6 });
    ell(arm, nail, [x + side * .001, -reach - .001, .013], [.0013, .0016, .001], [0, 0, 0], 8);
  }
}

function boot(leg, leather, sole, adult) {
  const shaft = adult ? .078 : .072;
  tube(leg, leather, [[0, -shaft + .028, 0], [0, -shaft, .004]], [.016, .017], { segments: 8, sides: 10 });
  ell(leg, leather, [0, -shaft - .034, .02], [.019, .015, .034]);
  ell(leg, sole, [0, -shaft - .042, .021], [.02, .006, .036]);
  ell(leg, leather, [0, -shaft - .038, -.008], [.014, .01, .012]);
  for (let i = 0; i < 3; i++) ell(leg, mat('#d8c7a4', { rough: .7 }), [0, -shaft - .01 - i * .008, .018], [.002, .002, .0016], [0, 0, 0], 6);
}

// Keeps the existing decoration coordinate contract while replacing anatomy.
export function sculptedHuman({ coat, trousers = '#46536b', girl = false, chullo = false, sailor = false, skinTone = '#bc8257', hairColor = '#352522', decorate, adult = false, kind = '' }) {
  const root = new THREE.Group();
  const peasant = kind === 'peasant';
  const kitchen = kind === 'kitchen';
  const fairy = kind === 'fairy';
  const female = girl || fairy || kitchen;
  const skin = mat(skinTone, { rough: .74, surface: 'skin' });
  const hair = mat(hairColor, { rough: .86, surface: 'fur' });
  const fabric = mat(coat, { rough: .88, surface: 'cloth' });
  const pants = mat(peasant ? '#4a4034' : trousers, { rough: .86, surface: 'cloth' });
  const leather = mat(peasant ? '#3d3229' : '#493d34', { rough: .74 });
  const sole = mat('#2a221c', { rough: .8 });
  const trim = mat(kitchen ? '#efe3c8' : fairy ? '#f4ecff' : '#d9c69e', { rough: .82, surface: 'cloth' });
  const metal = mat('#b59961', { rough: .4, metal: .5 });
  const nail = mat('#e8c4b0', { rough: .45 });
  const lip = mat(female ? '#b5686a' : '#956257', { rough: .62 });
  const shoulderW = adult && !female ? .048 : adult ? .037 : .036;
  const hipW = adult && female ? 1.16 : adult ? .96 : 1;
  const legTop = adult ? .114 : .126;
  const shoulder = adult ? .226 : .213;
  const headBase = adult ? .256 : .24;

  if (kind !== 'mermaid') {
    for (const s of [-1, 1]) {
      const leg = part(root, 'leg', s, [s * (adult && !female ? .028 : .024), legTop, 0]);
      tube(leg, female ? fabric : pants, [
        [0, 0, 0],
        [0, -.038, .005],
        [0, -.072, 0],
        [0, -.104, 0],
      ], [female ? .02 * hipW : .022, .017, .014, .012], { segments: 16, sides: 12 });
      if (female && !kitchen) {
        ell(leg, leather, [0, -.118, .016], [.016, .012, .028]);
        ell(leg, sole, [0, -.124, .017], [.017, .005, .03]);
      } else boot(leg, leather, sole, adult);
    }
  }

  const chest = adult && !female ? .05 : .044;
  garment(root, fabric, [
    [.112, .032 * hipW, .023],
    [.138, .031 * hipW, .024],
    [.168, female ? .034 : .036, .025],
    [.196, chest, .028],
    [.218, adult && !female ? .05 : .038, .026],
    [.228, .018, .018],
  ], female ? .04 : .02);
  if (female && kind !== 'mermaid') {
    garment(root, fabric, [
      [.02, .078 * hipW, .05],
      [.055, .07 * hipW, .046],
      [.092, .052, .036],
      [.136, .034, .026],
    ], kitchen ? .08 : .07);
  }
  if (peasant) {
    garment(root, mat('#6b5340', { rough: .84, surface: 'cloth' }), [
      [.148, .036, .026],
      [.176, .042, .028],
      [.208, .05, .03],
      [.222, .04, .024],
    ], .015, 24);
    tube(root, leather, [[-.032, .146, .02], [0, .142, .026], [.032, .146, .02]], [.006, .007, .006], { segments: 12, sides: 8 });
    ell(root, metal, [0, .144, .028], [.006, .004, .003], [0, 0, 0], 8);
  }
  if (kitchen) {
    garment(root, trim, [
      [.04, .062, .04],
      [.08, .056, .038],
      [.13, .04, .03],
      [.188, .03, .024],
      [.206, .022, .02],
    ], .03, 24);
    tube(root, trim, [[-.03, .214, .01], [0, .248, -.004], [.03, .214, .01]], [.004, .0035, .004], { segments: 14, sides: 6 });
    ell(root, trim, [0, .09, .036], [.018, .014, .004]);
  }
  if (fairy) {
    garment(root, mat('#efe6ff', { rough: .55, clearcoat: .35, surface: 'cloth' }), [
      [.05, .06, .04],
      [.1, .04, .03],
      [.16, .028, .022],
    ], .05, 22);
  }
  if (!peasant && !kitchen) {
    tube(root, trim, [[-.03, .214, .019], [0, .199, .03], [.03, .214, .019]], [.004, .003, .004], { segments: 14, sides: 6 });
    for (let i = 0; i < 4; i++) ell(root, metal, [0, .188 - i * .015, .027], [.0025, .0027, .0019], [0, 0, 0], 8);
  } else if (peasant) {
    for (let i = 0; i < 3; i++) ell(root, metal, [0, .196 - i * .016, .03], [.0028, .003, .002], [0, 0, 0], 8);
  }

  const folds = [];
  for (let i = 0; i < 10; i++) {
    const a = -1.1 + i * 2.2 / 9;
    folds.push({ p: [Math.sin(a) * .03, .155 + (i % 3) * .012, .02 + Math.cos(a) * .008], s: [.01, .004, .003], r: [0, a, .2] });
  }
  details(root, fabric, folds);
  tube(root, skin, [[0, .222, 0], [0, .258, 0]], [adult ? .015 : .014, .012], { segments: 10, sides: 12 });

  for (const s of [-1, 1]) {
    const arm = part(root, 'arm', s, [s * shoulderW, shoulder, 0]);
    arm.rotation.z = s * (adult && !female ? .08 : .12);
    tube(arm, kitchen || fairy ? fabric : peasant ? mat('#e6d3b0', { rough: .88, surface: 'cloth' }) : fabric, [
      [0, 0, 0],
      [s * .01, -.036, -.004],
      [s * .006, -.068, .006],
    ], [.019, .014, .011], { segments: 16, sides: 12 });
    tube(arm, peasant ? mat('#e6d3b0', { surface: 'cloth' }) : trim, [[s * .005, -.062, .006], [s * .005, -.068, .006]], [.012, .012], { segments: 4 });
    hand(arm, skin, nail, s);
  }

  const head = part(root, 'head', 1, [0, headBase, .003]);
  const skull = adult ? (female ? [.03, .044, .03] : [.032, .045, .032]) : [.035, .045, .031];
  ell(head, skin, [0, .04, 0], skull);
  ell(head, skin, [0, .014, .016], female ? [.022, .017, .02] : [.024, .018, .021]);
  ell(head, skin, [0, .002, .01], [female ? .016 : .018, .012, .014]);
  for (const s of [-1, 1]) {
    ell(head, skin, [s * (adult ? .03 : .032), .034, -.002], [.008, .013, .007]);
    ell(head, mat(female ? '#e39a90' : skinTone, { rough: .8, surface: 'skin' }), [s * .018, .026, .026], [.007, .005, .004], [0, 0, 0], 10);
  }
  ell(head, skin, [0, .031, .031], [.006, .011, .009]);
  ell(head, skin, [0, .024, .036], [.004, .004, .004], [0, 0, 0], 10);
  tube(head, lip, [[-.008, .017, .03], [0, female ? .015 : .014, .034], [.008, .017, .03]], [.0011, .0018, .0011], { segments: 10, sides: 6 });
  if (!female && adult) {
    details(head, mat('#4a332c', { rough: .9 }), [
      { p: [-.01, .012, .028], s: [.008, .003, .003] },
      { p: [.01, .012, .028], s: [.008, .003, .003] },
      { p: [0, .01, .03], s: [.01, .002, .003] },
    ]);
  }
  for (const s of [-1, 1]) {
    tube(head, hair, [[s * .01, .056, .03], [s * .02, .06, .03], [s * .027, .054, .024]], [.0016, .002, .0012], { segments: 8, sides: 6 });
    if (female) {
      for (let i = 0; i < 3; i++) {
        tube(head, hair, [
          [s * (.012 + i * .003), .048, .032],
          [s * (.016 + i * .003), .05, .034],
        ], [.0007, .0005], { segments: 4, sides: 5 });
      }
    }
  }
  eyePair(head, { spread: adult ? .014 : .015, y: .044, z: .027, radius: adult ? .0064 : .0076, iris: peasant || kitchen ? '#5c3d28' : '#795436' });

  ell(head, hair, [0, .058, -.012], [adult ? .033 : .036, .03, .028]);
  const locks = [];
  if (female) {
    for (let i = 0; i < 20; i++) {
      const a = -1.6 + i * 3.2 / 19;
      locks.push({ p: [Math.sin(a) * .032, .062 + Math.cos(a) * .01, .01 + Math.cos(a) * .014], s: [.009, kitchen ? .014 : .02, .008], r: [.2, 0, -a * .3] });
    }
    if (kitchen) {
      ell(head, hair, [0, .078, -.018], [.02, .018, .016]);
      for (const s of [-1, 1]) tube(head, hair, [[s * .028, .06, -.01], [s * .034, .03, -.012], [s * .03, .004, -.014]], [.012, .011, .008], { segments: 12, sides: 8 });
    } else {
      for (const s of [-1, 1]) {
        tube(head, hair, [
          [s * .028, .068, -.01],
          [s * .04, .03, -.012],
          [s * .042, -.01, -.016],
          [s * .032, fairy ? -.06 : -.048, -.012],
        ], [.014, .014, .011, .004], { segments: 22, sides: 10 });
      }
    }
  } else {
    for (let i = 0; i < 14; i++) {
      const a = -1.4 + i * 2.8 / 13;
      locks.push({ p: [Math.sin(a) * .03, .062 + Math.cos(a) * .008, .008 + Math.cos(a) * .012], s: [.007, .012, .006], r: [.15, 0, -a * .25] });
    }
    for (const s of [-1, 1]) {
      tube(head, hair, [[s * .028, .04, .004], [s * .03, .02, .002]], [.006, .004], { segments: 6, sides: 8 });
    }
  }
  details(head, hair, locks);

  if (chullo || sailor) {
    const cap = mat(chullo ? '#a84640' : '#314c66', { surface: 'cloth' });
    ell(head, cap, [0, .078, -.004], [.038, .018, .031]);
    tube(head, trim, [[-.034, .071, 0], [0, .069, .031], [.034, .071, 0]], [.0035, .0035, .0035], { segments: 20 });
    if (chullo) {
      ell(head, trim, [0, .102, -.006], [.008, .009, .008]);
      for (const s of [-1, 1]) ell(head, cap, [s * .034, .055, -.003], [.008, .021, .011]);
    } else ell(head, cap, [0, .071, .026], [.031, .003, .024]);
  }
  if (decorate) {
    const before = new Set(head.children);
    decorate(root, head);
    // Historic ornaments were authored for a larger head: scale together.
    for (const obj of head.children) if (!before.has(obj)) {
      obj.position.multiplyScalar(.72);
      obj.scale.multiplyScalar(.72);
    }
  }
  return finish(root, 'human', { adult, kind: kind || 'person', girl: female });
}
