import test from "node:test";
import assert from "node:assert/strict";
import { createStoryClock } from "../../src/nido/cuentos/film/story-clock.js";

// Deterministic frame jitter.
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Plays a studio clip: every animation frame (16–33 ms apart) the audio tick
 * reports `currentTime` floored to `quantum` seconds, then the stage samples
 * the clock. `script(trueTime)` may override what the audio reports.
 */
function play({ seed = 1, quantum = 0.04, frames = 180, script = null, clockOptions = {} } = {}) {
  const random = rng(seed);
  let ms = 1000;
  const clock = createStoryClock({ now: () => ms, ...clockOptions });
  clock.reset("studio");
  const audioStart = ms + 5 + random() * 30;
  const rows = [];
  let frame = ms;
  for (let k = 0; k < frames; k += 1) {
    frame += 16 + random() * 17;
    ms = frame;
    const truth = Math.max(0, (frame - audioStart) / 1000);
    const reported = script ? script(truth, k) : quantum ? Math.floor(truth / quantum) * quantum : truth;
    if (reported !== null) clock.pushAudioTime(reported, true);
    const value = clock.sample(frame);
    rows.push({ truth, value, seeked: clock.seeked, frame });
  }
  return { clock, rows };
}

test("studio: 40 ms currentTime on irregular 16-33 ms frames stays within 5 ms after 0.5 s", () => {
  for (let seed = 1; seed <= 12; seed += 1) {
    const { rows } = play({ seed, frames: 220 });
    for (const row of rows.filter((entry) => entry.truth > 0.5)) {
      assert.ok(Math.abs(row.value - row.truth) < 0.005, `seed ${seed} at ${row.truth.toFixed(3)} s: off by ${((row.value - row.truth) * 1000).toFixed(2)} ms`);
    }
  }
});

test("studio: a precise currentTime is followed exactly", () => {
  const { rows } = play({ seed: 7, quantum: 0, frames: 120 });
  for (const row of rows.filter((entry) => entry.truth > 0.2)) assert.ok(Math.abs(row.value - row.truth) < 0.001);
});

test("studio: the output never runs backwards", () => {
  for (let seed = 1; seed <= 6; seed += 1) {
    // Reports that also wobble a little (decoder jitter).
    const random = rng(seed * 31);
    const { rows } = play({ seed, script: (truth) => Math.max(0, Math.floor(truth / 0.04) * 0.04 + (random() - 0.5) * 0.02) });
    let previous = -Infinity;
    for (const row of rows) {
      if (row.value === null) continue;
      assert.ok(row.value >= previous, `went back from ${previous} to ${row.value}`);
      previous = row.value;
    }
  }
});

test("studio: the clock freezes within 0.25 s after the audio stops reporting", () => {
  // Paused tab: the tick stops, frames keep coming.
  let stopAt = null;
  const { rows } = play({
    seed: 3,
    frames: 200,
    script: (truth) => {
      if (truth < 2) return Math.floor(truth / 0.04) * 0.04;
      stopAt ??= truth;
      return null;
    },
  });
  const after = rows.filter((row) => row.truth >= stopAt);
  const final = after.at(-1).value;
  assert.ok(final <= stopAt + 0.25 + 1e-9, `ran to ${final} after stopping at ${stopAt}`);
  const frozen = after.filter((row) => row.truth > stopAt + 0.3);
  assert.ok(frozen.length > 10);
  assert.ok(frozen.every((row) => row.value === final), "kept moving after the horizon");

  // Stalled clip: the tick keeps reporting the same time.
  const stalled = play({ seed: 4, frames: 200, script: (truth) => Math.floor(Math.min(truth, 2) / 0.04) * 0.04 });
  const last = stalled.rows.at(-1).value;
  assert.ok(last <= 2 + 0.25 + 1e-9);
  assert.ok(stalled.rows.filter((row) => row.truth > 2.4).every((row) => row.value === last));
});

test("studio: a 1 s forward seek snaps on the next frame", () => {
  const { rows } = play({ seed: 5, frames: 160, script: (truth) => Math.floor((truth < 2 ? truth : truth + 1) / 0.04) * 0.04 });
  const index = rows.findIndex((row) => row.truth >= 2);
  const next = rows[index + 1];
  assert.ok(Math.abs(next.value - (next.truth + 1)) < 0.06, `${next.value} vs ${next.truth + 1}`);
  assert.equal(rows.some((row) => row.seeked), false, "a forward seek is not a backward seek");
});

test("studio: a backward seek restarts there and sets `seeked` once", () => {
  const { rows } = play({ seed: 6, frames: 160, script: (truth) => Math.floor((truth < 2.5 ? truth : truth - 2) / 0.04) * 0.04 });
  const index = rows.findIndex((row) => row.seeked);
  assert.ok(index > 0, "seek not reported");
  const row = rows[index];
  assert.ok(Math.abs(row.value - (row.truth - 2)) < 0.06, `${row.value} vs ${row.truth - 2}`);
  assert.equal(rows[index + 1].seeked, false);
  assert.equal(rows.filter((entry) => entry.seeked).length, 1);
  // …and keeps following the audio from there.
  const later = rows.filter((entry) => entry.truth > row.truth + 0.6);
  for (const entry of later) assert.ok(Math.abs(entry.value - (entry.truth - 2)) < 0.006);
});

test("studio: nothing is reported before the first audio time", () => {
  let ms = 0;
  const clock = createStoryClock({ now: () => ms });
  clock.reset("studio");
  assert.equal(clock.sample(16), null);
  assert.equal(clock.mode, "studio");
});

test("device: never passes the next word start before that word is announced", () => {
  let ms = 5000;
  const clock = createStoryClock({ now: () => ms });
  const starts = [0, 0.4, 0.9, 1.3, 2.2];
  clock.reset("device", { starts, duration: 2.8 });
  assert.equal(clock.sample(ms), null);
  const random = rng(9);
  const announceAt = [0, 0.55, 1.4, 1.5, 2.9]; // a slow voice, late words
  let word = 0;
  let previous = -Infinity;
  for (let frame = ms; frame < ms + 4000; frame += 16 + random() * 17) {
    const elapsed = (frame - 5000) / 1000;
    while (word < starts.length && announceAt[word] <= elapsed) {
      const saved = ms;
      ms = frame;
      clock.pushWord(word);
      ms = saved;
      word += 1;
    }
    const value = clock.sample(frame);
    if (word === 0) continue;
    assert.ok(value >= previous);
    previous = value;
    if (word < starts.length) assert.ok(value < starts[word], `passed word ${word} (${value}) before it was spoken`);
  }
  assert.ok(previous <= 2.8);
});

test("wall: seconds since reset", () => {
  let ms = 100;
  const clock = createStoryClock({ now: () => ms });
  clock.reset("wall");
  assert.equal(clock.sample(1600), 1.5);
  clock.reset(null);
  assert.equal(clock.sample(2000), null);
});
