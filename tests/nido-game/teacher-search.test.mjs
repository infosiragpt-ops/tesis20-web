import assert from "node:assert/strict";
import test from "node:test";

import { TEACHERS } from "../../src/data/academic-directory.js";
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

  assert.equal(results[0]?.id, "elena-castro");
  assert.deepEqual(getTeacherSearchTerms("Necesito un profesor en derecho penal"), [
    "derecho",
    "penal",
  ]);
});

test("busca sin depender de tildes y revisa especialidades y términos relacionados", () => {
  assert.equal(
    searchTeacherIndex(teacherIndex, { query: "metodologia cualitativa" })[0]?.id,
    "valeria-ruiz",
  );
  assert.equal(
    searchTeacherIndex(teacherIndex, { query: "SPSS" })[0]?.id,
    "sergio-montes",
  );
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

test("el índice procesa un catálogo simulado de 4 mil perfiles", () => {
  const largeDirectory = Array.from({ length: 4_000 }, (_, index) => ({
    ...TEACHERS[index % TEACHERS.length],
    id: `${TEACHERS[index % TEACHERS.length].id}-${index}`,
  }));
  const results = searchTeacherIndex(
    createTeacherSearchIndex(largeDirectory),
    { query: "derecho penal" },
  );

  assert.equal(results.length, 500);
  assert(results.every((teacher) => teacher.specialties.includes("Derecho penal")));
});
