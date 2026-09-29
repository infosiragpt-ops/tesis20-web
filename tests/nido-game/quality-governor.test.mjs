import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createQualityGovernor, startTierFor, detectStartTier, tierPixelRatio, castsShadowAt, clampTier,
  TIERS, MIN_TIER, MAX_TIER,
} from '../../src/nido/cuentos/film/quality.js';

// Reloj simulado: cada fotograma avanza el tiempo lo que dura.
function run(governor, clock, durationMs, frameMs) {
  const changes = [];
  const end = clock.t + durationMs;
  while (clock.t < end) {
    const ms = typeof frameMs === 'function' ? frameMs() : frameMs;
    clock.t += ms;
    const before = governor.tier;
    governor.frame(ms);
    if (governor.tier !== before) changes.push({ at: clock.t, tier: governor.tier });
  }
  return changes;
}
function seeded(seed = 7) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

test('sin oscilaciones con fotogramas de 20 ± 3 ms', () => {
  for (const start of [0, 1, 2]) {
    const clock = { t: 0 };
    const governor = createQualityGovernor({ startTier: start, now: () => clock.t });
    const random = seeded(11 + start);
    const changes = run(governor, clock, 120000, () => 17 + random() * 6);
    assert.deepEqual(changes, [], `T${start} no debe cambiar con 20 ± 3 ms`);
  }
});

test('baja un escalón tras 1,5 s lento y no más de uno cada 3 s', () => {
  const clock = { t: 0 };
  const governor = createQualityGovernor({ startTier: 0, now: () => clock.t });
  const seen = [];
  governor.onChange((tier, previous, reason) => seen.push({ tier, previous, reason }));
  const changes = run(governor, clock, 20000, 40);
  assert.deepEqual(changes.map((c) => c.tier), [1, 2, 3], 'baja paso a paso hasta T3 y se queda ahí');
  // El promedio cruza 22 ms en pocos fotogramas; luego 1,5 s continuos.
  assert.ok(changes[0].at >= 1500 && changes[0].at <= 1500 + 400, `primer paso a ${changes[0].at} ms`);
  for (let i = 1; i < changes.length; i += 1) assert.ok(changes[i].at - changes[i - 1].at >= 3000, 'un paso cada 3 s como máximo');
  assert.deepEqual(seen[0], { tier: 1, previous: 0, reason: 'slow' });
});

test('un tirón aislado no cambia el escalón', () => {
  const clock = { t: 0 };
  const governor = createQualityGovernor({ startTier: 1, now: () => clock.t });
  run(governor, clock, 2000, 16.7);
  governor.frame(900); clock.t += 900;
  const changes = run(governor, clock, 10000, 16.7);
  assert.deepEqual(changes, []);
  assert.equal(governor.tier, 1);
});

test('sube un escalón tras 8 s rápido', () => {
  const clock = { t: 0 };
  const governor = createQualityGovernor({ startTier: 3, now: () => clock.t });
  const changes = run(governor, clock, 40000, 8);
  assert.deepEqual(changes.map((c) => c.tier), [2, 1, 0]);
  assert.ok(changes[0].at >= 8000 && changes[0].at <= 8200, `primer ascenso a ${changes[0].at} ms`);
  for (let i = 1; i < changes.length; i += 1) assert.ok(changes[i].at - changes[i - 1].at >= 8000, 'cada ascenso exige otros 8 s rápidos');
  assert.equal(governor.tier, MIN_TIER);
});

test('los escalones quedan acotados entre T0 y T3', () => {
  assert.equal(clampTier(-4), MIN_TIER);
  assert.equal(clampTier(9), MAX_TIER);
  assert.equal(clampTier('x'), MIN_TIER);
  assert.equal(createQualityGovernor({ startTier: 7, now: () => 0 }).tier, 3);
  assert.equal(createQualityGovernor({ startTier: -1, now: () => 0 }).tier, 0);
  assert.equal(TIERS.length, 4);
  assert.deepEqual(TIERS.map((t) => t.shadowMapSize), [2048, 1024, 1024, 512]);
  assert.deepEqual([0, 1, 2, 3].map((t) => tierPixelRatio(t, 3)), [2, 1.5, 1.25, 1]);
  assert.equal(tierPixelRatio(0, 1), 1, 'nunca por encima de la densidad del dispositivo');
  assert.equal(tierPixelRatio(1, undefined), 1);
  // T2: utilería y sala dejan de proyectar sombra; T3: solo el reparto.
  assert.ok(castsShadowAt(1, 'scenery') && castsShadowAt(1, 'prop'));
  assert.ok(!castsShadowAt(2, 'scenery') && !castsShadowAt(2, 'prop') && castsShadowAt(2, 'actor') && castsShadowAt(2, 'book'));
  assert.ok(castsShadowAt(3, 'actor') && !castsShadowAt(3, 'book'));
  const clock = { t: 0 };
  const governor = createQualityGovernor({ startTier: 2, now: () => clock.t });
  governor.reset(0);
  assert.equal(governor.tier, 0);
  governor.frame(Number.NaN);
  governor.frame(-3);
  assert.equal(governor.tier, 0);
});

test('escalón inicial: escritorio T0; móvil, puntero grueso o tableta T1', () => {
  assert.equal(startTierFor({}), 0);
  assert.equal(startTierFor({ narrow: true }), 1);
  assert.equal(startTierFor({ coarse: true }), 1);
  assert.equal(startTierFor({ maxTouchPoints: 5, screenShortSide: 1024 }), 1, 'tableta de 1024 px de lado corto');
  assert.equal(startTierFor({ maxTouchPoints: 5, screenShortSide: 1440 }), 0, 'pantalla táctil grande');
  assert.equal(startTierFor({ maxTouchPoints: 0, screenShortSide: 800 }), 0, 'portátil pequeño sin tacto');
  const fakeWindow = (width, height, touch, queries) => ({
    innerWidth: width, innerHeight: height, screen: { width, height },
    navigator: { maxTouchPoints: touch },
    matchMedia: (query) => ({ matches: queries.includes(query) }),
  });
  assert.equal(detectStartTier(fakeWindow(1440, 900, 0, ['(pointer: fine)'])), 0);
  assert.equal(detectStartTier(fakeWindow(390, 844, 5, ['(max-width: 760px)', '(pointer: coarse)'])), 1);
  assert.equal(detectStartTier(fakeWindow(1180, 820, 5, [])), 1, 'iPad horizontal ya no recibe el camino de escritorio');
  assert.equal(detectStartTier(null), 0);
});
