const OUTLINE = Object.freeze({
  stroke: "#10233f",
  strokeWidth: 2.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
});

const LETTER_FONT =
  "'Arial Rounded MT Bold', 'Trebuchet MS', 'Arial Black', sans-serif";

function CoverBase({ className = "", children, ...rest }) {
  return (
    <svg
      viewBox="0 0 320 200"
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

function Face({ x, y, s = 1, ink = "#10233f" }) {
  return (
    <g>
      <circle cx={x - 4 * s} cy={y} r={1.9 * s} fill={ink} />
      <circle cx={x + 4 * s} cy={y} r={1.9 * s} fill={ink} />
      <path
        d={`M${x - 3 * s} ${y + 4 * s} Q${x} ${y + 6.5 * s} ${x + 3 * s} ${y + 4 * s}`}
        fill="none"
        stroke={ink}
        strokeWidth={1.8 * s}
        strokeLinecap="round"
      />
      <circle cx={x - 7 * s} cy={y + 4 * s} r={2 * s} fill="#ffb3ab" fillOpacity="0.55" />
      <circle cx={x + 7 * s} cy={y + 4 * s} r={2 * s} fill="#ffb3ab" fillOpacity="0.55" />
    </g>
  );
}

function CloudPuff({ x, y, s = 1 }) {
  return (
    <path
      d={`M${x} ${y} Q${x - 2 * s} ${y - 12 * s} ${x + 10 * s} ${y - 12 * s} Q${x + 14 * s} ${y - 20 * s} ${x + 24 * s} ${y - 16 * s} Q${x + 34 * s} ${y - 18 * s} ${x + 36 * s} ${y - 8 * s} Q${x + 42 * s} ${y - 6 * s} ${x + 40 * s} ${y} Z`}
      fill="#ffffff"
      fillOpacity="0.85"
    />
  );
}

function Sparkle({ x, y, s = 1, fill = "#ffc94d" }) {
  return (
    <path
      d={`M${x} ${y - 5 * s} L${x + 1.4 * s} ${y - 1.4 * s} L${x + 5 * s} ${y} L${x + 1.4 * s} ${y + 1.4 * s} L${x} ${y + 5 * s} L${x - 1.4 * s} ${y + 1.4 * s} L${x - 5 * s} ${y} L${x - 1.4 * s} ${y - 1.4 * s} Z`}
      fill={fill}
    />
  );
}

function LetterBalloon({ x, y, letter, fill, delayHint = 0 }) {
  return (
    <g>
      <path
        d={`M${x} ${y + 24} Q${x + 3 + delayHint} ${y + 34} ${x - 2} ${y + 44}`}
        fill="none"
        stroke="#10233f"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx={x} cy={y} rx="21" ry="23" fill={fill} {...OUTLINE} />
      <path d={`M${x - 4} ${y + 22} L${x + 4} ${y + 22} L${x} ${y + 27} Z`} fill={fill} {...OUTLINE} strokeWidth={1.6} />
      <ellipse cx={x - 8} cy={y - 10} rx="5.5" ry="3.5" fill="#ffffff" fillOpacity="0.45" />
      <text
        x={x}
        y={y + 9}
        textAnchor="middle"
        fontFamily={LETTER_FONT}
        fontWeight="900"
        fontSize="26"
        fill="#ffffff"
        stroke="#10233f"
        strokeWidth="1"
      >
        {letter}
      </text>
    </g>
  );
}

function VocalesCover({ className = "", ...rest }) {
  return (
    <CoverBase className={className} {...rest}>
      <rect width="320" height="200" fill="#ffe3df" />
      <CloudPuff x={20} y={52} s={1.1} />
      <CloudPuff x={240} y={40} s={0.9} />
      <path d="M-10 178 Q80 138 160 172 Q240 202 330 166 L330 210 L-10 210 Z" fill="#ffd3cd" />
      <LetterBalloon x={52} y={78} letter="A" fill="#ff6f61" />
      <LetterBalloon x={112} y={52} letter="E" fill="#4b8ff7" delayHint={-4} />
      <LetterBalloon x={170} y={84} letter="I" fill="#46b982" delayHint={2} />
      <LetterBalloon x={226} y={50} letter="O" fill="#ffc94d" delayHint={-2} />
      <LetterBalloon x={282} y={82} letter="U" fill="#9873e7" delayHint={3} />
      <g>
        <ellipse cx="96" cy="160" rx="17" ry="15" fill="#29c7c9" {...OUTLINE} />
        <path d="M78 158 Q70 152 72 144 Q80 146 84 152 Z" fill="#dff8f7" {...OUTLINE} strokeWidth={2} />
        <path d="M111 156 L121 159 L111 163 Z" fill="#ffc94d" {...OUTLINE} strokeWidth={2} />
        <circle cx="102" cy="154" r="2.2" fill="#10233f" />
        <circle cx="102.8" cy="153.2" r="0.7" fill="#ffffff" />
        <path d="M90 172 L90 177 M100 172 L100 177" stroke="#10233f" strokeWidth="2" strokeLinecap="round" />
      </g>
      <Sparkle x={150} y={140} />
      <Sparkle x={255} y={128} s={0.8} fill="#ff6f61" />
      <Sparkle x={30} y={120} s={0.7} fill="#4b8ff7" />
    </CoverBase>
  );
}

function ArteCover({ className = "", ...rest }) {
  return (
    <CoverBase className={className} {...rest}>
      <rect width="320" height="200" fill="#dff8f7" />
      <path d="M-10 182 Q90 150 180 176 Q260 196 330 172 L330 210 L-10 210 Z" fill="#bceceb" />
      <g>
        <path d="M118 60 L204 60 L204 128 L118 128 Z" fill="#ffffff" {...OUTLINE} />
        <path d="M110 60 L212 60" {...OUTLINE} strokeWidth={3} fill="none" />
        <path d="M132 140 L118 178 M190 140 L204 178 M161 132 L161 178" {...OUTLINE} strokeWidth={3.4} fill="none" stroke="#b07b4f" />
        <path d="M132 140 L118 178 M190 140 L204 178 M161 132 L161 178" fill="none" stroke="#10233f" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="141" cy="82" r="10" fill="#ff6f61" />
        <circle cx="163" cy="94" r="11" fill="#ffc94d" />
        <circle cx="184" cy="78" r="9" fill="#4b8ff7" />
        <path d="M136 112 Q152 100 168 112 Q180 120 194 110" fill="none" stroke="#46b982" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g>
        <circle cx="66" cy="118" r="20" fill="#f6c9a0" {...OUTLINE} />
        <path d="M48 112 Q50 96 66 96 Q82 96 84 112 Q76 104 66 104 Q56 104 48 112 Z" fill="#6b4226" stroke="none" />
        <path d="M46 110 Q44 128 50 132 M86 110 Q88 128 82 132" fill="none" stroke="#6b4226" strokeWidth="5" strokeLinecap="round" />
        <Face x={66} y={118} s={1.1} />
        <path d="M52 138 Q66 132 80 138 L82 172 Q66 178 50 172 Z" fill="#ffc94d" {...OUTLINE} />
        <path d="M80 144 Q94 138 102 128" fill="none" {...OUTLINE} strokeWidth={4} stroke="#f6c9a0" />
        <path d="M100 130 L110 118 Q113 114 115 118 L112 126 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={1.8} />
      </g>
      <circle cx="252" cy="150" r="16" fill="#f6c9a0" {...OUTLINE} />
      <path d="M238 146 Q240 134 252 134 Q264 134 266 146 Q258 140 252 140 Q246 140 238 146 Z" fill="#10233f" stroke="none" />
      <Face x={252} y={150} s={0.9} />
      <path d="M242 166 Q252 162 262 166 L263 186 Q252 190 241 186 Z" fill="#9873e7" {...OUTLINE} />
      <path d="M262 170 Q272 164 278 156" fill="none" {...OUTLINE} strokeWidth={3.4} stroke="#f6c9a0" />
      <circle cx="281" cy="153" r="5" fill="#46b982" {...OUTLINE} strokeWidth={1.8} />
      <Sparkle x={230} y={60} />
      <Sparkle x={287} y={92} s={0.8} fill="#ff6f61" />
      <circle cx="36" cy="52" r="9" fill="#ffc94d" fillOpacity="0.8" />
      <circle cx="292" cy="38" r="6" fill="#9873e7" fillOpacity="0.6" />
    </CoverBase>
  );
}

function CuentosCover({ className = "", ...rest }) {
  return (
    <CoverBase className={className} {...rest}>
      <rect width="320" height="200" fill="#fff3c9" />
      <path d="M-10 186 Q90 158 190 180 Q260 194 330 176 L330 210 L-10 210 Z" fill="#ffe6a3" />
      <g>
        <path d="M160 96 Q108 76 56 88 L56 170 Q108 158 160 176 Q212 158 264 170 L264 88 Q212 76 160 96 Z" fill="#ffffff" {...OUTLINE} strokeWidth={3} />
        <path d="M160 96 L160 176" {...OUTLINE} strokeWidth={2.4} fill="none" />
        <path d="M74 104 L136 98 M74 118 L136 112 M74 132 L136 126 M74 146 L120 142" stroke="#547087" strokeWidth="3" strokeLinecap="round" />
        <path d="M186 100 L246 106 M186 114 L246 120 M186 128 L230 132" stroke="#547087" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g>
        <circle cx="160" cy="52" r="17" fill="#f6c9a0" {...OUTLINE} />
        <path d="M145 48 Q147 34 160 34 Q173 34 175 48 Q167 40 160 40 Q153 40 145 48 Z" fill="#8a5a38" stroke="none" />
        <Face x={160} y={52} />
        <path d="M148 68 Q160 62 172 68 L174 96 Q160 102 146 96 Z" fill="#ff6f61" {...OUTLINE} />
        <path d="M147 74 Q132 68 124 56 M173 74 Q188 68 196 56" fill="none" {...OUTLINE} strokeWidth={4.4} stroke="#f6c9a0" />
        <circle cx="122" cy="53" r="4.4" fill="#f6c9a0" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="198" cy="53" r="4.4" fill="#f6c9a0" {...OUTLINE} strokeWidth={1.8} />
      </g>
      <Sparkle x={104} y={44} />
      <Sparkle x={220} y={38} s={0.85} fill="#ff6f61" />
      <Sparkle x={250} y={62} s={0.7} fill="#4b8ff7" />
      <Sparkle x={84} y={70} s={0.7} fill="#46b982" />
    </CoverBase>
  );
}

function CientificosCover({ className = "", ...rest }) {
  return (
    <CoverBase className={className} {...rest}>
      <rect width="320" height="200" fill="#e2f6ec" />
      <path d="M-10 184 Q100 156 200 178 Q270 192 330 174 L330 210 L-10 210 Z" fill="#c4ecd8" />
      <circle cx="270" cy="46" r="17" fill="#ffc94d" {...OUTLINE} strokeWidth={2} />
      <ellipse cx="270" cy="46" rx="27" ry="7" fill="none" stroke="#9873e7" strokeWidth="3" transform="rotate(-18 270 46)" />
      <circle cx="42" cy="40" r="8" fill="#4b8ff7" {...OUTLINE} strokeWidth={2} />
      <circle cx="58" cy="30" r="4" fill="#ff6f61" {...OUTLINE} strokeWidth={1.6} />
      <g>
        <path d="M196 92 L216 92 L216 116 Q234 128 228 150 Q222 168 206 168 Q190 168 184 150 Q178 128 196 116 Z" fill="#dff8f7" {...OUTLINE} />
        <path d="M188 140 Q206 130 224 140 Q228 158 206 162 Q184 158 188 140 Z" fill="#46b982" stroke="none" />
        <circle cx="199" cy="128" r="4" fill="#46b982" fillOpacity="0.8" />
        <circle cx="212" cy="120" r="3" fill="#46b982" fillOpacity="0.6" />
        <circle cx="206" cy="106" r="2.5" fill="#46b982" fillOpacity="0.5" />
        <path d="M192 92 L220 92" {...OUTLINE} strokeWidth={3} fill="none" />
      </g>
      <g>
        <circle cx="104" cy="112" r="21" fill="#f6c9a0" {...OUTLINE} />
        <path d="M85 106 Q87 90 104 90 Q121 90 123 106 Q113 98 104 98 Q95 98 85 106 Z" fill="#10233f" stroke="none" />
        <circle cx="96" cy="112" r="7" fill="#ffffff" {...OUTLINE} strokeWidth={2.2} />
        <circle cx="113" cy="112" r="7" fill="#ffffff" {...OUTLINE} strokeWidth={2.2} />
        <path d="M103 112 L106 112" {...OUTLINE} strokeWidth={2.2} />
        <circle cx="96" cy="112" r="2.2" fill="#10233f" />
        <circle cx="113" cy="112" r="2.2" fill="#10233f" />
        <path d="M98 124 Q104 128 110 124" fill="none" {...OUTLINE} strokeWidth={2} />
        <path d="M90 132 Q104 127 118 132 L120 168 Q104 174 88 168 Z" fill="#ffffff" {...OUTLINE} />
        <path d="M104 132 L104 168 M96 140 L112 140" stroke="#cfe2ec" strokeWidth="2.4" />
        <path d="M118 138 Q136 132 150 140" fill="none" {...OUTLINE} strokeWidth={4.4} stroke="#f6c9a0" />
        <circle cx="154" cy="142" r="5" fill="#ffc94d" {...OUTLINE} strokeWidth={1.8} />
      </g>
      <Sparkle x={160} y={60} />
      <Sparkle x={244} y={90} s={0.8} fill="#46b982" />
    </CoverBase>
  );
}

function MusicaCover({ className = "", ...rest }) {
  return (
    <CoverBase className={className} {...rest}>
      <rect width="320" height="200" fill="#efe7ff" />
      <path d="M-10 184 Q90 156 190 178 Q262 192 330 174 L330 210 L-10 210 Z" fill="#ddccff" />
      <g>
        <ellipse cx="160" cy="140" rx="34" ry="12" fill="#dc5048" {...OUTLINE} />
        <path d="M126 140 L126 168 Q160 182 194 168 L194 140 Q160 154 126 140 Z" fill="#ff6f61" {...OUTLINE} />
        <ellipse cx="160" cy="140" rx="34" ry="12" fill="#ffd3cd" {...OUTLINE} />
        <path d="M138 118 L152 134 M182 118 L168 134" {...OUTLINE} strokeWidth={3.4} fill="none" stroke="#b07b4f" />
        <circle cx="136" cy="115" r="4.4" fill="#ffc94d" {...OUTLINE} strokeWidth={1.8} />
        <circle cx="184" cy="115" r="4.4" fill="#ffc94d" {...OUTLINE} strokeWidth={1.8} />
      </g>
      <g>
        <circle cx="76" cy="96" r="19" fill="#f6c9a0" {...OUTLINE} />
        <path d="M59 90 Q61 76 76 76 Q91 76 93 90 Q84 82 76 82 Q68 82 59 90 Z" fill="#6b4226" stroke="none" />
        <path d="M60 84 Q56 96 60 104 M92 84 Q96 96 92 104" fill="none" stroke="#6b4226" strokeWidth="4.4" strokeLinecap="round" />
        <Face x={76} y={96} />
        <path d="M64 114 Q76 108 88 114 L90 146 Q76 152 62 146 Z" fill="#29c7c9" {...OUTLINE} />
        <path d="M88 120 Q102 116 112 122" fill="none" {...OUTLINE} strokeWidth={4} stroke="#f6c9a0" />
      </g>
      <g>
        <circle cx="248" cy="98" r="17" fill="#f6c9a0" {...OUTLINE} />
        <path d="M233 93 Q235 80 248 80 Q261 80 263 93 Q255 86 248 86 Q241 86 233 93 Z" fill="#10233f" stroke="none" />
        <Face x={248} y={98} s={0.95} />
        <path d="M237 114 Q248 109 259 114 L261 144 Q248 149 235 144 Z" fill="#ffc94d" {...OUTLINE} />
        <path d="M258 118 Q270 112 276 104" fill="none" {...OUTLINE} strokeWidth={3.8} stroke="#f6c9a0" />
        <g transform="rotate(24 282 96)">
          <ellipse cx="282" cy="92" rx="7" ry="9" fill="#9873e7" {...OUTLINE} strokeWidth={2} />
          <path d="M282 101 L282 112" {...OUTLINE} strokeWidth={2.6} fill="none" />
          <circle cx="279" cy="88" r="1.6" fill="#ffffff" fillOpacity="0.7" />
        </g>
      </g>
      <g fill="#10233f">
        <path d="M132 54 L132 34 Q140 30 144 34 L144 50" fill="none" stroke="#10233f" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="128.5" cy="54" rx="4.5" ry="3.4" />
        <ellipse cx="140.5" cy="50" rx="4.5" ry="3.4" />
      </g>
      <g fill="#9873e7">
        <path d="M196 44 L196 28" fill="none" stroke="#9873e7" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M196 28 Q203 30 205 36" fill="none" stroke="#9873e7" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="192.5" cy="44" rx="4.2" ry="3.2" />
      </g>
      <Sparkle x={40} y={48} s={0.9} />
      <Sparkle x={288} y={40} s={0.8} fill="#ff6f61" />
    </CoverBase>
  );
}

function EmocionesCover({ className = "", ...rest }) {
  return (
    <CoverBase className={className} {...rest}>
      <rect width="320" height="200" fill="#e3f1ff" />
      <path d="M-10 184 Q100 158 200 180 Q268 192 330 176 L330 210 L-10 210 Z" fill="#c8e4ff" />
      <CloudPuff x={26} y={54} />
      <CloudPuff x={244} y={44} s={0.85} />
      <g>
        <circle cx="128" cy="104" r="21" fill="#f6c9a0" {...OUTLINE} />
        <path d="M109 98 Q111 82 128 82 Q145 82 147 98 Q137 90 128 90 Q119 90 109 98 Z" fill="#6b4226" stroke="none" />
        <path d="M110 92 Q106 104 110 112 M146 92 Q150 104 146 112" fill="none" stroke="#6b4226" strokeWidth="4.6" strokeLinecap="round" />
        <Face x={128} y={104} s={1.05} />
        <path d="M114 122 Q128 116 142 122 L144 164 Q128 170 112 164 Z" fill="#ff6f61" {...OUTLINE} />
      </g>
      <g>
        <circle cx="192" cy="104" r="21" fill="#e0a878" {...OUTLINE} />
        <path d="M173 98 Q175 82 192 82 Q209 82 211 98 Q201 90 192 90 Q183 90 173 98 Z" fill="#10233f" stroke="none" />
        <Face x={192} y={104} s={1.05} />
        <path d="M178 122 Q192 116 206 122 L208 164 Q192 170 176 164 Z" fill="#46b982" {...OUTLINE} />
      </g>
      <path d="M142 128 Q160 118 178 128" fill="none" {...OUTLINE} strokeWidth={5} stroke="#f6c9a0" />
      <path d="M160 60 Q160 52 166 52 Q172 52 172 58 Q172 64 160 72 Q148 64 148 58 Q148 52 154 52 Q160 52 160 60 Z" fill="#ff6f61" {...OUTLINE} strokeWidth={2} />
      <path d="M84 60 Q84 55 88 55 Q92 55 92 59 Q92 63 84 68 Q76 63 76 59 Q76 55 80 55 Q84 55 84 60 Z" fill="#9873e7" stroke="none" />
      <path d="M240 72 Q240 67 244 67 Q248 67 248 71 Q248 75 240 80 Q232 75 232 71 Q232 67 236 67 Q240 67 240 72 Z" fill="#29c7c9" stroke="none" />
      <path d="M262 108 Q262 104 265 104 Q268 104 268 107 Q268 110 262 114 Q256 110 256 107 Q256 104 259 104 Q262 104 262 108 Z" fill="#ffc94d" stroke="none" />
      <Sparkle x={56} y={100} s={0.8} />
      <Sparkle x={276} y={64} s={0.7} fill="#ff6f61" />
    </CoverBase>
  );
}

export const CLASS_COVERS = Object.freeze({
  "vocales-aventura": VocalesCover,
  "arte-colores": ArteCover,
  "cuentos-movimiento": CuentosCover,
  "pequenos-cientificos": CientificosCover,
  "musica-ritmo": MusicaCover,
  "emociones-amistad": EmocionesCover,
});
