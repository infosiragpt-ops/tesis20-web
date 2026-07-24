import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildCurriculumChallenge,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
} from "./nido-curriculum";
import { AREA_SCENES } from "./illustrations/area-scenes.jsx";
import { CelebrationBurst, NidoMascot } from "./illustrations/nido-mascot.jsx";
import { createNidoIcon, NidoGlyph } from "./nido-icon-map";
import "./nido-games.css";
import nidoFocusStyles from "./nido-focus.css?inline";

const ArrowRight = createNidoIcon("ArrowRight");
const CheckCircle = createNidoIcon("CheckCircle");
const Fire = createNidoIcon("Fire");
const Play = createNidoIcon("Play");
const SpeakerHigh = createNidoIcon("SpeakerHigh");
const StopCircle = createNidoIcon("StopCircle");
const Star = createNidoIcon("Star");
const Trophy = createNidoIcon("Trophy");
const X = createNidoIcon("X");
const XCircle = createNidoIcon("XCircle");

const AGE_GROUPS = Object.freeze([
  {
    id: "2-3",
    label: "2–3 años",
    iconName: "Baby",
    support: "Juegos breves, visuales y con repetición.",
  },
  {
    id: "4-5",
    label: "4–5 años",
    iconName: "Smiley",
    support: "Retos guiados para explorar y relacionar.",
  },
  {
    id: "6",
    label: "6 años",
    iconName: "Student",
    support: "Secuencias, conteo y consignas de dos pasos.",
  },
]);

const CATEGORY_TONES = Object.freeze([
  { background: "#df6467", ink: "#ffffff", track: "rgba(119, 37, 48, 0.28)" },
  { background: "#efd38f", ink: "#10233f", track: "rgba(114, 77, 35, 0.24)" },
  { background: "#63cf83", ink: "#ffffff", track: "rgba(16, 92, 57, 0.24)" },
  { background: "#ffd985", ink: "#10233f", track: "rgba(122, 86, 28, 0.22)" },
  { background: "#51b7ef", ink: "#ffffff", track: "rgba(27, 79, 130, 0.25)" },
  { background: "#7757f5", ink: "#ffffff", track: "rgba(38, 26, 118, 0.28)" },
]);

const DEFAULT_AUDIO_TRACKS = Object.freeze({
  "attention-2-3-level-1":
    "/assets/nido/audio/attention-2-3-level-1-v1.mp3",
});

const DEFAULT_FEEDBACK_TRACKS = Object.freeze({
  success: "/assets/nido/audio/success-tiriri-yupi-v1.mp3",
  error: "/assets/nido/audio/error-tin-ton-v1.mp3",
});

const AUTO_ADVANCE_MS = 1500;
const PROGRESS_MILESTONES = Object.freeze([5, 10, 15, 20]);

// Piezas de confeti deterministas (sin Math.random: mantiene el render estable).
const CONFETTI_PIECES = Object.freeze(
  Array.from({ length: 16 }, (_, index) => ({
    left: `${(index * 61 + 7) % 100}%`,
    delay: `${(index % 8) * 90}ms`,
    duration: `${1150 + (index % 5) * 170}ms`,
    color: ["#ff6f61", "#ffc94d", "#46b982", "#4b8ff7", "#9873e7"][index % 5],
    width: `${7 + (index % 3) * 3}px`,
    tilt: `${(index * 47) % 360}deg`,
  })),
);

// Al reabrir una ruta terminada se empieza de nuevo; si está a medias, se
// retoma en el primer reto pendiente.
function getStartIndex(completed) {
  if (completed >= NIDO_CURRICULUM_GAME_COUNT) return 0;
  return Math.min(completed, NIDO_CURRICULUM_GAME_COUNT - 1);
}

function createInitialProgress() {
  return Object.fromEntries(
    AGE_GROUPS.map((age) => [
      age.id,
      Object.fromEntries(
        NIDO_CURRICULUM.map((area) => [
          area.id,
          Object.fromEntries(area.categories.map((category) => [category.id, 0])),
        ]),
      ),
    ]),
  );
}

function getProgressValue(progress, ageId, areaId, categoryId) {
  return progress?.[ageId]?.[areaId]?.[categoryId] ?? 0;
}

function getProgressSummary(progress, ageId) {
  const counts = NIDO_CURRICULUM.flatMap((area) =>
    area.categories.map((category) =>
      getProgressValue(progress, ageId, area.id, category.id),
    ),
  );

  return {
    challenges: counts.reduce((total, count) => total + count, 0),
    routes: counts.filter((count) => count === NIDO_CURRICULUM_GAME_COUNT).length,
    areas: NIDO_CURRICULUM.filter((area) =>
      area.categories.some(
        (category) =>
          getProgressValue(progress, ageId, area.id, category.id) > 0,
      ),
    ).length,
  };
}

function findArea(areaId) {
  return NIDO_CURRICULUM.find((area) => area.id === areaId);
}

function getFirstCategoryId(areaId) {
  return findArea(areaId)?.categories[0]?.id ?? "";
}

function getVisualItems(visual) {
  if (Array.isArray(visual?.items)) return visual.items;
  if (Array.isArray(visual?.clues)) return visual.clues;
  if (visual?.model) return [visual.model];
  if (visual?.iconName) return [visual];
  if (visual?.itemIconName && visual?.count) {
    return Array.from({ length: Math.min(visual.count, 10) }, (_, index) => ({
      id: `${visual.itemIconName}-${index}`,
      iconName: visual.itemIconName,
      label: `Elemento ${index + 1}`,
    }));
  }
  return [];
}

function VisualToken({ item, compact = false }) {
  const imageSrc = item?.imageSrc ?? item?.value?.imageSrc;
  const iconName = item?.iconName ?? item?.value?.iconName;
  const tone = item?.tone ?? item?.value?.tone;
  const label =
    item?.label ??
    item?.value?.label ??
    item?.value ??
    item?.id ??
    "";

  return (
    <span
      className={`nido-games__visual-token ${tone ? "has-tone" : ""}`}
      style={tone ? { "--token-tone": tone } : undefined}
      title={String(label)}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="" aria-hidden="true" />
      ) : iconName ? (
        <NidoGlyph
          name={iconName}
          size={compact ? 30 : 44}
          weight="duotone"
          tint={tone}
          aria-hidden="true"
        />
      ) : null}
      {!imageSrc && (!iconName || compact) ? (
        <strong>{String(label)}</strong>
      ) : null}
    </span>
  );
}

function ChallengeScene({ challenge, category }) {
  const items = getVisualItems(challenge.visual);
  const isEnglish = challenge.areaId === "ingles";
  const repeatedWord = challenge.visual?.repeatWord;
  const displayedWord = challenge.visual?.word;

  return (
    <div
      className="nido-games__scene"
      data-kind={challenge.visual.kind}
      style={
        challenge.visual.backgroundTone
          ? { "--scene-tone": challenge.visual.backgroundTone }
          : undefined
      }
      aria-label="Pista visual del reto"
    >
      {isEnglish ? (
        <img
          src="/assets/nido/activities/english-world-v1.jpg"
          alt=""
          aria-hidden="true"
        />
      ) : null}
      <div className="nido-games__scene-content">
        {items.length ? (
          <div className="nido-games__visual-sequence">
            {items.map((item, index) => (
              <VisualToken
                item={item}
                compact={items.length > 6}
                key={item.id ?? `${item.label ?? item.value}-${index}`}
              />
            ))}
            {challenge.visual.missingPosition ? (
              <span className="nido-games__visual-question" aria-label="Elemento faltante">
                ?
              </span>
            ) : null}
          </div>
        ) : (
          <NidoGlyph
            name={category.iconName}
            size={88}
            weight="duotone"
            aria-hidden="true"
          />
        )}
        {displayedWord ? (
          <strong className="nido-games__scene-word">{String(displayedWord)}</strong>
        ) : null}
        {repeatedWord ? (
          <span className="nido-games__scene-repeat">
            Escucha y repite: <strong>{String(repeatedWord)}</strong>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ChallengeAnswers({
  challenge,
  selectedAnswer,
  onAnswer,
  locked = false,
}) {
  return (
    <div
      className="nido-games__answers"
      role="group"
      aria-label="Opciones de respuesta"
    >
      {challenge.options.map((option) => {
        const chosen = option.id === selectedAnswer;
        const correct = chosen && option.id === challenge.answerId;

        return (
          <button
            className={[
              chosen ? "is-selected" : "",
              chosen && correct ? "is-correct" : "",
              chosen && !correct ? "is-error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={option.tone ? { "--option-tone": option.tone } : undefined}
            type="button"
            aria-pressed={chosen}
            aria-label={option.label}
            disabled={locked && !chosen}
            onClick={() => onAnswer(option.id)}
            key={option.id}
          >
            <span className="nido-games__answer-visual" aria-hidden="true">
              {option.imageSrc ? (
                <img src={option.imageSrc} alt="" />
              ) : option.iconName === "NumberCircleOne" &&
                /^\d+$/.test(String(option.label).trim()) ? (
                <strong className="nido-games__answer-number">
                  {String(option.label).trim()}
                </strong>
              ) : option.iconName ? (
                <NidoGlyph
                  name={option.iconName}
                  size={52}
                  weight="duotone"
                  tint={option.tone}
                />
              ) : option.tone ? (
                <i />
              ) : (
                <strong>{option.label}</strong>
              )}
            </span>
            <span>{option.label}</span>
            {chosen ? (
              correct ? (
                <CheckCircle
                  className="nido-games__answer-state"
                  size={30}
                  weight="fill"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="nido-games__answer-state"
                  size={30}
                  weight="fill"
                  aria-hidden="true"
                />
              )
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function NidoGamesExperience({
  id = "clases",
  onStatus = () => {},
}) {
  const [selectedAge, setSelectedAge] = useState(AGE_GROUPS[0].id);
  const [selectedArea, setSelectedArea] = useState(NIDO_CURRICULUM[0].id);
  const [selectedCategory, setSelectedCategory] = useState(
    NIDO_CURRICULUM[0].categories[0].id,
  );
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [progress, setProgress] = useState(createInitialProgress);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [audioTracks, setAudioTracks] = useState(() => DEFAULT_AUDIO_TRACKS);
  const [feedbackTracks, setFeedbackTracks] = useState(
    () => DEFAULT_FEEDBACK_TRACKS,
  );
  const [focusMode, setFocusMode] = useState(false);
  const [routeComplete, setRouteComplete] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const audioRef = useRef(null);
  const feedbackAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const feedbackNodesRef = useRef([]);
  const playbackRunRef = useRef(0);
  const feedbackSoundRunRef = useRef(0);
  const feedbackTimerRef = useRef(null);
  const feedbackRunRef = useRef(0);
  const autoAdvanceTimerRef = useRef(null);
  const focusDialogRef = useRef(null);
  const focusCloseRef = useRef(null);
  const focusTitleRef = useRef(null);
  const focusNextRef = useRef(null);
  const routeSuccessRef = useRef(null);
  const previousFocusRef = useRef(null);

  const age = AGE_GROUPS.find((item) => item.id === selectedAge);
  const area = findArea(selectedArea);
  const AreaScene = AREA_SCENES[selectedArea] ?? AREA_SCENES.logica;
  const category = area.categories.find(
    (categoryItem) => categoryItem.id === selectedCategory,
  );
  const completedGames = getProgressValue(
    progress,
    selectedAge,
    selectedArea,
    selectedCategory,
  );
  const challenge = useMemo(
    () =>
      buildCurriculumChallenge({
        areaId: selectedArea,
        categoryId: selectedCategory,
        ageId: selectedAge,
        gameIndex: currentGameIndex,
      }),
    [currentGameIndex, selectedAge, selectedArea, selectedCategory],
  );
  const answerIsCorrect = selectedAnswer === challenge.answerId;
  const progressSummary = useMemo(
    () => getProgressSummary(progress, selectedAge),
    [progress, selectedAge],
  );

  useEffect(() => {
    let active = true;

    fetch("/assets/nido/audio/manifest.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((manifest) => {
        if (!active || !manifest) return;
        if (manifest.tracks) {
          setAudioTracks({
            ...DEFAULT_AUDIO_TRACKS,
            ...manifest.tracks,
          });
        }
        if (manifest.feedbackTracks) {
          setFeedbackTracks({
            ...DEFAULT_FEEDBACK_TRACKS,
            ...manifest.feedbackTracks,
          });
        }
      })
      .catch(() => {
        // Los respaldos locales y la voz del dispositivo permanecen disponibles.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      playbackRunRef.current += 1;
      feedbackSoundRunRef.current += 1;
      window.clearTimeout(autoAdvanceTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
      if (feedbackAudioRef.current) {
        feedbackAudioRef.current.pause();
        feedbackAudioRef.current.removeAttribute("src");
      }
      feedbackNodesRef.current.forEach(({ oscillator, gain }) => {
        try {
          oscillator.stop();
        } catch {
          // El nodo puede haber terminado antes del desmontaje.
        }
        oscillator.disconnect();
        gain.disconnect();
      });
      feedbackNodesRef.current = [];
      window.speechSynthesis?.cancel();
      window.clearTimeout(feedbackTimerRef.current);
      if (audioContextRef.current?.state !== "closed") {
        void audioContextRef.current?.close();
      }
    },
    [],
  );

  const stopInstruction = ({ announce = false } = {}) => {
    playbackRunRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    if (announce) onStatus("Indicación de voz detenida.");
  };

  const clearFeedbackEffect = () => {
    window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
    setFeedbackEffect(null);
  };

  const showFeedbackEffect = (type) => {
    window.clearTimeout(feedbackTimerRef.current);
    feedbackRunRef.current += 1;
    setFeedbackEffect({ type, runId: feedbackRunRef.current });
    feedbackTimerRef.current = window.setTimeout(
      () => {
        setFeedbackEffect(null);
        feedbackTimerRef.current = null;
      },
      type === "success" ? 1800 : 1050,
    );
  };

  const stopFeedbackSound = () => {
    feedbackSoundRunRef.current += 1;
    if (feedbackAudioRef.current) {
      feedbackAudioRef.current.pause();
      feedbackAudioRef.current.currentTime = 0;
      feedbackAudioRef.current.onerror = null;
    }
    feedbackNodesRef.current.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
      } catch {
        // El oscilador ya finalizó.
      }
      oscillator.disconnect();
      gain.disconnect();
    });
    feedbackNodesRef.current = [];
  };

  const playFeedbackTone = (type, runId) => {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;

    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioContextConstructor();
    }

    const audioContext = audioContextRef.current;
    const playNotes = () => {
      if (
        feedbackSoundRunRef.current !== runId ||
        audioContext.state === "closed"
      ) {
        return;
      }

      const startAt = audioContext.currentTime + 0.02;
      const notes =
        type === "success"
          ? [
              [659.25, 0, 0.18, 0.11],
              [783.99, 0.11, 0.22, 0.12],
              [1046.5, 0.23, 0.34, 0.14],
            ]
          : [
              [311.13, 0, 0.18, 0.1],
              [233.08, 0.15, 0.28, 0.085],
            ];

      notes.forEach(([frequency, delay, duration, volume]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const noteStart = startAt + delay;
        oscillator.type = type === "success" ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        const node = { oscillator, gain };
        feedbackNodesRef.current.push(node);
        oscillator.addEventListener(
          "ended",
          () => {
            feedbackNodesRef.current = feedbackNodesRef.current.filter(
              (item) => item !== node,
            );
            oscillator.disconnect();
            gain.disconnect();
          },
          { once: true },
        );
        oscillator.start(noteStart);
        oscillator.stop(noteStart + duration + 0.03);
      });
    };

    if (audioContext.state === "suspended") {
      void audioContext.resume().then(playNotes).catch(() => {});
    } else {
      playNotes();
    }
  };

  const playFeedbackSound = (type) => {
    stopFeedbackSound();
    const runId = feedbackSoundRunRef.current;
    const feedbackAudio = feedbackAudioRef.current;
    if (!feedbackAudio) {
      playFeedbackTone(type, runId);
      return;
    }

    let fallbackStarted = false;
    const fallbackOnce = () => {
      if (fallbackStarted || feedbackSoundRunRef.current !== runId) return;
      fallbackStarted = true;
      playFeedbackTone(type, runId);
    };

    feedbackAudio.src =
      feedbackTracks[type] ?? DEFAULT_FEEDBACK_TRACKS[type];
    feedbackAudio.currentTime = 0;
    feedbackAudio.volume = type === "success" ? 0.78 : 0.62;
    feedbackAudio.onerror = fallbackOnce;
    void feedbackAudio.play().catch(fallbackOnce);
  };

  const speakWithBrowserFallback = (text, runId) => {
    if (
      !("speechSynthesis" in window) ||
      typeof window.SpeechSynthesisUtterance !== "function"
    ) {
      if (playbackRunRef.current === runId) {
        setSpeaking(false);
        onStatus("No fue posible reproducir el audio. Lee la indicación en pantalla.");
      }
      return;
    }

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = 0.86;
    utterance.pitch = 1.05;
    utterance.onend = () => {
      if (playbackRunRef.current === runId) setSpeaking(false);
    };
    utterance.onerror = () => {
      if (playbackRunRef.current === runId) {
        setSpeaking(false);
        onStatus("No fue posible reproducir el audio. Lee la indicación en pantalla.");
      }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    onStatus("Reproduciendo la indicación con la voz del dispositivo.");
  };

  const playInstruction = async (targetChallenge = challenge) => {
    stopInstruction();
    const runId = playbackRunRef.current + 1;
    playbackRunRef.current = runId;
    const text =
      targetChallenge.spokenText ??
      targetChallenge.spokenInstruction ??
      targetChallenge.voice;
    const audioSrc = targetChallenge.audioId
      ? audioTracks[targetChallenge.audioId]
      : "";

    if (audioSrc && audioRef.current) {
      const audio = audioRef.current;
      let fallbackStarted = false;
      const fallbackOnce = () => {
        if (fallbackStarted || playbackRunRef.current !== runId) return;
        fallbackStarted = true;
        speakWithBrowserFallback(text, runId);
      };
      audio.src = audioSrc;
      audio.currentTime = 0;
      audio.onended = () => {
        if (playbackRunRef.current === runId) {
          setSpeaking(false);
          onStatus("Indicación de voz completada.");
        }
      };
      audio.onerror = fallbackOnce;
      try {
        await audio.play();
        if (playbackRunRef.current === runId) {
          setSpeaking(true);
          onStatus("Reproduciendo narración profesional pregrabada.");
        }
        return;
      } catch {
        fallbackOnce();
        return;
      }
    }

    speakWithBrowserFallback(text, runId);
  };

  const clearAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = null;
  };

  const resetActivity = () => {
    setSelectedAnswer("");
    setRouteComplete(false);
    clearAutoAdvance();
    clearFeedbackEffect();
    stopFeedbackSound();
    stopInstruction();
  };

  const closeFocusedGame = ({ announce = true } = {}) => {
    resetActivity();
    setFocusMode(false);
    if (announce) {
      onStatus("Juego cerrado. Regresaste a la selección de subcategorías.");
    }
  };

  useEffect(() => {
    if (!focusMode || !focusDialogRef.current) return undefined;
    const dialog = focusDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      focusCloseRef.current?.focus();
    });
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeFocusedGame();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      window.requestAnimationFrame(() => previousFocusRef.current?.focus?.());
    };
  }, [focusMode]);

  const handleAgeChange = (ageId) => {
    const firstArea = NIDO_CURRICULUM[0];
    const firstCategory = firstArea.categories[0];
    setSelectedAge(ageId);
    setSelectedArea(firstArea.id);
    setSelectedCategory(firstCategory.id);
    setCurrentGameIndex(
      getStartIndex(
        getProgressValue(progress, ageId, firstArea.id, firstCategory.id),
      ),
    );
    resetActivity();
    onStatus(
      `Mostrando juegos diseñados para ${AGE_GROUPS.find((item) => item.id === ageId).label}.`,
    );
  };

  const handleAreaChange = (areaId) => {
    const categoryId = getFirstCategoryId(areaId);
    setSelectedArea(areaId);
    setSelectedCategory(categoryId);
    setCurrentGameIndex(
      getStartIndex(getProgressValue(progress, selectedAge, areaId, categoryId)),
    );
    resetActivity();
    onStatus(`Área de ${findArea(areaId).name} seleccionada.`);
  };

  // Tocar una subcategoría abre su juego directamente (antes solo la
  // seleccionaba y había que buscar el botón "Comenzar").
  const startCategory = (categoryId, event) => {
    previousFocusRef.current = event?.currentTarget ?? document.activeElement;
    const gameIndex = getStartIndex(
      getProgressValue(progress, selectedAge, selectedArea, categoryId),
    );
    setSelectedCategory(categoryId);
    setCurrentGameIndex(gameIndex);
    resetActivity();
    setFocusMode(true);
    const nextCategory = area.categories.find((item) => item.id === categoryId);
    const nextChallenge = buildCurriculumChallenge({
      areaId: selectedArea,
      categoryId,
      ageId: selectedAge,
      gameIndex,
    });
    onStatus(
      `${nextCategory.name}, reto ${gameIndex + 1} de 20, iniciado con narración automática.`,
    );
    void playInstruction(nextChallenge);
  };

  const replayRoute = () => {
    setRouteComplete(false);
    setSelectedAnswer("");
    clearAutoAdvance();
    clearFeedbackEffect();
    stopFeedbackSound();
    setCurrentGameIndex(0);
    const nextChallenge = buildCurriculumChallenge({
      areaId: selectedArea,
      categoryId: selectedCategory,
      ageId: selectedAge,
      gameIndex: 0,
    });
    onStatus(`Ruta de ${category.name} reiniciada. Reto 1 de 20.`);
    void playInstruction(nextChallenge);
    window.requestAnimationFrame(() => focusTitleRef.current?.focus());
  };

  const handleStart = (event) => {
    previousFocusRef.current = event?.currentTarget ?? document.activeElement;
    setSelectedAnswer("");
    setRouteComplete(false);
    clearFeedbackEffect();
    stopFeedbackSound();
    setFocusMode(true);
    onStatus(
      `${category.name}, reto ${currentGameIndex + 1} de 20, iniciado con narración automática.`,
    );
    void playInstruction(challenge);
  };

  const handleSpeak = () => {
    if (speaking) {
      stopInstruction({ announce: true });
      return;
    }
    clearFeedbackEffect();
    stopFeedbackSound();
    void playInstruction();
  };

  const handleAnswer = (answerId) => {
    if (answerIsCorrect) return;
    stopInstruction();
    setSelectedAnswer(answerId);

    if (answerId === challenge.answerId) {
      showFeedbackEffect("success");
      playFeedbackSound("success");
      navigator.vibrate?.(60);
      onStatus("¡Yupi! Respuesta correcta. Sonó la estrellita.");
      window.requestAnimationFrame(() => focusNextRef.current?.focus());
      clearAutoAdvance();
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        autoAdvanceTimerRef.current = null;
        handleNext();
      }, AUTO_ADVANCE_MS);
    } else {
      showFeedbackEffect("error");
      playFeedbackSound("error");
      navigator.vibrate?.([25, 40, 25]);
      onStatus(
        "Tin–ton. Esa no es la respuesta correcta. La pantalla indicó que debes intentarlo otra vez.",
      );
    }
  };

  const handleNext = () => {
    clearAutoAdvance();
    stopFeedbackSound();
    const nextCompleted = Math.max(completedGames, currentGameIndex + 1);
    setProgress((current) => ({
      ...current,
      [selectedAge]: {
        ...current[selectedAge],
        [selectedArea]: {
          ...current[selectedAge][selectedArea],
          [selectedCategory]: nextCompleted,
        },
      },
    }));

    if (currentGameIndex < NIDO_CURRICULUM_GAME_COUNT - 1) {
      const nextGameIndex = currentGameIndex + 1;
      const nextChallenge = buildCurriculumChallenge({
        areaId: selectedArea,
        categoryId: selectedCategory,
        ageId: selectedAge,
        gameIndex: nextGameIndex,
      });
      setCurrentGameIndex(nextGameIndex);
      setSelectedAnswer("");
      clearFeedbackEffect();
      onStatus(
        `¡Reto completado! Se abrió automáticamente el reto ${nextGameIndex + 1} de 20.`,
      );
      void playInstruction(nextChallenge);
      window.requestAnimationFrame(() => focusTitleRef.current?.focus());
    } else {
      stopInstruction();
      clearFeedbackEffect();
      setRouteComplete(true);
      onStatus(
        `¡Subcategoría ${category.name} completada para ${age.label}!`,
      );
      window.requestAnimationFrame(() => routeSuccessRef.current?.focus());
    }
  };

  const visibleCompleted = Math.max(
    completedGames,
    answerIsCorrect ? currentGameIndex + 1 : 0,
  );
  const focusProgress = Math.round(
    (Math.min(visibleCompleted, NIDO_CURRICULUM_GAME_COUNT) /
      NIDO_CURRICULUM_GAME_COUNT) *
      100,
  );

  return (
    <section className="nido-games" id={id} aria-labelledby="nido-games-title">
      <style data-nido-focus-styles>{nidoFocusStyles}</style>
      <audio ref={audioRef} preload="auto" aria-hidden="true" />
      <audio ref={feedbackAudioRef} preload="auto" aria-hidden="true" />

      <div className="nido-shell nido-games__shell">
        <header className="nido-games__heading">
          <NidoMascot
            className="nido-games__mascot"
            pose="hola"
            size={118}
            aria-hidden="true"
          />
          <div>
            <span>JUEGOS EDUCATIVOS POR EDAD</span>
            <h1 id="nido-games-title">Elige la edad para comenzar</h1>
            <p>
              Rutas de lógica, matemáticas, atención, memoria, habla e inglés.
              Cada subcategoría contiene 20 retos jugables con indicaciones de voz.
            </p>
          </div>
          <a href="#precios">Ver precios y accesos</a>
        </header>

        <div className="nido-games__age-progress">
          <fieldset className="nido-games__ages">
            <legend>Selecciona una edad</legend>
            <div className="nido-games__age-options">
              {AGE_GROUPS.map((ageOption) => (
                <button
                  className={ageOption.id === selectedAge ? "is-selected" : ""}
                  type="button"
                  aria-pressed={ageOption.id === selectedAge}
                  onClick={() => handleAgeChange(ageOption.id)}
                  key={ageOption.id}
                >
                  <NidoGlyph
                    name={ageOption.iconName}
                    size={40}
                    weight="duotone"
                    aria-hidden="true"
                  />
                  <strong>{ageOption.label}</strong>
                  <small>{ageOption.support}</small>
                  {ageOption.id === selectedAge ? (
                    <CheckCircle size={24} weight="fill" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <aside
            className="nido-games__summary"
            aria-label={`Progreso para ${age.label}`}
          >
            <h2>Tu progreso</h2>
            <div>
              <span>
                <Star size={24} weight="fill" aria-hidden="true" />
                <strong>{progressSummary.challenges}</strong>
                <small>Retos</small>
              </span>
              <span>
                <Trophy size={24} weight="fill" aria-hidden="true" />
                <strong>{progressSummary.routes}</strong>
                <small>Rutas</small>
              </span>
              <span>
                <Fire size={24} weight="fill" aria-hidden="true" />
                <strong>{progressSummary.areas}</strong>
                <small>Áreas</small>
              </span>
            </div>
            <p>Progreso de esta visita · no guardamos datos del menor.</p>
          </aside>
        </div>

        <div className="nido-games__learning">
          <nav className="nido-games__areas" aria-label="Áreas de aprendizaje">
            {NIDO_CURRICULUM.map((areaOption) => {
              const areaCompleted = areaOption.categories.reduce(
                (total, categoryItem) =>
                  total +
                  getProgressValue(
                    progress,
                    selectedAge,
                    areaOption.id,
                    categoryItem.id,
                  ),
                0,
              );

              return (
                <button
                  className={areaOption.id === selectedArea ? "is-selected" : ""}
                  type="button"
                  aria-pressed={areaOption.id === selectedArea}
                  onClick={() => handleAreaChange(areaOption.id)}
                  key={areaOption.id}
                >
                  <span>
                    <NidoGlyph
                      name={areaOption.iconName}
                      size={29}
                      weight="duotone"
                      aria-hidden="true"
                    />
                  </span>
                  <span>
                    <strong>{areaOption.name}</strong>
                    <small>
                      {areaCompleted}/{areaOption.categories.length * 20} retos
                    </small>
                  </span>
                </button>
              );
            })}
          </nav>

          <article className="nido-games__catalog" data-area={selectedArea}>
            <header className="nido-games__catalog-header">
              <span>
                <NidoGlyph
                  name={area.iconName}
                  size={38}
                  weight="duotone"
                  aria-hidden="true"
                />
              </span>
              <div>
                <small>ÁREA DE APRENDIZAJE</small>
                <h2>{area.name}</h2>
                <p>{area.description}</p>
              </div>
              <AreaScene className="nido-games__area-scene" aria-hidden="true" />
            </header>

            <div
              className="nido-games__categories"
              aria-label={`Subcategorías de ${area.name}`}
            >
              {area.categories.map((categoryItem, index) => {
                const completed = getProgressValue(
                  progress,
                  selectedAge,
                  selectedArea,
                  categoryItem.id,
                );
                const tone = CATEGORY_TONES[index % CATEGORY_TONES.length];
                const selected = categoryItem.id === selectedCategory;

                return (
                  <button
                    className={selected ? "is-selected" : ""}
                    style={{
                      "--category-bg": tone.background,
                      "--category-ink": tone.ink,
                      "--category-track": tone.track,
                    }}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Jugar ${categoryItem.name}: ${categoryItem.description} Progreso: ${completed} de 20.`}
                    onClick={(event) => startCategory(categoryItem.id, event)}
                    key={categoryItem.id}
                  >
                    <span className="nido-games__category-icon">
                      <NidoGlyph
                        name={categoryItem.iconName}
                        size={44}
                        weight="duotone"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="nido-games__category-copy">
                      <strong>{categoryItem.name}</strong>
                      <small>{categoryItem.description}</small>
                      <span
                        className="nido-games__category-progress"
                        role="progressbar"
                        aria-label={`Progreso en ${categoryItem.name}`}
                        aria-valuemin="0"
                        aria-valuemax="20"
                        aria-valuenow={completed}
                      >
                        <i style={{ width: `${(completed / 20) * 100}%` }} />
                      </span>
                    </span>
                    <span className="nido-games__category-count">
                      <strong>{completed} / 20</strong>
                      <ArrowRight size={24} weight="bold" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>

            <footer className="nido-games__catalog-action">
              <div>
                <NidoGlyph
                  name={category.iconName}
                  size={34}
                  weight="duotone"
                  aria-hidden="true"
                />
                <span>
                  <small>SUBCATEGORÍA SELECCIONADA</small>
                  <strong>{category.name}</strong>
                  <span>
                    Continuarás en el reto {Math.min(completedGames + 1, 20)} de
                    20.
                  </span>
                </span>
              </div>
              <button type="button" onClick={handleStart}>
                <Play size={22} weight="fill" aria-hidden="true" />
                {completedGames === 20 ? "Repetir ruta" : "Comenzar 20 retos"}
              </button>
            </footer>
          </article>
        </div>
      </div>

      {focusMode && typeof document !== "undefined"
        ? createPortal(
            <dialog
              className="nido-games__focus-dialog"
              ref={focusDialogRef}
              aria-labelledby="nido-focus-title"
              aria-describedby={
                routeComplete ? undefined : "nido-focus-instruction"
              }
              onCancel={(event) => {
                event.preventDefault();
                closeFocusedGame();
              }}
            >
              <div className="nido-games__focus-shell" data-area={selectedArea}>
                <header className="nido-games__focus-header">
                  <button
                    className="nido-games__focus-close"
                    ref={focusCloseRef}
                    type="button"
                    aria-label="Cerrar juego y volver a las subcategorías"
                    onClick={() => closeFocusedGame()}
                  >
                    <X size={30} weight="bold" aria-hidden="true" />
                  </button>
                  <div className="nido-games__focus-meta">
                    <span>{age.label}</span>
                    <strong>
                      {area.name} · {category.name}
                    </strong>
                    <small>
                      Reto {currentGameIndex + 1} de {NIDO_CURRICULUM_GAME_COUNT}
                    </small>
                  </div>
                  <button
                    className={`nido-games__focus-audio ${speaking ? "is-speaking" : ""}`}
                    type="button"
                    aria-label={
                      speaking
                        ? "Detener narración automática"
                        : "Repetir narración de la consigna"
                    }
                    aria-pressed={speaking}
                    onClick={handleSpeak}
                  >
                    {speaking ? (
                      <StopCircle size={25} weight="fill" aria-hidden="true" />
                    ) : (
                      <SpeakerHigh size={25} weight="fill" aria-hidden="true" />
                    )}
                    <span>{speaking ? "Detener" : "Repetir audio"}</span>
                  </button>
                </header>

                <div className="nido-games__focus-progress">
                  <span className="nido-games__focus-progress-track">
                    <span
                      role="progressbar"
                      aria-label={`Progreso en ${category.name}`}
                      aria-valuemin="0"
                      aria-valuemax={NIDO_CURRICULUM_GAME_COUNT}
                      aria-valuenow={Math.min(
                        visibleCompleted,
                        NIDO_CURRICULUM_GAME_COUNT,
                      )}
                    >
                      <i style={{ width: `${focusProgress}%` }} />
                    </span>
                    <span
                      className="nido-games__focus-milestones"
                      aria-hidden="true"
                    >
                      {PROGRESS_MILESTONES.map((milestone) => (
                        <Star
                          className={
                            visibleCompleted >= milestone ? "is-reached" : ""
                          }
                          style={{
                            left: `${(milestone / NIDO_CURRICULUM_GAME_COUNT) * 100}%`,
                          }}
                          size={17}
                          weight="fill"
                          key={milestone}
                        />
                      ))}
                    </span>
                  </span>
                  <small>
                    {Math.min(visibleCompleted, NIDO_CURRICULUM_GAME_COUNT)}/
                    {NIDO_CURRICULUM_GAME_COUNT}
                  </small>
                </div>

                {routeComplete ? (
                  <section
                    className="nido-games__focus-success"
                    aria-labelledby="nido-focus-title"
                  >
                    <div className="nido-games__success-art" aria-hidden="true">
                      <CelebrationBurst className="nido-games__success-burst" />
                      <NidoMascot pose="cheer" size={128} />
                    </div>
                    <span>20 retos completados</span>
                    <h2 id="nido-focus-title" ref={routeSuccessRef} tabIndex="-1">
                      ¡Ruta terminada!
                    </h2>
                    <p>
                      Completaste {category.name} de {area.name} para {age.label}.
                    </p>
                    <div className="nido-games__focus-success-actions">
                      <button type="button" onClick={replayRoute}>
                        <Play size={22} weight="fill" aria-hidden="true" />
                        Jugar de nuevo
                      </button>
                      <button
                        className="nido-games__focus-success-secondary"
                        type="button"
                        onClick={() => closeFocusedGame({ announce: false })}
                      >
                        <CheckCircle size={24} weight="fill" aria-hidden="true" />
                        Elegir otra ruta
                      </button>
                    </div>
                  </section>
                ) : (
                  <main
                    className={[
                      "nido-games__focus-canvas",
                      feedbackEffect?.type === "error"
                        ? "is-error-shake"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={`${challenge.id}-${feedbackEffect?.runId ?? "idle"}`}
                  >
                    <div className="nido-games__focus-title">
                      <span>
                        {category.name} · reto {currentGameIndex + 1}
                      </span>
                      <h2 id="nido-focus-title" ref={focusTitleRef} tabIndex="-1">
                        {challenge.question}
                      </h2>
                      <p id="nido-focus-instruction">
                        La consigna se reproduce automáticamente. Observa con
                        calma y toca una respuesta.
                      </p>
                    </div>

                    <div className="nido-games__focus-activity">
                      <ChallengeScene
                        challenge={challenge}
                        category={category}
                      />
                      <ChallengeAnswers
                        challenge={challenge}
                        selectedAnswer={selectedAnswer}
                        onAnswer={handleAnswer}
                        locked={answerIsCorrect}
                      />
                    </div>

                    {feedbackEffect ? (
                      <div
                        className={`nido-games__focus-feedback is-${feedbackEffect.type}`}
                        aria-hidden="true"
                      >
                        {feedbackEffect.type === "success" ? (
                          <div className="nido-games__confetti">
                            {CONFETTI_PIECES.map((piece, index) => (
                              <i
                                style={{
                                  left: piece.left,
                                  width: piece.width,
                                  background: piece.color,
                                  animationDelay: piece.delay,
                                  animationDuration: piece.duration,
                                  "--confetti-tilt": piece.tilt,
                                }}
                                key={index}
                              />
                            ))}
                          </div>
                        ) : null}
                        <div className="nido-games__focus-feedback-card">
                          {feedbackEffect.type === "success" ? (
                            <>
                              <div className="nido-games__focus-stars">
                                <Star size={42} weight="fill" />
                                <Star size={58} weight="fill" />
                                <Star size={42} weight="fill" />
                              </div>
                              <NidoMascot pose="cheer" size={94} />
                              <strong>¡Yupi!</strong>
                              <small>¡Tirirí! Respuesta correcta</small>
                            </>
                          ) : (
                            <>
                              <XCircle size={88} weight="fill" />
                              <strong>Inténtalo otra vez</strong>
                              <small>Tin–ton · observa una vez más</small>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="nido-games__focus-result">
                      <p role="status" aria-live="polite">
                        {!selectedAnswer
                          ? "Elige una respuesta para continuar."
                          : answerIsCorrect
                            ? "¡Yupi! Encontraste la respuesta correcta."
                            : "Esa opción no es correcta. Puedes volver a intentarlo."}
                      </p>
                      <button
                        ref={focusNextRef}
                        type="button"
                        onClick={handleNext}
                        disabled={!answerIsCorrect}
                      >
                        <CheckCircle size={24} weight="fill" aria-hidden="true" />
                        {currentGameIndex < NIDO_CURRICULUM_GAME_COUNT - 1
                          ? "Siguiente reto"
                          : "Finalizar ruta"}
                      </button>
                    </div>
                  </main>
                )}
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </section>
  );
}
