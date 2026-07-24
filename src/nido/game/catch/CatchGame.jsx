// GameHost de "Atrapa y Cuenta": objetos caen, el niño mueve una cesta para
// atrapar la cantidad correcta del sticker objetivo. DOM+CSS (sin canvas):
// reutiliza el catálogo de stickers ya ilustrado. Motor compartido
// (game-loop, audio-director, difficulty) con Misión del Bosque.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAudioDirector } from "../audio/audio-director.js";
import { createGameLoop } from "../core/game-loop.js";
import { createDifficultyAdapter } from "../learning/difficulty.js";
import {
  CATCH_AGE_PROFILES,
  CATCH_ROUNDS,
  CATCH_THEMES,
  createCatchRound,
} from "../content/catch-mission.js";
import { STICKERS } from "../../stickers/sticker-registry.jsx";
import "./catch-game.css";

const STAGE_HEIGHT = 560;
const BASKET_Y = 500;
const BASKET_WIDTH = 92;
const ITEM_SIZE = 56;

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
  const profile = CATCH_AGE_PROFILES[ageId] ?? CATCH_AGE_PROFILES["2-3"];

  const [phase, setPhase] = useState("intro");
  const [paused, setPaused] = useState(false);
  const [roundIndex, setRoundIndex] = useState(Math.min(initialRound, CATCH_ROUNDS - 1));
  const [caught, setCaught] = useState(0);
  const [audioPrefs, setAudioPrefs] = useState({ music: true, voice: true });
  const [missionSummary, setMissionSummary] = useState(null);
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [stageWidth, setStageWidth] = useState(720);

  const audioRef = useRef(null);
  const adapterRef = useRef(null);
  const loopRef = useRef(null);
  const stageRef = useRef(null);
  const phaseRef = useRef("intro");
  phaseRef.current = phase;

  const round = useMemo(
    () => createCatchRound({ themeId: theme.id, ageId, roundIndex }),
    [ageId, roundIndex, theme.id],
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

  const speak = useCallback((text) => {
    audioRef.current?.speak(text);
  }, []);

  useEffect(() => {
    const audio = createAudioDirector();
    audioRef.current = audio;
    setAudioPrefs(audio.prefs());
    adapterRef.current = createDifficultyAdapter({ maxLevel: 0 });
    return () => {
      loopRef.current?.destroy();
      loopRef.current = null;
      audio.destroy();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const measure = () => setStageWidth(stageRef.current?.clientWidth ?? 720);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const setupRound = useCallback(
    (index) => {
      const targetRound = createCatchRound({ themeId: theme.id, ageId, roundIndex: index });
      stateRef.current = {
        items: [],
        basketX: stageWidth / 2 - BASKET_WIDTH / 2,
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
      setCaught(0);
      void targetRound;
    },
    [ageId, stageWidth, theme.id],
  );

  const evaluateRound = useCallback(() => {
    audioRef.current?.sfx("success");
    window.setTimeout(() => audioRef.current?.sfx("celebrate"), 300);
    const { levelUp } = adapterRef.current.recordSuccess();
    setPhase("celebrating");
    speak(levelUp ? "¡Excelente! Un reto más grande viene." : "¡Muy bien atrapado!");
    const completedRound = roundIndex + 1;
    onRoundComplete?.(completedRound);
    window.setTimeout(() => {
      if (completedRound >= CATCH_ROUNDS) {
        const summary = adapterRef.current.summary();
        setMissionSummary(summary);
        setPhase("missionComplete");
        speak("¡Atrapa y cuenta completado! Qué buena puntería.");
        onMissionComplete?.(summary);
      } else {
        setRoundIndex(completedRound);
        setPhase("briefing");
      }
    }, 1600);
  }, [onMissionComplete, onRoundComplete, roundIndex, speak]);

  const update = useCallback(
    (dt) => {
      const state = stateRef.current;
      state.time += dt;

      if (phaseRef.current !== "playing") return;

      const speed = 340;
      if (inputRef.current.left) state.basketX -= speed * dt;
      if (inputRef.current.right) state.basketX += speed * dt;
      state.basketX = Math.max(0, Math.min(stageWidth - BASKET_WIDTH, state.basketX));

      state.spawnT += dt * 1000;
      if (state.spawnT >= round.spawnGapMs) {
        state.spawnT = 0;
        const random = state.spawnSeed;
        const isDecoy = random() < round.decoyChance;
        const pool = isDecoy ? theme.decoy : [round.target];
        const sticker = pool[Math.floor(random() * pool.length)];
        state.items.push({
          id: `${Date.now()}-${Math.floor(random() * 100000)}`,
          sticker,
          isTarget: !isDecoy,
          x: 16 + random() * Math.max(1, stageWidth - ITEM_SIZE - 32),
          y: -ITEM_SIZE,
        });
      }

      const basketCenterX = state.basketX + BASKET_WIDTH / 2;
      const survivors = [];
      for (const item of state.items) {
        item.y += round.fallSpeed * dt;
        const itemCenterX = item.x + ITEM_SIZE / 2;
        const withinBasketX = Math.abs(itemCenterX - basketCenterX) < BASKET_WIDTH / 2;
        const withinBasketY = item.y + ITEM_SIZE >= BASKET_Y && item.y < BASKET_Y + 40;

        if (withinBasketX && withinBasketY) {
          if (item.isTarget) {
            state.caughtCount += 1;
            audioRef.current?.sfx("collect");
            setCaught(state.caughtCount);
            setFeedback({ type: "good", id: item.id });
            window.setTimeout(() => setFeedback(null), 400);
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
        if (item.y < STAGE_HEIGHT + ITEM_SIZE) survivors.push(item);
      }
      state.items = survivors;
      setTick((current) => current + 1);
    },
    [evaluateRound, round, stageWidth, theme.decoy],
  );

  const render = useCallback(() => {}, []);

  useEffect(() => {
    if (phase === "intro" || loopRef.current) return undefined;
    const updateRef2 = update;
    const loop = createGameLoop({
      update: (dt) => updateRef2(dt),
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
    speak(round.spokenText);
    setPhase("playing");
  }, [phase, roundIndex, round.spokenText, setupRound, speak]);

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

  const TargetSticker = STICKERS[round.target];
  void tick;

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
              <div className="catch__hud-target" aria-label={round.instructionText}>
                {TargetSticker ? <TargetSticker size={30} /> : null}
                <span>{caught} / {round.count}</span>
              </div>
              <div className="catch__hud-buttons">
                <button
                  type="button"
                  aria-label={audioPrefs.music ? "Silenciar música" : "Activar música"}
                  onClick={() => {
                    const next = !audioPrefs.music;
                    audioRef.current?.setMusicEnabled(next);
                    setAudioPrefs((current) => ({ ...current, music: next }));
                  }}
                >
                  {audioPrefs.music ? "♪" : "♪̸"}
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
                style={{ transform: `translateX(${stateRef.current.basketX}px)`, width: BASKET_WIDTH }}
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
