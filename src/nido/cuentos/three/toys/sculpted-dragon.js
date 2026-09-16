import * as THREE from 'three';
import { ell, tube, part, finish, eyePair } from './sculpting.js';

// Authored realtime reptile, not a reskinned mammal or a photorealism claim.
// Low haunches, heavy neck, long jaw, swept horns and a visible coiled tail.
export function buildDragon() {
  const root = new THREE.Group(); root.userData.viewYaw = .68;
  const skin = new THREE.MeshPhysicalMaterial({color:'#54784c',roughness:.76,clearcoat:.08});
  const belly = new THREE.MeshStandardMaterial({color:'#d4c086',roughness:.74});
  const horn = new THREE.MeshStandardMaterial({color:'#8a6d48',roughness:.69});
  const gold = new THREE.MeshStandardMaterial({color:'#c4b06e',roughness:.68});
  const black = new THREE.MeshStandardMaterial({color:'#2a3328',roughness:.72});
  const pixels=new Uint8Array(256*256*4);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++) {
    const row=Math.floor(y/16),u=((x+(row%2)*8)%16)/16,v=y%16/16;
    const value=Math.round(55+165*Math.max(0,1-Math.hypot((u-.5)*1.8,(v-.5)*1.3)*1.6));
    const i=(y*256+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
  }
  const micro=new THREE.DataTexture(pixels,256,256);micro.wrapS=micro.wrapT=THREE.RepeatWrapping;micro.repeat.set(2,2);micro.needsUpdate=true;
  skin.bumpMap=micro;skin.bumpScale=.009;
  let released=false;skin.addEventListener('dispose',()=>{if(!released){released=true;micro.dispose();}});

  // Convex pointed plates, 12 triangles each, instead of spherical beads.
  const outline=[[-.7,0,-.5],[0,0,-.8],[.7,0,-.5],[.65,0,.2],[0,0,1],[-.65,0,.2]];
  const positions=[0,.28,0,...outline.flat(),0,-.05,0],indices=[];
  for(let i=0;i<6;i++)indices.push(0,i+1,(i+1)%6+1,7,(i+1)%6+1,i+1);
  const scaleGeometry=new THREE.BufferGeometry();scaleGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));scaleGeometry.setIndex(indices);scaleGeometry.computeVertexNormals();
  const plateMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.79});
  const palette=['#597847','#6f854b','#819251','#8f985a','#697a45','#a3965b'];
  function armour(parent, specs) {
    const plates=new THREE.InstancedMesh(scaleGeometry,plateMaterial,specs.length),transform=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
    specs.forEach((p,i)=>{
      transform.position.set(...p.at);transform.quaternion.setFromUnitVectors(up,new THREE.Vector3(...p.normal).normalize());
      transform.scale.set(p.w,p.h||.025,p.l);transform.updateMatrix();plates.setMatrixAt(i,transform.matrix);
      plates.setColorAt(i,new THREE.Color(palette[(i*7+Math.floor(i/9))%palette.length]));
    });
    plates.castShadow=true;plates.receiveShadow=true;parent.add(plates);
  }
  function armourEllipsoid(parent, center, size, rows, cols) {
    const specs=[];
    for(let r=0;r<rows;r++) {
      const z=-.84+r/(rows-1)*1.68,t=Math.sqrt(1-z*z);
      for(let c=0;c<cols;c++) {
        const phi=-1.64+c/(cols-1)*3.28+(r%2?.04:0),x=Math.sin(phi)*t,y=Math.cos(phi)*t;
        specs.push({at:[center[0]+x*size[0]*1.02,center[1]+y*size[1]*1.02,center[2]+z*size[2]],normal:[x/size[0],y/size[1],z/size[2]],w:size[0]*.21,l:size[2]*.16,h:.030});
      }
    }
    armour(parent,specs);
  }
  ell(root,skin,[0,.37,-.20],[.30,.25,.48]);
  ell(root,belly,[0,.23,-.10],[.255,.11,.40]);
  armourEllipsoid(root,[0,.37,-.20],[.30,.25,.48],14,15);
  const neck=part(root,null,null,[0,.39,.12]);
  tube(neck,skin,[[0,0,0],[0,.23,.02],[0,.47,.08],[0,.65,.22]],[.225,.22,.165,.145],{segments:26,sides:16});
  const neckScales=[];
  for(let r=0;r<12;r++)for(let c=0;c<11;c++) {
    const t=r/11,angle=-Math.PI*.88+c/10*Math.PI*1.76,rad=.22-t*.075,z=.015+t*t*.22;
    neckScales.push({at:[Math.sin(angle)*rad,t*.64,z-Math.cos(angle)*rad],normal:[Math.sin(angle),.12,-Math.cos(angle)],w:.056,l:.068,h:.032});
  }
  armour(neck,neckScales);
  for(let i=0;i<11;i++) {
    const t=i/10;
    ell(neck,belly,[0,.035+t*.59,.205+t*t*.12],[.16-t*.036,.045,.044],[-.23,0,0],12);
  }
  const head=part(neck,'head',1,[0,.66,.23]);head.rotation.y=-.12;
  ell(head,skin,[0,.026,.075],[.207,.165,.237]);
  ell(head,skin,[0,-.03,.286],[.157,.078,.205]);
  ell(head,belly,[0,-.094,.253],[.148,.035,.211]);
  armourEllipsoid(head,[0,.026,.075],[.207,.165,.237],9,11);
  eyePair(head,{spread:.168,y:.058,z:.188,radius:.036,iris:'#c9913f',friendly:true});
  for(const s of [-1,1]) {
    tube(head,skin,[[s*.128,.118,.23],[s*.18,.112,.16],[s*.198,.08,.08]],[.028,.03,.014],{segments:12,sides:8});
    ell(head,black,[s*.092,-.008,.463],[.023,.013,.019],undefined,10);
    tube(head,black,[[s*.06,-.087,.46],[s*.14,-.084,.35],[s*.183,-.069,.135]],[.003,.004,.002],{segments:16,sides:5});
    tube(head,horn,[[s*.15,.145,-.035],[s*.235,.26,-.14],[s*.25,.32,-.32],[s*.20,.36,-.41]],[.065,.049,.019,.001],{segments:20,sides:10});
    tube(head,horn,[[s*.224,.244,-.135],[s*.32,.28,-.20],[s*.36,.32,-.29]],[.035,.025,.001],{segments:12,sides:8});
    for(let i=0;i<3;i++)tube(head,gold,[[s*.16,.015-i*.042,-.034],[s*(.27+i*.012),.045-i*.04,-.15-i*.04]],[.035,.001],{segments:8,sides:8});
    for(const front of [true,false]) {
      const leg=part(root,'leg',front?s:-s,[s*.23,.37,front?.18:-.46]);
      tube(leg,skin,[[0,0,0],[s*.105,-.07,front?-.07:.055],[s*.09,-.21,.13],[s*.07,-.30,.23]],[front?.10:.16,.105,.057,.053],{segments:18,sides:10});
      ell(leg,skin,[s*.07,-.31,.255],[.103,.049,.135]);
      for(let n=-1;n<=1;n++) {
        const x=s*.07+n*.062,z=.34-Math.abs(n)*.022;
        tube(leg,skin,[[x,-.32,.26],[x,-.333,z],[x,-.34,z+.065]],[.032,.027,.020],{segments:8,sides:8});
        tube(leg,horn,[[x,-.339,z+.04],[x,-.35,z+.10]],[.022,.001],{segments:6,sides:8});
      }
    }
  }
  const tail=part(root,'tail',1,[0,.36,-.60]);
  const tailPoints=[[0,0,0],[.22,-.12,-.15],[.51,-.20,-.06],[.66,-.23,.30],[.58,-.22,.70],[.25,-.16,.92],[-.015,-.09,.87]];
  tube(tail,skin,tailPoints,[.19,.17,.135,.105,.068,.038,.002],{segments:42,sides:12});
  const curve=new THREE.CatmullRomCurve3(tailPoints.map(p=>new THREE.Vector3(...p))),tailScales=[];
  for(let i=0;i<25;i++) {
    const t=i/25,p=curve.getPoint(t),radius=.19*(1-t)+.01;
    for(let j=-2;j<=2;j++) {const a=j*.5;tailScales.push({at:[p.x+Math.sin(a)*radius,p.y+Math.cos(a)*radius,p.z],normal:[Math.sin(a),Math.cos(a),0],w:.035*(1-t)+.012,l:.054,h:.019});}
  }
  armour(tail,tailScales);
  for(let i=0;i<12;i++) {
    const z=.20-i*.069,y=.38+Math.sqrt(Math.max(.05,1-((z+.20)/.49)**2))*.26;
    tube(root,gold,[[0,y,z],[0,y+.125,z-.065],[0,y+.09,z-.12]],[.037,.016,.001],{segments:8,sides:8});
  }
  return finish(root,'reptile',{species:'dragon',legs:4,design:'scaled-guardian'});
}
