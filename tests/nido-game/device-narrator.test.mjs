import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeviceNarration, speechChunks, spanishVoice } from '../../src/nido/cuentos/device-narrator.js';

function fixture({ voices = [{ name: 'Mónica', lang: 'es-ES' }] } = {}) {
  let time = 100, id = 0;
  const pending = new Map(), utterances = [], events = [], ended = [], listeners = new Map();
  const timers = {
    setTimeout(fn, ms) { pending.set(++id, { fn, ms }); return id; },
    setInterval(fn, ms) { pending.set(++id, { fn, ms, repeat: true }); return id; },
    clearTimeout(key) { pending.delete(key); }, clearInterval(key) { pending.delete(key); },
  };
  const synth = { getVoices: () => voices, speak: u => utterances.push(u), cancel() {}, pause() {}, resume() {},
    addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  return { utterances, events, ended, pending, listeners, synth,
    advance(ms) { time += ms; },
    run(ms) { for (const [key, task] of [...pending]) if (task.ms === ms) { if (!task.repeat) pending.delete(key); task.fn(); } },
    start(text) { return createDeviceNarration(text, { synth, Utterance: class { constructor(t) { this.text = t; } }, timers,
      now: () => time, onWord: index => events.push(index), onEnd: r => ended.push(r) }); },
  };
}

test('Spanish voice selection never silently selects an English voice', () => {
  assert.equal(spanishVoice([{ name: 'Samantha', lang: 'en-US' }]), null);
  assert.equal(spanishVoice([{ name: 'Spanish', lang: 'es-MX' }, { name: 'Mónica', lang: 'es-ES' }]).name, 'Mónica');
});

test('chunks preserve every word, punctuation and global word offsets', () => {
  const text = '¿Dónde estás? —preguntó la princesa. '.repeat(35).trim();
  const chunks = speechChunks(text);
  assert.ok(chunks.length > 1);
  assert.equal(chunks.map(c => c.text).join(' '), text);
  let offset = 0;
  for (const c of chunks) { assert.equal(c.wordStart, offset); offset += c.offsets.length; assert.ok(c.text.length <= 190); }
});

test('no highlight before native start, global boundaries survive chunk transitions', () => {
  const f = fixture(); f.start('Uno dos tres cuatro cinco seis siete ocho nueve diez. '.repeat(8));
  assert.deepEqual(f.events, []);
  let previousEnd = 0;
  while (!f.ended.length) {
    const u = f.utterances.at(-1); u.onstart();
    assert.equal(f.events.at(-1), previousEnd);
    u.onboundary({ name: 'word', charIndex: 4 }); assert.equal(f.events.at(-1), previousEnd + 1);
    previousEnd += u.text.split(/\s+/).length;
    f.advance(6000); u.onend();
  }
  assert.deepEqual(f.ended, [{ ok: true, source: 'device' }]);
  assert.equal(f.pending.size, 0);
});

test('cancel ignores late native callbacks and clears all work', () => {
  const f = fixture(), control = f.start('Una historia completa.');
  const u = f.utterances[0]; u.onstart(); control.cancel();
  f.advance(2000); u.onend(); u.onerror({ error: 'canceled' });
  assert.deepEqual(f.ended, []); assert.equal(f.pending.size, 0);
});

test('pause stops highlight timers; resume continues, not from word zero', () => {
  const f = fixture(), control = f.start('Una historia de siete palabras para leer.');
  f.utterances[0].onstart(); control.pause(); assert.equal(f.pending.size, 0);
  control.resume(); assert.ok(f.pending.size > 0); control.cancel();
});

test('missing voices, blocked startup and instant endings fail without advancing', () => {
  const unavailable = fixture({ voices: [] }); unavailable.start('Una historia.'); unavailable.run(4000);
  assert.equal(unavailable.ended[0].reason, 'spanish-unavailable'); assert.equal(unavailable.listeners.size, 0);
  const blocked = fixture(); blocked.start('Una historia.'); blocked.run(10000);
  assert.equal(blocked.ended[0].ok, false);
  const short = fixture(); short.start('Una historia completa para leer.'); short.utterances[0].onend();
  assert.equal(short.ended[0].reason, 'short');
});

test('a asynchronously loaded Spanish voice starts once and removes listener', () => {
  const voices = [], f = fixture({ voices }); f.start('Érase una vez.');
  voices.push({ name: 'Paulina', lang: 'es-MX' }); f.listeners.get('voiceschanged')();
  assert.equal(f.utterances.length, 1); assert.equal(f.listeners.size, 0);
});
