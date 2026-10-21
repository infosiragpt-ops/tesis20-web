import extras from './collection/extras.json' with { type: 'json' };
import { wordKey } from './cuentos-voice-plan.js';

// Quiz y souvenirs de los clásicos (collection/extras.json). Cada souvenir se
// ubica por una frase literal del cuento y no por número de página: si el
// reparto de hojas cambia, el objeto sigue en la hoja donde se nombra.
// `art` es el dibujo (EMBLEMS, CLASSIC_EMBLEMS o una figura de CAST); el id
// del souvenir es propio del libro para que «Manzana de Blancanieves» no se
// confunda con la de Lolo en el álbum.

// Figura 3D de cada dibujo nuevo; el resto se muestra como medalla.
export const CLASSIC_EMBLEM_TOY = {
  zapatito: 'zapatos',
  'zapatito-oro': 'zapatos',
  lampara: 'lampara-magica',
  rosa: 'rosa-encantada',
  perla: 'perla',
  habichuela: 'habichuela',
  cofre: 'tesoro',
  carta: 'carta',
  castillo: 'castillo',
  torre: 'torre',
  guisante: 'cama-guisante',
};

function withIds(bookId, pins = []) {
  const seen = new Map();
  return pins.map((pin) => {
    const base = `${bookId}-${pin.art}`;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return { ...pin, id: count > 1 ? `${base}-${count}` : base };
  });
}

export const CLASSIC_PINS = Object.fromEntries(
  Object.entries(extras).map(([bookId, extra]) => [bookId, withIds(bookId, extra.pins)]),
);

const PIN_ART = {};
export const CLASSIC_PIN_LABELS = {};
for (const pins of Object.values(CLASSIC_PINS)) {
  for (const pin of pins) {
    PIN_ART[pin.id] = pin.art;
    CLASSIC_PIN_LABELS[pin.id] = pin.label;
  }
}

/** Dibujo que representa un souvenir (el propio id en los cuentos originales). */
export function pinArt(id) {
  return PIN_ART[id] || id;
}

export function classicQuiz(bookId) {
  return (extras[bookId]?.quiz || []).map((question) => ({ q: question.q, a: [...question.a] }));
}

/**
 * Hoja de cada souvenir: la primera donde aparece su frase. Devuelve un mapa
 * página → id. Un souvenir cuya frase no aparece, o que caería en una hoja
 * que ya tiene otro, se omite (las pruebas exigen que no pase).
 */
export function placeClassicPins(bookId, texts) {
  const keys = [];
  const pageOf = [];
  texts.forEach((text, page) => {
    for (const token of text.split(/\s+/)) {
      const key = wordKey(token);
      if (key) {
        keys.push(key);
        pageOf.push(page);
      }
    }
  });
  const placed = new Map();
  for (const pin of CLASSIC_PINS[bookId] || []) {
    const phrase = String(pin.at).split(/\s+/).map(wordKey).filter(Boolean);
    let page = -1;
    for (let i = 0; page < 0 && phrase.length && i + phrase.length <= keys.length; i += 1) {
      if (phrase.every((word, j) => keys[i + j] === word)) page = pageOf[i];
    }
    if (page >= 0 && !placed.has(page)) placed.set(page, pin.id);
  }
  return placed;
}
