import { LINE, OUTLINE, Smile, StickerBase } from "./sticker-base.jsx";

function BackpackSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M22 16 Q22 8 32 8 Q42 8 42 16" fill="none" {...OUTLINE} strokeWidth={3.4} />
      <path d="M12 26 Q12 14 32 14 Q52 14 52 26 L52 48 Q52 54 46 54 L18 54 Q12 54 12 48 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M12 30 Q22 26 32 30 Q42 34 52 30 L52 26 Q52 14 32 14 Q12 14 12 26 Z" fill="#dc5048" stroke="none" />
      <path d="M12 26 Q12 14 32 14 Q52 14 52 26 L52 48 Q52 54 46 54 L18 54 Q12 54 12 48 Z" fill="none" {...OUTLINE} />
      <path d="M20 38 L44 38 L44 50 Q44 54 40 54 L24 54 Q20 54 20 50 Z" fill="#ffc94d" {...OUTLINE} strokeWidth={2.2} />
      <rect x="27" y="36" width="10" height="6" rx="2" fill="#ffc94d" {...OUTLINE} strokeWidth={2} />
      <circle cx="32" cy="25" r="3" fill="#ffffff" fillOpacity="0.6" />
    </StickerBase>
  );
}

function PencilSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M40 6 Q46 2 50 6 Q54 10 50 16 L46 20 L36 10 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M36 10 L46 20 L20 46 L10 36 Z" fill="#ffc94d" {...OUTLINE} />
      <path d="M28 18 L38 28" stroke="#e8b53a" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 36 L20 46 L6 50 Z" fill="#f6c9a0" {...OUTLINE} />
      <path d="M8.5 42 L12 50 L6 50 Z" fill="#10233f" stroke="none" />
      <path d="M50 26 L51 28.6 L53.6 29.6 L51 30.6 L50 33.2 L49 30.6 L46.4 29.6 L49 28.6 Z" fill="#29c7c9" stroke="none" />
    </StickerBase>
  );
}

function BookOpenSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 16 Q22 10 10 12 L10 46 Q22 44 32 50 Q42 44 54 46 L54 12 Q42 10 32 16 Z" fill="#4b8ff7" {...OUTLINE} />
      <path d="M32 20 Q24 15 14 16 L14 42 Q24 41 32 46 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <path d="M32 20 Q40 15 50 16 L50 42 Q40 41 32 46 Z" fill="#edf9ff" {...OUTLINE} strokeWidth={2} />
      <path d="M18 22 L27 21 M18 27 L27 26 M18 32 L27 31" {...LINE} strokeWidth={1.7} stroke="#547087" />
      <path d="M37 21 L46 22 M37 26 L46 27" {...LINE} strokeWidth={1.7} stroke="#547087" />
      <path d="M38 33 L40 31 L42 33 L44 30" {...LINE} strokeWidth={1.7} stroke="#ff6f61" />
      <path d="M32 16 L32 50" {...LINE} strokeWidth={2.2} />
    </StickerBase>
  );
}

function PaletteSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 8 Q56 8 56 30 Q56 40 46 40 L38 40 Q34 40 34 44 Q34 46 36 48 Q38 51 34 53 Q32 54 30 54 Q8 52 8 30 Q8 8 32 8 Z" fill="#f6c9a0" {...OUTLINE} />
      <circle cx="22" cy="20" r="4" fill="#ff6f61" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="38" cy="16" r="4" fill="#4b8ff7" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="47" cy="26" r="4" fill="#46b982" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="17" cy="33" r="4" fill="#ffc94d" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="24" cy="44" r="4" fill="#9873e7" {...OUTLINE} strokeWidth={1.8} />
      <path d="M50 44 L58 36 Q60 34 58.5 32.5 Q57 31 55 33 L47 41 Z" fill="#b07b4f" {...OUTLINE} strokeWidth={1.8} />
    </StickerBase>
  );
}

function HeadphonesSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M12 38 L12 30 Q12 10 32 10 Q52 10 52 30 L52 38" fill="none" {...OUTLINE} strokeWidth={3.6} />
      <path d="M10 36 Q6 36 6 41 L6 47 Q6 52 10 52 L14 52 Q18 52 18 47 L18 41 Q18 36 14 36 Z" fill="#29c7c9" {...OUTLINE} />
      <path d="M50 36 Q46 36 46 41 L46 47 Q46 52 50 52 L54 52 Q58 52 58 47 L58 41 Q58 36 54 36 Z" fill="#29c7c9" {...OUTLINE} />
      <path d="M26 30 Q28 27 30 30 M34 30 Q36 27 38 30" {...LINE} strokeWidth={2} stroke="#29c7c9" />
      <path d="M28 36 Q32 39 36 36" {...LINE} strokeWidth={2} stroke="#29c7c9" />
    </StickerBase>
  );
}

function ToothSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 12 Q40 6 48 12 Q56 18 52 30 Q49 40 46 48 Q44 54 41 54 Q38 54 38 48 Q38 42 32 42 Q26 42 26 48 Q26 54 23 54 Q20 54 18 48 Q15 40 12 30 Q8 18 16 12 Q24 6 32 12 Z" fill="#ffffff" {...OUTLINE} />
      <circle cx="26" cy="24" r="2" fill="#10233f" />
      <circle cx="38" cy="24" r="2" fill="#10233f" />
      <circle cx="26.8" cy="23.2" r="0.7" fill="#ffffff" />
      <circle cx="38.8" cy="23.2" r="0.7" fill="#ffffff" />
      <Smile x={32} y={29} w={8} curve={3.5} />
      <circle cx="21" cy="29" r="2.4" fill="#ffb3ab" fillOpacity="0.55" />
      <circle cx="43" cy="29" r="2.4" fill="#ffb3ab" fillOpacity="0.55" />
      <path d="M44 10 L45 12.6 L47.6 13.6 L45 14.6 L44 17.2 L43 14.6 L40.4 13.6 L43 12.6 Z" fill="#29c7c9" stroke="none" />
    </StickerBase>
  );
}

function BalloonSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 44 Q34 50 32 54 Q30 58 33 60" fill="none" {...LINE} strokeWidth={2.2} />
      <ellipse cx="32" cy="26" rx="17" ry="19" fill="#ff6f61" {...OUTLINE} />
      <path d="M29 41 L35 41 L33.5 45 L30.5 45 Z" fill="#dc5048" {...OUTLINE} strokeWidth={1.8} />
      <ellipse cx="25" cy="17" rx="4.5" ry="6" fill="#ffffff" fillOpacity="0.45" />
      <circle cx="27" cy="26" r="1.9" fill="#10233f" />
      <circle cx="37" cy="26" r="1.9" fill="#10233f" />
      <Smile x={32} y={30.5} w={7} curve={3} />
      <circle cx="23" cy="30" r="2.2" fill="#ffb3ab" fillOpacity="0.6" />
      <circle cx="41" cy="30" r="2.2" fill="#ffb3ab" fillOpacity="0.6" />
    </StickerBase>
  );
}

function BasketballSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="32" cy="32" r="22" fill="#ffc94d" {...OUTLINE} />
      <path d="M32 10 L32 54 M10 32 L54 32" fill="none" stroke="#10233f" strokeWidth="2.4" />
      <path d="M15 17 Q24 26 24 32 Q24 38 15 47 M49 17 Q40 26 40 32 Q40 38 49 47" fill="none" stroke="#10233f" strokeWidth="2.4" />
      <ellipse cx="24" cy="18" rx="4.5" ry="2.4" fill="#ffffff" fillOpacity="0.5" />
    </StickerBase>
  );
}

function GameControllerSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M16 20 Q10 20 8 30 Q6 40 8 45 Q10 50 15 48 Q19 46 22 41 L42 41 Q45 46 49 48 Q54 50 56 45 Q58 40 56 30 Q54 20 48 20 Z" fill="#9873e7" {...OUTLINE} />
      <path d="M19 26 L19 36 M14 31 L24 31" fill="none" {...LINE} strokeWidth={3.2} stroke="#ffffff" />
      <circle cx="42" cy="27" r="2.8" fill="#ffc94d" {...OUTLINE} strokeWidth={1.6} />
      <circle cx="48" cy="32" r="2.8" fill="#46b982" {...OUTLINE} strokeWidth={1.6} />
      <circle cx="42" cy="37" r="2.8" fill="#ff6f61" {...OUTLINE} strokeWidth={1.6} />
      <circle cx="36" cy="32" r="2.8" fill="#29c7c9" {...OUTLINE} strokeWidth={1.6} />
      <path d="M28 24 Q32 21 36 24" {...LINE} strokeWidth={2} stroke="#ffffff" />
    </StickerBase>
  );
}

function MicrophoneSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M12 16 Q8 10 13 8 M52 16 Q56 10 51 8" {...LINE} strokeWidth={2.2} stroke="#29c7c9" />
      <rect x="24" y="8" width="16" height="28" rx="8" fill="#ff6f61" {...OUTLINE} />
      <path d="M27 15 L37 15 M27 21 L37 21 M27 27 L37 27" stroke="#dc5048" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 28 Q16 44 32 44 Q48 44 48 28" fill="none" {...OUTLINE} strokeWidth={3} />
      <path d="M32 44 L32 52" {...LINE} strokeWidth={3} />
      <path d="M24 54 Q32 50 40 54" fill="none" {...OUTLINE} strokeWidth={3} />
      <path d="M52 24 L53 26.6 L55.6 27.6 L53 28.6 L52 31.2 L51 28.6 L48.4 27.6 L51 26.6 Z" fill="#ffc94d" stroke="none" />
    </StickerBase>
  );
}

export const SCHOOL_PLAY_STICKERS = Object.freeze({
  Backpack: BackpackSticker,
  Pencil: PencilSticker,
  BookOpen: BookOpenSticker,
  Palette: PaletteSticker,
  Headphones: HeadphonesSticker,
  Tooth: ToothSticker,
  Balloon: BalloonSticker,
  Basketball: BasketballSticker,
  GameController: GameControllerSticker,
  Microphone: MicrophoneSticker,
});
