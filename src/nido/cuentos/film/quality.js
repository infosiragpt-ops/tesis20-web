// Gobernador de calidad adaptable (lógica pura, sin three.js ni DOM).
//
// Cuatro escalones: T0 es el escritorio completo y T3 lo mínimo que conserva
// la lectura. El escenario mide cada fotograma; si el promedio móvil pasa de
// 22 ms durante 1,5 s baja un escalón, y si queda bajo 14 ms durante 8 s sube
// uno. Nunca más de un paso cada 3 s, para no oscilar.
//
// Nunca se cambia el número de luces (obligaría a recompilar los shaders): un
// escalón solo toca la densidad de píxeles, el tamaño del mapa de sombras y
// qué objetos proyectan sombra.

export const MIN_TIER = 0;
export const MAX_TIER = 3;

/**
 * Clases de sombra:
 * - `actor`: los personajes de la página (reparto);
 * - `book`: el libro abierto y su lámina pop-up;
 * - `prop`: utilería del diorama y la obra (casa, árbol, piezas);
 * - `scenery`: la sala (repisas, lámpara, objetos de la mesa, otros libros).
 */
export const SHADOW_KINDS = Object.freeze(['actor', 'book', 'prop', 'scenery']);

export const TIERS = Object.freeze([
  Object.freeze({ tier: 0, dpr: 2, shadowMapSize: 2048, casters: Object.freeze(['actor', 'book', 'prop', 'scenery']) }),
  Object.freeze({ tier: 1, dpr: 1.5, shadowMapSize: 1024, casters: Object.freeze(['actor', 'book', 'prop', 'scenery']) }),
  // La utilería y la sala dejan de proyectar sombra.
  Object.freeze({ tier: 2, dpr: 1.25, shadowMapSize: 1024, casters: Object.freeze(['actor', 'book']) }),
  // Solo el reparto de la página (las sombras de contacto de WP3 lo apoyan).
  Object.freeze({ tier: 3, dpr: 1, shadowMapSize: 512, casters: Object.freeze(['actor']) }),
]);

export const GOVERNOR = Object.freeze({
  alpha: 0.1,
  slowMs: 22,
  fastMs: 14,
  stepDownAfterMs: 1500,
  stepUpAfterMs: 8000,
  minStepGapMs: 3000,
  // Un tirón aislado (pestaña que vuelve, recolector) no puede disparar el
  // promedio: se recorta cada muestra.
  maxSampleMs: 250,
});

export function clampTier(tier) {
  const value = Math.round(Number(tier));
  if (!Number.isFinite(value)) return MIN_TIER;
  return Math.max(MIN_TIER, Math.min(MAX_TIER, value));
}

/** Densidad de píxeles del escalón, nunca por encima de la del dispositivo. */
export function tierPixelRatio(tier, devicePixelRatio = 1) {
  const device = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(device, TIERS[clampTier(tier)].dpr);
}

export function castsShadowAt(tier, kind) {
  return TIERS[clampTier(tier)].casters.includes(kind);
}

/**
 * Escalón inicial según el dispositivo: T0 en escritorio; T1 en pantallas
 * estrechas (≤760 px), punteros gruesos, o pantallas táctiles cuyo lado corto
 * mide menos de 1100 px (tabletas, que antes recibían el camino de escritorio).
 */
export function startTierFor({ narrow = false, coarse = false, maxTouchPoints = 0, screenShortSide = Infinity } = {}) {
  if (narrow || coarse) return 1;
  if (maxTouchPoints > 0 && screenShortSide < 1100) return 1;
  return 0;
}

/** Lee el escalón inicial del navegador (fuera de él, T0). */
export function detectStartTier(win = typeof window === 'undefined' ? null : window) {
  if (!win) return MIN_TIER;
  const matches = (query) => Boolean(win.matchMedia?.(query).matches);
  const screen = win.screen || {};
  const shortSide = Math.min(screen.width || win.innerWidth || Infinity, screen.height || win.innerHeight || Infinity);
  return startTierFor({
    narrow: matches('(max-width: 760px)'),
    coarse: matches('(pointer: coarse)'),
    maxTouchPoints: win.navigator?.maxTouchPoints || 0,
    screenShortSide: shortSide,
  });
}

/**
 * `frame(ms)` recibe la duración del fotograma. `tier` es el escalón vigente
 * y `onChange(fn)` avisa de cada cambio `(tier, previous, reason)`; devuelve
 * la función para darse de baja. `reset(tier)` vuelve a empezar desde un
 * escalón inicial (cambio de clase de dispositivo al redimensionar).
 */
export function createQualityGovernor({ startTier = MIN_TIER, now = () => globalThis.performance?.now?.() ?? Date.now() } = {}) {
  let tier = clampTier(startTier);
  let average = null;
  let slowSince = null;
  let fastSince = null;
  let lastStepAt = -Infinity;
  const listeners = new Set();

  function step(next, reason) {
    const previous = tier;
    tier = clampTier(next);
    lastStepAt = now();
    slowSince = null;
    fastSince = null;
    if (tier !== previous) listeners.forEach((fn) => fn(tier, previous, reason));
    return tier !== previous;
  }

  return {
    frame(ms) {
      if (!Number.isFinite(ms) || ms <= 0) return tier;
      const sample = Math.min(ms, GOVERNOR.maxSampleMs);
      average = average === null ? sample : average + (sample - average) * GOVERNOR.alpha;
      const t = now();
      if (average > GOVERNOR.slowMs) {
        fastSince = null;
        slowSince ??= t;
      } else if (average < GOVERNOR.fastMs) {
        slowSince = null;
        fastSince ??= t;
      } else {
        slowSince = null;
        fastSince = null;
      }
      if (t - lastStepAt < GOVERNOR.minStepGapMs) return tier;
      if (slowSince !== null && t - slowSince >= GOVERNOR.stepDownAfterMs && tier < MAX_TIER) step(tier + 1, 'slow');
      else if (fastSince !== null && t - fastSince >= GOVERNOR.stepUpAfterMs && tier > MIN_TIER) step(tier - 1, 'fast');
      return tier;
    },
    get tier() {
      return tier;
    },
    get averageMs() {
      return average;
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    reset(nextStartTier = MIN_TIER) {
      average = null;
      step(nextStartTier, 'reset');
    },
  };
}
