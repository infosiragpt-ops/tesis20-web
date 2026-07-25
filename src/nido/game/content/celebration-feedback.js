// Refuerzos positivos breves y variados. Se eligen de forma determinista para
// que una misma ronda sea estable, pero las 20 actividades no repitan siempre
// el mismo “¡Yupi!”. Los perfiles de voz añaden intención sin acelerar de más
// la locución para los niños pequeños.

export const SUCCESS_CELEBRATIONS = Object.freeze([
  Object.freeze({
    id: "lo-lograste",
    headline: "¡Lo lograsteee!",
    spokenText: "¡Lo lograste! ¡Qué gran trabajo!",
    caption: "Tu esfuerzo hizo brillar esta respuesta.",
    burst: "stars",
    pitch: 1.13,
    rateOffset: -0.03,
  }),
  Object.freeze({
    id: "yupiii",
    headline: "¡Yupiiii!",
    spokenText: "¡Yupiii! ¡Encontraste la respuesta!",
    caption: "Una lluvia de color para celebrar contigo.",
    burst: "confetti",
    pitch: 1.19,
    rateOffset: -0.05,
  }),
  Object.freeze({
    id: "excelente",
    headline: "¡Excelente!",
    spokenText: "¡Excelente! ¡Lo pensaste muy bien!",
    caption: "Observaste, pensaste y lo conseguiste.",
    burst: "sparkles",
    pitch: 1.08,
    rateOffset: 0.01,
  }),
  Object.freeze({
    id: "super-bien",
    headline: "¡Súper bieeen!",
    spokenText: "¡Súper bien! ¡Sigue así, gran estrella!",
    caption: "Tu aventura de aprendizaje sigue creciendo.",
    burst: "balloons",
    pitch: 1.16,
    rateOffset: -0.01,
  }),
  Object.freeze({
    id: "bravo",
    headline: "¡Bravo!",
    spokenText: "¡Bravo! ¡Respuesta perfecta!",
    caption: "Una respuesta clara y valiente.",
    burst: "ribbons",
    pitch: 1.1,
    rateOffset: 0.03,
  }),
  Object.freeze({
    id: "increible",
    headline: "¡Increíble!",
    spokenText: "¡Increíble! ¡Cada vez lo haces mejor!",
    caption: "Mira cuánto estás aprendiendo.",
    burst: "candy",
    pitch: 1.2,
    rateOffset: -0.02,
  }),
  Object.freeze({
    id: "mision-cumplida",
    headline: "¡Misión cumplida!",
    spokenText: "¡Misión cumplida! ¡Choca esos cinco!",
    caption: "Superaste el reto con mucha atención.",
    burst: "high-five",
    pitch: 1.07,
    rateOffset: 0.02,
  }),
  Object.freeze({
    id: "fantastico",
    headline: "¡Fantástico!",
    spokenText: "¡Fantástico! ¡Tu cerebro está brillando!",
    caption: "Una idea brillante merece una gran fiesta.",
    burst: "sparkles",
    pitch: 1.14,
    rateOffset: 0,
  }),
  Object.freeze({
    id: "genial",
    headline: "¡Geniaaal!",
    spokenText: "¡Genial! ¡Ganaste otra estrellita!",
    caption: "Guardamos otra estrella en tu camino.",
    burst: "stars",
    pitch: 1.18,
    rateOffset: -0.04,
  }),
  Object.freeze({
    id: "eso-es",
    headline: "¡Eso es!",
    spokenText: "¡Eso es! ¡Vas con todo!",
    caption: "Tu respuesta llegó justo al lugar correcto.",
    burst: "confetti",
    pitch: 1.09,
    rateOffset: 0.04,
  }),
  Object.freeze({
    id: "lo-conseguiste",
    headline: "¡Lo conseguisteee!",
    spokenText: "¡Lo conseguiste! ¡Qué emoción!",
    caption: "Cada intento te hace más fuerte.",
    burst: "balloons",
    pitch: 1.17,
    rateOffset: -0.03,
  }),
  Object.freeze({
    id: "que-buena-idea",
    headline: "¡Qué buena idea!",
    spokenText: "¡Qué buena idea! ¡Diste con la respuesta!",
    caption: "Tu curiosidad encontró el camino.",
    burst: "candy",
    pitch: 1.11,
    rateOffset: 0.01,
  }),
]);

// Festejos de racha. El titular sí lleva el número de aciertos seguidos, pero
// lo hablado se mantiene fijo: una frase con un número variable no se puede
// grabar en estudio y volvería a caer en la voz sintética del navegador.
export const STREAK_CELEBRATIONS = Object.freeze([
  Object.freeze({
    id: "racha-imparable",
    spokenText: "¡Qué racha! ¡Estás imparable!",
    caption: "Tu racha encendió una fiesta de estrellas.",
    burst: "stars",
    pitch: 1.21,
    rateOffset: -0.02,
  }),
  Object.freeze({
    id: "racha-estrella",
    spokenText: "¡Una seguida de otra! ¡Eres una gran estrella!",
    caption: "Cada acierto suma otra estrella a tu camino.",
    burst: "sparkles",
    pitch: 1.18,
    rateOffset: -0.04,
  }),
  Object.freeze({
    id: "racha-fuego",
    spokenText: "¡Wooow! ¡No fallas ni una! ¡Sigue, sigue!",
    caption: "Nadie te detiene: vas de acierto en acierto.",
    burst: "confetti",
    pitch: 1.23,
    rateOffset: -0.03,
  }),
]);

export function pickStreakCelebration(seed, streak) {
  const index = celebrationSeed(`racha|${seed}`) % STREAK_CELEBRATIONS.length;
  const celebration = STREAK_CELEBRATIONS[index];
  return { ...celebration, headline: `¡${streak} seguidas!` };
}

// Festejo de quien llegó tras equivocarse: celebra la insistencia, no el
// acierto limpio. Texto fijo para que también se grabe en estudio.
export const PERSISTENCE_CELEBRATION = Object.freeze({
  id: "no-te-rendiste",
  spokenText: "¡Lo lograste! ¡No te rendiste y encontraste la respuesta!",
  caption: "Seguiste intentando hasta conseguirlo.",
  pitch: 1.15,
  rateOffset: -0.02,
});

// Clave con la que cada festejo viaja en el manifiesto de audio. El prefijo
// evita chocar con los ids de reto y la comparten generador, verificador y
// reproductor: si cambia aquí, cambia en los tres a la vez.
export function celebrationAudioKey(celebrationId) {
  return `celebracion-${celebrationId}`;
}

const AGE_VOICE_PROFILES = Object.freeze({
  "2-3": Object.freeze({ rate: 0.83, pitchBoost: 0.02 }),
  "4-5": Object.freeze({ rate: 0.9, pitchBoost: 0.01 }),
  6: Object.freeze({ rate: 0.96, pitchBoost: 0 }),
});

export function celebrationSeed(value) {
  const text = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickSuccessCelebration(seed, streak = 0) {
  const numericStreak = Math.max(0, Number(streak) || 0);
  const offset = numericStreak >= 5 ? 4 : numericStreak >= 3 ? 2 : 0;
  const index =
    (celebrationSeed(`${seed}|${numericStreak}`) + offset) %
    SUCCESS_CELEBRATIONS.length;
  return SUCCESS_CELEBRATIONS[index];
}

export function getCelebrationVoiceProfile(ageId, celebration) {
  const profile = AGE_VOICE_PROFILES[ageId] ?? AGE_VOICE_PROFILES["4-5"];
  return {
    rate: Math.min(
      1.04,
      Math.max(0.76, profile.rate + (celebration?.rateOffset ?? 0)),
    ),
    pitch: Math.min(
      1.28,
      Math.max(0.96, (celebration?.pitch ?? 1.1) + profile.pitchBoost),
    ),
  };
}
