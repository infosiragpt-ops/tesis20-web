// Resolución de locuciones grabadas para los runtimes de la sala de juegos.
//
// audioDirector.speak() cae a la voz sintética del sistema en cuanto no recibe
// audioSrc. Ese respaldo existe para que un fallo de red no deje al niño en
// silencio, pero durante mucho tiempo fue la única voz de Memoria Mágica y
// Atrapa y Cuenta: ninguno de los dos leía el manifiesto, así que sus diez
// juegos narraban íntegramente con la voz robótica del dispositivo mientras los
// otros 530 usaban a la maestra de estudio. Este módulo existe para que
// enchufar un runtime al catálogo grabado cueste una línea y nadie se lo salte
// por descuido.

const MANIFEST_URL = "/assets/nido/audio/manifest.json";

let cache = null;
let pending = null;

/**
 * Descarga el manifiesto una sola vez por sesión y lo comparte entre runtimes.
 * Nunca rechaza: sin manifiesto se devuelve un mapa vacío y quien llame seguirá
 * teniendo el respaldo de la voz del dispositivo.
 *
 * @returns {Promise<{tracks: Record<string,string>, bosqueTracks: Record<string,string>}>}
 */
export function loadVoiceManifest() {
  if (cache) return Promise.resolve(cache);
  if (pending) return pending;

  pending = fetch(MANIFEST_URL, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((manifest) => {
      cache = {
        tracks: manifest?.tracks ?? {},
        bosqueTracks: manifest?.bosqueTracks ?? {},
      };
      return cache;
    })
    .catch(() => {
      // Un fallo de red no debe dejar el juego mudo: se devuelve vacío y la voz
      // del dispositivo toma el relevo. No se cachea, para reintentar luego.
      pending = null;
      return { tracks: {}, bosqueTracks: {} };
    });

  return pending;
}

// Sólo para las pruebas: el módulo guarda estado entre llamadas.
export function resetVoiceManifestCache() {
  cache = null;
  pending = null;
}
