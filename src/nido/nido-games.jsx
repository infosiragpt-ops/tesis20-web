import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  buildCurriculumChallenge,
  NIDO_CURRICULUM,
  NIDO_CURRICULUM_GAME_COUNT,
} from "./nido-curriculum";
import {
  buildInitialOrder,
  buildNidoPathLayout,
  getCorrectOrderLabels,
  getNidoAgeInteractionProfile,
  getNidoInteractionMeta,
  getNidoInteractionType,
  isNidoPathMoveAllowed,
  normalizeOrderLabel,
} from "./nido-interaction-model.js";
import {
  usesDirectSceneActivity,
  usesDirectTapActivity,
} from "./nido-activity-routing.js";
import { CelebrationBurst, NidoMascot } from "./illustrations/nido-mascot.jsx";
import { createNidoIcon, NidoGlyph } from "./nido-icon-map";
import { STICKERS } from "./stickers/sticker-registry.jsx";
import { CATCH_THEMES } from "./game/content/catch-mission.js";
import { MEMORY_THEMES } from "./game/content/memory-mission.js";
import {
  celebrationAudioKey,
  getCelebrationVoiceProfile,
  PERSISTENCE_CELEBRATION,
  pickStreakCelebration,
  pickSuccessCelebration,
} from "./game/content/celebration-feedback.js";
import ArcadeHub from "./game/hub/ArcadeHub.jsx";
import "./game/hub/arcade-hub.css";

// El motor de cada videojuego se carga bajo demanda: chunk propio de Vite
// que solo se descarga al abrir esa experiencia.
const BosqueGame = lazy(() => import("./game/bosque/BosqueGame.jsx"));
const MemoriaGame = lazy(() => import("./game/memoria/MemoriaGame.jsx"));
const CatchGame = lazy(() => import("./game/catch/CatchGame.jsx"));
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
  { background: "#c74d59", ink: "#ffffff", track: "rgba(85, 23, 35, 0.34)" },
  { background: "#f0d493", ink: "#10233f", track: "rgba(114, 77, 35, 0.24)" },
  { background: "#a7e4ba", ink: "#10233f", track: "rgba(16, 92, 57, 0.22)" },
  { background: "#ffda86", ink: "#10233f", track: "rgba(122, 86, 28, 0.22)" },
  { background: "#a8ddf7", ink: "#10233f", track: "rgba(27, 79, 130, 0.22)" },
  { background: "#654bdc", ink: "#ffffff", track: "rgba(30, 21, 101, 0.32)" },
]);

const FOCUS_RENDERER_STYLES = String.raw`
.nido-games__picture{--picture-scale:1;--picture-tone:var(--a);position:relative;width:42px;height:42px;display:inline-grid;place-items:center;flex:none;color:var(--picture-tone);font-size:1.6rem;transform:scale(var(--picture-scale))}.nido-games__picture img{width:100%;height:100%;object-fit:contain}.nido-games__picture[data-shape]:not([data-shape=""])::before{content:"";width:34px;height:34px;border:2px solid #10233f66;background:var(--picture-tone)}.nido-games__picture[data-shape=circle]::before{border-radius:50%}.nido-games__picture[data-shape=triangle]::before{clip-path:polygon(50% 0,100% 100%,0 100%)}.nido-games__picture[data-shape=pentagon]::before{clip-path:polygon(50% 0,100% 38%,80% 100%,20% 100%,0 38%)}.nido-games__picture[data-shape=hexagon]::before{clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}.nido-games__picture[data-shape=star]::before{clip-path:polygon(50% 0,62% 35%,100% 35%,69% 57%,80% 96%,50% 73%,20% 96%,31% 57%,0 35%,38% 35%)}.nido-games__picture[data-mark]:not([data-mark=""])::after{content:"●";position:absolute;color:var(--n)}.nido-games__picture[data-mark=line]::after{content:"━";font-size:1.6rem;transform:rotate(-35deg)}.nido-games__picture[data-mark=small-circle]::after{content:"○";font-size:1.6rem}.nido-games__picture[data-mark=corner]::after{content:"⌟";font-size:1.6rem}.nido-games__picture[data-mark=different-mark]::after{content:"×";color:#dc5048;font-size:2rem}.nido-games__picture.is-compact{width:25px;height:25px;font-size:1rem}.nido-games__picture.is-compact::before{width:20px!important;height:20px!important}.nido-games__count-picture{min-width:68px;display:grid;grid-template-columns:repeat(4,1fr);place-items:center;gap:1px;padding:3px;background:#ffffffcc}.nido-games__count-picture.is-compact{min-width:0;width:48px;padding:0;background:none}.nido-games__count-picture.is-compact .nido-games__picture{width:9px;height:9px;font-size:.5rem}.nido-games__count-picture.is-compact .nido-games__picture::before{width:7px!important;height:7px!important;border-width:1px!important}
.nido-games__mechanic,.nido-games__relationship{width:100%;display:flex;align-items:center;justify-content:center;gap:9px}.nido-games__mechanic.is-groups>span,.nido-games__mechanic.is-sizes>span{display:grid;place-items:center;gap:3px;padding:4px;background:#ffffffcc}.nido-games__mechanic.is-sizes{min-height:90px;align-items:end;border-bottom:3px solid #10233f22}.nido-games__mechanic.is-options{display:grid}.nido-games__mechanic.is-options>span{display:flex;flex-wrap:wrap}.nido-games__camouflage{width:170px;height:100px;display:grid;place-items:center;background:var(--camouflage)}.nido-games__camouflage .nido-games__picture{opacity:.58}.nido-games__position{position:relative;width:190px;height:115px;border:2px solid #fff;background:#ffffffaa}.nido-games__position>.nido-games__picture{position:absolute;top:55%;left:50%;z-index:2;transform:translate(-50%,-50%) scale(1.15)}.nido-games__position>:last-child{top:15%;z-index:3;transform:translate(-50%,-50%)}.nido-games__position[data-position=below]>:last-child{top:88%}.nido-games__position[data-position=inside]>:last-child{top:55%;transform:translate(-50%,-50%) scale(.5)}.nido-games__position[data-position=outside]>:last-child{left:88%}.nido-games__position[data-position=beside]>:last-child{top:55%;left:80%}.nido-games__position[data-position=between]>:first-child{left:25%}.nido-games__position[data-position=between]>:nth-child(2){left:75%}.nido-games__position[data-position=between]>:last-child,.nido-games__position[data-position=behind]>:last-child{top:55%}.nido-games__position[data-position=behind]>:last-child{z-index:1}.nido-games__position[data-position=in-front]>:last-child{top:58%;transform:translate(-50%,-50%) scale(1.2)}
.nido-games__difference{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:3px}.nido-games__difference>span>i{min-height:80px;display:grid;grid-template-columns:1fr 1fr;place-items:center;border:2px solid #fff;background:linear-gradient(#c8efff 60%,#b8df85 60%)}.nido-games__difference .is-color{background:#ff8177}.nido-games__difference .is-position{transform:translate(10px,-8px)}.nido-games__difference .is-size{transform:scale(.5)}.nido-games__detail{width:min(270px,100%);display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:4px;background:linear-gradient(#c8efff 55%,#b8df85 55%)}.nido-games__memory,.nido-games__clue{min-width:min(210px,90%);min-height:85px;display:grid;place-items:center;align-content:center;gap:4px;padding:6px;border:2px dashed var(--a);background:#ffffffcc}.nido-games__memory>button{border:0;background:var(--n);color:#fff}.nido-games__hidden{position:relative;min-width:190px;min-height:90px}.nido-games__hidden>span{position:absolute;left:38%;top:25%;font-size:1.8rem}.nido-games__hidden>.nido-games__picture{position:absolute;left:52%;top:18%;transform:scale(1.4)}.nido-games__hidden>b{position:absolute;bottom:0;left:10%;background:#fff}.nido-games__relationship{display:grid;grid-template-columns:auto auto auto}.nido-games__relationship>strong{width:38px;height:38px;display:grid;place-items:center;border:2px dashed var(--a)}.nido-games__relationship>small{grid-column:1/-1}
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

function createRouteStats(correct = 0) {
  return {
    correct,
    mistakes: 0,
    streak: 0,
    bestStreak: 0,
  };
}

const CELEBRATION_DWELL_MS = 650;
// Tope del elogio grabado: si el navegador nunca dispara `onended` (pestaña en
// segundo plano, audio bloqueado), la fiesta sigue su curso igualmente.
const CELEBRATION_PRAISE_CAP_MS = 6000;
// El respaldo global debe ser mayor que la suma de los watchdogs internos:
// nunca debe adelantar la ronda mientras “yupiii” o el elogio siguen sonando.
const CELEBRATION_FAILSAFE_MS = 14000;
const ROUNDS_KEY = "tesis20.nido.route-rounds";
const ALBUM_KEY = "tesis20.nido.sticker-album";
const BOSQUE_KEY = "tesis20.nido.bosque-rondas";
const ARCADE_KEY = "tesis20.nido.arcade-rondas";

function loadBosqueProgress() {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(BOSQUE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

// Progreso compartido de Memoria Mágica y Atrapa y Cuenta, ambos con varios
// temas por edad: { [gameId]: { [themeId]: { [ageId]: rondaAlcanzada } } }.
function loadArcadeProgress() {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(ARCADE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function getArcadeRounds(progress, gameId, themeId, ageId) {
  const value = progress?.[gameId]?.[themeId]?.[ageId];
  return Number.isInteger(value) ? value : 0;
}

// Premios coleccionables: un sticker ilustrado por ruta completada.
const REWARD_STICKERS = Object.freeze([
  { name: "Dog", label: "Perrito" },
  { name: "Cat", label: "Gatito" },
  { name: "Bird", label: "Pajarito" },
  { name: "Rabbit", label: "Conejito" },
  { name: "Cow", label: "Vaquita" },
  { name: "Horse", label: "Caballito" },
  { name: "FishSimple", label: "Pececito" },
  { name: "Butterfly", label: "Mariposa" },
  { name: "Bug", label: "Mariquita" },
  { name: "PawPrint", label: "Huellita" },
  { name: "Tree", label: "Arbolito" },
  { name: "Flower", label: "Florecita" },
  { name: "Sun", label: "Solecito" },
  { name: "Moon", label: "Lunita" },
  { name: "Cloud", label: "Nubecita" },
  { name: "Snowflake", label: "Copo de nieve" },
  { name: "Drop", label: "Gotita" },
  { name: "Fire", label: "Llamita" },
  { name: "Umbrella", label: "Paraguas" },
  { name: "Carrot", label: "Zanahoria" },
  { name: "Bread", label: "Pancito" },
  { name: "Coffee", label: "Tacita" },
  { name: "House", label: "Casita" },
  { name: "Car", label: "Autito" },
  { name: "Boat", label: "Barquito" },
  { name: "Bicycle", label: "Bicicleta" },
  { name: "Clock", label: "Relojito" },
  { name: "Backpack", label: "Mochilita" },
  { name: "Pencil", label: "Lapicito" },
  { name: "BookOpen", label: "Librito" },
  { name: "Palette", label: "Paleta de colores" },
  { name: "Headphones", label: "Audífonos" },
  { name: "Balloon", label: "Globito" },
  { name: "Basketball", label: "Pelota" },
  { name: "GameController", label: "Mando de juego" },
  { name: "Microphone", label: "Micrófono" },
  { name: "Star", label: "Estrellita" },
  { name: "Tooth", label: "Muelita" },
]);

// Filtros de la Sala de juegos. Los cinco últimos coinciden con los id de área
// del currículo, así la fila "Materias del Nido" puede filtrar el hub.
const ARCADE_CATEGORIES = Object.freeze([
  { id: "aventura", label: "Aventura" },
  { id: "memoria", label: "Memoria" },
  { id: "atrapa", label: "Atrapa y cuenta" },
  { id: "logica", label: "Lógica" },
  { id: "matematicas", label: "Matemáticas" },
  { id: "atencion", label: "Atención y memoria" },
  { id: "habla", label: "Desarrollo del habla" },
  { id: "ingles", label: "Inglés" },
]);

const AREA_TILE_STYLE = Object.freeze({
  logica: { accent: "#46b982", accentSoft: "#e2f6ec" },
  matematicas: { accent: "#9873e7", accentSoft: "#efe7ff" },
  atencion: { accent: "#4b8ff7", accentSoft: "#e3f1ff" },
  habla: { accent: "#ff6f61", accentSoft: "#ffe3df" },
  ingles: { accent: "#29c7c9", accentSoft: "#dff8f7" },
});

function loadStickerAlbum() {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(ALBUM_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function hashRewardSeed(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return Math.abs(hash | 0);
}

// Elige el premio de la ruta: determinista y, si es posible, uno nuevo.
function pickRewardSticker(album, seedText) {
  const start = hashRewardSeed(seedText) % REWARD_STICKERS.length;
  for (let step = 0; step < REWARD_STICKERS.length; step += 1) {
    const candidate =
      REWARD_STICKERS[(start + step) % REWARD_STICKERS.length];
    if (!album[candidate.name]) return { ...candidate, isNew: true };
  }
  return { ...REWARD_STICKERS[start], isNew: false };
}

function loadRouteRounds() {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(ROUNDS_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function getRoundValue(rounds, ageId, areaId, categoryId) {
  const value = rounds?.[ageId]?.[areaId]?.[categoryId];
  return Number.isInteger(value) && value > 0 ? value : 0;
}
const PROGRESS_MILESTONES = Object.freeze([5, 10, 15, 20]);

// Burbujas del estallido de acierto, deterministas (sin Math.random: mantiene
// el render estable). El ángulo áureo reparte las burbujas en todas las
// direcciones sin que dos salgan juntas.
const BUBBLE_PIECES = Object.freeze(
  Array.from({ length: 22 }, (_, index) => {
    const radians = (((index * 137.5) % 360) * Math.PI) / 180;
    const distance = 120 + (index % 5) * 44;
    return {
      dx: `${Math.round(Math.cos(radians) * distance)}px`,
      dy: `${Math.round(Math.sin(radians) * distance * 0.82)}px`,
      size: `${13 + (index % 4) * 7}px`,
      delay: `${(index % 6) * 70}ms`,
      duration: `${950 + (index % 5) * 170}ms`,
      color: ["#ff6f61", "#ffc94d", "#46b982", "#4b8ff7", "#9873e7", "#ff9fb2"][
        index % 6
      ],
    };
  }),
);

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

const SHAPES = new Set(["Circle", "Triangle", "Square", "Pentagon", "Hexagon", "Star"]);
const EMOJI = Object.freeze({
  ArrowBendLeftDown: "↙️", ArrowBendRightUp: "↗️", ArrowDown: "⬇️",
  ArrowSquareIn: "↘️", ArrowSquareOut: "↗️", ArrowUp: "⬆️",
  ArrowsDownUp: "↕️", ArrowsHorizontal: "↔️", ArrowsLeftRight: "↔️",
  Backpack: "🎒", Basketball: "🏀", Bed: "🛏️", Bicycle: "🚲", Bird: "🐦",
  Boat: "⛵", BookOpen: "📖", BowlFood: "🍎", Bread: "🍞", Bug: "🐝",
  Butterfly: "🦋", Car: "🚗", Carrot: "🥕", Cat: "🐱", Chair: "🪑",
  CirclesThreePlus: "◉◉+", NumberCircleOne: "1️⃣",
  Clock: "🕒", Cloud: "☁️", Coffee: "🥤", Cow: "🐮", Dog: "🐶",
  Door: "🚪", FishSimple: "🐟", Flower: "🌼", Headphones: "🎧",
  Horse: "🐴", House: "🏠", Moon: "🌙", PawPrint: "🐾", Pencil: "✏️",
  Package: "📦", Palette: "🎨", Plant: "🌿", Rabbit: "🐰", Rectangle: "▭",
  Smiley: "😄", SmileyMeh: "😌",
  SmileyNervous: "😨", SmileySad: "😢", SmileyWink: "😮",
  SmileyXEyes: "😠", Snowflake: "❄️", Sun: "☀️", Table: "🪑",
  SortAscending: "↗️", SortDescending: "↘️", Tooth: "🪥", Tree: "🌳",
  Umbrella: "☂️", Waves: "🌊",
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
  const tone = value.tone ?? value.value?.tone;
  const label = itemLabel(value);
  const Sticker = STICKERS[icon];
  const shape = !Sticker && SHAPES.has(icon) ? icon.toLowerCase() : "";
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
      {image ? (
        <img src={image} alt="" />
      ) : Sticker ? (
        <Sticker size={compact ? 28 : 40} tint={tone} />
      ) : shape ? null : (
        EMOJI[icon] ??
        (icon ? (
          <NidoGlyph
            name={icon}
            size={compact ? 26 : 42}
            weight="duotone"
            tint={tone}
          />
        ) : tone ? (
          <i className="nido-games__picture-swatch" aria-hidden="true" />
        ) : (
          label
        ))
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

function optionPresentationLabel(challenge, option) {
  const label = String(option?.label ?? "");
  if (challenge.visual.kind !== "camouflage") return label;
  return label.replace(/\s+escondido(?=\s|$)/i, "");
}

function SceneChoice({
  challenge,
  option,
  selectedAnswer,
  incorrectAnswers,
  locked,
  onAnswer,
  className = "",
  ariaLabel,
  style,
  children,
}) {
  const chosen = option.id === selectedAnswer;
  const correct = chosen && option.id === challenge.answerId;
  const incorrect = incorrectAnswers.includes(option.id);
  const hinted =
    !locked &&
    incorrectAnswers.length >= 2 &&
    option.id === challenge.answerId;

  return (
    <button
      className={[
        "nido-games__scene-choice",
        "nido-games__interactive-option",
        className,
        chosen ? "is-selected" : "",
        correct ? "is-correct" : "",
        incorrect ? "is-error" : "",
        hinted ? "is-hint" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      type="button"
      aria-pressed={chosen}
      aria-label={`${ariaLabel ?? optionPresentationLabel(challenge, option)}${
        incorrect ? ". Opción ya intentada." : ""
      }`}
      style={{
        gridTemplateColumns: "1fr",
        placeItems: "center",
        minHeight: 48,
        padding: 4,
        textAlign: "center",
        ...style,
      }}
      disabled={incorrect || (locked && !chosen)}
      onClick={() => onAnswer(option.id)}
    >
      {children}
    </button>
  );
}

function DirectTapScene({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const visual = challenge.visual;
  const isCamouflage = visual.kind === "camouflage";
  const correctSelected = selectedAnswer === challenge.answerId;
  const answer = challenge.options.find(
    (option) => option.id === challenge.answerId,
  );
  const prompt = {
    "odd-one-out": `Familia: ${visual.family}`,
    "real-or-imaginary": `🌍 ${visual.topic}`,
    "shape-properties": visual.clue?.sides
      ? `${visual.clue.sides} lados`
      : visual.clue?.name,
    "hidden-character": visual.clue,
    "character-clue": visual.clue,
    "spoken-question": "🔊 Escucha la pregunta y toca el objeto",
    "emotion-scene": visual.context,
    camouflage: "🔎 Busca la figura dentro del camuflaje",
  }[visual.kind];

  return (
    <div
      className="nido-games__mechanic is-options"
      data-direct-kind={visual.kind}
      style={{
        width: "min(460px, 100%)",
        gap: 7,
        padding: isCamouflage ? 9 : 4,
        borderRadius: 18,
        background: isCamouflage
          ? visual.backgroundTone
          : "rgba(255,255,255,.68)",
      }}
    >
      {visual.kind === "detective-clues" ? (
        <span
          role="group"
          aria-label="Pistas del detective"
          style={{ justifyContent: "center", gap: 6 }}
        >
          {visual.clues.map((clue) => (
            <VisualToken item={clue} key={`${clue.type}-${clue.value}`} />
          ))}
        </span>
      ) : null}
      {visual.kind === "hidden-character" ? (
        <Picture item={correctSelected ? answer : visual.cover} />
      ) : visual.kind === "emotion-scene" ? (
        correctSelected ? (
          <Picture item={answer} />
        ) : (
          <span aria-hidden="true" style={{ fontSize: "2rem" }}>
            🎭
          </span>
        )
      ) : null}
      {prompt ? <b>{prompt}</b> : null}
      <span
        role="group"
        aria-label="Objetos tocables de la escena"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(88px,1fr))",
          gap: 7,
          width: "100%",
        }}
      >
        {challenge.options.map((option) => {
          const presentationLabel = optionPresentationLabel(
            challenge,
            option,
          );
          return (
            <SceneChoice
              challenge={challenge}
              option={option}
              selectedAnswer={selectedAnswer}
              incorrectAnswers={incorrectAnswers}
              locked={locked}
              onAnswer={onAnswer}
              ariaLabel={`${presentationLabel} dentro de la escena`}
              style={
                isCamouflage
                  ? {
                      minHeight: 76,
                      borderColor: "rgba(255,255,255,.62)",
                      background: "transparent",
                    }
                  : undefined
              }
              key={option.id}
            >
              <Picture
                item={{ ...option, label: presentationLabel }}
              />
              {isCamouflage ? null : <small>{presentationLabel}</small>}
            </SceneChoice>
          );
        })}
      </span>
    </div>
  );
}

function NumberPatternActivity({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const selectedOption = challenge.options.find(
    (option) => option.id === selectedAnswer,
  );
  const completed = selectedAnswer === challenge.answerId;

  return (
    <div
      className="nido-games__pattern-activity nido-games__order-activity"
      data-age={challenge.ageId}
      data-mechanic="order"
    >
      <div
        className="nido-games__pattern-track nido-games__visual-sequence"
        role="group"
        aria-label={`Serie: ${challenge.visual.items.join(", ")}. Falta el número final.`}
      >
        {challenge.visual.items.map((item, index) => (
          <VisualToken item={item} key={`${item}-${index}`} />
        ))}
        <span
          className={[
            "nido-games__pattern-slot",
            "nido-games__visual-question",
            selectedOption ? "is-ready" : "",
            completed ? "is-complete" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ minWidth: 76, minHeight: 64 }}
          aria-label={`Espacio final${
            selectedOption ? ` con ${selectedOption.label}` : " vacío"
          }`}
        >
          <span aria-hidden="true">
            {selectedOption ? (
              <OptionArtwork challenge={challenge} option={selectedOption} />
            ) : (
              "?"
            )}
          </span>
          <small>
            {completed
              ? "¡Patrón completo!"
              : selectedOption
                ? "Prueba otro número"
                : "Número que sigue"}
          </small>
        </span>
      </div>
      <div
        className="nido-games__pattern-options nido-games__drag-pieces"
        role="group"
        aria-label="Números para completar el patrón"
      >
        {challenge.options.map((option) => (
          <SceneChoice
            challenge={challenge}
            option={option}
            selectedAnswer={selectedAnswer}
            incorrectAnswers={incorrectAnswers}
            locked={locked}
            onAnswer={onAnswer}
            className="nido-games__pattern-choice"
            key={option.id}
          >
            <OptionArtwork challenge={challenge} option={option} />
          </SceneChoice>
        ))}
      </div>
    </div>
  );
}

function DrawingDetailScene({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const visual = challenge.visual;
  const target = challenge.options.find(
    (option) => option.id === challenge.answerId,
  );
  const others = challenge.options.filter(
    (option) => option.id !== challenge.answerId,
  );
  const count = Math.max(4, Number(visual.detailCount) || 4);
  const targetIndex = Math.abs(Number(challenge.seed) || 0) % count;

  return (
    <div
      className="nido-games__detail"
      data-scene={visual.sceneId}
      role="group"
      aria-label="Dibujo con detalles tocables"
    >
      {Array.from({ length: count }, (_, index) => {
        const option =
          index === targetIndex ? target : others[index % others.length];
        if (!option) return null;
        return (
          <SceneChoice
            challenge={challenge}
            option={option}
            selectedAnswer={selectedAnswer}
            incorrectAnswers={incorrectAnswers}
            locked={locked}
            onAnswer={onAnswer}
            ariaLabel={`${option.label} dentro del dibujo`}
            key={`${option.id}-${index}`}
          >
            <Picture item={option} />
          </SceneChoice>
        );
      })}
    </div>
  );
}

function DifferenceScene({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const visual = challenge.visual;
  const changedDescription = {
    color: "tiene un color diferente",
    position: "está en otra posición",
    size: "tiene otro tamaño",
    missing: "ya no aparece",
  }[visual.changeType];

  return (
    <div className="nido-games__difference">
      {["A", "B"].map((panel) => (
        <span data-scene={panel === "A" ? visual.sceneA : visual.sceneB} key={panel}>
          <b>Escena {panel}</b>
          <i
            role="group"
            aria-label={
              panel === "B"
                ? "Elementos tocables de la escena B"
                : "Escena A de referencia"
            }
          >
            {challenge.options.map((option) => {
              const changed =
                panel === "B" && option.id === challenge.answerId;
              if (panel === "A") {
                return (
                  <span
                    className="nido-games__scene-reference"
                    role="img"
                    aria-label={`${option.label} en la escena A`}
                    key={option.id}
                  >
                    <Picture item={option} compact />
                  </span>
                );
              }
              return (
                <SceneChoice
                  challenge={challenge}
                  option={option}
                  selectedAnswer={selectedAnswer}
                  incorrectAnswers={incorrectAnswers}
                  locked={locked}
                  onAnswer={onAnswer}
                  className={
                    changed ? `is-${visual.changeType}` : ""
                  }
                  ariaLabel={`${option.label} en la escena ${panel}${
                    changed ? `; ${changedDescription}` : ""
                  }`}
                  key={option.id}
                >
                  {changed && visual.changeType === "missing" ? (
                    <em aria-hidden="true">?</em>
                  ) : (
                    <Picture item={option} compact />
                  )}
                </SceneChoice>
              );
            })}
          </i>
        </span>
      ))}
    </div>
  );
}

function MechanicScene({
  challenge,
  memoryVisible,
  memorySeconds,
  replayMemory,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const v = challenge.visual;
  const items = getVisualItems(v);
  const pictures = challenge.options.map((option) => (
    <Picture item={option} compact key={option.id} />
  ));

  if (usesDirectTapActivity(challenge)) {
    return (
      <DirectTapScene
        challenge={challenge}
        selectedAnswer={selectedAnswer}
        incorrectAnswers={incorrectAnswers}
        onAnswer={onAnswer}
        locked={locked}
      />
    );
  }
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
    return (
      <DifferenceScene
        challenge={challenge}
        selectedAnswer={selectedAnswer}
        incorrectAnswers={incorrectAnswers}
        onAnswer={onAnswer}
        locked={locked}
      />
    );
  }
  if (v.kind === "drawing-detail") {
    return (
      <DrawingDetailScene
        challenge={challenge}
        selectedAnswer={selectedAnswer}
        incorrectAnswers={incorrectAnswers}
        onAnswer={onAnswer}
        locked={locked}
      />
    );
  }
  if (v.kind === "number-pattern") {
    return (
      <NumberPatternActivity
        challenge={challenge}
        selectedAnswer={selectedAnswer}
        incorrectAnswers={incorrectAnswers}
        onAnswer={onAnswer}
        locked={locked}
      />
    );
  }
  if (v.previewSeconds) {
    const revealed = memoryVisible || selectedAnswer;
    return <div className="nido-games__memory">{revealed ? (
      <><Picture item={v.model} /><small>Memoriza · {memorySeconds} s</small></>
    ) : (
      <><strong role="status">🙈 Pista oculta</strong><button type="button" onClick={replayMemory}>Ver otra vez</button></>
    )}</div>;
  }
  if (v.kind === "add-one") {
    return <div className="nido-games__mechanic is-add">
      <CountPicture count={v.count} iconName={v.itemIconName} /><b>+</b>
      <CountPicture count={v.addedCount} iconName={v.itemIconName} />
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

function ChallengeScene({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
  memoryVisible,
  memorySeconds,
  replayMemory,
}) {
  const { visual } = challenge;
  const worldAsset = AREA_WORLD_ASSETS[challenge.areaId];
  const directSceneActivity = usesDirectSceneActivity(challenge);

  return (
    <div
      className={[
        "nido-games__scene",
        directSceneActivity ? "is-direct-activity" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-kind={visual.kind}
      data-age={challenge.ageId}
      style={{
        ...(visual.backgroundTone
          ? { "--scene-tone": visual.backgroundTone }
          : {}),
        ...(directSceneActivity
          ? { gridColumn: "1 / -1" }
          : {}),
      }}
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
          replayMemory={replayMemory}
          selectedAnswer={selectedAnswer}
          incorrectAnswers={incorrectAnswers}
          onAnswer={onAnswer}
          locked={locked}
        />
        {visual.word ? (
          <strong className="nido-games__scene-word">{String(visual.word)}</strong>
        ) : null}
        {visual.repeatWord &&
        (visual.kind !== "emotion-scene" ||
          selectedAnswer === challenge.answerId) ? (
          <span className="nido-games__scene-repeat">
            Escucha y repite: <strong>{String(visual.repeatWord)}</strong>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function OptionArtwork({ challenge, option, compact = false }) {
  const groupNumber = Number(option.id.match(/option-group-(\d+)/)?.[1]);
  const group = groupNumber
    ? challenge.visual.groups?.[groupNumber - 1]
    : null;
  const numericValue =
    option.meta?.numericValue ??
    (/^-?\d+(?:[.,]\d+)?$/.test(String(option.label).trim())
      ? option.label
      : null);

  if (group || option.meta?.count !== undefined) {
    return (
      <CountPicture
        count={group?.count ?? option.meta.count}
        iconName={group?.itemIconName}
        compact={compact}
      />
    );
  }
  if (numericValue !== null && numericValue !== undefined) {
    return <strong className="nido-games__interactive-number">{numericValue}</strong>;
  }
  return <Picture item={option} compact={compact} />;
}

function InteractiveOption({
  challenge,
  option,
  selectedAnswer,
  incorrectAnswers,
  locked,
  className = "",
  pressed,
  onClick,
  ...buttonProps
}) {
  const chosen = option.id === selectedAnswer;
  const correct = chosen && option.id === challenge.answerId;
  const incorrect = incorrectAnswers.includes(option.id);
  const hinted =
    !locked &&
    incorrectAnswers.length >= 2 &&
    option.id === challenge.answerId;

  return (
    <button
      className={[
        "nido-games__interactive-option",
        className,
        chosen ? "is-selected" : "",
        correct ? "is-correct" : "",
        incorrect ? "is-error" : "",
        hinted ? "is-hint" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={option.tone ? { "--option-tone": option.tone } : undefined}
      type="button"
      aria-pressed={pressed ?? chosen}
      aria-label={`${option.label}${incorrect ? ". Opción ya intentada." : ""}`}
      disabled={incorrect || (locked && !chosen)}
      onClick={onClick}
      {...buttonProps}
    >
      <span className="nido-games__interactive-art" aria-hidden="true">
        <OptionArtwork challenge={challenge} option={option} />
      </span>
      <span>{option.label}</span>
      {correct ? (
        <CheckCircle size={28} weight="fill" aria-hidden="true" />
      ) : incorrect ? (
        <XCircle size={28} weight="fill" aria-hidden="true" />
      ) : null}
    </button>
  );
}

// Iconos del destino de arrastre. Antes eran emojis del sistema (➕ 🎨 📏 🧺
// 🍽️): cada teléfono los dibuja distinto y el destino desentonaba con la
// ilustración del juego. Los glifos propios se pintan con `currentColor`.
const PlusCircle = createNidoIcon("PlusCircle");
const PaintBrush = createNidoIcon("PaintBrush");
const ArrowsDownUp = createNidoIcon("ArrowsDownUp");
const CirclesThreePlus = createNidoIcon("CirclesThreePlus");
const Heart = createNidoIcon("Heart");
const ArrowDown = createNidoIcon("ArrowDown");

// El destino atrae la pieza cuando el dedo se acerca. Sin imán, un niño de tres
// años suelta a un centímetro del borde y el juego le contesta que ha fallado:
// el error es de puntería, no de razonamiento, y no es lo que queremos medir.
// `MAGNET` es hasta dónde se nota el tirón; `HALO`, hasta dónde cuenta soltar.
const DRAG_MAGNET_RADIUS = 118;
const DRAG_DROP_HALO = 46;
const DRAG_START_THRESHOLD = 8;

// La captura de puntero lanza `NotFoundError` si el puntero ya no está activo
// (el dedo se levantó fuera de la ventana, el navegador canceló el gesto). No
// es un fallo del juego: solo significa que ya no hay nada que capturar.
function capturePointer(node, pointerId, capture) {
  try {
    if (capture) node?.setPointerCapture?.(pointerId);
    else node?.releasePointerCapture?.(pointerId);
  } catch {
    /* puntero ya inactivo */
  }
}

// Distancia del punto al rectángulo (0 si está dentro).
function distanceToRect(rect, x, y) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

function DragActivity({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const [pickedId, setPickedId] = useState("");
  const [draggingId, setDraggingId] = useState("");
  const [near, setNear] = useState(false);
  const dropRef = useRef(null);
  const ghostRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (pickedId && incorrectAnswers.includes(pickedId)) setPickedId("");
  }, [incorrectAnswers, pickedId]);

  // La posición del fantasma se escribe directamente en el nodo, sin pasar por
  // el estado: en una tablet modesta un `setState` por cada `pointermove`
  // arrastra el dedo a tirones, y aquí lo único que cambia son dos píxeles.
  const paintGhost = (position) => {
    const node = ghostRef.current;
    if (!node || !position) return false;
    node.style.left = `${position.x}px`;
    node.style.top = `${position.y}px`;
    node.style.setProperty("--drag-pull", position.pull.toFixed(3));
    return true;
  };

  // El fantasma nace en el primer `pointermove`, así que su posición inicial
  // solo puede pintarse cuando React ya lo ha montado.
  useLayoutEffect(() => {
    if (draggingId) paintGhost(dragRef.current?.last);
  }, [draggingId]);

  const endDrag = () => {
    dragRef.current = null;
    setDraggingId("");
    setNear(false);
  };

  const submit = (optionId) => {
    if (!optionId || locked || incorrectAnswers.includes(optionId)) return;
    setPickedId("");
    endDrag();
    onAnswer(optionId);
  };

  const pointerStart = (event, optionId) => {
    if (locked || event.button > 0 || incorrectAnswers.includes(optionId)) return;
    dragRef.current = {
      optionId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      // El rectángulo se congela al empezar: el destino crece cuando la pieza
      // se acerca, y remedirlo en cada movimiento realimentaría ese crecimiento.
      zone: dropRef.current?.getBoundingClientRect() ?? null,
      last: null,
    };
    capturePointer(event.currentTarget, event.pointerId, true);
  };

  const pointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
        DRAG_START_THRESHOLD
    ) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      suppressClickRef.current = true;
      setDraggingId(drag.optionId);
    }

    let x = event.clientX;
    let y = event.clientY;
    let pull = 0;
    if (drag.zone) {
      const distance = distanceToRect(drag.zone, x, y);
      if (distance < DRAG_MAGNET_RADIUS) {
        pull = 1 - distance / DRAG_MAGNET_RADIUS;
        // Tirón parcial: la pieza sigue obedeciendo al dedo y solo se inclina
        // hacia el destino, para que se sienta ayuda y no que se le escapa.
        x += (drag.zone.left + drag.zone.width / 2 - x) * pull * 0.5;
        y += (drag.zone.top + drag.zone.height / 2 - y) * pull * 0.5;
      }
    }
    drag.last = { x, y, pull };
    paintGhost(drag.last);

    const isNear = pull > 0.2;
    if (isNear !== near) setNear(isNear);
  };

  const pointerEnd = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    capturePointer(event.currentTarget, event.pointerId, false);
    const dropped =
      drag.moved &&
      drag.zone &&
      distanceToRect(drag.zone, event.clientX, event.clientY) < DRAG_DROP_HALO;
    endDrag();
    if (dropped) submit(drag.optionId);
    else if (drag.moved) setPickedId(drag.optionId);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const pointerCancel = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    capturePointer(event.currentTarget, event.pointerId, false);
    endDrag();
    suppressClickRef.current = false;
  };

  const pickedOption = challenge.options.find(
    (option) => option.id === (draggingId || pickedId),
  );
  const solved = selectedAnswer === challenge.answerId;
  const dropCopy =
    {
      "add-one": {
        Icon: PlusCircle,
        idle: "Añade al grupo",
        help: "Lleva el número que completa el grupo",
      },
      "color-pattern": {
        Icon: PaintBrush,
        idle: "Completa el hueco",
        help: "Lleva el color que continúa la serie",
      },
      "size-pair": {
        Icon: ArrowsDownUp,
        idle: "Cesta de tamaños",
        help: "Lleva aquí el tamaño que te pidieron",
      },
      "quantity-groups": {
        Icon: CirclesThreePlus,
        idle: "Bandeja de cantidades",
        help: "Lleva aquí el grupo correcto",
      },
      "animal-food": {
        Icon: Heart,
        idle: `Plato de ${challenge.visual.subject?.label ?? "comida"}`,
        help: "Dale al animal el alimento correcto",
      },
    }[challenge.visual.kind] ?? {
      Icon: ArrowDown,
      idle: "Suelta aquí",
      help: "Arrastra o toca una pieza y luego este destino",
    };
  const DropIcon = solved ? CheckCircle : dropCopy.Icon;

  return (
    <div
      className="nido-games__drag-activity"
      data-age={challenge.ageId}
      data-mechanic="drag"
      data-kind={challenge.visual.kind}
    >
      <div className="nido-games__drag-pieces" role="group" aria-label="Piezas para arrastrar">
        {challenge.options.map((option) => (
          <InteractiveOption
            challenge={challenge}
            option={option}
            selectedAnswer={selectedAnswer}
            incorrectAnswers={incorrectAnswers}
            locked={locked}
            pressed={pickedId === option.id}
            className={[
              pickedId === option.id ? "is-picked" : "",
              draggingId === option.id ? "is-dragging" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onPointerDown={(event) => pointerStart(event, option.id)}
            onPointerMove={pointerMove}
            onPointerUp={pointerEnd}
            onPointerCancel={pointerCancel}
            onClick={() => {
              if (suppressClickRef.current) return;
              setPickedId((current) => (current === option.id ? "" : option.id));
            }}
            key={option.id}
          />
        ))}
      </div>
      <button
        className={[
          "nido-games__drop-zone",
          pickedId || draggingId ? "is-ready" : "",
          near ? "is-near" : "",
          solved ? "is-complete" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        ref={dropRef}
        data-nido-drop-zone
        disabled={locked && !solved}
        aria-label={
          pickedId
            ? `Soltar ${pickedOption?.label ?? "la pieza"} en el destino`
            : "Destino de las piezas. Primero elige o arrastra una pieza."
        }
        onClick={() => submit(pickedId)}
      >
        <span aria-hidden="true">
          <DropIcon size={26} weight="fill" />
        </span>
        <strong>
          {solved
            ? "¡Encajó perfecto!"
            : near
              ? "¡Suelta ya!"
              : pickedId
                ? "Toca para soltar"
                : dropCopy.idle}
        </strong>
        <small>{dropCopy.help}</small>
      </button>
      {draggingId && pickedOption ? (
        <span className="nido-games__drag-ghost" ref={ghostRef} aria-hidden="true">
          <OptionArtwork challenge={challenge} option={pickedOption} />
        </span>
      ) : null}
    </div>
  );
}

function OrderActivity({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const isSizeOrder =
    challenge.visual.kind === "size-order" &&
    Array.isArray(challenge.visual.items);
  const [items, setItems] = useState(() => buildInitialOrder(challenge));
  const [pickedIndex, setPickedIndex] = useState(-1);
  const [dragIndex, setDragIndex] = useState(-1);
  const [attempt, setAttempt] = useState(0);
  const trackRef = useRef(null);
  const rectsRef = useRef(new Map());
  const orderDragRef = useRef(null);

  // FLIP. Antes de reordenar apuntamos dónde estaba cada pieza; después de que
  // React las recoloque, las devolvemos a su sitio con un `transform` y las
  // soltamos. Sin esto el hueco se abre de golpe y el niño no llega a ver qué
  // pieza se ha movido, que es justo lo que el juego le está pidiendo entender.
  const rememberRects = () => {
    const track = trackRef.current;
    if (!track) return;
    const map = new Map();
    for (const node of track.children) {
      map.set(node.dataset.orderId, node.getBoundingClientRect());
    }
    rectsRef.current = map;
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    const previous = rectsRef.current;
    if (!track || !previous.size) return;
    rectsRef.current = new Map();
    for (const node of track.children) {
      const before = previous.get(node.dataset.orderId);
      if (!before) continue;
      const after = node.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (!dx && !dy) continue;
      node.style.transition = "none";
      node.style.transform = `translate(${dx}px, ${dy}px)`;
      void node.offsetWidth; // fuerza el reflujo antes de soltar la transición
      node.style.transition = "transform 260ms cubic-bezier(0.2, 1.1, 0.4, 1)";
      node.style.transform = "";
    }
  }, [items]);

  if (!isSizeOrder) {
    return (
      <DragActivity
        challenge={challenge}
        selectedAnswer={selectedAnswer}
        incorrectAnswers={incorrectAnswers}
        onAnswer={onAnswer}
        locked={locked}
      />
    );
  }

  const moveItem = (from, to) => {
    if (locked || from === to || from < 0 || to < 0) return;
    rememberRects();
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setPickedIndex(-1);
  };

  // Arrastre por puntero, no `draggable` nativo: el arrastre del navegador pinta
  // su propio fantasma translúcido, no existe en táctil y no deja reordenar en
  // vivo. Aquí la fila se recoloca en cuanto el dedo cruza a la vecina.
  const orderPointerDown = (event, index) => {
    if (locked || event.button > 0) return;
    // Las flechas de la fila son botones: ahí manda el toque, no el arrastre.
    if (event.target.closest?.("[data-order-controls]")) return;
    orderDragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    capturePointer(event.currentTarget, event.pointerId, true);
  };

  const orderPointerMove = (event) => {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
        DRAG_START_THRESHOLD
    ) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      setDragIndex(drag.index);
    }
    const track = trackRef.current;
    if (!track) return;
    const over = [...track.children].findIndex((node) => {
      const rect = node.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top - 24 &&
        event.clientY <= rect.bottom + 24
      );
    });
    if (over >= 0 && over !== drag.index) {
      moveItem(drag.index, over);
      drag.index = over;
      setDragIndex(over);
    }
  };

  const orderPointerEnd = (event) => {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    orderDragRef.current = null;
    capturePointer(event.currentTarget, event.pointerId, false);
    setDragIndex(-1);
  };

  const choosePosition = (index) => {
    if (pickedIndex < 0) {
      setPickedIndex(index);
      return;
    }
    moveItem(pickedIndex, index);
  };

  const checkOrder = () => {
    if (locked) return;
    const currentLabels = items.map((item) =>
      normalizeOrderLabel(item.label ?? item.value),
    );
    const correctLabels = getCorrectOrderLabels(challenge).map(
      normalizeOrderLabel,
    );
    const isCorrect =
      currentLabels.length === correctLabels.length &&
      currentLabels.every((label, index) => label === correctLabels[index]);
    setAttempt((current) => current + 1);
    onAnswer(
      isCorrect
        ? challenge.answerId
        : `interactive-order-${attempt}-${currentLabels.join("-")}`,
    );
  };

  return (
    <div
      className="nido-games__order-activity"
      data-age={challenge.ageId}
      data-mechanic="order"
    >
      <div
        className="nido-games__order-track"
        ref={trackRef}
        role="list"
        aria-label="Piezas para ordenar"
      >
        {items.map((item, index) => (
          <div
            className={[
              "nido-games__order-piece",
              pickedIndex === index ? "is-picked" : "",
              dragIndex === index ? "is-dragging" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="listitem"
            data-order-id={item.interactionId}
            onPointerDown={(event) => orderPointerDown(event, index)}
            onPointerMove={orderPointerMove}
            onPointerUp={orderPointerEnd}
            onPointerCancel={orderPointerEnd}
            key={item.interactionId}
          >
            <button
              type="button"
              aria-pressed={pickedIndex === index}
              aria-label={`${item.label}. Posición ${index + 1}. Toca para mover.`}
              disabled={locked}
              onClick={() => choosePosition(index)}
            >
              <Picture
                item={{ ...item, iconName: challenge.visual.itemIconName }}
              />
              <strong>{item.label}</strong>
            </button>
            <span data-order-controls>
              <button
                type="button"
                aria-label={`Mover ${item.label} a la izquierda`}
                disabled={locked || index === 0}
                onClick={() => moveItem(index, index - 1)}
              >
                ←
              </button>
              <small>{index + 1}</small>
              <button
                type="button"
                aria-label={`Mover ${item.label} a la derecha`}
                disabled={locked || index === items.length - 1}
                onClick={() => moveItem(index, index + 1)}
              >
                →
              </button>
            </span>
          </div>
        ))}
      </div>
      <button
        className="nido-games__order-check"
        type="button"
        disabled={locked}
        onClick={checkOrder}
      >
        <CheckCircle size={24} weight="fill" aria-hidden="true" />
        Comprobar orden
      </button>
    </div>
  );
}

function MatchActivity({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
  memoryVisible,
}) {
  const ageProfile = getNidoAgeInteractionProfile(challenge.ageId);
  const visual = challenge.visual;
  const previewSeconds = Number(visual.previewSeconds) || 0;
  const [sourceSelected, setSourceSelected] = useState(
    ageProfile.sourceStartsSelected,
  );
  const [mergingId, setMergingId] = useState("");
  const sourceRef = useRef(null);
  const optionRefs = useRef(new Map());
  const memoryReady = !memoryVisible;
  const matchReady = previewSeconds ? memoryReady : sourceSelected;
  const source =
    visual.model ??
    visual.subject ??
    visual.adult ??
    (visual.kind === "teddy-bow-match" ? visual.items?.[0] : null) ??
    (visual.iconName || visual.word
      ? {
          iconName: visual.iconName,
          tone: visual.tone,
          label: visual.word,
        }
      : { iconName: "Question", label: challenge.question });
  const matchTheme =
    {
      "teddy-bow-match": {
        source: "Osito modelo",
      },
      "mask-match": {
        source: "Modelo secreto",
      },
      "twin-match": {
        source: "Gemelo para recordar",
      },
      "animal-young": {
        source: "Animal adulto",
      },
      "english-colors": {
        source: "Muestra de color",
      },
      "english-animals": {
        source: "Animal misterioso",
      },
      "english-numbers": {
        source: "Número y cantidad",
      },
      "english-family": {
        source: "Miembro de la familia",
      },
      "english-objects": {
        source: "Objeto de la misión",
      },
    }[visual.kind] ?? { source: "Tarjeta guía" };

  // Emparejar tiene que verse como emparejar. Al acertar, la tarjeta elegida
  // viaja hasta la guía y se funde con ella: el niño ve *qué* ha unido, no solo
  // un borde que se pone verde. El recorrido se mide en el momento del acierto
  // porque las dos tarjetas cambian de sitio según el ancho de la pantalla.
  const chooseMatch = (optionId) => {
    if (!matchReady || locked) return;
    if (optionId === challenge.answerId) {
      const card = optionRefs.current.get(optionId);
      const guide = sourceRef.current;
      if (card && guide) {
        const from = card.getBoundingClientRect();
        const to = guide.getBoundingClientRect();
        card.style.setProperty(
          "--merge-x",
          `${Math.round(to.left + to.width / 2 - (from.left + from.width / 2))}px`,
        );
        card.style.setProperty(
          "--merge-y",
          `${Math.round(to.top + to.height / 2 - (from.top + from.height / 2))}px`,
        );
        setMergingId(optionId);
      }
    }
    onAnswer(optionId);
    if (
      optionId !== challenge.answerId &&
      !ageProfile.sourceStartsSelected
    ) {
      setSourceSelected(false);
    }
  };

  return (
    <div
      className="nido-games__match-activity"
      data-age={challenge.ageId}
      data-mechanic="match"
      data-kind={visual.kind}
    >
      <button
        className={[
          "nido-games__match-source",
          matchReady ? "is-selected" : "",
          mergingId ? "is-merged" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        ref={sourceRef}
        aria-pressed={matchReady}
        aria-label={
          previewSeconds
            ? memoryReady
              ? "Pista oculta. Elige la pareja de memoria."
              : "Memoriza la tarjeta que aparece en la escena."
            : "Seleccionar tarjeta guía"
        }
        disabled={locked || Boolean(previewSeconds)}
        onClick={() => setSourceSelected(true)}
      >
        {previewSeconds ? (
          <>
            <small>{memoryReady ? "Ahora recuerda" : "Mira la escena"}</small>
            <span className="nido-games__match-memory" aria-hidden="true">
              {memoryReady ? "?" : "👀"}
            </span>
            <strong>
              {memoryReady ? "Pista oculta" : "Memoriza el modelo"}
            </strong>
          </>
        ) : (
          <>
            <small>{matchTheme.source}</small>
            <Picture item={source} />
            <strong>
              {itemLabel(source) || visual.repeatWord || "Busca su pareja"}
            </strong>
          </>
        )}
      </button>
      {/* El puente entre la guía y las opciones. Antes era una ristra de
          emojis (🎀 → / 🧠 → / 👀 →) distinta en cada tema: se veía diferente en
          cada teléfono y no comunicaba nada. Ahora es una línea dibujada por la
          que corre un punto cuando el juego está listo para responder. */}
      <span
        className={[
          "nido-games__match-connector",
          matchReady ? "is-live" : "",
          mergingId ? "is-merged" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        <i />
      </span>
      <div
        className={[
          "nido-games__match-options",
          mergingId ? "is-merging" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="group"
        aria-label="Posibles parejas"
      >
        {challenge.options.map((option) => (
          <InteractiveOption
            challenge={challenge}
            option={option}
            selectedAnswer={selectedAnswer}
            incorrectAnswers={incorrectAnswers}
            locked={locked || !matchReady}
            className={[
              "nido-games__match-option",
              mergingId === option.id ? "is-merging" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            ref={(node) => {
              if (node) optionRefs.current.set(option.id, node);
              else optionRefs.current.delete(option.id);
            }}
            onClick={() => chooseMatch(option.id)}
            key={option.id}
          />
        ))}
      </div>
      {!matchReady ? (
        <p role="status">
          {previewSeconds
            ? "Memoriza la tarjeta de la escena."
            : "Primero toca la tarjeta guía."}
        </p>
      ) : null}
    </div>
  );
}

function PathActivity({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked,
}) {
  const layout = useMemo(() => buildNidoPathLayout(challenge), [challenge]);
  const pathTheme =
    {
      "position-scene": {
        playerLabel: "objeto",
        obstacle: "🧱",
        obstacleLabel: "un muro",
        instruction: "Lleva el objeto hasta la posición correcta",
        player: (
          <NidoGlyph
            name={challenge.visual.subjectIconName}
            size={34}
            weight="duotone"
          />
        ),
      },
      "habitat-match": {
        playerLabel: challenge.visual.subject?.label ?? "animal",
        obstacle: "🪨",
        obstacleLabel: "una roca",
        instruction: `Guía a ${challenge.visual.subject?.label ?? "el animal"} hasta su hogar`,
        player: <Picture item={challenge.visual.subject} compact />,
      },
      "english-actions": {
        playerLabel: "explorador",
        obstacle: "⭐",
        obstacleLabel: "una estrella",
        instruction: "Guía al explorador hasta la acción correcta en inglés",
        player: (
          <NidoGlyph
            name={challenge.visual.iconName}
            size={34}
            weight="duotone"
          />
        ),
      },
    }[challenge.visual.kind] ?? {
      playerLabel: "pollito",
      obstacle: "🌳",
      obstacleLabel: "un árbol",
      instruction: "Lleva al pollito hasta la tarjeta correcta",
      player: "🐣",
    };
  const [position, setPosition] = useState(layout.start);
  // Hacia dónde mira el personaje (1 derecha, -1 izquierda) y el rastro de
  // casillas ya pisadas: sin ellos el tablero no cuenta ninguna historia.
  const [facing, setFacing] = useState(1);
  const [visited, setVisited] = useState(
    () => new Set([`${layout.start.row}:${layout.start.column}`]),
  );
  const [pathStatus, setPathStatus] = useState(
    `${pathTheme.playerLabel} empieza en la fila ${layout.start.row + 1}, columna ${layout.start.column + 1}.`,
  );
  const positionRef = useRef(layout.start);
  const boardRef = useRef(null);
  const obstacleKeys = new Set(
    layout.obstacles.map(({ row, column }) => `${row}:${column}`),
  );
  const targetsByKey = new Map(
    layout.targets.map((target) => [
      `${target.row}:${target.column}`,
      target.optionId,
    ]),
  );
  const targetSummary = layout.targets
    .map((target) => {
      const option = challenge.options.find(
        (candidate) => candidate.id === target.optionId,
      );
      return `${option?.label ?? "respuesta"}, fila ${target.row + 1}, columna ${target.column + 1}`;
    })
    .join("; ");

  const move = (rowDelta, columnDelta) => {
    if (locked) return;
    const current = positionRef.current;
    const next = {
      row: current.row + rowDelta,
      column: current.column + columnDelta,
    };
    if (!isNidoPathMoveAllowed(layout, next.row, next.column)) {
      const obstacle = layout.obstacles.some(
        (item) => item.row === next.row && item.column === next.column,
      );
      setPathStatus(
        obstacle
          ? `Hay ${pathTheme.obstacleLabel} en ese camino. Prueba otra dirección.`
          : "Llegaste al borde del tablero. Prueba otra dirección.",
      );
      return;
    }

    const optionId = targetsByKey.get(`${next.row}:${next.column}`);
    const option = challenge.options.find(
      (candidate) => candidate.id === optionId,
    );
    const resolvedPosition =
      optionId && optionId !== challenge.answerId ? layout.start : next;
    positionRef.current = resolvedPosition;
    setPosition(resolvedPosition);
    if (columnDelta) setFacing(columnDelta > 0 ? 1 : -1);
    setVisited((current) => {
      const nextVisited = new Set(current);
      nextVisited.add(`${resolvedPosition.row}:${resolvedPosition.column}`);
      return nextVisited;
    });
    if (optionId) {
      setPathStatus(
        optionId === challenge.answerId
          ? `Llegaste a ${option?.label ?? "la respuesta"}. ¡Respuesta correcta!`
          : `Llegaste a ${option?.label ?? "esa respuesta"}. Volvemos al inicio para probar otra ruta.`,
      );
      onAnswer(optionId);
    } else {
      setPathStatus(`Fila ${next.row + 1}, columna ${next.column + 1}.`);
    }
  };

  const handleKeyDown = (event) => {
    const directions = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    move(...direction);
  };

  return (
    <div
      className="nido-games__path-activity"
      data-age={challenge.ageId}
      data-mechanic="path"
      data-kind={challenge.visual.kind}
    >
      <div
        className="nido-games__path-board"
        style={{
          "--path-size": layout.size,
          "--path-row": position.row,
          "--path-column": position.column,
          "--path-facing": facing,
        }}
        ref={boardRef}
        role="application"
        tabIndex={0}
        aria-label={`Tablero de ${layout.size} por ${layout.size}. Usa las flechas para caminar. Destinos: ${targetSummary}.`}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: layout.size * layout.size }, (_, index) => {
          const row = Math.floor(index / layout.size);
          const column = index % layout.size;
          const key = `${row}:${column}`;
          const optionId = targetsByKey.get(key);
          const option = challenge.options.find(
            (candidate) => candidate.id === optionId,
          );
          const obstacle = obstacleKeys.has(key);
          const attempted = option && incorrectAnswers.includes(option.id);
          return (
            <span
              className={[
                "nido-games__path-cell",
                option ? "is-target" : "",
                obstacle ? "is-obstacle" : "",
                attempted ? "is-attempted" : "",
                visited.has(key) && !option ? "is-visited" : "",
                option?.id === selectedAnswer ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
              key={key}
            >
              {obstacle ? pathTheme.obstacle : null}
              {option ? (
                <span title={option.label}>
                  <OptionArtwork challenge={challenge} option={option} compact />
                </span>
              ) : null}
            </span>
          );
        })}
        {/* El personaje vive fuera de la cuadrícula, sobre ella. Cuando era hijo
            de la casilla desaparecía de una y aparecía en la otra: un salto seco
            que no se lee como caminar. Ahora es un único nodo que se desplaza
            con una transición, así que el niño ve el recorrido. */}
        <span className="nido-games__path-player" aria-hidden="true">
          {pathTheme.player}
        </span>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {pathStatus}
      </p>
      <div className="nido-games__path-controls" aria-label="Controles para caminar">
        <button type="button" aria-label="Caminar arriba" disabled={locked} onClick={() => move(-1, 0)}>
          ↑
        </button>
        <button type="button" aria-label="Caminar a la izquierda" disabled={locked} onClick={() => move(0, -1)}>
          ←
        </button>
        <button type="button" aria-label="Caminar abajo" disabled={locked} onClick={() => move(1, 0)}>
          ↓
        </button>
        <button type="button" aria-label="Caminar a la derecha" disabled={locked} onClick={() => move(0, 1)}>
          →
        </button>
      </div>
      <p>
        {pathTheme.instruction}
        {layout.obstacles.length
          ? ` sin chocar con ${pathTheme.obstacleLabel}.`
          : "."}
      </p>
    </div>
  );
}

function InteractiveChallenge(props) {
  const interactionType = getNidoInteractionType(props.challenge);

  if (usesDirectSceneActivity(props.challenge)) return null;
  if (interactionType === "drag") return <DragActivity {...props} />;
  if (interactionType === "order") return <OrderActivity {...props} />;
  if (interactionType === "match") return <MatchActivity {...props} />;
  if (interactionType === "path") return <PathActivity {...props} />;
  return <ChallengeAnswers {...props} />;
}

function ChallengeActivity(props) {
  const { challenge, selectedAnswer } = props;
  const previewSeconds = Number(challenge.visual.previewSeconds) || 0;
  const [memoryVisible, setMemoryVisible] = useState(true);
  const [memorySeconds, setMemorySeconds] = useState(previewSeconds);
  const [memoryRun, setMemoryRun] = useState(0);

  useEffect(() => {
    setMemoryVisible(true);
    setMemorySeconds(previewSeconds);
    if (!previewSeconds) return undefined;
    const timer = window.setInterval(() => {
      setMemorySeconds((current) => {
        if (current > 1) return current - 1;
        window.clearInterval(timer);
        setMemoryVisible(false);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge.id, memoryRun, previewSeconds]);

  return (
    <>
      <ChallengeScene
        challenge={challenge}
        selectedAnswer={selectedAnswer}
        incorrectAnswers={props.incorrectAnswers}
        onAnswer={props.onAnswer}
        locked={props.locked}
        memoryVisible={memoryVisible}
        memorySeconds={memorySeconds}
        replayMemory={() => setMemoryRun((current) => current + 1)}
      />
      {/* La `key` remonta el runtime en cada reto. Sin ella React reutilizaba
          los mismos nodos: el estado del reto anterior (la pieza en la mano, la
          casilla del caminante, el orden ya movido) se colaba en el siguiente y
          las animaciones de entrada solo se veían en el primero de los veinte. */}
      <InteractiveChallenge
        {...props}
        memoryVisible={memoryVisible}
        key={challenge.id}
      />
    </>
  );
}

function ChallengeAnswers({
  challenge,
  selectedAnswer,
  incorrectAnswers,
  onAnswer,
  locked = false,
}) {
  return (
    <div
      className="nido-games__answers"
      role="group"
      aria-label="Opciones de respuesta"
    >
      {challenge.options.map((option, optionIndex) => {
        const chosen = option.id === selectedAnswer;
        const correct = chosen && option.id === challenge.answerId;
        const incorrect = incorrectAnswers.includes(option.id);
        const groupNumber = Number(option.id.match(/option-group-(\d+)/)?.[1]);
        const group = groupNumber
          ? challenge.visual.groups?.[groupNumber - 1]
          : null;
        const numericValue =
          option.meta?.numericValue ??
          (/^-?\d+(?:[.,]\d+)?$/.test(String(option.label).trim())
            ? option.label
            : null);
        const visualOnly =
          numericValue !== null &&
          String(numericValue) === String(option.label);
        const presentationLabel = optionPresentationLabel(challenge, option);
        const presentationOption =
          presentationLabel === option.label
            ? option
            : { ...option, label: presentationLabel };

        return (
          <button
            className={[
              chosen ? "is-selected" : "",
              correct ? "is-correct" : "",
              incorrect ? "is-error" : "",
              visualOnly ? "is-visual-only" : "",
              !locked &&
              incorrectAnswers.length >= 2 &&
              option.id === challenge.answerId
                ? "is-hint"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={option.tone ? { "--option-tone": option.tone } : undefined}
            type="button"
            aria-pressed={chosen}
            aria-label={`${presentationLabel}${incorrect ? ". Opción ya intentada." : ""}`}
            disabled={incorrect || (locked && !chosen)}
            onClick={() => onAnswer(option.id)}
            key={option.id}
          >
            <span className="nido-games__answer-index" aria-hidden="true">
              {optionIndex + 1}
            </span>
            <span className="nido-games__answer-visual" aria-hidden="true">
              {group || option.meta?.count !== undefined ? (
                <CountPicture
                  count={group?.count ?? option.meta.count}
                  iconName={group?.itemIconName}
                  compact
                />
              ) : numericValue !== null &&
                numericValue !== undefined ? (
                <strong>{numericValue}</strong>
              ) : (
                <Picture item={presentationOption} />
              )}
            </span>
            {visualOnly ? null : <span>{presentationLabel}</span>}
            {correct || incorrect ? (
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
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [routeStats, setRouteStats] = useState(createRouteStats);
  const [speaking, setSpeaking] = useState(false);
  const [audioTracks, setAudioTracks] = useState(() => DEFAULT_AUDIO_TRACKS);
  const [feedbackTracks, setFeedbackTracks] = useState(
    () => DEFAULT_FEEDBACK_TRACKS,
  );
  const [focusMode, setFocusMode] = useState(false);
  const [replayingRoute, setReplayingRoute] = useState(false);
  const [routeRounds, setRouteRounds] = useState(loadRouteRounds);
  const [stickerAlbum, setStickerAlbum] = useState(loadStickerAlbum);
  const [latestReward, setLatestReward] = useState(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [bosqueOpen, setBosqueOpen] = useState(false);
  const [bosqueProgress, setBosqueProgress] = useState(loadBosqueProgress);
  const bosqueDialogRef = useRef(null);
  const [arcadeProgress, setArcadeProgress] = useState(loadArcadeProgress);
  const [memoriaTheme, setMemoriaTheme] = useState(null);
  const memoriaDialogRef = useRef(null);
  const [catchTheme, setCatchTheme] = useState(null);
  const catchDialogRef = useRef(null);
  const arcadePreviousFocusRef = useRef(null);
  const [arcadeFilter, setArcadeFilter] = useState("todos");
  const albumDialogRef = useRef(null);
  const [routeComplete, setRouteComplete] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState(null);
  const [celebrationBusy, setCelebrationBusy] = useState(false);

  const audioRef = useRef(null);
  const feedbackAudioRef = useRef(null);
  const praiseAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const feedbackNodesRef = useRef([]);
  const playbackRunRef = useRef(0);
  const feedbackSoundRunRef = useRef(0);
  const feedbackTimerRef = useRef(null);
  const feedbackRunRef = useRef(0);
  const feedbackSoundCompletionRef = useRef(null);
  const celebrationRunRef = useRef(0);
  const celebrationFailsafeRef = useRef(null);
  const focusDialogRef = useRef(null);
  const focusCloseRef = useRef(null);
  const focusTitleRef = useRef(null);
  const routeSuccessRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const answerLockRef = useRef(false);
  const previousFocusRef = useRef(null);

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
  const currentRound = getRoundValue(
    routeRounds,
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
        round: currentRound,
      }),
    [currentGameIndex, currentRound, selectedAge, selectedArea, selectedCategory],
  );
  const interactionMeta = getNidoInteractionMeta(challenge);
  const interactionType = getNidoInteractionType(challenge);
  const answerIsCorrect = selectedAnswer === challenge.answerId;
  const pathCurrentId = useMemo(() => {
    for (const areaItem of NIDO_CURRICULUM) {
      for (const categoryItem of areaItem.categories) {
        if (
          getProgressValue(
            progress,
            selectedAge,
            areaItem.id,
            categoryItem.id,
          ) < NIDO_CURRICULUM_GAME_COUNT
        ) {
          return `${areaItem.id}:${categoryItem.id}`;
        }
      }
    }
    return null;
  }, [progress, selectedAge]);
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

  useEffect(() => {
    const preloaders = [...new Set(Object.values(feedbackTracks))]
      .filter(Boolean)
      .map((src) => {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = src;
        audio.load();
        return audio;
      });
    return () => {
      preloaders.forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
      });
    };
  }, [feedbackTracks]);

  useEffect(
    () => () => {
      playbackRunRef.current += 1;
      feedbackSoundRunRef.current += 1;
      celebrationRunRef.current += 1;
      window.clearTimeout(autoAdvanceTimerRef.current);
      window.clearTimeout(celebrationFailsafeRef.current);
      feedbackSoundCompletionRef.current?.resolve(false);
      feedbackSoundCompletionRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
      if (feedbackAudioRef.current) {
        feedbackAudioRef.current.pause();
        feedbackAudioRef.current.removeAttribute("src");
      }
      if (praiseAudioRef.current) {
        praiseAudioRef.current.pause();
        praiseAudioRef.current.removeAttribute("src");
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

  const showFeedbackEffect = (type, celebration = null) => {
    window.clearTimeout(feedbackTimerRef.current);
    feedbackRunRef.current += 1;
    setFeedbackEffect({
      type,
      celebration,
      runId: feedbackRunRef.current,
    });
    if (type === "success") {
      feedbackTimerRef.current = null;
      return;
    }
    feedbackTimerRef.current = window.setTimeout(
      () => {
        setFeedbackEffect(null);
        feedbackTimerRef.current = null;
      },
      1050,
    );
  };

  // Corta el elogio grabado a mitad: se llama al cancelar la fiesta (avanzar,
  // repetir la consigna o cambiar de juego) para que la maestra no se solape
  // consigo misma en el reto siguiente.
  const stopCelebrationPraise = () => {
    const audio = praiseAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.onerror = null;
  };

  const stopFeedbackSound = () => {
    feedbackSoundCompletionRef.current?.resolve(false);
    feedbackSoundCompletionRef.current = null;
    feedbackSoundRunRef.current += 1;
    if (feedbackAudioRef.current) {
      feedbackAudioRef.current.pause();
      feedbackAudioRef.current.currentTime = 0;
      feedbackAudioRef.current.onended = null;
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
    if (feedbackAudioRef.current) feedbackAudioRef.current.onended = null;
  };

  const playFeedbackTone = (type, runId) => {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return 0;

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
    return type === "success" ? 650 : 520;
  };

  // La promesa se resuelve cuando la fanfarria termina de sonar de verdad:
  // fin del mp3, tono sintetizado o silencio total. La celebración hablada
  // espera esa señal para no pisar al «¡Yupi!» grabado.
  const playFeedbackSound = (type) => {
    stopFeedbackSound();
    const runId = feedbackSoundRunRef.current;
    return new Promise((resolve) => {
      let settled = false;
      let fallbackStarted = false;
      const settle = (completed) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        if (feedbackSoundCompletionRef.current?.runId === runId) {
          feedbackSoundCompletionRef.current = null;
        }
        resolve(completed);
      };
      const watchdog = window.setTimeout(
        () => settle(true),
        type === "success" ? 4000 : 2500,
      );
      feedbackSoundCompletionRef.current = { runId, resolve: settle };

      const fallbackOnce = () => {
        if (
          fallbackStarted ||
          feedbackSoundRunRef.current !== runId ||
          settled
        ) {
          return;
        }
        fallbackStarted = true;
        const duration = playFeedbackTone(type, runId);
        window.setTimeout(
          () => settle(true),
          Math.max(duration + 120, 420),
        );
      };

      const feedbackAudio = feedbackAudioRef.current;
      if (!feedbackAudio) {
        fallbackOnce();
        return;
      }

      feedbackAudio.src =
        feedbackTracks[type] ?? DEFAULT_FEEDBACK_TRACKS[type];
      feedbackAudio.currentTime = 0;
      feedbackAudio.volume = type === "success" ? 0.68 : 0.58;
      feedbackAudio.onended = () => settle(true);
      feedbackAudio.onerror = fallbackOnce;
      void feedbackAudio.play().catch(fallbackOnce);
    });
  };

  const findPreferredSpanishVoice = () => {
    const preferredVoiceNames = [
      "paulina",
      "monica",
      "luciana",
      "elvira",
      "sabina",
      "soledad",
      "paloma",
      "google español",
    ];
    const spanishVoices = window.speechSynthesis
      ?.getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith("es"));
    const preferredVoice = spanishVoices?.find((voice) => {
      const normalizedName = voice.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return preferredVoiceNames.some((name) =>
        normalizedName.includes(name),
      );
    });
    return preferredVoice ?? spanishVoices?.[0] ?? null;
  };

  const waitForPreferredSpanishVoice = () => {
    const currentVoice = findPreferredSpanishVoice();
    const synthesis = window.speechSynthesis;
    if (currentVoice || !synthesis) return Promise.resolve(currentVoice);

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        synthesis.removeEventListener?.("voiceschanged", finish);
        resolve(findPreferredSpanishVoice());
      };
      const timeout = window.setTimeout(finish, 900);
      synthesis.addEventListener?.("voiceschanged", finish, { once: true });
    });
  };

  const speakWithBrowserFallback = async (
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

    const preferredVoice = await waitForPreferredSpanishVoice();
    if (playbackRunRef.current !== runId) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.voice = preferredVoice;
    utterance.lang = preferredVoice?.lang ?? "es-PE";
    utterance.rate =
      { "2-3": 0.87, "4-5": 0.93, 6: 0.99 }[targetChallenge.ageId] ??
      0.93;
    // Tono cálido con variación leve por reto: al encadenar veinte consignas,
    // una tesitura idéntica suena robótica y los niños desconectan.
    utterance.pitch = 1.12 + ((targetChallenge.gameIndex ?? 0) % 3) * 0.03;
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

  const speakCelebrationPraise = async (
    celebration,
    targetChallenge,
    celebrationRunId,
  ) => {
    // Primero la voz de estudio: el festejo grabado tiene la misma maestra que
    // la consigna, así que la fiesta no rompe la ilusión con una voz robótica.
    const praiseSrc = audioTracks[celebrationAudioKey(celebration.id)];
    if (praiseSrc && praiseAudioRef.current) {
      const played = await new Promise((resolve) => {
        const audio = praiseAudioRef.current;
        let settled = false;
        const finish = (value) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(watchdog);
          audio.onended = null;
          audio.onerror = null;
          resolve(value);
        };
        const watchdog = window.setTimeout(
          () => finish(true),
          CELEBRATION_PRAISE_CAP_MS,
        );
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        audio.src = praiseSrc;
        audio.currentTime = 0;
        audio.play().catch(() => finish(false));
      });
      if (celebrationRunRef.current !== celebrationRunId) return "cancelled";
      if (played) return "ended";
    }

    if (
      !("speechSynthesis" in window) ||
      typeof window.SpeechSynthesisUtterance !== "function"
    ) {
      return "unavailable";
    }

    const preferredVoice = await waitForPreferredSpanishVoice();
    if (celebrationRunRef.current !== celebrationRunId) return "cancelled";
    return new Promise((resolve) => {
      const utterance = new window.SpeechSynthesisUtterance(
        celebration.spokenText,
      );
      const voiceProfile = getCelebrationVoiceProfile(
        targetChallenge.ageId,
        celebration,
      );
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice?.lang ?? "es-PE";
      utterance.rate = voiceProfile.rate;
      utterance.pitch = voiceProfile.pitch;
      utterance.volume = 0.96;

      let settled = false;
      const estimatedDuration = Math.min(
        7500,
        Math.max(
          2600,
          celebration.spokenText.trim().split(/\s+/).length * 520,
        ),
      );
      const finish = (status) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        resolve(status);
      };
      const watchdog = window.setTimeout(
        () => finish("watchdog"),
        estimatedDuration,
      );
      utterance.onend = () => finish("ended");
      utterance.onerror = () => finish("error");

      if (celebrationRunRef.current !== celebrationRunId) {
        finish("cancelled");
        return;
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
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
        void speakWithBrowserFallback(text, runId, targetChallenge);
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

  const clearAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = null;
  };

  useEffect(() => {
    if (!albumOpen) return undefined;
    const dialog = albumDialogRef.current;
    if (dialog && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAlbumOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (dialog?.open) dialog.close();
    };
  }, [albumOpen]);

  useEffect(() => {
    if (!bosqueOpen) return undefined;
    const dialog = bosqueDialogRef.current;
    const previousFocus = arcadePreviousFocusRef.current;
    if (dialog && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      (dialog?.querySelector("button:not(:disabled)") ?? dialog)?.focus?.();
    }, 80);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      window.requestAnimationFrame(() => previousFocus?.focus?.());
    };
  }, [bosqueOpen]);

  useEffect(() => {
    if (!memoriaTheme) return undefined;
    const dialog = memoriaDialogRef.current;
    const previousFocus = arcadePreviousFocusRef.current;
    if (dialog && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      (dialog?.querySelector("button:not(:disabled)") ?? dialog)?.focus?.();
    }, 80);
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMemoriaTheme(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      window.requestAnimationFrame(() => previousFocus?.focus?.());
    };
  }, [memoriaTheme]);

  useEffect(() => {
    if (!catchTheme) return undefined;
    const dialog = catchDialogRef.current;
    const previousFocus = arcadePreviousFocusRef.current;
    if (dialog && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      (dialog?.querySelector("button:not(:disabled)") ?? dialog)?.focus?.();
    }, 80);
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setCatchTheme(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      window.requestAnimationFrame(() => previousFocus?.focus?.());
    };
  }, [catchTheme]);

  const bosqueRounds = Number.isInteger(bosqueProgress?.[selectedAge])
    ? bosqueProgress[selectedAge]
    : 0;

  const handleBosqueRound = (roundNumber) => {
    setBosqueProgress((current) => {
      const best = Math.max(
        Number.isInteger(current?.[selectedAge]) ? current[selectedAge] : 0,
        roundNumber,
      );
      const next = { ...current, [selectedAge]: best };
      try {
        window.localStorage.setItem(BOSQUE_KEY, JSON.stringify(next));
      } catch {
        // El avance sigue vivo en memoria durante la visita.
      }
      return next;
    });
  };

  const handleBosqueComplete = () => {
    const reward = pickRewardSticker(
      stickerAlbum,
      `bosque|${selectedAge}|${bosqueRounds}`,
    );
    if (reward.isNew) {
      setStickerAlbum((current) => {
        const next = { ...current, [reward.name]: true };
        try {
          window.localStorage.setItem(ALBUM_KEY, JSON.stringify(next));
        } catch {
          // Sin persistencia el premio sigue en pantalla.
        }
        return next;
      });
    }
    onStatus(
      `¡Misión del bosque completada! Ganaste el sticker ${reward.label}.`,
    );
  };

  const handleArcadeGameRound = (gameId, themeId) => (roundNumber) => {
    setArcadeProgress((current) => {
      const currentBest = getArcadeRounds(current, gameId, themeId, selectedAge);
      const next = {
        ...current,
        [gameId]: {
          ...current[gameId],
          [themeId]: {
            ...current[gameId]?.[themeId],
            [selectedAge]: Math.max(currentBest, roundNumber),
          },
        },
      };
      try {
        window.localStorage.setItem(ARCADE_KEY, JSON.stringify(next));
      } catch {
        // El avance sigue vivo en memoria durante la visita.
      }
      return next;
    });
  };

  const handleArcadeGameComplete = (gameId, themeId, missionLabel) => () => {
    const rounds = getArcadeRounds(arcadeProgress, gameId, themeId, selectedAge);
    const reward = pickRewardSticker(stickerAlbum, `${gameId}|${themeId}|${selectedAge}|${rounds}`);
    if (reward.isNew) {
      setStickerAlbum((current) => {
        const next = { ...current, [reward.name]: true };
        try {
          window.localStorage.setItem(ALBUM_KEY, JSON.stringify(next));
        } catch {
          // Sin persistencia el premio sigue en pantalla.
        }
        return next;
      });
    }
    onStatus(`¡${missionLabel} completado! Ganaste el sticker ${reward.label}.`);
  };

  // Tarjetas de la Sala de juegos: los 529 juegos del currículo (29 escritos a
  // mano + 500 generados por la matriz de mecánicas × packs) + Misión del
  // Bosque + 5 mazos de Memoria + 5 mundos de Atrapa y Cuenta.
  // Cada tarjeta abre directamente su juego; no hay pantallas intermedias.
  const routeTiles = useMemo(
    () =>
      NIDO_CURRICULUM.flatMap((areaItem) => {
        const style = AREA_TILE_STYLE[areaItem.id] ?? AREA_TILE_STYLE.logica;
        return areaItem.categories.map((categoryItem) => {
          const done = getProgressValue(
            progress,
            selectedAge,
            areaItem.id,
            categoryItem.id,
          );
          const complete = done >= NIDO_CURRICULUM_GAME_COUNT;
          return {
            // Hay id de subcategoría repetidos entre áreas ("colores" está en
            // Lógica y en Inglés): el área tiene que formar parte de la clave.
            id: `ruta-${areaItem.id}-${categoryItem.id}`,
            title: categoryItem.name,
            tagline: categoryItem.description,
            category: areaItem.id,
            accent: style.accent,
            accentSoft: style.accentSoft,
            progressLabel: complete
              ? "Completado"
              : `Reto ${done + 1}/${NIDO_CURRICULUM_GAME_COUNT}`,
            icon: (
              <NidoGlyph
                name={categoryItem.iconName}
                size={40}
                weight="duotone"
              />
            ),
            // startCategory necesita el evento: guarda el botón pulsado para
            // devolverle el foco al cerrar el juego.
            onOpen: (event) =>
              startCategory(categoryItem.id, event, areaItem.id),
          };
        });
      }),
    // routeRounds entra en las dependencias porque startCategory lo lee para
    // calcular la ronda de rejugado; sin él las tarjetas guardarían un valor viejo.
    [progress, routeRounds, selectedAge],
  );

  const arcadeTiles = useMemo(() => {

    const bosqueTile = {
      id: "bosque",
      title: "Misión del Bosque",
      tagline: "Corre, salta y recolecta contando.",
      category: "aventura",
      accent: "#46b982",
      accentSoft: "#e2f6ec",
      badge: "¡Nuevo!",
      progressLabel:
        bosqueRounds >= 20 ? "Completado" : `Ronda ${Math.min(bosqueRounds + 1, 20)}/20`,
      icon: <NidoMascot pose="hola" size={48} />,
      onOpen: (event) => {
        arcadePreviousFocusRef.current = event?.currentTarget;
        setBosqueOpen(true);
      },
    };

    const memoriaTiles = MEMORY_THEMES.map((theme) => {
      const rounds = getArcadeRounds(arcadeProgress, "memoria", theme.id, selectedAge);
      const Icon = STICKERS[theme.stickers[0]];
      return {
        id: `memoria-${theme.id}`,
        title: theme.name,
        tagline: theme.tagline,
        category: "memoria",
        accent: theme.accent,
        accentSoft: theme.accentSoft,
        progressLabel: rounds >= 20 ? "Completado" : `Ronda ${Math.min(rounds + 1, 20)}/20`,
        icon: Icon ? <Icon size={44} /> : null,
        onOpen: (event) => {
          arcadePreviousFocusRef.current = event?.currentTarget;
          setMemoriaTheme(theme.id);
        },
      };
    });

    const catchTiles = CATCH_THEMES.map((theme) => {
      const rounds = getArcadeRounds(arcadeProgress, "atrapa", theme.id, selectedAge);
      const Icon = STICKERS[theme.target[0]];
      return {
        id: `atrapa-${theme.id}`,
        title: theme.name,
        tagline: theme.tagline,
        category: "atrapa",
        accent: theme.accent,
        accentSoft: theme.accentSoft,
        progressLabel: rounds >= 20 ? "Completado" : `Ronda ${Math.min(rounds + 1, 20)}/20`,
        icon: Icon ? <Icon size={44} /> : null,
        onOpen: (event) => {
          arcadePreviousFocusRef.current = event?.currentTarget;
          setCatchTheme(theme.id);
        },
      };
    });

    return [bosqueTile, ...memoriaTiles, ...catchTiles, ...routeTiles];
  }, [arcadeProgress, bosqueRounds, routeTiles, selectedAge]);

  // Fila de tarjetas por materia: retos completados sobre el total del área.
  const areaOverview = useMemo(
    () =>
      NIDO_CURRICULUM.map((areaItem) => {
        const style = AREA_TILE_STYLE[areaItem.id] ?? AREA_TILE_STYLE.logica;
        const total = areaItem.categories.length * NIDO_CURRICULUM_GAME_COUNT;
        const done = areaItem.categories.reduce(
          (sum, categoryItem) =>
            sum +
            Math.min(
              NIDO_CURRICULUM_GAME_COUNT,
              getProgressValue(progress, selectedAge, areaItem.id, categoryItem.id),
            ),
          0,
        );
        return {
          id: areaItem.id,
          name: areaItem.name,
          iconName: areaItem.iconName,
          routes: areaItem.categories.length,
          accent: style.accent,
          accentSoft: style.accentSoft,
          done,
          total,
          percent: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      }),
    [progress, selectedAge],
  );

  const resetActivity = () => {
    clearAutoAdvance();
    stopCelebrationPraise();
    celebrationRunRef.current += 1;
    window.clearTimeout(celebrationFailsafeRef.current);
    celebrationFailsafeRef.current = null;
    answerLockRef.current = false;
    setCelebrationBusy(false);
    setSelectedAnswer("");
    setIncorrectAnswers([]);
    setRouteStats(createRouteStats());
    setReplayingRoute(false);
    setRouteComplete(false);
    clearFeedbackEffect();
    stopFeedbackSound();
    stopInstruction();
  };

  const closeFocusedGame = ({ announce = true } = {}) => {
    resetActivity();
    setFocusMode(false);
    if (announce) {
      onStatus("Juego cerrado. Regresaste a la sala de juegos.");
    }
  };

  useEffect(() => {
    if (!focusMode || !focusDialogRef.current) return undefined;
    const dialog = focusDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
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

  const startCategory = (categoryId, event, areaId = selectedArea) => {
    const targetArea = findArea(areaId);
    const nextCategory = targetArea?.categories.find(
      (item) => item.id === categoryId,
    );
    if (!nextCategory) return;

    previousFocusRef.current = event?.currentTarget ?? document.activeElement;
    const categoryProgress = getProgressValue(
      progress,
      selectedAge,
      areaId,
      categoryId,
    );
    const isReplay = categoryProgress >= NIDO_CURRICULUM_GAME_COUNT;
    const startingGameIndex = isReplay
      ? 0
      : Math.min(categoryProgress, NIDO_CURRICULUM_GAME_COUNT - 1);

    // Cada rejugado abre una ronda nueva: los 20 retos cambian de combinación.
    let startingRound = getRoundValue(
      routeRounds,
      selectedAge,
      areaId,
      categoryId,
    );
    if (isReplay) {
      startingRound += 1;
      setRouteRounds((current) => {
        const next = {
          ...current,
          [selectedAge]: {
            ...current[selectedAge],
            [areaId]: {
              ...current[selectedAge]?.[areaId],
              [categoryId]: startingRound,
            },
          },
        };
        try {
          window.localStorage.setItem(ROUNDS_KEY, JSON.stringify(next));
        } catch {
          // La ronda seguirá activa durante esta visita aunque no se persista.
        }
        return next;
      });
    }

    const startingChallenge = buildCurriculumChallenge({
      areaId,
      categoryId,
      ageId: selectedAge,
      gameIndex: startingGameIndex,
      round: startingRound,
    });

    setSelectedArea(areaId);
    setSelectedCategory(categoryId);
    setCurrentGameIndex(startingGameIndex);
    setSelectedAnswer("");
    setIncorrectAnswers([]);
    setRouteStats(createRouteStats(startingGameIndex));
    setReplayingRoute(isReplay);
    setRouteComplete(false);
    setLatestReward(null);
    stopCelebrationPraise();
    celebrationRunRef.current += 1;
    window.clearTimeout(celebrationFailsafeRef.current);
    celebrationFailsafeRef.current = null;
    answerLockRef.current = false;
    setCelebrationBusy(false);
    clearFeedbackEffect();
    stopFeedbackSound();
    setFocusMode(true);

    onStatus(
      isReplay
        ? `${nextCategory.name}, ronda ${startingRound + 1} con 20 retos nuevos.`
        : `${nextCategory.name}, reto ${startingGameIndex + 1} de 20, iniciado con narración automática.`,
    );
    void playInstruction(startingChallenge);
  };

  // La siguiente aventura encadena el juego sin pausas: la subcategoría
  // que sigue en el área o, al terminarla, la primera del área siguiente.
  const nextAdventure = useMemo(() => {
    const categoryIndex = area.categories.findIndex(
      (item) => item.id === selectedCategory,
    );
    if (categoryIndex < area.categories.length - 1) {
      return {
        areaId: selectedArea,
        category: area.categories[categoryIndex + 1],
        areaName: area.name,
      };
    }
    const areaIndex = NIDO_CURRICULUM.findIndex(
      (item) => item.id === selectedArea,
    );
    const followingArea =
      NIDO_CURRICULUM[(areaIndex + 1) % NIDO_CURRICULUM.length];
    return {
      areaId: followingArea.id,
      category: followingArea.categories[0],
      areaName: followingArea.name,
    };
  }, [area, selectedArea, selectedCategory]);

  const finishSuccessCelebration = (celebrationRunId) => {
    if (celebrationRunRef.current !== celebrationRunId) return;
    celebrationRunRef.current += 1;
    window.clearTimeout(celebrationFailsafeRef.current);
    celebrationFailsafeRef.current = null;
    setCelebrationBusy(false);
    clearFeedbackEffect();
    onStatus("Celebración terminada. Preparando el siguiente reto.");
    clearAutoAdvance();
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      handleNext();
    }, 120);
  };

  const runSuccessCelebration = async (
    celebration,
    targetChallenge = challenge,
  ) => {
    const celebrationRunId = celebrationRunRef.current + 1;
    celebrationRunRef.current = celebrationRunId;
    setCelebrationBusy(true);
    window.clearTimeout(celebrationFailsafeRef.current);
    celebrationFailsafeRef.current = window.setTimeout(
      () => finishSuccessCelebration(celebrationRunId),
      CELEBRATION_FAILSAFE_MS,
    );

    await playFeedbackSound("success");
    if (celebrationRunRef.current !== celebrationRunId) return;
    await speakCelebrationPraise(
      celebration,
      targetChallenge,
      celebrationRunId,
    );
    if (celebrationRunRef.current !== celebrationRunId) return;
    await new Promise((resolve) =>
      window.setTimeout(resolve, CELEBRATION_DWELL_MS),
    );
    finishSuccessCelebration(celebrationRunId);
  };

  const handleSpeak = () => {
    if (celebrationBusy) return;
    if (speaking) {
      stopInstruction({ announce: true });
      return;
    }
    clearFeedbackEffect();
    stopFeedbackSound();
    // Volver a escuchar la consigna pausa la fiesta: se cancela la frase de
    // celebración y su avance automático para no pisar a la narradora.
    stopCelebrationPraise();
    celebrationRunRef.current += 1;
    clearAutoAdvance();
    void playInstruction();
  };

  const handleAnswer = (answerId) => {
    if (
      answerLockRef.current ||
      answerIsCorrect ||
      incorrectAnswers.includes(answerId)
    ) {
      return;
    }
    stopInstruction();
    setSelectedAnswer(answerId);

    if (answerId === challenge.answerId) {
      answerLockRef.current = true;
      const nextStreak =
        incorrectAnswers.length === 0 ? routeStats.streak + 1 : 0;
      const baseCelebration = pickSuccessCelebration(
        `${challenge.id}|${currentRound}|${routeStats.correct}`,
        nextStreak,
      );
      const celebration =
        nextStreak >= 3
          ? pickStreakCelebration(
              `${challenge.id}|${currentRound}|${routeStats.correct}`,
              nextStreak,
            )
          : incorrectAnswers.length
            ? { ...baseCelebration, ...PERSISTENCE_CELEBRATION }
            : baseCelebration;
      setRouteStats((current) => {
        return {
          ...current,
          correct: current.correct + 1,
          streak: nextStreak,
          bestStreak: Math.max(current.bestStreak, nextStreak),
        };
      });
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
      showFeedbackEffect("success", celebration);
      navigator.vibrate?.([45, 35, 90]);
      onStatus(`${celebration.headline} Respuesta correcta. Celebrando contigo.`);
      clearAutoAdvance();
      void runSuccessCelebration(celebration, challenge);
    } else {
      setIncorrectAnswers((current) => [...current, answerId]);
      setRouteStats((current) => ({
        ...current,
        mistakes: current.mistakes + 1,
        streak: 0,
      }));
      showFeedbackEffect("error");
      void playFeedbackSound("error");
      navigator.vibrate?.([25, 40, 25]);
      onStatus(
        incorrectAnswers.length >= 1
          ? "Tin–ton. Mira con calma: la respuesta correcta brilla despacito para ayudarte."
          : "Tin–ton. Esa no es la respuesta correcta. La pantalla indicó que debes intentarlo otra vez.",
      );
    }
  };

  const handleNext = () => {
    clearAutoAdvance();
    stopCelebrationPraise();
    celebrationRunRef.current += 1;
    window.clearTimeout(celebrationFailsafeRef.current);
    celebrationFailsafeRef.current = null;
    answerLockRef.current = false;
    setCelebrationBusy(false);
    stopFeedbackSound();
    // Un toque manual en «Siguiente reto» interrumpe la frase de celebración
    // pendiente; sus temporizadores quedan invalidados por el runId.
    window.speechSynthesis?.cancel();
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
        round: currentRound,
      });
      setCurrentGameIndex(nextGameIndex);
      setSelectedAnswer("");
      setIncorrectAnswers([]);
      clearFeedbackEffect();
      onStatus(
        `¡Reto completado! Se abrió automáticamente el reto ${nextGameIndex + 1} de 20.`,
      );
      void playInstruction(nextChallenge);
      window.requestAnimationFrame(() => focusTitleRef.current?.focus());
    } else {
      stopInstruction();
      clearFeedbackEffect();
      const reward = pickRewardSticker(
        stickerAlbum,
        `${selectedAge}|${selectedArea}|${selectedCategory}|${currentRound}`,
      );
      setLatestReward(reward);
      if (reward.isNew) {
        setStickerAlbum((current) => {
          const next = { ...current, [reward.name]: true };
          try {
            window.localStorage.setItem(ALBUM_KEY, JSON.stringify(next));
          } catch {
            // El premio se muestra igual aunque no se pueda persistir.
          }
          return next;
        });
      }
      setRouteComplete(true);
      onStatus(
        `¡Subcategoría ${category.name} completada para ${age.label}!`,
      );
      window.requestAnimationFrame(() => routeSuccessRef.current?.focus());
    }
  };

  const visibleCompleted = replayingRoute
    ? currentGameIndex + (answerIsCorrect ? 1 : 0)
    : Math.max(
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
      <audio ref={praiseAudioRef} preload="auto" aria-hidden="true" />

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
              Cada juego contiene 20 retos jugables con narración profesional.
            </p>
          </div>
          <div className="nido-games__heading-actions">
            <button
              className="nido-games__album-button"
              type="button"
              onClick={() => setAlbumOpen(true)}
            >
              <Star size={19} weight="fill" aria-hidden="true" />
              Mi álbum · {Object.keys(stickerAlbum).length}/{REWARD_STICKERS.length}
            </button>
          </div>
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

        <section
          className="nido-games__subjects"
          aria-labelledby="nido-subjects-title"
        >
          <h2 id="nido-subjects-title" className="nido-games__subjects-title">
            Materias del Nido
          </h2>
          <div className="nido-games__subjects-grid">
            {areaOverview.map((areaItem) => (
              <button
                type="button"
                key={areaItem.id}
                style={{
                  "--area-accent": areaItem.accent,
                  "--area-accent-soft": areaItem.accentSoft,
                }}
                className={`nido-games__subject-card ${
                  arcadeFilter === areaItem.id ? "is-selected" : ""
                }`}
                aria-pressed={arcadeFilter === areaItem.id}
                onClick={() =>
                  // Segundo toque sobre la misma materia: vuelve a verlo todo.
                  setArcadeFilter((current) =>
                    current === areaItem.id ? "todos" : areaItem.id,
                  )
                }
                aria-label={`${areaItem.name}: ${areaItem.done} de ${areaItem.total} retos completados. Filtrar la sala de juegos.`}
              >
                <span className="nido-games__subject-card-icon" aria-hidden="true">
                  <NidoGlyph
                    name={areaItem.iconName}
                    size={34}
                    weight="duotone"
                  />
                </span>
                <strong className="nido-games__subject-card-name">
                  {areaItem.name}
                </strong>
                <span className="nido-games__subject-card-count">
                  {areaItem.done}/{areaItem.total} retos
                </span>
                <span
                  className="nido-games__subject-card-bar"
                  aria-hidden="true"
                >
                  <span style={{ width: `${areaItem.percent}%` }} />
                </span>
                <small className="nido-games__subject-card-routes">
                  {areaItem.routes} rutas
                </small>
              </button>
            ))}
          </div>
        </section>

        <ArcadeHub
          tiles={arcadeTiles}
          categories={ARCADE_CATEGORIES}
          activeCategory={arcadeFilter}
          onCategoryChange={setArcadeFilter}
        />
      </div>

      {bosqueOpen && typeof document !== "undefined"
        ? createPortal(
            <dialog
              className="nido-games__bosque-dialog"
              ref={bosqueDialogRef}
              tabIndex={-1}
              aria-label="Misión del Bosque"
              onCancel={(event) => {
                // Escape lo gestiona el juego (pausa); el diálogo no se cierra solo.
                event.preventDefault();
              }}
            >
              <Suspense
                fallback={
                  <div className="nido-games__bosque-loading">
                    Preparando el bosque…
                  </div>
                }
              >
                <BosqueGame
                  ageId={selectedAge}
                  initialRound={bosqueRounds >= 20 ? 0 : bosqueRounds}
                  onRoundComplete={handleBosqueRound}
                  onMissionComplete={handleBosqueComplete}
                  onExit={() => setBosqueOpen(false)}
                />
              </Suspense>
            </dialog>,
            document.body,
          )
        : null}

      {memoriaTheme && typeof document !== "undefined"
        ? createPortal(
            <dialog
              className="nido-games__bosque-dialog"
              ref={memoriaDialogRef}
              tabIndex={-1}
              aria-label="Memoria Mágica"
              onCancel={(event) => event.preventDefault()}
            >
              <Suspense
                fallback={<div className="nido-games__bosque-loading">Preparando la memoria…</div>}
              >
                <MemoriaGame
                  themeId={memoriaTheme}
                  ageId={selectedAge}
                  initialRound={getArcadeRounds(arcadeProgress, "memoria", memoriaTheme, selectedAge) >= 20
                    ? 0
                    : getArcadeRounds(arcadeProgress, "memoria", memoriaTheme, selectedAge)}
                  onRoundComplete={handleArcadeGameRound("memoria", memoriaTheme)}
                  onMissionComplete={handleArcadeGameComplete(
                    "memoria",
                    memoriaTheme,
                    MEMORY_THEMES.find((theme) => theme.id === memoriaTheme)?.name ?? "Memoria",
                  )}
                  onExit={() => setMemoriaTheme(null)}
                />
              </Suspense>
            </dialog>,
            document.body,
          )
        : null}

      {catchTheme && typeof document !== "undefined"
        ? createPortal(
            <dialog
              className="nido-games__bosque-dialog"
              ref={catchDialogRef}
              tabIndex={-1}
              aria-label="Atrapa y Cuenta"
              onCancel={(event) => event.preventDefault()}
            >
              <Suspense
                fallback={<div className="nido-games__bosque-loading">Preparando el juego…</div>}
              >
                <CatchGame
                  themeId={catchTheme}
                  ageId={selectedAge}
                  initialRound={getArcadeRounds(arcadeProgress, "atrapa", catchTheme, selectedAge) >= 20
                    ? 0
                    : getArcadeRounds(arcadeProgress, "atrapa", catchTheme, selectedAge)}
                  onRoundComplete={handleArcadeGameRound("atrapa", catchTheme)}
                  onMissionComplete={handleArcadeGameComplete(
                    "atrapa",
                    catchTheme,
                    CATCH_THEMES.find((theme) => theme.id === catchTheme)?.name ?? "Atrapa y Cuenta",
                  )}
                  onExit={() => setCatchTheme(null)}
                />
              </Suspense>
            </dialog>,
            document.body,
          )
        : null}

      {albumOpen && typeof document !== "undefined"
        ? createPortal(
            <dialog
              className="nido-games__album-dialog"
              ref={albumDialogRef}
              aria-labelledby="nido-album-title"
              onCancel={(event) => {
                event.preventDefault();
                setAlbumOpen(false);
              }}
            >
              <div className="nido-games__album-shell">
                <header>
                  <div>
                    <span>Tu colección de premios</span>
                    <h2 id="nido-album-title">Mi álbum de stickers</h2>
                    <p>
                      Gana un sticker nuevo cada vez que completes una ruta de
                      20 retos.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar álbum"
                    onClick={() => setAlbumOpen(false)}
                  >
                    <X size={26} weight="bold" aria-hidden="true" />
                  </button>
                </header>
                <ul className="nido-games__album-grid">
                  {REWARD_STICKERS.map((reward) => {
                    const owned = Boolean(stickerAlbum[reward.name]);
                    const RewardArt = STICKERS[reward.name];
                    return (
                      <li
                        className={owned ? "is-owned" : "is-locked"}
                        key={reward.name}
                      >
                        <span
                          className="nido-games__album-art"
                          aria-hidden="true"
                        >
                          {RewardArt ? <RewardArt size={54} /> : null}
                        </span>
                        <small>{owned ? reward.label : "?"}</small>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </dialog>,
            document.body,
          )
        : null}

      {focusMode && typeof document !== "undefined"
        ? createPortal(
            <dialog
              className="nido-games__focus-dialog"
              ref={focusDialogRef}
              aria-modal="true"
              aria-labelledby="nido-focus-title"
              aria-describedby={
                routeComplete ? undefined : "nido-focus-instruction"
              }
              onCancel={(event) => {
                event.preventDefault();
                closeFocusedGame();
              }}
            >
              <div
                className="nido-games__focus-shell"
                data-area={selectedArea}
                data-age={selectedAge}
              >
                <header className="nido-games__focus-header">
                  <button
                    className="nido-games__focus-close"
                    ref={focusCloseRef}
                    type="button"
                    aria-label="Cerrar juego y volver a la sala de juegos"
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
                    {currentRound > 0 ? (
                      <small className="nido-games__focus-round">
                        Ronda {currentRound + 1}
                      </small>
                    ) : null}
                  </div>
                  <button
                    className={`nido-games__focus-audio ${speaking ? "is-speaking" : ""}`}
                    type="button"
                    aria-label={
                      celebrationBusy
                        ? "La celebración está terminando"
                        : speaking
                        ? "Detener narración automática"
                        : "Repetir narración de la consigna"
                    }
                    aria-pressed={speaking}
                    disabled={celebrationBusy}
                    onClick={handleSpeak}
                  >
                    {speaking ? (
                      <StopCircle size={25} weight="fill" aria-hidden="true" />
                    ) : (
                      <SpeakerHigh size={25} weight="fill" aria-hidden="true" />
                    )}
                    <span>
                      {celebrationBusy
                        ? "Celebrando"
                        : speaking
                          ? "Detener"
                          : "Repetir audio"}
                    </span>
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
                          size={15}
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
                  <div
                    className="nido-games__focus-score"
                    aria-label={`${routeStats.correct} aciertos, ${routeStats.mistakes} intentos extra y racha de ${routeStats.streak}`}
                  >
                    <span title="Aciertos">
                      <CheckCircle size={18} weight="fill" aria-hidden="true" />
                      <strong>{routeStats.correct}</strong>
                      <small>Aciertos</small>
                    </span>
                    <span title="Racha sin errores">
                      <Star size={18} weight="fill" aria-hidden="true" />
                      <strong>{routeStats.streak}</strong>
                      <small>Racha</small>
                    </span>
                  </div>
                </div>

                {routeComplete ? (
                  <section
                    className="nido-games__focus-success"
                    aria-labelledby="nido-focus-title"
                  >
                    <div className="nido-games__success-art" aria-hidden="true">
                      <CelebrationBurst className="nido-games__success-burst" />
                      <NidoMascot pose="cheer" size={116} />
                    </div>
                    <span>
                      {replayingRoute
                        ? `Ronda ${currentRound + 1} · 20 retos completados`
                        : "20 retos completados"}
                    </span>
                      <h2 id="nido-focus-title" ref={routeSuccessRef} tabIndex={-1}>
                      ¡Ruta terminada!
                    </h2>
                    <p>
                      Completaste {category.name} de {area.name} para {age.label}.
                    </p>
                    <div className="nido-games__focus-summary">
                      <span>
                        <CheckCircle size={28} weight="fill" aria-hidden="true" />
                        <strong>{routeStats.correct}</strong>
                        <small>Aciertos</small>
                      </span>
                      <span>
                        <XCircle size={28} weight="fill" aria-hidden="true" />
                        <strong>{routeStats.mistakes}</strong>
                        <small>Intentos extra</small>
                      </span>
                      <span>
                        <Star size={28} weight="fill" aria-hidden="true" />
                        <strong>{routeStats.bestStreak}</strong>
                        <small>Mejor racha</small>
                      </span>
                    </div>
                    {latestReward && STICKERS[latestReward.name] ? (
                      <div className="nido-games__reward" role="status">
                        <span
                          className="nido-games__reward-art"
                          aria-hidden="true"
                        >
                          {(() => {
                            const RewardArt = STICKERS[latestReward.name];
                            return <RewardArt size={72} />;
                          })()}
                        </span>
                        <span className="nido-games__reward-copy">
                          <small>
                            {latestReward.isNew
                              ? "¡Nuevo sticker para tu álbum!"
                              : "¡Sticker de colección!"}
                          </small>
                          <strong>{latestReward.label}</strong>
                        </span>
                      </div>
                    ) : null}
                    <div className="nido-games__focus-success-actions">
                      <button
                        className="nido-games__focus-success-next"
                        type="button"
                        onClick={(event) =>
                          startCategory(
                            nextAdventure.category.id,
                            event,
                            nextAdventure.areaId,
                          )
                        }
                      >
                        <span className="nido-games__focus-success-next-icon" aria-hidden="true">
                          <NidoGlyph
                            name={nextAdventure.category.iconName}
                            size={30}
                            weight="duotone"
                          />
                        </span>
                        <span>
                          <small>¡Siguiente aventura!</small>
                          <strong>{nextAdventure.category.name}</strong>
                        </span>
                        <ArrowRight size={22} weight="bold" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => startCategory(selectedCategory, event)}
                      >
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
                    key={challenge.id}
                    data-age={challenge.ageId}
                    data-game-id={challenge.id}
                    data-mechanic={interactionType}
                  >
                    <div className="nido-games__focus-title">
                      <span>
                        {category.name} · reto {currentGameIndex + 1}
                      </span>
                      <h2 id="nido-focus-title" ref={focusTitleRef} tabIndex={-1}>
                        {challenge.question}
                      </h2>
                      <p id="nido-focus-instruction">
                        <strong>{interactionMeta.label}:</strong>{" "}
                        {interactionMeta.shortInstruction}
                      </p>
                    </div>

                    <div className="nido-games__focus-activity">
                      <ChallengeActivity
                        challenge={challenge}
                        selectedAnswer={selectedAnswer}
                        incorrectAnswers={incorrectAnswers}
                        onAnswer={handleAnswer}
                        locked={answerIsCorrect}
                      />
                    </div>

                    {feedbackEffect ? (
                      <div
                        className={[
                          "nido-games__focus-feedback",
                          `is-${feedbackEffect.type}`,
                          feedbackEffect.celebration?.burst
                            ? `is-${feedbackEffect.celebration.burst}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={feedbackEffect.runId}
                        aria-hidden="true"
                      >
                        {feedbackEffect.type === "success" ? (
                          <div className="nido-games__bubbles">
                            {BUBBLE_PIECES.map((piece, index) => (
                              <i
                                style={{
                                  width: piece.size,
                                  height: piece.size,
                                  background: piece.color,
                                  animationDelay: piece.delay,
                                  animationDuration: piece.duration,
                                  "--bubble-dx": piece.dx,
                                  "--bubble-dy": piece.dy,
                                }}
                                data-shape={piece.shape}
                                key={index}
                              />
                            ))}
                          </div>
                        ) : null}
                        <div className="nido-games__focus-feedback-card">
                          {feedbackEffect.type === "success" ? (
                            <>
                              <div
                                className="nido-games__celebration-orbit"
                                aria-hidden="true"
                              >
                                {Array.from({ length: 8 }, (_, index) => (
                                  <i key={index} />
                                ))}
                              </div>
                              <div className="nido-games__focus-stars">
                                <Star size={42} weight="fill" />
                                <Star size={58} weight="fill" />
                                <Star size={42} weight="fill" />
                              </div>
                              <NidoMascot pose="cheer" size={90} />
                              <strong>
                                {feedbackEffect.celebration?.headline ??
                                  "¡Lo lograste!"}
                              </strong>
                              <small>
                                {feedbackEffect.celebration?.caption ??
                                  "¡Tirirí! Respuesta correcta"}
                              </small>
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
                          ? "Elige una respuesta. Las opciones incorrectas quedarán descartadas."
                          : answerIsCorrect
                            ? celebrationBusy
                              ? `${feedbackEffect?.celebration?.headline ?? "¡Lo lograste!"} Esperamos a que termine la celebración.`
                              : "¡Celebración completada! Abriendo el siguiente reto."
                            : `Esa opción no es correcta. ${incorrectAnswers.length === 1 ? "Prueba con otra." : "Sigue observando: ya descartaste varias opciones."}`}
                      </p>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!answerIsCorrect || celebrationBusy}
                      >
                        {celebrationBusy
                          ? "Celebrando…"
                          : currentGameIndex <
                              NIDO_CURRICULUM_GAME_COUNT - 1
                            ? "Siguiente reto"
                            : "Finalizar ruta"}
                        <ArrowRight size={22} weight="bold" aria-hidden="true" />
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
