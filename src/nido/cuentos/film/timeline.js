// Compiled page timeline (WP1). Pure: the same data the Reader already has —
// the page (`cues`, `cast`, text), `book.names` and the word starts of
// cuentos-manifest.json — becomes a sorted list of events on the story clock.
//
// Timeline shape:
// { duration, source, titleWordCount, trackStarts,
//   words: [{ i, key, t0, t1 }], sentences: [{ i, w0, w1, t0, t1 }],
//   pauses: [{ t0, t1 }], lines: [{ w0, w1, t0, t1, speakers, confidence }],
//   events: [{ kind, actor, act, t, fireAt, until, word, sfx, scene, to, mood, src }] }

import { estimateWordStarts, pageSpeechText, splitWords, wordKey } from "../cuentos-voice-plan.js";
import { ACT_LEAD } from "./act-timing.js";
import { CONFIDENT, dialogueLines } from "./dialogue.js";

// Same lead as the highlight in cuentos-audio.js (HIGHLIGHT_LEAD).
export const SFX_LEAD = 0.06;
export const LATE_SFX = 0.3;
const DEFAULT_HOLD_MS = 1500;
const DEVICE_RATE = 0.86;

// Mood words: classic-direction.js `moods` plus sadness and surprise. WP6
// turns them into expressions.
const MOODS = [
  [/^(hola|adiós|adios)$/, "greet"],
  [/^(gracias|perdón|perdon)$/, "polite"],
  [/^(miedo|temor|asustó|asustado|asustada)$/, "fear"],
  [/^(cielo|estrellas|luna|sol)$/, "wonder"],
  [/^(silencio|escuchó|oyeron)$/, "attentive"],
  [/^(amor|cariño|beso)$/, "love"],
  [/^(contento|contenta|alegría|feliz)$/, "joy"],
  [/^(lloró|lloraba|triste)$/, "sad"],
  [/^(sorpresa|asombro)$/, "surprise"],
];

// Events that share a fire time keep this order: a line ends before the
// next one starts, the stage learns who speaks before the gestures.
const KIND_ORDER = { "line-end": 0, "line-start": 1, scene: 2, move: 3, act: 4, name: 5, mood: 6, talk: 7, sfx: 8 };

/** Seconds per word of the device voice (device-narrator.js word timer). */
export function deviceWordSeconds(rate = DEVICE_RATE) {
  return Math.max(0.23, 1 / ((rate || DEVICE_RATE) * 3.1));
}

/** Estimated word starts of the whole page (title + body) for the device voice. */
export function deviceTrack(page, rate = DEVICE_RATE) {
  const text = pageSpeechText(page);
  const count = splitWords(text).words.length;
  const duration = count * deviceWordSeconds(rate);
  return { starts: estimateWordStarts(text, duration), duration };
}

function letters(token) {
  return (wordKey(token) || "").length;
}

/**
 * @param page a page of cuentos-data.js (`t`, `x`, `cast`, `cues`)
 * @param options.starts word starts of the whole narration (title + body), or
 *   null to use the device estimate
 * @param options.duration clip length in seconds
 * @param options.titleWordCount words of the title (as the Reader counts them)
 * @param options.names `book.names`
 * @param options.source 'studio' | 'device'
 */
export function compilePageTimeline(page, { starts = null, duration, titleWordCount, names = {}, source = "studio", rate = DEVICE_RATE } = {}) {
  const tokens = String(page?.x || "").split(/\s+/).filter(Boolean);
  const title = titleWordCount ?? String(page?.t || "").split(/\s+/).filter(Boolean).length;
  let trackStarts = Array.isArray(starts) && starts.length === title + tokens.length ? starts : null;
  let total = Number(duration);
  if (!trackStarts) {
    const estimate = deviceTrack(page, rate);
    // A clip with a known length but no usable marks is spread over its own
    // length; otherwise the device voice pace is used.
    const span = Number.isFinite(total) && total > 0 && source !== "device" ? total : estimate.duration;
    trackStarts = span === estimate.duration ? estimate.starts : estimateWordStarts(pageSpeechText(page), span);
    total = span;
  }
  if (!Number.isFinite(total) || total <= 0) total = (trackStarts.at(-1) || 0) + 1;

  /* ------------------------------- words ------------------------------- */
  const words = tokens.map((token, i) => {
    const t0 = trackStarts[title + i];
    const next = i + 1 < tokens.length ? trackStarts[title + i + 1] : total;
    let t1 = Math.min(next, t0 + 0.075 * letters(token) + 0.1);
    if (i === tokens.length - 1) t1 = Math.min(t1, total - 0.05);
    return { i, key: wordKey(token), t0, t1: Math.max(t0, t1) };
  });

  const sentences = [];
  let from = 0;
  tokens.forEach((token, i) => {
    if (/[.!?…][»”—–]?$/u.test(token) || i === tokens.length - 1) {
      sentences.push({ i: sentences.length, w0: from, w1: i, t0: words[from].t0, t1: words[i].t1 });
      from = i + 1;
    }
  });

  const pauses = [];
  for (let i = 0; i + 1 < words.length; i += 1) {
    if (words[i + 1].t0 - words[i].t1 >= 0.35) pauses.push({ t0: words[i].t1, t1: words[i + 1].t0 });
  }

  /* ------------------------------- events ------------------------------ */
  const castIds = [...new Set(page?.cast || [])];
  const castSet = new Set(castIds);
  const nameOf = new Map();
  Object.entries(names || {}).forEach(([actor, list]) => {
    if (!castSet.has(actor)) return;
    (list || []).forEach((word) => {
      const key = wordKey(word);
      if (key) nameOf.set(key, actor);
    });
  });

  const events = [];
  const add = (event) => events.push({ actor: null, act: null, until: null, word: null, sfx: null, scene: null, to: null, mood: null, src: "cue", ...event });
  const cues = page?.cues || {};
  let subject = castIds[0] || null;

  words.forEach((word) => {
    const t = word.t0;
    const cue = word.key ? cues[word.key] : null;
    if (cue) {
      const hold = (cue.hold ?? DEFAULT_HOLD_MS) / 1000;
      if (cue.sfx) add({ kind: "sfx", t, fireAt: t - SFX_LEAD, word: word.i, sfx: cue.sfx });
      Object.entries(cue.act || {}).forEach(([actor, act]) => {
        add({ kind: "act", actor, act, t, fireAt: t - (ACT_LEAD[act] ?? 0), until: t + hold, word: word.i });
      });
      // The figure starts to travel on the word; its stride (the act burst)
      // already started ACT_LEAD earlier.
      Object.entries(cue.move || {}).forEach(([actor, where]) => {
        add({ kind: "move", actor, act: cue.act?.[actor] || "walk", t, fireAt: t, until: t + Math.max(hold, 1.2), word: word.i, to: where });
      });
      if (cue.scene) add({ kind: "scene", t, fireAt: t, word: word.i, scene: cue.scene });
    }
    const named = word.key ? nameOf.get(word.key) : null;
    if (named) {
      subject = named;
      add({ kind: "name", actor: named, t, fireAt: t - SFX_LEAD, until: t + 1.5, word: word.i, src: "name" });
    }
    const mood = word.key ? MOODS.find(([pattern]) => pattern.test(word.key)) : null;
    if (mood) add({ kind: "mood", actor: subject, t, fireAt: t, until: t + 1.5, word: word.i, mood: mood[1], src: "mood" });
  });

  const lines = dialogueLines(tokens, {
    cast: castIds,
    names,
    starts: words.map((word) => word.t0),
    ends: words.map((word) => word.t1),
  });
  lines.forEach((line, index) => {
    if (!CONFIDENT.has(line.confidence) || !line.speakers.length) return;
    const actor = line.speakers[0];
    const shared = { actor, speakers: line.speakers, line: index, src: "line" };
    add({ kind: "line-start", t: line.t0, fireAt: line.t0 - 0.12, until: line.t1 + 0.2, word: line.w0, ...shared });
    add({ kind: "line-end", t: line.t1, fireAt: line.t1 + 0.2, word: line.w1, ...shared });
    for (let w = line.w0; w <= line.w1; w += 1) add({ kind: "talk", t: words[w].t0, fireAt: words[w].t0, word: w, ...shared });
  });

  events.forEach((event, index) => {
    event.seq = index;
  });
  events.sort((a, b) => a.fireAt - b.fireAt || (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) || a.seq - b.seq);

  return { duration: total, source, titleWordCount: title, trackStarts, words, sentences, pauses, lines, events };
}

/**
 * Walks a timeline's events on the story clock. `advance(t)` returns every
 * event with prev < fireAt ≤ t exactly once, in order, so a long frame
 * catches up instead of losing cues. Sound effects more than LATE_SFX late
 * are dropped (reported in `dropped`); acts and travels are still applied
 * with their scheduled start. `seek(t)` moves the cursor without firing and
 * nothing already fired is ever fired again.
 */
export function createCursor(events = []) {
  const list = [...events].sort((a, b) => a.fireAt - b.fireAt);
  const fired = new Uint8Array(list.length);
  let prev = -Infinity;
  let index = 0;
  const dropped = [];
  return {
    advance(t) {
      if (t === null || t === undefined || !Number.isFinite(t) || t <= prev) return [];
      const out = [];
      while (index < list.length && list[index].fireAt <= t) {
        const event = list[index];
        if (!fired[index] && event.fireAt > prev) {
          fired[index] = 1;
          if (event.kind === "sfx" && t - event.fireAt > LATE_SFX) dropped.push(event);
          else out.push(event);
        }
        index += 1;
      }
      prev = t;
      return out;
    },
    seek(t) {
      if (!Number.isFinite(t)) return;
      prev = t;
      index = 0;
      while (index < list.length && list[index].fireAt <= t) index += 1;
    },
    get time() {
      return prev;
    },
    get dropped() {
      return dropped;
    },
    get remaining() {
      let count = 0;
      for (let i = 0; i < list.length; i += 1) if (!fired[i]) count += 1;
      return count;
    },
  };
}
