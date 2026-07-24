// GameHost de "Memoria Mágica": grid de cartas volteables, 100% React+CSS
// (sin canvas). Reutiliza el AudioDirector del motor y el catálogo de
// stickers ya ilustrado — cero arte nuevo por tema.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAudioDirector } from "../audio/audio-director.js";
import { createDifficultyAdapter } from "../learning/difficulty.js";
import {
  createMemoryBoard,
  MEMORY_AGE_PROFILES,
  MEMORY_ROUNDS,
  MEMORY_THEMES,
} from "../content/memory-mission.js";
import { STICKERS } from "../../stickers/sticker-registry.jsx";
import "./memoria-game.css";

const AGE_LABEL = { "2-3": "2–3 años", "4-5": "4–5 años", 6: "6 años" };

/**
 * @param {{
 *   themeId: string, ageId: "2-3"|"4-5"|"6", initialRound?: number,
 *   onRoundComplete?: (n:number)=>void, onMissionComplete?: (s:object)=>void,
 *   onExit?: () => void,
 * }} props
 */
export default function MemoriaGame({
  themeId,
  ageId = "2-3",
  initialRound = 0,
  onRoundComplete,
  onMissionComplete,
  onExit,
}) {
  const theme = useMemo(
    () => MEMORY_THEMES.find((item) => item.id === themeId) ?? MEMORY_THEMES[0],
    [themeId],
  );
  const profile = MEMORY_AGE_PROFILES[ageId] ?? MEMORY_AGE_PROFILES["2-3"];

  const [phase, setPhase] = useState("intro");
  const [roundIndex, setRoundIndex] = useState(Math.min(initialRound, MEMORY_ROUNDS - 1));
  const [board, setBoard] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(true);
  const [previewing, setPreviewing] = useState(true);
  const [audioPrefs, setAudioPrefs] = useState({ music: true, voice: true });
  const [missionSummary, setMissionSummary] = useState(null);
  const [celebrateId, setCelebrateId] = useState(null);

  const audioRef = useRef(null);
  const adapterRef = useRef(null);
  const previewTimerRef = useRef(null);
  const mismatchTimerRef = useRef(null);

  useEffect(() => {
    const audio = createAudioDirector();
    audioRef.current = audio;
    setAudioPrefs(audio.prefs());
    adapterRef.current = createDifficultyAdapter({ maxLevel: 0 });
    return () => {
      window.clearTimeout(previewTimerRef.current);
      window.clearTimeout(mismatchTimerRef.current);
      audio.destroy();
      audioRef.current = null;
    };
  }, []);

  const speak = useCallback((text) => {
    audioRef.current?.speak(text);
  }, []);

  const setupRound = useCallback(
    (index) => {
      const nextBoard = createMemoryBoard({ themeId: theme.id, ageId, roundIndex: index });
      setBoard(nextBoard);
      setFlipped([]);
      setMatchedIds(new Set());
      setMoves(0);
      setLocked(true);
      setPreviewing(true);
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = window.setTimeout(() => {
        setLocked(false);
        setPreviewing(false);
      }, profile.previewMs);
    },
    [ageId, profile.previewMs, theme.id],
  );

  useEffect(() => {
    if (phase !== "briefing") return;
    setupRound(roundIndex);
    speak(
      `${theme.tagline} Mira bien la posición de cada tarjeta, ${
        roundIndex === 0 ? "" : "y "
      }encuentra las parejas.`,
    );
    setPhase("playing");
  }, [phase, roundIndex, setupRound, speak, theme.tagline]);

  const handleStart = () => {
    audioRef.current?.start();
    audioRef.current?.playMusic();
    setPhase("briefing");
  };

  const handleFlip = (card) => {
    if (locked || flipped.length === 2) return;
    if (flipped.some((item) => item.id === card.id)) return;
    if (matchedIds.has(card.pairId)) return;

    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((current) => current + 1);
      const [first, second] = nextFlipped;
      if (first.pairId === second.pairId) {
        adapterRef.current?.recordSuccess();
        audioRef.current?.sfx("collect");
        setCelebrateId(first.pairId);
        window.setTimeout(() => setCelebrateId(null), 650);
        const nextMatched = new Set(matchedIds);
        nextMatched.add(first.pairId);
        setMatchedIds(nextMatched);
        setFlipped([]);
        const totalPairs = board.length / 2;
        if (nextMatched.size >= totalPairs) {
          audioRef.current?.sfx("success");
          window.setTimeout(() => audioRef.current?.sfx("celebrate"), 300);
          const completedRound = roundIndex + 1;
          speak(moves <= totalPairs ? "¡Memoria perfecta! Sigamos." : "¡Encontraste todas las parejas!");
          onRoundComplete?.(completedRound);
          window.setTimeout(() => {
            if (completedRound >= MEMORY_ROUNDS) {
              const summary = adapterRef.current.summary();
              setMissionSummary(summary);
              setPhase("missionComplete");
              speak("¡Memoria mágica completada! Qué buena memoria tienes.");
              onMissionComplete?.(summary);
            } else {
              setRoundIndex(completedRound);
              setPhase("briefing");
            }
          }, 1500);
        }
      } else {
        adapterRef.current?.recordError();
        audioRef.current?.sfx("try");
        setLocked(true);
        window.clearTimeout(mismatchTimerRef.current);
        mismatchTimerRef.current = window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, profile.mismatchMs);
      }
    }
  };

  const handleReplay = () => {
    adapterRef.current = createDifficultyAdapter({ maxLevel: 0 });
    setMissionSummary(null);
    setRoundIndex(0);
    setPhase("briefing");
  };

  const totalPairs = board.length / 2;
  const columns = totalPairs <= 4 ? 4 : totalPairs <= 6 ? 4 : totalPairs <= 8 ? 5 : 6;

  return (
    <div className="memoria" data-theme={theme.id} style={{ "--memoria-accent": theme.accent, "--memoria-accent-soft": theme.accentSoft }}>
      <div className="memoria__stage">
        {phase !== "intro" && phase !== "missionComplete" ? (
          <>
            <header className="memoria__hud">
              <button className="memoria__hud-exit" type="button" aria-label="Salir del juego" onClick={() => onExit?.()}>
                ✕
              </button>
              <div className="memoria__hud-round">Ronda {roundIndex + 1} / {MEMORY_ROUNDS}</div>
              <div className="memoria__hud-title">{theme.name}</div>
              <div className="memoria__hud-buttons">
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
                <button type="button" aria-label="Repetir instrucción" onClick={() => speak(theme.tagline)}>
                  🔊
                </button>
              </div>
            </header>

            <p className="memoria__moves" role="status">
              {previewing
                ? "¡Memorízalas! Las tarjetas se voltearán en un momento…"
                : `${matchedIds.size} / ${totalPairs} parejas · ${moves} intentos`}
            </p>

            <div
              className="memoria__grid"
              style={{ "--memoria-cols": columns }}
              aria-label={`Tablero de memoria: ${theme.name}`}
            >
              {board.map((card) => {
                const isFlipped =
                  previewing || flipped.some((item) => item.id === card.id) || matchedIds.has(card.pairId);
                const isMatched = matchedIds.has(card.pairId);
                const Sticker = STICKERS[card.sticker];
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={[
                      "memoria__card",
                      isFlipped ? "is-flipped" : "",
                      isMatched ? "is-matched" : "",
                      celebrateId === card.pairId ? "is-celebrating" : "",
                    ].filter(Boolean).join(" ")}
                    disabled={isMatched || locked && !isFlipped}
                    aria-label={isFlipped ? card.sticker : "Tarjeta boca abajo"}
                    onClick={() => handleFlip(card)}
                  >
                    <span className="memoria__card-inner">
                      <span className="memoria__card-back" aria-hidden="true">
                        <span className="memoria__card-back-mark">?</span>
                      </span>
                      <span className="memoria__card-front" aria-hidden="true">
                        {Sticker ? <Sticker size={54} /> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {phase === "intro" ? (
          <div className="memoria__overlay memoria__intro">
            <span className="memoria__kicker">{theme.name}</span>
            <h2>{theme.tagline}</h2>
            <p>Voltea dos tarjetas y encuentra las parejas iguales. Para {AGE_LABEL[ageId]}.</p>
            <button className="memoria__start" type="button" onClick={handleStart}>
              ▶ Comenzar
            </button>
            <button className="memoria__secondary" type="button" onClick={() => onExit?.()}>
              Volver a Nido
            </button>
          </div>
        ) : null}

        {phase === "missionComplete" && missionSummary ? (
          <div className="memoria__overlay memoria__complete">
            <span className="memoria__kicker">¡Memoria completa!</span>
            <h2>20 rondas de {theme.name}</h2>
            <div className="memoria__summary">
              <span>
                <strong>{missionSummary.successes}</strong>
                <small>parejas encontradas</small>
              </span>
              <span>
                <strong>{missionSummary.errors}</strong>
                <small>intentos fallidos</small>
              </span>
            </div>
            <button className="memoria__start" type="button" onClick={handleReplay}>
              ▶ Jugar otra vez
            </button>
            <button className="memoria__secondary" type="button" onClick={() => onExit?.()}>
              Volver a Nido
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
