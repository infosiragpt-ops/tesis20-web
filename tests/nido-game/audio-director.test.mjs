import assert from "node:assert/strict";
import test from "node:test";

import { createAudioDirector } from "../../src/nido/game/audio/audio-director.js";

function installAudioEnvironment() {
  const previousWindow = globalThis.window;
  const previousAudio = globalThis.Audio;
  const timers = new Map();
  const spoken = [];
  const audioInstances = [];
  let nextTimerId = 1;

  class FakeUtterance {
    constructor(text) {
      this.text = text;
      this.onend = null;
      this.onerror = null;
    }
  }

  class FakeAudio {
    constructor() {
      this.currentTime = 0;
      this.onerror = null;
      this.onended = null;
      this.src = "";
      this.paused = false;
      audioInstances.push(this);
    }

    pause() {
      this.paused = true;
    }

    play() {
      this.paused = false;
      return Promise.resolve();
    }

    removeAttribute(name) {
      if (name === "src") this.src = "";
    }
  }

  globalThis.window = {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
    },
    setTimeout(callback, milliseconds) {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, { callback, milliseconds });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    setInterval: () => 1,
    clearInterval: () => {},
    SpeechSynthesisUtterance: FakeUtterance,
    speechSynthesis: {
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      getVoices: () => [{ name: "Paulina", lang: "es-PE" }],
      speak(utterance) {
        spoken.push(utterance);
      },
    },
  };
  globalThis.Audio = FakeAudio;

  return {
    audioInstances,
    spoken,
    timers,
    restore() {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousAudio === undefined) delete globalThis.Audio;
      else globalThis.Audio = previousAudio;
    },
  };
}

test("speak devuelve una promesa que termina con la voz del dispositivo", async () => {
  const environment = installAudioEnvironment();
  const director = createAudioDirector();

  try {
    const completion = director.speak("¡Lo lograste!", {
      rate: 0.82,
      pitch: 1.2,
    });
    assert.equal(environment.spoken.length, 1);
    assert.equal(environment.spoken[0].rate, 0.82);
    assert.equal(environment.spoken[0].pitch, 1.2);

    environment.spoken[0].onend();
    assert.deepEqual(await completion, { status: "ended" });
    assert.equal(environment.timers.size, 0);
  } finally {
    director.destroy();
    environment.restore();
  }
});

test("una locución reemplazada resuelve como interrumpida sin dejar promesas colgadas", async () => {
  const environment = installAudioEnvironment();
  const director = createAudioDirector();
  let firstOnEndCalls = 0;

  try {
    const first = director.speak("Primera voz", {
      onEnd: () => {
        firstOnEndCalls += 1;
      },
    });
    const second = director.speak("Segunda voz");

    assert.deepEqual(await first, { status: "interrupted" });
    assert.equal(firstOnEndCalls, 0);
    assert.equal(environment.spoken.length, 2);

    environment.spoken[1].onend();
    assert.deepEqual(await second, { status: "ended" });
  } finally {
    director.destroy();
    environment.restore();
  }
});

test("el audio profesional resuelve únicamente al recibir ended", async () => {
  const environment = installAudioEnvironment();
  const director = createAudioDirector();

  try {
    const completion = director.speak("Felicitación profesional", {
      audioSrc: "/celebracion.mp3",
    });
    assert.equal(environment.audioInstances.length, 1);
    const [audio] = environment.audioInstances;
    assert.equal(audio.src, "/celebracion.mp3");

    audio.onended();
    assert.deepEqual(await completion, { status: "ended" });
  } finally {
    director.destroy();
    environment.restore();
  }
});

test("el watchdog libera la secuencia si el navegador no emite onend", async () => {
  const environment = installAudioEnvironment();
  const director = createAudioDirector();

  try {
    const completion = director.speak("Voz sin evento final", {
      watchdogMs: 6_000,
    });
    const watchdog = [...environment.timers.values()].find(
      (timer) => timer.milliseconds === 6_000,
    );
    assert.ok(watchdog, "debe armar un watchdog de seguridad");

    watchdog.callback();
    assert.deepEqual(await completion, { status: "watchdog" });
  } finally {
    director.destroy();
    environment.restore();
  }
});
