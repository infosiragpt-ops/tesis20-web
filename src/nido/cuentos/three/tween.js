// Motor de interpolación mínimo para la escena: sin dependencias, con easing
// y encadenado. Se actualiza desde el bucle de render de la escena.

const active = new Set();

export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  outBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  outBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * tween(target, to, opts): interpola propiedades numéricas de `target`
 * (por ejemplo un Vector3 o un Euler) hasta `to`.
 * opts: { duration (s), delay (s), easing, onUpdate(t), onComplete() }
 */
export function tween(target, to, { duration = 0.6, delay = 0, easing = ease.inOut, onUpdate, onComplete } = {}) {
  const from = {};
  Object.keys(to).forEach((key) => {
    from[key] = target[key];
  });
  const job = {
    target,
    from,
    to,
    duration: Math.max(0.0001, duration),
    delay,
    easing,
    onUpdate,
    onComplete,
    start: undefined,
    done: false,
    cancel() {
      this.done = true;
      active.delete(this);
    },
  };
  // Un tween nuevo sobre el mismo objeto y las mismas claves sustituye al anterior.
  active.forEach((other) => {
    if (other.target === target && Object.keys(to).some((key) => key in other.to)) other.cancel();
  });
  active.add(job);
  return job;
}

/** Espera `seconds` y ejecuta `fn`, dentro del reloj de la escena. */
export function after(seconds, fn) {
  return tween({ t: 0 }, { t: 1 }, { duration: seconds, easing: ease.linear, onComplete: fn });
}

/**
 * Avanza los tweens con el reloj absoluto (`now` en segundos). Así la
 * animación dura lo mismo aunque el dispositivo dibuje pocos frames.
 */
export function updateTweens(now) {
  active.forEach((job) => {
    if (job.done) return;
    if (job.start === undefined) job.start = now;
    const local = now - job.start - job.delay;
    if (local < 0) return;
    const t = Math.min(1, local / job.duration);
    const k = job.easing(t);
    Object.keys(job.to).forEach((key) => {
      job.target[key] = job.from[key] + (job.to[key] - job.from[key]) * k;
    });
    job.onUpdate?.(k, t);
    if (t >= 1) {
      job.done = true;
      active.delete(job);
      job.onComplete?.();
    }
  });
}

export function cancelAllTweens() {
  active.forEach((job) => job.cancel());
  active.clear();
}
