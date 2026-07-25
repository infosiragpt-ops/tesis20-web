// GameHost de "Atrapa y Cuenta": objetos caen, el niño mueve una cesta para
// atrapar la cantidad correcta del sticker objetivo. DOM+CSS (sin canvas):
// reutiliza el catálogo de stickers ya ilustrado. Motor compartido
// (game-loop, audio-director, difficulty) con Misión del Bosque.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAudioDirector } from "../audio/audio-director.js";
import { createGameLoop } from "../core/game-loop.js";
import { createDifficultyAdapter } from "../learning/difficulty.js";
import {
  CATCH_EXPERT_ROUND_INDEX,
  CATCH_ROUNDS,
  CATCH_THEMES,
  cieloSecondaryTarget,
  createCatchRound,
  formasAttributeTargets,
  huertoTargetSwitch,
} from "../content/catch-mission.js";
import {
  getCelebrationVoiceProfile,
  pickSuccessCelebration,
} from "../content/celebration-feedback.js";
import { STICKERS } from "../../stickers/sticker-registry.jsx";
import "./catch-game.css";

const DEFAULT_STAGE_WIDTH = 720;
const DEFAULT_STAGE_HEIGHT = 540;
const BASKET_WIDTH = 92;
const BASKET_HEIGHT = 60;
const BASKET_BOTTOM_DESKTOP = 34;
const BASKET_BOTTOM_PORTRAIT = 112;
const ITEM_SIZE = 56;
const CELEBRATION_LEAD_IN_MS = 540;
const CELEBRATION_DWELL_MS = 700;
const CELEBRATION_WATCHDOG_MS = 12_000;

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {{
 *   themeId: string, ageId: "2-3"|"4-5"|"6", initialRound?: number,
 *   onRoundComplete?: (n:number)=>void, onMissionComplete?: (s:object)=>void,
 *   onExit?: () => void,
 * }} props
 */
export default function CatchGame({
  themeId,
  ageId = "2-3",
  initialRound = 0,
  onRoundComplete,
  onMissionComplete,
  onExit,
}) {
  const theme = useMemo(
    () => CATCH_THEMES.find((item) => item.id === themeId) ?? CATCH_THEMES[0],
    [themeId],
  );
  const [phase, setPhase] = useState("intro");
  const [paused, setPaused] = useState(false);
  const [roundIndex, setRoundIndex] = useState(Math.min(initialRound, CATCH_ROUNDS - 1));
  const [caught, setCaught] = useState(0);
  const [audioPrefs, setAudioPrefs] = useState({ music: true, voice: true });
  const [missionSummary, setMissionSummary] = useState(null);
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [celebration, setCelebration] = useState(null);

  const audioRef = useRef(null);
  const adapterRef = useRef(null);
  const loopRef = useRef(null);
  const stageRef = useRef(null);
  const stageMetricsRef = useRef({
    width: DEFAULT_STAGE_WIDTH,
    height: DEFAULT_STAGE_HEIGHT,
    basketY:
      DEFAULT_STAGE_HEIGHT - BASKET_BOTTOM_DESKTOP - BASKET_HEIGHT,
    basketWidth: BASKET_WIDTH,
    basketHeight: BASKET_HEIGHT,
    itemSize: ITEM_SIZE,
  });
  const celebrationRunRef = useRef(0);
  const phaseRef = useRef("intro");
  phaseRef.current = phase;

  const round = useMemo(
    () => createCatchRound({ themeId: theme.id, ageId, roundIndex }),
    [ageId, roundIndex, theme.id],
  );

  // Variantes propias por mundo, derivadas de la ronda actual (ver
  // catch-mission.js): Cielo suma un segundo objetivo con doble puntaje,
  // Formas cambia el objetivo por "figuras con N lados".
  const secondaryTarget = useMemo(
    () => cieloSecondaryTarget({ themeId: theme.id, theme, roundIndex, target: round.target, count: round.count }),
    [theme, roundIndex, round.target, round.count],
  );
  const attributeMode = useMemo(
    () => formasAttributeTargets({ themeId: theme.id, theme, roundIndex, target: round.target }),
    [theme, roundIndex, round.target],
  );

  const stateRef = useRef({
    items: [],
    basketX: 0,
    spawnT: 0,
    spawnSeed: mulberry(1),
    caughtCount: 0,
    time: 0,
  });
  const inputRef = useRef({ left: false, right: false });
  // Objetivo activo de "Atrapa en el Huerto": arranca en round.target y
  // puede cambiar una vez a mitad de ronda en nivel experto.
  const currentTargetRef = useRef(round.target);
  const targetSwitchedRef = useRef(false);

  const speak = useCallback((text, opts) => {
    return (
      audioRef.current?.speak(text, opts) ??
      Promise.resolve({ status: "skipped" })
    );
  }, []);

  useEffect(() => {
    const audio = createAudioDirector();
    audioRef.current = audio;
    setAudioPrefs(audio.prefs());
    adapterRef.current = createDifficultyAdapter({ maxLevel: 0 });
    return () => {
      celebrationRunRef.current += 1;
      loopRef.current?.destroy();
      loopRef.current = null;
      audio.destroy();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      const portrait = width <= 700 && height > width;
      const basketBottom = portrait
        ? BASKET_BOTTOM_PORTRAIT
        : BASKET_BOTTOM_DESKTOP;
      const metrics = {
        width,
        height,
        basketY: Math.max(0, height - basketBottom - BASKET_HEIGHT),
        basketWidth: BASKET_WIDTH,
        basketHeight: BASKET_HEIGHT,
        itemSize: ITEM_SIZE,
      };
      stageMetricsRef.current = metrics;
      stateRef.current.basketX = Math.max(
        0,
        Math.min(width - metrics.basketWidth, stateRef.current.basketX),
      );
      setTick((current) => current + 1);
    };
    measure();
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    if (observer && stageRef.current) observer.observe(stageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const setupRound = useCallback(
    (index) => {
      const targetRound = createCatchRound({ themeId: theme.id, ageId, roundIndex: index });
      const metrics = stageMetricsRef.current;
      stateRef.current = {
        items: [],
        basketX: metrics.width / 2 - metrics.basketWidth / 2,
        spawnT: 0,
        spawnSeed: mulberry(
          Array.from(`${theme.id}|${ageId}|${index}`).reduce(
            (hash, char) => (hash * 33) ^ char.charCodeAt(0),
            5381,
          ) >>> 0,
        ),
        caughtCount: 0,
        time: 0,
      };
      currentTargetRef.current = targetRound.target;
      targetSwitchedRef.current = false;
      setCaught(0);
      setCelebration(null);
    },
    [ageId, theme.id],
  );

  const evaluateRound = useCallback(() => {
    if (phaseRef.current !== "playing") return;

    audioRef.current?.sfx("success");
    adapterRef.current.recordSuccess();
    phaseRef.current = "celebrating";
    setPhase("celebrating");
    const completedRound = roundIndex + 1;
    const celebrationRun = celebrationRunRef.current + 1;
    celebrationRunRef.current = celebrationRun;
    const celebration = pickSuccessCelebration(
      `atrapa:${theme.id}:${ageId}:${completedRound}`,
      adapterRef.current.summary().successes,
    );
    setCelebration(celebration);
    const voiceProfile = getCelebrationVoiceProfile(ageId, celebration);
    onRoundComplete?.(completedRound);

    void (async () => {
      await wait(CELEBRATION_LEAD_IN_MS);
      if (celebrationRunRef.current !== celebrationRun) return;

      await speak(celebration.spokenText, {
        ...voiceProfile,
        watchdogMs: CELEBRATION_WATCHDOG_MS,
      });
      if (celebrationRunRef.current !== celebrationRun) return;

      audioRef.current?.sfx("celebrate");
      await wait(CELEBRATION_DWELL_MS);
      if (celebrationRunRef.current !== celebrationRun) return;

      if (completedRound >= CATCH_ROUNDS) {
        const summary = adapterRef.current.summary();
        setMissionSummary(summary);
        phaseRef.current = "missionComplete";
        setPhase("missionComplete");
        void speak("¡Atrapa y cuenta completado! Qué buena puntería.");
        onMissionComplete?.(summary);
      } else {
        setRoundIndex(completedRound);
        phaseRef.current = "briefing";
        setPhase("briefing");
      }
    })();
  }, [
    ageId,
    onMissionComplete,
    onRoundComplete,
    roundIndex,
    speak,
    theme.id,
  ]);

  const update = useCallback(
    (dt) => {
      const state = stateRef.current;
      const metrics = stageMetricsRef.current;
      state.time += dt;

      if (phaseRef.current !== "playing") return;

      const speed = 340;
      if (inputRef.current.left) state.basketX -= speed * dt;
      if (inputRef.current.right) state.basketX += speed * dt;
      state.basketX = Math.max(
        0,
        Math.min(metrics.width - metrics.basketWidth, state.basketX),
      );

      // Objetivos válidos de esta ronda: por defecto el objetivo actual de
      // Huerto (que puede haber cambiado a mitad de ronda); Cielo suma un
      // segundo objetivo de doble puntaje; Formas usa el grupo por atributo.
      const activeTargets = attributeMode
        ? attributeMode.validTargets
        : secondaryTarget
          ? [round.target, secondaryTarget]
          : [currentTargetRef.current];
      const decoyPool = theme.decoy.filter((sticker) => !activeTargets.includes(sticker));
      const spawnCount =
        theme.id === "juguetes" && roundIndex >= CATCH_EXPERT_ROUND_INDEX ? 2 : 1;

      state.spawnT += dt * 1000;
      if (state.spawnT >= round.spawnGapMs) {
        state.spawnT = 0;
        const random = state.spawnSeed;
        for (let slot = 0; slot < spawnCount; slot += 1) {
          const isDecoy = random() < round.decoyChance;
          const pool = isDecoy ? decoyPool : activeTargets;
          const sticker = pool[Math.floor(random() * pool.length)];
          const laneWidth =
            Math.max(1, metrics.width - metrics.itemSize - 32) / spawnCount;
          const x = 16 + slot * laneWidth + random() * laneWidth;
          state.items.push({
            id: `${Date.now()}-${slot}-${Math.floor(random() * 100000)}`,
            sticker,
            isTarget: !isDecoy,
            points: !isDecoy && secondaryTarget && sticker === secondaryTarget ? 2 : 1,
            x,
            y: -ITEM_SIZE,
          });
        }
      }

      const basketCenterX = state.basketX + metrics.basketWidth / 2;
      const survivors = [];
      let targetSwitched = false;
      for (const item of state.items) {
        item.y += round.fallSpeed * dt;
        const itemCenterX = item.x + metrics.itemSize / 2;
        const withinBasketX =
          Math.abs(itemCenterX - basketCenterX) < metrics.basketWidth / 2;
        const withinBasketY =
          item.y + metrics.itemSize >= metrics.basketY &&
          item.y < metrics.basketY + metrics.basketHeight;

        if (withinBasketX && withinBasketY) {
          if (item.isTarget) {
            state.caughtCount += item.points ?? 1;
            audioRef.current?.sfx("collect");
            setCaught(state.caughtCount);
            setFeedback({ type: "good", id: item.id });
            window.setTimeout(() => setFeedback(null), 400);

            if (
              theme.id === "huerto" &&
              !targetSwitchedRef.current &&
              state.caughtCount >= Math.ceil(round.count / 2) &&
              state.caughtCount < round.count
            ) {
              const nextTarget = huertoTargetSwitch({
                themeId: theme.id,
                theme,
                roundIndex,
                currentTarget: currentTargetRef.current,
              });
              if (nextTarget) {
                targetSwitchedRef.current = true;
                currentTargetRef.current = nextTarget;
                targetSwitched = true;
                speak("¡Cambio de objetivo! Ahora busca esto en el huerto.");
              }
            }

            if (state.caughtCount >= round.count) {
              evaluateRound();
            }
          } else {
            adapterRef.current?.recordError();
            audioRef.current?.sfx("try");
            setFeedback({ type: "bad", id: item.id });
            window.setTimeout(() => setFeedback(null), 400);
          }
          continue;
        }
        if (item.y < metrics.height + metrics.itemSize) survivors.push(item);
      }
      // Si el objetivo cambió a mitad de ronda, limpiamos lo que caía con
      // el objetivo anterior para que no queden dos reglas mezcladas en
      // pantalla a la vez.
      state.items = targetSwitched ? [] : survivors;
      setTick((current) => current + 1);
    },
    [attributeMode, evaluateRound, round, roundIndex, secondaryTarget, speak, theme],
  );

  const render = useCallback(() => {}, []);
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    if (phase === "intro" || loopRef.current) return undefined;
    const loop = createGameLoop({
      update: (dt) => updateRef.current(dt),
      render,
      onAutoPause: () => {
        setPaused(true);
        audioRef.current?.suspend();
      },
    });
    loopRef.current = loop;
    loop.start();
    return () => {
      loop.destroy();
      loopRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "briefing") return;
    setupRound(roundIndex);
    let intro = round.spokenText;
    if (attributeMode) {
      intro += ` Esta vez busca figuras con ${attributeMode.sides} lados: pueden ser distintas, pero todas cuentan.`;
    } else if (secondaryTarget) {
      intro += " Y ojo: atrapar el segundo dibujo vale doble.";
    } else if (theme.id === "huerto" && roundIndex >= CATCH_EXPERT_ROUND_INDEX) {
      intro += " En esta ronda el objetivo podría cambiar a la mitad, ¡te avisaré!";
    }
    speak(intro);
    setPhase("playing");
  }, [attributeMode, phase, roundIndex, round.spokenText, secondaryTarget, setupRound, speak, theme.id]);

  const handleStart = () => {
    audioRef.current?.start();
    audioRef.current?.playMusic();
    setPhase("briefing");
  };

  const handleReplay = () => {
    adapterRef.current = createDifficultyAdapter({ maxLevel: 0 });
    setMissionSummary(null);
    setRoundIndex(0);
    setPhase("briefing");
  };

  const togglePause = () => {
    if (phase === "intro" || phase === "missionComplete") return;
    setPaused((current) => {
      const next = !current;
      if (next) {
        loopRef.current?.pause();
        audioRef.current?.suspend();
      } else {
        audioRef.current?.resume();
        loopRef.current?.resume();
      }
      return next;
    });
  };

  useEffect(() => {
    const down = (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") inputRef.current.left = true;
      else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") inputRef.current.right = true;
      else if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
      }
    };
    const up = (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") inputRef.current.left = false;
      else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") inputRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touchHold = (key) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      inputRef.current[key] = true;
    },
    onPointerUp: () => {
      inputRef.current[key] = false;
    },
    onPointerLeave: () => {
      inputRef.current[key] = false;
    },
  });

  void tick;
  const stageMetrics = stageMetricsRef.current;
  const activeTarget = currentTargetRef.current ?? round.target;
  const displayTargets = attributeMode
    ? attributeMode.validTargets.map((sticker) => ({ sticker, badge: null }))
    : secondaryTarget
      ? [
          { sticker: activeTarget, badge: null },
          { sticker: secondaryTarget, badge: "×2" },
        ]
      : [{ sticker: activeTarget, badge: null }];
  const targetAriaLabel = attributeMode
    ? `Atrapa figuras con ${attributeMode.sides} lados`
    : secondaryTarget
      ? `Atrapa ${activeTarget} o ${secondaryTarget}, que vale doble`
      : `Atrapa ${activeTarget}`;

  return (
    <div className="catch" data-theme={theme.id} style={{ "--catch-accent": theme.accent, "--catch-accent-soft": theme.accentSoft }}>
      <div className="catch__stage" ref={stageRef}>
        {phase !== "intro" && phase !== "missionComplete" ? (
          <>
            <header className="catch__hud">
              <button className="catch__hud-exit" type="button" aria-label="Salir del juego" onClick={() => onExit?.()}>
                ✕
              </button>
              <div className="catch__hud-round">Ronda {roundIndex + 1} / {CATCH_ROUNDS}</div>
              <div className="catch__hud-target" aria-label={targetAriaLabel}>
                {displayTargets.map(({ sticker, badge }) => {
                  const Sticker = STICKERS[sticker];
                  return (
                    <span key={sticker} className="catch__hud-target-icon">
                      {Sticker ? <Sticker size={28} /> : null}
                      {badge ? <em className="catch__hud-target-badge">{badge}</em> : null}
                    </span>
                  );
                })}
                {attributeMode ? (
                  <span className="catch__hud-target-badge catch__hud-target-badge--sides">
                    {attributeMode.sides} lados
                  </span>
                ) : null}
                <span>{caught} / {round.count}</span>
              </div>
              <div className="catch__hud-buttons">
                <button
                  type="button"
                  aria-label={audioPrefs.music ? "Silenciar música" : "Activar música"}
                  aria-pressed={audioPrefs.music}
                  onClick={() => {
                    const next = !audioPrefs.music;
                    audioRef.current?.setMusicEnabled(next);
                    setAudioPrefs((current) => ({ ...current, music: next }));
                  }}
                >
                  {audioPrefs.music ? "♪" : "♪̸"}
                </button>
                <button
                  type="button"
                  aria-label={
                    audioPrefs.voice
                      ? "Silenciar narración"
                      : "Activar narración"
                  }
                  aria-pressed={audioPrefs.voice}
                  onClick={() => {
                    const next = !audioPrefs.voice;
                    audioRef.current?.setVoiceEnabled(next);
                    setAudioPrefs((current) => ({ ...current, voice: next }));
                  }}
                >
                  {audioPrefs.voice ? "👩‍🏫" : "🔇"}
                </button>
                <button type="button" aria-label="Repetir instrucción" onClick={() => speak(round.spokenText)}>
                  🔊
                </button>
                <button type="button" aria-label={paused ? "Continuar" : "Pausa"} onClick={togglePause}>
                  {paused ? "▶" : "❚❚"}
                </button>
              </div>
            </header>

            <div className="catch__field">
              {stateRef.current.items.map((item) => {
                const Sticker = STICKERS[item.sticker];
                return (
                  <span
                    key={item.id}
                    className={`catch__item ${feedback?.id === item.id ? `is-${feedback.type}` : ""}`}
                    style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
                  >
                    {Sticker ? <Sticker size={ITEM_SIZE} /> : null}
                  </span>
                );
              })}
              <div
                className="catch__basket"
                style={{
                  transform: `translateX(${stateRef.current.basketX}px)`,
                  top: stageMetrics.basketY,
                  width: stageMetrics.basketWidth,
                }}
              >
                <svg viewBox="0 0 92 60" width="100%" height="100%" aria-hidden="true">
                  <path
                    d="M6 16 L86 16 L76 54 Q74 58 68 58 L24 58 Q18 58 16 54 Z"
                    fill={theme.accent}
                    stroke="#10233f"
                    strokeWidth="3"
                  />
                  <path d="M6 16 Q46 30 86 16" fill="none" stroke="#10233f" strokeWidth="3" />
                </svg>
              </div>
            </div>

            <div className="catch__touch">
              <button type="button" aria-label="Ir a la izquierda" {...touchHold("left")}>◀</button>
              <button type="button" aria-label="Ir a la derecha" {...touchHold("right")}>▶</button>
            </div>

            {phase === "celebrating" && celebration ? (
              <div
                className={`catch__celebration is-${celebration.burst}`}
                role="status"
                aria-live="polite"
              >
                <div className="catch__celebration-particles" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, index) => (
                    <i
                      key={index}
                      style={{
                        "--particle-index": index,
                        "--particle-x": `${8 + ((index * 29) % 84)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="catch__celebration-card">
                  <span className="catch__celebration-stars" aria-hidden="true">
                    ★ ✦ ★
                  </span>
                  <strong>{celebration.headline}</strong>
                  <small>{celebration.caption}</small>
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {phase === "intro" ? (
          <div className="catch__overlay catch__intro">
            <span className="catch__kicker">{theme.name}</span>
            <h2>{theme.tagline}</h2>
            <p>Mueve la cesta y atrapa la cantidad correcta. Evita lo que no corresponde.</p>
            <button className="catch__start" type="button" onClick={handleStart}>▶ Comenzar</button>
            <button className="catch__secondary" type="button" onClick={() => onExit?.()}>Volver a Nido</button>
            <small>Teclado: flechas o A/D · Esc pausa</small>
          </div>
        ) : null}

        {paused ? (
          <div className="catch__overlay catch__pause">
            <h2>Pausa</h2>
            <button className="catch__start" type="button" onClick={togglePause}>▶ Continuar</button>
            <button className="catch__secondary" type="button" onClick={() => onExit?.()}>Salir</button>
          </div>
        ) : null}

        {phase === "missionComplete" && missionSummary ? (
          <div className="catch__overlay catch__complete">
            <span className="catch__kicker">¡Completado!</span>
            <h2>20 rondas de {theme.name}</h2>
            <div className="catch__summary">
              <span><strong>{missionSummary.successes}</strong><small>rondas ganadas</small></span>
              <span><strong>{missionSummary.errors}</strong><small>señuelos atrapados</small></span>
            </div>
            <button className="catch__start" type="button" onClick={handleReplay}>▶ Jugar otra vez</button>
            <button className="catch__secondary" type="button" onClick={() => onExit?.()}>Volver a Nido</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
