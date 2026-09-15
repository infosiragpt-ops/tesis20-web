import * as THREE from 'three';
import { mat, blob, box, cyl, cone, fit, mesh } from './_shared.js';

function make(kind) {
  const g = new THREE.Group(), wood = mat('#a77a51', { rough: .74 }), gold = mat('#d5ad58', { metal: .42, rough: .3 });
  const stone = mat('#e3d5bc', { rough: .82 }), roof = mat('#788aac', { rough: .68 });
  if (kind === 'castillo' || kind === 'torre') {
    const towers = kind === 'torre' ? [0] : [-.095, .095];
    if (kind === 'castillo') {
      g.add(box(.19, .14, .08, stone, { y: .07 }));
      g.add(box(.05, .09, .009, wood, { y: .045, z: .046 }));
      g.add(blob(.025, wood, { y: .09, z: .046, s: [1, 1, .16] }));
    }
    for (const x of towers) {
      g.add(cyl(.036, .041, .2, stone, { x, y: .1 }));
      g.add(cone(.05, .08, roof, { x, y: .24 }));
      for (let y = .065; y < .2; y += .052) g.add(box(.017, .028, .006, mat('#546573'), { x, y, z: .036 }));
      g.add(cyl(.003, .003, .052, gold, { x, y: .292 }));
      g.add(box(.031, .019, .003, mat('#c77a7a'), { x: x + .013, y: .304 }));
    }
  } else if (kind === 'cama-guisante') {
    // Pea deliberately visible below the stack, not hidden inside a mattress.
    g.add(box(.21, .02, .14, wood, { y: .025 }));
    [-1, 1].forEach(side => {
      g.add(box(.014, .23, .15, wood, { x: side * .107, y: .115 }));
      g.add(blob(.018, gold, { x: side * .107, y: .239 }));
    });
    const colors = ['#adc8b4','#e3b7a7','#a9b9d0','#e8d8ab','#c6afcf','#accacb'];
    colors.forEach((c, i) => {
      g.add(box(.19, .022, .138, mat(c, { surface: 'cloth' }), { y: .065 + i * .025 }));
      for (let j = 0; j < 7; j++) g.add(blob(.002, mat('#f4e8cc'), { x: -.075 + j * .025, y: .065 + i * .025, z: .071 }));
    });
    g.add(blob(.032, mat('#f6eed9', { surface: 'cloth' }), { x: -.059, y: .207, s: [1, .25, 1.4] }));
    g.add(blob(.014, mat('#88a746', { clearcoat: .6 }), { y: .04, z: .073 }));
  } else if (kind === 'lampara-magica') {
    g.add(cyl(.032, .05, .025, gold, { y: .014 }));
    g.add(blob(.069, gold, { y: .063, s: [1.45, .55, .75] }));
    g.add(cone(.024, .095, gold, { x: .088, y: .093, rz: -.95 }));
    g.add(mesh(new THREE.TorusGeometry(.044, .009, 10, 24), gold, { x: -.087, y: .073 }));
    g.add(cone(.052, .022, gold, { y: .105 })); g.add(blob(.009, gold, { y: .126 }));
  } else if (kind === 'tesoro') {
    g.add(box(.19, .075, .12, wood, { y: .04 }));
    g.add(box(.19, .014, .12, wood, { y: .115, z: -.042, rx: -1.2 }));
    [-1, 1].forEach(side => g.add(box(.015, .079, .124, gold, { x: side * .062, y: .04 })));
    for (let i = 0; i < 15; i++) g.add(cyl(.013, .013, .006, gold, { x: Math.sin(i * 2.4) * .065, y: .075 + i % 3 * .008, z: Math.cos(i * 2.4) * .035 }));
    g.add(blob(.017, mat('#79adbc', { clearcoat: 1 }), { y: .095 }));
  } else if (kind === 'habichuela') {
    g.add(cyl(.005, .012, .28, mat('#639468'), { y: .14 }));
    for (let i = 0; i < 10; i++) {
      const angle = i * 2.1;
      g.add(blob(.033, mat(i % 2 ? '#8bb184' : '#adc68e'), { x: Math.cos(angle) * .027, y: .028 + i * .026, z: Math.sin(angle) * .027, s: [1.35, .25, .65], rz: Math.cos(angle) * .4 }));
    }
  } else if (kind === 'zapatos') {
    [-1, 1].forEach(side => {
      g.add(blob(.055, mat('#965d46', { clearcoat: .7 }), { x: side * .05, y: .029, s: [.65, .55, 1.5] }));
      g.add(cyl(.026, .031, .043, mat('#965d46'), { x: side * .05, y: .054, z: -.032 }));
      g.add(box(.023, .012, .005, gold, { x: side * .05, y: .05, z: .032 }));
    });
  } else if (kind === 'rosa-encantada') {
    g.add(cyl(.055, .066, .02, wood, { y: .01 }));
    g.add(cyl(.004, .004, .16, mat('#598362'), { y: .1 }));
    for (let i = 0; i < 7; i++) g.add(blob(.019, mat(i % 2 ? '#c76e78' : '#aa475f'), { x: Math.sin(i) * .018, y: .18, z: Math.cos(i) * .018, s: [1, .7, .65] }));
    g.add(blob(.09, mat('#c2e4e0', { opacity: .15, clearcoat: 1 }), { y: .12, s: [.75, 1.25, .75] }));
  } else if (kind === 'perla') {
    g.add(cyl(.06, .08, .035, wood, { y: .017 }));
    g.add(blob(.065, mat('#f1eac9', { clearcoat: 1, emissive: '#c6decf', emissiveIntensity: .2 }), { y: .093 }));
  } else if (kind === 'laberinto') {
    g.add(box(.28, .012, .2, stone, { y: .006 }));
    for (let i = 0; i < 5; i++) g.add(box(.012, .067, .16 - i * .023, stone, { x: -.12 + i * .055, y: .04, z: i % 2 * .02 }));
    g.add(box(.26, .067, .012, stone, { y: .04, z: -.091 }));
  } else if (kind === 'taller') {
    [-1, 1].forEach(side => g.add(box(.022, .115, .07, wood, { x: side * .086, y: .058 })));
    g.add(box(.23, .023, .14, wood, { y: .12 }));
    g.add(box(.06, .012, .043, mat('#d7c9a2'), { x: -.025, y: .139 }));
    g.add(cyl(.008, .008, .087, wood, { x: .061, y: .17, rz: -.4 }));
    g.add(box(.045, .021, .024, mat('#69777a', { metal: .4 }), { x: .08, y: .21 }));
  }
  return fit(g, .29);
}

export const CLASSIC_PROPS = Object.entries({ castillo: 'Castillo', torre: 'Torre de Rapunzel', 'cama-guisante': 'La cama y el guisante', 'lampara-magica': 'Lámpara mágica', tesoro: 'Cofre del tesoro', habichuela: 'Habichuela gigante', zapatos: 'Zapatos', 'rosa-encantada': 'Rosa', perla: 'Perla del dragón', laberinto: 'Laberinto', taller: 'Taller' }).map(([id, label]) => ({ id, label, build: () => make(id) }));
