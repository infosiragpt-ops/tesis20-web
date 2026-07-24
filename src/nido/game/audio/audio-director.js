// AudioDirector: buses master/música/sfx sobre WebAudio + voz por
// speechSynthesis. La música es un loop generativo original (pentatónica),
// los efectos son sintetizados: cero archivos descargados.
// Ducking: la música baja al 25 % mientras habla la narradora.

const PREFS_KEY = "tesis20.nido.bosque-audio";

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

function loadPrefs() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PREFS_KEY));
    if (stored && typeof stored === "object") {
      return { music: stored.music !== false, voice: stored.voice !== false };
    }
  } catch {
    // Preferencias por defecto.
  }
  return { music: true, voice: true };
}

/**
 * @returns {{
 *   start: () => void,
 *   playMusic: () => void,
 *   sfx: (name: "jump"|"collect"|"deposit"|"success"|"try"|"celebrate"|"count") => void,
 *   speak: (text: string, opts?: { onEnd?: () => void }) => void,
 *   stopSpeech: () => void,
 *   setMusicEnabled: (on: boolean) => void,
 *   setVoiceEnabled: (on: boolean) => void,
 *   prefs: () => { music: boolean, voice: boolean },
 *   suspend: () => void,
 *   resume: () => void,
 *   destroy: () => void,
 * }}
 */
export function createAudioDirector() {
  let ctx = null;
  let master = null;
  let musicBus = null;
  let sfxBus = null;
  let musicTimer = null;
  let musicStep = 0;
  let speaking = false;
  let prefs = loadPrefs();

  const persist = () => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Sin persistencia seguimos funcionando.
    }
  };

  const ensureContext = () => {
    if (ctx) return true;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = prefs.music ? 0.3 : 0;
    musicBus.connect(master);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.7;
    sfxBus.connect(master);
    return true;
  };

  const note = (bus, freq, at, duration, volume, type = "sine") => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(at);
    osc.stop(at + duration + 0.05);
  };

  const duckMusic = (down) => {
    if (!ctx || !musicBus) return;
    const target = down ? 0.075 : prefs.music ? 0.3 : 0;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(
      Math.max(target, 0.0001),
      ctx.currentTime + (down ? 0.25 : 0.9),
    );
  };

  const SFX = {
    jump: () => note(sfxBus, 420, ctx.currentTime, 0.16, 0.16, "triangle"),
    collect: () => {
      note(sfxBus, 660, ctx.currentTime, 0.09, 0.16);
      note(sfxBus, 990, ctx.currentTime + 0.07, 0.12, 0.14);
    },
    deposit: () => {
      note(sfxBus, 330, ctx.currentTime, 0.12, 0.18, "triangle");
      note(sfxBus, 494, ctx.currentTime + 0.08, 0.14, 0.14);
    },
    count: () => note(sfxBus, 784, ctx.currentTime, 0.13, 0.18),
    success: () => {
      note(sfxBus, 659, ctx.currentTime, 0.16, 0.16);
      note(sfxBus, 784, ctx.currentTime + 0.1, 0.18, 0.16);
      note(sfxBus, 1047, ctx.currentTime + 0.22, 0.3, 0.18);
    },
    try: () => {
      note(sfxBus, 311, ctx.currentTime, 0.16, 0.12, "triangle");
      note(sfxBus, 262, ctx.currentTime + 0.14, 0.2, 0.1, "triangle");
    },
    celebrate: () => {
      [523, 659, 784, 1047, 1319].forEach((freq, index) =>
        note(sfxBus, freq, ctx.currentTime + index * 0.09, 0.22, 0.15),
      );
    },
  };

  return {
    start() {
      if (!ensureContext()) return;
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    },
    playMusic() {
      if (!ctx || musicTimer) return;
      // Arpegio pentatónico suave, programado por pasos: loop sin cortes.
      musicTimer = window.setInterval(() => {
        if (!ctx || ctx.state !== "running") return;
        const at = ctx.currentTime + 0.05;
        const base = PENTATONIC[musicStep % PENTATONIC.length];
        const melody =
          PENTATONIC[(musicStep * 3 + (musicStep % 5)) % PENTATONIC.length];
        note(musicBus, base / 2, at, 0.6, 0.5, "sine");
        if (musicStep % 2 === 0) note(musicBus, melody, at + 0.1, 0.45, 0.32);
        musicStep += 1;
      }, 640);
    },
    sfx(name) {
      if (!ctx) return;
      try {
        SFX[name]?.();
      } catch {
        // El silencio de un efecto no interrumpe el juego.
      }
    },
    speak(text, { onEnd } = {}) {
      if (!prefs.voice || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "es-PE";
      utterance.rate = 0.9;
      utterance.pitch = 1.08;
      speaking = true;
      duckMusic(true);
      const finish = () => {
        if (!speaking) return;
        speaking = false;
        duckMusic(false);
        onEnd?.();
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    },
    stopSpeech() {
      window.speechSynthesis?.cancel();
      speaking = false;
      duckMusic(false);
    },
    setMusicEnabled(on) {
      prefs = { ...prefs, music: on };
      persist();
      if (ctx && musicBus) {
        musicBus.gain.cancelScheduledValues(ctx.currentTime);
        musicBus.gain.linearRampToValueAtTime(
          on ? 0.3 : 0.0001,
          ctx.currentTime + 0.3,
        );
      }
    },
    setVoiceEnabled(on) {
      prefs = { ...prefs, voice: on };
      persist();
      if (!on) window.speechSynthesis?.cancel();
    },
    prefs: () => ({ ...prefs }),
    suspend() {
      window.speechSynthesis?.cancel();
      if (ctx?.state === "running") void ctx.suspend().catch(() => {});
    },
    resume() {
      if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
    },
    destroy() {
      window.clearInterval(musicTimer);
      musicTimer = null;
      window.speechSynthesis?.cancel();
      if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {});
      ctx = null;
    },
  };
}
