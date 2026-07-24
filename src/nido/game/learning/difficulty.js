// Dificultad adaptativa explicable (sin IA opaca):
// - 3 aciertos seguidos suben un nivel (hasta el máximo del perfil de edad).
// - 2 errores consecutivos activan la ayuda visual.
// - 3 errores consecutivos bajan un nivel temporalmente.
// - El tiempo nunca penaliza. Dominio educativo separado de puntuación lúdica.

/**
 * @param {{ minLevel?: number, maxLevel?: number }} [options]
 * @returns {{
 *   level: () => number,
 *   helpActive: () => boolean,
 *   recordSuccess: () => { levelUp: boolean },
 *   recordError: () => { help: boolean, levelDown: boolean },
 *   resetRound: () => void,
 *   summary: () => { attempts: number, successes: number, errors: number, helps: number },
 * }}
 */
export function createDifficultyAdapter({ minLevel = 0, maxLevel = 2 } = {}) {
  let level = minLevel;
  let streak = 0;
  let consecutiveErrors = 0;
  let helpActive = false;
  const totals = { attempts: 0, successes: 0, errors: 0, helps: 0 };

  return {
    level: () => level,
    helpActive: () => helpActive,
    recordSuccess() {
      totals.attempts += 1;
      totals.successes += 1;
      streak += 1;
      consecutiveErrors = 0;
      helpActive = false;
      if (streak >= 3 && level < maxLevel) {
        level += 1;
        streak = 0;
        return { levelUp: true };
      }
      return { levelUp: false };
    },
    recordError() {
      totals.attempts += 1;
      totals.errors += 1;
      streak = 0;
      consecutiveErrors += 1;
      let help = false;
      let levelDown = false;
      if (consecutiveErrors >= 2 && !helpActive) {
        helpActive = true;
        help = true;
        totals.helps += 1;
      }
      if (consecutiveErrors >= 3 && level > minLevel) {
        level -= 1;
        consecutiveErrors = 0;
        levelDown = true;
      }
      return { help, levelDown };
    },
    resetRound() {
      consecutiveErrors = 0;
      helpActive = false;
    },
    summary: () => ({ ...totals }),
  };
}
