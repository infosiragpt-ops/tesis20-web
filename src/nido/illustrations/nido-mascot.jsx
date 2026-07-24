const OUTLINE = Object.freeze({
  stroke: "#10233f",
  strokeWidth: 2.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
});

function ConfettiDots({ cx = 60, cy = 40, spread = 42 }) {
  const pieces = [
    { dx: -1, dy: -0.62, fill: "#ff6f61", r: 3 },
    { dx: -0.55, dy: -0.95, fill: "#ffc94d", r: 2.4 },
    { dx: 0.05, dy: -1.05, fill: "#46b982", r: 3 },
    { dx: 0.6, dy: -0.9, fill: "#4b8ff7", r: 2.4 },
    { dx: 1, dy: -0.55, fill: "#9873e7", r: 3 },
  ];
  return (
    <g>
      {pieces.map((piece, index) => (
        <circle
          cx={cx + piece.dx * spread}
          cy={cy + piece.dy * spread * 0.62}
          r={piece.r}
          fill={piece.fill}
          key={index}
        />
      ))}
    </g>
  );
}

export function NidoMascot({ pose = "hola", size = 96, ...rest }) {
  const cheering = pose === "cheer";
  const thinking = pose === "think";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {cheering ? <ConfettiDots /> : null}

      {/* colita */}
      <path d="M38 96 Q26 102 22 112 Q34 112 42 104 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.2} />

      {/* cuerpo */}
      <path d="M60 22 Q92 22 94 58 Q96 92 74 102 Q60 108 46 102 Q24 92 26 58 Q28 22 60 22 Z" fill="#1c3a5e" {...OUTLINE} strokeWidth={3} />
      {/* panza */}
      <path d="M60 58 Q78 58 78 78 Q78 98 60 100 Q42 98 42 78 Q42 58 60 58 Z" fill="#ffffff" stroke="none" />

      {/* alas */}
      {cheering ? (
        <g>
          <path d="M32 52 Q16 38 12 24 Q28 28 38 42 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
          <path d="M88 52 Q104 38 108 24 Q92 28 82 42 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
        </g>
      ) : thinking ? (
        <g>
          <path d="M30 62 Q18 72 20 86 Q32 82 38 72 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
          <path d="M86 62 Q94 52 88 42 Q78 46 76 56 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
        </g>
      ) : (
        <g>
          <path d="M30 62 Q18 72 20 86 Q32 82 38 72 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
          <path d="M90 50 Q104 40 106 26 Q92 30 84 42 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
        </g>
      )}

      {/* mejilla / zona del ojo */}
      <circle cx="47" cy="46" r="15" fill="#ffd3cd" stroke="none" />
      {cheering ? (
        <path d="M41 45 Q46 40 51 45" fill="none" stroke="#10233f" strokeWidth="2.6" strokeLinecap="round" />
      ) : (
        <g>
          <circle cx="47" cy="45" r="6.5" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
          <circle cx="48.5" cy="45.5" r="3" fill="#10233f" />
          <circle cx="49.6" cy="44.2" r="1" fill="#ffffff" />
        </g>
      )}
      {thinking ? (
        <path d="M39 33 Q44 30 49 33" fill="none" stroke="#10233f" strokeWidth="2.2" strokeLinecap="round" />
      ) : null}

      {/* pico bicolor */}
      <g>
        <path d="M60 44 Q86 38 104 48 Q100 58 84 60 L62 58 Z" fill="#ffc94d" {...OUTLINE} strokeWidth={2.6} />
        <path d="M62 58 L84 60 Q96 60 98 66 Q88 74 70 70 Q60 66 60 58 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={2.6} />
        <circle cx="98" cy="50" r="3.2" fill="#10233f" stroke="none" />
      </g>

      {/* patitas */}
      <path d="M50 102 L50 110 M46 110 L54 110 M70 102 L70 110 M66 110 L74 110" fill="none" stroke="#e8890c" strokeWidth="3.2" strokeLinecap="round" />

      {thinking ? (
        <g>
          <circle cx="98" cy="20" r="10" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
          <text
            x="98"
            y="26"
            textAnchor="middle"
            fontFamily="'Trebuchet MS', 'Arial Rounded MT Bold', sans-serif"
            fontWeight="900"
            fontSize="15"
            fill="#9873e7"
          >
            ?
          </text>
        </g>
      ) : null}
    </svg>
  );
}

function StepSceneBase({ className = "", children, ...rest }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

function Hand({ x, y, s = 1, skin = "#f6c9a0" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0 Q-2 -14 2 -16 Q6 -17 6 -8 L6 -2 Q10 -6 13 -3 Q16 0 12 4 L6 12 Q0 18 -6 12 Q-10 7 -8 2 Z"
        fill={skin}
        {...OUTLINE}
        strokeWidth={2.2}
      />
    </g>
  );
}

function StarShape({ x, y, s = 1, fill = "#ffc94d", outlined = true }) {
  return (
    <path
      d={`M${x} ${y - 7 * s} L${x + 2 * s} ${y - 2.2 * s} L${x + 7 * s} ${y - 2 * s} L${x + 3.2 * s} ${y + 1.4 * s} L${x + 4.4 * s} ${y + 6.4 * s} L${x} ${y + 3.6 * s} L${x - 4.4 * s} ${y + 6.4 * s} L${x - 3.2 * s} ${y + 1.4 * s} L${x - 7 * s} ${y - 2 * s} L${x - 2 * s} ${y - 2.2 * s} Z`}
      fill={fill}
      stroke={outlined ? "#10233f" : "none"}
      strokeWidth={outlined ? 1.6 : 0}
      strokeLinejoin="round"
    />
  );
}

function StepAgeScene({ className = "", ...rest }) {
  return (
    <StepSceneBase className={className} {...rest}>
      <rect width="200" height="150" rx="18" fill="#dff8f7" />
      <g>
        <rect x="18" y="36" width="48" height="62" rx="10" fill="#ffffff" {...OUTLINE} strokeWidth={2.2} />
        <circle cx="42" cy="58" r="12" fill="#ffd3cd" stroke="none" />
        <circle cx="38" cy="57" r="1.8" fill="#10233f" />
        <circle cx="46" cy="57" r="1.8" fill="#10233f" />
        <path d="M39 62 Q42 64.5 45 62" fill="none" stroke="#10233f" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="27" y="78" width="30" height="8" rx="4" fill="#cfe2ec" />
      </g>
      <g>
        <rect x="76" y="28" width="48" height="70" rx="10" fill="#fff3c9" stroke="#ffc94d" strokeWidth="3.4" />
        <circle cx="100" cy="52" r="13" fill="#ffc94d" stroke="none" />
        <circle cx="95.5" cy="51" r="2" fill="#10233f" />
        <circle cx="104.5" cy="51" r="2" fill="#10233f" />
        <path d="M96 57 Q100 60.5 104 57" fill="none" stroke="#10233f" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="85" y="74" width="30" height="8" rx="4" fill="#ffc94d" />
        <StarShape x={121} y={32} s={0.8} />
      </g>
      <g>
        <rect x="134" y="36" width="48" height="62" rx="10" fill="#ffffff" {...OUTLINE} strokeWidth={2.2} />
        <circle cx="158" cy="58" r="12" fill="#ddccff" stroke="none" />
        <circle cx="154" cy="57" r="1.8" fill="#10233f" />
        <circle cx="162" cy="57" r="1.8" fill="#10233f" />
        <path d="M155 62 Q158 64.5 161 62" fill="none" stroke="#10233f" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="143" y="78" width="30" height="8" rx="4" fill="#cfe2ec" />
      </g>
      <Hand x={104} y={112} s={1.2} />
    </StepSceneBase>
  );
}

function StepListenScene({ className = "", ...rest }) {
  return (
    <StepSceneBase className={className} {...rest}>
      <rect width="200" height="150" rx="18" fill="#fff3c9" />
      <g transform="translate(28 22) scale(0.88)">
        <path d="M38 96 Q26 102 22 112 Q34 112 42 104 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.2} />
        <path d="M60 22 Q92 22 94 58 Q96 92 74 102 Q60 108 46 102 Q24 92 26 58 Q28 22 60 22 Z" fill="#1c3a5e" {...OUTLINE} strokeWidth={3} />
        <path d="M60 58 Q78 58 78 78 Q78 98 60 100 Q42 98 42 78 Q42 58 60 58 Z" fill="#ffffff" stroke="none" />
        <path d="M30 62 Q18 72 20 86 Q32 82 38 72 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
        <circle cx="47" cy="46" r="15" fill="#ffd3cd" stroke="none" />
        <circle cx="47" cy="45" r="6.5" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
        <circle cx="48.5" cy="45.5" r="3" fill="#10233f" />
        <path d="M60 44 Q86 38 104 48 Q100 58 84 60 L62 58 Z" fill="#ffc94d" {...OUTLINE} strokeWidth={2.6} />
        <path d="M62 58 L84 60 Q96 60 98 66 Q88 74 70 70 Q60 66 60 58 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={2.6} />
        <path d="M50 102 L50 110 M46 110 L54 110 M70 102 L70 110 M66 110 L74 110" fill="none" stroke="#e8890c" strokeWidth="3.2" strokeLinecap="round" />
      </g>
      <g fill="none" stroke="#4b8ff7" strokeLinecap="round">
        <path d="M136 62 Q144 75 136 88" strokeWidth="4" />
        <path d="M150 52 Q162 75 150 98" strokeWidth="4.6" />
        <path d="M164 42 Q180 75 164 108" strokeWidth="5.2" />
      </g>
      <g>
        <path d="M116 30 L116 16 Q122 13 125 16 L125 27" fill="none" stroke="#9873e7" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="113.5" cy="30" rx="3.6" ry="2.8" fill="#9873e7" />
        <ellipse cx="122.5" cy="27" rx="3.6" ry="2.8" fill="#9873e7" />
      </g>
    </StepSceneBase>
  );
}

function StepTapScene({ className = "", ...rest }) {
  return (
    <StepSceneBase className={className} {...rest}>
      <rect width="200" height="150" rx="18" fill="#ffe3df" />
      <rect x="52" y="22" width="96" height="92" rx="14" fill="#ffffff" {...OUTLINE} strokeWidth={2.6} />
      <g transform="translate(70 30) scale(0.95)">
        <path d="M17 17 Q9 22 10 34 Q11 42 18 40 Q22 38 22 30 Z" fill="#8a5a38" {...OUTLINE} strokeWidth={2.2} />
        <path d="M47 17 Q55 22 54 34 Q53 42 46 40 Q42 38 42 30 Z" fill="#8a5a38" {...OUTLINE} strokeWidth={2.2} />
        <circle cx="32" cy="31" r="17" fill="#b07b4f" {...OUTLINE} strokeWidth={2.2} />
        <ellipse cx="32" cy="38" rx="9.5" ry="7" fill="#fff3c9" stroke="none" />
        <ellipse cx="32" cy="34" rx="3.2" ry="2.5" fill="#10233f" />
        <path d="M27 40 Q32 44 37 40" fill="none" stroke="#10233f" strokeWidth="2" strokeLinecap="round" />
        <circle cx="25" cy="27" r="2" fill="#10233f" />
        <circle cx="39" cy="27" r="2" fill="#10233f" />
      </g>
      <rect x="66" y="94" width="68" height="10" rx="5" fill="#cfe2ec" />
      <circle cx="148" cy="106" r="17" fill="#ffc94d" fillOpacity="0.35" stroke="none" />
      <Hand x={148} y={110} s={1.25} skin="#e0a878" />
      <StarShape x={40} y={40} s={1} />
      <StarShape x={166} y={34} s={0.8} fill="#ff6f61" />
      <StarShape x={28} y={98} s={0.7} fill="#46b982" />
    </StepSceneBase>
  );
}

function StepStarsScene({ className = "", ...rest }) {
  return (
    <StepSceneBase className={className} {...rest}>
      <rect width="200" height="150" rx="18" fill="#efe7ff" />
      <g>
        <path d="M74 34 L126 34 L122 76 Q118 96 100 96 Q82 96 78 76 Z" fill="#ffc94d" {...OUTLINE} strokeWidth={2.6} />
        <path d="M74 42 Q56 42 58 58 Q60 70 78 72 M126 42 Q144 42 142 58 Q140 70 122 72" fill="none" {...OUTLINE} strokeWidth={2.6} stroke="#ffc94d" />
        <path d="M74 42 Q56 42 58 58 Q60 70 78 72 M126 42 Q144 42 142 58 Q140 70 122 72" fill="none" stroke="#10233f" strokeWidth="1.2" strokeOpacity="0.4" />
        <rect x="92" y="96" width="16" height="12" fill="#e8b53a" {...OUTLINE} strokeWidth={2.2} />
        <rect x="78" y="108" width="44" height="12" rx="4" fill="#b07b4f" {...OUTLINE} strokeWidth={2.2} />
        <circle cx="94" cy="58" r="2.2" fill="#10233f" />
        <circle cx="106" cy="58" r="2.2" fill="#10233f" />
        <path d="M95 65 Q100 69 105 65" fill="none" stroke="#10233f" strokeWidth="2" strokeLinecap="round" />
      </g>
      <StarShape x={48} y={38} s={1.3} />
      <StarShape x={152} y={38} s={1.3} />
      <StarShape x={34} y={78} s={0.9} fill="#ff6f61" />
      <StarShape x={166} y={78} s={0.9} fill="#46b982" />
      <circle cx="58" cy="112" r="3.4" fill="#4b8ff7" />
      <circle cx="144" cy="114" r="3.4" fill="#ff6f61" />
      <circle cx="40" cy="128" r="2.6" fill="#9873e7" />
      <circle cx="162" cy="128" r="2.6" fill="#ffc94d" />
    </StepSceneBase>
  );
}

export const STEP_SCENES = Object.freeze([
  { id: "elige-edad", Component: StepAgeScene },
  { id: "escucha-la-guia", Component: StepListenScene },
  { id: "toca-tu-respuesta", Component: StepTapScene },
  { id: "gana-estrellas", Component: StepStarsScene },
]);

export function CelebrationBurst({ size = 220, ...rest }) {
  const ribbons = [
    { d: "M120 34 Q112 22 120 10", stroke: "#ff6f61" },
    { d: "M170 52 Q182 42 180 28", stroke: "#46b982" },
    { d: "M204 108 Q218 104 226 92", stroke: "#ffc94d" },
    { d: "M196 170 Q210 176 214 190", stroke: "#9873e7" },
    { d: "M120 206 Q126 220 118 232", stroke: "#4b8ff7" },
    { d: "M50 172 Q36 178 30 192", stroke: "#ff6f61" },
    { d: "M36 108 Q22 104 14 92", stroke: "#46b982" },
    { d: "M68 52 Q56 42 58 28", stroke: "#9873e7" },
  ];
  const dots = [
    { cx: 92, cy: 26, r: 4, fill: "#ffc94d" },
    { cx: 150, cy: 22, r: 3.4, fill: "#9873e7" },
    { cx: 208, cy: 60, r: 4, fill: "#ff6f61" },
    { cx: 226, cy: 130, r: 3.4, fill: "#46b982" },
    { cx: 216, cy: 200, r: 4, fill: "#4b8ff7" },
    { cx: 152, cy: 226, r: 3.4, fill: "#ffc94d" },
    { cx: 88, cy: 224, r: 4, fill: "#9873e7" },
    { cx: 26, cy: 196, r: 3.4, fill: "#ffc94d" },
    { cx: 16, cy: 128, r: 4, fill: "#ff6f61" },
    { cx: 30, cy: 62, r: 3.4, fill: "#4b8ff7" },
  ];

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {ribbons.map((ribbon, index) => (
        <path
          d={ribbon.d}
          fill="none"
          stroke={ribbon.stroke}
          strokeWidth="4.4"
          strokeLinecap="round"
          key={index}
        />
      ))}
      {dots.map((dot, index) => (
        <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.fill} key={index} />
      ))}
      <StarShape x={64} y={84} s={1.4} />
      <StarShape x={180} y={78} s={1.2} fill="#ff6f61" />
      <StarShape x={196} y={152} s={1} fill="#46b982" />
      <StarShape x={46} y={150} s={1} fill="#9873e7" />
      <StarShape x={120} y={40} s={1.1} />
    </svg>
  );
}

export const NIDO_MASCOT_EXPORTS = Object.freeze({
  NidoMascot,
  STEP_SCENES,
  CelebrationBurst,
});
