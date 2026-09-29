// Temporary acting times for the page timeline (WP1). WP4 replaces this
// table with the `hit` times of keyed act clips.
//
// ACT_LEAD[act]: how many seconds before the spoken word a burst must start so
// that the first maximum of its primary oscillator in stage.js `applyAct`
// (evaluated with burst-local time and phase 0) lands on the word. Capped at
// 0.35 s so a gesture never starts noticeably before its word.
export const ACT_LEAD = Object.freeze({
  blow: 0.314,
  nod: 0.314,
  jump: 0.35,
  cheer: 0.245,
  sing: 0.26,
  build: 0.224,
  hug: 0.2,
  dance: 0.196,
  run: 0.175,
  howl: 0.15,
  look: 0.15,
  listen: 0.15,
  think: 0.15,
  fly: 0.12,
  swim: 0.12,
  peck: 0.112,
  wave: 0.1,
  walk: 0.1,
  sniff: 0.1,
  raise: 0.35,
  shiver: 0,
  sleep: 0,
});

// Angular frequency (rad/s) of the oscillator that must be back at rest when
// a burst ends: the lift of jump/cheer/run/walk, the lean of blow, the nod…
// Where two oscillators move the pose (sing, dance) the slower one is used,
// because its zeros are also zeros of the faster one.
const ACT_OMEGA = {
  blow: 5, nod: 5, jump: 4.2, cheer: 6.4, sing: 3, build: 7, hug: 3, dance: 4,
  run: 9, howl: 3, look: 1.3, listen: 1.4, think: 0.8, fly: 2.6, swim: 2.3,
  peck: 14, wave: 10, walk: 5, sniff: 2, raise: 2, shiver: 38, sleep: 1.6,
};

// ACT_PERIOD[act] = π/ω: the distance between two zeros of the motion.
export const ACT_PERIOD = Object.freeze(
  Object.fromEntries(Object.entries(ACT_OMEGA).map(([act, omega]) => [act, Math.PI / omega])),
);

export function actLead(act) {
  return ACT_LEAD[act] ?? 0;
}

/**
 * When a burst that starts at `start` and is asked to last until `until`
 * should really end: on the next zero of its motion, never more than 0.45 s
 * late. If that zero is too far away (slow acts, jump), it ends on the last
 * zero before `until` instead, so a jump never snaps from mid-air to the floor.
 */
export function burstEnd(act, start, until) {
  const period = ACT_PERIOD[act];
  if (!(period > 0) || !(until > start)) return until;
  const cycles = (until - start) / period;
  const later = start + Math.ceil(cycles - 1e-9) * period;
  if (later <= until + 0.45) return later;
  const earlier = start + Math.floor(cycles + 1e-9) * period;
  return earlier > start ? earlier : until + 0.45;
}
