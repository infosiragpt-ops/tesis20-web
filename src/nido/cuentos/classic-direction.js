import { wordKey } from './cuentos-voice-plan.js';

// Direction is separate from the licensed text: no rewriting or abridging.
// Each edition has a cast and its own stage objects. Mentioned actors take
// precedence; pronoun-only passages keep the previous scene's participants.
const actor = (id, words) => ({ id, words: words.split(' ') });
const prince = actor('principe', 'príncipe'), princess = actor('princesa', 'princesa joven');
const queen = actor('reina', 'reina madre'), king = actor('rey', 'rey monarca');
const witch = actor('bruja', 'bruja hechicera encantadora');
const child = actor('nino-clasico', 'niño hijo pequeño niños');
const mother = actor('campesina', 'madre mujer esposa magda');
const father = actor('campesino', 'padre campesino hombre federico');
const p = (cast, props, sound = 'viento-suave') => ({ cast, props, sound });

export const CLASSIC_DIRECTION = {
  rapunzel: p([actor('rapunzel','rapunzel muchacha niña'), prince, witch, father, mother], ['torre','arbol'], 'pajaros'),
  alibaba: p([actor('alibaba','babá alí'), actor('campesino','kasim hermano ladrones capitán'), actor('campesina','morgiana esclava mujer')], ['tesoro','cactus'], 'viento-arena'),
  bambi: p([actor('bambi','bambi cervatillo ciervo'), actor('liebre','tambor conejo'), actor('buho','búho'), actor('cierva','madre mamá')], ['arbol','flores'], 'pajaros'),
  pinocho: p([actor('pinocho','pinocho muñeco'), actor('zapatero','geppetto carpintero'), actor('hada','hada hadas'), actor('ballena','ballena'), actor('zorro','zorro')], ['taller','casa'], 'martillo'),
  'gato-botas': p([actor('gato-botas','gato'), actor('campesino','amo marqués molinero'), king, princess, actor('gigante','ogro')], ['castillo','canasta'], 'pasos-suaves'),
  'gigante-egoista': p([actor('gigante','gigante'), child], ['arbol','ramo'], 'pajaros'),
  'patito-feo': p([actor('patito','patito pato patos pata madre'), actor('cisne','cisne cisnes'), actor('gato','gato'), actor('gallina','gallina'), actor('campesina','mujer vieja anciana')], ['arbol','flores'], 'arroyo'),
  'liebre-tortuga': p([actor('liebre','liebre'), actor('tortuga','tortuga')], ['arbol','ramo'], 'pasos-pasto'),
  gulliver: p([actor('gulliver','gulliver'), king, actor('soldadito','soldado soldados hombres')], ['barco','castillo'], 'olas'),
  'bella-bestia': p([actor('bella','bella'), actor('bestia','bestia'), father, prince], ['rosa-encantada','castillo'], 'viento-suave'),
  soldadito: p([actor('soldadito','soldadito soldado'), actor('bailarina','bailarina'), actor('raton','rata ratón'), actor('pez','pez')], ['barco','casa'], 'pasos-suaves'),
  'guillermo-tell': p([actor('guillermo','guillermo tell'), child, actor('soldadito','gessler gobernador guardias')], ['manzana','arbol'], 'viento-suave'),
  'princesa-guisante': p([prince, princess, queen, king], ['castillo','cama-guisante'], 'pasos-suaves'),
  cenicienta: p([actor('cenicienta','cenicienta'), actor('hada','hada hadas madrina'), prince, actor('reina','madrastra hermanas')], ['zapatos','castillo'], 'luces-magicas'),
  blancanieves: p([actor('blancanieves','blancanieves'), queen, actor('duende','enanitos enanos enano'), prince, actor('cazador','cazador')], ['manzana','casa'], 'pajaros'),
  'barba-azul': p([actor('barba-azul','azul barba'), actor('campesina','esposa mujer ana hermana'), actor('soldadito','hermanos hermano')], ['castillo','tesoro'], 'pasos-suaves'),
  'bella-durmiente': p([princess, actor('hada','hada hadas hada'), prince, queen, king], ['castillo','cama-guisante'], 'luces-magicas'),
  aladino: p([actor('aladino','aladino'), actor('genio','genio'), princess, witch, mother], ['lampara-magica','tesoro'], 'viento-arena'),
  bremen: p([actor('burro','burro asno'), actor('perro','perro'), actor('gato','gato'), actor('gallo','gallo')], ['casa','arbol'], 'pasos-bosque'),
  minotauro: p([actor('teseo','teseo'), actor('minotauro','minotauro monstruo'), actor('princesa','ariadna'), king], ['laberinto','barco'], 'pasos-suaves'),
  'cigarra-hormiga': p([actor('cigarra','cigarra'), actor('hormiga','hormiga hormigas')], ['arbol','casa'], 'pajaros'),
  'bella-princesa': p([princess, prince, king, witch], ['castillo','ramo'], 'pajaros'),
  sirenita: p([actor('sirena','sirenita sirena'), prince, witch, king, princess], ['caracola','barco'], 'olas'),
  'leon-raton': p([actor('leon','león'), actor('raton','ratón ratoncillo')], ['arbol'], 'pasos-pasto'),
  'zapatero-magico': p([actor('zapatero','zapatero'), child, mother, actor('duende','duende duendes')], ['zapatos','taller'], 'martillo'),
  heidi: p([actor('heidi','heidi niña'), actor('zapatero','abuelo'), actor('campesina','deta tía'), actor('pastor','pedro'), actor('cabra','cabra cabras')], ['casa','arbol'], 'viento-suave'),
  'tres-deseos': p([actor('campesino','federico marido hombre'), actor('campesina','magda mujer esposa madre'), actor('hada','hada hadas')], ['casa','olla'], 'pasos-suaves'),
  'navidad-papa-noel': p([actor('papa-noel','noel santa'), child, actor('duende','duendes duende')], ['arbol','tesoro'], 'chispas'),
  'duendes-zapatero': p([actor('zapatero','zapatero'), actor('duende','duendes duendecillos hombrecillos pequeños'), mother], ['zapatos','taller'], 'martillo'),
  'viene-lobo': p([actor('pastor','pastor pastorcillo muchacho'), actor('lobo','lobo'), actor('oveja','ovejas oveja'), father], ['arbol'], 'pasos-pasto'),
  'paloma-hormiga': p([actor('paloma','paloma'), actor('hormiga','hormiga'), actor('cazador','cazador')], ['arbol'], 'arroyo'),
  'perla-dragon': p([actor('dragon','dragón'), actor('principe','príncipe príncipes hijo'), actor('rey','emperador')], ['perla'], 'viento-suave'),
  habichuelas: p([actor('nino-clasico','periquín juan niño'), mother, actor('vaca','vaca'), actor('gigante','gigante')], ['habichuela','casa'], 'pajaros'),
};

const verbs = [
  [/^(corr|huy|huí|escap)/, 'run'], [/^(camin|anduv|lleg|entr|salió|march)/, 'walk'],
  [/^(vol(?:ar|ando|aba[ns]?|aron|ó|áis|aremos|arán|aría[ns]?)|vuel(?:a[ns]?|o|en))$/, 'fly'],
  [/^(nad(?:ar|ando|aba[ns]?|aron|ó|o|as?|amos|áis|an|aremos|arán)|sumerg(?:irse|ió|ía[ns]?|ieron))$/, 'swim'], [/^(salt|brinc|levant)/, 'jump'],
  [/^(durm|dorm|ronc)/, 'sleep'], [/^(tembl|tirita|llor|solloz)/, 'shiver'],
  [/^(cant)/, 'sing'], [/^(bail|danz)/, 'dance'], [/^(mir|observ|contempl|leyó|leí)/, 'look'],
  [/^(escuch|oyó)/, 'listen'], [/^(pens|pregunt|malhumor|refunfuñ)/, 'think'], [/^(salud)/, 'wave'],
  [/^(trabaj(?:ar|ando|aba[ns]?|ó|aron|a[ns]?)|cos(?:er|iendo|ía[ns]?|ió|ieron|e[ns]?)|constru(?:ir|yendo|ía[ns]?|yó|yeron|ye[ns]?)|remend(?:ar|ando|aba[ns]?|ó|aron)|tiraron)$/, 'build'],
  [/^(abraz)/, 'hug'],
  [/^(sonri|rió|alegr|exclam|grit|rieron|feliz|felices)/, 'cheer'],
];
const moods = [
  [/^(hola|adiós|adios)$/, 'wave'],
  [/^(gracias|perdón|perdon)$/, 'nod'],
  [/^(miedo|temor|asustó|asustado|asustada)$/, 'shiver'],
  [/^(cielo|estrellas|luna|sol)$/, 'look'],
  [/^(silencio|escuchó|oyeron)$/, 'listen'],
  [/^(amor|cariño|beso)$/, 'hug'],
  [/^(contento|contenta|alegría)$/, 'cheer'],
];
const travelers = new Set(['walk','run','fly','swim','jump']);

// This ten-page edition has scene changes, reported speech, and a stolen
// object. A mere mention is not proof that an actor/object is on the stage.
const DRAGON_SCENES = [
  { cast:['dragon'], props:['perla'], set:'kinabalu', light:'day', acts:{dragon:'look'} },
  { cast:['rey','principe'], props:['tesoro'], set:'palace', light:'day', acts:{rey:'nod',principe:'listen'} },
  { cast:['principe','dragon'], props:['barco','perla'], set:'kinabalu', light:'day', acts:{principe:'think',dragon:'look'} },
  { cast:['principe'], props:['cometa','farol'], set:'kinabalu', light:'dusk', acts:{principe:'build'} },
  { cast:['dragon','principe'], props:['perla','farol'], set:'dragon-cave', light:'night', acts:{dragon:'sleep',principe:'look'} },
  { cast:['principe'], props:['barco','perla'], set:'ocean-day', light:'night', acts:{principe:'look'} },
  { cast:['dragon'], props:['farol'], set:'kinabalu', light:'dawn', acts:{dragon:'look'} },
  { cast:['dragon','principe'], props:['barco'], set:'ocean-day', light:'day', acts:{dragon:'swim',principe:'listen'} },
  { cast:['dragon'], props:['barco'], set:'ocean-day', light:'day', acts:{dragon:'listen'} },
  { cast:['rey'], props:['perla','tesoro'], set:'palace', light:'day', acts:{rey:'look'} },
];

// Kitchen comedy of three wishes: arrival, letter, sausages, apology.
const TRES_DESEOS_SCENES = [
  {
    cast:['campesino','campesina'], props:['casa','carta'], light:'night',
    acts:{campesino:'walk',campesina:'look'}, enter:{campesino:'left',campesina:'none'},
    sfx:'noche-grillos',
    cues:{
      federico:{act:{campesino:'walk'},move:{campesino:'right'},hold:2600},
      llegó:{act:{campesino:'walk'},move:{campesino:'right'},hold:2400},
      malhumorado:{act:{campesino:'think'},hold:1600},
      refunfuñando:{act:{campesino:'think'},hold:1600},
      mujer:{act:{campesina:'look'},hold:1400},
      carta:{act:{campesina:'nod'},hold:1500},
      preguntó:{act:{campesino:'think'},hold:1400},
    },
  },
  {
    cast:['campesina','campesino','hada'], props:['carta','casa'], light:'night',
    acts:{campesina:'wave',campesino:'look',hada:'fly'}, enter:{campesina:'none',campesino:'left',hada:'right'},
    sfx:'luces-magicas',
    cues:{
      entra:{act:{campesino:'walk'},move:{campesino:'right'},hold:2200},
      federico:{act:{campesino:'nod'},hold:1200},
      carta:{act:{campesina:'nod'},hold:1400},
      hadas:{act:{hada:'fly'},hold:2400},
      leyó:{act:{campesino:'look'},hold:2200},
    },
  },
  {
    cast:['campesina','campesino'], props:['casa','olla'], light:'day',
    acts:{campesina:'jump',campesino:'listen'},
    cues:{
      salto:{act:{campesina:'jump'},hold:2000},
      mira:{act:{campesina:'look'},hold:1400},
      palacio:{act:{campesina:'raise'},hold:1600},
      cena:{act:{campesino:'think'},hold:1600},
    },
  },
  {
    cast:['campesino','campesina'], props:['olla','casa'], light:'day',
    acts:{campesino:'cheer',campesina:'listen'},
    cues:{
      exclamó:{act:{campesino:'cheer'},hold:1800},
      cena:{act:{campesino:'think'},hold:1600},
      magda:{act:{campesina:'look'},hold:1200},
      ojalá:{act:{campesino:'raise'},hold:2000},
      salchichas:{act:{campesino:'look'},hold:1400},
    },
  },
  {
    cast:['hada','campesino','campesina'], props:['olla','casa'], light:'day',
    acts:{hada:'fly',campesino:'look',campesina:'cheer'}, sfx:'luces-magicas',
    cues:{
      oyó:{act:{campesino:'listen'},hold:1400},
      zumbido:{act:{hada:'fly'},hold:2200},
      alas:{act:{hada:'fly'},hold:1800},
      plop:{act:{hada:'jump'},sfx:'luces-magicas',hold:1600},
      salchichas:{act:{campesino:'look'},hold:1600},
      observó:{act:{campesino:'look'},hold:1600},
      gritando:{act:{campesina:'cheer'},hold:1800},
    },
  },
  {
    cast:['campesina','campesino','hada'], props:['olla','casa'], light:'day',
    acts:{campesina:'raise',campesino:'shiver',hada:'sing'}, sfx:'luces-magicas',
    cues:{
      desperdiciado:{act:{campesina:'cheer'},hold:1600},
      federico:{act:{campesino:'shiver'},hold:1400},
      ojalá:{act:{campesina:'raise'},hold:2000},
      nariz:{act:{campesino:'shiver'},hold:1600},
      cantando:{act:{hada:'sing'},hold:2200},
      clac:{act:{hada:'jump'},sfx:'luces-magicas',hold:1400},
      saltaron:{act:{hada:'jump'},hold:1800},
    },
  },
  {
    cast:['campesino','campesina'], props:['olla','casa'], light:'day',
    acts:{campesino:'shiver',campesina:'build'},
    cues:{
      mirando:{act:{campesino:'look'},hold:1400},
      llorar:{act:{campesino:'shiver'},hold:2200},
      tiraron:{act:{campesino:'build'},hold:1800},
      exclamó:{act:{campesino:'cheer'},hold:1400},
      cuchillo:{act:{campesina:'build'},hold:1600},
      mujer:{act:{campesina:'look'},hold:1200},
      miraron:{act:{campesino:'look'},hold:1400},
    },
  },
  {
    cast:['campesino','campesina'], props:['casa','olla'], light:'day',
    acts:{campesino:'think',campesina:'listen'},
    cues:{
      nariz:{act:{campesino:'shiver'},hold:1600},
      ojalá:{act:{campesino:'think'},hold:2000},
      peleando:{act:{campesina:'shiver'},hold:1600},
    },
  },
  {
    cast:['campesina','campesino','hada'], props:['olla','casa'], light:'day',
    acts:{campesina:'shiver',campesino:'listen',hada:'cheer'}, sfx:'luces-magicas',
    cues:{
      siento:{act:{campesina:'nod'},hold:1400},
      querida:{act:{campesino:'nod'},hold:1400},
      ojalá:{act:{campesino:'think'},hold:1800},
      sollozó:{act:{campesina:'shiver'},hold:1800},
      hadas:{act:{hada:'fly'},hold:2000},
      blip:{act:{hada:'jump'},sfx:'luces-magicas',hold:1400},
      federico:{act:{campesino:'look'},hold:1400},
    },
  },
  {
    cast:['campesino','campesina','hada'], props:['carta','casa'], light:'day',
    acts:{campesino:'dance',campesina:'dance',hada:'fly'}, sfx:'luces-magicas',
    enter:{campesino:'left',campesina:'right',hada:'right'},
    cues:{
      abrazaron:{act:{campesino:'hug',campesina:'hug'},hold:2200},
      rieron:{act:{campesina:'cheer'},hold:1600},
      bailar:{act:{campesino:'dance'},hold:2600},
      cocina:{act:{campesina:'dance'},hold:2000},
      hadas:{act:{hada:'fly'},move:{hada:'right'},hold:2400},
      carta:{act:{hada:'wave'},hold:1600},
    },
  },
];

export function directClassic(item, texts) {
  const direction = CLASSIC_DIRECTION[item.id];
  if (!direction) throw new Error(`Missing direction for ${item.id}`);
  let previous = [direction.cast[0].id];
  const names = Object.fromEntries(direction.cast.map(a => [a.id, [...new Set(a.words)]]));
  const pages = texts.map((x, index) => {
    const words = x.split(/\s+/).map(wordKey).filter(Boolean);
    const found = direction.cast.filter(a => a.words.some(w => words.includes(w))).map(a => a.id);
    let cast = [...new Set(found.length ? found : previous)].slice(0, 3);
    // Fairy-tale comparisons mention a swan long before the transformation.
    // Show both if named, but only switch the protagonist near the ending.
    if (item.id === 'patito-feo' && index > texts.length * .82 && /cisne/i.test(x)) cast = ['cisne', ...cast.filter(id => !['cisne','patito'].includes(id))].slice(0, 3);
    // This edition has a fixed, verified 15-page dramatic sequence. The
    // prince *talks about* princesses before his future bride arrives at p8.
    if (item.id === 'princesa-guisante') cast = [
      ['principe','reina'], ['principe','reina'], ['principe','reina'], ['principe'],
      ['rey','reina'], ['rey','reina'], ['rey'], ['princesa','rey'],
      ['princesa','rey','reina'], ['reina','princesa'], ['reina'], ['princesa','reina'],
      ['princesa','reina','rey'], ['reina','princesa'], ['principe','princesa'],
    ][index];
    const directed = item.id === 'perla-dragon' && texts.length === DRAGON_SCENES.length ? DRAGON_SCENES[index]
      : item.id === 'tres-deseos' && texts.length === TRES_DESEOS_SCENES.length ? TRES_DESEOS_SCENES[index]
      : null;
    if (directed) cast = [...directed.cast];
    previous = cast;
    let props = [...direction.props];
    if (item.id === 'princesa-guisante' && /guisante|colch|cama|dorm|durm|acost|lecho/i.test(x)) props = ['cama-guisante','castillo'];
    if (item.id === 'princesa-guisante' && index < 9) props = index === 3 ? ['barco','castillo'] : ['castillo','farol'];
    if (item.id === 'pinocho' && /mar\b|ballena|agua/i.test(x)) props = ['barco','caracola'];
    if (item.id === 'rapunzel' && /desierto/i.test(x)) props = ['cactus','torre'];
    if (item.id === 'sirenita' && /palacio|salón|castillo/i.test(x)) props = ['castillo','caracola'];
    if (directed) props = [...directed.props];
    const acts = Object.fromEntries(cast.map((id, i) => [id, i ? 'listen' : 'look']));
    const cues = {};
    let subject = cast[0];
    words.forEach(word => {
      const named = direction.cast.find(a => cast.includes(a.id) && a.words.includes(word));
      if (named) { subject = named.id; cues[word] = { act: { [subject]: 'nod' }, hold: 1200 }; }
      const verb = verbs.find(([pattern]) => pattern.test(word));
      if (verb) {
        const act = verb[1];
        cues[word] = { act: { [subject]: act }, hold: act === 'sleep' ? 4200 : act === 'hug' || act === 'dance' ? 2800 : 2400 };
        if (travelers.has(act)) cues[word].move = { [subject]: index % 2 ? 'left' : 'right' };
        if (act === 'build') cues[word].sfx = 'martillo';
        // Sustained acting uses an action actually present in this passage.
        if (!['run', 'jump'].includes(act)) acts[subject] = act;
        return;
      }
      const mood = moods.find(([pattern]) => pattern.test(word));
      if (mood && !cues[word]) {
        cues[word] = { act: { [subject]: mood[1] }, hold: 1800 };
      }
    });
    if (directed) Object.assign(acts, directed.acts);
    if (directed?.cues) Object.assign(cues, directed.cues);
    const light = directed?.light || (/\bnoche\b|oscuridad|anochecer/i.test(x) ? 'night' : item.light || 'day');
    const enter = directed?.enter || Object.fromEntries(cast.map((id, i) => [id, acts[id] === 'sleep' ? 'none' : i % 2 ? 'right' : 'left']));
    return { t: index === 0 ? item.title : `Parte ${index + 1}`, x, light, cast, props, acts, cues,
      ...(directed?.set ? {set:directed.set} : {}),
      enter,
      sfx: [directed?.sfx || (light === 'night' && direction.sound === 'pajaros' ? 'noche-grillos' : direction.sound)],
    };
  });
  // Only register spoken names that actually occur and have a scene figure.
  const spoken = new Set([item.title, ...texts].join(' ').split(/\s+/).map(wordKey));
  const used = new Set(pages.flatMap(page => page.cast));
  return { pages, names: Object.fromEntries(Object.entries(names)
    .map(([id, words]) => [id, words.filter(w => spoken.has(w))])
    .filter(([id, words]) => used.has(id) && words.length)) };
}
