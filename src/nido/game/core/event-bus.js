// Contrato de eventos plataforma <-> juego. El motor nunca escribe progreso:
// emite GAME_TO_PLATFORM y el shell decide cómo persistir.

/** Eventos que la plataforma puede enviar al juego. */
export const PLATFORM_TO_GAME = Object.freeze({
  START_GAME: "START_GAME",
  PAUSE_GAME: "PAUSE_GAME",
  RESUME_GAME: "RESUME_GAME",
  SET_VOLUME: "SET_VOLUME",
  LOAD_LEVEL: "LOAD_LEVEL",
});

/** Eventos que el juego emite hacia la plataforma. */
export const GAME_TO_PLATFORM = Object.freeze({
  GAME_READY: "GAME_READY",
  LEVEL_STARTED: "LEVEL_STARTED",
  OBJECT_COLLECTED: "OBJECT_COLLECTED",
  ANSWER_SUBMITTED: "ANSWER_SUBMITTED",
  HINT_USED: "HINT_USED",
  LEVEL_COMPLETED: "LEVEL_COMPLETED",
  GAME_PAUSED: "GAME_PAUSED",
  GAME_EXITED: "GAME_EXITED",
  GAME_ERROR: "GAME_ERROR",
});

/**
 * Bus de eventos mínimo con limpieza total para evitar fugas al desmontar.
 *
 * @returns {{
 *   on: (type: string, handler: (payload?: object) => void) => () => void,
 *   emit: (type: string, payload?: object) => void,
 *   clear: () => void,
 * }}
 */
export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const handlers = new Map();

  return {
    on(type, handler) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type).add(handler);
      return () => handlers.get(type)?.delete(handler);
    },
    emit(type, payload) {
      handlers.get(type)?.forEach((handler) => {
        try {
          handler(payload);
        } catch {
          // Un oyente roto no debe tumbar el ciclo del juego.
        }
      });
    },
    clear() {
      handlers.clear();
    },
  };
}
