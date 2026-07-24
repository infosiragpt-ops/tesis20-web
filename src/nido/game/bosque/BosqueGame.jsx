// GameHost de "Misión del Bosque: recolecta y entrega".
// Shell React fino + runtime propio (loop de paso fijo, física arcade,
// AudioDirector). El motor no persiste nada: emite eventos y el shell decide.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAudioDirector } from "../audio/audio-director.js";
import { createEventBus, GAME_TO_PLATFORM } from "../core/event-bus.js";
import { createGameLoop } from "../core/game-loop.js";
import { createPlayerBody, stepPlayer } from "../engine/physics.js";
import {
  createForestRound,
  FOREST_AGE_PROFILES,
  FOREST_ROUNDS,
  layoutForestRound,
} from "../content/forest-mission.js";
import { createDifficultyAdapter } from "../learning/difficulty.js";
import {
  drawBackground,
  drawBasket,
  drawBush,
  drawFruit,
  drawGround,
  drawLuma,
  drawNiko,
  drawParticles,
  drawPlatform,
  VIEW_H,
  VIEW_W,
} from "./forest-renderer.js";
import "./bosque-game.css";

const WORLD = Object.freeze({ width: 1900, groundY: 470 });
const BASKET = Object.freeze({ x: 1700, y: 400, w: 120, h: 66 });
const NUMBER_WORDS = [
  "cero",
  "una",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
];

/**
 * @param {{
 *   ageId: "2-3" | "4-5" | "6",
 *   initialRound?: number,
 *   onRoundComplete?: (roundNumber: number) => void,
 *   onMissionComplete?: (summary: object) => void,
 *   onExit?: () => void,
 * }} props
 */
export default function BosqueGame({
  ageId = "2-3",
  initialRound = 0,
  onRoundComplete,
  onMissionComplete,
  onExit,
}) {
  const profile = FOREST_AGE_PROFILES[ageId] ?? FOREST_AGE_PROFILES["2-3"];

  const [phase, setPhase] = useState("intro");
  const [paused, setPaused] = useState(false);
  const [roundIndex, setRoundIndex] = useState(
    Math.min(initialRound, FOREST_ROUNDS - 1),
  );
  const [hud, setHud] = useState({ carried: 0, delivered: 0 });
  const [subtitle, setSubtitle] = useState("");
  const [helpVisible, setHelpVisible] = useState(profile.helpAlways);
  const [audioPrefs, setAudioPrefs] = useState({ music: true, voice: true });
  const [missionSummary, setMissionSummary] = useState(null);

  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const loopRef = useRef(null);
  const audioRef = useRef(null);
  const busRef = useRef(null);
  const adapterRef = useRef(null);
  const stateRef = useRef(null);
  const inputRef = useRef({
    left: false,
    right: false,
    jumpPressed: false,
    jumpHeld: false,
  });
  const phaseRef = useRef("intro");
  phaseRef.current = phase;

  const round = useMemo(
    () =>
      createForestRound({
        ageId,
        roundIndex,
        level: adapterRef.current?.level() ?? 0,
      }),
    [ageId, roundIndex],
  );

  const speak = useCallback((text, opts) => {
    setSubtitle(text);
    audioRef.current?.speak(text, opts);
  }, []);

  // Construcción y teardown completos del runtime.
  useEffect(() => {
    const bus = createEventBus();
    busRef.current = bus;
    const audio = createAudioDirector();
    audioRef.current = audio;
    setAudioPrefs(audio.prefs());
    adapterRef.current = createDifficultyAdapter({
      maxLevel: profile.maxLevel,
    });
    bus.emit(GAME_TO_PLATFORM.GAME_READY, { game: "mision-del-bosque" });

    return () => {
      window.clearInterval(stateRef.current?.counting);
      loopRef.current?.destroy();
      loopRef.current = null;
      audio.destroy();
      audioRef.current = null;
      bus.emit(GAME_TO_PLATFORM.GAME_EXITED, {});
      bus.clear();
    };
  }, [profile.maxLevel]);

  const setupRound = useCallback(
    (targetRound, index) => {
      const layout = layoutForestRound(targetRound, WORLD, index);
      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;
      stateRef.current = {
        body: createPlayerBody(90, WORLD.groundY - 64),
        fruits: layout.fruits,
        platforms: [
          ...layout.platforms,
          ...layout.obstacles.map((obstacle) => ({
            x: obstacle.x,
            y: WORLD.groundY - obstacle.h,
            w: obstacle.w,
            h: obstacle.h,
          })),
        ],
        obstacles: layout.obstacles,
        carried: 0,
        delivered: 0,
        particles: [],
        cameraX: 0,
        time: 0,
        counting: null,
        celebrateT: 0,
        basketGlow: false,
        reducedMotion: Boolean(reduced),
        pose: "idle",
      };
      setHud({ carried: 0, delivered: 0 });
      busRef.current?.emit(GAME_TO_PLATFORM.LEVEL_STARTED, {
        round: index + 1,
        target: targetRound.target,
      });
    },
    [],
  );

  const evaluateDelivery = useCallback(
    (state) => {
      const targetRound = round;
      if (state.delivered === targetRound.target) {
        const { levelUp } = adapterRef.current.recordSuccess();
        busRef.current?.emit(GAME_TO_PLATFORM.ANSWER_SUBMITTED, {
          correct: true,
          round: roundIndex + 1,
        });
        state.basketGlow = true;
        state.pose = "celebrate";
        audioRef.current?.sfx("success");
        window.setTimeout(() => audioRef.current?.sfx("celebrate"), 350);
        for (let index = 0; index < 26; index += 1) {
          state.particles.push({
            x: BASKET.x + BASKET.w / 2,
            y: BASKET.y,
            vx: (Math.random() - 0.5) * 300,
            vy: -Math.random() * 380,
            size: 3 + Math.random() * 4,
            life: 1,
            color: ["#ff6f61", "#ffc94d", "#46b982", "#4b8ff7", "#9873e7"][
              index % 5
            ],
          });
        }
        setPhase("celebrating");
        speak(
          levelUp
            ? "¡Lo lograste! Ahora vamos a un reto un poquito más grande."
            : "¡Muy bien! ¡Lo lograste!",
        );
        const completedRound = roundIndex + 1;
        onRoundComplete?.(completedRound);
        busRef.current?.emit(GAME_TO_PLATFORM.LEVEL_COMPLETED, {
          round: completedRound,
        });
        window.setTimeout(() => {
          if (!stateRef.current) return;
          if (completedRound >= FOREST_ROUNDS) {
            const summary = adapterRef.current.summary();
            setMissionSummary(summary);
            setPhase("missionComplete");
            speak("¡Misión del bosque completada! Eres increíble.");
            onMissionComplete?.(summary);
          } else {
            setRoundIndex(completedRound);
            setPhase("briefing");
          }
        }, 2300);
      } else if (state.delivered > targetRound.target) {
        const { help } = adapterRef.current.recordError();
        busRef.current?.emit(GAME_TO_PLATFORM.ANSWER_SUBMITTED, {
          correct: false,
          round: roundIndex + 1,
        });
        if (help || targetRound.helpAlways) {
          setHelpVisible(true);
          busRef.current?.emit(GAME_TO_PLATFORM.HINT_USED, {
            round: roundIndex + 1,
          });
        }
        audioRef.current?.sfx("try");
        state.pose = "tryAgain";
        // Sin castigo: las frutas vuelven al campo cerca de la cesta.
        let returned = 0;
        for (const fruit of state.fruits) {
          if (fruit.collected && returned < state.delivered) {
            fruit.collected = false;
            fruit.x = 1150 + returned * 90 + Math.random() * 40;
            fruit.y = WORLD.groundY - 26;
            returned += 1;
          }
        }
        state.delivered = 0;
        setHud({ carried: state.carried, delivered: 0 });
        setPhase("playing");
        speak(
          `Casi. Contemos juntos: necesitamos ${NUMBER_WORDS[targetRound.target]} ${targetRound.target === 1 ? "fruta" : "frutas"}. Inténtalo otra vez.`,
        );
      } else {
        // Entrega parcial: ánimo, sin marcar error.
        const missing = targetRound.target - state.delivered;
        setPhase("playing");
        speak(
          `Ya llevas ${NUMBER_WORDS[state.delivered]}. ${missing === 1 ? "Falta una fruta" : `Faltan ${NUMBER_WORDS[missing]} frutas`}.`,
        );
      }
    },
    [onMissionComplete, onRoundComplete, round, roundIndex, speak],
  );

  const update = useCallback(
    (dt) => {
      const state = stateRef.current;
      if (!state) return;
      state.time += dt;

      // Partículas siempre avanzan (celebraciones incluidas)
      for (const particle of state.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 700 * dt;
        particle.life -= dt * 0.9;
      }
      state.particles = state.particles.filter((particle) => particle.life > 0);

      if (phaseRef.current !== "playing") {
        inputRef.current.jumpPressed = false;
        return;
      }

      const input = inputRef.current;
      const events = stepPlayer(
        state.body,
        {
          left: input.left,
          right: input.right,
          jumpPressed: input.jumpPressed,
          running: !profile.walkOnly,
        },
        dt,
        {
          width: WORLD.width,
          groundY: WORLD.groundY,
          platforms: state.platforms,
          spawn: { x: 90, y: WORLD.groundY - 120 },
        },
      );
      input.jumpPressed = false;
      if (events.jumped) audioRef.current?.sfx("jump");

      // Pose del personaje
      if (!state.body.onGround) {
        state.pose = state.body.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(state.body.vx) > 30) {
        state.pose = profile.walkOnly ? "walk" : "run";
      } else {
        state.pose = "idle";
      }

      // Recoger frutas por contacto
      const px = state.body.x + state.body.w / 2;
      const py = state.body.y + state.body.h / 2;
      for (const fruit of state.fruits) {
        if (fruit.collected) continue;
        const dx = fruit.x - px;
        const dy = fruit.y - py;
        if (dx * dx + dy * dy < 42 * 42) {
          fruit.collected = true;
          state.carried += 1;
          audioRef.current?.sfx("collect");
          busRef.current?.emit(GAME_TO_PLATFORM.OBJECT_COLLECTED, {
            carried: state.carried,
          });
          for (let index = 0; index < 7; index += 1) {
            state.particles.push({
              x: fruit.x,
              y: fruit.y,
              vx: (Math.random() - 0.5) * 200,
              vy: -Math.random() * 240,
              size: 2.5 + Math.random() * 3,
              life: 0.8,
              color: "#ffc94d",
            });
          }
          setHud({ carried: state.carried, delivered: state.delivered });
        }
      }

      // Entregar en la cesta
      if (
        state.carried > 0 &&
        px > BASKET.x - 24 &&
        px < BASKET.x + BASKET.w + 24 &&
        state.body.y + state.body.h > BASKET.y - 40
      ) {
        setPhase("counting");
        const toDeliver = state.carried;
        state.carried = 0;
        let counted = 0;
        state.counting = window.setInterval(() => {
          const current = stateRef.current;
          if (!current) return;
          counted += 1;
          current.delivered += 1;
          audioRef.current?.sfx(counted === toDeliver ? "deposit" : "count");
          setHud({ carried: 0, delivered: current.delivered });
          setSubtitle(
            `${NUMBER_WORDS[Math.min(current.delivered, 10)]}…`,
          );
          if (counted >= toDeliver) {
            window.clearInterval(current.counting);
            current.counting = null;
            window.setTimeout(() => evaluateDelivery(current), 450);
          }
        }, 620);
      }

      // Cámara con seguimiento suave
      const targetCam = Math.max(
        0,
        Math.min(px - VIEW_W / 2, WORLD.width - VIEW_W),
      );
      state.cameraX += (targetCam - state.cameraX) * Math.min(1, dt * 6);
    },
    [evaluateDelivery, profile.walkOnly],
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;
    const ctx = canvas.getContext("2d");
    const t = state.time;

    ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
    drawBackground(ctx, state.cameraX, t, state.reducedMotion);
    drawGround(ctx, WORLD, state.cameraX);

    ctx.save();
    ctx.translate(-state.cameraX, 0);
    for (const platform of state.platforms.slice(
      0,
      state.platforms.length - state.obstacles.length,
    )) {
      drawPlatform(ctx, platform);
    }
    for (const obstacle of state.obstacles) {
      drawBush(ctx, obstacle, WORLD.groundY, t, state.reducedMotion);
    }
    drawBasket(
      ctx,
      BASKET,
      state.delivered,
      round.target,
      state.basketGlow,
      t,
    );
    const shouldHighlight =
      helpVisible &&
      state.carried + state.delivered < round.target;
    let highlightBudget = shouldHighlight
      ? round.target - state.carried - state.delivered
      : 0;
    for (const fruit of state.fruits) {
      const highlighted = !fruit.collected && highlightBudget > 0;
      if (highlighted) highlightBudget -= 1;
      drawFruit(ctx, fruit, t, highlighted, state.reducedMotion);
    }
    drawParticles(ctx, state.particles);
    drawNiko(ctx, state.body, state.pose, t, state.carried);
    const lumaX =
      phaseRef.current === "briefing"
        ? state.body.x + state.body.w / 2 + 80
        : state.cameraX + VIEW_W - 90;
    drawLuma(
      ctx,
      lumaX,
      170,
      phaseRef.current === "celebrating"
        ? "cheer"
        : window.speechSynthesis?.speaking
          ? "talk"
          : "idle",
      t,
    );
    ctx.restore();
  }, [helpVisible, round.target]);

  // El loop llama siempre a la versión más reciente de update/render (refs):
  // se crea una única vez al salir del intro y nunca queda obsoleto.
  const updateRef = useRef(update);
  updateRef.current = update;
  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    if (phase === "intro" || loopRef.current) return undefined;
    const loop = createGameLoop({
      update: (dt) => updateRef.current(dt),
      render: (alpha) => renderRef.current(alpha),
      onAutoPause: () => {
        setPaused(true);
        audioRef.current?.suspend();
        busRef.current?.emit(GAME_TO_PLATFORM.GAME_PAUSED, { auto: true });
      },
    });
    loopRef.current = loop;
    loop.start();
    return () => {
      loop.destroy();
      loopRef.current = null;
    };
  }, [phase]);

  // Arranque de ronda al entrar a briefing (y en la primera partida).
  useEffect(() => {
    if (phase !== "briefing") return;
    setHelpVisible(profile.helpAlways);
    adapterRef.current?.resetRound();
    setupRound(round, roundIndex);
    speak(round.spokenText, {
      onEnd: () => {
        if (phaseRef.current === "briefing") setPhase("playing");
      },
    });
    const fallback = window.setTimeout(() => {
      if (phaseRef.current === "briefing") setPhase("playing");
    }, 6000);
    return () => window.clearTimeout(fallback);
  }, [phase, profile.helpAlways, round, roundIndex, setupRound, speak]);

  // Teclado
  useEffect(() => {
    const down = (event) => {
      const input = inputRef.current;
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A")
        input.left = true;
      else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      )
        input.right = true;
      else if (event.key === " " || event.key === "ArrowUp") {
        if (!input.jumpHeld) input.jumpPressed = true;
        input.jumpHeld = true;
        event.preventDefault();
      } else if (event.key === "e" || event.key === "E") {
        dropFruit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
      }
    };
    const up = (event) => {
      const input = inputRef.current;
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A")
        input.left = false;
      else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      )
        input.right = false;
      else if (event.key === " " || event.key === "ArrowUp")
        input.jumpHeld = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dropFruit = () => {
    const state = stateRef.current;
    if (!state || state.carried <= 0 || phaseRef.current !== "playing") return;
    state.carried -= 1;
    const fruit = state.fruits.find((item) => item.collected);
    if (fruit) {
      fruit.collected = false;
      fruit.x = state.body.x + state.body.w / 2 + state.body.facing * -46;
      fruit.y = WORLD.groundY - 26;
    }
    audioRef.current?.sfx("deposit");
    setHud({ carried: state.carried, delivered: state.delivered });
  };

  const togglePause = () => {
    if (phaseRef.current === "intro" || phaseRef.current === "missionComplete")
      return;
    setPaused((current) => {
      const next = !current;
      if (next) {
        loopRef.current?.pause();
        audioRef.current?.suspend();
        busRef.current?.emit(GAME_TO_PLATFORM.GAME_PAUSED, { auto: false });
      } else {
        audioRef.current?.resume();
        loopRef.current?.resume();
      }
      return next;
    });
  };

  const handleStart = () => {
    const audio = audioRef.current;
    audio?.start();
    audio?.playMusic();
    setPhase("briefing");
  };

  const handleReplayMission = () => {
    adapterRef.current = createDifficultyAdapter({
      maxLevel: profile.maxLevel,
    });
    setMissionSummary(null);
    setRoundIndex(0);
    setPhase("briefing");
  };

  const touchHold = (key) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      if (key === "jump") {
        if (!inputRef.current.jumpHeld) inputRef.current.jumpPressed = true;
        inputRef.current.jumpHeld = true;
      } else inputRef.current[key] = true;
    },
    onPointerUp: () => {
      if (key === "jump") inputRef.current.jumpHeld = false;
      else inputRef.current[key] = false;
    },
    onPointerCancel: () => {
      if (key === "jump") inputRef.current.jumpHeld = false;
      else inputRef.current[key] = false;
    },
  });

  const targetIcons = round.target <= 10 ? Array.from({ length: round.target }) : [];
  const progressCount = hud.delivered + hud.carried;

  return (
    <div className="bosque" ref={stageRef} data-age={ageId}>
      <div className="bosque__stage">
        <canvas
          className="bosque__canvas"
          ref={canvasRef}
          width={VIEW_W * 2}
          height={VIEW_H * 2}
          aria-label="Escenario del bosque"
        />

        {phase !== "intro" && phase !== "missionComplete" ? (
          <>
            <header className="bosque__hud">
              <button
                className="bosque__hud-exit"
                type="button"
                aria-label="Salir del juego"
                onClick={() => onExit?.()}
              >
                ✕
              </button>
              <div className="bosque__hud-round">
                Ronda {roundIndex + 1} / {FOREST_ROUNDS}
              </div>
              <div
                className="bosque__hud-target"
                aria-label={`Meta: ${round.target}. Llevas ${progressCount}.`}
              >
                <span className="bosque__hud-instruction">
                  {round.instructionText}
                </span>
                {targetIcons.length ? (
                  <span className="bosque__hud-fruits" aria-hidden="true">
                    {targetIcons.map((_, index) => (
                      <i
                        className={index < progressCount ? "is-filled" : ""}
                        key={index}
                      />
                    ))}
                  </span>
                ) : null}
              </div>
              <div className="bosque__hud-buttons">
                <button
                  type="button"
                  aria-label={
                    audioPrefs.music ? "Silenciar música" : "Activar música"
                  }
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
                  aria-label="Repetir instrucción"
                  onClick={() => speak(round.spokenText)}
                >
                  🔊
                </button>
                <button
                  type="button"
                  aria-label={paused ? "Continuar" : "Pausa"}
                  onClick={togglePause}
                >
                  {paused ? "▶" : "❚❚"}
                </button>
              </div>
            </header>

            {subtitle ? (
              <p className="bosque__subtitle" role="status">
                {subtitle}
              </p>
            ) : null}

            <div className="bosque__touch" aria-hidden="false">
              <div className="bosque__touch-move">
                <button type="button" aria-label="Ir a la izquierda" {...touchHold("left")}>
                  ◀
                </button>
                <button type="button" aria-label="Ir a la derecha" {...touchHold("right")}>
                  ▶
                </button>
              </div>
              <div className="bosque__touch-actions">
                {hud.carried > 0 ? (
                  <button
                    className="bosque__touch-drop"
                    type="button"
                    aria-label="Soltar una fruta"
                    onClick={dropFruit}
                  >
                    Soltar
                  </button>
                ) : null}
                <button
                  className="bosque__touch-jump"
                  type="button"
                  aria-label="Saltar"
                  {...touchHold("jump")}
                >
                  Saltar
                </button>
              </div>
            </div>
          </>
        ) : null}

        {phase === "intro" ? (
          <div className="bosque__overlay bosque__intro">
            <span className="bosque__intro-kicker">Misión del Bosque</span>
            <h2>Recolecta y entrega</h2>
            <p>
              Corre, salta y lleva las frutas correctas a la cesta. Luma te
              guía con su voz.
            </p>
            <button
              className="bosque__start"
              type="button"
              onClick={handleStart}
            >
              ▶ Comenzar
            </button>
            <div className="bosque__intro-audio">
              <label>
                <input
                  type="checkbox"
                  checked={audioPrefs.music}
                  onChange={(event) => {
                    audioRef.current?.setMusicEnabled(event.target.checked);
                    setAudioPrefs((current) => ({
                      ...current,
                      music: event.target.checked,
                    }));
                  }}
                />
                Música
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={audioPrefs.voice}
                  onChange={(event) => {
                    audioRef.current?.setVoiceEnabled(event.target.checked);
                    setAudioPrefs((current) => ({
                      ...current,
                      voice: event.target.checked,
                    }));
                  }}
                />
                Voz de Luma
              </label>
            </div>
            <small>
              Teclado: flechas o A/D · espacio salta · E suelta · Esc pausa
            </small>
            <button
              className="bosque__secondary"
              type="button"
              onClick={() => onExit?.()}
            >
              Volver a Nido
            </button>
          </div>
        ) : null}

        {paused ? (
          <div className="bosque__overlay bosque__pause">
            <h2>Pausa</h2>
            <button className="bosque__start" type="button" onClick={togglePause}>
              ▶ Continuar
            </button>
            <button
              className="bosque__secondary"
              type="button"
              onClick={() => onExit?.()}
            >
              Salir del bosque
            </button>
          </div>
        ) : null}

        {phase === "missionComplete" && missionSummary ? (
          <div className="bosque__overlay bosque__complete">
            <span className="bosque__intro-kicker">¡Misión completada!</span>
            <h2>¡20 rondas del bosque!</h2>
            <div className="bosque__summary">
              <span>
                <strong>{missionSummary.successes}</strong>
                <small>entregas perfectas</small>
              </span>
              <span>
                <strong>{missionSummary.helps}</strong>
                <small>ayudas de Luma</small>
              </span>
            </div>
            <button
              className="bosque__start"
              type="button"
              onClick={handleReplayMission}
            >
              ▶ Jugar otra vez
            </button>
            <button
              className="bosque__secondary"
              type="button"
              onClick={() => onExit?.()}
            >
              Volver a Nido
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
