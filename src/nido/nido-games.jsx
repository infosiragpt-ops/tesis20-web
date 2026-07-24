import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildCurriculumChallenge,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
} from "./nido-curriculum";
import { createNidoIcon, NidoGlyph } from "./nido-icon-map";
import "./nido-games.css";
import "./nido-focus.css";

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

const FOCUS_RENDERER_STYLES = String.raw`
.nido-games__picture{--picture-scale:1;--picture-tone:var(--a);position:relative;width:42px;height:42px;display:inline-grid;place-items:center;flex:none;color:var(--picture-tone);font-size:1.6rem;transform:scale(var(--picture-scale))}.nido-games__picture img{width:100%;height:100%;object-fit:contain}.nido-games__picture[data-shape]:not([data-shape=""])::before{content:"";width:34px;height:34px;border:2px solid #10233f66;background:var(--picture-tone)}.nido-games__picture[data-shape=circle]::before{border-radius:50%}.nido-games__picture[data-shape=triangle]::before{clip-path:polygon(50% 0,100% 100%,0 100%)}.nido-games__picture[data-shape=pentagon]::before{clip-path:polygon(50% 0,100% 38%,80% 100%,20% 100%,0 38%)}.nido-games__picture[data-shape=hexagon]::before{clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}.nido-games__picture[data-shape=star]::before{clip-path:polygon(50% 0,62% 35%,100% 35%,69% 57%,80% 96%,50% 73%,20% 96%,31% 57%,0 35%,38% 35%)}.nido-games__picture[data-mark]:not([data-mark=""])::after{content:"●";position:absolute;color:var(--n)}.nido-games__picture[data-mark=line]::after{content:"━";font-size:1.6rem;transform:rotate(-35deg)}.nido-games__picture[data-mark=small-circle]::after{content:"○";font-size:1.6rem}.nido-games__picture[data-mark=corner]::after{content:"⌟";font-size:1.6rem}.nido-games__picture[data-mark=different-mark]::after{content:"×";color:#dc5048;font-size:2rem}.nido-games__picture.is-compact{width:25px;height:25px;font-size:1rem}.nido-games__picture.is-compact::before{width:20px!important;height:20px!important}.nido-games__count-picture{min-width:68px;display:grid;grid-template-columns:repeat(4,1fr);place-items:center;gap:1px;padding:3px;background:#ffffffcc}.nido-games__count-picture.is-compact{min-width:0;width:48px;padding:0;background:none}.nido-games__count-picture.is-compact .nido-games__picture{width:9px;height:9px;font-size:.5rem}.nido-games__count-picture.is-compact .nido-games__picture::before{width:7px!important;height:7px!important;border-width:1px!important}
.nido-games__mechanic,.nido-games__relationship{width:100%;display:flex;align-items:center;justify-content:center;gap:9px}.nido-games__mechanic.is-groups>span,.nido-games__mechanic.is-sizes>span{display:grid;place-items:center;gap:3px;padding:4px;background:#ffffffcc}.nido-games__mechanic.is-sizes{min-height:90px;align-items:end;border-bottom:3px solid #10233f22}.nido-games__mechanic.is-options{display:grid}.nido-games__mechanic.is-options>span{display:flex;flex-wrap:wrap}.nido-games__camouflage{width:170px;height:100px;display:grid;place-items:center;background:var(--camouflage)}.nido-games__camouflage .nido-games__picture{opacity:.58}.nido-games__position{position:relative;width:190px;height:115px;border:2px solid #fff;background:#ffffffaa}.nido-games__position>.nido-games__picture{position:absolute;top:55%;left:50%;z-index:2;transform:translate(-50%,-50%) scale(1.15)}.nido-games__position>:last-child{top:15%;z-index:3;transform:translate(-50%,-50%)}.nido-games__position[data-position=below]>:last-child{top:88%}.nido-games__position[data-position=inside]>:last-child{top:55%;transform:translate(-50%,-50%) scale(.5)}.nido-games__position[data-position=outside]>:last-child{left:88%}.nido-games__position[data-position=beside]>:last-child{top:55%;left:80%}.nido-games__position[data-position=between]>:first-child{left:25%}.nido-games__position[data-position=between]>:nth-child(2){left:75%}.nido-games__position[data-position=between]>:last-child,.nido-games__position[data-position=behind]>:last-child{top:55%}.nido-games__position[data-position=behind]>:last-child{z-index:1}.nido-games__position[data-position=in-front]>:last-child{top:58%;transform:translate(-50%,-50%) scale(1.2)}
.nido-games__difference{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:3px}.nido-games__difference>span>i{min-height:80px;display:grid;grid-template-columns:1fr 1fr;place-items:center;border:2px solid #fff;background:linear-gradient(#c8efff 60%,#b8df85 60%)}.nido-games__difference .is-color{background:#ff8177}.nido-games__difference .is-position{transform:translate(10px,-8px)}.nido-games__difference .is-size{transform:scale(.5)}.nido-games__detail{width:min(270px,100%);display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:4px;background:linear-gradient(#c8efff 55%,#b8df85 55%)}.nido-games__memory,.nido-games__clue{min-width:min(210px,90%);min-height:85px;display:grid;place-items:center;align-content:center;gap:4px;padding:6px;border:2px dashed var(--a);background:#ffffffcc}.nido-games__memory>button{border:0;background:var(--n);color:#fff}.nido-games__hidden{position:relative;min-width:190px;min-height:90px}.nido-games__hidden>span{position:absolute;left:38%;top:25%;font-size:1.8rem}.nido-games__hidden>.nido-games__picture{position:absolute;left:52%;top:18%;transform:scale(1.4)}.nido-games__hidden>b{position:absolute;bottom:0;left:10%;background:#fff}.nido-games__relationship{display:grid;grid-template-columns:auto auto auto}.nido-games__relationship>strong{width:38px;height:38px;display:grid;place-items:center;border:2px dashed var(--a)}.nido-games__relationship>small{grid-column:1/-1}
.nido-games__focus-result{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:4px;background:#ffffffdd}.nido-games__focus-result p{margin:0;font-size:.62rem}.nido-games__focus-result button,.nido-games__focus-success button{min-height:36px;border:0;background:var(--n);color:#fff}.nido-games__focus-result button:disabled{opacity:.35}.nido-games__focus-feedback{position:absolute;z-index:4;display:grid;place-items:center;inset:0;background:#10233f55;pointer-events:none}.nido-games__focus-feedback-card{display:grid;place-items:center;padding:12px;border:4px solid #fff;background:#46b982;color:#fff}.nido-games__focus-feedback.is-error .nido-games__focus-feedback-card{background:#dc5048}.nido-games__focus-stars{display:flex;color:#ffc94d}.nido-games__focus-success{display:grid;place-items:center;align-content:center;text-align:center}.nido-games__focus-success :is(h2,p){margin:1px}
.nido-games__focus-dialog button:focus-visible{outline:3px solid #ffc94d;outline-offset:2px}@media(max-height:560px){.nido-games__focus-shell{gap:2px;padding:3px}.nido-games__focus-title p{display:none}.nido-games__focus-activity{grid-template:1fr/.75fr 1.25fr}.nido-games__scene{min-height:0}.nido-games__answers{grid-template-columns:1fr 1fr}.nido-games__answers>button{min-height:40px}.nido-games__focus-result{padding:2px}}
`;

const PROGRESS_STORAGE_KEY = "tesis20-nido-progress-v2";

const AREA_WORLD_ASSETS = Object.freeze({
  logica: {
    src: "/assets/nido/worlds/logic-world-v1.jpg",
    alt: "Ilustración de lógica con rompecabezas y figuras.",
  },
  matematicas: {
    src: "/assets/nido/worlds/math-world-v1.jpg",
    alt: "Ilustración de matemáticas con bloques y cantidades.",
  },
  atencion: {
    src: "/assets/nido/worlds/attention-world-v1.jpg",
    alt: "Ilustración de atención y memoria.",
  },
  habla: {
    src: "/assets/nido/worlds/speech-world-v1.jpg",
    alt: "Ilustración de habla con animales y objetos.",
  },
  ingles: {
    src: "/assets/nido/worlds/english-world-v2.jpg",
    alt: "Ilustración de inglés con una profesora búho.",
  },
});

const DEFAULT_AUDIO_TRACKS = Object.freeze({});

const DEFAULT_FEEDBACK_TRACKS = Object.freeze({
  success: "/assets/nido/audio/success-tiriri-yupi-v1.mp3",
  error: "/assets/nido/audio/error-tin-ton-v1.mp3",
});

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

function normalizeProgress(storedProgress) {
  const normalized = createInitialProgress();

  for (const age of AGE_GROUPS) {
    for (const area of NIDO_CURRICULUM) {
      for (const category of area.categories) {
        const storedValue =
          storedProgress?.[age.id]?.[area.id]?.[category.id];
        normalized[age.id][area.id][category.id] = Number.isFinite(storedValue)
          ? Math.min(
              NIDO_CURRICULUM_GAME_COUNT,
              Math.max(0, Math.trunc(storedValue)),
            )
          : 0;
      }
    }
  }

  return normalized;
}

function loadProgress() {
  if (typeof window === "undefined") return createInitialProgress();

  try {
    const storedProgress = JSON.parse(
      window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "null",
    );
    return normalizeProgress(storedProgress);
  } catch {
    return createInitialProgress();
  }
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
      area.categories.every(
        (category) =>
          getProgressValue(progress, ageId, area.id, category.id) ===
          NIDO_CURRICULUM_GAME_COUNT,
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

const SHAPES = new Set(["Circle", "Triangle", "Square", "Pentagon", "Hexagon", "Star"]);
const EMOJI = Object.freeze({
  Backpack: "🎒", Basketball: "🏀", Bed: "🛏️", Bicycle: "🚲", Bird: "🐦",
  Boat: "⛵", BookOpen: "📖", BowlFood: "🍎", Bread: "🍞", Bug: "🐝",
  Butterfly: "🦋", Car: "🚗", Carrot: "🥕", Cat: "🐱", Chair: "🪑",
  Clock: "🕒", Cloud: "☁️", Coffee: "🥤", Cow: "🐮", Dog: "🐶",
  Door: "🚪", FishSimple: "🐟", Flower: "🌼", Headphones: "🎧",
  Horse: "🐴", House: "🏠", Moon: "🌙", PawPrint: "🐾", Pencil: "✏️",
  Plant: "🌿", Rabbit: "🐰", Smiley: "😄", SmileyMeh: "😌",
  SmileyNervous: "😨", SmileySad: "😢", SmileyWink: "😮",
  SmileyXEyes: "😠", Snowflake: "❄️", Sun: "☀️", Table: "🪑",
  Tooth: "🪥", Tree: "🌳", Umbrella: "☂️", Waves: "🌊",
});

function itemLabel(item) {
  return typeof item === "object" && item !== null
    ? String(item.label ?? item.value?.label ?? item.value ?? item.id ?? "")
    : String(item ?? "");
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

function Picture({ item, compact = false }) {
  const value = typeof item === "object" && item !== null ? item : { value: item };
  const icon = value.iconName ?? value.value?.iconName;
  const image = value.imageSrc ?? value.value?.imageSrc;
  const label = itemLabel(value);
  const shape = SHAPES.has(icon) ? icon.toLowerCase() : "";
  const style = {
    "--picture-scale": Number(value.scale ?? value.meta?.scale) || 1,
    ...(value.tone ? { "--picture-tone": value.tone } : {}),
  };

  return (
    <span
      className={`nido-games__picture ${compact ? "is-compact" : ""}`}
      data-mark={value.mark ?? value.meta?.mark ?? ""}
      data-shape={shape}
      style={style}
      title={label}
      aria-hidden="true"
    >
      {image ? <img src={image} alt="" /> : shape ? null : EMOJI[icon] ?? (
        icon ? <NidoGlyph name={icon} size={compact ? 26 : 42} weight="duotone" /> : label
      )}
    </span>
  );
}

function CountPicture({ count, iconName = "Circle", compact = false }) {
  return (
    <span className={`nido-games__count-picture ${compact ? "is-compact" : ""}`}>
      {Array.from({ length: Math.min(Number(count) || 0, 12) }, (_, index) => (
        <Picture item={{ iconName }} compact key={index} />
      ))}
    </span>
  );
}

function VisualToken({ item, compact = false }) {
  const value = typeof item === "object" && item !== null ? item : { value: item };
  const imageSrc = value.imageSrc ?? value.value?.imageSrc;
  const iconName = value.iconName ?? value.value?.iconName;
  const tone = value.tone ?? value.value?.tone;
  const label = itemLabel(value);

  return (
    <span
      className={`nido-games__visual-token ${tone ? "has-tone" : ""}`}
      style={tone ? { "--token-tone": tone } : undefined}
      title={String(label)}
    >
      {imageSrc || iconName ? <Picture item={value} compact={compact} /> : null}
      {!imageSrc && (!iconName || compact) ? (
        <strong>{String(label)}</strong>
      ) : null}
    </span>
  );
}

function MechanicScene({ challenge, memoryVisible, memorySeconds, replayMemory, selectedAnswer }) {
  const v = challenge.visual;
  const answer = challenge.options.find((option) => option.id === challenge.answerId);
  const items = getVisualItems(v);
  const pictures = challenge.options.map((option) => (
    <Picture item={option} compact key={option.id} />
  ));

  if (v.groups) {
    return <div className="nido-games__mechanic is-groups">{v.groups.map((group, index) => (
      <span key={group.id}><b>Grupo {index + 1}</b><CountPicture {...group} /></span>
    ))}</div>;
  }
  if (v.kind === "size-pair") {
    return <div className="nido-games__mechanic is-sizes">
      <Picture item={{ iconName: v.itemIconName, scale: 0.7 }} />
      <Picture item={{ iconName: v.itemIconName, scale: 1.35 }} />
    </div>;
  }
  if (v.kind === "size-order") {
    return <div className="nido-games__mechanic is-sizes">{v.items.map((item) => (
      <span key={item.id}><Picture item={{ ...item, iconName: v.itemIconName }} /><small>{item.label}</small></span>
    ))}</div>;
  }
  if (v.kind === "position-scene") {
    return <div className="nido-games__position" data-position={v.position}>
      <Picture item={{ iconName: v.referenceIconName }} />
      {v.position === "between" ? <Picture item={{ iconName: v.referenceIconName }} /> : null}
      <Picture item={{ iconName: v.subjectIconName }} />
    </div>;
  }
  if (v.kind === "difference") {
    return <div className="nido-games__difference">{["A", "B"].map((panel) => (
      <span key={panel}><b>Escena {panel}</b><i>{challenge.options.map((option) => {
        const changed = panel === "B" && option.id === challenge.answerId;
        return changed && v.changeType === "missing" ? <em key={option.id}>?</em> : (
          <span className={changed ? `is-${v.changeType}` : ""} key={option.id}><Picture item={option} compact /></span>
        );
      })}</i></span>
    ))}</div>;
  }
  if (v.kind === "drawing-detail") {
    const target = challenge.options.find((option) => option.id === `option-${v.targetId}`);
    const others = challenge.options.filter((option) => option !== target);
    const count = Math.max(4, Number(v.detailCount) || 4);
    return <div className="nido-games__detail">{Array.from({ length: count }, (_, index) => (
      <Picture item={index === challenge.seed % count ? target : others[index % others.length]} compact key={index} />
    ))}</div>;
  }
  if (v.previewSeconds) {
    const revealed = memoryVisible || selectedAnswer;
    return <div className="nido-games__memory">{revealed ? (
      <><Picture item={v.model} /><small>Memoriza · {memorySeconds} s</small></>
    ) : (
      <><strong role="status">🙈 Pista oculta</strong><button type="button" onClick={replayMemory}>Ver otra vez</button></>
    )}</div>;
  }
  if (v.kind === "hidden-character") {
    return <div className="nido-games__hidden">
      <span>{selectedAnswer ? <Picture item={answer} /> : "?"}</span>
      <Picture item={v.cover} /><b>{v.clue}</b>
    </div>;
  }
  if (v.kind === "add-one") {
    return <div className="nido-games__mechanic is-add">
      <CountPicture count={v.count} iconName={v.itemIconName} /><b>+</b>
      <CountPicture count={v.addedCount} iconName={v.itemIconName} />
    </div>;
  }
  if (v.kind === "camouflage") {
    return <div className="nido-games__camouflage" style={{ "--camouflage": v.backgroundTone }}>
      <Picture item={{ ...answer, scale: 1.5 }} />
    </div>;
  }
  if (v.subject || v.adult) {
    return <div className="nido-games__relationship">
      <Picture item={v.subject ?? v.adult} /><b>→</b><strong>?</strong>
      <small>{v.repeatPhrase ?? v.repeatWord}</small>
    </div>;
  }
  if (v.context || typeof v.clue === "string" || v.listenFirst) {
    const clueText =
      v.context ??
      (typeof v.clue === "string" ? v.clue : null) ??
      (selectedAnswer ? v.repeatAnswer : "Escucha la pregunta");
    return <div className="nido-games__clue">
      {v.expressionIconName ? <Picture item={{ iconName: v.expressionIconName }} /> : <span>🔎</span>}
      <b>{clueText}</b>
    </div>;
  }
  if (items.length) {
    return <div className="nido-games__visual-sequence">{items.map((item, index) => (
      <VisualToken item={item} compact={items.length > 6} key={`${itemLabel(item)}-${index}`} />
    ))}{v.missingPosition ? <span className="nido-games__visual-question">?</span> : null}</div>;
  }
  return <div className="nido-games__mechanic is-options">
    <b>{v.clue?.sides ? `${v.clue.sides} lados` : v.clue?.name ?? v.family ?? v.topic ?? ""}</b>
    <span>{pictures}</span>
  </div>;
}

function ChallengeScene({ challenge, selectedAnswer }) {
  const { visual } = challenge;
  const worldAsset = AREA_WORLD_ASSETS[challenge.areaId];
  const [memoryVisible, setMemoryVisible] = useState(true);
  const [memoryRun, setMemoryRun] = useState(0);
  const [memorySeconds, setMemorySeconds] = useState(visual.previewSeconds ?? 0);

  useEffect(() => {
    const seconds = Number(visual.previewSeconds) || 0;
    setMemoryVisible(true);
    setMemorySeconds(seconds);
    if (!seconds) return undefined;
    const timer = window.setInterval(() => setMemorySeconds((current) => {
      if (current > 1) return current - 1;
      window.clearInterval(timer);
      setMemoryVisible(false);
      return 0;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [challenge.id, memoryRun, visual.previewSeconds]);

  return (
    <div
      className="nido-games__scene"
      data-kind={visual.kind}
      data-age={challenge.ageId}
      style={
        visual.backgroundTone
          ? { "--scene-tone": visual.backgroundTone }
          : undefined
      }
      aria-label="Pista visual del reto"
    >
      {worldAsset ? (
        <img
          src={worldAsset.src}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      <div className="nido-games__scene-content">
        <MechanicScene
          challenge={challenge}
          memorySeconds={memorySeconds}
          memoryVisible={memoryVisible}
          replayMemory={() => setMemoryRun((current) => current + 1)}
          selectedAnswer={selectedAnswer}
        />
        {visual.word ? (
          <strong className="nido-games__scene-word">{String(visual.word)}</strong>
        ) : null}
        {visual.repeatWord ? (
          <span className="nido-games__scene-repeat">
            Escucha y repite: <strong>{String(visual.repeatWord)}</strong>
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
        const groupNumber = Number(option.id.match(/option-group-(\d+)/)?.[1]);
        const group = groupNumber
          ? challenge.visual.groups?.[groupNumber - 1]
          : null;

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
              {group || option.meta?.count !== undefined ? (
                <CountPicture
                  count={group?.count ?? option.meta.count}
                  iconName={group?.itemIconName}
                  compact
                />
              ) : option.meta?.numericValue !== null &&
                option.meta?.numericValue !== undefined ? (
                <strong>{option.meta.numericValue}</strong>
              ) : (
                <Picture item={option} />
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
  const [progress, setProgress] = useState(loadProgress);
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
  const focusDialogRef = useRef(null);
  const focusCloseRef = useRef(null);
  const focusTitleRef = useRef(null);
  const focusNextRef = useRef(null);
  const routeSuccessRef = useRef(null);
  const previousFocusRef = useRef(null);
  const fullscreenOwnedRef = useRef(false);

  const age = AGE_GROUPS.find((item) => item.id === selectedAge);
  const area = findArea(selectedArea);
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
    try {
      window.localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(progress),
      );
    } catch {
      // El juego continúa aunque el navegador bloquee el almacenamiento local.
    }
  }, [progress]);

  useEffect(() => {
    let active = true;

    fetch("/assets/nido/audio/manifest.json", { cache: "no-cache" })
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

  const speakWithBrowserFallback = (
    text,
    runId,
    targetChallenge = challenge,
  ) => {
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
    const preferredVoiceNames = [
      "paulina",
      "monica",
      "luciana",
      "elvira",
      "sabina",
      "google español",
    ];
    const spanishVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith("es"));
    const preferredVoice = spanishVoices.find((voice) => {
      const normalizedName = voice.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return preferredVoiceNames.some((name) =>
        normalizedName.includes(name),
      );
    });
    utterance.voice = preferredVoice ?? spanishVoices[0] ?? null;
    utterance.lang = preferredVoice?.lang ?? "es-PE";
    utterance.rate =
      { "2-3": 0.84, "4-5": 0.9, 6: 0.96 }[targetChallenge.ageId] ??
      0.9;
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
        speakWithBrowserFallback(text, runId, targetChallenge);
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

    speakWithBrowserFallback(text, runId, targetChallenge);
  };

  const resetActivity = () => {
    setSelectedAnswer("");
    setRouteComplete(false);
    clearFeedbackEffect();
    stopFeedbackSound();
    stopInstruction();
  };

  const closeFocusedGame = ({ announce = true } = {}) => {
    resetActivity();
    setFocusMode(false);
    if (
      fullscreenOwnedRef.current &&
      document.fullscreenElement &&
      typeof document.exitFullscreen === "function"
    ) {
      void document.exitFullscreen().catch(() => {});
    }
    fullscreenOwnedRef.current = false;
    if (announce) {
      onStatus("Juego cerrado. Regresaste a la selección de subcategorías.");
    }
  };

  useEffect(() => {
    if (!focusMode || !focusDialogRef.current) return undefined;
    const dialog = focusDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollbarGutter = "auto";
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
      document.documentElement.style.scrollbarGutter =
        previousScrollbarGutter;
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
      Math.min(
        getProgressValue(progress, ageId, firstArea.id, firstCategory.id),
        NIDO_CURRICULUM_GAME_COUNT - 1,
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
      Math.min(
        getProgressValue(progress, selectedAge, areaId, categoryId),
        NIDO_CURRICULUM_GAME_COUNT - 1,
      ),
    );
    resetActivity();
    onStatus(`Área de ${findArea(areaId).name} seleccionada.`);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentGameIndex(
      Math.min(
        getProgressValue(progress, selectedAge, selectedArea, categoryId),
        NIDO_CURRICULUM_GAME_COUNT - 1,
      ),
    );
    resetActivity();
    const nextCategory = area.categories.find((item) => item.id === categoryId);
    onStatus(
      `Subcategoría ${nextCategory.name} seleccionada. Contiene 20 retos.`,
    );
  };

  const handleStart = (event) => {
    previousFocusRef.current = event?.currentTarget ?? document.activeElement;
    const startingGameIndex =
      completedGames >= NIDO_CURRICULUM_GAME_COUNT
        ? 0
        : Math.min(completedGames, NIDO_CURRICULUM_GAME_COUNT - 1);
    const startingChallenge = buildCurriculumChallenge({
      areaId: selectedArea,
      categoryId: selectedCategory,
      ageId: selectedAge,
      gameIndex: startingGameIndex,
    });

    setCurrentGameIndex(startingGameIndex);
    setSelectedAnswer("");
    setRouteComplete(false);
    clearFeedbackEffect();
    stopFeedbackSound();
    setFocusMode(true);

    const fullscreenTarget = document.documentElement;
    if (
      !document.fullscreenElement &&
      typeof fullscreenTarget.requestFullscreen === "function"
    ) {
      void fullscreenTarget
        .requestFullscreen({ navigationUI: "hide" })
        .then(() => {
          fullscreenOwnedRef.current = true;
        })
        .catch(() => {
          fullscreenOwnedRef.current = false;
        });
    }

    onStatus(
      `${category.name}, reto ${startingGameIndex + 1} de 20, iniciado con narración automática.`,
    );
    void playInstruction(startingChallenge);
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
      showFeedbackEffect("success");
      playFeedbackSound("success");
      onStatus("¡Yupi! Respuesta correcta. Sonó la estrellita.");
      window.requestAnimationFrame(() => focusNextRef.current?.focus());
    } else {
      showFeedbackEffect("error");
      playFeedbackSound("error");
      onStatus(
        "Tin–ton. Esa no es la respuesta correcta. La pantalla indicó que debes intentarlo otra vez.",
      );
    }
  };

  const handleNext = () => {
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
      <style data-nido-focus-renderer>{FOCUS_RENDERER_STYLES}</style>
      <audio ref={audioRef} preload="auto" aria-hidden="true" />
      <audio ref={feedbackAudioRef} preload="auto" aria-hidden="true" />

      <div className="nido-shell nido-games__shell">
        <header className="nido-games__heading">
          <div>
            <span>JUEGOS EDUCATIVOS POR EDAD</span>
            <h1 id="nido-games-title">Elige la edad para comenzar</h1>
            <p>
              Rutas de lógica, matemáticas, atención, memoria, habla e inglés.
              Cada subcategoría contiene 20 retos jugables con narración
              profesional.
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
                <small>Áreas completas</small>
              </span>
            </div>
            <p>
              Guardado solo en este dispositivo · no pedimos datos del menor.
            </p>
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
              <img
                src={AREA_WORLD_ASSETS[selectedArea].src}
                alt={AREA_WORLD_ASSETS[selectedArea].alt}
                loading="lazy"
                decoding="async"
              />
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
                    onClick={() => handleCategoryChange(categoryItem.id)}
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
                    {completedGames === NIDO_CURRICULUM_GAME_COUNT
                      ? "La ruta reiniciará en el reto 1 de 20."
                      : `Continuarás en el reto ${completedGames + 1} de 20.`}
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
                    <Trophy size={82} weight="duotone" aria-hidden="true" />
                    <span>20 retos completados</span>
                    <h2 id="nido-focus-title" ref={routeSuccessRef} tabIndex="-1">
                      ¡Ruta terminada!
                    </h2>
                    <p>
                      Completaste {category.name} de {area.name} para {age.label}.
                    </p>
                    <button
                      type="button"
                      onClick={() => closeFocusedGame({ announce: false })}
                    >
                      <CheckCircle size={24} weight="fill" aria-hidden="true" />
                      Volver a mis subcategorías
                    </button>
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
                        selectedAnswer={selectedAnswer}
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
                        <div className="nido-games__focus-feedback-card">
                          {feedbackEffect.type === "success" ? (
                            <>
                              <div className="nido-games__focus-stars">
                                <Star size={42} weight="fill" />
                                <Star size={58} weight="fill" />
                                <Star size={42} weight="fill" />
                              </div>
                              <CheckCircle size={76} weight="fill" />
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
