// Species-specific anatomy, sculpted locally for Nido. No remote assets.
import * as THREE from 'three';
import { mat, part, ell, tube, eyePair, finish, details } from './sculpting.js';

const QUADS = {
  bambi: ['Bambi', 'deer', '#b98152'], cierva: ['Cierva', 'doe', '#9e7955'], cabra: ['Cabra', 'goat', '#cbc0a3'], liebre: ['Liebre', 'hare', '#a8947c'],
  gato: ['Gato', 'cat', '#958574'], leon: ['León', 'lion', '#bd965d'],
  raton: ['Ratón', 'mouse', '#9e9589'], burro: ['Burro', 'donkey', '#8e8982'],
  perro: ['Perro', 'dog', '#a7764c'], lobo: ['Lobo', 'wolf', '#6e7780'],
  zorro: ['Zorro', 'fox', '#b16e3d'], caballo: ['Caballo', 'horse', '#966b4b'],
  vaca: ['Vaca', 'cow', '#e2d9c8'], oveja: ['Oveja', 'sheep', '#e4dcc8'],
  vicuna: ['Vicuña', 'vicuna', '#b39776'], oso: ['Oso', 'bear', '#897052'],
};

export function quadruped(kind, color, { bonnet = false } = {}) {
  const root = new THREE.Group(), skin = mat(color, { rough: .85, surface: kind === 'sheep' ? 'wool' : 'fur' });
  const cream = mat('#e3d6ba', { rough: .92, surface: 'fur' }), dark = mat('#3e3b34', { rough: .74 });
  const pink = mat('#b78b7b', { rough: .9 }), hoofed = ['deer','doe','goat','donkey','horse','cow','vicuna','sheep'].includes(kind);
  const short = ['mouse','hare','bear'].includes(kind), crouched=['mouse','hare'].includes(kind);
  const longNeck = ['vicuna','horse','deer','doe'].includes(kind), slim=['deer','doe','vicuna'].includes(kind);
  const bodyY=crouched?.28:slim?.46:.39, headY=crouched?.50:longNeck?.79:.66;
  ell(root, skin, [0,bodyY,-.03], [slim?.125:.17,crouched?.15:slim?.15:.185,crouched?.23:.31]);
  ell(root, cream, [0,bodyY-.06,.025], [slim?.095:.13,.105,crouched?.18:.235]);
  tube(root, skin, [[0,bodyY+.04,.14],[0,(bodyY+headY)/2,.22],[0,headY-.03,.29]], [slim?.095:.12,.085,.077], { sides: 12, flatten: .9 });
  const head = part(root, 'head', 1, [0,headY,.29]);
  ell(head, skin, [0,0,0], [kind==='bear'?.135:.113,.13,.128]);
  const snout = ['wolf','fox','horse','donkey'].includes(kind) ? .15 : kind === 'mouse' ? .11 : .095;
  ell(head, ['deer','horse','vicuna'].includes(kind)?skin:cream, [0,-.048,.105], [.064,.047,snout]);
  ell(head, dark, [0,-.025,.105+snout*.88], [kind==='cow'?.057:.027,.018,.026]);
  eyePair(head, {spread:slim?.086:.073,y:.034,z:slim?.079:.096,radius:kind==='mouse'?.026:kind==='bear'?.024:slim?.02:.023,iris:kind==='wolf'?'#8a6a38':'#6d4d2c'});
  for (const s of [-1,1]) {
    const brow = ell(head, skin, [s*.073,.061,.095],[.037,.012,.027]); brow.rotation.z=s*.08;
    const ear = part(head,'ear',s,[s*.084,.086,-.026]);
    const long = ['hare','donkey'].includes(kind), pointed = ['wolf','fox','cat','deer','doe','goat'].includes(kind);
    if (pointed) {
      tube(ear,skin,[[0,0,0],[s*.028,.09,-.01],[s*.018,.147,-.02]],[.055,.035,.001],{segments:10,sides:10,flatten:.43});
      ell(ear,pink,[s*.016,.066,.02],[.025,.051,.008],[0,0,-s*.17]);
    } else {
      ell(ear,skin,[s*.019,long?.09:.019,0],[long?.039:.044,long?.12:.045,.022],[0,0,-s*.17]);
      ell(ear,pink,[s*.019,long?.095:.020,.019],[long?.023:.028,long?.083:.027,.007],[0,0,-s*.17]);
    }
    if (kind==='cow') tube(head,cream,[[s*.10,.085,-.025],[s*.155,.155,-.035],[s*.14,.20,-.02]],[.027,.016,.001],{segments:10});
    if (kind==='goat') tube(head,dark,[[s*.06,.10,-.015],[s*.07,.25,-.09],[s*.06,.29,-.20]],[.028,.020,.001],{segments:14});
    for (const front of [true,false]) {
      const leg=part(root,'leg',front?s:-s,[s*(slim?.09:.12),bodyY+.01,front?.205:crouched?-.17:-.23]);
      if (kind==='bear' && front) leg.userData.arm=s;
      const length=bodyY-.06;
      if(crouched&&!front)ell(leg,skin,[s*.013,-.044,-.003],[.084,.13,.115]);
      tube(leg,skin,[[0,0,0],[s*.012,-length*.38,front?.005:-.04],[s*.008,-length*.76,.025],[s*.008,-length,.018]],[slim?.044:short?.075:.063,slim?.030:.048,slim?.020:.027,.022],{segments:14,sides:10});
      ell(leg,hoofed?dark:skin,[s*.008,-length-.007,crouched&&!front?.08:.041],[slim?.028:.037,.031,crouched&&!front?.10:.068]);
      if (!hoofed) for(let t=-1;t<=1;t++) ell(leg,cream,[t*.022,-length-.021,.094],[.005,.008,.017],[0,0,0],8);
    }
  }
  const tail=part(root,'tail',1,[0,bodyY+.05,crouched?-.23:-.30]);
  const thick=['fox','wolf','cat'].includes(kind), tiny=['hare','deer','doe','goat','bear','sheep'].includes(kind);
  if(tiny)ell(tail,kind==='hare'?cream:skin,[0,0,-.028],[kind==='hare'?.052:.025,.037,.053]);
  else tube(tail,skin,[[0,0,0],[.06,-.055,-.10],[.16,-.075,-.22],[.23,.03,-.27]],[thick?.065:.028,thick?.06:.025,.026,.003],{segments:18,sides:10});
  if (kind==='fox') ell(tail,cream,[.19,-.02,-.255],[.037,.035,.065],[0,-.4,0]);
  if (kind==='lion') {
    const mane = mat('#7f5939',{rough:.92,surface:'fur'}), tufts=[];
    for(let i=0;i<38;i++) {const a=i*Math.PI*2/38;tufts.push({p:[Math.sin(a)*.138,Math.cos(a)*.16,-.048],s:[.048,.074,.078],r:[0,0,-a],c:i%3?'#8e6740':'#745138'});}
    details(head,mane,tufts); ell(tail,mane,[.23,.018,-.26],[.04,.048,.04]);
  }
  if(kind==='deer'||kind==='doe') details(root,cream,Array.from({length:28},(_,i)=>{const side=i%2?-1:1;return {p:[side*(.119-Math.abs((i%11)-5)*.004),.48+Math.sin(i*2.2)*.05,-.24+(i%11)*.041],s:[.008,.01,.012]};}));
  if(kind==='fox') {
    ell(head,cream,[0,.018,.02],[.055,.04,.05]);
    for(const s of [-1,1]) ell(head,cream,[s*.084,.12,-.01],[.02,.03,.008]);
  }
  if(kind==='cat') for(const s of [-1,1]) for(let i=0;i<3;i++) tube(head,cream,[[s*.04,-.01+i*.012,.16],[s*.12,-.03+i*.02,.15]],[.0016,.0005],{segments:6,sides:5});
  if(kind==='goat') tube(head,cream,[[0,-.085,.08],[0,-.18,.065]],[.037,.002],{segments:10});
  if(kind==='cow') details(root,dark,[{p:[-.14,.46,-.10],s:[.026,.075,.115]},{p:[.14,.48,.04],s:[.03,.08,.085]},{p:[.03,.56,-.13],s:[.077,.022,.084]}]);
  if(kind==='sheep') {
    const wool=[]; for(let i=0;i<55;i++){const a=i*2.399,z=-.27+(i%11)*.049;wool.push({p:[Math.sin(a)*.155,.4+Math.cos(a)*.167,z],s:[.047,.040,.047]});} details(root,skin,wool);
    const scarf=mat('#9e4b41',{surface:'cloth'}); tube(root,scarf,[[-.10,.55,.23],[0,.51,.36],[.10,.55,.23]],[.018,.02,.018],{segments:14});
  }
  if(['horse','donkey','vicuna'].includes(kind)) details(root,dark,Array.from({length:12},(_,i)=>({p:[0,.60-i*.007,.14-i*.029],s:[.025,.071,.025],r:[-.35,0,0]})));
  if(bonnet) {const cloth=mat('#eee5d2',{surface:'cloth'});ell(head,cloth,[0,.11,-.035],[.14,.052,.13]);tube(head,cloth,[[0,.14,-.05],[.10,.22,-.075],[.18,.17,-.045]],[.10,.056,.012]);ell(head,cloth,[.18,.16,-.045],[.036,.038,.034]);}
  return finish(root,'quadruped',{species:kind,legs:4});
}

function bird(kind,color) {
  const root=new THREE.Group(), feathers=mat(color,{surface:'feathers',rough:.86}), ivory=mat('#e8dfcd',{surface:'feathers'}), bill=mat(kind==='owl'?'#716148':'#c49753',{rough:.8});
  const long=kind==='swan', owl=kind==='owl', tiny=kind==='hummingbird';
  ell(root,feathers,[0,.25,-.03],[.135,.175,.21]);
  ell(root,ivory,[0,.27,.081],[.093,.122,.121]);
  if(long) tube(root,feathers,[[0,.33,.10],[0,.48,.15],[0,.57,.105],[0,.65,.16]],[.079,.050,.040,.055],{segments:24,sides:12});
  const head=part(root,'head',1,[0,long?.665:owl?.49:.43,.115]);
  ell(head,feathers,[0,0,0],[owl?.135:.087,owl?.13:.091,.097]);
  if(owl) for(const s of [-1,1]) ell(head,ivory,[s*.065,-.005,.071],[.068,.08,.043]);
  eyePair(head,{spread:owl?.066:.054,y:.026,z:owl?.108:.076,radius:owl?.03:.021,iris:owl?'#b78b3c':'#55442b'});
  tube(head,bill,[[0,-.022,.07],[0,-.035,.15],[0,-.052,tiny?.30:kind==='pelican'?.31:.20]],[owl?.023:.032,.021,.001],{segments:12,sides:8,flatten:kind==='duck'?.45:.8});
  if(kind==='pelican') ell(head,ivory,[0,-.066,.17],[.029,.055,.124],[.25,0,0]);
  for(const s of [-1,1]) {
    const wing=part(root,'wing',s,[s*.106,.32,-.04]);
    ell(wing,feathers,[s*.033,-.047,-.009],[.059,.121,.164],[0,0,s*.13]);
    const rows=[];for(let i=0;i<8;i++)rows.push({p:[s*(.04+(i%2)*.012),-.012-i*.016,-.09+i*.017],s:[.022,.065,.059],r:[-.45,0,s*.13]}); details(wing,feathers,rows);
    const leg=part(root,'leg',s,[s*.058,.12,-.005]);
    tube(leg,bill,[[0,0,0],[0,-.06,.01],[0,-.097,.01]],[.016,.012,.010]);
    for(let i=-1;i<=1;i++)tube(leg,bill,[[0,-.095,.01],[i*.024,-.102,.082]],[.010,.003],{segments:6,sides:6});
  }
  const tail=part(root,'tail',1,[0,.24,-.19]);
  details(tail,feathers,Array.from({length:7},(_,i)=>({p:[(i-3)*.023,kind==='rooster'?.10:0,-.10],s:[.025,kind==='rooster'?.18:.025,.14],r:[kind==='rooster'?-.9:-.18,(i-3)*.11,0]})));
  if(kind==='rooster'||kind==='hen'){const red=mat('#a23e36',{rough:.78});details(head,red,Array.from({length:5},(_,i)=>({p:[0,.08+Math.sin(i*.75)*.035,-.07+i*.038],s:[.026,kind==='hen'?.024:.043,.031]})));ell(head,red,[0,-.055,.07],[.025,kind==='hen'?.029:.052,.02]);}
  if(kind==='woodpecker') ell(head,mat('#aa4e42'),[0,.076,-.015],[.051,.038,.071]);
  return finish(root,'bird',{species:kind,legs:2,wings:2});
}

function insect(kind,color) {
  const root=new THREE.Group(), shell=mat(color,{rough:.58,clearcoat:.14}), dark=mat('#4a4233',{rough:.7});
  ell(root,shell,[0,.16,-.19],[.10,.083,.135]); ell(root,shell,[0,.18,-.017],[.075,.07,.095]);
  const head=part(root,'head',1,[0,.19,.13]);ell(head,shell,[0,0,0],[.077,.077,.074]);
  eyePair(head,{spread:.05,y:.02,z:.048,radius:.024,iris:'#6a5330'});
  for(const s of [-1,1]) {
    tube(head,dark,[[s*.027,.057,.015],[s*.06,.135,.045],[s*.095,.16,.09]],[.007,.006,.003],{segments:12,sides:6});
    for(let n=0;n<3;n++) {
      const leg=part(root,'leg',n%2?s:-s,[s*.056,.17,.064-n*.09]);
      tube(leg,dark,[[0,0,0],[s*.075,.025,.02],[s*.15,-.13,.033]],[.012,.009,.004],{segments:10,sides:6});
    }
    if(kind==='cicada'||kind==='butterfly') {
      const wing=part(root,kind==='butterfly'?'flutter':'wing',s,[s*.054,.225,-.04]);
      const film=mat(kind==='butterfly'?'#ba854b':'#c0cba9',{rough:.58,opacity:.84,clearcoat:.2});
      ell(wing,film,[s*.14,.035,-.12],[.17,.011,.24],[0,s*.30,0]);
      for(let i=0;i<5;i++)tube(wing,dark,[[0,0,0],[s*(.09+i*.023),.038,-.04-i*.063]],[.003,.001],{segments:8,sides:5});
      if(kind==='butterfly')ell(wing,film,[s*.12,.008,.09],[.13,.014,.14]);
    }
  }
  return finish(root,'insect',{species:kind,legs:6,antennae:2});
}

function turtle() {
  const root=new THREE.Group(), skin=mat('#7b9160',{surface:'scales',rough:.86}), shell=mat('#536c46',{surface:'scales',rough:.72}), lines=mat('#bbad79',{rough:.9});
  ell(root,lines,[0,.155,-.045],[.19,.08,.23]);ell(root,shell,[0,.205,-.055],[.195,.155,.235]);
  const scutes=[];for(let i=0;i<19;i++){const a=i*2.399,r=.052*Math.sqrt(i);const x=Math.cos(a)*r*.7,z=Math.sin(a)*r*.83;scutes.push({p:[x,.219+.136*Math.sqrt(Math.max(.05,1-(x/.2)**2-(z/.24)**2)),z-.055],s:[.045,.008,.046],c:i%2?'#87915b':'#69794a'});}details(root,lines,scutes);
  for(const s of [-1,1])for(const front of [true,false]){const leg=part(root,'leg',front?s:-s,[s*.13,.15,front?.09:-.19]);tube(leg,skin,[[0,0,0],[s*.10,-.067,.03],[s*.12,-.092,.084]],[.05,.036,.027]);for(let i=-1;i<=1;i++)tube(leg,lines,[[s*.12+i*.017,-.094,.09],[s*.12+i*.017,-.096,.13]],[.007,.001],{segments:6});}
  tube(root,skin,[[0,.18,.12],[0,.22,.26]],[.066,.061]);
  const head=part(root,'head',1,[0,.24,.29]);ell(head,skin,[0,0,0],[.077,.07,.10]);eyePair(head,{spread:.052,y:.026,z:.062,radius:.02,iris:'#6a5530'});
  const tail=part(root,'tail',1,[0,.13,-.27]);tube(tail,skin,[[0,0,0],[0,-.02,-.09]],[.03,.001]);
  return finish(root,'reptile',{species:'turtle',legs:4});
}

function frog() {
  const root=new THREE.Group(), skin=mat('#739667',{rough:.6,clearcoat:.10,surface:'skin'}), belly=mat('#d1cdb1',{rough:.8});
  ell(root,skin,[0,.19,0],[.15,.13,.16]);ell(root,belly,[0,.14,.075],[.118,.07,.12]);
  const head=part(root,'head',1,[0,.29,.065]);ell(head,skin,[0,0,0],[.156,.081,.117]);
  for(const s of [-1,1]) {ell(head,skin,[s*.094,.063,.04],[.05,.053,.049]);
    for(const back of [true,false]){const leg=part(root,'leg',back?s:-s,[s*(back?.12:.09),.20,back?-.09:.1]);tube(leg,skin,[[0,0,0],[s*(back?.10:.048),back?-.02:-.04,back?-.05:.014],[s*.08,-.14,.075]],[back?.065:.027,.04,.02]);for(let i=-1;i<=1;i++)tube(leg,skin,[[s*.08,-.143,.075],[s*.08+i*.027,-.15,.15]],[.008,.003],{segments:7});}}
  eyePair(head,{spread:.094,y:.068,z:.08,radius:.024,iris:'#ae9c4a'});
  tube(head,mat('#486345'),[[-.11,-.013,.11],[0,-.028,.128],[.11,-.013,.11]],[.003,.004,.003]);
  return finish(root,'amphibian',{legs:4});
}

function seaAnimal(kind,color) {
  const root=new THREE.Group(), skin=mat(color,{rough:.48,clearcoat:.28}), belly=mat('#d5d7c9',{rough:.63});
  if(kind==='fish') {
    ell(root,skin,[0,.19,0],[.078,.145,.235]);
    ell(root,belly,[0,.10,.035],[.060,.055,.155]);
    const head=part(root,'head',1,[0,.21,.16]);
    ell(head,skin,[0,0,0],[.071,.10,.089]);
    eyePair(head,{spread:.055,y:.028,z:.05,radius:.016,iris:'#4a6a5c'});
    const gills=mat('#506d65',{rough:.68});
    for(const s of [-1,1]) {
      tube(head,gills,[[s*.066,.061,-.013],[s*.071,0,.004],[s*.058,-.065,-.016]],[.002,.003,.002],{segments:12,sides:6});
      const fin=part(root,'wing',s,[s*.059,.19,.066]);
      ell(fin,skin,[s*.037,-.025,-.028],[.051,.010,.075],[0,s*.5,-s*.4]);
    }
    const tail=part(root,'tail','y',[0,.19,-.20]);
    tube(tail,skin,[[0,0,0],[0,0,-.09]],[.035,.025],{flatten:.5});
    for(const s of [-1,1])ell(tail,skin,[0,s*.061,-.109],[.014,.083,.074],[s*.35,0,0]);
    ell(root,skin,[0,.32,-.034],[.012,.067,.107],[-.35,0,0]);
    return finish(root,'aquatic',{species:'fish',fins:2});
  }
  ell(root,skin,[0,.21,0],[.15,.155,.30],[-.24,0,0]);ell(root,belly,[0,.145,.03],[.119,.08,.255]);
  const head=part(root,'head',1,[0,.275,.22]);ell(head,skin,[0,0,0],[.145,.125,.16]);
  if(kind==='dolphin') {ell(head,skin,[0,-.027,.16],[.053,.039,.14]);ell(head,belly,[0,-.057,.14],[.05,.014,.13]);}
  eyePair(head,{spread:.098,y:.016,z:.09,radius:.02,iris:'#4a5854'});
  for(const s of [-1,1]) {const fin=part(root,'wing',s,[s*.123,.18,.055]);ell(fin,skin,[s*.095,-.025,-.017],[.13,.027,.068],[.12,s*.4,-s*.25]);}
  const tail=part(root,'tail','x',[0,.145,-.265]);tube(tail,skin,[[0,0,0],[0,.035,-.10],[0,.09,-.22]],[.086,.06,.033]);
  for(const s of [-1,1])ell(tail,skin,[s*.071,.082,-.234],[.098,.018,.065],[0,-s*.35,0]);
  if(kind!=='whale') tube(root,skin,[[0,.30,-.06],[0,.46,-.09],[0,.33,-.17]],[.033,.012,.001],{flatten:.30});
  return finish(root,'aquatic',{species:kind,fins:2});
}

export const SCULPTED_ANIMALS = [
  {id:'gallina',label:'Gallina',build:()=>bird('hen','#9e7750')},
  ...Object.entries(QUADS).map(([id,[label,kind,color]])=>({id,label,build:()=>quadruped(kind,color)})),
  {id:'lobo-cama',label:'Lobo disfrazado',build:()=>quadruped('wolf','#6e7780',{bonnet:true})},
  ...[['patito','Patito','duck','#a59e89'],['cisne','Cisne','swan','#e4e1d3'],['paloma','Paloma','dove','#dddccf'],['gallo','Gallo','rooster','#bd8b56'],['buho','Búho','owl','#8e7657'],['pajarito','Pajarito','bird','#9aa57a'],['picaflor','Picaflor','hummingbird','#578b79'],['pelicano','Pelícano','pelican','#d5d0bd'],['carpintero','Carpintero','woodpecker','#676851']].map(([id,label,kind,color])=>({id,label,build:()=>bird(kind,color)})),
  ...[['hormiga','Hormiga','ant','#915f43'],['cigarra','Cigarra','cicada','#8b9670'],['mariposa','Mariposa','butterfly','#8f704e']].map(([id,label,kind,color])=>({id,label,build:()=>insect(kind,color)})),
  {id:'tortuga',label:'Tortuga',build:turtle},{id:'rana',label:'Rana',build:frog},
  ...[['bufeo','Bufeo rosado','dolphin','#be9291'],['ballena','Ballena','whale','#63818b'],['pez','Pez','fish','#889e92']].map(([id,label,kind,color])=>({id,label,build:()=>seaAnimal(kind,color)})),
];
