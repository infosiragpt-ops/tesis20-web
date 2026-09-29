// Story clock: the one time base that narrative motion follows (WP1).
//
// Pure module (no DOM); `now` is injectable so tests can drive it.
//
// Modes
// - 'studio': follows the narrator's <audio>. `currentTime` arrives once per
//   animation frame through `pushAudioTime` and is often quantised (Safari
//   and Firefox report it in steps of tens of milliseconds), so the clock runs
//   on the frame time and only uses the reports to learn the offset between
//   the audio and `performance.now()`. It freezes within `horizon` seconds
//   when the audio stops reporting (pause, hidden tab, stall), snaps on seeks
//   and never runs backwards except after a real backward seek (`seeked`).
// - 'device': device voice. Word boundaries (`pushWord`) anchor the clock on
//   the estimated word starts; between them it runs on the frame time but
//   never passes the next boundary before that word is announced.
// - 'wall': seconds since `reset`, for manual reading.

export function createStoryClock({ now = () => performance.now(), snap = 0.12, gain = 0.15, horizon = 0.25, drift = 0.002 } = {}) {
  let mode = null;
  let out = null;
  let seekPending = false;
  let seekedOut = false;
  let playing = false;

  // studio
  let est = null;
  let lastFrameMs = null;
  let lastAudio = null;
  let lastAudioAtMs = 0;
  let prevPushMs = 0;
  let advancing = false;
  // Offset (audio seconds − frame seconds) is known to lie in [lo, hi]:
  // a report `a` at time t means the audio had reached `a` by t (lower
  // bound) and had not reached it at the previous report (upper bound).
  let lo = -Infinity;
  let hi = Infinity;
  let boundsAtMs = 0;
  // How far reports scatter below the bound: ~0 for a precise clock, about
  // the reporting step for a quantised one.
  let jitter = 0;
  // Largest recent jump between two reports: the audio may be this far ahead
  // of its last report without the clock being wrong.
  let step = 0;
  let samples = 0;
  // Seen the same report on two frames: the audio clock is coarser than a frame.
  let coarse = false;

  // device
  let starts = null;
  let duration = Infinity;
  let wordIndex = -1;
  let anchorMs = 0;

  // wall
  let wallStartMs = 0;

  function clearBounds() {
    lo = -Infinity;
    hi = Infinity;
    jitter = 0;
    step = 0;
    samples = 0;
    coarse = false;
  }

  function reset(nextMode = null, { starts: nextStarts = null, duration: nextDuration } = {}) {
    mode = nextMode === "studio" || nextMode === "device" || nextMode === "wall" ? nextMode : null;
    out = null;
    seekPending = false;
    seekedOut = false;
    playing = mode === "wall";
    est = null;
    lastFrameMs = null;
    lastAudio = null;
    advancing = false;
    clearBounds();
    starts = Array.isArray(nextStarts) && nextStarts.length ? nextStarts : null;
    duration = Number.isFinite(nextDuration) ? nextDuration : Infinity;
    wordIndex = -1;
    wallStartMs = now();
  }

  function pushAudioTime(sec, isPlaying = true) {
    if (mode !== "studio" || !Number.isFinite(sec)) return;
    const t = now();
    playing = isPlaying !== false;
    if (lastAudio === null) {
      lastAudio = sec;
      lastAudioAtMs = prevPushMs = t;
      est = sec;
      return;
    }
    if (sec === lastAudio) {
      // A repeated report carries no new time; it only shows the clock is
      // quantised.
      prevPushMs = t;
      if (advancing) coarse = true;
      return;
    }
    // `est` is the story time at the last sampled frame; `since` brings it to now.
    const since = lastFrameMs !== null ? Math.max(0, t - lastFrameMs) / 1000 : 0;
    if (out !== null && sec < out - 0.25) {
      // Replay or backward seek: restart from there and tell the consumer.
      est = sec - since;
      seekPending = true;
      clearBounds();
    } else {
      const estNow = est + (advancing && playing ? since : 0);
      if (!advancing || Math.abs(sec - estNow) > snap) {
        // First movement of the audio, a forward seek or a stall: start over.
        est = sec - since;
        clearBounds();
      }
      const newLo = sec - t / 1000;
      const newHi = advancing && sec > lastAudio ? sec - prevPushMs / 1000 : Infinity;
      if (Number.isFinite(lo)) {
        const relax = (drift * Math.max(0, t - boundsAtMs)) / 1000;
        lo -= relax;
        hi += relax;
        jitter = Math.max(jitter * 0.99, lo - newLo);
      }
      samples = Math.min(samples + 1, 60);
      if (advancing && sec > lastAudio) step = Math.min(horizon, Math.max(step * 0.995, sec - lastAudio));
      boundsAtMs = t;
      lo = Math.max(lo, newLo);
      hi = Math.min(hi, newHi);
      if (lo > hi) {
        // The audio and frame clocks slipped (buffering, rate change).
        lo = newLo;
        hi = newHi;
      }
    }
    advancing = true;
    lastAudio = sec;
    lastAudioAtMs = prevPushMs = t;
  }

  function pushWord(trackIndex) {
    if (mode !== "device" || !starts || !Number.isInteger(trackIndex) || trackIndex < 0 || trackIndex >= starts.length) return;
    if (out !== null && starts[trackIndex] < out - 0.25) seekPending = true;
    wordIndex = trackIndex;
    anchorMs = now();
    playing = true;
  }

  function sampleStudio(frameMs) {
    if (lastAudio === null) return null;
    if (!advancing || lastFrameMs === null) {
      lastFrameMs = frameMs;
      return est;
    }
    if (playing) est += (frameMs - lastFrameMs) / 1000;
    lastFrameMs = frameMs;
    if (playing && Number.isFinite(lo)) {
      // A coarse clock is best read at the middle of the known interval. A
      // fine one mostly at its lower bound, which still sits about
      // jitter/(n+1) below the truth.
      const half = Number.isFinite(hi) ? (hi - lo) / 2 : 0;
      const offset = lo + (coarse ? half : Math.min(half, jitter / (samples + 1)));
      est += gain * (frameMs / 1000 + offset - est);
    }
    // Never run more than `horizon` past the last time the audio moved.
    const cap = lastAudio + Math.min(horizon, Math.max(0, (frameMs - lastAudioAtMs) / 1000) + step);
    if (est > cap) est = cap;
    return est;
  }

  function sampleDevice(frameMs) {
    if (!starts || wordIndex < 0) return null;
    const from = starts[wordIndex];
    const next = wordIndex + 1 < starts.length ? starts[wordIndex + 1] : duration;
    const value = from + Math.max(0, frameMs - anchorMs) / 1000;
    return Math.max(from, Math.min(value, next - 0.01));
  }

  function sample(frameMs) {
    let value = null;
    if (mode === "studio") value = sampleStudio(frameMs);
    else if (mode === "device") value = sampleDevice(frameMs);
    else if (mode === "wall") value = Math.max(0, (frameMs - wallStartMs) / 1000);
    seekedOut = false;
    if (value === null || !Number.isFinite(value)) return out;
    if (seekPending) {
      seekPending = false;
      seekedOut = true;
      out = value;
    } else {
      out = out === null ? value : Math.max(out, value);
    }
    return out;
  }

  return {
    reset,
    pushAudioTime,
    pushWord,
    sample,
    get mode() {
      return mode;
    },
    get playing() {
      if (mode === "studio") return playing && advancing;
      if (mode === "device") return wordIndex >= 0;
      return mode === "wall";
    },
    /** True for the one sample that follows a backward seek or a replay. */
    get seeked() {
      return seekedOut;
    },
    get time() {
      return out;
    },
  };
}
