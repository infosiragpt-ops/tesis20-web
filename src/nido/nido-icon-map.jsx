import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { Baby } from "@phosphor-icons/react/Baby";
import { Brain } from "@phosphor-icons/react/Brain";
import { ChatCircleDots } from "@phosphor-icons/react/ChatCircleDots";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { MathOperations } from "@phosphor-icons/react/MathOperations";
import { Play } from "@phosphor-icons/react/Play";
import { PuzzlePiece } from "@phosphor-icons/react/PuzzlePiece";
import { Shapes } from "@phosphor-icons/react/Shapes";
import { Smiley } from "@phosphor-icons/react/Smiley";
import { SpeakerHigh } from "@phosphor-icons/react/SpeakerHigh";
import { Star } from "@phosphor-icons/react/Star";
import { StopCircle } from "@phosphor-icons/react/StopCircle";
import { Student } from "@phosphor-icons/react/Student";
import { Translate } from "@phosphor-icons/react/Translate";
import { Trophy } from "@phosphor-icons/react/Trophy";
import { X } from "@phosphor-icons/react/X";
import { XCircle } from "@phosphor-icons/react/XCircle";

const ICONS = Object.freeze({
  ArrowRight,
  Baby,
  Brain,
  ChatCircleDots,
  CheckCircle,
  MathOperations,
  Play,
  PuzzlePiece,
  Shapes,
  Smiley,
  SmileyMeh: Smiley,
  SmileyNervous: Smiley,
  SmileySad: Smiley,
  SmileyWink: Smiley,
  SmileyXEyes: Smiley,
  SpeakerHigh,
  Star,
  StopCircle,
  Student,
  Translate,
  Trophy,
  X,
  XCircle,
});

const ANIMAL_ICONS = new Set([
  "Bird",
  "Bug",
  "Butterfly",
  "Cat",
  "Cow",
  "Dog",
  "FishSimple",
  "Horse",
  "Rabbit",
]);

const FOOD_ICONS = new Set([
  "Bread",
  "Carrot",
  "Coffee",
  "Flower",
  "ForkKnife",
  "Plant",
]);

const EDUCATION_ICONS = new Set([
  "Backpack",
  "ChalkboardTeacher",
  "GraduationCap",
  "IdentificationCard",
  "Pencil",
]);

function resolveIcon(name) {
  if (ICONS[name]) return ICONS[name];
  if (ANIMAL_ICONS.has(name)) return Shapes;
  if (FOOD_ICONS.has(name)) return Shapes;
  if (EDUCATION_ICONS.has(name)) return Shapes;
  if (name === "Palette") return Shapes;
  if (name === "House" || name === "HouseLine") return Shapes;
  if (
    name === "Person" ||
    name === "PersonSimple" ||
    name === "PersonSimpleRun" ||
    name === "PersonSimpleTaiChi" ||
    name === "UsersThree"
  ) {
    return Smiley;
  }
  if (name?.startsWith("Smiley") || name === "MaskHappy") return Smiley;
  if (name === "Fire") return Star;
  if (
    name?.startsWith("Arrow") ||
    name?.startsWith("Sort") ||
    name === "ChartLineUp"
  ) {
    return ArrowRight;
  }
  if (name === "Detective" || name === "Eye" || name === "EyeClosed") {
    return Shapes;
  }
  if (name === "NumberCircleOne" || name === "PlusCircle") {
    return MathOperations;
  }
  if (name === "SelectionSlash" || name === "Subtract") return XCircle;
  if (name === "Question") return ChatCircleDots;
  return Shapes;
}

export function NidoGlyph({ name, ...props }) {
  const Icon = resolveIcon(name);
  return <Icon {...props} />;
}

export function createNidoIcon(name) {
  function NidoIcon(props) {
    return <NidoGlyph name={name} {...props} />;
  }

  NidoIcon.displayName = `Nido${name}`;
  return NidoIcon;
}
