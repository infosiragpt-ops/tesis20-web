import assert from "node:assert/strict";
import test from "node:test";

import { CAREER_AREAS, TEACHERS } from "../../src/data/academic-directory.js";
import { teacherMediaMarkup } from "../../src/teacher-portrait.js";
import {
  createTeacherSearchIndex,
  getTeacherSearchTerms,
  searchTeacherIndex,
} from "../../src/teacher-search.js";

const teacherIndex = createTeacherSearchIndex(TEACHERS);

test("entiende una necesidad escrita como frase natural", () => {
  const results = searchTeacherIndex(teacherIndex, {
    query: "Necesito un profesor en derecho penal",
  });

  assert(results.some((teacher) => teacher.id === "elena-castro"));
  assert(results[0].specialties.some((specialty) =>
    specialty.toLocaleLowerCase("es").includes("derecho penal")
  ));
  assert.deepEqual(getTeacherSearchTerms("Necesito un profesor en derecho penal"), [
    "derecho",
    "penal",
  ]);
});

test("busca sin depender de tildes y revisa especialidades y términos relacionados", () => {
  assert(searchTeacherIndex(teacherIndex, { query: "metodologia cualitativa" })
    .some((teacher) => teacher.id === "valeria-ruiz"));
  assert(searchTeacherIndex(teacherIndex, { query: "SPSS" })
    .some((teacher) => teacher.id === "sergio-montes"));
});

test("combina la necesidad con carrera y universidad", () => {
  const matching = searchTeacherIndex(teacherIndex, {
    query: "derecho penal",
    career: "Derecho",
    university: "Universidad del Pacífico Sur — demo",
  });
  const excluded = searchTeacherIndex(teacherIndex, {
    query: "derecho penal",
    career: "Psicología",
  });

  assert.deepEqual(matching.map((teacher) => teacher.id), ["elena-castro"]);
  assert.equal(excluded.length, 0);
});

test("una consulta compuesta solo por palabras genéricas conserva el catálogo", () => {
  const results = searchTeacherIndex(teacherIndex, { query: "Busco un docente para mi tesis" });
  assert.equal(results.length, TEACHERS.length);
});

test("ignora expresiones naturales de ayuda y conserva la necesidad académica", () => {
  const queries = [
    ["quiero ayuda con derecho penal", "Derecho Penal"],
    ["asesoría sobre derecho penal", "Derecho Penal"],
    ["busco experto en derecho penal", "Derecho Penal"],
    ["necesito orientación sobre ingeniería civil", "Ingeniería Civil"],
    ["apoyo para tesis en marketing digital", "Marketing Digital"],
    ["necesito a alguien que sepa de PRISMA", "PRISMA"],
    ["profesor con experiencia en salud pública", "Salud Pública"],
  ];

  for (const [query, expectedTerm] of queries) {
    const results = searchTeacherIndex(teacherIndex, { query });
    assert(results.length > 0, `La consulta “${query}” no devolvió perfiles`);
    const topCorpus = [
      ...results[0].careers,
      ...results[0].specialties,
      ...results[0].searchTerms,
    ].join(" ").toLocaleLowerCase("es");
    assert(topCorpus.includes(expectedTerm.toLocaleLowerCase("es")));
  }
});

test("el catálogo real contiene 4 mil perfiles demostrativos variados", () => {
  const catalogCareers = new Set(CAREER_AREAS.flatMap((area) => area.careers));

  assert.equal(TEACHERS.length, 4_000);
  assert.equal(new Set(TEACHERS.map((teacher) => teacher.id)).size, 4_000);
  assert.equal(new Set(TEACHERS.map((teacher) => teacher.name)).size, 4_000);
  assert.equal(new Set(TEACHERS.map((teacher) => teacher.profileCode)).size, 4_000);
  assert.equal(new Set(TEACHERS.map((teacher) => teacher.photo || teacher.avatarSeed)).size, 4_000);
  assert([...catalogCareers].every((career) =>
    TEACHERS.some((teacher) => teacher.careers.includes(career))
  ));
  assert(TEACHERS.every((teacher) =>
    teacher.isDemo &&
    teacher.experienceYears >= 6 &&
    teacher.specialties.length >= 3 &&
    teacher.searchTerms.length >= 3 &&
    teacher.description.startsWith("Perfil demostrativo")
  ));
});

test("los perfiles generados mantienen una especialidad profesional coherente", () => {
  const generatedTeachers = TEACHERS.slice(8);
  const firstPageFirstNames = new Set(
    generatedTeachers.slice(0, 64).map((teacher) => teacher.name.split(" ")[0]),
  );

  assert(firstPageFirstNames.size > 40);
  assert(generatedTeachers.every((teacher) => {
    const [career] = teacher.careers;
    return teacher.careers.length === 1 &&
      teacher.specialties[0] === career &&
      teacher.specialties[1] === `Investigación aplicada en ${career}` &&
      teacher.description.includes(career) &&
      teacher.searchTerms.length >= 6;
  }));
});

test("busca sobre los 4 mil perfiles sin duplicar tarjetas", () => {
  const results = searchTeacherIndex(teacherIndex, { query: "derecho penal" });

  assert(results.some((teacher) => teacher.id === "elena-castro"));
  assert(results.length > 10);
  assert.equal(new Set(results.map((teacher) => teacher.id)).size, results.length);
});

test("genera retratos vectoriales locales distintos para perfiles sin foto", () => {
  const generatedTeachers = TEACHERS.filter((teacher) => !teacher.photo).slice(0, 48);
  const portraits = generatedTeachers.map(teacherMediaMarkup);

  assert.equal(new Set(portraits).size, generatedTeachers.length);
  assert(portraits.every((portrait) =>
    portrait.includes("teacher-card__portrait") &&
    portrait.includes("Retrato ilustrativo") &&
    !portrait.includes('src="http://') &&
    !portrait.includes('src="https://')
  ));
});
