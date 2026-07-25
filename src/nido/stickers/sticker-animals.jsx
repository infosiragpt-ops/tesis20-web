import {
  Cheeks,
  Eyes,
  Ground,
  LINE,
  OUTLINE,
  Shade,
  Shine,
  StickerBase,
} from "./sticker-base.jsx";

function DogSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={54} rx={15} ry={2.6} />
      <path d="M17 17 Q9 22 10 34 Q11 42 18 40 Q22 38 22 30 Z" fill="#8a5a38" {...OUTLINE} />
      <path d="M47 17 Q55 22 54 34 Q53 42 46 40 Q42 38 42 30 Z" fill="#8a5a38" {...OUTLINE} />
      <path d="M13 26 Q12 32 14 36" stroke="#6b4226" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M51 26 Q52 32 50 36" stroke="#6b4226" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="31" r="17" fill="#b07b4f" {...OUTLINE} />
      <Shade cx={32} cy={31} r={17} opacity={0.09} />
      <path d="M39 16 Q46 19 48 26 Q44 20 38 18 Z" fill="#8a5a38" fillOpacity="0.6" stroke="none" />
      <ellipse cx="32" cy="38" rx="9.5" ry="7" fill="#fff3c9" stroke="none" />
      <ellipse cx="32" cy="34" rx="3.2" ry="2.5" fill="#10233f" />
      <ellipse cx="31" cy="33.3" rx="1" ry="0.7" fill="#ffffff" fillOpacity="0.7" />
      <path d="M27 40 Q32 44 37 40" {...LINE} />
      <path d="M32 36.5 L32 40" stroke="#10233f" strokeWidth="1.6" strokeLinecap="round" />
      <Eyes y={27} />
      <Cheeks y={33} lx={20} rx={44} />
      {/* Collar con chapita: le da identidad de mascota querida. */}
      <path d="M22 45 Q32 50 42 45 L42 48 Q32 53 22 48 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="32" cy="50.5" r="2.6" fill="#ffc94d" stroke="#10233f" strokeWidth="1.6" />
      <circle cx="31.2" cy="49.8" r="0.7" fill="#ffffff" fillOpacity="0.8" />
      <Shine cx={25} cy={19} rx={4} ry={2.1} opacity={0.45} />
    </StickerBase>
  );
}

function CatSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={53.5} rx={14} ry={2.4} />
      <path d="M17 25 L14 9 L28 17 Z" fill="#f6c9a0" {...OUTLINE} />
      <path d="M47 25 L50 9 L36 17 Z" fill="#f6c9a0" {...OUTLINE} />
      <path d="M18 23 L16.5 13.5 L25 18.5 Z" fill="#ffd3cd" stroke="none" />
      <path d="M46 23 L47.5 13.5 L39 18.5 Z" fill="#ffd3cd" stroke="none" />
      <circle cx="32" cy="33" r="16" fill="#f6c9a0" {...OUTLINE} />
      <Shade cx={32} cy={33} r={16} opacity={0.08} />
      {/* Rayitas de atigrado: tres trazos que lo convierten en gatito real. */}
      <path d="M28 19 Q29 22 28.6 24 M32 18.4 Q33 21.6 32.6 24 M36 19 Q37 22 36.6 24" stroke="#d9a878" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M29.5 34.5 L34.5 34.5 L32 37.5 Z" fill="#ff6f61" stroke="none" />
      <path d="M28 40 Q30 42.5 32 40 Q34 42.5 36 40" {...LINE} />
      <path d="M32 37.5 L32 40" stroke="#10233f" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 32 L20 33 M12 38 L20 37" {...LINE} strokeWidth={1.7} />
      <path d="M52 32 L44 33 M52 38 L44 37" {...LINE} strokeWidth={1.7} />
      <Eyes y={29} />
      <Cheeks y={35} lx={22} rx={42} />
      <Shine cx={26} cy={22} rx={4} ry={2} opacity={0.5} />
    </StickerBase>
  );
}

function BirdSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={58} rx={11} ry={2} />
      <path d="M28 13 Q26 6 31 8 Q33 4 36 9 Q40 7 38 13 Z" fill="#4b8ff7" {...OUTLINE} />
      <circle cx="32" cy="33" r="16" fill="#4b8ff7" {...OUTLINE} />
      <Shade cx={32} cy={33} r={16} opacity={0.09} />
      <ellipse cx="32" cy="40" rx="9" ry="7" fill="#edf9ff" stroke="none" />
      <path d="M26 38 Q28 42 32 43 Q36 42 38 38" stroke="#c9dcea" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M22 33 Q14 36 17 43 Q22 44 26 39 Z" fill="#29c7c9" {...OUTLINE} />
      <path d="M19 38 Q21 39.5 23.5 38.5" stroke="#1e9092" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M44 31 L54 34 L44 38 Z" fill="#ffc94d" {...OUTLINE} />
      <path d="M44 34.5 L49 34.5" stroke="#e6a93c" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M27 51 L27 57 M24 57 L30 57 M37 51 L37 57 M34 57 L40 57" {...LINE} />
      <circle cx="30" cy="28" r="2.4" fill="#10233f" />
      <circle cx="30.9" cy="27.1" r="0.8" fill="#ffffff" />
      <circle cx="39" cy="33" r="2.4" fill="#ffb3ab" fillOpacity="0.6" />
      <Shine cx={27} cy={22} rx={4} ry={2} opacity={0.5} />
    </StickerBase>
  );
}

function RabbitSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={54} rx={13} ry={2.4} />
      <path d="M22 25 Q16 8 23 5 Q29 4 28 22 Z" fill="#edf9ff" {...OUTLINE} />
      <path d="M42 25 Q48 8 41 5 Q35 4 36 22 Z" fill="#edf9ff" {...OUTLINE} />
      <path d="M23.5 20 Q20.5 10 23.5 8.5 Q26 8.5 25.8 19 Z" fill="#ffd3cd" stroke="none" />
      <path d="M40.5 20 Q43.5 10 40.5 8.5 Q38 8.5 38.2 19 Z" fill="#ffd3cd" stroke="none" />
      <circle cx="32" cy="36" r="15.5" fill="#edf9ff" {...OUTLINE} />
      <Shade cx={32} cy={36} r={15.5} opacity={0.07} />
      <ellipse cx="32" cy="38.5" rx="3" ry="2.3" fill="#ffd3cd" stroke="#10233f" strokeWidth="1.8" />
      <path d="M32 40.5 L32 44 M29 44 Q32 47 35 44" {...LINE} />
      <path d="M24 40 L19 39 M24 42.5 L19.5 43 M40 40 L45 39 M40 42.5 L44.5 43" stroke="#c9dcea" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="29.6" y="44" width="2.3" height="4" rx="1" fill="#ffffff" stroke="#10233f" strokeWidth="1.4" />
      <rect x="32.1" y="44" width="2.3" height="4" rx="1" fill="#ffffff" stroke="#10233f" strokeWidth="1.4" />
      <Eyes y={32} />
      <Cheeks y={38} lx={22} rx={42} />
      <Shine cx={26} cy={26} rx={4} ry={2} opacity={0.7} />
    </StickerBase>
  );
}

function CowSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={53} rx={15} ry={2.6} />
      <path d="M15 21 Q8 20 8 26 Q10 30 17 28 Z" fill="#f6c9a0" {...OUTLINE} />
      <path d="M49 21 Q56 20 56 26 Q54 30 47 28 Z" fill="#f6c9a0" {...OUTLINE} />
      <path d="M24 13 Q22 6 28 8 M40 13 Q42 6 36 8" fill="none" {...OUTLINE} strokeWidth={3.2} />
      <circle cx="32" cy="31" r="17" fill="#ffffff" {...OUTLINE} />
      <Shade cx={32} cy={31} r={17} opacity={0.07} />
      <path d="M20 18 Q28 14 30 21 Q26 26 19 24 Z" fill="#10233f" stroke="none" />
      <path d="M45 22 Q48 28 43 30 Q39 26 41 22 Z" fill="#10233f" stroke="none" />
      <path d="M25 45 Q28 48 32 48" stroke="#d9d9d9" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="40" rx="10.5" ry="7" fill="#ffd3cd" stroke="#10233f" strokeWidth="2.2" />
      <ellipse cx="28" cy="40" rx="1.9" ry="2.4" fill="#10233f" />
      <ellipse cx="36" cy="40" rx="1.9" ry="2.4" fill="#10233f" />
      <Shine cx={27} cy={36.6} rx={2.6} ry={1.2} opacity={0.45} />
      <Eyes y={29} lx={26} rx={40} />
      <Cheeks y={33} lx={19} rx={45} r={2.2} />
      <Shine cx={25} cy={20} rx={4} ry={2} opacity={0.5} />
    </StickerBase>
  );
}

function HorseSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={53} rx={15} ry={2.6} />
      <path d="M20 18 L14 7 L27 12 Z" fill="#b07b4f" {...OUTLINE} />
      <path d="M44 18 L50 7 L37 12 Z" fill="#b07b4f" {...OUTLINE} />
      <path d="M25 13 Q32 7 39 13 Q42 18 40 22 L24 22 Q22 18 25 13 Z" fill="#6b4226" stroke="none" />
      <circle cx="32" cy="30" r="16" fill="#b07b4f" {...OUTLINE} />
      <Shade cx={32} cy={30} r={16} opacity={0.09} />
      <path d="M26 15 Q32 11 38 15 Q40 19 38 21 L26 21 Q24 19 26 15 Z" fill="#6b4226" stroke="none" />
      <path d="M28 15.5 Q32 13 36 15.5" stroke="#8a5a38" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Estrella blanca en la frente: la marca clásica de los caballos. */}
      <path d="M32 22 L33 24.4 L35.5 24.8 L33.6 26.4 L34.1 28.8 L32 27.5 L29.9 28.8 L30.4 26.4 L28.5 24.8 L31 24.4 Z" fill="#fff3c9" stroke="none" />
      <ellipse cx="32" cy="41" rx="10" ry="8" fill="#f6c9a0" stroke="#10233f" strokeWidth="2.2" />
      <ellipse cx="28" cy="41" rx="1.7" ry="2.2" fill="#10233f" />
      <ellipse cx="36" cy="41" rx="1.7" ry="2.2" fill="#10233f" />
      <path d="M28 46 Q32 48.5 36 46" {...LINE} strokeWidth={1.8} />
      <Eyes y={29} lx={25} rx={39} />
      <Cheeks y={33.5} lx={20} rx={44} r={2.2} />
      <Shine cx={25} cy={20} rx={3.6} ry={1.9} opacity={0.4} />
    </StickerBase>
  );
}

function FishSimpleSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="49" cy="14" r="2.5" fill="none" stroke="#4b8ff7" strokeWidth="1.8" />
      <circle cx="55" cy="22" r="1.8" fill="none" stroke="#4b8ff7" strokeWidth="1.6" />
      <path d="M13 32 L4 22 Q2 32 4 42 Z" fill="#dc5048" {...OUTLINE} />
      <path d="M7 28 Q6 32 7 36" stroke="#b83b34" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="32" rx="20" ry="14" fill="#ff6f61" {...OUTLINE} />
      <path d="M16 38 Q28 45 44 40 Q36 44.5 28 44 Q20 43 16 38 Z" fill="#dc5048" fillOpacity="0.7" stroke="none" />
      <path d="M30 19 Q37 14 42 20 Q37 24 31 23 Z" fill="#dc5048" {...OUTLINE} strokeWidth={2} />
      <path d="M28 32 Q33 27 38 32 Q33 37 28 32 Z" fill="#dc5048" stroke="none" />
      {/* Escamas sugeridas con tres arcos suaves. */}
      <path d="M20 28 Q23 31 20 34 M25 26 Q28 30 25 35" stroke="#dc5048" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity="0.8" />
      <circle cx="44" cy="28" r="2.6" fill="#10233f" />
      <circle cx="45" cy="27" r="0.9" fill="#ffffff" />
      <path d="M46 36 Q49 34 50 31" {...LINE} strokeWidth={1.8} />
      <circle cx="41" cy="35" r="2.2" fill="#ffb3ab" fillOpacity="0.6" />
      <Shine cx={27} cy={24} rx={5} ry={2.2} opacity={0.4} />
    </StickerBase>
  );
}

function ButterflySticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M29 28 Q12 8 7 18 Q4 26 26 33 Z" fill="#9873e7" {...OUTLINE} />
      <path d="M35 28 Q52 8 57 18 Q60 26 38 33 Z" fill="#9873e7" {...OUTLINE} />
      <path d="M28 34 Q10 34 11 44 Q13 52 29 40 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M36 34 Q54 34 53 44 Q51 52 35 40 Z" fill="#ff6f61" {...OUTLINE} />
      <circle cx="18" cy="22" r="3" fill="#dff8f7" stroke="none" />
      <circle cx="46" cy="22" r="3" fill="#dff8f7" stroke="none" />
      <circle cx="17" cy="43" r="2" fill="#ffc94d" stroke="none" />
      <circle cx="47" cy="43" r="2" fill="#ffc94d" stroke="none" />
      <path d="M14 25 Q18 28 24 30 M50 25 Q46 28 40 30" stroke="#7a55c9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="36" rx="4.5" ry="12" fill="#ffc94d" {...OUTLINE} />
      <path d="M29.5 31 L34.5 31 M29.7 36 L34.3 36 M30 41 L34 41" stroke="#e6a93c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 24 Q26 16 22 14 M35 24 Q38 16 42 14" {...LINE} strokeWidth={1.8} />
      <circle cx="22" cy="13.5" r="1.7" fill="#10233f" />
      <circle cx="42" cy="13.5" r="1.7" fill="#10233f" />
      <circle cx="30.4" cy="31" r="1.5" fill="#10233f" />
      <circle cx="33.6" cy="31" r="1.5" fill="#10233f" />
      <circle cx="30.8" cy="30.6" r="0.5" fill="#ffffff" />
      <circle cx="34" cy="30.6" r="0.5" fill="#ffffff" />
      <path d="M30.5 35 Q32 36.5 33.5 35" {...LINE} strokeWidth={1.6} />
      <Shine cx={16} cy={16} rx={3.4} ry={1.6} opacity={0.35} tilt={-30} />
    </StickerBase>
  );
}

function BugSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={55} rx={14} ry={2.4} />
      <path d="M24 15 Q19 8 14 8 M40 15 Q45 8 50 8" {...LINE} />
      <circle cx="14" cy="7.5" r="2" fill="#10233f" />
      <circle cx="50" cy="7.5" r="2" fill="#10233f" />
      <circle cx="32" cy="22" r="10" fill="#10233f" />
      <path d="M12 36 Q12 18 32 18 Q52 18 52 36 Q52 52 32 52 Q12 52 12 36 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M14 42 Q22 50 32 50.5 Q42 50 50 42 Q46 50 38 51.5 L26 51.5 Q18 50 14 42 Z" fill="#dc5048" fillOpacity="0.75" stroke="none" />
      <path d="M32 18 L32 52" stroke="#10233f" strokeWidth="2.2" />
      <circle cx="22" cy="31" r="3.4" fill="#10233f" />
      <circle cx="42" cy="31" r="3.4" fill="#10233f" />
      <circle cx="25" cy="43" r="2.8" fill="#10233f" />
      <circle cx="39" cy="43" r="2.8" fill="#10233f" />
      <circle cx="23" cy="30" r="1" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="43" cy="30" r="1" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="28.2" cy="22.5" r="1.9" fill="#ffffff" />
      <circle cx="35.8" cy="22.5" r="1.9" fill="#ffffff" />
      <circle cx="28.2" cy="22.5" r="1" fill="#10233f" />
      <circle cx="35.8" cy="22.5" r="1" fill="#10233f" />
      <path d="M29.5 26.5 Q32 28.5 34.5 26.5" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Shine cx={22} cy={23} rx={3.4} ry={1.6} opacity={0.3} />
    </StickerBase>
  );
}

function PawPrintSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <ellipse cx="15" cy="22" rx="5.5" ry="7" fill="#b07b4f" {...OUTLINE} />
      <ellipse cx="26" cy="14" rx="5.5" ry="7.5" fill="#b07b4f" {...OUTLINE} />
      <ellipse cx="38" cy="14" rx="5.5" ry="7.5" fill="#b07b4f" {...OUTLINE} />
      <ellipse cx="49" cy="22" rx="5.5" ry="7" fill="#b07b4f" {...OUTLINE} />
      <ellipse cx="14" cy="19.6" rx="2" ry="2.6" fill="#d9a878" fillOpacity="0.6" stroke="none" />
      <ellipse cx="25" cy="11.6" rx="2" ry="2.8" fill="#d9a878" fillOpacity="0.6" stroke="none" />
      <ellipse cx="37" cy="11.6" rx="2" ry="2.8" fill="#d9a878" fillOpacity="0.6" stroke="none" />
      <ellipse cx="48" cy="19.6" rx="2" ry="2.6" fill="#d9a878" fillOpacity="0.6" stroke="none" />
      <path d="M32 27 Q44 27 48 38 Q51 47 43 50 Q37 52 32 48 Q27 52 21 50 Q13 47 16 38 Q20 27 32 27 Z" fill="#b07b4f" {...OUTLINE} />
      <Shade cx={32} cy={39} r={13} opacity={0.1} />
      <ellipse cx="27" cy="38" rx="2" ry="2.6" fill="#6b4226" />
      <ellipse cx="37" cy="38" rx="2" ry="2.6" fill="#6b4226" />
      <path d="M28 44 Q32 47 36 44" {...LINE} strokeWidth={1.8} stroke="#6b4226" />
      <Shine cx={26} cy={31} rx={4} ry={1.8} opacity={0.35} />
    </StickerBase>
  );
}

export const ANIMAL_STICKERS = Object.freeze({
  Dog: DogSticker,
  Cat: CatSticker,
  Bird: BirdSticker,
  Rabbit: RabbitSticker,
  Cow: CowSticker,
  Horse: HorseSticker,
  FishSimple: FishSimpleSticker,
  Butterfly: ButterflySticker,
  Bug: BugSticker,
  PawPrint: PawPrintSticker,
});
