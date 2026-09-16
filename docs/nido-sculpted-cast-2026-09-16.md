# Nido — articulated sculpted cast

## Scope

Local, original Three.js geometry for the characters used by all 46 books.
78 living character IDs are rebuilt or refined; `concha-caracol` remains an
empty-shell prop. The dragon follows the visual direction approved by the
user on 2026-09-16. That direction approval is not represented as individual
human approval of every model, nor as a room-design pipeline approval.

No third-party model, paid generation, new dependency, narration asset, story
text, cover image or stored reader progress is changed by this release.
This is stylized, more anatomically differentiated WebGL art, not a promise of
photorealistic film footage. The 17 remaining heritage covers are a separate,
unfinished art-generation task and are not claimed as replaced here.

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

## Verification

- Full catalog geometry/articulation tests include all 922 pages' cast mapping.
- Browser traversal on the compiled preview: all 46 books opened, offered the
  read-aloud control, selected page 1, advanced to page 2, closed and returned
  to the shelf. No warning/error console entries after this traversal.
- Desktop visual inspection: original clothes and wolf, quadruped/bird scene,
  dragon; narration starts, tracks words, advances and pauses.
- 390 × 844 browser viewport: dragon stage remains above the scrollable text,
  navigation/read-aloud controls fit; changing page during narration works.
- This is representative rendered review plus exhaustive model/catalog checks,
  not a claim that every frame of all 922 pages was manually reviewed or that
  physical iOS Safari testing was performed.

## Known difference from the reference

Characters have distinct anatomy and textured materials, but remain lightweight
procedural sculptures. Props and page illustrations retain their existing art
direction. External high-detail sculpting and remaining cover generation have
not been silently substituted or reported as completed.
