const FIRST_NAMES = [
  "Adriana", "Alejandro", "Alicia", "Álvaro", "Amanda", "Amelia", "Ana", "Andrés",
  "Ángela", "Antonio", "Beatriz", "Bruno", "Camila", "Carla", "Carlos", "Carmen",
  "Catalina", "Clara", "Claudia", "Cristian", "Daniel", "Daniela", "David", "Diego",
  "Elena", "Elisa", "Emilia", "Esteban", "Eva", "Felipe", "Fernanda", "Fernando",
  "Gabriel", "Gabriela", "Gloria", "Gonzalo", "Helena", "Hugo", "Irene", "Isabel",
  "Jaime", "Javier", "Jimena", "Joaquín", "Jorge", "José", "Julia", "Laura",
  "Leonardo", "Lucía", "Luis", "Manuel", "Marcela", "Marco", "Mariana", "Mario",
  "Marta", "Martín", "Mateo", "Mónica", "Natalia", "Nicolás", "Noelia", "Óscar",
  "Pablo", "Paola", "Patricia", "Pedro", "Rafael", "Raquel", "Renata", "Ricardo",
  "Rocío", "Rodrigo", "Sandra", "Santiago", "Sara", "Sergio", "Silvia", "Sofía",
];

const SURNAMES = [
  "Acosta", "Aguilar", "Alarcón", "Alfaro", "Álvarez", "Arias", "Benítez", "Blanco",
  "Bravo", "Cabrera", "Campos", "Cano", "Carrasco", "Castillo", "Castro", "Cervantes",
  "Contreras", "Córdova", "Cornejo", "Cruz", "Delgado", "Díaz", "Domínguez", "Escobar",
  "Espinoza", "Figueroa", "Flores", "Fuentes", "García", "Garrido", "Gil", "Gómez",
  "González", "Guerrero", "Gutiérrez", "Herrera", "Ibarra", "Jiménez", "León", "López",
  "Maldonado", "Medina", "Mendoza", "Miranda", "Molina", "Montes", "Morales", "Navarro",
  "Núñez", "Ortega", "Paredes", "Peña", "Pérez", "Ramírez", "Reyes", "Ríos",
  "Rivera", "Rojas", "Romero", "Salas", "Sánchez", "Silva", "Soto", "Suárez",
];

const COUNTRIES = [
  "Perú", "México", "Colombia", "Chile", "Argentina", "Ecuador", "Bolivia", "Uruguay",
  "Paraguay", "Costa Rica", "Panamá", "Guatemala", "República Dominicana", "España",
  "Brasil", "Estados Unidos", "Canadá", "Portugal",
];

const DEMO_UNIVERSITIES = [
  "Universidad Demostrativa T20 Andina — demo",
  "Universidad Demostrativa T20 del Pacífico — demo",
  "Universidad Demostrativa T20 Metropolitana — demo",
  "Universidad Demostrativa T20 del Caribe — demo",
  "Universidad Demostrativa T20 Austral — demo",
  "Universidad Demostrativa T20 Central — demo",
  "Universidad Demostrativa T20 del Norte — demo",
  "Universidad Demostrativa T20 del Sur — demo",
  "Universidad Demostrativa T20 Amazónica — demo",
  "Universidad Demostrativa T20 Atlántica — demo",
  "Universidad Demostrativa T20 Mediterránea — demo",
  "Universidad Demostrativa T20 Continental — demo",
  "Instituto Universitario T20 Horizonte — demo",
  "Instituto Universitario T20 Innovación — demo",
  "Instituto Universitario T20 Ciencias Aplicadas — demo",
  "Instituto Universitario T20 Estudios Globales — demo",
  "Centro Universitario T20 Humanidades — demo",
  "Centro Universitario T20 Tecnología — demo",
  "Centro Universitario T20 Salud — demo",
  "Centro Universitario T20 Negocios — demo",
  "Escuela Superior T20 Ingeniería — demo",
  "Escuela Superior T20 Gestión — demo",
  "Escuela Superior T20 Artes — demo",
  "Escuela Superior T20 Educación — demo",
  "Academia Universitaria T20 Sierra — demo",
  "Academia Universitaria T20 Costa — demo",
  "Academia Universitaria T20 Valle — demo",
  "Academia Universitaria T20 Internacional — demo",
  "Universidad Demostrativa T20 Río Grande — demo",
  "Universidad Demostrativa T20 Nueva América — demo",
  "Universidad Demostrativa T20 Los Andes — demo",
  "Universidad Demostrativa T20 Bicentenario — demo",
];

const QUALITATIVE_AREA_IDS = new Set([
  "sociales-humanidades",
  "derecho-politica",
  "educacion",
  "arquitectura-diseno-artes",
  "comunicacion-medios",
  "turismo-hospitalidad-deporte",
]);

const QUALITATIVE_METHODS = [
  "Metodología cualitativa",
  "Métodos mixtos",
  "Revisión sistemática",
  "Estudio de caso",
  "Análisis documental",
  "Investigación aplicada",
  "Investigación acción",
  "Validación de instrumentos",
];

const QUANTITATIVE_METHODS = [
  "Metodología cuantitativa",
  "Métodos mixtos",
  "Revisión sistemática",
  "Diseño experimental",
  "Estudio de caso",
  "Investigación aplicada",
  "Validación de instrumentos",
  "Análisis estadístico",
  "Modelamiento y simulación",
];

const TOOLS_BY_METHODOLOGY = {
  "Metodología cualitativa": ["Atlas.ti", "NVivo", "MAXQDA"],
  "Metodología cuantitativa": ["IBM SPSS Statistics", "R", "Stata"],
  "Métodos mixtos": ["IBM SPSS Statistics", "Atlas.ti", "R"],
  "Revisión sistemática": ["PRISMA", "Zotero", "Mendeley"],
  "Diseño experimental": ["R", "JASP", "IBM SPSS Statistics"],
  "Estudio de caso": ["Atlas.ti", "Zotero", "Análisis temático"],
  "Análisis documental": ["Zotero", "Mendeley", "Atlas.ti"],
  "Investigación aplicada": ["Gestión bibliográfica", "Excel avanzado", "Power BI"],
  "Validación de instrumentos": ["IBM SPSS Statistics", "Jamovi", "R"],
  "Análisis estadístico": ["IBM SPSS Statistics", "R", "Stata"],
  "Investigación acción": ["Atlas.ti", "NVivo", "Análisis temático"],
  "Modelamiento y simulación": ["Python", "MATLAB", "R"],
};

const CAREER_ALIASES = [
  [/inteligencia artificial|ciencia de datos|analitica de negocios/i, ["machine learning", "aprendizaje automático", "modelos predictivos"]],
  [/derecho penal|criminologia|criminalistica/i, ["litigación penal", "jurisprudencia penal", "política criminal"]],
  [/marketing|publicidad|comunicacion digital/i, ["marketing digital", "audiencias", "estrategia de contenidos"]],
  [/epidemiologia|salud publica/i, ["bioestadística", "evidencia científica", "estudios epidemiológicos"]],
  [/software|sistemas|informatica/i, ["desarrollo de software", "programación", "validación tecnológica"]],
  [/educacion|pedagogia|psicopedagogia/i, ["aprendizaje", "didáctica", "evaluación educativa"]],
  [/finanzas|economia|banca/i, ["econometría", "datos financieros", "modelos económicos"]],
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getCareerEntries(areas) {
  return areas.flatMap((area) => area.careers.map((career) => ({ area, career })));
}

function getCareerAliases(career) {
  const normalizedCareer = slugify(career).replaceAll("-", " ");
  return CAREER_ALIASES.flatMap(([pattern, aliases]) =>
    pattern.test(normalizedCareer) ? aliases : []
  );
}

function enrichSeedTeacher(teacher, index) {
  return {
    ...teacher,
    profileCode: `T20-D${String(index + 1).padStart(4, "0")}`,
    experienceYears: teacher.experienceYears || 8 + (hashText(teacher.id) % 15),
    avatarSeed: teacher.avatarSeed || hashText(`${teacher.id}-portrait`),
    isDemo: true,
    featured: true,
    description: teacher.description.replace(
      /^Especialista en /,
      "Perfil demostrativo orientado a ",
    ),
  };
}

export function generateDemoTeachers(areas, seedTeachers = [], targetCount = 4_000) {
  if (!Number.isInteger(targetCount) || targetCount < seedTeachers.length) {
    throw new TypeError("El tamaño del catálogo docente debe ser un entero válido.");
  }

  const careerEntries = getCareerEntries(areas);
  const reservedNames = new Set(seedTeachers.map((teacher) => teacher.name));
  const generated = [];
  let nameIndex = 0;

  while (generated.length < targetCount - seedTeachers.length) {
    const combinationCount = FIRST_NAMES.length * SURNAMES.length;
    const mixedNameIndex = (nameIndex * 313) % combinationCount;
    const firstName = FIRST_NAMES[Math.floor(mixedNameIndex / SURNAMES.length)];
    const surname = SURNAMES[mixedNameIndex % SURNAMES.length];
    const name = `${firstName} ${surname}`;
    nameIndex += 1;
    if (reservedNames.has(name)) continue;

    const generatedIndex = generated.length;
    const { area, career } = careerEntries[(generatedIndex * 73) % careerEntries.length];
    const id = slugify(name);
    const seed = hashText(`${id}-${generatedIndex}`);
    const methods = QUALITATIVE_AREA_IDS.has(area.id) ? QUALITATIVE_METHODS : QUANTITATIVE_METHODS;
    const methodology = methods[(seed >>> 4) % methods.length];
    const tools = TOOLS_BY_METHODOLOGY[methodology];
    const tool = tools[(seed >>> 9) % tools.length];
    const researchFocus = `Investigación aplicada en ${career}`;
    const experienceYears = 6 + ((seed >>> 13) % 20);
    const profileNumber = seedTeachers.length + generatedIndex + 1;
    const visibleSpecialties = [career, researchFocus, methodology, tool];

    generated.push({
      id,
      profileCode: `T20-D${String(profileNumber).padStart(4, "0")}`,
      name,
      country: COUNTRIES[(seed >>> 2) % COUNTRIES.length],
      universities: [DEMO_UNIVERSITIES[(seed >>> 7) % DEMO_UNIVERSITIES.length]],
      careers: [career],
      specialties: visibleSpecialties,
      searchTerms: unique([
        career,
        area.name,
        `tesis en ${career}`,
        researchFocus,
        methodology,
        tool,
        "metodología de investigación",
        ...getCareerAliases(career),
      ]),
      experienceYears,
      price: 75 + ((seed >>> 19) % 16) * 5,
      description: `Perfil demostrativo orientado a proyectos académicos de ${career}, con enfoque en ${methodology.toLocaleLowerCase("es")} y manejo de ${tool}.`,
      avatarSeed: seed || profileNumber,
      isDemo: true,
      featured: false,
    });
  }

  return [...seedTeachers.map(enrichSeedTeacher), ...generated];
}

export const TEACHER_CATALOG_SIZE = 4_000;
