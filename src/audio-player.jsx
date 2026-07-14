import { useEffect, useId, useRef, useState } from "react";
import { Pause } from "@phosphor-icons/react/Pause";
import { Play } from "@phosphor-icons/react/Play";
import { SpeakerHigh } from "@phosphor-icons/react/SpeakerHigh";
import { SpeakerSlash } from "@phosphor-icons/react/SpeakerSlash";

const AUDIO_PLAY_EVENT = "tesis20:audio-play";

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, variant = "card" }) {
  const audioRef = useRef(null);
  const playerId = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const pauseWhenAnotherStarts = (event) => {
      if (event.detail !== playerId && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };

    window.addEventListener(AUDIO_PLAY_EVENT, pauseWhenAnotherStarts);
    return () => window.removeEventListener(AUDIO_PLAY_EVENT, pauseWhenAnotherStarts);
  }, [playerId]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (audio.paused) {
      window.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: playerId }));
      try {
        await audio.play();
      } catch {
        setHasError(true);
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

  return (
    <div
      className={`audio-player audio-player--${variant}`}
      role="group"
      aria-label={`Reproductor de audio: ${title}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        playsInline
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setHasError(false);
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => setHasError(true)}
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
          <p className="audio-player__error" role="status">
            El audio no está disponible en este momento.
          </p>
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
              style={{ "--audio-progress": `${progress}%` }}
            />
            <span aria-hidden="true">{formatTime(duration)}</span>
          </div>
        )}
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
