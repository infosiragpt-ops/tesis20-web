import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import { wordKey } from "../../src/nido/cuentos/cuentos-voice-plan.js";
import { ACT_LEAD, ACT_PERIOD, burstEnd } from "../../src/nido/cuentos/film/act-timing.js";
import { compilePageTimeline, createCursor, deviceTrack, SFX_LEAD } from "../../src/nido/cuentos/film/timeline.js";
import { ACT_NAMES } from "../../src/nido/cuentos/cuentos-acts.js";

const MANIFEST_URL = new URL("../../public/assets/nido/audio/cuentos-manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(MANIFEST_URL, "utf8"));

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Every page as the Reader compiles it: studio marks when the manifest has
// them, the device estimate otherwise (clasico-habichuelas 6, 8, 9 and 10).
function allTimelines() {
  const list = [];
  for (const book of BOOKS) {
    book.pages.forEach((page, index) => {
      const track = manifest.books?.[book.id]?.pages?.[index] || null;
      const timed = Array.isArray(track?.words) && track.words.length > 0;
      const timeline = compilePageTimeline(page, {
        starts: timed ? track.words : null,
        duration: timed ? track.duration : undefined,
        names: book.names || {},
        source: timed ? "studio" : "device",
      });
      list.push({ book, page, index, track, timed, timeline });
    });
  }
  return list;
}
const TIMELINES = allTimelines();

// The rules of the old Reader `fireCue` (CuentosApp.jsx before WP1): once per
// body position, `cues[wordKey]` fires its sfx, acts, moves and scene.
function legacyFireCue(page) {
  const fired = [];
  const bodyWords = page.x.split(/\s+/).filter(Boolean);
  bodyWords.forEach((token) => {
    const key = wordKey(token);
    const cue = page.cues && key ? page.cues[key] : null;
    if (!cue) return;
    if (cue.sfx) fired.push(`sfx:${cue.sfx}`);
    if (cue.act) Object.entries(cue.act).forEach(([actor, act]) => fired.push(`act:${actor}:${act}`));
    if (cue.move) Object.entries(cue.move).forEach(([actor, where]) => fired.push(`move:${actor}:${where}:${cue.act?.[actor] || "walk"}`));
    if (cue.scene) fired.push(`scene:${cue.scene}`);
  });
  return fired.sort();
}
function compiledCues(timeline) {
  return timeline.events
    .filter((event) => ["sfx", "act", "move", "scene"].includes(event.kind))
    .map((event) =>
      event.kind === "sfx" ? `sfx:${event.sfx}` : event.kind === "act" ? `act:${event.actor}:${event.act}` : event.kind === "move" ? `move:${event.actor}:${event.to}:${event.act}` : `scene:${event.scene}`,
    )
    .sort();
}

test("all 44 books and 867 pages compile with finite, sorted times", () => {
  assert.equal(BOOKS.length, 44);
  assert.equal(TIMELINES.length, 867);
  assert.equal(TIMELINES.filter((entry) => !entry.timed).length, 4);
  for (const { book, index, timeline } of TIMELINES) {
    const where = `${book.id}:${index}`;
    assert.ok(Number.isFinite(timeline.duration) && timeline.duration > 0, where);
    let previous = -Infinity;
    for (const word of timeline.words) {
      assert.ok(Number.isFinite(word.t0) && Number.isFinite(word.t1) && word.t1 >= word.t0, where);
      assert.ok(word.t0 >= previous, `${where}: word ${word.i} goes back`);
      previous = word.t0;
    }
    previous = -Infinity;
    for (const event of timeline.events) {
      for (const field of ["t", "fireAt"]) assert.ok(Number.isFinite(event[field]), `${where}: ${event.kind}.${field}`);
      if (event.until !== null) assert.ok(Number.isFinite(event.until) && event.until >= event.t, `${where}: ${event.kind}.until`);
      assert.ok(event.fireAt >= previous, `${where}: events out of order`);
      previous = event.fireAt;
    }
    for (const sentence of timeline.sentences) assert.ok(sentence.t1 >= sentence.t0 && sentence.w1 >= sentence.w0, where);
    for (const pause of timeline.pauses) assert.ok(pause.t1 - pause.t0 >= 0.35 - 1e-9, where);
    assert.equal(timeline.sentences.at(-1)?.w1, timeline.words.length - 1, where);
  }
});

test("title words plus body words match the studio marks on all 863 timed pages", () => {
  let timed = 0;
  for (const { book, index, page, track, timeline } of TIMELINES.filter((entry) => entry.timed)) {
    timed += 1;
    const titleWordCount = page.t.split(/\s+/).filter(Boolean).length;
    const body = page.x.split(/\s+/).filter(Boolean).length;
    assert.equal(timeline.titleWordCount, titleWordCount);
    assert.equal(titleWordCount + body, track.words.length, `${book.id}:${index}`);
    // Body word i starts at starts[titleWordCount + i].
    assert.equal(timeline.words[0].t0, track.words[titleWordCount]);
    assert.equal(timeline.words.at(-1).t0, track.words.at(-1));
    assert.ok(timeline.words.at(-1).t1 <= track.duration - 0.05 + 1e-9);
  }
  assert.equal(timed, 863);
});

test("the untimed pages use the device-voice estimate", () => {
  for (const { page, timed, timeline } of TIMELINES.filter((entry) => !entry.timed)) {
    const estimate = deviceTrack(page);
    assert.equal(timeline.source, "device");
    assert.deepEqual(timeline.trackStarts, estimate.starts);
    assert.equal(timeline.duration, estimate.duration);
    assert.equal(timed, false);
  }
});

test("parity with the legacy fireCue: the same actions, sounds, moves and scenes", () => {
  let total = 0;
  for (const { book, index, page, timeline } of TIMELINES) {
    const legacy = legacyFireCue(page);
    total += legacy.length;
    assert.deepEqual(compiledCues(timeline), legacy, `${book.id}:${index}`);
  }
  assert.ok(total > 1000, `only ${total} cue firings in the library`);
});

test("acts peak on their word: fireAt = word start − ACT_LEAD; sfx keep the highlight lead", () => {
  for (const { book, index, timeline } of TIMELINES) {
    for (const event of timeline.events) {
      const word = event.word === null ? null : timeline.words[event.word];
      if (event.kind === "act") {
        assert.ok(ACT_NAMES.has(event.act), `${book.id}:${index} ${event.act}`);
        assert.ok(Math.abs(event.fireAt - (word.t0 - ACT_LEAD[event.act])) < 1e-9, `${book.id}:${index}`);
        assert.equal(event.t, word.t0);
      }
      if (event.kind === "sfx") assert.ok(Math.abs(event.fireAt - (word.t0 - SFX_LEAD)) < 1e-9);
      if (event.kind === "move") assert.ok(event.until - event.t >= 1.2 - 1e-9);
    }
  }
  for (const act of ACT_NAMES) {
    assert.ok(ACT_LEAD[act] >= 0 && ACT_LEAD[act] <= 0.35, act);
    assert.ok(ACT_PERIOD[act] > 0, act);
  }
});

test("bursts end on a zero of their motion, never more than 0.45 s late", () => {
  for (const act of ACT_NAMES) {
    for (const hold of [0.8, 1.2, 1.5, 2.2, 2.6, 4.2]) {
      const start = 3.1;
      const until = start + hold;
      const end = burstEnd(act, start, until);
      assert.ok(end <= until + 0.45 + 1e-9, `${act} ${hold}`);
      assert.ok(end > start);
      const cycles = (end - start) / ACT_PERIOD[act];
      const onZero = Math.abs(cycles - Math.round(cycles)) < 1e-6;
      assert.ok(onZero || end === until + 0.45, `${act} ${hold}: ends mid-motion`);
    }
  }
  // A jump or a cheer always lands (lift = max(0, sin 4.2t) / |sin 6.4t|).
  for (const [act, lift] of [["jump", (t) => Math.max(0, Math.sin(t * 4.2))], ["cheer", (t) => Math.abs(Math.sin(t * 6.4))]]) {
    for (let hold = 0.5; hold < 4; hold += 0.13) assert.ok(lift(burstEnd(act, 0, hold)) < 1e-6, `${act} ${hold}`);
  }
});

test("cerditos p5: the wolf blows on «sopló», Pipo runs on «corrió», speakers are the real ones", () => {
  const { timeline } = TIMELINES.find((entry) => entry.book.id === "cerditos" && entry.index === 5);
  const tokens = BOOKS[0].pages[5].x.split(/\s+/).filter(Boolean);
  const soplo = timeline.words[tokens.indexOf("sopló")];
  const blow = timeline.events.find((event) => event.kind === "act" && event.act === "blow");
  assert.equal(blow.actor, "lobo");
  assert.ok(Math.abs(blow.fireAt + ACT_LEAD.blow - soplo.t0) < 1e-9);
  const corrio = timeline.words[tokens.indexOf("corrió")];
  const run = timeline.events.find((event) => event.kind === "move");
  assert.equal(run.actor, "pipo");
  assert.equal(run.fireAt, corrio.t0);
  const starts = timeline.events.filter((event) => event.kind === "line-start");
  assert.deepEqual(starts.map((event) => event.speakers), [["lobo"], ["pipo"]]);
  // Nobody talks during the narrated «El lobo sopló y sopló».
  const talks = timeline.events.filter((event) => event.kind === "talk");
  const narrated = tokens.indexOf("El");
  assert.ok(talks.every((event) => event.word < narrated));
  assert.ok(talks.length >= 8);
});

test("a cursor fed random 16-250 ms steps emits every event exactly once, in order", () => {
  const random = rng(20260929);
  for (const { book, index, timeline } of TIMELINES.filter((_, i) => i % 7 === 0)) {
    const cursor = createCursor(timeline.events);
    const seen = new Map();
    let t = -0.5;
    let lastFire = -Infinity;
    while (t < timeline.duration + 1) {
      t += 0.016 + random() * 0.234;
      for (const event of cursor.advance(t)) {
        assert.ok(event.fireAt <= t && event.fireAt >= lastFire, `${book.id}:${index}`);
        lastFire = event.fireAt;
        seen.set(event, (seen.get(event) || 0) + 1);
      }
    }
    assert.equal(cursor.dropped.length, 0, `${book.id}:${index}: sfx dropped on 250 ms frames`);
    assert.equal(seen.size, timeline.events.length, `${book.id}:${index}: lost events`);
    assert.ok([...seen.values()].every((count) => count === 1), `${book.id}:${index}: repeated events`);
  }
});

test("a backward seek never re-emits an event; late sound effects are dropped, late acts are not", () => {
  const { timeline } = TIMELINES.find((entry) => entry.book.id === "cerditos" && entry.index === 5);
  const cursor = createCursor(timeline.events);
  const seen = new Set();
  const take = (t) => cursor.advance(t).forEach((event) => {
    assert.ok(!seen.has(event), `re-emitted ${event.kind} at ${event.fireAt}`);
    seen.add(event);
  });
  for (let t = 0; t < 9; t += 0.1) take(t);
  cursor.seek(2);
  for (let t = 2; t < timeline.duration + 1; t += 0.1) take(t);
  assert.equal(seen.size, timeline.events.length);

  // One 5 s hitch: acts still come out (with their scheduled start), sounds are dropped.
  const late = createCursor(timeline.events);
  const burst = late.advance(timeline.duration + 1);
  assert.ok(burst.some((event) => event.kind === "act"));
  assert.ok(!burst.some((event) => event.kind === "sfx"));
  assert.ok(late.dropped.length > 0 && late.dropped.every((event) => event.kind === "sfx"));
});
