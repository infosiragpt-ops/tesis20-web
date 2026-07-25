import {
  Cheeks,
  Eyes,
  LINE,
  OUTLINE,
  Shade,
  Shine,
  Smile,
  StickerBase,
} from "./sticker-base.jsx";

function FaceBase({ children, tint }) {
  return (
    <g>
      <circle cx="32" cy="32" r="22" fill={tint ?? "#ffc94d"} {...OUTLINE} />
      <Shade cx={32} cy={32} r={22} opacity={0.08} />
      <Shine cx={24} cy={20} rx={5} ry={2.6} opacity={0.5} />
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
        <circle cx="24.9" cy="27.1" r="0.9" fill="#ffffff" />
        <circle cx="40.9" cy="27.1" r="0.9" fill="#ffffff" />
        <path d="M22 37 Q32 46 42 37" {...LINE} strokeWidth={2.6} />
        <path d="M26 40.5 Q32 44 38 40.5 Q35 43.5 32 43.5 Q29 43.5 26 40.5 Z" fill="#ff6f61" fillOpacity="0.5" stroke="none" />
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
        <circle cx="24.9" cy="27.1" r="0.9" fill="#ffffff" />
        <circle cx="40.9" cy="27.1" r="0.9" fill="#ffffff" />
        <path d="M20 22.5 L28 22.5 M36 22.5 L44 22.5" {...LINE} strokeWidth={2} />
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
        <circle cx="24.8" cy="28.2" r="0.8" fill="#ffffff" />
        <circle cx="40.8" cy="28.2" r="0.8" fill="#ffffff" />
        <path d="M22 41 Q25 38 28 41 Q31 44 34 41 Q37 38 40 41" {...LINE} strokeWidth={2.4} />
        <path d="M46 30 Q50 36 47 39 Q44 41 42.5 38 Q41.5 35 46 30 Z" fill="#4b8ff7" stroke="#10233f" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="45.4" cy="34.5" r="0.9" fill="#ffffff" fillOpacity="0.7" />
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
        <circle cx="25.8" cy="29.2" r="0.8" fill="#ffffff" />
        <circle cx="39.8" cy="29.2" r="0.8" fill="#ffffff" />
        <path d="M23 43 Q32 36 41 43" {...LINE} strokeWidth={2.6} />
        <path d="M22 34 Q19 40 21.5 42.5 Q24 44 25.5 41.5 Q26.5 38.5 22 34 Z" fill="#4b8ff7" stroke="#10233f" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="22.4" cy="39.4" r="0.8" fill="#ffffff" fillOpacity="0.7" />
      </FaceBase>
    </StickerBase>
  );
}

function SmileyWinkSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <FaceBase tint={tint}>
        <circle cx="24" cy="28" r="2.6" fill="#10233f" />
        <circle cx="24.9" cy="27.1" r="0.9" fill="#ffffff" />
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
        <path d="M46 14 L47 16.4 L49.4 17.4 L47 18.4 L46 20.8 L45 18.4 L42.6 17.4 L45 16.4 Z" fill="#ffffff" fillOpacity="0.8" stroke="none" />
        <path d="M16 12 L16.7 13.8 L18.5 14.5 L16.7 15.2 L16 17 L15.3 15.2 L13.5 14.5 L15.3 13.8 Z" fill="#ffffff" fillOpacity="0.7" stroke="none" />
      </FaceBase>
    </StickerBase>
  );
}

function BabySticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 9 Q36 4 40 7 Q38 11 33 12 Z" fill="#8a5a38" {...OUTLINE} strokeWidth={2} />
      <circle cx="32" cy="32" r="21" fill="#f6c9a0" {...OUTLINE} />
      <Shade cx={32} cy={32} r={21} opacity={0.07} />
      <path d="M13 28 Q18 14 32 12 Q46 14 51 28 Q46 24 38 23 Q44 26 45 30 Q38 24 28 24 Q19 25 14.5 31 Z" fill="#8a5a38" stroke="none" />
      <circle cx="24" cy="33" r="2.4" fill="#10233f" />
      <circle cx="40" cy="33" r="2.4" fill="#10233f" />
      <circle cx="24.9" cy="32.1" r="0.8" fill="#ffffff" />
      <circle cx="40.9" cy="32.1" r="0.8" fill="#ffffff" />
      <Smile x={32} y={40} w={9} curve={4} />
      <path d="M28.5 42.5 Q32 45 35.5 42.5 Q34 44.6 32 44.6 Q30 44.6 28.5 42.5 Z" fill="#ff6f61" fillOpacity="0.45" stroke="none" />
      <Cheeks lx={17} rx={47} y={39} r={3} />
      <circle cx="10" cy="32" r="3.4" fill="#f6c9a0" {...OUTLINE} strokeWidth={2} />
      <circle cx="54" cy="32" r="3.4" fill="#f6c9a0" {...OUTLINE} strokeWidth={2} />
      <Shine cx={25} cy={19} rx={4.4} ry={2.2} opacity={0.35} />
    </StickerBase>
  );
}

function StudentSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="32" cy="34" r="19" fill="#f6c9a0" {...OUTLINE} />
      <Shade cx={32} cy={34} r={19} opacity={0.07} />
      <path d="M15 32 Q17 20 32 18 Q47 20 49 32 Q42 26 32 26 Q22 26 15 32 Z" fill="#6b4226" stroke="none" />
      <path d="M10 16 L32 8 L54 16 L32 24 Z" fill="#10233f" {...OUTLINE} />
      <path d="M14 16.5 L32 10 L38 12.2 L20 18.7 Z" fill="#ffffff" fillOpacity="0.12" stroke="none" />
      <path d="M22 20 L22 14" stroke="#10233f" strokeWidth="2" />
      <path d="M54 16 L54 26" {...LINE} strokeWidth={2.2} stroke="#ffc94d" />
      <circle cx="54" cy="28.5" r="2.2" fill="#ffc94d" {...OUTLINE} strokeWidth={1.6} />
      <circle cx="25" cy="35" r="2.3" fill="#10233f" />
      <circle cx="39" cy="35" r="2.3" fill="#10233f" />
      <circle cx="25.8" cy="34.2" r="0.8" fill="#ffffff" />
      <circle cx="39.8" cy="34.2" r="0.8" fill="#ffffff" />
      <path d="M20 30 Q22.5 28.6 25 30 M36 30 Q38.5 28.6 41 30" stroke="#6b4226" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Smile x={32} y={41.5} w={9} curve={4} />
      <Cheeks lx={19} rx={45} y={40.5} r={2.7} />
    </StickerBase>
  );
}

const FAMILY_LOOKS = Object.freeze({
  mother: { hair: "#7b4428", shirt: "#ff8177", style: "long", accent: "flower" },
  father: { hair: "#3f3028", shirt: "#4b8ff7", style: "short", accent: "glasses" },
  sister: { hair: "#9b592f", shirt: "#9873e7", style: "long", accent: "bow" },
  brother: { hair: "#573b2a", shirt: "#46b982", style: "short", accent: "cap" },
  grandmother: { hair: "#d8d9df", shirt: "#c26fd8", style: "bun", accent: "glasses" },
  grandfather: { hair: "#d8d9df", shirt: "#5c82bd", style: "short", accent: "moustache" },
  aunt: { hair: "#522f25", shirt: "#ef6c9b", style: "long", accent: "earrings" },
  uncle: { hair: "#342923", shirt: "#e6a53c", style: "short", accent: "beard" },
  cousin: { hair: "#b96d34", shirt: "#29bfc3", style: "short", accent: "freckles" },
});

function FamilyPortraitSticker({ variant, size = 48, ...rest }) {
  const look = FAMILY_LOOKS[variant] ?? FAMILY_LOOKS.cousin;
  const older = variant === "grandmother" || variant === "grandfather";
  const child = variant === "sister" || variant === "brother" || variant === "cousin";
  const skin = variant === "aunt" || variant === "uncle" ? "#c9865b" : "#f2c49d";

  return (
    <StickerBase size={size} {...rest}>
      <path
        d={child ? "M14 61 Q17 44 32 43 Q47 44 50 61 Z" : "M10 62 Q14 42 32 41 Q50 42 54 62 Z"}
        fill={look.shirt}
        {...OUTLINE}
      />
      <circle cx="32" cy="28" r={child ? 17 : 19} fill={skin} {...OUTLINE} />
      {look.style === "long" ? (
        <path d="M14 34 Q9 14 22 8 Q32 1 45 9 Q56 18 49 43 L43 36 L43 19 Q32 25 20 19 L20 38 Z" fill={look.hair} {...OUTLINE} />
      ) : (
        <path d="M14 25 Q15 8 32 7 Q49 8 51 25 Q43 17 35 19 Q25 20 17 16 Z" fill={look.hair} {...OUTLINE} />
      )}
      {look.style === "bun" ? (
        <circle cx="45" cy="9" r="8" fill={look.hair} {...OUTLINE} />
      ) : null}
      <Eyes lx={25} rx={39} y={28} r={2.1} />
      <Smile x={32} y={36} w={9} curve={3.5} />
      <Cheeks lx={20} rx={44} y={35} r={2.5} />
      {older ? (
        <g fill="none" stroke="#8f654f" strokeWidth="1.2" strokeLinecap="round">
          <path d="M21 33 L17 34 M43 33 L47 34" />
          <path d="M24 39 Q32 42 40 39" />
        </g>
      ) : null}
      {look.accent === "glasses" ? (
        <g fill="none" stroke="#10233f" strokeWidth="1.8">
          <circle cx="24.5" cy="28" r="5" />
          <circle cx="39.5" cy="28" r="5" />
          <path d="M29.5 28 H34.5" />
        </g>
      ) : null}
      {look.accent === "flower" ? <text x="46" y="17" fontSize="13">✿</text> : null}
      {look.accent === "bow" ? <path d="M13 12 Q5 7 7 18 L15 16 L23 20 L24 8 L16 12 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={1.7} /> : null}
      {look.accent === "cap" ? <path d="M13 17 Q21 5 38 8 L46 16 Q31 13 15 21 Z" fill="#ffc94d" {...OUTLINE} /> : null}
      {look.accent === "moustache" ? <path d="M23 34 Q28 31 32 35 Q36 31 41 34 Q38 39 32 36 Q26 39 23 34 Z" fill="#a8a9ad" /> : null}
      {look.accent === "earrings" ? <g fill="#ffc94d"><circle cx="14" cy="31" r="2.5" /><circle cx="50" cy="31" r="2.5" /></g> : null}
      {look.accent === "beard" ? <path d="M20 35 Q32 48 44 35 Q43 47 32 50 Q21 47 20 35 Z" fill="#342923" fillOpacity=".8" /> : null}
      {look.accent === "freckles" ? <g fill="#9d5b42"><circle cx="20" cy="33" r=".8" /><circle cx="23" cy="34" r=".8" /><circle cx="41" cy="34" r=".8" /><circle cx="44" cy="33" r=".8" /></g> : null}
    </StickerBase>
  );
}

const FamilyMotherSticker = (props) => <FamilyPortraitSticker variant="mother" {...props} />;
const FamilyFatherSticker = (props) => <FamilyPortraitSticker variant="father" {...props} />;
const FamilySisterSticker = (props) => <FamilyPortraitSticker variant="sister" {...props} />;
const FamilyBrotherSticker = (props) => <FamilyPortraitSticker variant="brother" {...props} />;
const FamilyGrandmotherSticker = (props) => <FamilyPortraitSticker variant="grandmother" {...props} />;
const FamilyGrandfatherSticker = (props) => <FamilyPortraitSticker variant="grandfather" {...props} />;
const FamilyAuntSticker = (props) => <FamilyPortraitSticker variant="aunt" {...props} />;
const FamilyUncleSticker = (props) => <FamilyPortraitSticker variant="uncle" {...props} />;
const FamilyCousinSticker = (props) => <FamilyPortraitSticker variant="cousin" {...props} />;

function MaskHappySticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M12 10 Q32 16 52 10 Q56 32 46 46 Q39 55 32 55 Q25 55 18 46 Q8 32 12 10 Z" fill={tint ?? "#9873e7"} {...OUTLINE} />
      <path d="M18 44 Q25 52.5 32 52.5 Q39 52.5 46 44 Q40 53 32 53 Q24 53 18 44 Z" fill="#10233f" fillOpacity="0.16" stroke="none" />
      <Shine cx={22} cy={17} rx={5} ry={2.2} opacity={0.35} tilt={-12} />
      <path d="M18 24 Q23 20 28 24 Q23 30 18 24 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <path d="M36 24 Q41 20 46 24 Q41 30 36 24 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <circle cx="23" cy="24.4" r="1.3" fill="#10233f" />
      <circle cx="41" cy="24.4" r="1.3" fill="#10233f" />
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
  FamilyMother: FamilyMotherSticker,
  FamilyFather: FamilyFatherSticker,
  FamilySister: FamilySisterSticker,
  FamilyBrother: FamilyBrotherSticker,
  FamilyGrandmother: FamilyGrandmotherSticker,
  FamilyGrandfather: FamilyGrandfatherSticker,
  FamilyAunt: FamilyAuntSticker,
  FamilyUncle: FamilyUncleSticker,
  FamilyCousin: FamilyCousinSticker,
  MaskHappy: MaskHappySticker,
});
