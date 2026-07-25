import { Ground, LINE, OUTLINE, Shine, StickerBase } from "./sticker-base.jsx";

function HouseSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={55.5} rx={20} ry={2.6} />
      <rect x="14" y="28" width="36" height="26" rx="2" fill="#fff3c9" {...OUTLINE} />
      <path d="M14 50 L50 50 L50 52 Q50 54 48 54 L16 54 Q14 54 14 52 Z" fill="#e6d9a8" stroke="none" />
      <path d="M10 30 L32 10 L54 30 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M14 26.4 L32 10 L36 13.6 L18 30 Z" fill="#ffffff" fillOpacity="0.18" stroke="none" />
      <rect x="27" y="38" width="10" height="16" rx="1.5" fill="#8a5a38" {...OUTLINE} strokeWidth={2.2} />
      <path d="M29 40 L29 52" stroke="#6b4226" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="34.5" cy="46" r="1.3" fill="#ffc94d" />
      <rect x="18" y="34" width="7" height="7" rx="1.5" fill="#4b8ff7" {...OUTLINE} strokeWidth={2} />
      <rect x="39" y="34" width="7" height="7" rx="1.5" fill="#4b8ff7" {...OUTLINE} strokeWidth={2} />
      <path d="M19 35 L24 40 M39.5 35.5 L44.5 40.5" stroke="#ffffff" strokeWidth="1.3" strokeOpacity="0.6" strokeLinecap="round" />
      <circle cx="32" cy="22" r="3.4" fill="#fff3c9" {...OUTLINE} strokeWidth={2} />
      <path d="M20 54 Q22 49 25 54 M43 54 Q45 49 48 54" stroke="#46b982" strokeWidth="2" fill="none" strokeLinecap="round" />
    </StickerBase>
  );
}

function DoorSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M14 56 L14 14 Q14 8 20 8 L44 8 Q50 8 50 14 L50 56 Z" fill="#b07b4f" {...OUTLINE} />
      <path d="M20 56 L20 18 Q20 14 24 14 L40 14 Q44 14 44 18 L44 56 Z" fill="#8a5a38" stroke="none" />
      <rect x="25" y="19" width="14" height="12" rx="2" fill="#b07b4f" stroke="#6b4226" strokeWidth="1.8" />
      <rect x="25" y="36" width="14" height="14" rx="2" fill="#b07b4f" stroke="#6b4226" strokeWidth="1.8" />
      <path d="M27 21 L31 21" stroke="#d9a878" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M27 38 L33 38" stroke="#d9a878" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="40" cy="33" r="2.6" fill="#ffc94d" {...OUTLINE} strokeWidth={1.8} />
      <circle cx="39.3" cy="32.3" r="0.8" fill="#ffffff" fillOpacity="0.8" />
      <path d="M8 56 L56 56" {...LINE} strokeWidth={2.6} />
      <Shine cx={22} cy={12} rx={3.6} ry={1.6} opacity={0.3} />
    </StickerBase>
  );
}

function ChairSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={56} rx={16} ry={2.4} />
      <path d="M20 8 Q18 8 18 11 L18 32 L46 32 L46 11 Q46 8 44 8 Z" fill="#b07b4f" {...OUTLINE} />
      <rect x="22" y="13" width="20" height="5" rx="2.5" fill="#8a5a38" stroke="none" />
      <rect x="22" y="22" width="20" height="5" rx="2.5" fill="#8a5a38" stroke="none" />
      <rect x="15" y="32" width="34" height="7" rx="3" fill="#ffc94d" {...OUTLINE} />
      <path d="M18 34.5 L28 34.5" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.55" strokeLinecap="round" />
      <path d="M19 39 L19 55 M45 39 L45 55" {...LINE} strokeWidth={3.4} stroke="#8a5a38" />
      <path d="M19 39 L19 55 M45 39 L45 55" fill="none" stroke="#10233f" strokeWidth="1.2" strokeOpacity="0.35" />
      <Shine cx={24} cy={11} rx={3.4} ry={1.4} opacity={0.3} />
    </StickerBase>
  );
}

function BedSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={53} rx={22} ry={2.4} />
      <path d="M10 18 L10 50 M54 26 L54 50" {...LINE} strokeWidth={3.2} />
      <path d="M10 34 L54 34 L54 44 L10 44 Z" fill="#9873e7" {...OUTLINE} />
      <path d="M10 41 L54 41 L54 44 L10 44 Z" fill="#7a55c9" stroke="none" />
      <path d="M10 34 Q10 26 18 26 L46 26 Q54 26 54 34 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M14 30 Q22 27.5 32 27.5 Q42 27.5 50 30" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      <path d="M13 26.5 Q12 20 18 20 L26 20 Q31 20 30 26.5 Q29 30 21.5 30 Q14 30 13 26.5 Z" fill="#ffffff" {...OUTLINE} strokeWidth={2.2} />
      <Shine cx={19} cy={23} rx={3.4} ry={1.5} opacity={0.6} />
      <path d="M16 44 L16 50 M48 44 L48 50" {...LINE} strokeWidth={3.2} />
      <path d="M36 15 L37 17.6 L39.6 18.6 L37 19.6 L36 22.2 L35 19.6 L32.4 18.6 L35 17.6 Z" fill="#ffc94d" stroke="none" />
      <path d="M46 8 L46.8 10 L48.8 10.8 L46.8 11.6 L46 13.6 L45.2 11.6 L43.2 10.8 L45.2 10 Z" fill="#ffc94d" stroke="none" />
      <path d="M52 16 L52 18.4 M50.8 17.2 L53.2 17.2" stroke="#ffc94d" strokeWidth="1.3" strokeLinecap="round" />
    </StickerBase>
  );
}

function CarSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={53.5} rx={22} ry={2.6} />
      <path d="M8 40 Q8 32 14 31 L18 22 Q19 19 23 19 L41 19 Q45 19 46 22 L50 31 Q56 32 56 40 L56 43 Q56 46 53 46 L11 46 Q8 46 8 43 Z" fill="#4b8ff7" {...OUTLINE} />
      <path d="M9 41 L55 41 L55 43 Q55 45 53 45 L11 45 Q9 45 9 43 Z" fill="#2f6fd6" fillOpacity="0.7" stroke="none" />
      <path d="M21 23 Q21.5 22 23 22 L30 22 L30 30 L18.5 30 Z" fill="#dff8f7" {...OUTLINE} strokeWidth={2} />
      <path d="M34 22 L41 22 Q42.5 22 43 23 L45.5 30 L34 30 Z" fill="#dff8f7" {...OUTLINE} strokeWidth={2} />
      <path d="M22 23.5 L27 28.5" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
      <path d="M36 23.5 L41 28.5" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
      <circle cx="19" cy="46" r="6" fill="#10233f" />
      <circle cx="19" cy="46" r="2.6" fill="#cfe2ec" />
      <circle cx="17.8" cy="44.8" r="0.9" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="45" cy="46" r="6" fill="#10233f" />
      <circle cx="45" cy="46" r="2.6" fill="#cfe2ec" />
      <circle cx="43.8" cy="44.8" r="0.9" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="53" cy="37" r="2" fill="#ffc94d" />
      <circle cx="11" cy="37" r="1.6" fill="#ff9a3d" />
      <path d="M26 38 Q32 41 38 38" {...LINE} strokeWidth={1.8} />
      <Shine cx={16} cy={34} rx={3.6} ry={1.5} opacity={0.35} />
    </StickerBase>
  );
}

function BoatSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M31 8 L31 34" {...LINE} strokeWidth={2.8} />
      <path d="M31 10 Q48 14 48 30 L34 30 Z" fill="#ffc94d" {...OUTLINE} />
      <path d="M35 14 Q43 18 44 27" stroke="#e6a93c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M28 14 Q16 18 15 30 L28 30 Z" fill="#ff6f61" {...OUTLINE} />
      <path d="M24 17 Q18 21 17.5 28" stroke="#dc5048" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M10 38 L54 38 L48 50 Q46 53 42 53 L22 53 Q18 53 16 50 Z" fill="#4b8ff7" {...OUTLINE} />
      <path d="M12 42 L52 42" stroke="#2f6fd6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="45" r="2.4" fill="#dff8f7" stroke="#10233f" strokeWidth="1.6" />
      <circle cx="38" cy="45" r="2.4" fill="#dff8f7" stroke="#10233f" strokeWidth="1.6" />
      <path d="M4 58 Q10 54 16 58 Q22 62 28 58 Q34 54 40 58 Q46 62 52 58 Q56 55 60 58" {...LINE} stroke="#29c7c9" strokeWidth={2.8} />
      <circle cx="20" cy="56" r="1" fill="#ffffff" fillOpacity="0.9" />
      <circle cx="44" cy="56.5" r="1" fill="#ffffff" fillOpacity="0.9" />
      <path d="M27 10 L31 8" stroke="#ff6f61" strokeWidth="2.2" strokeLinecap="round" />
    </StickerBase>
  );
}

function BicycleSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={54.5} rx={24} ry={2.4} />
      <circle cx="16" cy="42" r="11" fill="#dff8f7" {...OUTLINE} />
      <path d="M16 33.5 L16 42 L22 48 M16 42 L8 46 M16 42 L10 35" stroke="#9fc2d8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="42" r="3" fill="#10233f" />
      <circle cx="48" cy="42" r="11" fill="#dff8f7" {...OUTLINE} />
      <path d="M48 33.5 L48 42 L54 48 M48 42 L40 46 M48 42 L42 35" stroke="#9fc2d8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="42" r="3" fill="#10233f" />
      <path d="M16 42 L26 24 L42 24 L48 42 M26 24 L33 42 L48 42 M33 42 L16 42" fill="none" {...OUTLINE} stroke="#ff6f61" strokeWidth={3} />
      <path d="M23 18 L29 18 M26 18 L26 24" {...LINE} strokeWidth={2.6} />
      <path d="M40 19 L44 24 M37 19 L43 19" {...LINE} strokeWidth={2.6} />
      <circle cx="33" cy="42" r="2.6" fill="#ffc94d" {...OUTLINE} strokeWidth={1.6} />
      <circle cx="32.3" cy="41.3" r="0.7" fill="#ffffff" fillOpacity="0.8" />
    </StickerBase>
  );
}

function PackageSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <Ground cx={32} cy={56} rx={18} ry={2.4} />
      <path d="M32 8 L54 18 L54 44 L32 54 L10 44 L10 18 Z" fill="#b07b4f" {...OUTLINE} />
      <path d="M10 18 L32 28 L54 18 M32 28 L32 54" fill="none" {...OUTLINE} strokeWidth={2.2} />
      <path d="M32 28 L54 18 L54 44 L32 54 Z" fill="#8a5a38" stroke="none" />
      <path d="M32 8 L54 18 L54 44 L32 54 L10 44 L10 18 Z" fill="none" {...OUTLINE} />
      <path d="M32 28 L32 54 M10 18 L32 28 L54 18" fill="none" stroke="#10233f" strokeWidth="2" />
      <path d="M21 13 L43 23 L43 32 L39 30 L39 21 L17 11 Z" fill="#ffc94d" stroke="#10233f" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 21 L18 23.3 M13 25 L18 27.3" stroke="#8a5a38" strokeWidth="1.4" strokeLinecap="round" />
      <Shine cx={18} cy={14} rx={3.2} ry={1.4} opacity={0.3} tilt={22} />
    </StickerBase>
  );
}

function ClockSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M12 10 Q6 14 8 20 M52 10 Q58 14 56 20" {...LINE} strokeWidth={3} stroke="#ff6f61" />
      <circle cx="32" cy="34" r="21" fill="#ff6f61" {...OUTLINE} />
      <circle cx="32" cy="34" r="15.5" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
      <path d="M22 42 Q32 48 42 42 Q38 46.5 32 46.5 Q26 46.5 22 42 Z" fill="#f0dede" fillOpacity="0.7" stroke="none" />
      <path d="M32 24 L32 34 L39 38" fill="none" stroke="#10233f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="34" r="1.8" fill="#10233f" />
      <circle cx="32" cy="22" r="1.2" fill="#547087" />
      <circle cx="44" cy="34" r="1.2" fill="#547087" />
      <circle cx="32" cy="46" r="1.2" fill="#547087" />
      <circle cx="20" cy="34" r="1.2" fill="#547087" />
      <path d="M32 10 L32 13" {...LINE} strokeWidth={3} />
      <Shine cx={25} cy={25} rx={3.6} ry={1.7} opacity={0.5} />
    </StickerBase>
  );
}

export const HOME_VEHICLE_STICKERS = Object.freeze({
  House: HouseSticker,
  Door: DoorSticker,
  Chair: ChairSticker,
  Bed: BedSticker,
  Car: CarSticker,
  Boat: BoatSticker,
  Bicycle: BicycleSticker,
  Package: PackageSticker,
  Clock: ClockSticker,
});
