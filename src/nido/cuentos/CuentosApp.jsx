import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BOOKS, PIN_LABELS, TOTAL_PINS, TOTAL_QUIZ, TOTAL_STARS, bookPins } from "./cuentos-data.js";
import { BookCover, Scene, Souvenir, pinSpot } from "./cuentos-scene.jsx";
import { seeded } from "./cuentos-art-base.jsx";
import { emblemFor } from "./cuentos-art-props.jsx";
import { CAST } from "./cuentos-art-cast.jsx";
import { MEDALS, bookStatus, totals, useProgress } from "./cuentos-progress.js";
import {
  isMuted,
  loadCuentosSound,
  loadCuentosVoices,
  onMuteChange,
  pageTrack,
  playCue,
  prefetchCues,
  prefetchTracks,
  quizTracks,
  setMusicIntensity,
  setMusicMood,
  sfx,
  speak,
  speakSequence,
  speechAvailable,
  startMusic,
  stopSpeech,
  toggleMuted,
  unlockAudio,
  warmUpVoices,
  wordTrack,
} from "./cuentos-audio.js";
import { wordKey } from "./cuentos-voice-plan.js";
import { createStage } from "./three/stage.js";
import { MagicCursor } from "./MagicCursor.jsx";
import { coverArtTexture, storyPageTexture, svgElementToTexture } from "./three/textures.js";
import "./cuentos.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ============================ raíz ============================ */

export default function CuentosApp() {
  const { state, markPage, collectPin, answerQuiz, resetAll } = useProgress();
  const [selectedId, setSelectedId] = useState(null);
  const [panelReady, setPanelReady] = useState(false);
  const [reading, setReading] = useState(false);
  const [page, setPage] = useState(0);
  const [album, setAlbum] = useState(false);
  const [help, setHelp] = useState(false);
  const [muted, setMuted] = useState(() => isMuted());
  const [toast, setToast] = useState(null);
  const [stageReady, setStageReady] = useState(false);
  const [focusedId, setFocusedId] = useState(() => state.lastBook || BOOKS[0].id);
  const [zoom, setZoom] = useState(100);
  const toastTimer = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const pinRef = useRef(null);
  const latest = useRef({});

  const stats = useMemo(() => totals(state), [state]);
  const selectedBook = useMemo(() => BOOKS.find((b) => b.id === selectedId) || null, [selectedId]);

  useEffect(() => warmUpVoices(), []);

  useEffect(() => {
    const start = () => {
      unlockAudio();
      startMusic();
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  useEffect(() => onMuteChange(setMuted), []);

  useEffect(() => {
    setMusicIntensity(reading ? 0.16 : selectedId ? 0.32 : 0.5);
    setMusicMood(reading ? "lectura" : "biblioteca");
  }, [reading, selectedId]);

  const showToast = useCallback((message, icon) => {
    setToast({ message, icon, id: Date.now() });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /* ------------------------- escena 3D ------------------------- */

  const allPins = useMemo(() => {
    const list = [];
    BOOKS.forEach((book) => (state.books[book.id]?.pins || []).forEach((id) => list.push(id)));
    return list;
  }, [state]);

  latest.current = { state, allPins, selectedId, reading, page, showToast };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let lastHover = null;
    const stage = createStage(canvas, {
      books: BOOKS,
      initialBookId: latest.current.state.lastBook || BOOKS[0].id,
      reduceMotion: prefersReducedMotion(),
      coverTexture: (book) => coverArtTexture(book),
      emblemTexture: (pinId) => {
        const emblem = emblemFor(pinId);
        const Art = CAST[pinId]?.Art;
        return svgElementToTexture(
          `emblem-${pinId}`,
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">
            <circle cx="0" cy="0" r="50" fill="#fbf0d6" />
            <g transform={Art && !emblem ? "scale(0.3)" : "scale(1)"}>{emblem || (Art ? <Art /> : null)}</g>
          </svg>,
          256,
          256,
        );
      },
      onHoverBook: (id) => {
        if (id && id !== lastHover) sfx.hover(id);
        lastHover = id;
      },
      onFocusBook: setFocusedId,
      onZoom: setZoom,
      onClickBook: (id) => openDesk(id),
      onHoverToy: (id) => {
        if (id) sfx.toy(id);
      },
      onClickToy: (pinId) => {
        sfx.toy(pinId);
      },
      onFrame: () => {
        const btn = pinRef.current;
        if (!btn) return;
        const { selectedId: sel, page: p } = latest.current;
        const book = BOOKS.find((b) => b.id === sel);
        if (!book) return;
        const spot = pinSpot(book, p);
        if (!spot) return;
        const pos = stage.projectPopup(spot.u, spot.v);
        if (!pos || !pos.visible) {
          btn.style.opacity = "0";
          btn.style.pointerEvents = "none";
          return;
        }
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        btn.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      },
    });
    stageRef.current = stage;
    stage.setCollected(latest.current.allPins);
    setStageReady(true);
    return () => {
      stage.dispose();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stageRef.current?.setCollected(allPins);
  }, [allPins]);

  /* --------------------------- flujo ---------------------------- */

  const openDesk = useCallback((bookId) => {
    unlockAudio();
    startMusic();
    const stage = stageRef.current;
    if (!stage || latest.current.selectedId) return;
    sfx.select();
    const owned = latest.current.state.books[bookId]?.pins || [];
    stage.selectBook(bookId, owned);
    setSelectedId(bookId);
    setPanelReady(false);
    window.setTimeout(() => {
      sfx.land();
      setPanelReady(true);
    }, prefersReducedMotion() ? 50 : 1150);
  }, []);

  const backToShelf = useCallback(() => {
    stopSpeech();
    sfx.close();
    stageRef.current?.deselect();
    setReading(false);
    setSelectedId(null);
    setPanelReady(false);
  }, []);

  const pageTexture = useCallback(
    (book, pageIndex) =>
      svgElementToTexture(`page-${book.id}-${pageIndex}`, <Scene book={book} pageIndex={pageIndex} interactive={false} showPin={false} showCast={false} />, 1000, 640),
    [],
  );

  const openReading = useCallback(async () => {
    const book = BOOKS.find((b) => b.id === latest.current.selectedId);
    const stage = stageRef.current;
    if (!book || !stage) return;
    sfx.open();
    const entry = latest.current.state.books[book.id];
    const last = entry && entry.pages.length ? Math.max(...entry.pages) : -1;
    const start = entry?.pages.length && last + 1 < book.pages.length ? last + 1 : 0;
    const tex = await pageTexture(book, start);
    stage.setPopupTextureNow(tex);
    stage.setStoryPage(storyPageTexture(book, book.pages[start], start, book.pages.length), book.pages[start]);
    setPage(start);
    setReading(true);
    stage.openBook();
    // Precalienta las páginas siguientes.
    window.setTimeout(() => {
      for (let i = 0; i < book.pages.length; i += 1) pageTexture(book, i);
    }, 800);
  }, [pageTexture]);

  const closeReading = useCallback(() => {
    stopSpeech();
    sfx.close();
    stageRef.current?.closeBook();
    setReading(false);
  }, []);

  const goToPage = useCallback(
    async (next) => {
      const book = BOOKS.find((b) => b.id === latest.current.selectedId);
      if (!book || next < 0 || next >= book.pages.length) return;
      const tex = await pageTexture(book, next);
      stageRef.current?.setStoryPage(storyPageTexture(book, book.pages[next], next, book.pages.length), book.pages[next]);
      stageRef.current?.showPage(tex);
      setPage(next);
    },
    [pageTexture],
  );

  return (
    <div className={`cuentos cuentos--3d${reading ? " cuentos--reading" : ""}`}>
      <canvas ref={canvasRef} className="cuentos-canvas" aria-hidden="true" />
      <div className="cuentos-zoom" role="group" aria-label="Zoom de la escena 3D">
        <button type="button" aria-label="Alejar escena" disabled={zoom <= 80} onClick={() => stageRef.current?.setZoom((zoom - 10) / 100)}>−</button>
        <button type="button" aria-label="Restablecer zoom" onClick={() => stageRef.current?.setZoom(1)}>{zoom}%</button>
        <button type="button" aria-label="Acercar escena" disabled={zoom >= 155} onClick={() => stageRef.current?.setZoom((zoom + 10) / 100)}>+</button>
      </div>
      {!stageReady ? <div className="cuentos-loading">Abriendo la biblioteca…</div> : null}

      <TopBar
        stats={stats}
        muted={muted}
        onToggleSound={() => {
          const next = toggleMuted();
          if (!next) {
            unlockAudio();
            startMusic();
          }
        }}
        onAlbum={() => {
          sfx.select();
          setAlbum(true);
        }}
        onHelp={() => {
          sfx.select();
          setHelp(true);
        }}
      />

      {!selectedId ? (
        <ShelfOverlay
          state={state}
          focusedId={focusedId}
          onFocus={(id) => stageRef.current?.focusBook(id)}
          onOpen={openDesk}
        />
      ) : null}

      {selectedBook && !reading ? (
        <DeskPanel book={selectedBook} status={bookStatus(state, selectedBook)} ready={panelReady} onOpen={openReading} onBack={backToShelf} />
      ) : null}

      {selectedBook && reading ? (
        <Reader
          key={selectedBook.id}
          book={selectedBook}
          page={page}
          state={state}
          pinRef={pinRef}
          onPage={goToPage}
          onClose={closeReading}
          onStar={(bookId, pageIndex) => {
            if (markPage(bookId, pageIndex)) sfx.star();
          }}
          onPin={(bookId, pinId) => {
            if (collectPin(bookId, pinId)) {
              sfx.pin();
              showToast(`¡Encontraste ${PIN_LABELS[pinId] || "un souvenir"}!`, pinId);
            }
          }}
          onQuiz={answerQuiz}
          onAct={(actor, act) => stageRef.current?.playAct(actor, act)}
        />
      ) : null}

      {album ? (
        <Album
          state={state}
          stats={stats}
          onClose={() => {
            sfx.close();
            setAlbum(false);
          }}
          onReset={() => {
            resetAll();
            sfx.close();
          }}
        />
      ) : null}

      {help ? <Help onClose={() => setHelp(false)} /> : null}

      {toast ? (
        <div className="cuentos-toast" role="status" key={toast.id}>
          <Souvenir id={toast.icon} size={44} />
          <span>{toast.message}</span>
        </div>
      ) : null}

      <MagicCursor />
    </div>
  );
}

/* =========================== barra ============================ */

function TopBar({ stats, muted, onToggleSound, onAlbum, onHelp }) {
  return (
    <header className="cuentos-top">
      <a className="cuentos-logo" href="/nido" aria-label="Tesis20 Nido, cuentos">
        <span className="cuentos-logo__comet" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="30" height="30">
            <path d="M4 34 Q 16 30 26 14" stroke="#f2c14e" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M28 4 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 z" fill="#ffd766" transform="translate(-4 -2)" />
          </svg>
        </span>
        <span>
          <small>TESIS20</small>
          <strong>Nido · Cuentos</strong>
        </span>
      </a>

      <div className="cuentos-stats" aria-label="Tu progreso">
        <span className="cuentos-stat">
          <i className="cuentos-stat__icon cuentos-stat__icon--star" aria-hidden="true" />
          <b>{stats.stars}</b>/{TOTAL_STARS}
          <em>páginas</em>
        </span>
        <span className="cuentos-stat">
          <i className="cuentos-stat__icon cuentos-stat__icon--check" aria-hidden="true" />
          <b>{stats.quiz}</b>/{TOTAL_QUIZ}
          <em>quiz</em>
        </span>
        <span className="cuentos-stat">
          <i className="cuentos-stat__icon cuentos-stat__icon--pin" aria-hidden="true" />
          <b>{stats.pins}</b>/{TOTAL_PINS}
          <em>souvenirs</em>
        </span>
      </div>

      <div className="cuentos-tools">
        <button type="button" className="cuentos-round" onClick={onToggleSound} aria-pressed={muted} title={muted ? "Activar sonido" : "Silenciar"}>
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
          <span className="cuentos-sr">{muted ? "Activar sonido" : "Silenciar"}</span>
        </button>
        <button type="button" className="cuentos-round" onClick={onAlbum} title="Mis souvenirs">
          <span aria-hidden="true">🧸</span>
          <span className="cuentos-sr">Mis souvenirs</span>
        </button>
        <button type="button" className="cuentos-round" onClick={onHelp} title="Cómo se juega">
          <span aria-hidden="true">?</span>
          <span className="cuentos-sr">Cómo se juega</span>
        </button>
        <a className="cuentos-round cuentos-round--exit" href="/" title="Volver a Tesis20">
          <span aria-hidden="true">⌂</span>
          <span className="cuentos-sr">Volver a Tesis20</span>
        </a>
      </div>
    </header>
  );
}

/* ========================== estante =========================== */

function ShelfOverlay({ state, focusedId, onFocus, onOpen }) {
  const focus = Math.max(0, BOOKS.findIndex(book => book.id === focusedId));
  const lastHover = useRef(-1);
  const rowRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const end = () => { dragRef.current = null; };
    window.addEventListener("pointerup", end);
    window.addEventListener("blur", end);
    return () => { window.removeEventListener("pointerup", end); window.removeEventListener("blur", end); };
  }, []);

  useEffect(() => {
    rowRef.current?.children[focus]?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [focus]);

  const hover = (index, id) => {
    if ((lastHover.current === index && focus === index) || dragRef.current) return;
    lastHover.current = index;
    onFocus(id);
  };

  const move = (direction) => {
    sfx.hover();
    const next = (focus + direction + BOOKS.length) % BOOKS.length;
    lastHover.current = next;
    onFocus(BOOKS[next].id);
  };

  const dragStart = (event) => {
    if (event.button !== 0) return;
    suppressClick.current = false;
    dragRef.current = { x: event.clientX, index: focus, moved: false, next: focus };
  };
  const dragMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 8) {
      drag.moved = true; suppressClick.current = true;
      rowRef.current.setPointerCapture(event.pointerId);
      const next = Math.max(0, Math.min(BOOKS.length - 1, drag.index - Math.round(dx / 145)));
      if (next !== drag.next) { drag.next = next; onFocus(BOOKS[next].id); }
    }
  };

  return (
    <div className="cuentos-shelf-ui">
      <button type="button" className="cuentos-arrow cuentos-arrow--left" onClick={() => move(-1)} aria-label="Ver cuentos anteriores">
        ‹
      </button>
      <button type="button" className="cuentos-arrow cuentos-arrow--right" onClick={() => move(1)} aria-label="Ver más cuentos">
        ›
      </button>

      <section className="cuentos-picker" aria-label="Elige un cuento">
        <p className="cuentos-picker__title">Elige un cuento <small>Arrastra para explorar · pellizca o usa + para acercarte</small></p>
        <ul ref={rowRef} className="cuentos-picker__row"
          onPointerDown={dragStart} onPointerMove={dragMove}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerCancel={() => { dragRef.current = null; suppressClick.current = true; }}
          onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
          {BOOKS.map((book, index) => {
            const status = bookStatus(state, book);
            const pins = bookPins(book);
            return (
              <li key={book.id} className={index === focus ? "is-focus" : ""}>
                <button
                  type="button"
                  onClick={() => onOpen(book.id)}
                  onPointerMove={event => { if (event.pointerType === "mouse" && !event.buttons) hover(index, book.id); }}
                  onFocus={() => hover(index, book.id)}
                  aria-label={`Abrir ${book.title}. ${status.pct}% leído.`}
                >
                  <span className="cuentos-picker__cover" aria-hidden="true">
                    <BookCover book={book} />
                  </span>
                  <span className="cuentos-picker__copy">
                    <strong style={{ color: book.accent }}>{book.title}</strong>
                    <span className="cuentos-picker__bar">
                      <i style={{ width: `${status.pct}%`, background: book.accent }} />
                    </span>
                    <span className="cuentos-picker__meta">
                      <em>{status.finished ? "Terminado ★ Léelo otra vez" : `${book.pages.length} páginas`}</em>
                      <span className="cuentos-picker__pins">
                        {pins.map((pin) => (
                          <i key={pin.id} className={status.pins.includes(pin.id) ? "is-owned" : ""} />
                        ))}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* =========================== mesa ============================= */

function DeskPanel({ book, status, ready, onOpen, onBack }) {
  return (
    <div className={`cuentos-desk ${ready ? "is-ready" : ""}`}>
      <div className="cuentos-desk__panel" style={{ "--accent": book.accent }}>
        <p className="cuentos-modal__eyebrow">Tesis20 Nido · cuento</p>
        <h2>{book.title}</h2>
        <p className="cuentos-desk__tagline">{book.tagline}</p>
        <p className="cuentos-desk__meta">
          {book.pages.length} páginas · {status.finished ? "terminado" : `${status.pct}% leído`} · {status.pins.length} de 5 souvenirs
        </p>
        <button type="button" className="cuentos-btn cuentos-btn--read" onClick={onOpen} autoFocus>
          📖 Abrir el libro
        </button>
        <button type="button" className="cuentos-btn cuentos-btn--ghost" onClick={onBack}>
          Volver a la estantería
        </button>
        <span className="cuentos-card__corner" aria-hidden="true" />
      </div>
    </div>
  );
}

/* ============================ lector ========================== */

const WORD_SPLIT = /(\s+)/;

function Reader({ book, page, state, pinRef, onPage, onClose, onStar, onPin, onQuiz, onAct }) {
  const pageData = book.pages[page];
  const entry = state.books[book.id] || { pages: [], pins: [], quiz: [], quizOk: 0 };
  const [activeWord, setActiveWord] = useState(-1);
  const [autoRead, setAutoRead] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const autoRef = useRef(false);

  const words = useMemo(() => pageData.x.split(WORD_SPLIT), [pageData.x]);
  const wordIndexes = useMemo(() => {
    let count = -1;
    return words.map((token) => {
      if (/^\s+$/.test(token) || token === "") return -1;
      count += 1;
      return count;
    });
  }, [words]);

  const isLast = page === book.pages.length - 1;
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    onStar(book.id, page);
    // La página es el evento: la función del progreso puede cambiar de
    // referencia después de guardar y no debe volver a marcarla en bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id, page]);

  // La voz de estudio de esta página y de la siguiente se descargan antes de
  // que se pidan, para que «Léemelo» y el pase de hoja no esperen a la red.
  useEffect(() => {
    let cancelled = false;
    loadCuentosVoices().then(() => {
      if (cancelled) return;
      prefetchTracks([pageTrack(book.id, page), pageTrack(book.id, page + 1)]);
    });
    return () => {
      cancelled = true;
    };
  }, [book.id, page]);

  // Efectos de la página: los de apertura suenan al mostrarla; los de las
  // palabras se descargan ya para dispararse en el instante justo.
  const firedCues = useRef(new Set());
  useEffect(() => {
    firedCues.current = new Set();
    let cancelled = false;
    const timer = window.setTimeout(() => {
      loadCuentosSound().then(() => {
        if (cancelled) return;
        prefetchCues([...Object.values(pageData.cues || {}).map((cue) => cue.sfx), ...(pageData.sfxEnd || [])].filter(Boolean));
        // Ambiente de fondo (pájaros…): bajo, para no tapar la voz.
        (pageData.sfx || []).forEach((key) => playCue(key, { volume: 0.35 }));
      });
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [book.id, page, pageData]);

  // Una palabra narrada puede disparar un efecto y una acción del escenario
  // («sopló» → soplido del lobo). Cada palabra dispara una sola vez por lectura.
  const bodyWords = useMemo(() => pageData.x.split(/\s+/).filter(Boolean), [pageData.x]);
  const fireCue = useCallback(
    (bodyIndex) => {
      const cues = pageData.cues;
      if (!cues || bodyIndex < 0) return;
      const key = wordKey(bodyWords[bodyIndex]);
      const cue = key ? cues[key] : null;
      if (!cue || firedCues.current.has(bodyIndex)) return;
      firedCues.current.add(bodyIndex);
      if (cue.sfx) playCue(cue.sfx);
      if (cue.act) Object.entries(cue.act).forEach(([actor, act]) => onAct?.(actor, act));
    },
    [pageData.cues, bodyWords, onAct],
  );

  useEffect(() => () => stopSpeech(), []);

  const turnTo = useCallback(
    (next) => {
      if (next < 0 || next > book.pages.length - 1) return;
      stopSpeech();
      setSpeaking(false);
      setActiveWord(-1);
      sfx.page();
      onPage(next);
    },
    [book.pages.length, onPage],
  );

  const readAloud = useCallback(() => {
    if (!speechAvailable()) return;
    setSpeaking(true);
    // Se espera al manifiesto de voces (ya pedido al abrir la biblioteca) para
    // que la primera página no salga con la voz del navegador por una carrera.
    loadCuentosVoices().then(() => {
      if (pageRef.current !== page || !autoRef.current) return;
      speak(`${pageData.t}. ${pageData.x}`, {
        track: pageTrack(book.id, page),
        onWord: (index) => {
          const titleWords = pageData.t.split(/\s+/).filter(Boolean).length;
          setActiveWord(index < 0 ? -1 : index - titleWords);
          if (index >= titleWords) fireCue(index - titleWords);
        },
        onEnd: () => {
          setSpeaking(false);
          setActiveWord(-1);
          // Festejos y remates suenan cuando la narradora termina, no encima.
          (pageData.sfxEnd || []).forEach((key) => playCue(key, { volume: 0.6 }));
          if (autoRef.current) {
            window.setTimeout(() => {
              if (!autoRef.current) return;
              if (page < book.pages.length - 1) turnTo(page + 1);
              else setAutoRead(false);
            }, 900);
          }
        },
      });
    });
  }, [pageData, page, book.id, book.pages.length, turnTo, fireCue]);

  useEffect(() => {
    autoRef.current = autoRead;
    if (autoRead) firedCues.current = new Set();
    if (autoRead) readAloud();
    else {
      stopSpeech();
      setSpeaking(false);
      setActiveWord(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRead]);

  useEffect(() => {
    if (autoRef.current) readAloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const onKey = (event) => {
      if (quizOpen) {
        if (event.key === "Escape") setQuizOpen(false);
        return;
      }
      if (event.key === "ArrowRight") turnTo(page + 1);
      if (event.key === "ArrowLeft") turnTo(page - 1);
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, turnTo, onClose, quizOpen]);

  const sayWord = (token) => {
    if (autoRef.current) return;
    const clean = token.replace(/[^\wáéíóúüñÁÉÍÓÚÜÑ¿?¡!.,";:-]/g, "");
    if (!clean) return;
    sfx.hover();
    speak(clean, { rate: 0.8, track: wordTrack(token) });
  };

  const pinFound = pageData.pin ? entry.pins.includes(pageData.pin) : true;

  return (
    <div className="cuentos-reading">
      <div className="cuentos-stars-row" aria-label="Páginas leídas">
        {book.pages.map((unused, i) => (
          <button key={i} type="button" className={entry.pages.includes(i) ? "is-read" : ""} onClick={() => turnTo(i)} aria-label={`Ir a la página ${i + 1}`} aria-current={i === page}>
            ★
          </button>
        ))}
      </div>

      <article className="cuentos-card cuentos-card--page-copy" aria-live="polite">
        <p className="cuentos-card__eyebrow">
          Página {page + 1} de {book.pages.length}
        </p>
        <h2 className="cuentos-card__title">{pageData.t}</h2>
        <p className="cuentos-card__text">
          {words.map((token, i) => {
            if (/^\s+$/.test(token) || token === "") return <span key={i}>{token}</span>;
            const index = wordIndexes[i];
            return (
              <button key={i} type="button" className={`cuentos-word ${index === activeWord ? "is-active" : ""}`} onClick={() => sayWord(token)}>
                {token}
              </button>
            );
          })}
        </p>
        <p className="cuentos-card__hint">toca las palabras para escucharlas</p>
        <span className="cuentos-card__corner" aria-hidden="true" />
      </article>

      {pageData.pin && !pinFound ? (
        <button
          ref={pinRef}
          type="button"
          className="cuentos-pin3d"
          onClick={() => onPin(book.id, pageData.pin)}
          aria-label="Souvenir escondido"
          style={{ opacity: 0 }}
        >
          <Souvenir id={pageData.pin} size={44} />
          <i />
          <i />
          <i />
        </button>
      ) : null}

      <div className="cuentos-controls cuentos-controls--reading">
        <button type="button" className="cuentos-btn cuentos-btn--nav" onClick={() => turnTo(page - 1)} disabled={page === 0} aria-label="Página anterior">
          ←
        </button>
        <div className="cuentos-controls__center">
          {speechAvailable() ? (
            <button type="button" className={`cuentos-btn cuentos-btn--read ${autoRead ? "is-on" : ""}`} onClick={() => setAutoRead((prev) => !prev)}>
              {autoRead ? (speaking ? "⏸ Pausa" : "⏸ Leyendo…") : "▶ Léemelo"}
            </button>
          ) : null}
          <button type="button" className="cuentos-btn cuentos-btn--ghost" onClick={onClose}>
            🏠 Cerrar el libro
          </button>
          {isLast ? (
            <button
              type="button"
              className="cuentos-btn cuentos-btn--quiz"
              onClick={() => {
                sfx.select();
                setQuizOpen(true);
              }}
            >
              ⭐ ¡Hora del quiz!
            </button>
          ) : null}
        </div>
        <button type="button" className="cuentos-btn cuentos-btn--nav" onClick={() => turnTo(page + 1)} disabled={isLast} aria-label="Página siguiente">
          →
        </button>
      </div>

      {quizOpen ? (
        <Quiz
          book={book}
          entry={entry}
          onAnswer={onQuiz}
          onClose={() => {
            sfx.close();
            setQuizOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

/* ============================= quiz =========================== */

function Quiz({ book, entry, onAnswer, onClose }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = book.quiz[index];

  const options = useMemo(() => {
    const list = question.a.map((text, i) => ({ text, correct: i === 0, index: i }));
    const rand = seeded(`${book.id}-quiz-${index}`);
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [question, index, book.id]);

  // La pregunta y sus opciones se leen en el orden en que se ven: los peques
  // de tres años no leen todavía, pero sí eligen lo que escuchan.
  const readQuestion = useCallback(() => {
    return speakSequence(quizTracks(book.id, index, options.map((option) => option.index)));
  }, [book.id, index, options]);

  useEffect(() => {
    if (done) return undefined;
    let stop = () => {};
    let cancelled = false;
    loadCuentosVoices().then(() => {
      if (!cancelled) stop = readQuestion();
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [done, readQuestion]);

  const choose = (option) => {
    if (picked) return;
    stopSpeech();
    setPicked(option);
    onAnswer(book.id, index, option.correct);
    if (option.correct) {
      setScore((prev) => prev + 1);
      sfx.right();
    } else {
      sfx.wrong();
    }
    window.setTimeout(() => {
      if (index + 1 < book.quiz.length) {
        setIndex(index + 1);
        setPicked(null);
      } else {
        setDone(true);
        sfx.cheer();
      }
    }, 1200);
  };

  return (
    <div className="cuentos-modal" role="dialog" aria-modal="true" aria-label={`Quiz de ${book.title}`}>
      <div className="cuentos-modal__panel cuentos-modal__panel--quiz">
        {done ? (
          <div className="cuentos-quiz__done">
            <p className="cuentos-modal__eyebrow">Quiz terminado</p>
            <h2>
              {score} de {book.quiz.length} correctas
            </h2>
            <p>{score === book.quiz.length ? "¡Perfecto! Escuchaste con mucha atención." : "¡Muy bien! Puedes volver a leer el cuento cuando quieras."}</p>
            <div className="cuentos-quiz__stars" aria-hidden="true">
              {book.quiz.map((unused, i) => (
                <span key={i} className={i < score ? "is-on" : ""}>
                  ★
                </span>
              ))}
            </div>
            <button type="button" className="cuentos-btn cuentos-btn--read" onClick={onClose}>
              Volver al cuento
            </button>
          </div>
        ) : (
          <>
            <p className="cuentos-modal__eyebrow">
              Pregunta {index + 1} de {book.quiz.length}
              {entry.quiz.includes(index) ? " · ya respondida" : ""}
            </p>
            <h2>{question.q}</h2>
            <button type="button" className="cuentos-quiz__replay" onClick={readQuestion} aria-label="Escuchar la pregunta otra vez">
              🔊 Escuchar otra vez
            </button>
            <ul className="cuentos-quiz__options">
              {options.map((option) => (
                <li key={option.text}>
                  <button type="button" className={picked ? (option.correct ? "is-right" : option === picked ? "is-wrong" : "") : ""} onClick={() => choose(option)}>
                    {option.text}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="cuentos-btn cuentos-btn--ghost" onClick={onClose}>
              Salir del quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================ álbum =========================== */

function Album({ state, stats, onClose, onReset }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="cuentos-modal" role="dialog" aria-modal="true" aria-label="Mis souvenirs">
      <div className="cuentos-modal__panel cuentos-modal__panel--album">
        <header className="cuentos-album__head">
          <div>
            <p className="cuentos-modal__eyebrow">Tesis20 Nido · búsqueda del tesoro</p>
            <h2>Mis souvenirs</h2>
            <p className="cuentos-album__lead">En cada cuento hay cinco souvenirs escondidos. Tócalos cuando los veas brillar y se quedan contigo en la repisa.</p>
          </div>
          <div className="cuentos-album__totals">
            <span>
              <b>{stats.stars}</b>
              <em>/{TOTAL_STARS} páginas</em>
            </span>
            <span>
              <b>{stats.quiz}</b>
              <em>/{TOTAL_QUIZ} quiz</em>
            </span>
            <span>
              <b>{stats.pins}</b>
              <em>/{TOTAL_PINS} souvenirs</em>
            </span>
          </div>
          <button type="button" className="cuentos-modal__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <ul className="cuentos-album__medals">
          {MEDALS.map((medal) => (
            <li key={medal.id} className={medal.need(stats) ? "is-on" : ""}>
              {medal.label}
            </li>
          ))}
        </ul>

        <ul className="cuentos-album__books">
          {BOOKS.map((book) => {
            const status = bookStatus(state, book);
            return (
              <li key={book.id}>
                <span className="cuentos-album__cover">
                  <BookCover book={book} />
                </span>
                <div className="cuentos-album__info">
                  <strong>{book.title}</strong>
                  <span className="cuentos-album__bar">
                    <i style={{ width: `${status.pct}%`, background: book.accent }} />
                  </span>
                  <small>
                    {status.finished ? "Terminado" : `${status.pct}% leído`} · {status.pins.length} de 5 souvenirs · quiz {status.quizOk}/{book.quiz.length}
                  </small>
                </div>
                <div className="cuentos-album__pins">
                  {bookPins(book).map((pin) => {
                    const owned = status.pins.includes(pin.id);
                    return (
                      <span key={pin.id} className={owned ? "is-owned" : "is-locked"} title={owned ? PIN_LABELS[pin.id] : "Todavía escondido"}>
                        <Souvenir id={pin.id} size={40} locked={!owned} />
                      </span>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>

        <footer className="cuentos-album__foot">
          <p>Todo se guarda solo en este dispositivo. No pedimos ningún dato del niño.</p>
          {confirm ? (
            <span className="cuentos-album__confirm">
              ¿Seguro que quieres empezar de nuevo?
              <button type="button" className="cuentos-btn cuentos-btn--quiz" onClick={onReset}>
                Sí, borrar
              </button>
              <button type="button" className="cuentos-btn cuentos-btn--ghost" onClick={() => setConfirm(false)}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className="cuentos-btn cuentos-btn--ghost" onClick={() => setConfirm(true)}>
              Empezar de nuevo
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

/* ============================ ayuda =========================== */

const STEPS = [
  { icon: "📚", title: "Elige un cuento", text: "Toca un libro de la repisa: baja a la mesa y puedes abrirlo. Cada uno tiene 10 páginas ilustradas." },
  { icon: "🔊", title: "Léemelo", text: "La voz lee en voz alta y va marcando cada palabra. También puedes tocar una palabra suelta." },
  { icon: "🔍", title: "Busca el souvenir", text: "En cinco páginas hay un objeto escondido que brilla sobre la ilustración. Tócalo y aparecerá como figura en la repisa." },
  { icon: "⭐", title: "Responde el quiz", text: "Al terminar el libro aparecen cinco preguntas sobre lo que pasó." },
];

function Help({ onClose }) {
  return (
    <div className="cuentos-modal" role="dialog" aria-modal="true" aria-label="Cómo se juega">
      <div className="cuentos-modal__panel cuentos-modal__panel--help">
        <button type="button" className="cuentos-modal__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <p className="cuentos-modal__eyebrow">Para acompañar a los peques</p>
        <h2>Cómo se juega</h2>
        <ul className="cuentos-help">
          {STEPS.map((step) => (
            <li key={step.title}>
              <span aria-hidden="true">{step.icon}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="cuentos-help__note">La narración usa una voz de estudio grabada para Tesis20 Nido; si un audio no se puede descargar, lee la voz del navegador. Si no se escucha, revisa que el dispositivo no esté en silencio y que el sonido de la aplicación esté activado.</p>
        <button type="button" className="cuentos-btn cuentos-btn--read" onClick={onClose}>
          Empezar a leer
        </button>
      </div>
    </div>
  );
}
