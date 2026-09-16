import * as THREE from 'three';
import { finish } from './sculpting.js';

// Original dragon anatomy based on the direction approved on 2026-09-16.
// Animal facing +Z, four weight-bearing legs, separate neck/head/tail pivots.
export function buildDragon() {
  const root = new THREE.Group();
  const skin = new THREE.MeshPhysicalMaterial({color:'#557765',roughness:.57,metalness:.08,clearcoat:.12});
  const belly = new THREE.MeshStandardMaterial({color:'#d6c6a0',roughness:.72});
  const horn = new THREE.MeshStandardMaterial({color:'#685745',roughness:.64});
  const ridge = new THREE.MeshStandardMaterial({color:'#8d875a',roughness:.58,metalness:.12});
  const eye = new THREE.MeshPhysicalMaterial({color:'#b78036',roughness:.14,clearcoat:1});
  const pupil = new THREE.MeshPhysicalMaterial({color:'#151b13',roughness:.15,clearcoat:1});
  const crease = new THREE.MeshStandardMaterial({color:'#263d30',roughness:.82});
  const sharedSphere = new THREE.SphereGeometry(1,16,10);
  // Fine-scale relief is procedural material detail, not a downloaded image.
  const pixels=new Uint8Array(256*256*4);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const row=Math.floor(y/16),u=((x+(row%2)*8)%16)/16,v=(y%16)/16;
    const d=Math.sqrt(((u-.5)*1.7)**2+((v-.5)*1.25)**2);
    const relief=Math.max(0,1-d*1.65),grain=Math.sin(x*127.1+y*311.7)*.025;
    const value=Math.round(60+160*Math.max(0,relief+grain)),p=(y*256+x)*4;
    pixels[p]=pixels[p+1]=pixels[p+2]=value;pixels[p+3]=255;
  }
  const micro=new THREE.DataTexture(pixels,256,256);micro.wrapS=micro.wrapT=THREE.RepeatWrapping;micro.repeat.set(3,3);micro.needsUpdate=true;
  skin.bumpMap=micro;skin.bumpScale=.008;skin.roughness=.76;skin.clearcoat=.03;
  // This relief belongs to this dragon, unlike the shared surface cache.
  // Release it when the actor leaves the page, including rapid book changes.
  let reliefReleased=false;
  skin.addEventListener('dispose',()=>{if(!reliefReleased){reliefReleased=true;micro.dispose();}});
  const put = (g,m,pos,scale,parent=root)=>{
    const o=new THREE.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  };
  const ellipsoid=(m,p,s,parent)=>put(sharedSphere,m,p,s,parent);
  function sweep(points,radii,material,parent=root,segments=38,sides=14,ellipticity=1){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const frames=curve.computeFrenetFrames(segments,false), vertices=[],uv=[],indices=[];
    for(let i=0;i<=segments;i++){
      const t=i/segments, at=curve.getPointAt(t), n=frames.normals[i], b=frames.binormals[i];
      const k=t*(radii.length-1), ix=Math.min(radii.length-2,Math.floor(k)), r=THREE.MathUtils.lerp(radii[ix],radii[ix+1],k-ix);
      for(let j=0;j<=sides;j++){
        const a=j/sides*Math.PI*2;
        const v=at.clone().addScaledVector(n,Math.cos(a)*r).addScaledVector(b,Math.sin(a)*r*ellipticity);
        vertices.push(v.x,v.y,v.z);uv.push(j/sides,t);
        if(i<segments&&j<sides){const q=i*(sides+1)+j;indices.push(q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1);}
      }
    }
    // Cap both ends: no visible open tubes at joints or extremities.
    for(const start of [true,false]){
      const center=vertices.length/3,p=curve.getPointAt(start?0:1);vertices.push(p.x,p.y,p.z);uv.push(.5,start?0:1);
      const ring=start?0:segments*(sides+1);for(let j=0;j<sides;j++)indices.push(center,ring+j+(start?1:0),ring+j+(start?0:1));
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    return put(geo,material,[0,0,0],[1,1,1],parent);
  }
  const body=ellipsoid(skin,[0,.62,-.16],[.29,.32,.61]);
  ellipsoid(belly,[0,.47,-.06],[.243,.17,.51]);
  const neck=new THREE.Group();neck.position.set(0,.64,.26);root.add(neck);
  sweep([[0,0,0],[0,.21,.14],[0,.45,.17],[0,.67,.29]],[.215,.185,.115,.12],skin,neck,36,20,.92);
  const head=new THREE.Group();head.position.set(0,.67,.29);head.userData.head=1;neck.add(head);
  ellipsoid(skin,[0,.055,.095],[.153,.145,.195],head);
  ellipsoid(skin,[0,-.006,.266],[.129,.074,.164],head);
  ellipsoid(belly,[0,-.068,.252],[.122,.033,.15],head);
  for(const s of [-1,1]){
    const eyeball=ellipsoid(eye,[s*.124,.061,.187],[.032,.038,.031],head);
    ellipsoid(pupil,[s*.135,.063,.209],[.009,.027,.012],head);
    ellipsoid(crease,[s*.075,.031,.382],[.016,.011,.016],head);
    const brow=ellipsoid(skin,[s*.119,.101,.173],[.055,.021,.069],head);brow.rotation.z=s*.18;
    sweep([[s*.115,.139,.023],[s*.165,.232,-.045],[s*.166,.289,-.172]],[.052,.033,.001],horn,head,25,12);
    sweep([[s*.088,-.044,.392],[s*.13,-.048,.281],[s*.141,-.031,.149]],[.003,.004,.002],crease,head,20,6);
    for(let i=0;i<4;i++){
      sweep([[s*.123,.025-i*.035,.015-i*.025],[s*(.185+i*.009),.045-i*.034,-.08-i*.026]],[.025,.001],ridge,head,8,8);
    }
    eyeball.userData.eye=1;
  }
  for(const s of [-1,1])for(const front of [true,false]){
    const leg=new THREE.Group();leg.userData.leg=front?s:-s;leg.position.set(s*.22,.58,front?.23:-.53);root.add(leg);
    sweep([[0,0,0],[s*.105,-.16,-.015],[s*.07,-.33,.035],[s*.10,-.49,.075]],[front?.10:.14,.09,.051,.048],skin,leg,25,14);
    const ankle=ellipsoid(skin,[s*.10,-.50,.115],[.08,.05,.123],leg);
    for(let toe=0;toe<3;toe++){
      const x=s*.10+(toe-1)*.047,z=.19-Math.abs(toe-1)*.014;
      ellipsoid(skin,[x,-.515,z],[.028,.031,.075],leg);
      sweep([[x,-.516,z+.044],[x,-.535,z+.108]],[.020,.001],horn,leg,8,8);
    }
    leg.name=(front?'front':'hind')+(s<0?'-left':'-right');
  }
  const tail=new THREE.Group();tail.userData.tail=1;tail.position.set(0,.64,-.68);root.add(tail);
  sweep([[0,0,0],[.07,-.18,-.24],[.35,-.38,-.47],[.67,-.35,-.44],[.88,-.19,-.20],[.87,.09,-.11]],[.205,.16,.115,.079,.045,.002],skin,tail,52,18,.88);
  // Overlapping dorsal scales use one geometry/material/draw call.
  const scaleGeo=new THREE.SphereGeometry(1,8,5), count=14*13;
  const scales=new THREE.InstancedMesh(scaleGeo,ridge,count);scales.castShadow=true;scales.receiveShadow=true;
  const transform=new THREE.Object3D();let n=0;
  for(let row=0;row<14;row++)for(let col=0;col<13;col++){
    const z=-.68+row*.076, phi=-1.35+col*.225, taper=Math.sqrt(Math.max(.04,1-((z+.16)/.63)**2));
    transform.position.set(Math.sin(phi)*.292*taper,.62+Math.cos(phi)*.324*taper,z);
    transform.rotation.set(0,0,-phi);transform.scale.set(.034,.010,.056);transform.updateMatrix();scales.setMatrixAt(n,transform.matrix);
    scales.setColorAt(n++,new THREE.Color().setHSL(.18+((row+col)%5)*.02,.22,.32+((row*7+col)%4)*.025));
  }
  root.add(scales);
  // Belly scutes follow the raised throat and remain separate from the face.
  for(let i=0;i<9;i++){
    const y=.78+i*.055, z=.40+(i/8)**2*.20;
    const scute=ellipsoid(belly,[0,y,z+.012],[.152-i*.007,.040,.032]);scute.rotation.x=-.16;
  }
  for(let i=0;i<10;i++){
    const z=.22-i*.10,y=.63+Math.sqrt(Math.max(.02,1-((z+.16)/.65)**2))*.31;
    sweep([[0,y,z],[0,y+.11,z-.055],[0,y+.10,z-.105]],[.028,.018,.001],ridge,root,8,8);
  }
  // Ground alignment derived from geometry, never a hard-coded floating offset.
  return finish(root,'reptile',{species:'dragon',legs:4});
}
