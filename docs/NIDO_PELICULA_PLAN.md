# Nido Película — plan de trabajo

> Generated 2026-09-29 from an analysis of origin/main 328de59 (4 code readers, 3 competing designs, 2 judges). Specs reference line numbers at that commit; re-verify before editing.

## Resumen (para Luis)

Vamos a convertir cada cuento de Nido en una película corta sin tocar textos ni audios, porque no hay créditos para volver a grabar. El trabajo va en 7 entregas y cada una se puede revisar por separado:

1. Sincronía: cada gesto cae justo en la palabra que dice la narradora y solo se mueve el personaje que habla. También se corrigen acciones absurdas en los clásicos (por ejemplo, la palabra «nada» hacía nadar a un personaje).
2. Rendimiento: cada figura pasa de unos 75 a unos 31 dibujos, para que los celulares aguanten lo nuevo.
3. Escenario: los personajes pisan la página y dan sombra, se quedan entre una página y otra, y entran o salen como figuras de libro pop-up.
4. Actuación: pies que no patinan, rodillas y codos, anticipación antes de cada acción y rebote después.
5. Modo película: la cámara usa planos generales, medios y primeros planos, y hay fundidos entre páginas. Cada página empieza y termina mostrando el libro completo. Al principio será opcional.
6. Caras: párpados, mirada, cejas y una boca que se mueve al ritmo de la voz.
7. Guiones a mano para los 11 cuentos propios y el acabado visual final.

Cada entrega se aprueba con videos grabados en computadora y en celular antes de activarla para todos.

## Architecture

# Nido Película: final architecture

This plan builds on the director-first design and adds the judges' improvements. The fixes they flagged were checked against the export at tesis20-web-main (origin/main 328de59).

## Principles
1. **One story clock.** Every narrative motion follows one clock derived from the narration audio: `HTMLAudioElement.currentTime` for the studio voice, or a clock locked to word boundaries for the device voice. Motion no longer runs on `performance.now()` deadlines.
2. **Zero data edits needed.** Each page compiles into a pure, testable timeline built from data that already exists: `acts`, `cues`, `enter`, `work`, `names`, the text, and the word starts in `cuentos-manifest.json`. All 44 books (867 pages) play as films without editing any data. Hand-written direction is an optional overlay (WP7).
3. **Persistent, layered actors.** Actors stay on stage across pages. They act through a layered pose mixer (performer) that writes rest pose plus offset once per frame. No layer can erase another.
4. **Camera = planner + solver.** The camera is a pure shot planner (director) plus a three.js solver (camera rig). It ships behind the `nido-film` flag until the owner approves recorded clips. Every page opens and closes on the whole book (the rule from PR #22/#23).
5. **Never touched:** `t`/`x`, `pageSpeechText`, pagination, cast ids, the voice profile, mp3s and the manifest. The manifest is 352 KB of its 400 KiB budget.
6. **Procedural only.** Everything stays procedural three.js: no GLTF, no skinning libraries, no WASM (the CSP forbids `wasm-unsafe-eval`), and no new dependencies.
7. **Every PR** keeps CI green, reports measured bundle and draw-call deltas, and ships before/after captures at 1440×900 and 390×844.

## Module map
**`src/nido/cuentos/film/`** (new manual chunk `nido-film`; imports only `three`, `cuentos-acts.js` and `cuentos-voice-plan.js`)

| Module | Exports | Role | WP |
|---|---|---|---|
| story-clock.js | `createStoryClock()` | Smoothed audio clock with freeze horizon; word-locked device clock | 1 |
| timeline.js | `compilePageTimeline()`, `createCursor()` | Words, sentences, pauses, dialogue lines, events; catch-up dispatch | 1 |
| dialogue.js | `dialogueLines()` | Dialogue detection and speaker attribution for em dash, en dash, hyphen-minus, «» and “” | 1 |
| act-timing.js | | Temporary `ACT_LEAD`/`ACT_PERIOD`; deleted in WP4 | 1 |
| blocking.js | `reconcileCast()` | Keep/enter/exit diff between pages | 3 |
| locomotion.js | `planTravel()`, `sampleTravel()` | 2D paths, minimum-jerk profile, exact arrival, avoidance | 3 |
| rig.js, pose.js, curves.js, act-clips.js, ik.js, gaits.js, springs.js, rng.js, performer.js | | Acting engine | 4 |
| director.js | `planShots()` | Pure shot planner | 5 |
| camera-rig.js | | Shot solver: smoothDamp springs, cuts, constraints | 5 |
| flags.js | `isFilmEnabled()` | Film flag | 5 |
| quality.js | | Adaptive quality governor | 2 |
| face-controller.js, expressions.js, lipsync.js | | Face animation and lip-sync | 6 |

**`src/nido/cuentos/three/toys/`** (new manual chunk `nido-cast`, together with `three/surfaces.js`)

| Module | Role | WP |
|---|---|---|
| rig-keys.js | `RIG_KEYS` registry | 2 |
| bake.js | Per-pivot static merge plus per-toy material dedupe, called from `buildToy()` | 2 |
| face.js | Lids, gaze, brows, mouth/jaw, `tubeMorph` | 6 |

**`src/nido/cuentos/three/`**

| Module | Role | WP |
|---|---|---|
| word-highlight.js | Instanced highlight overlay; no texture upload per word | 2 |
| diorama-actors.js | Actor lifecycle extracted from stage.js: pool, pop-up entrances and fold exits, contact shadows | 3 |

**`src/nido/cuentos/direction/<bookId>.js`**: optional hand direction, loaded with a dynamic import into `nido-direction-*` chunks (WP7).

## One frame
1. `playRecorded`'s rAF tick calls `onTime(currentTime)`, which calls `clock.pushAudioTime`. Device voice calls `onWord(i)`, which calls `clock.pushWord`.
2. `stage.loop`: `dt` is used for rendering and idle motion only. `storyT = clock.sample(now)` is taken once per frame.
3. `cursor.advance(storyT)` dispatches every event whose `fireAt` falls in `(prev, storyT]`, so a hitch can never lose a cue. Events route to:
   - performers: acts and travel;
   - the stage: scenes, and sfx through `onCue` → `playCue`;
   - speaking and look focus: lines, names.
4. `performer.update(dt, storyT)` runs the layers in order: idle, locomotion, base act, burst act, gestures, look-at, face, springs, squash. The result is written to the transforms once.
5. In film mode, `director.shotAt(storyT)` feeds `cameraRig.update(dt)`. Otherwise today's reading or cinema camera runs.
6. `governor.frame(ms)`, then `renderer.render()`. There is no EffectComposer after WP5.

## Page lifecycle
- **Reader.** It compiles the timeline from `pageTrack(book.id, page).words`. Tokenization is identical to the manifest: `${t}. ${x}`, with title words skipped the way the Reader does at L930. Then it calls `stage.playTimeline(tl)`.
- **Book mode.** The leaf turns and the pop-up folds; the cast reconciles at the fold's midpoint. Keepers walk to their new marks, newcomers pop up at the card edge, and leavers fold down.
- **Film mode.** The page ends on a wide tail shot, then a 0.7 s backdrop dissolve (`mapPrev`/`uMix` on the popup material). The cast reconciles at the dissolve start. Narration starts 0.5 s into the dissolve.
- **Prefetch.** The next page's texture, audio, timeline and newcomers are prepared in idle time (`requestIdleCallback`, then `renderer.compileAsync`).

## Data model
**Existing page fields compile one-for-one.**
- `cues[wordKey]`: every body occurrence produces act, move, scene and sfx events. This is the same once-per-position rule as today's `fireCue`.
- `acts` becomes the page-long base act. `enter` applies to newcomers.
- `move` maps onto the named marks: left→L2, right→R2, center→C, away-*→edge mark plus exit fold.
- `names` produce glow and look focus. Mood words produce mood events.

**Timeline shape:**
```
{ duration,
  words: [{ i, key, t0, t1 }],
  sentences: [{ i, w0, w1, t0, t1 }],
  pauses: [{ t0, t1 }],
  lines: [{ w0, w1, t0, t1, speakers, confidence }],
  events: [{ kind, actor, act, t, fireAt, until, word, sfx, scene, to, mood, src }] }
```

**Optional hand direction (WP7).**
- Fields: `{ blocking, lines, beats, shots, moods }`.
- Anchors are word-relative, never seconds: `{w, n}`, `{i}`, `{s}`, `0`, `'end'`, with an optional `ms` offset. They therefore survive the device-voice fallback. The 4 untimed pages (clasico-habichuelas 6, 8, 9, 10) use estimated starts.

## Modes and flags
- **📖 book mode, or cinema off:** today's camera. It still gets every sync, grounding, continuity, acting and face improvement.
- **🎬 cinema (`nido-cine`, default on) without `nido-film`:** today's cinema camera, minus Bokeh.
- **🎬 with `nido-film`** (via `?film=1` or localStorage; default off until owner sign-off): director camera, dissolves, «🎬 Ver película», true pause.
- **Reduced motion** is reactive through a `matchMedia` change listener. It gives:
  - one static `book` shot;
  - no locomotion animation: actors appear at their marks when the beat ends;
  - acts shown as key poses (owner to confirm);
  - slow blinks;
  - lip-sync at 50%;
  - no springs, saccades or dissolves.

## Budgets
| Budget | Plan |
|---|---|
| Draws per actor | Ratcheted from ≤100 to ≤60 in WP2. The bake takes the median from 75 to about 31 and the max from 95 to about 42, re-measured on the real builders with three 0.186. Later face and joint work must stay ≤60. |
| Triangles | <40k per actor and <110k per page, unchanged. |
| Total app JS | Cap is 1440 KiB; about 1406 KiB was measured on 2026-09-15. Re-measure with `npm run build && npm run quality` at the start of WP1, because PR #37 merged afterwards. |
| Plan delta | About +45 KiB of new code, minus about 17 KiB of postprocessing removed from vendor-three, minus about 8 KiB of replaced stage code: roughly +20 KiB net. |
| CuentosApp chunk | The `nido-cast` and `nido-film` manual chunks keep it under 340 KiB. Any cap raise needs a dated comment in `scripts/quality-check.mjs`. |
| Hand direction | Excluded from the engine total and capped at ≤40 KiB. |
| CI | New tests are pure, or build each toy once, so the job stays well under its 10-minute timeout. |

## Verified facts and corrections to the candidate designs
**Audio and narration**
- `pauseSpeech`/`resumeSpeech` already exist in `cuentos-audio.js` (L1011, L1021) and keep `currentTime`. Only the visibility handler uses them (L1066, L1083). The UI «⏸ Pausa» sets `autoRead` false, which calls `stopSpeech`. Only the UI wiring is missing.
- `playRecorded`'s rAF tick runs only when `starts && onWord` (L872, L903). Quiz and sequence clips have no tick, so `onTime` needs its own condition.
- `createDeviceNarration` is at `device-narrator.js` L27. In `cuentos-voice-plan.js`, `estimateWordStarts` is at L154 and `wordIndexAt` at L167.
- All 44 books have studio tracks. Only clasico-habichuelas pages 6, 8, 9 and 10 lack timings. The 11 non-classic books are hand-directed, not the only studio books.
- The CSP `connect-src 'self'` does not allow `blob:`. Envelope decoding must keep the Blob inside `fetchClip` (L811) rather than `fetch()`ing the object URL.

**Builders and rig**
- In `sculpted-human.js`: the arm tube is at L227–231 and the leg tube at L148–153. L172–177 is the skirt garment. The neck tube is at L222.
- Humans already have static hair-coloured brow tubes (L257). WP6 wraps them into `brow` pivots at no extra draw cost.
- The pigs (`fit()` at `cerdito.js` L215) and `pulgarcito-animals.js` (`fit()` at L37 and L65) bypass `finish()`. Rig metadata and the bake therefore hook into `buildToy()` (`toys/index.js` L122).
- `caracol` is a cameo/hero (`pulgarcito-data.js` L11), not a page-cast id. `concha-caracol` is in the cast but exempt from the character checks.

**Classic auto-direction**
- The parity move is at `classic-direction.js` L255 and the parity enter at L269.
- The swim regex's `as?` alternative turns «nada» into swimming.

**Dialogue**
- Markers per page: em dash on 132 pages; en dash on 39 (e.g. clasico-pinocho); hyphen-minus dialogue on 145 more pages (e.g. clasico-rapunzel `-¿Cómo`); «» or “” on 78 pages without dashes; straight quotes on 0 pages. In total, 389 pages have at least one marker.

**Stage and camera**
- Wing marks at x ±.25 would not be hidden. The card's half-width is .24 (`popupW = BOOK_W·0.96`) and the popup material is `transparent: true`. Exits therefore fold down at edge marks (±.19).
- `popupPivot.rotation.x = π/2·0.86` (`book3d.js` L94), so actors lean back 12.6° with the card. A counter-rotated `stageFloor` child fixes this.
- The cinema portrait decision uses window aspect (`stage.js` L757), while the phone cinema canvas is about 1:1 (`cuentos.css` L1806).
- The EffectComposer's default target has no MSAA samples. Camera fov is 36° (`stage.js` L125).
- Only `performance.now()` bursts need migrating: L666, L847, L990, L1003, L1049, L1119.
- `nameActor` mutates `emissive` on every non-mapped material (L487–498). Material dedupe must therefore be per toy, never a global cache.

**Continuity (corpus)**
- Of 823 page transitions, 375 keep an identical cast and 719 share at least one actor. 466 pages have a single cast member.

## Work packages

### WP1 — Film clock and compiled page timeline: actions land on the word, only real speakers gesture, no lost cues, sensible classics
*Reloj de película y guion por página: cada acción cae en su palabra y solo gesticula quien habla*

**Depends on:** —

**Goal.** First visible step. Gestures peak on the spoken word, and a hitch can no longer skip a cue. Only the character who actually speaks a dialogue line gestures; today cast[0] nods on every word of the page. Classic pages stop doing nonsense actions such as «nada» making a character swim. prefers-reduced-motion becomes live. The camera and the models do not change.

**Files:** `src/nido/cuentos/film/story-clock.js`, `src/nido/cuentos/film/timeline.js`, `src/nido/cuentos/film/dialogue.js`, `src/nido/cuentos/film/act-timing.js`, `src/nido/cuentos/cuentos-audio.js`, `src/nido/cuentos/CuentosApp.jsx`, `src/nido/cuentos/three/stage.js`, `src/nido/cuentos/three/toy-feedback.js`, `src/nido/cuentos/classic-direction.js`, `vite.config.mjs`, `tests/nido-game/story-clock.test.mjs`, `tests/nido-game/film-timeline.test.mjs`, `tests/nido-game/film-dialogue.test.mjs`, `tests/nido-game/classic-direction.test.mjs`

#### Spec

### 1) cuentos-audio.js
The module must stay import-safe in Node, because cuentos-sound.test.mjs imports it.
- `speak(text, { track, onWord, onTime, onSource, onEnd, onStart, rate })` (L960) passes `onTime` and `onSource` through to both paths.
- `playRecorded(track, { onWord, onTime, onSource, onEnd }, mySession)` (L856):
  - Run the rAF `tick` when `(starts && onWord) || onTime`. Today it runs only when `starts && onWord` (L872 and L903).
  - Inside `tick`, call `onTime?.(element.currentTime, !element.paused)` before the word lookup.
  - Call `onSource?.('studio')` right after `element.play()` resolves.
- `speakWithBrowser` (L942) calls `onSource?.('device', { rate })` before `createDeviceNarration`. This also covers a studio clip that fails and falls back (L968).
- Do not re-implement `pauseSpeech`/`resumeSpeech`. They exist at L1011 and L1021.

### 2) New film/story-clock.js (pure; `now` injectable)
```js
export function createStoryClock({ now = () => performance.now(), snap = 0.12, gain = 0.15, horizon = 0.25 } = {})
// returns { reset(mode, { starts } = {}), pushAudioTime(sec, playing), pushWord(trackIndex),
//           sample(frameMs) -> seconds | null, mode, playing, seeked }
```
**Mode 'studio'.** State: `est`, `lastFrameMs`, `lastAudio`, `lastAudioAtMs`.
- `sample(f)`: while playing, `est += (f - lastFrameMs)/1000`. Then clamp `est` to at most `lastAudio + min(horizon, (f - lastAudioAtMs)/1000)`. The clock therefore freezes within 0.25 s when audio stops reporting (pause, hidden tab, stall).
- `pushAudioTime(a)`: `err = a - est`. If `|err| > snap`, set `est = a` (a seek). Otherwise `est += gain*err`.
- Output is monotonic: `out = max(prevOut, est)`. The exception is `a < prevOut - 0.25` (a replay or backward seek): then return `a` and set `seeked = true`.

**Mode 'device'.**
- `starts = estimateWordStarts(pageSpeechText(page), words * max(0.23, 1/(rate*3.1)))`. That is cuentos-voice-plan.js L154, using the same per-word interval as device-narrator.js L47-49.
- `pushWord(i)` anchors `(starts[i], f)`.
- `sample(f) = min(starts[i] + (f - anchorMs)/1000, starts[i+1] - 0.01)`. The clock never runs ahead of the next boundary event.

**Mode 'wall'.** Seconds since `reset`, for manual reading. Timeline cues are not dispatched in this mode, which matches today's behaviour.

### 3) New film/timeline.js (pure)
```js
export function compilePageTimeline(page, { starts, duration, titleWordCount, names = {}, source = 'studio' })
export function createCursor(events) // { advance(t) -> Event[], seek(t) }
```
**Tokenization and word times**
- Tokenize the same way as the Reader (`page.x.split(/\s+/).filter(Boolean)`, CuentosApp.jsx L859) and the manifest (`splitWords(pageSpeechText(page))`).
- `titleWordCount = page.t.split(/\s+/).filter(Boolean).length`, as at CuentosApp L930. Body word i starts at `starts[titleWordCount + i]`.
- When `starts` is null, use the device estimate. This covers the device voice and clasico-habichuelas pages 6, 8, 9 and 10.
- `words[i] = { i, key: wordKey(token), t0, t1 }`, with `t1 = min(nextStart, t0 + 0.075*letters + 0.10)`. For the last word, also cap at `duration - 0.05`.
- `sentences` split after tokens ending in `. ! ? …`, optionally followed by `» ” — –`.
- `pauses` are word-start gaps of 0.35 s or more. WP5 uses them for cuts and WP6 for the resting mouth.

**Events.** Sorted by `fireAt`; shape `{ kind, actor, act, t, fireAt, until, word, sfx, scene, to, mood, src }`.
- For every body index i where `cues[words[i].key]` exists (the same once-per-position semantics as `fireCue` plus `firedCues`, CuentosApp L872-890):
  - `sfx` at `t - 0.06`, matching today's HIGHLIGHT_LEAD;
  - one `act` per `cue.act` entry, with `fireAt = t - ACT_LEAD[act]` and `until = t + (cue.hold ?? 1500)/1000`;
  - `move` with `to = where` and `until = t + max(hold/1000, 1.2)`;
  - `scene` at `t`.
- `names` produce a `name` event, for cast actors only.
- Mood words produce a `mood` event, which WP6 consumes. The list is the classic-direction.js L62-70 table plus `lloró|lloraba|triste|feliz|sorpresa|asombro|asustado|asustada`.
- Each line with a confident speaker produces:
  - `line-start` at `t0 - 0.12`;
  - `line-end` at `t1 + 0.2`;
  - one `talk` per word start inside the line. This replaces `onWordTick`.

**Cursor**
- `advance(t)` returns every event with `prev < fireAt <= t`, in order. This is catch-up: a 250 ms frame fires each skipped event exactly once.
- Late `sfx` (more than 0.3 s behind) are dropped. Late acts and travels are still applied with their scheduled start.
- `seek(t)` moves the cursor without re-firing. Call it when the clock reports `seeked`.

### 4) New film/dialogue.js (pure)
`dialogueLines(bodyWords, { cast, names, starts })` returns `[{ w0, w1, t0, t1, speakers: [], confidence }]`.

**Openers** (all of these occur in the corpus):
- `—`: 132 pages;
- `–`: 39 pages (clasico-pinocho);
- a token starting with `-` followed by a letter, ¿ or ¡: 145 more pages (clasico-rapunzel);
- `«…»` and `“…”`: 78 pages with no dashes;
- straight quotes: accepted, although 0 pages use them.

**Dash state machine**
- narration → (dash) speech → (dash) attribution → (dash) speech again.
- From attribution, a sentence end followed by a non-dash token returns to narration.
- Speech with no closing mark ends at its second sentence end, with confidence set to `name`.

**Speaker precedence**
1. `tag`: the attribution clause, or the 9 tokens after a closing quote, contains a speech verb (`dijo|dijeron|gritó|gritaron|preguntó|respondió|contestó|exclamó|susurró|murmuró|pensó|añadió|chilló|saludó|llamó|repitió`) and a cast name from `book.names` (compared with `wordKey`).
2. `offscreen`: the speech verb is followed by a noun that is not in the cast (`—dijo mamá`). No speaker.
3. `plural`: `dijeron` or `gritaron` makes every cast member speak, except the speaker of the adjacent line.
4. `single`: the page has exactly one cast member.
5. `turn`: the page has two cast members, and the previous line was the other one's.
6. `name`: the last cast name within the 25 tokens before. Used for gaze only.
7. `none`.

Only `tag`, `plural`, `single` and `turn` produce `line-start` events.

### 5) New film/act-timing.js (temporary; WP4 replaces it with clip `hit` times)
**`ACT_LEAD[act]`** = min(0.35 s, the first maximum of the act's primary oscillator in stage.js `applyAct`):

| Act | Lead (s) | Oscillator |
|---|---|---|
| blow, nod | .314 | sin 5t |
| jump | .35 | sin 4.2t, capped |
| cheer | .245 | abs sin 6.4t |
| sing | .26 | |
| build | .224 | |
| hug | .20 | |
| dance | .196 | |
| run | .175 | |
| howl, look, listen, think | .15 | |
| fly, swim | .12 | |
| peck | .112 | |
| wave, walk, sniff | .10 | |
| raise | .35 | |
| shiver, sleep | 0 | |

**`ACT_PERIOD[act]`** = π/ω of that oscillator.

### 6) stage.js
**New API**
- `createStage(canvas, { ..., onCue })`.
- `setStoryClock(clock | null)`, `playTimeline(timeline | null)`, `setReduceMotion(bool)`.

**Per frame (loop, L2117)**
- `storyT = storyClock?.sample(now) ?? null`. When a timeline is set, `cursor.advance(storyT)` returns events to dispatch:
  - `act`: `startBurst(holder, act, { start: fireAt, until })`.
  - `move`: `travelTo(actor, to, act, holdMs)`.
  - `scene`: `sceneEvent`.
  - `name`: glow and hop, plus `lookFocus = actor` for 1.5 s. It no longer sets `speakingId` (L499); listeners turn toward `lookFocus`.
  - `sfx`: `onCue(key)`.
  - `line-start` / `line-end`: `setSpeaking(speaker | null)`.
  - `talk`: `talkPulse = 1`.

**Burst clock**
- Replace each `performance.now()` deadline (L666, L847, L990, L1003, L1049, L1119) with `actingNow()`. It returns `storyT` while a timeline plays and `clock.t` otherwise.
- Store `burst.base` so a burst is always compared with the clock that created it.
- `applyAct` evaluates a burst act with burst-local `tb = actingNow() - burst.start` and phase 0, so the peak lands on the word.
- A burst no longer ends at `until` itself. Extend it to `start + ceil((until - start)/ACT_PERIOD)*ACT_PERIOD`, capped at `until + 0.45 s`. It then ends on a zero of the motion, and jumps stop snapping from `baseY + .09` to the floor.

**Talk gesture**
- Compute the speaker's nod and hop offsets, run `applyAct`, then add the offsets. Today `applyAct` zeroes `actor.rotation.x` (L1143) and so erases the nod set at L2199.
- Reduce the head-scale talk from 0.09 to 0.04. WP6 removes it.

**Reduced motion**
- `reduceMotion` becomes a `let`.
- `setReduceMotion(v)` updates it and calls a new `feedback.setReduceMotion(v)` in toy-feedback.js (created at L132).

### 7) CuentosApp.jsx
**`readAloud` (L912)**
- Compile the timeline from `pageTrack(book.id, page)` (`words`, `duration`), `book.names` and `pageData.cast`.
- Reset a per-Reader `createStoryClock()` held in a `useRef`.
- Pass:
  - `onTime: clock.pushAudioTime`;
  - `onSource`: reset the clock mode. For `'device'`, recompile the timeline with estimated starts.
- In `onWord`, add `clock.pushWord(index)` next to the unchanged highlight code (`setActiveWord`/`onStoryWord`).
- New Reader prop `onTimeline(tl, clock)` → `stage.setStoryClock(clock); stage.playTimeline(tl)`. Call `onTimeline(null)` in `onEnd`, in `turnTo`, and when `autoRead` becomes false.

**Remove**
- `onSpeaking(cast[0])` at L925.
- The act, move, scene and name dispatch in `fireCue` (L872-890). Delete `fireCue` itself.
- `onWordTick` at L934.

**Wire**
- `createStage(..., { onCue: (key) => playCue(key) })` at L133.
- Next to `createStage`, a `matchMedia('(prefers-reduced-motion: reduce)')` change listener that calls `stage.setReduceMotion(e.matches)`. Remove it in cleanup.

### 8) classic-direction.js (verb table L51-61)
These are data-only fixes; no text or audio changes.

| Action | New pattern | Removes |
|---|---|---|
| walk | `^(camin(a\|an\|aba\|aban\|ó\|aron\|ando\|ar)\|anduv[a-z]*\|lleg(a\|an\|ó\|aron\|aba\|aban\|ando\|ar)\|entr(a\|an\|ó\|aron\|aba\|aban\|ando\|ar)\|salió\|salieron\|march(a\|ó\|aron\|aba\|aban\|ando\|ar))$` | the noun camino, entre, entregó, entretenerme |
| swim | `^(nad(ar\|ando\|aba\|aban\|aron\|ó\|amos\|an\|aremos\|arán)\|sumerg(irse\|ió\|ía\|ían\|ieron))$` | nada (27 pages), nado, nadas |
| jump | `^(salt(a\|an\|ó\|aron\|aba\|aban\|ando\|ar)\|brinc[a-záéíóú]*)$` | levant*, salto |
| sleep | `^(durm[a-záéíóú]*\|dorm(ir\|ía\|ían\|ido\|imos)\|ronc[a-záéíóú]*)$` | dormitorio |
| sing | `^cant(a\|an\|ó\|aron\|aba\|aban\|ando\|ar)$` | cantidad |

For multi-word names such as barba plus azul, only the first of consecutive tokens that map to the same actor emits the `nod`.

### 9) vite.config.mjs `manualChunks` (L112)
- Module ids containing `/src/nido/cuentos/film/` go to `nido-film`.
- Film modules may import only `three`, `cuentos-acts.js` and `cuentos-voice-plan.js`. If the build warns about a circular chunk, add those two pure files to the same rule.

**Expected bundle delta:** about +8 KiB.

#### Tests

**New `story-clock.test.mjs`** (injected `now`):
- Audio `currentTime` quantised to 40 ms, sampled on irregular 16-33 ms frames: after 0.5 s, `|sample - true time|` stays under 5 ms.
- Output is monotonic.
- Output freezes within 0.25 s after audio updates stop.
- A 1 s forward seek snaps.
- A backward seek sets `seeked`.
- Device mode never passes `starts[i+1]` before `pushWord(i+1)` arrives.

**New `film-timeline.test.mjs`**, over all 44 books and 867 pages (manifest timings; estimates for the 4 untimed pages):
- Every page compiles, and all times are finite and sorted.
- `titleWordCount` plus the body word count equals `starts.length` on all 863 timed pages.
- Parity with the legacy algorithm: replaying the old `fireCue` rules (per body index, `cues[wordKey]`) produces exactly the same multiset of (actor, act|move|scene|sfx) as the compiled events.
- Each act's `fireAt` equals the word start minus `ACT_LEAD`.
- A seeded cursor fed random 16-250 ms steps emits every event exactly once.
- A backward seek never re-emits an event.

**New `film-dialogue.test.mjs`**, cerditos (0-based page indices):
- p0 `—Ya son grandes —dijo mamá—.` → no speaker (offscreen).
- p1 → `['pipo']` (single).
- p5 → `['lobo']` then `['pipo']` (tag).
- p6 → `['lobo']` (turn), then `['lolo','pipo']` (plural).
- The en-dash sample from clasico-pinocho and the hyphen-minus sample from clasico-rapunzel are detected as lines.

**`classic-direction.test.mjs`** (updated):
- These words must no longer trigger an action: `nada`, `entre`, `camino`, `entregó`, `levantaba`, `dormitorio`, `cantidad`.
- These keep their action: `nadó`→swim, `voló`→fly, `cosió`→build, `abrazó`→hug, `caminó`→walk.
- `Barba Azul` produces one nod.
- The 757-page and fixed-script assertions are unchanged.

**Unchanged and still passing:** `cuentos-sound`, `cuentos-voice`, `device-narrator`, `toys-articulation` (library-wide enter ≥ 28, move ≥ 16).

#### Acceptance

**CI:** all green (`npm run test:game`, build, `check-nido-voice-delivery`, `check:nido`, `quality`). The PR states the measured bundle delta.

**Captures** at 1440×900 and 390×844 of cerditos «¡Soplaré y soplaré!» (page index 5):
- The wolf gestures during «¡Ábreme la puerta, cerdito!».
- Pipo gestures during «¡No, no y no!».
- Nobody nods during the narrated sentence «El lobo sopló y sopló».
- The wolf's blow lean peaks on «sopló» (within ±2 frames when frame-stepping).
- Pipo's run starts on «corrió».

**Other checks:**
- Jump and cheer bursts end on the ground.
- A classic page containing «nada» no longer swims.
- Toggling OS reduced motion mid-session changes stage behaviour without a reload.
- With the CPU throttled 6× in DevTools, the dispatched-event log (`window.__nidoStage.debug()`) matches the timeline, with no cue lost.

#### Risk

**Medium.** The Reader's narration wiring (`readAloud`, `onEnd`, `turnTo`, the device-voice fallback) is fragile.

**Mitigations:**
- The highlight path stays untouched.
- `onSource` handles a studio clip that fails over to the device voice mid-page.
- The timeline is released on every stop.
- The regex changes are pure and covered by tests.
- Remaining risk: speaker attribution heuristics can pick the wrong actor. Only high-confidence lines drive gestures, and WP7 hand overrides fix the showcase books.

### WP2 — Performance foundation: per-pivot bake, shared-safe disposal, zero-upload word highlight, reading-mode hygiene, adaptive quality, context loss
*Base de rendimiento: figuras más livianas, resaltado sin recargas, calidad adaptable y recuperación de la GPU*

**Depends on:** —

**Goal.** Pay for everything that follows:
- median draw calls per character drop from 75 to about 31 (max 95 to about 42);
- zero texture uploads per spoken word;
- no wasted GPU work in reading mode;
- tablets get an appropriate path;
- the stage recovers from GPU context loss;
- an adaptive quality governor.

The only intended visual change is the word highlight, which should look the same.

**Files:** `src/nido/cuentos/three/toys/rig-keys.js`, `src/nido/cuentos/three/toys/bake.js`, `src/nido/cuentos/three/toys/index.js`, `src/nido/cuentos/three/toys/sculpting.js`, `src/nido/cuentos/three/toys/cerdito.js`, `src/nido/cuentos/three/stage.js`, `src/nido/cuentos/three/book3d.js`, `src/nido/cuentos/three/word-highlight.js`, `src/nido/cuentos/film/quality.js`, `vite.config.mjs`, `scripts/measure-nido-cast.mjs`, `tests/nido-game/sculpted-cast.test.mjs`, `tests/nido-game/cast-bake.test.mjs`, `tests/nido-game/quality-governor.test.mjs`, `tests/nido-game/word-highlight.test.mjs`

#### Spec

### 1) Registries
- New `three/toys/rig-keys.js`:
  - `export const RIG_KEYS = ['head','neck','chest','eye','gaze','lid','brow','mouth','jaw','arm','forearm','hand','leg','shin','wing','flutter','tail','ear','hair','cape','skirt','antenna','sway','spray']`;
  - `export const isRigPivot = (o) => RIG_KEYS.some((k) => Boolean(o.userData[k]))`. This is the same truthiness the tests' `tagged()` helper uses.
- `sculpting.js`: `export const RIG_REVISION = 1`, used by `finish()` (L73) and by `cerdito.js` (L216).
- `sculpted-cast.test.mjs` asserts `revision === RIG_REVISION` instead of the literal 1 (L19).

### 2) New `three/toys/bake.js`
`bakeToy(root) -> { drawsBefore, drawsAfter }`

**Setup:** call `root.updateMatrixWorld(true)` first.

**Material dedupe, per toy only.** Never make it a global cache: `nameActor` mutates `emissive` on every non-mapped material (stage.js L487-498).
- Key: `type`, `color`, `roughness`, `metalness`, `clearcoat`, `clearcoatRoughness`, `sheen`, `sheenRoughness`, `sheenColor`, `opacity`, `transparent`, `side`, `flatShading`, `emissive`, `emissiveIntensity`, `normalScale`, and the uuids of `map`, `normalMap`, `bumpMap`, `alphaMap`.
- Never merge a material that has non-empty `userData` or an `onBeforeCompile`.
- Replace duplicates on their meshes and dispose the duplicate materials. Do not dispose their textures.

**Merge candidates.** A mesh qualifies only if all of these hold:
- `isMesh`, not `isInstancedMesh`, no children, `!isRigPivot(mesh)`;
- no `morphTargetInfluences`, no `userData.noBake`;
- `geometry.groups.length <= 1`;
- attributes are `position`, `normal` and optionally `uv`, with or without an index.

**Buckets.** A mesh's owner is its nearest ancestor that `isRigPivot`, or the root. Bucket by owner plus material.

**Merge each bucket of 2 or more meshes:**
1. `M = owner.matrixWorld^-1 * mesh.matrixWorld`.
2. Transform positions by `M`; transform normals by `M`'s normal matrix, then normalise.
3. Fill `uv` with zeros where it is missing, and index non-indexed geometry.
4. If `M.determinant() < 0`, swap the 2nd and 3rd index of every triangle.
5. Concatenate into one indexed `BufferGeometry` (use a Uint32 index above 65535 vertices) and call `computeBoundingSphere()`.
6. Insert the merged mesh into the owner at the child position of the first merged mesh's top-level ancestor under that owner. This keeps the sclera as the first mesh under each `eye`; `scleraLuminance()` depends on it (sculpted-cast.test.mjs L96-102).
7. `castShadow` and `receiveShadow` are true if any original had them. Force `castShadow = false` when the merged bounding radius is under 0.006 toy units (glints, nails, lashes); this also saves shadow-pass draws.
8. Dispose the original geometries and remove non-pivot Groups left empty.

**Where to call it:** once in `buildToy()` (toys/index.js L122) after `module.build()`. This covers builders that end in `fit()` rather than `finish()` (cerdito.js L215, pulgarcito-animals.js L37/L65). Skip `badgeToy`. Accept `buildToy(id, { bake: false })` for tests.

**Expected result** (probe re-run on the real builders with three 0.186): median draws 75 → 31, max 95 → 42 (caperucita, cazador). Triangle counts and silhouettes are identical.

### 3) Disposal (stage.js `releaseToy`, L300)
- Skip any geometry, material or texture flagged `userData.nidoShared` or `userData.nidoSharedSurface`.
- Flag `glowRingGeometry` (L478) and every new shared resource.
- Also dispose non-shared textures on released materials (`map`, `normalMap`, `bumpMap`, `alphaMap`, `emissiveMap`). Track a Set per release so nothing is disposed twice.
- This fixes the leaked Tito plaid CanvasTexture (cerdito.js L32/L58). The dragon bump test (L88-95) must still pass.

### 4) Reading-mode hygiene (stage.js)
- **Heroes:** build the 44 hero toys lazily. Instead of building them at startup (L332-349), build a book's hero the first time the per-frame `nearby` loop (L2243-2249) marks it nearby.
- **Shadows:** set `castShadow = false` on every mesh of hero, shelf (L352+) and desk toys.
- **`toyGroups` loop (L2124):** skip holders where `!holder.visible`. While `mode === 'reading'`, also skip every holder that is not a page actor.
- **Hit areas:** in `addHitArea` (L391), use `new THREE.MeshBasicMaterial({ visible: false })`. The book hit box already does this (book3d.js L124), and the Raycaster ignores `material.visible`. This removes one draw per holder, 54+ on the shelf.
- **Shadow frustum:** in reading mode, tighten the sun shadow camera to ±0.9 around the open book, down from ±4.5 / −2..4 (L161-166). Restore it on leaving and call `updateProjectionMatrix()`. That is about 5× the texel density.

### 5) New `three/word-highlight.js`
`createWordHighlight(storyPageMesh) -> { setWords(boxes, canvasW, canvasH), setIndex(i), dispose() }`. `book3d.js` exposes `storyPage` in its return object (L129).

**Meshes (two draws):**
- Read words: an `InstancedMesh(PlaneGeometry(1,1), readMat, 200)`.
- Active word: one `Mesh`.
- Both are children of the story page, offset 0.0006 toward the viewed face, with `depthWrite: false` and `polygonOffset` −2.

**Matching today's look.** `highlightStoryWord` (textures.js L658-682) paints with a canvas multiply. Match it with:
- `blending: THREE.MultiplyBlending` and `premultipliedAlpha: true`;
- read-word colour: white lerped 55% toward `#e2c480`;
- active-word colour: `#f4c95d`, using a shared 64×32 rounded-rect CanvasTexture that is white outside the rect so the corners stay round.

**Box mapping.** Export it as a pure function for tests:
- `x = ((b.x + b.w/2)/canvasW - .5) * planeW`;
- `y = (.5 - (b.y + b.h/2)/canvasH) * planeH`;
- scale `((b.w + 20)/canvasW * planeW, b.h/canvasH * planeH)`;
- the plane is `BOOK_W*0.94 × BOOK_H*0.95` (book3d.js L77);
- boxes come from `texture.userData.page.words` (textures.js L648).

Check once visually that x is not mirrored; the cover opens rotated by π.

**Behaviour:**
- The active quad eases to the next word over 90 ms (0 ms with reduced motion).
- `stage.setStoryWord` (L2049) drives the overlay. `highlightStoryWord` remains as a fallback when a texture has no boxes.
- This removes a 1024×1448 RGBA upload (about 5.9 MB) on every spoken word.

### 6) New `film/quality.js` (pure tier logic)
`createQualityGovernor({ startTier, now }) -> { frame(ms), tier, onChange(fn) }`

**Stepping:**
- EMA of frame time with α = 0.1.
- Step down after 1.5 s continuously above 22 ms. Step up after 8 s below 14 ms. At most one step per 3 s.

**Tiers:**

| Tier | DPR | Shadow map | Shadow casters |
|---|---|---|---|
| T0 | min(dpr, 2) | 2048 | all |
| T1 | 1.5 | 1024 | all |
| T2 | 1.25 | 1024 | props and scenery stop casting |
| T3 | 1.0 | 512 | page actors only (WP3 contact blobs keep them grounded) |

**Start tier:**
- T0 on desktop.
- T1 when `(max-width: 760px)` or `(pointer: coarse)` matches, or `maxTouchPoints > 0` and the short screen side is under 1100 px. Today, tablets wider than 760 px get the desktop path (stage.js L107).
- Re-evaluate on resize.

**Applying changes:**
- Apply DPR changes only at page transitions or camera cuts (WP5 adds an `onCut` hook), or after 3 s with neither.
- To change shadow-map size: `sun.shadow.map?.dispose(); sun.shadow.map = null; sun.shadow.mapSize.set(n, n)`.
- Never change the number of lights at runtime; that forces shader recompiles.

### 7) GPU context loss
There is no handler anywhere in `src/nido` today.
- `webglcontextlost`: call `preventDefault()` and stop the loop.
- `webglcontextrestored`: call `resize()`, mark CanvasTextures `needsUpdate`, and restart the loop.
- Dev only: `debug().loseContext()` through `WEBGL_lose_context`.

### 8) Measurement
- `debug().perf` returns:
  - `renderer.info.render.calls` and `triangles`;
  - `renderer.info.programs.length`;
  - a histogram of the last 120 frame times;
  - the current tier.
- New `scripts/measure-nido-cast.mjs` prints triangles, draws and materials per id before and after bake. It is for PR descriptions, not for CI.

### 9) Chunks
- `manualChunks` rule `nido-cast` for ids under `/src/nido/cuentos/three/toys/` plus `three/surfaces.js`. Including surfaces.js means the cast chunk imports nothing back from CuentosApp.
- This moves about 78 KiB out of the 340 KiB CuentosApp chunk.
- Every chunk stays ≤ 250 KiB.

#### Tests

**`sculpted-cast.test.mjs`:**
- Revision assertion uses `RIG_REVISION`.
- Draw cap drops from ≤100 to **≤60** (L48).
- Triangle caps, ground contact, eye brightness, sirena, human sclera and dragon bump tests stay unchanged.

**New `cast-bake.test.mjs`**, for every cast id, comparing `bake: false` with the default:
- `Box3` equal within 1e-6;
- equal triangle counts;
- equal tag counts for every `RIG_KEY`;
- merged attributes finite;
- no pivot still has two meshes with identical material keys;
- a sclera is still the first mesh of each eye;
- a `releaseToy`-style disposal of a baked toy never disposes a resource marked `nidoShared` (checked with a spy texture).

**New `quality-governor.test.mjs`:**
- no oscillation under 20 ± 3 ms noise;
- step timings;
- tier bounds T0-T3;
- start-tier rules.

**New `word-highlight.test.mjs`:**
- corner boxes map inside the plane;
- index −1 hides everything;
- `setIndex(n)` shows n read instances plus the active quad.

**Unchanged:** `texture-cache.test.mjs`, `toys-articulation`.

#### Acceptance

**CI:** green.

**The PR must include:**
- the `measure-nido-cast` table showing median and max draws before and after;
- `debug().perf` before and after on cerditos page 6 at 1440×900 and 390×844, with fewer draw calls and no per-word texture upload in the Performance panel;
- side-by-side screenshots of 6 characters (caperucita, princesa, lobo, pipo, gallina, dragon) showing no visual change;
- a highlight that looks the same as today.

**Robustness:** after a simulated context loss the stage recovers.

**Budget:** JS stays within budget (bake about +2 KiB) and the CuentosApp chunk shrinks.

#### Risk

**Medium.**
- **Bake correctness:** winding, mirrored matrices and non-indexed geometry. Mitigated by exhaustive per-id tests and turntable captures.
- **Highlight look:** MultiplyBlending needs `premultipliedAlpha: true`. Mitigated by visual comparison.
- **Lazy heroes:** a small hitch the first time a shelf area comes near. Mitigated by building in `requestIdleCallback`.
- **Chunk split:** it can create a circular chunk. Check the build log.

### WP3 — The set: actors stand on the page, stay across pages, walk to marks in 2D and enter/exit like pop-up figures
*El escenario: personajes que pisan la página, se quedan entre páginas y entran o salen como figuras pop-up*

**Depends on:** WP1

**Goal.** Characters stand upright on the page. They cast real shadows onto the page and the painted card. Characters present on consecutive pages stay on stage and walk to their new marks. Newcomers pop up from the card edge and leavers fold down there. Walking uses 2D paths with exact arrival times and no foot sliding. Auto-directed classics move with a sense of where each actor is. The camera does not change.

**Files:** `src/nido/cuentos/three/book3d.js`, `src/nido/cuentos/three/diorama-layout.js`, `src/nido/cuentos/film/blocking.js`, `src/nido/cuentos/film/locomotion.js`, `src/nido/cuentos/three/diorama-actors.js`, `src/nido/cuentos/three/stage.js`, `src/nido/cuentos/three/toys/index.js`, `src/nido/cuentos/classic-direction.js`, `src/nido/cuentos/CuentosApp.jsx`, `tests/nido-game/stage-blocking.test.mjs`, `tests/nido-game/film-locomotion.test.mjs`, `tests/nido-game/classic-direction.test.mjs`

#### Spec

### 1) Floor frame (book3d.js)
**The tilt fix**
- Export `POPUP_TILT = Math.PI / 2 * 0.86`; L94 uses it.
- Add `stageFloor = new THREE.Group()` as a child of `dioramaRoot` with `rotation.x = Math.PI/2 - POPUP_TILT` (about +0.2199 rad). Its +Y then matches the page normal when the pop-up is unfolded, so actors no longer lean back 12.6° with the card.

**Position**
- Let `h = pageTopOffset + 0.02*cos(POPUP_TILT)`. This is the height of the dioramaRoot origin above the page top. Compute `pageTopOffset` at build time as popupPivot's z minus the top z of the `pages` mesh, both from bounding boxes; do not hard-code it.
- Set `stageFloor.position.set(0, -h*sin(POPUP_TILT), -h*cos(POPUP_TILT))`, so floor y = 0 lies on the page.
- Return `stageFloor` from `createBook3d`.

**Shadows**
- Set `popup.receiveShadow = true` (L91) so actors shade the painted card.
- The `pages` block already receives shadows (L41), so feet get real contact shadows as soon as they touch it.

**Moves under the floor.** Everything that sat in `dioramaRoot` at y = .018 moves under `stageFloor` at y = 0: actors (L602), the work root (L918) and the sparks.

**Fold shear.** The fold (`popupPivot.scale.y → 0.0001`) shears the counter-rotated floor for 0.28 s. This is acceptable: book mode re-blocks at the fold midpoint, and film mode (WP5) uses a dissolve instead.

### 2) Marks (diorama-layout.js)
Keep `dioramaLayout()`; a test requires props at z ≥ .04. Add:
```js
export const MARKS = { C:[0,.07], L1:[-.085,.06], R1:[.085,.06], L2:[-.15,.045], R2:[.15,.045], FRONT:[0,.11], BACK:[0,.035], EDGE_L:[-.19,.06], EDGE_R:[.19,.06] };
export function legacyMoveToMark(where) // left->L2, right->R2, center->C, away-left->{EDGE_L, exit}, away-right->{EDGE_R, exit}
```
- Floor bounds: x ∈ [−.2, .2], z ∈ [.02, .13].
- Off-card wings at x ±.25 would not be hidden. The card's half-width is .24 (`popupW = BOOK_W*0.96`, L85) and the popup material is transparent. So exits fold down at the edge marks.

### 3) Persistent cast
New pure `film/blocking.js`, plus new `three/diorama-actors.js`, which extracts the actor lifecycle from stage.js `updatePageDiorama` (L550-657) and `clearPageDiorama` (L447).

**`reconcileCast(prev, page, layout)`**
- Input `prev`: `[{ id, x, z, facing }]`. Output: `{ keep: [{ id, from, to }], enter: [{ id, side, to }], exit: [{ id, side }] }`.
- Slots come from `dioramaLayout(castCount, propCount)`.
- Keepers take the slot assignment that minimises total travel (brute force over at most 3! permutations).
- Newcomers enter from the edge nearest their slot, or from `page.enter[id]` when it is set.
- An explicit `page.enter` on an actor who was already on stage makes it re-enter from that edge. This keeps the 28 hand-authored entrances meaningful.
- Leavers exit toward the nearest edge.
- The result is deterministic.

**When to reconcile**
- Book mode: `setStoryPage` (L2042) only stores the page. `showPage` (L2010) applies `reconcileCast` inside the fold's `onComplete` (L2027), when `scale.y` is about 0. This fixes the new cast spawning over the old backdrop for 0.28 s.
- `openReading` has no fold, so it applies immediately.
- A non-adjacent jump (dots or selector) rebuilds everything.
- Keepers clear their bursts and travel, then travel to the new mark with `arriveBy = now + 0.9 s`.

**Pop-up entrance.** This replaces the 0.001→1 scale pop (L635-638).
- The holder spawns at the edge mark with `rotation.x = -π/2`: lying flat, head toward the card, face up.
- It rises to 0 over 0.45 s with `ease.outBack`, then walks to its mark.

**Exit**
- The actor walks to the edge mark and folds back to −π/2 over 0.3 s with `ease.in`.
- Then `visible = false` and the holder returns to the pool.

**Reduced motion.** Actors simply appear or disappear at their final mark.

**Pool, prebuild and prefetch**
- Pool: `acquireToy(id)` / `releaseToy`, capped at 8 holders. Pooled holders are hidden and reset. Dispose the pool when the book closes.
- Prebuild the next page's newcomers in `requestIdleCallback`, falling back to `setTimeout(fn, 200)`. Warm their shaders with `renderer.compileAsync(group, camera)`.
- CuentosApp `goToPage` (L333) also calls `pageTexture(book, next + 1)`. Today only two pages are prefetched, once, at open (L320).

**Set dressing**
- Remove the translucent teal platform disc (L579-593).
- Build the 7 sparks once per book instead of once per page.

**Contact shadow per actor**
- One shared `PlaneGeometry(1, 1)` and one shared 64×64 radial-gradient CanvasTexture, both flagged `nidoShared`.
- Material: `MeshBasicMaterial({ color: '#2b1d10', transparent: true, depthWrite: false })`.
- Placed at y = 0.0006 and scaled to 0.9× the toy footprint.
- Opacity is `0.35 * (1 - min(1, rootY/0.1))`.
- It keeps actors grounded even at governor tier T3.

### 4) Travel (new pure `film/locomotion.js`)
This is root motion only; WP4 adds the gait.
```js
export function planTravel(from, to, { t0, arriveBy, gait = 'walk', obstacles = [] }) // -> { points, length, t0, t1, gait }
export function sampleTravel(plan, t) // -> { x, z, heading, speed, s }
```
**Speeds** (floor units/s): walk .10, run .22, fly .18, swim .14, jump .16. Switch to run automatically when `length/(arriveBy - t0) > .14`.

**Profile:** minimum jerk, `s(τ) = 10τ³ − 15τ⁴ + 6τ⁵` over `D = max(length/vmax, arriveBy − t0)`. Arrival is exact and independent of frame rate; peak speed is `1.875·length/D`.

**Avoidance:** if another actor is within 0.06 of the segment, add one waypoint offset ±0.05 in z toward the side with more room, keeping z within [.02, .13]. Smooth the path with a Catmull-Rom curve.

**Facing**
- The holder's yaw follows the travel heading through a critically damped spring (smoothTime 0.18 s). It uses the full angle; today's cap is 0.85 rad (stage.js L878).
- A heading change above 1.6 rad first does a 0.25 s turn in place.
- On arrival the actor faces the addressee or speaker if there is one. Otherwise it turns up to 0.6 rad toward the camera.

**Stage wiring**
- `travelTo(actorId, where | {x, z}, act, holdMs, { arriveBy })` replaces `TRAVEL_X` (L829) and `updateTravel` (L853-882).
- Legacy `move` values go through `legacyMoveToMark`, with `arriveBy = eventTime + max(hold/1000, length/vmax)`.
- `workTravel` (L949) uses the planner.
- Idle strolls use the planner too, ±.035 around the mark, driven by a seeded RNG instead of `Math.random` (L857-864).

**Stride without sliding** (interim; WP4 replaces it with IK)
- `buildToy()` records `userData.rig = { legLen, hipY, headY, headR }`, measured from the tagged pivots after bake, in toy units. This is additive; the revision does not change.
- While an actor travels, the `walk` and `run` cases of `applyAct` use an accumulated `gaitPhase += (distance / strideLen) * 2π` instead of `t*5` or `t*9`.
- `strideLen = 1.2*legLen*holder.scale.x` for walk and `1.9*legLen*holder.scale.x` for run. Cadence now follows speed.

### 5) Blocking memory in classic-direction.js
This replaces the page-parity choices at L255 and L269.
- Track each actor's side (left, center or right) across pages.
- A travel verb moves the subject to the opposite side.
- If the actor is absent from the next page and the verb is in the page's last sentence, emit `away-left` or `away-right` in the direction of travel.
- Emit auto `enter` only for actors absent from the previous page, from the side they last exited.
- The output vocabulary is unchanged, so cuentos-sound.test's move and side sets stay valid.

#### Tests

**New `stage-blocking.test.mjs`:**
- Floor frame: build `createBook3d` for one book with the group at `rotation.x = -π/2` and the pop-up unfolded. Assert the floor's world up · (0,1,0) > 0.9999 and the floor origin lies within 0.0005 of the page-top plane.
- MARKS stay inside the floor bounds and at least 0.06 apart.
- `reconcileCast` over all 823 consecutive page transitions:
  - every id on both pages is kept;
  - explicit `enter` is honoured;
  - results are deterministic;
  - no two final positions are closer than 0.06.

**New `film-locomotion.test.mjs`:**
- arrival error under 1e-6 at t1;
- peak speed ≤ 1.875·length/D + ε, and D ≥ length/vmax;
- clearance of at least 0.05 from obstacles;
- the same position at the same t when simulated at 20, 60 and 144 fps;
- heading within 0.05 rad of velocity once settled.

**`classic-direction.test.mjs`:**
- A fixture where one actor walks twice goes right, then left. Direction no longer follows page parity.
- The 757-page, species and fixed-script assertions still pass.

**Still passing:** `toys-articulation` library counts (enter ≥ 28, move ≥ 16) and `book-motion.test.mjs`. The new pop-up and fold tweens use the `pageMotion` scope.

#### Acceptance

Captures at 1440×900 and 390×844 of cerditos pages 0-6 and caperucita pages 0-4 must show:
- characters standing upright on the page with a visible contact shadow, and their shadow falling on the painted card;
- characters who appear on consecutive pages stay and walk to their new marks;
- newcomers pop up at the card edge;
- exits fold at the edge and never float past it;
- no visible foot sliding at walk or run;
- no character appearing over the old backdrop during a page turn.

**Measurements:** the longest frame at a page turn is lower than before (`debug().perf`). CI is green and the bundle delta is reported.

#### Risk

**Medium-high.** This touches stage.js hot paths, and the floor tilt changes composition.

**Mitigations:**
- Gate the change with screenshots.
- Extract the actor lifecycle into `diorama-actors.js`.
- Keep `dioramaLayout` slots as the default blocking.
- Keep the hand-authored `enter` semantics.
- Check the fold shear visually in book mode.

### WP4 — Acting engine and skeleton v2: elbows, knees, necks, keyed act clips with anticipation/follow-through, planted-foot gaits, springs
*Motor de actuación y esqueleto v2: codos, rodillas, cuello, anticipación y pasos que no patinan*

**Depends on:** WP1, WP2, WP3

**Goal.** Replace the sine-loop `applyAct` with a layered performer so characters move like animated-film characters:
- anticipation, then action, then follow-through;
- crossfades between actions;
- body-part masks, e.g. waving while walking;
- planted feet with knees and elbows (2-bone IK), and per-family gaits;
- secondary springs;
- volume-preserving squash.

It can ship as two PRs: 4a skeleton, 4b engine.

**Files:** `src/nido/cuentos/three/toys/sculpted-human.js`, `src/nido/cuentos/three/toys/sculpted-animals.js`, `src/nido/cuentos/three/toys/sculpted-fantasy.js`, `src/nido/cuentos/three/toys/sculpted-dragon.js`, `src/nido/cuentos/three/toys/sculpted-story-people.js`, `src/nido/cuentos/three/toys/classic-toys.js`, `src/nido/cuentos/three/toys/cerdito.js`, `src/nido/cuentos/three/toys/sculpting.js`, `src/nido/cuentos/film/rig.js`, `src/nido/cuentos/film/pose.js`, `src/nido/cuentos/film/curves.js`, `src/nido/cuentos/film/act-clips.js`, `src/nido/cuentos/film/ik.js`, `src/nido/cuentos/film/gaits.js`, `src/nido/cuentos/film/springs.js`, `src/nido/cuentos/film/rng.js`, `src/nido/cuentos/film/performer.js`, `src/nido/cuentos/film/act-timing.js`, `src/nido/cuentos/three/stage.js`, `tests/nido-game/sculpted-cast.test.mjs`, `tests/nido-game/toys-articulation.test.mjs`, `tests/nido-game/act-clips.test.mjs`, `tests/nido-game/gaits.test.mjs`

#### Spec

## 4a) Skeleton v2 (builders)
Add new keys only. The `leg`, `arm`, `wing`, `eye` and `head` counts do not change, so the anatomy tests keep passing.

### Humans (sculpted-human.js)
- **`forearm`:** split the arm tube (L227-231) at the elbow point `[s*.01, -.036, -.004]`.
  - The upper tube runs from 0 to the elbow.
  - `part(arm, 'forearm', s, elbow)` holds the lower tube, the cuff (L232) and the hand, all re-expressed relative to the elbow.
  - Add an elbow cap sphere of the same material (r .0125), which the bake merges.
- **`shin`:** split the leg tube (L148-153) at y −.052 into a thigh plus `part(leg, 'shin', s, [0, -.052, .003])`. The shin holds the lower tube, the boots or shoes and a knee cap.
- **`chest`:** `part(root, 'chest', 1, [0, .14, 0])` holds the arms, neck and head, and the upper half of the torso.
  - Split each torso `garment()` call at the ring nearest y = .14 into two calls that share that ring. Skirts and lower garments stay on the root.
  - Limit chest rotation to ±.12 rad so the seam never opens.
- **`neck`:** the neck tube (L222) becomes `part(chest, 'neck', 1, [0, .222, 0])`. Re-parent `head` (L236) under it, re-expressing its position.
- **Hands:** replace the 11-mesh `hand()` (L30-48) with a palm, a thumb and one mitten ellipsoid, and no nails. This saves about 2 draws per human after the bake and drops detail that is 1-2 px on screen.
- **Decorations:** objects that `decorate()` hooks add to the root above the waist (classic-toys.js `person()`; sculpted-story-people.js, e.g. Caperucita's cape Lathe at L21-23) move into `chest` via `chest.attach(obj)` after build.

### Quadrupeds (sculpted-animals.js)
- A `neck` pivot holds the head (L25) and a neck tube.
- The leg tubes (L49) split at the middle control point into a `shin` with `userData.bend = front ? +1 : -1`, so hocks bend backwards.
- The bear keeps both `leg` and `arm` on its front legs (L46); toys-articulation requires `oso: 'arm'`.

### Other species
- Dragon: tag the untagged neck `part(root, null, null, ...)` (sculpted-dragon.js L53) as `neck`.
- Pigs (cerdito.js): add `shin`.
- Insects: add `antenna` pivots.

### Revision
Set `RIG_REVISION = 2`.

## 4b) Engine (`src/nido/cuentos/film/`)

### rig.js
`bindRig(holder) -> Rig`, built in one traversal. It returns:
- `joints`: rest position, quaternion and scale per RIG_KEY;
- `legs: [{ hip, shin?, side, front, thigh, shinLen, H, bend }]`;
- `arms: [{ shoulder, forearm?, side }]`;
- `eyes`, `head`, `neck?`, `chest?`, `jaw?`, `mouth?`, `brows`, `secondary`.

A limb tagged both `leg` and `arm` gets the role `leg` for locomotion. It is used as an arm only while standing. This fixes the 80% stride cancellation in stage.js L1137-1141.

`bindRig` replaces `findPart`/`findParts` (L1091-1115), the `movingParts` snapshot (L2137-2153) and `eyeParts` (L532) for page actors.

### pose.js
- `CH` channel enum and `createPose() -> Float32Array`. Channels:
  - root y, pitch, roll; squash;
  - chest pitch, yaw, roll; neck pitch;
  - head pitch, yaw, roll, fwd;
  - arm z and x plus forearm, per side;
  - hip x plus shin, per leg;
  - wing, flutter, tail x/y, ears L/R;
  - face channels reserved for WP6.
- `applyPose(rig, pose)` writes `rest + offset` absolutely, once per frame. No layer can erase another; today `applyAct` zeroes `rotation.x` at L1143.

### curves.js
Monotone cubic (Fritsch-Carlson) keyed tracks, `sample(track, t)`.

### act-clips.js
**Shape:** `ACT_CLIPS[act] = { dur, hit, loop: [a, b] | null, out, mask: 'full'|'upper'|'lower'|'face', channels: { [CH]: [[t, v], ...] }, expression }`. There is one clip for each of the 22 acts in cuentos-acts.js; act names do not change.

**Order of work:** port today's amplitudes first for parity, then add the following. Times are in seconds.

| Act | Keyframes |
|---|---|
| jump | crouch 0-.18 (squash .88, root −.006); launch stretch 1.10 at .24; apex = `hit` at .42; land squash .90 at .66; settle with overshoot 1.02 at .86 |
| blow | inhale 0-.35 (chest pitch +.12); `hit` .35 lean −.25; loop; release |
| cheer | .10 s dip, then hop; `hit` .15 |
| wave | upper mask; .2 s raise, then a 10 rad/s ±.3 loop |
| nod | `hit` .08 |
| hug | arms open by .2; close at `hit` .3 |

Delete `act-timing.js`; the WP1 lead now equals `clip.hit`.

**Burst lifecycle**
- A burst starts at `fireAt = t_word − hit` on the story clock.
- Blend in with a .18 s smoothstep, unless the clip starts from rest.
- At `until`, finish the current loop cycle (at most .45 s), then play `out` or blend out over .25 s.
- Every act switch crossfades over .2-.3 s.

### ik.js
`solveLeg2(a, b, f, y, H, bend)`:
- `D = clamp(hypot(f, H - y), |a - b| + ε, a + b - ε)`;
- knee `κ = π − acos((a² + b² − D²)/(2ab))`;
- hip `θ = atan2(f, H − y) + bend·acos((a² + D² − b²)/(2aD))`.

Fallback for single-joint legs: `θ = asin(clamp(f/L))`.

### gaits.js
**Phase and stride**
- Phase advances with distance: `φ += |Δs|/S`, where `S = L·(1.2 + 0.7·min(1, v/.2))`.
- Stance is φ < β, with β = .60 for walk, .38 for run and .75 for quadruped walk. During stance the foot x is `S·(.5 − φ/β)`, so it stays planted.
- Swing: the foot moves forward on a smoothstep with lift `h·sin(πu)`, where h = .18L for walk and .30L for run.

**Body**
- Pelvis bob `h(cosθ − 1)` twice per cycle, and roll ±.03.
- Chest counter-yaw.
- Arms swing opposite the legs, and the forearm lags on a spring.

**Families**
- Biped.
- Quadruped: lateral walk (LH 0, LF .25, RH .5, RF .75), switching to trot (diagonal pairs) above .12.
- Insects: alternating tripods.
- Walking birds (gallina, gallo, patito, paloma, cisne, pelicano): the head stays world-locked during stance and thrusts forward in swing, using the head `fwd` channel.
- Hop gait (liebre, rana, pajarito-size birds): both feet planted and a parabolic root.
- Fly and swim: wing or tail phase advances with distance; bank roll is proportional to curvature × speed, at most .35 rad.

### springs.js
- Semi-implicit damped angular springs on `ear`, `tail`, `hair`, `cape`, `skirt`, `antenna` and `sway` joints.
- Driven by root acceleration (in the actor frame) and head angular velocity.
- Fixed step 1/120 s, at most 4 substeps; clamp ±.5 rad.

| Group | ω | ζ |
|---|---|---|
| Floppy ears: burro, liebre, perro, oveja | 7 | .35 |
| Stiff ears: gato, zorro, lobo | 13 | .6 |
| Tails | 8 | .4 |

### Squash
Volume-preserving on the fitted toy: `toy.scale.set(1/√s, s, 1/√s)`. The feet stay at y = 0.

### rng.js
Seeded `mulberry32(hash(bookId:page:actorId))`. It replaces `Math.random` in strolls, in `sceneEvent` (L1072-1081) and in blink phases.

### performer.js
`createPerformer(holder, { rig, species, seed, reduceMotion })` returns `{ setBase(act), play(act, { start, until }), setTravel(plan), setSpeaking(on), talk(), lookAt(target|null), update(dt, storyT, stageT), reset() }`.

**Layer order:**
1. idle (chest breathing .012);
2. locomotion;
3. base act;
4. burst act (masked crossfade);
5. additive gestures (talk nod and hop, name reaction, hover hop and wiggle);
6. look-at, distributed .6 eyes / .3 head / .1 chest with a 150 ms lag;
7. springs;
8. squash.

No allocations per frame.

### stage.js
- Page actors get performers. Delete `applyAct` (L1117-1330) and the speaker/listener block (L2185-2220). Keep the old path until 4b's captures are approved, then remove it in the same PR.
- Page actors carry `userData.performer`. The shelf idle in the `toyGroups` loop (L2126-2131) skips them, but they stay in `toyGroups` for picking.
- Shelf, hero and desk toys keep the cheap idle path.

### Reduced motion
No idle, no locomotion animation, no springs and no squash. Acts show their key pose at `hit` without interpolation. This is pending an owner decision; today there is no acting at all under reduced motion.

#### Tests

**`sculpted-cast.test.mjs`:**
- revision equals `RIG_REVISION` (2);
- humans: forearm count = arm count;
- humans, quadrupeds and pigs: shin count = leg count;
- the pivot-finiteness loop also covers `forearm`, `shin`, `neck` and `chest`;
- draws ≤ 60, triangle caps unchanged, ground contact `|min.y| < .002`.

**`toys-articulation.test.mjs`:** fit envelope and required parts unchanged.

**New `act-clips.test.mjs`:**
- every entry in `ACT_NAMES` has a clip;
- every sample is finite;
- loop seams are C1 (value Δ < 1e-4, slope Δ < 1e-2);
- `hit ≤ .42`;
- over 1000 seeded random act switches at 60 fps, no channel moves more than .08 rad in one frame;
- `bindRig` binds every cast id;
- `reset()` restores the rest pose within 1e-9.

**New `gaits.test.mjs`:**
- foot slip during stance ≤ 0.0005 floor units for a biped, quadruped, insect and bird at speeds .05, .10 and .20 (foot world x checked every substep);
- trajectories at 20, 60 and 144 fps agree within 1e-4;
- IK reaches every reachable target within 1e-5;
- the bear's front legs swing with full amplitude while travelling.

#### Acceptance

Turntable and walk captures of caperucita, lobo, pipo, gallina, hormiga, oso and dragon must show:
- no visible foot sliding;
- knees bending during swing;
- the jump crouching before take-off and squashing on landing;
- no burst ever snapping;
- a wave layered over walking;
- ears and tails lagging, then settling.

**Measurements:**
- `performer.update` ≤ 0.1 ms per actor (`debug().perf`, mid laptop);
- draws ≤ 60;
- measured bundle delta, expected about +20 KiB less about 6 KiB of removed code.

#### Risk

**High.** This is the largest rewrite of the hot loop, and joint splits can open seams.

**Mitigations:**
- Split into 4a/4b.
- Port clips for parity before improving them.
- Performers only drive page actors.
- Cap chest rotation.
- Add cap spheres at the elbows and knees.
- Gate on screenshots.
- Work, toy feedback and orbit drag share the loop, so the manual QA checklist covers them.

### WP5 — Película: automatic shot grammar, camera rig, dissolves, «Ver película» with true pause (behind nido-film)
*Modo película: planos automáticos, cámara cinematográfica, fundidos y «Ver película» con pausa real*

**Depends on:** WP1, WP2, WP3

**Goal.** Each story plays like a film:
- a deterministic shot planner (book, stage, full, medium, close, two, insert) timed to the narration;
- a critically damped camera rig;
- dissolves between pages;
- continuous autoplay with true pause.

Every page opens and closes on the whole book. Everything ships behind the `nido-film` flag until the owner approves captures. The Bokeh composer is removed in all modes.

**Files:** `src/nido/cuentos/film/flags.js`, `src/nido/cuentos/film/director.js`, `src/nido/cuentos/film/camera-rig.js`, `src/nido/cuentos/three/cinema-framing.js`, `src/nido/cuentos/three/book3d.js`, `src/nido/cuentos/three/stage.js`, `src/nido/cuentos/CuentosApp.jsx`, `src/nido/cuentos/cuentos.css`, `scripts/quality-check.mjs`, `tests/nido-game/film-director.test.mjs`, `tests/nido-game/camera-rig.test.mjs`, `tests/nido-game/cinema-framing.test.mjs`, `tests/nido-game/book-motion.test.mjs`

#### Spec

### 1) Flag (new `film/flags.js`)
- `isFilmEnabled()`: `?film=1` and `?film=0` persist to localStorage `nido-film`, with try/catch. The default is off.
- A later one-line PR flips the default after the owner signs off.

### 2) Director (new pure `film/director.js`)
Deterministic, seeded by `hash(bookId:pageIndex)`.

`planShots(timeline, staging, { bookId, pageIndex, aspect, reduceMotion, source })` returns `[{ t0, t1, size, subject, subjects, yaw, elev, move, transition, lens }]`.

**Sizes:** `book` (today's whole-book fit), `stage` (card plus actors), `full`, `medium`, `close`, `two`, `insert` (work or scene). `ots` appears only in hand scripts (WP7), used sparingly for ages 2-6.

**Rules, in priority order:**
1. Shot 0 is `book` on a book's first page, otherwise `stage`. It lasts at least 2.4 s, with a slow push from ×1.06 to 1.0 while the title is read.
2. No cut in the first 0.6 s. Cuts happen only inside pauses (word-start gaps ≥ 0.35 s) or at sentence ends, snapped to 0.12 s before the next word onset.
3. A confident dialogue line of 1.6 s or more gets a `medium` on the speaker, cut 0.12 s before the line. In a two-actor exchange the reply alternates between `two` and `medium`.
4. Travel, enter, exit or scene events get `stage` with `follow`.
5. A mood event gets a `close` on its subject at t − 0.2, lasting at least 1.6 s.
6. Narration that names one subject gets `full`. Two subjects in one sentence get `two`. No subject gets `stage` with a slow ±.12 rad arc.
7. Shots shorter than 2.0 s merge (close-ups may be 1.6 s). A repeat of the same subject and size becomes a push. Consecutive shots of one subject must change size or yaw by at least 0.5 rad.
8. At most 4 cuts per page. When there are more candidates, keep them by priority: dialogue, mood, travel, narration.
9. The last 1.2 s of narration and the transition are always `book`. This is the owner rule from PR #22/#23.
10. Shots longer than 6 s get an internal push or arc.
11. With `source === 'device'`, the minimum shot length is 3 s.
12. Reduced motion gets one static `book` shot per page.

### 3) Camera rig
New `film/camera-rig.js`. `three/cinema-framing.js` gains `boxPoints(box3, matrix)` and `fitShot(points, focus, dir, fov, aspect, safeX, safeY)`; the latter wraps `cinemaFitDistance`, which itself does not change.

**Direction.** Start from the reading view vector, as `updateCinemaCamera` does today (L787-791). Apply the shot's yaw (|yaw| ≤ .9) and elevation (6°-50° above the page plane).

**Aim**
- close and medium: the head pivot's world position;
- full: the holder at mid height;
- book, stage and two: the fit centre.
- Shift the aim ±1/6 of frame width toward the addressee or the direction of travel.

**Distance by size**

| Size | How it is solved |
|---|---|
| book | `cinemaFitDistance(cine.bookPoints)`, as today |
| stage | fit of the popup corners plus actor boxes |
| two | union of the two actor boxes, safe frame .75/.70 |
| full | feet to head top +15% fills 70% of frame height: `D = h / (0.7 · 2·tan(fov/2))` |
| medium | hip to head top fills 60% |
| close | head sphere ×2.2 fills 50% |

**Lenses:** 36° for book, stage, full and two (today's fov, L125); 32° for medium; 28° for close. Fov changes only on cuts.

**Motion**
- Critically damped `smoothDamp` (Unity formulation) on position, aim and fov.
- smoothTime: 0.9 s for eased transitions, 0.6 s for follow. Internal moves are capped at 0.2 rad/s.
- A cut writes the target, zeroes velocities and emits `onCut`. Consumers: WP6's blink, and the governor's pending DPR change.

**Constraints**
- At least 0.12 world units in front of the card plane.
- Above the page plane.
- At least 0.2 world units from the aim (near plane .05).
- Occlusion: cast a ray from camera to aim against the other actors' bounding spheres. On a hit, nudge yaw ±0.25 toward the clear side.

**Fixes that come with it**
- Decide portrait from `camera.aspect`, not window aspect (L757). The phone cinema canvas is about 1:1 (cuentos.css L1806), so film mode uses the fit instead of the fixed `CAM_PORTRAIT` distance (L769, L795-797).
- The push-in happens per shot. Today it happens once per session, because `cine.started` is set only in `setCinema` (L727).
- Film mode drops the backdrop UV drift (L812-816).
- `cineKey` targets the current subject; the light count does not change.
- The user orbit override (`cine.userUntil`, 5 s) is kept.

### 4) Post-processing
**Remove** EffectComposer, RenderPass, BokehPass and OutputPass (imports L5-8, `ensureComposer` L144-153, render branch L2264-2271) in every mode. Reasons:
- the blur is almost invisible (`maxblur .002`);
- it re-renders the whole scene for depth;
- its default render target has no MSAA samples, so film mode loses antialiasing;
- it costs about 17 KiB of vendor-three.

**Replace it with a free backdrop defocus** in book3d.js. The popup material's `onBeforeCompile` replaces `#include <map_fragment>` with:
```glsl
vec4 cur = texture2D(map, vMapUv, uBias);
vec4 prev = texture2D(mapPrev, vMapUv, uBias);
diffuseColor *= mix(prev, cur, uMix);
```
- `customProgramCacheKey = 'nido-popup-v1'`.
- The backdrop CanvasTexture keeps its mipmaps.
- `uBias` is smoothDamped over 0.4 s toward: 0 for book and stage, 1.0 for full and two, 1.6 for medium, 2.4 for close.

### 5) Transitions
`stage.transitionTo(texture, page, { kind: 'dissolve' | 'quick' })`:
- set `mapPrev` to the old map and `map` to the new one;
- tween `uMix` from 0 to 1 over 0.7 s, or 0.35 s for `quick` (manual turns), through the `pageMotion` tween scope so rapid turns cancel cleanly;
- the cast reconciles at the dissolve start, using WP3's keepers, newcomers and leavers;
- the camera eases from the `book` tail into the next page's shot 0.

Book mode keeps the leaf turn and the fold.

### 6) Reader (CuentosApp.jsx)
All of the following applies when `isFilmEnabled() && cinema`.

**Button:** «▶ Léemelo» (L1109) reads «🎬 Ver película».

**Autoplay advance.** This replaces the fixed 900 ms timer (L979) and totals about 1.8 s, against a 1.3 s preschool minimum:
1. hold 0.6 s after narration ends (`sfxEnd` plays);
2. wait for `isWorking()`, up to 10 s as today;
3. dissolve for 0.7 s;
4. start the next narration 0.5 s into the dissolve.

**True pause**
- «⏸ Pausa» calls the existing `pauseSpeech()` (L1011) and `stage.setPaused(true)`. The camera holds, narrative layers freeze and idle breathing continues. The story clock freezes on its own because no new audio time arrives.
- «▶ Seguir» calls `resumeSpeech()` (L1021).
- Outside film mode, Pausa keeps today's stop behaviour.

**Manual controls.** Arrows, swipes and page dots always work. `turnTo` stops speech, the page effect (L1003) restarts narration, and the stage uses `quick`.

**Captions**
- Optional, off by default: #23 removed subtitles.
- Shown only when the shot is tighter than `stage`, reusing `.cuentos-captions` (cuentos.css L1722).

**Stage API:** `stage.setFilmMode(on)`. When the flag is off, `setCinema` keeps today's path.

#### Tests

**New `film-director.test.mjs`**, over all 867 pages (manifest timings; estimates for the 4 untimed pages):
- shots are contiguous and cover [0, duration + 1.2];
- the first shot is `book` or `stage` and lasts ≥ 2.4 s;
- the last 1.2 s are `book`;
- minimum durations: 2.0 s, close-ups 1.6 s, device voice 3 s;
- at most 4 cuts per page, each inside a pause or at a sentence end;
- output is deterministic;
- reduced motion gives exactly one static `book` shot.

**New `camera-rig.test.mjs`**, with a synthetic book and 1-3 actor boxes:
- at aspects .5, .56, .75, 1, 1.33, 1.78 and 2.4, for every size, the subject's head projects within |x| ≤ .9 and |y| ≤ .76 (for book, all book points do);
- the camera never goes behind the card plane or below the page;
- smoothDamp never overshoots;
- a cut zeroes velocity.

**`cinema-framing.test.mjs`:** existing assertions stay; add aspects .5 and .75 for `fitShot`.

**`book-motion.test.mjs`:** rapid `transitionTo` calls leave only the last dissolve running.

**Pure tests:** the `uBias` mapping and the flag parsing.

#### Acceptance

**Owner-approved captures** in film mode, at 1440×900, 390×844 and on one tablet, of cerditos, caperucita and one classic:
- every page starts and ends on the whole book;
- no cut lands inside a word;
- dialogue lines show the speaker;
- desktop film mode is antialiased.

**Performance:** at least 30 fps on a phone (`debug().perf`).

**CI and bundle:** CI green; the bundle delta is reported (about −17 KiB from postprocessing, about +8 KiB for the director and rig).

**Flag off:** today's experience, apart from the removed Bokeh.

#### Risk

**Medium.**
- **Owner direction:** tighter shots conflict with the whole-book request from #22/#23. Mitigated by the flag, the `book` open and tail on every page, captures, and a cap of 4 cuts per page.
- **Bokeh removal:** slightly changes the default cinema look. The blur is imperceptible today.
- **Mobile fill rate in close-ups:** mitigated by the governor.
- **Camera near the card:** covered by the constraint tests.

### WP6 — Acting faces: skin-coloured lids, gaze, brows, mouths with morph lips, expressions and dialogue lip-sync
*Caras que actúan: párpados del color de la piel, mirada, cejas, boca y habla sincronizada*

**Depends on:** WP1, WP2, WP4

**Goal.** Give every character an expressive face:
- real eyelids in the character's own skin, fur or feathers (fixes the peach lid on all 81 characters);
- eyes that look at whoever is speaking, with saccades;
- brows;
- mouths or jaws that speak in sync with the studio voice, but only during that character's own dialogue lines.

This needs no new assets and no ElevenLabs credits.

**Files:** `src/nido/cuentos/three/toys/face.js`, `src/nido/cuentos/three/toys/sculpting.js`, `src/nido/cuentos/three/toys/sculpted-human.js`, `src/nido/cuentos/three/toys/sculpted-animals.js`, `src/nido/cuentos/three/toys/sculpted-fantasy.js`, `src/nido/cuentos/three/toys/sculpted-dragon.js`, `src/nido/cuentos/three/toys/cerdito.js`, `src/nido/cuentos/three/toys/pulgarcito-animals.js`, `src/nido/cuentos/film/face-controller.js`, `src/nido/cuentos/film/expressions.js`, `src/nido/cuentos/film/lipsync.js`, `src/nido/cuentos/film/performer.js`, `src/nido/cuentos/film/pose.js`, `src/nido/cuentos/narration-envelope.js`, `src/nido/cuentos/cuentos-audio.js`, `src/nido/cuentos/three/stage.js`, `tests/nido-game/sculpted-cast.test.mjs`, `tests/nido-game/toys-articulation.test.mjs`, `tests/nido-game/lipsync.test.mjs`, `tests/nido-game/face-controller.test.mjs`

#### Spec

### 1) Face rig v2 (new `three/toys/face.js`)
`eyePair()` (sculpting.js L39) and `softSmile()` (L57) delegate to face.js. Their signatures stay the same, plus an optional `{ skin }`. All 14 `eyePair` call sites upgrade at once: humans, animals, fantasy, dragon, pigs and pulgarcito-animals.

**Eye.** Still exactly 2 `eye` groups, and the sclera stays the first child.
- sclera;
- a `gaze` pivot holding the iris and pupil, rotating up to ±.25 on x and ±.35 on y;
- the glints stay on the eye itself, as fixed highlights;
- a `lid` pivot.

**Lid**
- Geometry: `SphereGeometry(1, 14, 7, 0, 2π, 0, 0.55π)`, scaled like the sclera ×1.08.
- It rotates about x from `LID_OPEN` to `LID_CLOSED`. Tune these, starting around −0.35 and +1.25, so the closed cap covers the front of the eye.
- Material: the `skin` option or, by default, the material of the first mesh under `head` (skull, skin, fur or feathers).
- It replaces the static lid ellipsoid (L51) and its hard-coded `mat('#f0d0ba')` (L45), so it costs no extra draw.

**Brows.** `brow` pivots per side (±1), animated by `position.y` (raise) and `rotation.z` (tilt).
- Humans: wrap the existing static hair-coloured brow tubes (sculpted-human.js L257).
- Quadrupeds: wrap the skin brow ellipsoids (sculpted-animals.js L32).
- Pigs: wrap the tori (cerdito.js L124).
- Birds: two small feather tufts.

**Mouth.** A `mouth` group with a `jaw` pivot.
- **Humans:** at the softSmile position `[0, .017-.018, .032]`:
  - a dark inner-mouth ellipsoid (`#6b2f2a`) whose `scale.y` is driven by `open`;
  - an upper lip built by a new `tubeMorph(parent, material, basePoints, { smile, round, wide }, radii, opts)` in sculpting.js. It builds `tube()` topology for each point set and stores the differences in `geometry.morphAttributes.position` and `normal`; three r0.186 supports morph targets on Standard and Physical materials.
  - a lower lip under `jaw`, rotating 0-.25 on x.
- **Quadrupeds, fantasy, dragon:** the muzzle ellipsoid (sculpted-animals.js L28) becomes the upper jaw. Add a `jaw` pivot at the back of the muzzle with a lower-jaw ellipsoid of the same material and a dark interior. It opens up to .35 rad.
- **Birds:** split the beak into upper and lower mandibles, with the lower under `jaw`.
- **Pigs:** wrap the existing mouth and tongue blobs (cerdito.js L115-118) into `mouth`/`jaw`.
- **Fish, whale, frog, turtle:** a line mouth using `tubeMorph`.
- **Insects:** exempt.

**Bake interaction.** WP2's bake never merges across these pivots and never merges meshes that have morph targets. Lids, brows and mouth parts get `castShadow = false`.

**Budget.** +6 to 8 draws per actor, for a new max of about 50-58. The cap stays ≤ 60. If an actor exceeds it, drop sub-pixel details such as lashes before touching the cap.

**Revision.** Set `RIG_REVISION = 3`. Eye size and proportions do not change in this WP; the owner decides them in WP7.

### 2) Runtime face
New `film/face-controller.js` and `film/expressions.js`. Pose channels: lidL, lidR, lidLow, gazeX, gazeY, browY, browTilt, open, wide, round, smile, jaw.

**Blink**
- Close in 70 ms, hold 40 ms, open in 110 ms.
- Interval 2.5-6 s from a seeded RNG, with a 15% chance of a double blink.
- Forced on camera cuts (WP5 `onCut`, if merged) and on head turns over 0.5 rad.
- `sleep` keeps the lids .9 closed.
- This replaces the whole-eye `scale.y` squash in `applyBlink` (stage.js L532-548). Keep that squash only for toys without lids.

**Gaze**
- Listeners look at the speaker's head.
- The speaker looks at the addressee, or at the camera 30% of the time in `close` shots.
- Idle actors micro-saccade every 0.5-1.5 s, by at most .06 rad.
- Saccades take 40-60 ms. The head follows after 150 ms through a spring, and the body turns last.

**Expressions**
- `MOODS`: neutral, happy, sad, scared, surprised, sleepy, curious, cross. Each is a channel preset, blended with a 0.12 s smoothDamp.
- Kid-safe caps: `cross` brow tilt ≤ .18 rad; `scared` is wide eyes with a small mouth.
- Default mood from the current act:

| Acts | Expression |
|---|---|
| shiver | scared |
| sleep | sleepy |
| cheer, dance, hug | happy |
| think, listen | curious |
| look | surprised at 40% |
| howl, blow, sing | the matching mouth shapes |

- Timeline `mood` events (from WP1) override the default for their span.

### 3) Lip-sync (new pure `film/lipsync.js`)
**`visemeTrack(line, words, text)`** returns a Float32Array at 100 Hz with channels open, wide, round and closed.
- Syllable nuclei are vowel groups. Split a hiatus of two strong vowels (a, e, o) and at accented í or ú.
- Nuclei are placed across each word's `[t0, t1)` in proportion to their letter position.
- Vowel shapes:

| Vowel | open | wide | round |
|---|---|---|---|
| a | .9 | .5 | 0 |
| e | .55 | .8 | 0 |
| i | .3 | .9 | 0 |
| o | .7 | 0 | .8 |
| u | .35 | 0 | 1 |

- An m, b or p onset closes the lips for 55 ms before the nucleus. f and v give open .12.
- Stressed words (3 or more syllables, or with ¡! or ¿?) get +15% open, a head nod and a brow raise.
- Gaps longer than 0.22 s go to rest.

**Sampling:** `sampleMouth(track, storyT + 0.035)`, smoothed by critically damped springs (smoothTime 45 ms).

**Who lip-syncs**
- Only lines with confidence `tag`, `plural`, `single` or `turn` (from WP1).
- Narration is never mouthed; the subject acts with gaze, expression and gesture instead.
- Remove the head-scale talk (stage.js L2197).

**Optional amplitude gate.** Controlled by localStorage `nido-lipsync-env`, off by default until tested on iOS.
- `fetchClip` (cuentos-audio.js L811) keeps the Blob in its LRU next to the object URL. The CSP's `connect-src 'self'` does not allow `fetch(blob:)`.
- Add `clipBlob(src)`.
- `narration-envelope.js` decodes `blob.arrayBuffer()` with the existing AudioContext's `decodeAudioData` in `requestIdleCallback`.
- It computes a 100 Hz RMS `Uint8Array` (about 2.5 KB per page, LRU of 4) and multiplies it into `open`.
- The narrator element is never routed through WebAudio.

### 4) Reduced motion
- Expressions switch without blending.
- Gaze snaps to its target, with no saccades.
- Blinks stay but are slow (90/60/150 ms).
- Lip-sync plays at 50% amplitude, because it carries communication.
- No springs.

#### Tests

**`sculpted-cast.test.mjs`:**
- revision equals `RIG_REVISION` (3);
- exactly 1 head, 2 eyes, 2 `gaze`, 2 upper `lid`;
- `mouth` or `jaw` on every living cast id except insects;
- 2 `brow` for humans, quadrupeds and pigs;
- non-human species: lid colour equals the colour of the head's first mesh (no `#f0d0ba`);
- closed-lid coverage: with the lid at `LID_CLOSED`, rays from +Z through a 7×7 grid over each sclera's front all hit the lid first; when open, no ray inside the iris hits the lid;
- morph attributes are finite and `morphTargetInfluences.length === 3`;
- the pivot-finiteness loop also covers lid, gaze, brow, jaw and mouth;
- draws ≤ 60, triangle caps, sclera still first.

**`toys-articulation.test.mjs`:** `jaw` or `mouth` is required.

**New `lipsync.test.mjs`:**
- syllabification of soplaré, cerdito, huyó, pueblo and oído;
- every viseme peak falls inside its word window;
- lips closed on m, b and p onsets and in gaps longer than 0.22 s;
- the number of peaks matches the syllable count ±1;
- output is deterministic;
- values stay within [0, 1] on all 389 pages that contain dialogue markers.

**New `face-controller.test.mjs`:**
- blink timings;
- a forced blink on a cut;
- expression caps;
- reduced-motion behaviour.

#### Acceptance

Film-mode close and medium captures of caperucita, lobo, pipo, gallina, dragon, maquinista and a bird must show:
- lids that match skin, fur or feathers;
- blinks that read as blinks;
- listeners looking at the speaker;
- mouths moving only during their own dialogue, in sync with the voice;
- no uncanny or scary expressions (the owner reviews `scared` and `cross`).

**Measurements:** draws ≤ 60; no new shader compile hitch on a page turn (compileAsync prewarm); bundle delta reported.

#### Risk

**Medium-high.**
- Node tests cannot judge appeal. Mitigated by owner screenshot review.
- Morph targets add shader variants. Mitigated by prewarming with compileAsync on the prebuilt cast.
- A wrong speaker could lip-sync someone else's line. Mitigated by confidence gating and WP7 overrides.
- iOS decode memory for the envelope. It stays behind a flag, with text-only visemes as the default.

Soft dependency: WP5's `onCut` enables forced blinks on cuts.

### WP7 — Directed films and final look: hand direction for the 11 original books, film shading, owner-approved appeal pass, cleanup and flag flip
*Películas dirigidas y acabado final: guiones a mano para los 11 cuentos propios, luz de cine y pulido de personajes*

**Depends on:** WP5, WP6

**Goal.** Deliver showcase quality on the 11 hand-directed books, starting with cerditos: authored blocking, beats, dialogue attribution and key shots layered on top of the automatic direction. Then lock in the final look (rim and wrap shading, tone mapping, character appeal) with owner approval, remove dead code, and turn film mode on by default. This can ship as three PRs: 7a direction, 7b look and appeal, 7c cleanup and flag flip.

**Files:** `src/nido/cuentos/direction/index.js`, `src/nido/cuentos/direction/cerditos.js`, `src/nido/cuentos/direction/caperucita.js`, `src/nido/cuentos/direction/pulgarcito.js`, `src/nido/cuentos/direction/kusi.js`, `src/nido/cuentos/direction/amaru.js`, `src/nido/cuentos/direction/sami.js`, `src/nido/cuentos/direction/killa.js`, `src/nido/cuentos/direction/chaska.js`, `src/nido/cuentos/direction/tico.js`, `src/nido/cuentos/direction/ana.js`, `src/nido/cuentos/direction/wayra.js`, `src/nido/cuentos/film/timeline.js`, `src/nido/cuentos/film/director.js`, `src/nido/cuentos/film/flags.js`, `src/nido/cuentos/CuentosApp.jsx`, `src/nido/cuentos/three/toys/_shared.js`, `src/nido/cuentos/three/toys/face.js`, `src/nido/cuentos/three/toys/cerdito.js`, `src/nido/cuentos/three/toys/classic-toys.js`, `src/nido/cuentos/three/toys/sculpted-human.js`, `src/nido/cuentos/three/toys/sculpted-animals.js`, `src/nido/cuentos/three/toys/sculpted-fantasy.js`, `src/nido/cuentos/three/backdrop.js`, `src/nido/cuentos/three/stage.js`, `vite.config.mjs`, `scripts/quality-check.mjs`, `docs/NIDO_INTERACCIONES_3D.md`, `docs/nido-sculpted-cast-2026-09-16.md`, `tests/nido-game/film-scripts.test.mjs`, `tests/nido-game/sculpted-cast.test.mjs`

#### Spec

## 7a) Hand direction
This is an optional overlay; automatic direction still covers every page.

**Files:** `src/nido/cuentos/direction/<bookId>.js` for cerditos (first, as the showcase), then caperucita, pulgarcito, kusi, amaru, sami, killa, chaska, tico, ana and wayra. Each exports:
```js
export default {
  book: { lipSync: 'dialogue' | 'all', pace: 'calm' },
  pages: { [pageIndex]: { blocking, lines, beats, shots, moods } },
};
```

**Anchors** are never absolute seconds, so they survive the device voice and any re-recording:
- `{ w: wordKey, n? }`: the nth occurrence of that word in the body;
- `{ i }`: body word index;
- `{ s }`: sentence index;
- `0` or `'end'`;
- optional `ms` offset on any anchor.

**Fields**
- `blocking: { actorId: { mark | x, z, face: actorId | 'camera' | radians } }`.
- `lines: [{ from, to, speakers }]` overrides dialogue attribution.
- `beats: [{ at, until?, actor, act?, move?: mark | [marks], gait?, exit?, enter?, mood?, look? }]`.
- `shots: [{ at, size, on, from?, move, transition }]`. A hand shot overrides the planner from its `at` until the next hand shot. `ots` is allowed here.

**Example** (cerditos page index 5):
```js
{
  lines: [
    { from: { w: 'ábreme' }, to: { w: 'cerdito' }, speakers: ['lobo'] },
    { from: { w: 'no' }, to: { w: 'no', n: 3 }, speakers: ['pipo'] },
  ],
  beats: [
    { at: { w: 'sopló' }, actor: 'lobo', act: 'blow', until: { w: 'voló' } },
    { at: { w: 'corrió' }, actor: 'pipo', act: 'run', move: 'EDGE_R', exit: true },
  ],
  shots: [
    { at: { w: 'ábreme', ms: -120 }, size: 'medium', on: 'lobo' },
    { at: { w: 'sopló', ms: -150 }, size: 'close', on: 'lobo', move: 'push' },
    { at: { w: 'voló' }, size: 'stage' },
  ],
}
```

**Loading and merging**
- `loadDirection(bookId)` does a dynamic `import()` in CuentosApp when a book opens. Until it loads, the timeline compiles without it.
- `compilePageTimeline(..., { direction })` merges beats, lines and moods. `planShots` merges shots.
- Hand shots must still respect the `book` tail on every page.

**Build**
- `manualChunks` names these modules `nido-direction-*`.
- quality-check.mjs excludes them from the 1440 KiB engine total, as it does for the classic texts, and caps their combined size at ≤ 40 KiB.

## 7b) Film look and appeal
Each item is approved by the owner from screenshots.

**Shading**
- `mat()` (_shared.js L9) adds an `onBeforeCompile` chunk for the skin, fur, wool, feathers and cloth surfaces:
  - wrap diffuse (w ≈ .35);
  - a warm terminator tint on skin;
  - a Fresnel rim, `pow(1 − N·V, 3)·.25`.
- `customProgramCacheKey = 'nidoFilmV1:' + surface`, so every toy shares programs. Prewarm them with compileAsync.
- On mobile, `cineKey` and `cineRim` are not created. Decide this once at stage creation; never toggle lights at runtime.

**Tone mapping.** A/B `THREE.NeutralToneMapping` against the current ACES (stage.js L111) via `?tone=neutral`. The owner picks.

**Appeal** (owner decision)
- `EYE_SCALE` in face.js: default 1.0, proposal 1.15.
- Undo the pig head and eye shrink (cerdito.js L209-213).
- Both were reduced on purpose earlier (docs/nido-sculpted-cast-2026-09-16.md L42/L48).

**Distinct silhouettes** for characters that currently share geometry, using the existing decorate hooks:
- Heidi: braids;
- bailarina: bun and tutu;
- Blancanieves: bob and bow;
- Bella: curls;
- bestia: mane; minotauro: horns;
- aladino, alibaba, genio: different turbans.

**Doe spots.** Remove the fawn spots from the mother doe `cierva`: the `kind === 'doe'` branch at sculpted-animals.js L64. Keep them for `deer` (Bambi).

**Optional parallax.** `paintedBackdropTexture(..., { split: true })` (backdrop.js L254) returns the painting and the SVG scenery separately. The scenery becomes a second plane at z ≈ .012, adding one draw call.

## 7c) Cleanup and flag flip
- Delete the 19 legacy toy files in three/toys/ that nothing imports: abuelita, ballena, bufeo, buho, carpintero, caperucita, cazador, lobo, mariposa, oso, oveja, pajarito, pelicano, pez, picaflor, pulgarcito, rana, vicuna and zorro (all `.js`).
- Update docs/NIDO_INTERACCIONES_3D.md:
  - describe the film system and data fields;
  - fix drift: the library has 44 books and 867 pages, the draw cap is 60, and Caperucita's detail lives in the sculpted builder.
- In a separate one-line PR, after the owner approves, flip `isFilmEnabled()` to default on.

#### Tests

**New `film-scripts.test.mjs`:**
- every anchor resolves in `splitWords(page.x)`;
- every actor is in `page.cast` or enters through a beat;
- acts are in `ACT_NAMES`, marks in `MARKS`, moods in `MOODS`;
- hand shots are ordered and each lasts ≥ 1.6 s;
- beats never cross the page end, and lines never overlap;
- each module compiles for all of its pages;
- there are 11 modules;
- the built direction chunks total ≤ 40 KiB (checked by quality-check.mjs).

**`sculpted-cast.test.mjs`:**
- budgets hold with the new silhouettes;
- the geometry groups that should now differ (Heidi, bailarina, Blancanieves, bestia, minotauro) have different triangle counts;
- `cierva` has no spot instances.

**Pure test:** the program cache key is stable per surface.

#### Acceptance

**Owner sign-off** on:
- the cerditos showcase film at 1440×900 and 390×844;
- the tone-mapping choice;
- the eye-size and pig-proportion choice;
- the silhouettes.

**Checks:**
- CI green;
- the direction chunk is excluded from the engine total and capped;
- no orphaned toy file remains.

**Final PR:** after sign-off, film mode is on by default, and the Vercel deploy of main has been verified.

#### Risk

**Low-medium.**
- Taste: appeal changes can regress the "less scary" direction set for ages 3-6. Mitigated by owner-gated constants and screenshots.
- Scope creep in the hand scripts: start with cerditos and review before the rest.
- Shading adds shader variants: prewarm them, and use one cache key per surface.

## Preguntas abiertas para Luis

- Cámara: ¿aceptas planos más cercanos (cuerpo entero, medio y primer plano) durante la narración, si cada página empieza y termina mostrando el libro completo? En los PR #22 y #23 se pidió que el libro se viera entero.
- Cuando apruebes los videos, ¿el «modo película» debe quedar activado por defecto con «Léemelo», o prefieres que siga siendo una opción que se enciende con el botón 🎬?
- Ojos y cerditos: se achicaron a propósito los ojos y la cabeza de los cerditos para que no se vieran «demasiado infantiles». ¿Los agrandamos un 15 % (más tiernos) o los dejamos como están?
- Boca: ¿el personaje mueve la boca solo cuando dice su propio diálogo (recomendado), o también mientras la narradora cuenta la historia?
- Subtítulos en modo película: ¿apagados por defecto, como ahora, o encendidos?
- Movimiento reducido (accesibilidad): hoy los personajes no actúan. ¿Mantenemos eso, o mostramos poses quietas en cada acción, con parpadeo lento y la boca al 50 %?
- Color: ¿eliges entre el look actual y una versión «Neutral» con colores más vivos, mirando capturas de ambas?
- ¿Quién puede probar en un iPhone y un iPad reales antes de activar el modo película para todos? Hoy no hay pruebas en dispositivos Apple.
- Ritmo: en modo película habría unos 1,8 segundos entre una página y la siguiente. ¿Te parece bien para niños de 2 a 6 años?
- Presupuesto de código: si la medición real lo exige, ¿apruebas subir con fecha el límite total de JavaScript (1440 KiB) en unos 20–30 KiB?
