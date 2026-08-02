export const TEACHER_PORTRAIT_COUNT = 64;
export const TEACHER_PORTRAIT_PAGE_LIMIT = 24;
export const TEACHER_PORTRAIT_POOLS = Object.freeze({
  masculine: Object.freeze([
    0, 2, 4, 7, 9, 11, 12, 14,
    17, 19, 20, 23, 24, 27, 29, 31,
    33, 35, 36, 38, 40, 42, 45, 47,
    49, 51, 52, 55, 57, 59, 60, 62,
  ]),
  feminine: Object.freeze([
    1, 3, 5, 6, 8, 10, 13, 15,
    16, 18, 21, 22, 25, 26, 28, 30,
    32, 34, 37, 39, 41, 43, 44, 46,
    48, 50, 53, 54, 56, 58, 61, 63,
  ]),
});

const PORTRAITS_PER_SHEET = 16;
const PORTRAIT_GRID_SIZE = 4;
const PORTRAITS_PER_PRESENTATION = TEACHER_PORTRAIT_COUNT / 2;
const COPRIME_STEPS = Array.from({ length: PORTRAITS_PER_PRESENTATION / 2 }, (_, index) => index * 2 + 1);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function portraitSeed(teacher) {
  const numericSeed = Number(teacher?.avatarSeed);
  if (Number.isInteger(numericSeed) && numericSeed > 0) return numericSeed >>> 0;

  const profileNumber = Number.parseInt(String(teacher?.profileCode || "").replace(/\D/g, ""), 10);
  return Number.isInteger(profileNumber) && profileNumber > 0 ? profileNumber >>> 0 : 1;
}

function portraitPool(teacher) {
  const pool = TEACHER_PORTRAIT_POOLS[teacher?.portraitPresentation];
  if (!pool) {
    throw new TypeError(`El perfil ${teacher?.profileCode || "sin código"} debe declarar una presentación de retrato válida.`);
  }
  return pool;
}

function normalizePortraitIndex(portraitIndex, teacher) {
  const pool = portraitPool(teacher);
  if (Number.isInteger(portraitIndex) && portraitIndex >= 0 && portraitIndex < TEACHER_PORTRAIT_COUNT) {
    if (!pool.includes(portraitIndex)) {
      throw new RangeError(`El retrato ${portraitIndex} no corresponde a la presentación del perfil ${teacher?.profileCode || "sin código"}.`);
    }
    return portraitIndex;
  }
  return pool[portraitSeed(teacher) % pool.length];
}

export function assignTeacherPortraits(teachers) {
  if (!Array.isArray(teachers)) throw new TypeError("La página de docentes debe ser una lista.");
  if (teachers.length > TEACHER_PORTRAIT_PAGE_LIMIT) {
    throw new RangeError(`Solo se pueden asignar ${TEACHER_PORTRAIT_PAGE_LIMIT} retratos por página.`);
  }

  const usedPortraits = new Set();

  return teachers.map((teacher) => {
    const pool = portraitPool(teacher);
    const seed = portraitSeed(teacher);
    const base = seed % pool.length;
    const step = COPRIME_STEPS[(seed >>> 8) % COPRIME_STEPS.length];
    let portraitIndex = pool[base];

    for (let attempt = 0; attempt < pool.length; attempt += 1) {
      const candidate = pool[(base + attempt * step) % pool.length];
      if (!usedPortraits.has(candidate)) {
        portraitIndex = candidate;
        break;
      }
    }

    usedPortraits.add(portraitIndex);
    return { teacher, portraitIndex };
  });
}

export function teacherMediaMarkup(teacher, requestedPortraitIndex) {
  const portraitIndex = normalizePortraitIndex(requestedPortraitIndex, teacher);
  const sheetNumber = Math.floor(portraitIndex / PORTRAITS_PER_SHEET) + 1;
  const cellIndex = portraitIndex % PORTRAITS_PER_SHEET;
  const column = cellIndex % PORTRAIT_GRID_SIZE;
  const row = Math.floor(cellIndex / PORTRAIT_GRID_SIZE);
  const xPosition = column * (100 / (PORTRAIT_GRID_SIZE - 1));
  const yPosition = row * (100 / (PORTRAIT_GRID_SIZE - 1));
  const sheetPath = `/assets/docentes/synthetic-v1/advisers-sheet-${String(sheetNumber).padStart(2, "0")}.avif`;
  const teacherName = escapeHtml(teacher?.name || "docente");

  return `<div class="teacher-card__media">
    <div class="teacher-card__photo teacher-card__synthetic-photo" role="img" aria-label="Imagen sintética de un adulto ficticio para el perfil demostrativo de ${teacherName}; no representa a una persona real" data-portrait-index="${portraitIndex}" data-portrait-sheet="${sheetNumber}" style="--teacher-photo-sheet:url('${sheetPath}');--teacher-photo-x:${xPosition}%;--teacher-photo-y:${yPosition}%"></div>
    <span class="teacher-card__portrait-badge">Imagen sintética · IA</span>
  </div>`;
}
