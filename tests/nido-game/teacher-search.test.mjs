import assert from "node:assert/strict";
import test from "node:test";

import { CAREER_AREAS, TEACHERS } from "../../src/data/academic-directory.js";
import {
  assignTeacherPortraits,
  teacherMediaMarkup,
  TEACHER_PORTRAIT_COUNT,
} from "../../src/teacher-portrait.js";
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

test("muestra una fotografía sintética local en los 4 mil perfiles", () => {
  const portraits = TEACHERS.map((teacher) => teacherMediaMarkup(teacher));
  const portraitIndexes = portraits.map((portrait) =>
    Number(portrait.match(/data-portrait-index="(\d+)"/)?.[1])
  );

  assert.equal(portraits.length, 4_000);
  assert.equal(new Set(portraitIndexes).size, TEACHER_PORTRAIT_COUNT);
  assert(portraits.every((portrait) =>
    portrait.includes("teacher-card__synthetic-photo") &&
    portrait.includes("Imagen sintética · IA") &&
    portrait.includes("/assets/docentes/synthetic-v1/") &&
    portrait.includes("no representa a una persona real") &&
    !portrait.includes("<svg") &&
    !portrait.includes("http://") &&
    !portrait.includes("https://")
  ));
});

test("no repite fotografías dentro de ninguna página visible", () => {
  const lists = [
    TEACHERS,
    searchTeacherIndex(teacherIndex, { query: "derecho penal" }),
    searchTeacherIndex(teacherIndex, { query: "SPSS" }),
    searchTeacherIndex(teacherIndex, { query: "PRISMA" }),
  ];

  for (const teachers of lists) {
    for (let start = 0; start < teachers.length; start += 24) {
      const assigned = assignTeacherPortraits(teachers.slice(start, start + 24));
      assert.equal(new Set(assigned.map(({ portraitIndex }) => portraitIndex)).size, assigned.length);
    }
  }
});

test("resuelve colisiones de retrato de forma determinista", () => {
  const collisionPage = Array.from({ length: 24 }, (_, index) => ({
    name: `Perfil ${index + 1}`,
    profileCode: `T20-D${String(index + 1).padStart(4, "0")}`,
    avatarSeed: 64 * (index + 1),
  }));
  const firstAssignment = assignTeacherPortraits(collisionPage);
  const secondAssignment = assignTeacherPortraits(collisionPage);

  assert.deepEqual(firstAssignment, secondAssignment);
  assert.equal(new Set(firstAssignment.map(({ portraitIndex }) => portraitIndex)).size, 24);
  assert.throws(() => assignTeacherPortraits([...collisionPage, collisionPage[0]]), RangeError);
});
