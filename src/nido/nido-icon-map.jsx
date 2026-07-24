import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { ArrowSquareOut } from "@phosphor-icons/react/ArrowSquareOut";
import { ArrowUp } from "@phosphor-icons/react/ArrowUp";
import { Baby } from "@phosphor-icons/react/Baby";
import { BookOpen } from "@phosphor-icons/react/BookOpen";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Clock } from "@phosphor-icons/react/Clock";
import { GraduationCap } from "@phosphor-icons/react/GraduationCap";
import { LockKey } from "@phosphor-icons/react/LockKey";
import { Play } from "@phosphor-icons/react/Play";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { SpeakerHigh } from "@phosphor-icons/react/SpeakerHigh";
import { Star } from "@phosphor-icons/react/Star";
import { X } from "@phosphor-icons/react/X";

import { UI_GLYPHS } from "./nido-ui-glyphs.jsx";
import { STICKERS } from "./stickers/sticker-registry.jsx";

// Presupuesto de peso: el chunk de Nido solo reutiliza los iconos de Phosphor
// que la página principal ya carga (módulos compartidos, costo cero) y cubre
// el resto con glifos propios (nido-ui-glyphs) y stickers ilustrados.
const SHARED_PHOSPHOR = Object.freeze({
  ArrowRight,
  ArrowSquareOut,
  ArrowUp,
  Baby,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  ShieldCheck,
  SpeakerHigh,
  Star,
  X,
  Lock: LockKey,
  Student: GraduationCap,
});

const ICONS = Object.freeze({
  ...UI_GLYPHS,
  MaskHappy: UI_GLYPHS.MaskHappyGlyph,
  ...SHARED_PHOSPHOR,
});

function resolveIcon(name) {
  if (ICONS[name]) return ICONS[name];
  if (name?.startsWith("Smiley")) return UI_GLYPHS.MaskHappyGlyph;
  if (name?.startsWith("Arrow")) return ArrowRight;
  if (name?.startsWith("Sort")) return UI_GLYPHS.SortAscending;
  if (name?.startsWith("Person")) return UI_GLYPHS.Person;
  return UI_GLYPHS.Shapes;
}

// Contenido para niños: prioriza el sticker ilustrado a color; los juegos de
// colores pasan `tint` para pintar la figura, la carita o la máscara.
export function NidoGlyph({ name, weight, color, tint, ...props }) {
  const Sticker = STICKERS[name];
  if (Sticker) return <Sticker tint={tint} {...props} />;
  const Icon = resolveIcon(name);
  return <Icon weight={weight} color={tint ?? color} {...props} />;
}

// Interfaz (botones, insignias): versión monocroma para mantener el chrome
// consistente aunque exista un sticker con el mismo nombre.
export function createNidoIcon(name) {
  const Icon = resolveIcon(name);

  function NidoIcon(props) {
    return <Icon {...props} />;
  }

  NidoIcon.displayName = `Nido${name}`;
  return NidoIcon;
}
