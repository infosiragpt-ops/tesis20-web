import * as THREE from 'three';
import { mat, part, ell, tube, eyePair, details, finish } from './sculpting.js';

function fantasy(kind) {
  const root=new THREE.Group(), cat=kind==='boots', bull=kind==='minotaur';
  const fur=mat(cat?'#aa8261':bull?'#926b4e':'#997b59',{surface:'fur',rough:.86});
  const cream=mat('#d7c5a1',{surface:'fur',rough:.9}),leather=mat('#533e31',{rough:.73}),coat=mat(cat?'#815344':'#42586b',{surface:'cloth',rough:.88});
  ell(root,cat?coat:fur,[0,.39,0],[cat?.12:.18,.21,.105]);
  ell(root,cat?cream:coat,[0,.43,.078],[cat?.073:.11,.15,.034]);
  const head=part(root,'head',1,[0,.69,.018]);ell(head,fur,[0,0,0],[cat?.125:.15,.135,.11]);
  ell(head,cream,[0,-.04,.105],[bull?.092:.075,.055,.066]);ell(head,leather,[0,-.01,.161],[bull?.059:.024,.018,.022]);
  eyePair(head,{spread:cat?.069:.082,y:.028,z:.092,radius:.022});
  for(const s of [-1,1]) {
    const ear=part(head,'ear',s,[s*.11,.081,-.013]);tube(ear,fur,[[0,0,0],[s*.015,.1,-.015]],[.044,.001],{segments:10,flatten:.5});
    if(!cat)tube(head,cream,[[s*.092,.104,-.05],[s*.16,.18,-.035],[s*.17,.22,.055]],[.036,.021,.001],{segments:15});
    const arm=part(root,'arm',s,[s*(cat?.106:.156),.51,0]);
    tube(arm,cat?coat:fur,[[0,0,0],[s*.052,-.12,.005],[s*.034,-.23,.03]],[cat?.041:.065,.035,.026]);
    ell(arm,fur,[s*.034,-.24,.033],[.033,.041,.028]);
    const leg=part(root,'leg',s,[s*.070,.235,0]);
    tube(leg,fur,[[0,0,0],[0,-.1,.005],[0,-.20,0]],[.045,.03,.025]);
    if(cat)tube(leg,leather,[[0,-.085,0],[0,-.203,0]],[.04,.028],{segments:8});
    ell(leg,leather,[0,-.206,.03],[.04,.027,.071]);
    if(cat)for(let i=0;i<3;i++)tube(head,cream,[[s*.055,-.038+i*.016,.155],[s*.17,-.06+i*.027,.15]],[.0018,.0005],{segments:6,sides:5});
  }
  if(cat) {
    const hat=mat('#78473c',{surface:'cloth'});
    ell(head,hat,[0,.105,-.015],[.19,.013,.16],[0,0,-.12]);ell(head,hat,[.01,.145,-.02],[.10,.06,.075],[0,0,-.12]);
    tube(head,cream,[[.095,.155,0],[.13,.23,-.014],[.105,.27,-.06]],[.009,.016,.001],{segments:18,flatten:.3});
    const tail=part(root,'tail',1,[0,.30,-.088]);tube(tail,fur,[[0,0,0],[.13,-.045,-.12],[.19,.07,-.10],[.14,.17,-.10]],[.03,.028,.02,.001],{segments:20});
    tube(root,leather,[[-.115,.32,.03],[0,.30,.107],[.115,.32,.03]],[.016,.016,.016]);
  } else {
    const mane=mat('#67503c',{surface:'fur',rough:.9});
    details(head,mane,Array.from({length:18},(_,i)=>{const a=i*2*Math.PI/18;return{p:[Math.sin(a)*.145,Math.cos(a)*.13,-.055],s:[.05,.065,.045],r:[0,0,-a]};}));
  }
  return finish(root,'fantasy',{species:kind,legs:2,arms:2});
}
export const SCULPTED_FANTASY=[['gato-botas','Gato con botas','boots'],['bestia','Bestia','beast'],['minotauro','Minotauro','minotaur']].map(([id,label,kind])=>({id,label,build:()=>fantasy(kind)}));
