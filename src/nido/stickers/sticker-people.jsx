import { Cheeks, LINE, OUTLINE, Smile, StickerBase } from "./sticker-base.jsx";

function FaceBase({ children, tint }) {
  return (
    <g>
      <circle cx="32" cy="32" r="22" fill={tint ?? "#ffc94d"} {...OUTLINE} />
      <ellipse cx="24" cy="20" rx="5" ry="2.6" fill="#ffffff" fillOpacity="0.5" />
      {children}
    </g>
  );
}

function SmileySticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <circle cx="24" cy="28" r="2.6" fill="#10233f" />
        <circle cx="40" cy="28" r="2.6" fill="#10233f" />
        <path d="M22 37 Q32 46 42 37" {...LINE} strokeWidth={2.6} />
        <Cheeks lx={18} rx={46} y={36} r={3} />
      </FaceBase>
    </StickerBase>
  );
}

function SmileyMehSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <circle cx="24" cy="28" r="2.6" fill="#10233f" />
        <circle cx="40" cy="28" r="2.6" fill="#10233f" />
        <path d="M24 40 L40 40" {...LINE} strokeWidth={2.6} />
      </FaceBase>
    </StickerBase>
  );
}

function SmileyNervousSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <path d="M20 24 Q24 21 28 24 M36 24 Q40 21 44 24" {...LINE} strokeWidth={2.2} />
        <circle cx="24" cy="29" r="2.4" fill="#10233f" />
        <circle cx="40" cy="29" r="2.4" fill="#10233f" />
        <path d="M22 41 Q25 38 28 41 Q31 44 34 41 Q37 38 40 41" {...LINE} strokeWidth={2.4} />
        <path d="M46 30 Q50 36 47 39 Q44 41 42.5 38 Q41.5 35 46 30 Z" fill="#4b8ff7" stroke="#10233f" strokeWidth="1.8" strokeLinejoin="round" />
      </FaceBase>
    </StickerBase>
  );
}

function SmileySadSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <path d="M20 23 L28 26 M44 23 L36 26" {...LINE} strokeWidth={2.2} />
        <circle cx="25" cy="30" r="2.5" fill="#10233f" />
        <circle cx="39" cy="30" r="2.5" fill="#10233f" />
        <path d="M23 43 Q32 36 41 43" {...LINE} strokeWidth={2.6} />
        <path d="M22 34 Q19 40 21.5 42.5 Q24 44 25.5 41.5 Q26.5 38.5 22 34 Z" fill="#4b8ff7" stroke="#10233f" strokeWidth="1.6" strokeLinejoin="round" />
      </FaceBase>
    </StickerBase>
  );
}

function SmileyWinkSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <circle cx="24" cy="28" r="2.6" fill="#10233f" />
        <path d="M36 28 Q40 25 44 28" {...LINE} strokeWidth={2.6} />
        <path d="M22 37 Q32 45 42 38 Q39 40 36 39" {...LINE} strokeWidth={2.6} />
        <Cheeks lx={18} rx={46} y={35} r={3} />
      </FaceBase>
    </StickerBase>
  );
}

function SmileyXEyesSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <path d="M21 25 L28 32 M28 25 L21 32" {...LINE} strokeWidth={2.6} />
        <path d="M36 25 L43 32 M43 25 L36 32" {...LINE} strokeWidth={2.6} />
        <ellipse cx="32" cy="41" rx="4.5" ry="5.5" fill="#10233f" />
        <ellipse cx="32" cy="43" rx="2.5" ry="2.6" fill="#ff6f61" />
      </FaceBase>
    </StickerBase>
  );
}

function BabySticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 9 Q36 4 40 7 Q38 11 33 12 Z" fill="#8a5a38" {...OUTLINE} strokeWidth={2} />
      <circle cx="32" cy="32" r="21" fill="#f6c9a0" {...OUTLINE} />
      <path d="M13 28 Q18 14 32 12 Q46 14 51 28 Q46 24 38 23 Q44 26 45 30 Q38 24 28 24 Q19 25 14.5 31 Z" fill="#8a5a38" stroke="none" />
      <circle cx="24" cy="33" r="2.4" fill="#10233f" />
      <circle cx="40" cy="33" r="2.4" fill="#10233f" />
      <circle cx="24.9" cy="32.1" r="0.8" fill="#ffffff" />
      <circle cx="40.9" cy="32.1" r="0.8" fill="#ffffff" />
      <Smile x={32} y={40} w={9} curve={4} />
      <Cheeks lx={17} rx={47} y={39} r={3} />
      <circle cx="10" cy="32" r="3.4" fill="#f6c9a0" {...OUTLINE} strokeWidth={2} />
      <circle cx="54" cy="32" r="3.4" fill="#f6c9a0" {...OUTLINE} strokeWidth={2} />
    </StickerBase>
  );
}

function StudentSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="32" cy="34" r="19" fill="#f6c9a0" {...OUTLINE} />
      <path d="M15 32 Q17 20 32 18 Q47 20 49 32 Q42 26 32 26 Q22 26 15 32 Z" fill="#6b4226" stroke="none" />
      <path d="M10 16 L32 8 L54 16 L32 24 Z" fill="#10233f" {...OUTLINE} />
      <path d="M22 20 L22 14" stroke="#10233f" strokeWidth="2" />
      <path d="M54 16 L54 26" {...LINE} strokeWidth={2.2} stroke="#ffc94d" />
      <circle cx="54" cy="28.5" r="2.2" fill="#ffc94d" {...OUTLINE} strokeWidth={1.6} />
      <circle cx="25" cy="35" r="2.3" fill="#10233f" />
      <circle cx="39" cy="35" r="2.3" fill="#10233f" />
      <circle cx="25.8" cy="34.2" r="0.8" fill="#ffffff" />
      <circle cx="39.8" cy="34.2" r="0.8" fill="#ffffff" />
      <Smile x={32} y={41.5} w={9} curve={4} />
      <Cheeks lx={19} rx={45} y={40.5} r={2.7} />
    </StickerBase>
  );
}

function MaskHappySticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M12 10 Q32 16 52 10 Q56 32 46 46 Q39 55 32 55 Q25 55 18 46 Q8 32 12 10 Z" fill={tint ?? "#9873e7"} {...OUTLINE} />
      <path d="M18 24 Q23 20 28 24 Q23 30 18 24 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <path d="M36 24 Q41 20 46 24 Q41 30 36 24 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <path d="M20 37 Q32 49 44 37 Q38 41 32 41 Q26 41 20 37 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <path d="M6 14 Q10 10 12 12 M58 14 Q54 10 52 12" {...LINE} strokeWidth={2.4} stroke="#ffc94d" />
    </StickerBase>
  );
}

export const PEOPLE_STICKERS = Object.freeze({
  Smiley: SmileySticker,
  SmileyMeh: SmileyMehSticker,
  SmileyNervous: SmileyNervousSticker,
  SmileySad: SmileySadSticker,
  SmileyWink: SmileyWinkSticker,
  SmileyXEyes: SmileyXEyesSticker,
  Baby: BabySticker,
  Student: StudentSticker,
  MaskHappy: MaskHappySticker,
});
