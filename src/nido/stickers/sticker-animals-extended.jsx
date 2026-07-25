import {
  Cheeks,
  Eyes,
  LINE,
  OUTLINE,
  Smile,
  StickerBase,
} from "./sticker-base.jsx";

function TurtleSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M11 35 L5 31 Q7 39 14 40 Z" fill="#65c78b" {...OUTLINE} />
      <ellipse cx="29" cy="35" rx="20" ry="14" fill="#42b983" {...OUTLINE} />
      <ellipse cx="29" cy="34" rx="14" ry="10" fill="#8dd36f" {...OUTLINE} />
      <path d="M29 24 L23 29 L25 36 L33 36 L35 29 Z" fill="#f4cf62" stroke="#10233f" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M15 30 L23 29 M15 39 L25 36 M43 30 L35 29 M42 40 L33 36" {...LINE} strokeWidth={1.6} />
      <circle cx="50" cy="33" r="9" fill="#65c78b" {...OUTLINE} />
      <path d="M18 45 Q13 51 19 54 Q24 52 25 46 M38 45 Q40 52 46 51 Q48 46 43 42" fill="#65c78b" {...OUTLINE} />
      <circle cx="52" cy="31" r="1.9" fill="#10233f" />
      <circle cx="52.7" cy="30.3" r="0.6" fill="#ffffff" />
      <path d="M51 36 Q54 38 56 35" {...LINE} strokeWidth={1.6} />
      <circle cx="47" cy="36" r="2.1" fill="#ffb3ab" fillOpacity="0.55" />
      <ellipse cx="22" cy="27" rx="4.5" ry="2" fill="#ffffff" fillOpacity="0.38" />
    </StickerBase>
  );
}

function LionSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path
        d="M32 7 Q38 4 42 10 Q49 8 51 15 Q58 17 55 24 Q60 29 55 35 Q58 42 51 45 Q49 53 42 51 Q37 58 32 53 Q26 58 21 51 Q13 53 12 45 Q5 42 9 35 Q3 29 9 24 Q6 17 13 15 Q15 8 22 10 Q26 4 32 7 Z"
        fill="#e08b32"
        {...OUTLINE}
      />
      <path d="M18 23 Q13 13 23 14 L27 22 M46 23 Q51 13 41 14 L37 22" fill="#f2b84b" {...OUTLINE} />
      <circle cx="32" cy="32" r="16" fill="#f6bd55" {...OUTLINE} />
      <ellipse cx="32" cy="38" rx="9" ry="7" fill="#fff0c2" stroke="none" />
      <path d="M29 35 L35 35 L32 39 Z" fill="#9b5b35" />
      <path d="M32 39 L32 41 M27 42 Q32 46 37 42" {...LINE} strokeWidth={1.8} />
      <Eyes y={29} lx={26} rx={38} />
      <Cheeks y={36} lx={21} rx={43} r={2.2} />
      <ellipse cx="25" cy="22" rx="4" ry="2.1" fill="#ffffff" fillOpacity="0.45" />
    </StickerBase>
  );
}

function SheepSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M17 43 L16 54 M45 43 L46 54" {...LINE} strokeWidth={4} />
      <path
        d="M12 37 Q5 32 10 25 Q7 17 16 16 Q18 8 27 12 Q32 5 38 12 Q47 9 49 18 Q57 20 53 28 Q58 35 50 39 Q46 47 38 43 Q31 49 25 43 Q17 47 12 37 Z"
        fill="#fffaf0"
        {...OUTLINE}
      />
      <path d="M18 25 Q11 20 9 27 Q10 34 19 32 M46 25 Q53 20 55 27 Q54 34 45 32" fill="#b9825a" {...OUTLINE} />
      <path d="M21 22 Q32 15 43 22 L41 40 Q32 48 23 40 Z" fill="#c89268" {...OUTLINE} />
      <ellipse cx="32" cy="38" rx="6.5" ry="5" fill="#f1c8a5" stroke="none" />
      <path d="M29 37 L35 37 L32 40 Z" fill="#7a4a35" />
      <Eyes y={29} lx={27} rx={37} r={1.9} />
      <path d="M28 42 Q32 44 36 42" {...LINE} strokeWidth={1.6} />
      <ellipse cx="27" cy="21" rx="4" ry="2" fill="#ffffff" fillOpacity="0.5" />
    </StickerBase>
  );
}

function PandaSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="18" cy="17" r="8" fill="#10233f" {...OUTLINE} />
      <circle cx="46" cy="17" r="8" fill="#10233f" {...OUTLINE} />
      <circle cx="32" cy="32" r="20" fill="#fffdf6" {...OUTLINE} />
      <ellipse cx="24" cy="29" rx="6.3" ry="7.5" fill="#10233f" transform="rotate(24 24 29)" />
      <ellipse cx="40" cy="29" rx="6.3" ry="7.5" fill="#10233f" transform="rotate(-24 40 29)" />
      <circle cx="25" cy="28" r="2" fill="#ffffff" />
      <circle cx="39" cy="28" r="2" fill="#ffffff" />
      <ellipse cx="32" cy="38" rx="4" ry="3" fill="#10233f" />
      <path d="M27 43 Q32 47 37 43" {...LINE} />
      <Cheeks y={38} lx={20} rx={44} r={2.4} />
      <path d="M49 47 Q53 36 56 23 M52 35 L58 31 M54 28 L50 25" stroke="#3e9d63" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="25" cy="18" rx="5" ry="2.3" fill="#ffffff" fillOpacity="0.5" />
    </StickerBase>
  );
}

function MonkeySticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M47 43 Q60 40 55 28 Q52 21 47 26 Q45 31 51 33" fill="none" stroke="#8a5a38" strokeWidth="5" strokeLinecap="round" />
      <circle cx="15" cy="31" r="9" fill="#b87949" {...OUTLINE} />
      <circle cx="49" cy="31" r="9" fill="#b87949" {...OUTLINE} />
      <circle cx="15" cy="31" r="4.5" fill="#f3c79c" stroke="none" />
      <circle cx="49" cy="31" r="4.5" fill="#f3c79c" stroke="none" />
      <circle cx="32" cy="31" r="18" fill="#9b623d" {...OUTLINE} />
      <path d="M21 25 Q22 14 32 17 Q42 14 43 25 Q48 29 44 40 Q39 49 32 49 Q25 49 20 40 Q16 29 21 25 Z" fill="#f3c79c" {...OUTLINE} />
      <ellipse cx="32" cy="39" rx="8.5" ry="6" fill="#ffe0bd" stroke="none" />
      <Eyes y={29} lx={27} rx={37} r={1.9} />
      <path d="M29 39 L35 39 M28 43 Q32 46 36 43" {...LINE} strokeWidth={1.6} />
      <Cheeks y={37} lx={22} rx={42} r={2} />
      <path d="M26 18 Q32 12 38 18" stroke="#6b4226" strokeWidth="3" fill="none" strokeLinecap="round" />
    </StickerBase>
  );
}

function SquirrelSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M44 42 Q61 44 58 27 Q57 15 47 13 Q38 11 41 20 Q52 21 50 31 Q48 36 42 33 Z" fill="#d77c35" {...OUTLINE} />
      <path d="M47 18 Q55 20 53 29 Q52 33 48 34" fill="none" stroke="#f7b65b" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M20 23 L17 11 L27 18 M39 23 L43 11 L34 18" fill="#d77c35" {...OUTLINE} />
      <circle cx="30" cy="32" r="16" fill="#e89143" {...OUTLINE} />
      <path d="M21 36 Q30 29 39 36 Q40 47 30 49 Q20 47 21 36 Z" fill="#ffe0ae" stroke="none" />
      <Eyes y={29} lx={25} rx={36} r={1.9} />
      <path d="M27 34 L32 34 L29.5 37 Z" fill="#6b4226" />
      <path d="M29.5 37 Q31 40 34 38" {...LINE} strokeWidth={1.5} />
      <path d="M35 42 Q41 39 45 44 Q41 48 36 46 Z" fill="#9a5b31" {...OUTLINE} strokeWidth={1.7} />
      <path d="M38 42 L42 46 M40 41 L44 45" stroke="#f6cf74" strokeWidth="1.2" />
      <Cheeks y={36} lx={20} rx={39} r={2} />
    </StickerBase>
  );
}

function FrogSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="21" cy="22" r="9" fill="#64c96f" {...OUTLINE} />
      <circle cx="43" cy="22" r="9" fill="#64c96f" {...OUTLINE} />
      <ellipse cx="32" cy="37" rx="22" ry="17" fill="#72d37d" {...OUTLINE} />
      <circle cx="21" cy="21" r="4.3" fill="#ffffff" />
      <circle cx="43" cy="21" r="4.3" fill="#ffffff" />
      <circle cx="22" cy="22" r="2" fill="#10233f" />
      <circle cx="42" cy="22" r="2" fill="#10233f" />
      <circle cx="23" cy="21.2" r="0.6" fill="#ffffff" />
      <circle cx="43" cy="21.2" r="0.6" fill="#ffffff" />
      <path d="M21 38 Q32 49 43 38" fill="#ff7f79" {...OUTLINE} />
      <path d="M23 39 Q32 44 41 39" fill="#10233f" stroke="none" />
      <path d="M14 45 Q6 48 10 53 Q16 55 21 49 M50 45 Q58 48 54 53 Q48 55 43 49" fill="#64c96f" {...OUTLINE} />
      <Cheeks y={35} lx={16} rx={48} r={2.5} />
      <ellipse cx="29" cy="29" rx="5" ry="2.2" fill="#ffffff" fillOpacity="0.35" />
    </StickerBase>
  );
}

function PolarBearSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="18" cy="20" r="9" fill="#f4fbff" {...OUTLINE} />
      <circle cx="46" cy="20" r="9" fill="#f4fbff" {...OUTLINE} />
      <circle cx="18" cy="20" r="4.5" fill="#ccebf4" stroke="none" />
      <circle cx="46" cy="20" r="4.5" fill="#ccebf4" stroke="none" />
      <circle cx="32" cy="34" r="20" fill="#f8fdff" {...OUTLINE} />
      <ellipse cx="32" cy="40" rx="9.5" ry="7.5" fill="#dff3f7" stroke="none" />
      <ellipse cx="32" cy="36" rx="3.3" ry="2.7" fill="#10233f" />
      <path d="M32 39 L32 41 M28 43 Q32 46 36 43" {...LINE} strokeWidth={1.7} />
      <Eyes y={30} lx={25} rx={39} />
      <path d="M16 48 Q32 55 48 48" fill="none" stroke="#4b8ff7" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 50 L45 57 L49 51" fill="#4b8ff7" {...OUTLINE} strokeWidth={1.7} />
      <Cheeks y={37} lx={21} rx={43} r={2.1} />
      <ellipse cx="25" cy="21" rx="5" ry="2.3" fill="#ffffff" fillOpacity="0.8" />
    </StickerBase>
  );
}

function UnicornSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 18 L27 3 L37 3 Z" fill="#ffd75e" {...OUTLINE} />
      <path d="M29 9 L35 9 M30 13 L34 13" stroke="#f38aa8" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19 23 L14 11 L27 17 M45 23 L50 11 L37 17" fill="#f8f6ff" {...OUTLINE} />
      <circle cx="32" cy="34" r="17" fill="#fbf9ff" {...OUTLINE} />
      <path d="M20 25 Q18 15 26 15 Q29 9 34 15 Q41 10 45 20 Q40 19 38 27 Z" fill="#9873e7" {...OUTLINE} />
      <path d="M20 21 Q24 17 27 20 M29 17 Q33 13 36 17 M38 17 Q42 14 44 19" fill="none" stroke="#ff7fa1" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="32" cy="42" rx="9" ry="6.5" fill="#eee5ff" stroke="none" />
      <ellipse cx="28" cy="42" rx="1.5" ry="2" fill="#9873e7" />
      <ellipse cx="36" cy="42" rx="1.5" ry="2" fill="#9873e7" />
      <Eyes y={32} lx={25} rx={39} r={1.9} />
      <Smile y={46} w={6} curve={2} />
      <Cheeks y={38} lx={21} rx={43} r={2} />
    </StickerBase>
  );
}

function DragonSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M20 23 L12 12 L25 16 M44 23 L52 12 L39 16" fill="#f4cf62" {...OUTLINE} />
      <path d="M15 35 Q4 28 6 20 Q15 21 22 29 M49 35 Q60 28 58 20 Q49 21 42 29" fill="#69b6f1" {...OUTLINE} />
      <path d="M27 17 L32 7 L37 17" fill="#f4cf62" {...OUTLINE} />
      <circle cx="32" cy="34" r="18" fill="#54c58a" {...OUTLINE} />
      <path d="M17 31 L10 35 L18 38 M47 31 L54 35 L46 38" fill="#54c58a" {...OUTLINE} />
      <ellipse cx="32" cy="42" rx="10" ry="7" fill="#9de09f" stroke="none" />
      <ellipse cx="28" cy="40" rx="1.5" ry="2" fill="#10233f" />
      <ellipse cx="36" cy="40" rx="1.5" ry="2" fill="#10233f" />
      <Eyes y={30} lx={25} rx={39} />
      <path d="M27 46 Q32 49 37 46" {...LINE} strokeWidth={1.7} />
      <path d="M44 48 Q51 47 52 42 Q57 47 53 52 Q48 56 44 48 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={1.7} />
      <path d="M48 49 Q51 48 52 46" stroke="#ffc94d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="23" rx="4.5" ry="2" fill="#ffffff" fillOpacity="0.38" />
    </StickerBase>
  );
}

function DuckSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M18 39 Q8 39 8 29 Q14 31 20 29" fill="#f7cf4a" {...OUTLINE} />
      <ellipse cx="32" cy="37" rx="19" ry="15" fill="#f8d85a" {...OUTLINE} />
      <circle cx="36" cy="24" r="14" fill="#ffe36c" {...OUTLINE} />
      <path d="M45 26 Q56 22 59 28 Q54 35 44 31 Z" fill="#f08b35" {...OUTLINE} />
      <path d="M46 28 L56 28" stroke="#c76c2e" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="39" cy="21" r="2.2" fill="#10233f" />
      <circle cx="39.8" cy="20.2" r="0.7" fill="#ffffff" />
      <path d="M26 36 Q17 38 20 45 Q27 44 32 39 Z" fill="#efb93d" {...OUTLINE} />
      <path d="M27 50 L25 56 M39 50 L41 56 M21 56 L28 56 M38 56 L45 56" stroke="#e58231" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="35" cy="27" r="2.2" fill="#ffb3ab" fillOpacity="0.55" />
      <ellipse cx="30" cy="17" rx="4.5" ry="2.1" fill="#ffffff" fillOpacity="0.48" />
    </StickerBase>
  );
}

function WingedLionSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M17 28 Q5 26 3 14 Q16 15 24 24 L22 35 Z" fill="#dff3ff" {...OUTLINE} />
      <path d="M47 28 Q59 26 61 14 Q48 15 40 24 L42 35 Z" fill="#dff3ff" {...OUTLINE} />
      <path d="M8 19 L20 27 M56 19 L44 27" {...LINE} stroke="#78bde8" strokeWidth={1.6} />
      <path d="M32 10 Q38 6 42 12 Q50 11 50 19 Q57 24 52 30 Q56 39 47 42 Q44 51 36 48 Q32 55 27 48 Q18 51 16 42 Q7 39 12 30 Q7 24 14 19 Q14 11 22 12 Q26 6 32 10 Z" fill="#e08b32" {...OUTLINE} />
      <circle cx="32" cy="32" r="14.5" fill="#f6bd55" {...OUTLINE} />
      <path d="M21 24 Q17 16 25 17 M43 24 Q47 16 39 17" fill="#f6bd55" {...OUTLINE} />
      <ellipse cx="32" cy="38" rx="8" ry="6" fill="#fff0c2" stroke="none" />
      <path d="M29 35 L35 35 L32 38 Z" fill="#9b5b35" />
      <Eyes y={29} lx={27} rx={37} r={1.8} />
      <path d="M28 42 Q32 45 36 42" {...LINE} strokeWidth={1.6} />
      <circle cx="22" cy="36" r="2" fill="#ffb3ab" fillOpacity="0.55" />
      <circle cx="42" cy="36" r="2" fill="#ffb3ab" fillOpacity="0.55" />
    </StickerBase>
  );
}

function ThreeHeadedBirdSticker({ size = 48, ...rest }) {
  const head = (cx, cy, tone, facing = 1) => (
    <g>
      <circle cx={cx} cy={cy} r="8" fill={tone} {...OUTLINE} strokeWidth={1.8} />
      <circle cx={cx + facing * 2} cy={cy - 1} r="1.7" fill="#10233f" />
      <circle cx={cx + facing * 2.6} cy={cy - 1.6} r="0.5" fill="#ffffff" />
      <path
        d={`M${cx + facing * 6} ${cy + 1} L${cx + facing * 12} ${cy + 3} L${cx + facing * 6} ${cy + 5} Z`}
        fill="#ffc94d"
        {...OUTLINE}
        strokeWidth={1.5}
      />
    </g>
  );

  return (
    <StickerBase size={size} {...rest}>
      <path d="M21 30 Q17 23 18 17 M32 29 L32 15 M43 30 Q47 23 46 17" {...LINE} strokeWidth={3} />
      {head(17, 16, "#63b8f5")}
      {head(32, 11, "#8b7ae8")}
      {head(47, 16, "#53c6bd", -1)}
      <ellipse cx="32" cy="39" rx="17" ry="14" fill="#5aa6ea" {...OUTLINE} />
      <path d="M21 36 Q10 38 13 47 Q20 49 26 42 M43 36 Q54 38 51 47 Q44 49 38 42" fill="#53c6bd" {...OUTLINE} />
      <ellipse cx="32" cy="43" rx="8" ry="6" fill="#eaf8ff" stroke="none" />
      <path d="M27 51 L26 57 M37 51 L38 57 M23 57 L29 57 M35 57 L41 57" {...LINE} strokeWidth={1.8} />
    </StickerBase>
  );
}

export const EXTENDED_ANIMAL_STICKERS = Object.freeze({
  Turtle: TurtleSticker,
  Lion: LionSticker,
  Sheep: SheepSticker,
  Panda: PandaSticker,
  Monkey: MonkeySticker,
  Squirrel: SquirrelSticker,
  Frog: FrogSticker,
  PolarBear: PolarBearSticker,
  Unicorn: UnicornSticker,
  Dragon: DragonSticker,
  Duck: DuckSticker,
  WingedLion: WingedLionSticker,
  ThreeHeadedBird: ThreeHeadedBirdSticker,
});
