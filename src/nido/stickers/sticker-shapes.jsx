import { OUTLINE, StickerBase } from "./sticker-base.jsx";

// Con tintes oscuros (negro, marrón, morado) la carita navy desaparece:
// calculamos la luminancia del tinte para elegir tinta clara u oscura.
function inkFor(tint, fallback = "#10233f") {
  if (!tint || !/^#[0-9a-fA-F]{6}$/.test(tint)) return fallback;
  const r = parseInt(tint.slice(1, 3), 16);
  const g = parseInt(tint.slice(3, 5), 16);
  const b = parseInt(tint.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110 ? "#ffffff" : "#10233f";
}

function TinyFace({ x = 32, y = 32, ink = "#10233f" }) {
  return (
    <g>
      <circle cx={x - 4} cy={y - 1.5} r="1.7" fill={ink} />
      <circle cx={x + 4} cy={y - 1.5} r="1.7" fill={ink} />
      <path
        d={`M${x - 3} ${y + 3} Q${x} ${y + 5.5} ${x + 3} ${y + 3}`}
        fill="none"
        stroke={ink}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
  );
}

function CircleSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle cx="32" cy="32" r="22" fill={tint ?? "#ff6f61"} {...OUTLINE} />
      <ellipse cx="24" cy="19" rx="5" ry="2.6" fill="#ffffff" fillOpacity="0.45" />
      <TinyFace y={34} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function SquareSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <rect x="12" y="12" width="40" height="40" rx="5" fill={tint ?? "#4b8ff7"} {...OUTLINE} />
      <ellipse cx="23" cy="19" rx="5" ry="2.4" fill="#ffffff" fillOpacity="0.45" />
      <TinyFace y={34} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function TriangleSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 9 L56 52 L8 52 Z" fill={tint ?? "#46b982"} {...OUTLINE} />
      <ellipse cx="29" cy="26" rx="3.6" ry="2" fill="#ffffff" fillOpacity="0.45" />
      <TinyFace y={42} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function RectangleSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <rect x="6" y="20" width="52" height="24" rx="4" fill={tint ?? "#ffc94d"} {...OUTLINE} />
      <ellipse cx="17" cy="26" rx="5" ry="2.2" fill="#ffffff" fillOpacity="0.5" />
      <TinyFace y={32} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function PentagonSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 8 L54.8 24.6 L46.1 51.4 L17.9 51.4 L9.2 24.6 Z" fill={tint ?? "#9873e7"} {...OUTLINE} />
      <ellipse cx="25" cy="21" rx="4.4" ry="2.2" fill="#ffffff" fillOpacity="0.45" />
      <TinyFace y={34} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function HexagonSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M20 11.2 L44 11.2 L56 32 L44 52.8 L20 52.8 L8 32 Z" fill={tint ?? "#29c7c9"} {...OUTLINE} />
      <ellipse cx="25" cy="19" rx="4.6" ry="2.2" fill="#ffffff" fillOpacity="0.45" />
      <TinyFace y={34} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function StarSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 6 L38.6 24.2 L58 24.8 L42.6 36.6 L48.1 55.2 L32 44.4 L15.9 55.2 L21.4 36.6 L6 24.8 L25.4 24.2 Z" fill={tint ?? "#ffc94d"} {...OUTLINE} />
      <ellipse cx="27" cy="22" rx="3.6" ry="2" fill="#ffffff" fillOpacity="0.5" />
      <TinyFace y={34} ink={inkFor(tint)} />
    </StickerBase>
  );
}

function CubeSticker({ size = 48, tint, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <path d="M32 6 L54 17 L54 43 L32 54 L10 43 L10 17 Z" fill={tint ?? "#4b8ff7"} {...OUTLINE} />
      <path d="M10 17 L32 28 L54 17" fill="none" {...OUTLINE} strokeWidth={2.2} />
      <path d="M32 28 L32 54" fill="none" {...OUTLINE} strokeWidth={2.2} />
      <path d="M32 28 L54 17 L54 43 L32 54 Z" fill="#10233f" fillOpacity="0.26" stroke="none" />
      <path d="M32 6 L54 17 L54 43 L32 54 L10 43 L10 17 Z" fill="none" {...OUTLINE} />
      <TinyFace x={21.5} y={38} ink={inkFor(tint, "#ffffff")} />
    </StickerBase>
  );
}

function CircleDashedSticker({ size = 48, ...rest }) {
  return (
    <StickerBase size={size} {...rest}>
      <circle
        cx="32"
        cy="32"
        r="21"
        fill="#edf9ff"
        stroke="#547087"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="7 8"
      />
      <path
        d="M32 24 L32 40 M24 32 L40 32"
        stroke="#547087"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
    </StickerBase>
  );
}

export const SHAPE_STICKERS = Object.freeze({
  Circle: CircleSticker,
  Square: SquareSticker,
  Triangle: TriangleSticker,
  Rectangle: RectangleSticker,
  Pentagon: PentagonSticker,
  Hexagon: HexagonSticker,
  Star: StarSticker,
  Cube: CubeSticker,
  CircleDashed: CircleDashedSticker,
});
