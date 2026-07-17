import { useEffect, useId, useRef, useState } from "react";
import { Pause } from "@phosphor-icons/react/Pause";
import { Play } from "@phosphor-icons/react/Play";
import { SpeakerHigh } from "@phosphor-icons/react/SpeakerHigh";
import { SpeakerSlash } from "@phosphor-icons/react/SpeakerSlash";
import { trackInteraction } from "./platform-enhancements.jsx";

const AUDIO_PLAY_EVENT = "tesis20:audio-play";

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, variant = "card", durationHint = 0 }) {
  const audioRef = useRef(null);
  const trackedStartRef = useRef(false);
  const playerId = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint);
  const [hasError, setHasError] = useState(false);
  const [playbackNotice, setPlaybackNotice] = useState("");
  const [isReady, setIsReady] = useState(false);

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
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (audio.paused) {
      window.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: playerId }));
      try {
        setPlaybackNotice("");
        await audio.play();
      } catch (error) {
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
    if (!audioRef.current || !Number.isFinite(nextTime)) return;
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
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
    audio.load();
  };

  return (
    <div
      className={`audio-player audio-player--${variant}`}
      role="group"
      aria-label={`Reproductor de audio: ${title}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        playsInline
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || durationHint || 0);
          setHasError(false);
          setIsReady(true);
        }}
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration || durationHint || 0)
        }
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => {
          setIsPlaying(true);
          setPlaybackNotice("");
          if (!trackedStartRef.current) {
            trackedStartRef.current = true;
            trackInteraction("audio_started", { title, variant });
          }
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          trackedStartRef.current = false;
          trackInteraction("audio_completed", { title, variant });
        }}
        onError={() => {
          setHasError(true);
          setIsReady(false);
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
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={seek}
              aria-label={`Posición de ${title}`}
              aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
              disabled={!canSeek}
              style={{ "--audio-progress": `${progress}%` }}
            />
            <span aria-hidden="true">{formatTime(duration)}</span>
          </div>
        )}
        {playbackNotice ? (
          <p className="audio-player__notice" role="status">{playbackNotice}</p>
        ) : null}
      </div>

      <button
        className="audio-player__volume"
        type="button"
        onClick={toggleMuted}
        aria-label={`${isMuted ? "Activar" : "Silenciar"} audio de ${title}`}
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
