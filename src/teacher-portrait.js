const BACKGROUNDS = [
  ["#dce9ee", "#8eb1bd"], ["#f0dfcc", "#bd8b68"], ["#ded9ea", "#8f80aa"],
  ["#d9ebe2", "#79a68e"], ["#f0dce1", "#bd7e8d"], ["#e8e1cf", "#a49a73"],
  ["#d7e2f0", "#7898bd"], ["#eadbd2", "#af806d"], ["#dde8d0", "#8ca06c"],
  ["#e8dced", "#a17eae"], ["#d3e6e9", "#6d9fa5"], ["#eee0d1", "#c29462"],
];

const SKIN_TONES = [
  ["#f6d0ba", "#d99d7e"], ["#edc0a4", "#c98565"], ["#dba27f", "#aa6b4e"],
  ["#c88d68", "#92573d"], ["#aa714f", "#74432e"], ["#8f5a3d", "#5f3625"],
  ["#70452f", "#482a1d"], ["#5b3828", "#382118"],
];

const HAIR_COLORS = ["#171513", "#2c201a", "#493025", "#63402e", "#7a5237", "#a66d3d", "#3c3430", "#cec0a4"];
const JACKET_COLORS = ["#18283a", "#273a4a", "#3e3150", "#193d37", "#4a2c32", "#34383f", "#53452f", "#244b65"];
const SHIRT_COLORS = ["#ffffff", "#f6f2e8", "#dbe8ee", "#f1dfe3", "#e6e0f0", "#dcebdd"];

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mix(seed, salt) {
  let value = (Number(seed) ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return value >>> 0;
}

function hairMarkup(style, color, shadow, faceX, faceWidth) {
  const left = faceX - faceWidth / 2;
  const right = faceX + faceWidth / 2;
  const crown = 147;
  const styles = [
    `<path d="M${left - 5} 250 Q${left - 18} 150 ${faceX} ${crown - 25} Q${right + 22} 152 ${right + 6} 256 L${right - 10} 205 Q${faceX} 150 ${left + 9} 209Z" fill="${color}"/>`,
    `<path d="M${left - 15} 315 Q${left - 28} 158 ${faceX} ${crown - 18} Q${right + 30} 158 ${right + 18} 320 L${right - 4} 330 L${right - 12} 210 Q${faceX} 145 ${left + 10} 214 L${left + 2} 330Z" fill="${color}"/><path d="M${faceX} ${crown - 10} Q${faceX - 24} 235 ${left - 7} 315" fill="none" stroke="${shadow}" stroke-width="8"/>`,
    `<path d="M${left - 8} 251 Q${left - 12} 162 ${faceX - 18} ${crown - 26} Q${right + 14} 157 ${right + 10} 250 Q${right - 7} 194 ${faceX + 21} 187 Q${faceX - 33} 207 ${left + 7} 243Z" fill="${color}"/><path d="M${left + 4} 178 Q${faceX - 35} 126 ${faceX + 12} 135 Q${right + 5} 140 ${right + 10} 188 Q${faceX + 8} 158 ${left + 4} 178Z" fill="${shadow}" opacity=".7"/>`,
    `<path d="M${left - 4} 258 Q${left - 24} 178 ${faceX - 20} ${crown - 17} Q${right + 20} 158 ${right + 7} 258 L${right - 8} 218 Q${faceX + 42} 181 ${faceX + 3} 169 Q${faceX - 40} 199 ${left + 8} 220Z" fill="${color}"/><path d="M${left + 6} 162 q16 -28 33 0 q18 -35 38 0 q19 -30 37 2" fill="none" stroke="${shadow}" stroke-width="18" stroke-linecap="round"/>`,
    `<path d="M${left - 8} 282 Q${left - 20} 159 ${faceX} ${crown - 23} Q${right + 21} 160 ${right + 9} 284 L${right - 5} 230 Q${faceX + 18} 169 ${left + 11} 220Z" fill="${color}"/><path d="M${faceX - 58} 164 Q${faceX} 118 ${faceX + 66} 167" fill="none" stroke="${shadow}" stroke-width="15" stroke-linecap="round"/>`,
    `<path d="M${left} 223 Q${left + 2} 157 ${faceX} ${crown - 14} Q${right - 2} 158 ${right} 224 Q${faceX + 37} 181 ${faceX} 180 Q${faceX - 38} 181 ${left} 223Z" fill="${color}"/><path d="M${faceX - 43} 149 Q${faceX - 20} 113 ${faceX + 1} 151 Q${faceX + 25} 111 ${faceX + 48} 153" fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round"/>`,
  ];
  return styles[style % styles.length];
}

function portraitSvgMarkup(teacher) {
  const seed = Number(teacher.avatarSeed) >>> 0;
  const background = BACKGROUNDS[mix(seed, 1) % BACKGROUNDS.length];
  const skin = SKIN_TONES[mix(seed, 2) % SKIN_TONES.length];
  const hair = HAIR_COLORS[mix(seed, 3) % HAIR_COLORS.length];
  const jacket = JACKET_COLORS[mix(seed, 4) % JACKET_COLORS.length];
  const shirt = SHIRT_COLORS[mix(seed, 5) % SHIRT_COLORS.length];
  const faceX = 400 + ((mix(seed, 6) % 31) - 15);
  const faceWidth = 194 + (mix(seed, 7) % 37);
  const faceHeight = 244 + (mix(seed, 8) % 29);
  const eyeGap = 37 + (mix(seed, 9) % 13);
  const eyeY = 245 + (mix(seed, 10) % 8);
  const hairStyle = mix(seed, 11) % 5;
  const glasses = mix(seed, 12) % 4 === 0;
  const accentX = 90 + (mix(seed, 14) % 165);
  const gradientId = `portrait-bg-${seed}`;
  const leftEye = faceX - eyeGap;
  const rightEye = faceX + eyeGap;
  const headTop = 156;
  const headBottom = headTop + faceHeight;

  return `<svg class="teacher-card__photo teacher-card__portrait" viewBox="0 0 800 600" role="img" aria-label="Retrato profesional ilustrativo de ${escapeXml(teacher.name)}" focusable="false" data-portrait-seed="${seed}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${background[0]}"/><stop offset="1" stop-color="${background[1]}"/></linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#${gradientId})"/>
    <circle cx="${accentX}" cy="105" r="72" fill="#fff" opacity=".16"/>
    <circle cx="${650 - (seed % 90)}" cy="${90 + (seed % 55)}" r="${25 + (seed % 38)}" fill="none" stroke="#fff" stroke-width="2" opacity=".24"/>
    <path d="M0 ${485 + (seed % 28)} Q210 ${430 + (seed % 38)} 410 490 T800 462 V600 H0Z" fill="#fff" opacity=".12"/>
    <g>
      <path d="M146 600 Q178 455 309 421 L491 421 Q628 455 654 600Z" fill="${jacket}"/>
      <path d="M309 421 L400 548 L491 421 L457 407 H343Z" fill="${shirt}"/>
      <path d="M309 421 L358 470 L400 548 L294 475Z" fill="#0f1822" opacity=".18"/>
      <path d="M491 421 L442 470 L400 548 L506 475Z" fill="#0f1822" opacity=".18"/>
      <path d="M352 361 H448 V443 Q400 477 352 443Z" fill="${skin[1]}"/>
      <ellipse cx="${faceX - faceWidth / 2 + 3}" cy="279" rx="23" ry="34" fill="${skin[1]}"/>
      <ellipse cx="${faceX + faceWidth / 2 - 3}" cy="279" rx="23" ry="34" fill="${skin[1]}"/>
      <ellipse cx="${faceX}" cy="${headTop + faceHeight / 2}" rx="${faceWidth / 2}" ry="${faceHeight / 2}" fill="${skin[0]}"/>
      <path d="M${faceX - 42} ${headBottom - 58} Q${faceX} ${headBottom - 33} ${faceX + 42} ${headBottom - 58} Q${faceX} ${headBottom - 14} ${faceX - 42} ${headBottom - 58}Z" fill="#a75558" opacity=".84"/>
      <path d="M${faceX} ${eyeY + 9} l-10 54 q11 8 23 0" fill="none" stroke="${skin[1]}" stroke-width="5" stroke-linecap="round" opacity=".75"/>
      <path d="M${leftEye - 20} ${eyeY - 14} q20 -10 39 0 M${rightEye - 19} ${eyeY - 14} q20 -10 39 0" fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="${leftEye}" cy="${eyeY}" rx="10" ry="7" fill="#fff"/><ellipse cx="${rightEye}" cy="${eyeY}" rx="10" ry="7" fill="#fff"/>
      <circle cx="${leftEye}" cy="${eyeY}" r="4.5" fill="#30271f"/><circle cx="${rightEye}" cy="${eyeY}" r="4.5" fill="#30271f"/>
      ${glasses ? `<g fill="none" stroke="#3b4146" stroke-width="5"><rect x="${leftEye - 26}" y="${eyeY - 17}" width="52" height="34" rx="13"/><rect x="${rightEye - 26}" y="${eyeY - 17}" width="52" height="34" rx="13"/><path d="M${leftEye + 26} ${eyeY - 2} H${rightEye - 26}"/></g>` : ""}
      ${hairMarkup(hairStyle, hair, `${hair}cc`, faceX, faceWidth)}
    </g>
    <path d="M42 548 H186" stroke="#fff" stroke-width="3" opacity=".55"/><circle cx="204" cy="548" r="5" fill="#fff" opacity=".7"/>
  </svg>`;
}

export function teacherMediaMarkup(teacher) {
  const safePhoto = typeof teacher.photo === "string" &&
    /^\/assets\/docentes\/[a-z0-9-]+\.(?:avif|jpe?g|png|webp)$/i.test(teacher.photo)
    ? teacher.photo
    : null;
  const media = safePhoto
    ? `<img class="teacher-card__photo" src="${escapeXml(safePhoto)}" alt="Retrato profesional ilustrativo de ${escapeXml(teacher.name)}" width="418" height="470" loading="lazy" decoding="async">`
    : portraitSvgMarkup(teacher);

  return `<div class="teacher-card__media">${media}<span class="teacher-card__portrait-badge" aria-hidden="true">Retrato ilustrativo</span></div>`;
}
