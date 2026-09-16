// Bespoke costumes for the original Nido stories, on the articulated human
// anatomy. Accessories keep each character recognizable at reading distance.
import * as THREE from 'three';
import { sculptedHuman } from './sculpted-human.js';
import { mat, ell, tube } from './sculpting.js';
import { build as basket } from './canasta.js';

function build(kind) {
  const little = kind==='caperucita' || kind==='pulgarcito';
  const female = ['caperucita','abuelita','mama-pulgarcito'].includes(kind);
  const grandmother=kind==='abuelita', hunter=kind==='cazador';
  const cloth=mat(kind==='caperucita'?'#983e37':grandmother?'#d7cfbf':'#627049',{surface:'cloth',rough:.91});
  const leather=mat('#73553c',{rough:.84}), scarf=mat('#a45640',{surface:'cloth'});
  return sculptedHuman({coat:kind==='caperucita'?'#e3d3b4':grandmother?'#a58aa0':female?'#8b9673':hunter?'#647152':'#d9c9a7',
    trousers:'#626b4b',girl:female,adult:!little,skinTone:'#dcb494',hairColor:grandmother?'#b5ae9e':'#684a32',
    decorate(root,head) {
      if(kind==='caperucita') {
        // The hood has an open face. Its curved edge frames, not covers, eyes.
        ell(head,cloth,[0,.064,-.02],[.06,.065,.038]);
        tube(head,cloth,[[-.048,.006,.024],[-.054,.07,.028],[-.03,.122,.024],[.03,.122,.024],[.054,.07,.028],[.048,.006,.024]],[.013,.016,.018,.018,.016,.013],{segments:32,sides:10});
        const points=[new THREE.Vector2(.01,.22),new THREE.Vector2(.034,.21),new THREE.Vector2(.057,.14),new THREE.Vector2(.067,.075)];
        const cape=new THREE.Mesh(new THREE.LatheGeometry(points,28,Math.PI/2,Math.PI),cloth);
        cape.castShadow=true;cape.receiveShadow=true;root.add(cape);
        ell(root,cloth,[0,.202,.033],[.007,.006,.004]);
        const bag=basket();bag.scale.setScalar(.23);bag.position.set(-.072,.038,.024);root.add(bag);
      } else if(grandmother) {
        ell(head,cloth,[0,.10,-.009],[.053,.025,.045]);
        for(const s of [-1,1]) {
          const frame=new THREE.Mesh(new THREE.TorusGeometry(.013,.0016,6,20),leather);
          frame.position.set(s*.020,.059,.047);head.add(frame);
        }
        tube(head,leather,[[-.007,.059,.047],[.007,.059,.047]],[.0013,.0013]);
        ell(root,mat('#e3d9c7',{surface:'cloth'}),[0,.093,.041],[.042,.053,.003]);
      } else if(kind!=='mama-pulgarcito') {
        ell(head,cloth,[0,.105,-.005],[.062,.005,.051]);
        tube(head,cloth,[[0,.101,-.013],[.002,.136,-.007],[.031,.165,-.008]],[.044,.034,.001],{segments:20,sides:20});
        if(kind==='pulgarcito'||hunter) {
          ell(head,scarf,[-.038,.148,.004],[.010,.037,.003],[0,0,-.5]);
          tube(head,leather,[[-.047,.117,.004],[-.024,.181,.004]],[.0012,.0007]);
        }
      } else ell(head,mat('#684a32',{surface:'fur'}),[0,.074,-.044],[.025,.024,.018]);
      if(!female) {
        tube(root,scarf,[[-.018,.218,.008],[0,.207,.025],[.018,.218,.008]],[.005,.005,.005]);
        tube(root,scarf,[[0,.205,.027],[-.012,.176,.030]],[.005,.001]);
        tube(root,leather,[[-.03,.211,.022],[.004,.165,.029],[.039,.112,.015]],[.0035,.0035,.0035]);
        ell(root,leather,[.050,.107,.009],[.018,.028,.014]);
      }
    },
  });
}

export const SCULPTED_STORY_PEOPLE = [
  ['caperucita','Caperucita'],['cazador','Cazador'],['abuelita','Abuelita'],
  ['pulgarcito','Pulgarcito'],['papa-pulgarcito','Papá de Pulgarcito'],['mama-pulgarcito','Mamá de Pulgarcito'],
].map(([id,label])=>({id,label,build:()=>build(id)}));
