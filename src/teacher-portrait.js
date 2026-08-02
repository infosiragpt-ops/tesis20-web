export const TEACHER_PORTRAIT_COUNT = 64;
export const TEACHER_PORTRAIT_PAGE_LIMIT = 24;

const PORTRAITS_PER_SHEET = 16;
const PORTRAIT_GRID_SIZE = 4;
const COPRIME_STEPS = Array.from({ length: TEACHER_PORTRAIT_COUNT / 2 }, (_, index) => index * 2 + 1);

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

function normalizePortraitIndex(portraitIndex, teacher) {
  if (Number.isInteger(portraitIndex) && portraitIndex >= 0 && portraitIndex < TEACHER_PORTRAIT_COUNT) {
    return portraitIndex;
  }
  return portraitSeed(teacher) % TEACHER_PORTRAIT_COUNT;
}

export function assignTeacherPortraits(teachers) {
  if (!Array.isArray(teachers)) throw new TypeError("La página de docentes debe ser una lista.");
  if (teachers.length > TEACHER_PORTRAIT_PAGE_LIMIT) {
    throw new RangeError(`Solo se pueden asignar ${TEACHER_PORTRAIT_PAGE_LIMIT} retratos por página.`);
  }

  const usedPortraits = new Set();

  return teachers.map((teacher) => {
    const seed = portraitSeed(teacher);
    const base = seed % TEACHER_PORTRAIT_COUNT;
    const step = COPRIME_STEPS[(seed >>> 8) % COPRIME_STEPS.length];
    let portraitIndex = base;

    for (let attempt = 0; attempt < TEACHER_PORTRAIT_COUNT; attempt += 1) {
      const candidate = (base + attempt * step) % TEACHER_PORTRAIT_COUNT;
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
