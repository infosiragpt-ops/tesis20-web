# Nido: classic narration and articulated scenes

## Scope (2026-09-15)

- 46 books / 922 pages: 11 existing studio-voice books and 35 full-text classics (812 pages).
- The user explicitly authorized Spanish device narration without generation costs. No paid voice or media generation was invoked; existing recordings and authorized text bodies are unchanged.
- Classics now have story-specific articulated casts, props and word-triggered acting. This is real-time procedural WebGL storybook animation, not a collection of newly rendered AI movies.
- Fixed scenery hidden behind the opaque pop-up plane, mobile cinema framing, overlapping voice/zoom controls and mobile active-word scrolling.
- Native narration starts from the reading gesture, handles asynchronous Spanish voice availability, chunks long passages, follows native boundaries and advances only after successful completion. Missing voices/errors remain visible. Cancellation invalidates stale callbacks and prevents unwanted page changes.
- “Pausa” stops reading; the next “Léemelo” restarts the current page. Browsers without word boundaries use approximate highlighting. Voice quality/availability depends on installed voices.

## Verification before release

- `npm run check`: 157 passing tests; production build, 5,404 quality checks and 627,726 curriculum checks passed.
- Structural coverage verifies all 812 classic pages have supported actors/actions, complete original text hashes, and stage props. Device narration tests cover chunk offsets, real-start tracking, completion, cancellation, unavailable voices, timeouts and asynchronous voice loading.
- In the Codex browser at localhost, individually opened all 35 classics, started the native Spanish voice (Mónica), stopped, jumped to the final page, confirmed the next-page control is disabled and returned to the shelf.
- Individually opened all 11 studio books, exercised start/stop, navigated to page 10 and returned to the shelf. Existing recorded-audio manifest/alignment tests pass. Observed Los tres cerditos automatically reading and advancing between pages with word tracking.
- At a 390 × 844 viewport, La princesa y el guisante automatically narrated pages 10–15, scrolled its text pane to the active word and stopped at the final page. Inspected separated scene/text/controls. Also inspected its royal cast and bed/castle scene props.
- No browser console warnings/errors in the 46-book smoke pass. This was not a real iPhone/Safari hardware test, nor a listening audit of every page.
- JS application budget increases by a bounded 40 KiB (to 1,440 KiB), base deploy by 50 KiB (to 10.55 MiB) for deferred Nido geometry/direction/narrator code; initial-load and per-chunk limits remain unchanged. No new audio/model downloads.

Production publication and live verification must be checked against the merged commit; this document alone is not deployment evidence.
