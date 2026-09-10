import * as THREE from "three";
import { mat, blob, cyl, cone, fit } from "./_shared.js";

// Personajes originales articulados como figuras de cuento, no recortes planos.
function child({ coat, trousers, girl = false, hat = false, sailor = false }) {
  const g = new THREE.Group();
  const skin = mat("#bc8257", { rough: .62 });
  const hair = mat("#352522", { rough: .66 });
  const fabric = mat(coat, { rough: .84 });
  const pants = mat(trousers, { rough: .8 });
  const gold = mat("#f1cc70", { rough: .5 });
  const boots = mat("#413435", { rough: .55 });
  [-1, 1].forEach(side => {
    g.add(cyl(.017, .018, .081, pants, { x: side * .023, y: .056 }));
    const foot = blob(.021, boots, { x: side * .023, y: .016, z: .014 }); foot.scale.set(.9, .65, 1.35); g.add(foot);
  });
  const torso = girl ? cone(.054, .104, fabric, { y: .133 }) : cyl(.035, .043, .096, fabric, { y: .133 }); g.add(torso);
  g.add(cyl(.014, .016, .026, skin, { y: .193 }));
  const head = blob(.052, skin, { y: .247, z: .002 }); head.scale.set(.94, 1.05, .93); g.add(head);
  const cap = blob(.053, hair, { y: .262, z: -.013 }); cap.scale.set(1, .77, .85); g.add(cap);
  for (let i=0;i<5;i++) g.add(blob(.019, hair, { x: (i-2)*.017, y: .276 + Math.sin(i)*.004, z: .018 }));
  [-1, 1].forEach(side => {
    g.add(blob(.012, skin, { x: side * .048, y: .241 }));
    const arm = new THREE.Group(); arm.position.set(side * .043, .17, 0); arm.rotation.z = side * .19; arm.userData.sway = side;
    arm.add(cyl(.014, .012, .058, fabric, { y: -.017 })); arm.add(blob(.014, skin, { y: -.052 })); g.add(arm);
    g.add(blob(.012, mat("#fff8e9", { rough: .25 }), { x: side * .02, y: .252, z: .042 }));
    g.add(blob(.007, hair, { x: side * .019, y: .252, z: .051 }));
    g.add(blob(.0025, mat("#fffefa"), { x: side * .017, y: .255, z: .057 }));
    const cheek = blob(.009, mat("#d98c70"), { x: side * .032, y: .234, z: .035 }); cheek.scale.z=.2; g.add(cheek);
    if (girl) for(let n=0;n<4;n++) g.add(blob(.016 - n*.0015, hair, { x:side*(.045+n*.002),y:.227-n*.02,z:-.008 }));
    if (girl) g.add(blob(.013, gold, { x:side*.049,y:.151,z:.004 }));
  });
  g.add(blob(.01, skin, { y: .237, z: .051 }));
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.011, .0018, 6, 16, Math.PI), hair);
  smile.rotation.z = Math.PI; smile.position.set(0, .227, .045); g.add(smile);
  for(let n=0;n<3;n++) g.add(blob(.0035,gold,{y:.157-n*.018,z:.04}));
  if(hat||sailor){
    const hatMat = mat(sailor?"#314868":"#c54846",{rough:.8});
    g.add(cyl(.044,.057,.039,hatMat,{y:.304}));
    g.add(cyl(.06,.06,.012,gold,{y:.285}));
    if(!sailor)g.add(blob(.016,gold,{y:.333}));
  }
  return fit(g, .32);
}

export const nina = { id: "nina", label: "Sami", build: () => child({ coat: "#c75642", trousers: "#486588", girl: true }) };
export const nino = { id: "nino", label: "Tico", build: () => child({ coat: "#e7b443", trousers: "#344e6f", hat: true }) };
export const nina2 = { id: "nina2", label: "Ana", build: () => child({ coat: "#f3e5c7", trousers: "#427b83", girl: true }) };
export const maquinista = { id: "maquinista", label: "Maquinista", build: () => child({ coat: "#45658b", trousers: "#344458", sailor: true }) };
