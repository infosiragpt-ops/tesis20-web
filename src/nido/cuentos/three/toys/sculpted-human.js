import * as THREE from 'three';
import { mat, part, ell, tube, eyePair, finish, details } from './sculpting.js';

function garment(parent, material, rings, pleats=0) {
  const positions=[],uv=[],index=[],segments=32;
  rings.forEach(([y,rx,rz],r)=>{for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,fold=1+Math.cos(a*10)*pleats*(1-r/(rings.length-1));
    positions.push(Math.sin(a)*rx*fold,y,Math.cos(a)*rz*fold);uv.push(i/segments,r/(rings.length-1));
    if(r<rings.length-1&&i<segments){const q=r*(segments+1)+i;index.push(q,q+1,q+segments+1,q+1,q+segments+2,q+segments+1);}
  }});
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

// Keeps the existing decoration coordinate contract while replacing anatomy.
export function sculptedHuman({coat,trousers='#46536b',girl=false,chullo=false,sailor=false,skinTone='#bc8257',hairColor='#352522',decorate,adult=false,kind=''}) {
  const root=new THREE.Group(),skin=mat(skinTone,{rough:.77,surface:'skin'}),hair=mat(hairColor,{rough:.86,surface:'fur'});
  const fabric=mat(coat,{rough:.90,surface:'cloth'}),pants=mat(trousers,{rough:.88,surface:'cloth'}),boot=mat('#493d34',{rough:.76}),trim=mat('#d9c69e',{rough:.85,surface:'cloth'}),metal=mat('#b59961',{rough:.4,metal:.5});
  const legTop=.126,shoulder=.213,headBase=.24;
  if(kind!=='mermaid') for(const s of [-1,1]) {
    const leg=part(root,'leg',s,[s*.025,legTop,0]);
    tube(leg,pants,[[0,0,0],[0,-.041,.006],[0,-.076,0],[0,-.106,0]],[.021,.017,.013,.012],{segments:14,sides:12});
    ell(leg,boot,[0,-.112,.017],[.018,.014,.032]);
    tube(leg,boot,[[0,-.075,0],[0,-.101,0]],[.015,.016],{segments:6});
  }
  garment(root,fabric,[[.117,.034,.024],[.14,.033,.024],[.17,.034,.025],[.20,.046,.025],[.221,.034,.023],[.225,.015,.017]],.025);
  if(girl&&kind!=='mermaid') garment(root,fabric,[[.035,.070,.047],[.065,.063,.043],[.102,.047,.034],[.14,.032,.025]],.065);
  tube(root,trim,[[-.03,.214,.019],[0,.199,.03],[.03,.214,.019]],[.004,.003,.004],{segments:14,sides:6});
  tube(root,skin,[[0,.218,0],[0,.254,0]],[.014,.012],{segments:8,sides:12});
  for(let i=0;i<4;i++)ell(root,metal,[0,.188-i*.015,.027],[.0025,.0027,.0019],[0,0,0],8);
  for(const s of [-1,1]) {
    const arm=part(root,'arm',s,[s*.039,shoulder,0]);arm.rotation.z=s*.12;
    tube(arm,fabric,[[0,0,0],[s*.009,-.034,-.003],[s*.005,-.066,.006]],[.018,.013,.011],{segments:14,sides:12});
    tube(arm,trim,[[s*.005,-.061,.006],[s*.005,-.067,.006]],[.012,.012],{segments:4});
    ell(arm,skin,[s*.005,-.077,.01],[.010,.015,.008]);
    ell(arm,skin,[-s*.004,-.075,.014],[.004,.008,.004],[0,0,-s*.4],10);
    // Low-relief finger separation, not oversized mitten spheres.
    for(let f=0;f<3;f++)tube(arm,skin,[[s*.005+(f-1)*.004,-.079,.013],[s*.006+(f-1)*.004,-.088,.011]],[.0023,.0018],{segments:5,sides:6});
  }
  const head=part(root,'head',1,[0,headBase,.003]);
  ell(head,skin,[0,.039,0],[adult?.031:.035,.045,.031]);
  ell(head,skin,[0,.012,.014],[.023,.018,.020]);
  ell(head,hair,[0,.055,-.011],[adult?.032:.036,.033,.028]);
  const locks=[];for(let i=0;i<16;i++){const a=-1.5+i*3/15;locks.push({p:[Math.sin(a)*.031,.060+Math.cos(a)*.01,.012+Math.cos(a)*.012],s:[.008,.018,.007],r:[.25,0,-a*.35]});}details(head,hair,locks);
  for(const s of [-1,1]) {
    ell(head,skin,[s*.032,.033,-.001],[.007,.012,.006]);
    tube(head,hair,[[s*.009,.053,.030],[s*.018,.056,.030],[s*.025,.052,.026]],[.0014,.0018,.001],{segments:8,sides:6});
    if(girl) tube(head,hair,[[s*.028,.065,-.012],[s*.038,.025,-.01],[s*.038,-.014,-.016],[s*.029,-.044,-.01]],[.014,.014,.011,.003],{segments:20,sides:10});
  }
  eyePair(head,{spread:.015,y:.043,z:.0265,radius:adult?.0068:.0078,iris:'#795436'});
  ell(head,skin,[0,.030,.030],[.006,.010,.008]);
  tube(head,mat('#956257',{rough:.82}),[[-.009,.018,.028],[0,.016,.032],[.009,.019,.028]],[.001,.0017,.001],{segments:10,sides:6});
  if(chullo||sailor) {
    const cap=mat(chullo?'#a84640':'#314c66',{surface:'cloth'});
    ell(head,cap,[0,.078,-.004],[.038,.018,.031]);
    tube(head,trim,[[-.034,.071,0],[0,.069,.031],[.034,.071,0]],[.0035,.0035,.0035],{segments:20});
    if(chullo){ell(head,trim,[0,.102,-.006],[.008,.009,.008]);for(const s of [-1,1])ell(head,cap,[s*.034,.055,-.003],[.008,.021,.011]);}
    else ell(head,cap,[0,.071,.026],[.031,.003,.024]);
  }
  if(decorate) {
    const before=new Set(head.children);decorate(root,head);
    // Historic ornaments were authored for a larger head: scale together.
    for(const obj of head.children)if(!before.has(obj)){obj.position.multiplyScalar(.72);obj.scale.multiplyScalar(.72);}
  }
  const holder=finish(root,'human',{adult,kind:kind||'person'});
  return holder;
}
