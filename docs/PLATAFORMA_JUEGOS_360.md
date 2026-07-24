# Plataforma 360 de videojuegos educativos — Nido

Fecha: 2026-07-24 · Primera entrega: **Misión del Bosque: recolecta y entrega**

## 1. Diagnóstico de la arquitectura actual

| Aspecto | Estado real |
|---|---|
| Framework | React 19 + Vite 6, SPA estática (sin SSR) desplegada en Vercel |
| Lenguaje | JavaScript (JSX). **No hay TypeScript**, ni ESLint, ni test runner |
| Rutas | `App.jsx` conmuta plataformas; `/nido` carga `nido-page.jsx` como chunk diferido |
| Retos actuales | `nido-games.jsx` (diálogo modal) + `nido-curriculum.js` (1740 retos procedurales con semilla determinista, 5 áreas × 29 subcategorías × 20 retos × 3 edades) |
| Audio | Narración profesional pregrabada (manifest + fallback `speechSynthesis`), sonidos de acierto/error |
| Progreso | `localStorage` (`tesis20-nido-progress-v2`, `tesis20.nido.route-rounds`, `tesis20.nido.sticker-album`). **No hay backend, BD, autenticación ni paneles** — el "login" es una demo local declarada |
| Asistente | Mascota tucán (`NidoMascot`, SVG vectorial con poses). El robot flotante de la captura pertenece a otra app (widget SiraGPT), no a este repo |
| Presupuestos | `quality-check.mjs` (1500 controles): JS diferido ≤ 640 KiB, CSS diferido ≤ 160 KiB, JS inicial ≤ 450 KiB, prohíbe `requestFullscreen` |
| Pruebas existentes | `npm run check` = build + quality-check + check-nido-curriculum (validador exhaustivo del currículo y del audio profesional por hash) |

## 2. Decisión de motor: runtime propio en lugar de Phaser

**Justificación (regla 4):** Phaser 3 pesa ~350 KiB gzip (~1.2 MB min). El presupuesto
total de JS diferido es 640 KiB y ya usamos ~600. La primera experiencia necesita
física arcade simple (gravedad, AABB, coyote time, jump buffering), cámara con
seguimiento y render 2D por canvas: ~30 KiB de código propio. Se implementa un
**runtime ligero** con las mismas separaciones conceptuales (loop de vida,
escenas, física, input, audio, contenido) y un contrato de eventos idéntico al
propuesto, de modo que si en el futuro se decide migrar a Phaser, el shell, el
contenido y el Learning Engine no cambian.

**TypeScript estricto (regla 8):** convertir el repo a TS sería un cambio de
framework de build no justificado para esta entrega (regla 4/5). Compromiso:
contratos documentados con JSDoc en cada módulo del motor, componentes pequeños
y separación estricta de responsabilidades. La migración a TS queda como fase
posterior no bloqueante.

## 3. Qué se conserva y qué se añade

**Se conserva (sin tocar):** navegación, catálogo, currículo, retos actuales,
narración profesional, progreso existente, estilos, presupuestos, camino de
aprendizaje y álbum de premios.

**Se añade (aditivo):**

```
src/nido/game/
  core/event-bus.js        Contrato tipado (JSDoc) plataforma <-> juego
  core/game-loop.js        Ciclo fijo (accumulator), pausa por visibilidad, teardown
  engine/physics.js        Física arcade: aceleración, gravedad, coyote, buffer, AABB
  audio/audio-director.js  Buses master/música/sfx (WebAudio), ducking al narrar,
                           preferencias persistidas, arranque tras gesto del usuario
  learning/difficulty.js   Adaptador explicable: rachas suben, 2 errores → ayuda,
                           3 errores → baja complejidad; dominio ≠ puntuación
  content/forest-mission.js Definición por edad + generador determinista de 20 rondas
  bosque/BosqueGame.jsx    GameHost React: intro → misión → conteo → celebración
  bosque/forest-renderer.js Render canvas: parallax, personajes vectoriales, partículas
tests/nido-game/*.test.mjs  node --test: generador, dificultad, bus de eventos
```

El juego se carga **bajo demanda** con `React.lazy(() => import(...))`: Vite lo
separa en un chunk propio que solo se descarga al abrir la misión.

## 4. Personajes originales (placeholders vectoriales propios)

- **Niko**: explorador jugable (canvas vectorial: cuerpo redondeado, mochila,
  estados idle/walk/run/jump/fall/carry/celebrate/tryAgain).
- **Luma**: criatura luminosa narradora (halo pulsante, flota junto a la misión,
  celebra y consuela).
- **TesiBot y Mimo**: reservados en el AnimationRegistry (estados definidos,
  arte pendiente) para no bloquear la entrega vertical.

`forest-renderer.js` actúa como AnimationRegistry: cada personaje es una función
`(ctx, estado, t)` reemplazable por sprite atlas o Rive sin tocar la lógica.

## 5. Contrato de eventos

`platform -> game`: START_GAME · PAUSE_GAME · RESUME_GAME · SET_VOLUME ·
LOAD_LEVEL — `game -> platform`: GAME_READY · LEVEL_STARTED · OBJECT_COLLECTED ·
ANSWER_SUBMITTED · HINT_USED · LEVEL_COMPLETED · GAME_PAUSED · GAME_EXITED ·
GAME_ERROR. El motor **no** escribe progreso: emite resultados y el shell
(`nido-games.jsx`) persiste con sus servicios actuales (localStorage hoy).

## 6. Flujo de datos

```
Catálogo (Matemáticas) ──abrir──▶ <dialog> GameHost (lazy chunk)
GameHost ──gesto Comenzar──▶ AudioDirector.start() + Luma narra (ducking música)
loop: input → physics → misiones → render (canvas 960×540, cámara lerp)
recoger fruta → OBJECT_COLLECTED → HUD; cesta → conteo visual+verbal
ANSWER_SUBMITTED → DifficultyAdapter (racha/ayuda) → celebración o "Casi…"
LEVEL_COMPLETED×20 → GAME_EXITED → shell guarda progreso bosque + premio álbum
cerrar diálogo → unmount → loop.stop() + AudioContext.close() + listeners fuera
```

## 7. Adaptación por edad (perfiles en `forest-mission.js`)

| Edad | Objetivo | Cantidades | Escenario | Ayudas |
|---|---|---|---|---|
| 2–3 | uno/muchos, tocar y llevar | 1–2 | 1 arbusto suave, sin plataformas | fila de frutas-guía permanente |
| 4–5 | contar 1–5, cantidad hablada, sumas ≤5 | 2–5 (o 1+2…) | 2 obstáculos, 1 plataforma | guía tras 2 errores |
| 6 | sumas y restas ≤10, misiones más largas | 3–10 (a+b, a−b) | 3 obstáculos, 2 plataformas | guía tras 2 errores, menos automática |

(La plataforma agrupa 2–7 años en tres bandas existentes: 2-3, 4-5, 6.)

## 8. Riesgos técnicos

1. **Presupuesto JS** (640 KiB): el chunk del juego suma ~30-40 KiB min. Si se
   excede, se documenta y ajusta el presupuesto como en entregas anteriores.
2. **`speechSynthesis`** no pasa por WebAudio: el ducking se aplica a la música
   (bus music → 25 %) y el volumen de la voz se controla en la utterance. En
   ronda base de los retos clásicos la narración sigue siendo la pregrabada.
3. **Sesiones paralelas** empujando a `main`: merges cuidadosos ya establecidos.
4. **Rendimiento móvil**: canvas 960×540 escalado + dibujo vectorial simple
   mantiene 60 FPS en equipos medios; `prefers-reduced-motion` desactiva
   parallax animado y partículas.

## 9. Privacidad y accesibilidad (aplicadas en esta entrega)

Sin cámaras/micrófono/chat/publicidad; datos solo en `localStorage` del
dispositivo; controles táctiles ≥ 64 px; teclado completo (flechas/AD, espacio,
E, Escape); foco visible; subtítulos de la narración; sin límites de tiempo;
caídas sin castigo (reaparición suave); música silenciable sin apagar la voz.

## 10. Plan por fases

- **F1 (esta entrega):** motor ligero + Misión del Bosque (20 rondas, 3 bandas
  de edad, teclado+táctil, AudioDirector, dificultad adaptativa, premio álbum).
- **F2:** segunda plantilla (`SortAndMatch` clasificar arrastrando) reutilizando
  motor; documento "cómo añadir un juego" validado con ese caso.
- **F3:** plantillas Rhythm y TraceAndDraw; mapa de mundos visual.
- **F4:** panel parental local (exportar/borrar datos), TS gradual, e2e
  automatizado.

## 11. Cómo añadir un segundo juego sin tocar el núcleo

1. Crear `src/nido/game/<tu-juego>/definicion.js` exportando un
   `MissionDefinition` (ver JSDoc en `content/forest-mission.js`).
2. Crear su componente host que monte `createGameLoop` + `createAudioDirector`
   (o reutilizar `BosqueGame.jsx` como plantilla `PickAndDeliver`).
3. Registrar la tarjeta de entrada en `nido-games.jsx` (área correspondiente)
   con `React.lazy`.
4. Añadir pruebas del generador en `tests/nido-game/`.
El bus de eventos, la física, el audio y la dificultad no se modifican.
