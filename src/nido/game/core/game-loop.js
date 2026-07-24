// Ciclo de juego con paso fijo (accumulator) y render interpolable.
// Pausa automática al ocultar la pestaña y teardown completo (sin RAF ni
// listeners vivos después de destroy()).

const FIXED_STEP = 1 / 120;
const MAX_FRAME = 0.25;

/**
 * @param {{
 *   update: (dt: number) => void,
 *   render: (alpha: number) => void,
 *   onAutoPause?: () => void,
 * }} hooks
 */
export function createGameLoop({ update, render, onAutoPause }) {
  let rafId = 0;
  let running = false;
  let paused = false;
  let lastTime = 0;
  let accumulator = 0;

  const frame = (time) => {
    if (!running) return;
    rafId = window.requestAnimationFrame(frame);
    if (paused) {
      lastTime = time;
      return;
    }
    const delta = Math.min((time - lastTime) / 1000, MAX_FRAME);
    lastTime = time;
    accumulator += delta;
    while (accumulator >= FIXED_STEP) {
      update(FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
    render(accumulator / FIXED_STEP);
  };

  const handleVisibility = () => {
    if (document.hidden && running && !paused) {
      paused = true;
      onAutoPause?.();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return {
    start() {
      if (running) return;
      running = true;
      paused = false;
      lastTime = performance.now();
      accumulator = 0;
      rafId = window.requestAnimationFrame(frame);
    },
    pause() {
      paused = true;
    },
    resume() {
      if (!running) return;
      paused = false;
      lastTime = performance.now();
    },
    isPaused: () => paused,
    destroy() {
      running = false;
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibility);
    },
  };
}
