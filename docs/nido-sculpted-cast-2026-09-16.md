# Nido — articulated sculpted cast

## Scope

Local, original Three.js geometry for the characters used by all 46 books.
81 living character IDs are rebuilt or refined; `concha-caracol` remains an
empty-shell prop. The dragon follows the visual direction approved by the
user on 2026-09-16. That direction approval is not represented as individual
human approval of every model, nor as a room-design pipeline approval.

No third-party model, paid generation, new dependency, narration asset, story
text, cover image or stored reader progress is changed by this release.
This is stylized, more anatomically differentiated WebGL art, not a promise of
photorealistic film footage. The 17 remaining heritage covers are a separate,
unfinished art-generation task and are not claimed as replaced here.

## Correction after the production dragon report

The public page was verified to still serve the old teddy-like dragon. The
local dragon was reshaped again with a heavier reptile body, shorter clawed
legs, a longer jaw, swept horns and layered pointed scale plates (24,556
triangles). This is still stylized and does not match the cover's rendered
fidelity. Functionality tests must not be used to claim that visual match.

The ten-page dragon edition now changes cast, objects, setting and time of day
according to its actual passages. No sailboat on the mountain opening, no
pearl remaining after the theft, no flying dragon at the imperial ending.
Anchored action matching prevents `nadie`, `costas`, and `volvió` from causing
swimming, sewing and flying. Bambi's mother is a doe; Heidi has goats instead
of sheep; the ugly-duckling story has a hen rather than a rooster. Sleeping
figures keep their eyes shut. Page-specific scenery also selects its ambience.

After the public-code destination was explained, the user replied "termina
todo y despliega a produccion". This release is being prepared under that
informed instruction; production verification must still follow deployment.

## Model and runtime contract

- +Y up; +Z semantic forward; full silhouette uniformly fitted to its slot.
- Four-legged mammals and reptiles, two-legged birds with layered feathers,
  six-legged insects, vertical fish tail versus horizontal cetacean flukes.
- Human proportions, cloth folds, fingers, smaller eyes and individual outfits.
- Original three pigs retain their clothes and tools, with new leg pivots,
  restrained face proportions and grouped blinking eyes.
- A three-quarter animal presentation exposes the body without changing the
  stage's outer gaze/travel/click-to-turn controls.
- Detail uses instancing; each actor stays below 40,000 triangles and 90 mesh
  draws. Each page's living cast stays below 110,000 triangles. These are mesh
  budgets, not measured frame-rate guarantees on physical phones.
- Instanced GPU buffers and the dragon's owned relief texture are released
  when actors are removed. Shared material surfaces remain shared.

## Verification and release blockers

- Latest local `npm run check`: 171 tests pass; production build passes; the
  quality and curriculum checks pass. Full catalog geometry/articulation tests
  include all 922 pages' cast mapping. These checks do not prove visual fidelity
  or audible narration in a real browser.
- Earlier browser traversal on the compiled preview: all 46 books opened, offered the
  read-aloud control, selected page 1, advanced to page 2, closed and returned
  to the shelf. No warning/error console entries after this traversal.
- Earlier desktop visual inspection included original clothes and wolf and a
  quadruped/bird scene. The latest dragon review covered pages 1, 5 and 10,
  including their different cast, props and backgrounds.
- 390 × 844 browser viewport: dragon stage remains above the scrollable text,
  navigation/read-aloud controls fit.
- Latest live device-voice attempt FAILS in both the in-app browser and Chrome:
  native speech ends too early and the page correctly does not advance. Paused
  engine recovery and bounded Spanish-voice retry are implemented and unit
  tested, but do not resolve this observed failure. Do not report narration as
  working based on earlier successful checks or simulated speech events.
- An isolated browser page, without Nido, reproduces native `end` before
  `start` for Mónica, Paulina and Chrome's Spanish voice. An unsandboxed macOS
  synthesis check produces a non-empty audio file. This narrows the issue to
  the tested browser/runtime environment but does not certify end-user audio.
- At preparation time public production still serves the older art. A merge
  or passing build alone is not evidence that the public deployment updated.
- This is representative rendered review plus exhaustive model/catalog checks,
  not a claim that every frame of all 922 pages was manually reviewed or that
  physical iOS Safari testing was performed.

## Known difference from the reference

Characters have distinct anatomy and textured materials, but remain lightweight
procedural sculptures. Props and page illustrations retain their existing art
direction. External high-detail sculpting and remaining cover generation have
not been silently substituted or reported as completed.
