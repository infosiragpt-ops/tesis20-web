export const OUTLINE = Object.freeze({
  stroke: "#10233f",
  strokeWidth: 2.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
});

export const LINE = Object.freeze({
  fill: "none",
  stroke: "#10233f",
  strokeWidth: 2,
  strokeLinejoin: "round",
  strokeLinecap: "round",
});

// `tint` se descarta aquí para que los stickers que no lo usan puedan
// recibirlo sin que llegue como atributo desconocido al <svg>.
export function StickerBase({ size = 48, children, tint, ...rest }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function Eyes({ lx = 25, rx = 39, y = 27, r = 2.1 }) {
  return (
    <g>
      <circle cx={lx} cy={y} r={r} fill="#10233f" />
      <circle cx={rx} cy={y} r={r} fill="#10233f" />
      <circle cx={lx + 0.8} cy={y - 0.8} r={r * 0.32} fill="#ffffff" />
      <circle cx={rx + 0.8} cy={y - 0.8} r={r * 0.32} fill="#ffffff" />
    </g>
  );
}

export function Cheeks({ lx = 21, rx = 43, y = 33, r = 2.6 }) {
  return (
    <g fill="#ffb3ab" fillOpacity="0.55">
      <circle cx={lx} cy={y} r={r} />
      <circle cx={rx} cy={y} r={r} />
    </g>
  );
}

export function Smile({ x = 32, y = 36, w = 8, curve = 3.5, color = "#10233f" }) {
  return (
    <path
      d={`M${x - w / 2} ${y} Q${x} ${y + curve} ${x + w / 2} ${y}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}
