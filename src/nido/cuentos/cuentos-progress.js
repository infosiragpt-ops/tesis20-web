// Progreso guardado solo en el navegador del niño. No se envía nada al
// servidor y no pedimos ningún dato personal.

import { useCallback, useEffect, useState } from "react";
import { BOOKS } from "./cuentos-data.js";

const KEY = "tesis20-nido-cuentos-v1";

function emptyBook() {
  return { pages: [], pins: [], quiz: [], quizOk: 0, opened: false };
}

function emptyState() {
  const books = {};
  BOOKS.forEach((book) => {
    books[book.id] = emptyBook();
  });
  return { v: 1, books, lastBook: null };
}

function normalize(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== "object") return base;
  BOOKS.forEach((book) => {
    const stored = raw.books?.[book.id];
    if (!stored) return;
    base.books[book.id] = {
      pages: Array.isArray(stored.pages) ? stored.pages.filter((n) => Number.isInteger(n)) : [],
      pins: Array.isArray(stored.pins) ? stored.pins.filter((id) => typeof id === "string") : [],
      quiz: Array.isArray(stored.quiz) ? stored.quiz.filter((n) => Number.isInteger(n)) : [],
      quizOk: Number.isInteger(stored.quizOk) ? stored.quizOk : 0,
      opened: Boolean(stored.opened),
    };
  });
  base.lastBook = typeof raw.lastBook === "string" ? raw.lastBook : null;
  return base;
}

export function readProgress() {
  try {
    return normalize(JSON.parse(window.localStorage.getItem(KEY) || "null"));
  } catch {
    return emptyState();
  }
}

function persist(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Modo privado o almacenamiento lleno: el cuento sigue funcionando.
  }
}

export function totals(state) {
  let stars = 0;
  let pins = 0;
  let quiz = 0;
  let finished = 0;
  BOOKS.forEach((book) => {
    const entry = state.books[book.id] || emptyBook();
    stars += entry.pages.length;
    pins += entry.pins.length;
    quiz += entry.quizOk;
    if (entry.pages.length >= book.pages.length) finished += 1;
  });
  return { stars, pins, quiz, finished };
}

export function bookStatus(state, book) {
  const entry = state.books[book.id] || emptyBook();
  const pct = Math.round((entry.pages.length / book.pages.length) * 100);
  return {
    ...entry,
    pct,
    finished: entry.pages.length >= book.pages.length,
    started: entry.pages.length > 0 || entry.opened,
  };
}

export function useProgress() {
  const [state, setState] = useState(() => (typeof window === "undefined" ? emptyState() : readProgress()));

  useEffect(() => {
    persist(state);
  }, [state]);

  const update = useCallback((bookId, patch) => {
    setState((prev) => {
      const entry = prev.books[bookId] || emptyBook();
      const nextEntry = typeof patch === "function" ? patch(entry) : { ...entry, ...patch };
      return { ...prev, books: { ...prev.books, [bookId]: nextEntry }, lastBook: bookId };
    });
  }, []);

  const markPage = useCallback(
    (bookId, pageIndex) => {
      let isNew = false;
      update(bookId, (entry) => {
        if (entry.pages.includes(pageIndex)) return { ...entry, opened: true };
        isNew = true;
        return { ...entry, opened: true, pages: [...entry.pages, pageIndex] };
      });
      return isNew;
    },
    [update],
  );

  const collectPin = useCallback(
    (bookId, pinId) => {
      let isNew = false;
      update(bookId, (entry) => {
        if (entry.pins.includes(pinId)) return entry;
        isNew = true;
        return { ...entry, pins: [...entry.pins, pinId] };
      });
      return isNew;
    },
    [update],
  );

  const answerQuiz = useCallback(
    (bookId, questionIndex, correct) => {
      update(bookId, (entry) => {
        if (entry.quiz.includes(questionIndex)) return entry;
        return {
          ...entry,
          quiz: [...entry.quiz, questionIndex],
          quizOk: entry.quizOk + (correct ? 1 : 0),
        };
      });
    },
    [update],
  );

  const resetAll = useCallback(() => setState(emptyState()), []);

  return { state, markPage, collectPin, answerQuiz, resetAll };
}

export const MEDALS = [
  { id: "primera", label: "Primer souvenir", need: (t) => t.pins >= 1 },
  { id: "diez", label: "Diez souvenirs", need: (t) => t.pins >= 10 },
  { id: "mitad", label: "Media repisa", need: (t) => t.pins >= 20 },
  { id: "lector", label: "Un libro entero", need: (t) => t.finished >= 1 },
  { id: "coleccion", label: "Coleccionista", need: (t) => t.pins >= 30 },
  { id: "bibliotecario", label: "Bibliotecario", need: (t) => t.finished >= 4 },
  { id: "estrella", label: "Estrella del quiz", need: (t) => t.quiz >= 20 },
];
