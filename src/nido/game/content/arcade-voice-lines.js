// Líneas de voz enumerables de Memoria Mágica y Atrapa y Cuenta.
//
// Estos diez juegos narraban con la voz sintética del sistema porque sus
// runtimes nunca pedían un mp3: llamaban a speak() con la frase suelta y
// audioDirector, al no recibir audioSrc, caía al respaldo del dispositivo. Aquí
// se fija cada frase y se le da una clave estable para que el generador la grabe
// con la misma maestra que el resto del catálogo.
//
// Regla de oro para editar este fichero: el texto forma parte del hash del mp3.
// Cambiar una coma invalida el clip y `npm run check:nido` lo denuncia. Mide
// antes con `npm run audio:nido:plan`.

import {
  CATCH_ROUNDS,
  CATCH_SHAPE_SIDES,
  CATCH_THEMES,
  createCatchRound,
} from "./catch-mission.js";
import { MEMORY_THEMES, MEMORY_ROUNDS, hasIntruderRound } from "./memory-mission.js";

export const ARCADE_AGE_IDS = Object.freeze(["2-3", "4-5", "6"]);

// Las consignas guían el gesto en el orden en que hay que hacerlo —mirar,
// recordar, tocar— porque a estas edades una instrucción que enuncia el
// objetivo sin decir por dónde se empieza deja al niño parado ante el tablero.
const MEMORIA_PASOS = Object.freeze({
  "2-3": "Mira bien dónde está cada dibujo… Ahora toca una carta, y después busca la otra igualita.",
  "4-5": "Primero observa dónde queda cada dibujo. Cuando se den la vuelta, toca una carta y busca su pareja.",
  6: "Fíjate en la posición de cada dibujo antes de que se escondan. Después empareja cada uno con su gemelo, de dos en dos.",
});

const MEMORIA_INTRUSO = Object.freeze({
  "2-3": "¡Ojo! Hoy hay una pareja que no es del cole. A ver si la encuentras.",
  "4-5": "Atención: esta vez se coló una pareja que no pertenece al cole. ¿La notas?",
  6: "Cuidado, hoy hay una pareja intrusa que no es material del cole. Encuéntrala también.",
});

export const memoriaBriefKey = (themeId, ageId, intruder) =>
  `memoria-brief-${themeId}-${ageId}${intruder ? "-intruso" : ""}`;

export const memoriaBriefText = (theme, ageId, intruder) =>
  intruder
    ? `${theme.tagline} ${MEMORIA_PASOS[ageId]} ${MEMORIA_INTRUSO[ageId]}`
    : `${theme.tagline} ${MEMORIA_PASOS[ageId]}`;

export const memoriaCompleteKey = (ageId) => `memoria-complete-${ageId}`;
export const memoriaCompleteText = Object.freeze({
  "2-3": "¡Terminaste la memoria mágica! Qué bien recuerdas.",
  "4-5": "¡Memoria mágica completada! Qué buena memoria tienes.",
  6: "¡Memoria mágica completada! Has recordado cada posición como toda una campeona de la memoria.",
});

export const memoriaIntrusoKey = (ageId) => `memoria-intruso-${ageId}`;
export const memoriaIntrusoText = Object.freeze({
  "2-3": "¡Y también encontraste al intruso!",
  "4-5": "¡Encontraste también al intruso! Qué ojo tan fino.",
  6: "¡Y encontraste al intruso! Nada se te escapa.",
});

// Se dice al voltear la propia pareja intrusa, no al terminar la ronda: por eso
// es distinta de memoriaIntrusoText, que remata el festejo final.
export const memoriaParejaIntrusaKey = (ageId) => `memoria-pareja-intrusa-${ageId}`;
export const memoriaParejaIntrusaText = Object.freeze({
  "2-3": "¡Ese no era del cole, pero lo encontraste igual! ¡Buen ojo!",
  "4-5": "¡Ese no era del cole, pero lo encontraste igual! ¡Qué buen ojo!",
  6: "¡Ese no era material del cole y aun así lo emparejaste! Qué buen ojo tienes.",
});

export const memoriaVistazoKey = (ageId) => `memoria-vistazo-${ageId}`;
export const memoriaVistazoText = Object.freeze({
  "2-3": "Con calma. Aquí tienes otro vistacito.",
  "4-5": "Con calma, aquí tienes un segundo vistazo.",
  6: "Tranquila, te doy un segundo vistazo. Aprovéchalo para fijar las posiciones.",
});

// La pregunta ya no nombra las dos figuras: decirlas obligaba a construir el
// texto al vuelo, y un texto que cambia no puede tener un mp3 grabado. Están
// dibujadas en pantalla, así que señalarlas basta.
export const memoriaBonusKey = (ageId) => `memoria-bonus-${ageId}`;
export const memoriaBonusText = Object.freeze({
  "2-3": "Antes de seguir, una preguntita: mira estas dos figuras… ¿cuál tiene más lados? Tócala.",
  "4-5": "Antes de seguir, una pregunta extra: mira bien estas dos figuras y toca la que tenga más lados.",
  6: "Antes de seguir, un reto extra: cuenta los lados de cada figura y toca la que tenga más.",
});

export const memoriaBonusBienKey = (ageId) => `memoria-bonus-bien-${ageId}`;
export const memoriaBonusBienText = Object.freeze({
  "2-3": "¡Sí! Esa tiene más lados.",
  "4-5": "¡Exacto! Esa figura tiene más lados.",
  6: "¡Exacto! Contaste bien: esa figura tiene más lados.",
});

export const memoriaBonusCasiKey = (ageId) => `memoria-bonus-casi-${ageId}`;
export const memoriaBonusCasiText = Object.freeze({
  "2-3": "Casi. Cuenta otra vez los lados de cada una. ¡La próxima la encuentras!",
  "4-5": "Casi. Vuelve a contar los lados de cada figura. ¡La próxima la encuentras!",
  6: "Casi. Cuenta de nuevo los lados de una y de otra, sin prisa. ¡La próxima la encuentras!",
});

export const atrapaCompleteKey = (ageId) => `atrapa-complete-${ageId}`;
export const atrapaCompleteText = Object.freeze({
  "2-3": "¡Terminaste de atrapar! Qué buena puntería.",
  "4-5": "¡Atrapa y cuenta completado! Qué buena puntería.",
  6: "¡Atrapa y cuenta completado! Has contado y atrapado sin perder la cuenta.",
});

export const atrapaCambioKey = (ageId) => `atrapa-cambio-${ageId}`;
export const atrapaCambioText = Object.freeze({
  "2-3": "¡Cambio! Ahora atrapa el dibujo nuevo.",
  "4-5": "¡Cambio de objetivo! Ahora busca este otro dibujo.",
  6: "¡Cambio de objetivo! Mira el dibujo nuevo y atrapa sólo ése.",
});

// La consigna de ronda de Atrapa depende únicamente de cuántas piezas hay que
// recoger, así que la clave se indexa por ese número y las cinco salas comparten
// grabación.
export const atrapaBriefKey = (ageId, count) => `atrapa-brief-${ageId}-${count}`;

// Las tres variantes de ronda se dicen como una segunda locución encadenada al
// enunciado, no pegadas a él. Concatenarlas creaba una frase distinta por cada
// combinación, y ninguna tenía mp3: la ronda entera caía a la voz del sistema.
export const atrapaLadosKey = (ageId, sides) => `atrapa-lados-${ageId}-${sides}`;
// El círculo vale 0 en CATCH_SHAPE_SIDES, así que la frase genérica pedía
// «figuras con 0 lados»: una figura redonda no tiene cero lados, no tiene
// lados rectos. Se enuncia por lo que el niño ve.
export const atrapaLadosText = (sides) =>
  sides === 0
    ? "Esta vez busca las figuras redondas, las que no tienen ninguna esquina."
    : `Esta vez busca figuras con ${sides} lados: pueden ser distintas, pero todas cuentan.`;

export const atrapaDobleKey = (ageId) => `atrapa-doble-${ageId}`;
export const atrapaDobleText = Object.freeze({
  "2-3": "Y ojo: atrapar el segundo dibujo vale doble.",
  "4-5": "Y ojo: atrapar el segundo dibujo vale doble.",
  6: "Y atención: atrapar el segundo dibujo vale el doble de puntos.",
});

export const atrapaAvisoKey = (ageId) => `atrapa-aviso-${ageId}`;
export const atrapaAvisoText = Object.freeze({
  "2-3": "En esta ronda el dibujo podría cambiar a la mitad. ¡Yo te aviso!",
  "4-5": "En esta ronda el objetivo podría cambiar a la mitad, ¡te avisaré!",
  6: "En esta ronda el objetivo puede cambiar a mitad de camino. Estate atenta, que te aviso.",
});

/**
 * Todas las locuciones grabables de la sala de juegos, con su clave estable.
 * El generador la recorre igual que a `enumerateForestVoiceLines`.
 *
 * @returns {Array<{key: string, ageId: string, text: string}>}
 */
export function enumerateArcadeVoiceLines() {
  const lines = [];
  const seen = new Set();
  const push = (key, ageId, text) => {
    if (seen.has(key)) return;
    seen.add(key);
    lines.push({ key, ageId, text });
  };

  for (const ageId of ARCADE_AGE_IDS) {
    for (const theme of MEMORY_THEMES) {
      // Se recorre el espacio real de rondas en vez de suponer qué temas tienen
      // ronda intrusa: si mañana otro tema la activa, su clip aparece solo.
      const variantes = new Set([false]);
      for (let round = 0; round < MEMORY_ROUNDS; round += 1) {
        if (hasIntruderRound(theme.id, round)) variantes.add(true);
      }
      for (const intruder of variantes) {
        push(
          memoriaBriefKey(theme.id, ageId, intruder),
          ageId,
          memoriaBriefText(theme, ageId, intruder),
        );
      }
    }

    push(memoriaCompleteKey(ageId), ageId, memoriaCompleteText[ageId]);
    push(memoriaIntrusoKey(ageId), ageId, memoriaIntrusoText[ageId]);
    push(
      memoriaParejaIntrusaKey(ageId),
      ageId,
      memoriaParejaIntrusaText[ageId],
    );
    push(memoriaVistazoKey(ageId), ageId, memoriaVistazoText[ageId]);
    push(memoriaBonusKey(ageId), ageId, memoriaBonusText[ageId]);
    push(memoriaBonusBienKey(ageId), ageId, memoriaBonusBienText[ageId]);
    push(memoriaBonusCasiKey(ageId), ageId, memoriaBonusCasiText[ageId]);

    push(atrapaCompleteKey(ageId), ageId, atrapaCompleteText[ageId]);
    push(atrapaCambioKey(ageId), ageId, atrapaCambioText[ageId]);
    push(atrapaDobleKey(ageId), ageId, atrapaDobleText[ageId]);
    push(atrapaAvisoKey(ageId), ageId, atrapaAvisoText[ageId]);

    for (const sides of new Set(Object.values(CATCH_SHAPE_SIDES))) {
      push(atrapaLadosKey(ageId, sides), ageId, atrapaLadosText(sides));
    }

    for (const theme of CATCH_THEMES) {
      for (let round = 0; round < CATCH_ROUNDS; round += 1) {
        const built = createCatchRound({
          themeId: theme.id,
          ageId,
          roundIndex: round,
        });
        push(atrapaBriefKey(ageId, built.count), ageId, built.spokenText);
      }
    }
  }

  return lines;
}
