// AudioDirector: buses master/música/sfx sobre WebAudio + voz. La música es
// un loop generativo original (pentatónica), los efectos son sintetizados:
// cero archivos descargados. La narración prioriza audio profesional
// pregrabado (mismo pipeline que el currículo clásico) y cae a la voz del
// dispositivo solo si no hay pista o el archivo falla al cargar.
// Ducking: la música baja al 25 % mientras habla la narradora.

const PREFS_KEY = "tesis20.nido.bosque-audio";

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
const MIN_NARRATION_WATCHDOG_MS = 6_000;
const MAX_NARRATION_WATCHDOG_MS = 30_000;

function narrationWatchdogMs(text, rate, requestedMs) {
  if (Number.isFinite(requestedMs) && requestedMs > 0) {
    return Math.min(
      MAX_NARRATION_WATCHDOG_MS,
      Math.max(MIN_NARRATION_WATCHDOG_MS, requestedMs),
    );
  }

  const words = String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const safeRate = Math.max(0.6, Number(rate) || 0.9);
  return Math.min(
    MAX_NARRATION_WATCHDOG_MS,
    Math.max(
      MIN_NARRATION_WATCHDOG_MS,
      Math.ceil((words * 650) / safeRate + 3_500),
    ),
  );
}

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
 *   speak: (
 *     text: string,
 *     opts?: {
 *       onEnd?: (result: { status: string }) => void,
 *       audioSrc?: string,
 *       rate?: number,
 *       pitch?: number,
 *       watchdogMs?: number,
 *     }
 *   ) => Promise<{ status: "ended"|"error"|"watchdog"|"skipped"|"interrupted"|"cancelled" }>,
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
  let narrationAudio = null;
  let narrationRunId = 0;
  let activeNarration = null;

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

  const settleNarration = (runId, status, { notify = true } = {}) => {
    const active = activeNarration;
    if (!active || active.runId !== runId || active.settled) return false;

    active.settled = true;
    window.clearTimeout(active.watchdogTimer);
    active.watchdogTimer = null;
    if (narrationAudio && active.mode === "audio") {
      narrationAudio.onended = null;
      narrationAudio.onerror = null;
    }
    activeNarration = null;
    speaking = false;
    duckMusic(false);
    const result = { status };
    try {
      if (notify) active.onEnd?.(result);
    } finally {
      active.resolve(result);
    }
    return true;
  };

  const stopActiveNarration = (status, { notify = false } = {}) => {
    const active = activeNarration;
    if (!active) {
      narrationAudio?.pause();
      window.speechSynthesis?.cancel();
      speaking = false;
      duckMusic(false);
      return;
    }

    settleNarration(active.runId, status, { notify });
    narrationAudio?.pause();
    window.speechSynthesis?.cancel();
  };

  const armNarrationWatchdog = (active, durationMs) => {
    if (!active || active.settled) return;
    window.clearTimeout(active.watchdogTimer);
    const safeDuration = Math.max(1, durationMs);
    active.watchdogRemainingMs = safeDuration;
    active.watchdogDeadline = Date.now() + safeDuration;
    active.watchdogTimer = window.setTimeout(() => {
      if (activeNarration?.runId !== active.runId) return;
      settleNarration(active.runId, "watchdog");
      narrationAudio?.pause();
      window.speechSynthesis?.cancel();
    }, safeDuration);
  };

  const pauseNarrationWatchdog = () => {
    const active = activeNarration;
    if (!active || active.settled) return;
    active.watchdogRemainingMs = Math.max(
      1,
      active.watchdogDeadline - Date.now(),
    );
    window.clearTimeout(active.watchdogTimer);
    active.watchdogTimer = null;
  };

  // Campana aditiva: la fundamental más dos parciales inarmónicas. Es lo que
  // separa un premio de un pitido de interfaz, y cuesta tres osciladores.
  const bell = (freq, at, dur, volume) => {
    note(sfxBus, freq, at, dur, volume);
    note(sfxBus, freq * 2.76, at, dur * 0.5, volume * 0.3);
    note(sfxBus, freq * 5.4, at, dur * 0.28, volume * 0.12);
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
    // Mismo arpegio de premio que el currículo, para que los cinco juegos de
    // Nido premien igual: Do–Mi–Sol–Do con timbre de campana.
    success: () => {
      [1046.5, 1318.51, 1567.98, 2093.0].forEach((freq, index) =>
        bell(freq, ctx.currentTime + index * 0.055, 0.5, 0.13 - index * 0.008),
      );
      note(sfxBus, 523.25, ctx.currentTime + 0.17, 0.4, 0.07);
    },
    try: () => {
      note(sfxBus, 311, ctx.currentTime, 0.16, 0.12, "triangle");
      note(sfxBus, 262, ctx.currentTime + 0.14, 0.2, 0.1, "triangle");
    },
    // Fin de ronda. La escala ascendente anterior se quedaba en «bien hecho»;
    // esta es la fanfarria I–V–I de la victoria del currículo, con confeti de
    // campanitas encima, para que ganar suene a ganar.
    celebrate: () => {
      const now = ctx.currentTime;
      const CHORDS = [
        [0, 0.24, [523.25, 659.26, 783.99]],
        [0.26, 0.24, [587.33, 783.99, 987.77]],
        [0.52, 1.0, [523.25, 659.26, 783.99, 1046.5]],
      ];
      for (const [delay, dur, chord] of CHORDS) {
        for (const freq of chord) {
          note(sfxBus, freq, now + delay, dur, 0.1, "triangle");
        }
      }
      [1318.51, 1567.98, 2093.0, 2637.02, 1760.0, 2349.32].forEach(
        (freq, index) => bell(freq, now + 0.56 + index * 0.11, 0.42, 0.075),
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
    speak(
      text,
      {
        onEnd,
        audioSrc,
        rate = 0.9,
        pitch = 1.08,
        watchdogMs,
      } = {},
    ) {
      stopActiveNarration("interrupted");
      narrationRunId += 1;
      const runId = narrationRunId;
      const safeRate = Math.min(1.5, Math.max(0.6, Number(rate) || 0.9));
      const safePitch = Math.min(1.5, Math.max(0.7, Number(pitch) || 1.08));
      const timeoutMs = narrationWatchdogMs(text, safeRate, watchdogMs);

      return new Promise((resolve) => {
        const active = {
          runId,
          mode: null,
          onEnd,
          resolve,
          settled: false,
          paused: false,
          watchdogTimer: null,
          watchdogDeadline: 0,
          watchdogRemainingMs: timeoutMs,
        };
        activeNarration = active;

        if (!prefs.voice) {
          settleNarration(runId, "skipped");
          return;
        }

        speaking = true;
        duckMusic(true);
        armNarrationWatchdog(active, timeoutMs);

        const speakWithDeviceVoice = () => {
          if (activeNarration?.runId !== runId) return;
          if (
            !prefs.voice ||
            !("speechSynthesis" in window) ||
            typeof window.SpeechSynthesisUtterance !== "function"
          ) {
            settleNarration(runId, "error");
            return;
          }

          active.mode = "speech";
          window.speechSynthesis.cancel();
          const utterance = new window.SpeechSynthesisUtterance(text);
          const preferredVoiceNames = [
            "paulina",
            "monica",
            "luciana",
            "elvira",
            "sabina",
            "google español",
          ];
          const spanishVoices = window.speechSynthesis
            .getVoices()
            .filter((voice) => voice.lang.toLowerCase().startsWith("es"));
          const preferredVoice = spanishVoices.find((voice) => {
            const normalizedName = voice.name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
            return preferredVoiceNames.some((name) =>
              normalizedName.includes(name),
            );
          });
          utterance.voice = preferredVoice ?? spanishVoices[0] ?? null;
          utterance.lang = preferredVoice?.lang ?? "es-PE";
          utterance.rate = safeRate;
          utterance.pitch = safePitch;
          utterance.onend = () => settleNarration(runId, "ended");
          utterance.onerror = () => settleNarration(runId, "error");
          window.speechSynthesis.speak(utterance);
        };

        if (!audioSrc) {
          speakWithDeviceVoice();
          return;
        }

        // Narración profesional pregrabada, con respaldo a la voz del
        // dispositivo si el archivo no existe o falla al reproducirse.
        if (!narrationAudio) narrationAudio = new Audio();
        const audio = narrationAudio;
        active.mode = "audio";
        let fallbackStarted = false;
        const fallbackToDevice = () => {
          if (
            fallbackStarted ||
            activeNarration?.runId !== runId ||
            active.settled
          ) {
            return;
          }
          fallbackStarted = true;
          audio.pause();
          audio.onended = null;
          audio.onerror = null;
          speakWithDeviceVoice();
        };
        audio.src = audioSrc;
        audio.currentTime = 0;
        audio.onended = () => settleNarration(runId, "ended");
        audio.onerror = fallbackToDevice;
        void audio.play().catch(fallbackToDevice);
      });
    },
    stopSpeech() {
      narrationRunId += 1;
      stopActiveNarration("cancelled");
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
      if (!on) {
        narrationRunId += 1;
        stopActiveNarration("cancelled");
      }
    },
    prefs: () => ({ ...prefs }),
    suspend() {
      const active = activeNarration;
      if (active && !active.paused) {
        active.paused = true;
        pauseNarrationWatchdog();
        if (active.mode === "audio") narrationAudio?.pause();
        else if (active.mode === "speech") window.speechSynthesis?.pause();
      }
      if (ctx?.state === "running") void ctx.suspend().catch(() => {});
    },
    resume() {
      const active = activeNarration;
      if (active?.paused) {
        active.paused = false;
        armNarrationWatchdog(active, active.watchdogRemainingMs);
        if (active.mode === "audio") {
          void narrationAudio
            ?.play()
            .catch(() => settleNarration(active.runId, "error"));
        } else if (active.mode === "speech") {
          window.speechSynthesis?.resume();
        }
      }
      if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
    },
    destroy() {
      narrationRunId += 1;
      window.clearInterval(musicTimer);
      musicTimer = null;
      stopActiveNarration("cancelled");
      if (narrationAudio) {
        narrationAudio.pause();
        narrationAudio.removeAttribute("src");
        narrationAudio = null;
      }
      window.speechSynthesis?.cancel();
      if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {});
      ctx = null;
    },
  };
}
