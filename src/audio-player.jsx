import { useEffect, useId, useRef, useState } from "react";
import { Pause } from "@phosphor-icons/react/Pause";
import { Play } from "@phosphor-icons/react/Play";
import { SpeakerHigh } from "@phosphor-icons/react/SpeakerHigh";
import { SpeakerSlash } from "@phosphor-icons/react/SpeakerSlash";
import { trackInteraction } from "./platform-enhancements.jsx";

const AUDIO_PLAY_EVENT = "tesis20:audio-play";
const AUDIO_RATE_EVENT = "tesis20:audio-rate-change";
const AUDIO_RATE_STORAGE_KEY = "tesis20:audio-playback-rate";
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5];
const MEDIA_SESSION_ACTIONS = ["play", "pause", "seekbackward", "seekforward", "seekto"];

let activeMediaSessionPlayerId = null;

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getSafeAudioId(src) {
  const filename = String(src || "audio").split("/").pop() || "audio";
  return filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
}

function readStoredPlaybackRate() {
  if (typeof window === "undefined") return 1;
  try {
    const storedRate = Number(window.sessionStorage.getItem(AUDIO_RATE_STORAGE_KEY));
    return PLAYBACK_RATES.includes(storedRate) ? storedRate : 1;
  } catch {
    return 1;
  }
}

function safelySetMediaSessionAction(action, handler) {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Algunos navegadores exponen Media Session parcialmente.
  }
}

export function AudioPlayer({
  src,
  title,
  variant = "card",
  durationHint = 0,
  transcript = "",
}) {
  const audioRef = useRef(null);
  const trackedStartRef = useRef(false);
  const playerId = useId();
  const transcriptId = `${playerId}-transcript`;
  const audioId = getSafeAudioId(src);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint);
  const [hasError, setHasError] = useState(false);
  const [playbackNotice, setPlaybackNotice] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(readStoredPlaybackRate);

  const updateMediaSessionPosition = (audio = audioRef.current) => {
    if (
      activeMediaSessionPlayerId !== playerId ||
      !audio ||
      !("mediaSession" in navigator) ||
      typeof navigator.mediaSession.setPositionState !== "function"
    ) {
      return;
    }

    const mediaDuration = audio.duration;
    if (!Number.isFinite(mediaDuration) || mediaDuration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: mediaDuration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(Math.max(audio.currentTime || 0, 0), mediaDuration),
      });
    } catch {
      // La reproducción continúa aunque el sistema no acepte el estado de posición.
    }
  };

  const seekTo = (nextTime, trackingDirection = "") => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(nextTime)) return;
    const mediaDuration = Number.isFinite(audio.duration) ? audio.duration : duration;
    const boundedTime = Math.min(Math.max(nextTime, 0), Math.max(mediaDuration || 0, 0));
    audio.currentTime = boundedTime;
    setCurrentTime(boundedTime);
    updateMediaSessionPosition(audio);
    if (trackingDirection) {
      trackInteraction("audio_seek", {
        audioId,
        direction: trackingDirection,
        variant,
      });
    }
  };

  const skipBy = (seconds) => {
    const audio = audioRef.current;
    if (!audio || audio.error || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    seekTo(audio.currentTime + seconds, seconds > 0 ? "forward" : "backward");
  };

  const releaseMediaSession = () => {
    if (!("mediaSession" in navigator) || activeMediaSessionPlayerId !== playerId) return;
    MEDIA_SESSION_ACTIONS.forEach((action) => safelySetMediaSessionAction(action, null));
    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.setPositionState?.();
    } catch {
      // No todos los navegadores permiten limpiar cada propiedad.
    }
    activeMediaSessionPlayerId = null;
  };

  const configureMediaSession = (audio) => {
    if (!("mediaSession" in navigator)) return;
    activeMediaSessionPlayerId = playerId;

    if ("MediaMetadata" in window) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title,
          artist: "Tesis20",
          album: "Orientación académica",
          artwork: [
            { src: "/assets/tesis20-logo.png", sizes: "300x300", type: "image/png" },
          ],
        });
      } catch {
        // La metadata es una mejora progresiva y nunca bloquea el audio.
      }
    }

    safelySetMediaSessionAction("play", () => {
      audio.play().catch(() => {
        setPlaybackNotice("No se pudo reanudar el audio. Intenta desde el reproductor.");
      });
    });
    safelySetMediaSessionAction("pause", () => audio.pause());
    safelySetMediaSessionAction("seekbackward", (details) => {
      skipBy(-(details?.seekOffset || 10));
    });
    safelySetMediaSessionAction("seekforward", (details) => {
      skipBy(details?.seekOffset || 10);
    });
    safelySetMediaSessionAction("seekto", (details) => {
      if (!Number.isFinite(details?.seekTime)) return;
      seekTo(details.seekTime, "system");
    });
    updateMediaSessionPosition(audio);
  };

  useEffect(() => {
    const pauseWhenAnotherStarts = (event) => {
      if (event.detail !== playerId && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };

    window.addEventListener(AUDIO_PLAY_EVENT, pauseWhenAnotherStarts);
    return () => window.removeEventListener(AUDIO_PLAY_EVENT, pauseWhenAnotherStarts);
  }, [playerId]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
    const pauseWhenPageHides = () => {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    window.addEventListener("pagehide", pauseWhenPageHides);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      window.removeEventListener("pagehide", pauseWhenPageHides);
      pauseWhenPageHides();
      releaseMediaSession();
    };
  }, [playerId]);

  useEffect(() => {
    const syncPlaybackRate = (event) => {
      const nextRate = Number(event.detail);
      if (!PLAYBACK_RATES.includes(nextRate)) return;
      setPlaybackRate(nextRate);
      if (audioRef.current) audioRef.current.playbackRate = nextRate;
    };
    window.addEventListener(AUDIO_RATE_EVENT, syncPlaybackRate);
    return () => window.removeEventListener(AUDIO_RATE_EVENT, syncPlaybackRate);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (audio.paused) {
      window.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: playerId }));
      try {
        setPlaybackNotice("");
        setIsLoading(true);
        await audio.play();
      } catch (error) {
        setIsLoading(false);
        if (error?.name !== "AbortError") {
          setPlaybackNotice("No se pudo iniciar el audio. Intenta nuevamente.");
        }
      }
    } else {
      audio.pause();
    }
  };

  const seek = (event) => {
    const nextTime = Number(event.target.value);
    if (!Number.isFinite(nextTime)) return;
    seekTo(nextTime);
  };

  const toggleMuted = () => {
    if (!audioRef.current) return;
    const nextMuted = !audioRef.current.muted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const canSeek = isReady && Number.isFinite(duration) && duration > 0 && !hasError;

  const retryAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setHasError(false);
    setPlaybackNotice("");
    setIsReady(false);
    setIsLoading(true);
    setIsBuffering(false);
    audio.load();
  };

  const changePlaybackRate = (event) => {
    const nextRate = Number(event.target.value);
    if (!PLAYBACK_RATES.includes(nextRate)) return;
    try {
      window.sessionStorage.setItem(AUDIO_RATE_STORAGE_KEY, String(nextRate));
    } catch {
      // La preferencia funciona durante la vista aunque el almacenamiento esté bloqueado.
    }
    window.dispatchEvent(new CustomEvent(AUDIO_RATE_EVENT, { detail: nextRate }));
    trackInteraction("audio_rate_changed", { audioId, rate: nextRate, variant });
  };

  const liveStatus = hasError
    ? ""
    : isBuffering
      ? "Cargando más audio para continuar la reproducción."
      : isLoading
        ? "Cargando audio."
        : playbackNotice;

  return (
    <div
      className={`audio-player audio-player--${variant}`}
      role="group"
      aria-label={`Reproductor de audio: ${title}`}
      aria-busy={isLoading || isBuffering}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        playsInline
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || durationHint || 0);
          event.currentTarget.playbackRate = playbackRate;
          setHasError(false);
          setIsReady(true);
          setIsLoading(false);
        }}
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration || durationHint || 0)
        }
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          updateMediaSessionPosition(event.currentTarget);
        }}
        onCanPlay={() => {
          setIsReady(true);
          setIsLoading(false);
          setIsBuffering(false);
        }}
        onWaiting={() => {
          if (audioRef.current && !audioRef.current.paused) setIsBuffering(true);
        }}
        onStalled={() => {
          if (audioRef.current && !audioRef.current.paused) setIsBuffering(true);
        }}
        onPlaying={(event) => {
          setIsLoading(false);
          setIsBuffering(false);
          configureMediaSession(event.currentTarget);
        }}
        onPlay={(event) => {
          setIsPlaying(true);
          setPlaybackNotice("");
          configureMediaSession(event.currentTarget);
          try {
            if (activeMediaSessionPlayerId === playerId) navigator.mediaSession.playbackState = "playing";
          } catch {
            // El estado del sistema es una mejora progresiva.
          }
          if (!trackedStartRef.current) {
            trackedStartRef.current = true;
            trackInteraction("audio_started", { audioId, variant });
          }
        }}
        onPause={() => {
          setIsPlaying(false);
          setIsLoading(false);
          setIsBuffering(false);
          try {
            if (activeMediaSessionPlayerId === playerId) navigator.mediaSession.playbackState = "paused";
          } catch {
            // El audio local ya quedó pausado.
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          trackedStartRef.current = false;
          releaseMediaSession();
          trackInteraction("audio_completed", { audioId, variant });
        }}
        onError={() => {
          setHasError(true);
          setIsReady(false);
          setIsLoading(false);
          setIsBuffering(false);
          releaseMediaSession();
        }}
      />

      <button
        className="audio-player__play"
        type="button"
        onClick={togglePlayback}
        aria-label={`${isPlaying ? "Pausar" : "Reproducir"} ${title}`}
        disabled={hasError}
      >
        {isPlaying ? (
          <Pause size={22} weight="fill" aria-hidden="true" />
        ) : (
          <Play size={22} weight="fill" aria-hidden="true" />
        )}
      </button>

      <div className="audio-player__content">
        <div className="audio-player__heading">
          <span>Escuchar descripción</span>
          <strong>{title}</strong>
        </div>
        {hasError ? (
          <div className="audio-player__error" role="status">
            <span>El audio no está disponible en este momento.</span>
            <button type="button" onClick={retryAudio}>Reintentar</button>
          </div>
        ) : (
          <div className="audio-player__timeline">
            <span aria-hidden="true">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="1"
              value={Math.min(currentTime, duration || 0)}
              onChange={seek}
              aria-label={`Posición de ${title}`}
              aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
              aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
              onKeyDown={(event) => {
                if (!event.shiftKey) return;
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  skipBy(-10);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  skipBy(10);
                }
              }}
              disabled={!canSeek}
              style={{ "--audio-progress": `${progress}%` }}
            />
            <span aria-hidden="true">{formatTime(duration)}</span>
          </div>
        )}
        <div
          className="audio-player__secondary-controls"
          role="group"
          aria-label={`Controles adicionales de ${title}`}
        >
          <button
            type="button"
            onClick={() => skipBy(-10)}
            disabled={!canSeek}
            aria-label={`Retroceder 10 segundos en ${title}`}
          >
            −10 s
          </button>
          <label className="sr-only" htmlFor={`${playerId}-rate`}>
            Velocidad de reproducción de {title}
          </label>
          <select
            id={`${playerId}-rate`}
            value={playbackRate}
            onChange={changePlaybackRate}
            aria-label={`Velocidad de reproducción de ${title}`}
          >
            {PLAYBACK_RATES.map((rate) => (
              <option key={rate} value={rate}>{rate}×</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => skipBy(10)}
            disabled={!canSeek}
            aria-label={`Avanzar 10 segundos en ${title}`}
          >
            +10 s
          </button>
        </div>
        {liveStatus ? (
          <p className="audio-player__notice" role="status" aria-live="polite" aria-atomic="true">
            {liveStatus}
          </p>
        ) : null}
        {transcript ? (
          <details
            className="audio-player__transcript"
            onToggle={(event) =>
              trackInteraction("audio_transcript_toggle", {
                audioId,
                expanded: event.currentTarget.open,
                variant,
              })
            }
          >
            <summary aria-controls={transcriptId}>
              Leer transcripción de {title}
            </summary>
            <div id={transcriptId}>
              <p>{transcript}</p>
            </div>
          </details>
        ) : null}
      </div>

      <button
        className="audio-player__volume"
        type="button"
        onClick={toggleMuted}
        aria-label={`${isMuted ? "Restablecer sonido de" : "Silenciar"} ${title}`}
        disabled={hasError}
      >
        {isMuted ? (
          <SpeakerSlash size={20} aria-hidden="true" />
        ) : (
          <SpeakerHigh size={20} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
