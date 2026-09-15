// Original, articulated storybook figures. Shared anatomy, distinct silhouettes
// and costumes; no remote model downloads or GPU-heavy per-frame allocations.
import * as THREE from 'three';
import { mat, blob, box, cyl, cone, fit, eyeball, smile, mesh } from './_shared.js';
import { child } from './personajes.js';

const gold = () => mat('#e9b956', { metal: .35, rough: .32 });
const module = (id, label, build) => ({ id, label, build });
function person(id, label, coat, kind = '', girl = false, hairColor = '#674331') {
  return module(id, label, () => child({ coat, girl, hairColor, trousers: '#46536b', skinTone: kind === 'genie' ? '#73c7d9' : '#e8b88b',
    decorate(g, head) {
      const ornament = gold();
      if (['royal', 'queen'].includes(kind)) {
        head.add(cyl(.054, .05, .015, ornament, { y: .105 }));
        for (let i = 0; i < 5; i++) {
          const angle = i * Math.PI * 2 / 5;
          head.add(cone(.012, .04, ornament, { x: Math.sin(angle) * .045, y: .123, z: Math.cos(angle) * .045 }));
        }
        g.add(box(.06, .09, .008, mat('#804a72', { surface: 'cloth' }), { y: .15, z: -.041 }));
      }
      if (kind === 'rapunzel') {
        const braid = mat('#ebc65e', { surface: 'fur' });
        for (let i = 0; i < 13; i++) head.add(blob(.012, braid, { x: .052 + Math.sin(i * 1.8) * .006, y: .04 - i * .018, z: .016 }));
      }
      if (['witch', 'wooden', 'elf', 'santa'].includes(kind)) {
        const color = kind === 'witch' ? '#46314f' : kind === 'santa' ? '#c84240' : coat;
        head.add(cone(.054, .1, mat(color, { surface: 'cloth' }), { y: .145, rz: -.15 }));
        head.add(cyl(.065, .065, .008, mat(color), { y: .098 }));
      }
      if (kind === 'wooden') {
        head.add(cyl(.006, .011, .057, mat('#c89860'), { y: .043, z: .077, rx: Math.PI / 2 }));
        g.add(box(.085, .014, .01, mat('#bb4842'), { y: .181, z: .038 }));
      }
      if (kind === 'soldier') {
        head.add(cyl(.04, .049, .07, mat('#243453'), { y: .12 }));
        head.add(blob(.01, ornament, { y: .125, z: .048 }));
        g.add(box(.057, .075, .004, mat('#f5e5bf'), { y: .14, z: .041 }));
      }
      if (['santa', 'sage'].includes(kind)) {
        for (let i = 0; i < 9; i++) head.add(blob(.015, mat('#f2ece0', { surface: 'wool' }), { x: (i % 3 - 1) * .019, y: .022 - Math.floor(i / 3) * .014, z: .033 }));
      }
      if (['turban', 'genie'].includes(kind)) {
        head.add(blob(.057, mat('#f5e6ca', { surface: 'cloth' }), { y: .098, s: [1, .55, 1] }));
        head.add(blob(.012, ornament, { y: .107, z: .05 }));
      }
      if (kind === 'bluebeard') head.add(cone(.032, .06, mat('#304a72', { surface: 'fur' }), { y: .006, z: .025, rz: Math.PI }));
      if (kind === 'fairy') {
        [-1, 1].forEach(side => {
          const wing = new THREE.Group(); wing.position.set(side * .025, .17, -.028); wing.userData.wing = side;
          wing.add(blob(.054, mat('#cbdfef', { opacity: .75, clearcoat: .6 }), { x: side * .035, s: [.85, 1.35, .12] })); g.add(wing);
        });
      }
      if (kind === 'mermaid') {
        g.add(cone(.047, .13, mat('#51afaa', { clearcoat: .6 }), { y: .06, rz: Math.PI }));
        const tail = new THREE.Group(); tail.userData.tail = 1;
        [-1, 1].forEach(side => tail.add(blob(.033, mat('#79c9bc'), { x: side * .024, y: .007, s: [1, .3, .65] })));
        g.add(tail);
      }
    },
  }));
}

function animal(id, label, kind, color) {
  return module(id, label, () => {
    const g = new THREE.Group(), fur = mat(color, { surface: ['duck','swan','dove','rooster'].includes(kind) ? 'feathers' : 'fur' });
    const cream = mat('#f0dfbb', { surface: 'fur' });
    const body = blob(.078, fur, { y: .12, s: [1, 1.1, .82] }); g.add(body);
    const head = new THREE.Group(); head.position.set(0, .218, .016); head.userData.head = 1;
    head.add(blob(.067, fur, { s: [1, .97, .88] }));
    const bird = ['duck','swan','dove','rooster'].includes(kind);
    if (kind === 'lion' || kind === 'beast') {
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        head.add(blob(.03, mat('#84512e', { surface: 'fur' }), { x: Math.sin(a) * .061, y: Math.cos(a) * .06, z: -.02 }));
      }
    }
    if (bird) {
      head.add(cone(.022, .06, mat('#e3a244'), { y: -.005, z: .07, rx: Math.PI / 2 }));
    } else {
      head.add(blob(.032, cream, { y: -.024, z: .049, s: [1.15, .65, .75] }));
      head.add(blob(.011, mat('#45312c', { clearcoat: .7 }), { y: -.01, z: .073 }));
      smile(head, { y: -.029, z: .075, r: .015, thick: .002 });
    }
    [-1, 1].forEach(side => {
      eyeball(head, { x: side * .029, y: .012, z: .05, r: .017, iris: '#493727' });
      if (!bird && !['turtle', 'ant', 'cicada'].includes(kind)) {
        const ear = new THREE.Group(); ear.position.set(side * .052, .049, 0); ear.userData.ear = side;
        const tall = kind === 'hare' || kind === 'donkey';
        ear.add(kind === 'cat' || kind === 'boots' ? cone(.025, .055, fur, { y: .011 }) : blob(tall ? .021 : .026, fur, { y: tall ? .04 : .004, s: [1, tall ? 2.8 : 1, .5] }));
        ear.add(blob(.015, mat('#dcaaa0'), { y: tall ? .045 : .004, z: .01, s: [1, tall ? 2.5 : 1, .3] })); head.add(ear);
      }
      const limb = new THREE.Group(); limb.position.set(side * .054, .139, 0);
      limb.userData[bird ? 'wing' : 'arm'] = side;
      limb.add(blob(.029, fur, { x: side * .015, y: -.02, s: [.6, 1.8, .85] })); g.add(limb);
      const leg = new THREE.Group(); leg.userData.leg = side; leg.position.set(side * .036, .073, 0);
      leg.add(cyl(.017, .014, .058, fur, { y: -.027 }));
      leg.add(blob(.026, kind === 'boots' ? mat('#663b28') : bird ? mat('#dcb150') : fur, { y: -.055, z: .015, s: [1, .55, 1.4] })); g.add(leg);
    });
    if (kind === 'turtle') {
      g.add(blob(.09, mat('#39795d', { clearcoat: .4 }), { y: .135, z: -.022, s: [1.15, .95, .85] }));
      for (let i = 0; i < 5; i++) g.add(blob(.026, mat('#b9c783'), { x: Math.sin(i * 1.26) * .064, y: .135 + Math.cos(i * 1.26) * .064, z: -.088, s: [1, 1, .15] }));
    }
    if (['deer','beast','minotaur','dragon'].includes(kind)) {
      [-1, 1].forEach(side => head.add(cone(.019, .07, cream, { x: side * .043, y: .074, rz: -side * .35 })));
      if (kind === 'deer') for (let i = 0; i < 8; i++) g.add(blob(.007, cream, { x: Math.sin(i * 2) * .055, y: .105 + (i % 4) * .022, z: .058 }));
    }
    if (['ant','cicada'].includes(kind)) {
      [-1, 1].forEach(side => {
        head.add(cyl(.003, .003, .06, fur, { x: side * .03, y: .066, rz: -side * .4 }));
        head.add(blob(.008, fur, { x: side * .042, y: .094 }));
      });
      if (kind === 'cicada') [-1, 1].forEach(side => {
        const wing = new THREE.Group(); wing.userData.wing = side; wing.position.set(side * .03, .15, -.04);
        wing.add(blob(.065, mat('#bed5bb', { opacity: .65 }), { x: side * .04, s: [1, 1.3, .1] })); g.add(wing);
      });
    }
    if (kind === 'boots') {
      head.add(cyl(.074, .074, .008, mat('#823c3d'), { y: .067 }));
      head.add(cone(.049, .06, mat('#823c3d'), { y: .09 }));
      head.add(blob(.036, gold(), { x: .041, y: .101, s: [.25, 1.5, .2], rz: -.4 }));
    }
    if (kind === 'rooster') head.add(blob(.027, mat('#c9493e'), { y: .065, s: [.4, 1, 1.3] }));
    const tail = new THREE.Group(); tail.userData.tail = 1; tail.position.set(0, .1, -.06);
    tail.add(blob(.039, fur, { z: -.025, s: [.45, .65, 1.5] })); g.add(tail);
    if (kind === 'dragon') [-1, 1].forEach(side => {
      const wing = new THREE.Group(); wing.userData.wing = side; wing.position.set(side * .05, .15, -.015);
      wing.add(cone(.06, .11, mat('#b6ba72'), { x: side * .047, rz: -side * 1.1, s: [1, 1, .15] })); g.add(wing);
    });
    g.add(head); return fit(g, .30);
  });
}

export const CLASSIC_TOYS = [
  person('princesa', 'Princesa', '#cd7799', 'royal', true, '#b48243'),
  person('principe', 'Príncipe', '#4d7897', 'royal'),
  person('reina', 'Reina', '#875896', 'queen', true),
  person('rey', 'Rey', '#ad5657', 'royal'),
  person('rapunzel', 'Rapunzel', '#af85bc', 'rapunzel', true, '#e9c86e'),
  person('bruja', 'Hechicera', '#53614b', 'witch', true, '#9d9890'),
  person('pinocho', 'Pinocho', '#a66536', 'wooden', false, '#825629'),
  person('alibaba', 'Alí Babá', '#bf8263', 'turban'),
  person('aladino', 'Aladino', '#688ca2', 'turban'),
  person('genio', 'Genio de la lámpara', '#4e92a9', 'genie'),
  person('gigante', 'Gigante', '#708267', 'sage'),
  person('gulliver', 'Gulliver', '#628985'),
  person('bella', 'Bella', '#dec376', '', true),
  person('soldadito', 'Soldadito de plomo', '#c05e57', 'soldier'),
  person('bailarina', 'Bailarina', '#e8bac8', '', true),
  person('guillermo', 'Guillermo Tell', '#69794e'),
  person('cenicienta', 'Cenicienta', '#8cbed6', 'royal', true, '#bc9458'),
  person('blancanieves', 'Blancanieves', '#e3c764', '', true, '#2e2733'),
  person('barba-azul', 'Barba Azul', '#516284', 'bluebeard'),
  person('hada', 'Hada', '#c4a0d0', 'fairy', true, '#e1caa0'),
  person('sirena', 'Sirenita', '#a8d4c4', 'mermaid', true, '#9c624c'),
  person('heidi', 'Heidi', '#ac5250', '', true),
  person('zapatero', 'Zapatero', '#956e52', 'sage'),
  person('duende', 'Duende', '#688c70', 'elf'),
  person('papa-noel', 'Papá Noel', '#bc4140', 'santa', false, '#eee7d5'),
  person('campesino', 'Campesino', '#8d805f'),
  person('campesina', 'Campesina', '#a06e75', '', true),
  person('pastor', 'Pastor', '#a39166'),
  person('nino-clasico', 'Niño', '#a48156'),
  person('teseo', 'Teseo', '#72928c'),
  animal('bambi','Bambi','deer','#c59566'), animal('gato-botas','Gato con botas','boots','#bd926a'),
  animal('gato','Gato','cat','#a08778'), animal('leon','León','lion','#c59c5e'),
  animal('raton','Ratón','mouse','#aba49b'), animal('liebre','Liebre','hare','#c1b59a'),
  animal('tortuga','Tortuga','turtle','#94b98c'), animal('patito','Patito','duck','#b9b5a3'),
  animal('cisne','Cisne','swan','#f2ede0'), animal('paloma','Paloma','dove','#d6ddd9'),
  animal('hormiga','Hormiga','ant','#9f6548'), animal('cigarra','Cigarra','cicada','#99a16b'),
  animal('burro','Burro','donkey','#a3998a'), animal('perro','Perro','dog','#b38c65'),
  animal('gallo','Gallo','rooster','#e1c9a0'), animal('dragon','Dragón','dragon','#739785'),
  animal('bestia','Bestia','beast','#97734c'), animal('minotauro','Minotauro','minotaur','#9f7b5d'),
];
