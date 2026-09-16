// Original, articulated storybook figures. Shared anatomy, distinct silhouettes
// and costumes; no remote model downloads or GPU-heavy per-frame allocations.
import * as THREE from 'three';
import { mat, blob, box, cyl, cone } from './_shared.js';
import { sculptedHuman } from './sculpted-human.js';

const gold = () => mat('#e9b956', { metal: .35, rough: .32 });
const module = (id, label, build) => ({ id, label, build });
function person(id, label, coat, kind = '', girl = false, hairColor = '#674331') {
  return module(id, label, () => sculptedHuman({ coat, girl, hairColor, kind, adult: !['heidi','nino-clasico','pastor','pinocho','duende'].includes(id), trousers: '#46536b', skinTone: kind === 'genie' ? '#73c7d9' : '#e8b88b',
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
];
