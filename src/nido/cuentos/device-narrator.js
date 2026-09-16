// Spanish device narration. No provider, credentials, generation or network API.
// Chunking avoids long-utterance truncation on mobile. Only native completion
// advances the story; highlight estimates are never evidence of completion.
export function spanishVoice(voices = []) {
  const spanish = voices.filter(v => /^es(?:-|_)/i.test(v.lang) || v.lang === 'es');
  return spanish.find(v => /paulina|m[oó]nica|luciana|sabina|helena/i.test(v.name))
    || spanish.find(v => /^es-(PE|419|MX|CO)/i.test(v.lang)) || spanish[0] || null;
}

export function speechChunks(text, limit = 190) {
  const words = [...text.matchAll(/\S+/gu)];
  const chunks = [];
  for (let i = 0; i < words.length;) {
    let end = i + 1;
    while (end < words.length && words[end].index + words[end][0].length - words[i].index <= limit) {
      if (end - i > 8 && /[.!?;:]$/.test(words[end - 1][0])) break;
      end += 1;
    }
    const start = words[i].index;
    chunks.push({ text: text.slice(start, words[end - 1].index + words[end - 1][0].length),
      wordStart: i, offsets: words.slice(i, end).map(w => w.index - start) });
    i = end;
  }
  return chunks;
}

export function createDeviceNarration(text, {
  synth, Utterance, onWord, onEnd, onStart, rate = 0.86,
  timers = globalThis, now = () => performance.now(),
}) {
  const chunks = speechChunks(text);
  let cancelled = false, settled = false, paused = false, current = null;
  let position = 0, timer = null, watchdog = null, estimate = 0, boundary = false;
  let startedAt = 0, activeMs = 0, voiceListener = null, announcedVoice = null;
  const triedVoices = new Set();
  const voiceKey = voice => voice.voiceURI || `${voice.lang}:${voice.name}`;
  const clear = () => { timers.clearInterval(timer); timers.clearTimeout(watchdog); timer = watchdog = null; };
  const detach = () => { if (voiceListener) synth?.removeEventListener?.('voiceschanged', voiceListener); voiceListener = null; };
  const live = utterance => !cancelled && !settled && current === utterance;
  const finish = result => {
    if (cancelled || settled) return;
    settled = true; clear(); detach(); current = null;
    onWord?.(-1); onEnd?.(result);
  };
  const track = () => {
    const chunk = chunks[position];
    if (!chunk || paused) return;
    timer = timers.setInterval(() => {
      if (!boundary && estimate < chunk.offsets.length - 1) onWord?.(chunk.wordStart + ++estimate);
    }, Math.max(230, 1000 / (rate * 3.1)));
    watchdog = timers.setTimeout(() => {
      finish({ ok: false, reason: 'timeout' }); synth.cancel();
    }, Math.max(20000, chunk.offsets.length * 1600 / rate));
  };
  const speakChunk = voice => {
    if (cancelled || settled) return;
    triedVoices.add(voiceKey(voice));
    const chunk = chunks[position];
    const utterance = new Utterance(chunk.text);
    current = utterance; boundary = false; estimate = 0; startedAt = 0; activeMs = 0;
    utterance.lang = voice.lang; utterance.voice = voice;
    utterance.rate = rate; utterance.pitch = 1.02;
    utterance.onstart = () => {
      if (!live(utterance)) return;
      clear(); startedAt = now();
      if (announcedVoice !== voiceKey(voice)) { announcedVoice = voiceKey(voice); onStart?.({ name: voice.name, lang: voice.lang }); }
      onWord?.(chunk.wordStart); track();
    };
    utterance.onboundary = event => {
      if (!live(utterance) || paused || (event.name && event.name !== 'word')) return;
      boundary = true;
      const found = chunk.offsets.findLastIndex(offset => offset <= event.charIndex);
      if (found >= 0) onWord?.(chunk.wordStart + found);
    };
    // Some systems advertise a voice that cannot actually speak. Retry only
    // startup failure, only on this page's first chunk, at most two others.
    // Never substitute English, advance the page or fake native completion.
    const fail = reason => {
      if (!live(utterance)) return;
      const retryable = ['short','synthesis-failed','voice-unavailable','language-unavailable'].includes(reason);
      const alternative = position === 0 && retryable && triedVoices.size < 3
        ? spanishVoice(synth.getVoices().filter(v => !triedVoices.has(voiceKey(v)))) : null;
      if (!alternative) { finish({ ok: false, reason }); return; }
      clear(); current = null; synth.cancel(); onWord?.(-1); speakChunk(alternative);
    };
    utterance.onerror = event => fail(event.error || 'error');
    utterance.onend = () => {
      if (!live(utterance)) return;
      clear();
      const elapsed = activeMs + (startedAt ? now() - startedAt : 0);
      if (elapsed < Math.min(1200, Math.max(250, chunk.offsets.length * 130))) {
        fail('short'); return;
      }
      position += 1;
      if (position === chunks.length) finish({ ok: true, source: 'device' });
      else speakChunk(voice);
    };
    watchdog = timers.setTimeout(() => {
      finish({ ok: false, reason: 'not-started' }); synth.cancel();
    }, 10000);
    try {
      // cancel() clears queued speech, but does not clear the global paused
      // flag. A new page/book must not inherit a previous narration's pause.
      if (synth.paused) synth.resume();
      synth.speak(utterance);
    } catch { finish({ ok: false, reason: 'unavailable' }); }
  };
  const start = () => {
    if (!synth || !Utterance || !chunks.length) { finish({ ok: false, reason: 'unavailable' }); return; }
    const voice = spanishVoice(synth.getVoices());
    if (voice) { detach(); clear(); speakChunk(voice); return; }
    // Chrome loads its voice list asynchronously. Never fall back to an
    // English voice and report it as Spanish narration.
    if (!voiceListener) {
      voiceListener = start;
      synth.addEventListener?.('voiceschanged', voiceListener);
      watchdog = timers.setTimeout(() => finish({ ok: false, reason: 'spanish-unavailable' }), 4000);
    }
  };
  start();
  return {
    cancel() { cancelled = true; clear(); detach(); current = null; synth?.cancel(); },
    pause() {
      if (paused || cancelled || settled) return;
      paused = true; if (startedAt) activeMs += now() - startedAt;
      startedAt = 0; clear(); synth.pause();
    },
    resume() {
      if (!paused || cancelled || settled) return;
      paused = false; startedAt = now(); synth.resume(); track();
    },
  };
}
