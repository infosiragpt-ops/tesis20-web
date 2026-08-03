import test from "node:test";
import assert from "node:assert/strict";
import { searchTheses } from "../../src/thesis-search.js";

const records = [
  {
    id: "exact",
    s: "upn",
    t: "Inteligencia artificial en educación universitaria",
    a: ["Ana Pérez"],
    y: 2025,
    l: "master",
    u: "https://hdl.handle.net/1/exact",
    k: ["Educación", "Inteligencia artificial"],
    d: "Aplicación de modelos en procesos de aprendizaje.",
  },
  {
    id: "partial",
    s: "ucv",
    t: "Inteligencia artificial para procesos empresariales",
    a: ["Luis Díaz"],
    y: 2024,
    l: "bachelor",
    u: "https://hdl.handle.net/1/partial",
    k: ["Tecnología"],
    d: "Automatización de operaciones administrativas.",
  },
  {
    id: "distributed",
    s: "ucv",
    t: "Herramientas digitales para el aprendizaje",
    a: ["María Soto"],
    y: 2023,
    l: "doctoral",
    u: "https://hdl.handle.net/1/distributed",
    k: ["Inteligencia artificial", "Educación"],
    d: "Estudio doctoral.",
  },
  {
    id: "noisy",
    s: "ucv",
    t: "Prevención de desastres naturales",
    a: ["Elena Ruiz"],
    y: 2022,
    l: "bachelor",
    u: "https://hdl.handle.net/1/noisy",
    k: ["Gestión de salud", "Política pública"],
    d: "Análisis comunitario.",
  },
  {
    id: "abstract-only",
    s: "ucv",
    t: "Modelo de gestión educativa",
    a: ["Rosa Vega"],
    y: 2024,
    l: "master",
    u: "https://hdl.handle.net/1/abstract-only",
    k: ["Educación"],
    d: "El resumen menciona gestión pública, pero el tema central es otro.",
  },
];

test("la búsqueda de tesis ignora tildes y exige todos los términos importantes", () => {
  const results = searchTheses(records, { query: "inteligencia artificial educación" });
  assert.deepEqual(results.map((record) => record.id), ["exact", "distributed"]);
});

test("la frase en el título tiene mayor relevancia", () => {
  const results = searchTheses(records, { query: "inteligencia artificial" });
  assert.equal(results[0].id, "exact");
});

test("los filtros de nivel, universidad y año se combinan", () => {
  const results = searchTheses(records, {
    query: "inteligencia artificial",
    level: "doctoral",
    sourceId: "ucv",
    yearFrom: "2020",
  });
  assert.deepEqual(results.map((record) => record.id), ["distributed"]);
});

test("descarta coincidencias formadas por palabras lejanas en materias distintas", () => {
  const results = searchTheses(records, { query: "gestión pública" });
  assert.equal(results.some((record) => record.id === "noisy"), false);
});

test("el resumen aislado no basta para presentar una coincidencia como precisa", () => {
  const results = searchTheses(records, { query: "gestión pública" });
  assert.equal(results.some((record) => record.id === "abstract-only"), false);
});
