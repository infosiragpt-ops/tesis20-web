import { Cheeks, Eyes, LINE, OUTLINE, Smile, StickerBase } from "./sticker-base.jsx";

function TreeSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <rect x="28" y="38" width="8" height="16" rx="3" fill="#8a5a38" {...OUTLINE} />
      <circle cx="20" cy="30" r="11" fill="#46b982" {...OUTLINE} />
      <circle cx="44" cy="30" r="11" fill="#46b982" {...OUTLINE} />
      <circle cx="32" cy="19" r="13" fill="#46b982" {...OUTLINE} />
      <circle cx="32" cy="26" r="12" fill="#46b982" stroke="none" />
      <circle cx="25" cy="17" r="2" fill="#ff6f61" />
      <circle cx="40" cy="21" r="2" fill="#ff6f61" />
      <circle cx="31" cy="31" r="2" fill="#ff6f61" />
      <ellipse cx="26" cy="13" rx="4" ry="2.2" fill="#ffffff" fillOpacity="0.4" />
    </StickerBase>
  );
}

function TreePalmSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M30 54 Q30 34 33 22 L38 23 Q36 36 37 54 Z" fill="#b07b4f" {...OUTLINE} />
      <path d="M34 22 Q22 12 12 18 Q20 24 34 24 Z" fill="#46b982" {...OUTLINE} />
      <path d="M34 22 Q46 12 55 18 Q47 24 35 25 Z" fill="#46b982" {...OUTLINE} />
      <path d="M34 22 Q28 8 18 8 Q26 18 33 22 Z" fill="#2e8f63" {...OUTLINE} />
      <path d="M35 22 Q40 8 50 8 Q42 18 35 22 Z" fill="#2e8f63" {...OUTLINE} />
      <circle cx="31" cy="27" r="3" fill="#8a5a38" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="38" cy="28" r="3" fill="#8a5a38" {...OUTLINE} strokeWidth={1.8} />
      <path d="M8 54 Q20 50 32 54 Q44 58 56 54" {...LINE} stroke="#ffc94d" strokeWidth={3} />
    </StickerBase>
  );
}

function PlantSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 38 Q30 26 20 22 Q18 34 30 40 Z" fill="#46b982" {...OUTLINE} />
      <path d="M32 38 Q34 24 45 19 Q48 32 34 40 Z" fill="#2e8f63" {...OUTLINE} />
      <path d="M32 42 L32 30" {...LINE} stroke="#2e8f63" strokeWidth={2.4} />
      <path d="M22 42 L42 42 L39 55 Q32 58 25 55 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M22 42 L42 42 L41 46 L23 46 Z" fill="#dc5048" stroke="none" />
      <path d="M22 42 L42 42 L39 55 Q32 58 25 55 Z" fill="none" {...OUTLINE} />
    </StickerBase>
  );
}

function FlowerSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 34 L32 54" {...LINE} stroke="#2e8f63" strokeWidth={2.6} />
      <path d="M32 46 Q24 46 20 40 Q28 38 32 44 Z" fill="#46b982" {...OUTLINE} strokeWidth={2} />
      <ellipse cx="32" cy="13" rx="6.5" ry="7.5" fill="#ff6f61" {...OUTLINE} />
      <ellipse cx="20" cy="22" rx="7.5" ry="6.5" fill="#ff6f61" {...OUTLINE} />
      <ellipse cx="44" cy="22" rx="7.5" ry="6.5" fill="#ff6f61" {...OUTLINE} />
      <ellipse cx="24" cy="33" rx="7" ry="6.5" fill="#ff6f61" {...OUTLINE} />
      <ellipse cx="40" cy="33" rx="7" ry="6.5" fill="#ff6f61" {...OUTLINE} />
      <circle cx="32" cy="24" r="7.5" fill="#ffc94d" {...OUTLINE} />
      <circle cx="29.8" cy="22.5" r="1.4" fill="#10233f" />
      <circle cx="34.2" cy="22.5" r="1.4" fill="#10233f" />
      <Smile x={32} y={26} w={6} curve={2.5} />
    </StickerBase>
  );
}

function SunSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <g stroke="#ffc94d" strokeWidth="3.4" strokeLinecap="round">
        <path d="M32 6 L32 12" />
        <path d="M32 52 L32 58" />
        <path d="M6 32 L12 32" />
        <path d="M52 32 L58 32" />
        <path d="M13.6 13.6 L17.9 17.9" />
        <path d="M46.1 46.1 L50.4 50.4" />
        <path d="M13.6 50.4 L17.9 46.1" />
        <path d="M46.1 17.9 L50.4 13.6" />
      </g>
      <circle cx="32" cy="32" r="15" fill="#ffc94d" {...OUTLINE} />
      <Eyes lx={26.5} rx={37.5} y={30} r={2} />
      <Smile x={32} y={36} w={9} curve={4} />
      <Cheeks lx={23} rx={41} y={35} r={2.4} />
      <ellipse cx="27" cy="23" rx="4" ry="2" fill="#ffffff" fillOpacity="0.55" />
    </StickerBase>
  );
}

function SunHorizonSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <g stroke="#ffc94d" strokeWidth="3" strokeLinecap="round">
        <path d="M32 8 L32 14" />
        <path d="M12 16 L16.3 20.3" />
        <path d="M52 16 L47.7 20.3" />
      </g>
      <path d="M17 40 A15 15 0 0 1 47 40 Z" fill="#ffc94d" {...OUTLINE} />
      <circle cx="27.5" cy="32" r="1.8" fill="#10233f" />
      <circle cx="36.5" cy="32" r="1.8" fill="#10233f" />
      <Smile x={32} y={35.5} w={7} curve={3} />
      <path d="M6 40 L58 40" {...LINE} stroke="#29c7c9" strokeWidth={3} />
      <path d="M10 48 Q16 45 22 48 Q28 51 34 48 Q40 45 46 48 Q52 51 56 48" {...LINE} stroke="#4b8ff7" strokeWidth={2.6} />
    </StickerBase>
  );
}

function MoonSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M39 8 Q24 12 24 30 Q24 48 40 53 Q28 58 17 50 Q6 41 9 26 Q12 12 26 8.5 Q33 7 39 8 Z" fill="#fff3c9" {...OUTLINE} />
      <circle cx="20" cy="24" r="1.8" fill="#10233f" />
      <path d="M17 32 Q19.5 34.5 22 32" {...LINE} strokeWidth={1.8} />
      <circle cx="15" cy="28" r="2" fill="#ffb3ab" fillOpacity="0.55" />
      <path d="M46 16 L47.5 20 L51.5 21.5 L47.5 23 L46 27 L44.5 23 L40.5 21.5 L44.5 20 Z" fill="#ffc94d" stroke="none" />
      <path d="M50 34 L51 36.6 L53.6 37.6 L51 38.6 L50 41.2 L49 38.6 L46.4 37.6 L49 36.6 Z" fill="#ffc94d" stroke="none" />
    </StickerBase>
  );
}

function CloudSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M16 44 Q7 44 8 35 Q9 28 16 28 Q17 17 28 17 Q36 17 39 24 Q49 22 51 31 Q57 32 56 39 Q55 44 48 44 Z" fill="#edf9ff" {...OUTLINE} />
      <circle cx="26" cy="33" r="1.9" fill="#10233f" />
      <circle cx="38" cy="33" r="1.9" fill="#10233f" />
      <Smile x={32} y={36.5} w={7} curve={3} />
      <Cheeks lx={20} rx={44} y={36} r={2.2} />
      <ellipse cx="24" cy="24" rx="4.5" ry="2" fill="#ffffff" fillOpacity="0.7" />
    </StickerBase>
  );
}

function SnowflakeSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <g stroke="#4b8ff7" strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d="M32 8 L32 56" />
        <path d="M11 20 L53 44" />
        <path d="M53 20 L11 44" />
        <path d="M32 8 L27 13 M32 8 L37 13" />
        <path d="M32 56 L27 51 M32 56 L37 51" />
        <path d="M11 20 L18 20 M11 20 L11 27" />
        <path d="M53 44 L46 44 M53 44 L53 37" />
        <path d="M53 20 L46 20 M53 20 L53 27" />
        <path d="M11 44 L18 44 M11 44 L11 37" />
      </g>
      <circle cx="32" cy="32" r="7" fill="#dff8f7" stroke="#4b8ff7" strokeWidth="2.4" />
      <circle cx="29.8" cy="30.8" r="1.3" fill="#10233f" />
      <circle cx="34.2" cy="30.8" r="1.3" fill="#10233f" />
      <Smile x={32} y={33.5} w={5} curve={2} />
    </StickerBase>
  );
}

function WavesSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M6 22 Q14 15 22 22 Q30 29 38 22 Q46 15 54 22" {...LINE} stroke="#29c7c9" strokeWidth={3.4} />
      <path d="M6 34 Q14 27 22 34 Q30 41 38 34 Q46 27 54 34" {...LINE} stroke="#4b8ff7" strokeWidth={3.4} />
      <path d="M6 46 Q14 39 22 46 Q30 53 38 46 Q46 39 54 46" {...LINE} stroke="#29c7c9" strokeWidth={3.4} />
      <circle cx="47" cy="12" r="2" fill="none" stroke="#4b8ff7" strokeWidth="1.6" />
      <circle cx="53" cy="8" r="1.5" fill="none" stroke="#29c7c9" strokeWidth="1.4" />
    </StickerBase>
  );
}

function DropSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 6 Q46 26 46 38 Q46 52 32 52 Q18 52 18 38 Q18 26 32 6 Z" fill="#4b8ff7" {...OUTLINE} />
      <path d="M25 38 Q23 44 27 46" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeOpacity="0.8" />
      <Eyes lx={27} rx={37} y={35} r={1.9} />
      <Smile x={32} y={40} w={7} curve={3} />
      <Cheeks lx={23.5} rx={40.5} y={39} r={2} />
    </StickerBase>
  );
}

function FireSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 5 Q34 14 42 20 Q52 28 50 39 Q48 53 32 55 Q16 53 14 39 Q12 28 20 18 Q26 12 26 5 Q30 8 32 5 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M32 22 Q33 28 38 32 Q44 37 42 44 Q40 51 32 52 Q24 51 22 44 Q20 37 26 31 Q31 27 32 22 Z" fill="#ffc94d" stroke="none" />
      <circle cx="28.5" cy="41" r="1.8" fill="#10233f" />
      <circle cx="35.5" cy="41" r="1.8" fill="#10233f" />
      <Smile x={32} y={45} w={6} curve={2.5} />
    </StickerBase>
  );
}

function UmbrellaSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 8 Q54 10 56 30 Q50 26 44 30 Q38 25 32 30 Q26 25 20 30 Q14 26 8 30 Q10 10 32 8 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M20 30 Q26 25 32 30 L32 9 Q24 12 20 30 Z" fill="#ffc94d" stroke="none" />
      <path d="M32 8 Q54 10 56 30 Q50 26 44 30 Q38 25 32 30 Q26 25 20 30 Q14 26 8 30 Q10 10 32 8 Z" fill="none" {...OUTLINE} />
      <path d="M32 30 L32 48 Q32 54 26.5 54 Q22 54 22 49" {...LINE} strokeWidth={2.8} />
      <path d="M32 5 L32 8" {...LINE} strokeWidth={2.8} />
      <path d="M12 40 L12 45 M50 38 L50 44" stroke="#4b8ff7" strokeWidth="2.4" strokeLinecap="round" />
    </StickerBase>
  );
}

function CarrotSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M36 18 Q30 6 24 8 Q28 14 32 18 Z" fill="#46b982" {...OUTLINE} strokeWidth={2} />
      <path d="M38 16 Q40 4 46 6 Q44 13 39 18 Z" fill="#2e8f63" {...OUTLINE} strokeWidth={2} />
      <path d="M42 14 Q52 8 56 14 Q50 18 43 19 Z" fill="#46b982" {...OUTLINE} strokeWidth={2} />
      <path d="M40 20 Q48 26 42 34 L20 54 Q13 58 10 54 Q7 50 12 45 L32 22 Q36 17 40 20 Z" fill="#ffc94d" stroke="none" />
      <path d="M40 20 Q48 26 42 34 L20 54 Q13 58 10 54 Q7 50 12 45 L32 22 Q36 17 40 20 Z" fill="#ff9a3d" fillOpacity="0.75" {...OUTLINE} />
      <path d="M34 28 L39 32 M26 36 L31 40 M18 45 L23 49" {...LINE} strokeWidth={1.8} />
    </StickerBase>
  );
}

function BreadSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M10 30 Q10 18 32 18 Q54 18 54 30 Q54 36 49 37 L49 44 Q49 48 44 48 L20 48 Q15 48 15 44 L15 37 Q10 36 10 30 Z" fill="#f6c9a0" {...OUTLINE} />
      <path d="M10 30 Q10 18 32 18 Q54 18 54 30 Q54 34 50 35.5 Q46 30 40 33 Q36 27 30 31 Q24 26 18 32 Q13 30 10.8 32.5 Q10 31.5 10 30 Z" fill="#b07b4f" stroke="none" />
      <path d="M10 30 Q10 18 32 18 Q54 18 54 30 Q54 36 49 37 L49 44 Q49 48 44 48 L20 48 Q15 48 15 44 L15 37 Q10 36 10 30 Z" fill="none" {...OUTLINE} />
      <circle cx="27" cy="38" r="1.8" fill="#10233f" />
      <circle cx="37" cy="38" r="1.8" fill="#10233f" />
      <Smile x={32} y={41.5} w={6} curve={2.5} />
      <Cheeks lx={22} rx={42} y={41} r={2.1} />
    </StickerBase>
  );
}

function BowlFoodSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M22 16 Q24 8 30 12 M32 16 Q34 8 40 12" {...LINE} strokeWidth={2.2} strokeOpacity={0.6} />
      <path d="M10 28 L54 28 Q54 44 44 50 L20 50 Q10 44 10 28 Z" fill="#4b8ff7" {...OUTLINE} />
      <path d="M12 28 Q18 22 26 25 Q32 20 40 24 Q48 21 52 28 Z" fill="#fff3c9" {...OUTLINE} strokeWidth={2} />
      <path d="M14 34 L50 34" stroke="#2f6fd6" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="26" cy="41" r="1.8" fill="#ffffff" />
      <circle cx="38" cy="41" r="1.8" fill="#ffffff" />
      <path d="M29 44.5 Q32 47 35 44.5" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </StickerBase>
  );
}

function CoffeeSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M22 12 Q24 6 28 9 M34 12 Q36 6 40 9" {...LINE} strokeWidth={2.2} strokeOpacity={0.6} />
      <path d="M44 26 Q54 25 54 33 Q54 41 44 40" fill="none" {...OUTLINE} />
      <path d="M14 20 L48 20 L45 46 Q44 52 38 52 L24 52 Q18 52 17 46 Z" fill="#29c7c9" {...OUTLINE} />
      <path d="M15.5 25 L46.5 25" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.5" strokeLinecap="round" />
      <circle cx="26.5" cy="34" r="1.8" fill="#10233f" />
      <circle cx="36.5" cy="34" r="1.8" fill="#10233f" />
      <Smile x={31.5} y={38} w={7} curve={3} />
      <Cheeks lx={23} rx={40} y={37.5} r={2} />
    </StickerBase>
  );
}

function ForkKnifeSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M20 8 L20 22 Q20 27 24 27 L24 56 M28 8 L28 22 M16 8 L16 22 Q16 27 20 27" fill="none" {...OUTLINE} strokeWidth={2.6} />
      <path d="M24 27 L20 27 Q16 27 16 22 L16 8 M24 27 L28 27 Q28 27 28 22 L28 8" fill="none" {...OUTLINE} strokeWidth={2.6} />
      <rect x="21.7" y="27" width="4.6" height="29" rx="2.3" fill="#cfe2ec" {...OUTLINE} strokeWidth={2.2} />
      <path d="M44 8 Q52 18 46 32 L46 8 Z" fill="#cfe2ec" {...OUTLINE} strokeWidth={2.2} />
      <rect x="41.7" y="30" width="4.6" height="26" rx="2.3" fill="#cfe2ec" {...OUTLINE} strokeWidth={2.2} />
    </StickerBase>
  );
}

export const NATURE_FOOD_STICKERS = Object.freeze({
  Tree: TreeSticker,
  TreePalm: TreePalmSticker,
  Plant: PlantSticker,
  Flower: FlowerSticker,
  Sun: SunSticker,
  SunHorizon: SunHorizonSticker,
  Moon: MoonSticker,
  Cloud: CloudSticker,
  Snowflake: SnowflakeSticker,
  Waves: WavesSticker,
  Drop: DropSticker,
  Fire: FireSticker,
  Umbrella: UmbrellaSticker,
  Carrot: CarrotSticker,
  Bread: BreadSticker,
  BowlFood: BowlFoodSticker,
  Coffee: CoffeeSticker,
  ForkKnife: ForkKnifeSticker,
});
