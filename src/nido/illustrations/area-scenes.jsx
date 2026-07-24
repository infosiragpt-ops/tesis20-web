const OUTLINE = Object.freeze({
  stroke: "#10233f",
  strokeWidth: 2.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
});

const CHUNKY_FONT =
  "'Arial Rounded MT Bold', 'Trebuchet MS', 'Arial Black', sans-serif";

function SceneBase({ className = "", children, ...rest }) {
  return (
    <svg
      viewBox="0 0 320 130"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      {...rest}
    >
      {children}
    </svg>
  );
}

function TinyFace({ x, y, s = 1, ink = "#10233f" }) {
  return (
    <g>
      <circle cx={x - 4 * s} cy={y} r={1.6 * s} fill={ink} />
      <circle cx={x + 4 * s} cy={y} r={1.6 * s} fill={ink} />
      <path
        d={`M${x - 2.6 * s} ${y + 3.6 * s} Q${x} ${y + 5.6 * s} ${x + 2.6 * s} ${y + 3.6 * s}`}
        fill="none"
        stroke={ink}
        strokeWidth={1.6 * s}
        strokeLinecap="round"
      />
    </g>
  );
}

function StarShape({ x, y, s = 1, fill = "#ffc94d" }) {
  return (
    <path
      d={`M${x} ${y - 6 * s} L${x + 1.7 * s} ${y - 1.9 * s} L${x + 6 * s} ${y - 1.7 * s} L${x + 2.7 * s} ${y + 1.2 * s} L${x + 3.7 * s} ${y + 5.5 * s} L${x} ${y + 3.1 * s} L${x - 3.7 * s} ${y + 5.5 * s} L${x - 2.7 * s} ${y + 1.2 * s} L${x - 6 * s} ${y - 1.7 * s} L${x - 1.7 * s} ${y - 1.9 * s} Z`}
      fill={fill}
      stroke="#10233f"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  );
}

function LogicaScene({ className = "", ...rest }) {
  return (
    <SceneBase className={className} {...rest}>
      <rect width="320" height="130" fill="#ffe3df" />
      <path d="M-10 112 Q80 92 170 108 Q250 120 330 104 L330 140 L-10 140 Z" fill="#ffd3cd" />
      <g>
        <path d="M34 34 L62 34 L62 46 Q70 40 72 50 Q70 60 62 54 L62 78 L48 78 Q54 86 44 88 Q34 86 40 78 L34 78 Z" fill="#ff6f61" {...OUTLINE} />
        <TinyFace x={48} y={54} s={1.1} />
      </g>
      <g>
        <path d="M96 42 L124 42 L124 54 Q116 48 114 58 Q116 68 124 62 L124 86 L110 86 Q116 94 106 96 Q96 94 102 86 L96 86 Z" fill="#4b8ff7" {...OUTLINE} />
        <TinyFace x={110} y={62} s={1.1} ink="#ffffff" />
      </g>
      <g>
        <circle cx="196" cy="56" r="22" fill="#dff8f7" {...OUTLINE} strokeWidth={3.4} />
        <circle cx="196" cy="56" r="14" fill="#ffffff" stroke="#29c7c9" strokeWidth="2.6" />
        <path d="M212 72 L228 88" {...OUTLINE} strokeWidth={5.5} stroke="#b07b4f" fill="none" />
        <path d="M190 52 L194 58 L203 48" fill="none" stroke="#46b982" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g>
        <circle cx="268" cy="46" r="11" fill="#ffc94d" {...OUTLINE} strokeWidth={2} />
        <rect x="284" y="35" width="22" height="22" rx="4" fill="#46b982" {...OUTLINE} strokeWidth={2} />
        <path d="M262 76 L280 76 L271 60 Z" fill="#9873e7" {...OUTLINE} strokeWidth={2} />
        <path d="M290 66 L302 66 M296 60 L296 72" stroke="#10233f" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <StarShape x={152} y={30} s={1} />
      <StarShape x={244} y={102} s={0.9} fill="#ff6f61" />
    </SceneBase>
  );
}

function MatematicasScene({ className = "", ...rest }) {
  return (
    <SceneBase className={className} {...rest}>
      <rect width="320" height="130" fill="#fff3c9" />
      <path d="M-10 110 Q90 92 180 106 Q260 118 330 102 L330 140 L-10 140 Z" fill="#ffe6a3" />
      <g fontFamily={CHUNKY_FONT} fontWeight="900" textAnchor="middle">
        <text x="46" y="72" fontSize="52" fill="#ff6f61" stroke="#10233f" strokeWidth="1.6">1</text>
        <text x="100" y="80" fontSize="52" fill="#4b8ff7" stroke="#10233f" strokeWidth="1.6">2</text>
        <text x="154" y="70" fontSize="52" fill="#46b982" stroke="#10233f" strokeWidth="1.6">3</text>
      </g>
      <g>
        <rect x="196" y="30" width="100" height="70" rx="10" fill="#ffffff" {...OUTLINE} />
        <path d="M206 48 L286 48 M206 66 L286 66 M206 84 L286 84" stroke="#cfe2ec" strokeWidth="3" strokeLinecap="round" />
        <circle cx="216" cy="48" r="6.5" fill="#ff6f61" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="232" cy="48" r="6.5" fill="#ff6f61" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="278" cy="66" r="6.5" fill="#4b8ff7" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="262" cy="66" r="6.5" fill="#4b8ff7" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="246" cy="66" r="6.5" fill="#4b8ff7" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="216" cy="84" r="6.5" fill="#46b982" {...OUTLINE} strokeWidth={1.8} />
      </g>
      <StarShape x={178} y={26} s={0.9} />
      <circle cx="24" cy="26" r="6" fill="#9873e7" fillOpacity="0.7" />
      <circle cx="304" cy="116" r="5" fill="#ff6f61" fillOpacity="0.7" />
    </SceneBase>
  );
}

function AtencionScene({ className = "", ...rest }) {
  return (
    <SceneBase className={className} {...rest}>
      <rect width="320" height="130" fill="#dff8f7" />
      <path d="M-10 110 Q90 92 180 106 Q260 118 330 102 L330 140 L-10 140 Z" fill="#bceceb" />
      <g>
        <path d="M60 26 Q84 26 86 48 Q88 60 80 66 Q84 74 76 78 Q70 82 62 78 Q48 84 42 72 Q32 68 36 56 Q32 44 42 38 Q46 26 60 26 Z" fill="#ffd3cd" {...OUTLINE} strokeWidth={2.8} />
        <path d="M56 38 Q62 44 56 50 M68 36 Q64 44 70 50 M50 58 Q58 60 64 56 M70 60 Q74 64 70 70" fill="none" stroke="#dc5048" strokeWidth="2.2" strokeLinecap="round" />
        <TinyFace x={60} y={62} s={1.2} />
      </g>
      <g>
        <rect x="128" y="34" width="52" height="66" rx="9" fill="#ffffff" {...OUTLINE} />
        <StarShape x={154} y={62} s={1.6} />
        <rect x="192" y="34" width="52" height="66" rx="9" fill="#ffffff" {...OUTLINE} />
        <StarShape x={218} y={62} s={1.6} />
        <path d="M148 110 Q162 118 176 110 M212 110 Q226 118 240 110" fill="none" stroke="#29c7c9" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g>
        <circle cx="284" cy="56" r="15" fill="#ffffff" {...OUTLINE} strokeWidth={2.4} />
        <circle cx="284" cy="56" r="6.5" fill="#4b8ff7" />
        <circle cx="286" cy="54" r="2" fill="#ffffff" />
        <path d="M266 42 Q276 34 290 36 M266 70 Q276 78 290 76" fill="none" stroke="#10233f" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <StarShape x={110} y={28} s={0.8} fill="#ff6f61" />
    </SceneBase>
  );
}

function HablaScene({ className = "", ...rest }) {
  return (
    <SceneBase className={className} {...rest}>
      <rect width="320" height="130" fill="#e3f1ff" />
      <path d="M-10 110 Q90 92 180 106 Q260 118 330 102 L330 140 L-10 140 Z" fill="#c8e4ff" />
      <g>
        <path d="M28 30 Q28 18 42 18 L96 18 Q110 18 110 30 L110 52 Q110 64 96 64 L56 64 L40 78 L44 64 Q28 64 28 52 Z" fill="#ffffff" {...OUTLINE} />
        <text x="69" y="50" textAnchor="middle" fontFamily={CHUNKY_FONT} fontWeight="900" fontSize="24" fill="#4b8ff7">la</text>
      </g>
      <g>
        <path d="M130 44 Q130 32 144 32 L192 32 Q206 32 206 44 L206 62 Q206 74 192 74 L166 74 L184 88 L162 74 Q130 74 130 62 Z" fill="#ffc94d" {...OUTLINE} />
        <text x="168" y="60" textAnchor="middle" fontFamily={CHUNKY_FONT} fontWeight="900" fontSize="22" fill="#10233f">le li</text>
      </g>
      <g>
        <rect x="238" y="26" width="22" height="40" rx="11" fill="#ff6f61" {...OUTLINE} />
        <path d="M232 52 Q232 74 249 74 Q266 74 266 52" fill="none" {...OUTLINE} strokeWidth={2.8} />
        <path d="M249 74 L249 86 M240 88 Q249 84 258 88" fill="none" {...OUTLINE} strokeWidth={2.8} />
      </g>
      <g fill="none" stroke="#4b8ff7" strokeLinecap="round">
        <path d="M282 38 Q288 52 282 66" strokeWidth="3.4" />
        <path d="M294 30 Q303 52 294 74" strokeWidth="4" />
      </g>
      <path d="M60 96 Q80 112 100 96" fill="none" stroke="#ff6f61" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M56 92 Q60 88 64 92 M96 92 Q100 88 104 92" fill="none" stroke="#ff6f61" strokeWidth="3" strokeLinecap="round" />
      <StarShape x={222} y={102} s={0.9} />
    </SceneBase>
  );
}

function InglesScene({ className = "", ...rest }) {
  return (
    <SceneBase className={className} {...rest}>
      <rect width="320" height="130" fill="#efe7ff" />
      <path d="M-10 110 Q90 92 180 106 Q260 118 330 102 L330 140 L-10 140 Z" fill="#ddccff" />
      <path d="M22 18 L22 66 M22 20 L58 20 L50 32 L58 44 L22 44" fill="#ff6f61" {...OUTLINE} strokeWidth={2.2} />
      <g>
        <rect x="76" y="30" width="64" height="46" rx="8" fill="#ffffff" {...OUTLINE} />
        <text x="108" y="52" textAnchor="middle" fontFamily={CHUNKY_FONT} fontWeight="900" fontSize="17" fill="#9873e7">CAT</text>
        <path d="M96 62 Q100 56 104 62 M104 62 Q108 56 112 62" fill="none" stroke="#f6a53d" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="119" cy="61" r="4.5" fill="#f6a53d" />
      </g>
      <g>
        <rect x="152" y="44" width="64" height="46" rx="8" fill="#fff3c9" {...OUTLINE} />
        <text x="184" y="66" textAnchor="middle" fontFamily={CHUNKY_FONT} fontWeight="900" fontSize="17" fill="#4b8ff7">DOG</text>
        <circle cx="170" cy="77" r="4.5" fill="#b07b4f" />
        <circle cx="182" cy="79" r="4.5" fill="#8a5a38" />
        <circle cx="194" cy="77" r="4.5" fill="#b07b4f" />
      </g>
      <g transform="translate(232 14) scale(0.78)">
        <path d="M38 96 Q26 102 22 112 Q34 112 42 104 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.2} />
        <path d="M60 22 Q92 22 94 58 Q96 92 74 102 Q60 108 46 102 Q24 92 26 58 Q28 22 60 22 Z" fill="#1c3a5e" {...OUTLINE} strokeWidth={3} />
        <path d="M60 58 Q78 58 78 78 Q78 98 60 100 Q42 98 42 78 Q42 58 60 58 Z" fill="#ffffff" stroke="none" />
        <path d="M30 62 Q18 72 20 86 Q32 82 38 72 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
        <circle cx="47" cy="46" r="15" fill="#ffd3cd" stroke="none" />
        <circle cx="47" cy="45" r="6.5" fill="#ffffff" {...OUTLINE} strokeWidth={2} />
        <circle cx="48.5" cy="45.5" r="3" fill="#10233f" />
        <path d="M60 44 Q86 38 104 48 Q100 58 84 60 L62 58 Z" fill="#ffc94d" {...OUTLINE} strokeWidth={2.6} />
        <path d="M62 58 L84 60 Q96 60 98 66 Q88 74 70 70 Q60 66 60 58 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={2.6} />
        <path d="M24 22 L60 8 L96 22 L60 34 Z" fill="#10233f" {...OUTLINE} strokeWidth={2.4} />
        <path d="M96 22 L96 40" stroke="#ffc94d" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="96" cy="43" r="3" fill="#ffc94d" {...OUTLINE} strokeWidth={1.6} />
        <path d="M50 102 L50 110 M46 110 L54 110 M70 102 L70 110 M66 110 L74 110" fill="none" stroke="#e8890c" strokeWidth="3.2" strokeLinecap="round" />
      </g>
      <StarShape x={66} y={100} s={0.9} />
    </SceneBase>
  );
}

export const AREA_SCENES = Object.freeze({
  logica: LogicaScene,
  matematicas: MatematicasScene,
  atencion: AtencionScene,
  habla: HablaScene,
  ingles: InglesScene,
});
