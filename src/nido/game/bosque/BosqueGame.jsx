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
  roundDifficultyFloor,
} from "../content/forest-mission.js";
import { createDifficultyAdapter } from "../learning/difficulty.js";
import {
  briefingKey,
  missionCompleteKey,
  missionCompleteText,
  NUMBER_WORDS,
  partialKey,
  partialText,
  successKey,
  successText,
  tryAgainKey,
  tryAgainText,
} from "../content/forest-voice-lines.js";
import {
  createScenery,
  drawBasket,
  drawBush,
  drawFruit,
  drawLuma,
  drawMotes,
  drawNiko,
  drawParticles,
  drawPlatform,
  VIEW_H,
  VIEW_W,
} from "./forest-renderer.js";
import "./bosque-game.css";

const WORLD = Object.freeze({ width: 1900, groundY: 470 });
const BASKET = Object.freeze({ x: 1700, y: 400, w: 120, h: 66 });
const GRAB_RADIUS = 56;
const CONFETTI = ["#ff6f61", "#ffc94d", "#46b982", "#4b8ff7", "#9873e7"];
const CELEBRATION_LEAD_IN_MS = 540;
const CELEBRATION_DWELL_MS = 700;
const CELEBRATION_WATCHDOG_MS = 12_000;

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

/**
 * Glifos propios del HUD. Se dibujan con `currentColor` en vez de emoji: los
 * emoji cambian de forma, color y peso óptico en cada sistema operativo, y el
 * juego necesita una iconografía estable. Tampoco añaden peso de librería.
 */
function Glyph({ name }) {
  const paths = {
    close: "M7 7l10 10M17 7L7 17",
    music: "M9 18V6l10-2v12",
    mute: "M9 18V6l10-2v12M4 4l16 16",
    speaker: "M4 10v4h3l4 3V7L7 10H4zm11-1a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12",
    pause: "M9 5v14M15 5v14",
    play: "M8 5l11 7-11 7z",
    left: "M15 5l-7 7 7 7",
    right: "M9 5l7 7-7 7",
    down: "M12 5v13m0 0l-5-5m5 5l5-5",
    hand: "M8 12V6a1.6 1.6 0 0 1 3.2 0v5m0-1V4.6a1.6 1.6 0 0 1 3.2 0V11m0-1.4a1.6 1.6 0 0 1 3.2 0V15a5 5 0 0 1-5 5h-1.6a5 5 0 0 1-4.3-2.4L4 14a1.7 1.7 0 0 1 2.7-2L8 13.4",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={paths[name]}
        fill={name === "play" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Nubecilla de polvo bajo los pies (saltar, aterrizar, correr). */
function puffDust(state, x, y, count, power) {
  for (let index = 0; index < count; index += 1) {
    state.particles.push({
      kind: "dust",
      x: x + (Math.random() - 0.5) * 22,
      y: y - 2,
      vx: (Math.random() - 0.5) * 150 * power,
      vy: -Math.random() * 55 * power,
      size: 3 + Math.random() * 4 * power,
      life: 0.7,
    });
  }
}

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
  const worldRef = useRef(null);
  const sceneryRef = useRef(null);
  const loopRef = useRef(null);
  const audioRef = useRef(null);
  const busRef = useRef(null);
  const adapterRef = useRef(null);
  const stateRef = useRef(null);
  const bosqueTracksRef = useRef({});
  const inputRef = useRef({
    left: false,
    right: false,
    jumpPressed: false,
    jumpHeld: false,
    grabPressed: false,
    grabHeld: false,
  });
  const celebrationRunRef = useRef(0);
  const phaseRef = useRef("intro");
  phaseRef.current = phase;

  // El nivel adaptativo se lee de forma imperativa (no es estado reactivo);
  // se guarda junto al reto para que la clave de audio pregrabado
  // (briefingKey) siempre coincida con el texto que generó `round`.
  const roundLevelRef = useRef(0);
  const round = useMemo(() => {
    const adaptiveLevel = adapterRef.current?.level() ?? 0;
    const floor = roundDifficultyFloor(roundIndex, profile.maxLevel);
    const level = Math.max(adaptiveLevel, floor);
    roundLevelRef.current = level;
    return createForestRound({ ageId, roundIndex, level });
  }, [ageId, roundIndex, profile.maxLevel]);

  const speak = useCallback((text, opts) => {
    setSubtitle(text);
    return (
      audioRef.current?.speak(text, opts) ??
      Promise.resolve({ status: "skipped" })
    );
  }, []);

  // Narra con audio profesional pregrabado cuando existe (mismo manifiesto
  // que el currículo clásico); si la clave no está cubierta, la voz del
  // dispositivo entra como respaldo automático dentro de audioDirector.speak.
  const narrate = useCallback(
    (text, key, opts) => {
      return speak(text, {
        ...opts,
        audioSrc: bosqueTracksRef.current[key],
      });
    },
    [speak],
  );

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

    let active = true;
    fetch("/assets/nido/audio/manifest.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((manifest) => {
        if (!active || !manifest?.bosqueTracks) return;
        bosqueTracksRef.current = manifest.bosqueTracks;
      })
      .catch(() => {
        // Sin manifiesto, la voz del dispositivo sigue disponible.
      });

    return () => {
      active = false;
      celebrationRunRef.current += 1;
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
        // Sensación de juego: aplastado al aterrizar, sacudida de cámara y
        // temporizador del rastro de polvo al correr.
        squash: 0,
        shake: 0,
        dustT: 0,
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
        state.shake = state.reducedMotion ? 0 : 6;
        audioRef.current?.sfx("success");
        for (let index = 0; index < 34; index += 1) {
          state.particles.push({
            kind: index % 2 ? "star" : "spark",
            x: BASKET.x + BASKET.w / 2,
            y: BASKET.y,
            vx: (Math.random() - 0.5) * 320,
            vy: -120 - Math.random() * 320,
            size: 3 + Math.random() * 4,
            spin: Math.random() * 6,
            spinRate: (Math.random() - 0.5) * 14,
            life: 1,
            color: CONFETTI[index % CONFETTI.length],
          });
        }
        phaseRef.current = "celebrating";
        setPhase("celebrating");
        const completedRound = roundIndex + 1;
        const celebrationRun = celebrationRunRef.current + 1;
        celebrationRunRef.current = celebrationRun;
        onRoundComplete?.(completedRound);
        busRef.current?.emit(GAME_TO_PLATFORM.LEVEL_COMPLETED, {
          round: completedRound,
        });

        void (async () => {
          await wait(CELEBRATION_LEAD_IN_MS);
          if (
            celebrationRunRef.current !== celebrationRun ||
            !stateRef.current
          ) {
            return;
          }

          await narrate(successText(levelUp), successKey(ageId, levelUp), {
            watchdogMs: CELEBRATION_WATCHDOG_MS,
          });
          if (
            celebrationRunRef.current !== celebrationRun ||
            !stateRef.current
          ) {
            return;
          }

          audioRef.current?.sfx("celebrate");
          await wait(CELEBRATION_DWELL_MS);
          if (
            celebrationRunRef.current !== celebrationRun ||
            !stateRef.current
          ) {
            return;
          }

          if (completedRound >= FOREST_ROUNDS) {
            const summary = adapterRef.current.summary();
            setMissionSummary(summary);
            phaseRef.current = "missionComplete";
            setPhase("missionComplete");
            narrate(missionCompleteText, missionCompleteKey(ageId));
            onMissionComplete?.(summary);
          } else {
            setRoundIndex(completedRound);
            phaseRef.current = "briefing";
            setPhase("briefing");
          }
        })();
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
        // Sin castigo: las frutas de la cesta (no las que lleva en brazos)
        // vuelven al campo, cerca de la cesta, para volver a intentarlo.
        let returned = 0;
        for (const fruit of state.fruits) {
          if (fruit.collected && !fruit.held && returned < state.delivered) {
            fruit.collected = false;
            fruit.x = 1150 + returned * 90 + Math.random() * 40;
            fruit.y = WORLD.groundY - 26;
            returned += 1;
          }
        }
        state.delivered = 0;
        setHud({ carried: state.carried, delivered: 0 });
        setPhase("playing");
        narrate(
          tryAgainText(targetRound.target),
          tryAgainKey(ageId, targetRound.target),
        );
      } else {
        // Entrega parcial: ánimo, sin marcar error.
        const missing = targetRound.target - state.delivered;
        setPhase("playing");
        narrate(
          partialText(state.delivered, missing),
          partialKey(ageId, state.delivered, missing),
        );
      }
    },
    [ageId, narrate, onMissionComplete, onRoundComplete, round, roundIndex],
  );

  const update = useCallback(
    (dt) => {
      const state = stateRef.current;
      if (!state) return;
      state.time += dt;

      // Partículas siempre avanzan (celebraciones incluidas). El polvo no cae:
      // se queda flotando y se disipa donde se levantó.
      for (const particle of state.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        if (particle.kind === "dust") {
          particle.vx *= 0.94;
          particle.vy *= 0.9;
          particle.life -= dt * 1.9;
        } else {
          particle.vy += 700 * dt;
          particle.spin = (particle.spin ?? 0) + (particle.spinRate ?? 0) * dt;
          particle.life -= dt * 0.9;
        }
      }
      state.particles = state.particles.filter((particle) => particle.life > 0);

      // Amortiguación del aplastado y de la sacudida de cámara.
      state.squash = Math.max(0, state.squash - dt * 4.5);
      state.shake = Math.max(0, state.shake - dt * 26);

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

      // Despegue y aterrizaje: polvo, aplastado y una sacudida mínima. Es lo
      // que separa un salto "de prototipo" de uno que se siente con peso.
      const feetX = state.body.x + state.body.w / 2;
      const feetY = state.body.y + state.body.h;
      if (events.jumped) {
        audioRef.current?.sfx("jump");
        state.squash = 0.5;
        if (!state.reducedMotion) puffDust(state, feetX, feetY, 5, 1);
      }
      if (events.landed) {
        state.squash = 1;
        state.shake = state.reducedMotion ? 0 : 3.5;
        if (!state.reducedMotion) puffDust(state, feetX, feetY, 8, 1.3);
      }
      // Rastro de polvo mientras corre por el suelo.
      if (state.body.onGround && Math.abs(state.body.vx) > 140) {
        state.dustT -= dt;
        if (state.dustT <= 0) {
          state.dustT = 0.09;
          if (!state.reducedMotion) puffDust(state, feetX, feetY, 1, 0.55);
        }
      }

      // Pose del personaje
      if (!state.body.onGround) {
        state.pose = state.body.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(state.body.vx) > 30) {
        state.pose = profile.walkOnly ? "walk" : "run";
      } else {
        state.pose = "idle";
      }

      // Recoger: acción deliberada con el botón, salvo en 2–3 años (walkOnly),
      // donde bastar con acercarse mantiene el flujo mágico y adictivo.
      const px = state.body.x + state.body.w / 2;
      const py = state.body.y + state.body.h / 2;
      const tryGrab = Boolean(input.grabPressed) || profile.walkOnly;
      if (input.grabPressed) input.grabPressed = false;
      if (tryGrab) {
        let nearestFruit = null;
        let nearestDistanceSq = GRAB_RADIUS * GRAB_RADIUS;
        for (const fruit of state.fruits) {
          if (fruit.collected) continue;
          const dx = fruit.x - px;
          const dy = fruit.y - py;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq < nearestDistanceSq) {
            nearestFruit = fruit;
            nearestDistanceSq = distanceSq;
          }
        }
        // En walkOnly solo una fruta a la vez: el niño va y vuelve a la cesta.
        const canCarryMore = profile.walkOnly ? state.carried < 1 : true;
        if (nearestFruit && canCarryMore) {
          // `held` distingue "en brazos" de "ya en la cesta": sin esa marca,
          // soltar una fruta podía devolver al campo una entregada.
          nearestFruit.collected = true;
          nearestFruit.held = true;
          state.carried += 1;
          state.pose = "grab";
          state.squash = 0.4;
          audioRef.current?.sfx("collect");
          busRef.current?.emit(GAME_TO_PLATFORM.OBJECT_COLLECTED, {
            carried: state.carried,
          });
          for (let index = 0; index < 9; index += 1) {
            state.particles.push({
              kind: "star",
              x: nearestFruit.x,
              y: nearestFruit.y,
              vx: (Math.random() - 0.5) * 210,
              vy: -60 - Math.random() * 220,
              size: 2 + Math.random() * 2.6,
              spin: Math.random() * 6,
              spinRate: (Math.random() - 0.5) * 12,
              life: 0.85,
              color: "#ffc94d",
            });
          }
          setHud({ carried: state.carried, delivered: state.delivered });
        }
        // Si no hay fruta al alcance, no pasa nada: intentar "Recoger" al
        // caminar no es un error, así que no suena ningún aviso.
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
        // Las frutas en brazos pasan a estar en la cesta (dejan de ser
        // recuperables con "Soltar").
        for (const fruit of state.fruits) fruit.held = false;
        let counted = 0;
        state.counting = window.setInterval(() => {
          const current = stateRef.current;
          if (!current) return;
          counted += 1;
          current.delivered += 1;
          audioRef.current?.sfx(counted === toDeliver ? "deposit" : "count");
          // Un destello por fruta contada: el conteo se ve, no solo se oye.
          for (let index = 0; index < 5; index += 1) {
            current.particles.push({
              kind: "star",
              x: BASKET.x + BASKET.w / 2,
              y: BASKET.y - 4,
              vx: (Math.random() - 0.5) * 130,
              vy: -90 - Math.random() * 120,
              size: 2 + Math.random() * 2,
              spin: Math.random() * 6,
              spinRate: (Math.random() - 0.5) * 10,
              life: 0.7,
              color: "#ffc94d",
            });
          }
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

      // Cámara con seguimiento suave y anticipación: al correr se adelanta en
      // la dirección de marcha para que se vea a dónde vas, no de dónde vienes.
      const lookahead = state.body.facing * 105 * Math.min(1, Math.abs(state.body.vx) / 240);
      const targetCam = Math.max(
        0,
        Math.min(px + lookahead - VIEW_W / 2, WORLD.width - VIEW_W),
      );
      state.cameraX += (targetCam - state.cameraX) * Math.min(1, dt * 4.2);
    },
    [evaluateDelivery, profile.walkOnly],
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;
    const ctx = canvas.getContext("2d");
    const t = state.time;
    const reduced = state.reducedMotion;
    if (!sceneryRef.current) {
      sceneryRef.current = createScenery({
        groundY: WORLD.groundY,
        scale: Math.min(2, Math.max(1, canvas.width / VIEW_W)),
      });
    }
    const scenery = sceneryRef.current;

    // Sacudida de cámara: se aplica al fotograma entero, decorado incluido.
    const shakeX = state.shake ? (Math.random() - 0.5) * state.shake : 0;
    const shakeY = state.shake ? (Math.random() - 0.5) * state.shake : 0;
    ctx.setTransform(
      canvas.width / VIEW_W,
      0,
      0,
      canvas.height / VIEW_H,
      shakeX * (canvas.width / VIEW_W),
      shakeY * (canvas.height / VIEW_H),
    );

    scenery.drawBack(ctx, state.cameraX, t, reduced);

    ctx.save();
    ctx.translate(-state.cameraX, 0);
    for (const platform of state.platforms.slice(
      0,
      state.platforms.length - state.obstacles.length,
    )) {
      drawPlatform(ctx, platform, WORLD.groundY);
    }
    for (const obstacle of state.obstacles) {
      drawBush(ctx, obstacle, WORLD.groundY, t, reduced);
    }
    drawBasket(
      ctx,
      BASKET,
      state.delivered,
      round.target,
      state.basketGlow,
      t,
      WORLD.groundY,
    );
    const shouldHighlight =
      helpVisible &&
      state.carried + state.delivered < round.target;
    let highlightBudget = shouldHighlight
      ? round.target - state.carried - state.delivered
      : 0;
    for (const fruit of state.fruits) {
      // Recogida o entregada: sale del campo. La que va en brazos la dibuja
      // Niko; las de la cesta se ven en el contador del mimbre.
      if (fruit.collected) continue;
      const highlighted = highlightBudget > 0;
      if (highlighted) highlightBudget -= 1;
      drawFruit(ctx, fruit, t, highlighted, reduced, WORLD.groundY);
    }
    drawNiko(
      ctx,
      state.body,
      state.pose,
      t,
      state.carried,
      WORLD.groundY,
      state.squash,
    );
    drawParticles(ctx, state.particles);
    ctx.restore();

    // Motas de polen y maleza en primer plano: profundidad por delante de los
    // actores, antes del acabado de color.
    drawMotes(ctx, state.cameraX, t, reduced);
    scenery.drawForeground(ctx, state.cameraX, t, reduced);
    scenery.drawGrade(ctx);

    // Luma vive en coordenadas de pantalla: acompaña siempre, no se pierde
    // detrás de la cámara.
    drawLuma(
      ctx,
      phaseRef.current === "briefing"
        ? state.body.x + state.body.w / 2 + 90 - state.cameraX
        : VIEW_W - 92,
      164,
      phaseRef.current === "celebrating"
        ? "cheer"
        : window.speechSynthesis?.speaking
          ? "talk"
          : "idle",
      t,
      reduced,
    );
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

  // Resolución del lienzo según el tamaño real y la densidad de pantalla, en
  // vez de un 1920×1080 fijo: nítido en escritorio y sin pintar píxeles de más
  // en tabletas modestas. Las capas cacheadas se reconstruyen solo cuando
  // cambia el tramo de escala, no en cada píxel de arrastre.
  useEffect(() => {
    const canvas = canvasRef.current;
    const world = worldRef.current;
    if (!canvas || !world) return undefined;
    let currentScale = 0;
    const resize = () => {
      const cssWidth = world.clientWidth || VIEW_W;
      const dpr = window.devicePixelRatio || 1;
      const scale = Math.min(2, Math.max(1, (cssWidth * dpr) / VIEW_W));
      const bucket = Math.round(scale * 4) / 4;
      if (bucket === currentScale) return;
      currentScale = bucket;
      canvas.width = Math.round(VIEW_W * bucket);
      canvas.height = Math.round(VIEW_H * bucket);
      sceneryRef.current = null;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(world);
    return () => observer.disconnect();
  }, []);

  // Arranque de ronda al entrar a briefing (y en la primera partida).
  useEffect(() => {
    if (phase !== "briefing") return;
    setHelpVisible(profile.helpAlways);
    adapterRef.current?.resetRound();
    setupRound(round, roundIndex);
    narrate(
      round.spokenText,
      briefingKey(ageId, roundIndex, roundLevelRef.current),
      {
        onEnd: () => {
          if (phaseRef.current === "briefing") setPhase("playing");
        },
      },
    );
    const fallback = window.setTimeout(() => {
      if (phaseRef.current === "briefing") setPhase("playing");
    }, 6000);
    return () => window.clearTimeout(fallback);
  }, [ageId, narrate, phase, profile.helpAlways, round, roundIndex, setupRound]);

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
        if (!input.grabHeld) input.grabPressed = true;
        input.grabHeld = true;
      } else if (event.key === "q" || event.key === "Q") {
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
      else if (event.key === "e" || event.key === "E") input.grabHeld = false;
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
    const fruit = state.fruits.find((item) => item.held);
    if (fruit) {
      fruit.collected = false;
      fruit.held = false;
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

  // "jump" y "grab" son acciones de un solo disparo (press): mantener el
  // dedo apoyado no las repite. "left"/"right" son estados sostenidos.
  const oneShotKeys = { jump: "jumpHeld", grab: "grabHeld" };

  const touchHold = (key) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const heldField = oneShotKeys[key];
      if (heldField) {
        if (!inputRef.current[heldField]) inputRef.current[`${key}Pressed`] = true;
        inputRef.current[heldField] = true;
      } else inputRef.current[key] = true;
    },
    onPointerUp: () => {
      const heldField = oneShotKeys[key];
      if (heldField) inputRef.current[heldField] = false;
      else inputRef.current[key] = false;
    },
    onPointerCancel: () => {
      const heldField = oneShotKeys[key];
      if (heldField) inputRef.current[heldField] = false;
      else inputRef.current[key] = false;
    },
  });

  const targetIcons = round.target <= 10 ? Array.from({ length: round.target }) : [];
  const progressCount = hud.delivered + hud.carried;

  return (
    <div className="bosque" data-age={ageId}>
      <div className="bosque__stage">
        {/* El lienzo vive en su propia caja: en vertical la interfaz ocupa
            filas aparte y `.bosque__world` conserva la relación 16:9. */}
        <div className="bosque__world" ref={worldRef}>
          <canvas
            className="bosque__canvas"
            ref={canvasRef}
            width={VIEW_W * 2}
            height={VIEW_H * 2}
            aria-label="Escenario del bosque"
          />
        </div>

        {phase !== "intro" && phase !== "missionComplete" ? (
          <>
            <header className="bosque__hud">
              <div className="bosque__hud-left">
                <button
                  className="bosque__icon-button"
                  type="button"
                  aria-label="Salir del juego"
                  onClick={() => onExit?.()}
                >
                  <Glyph name="close" />
                </button>
                <div className="bosque__hud-round">
                  <span>
                    Ronda <strong>{roundIndex + 1}</strong>/{FOREST_ROUNDS}
                  </span>
                  <i
                    aria-hidden="true"
                    style={{
                      "--progress": `${(roundIndex / FOREST_ROUNDS) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div
                className="bosque__hud-target"
                role="status"
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
                  className="bosque__icon-button"
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
                  <Glyph name={audioPrefs.music ? "music" : "mute"} />
                </button>
                <button
                  className="bosque__icon-button"
                  type="button"
                  aria-label="Repetir instrucción"
                  onClick={() =>
                    narrate(
                      round.spokenText,
                      briefingKey(ageId, roundIndex, roundLevelRef.current),
                    )
                  }
                >
                  <Glyph name="speaker" />
                </button>
                <button
                  className="bosque__icon-button"
                  type="button"
                  aria-label={paused ? "Continuar" : "Pausa"}
                  onClick={togglePause}
                >
                  <Glyph name={paused ? "play" : "pause"} />
                </button>
              </div>
            </header>

            {subtitle ? (
              <p className="bosque__subtitle" role="status">
                <span className="bosque__subtitle-avatar" aria-hidden="true" />
                <span>{subtitle}</span>
              </p>
            ) : null}

            <div className="bosque__touch">
              <div className="bosque__touch-move">
                <button
                  type="button"
                  aria-label="Ir a la izquierda"
                  {...touchHold("left")}
                >
                  <Glyph name="left" />
                </button>
                <button
                  type="button"
                  aria-label="Ir a la derecha"
                  {...touchHold("right")}
                >
                  <Glyph name="right" />
                </button>
              </div>
              <div className="bosque__touch-actions">
                <button
                  className="bosque__touch-drop"
                  type="button"
                  aria-label="Soltar una fruta"
                  disabled={hud.carried === 0}
                  onClick={dropFruit}
                >
                  <Glyph name="down" />
                  Soltar
                </button>
                <button
                  className="bosque__touch-grab"
                  type="button"
                  aria-label="Recoger fruta"
                  {...touchHold("grab")}
                >
                  <Glyph name="hand" />
                  Recoger
                </button>
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
              <Glyph name="play" />
              Comenzar
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
              Teclado: flechas o A/D · espacio salta · E recoge · Q suelta · Esc pausa
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
              <Glyph name="play" />
              Continuar
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
              <Glyph name="play" />
              Jugar otra vez
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
