---
phase: 10
title: "Backlog Harness Expansion A11y Code Standards"
status: completed
priority: P3
effort: "1d"
dependencies: [4]
---

# Phase 10: Backlog Harness Expansion + A11y + Code Standards

## Context Links

- Existing interaction sweep: `tests/simulation-interaction-engine.spec.js` (14 representative routes)
- A11y existing pattern: `aria-pressed` toggling at `js/sim-professional-lab.js:1570`
- Phase 03 introduces canvas aria-label override; this phase audits for orphans
- `docs/code-standards.md` Sim renderer types subsection (introduced phase 08)

## Completion Note — 2026-05-21

Completed the no-dependency Phase 10 slice:

- Interaction sweep check: existing `tests/simulation-interaction-engine.spec.js` already sweeps `ALL_ROUTES` (58 routes), so no new full-58 file was needed.
- A11y polish: canvas labels now use exact static/animated formats through the interaction layer; static routes assert no orphan `aria-pressed`.
- Silent static ticking: `tickWithoutButton` routes no longer use `lab.isPlaying`, so drag does not permanently pause hidden readout ticks.
- Runtime internals: removed `window.__currentLab`; canvas evolution harness reads scoped `.sim-lab[data-engine-time]` instead.
- Docs: `docs/code-standards.md` renderer taxonomy expanded; `docs/codebase-summary.md` links to it.
- Optional axe-core and pixelmatch dependencies were not added because both require maintainer sign-off per phase scope.

Verification:

- `npx playwright test tests/phase-09-static-routes-no-play-button.spec.js` → 9 passed.
- `npm run test:sim:unit` → PASS.
- `npm run test:sim:browser:evolution` → PASS, 58 routes, baseline OK.

## Overview

Three small backlog items bundled because each is too small to stand alone:

1. **Harness expansion** — promote interaction sweep from 14 representative routes to all 58 (drag/slider, preset click, activity-checker click).
2. **A11y polish** — audit `aria-pressed` cleanup when phase 03 hides Play button; ensure aria-label on canvas is descriptive for static routes.
3. **Code standards doc** — formalize "Sim renderer types" with code samples + when-to-use.

## Key Insights

- Interaction sweep is currently the only QA tier touching presets and activity checkers; expanding to 58 catches mount + interaction defects on the long-tail routes.
- `aria-pressed` on a button that no longer exists is technically a non-issue (button is gone) but a button that *was* mounted then removed mid-session can leave a stale focus ring. Audit ensures fresh mount = clean state.
- Code-standards doc was bumped in phase 08 with a one-paragraph subsection; phase 10 expands to a full reference subsection with examples and "How to add a new animation scene" recipe.

## Requirements

### Functional

#### Harness expansion
- `tests/simulation-interaction-engine.spec.js` (or new `simulation-interaction-engine-full-58.spec.js`) sweeps all 58 routes with: drag (where draggable), slider (every numeric control), preset gallery click (where present), activity checker click (where present).
- Per-route assertion: state mutation propagates to readout text within 500ms.

#### A11y polish
- Phase 03 RED test for `aria-pressed` orphan extended: focus the (removed) Play button area, assert no `aria-pressed` attribute lingering on `lab.controls`.
- Static-route canvas aria-label format finalized: `Sơ đồ tĩnh của <scene.title>`. Animated route aria-label: `Khu vực mô phỏng động: <scene.title>`.
- Run `axe-core` Playwright integration on a sample of 10 routes; fail on any "serious" or "critical" issue.

#### Code standards doc
- `docs/code-standards.md` "Sim renderer types" expanded to ~30 lines:
  - Definition with examples
  - Decision tree (concept-diagram vs animation scene vs interactive-static)
  - Recipe: "How to convert a concept diagram into an animation scene"
  - Recipe: "How to add a new static concept route"
  - Cross-link to phase 08 changelog and journal

### Non-functional

- 58-route interaction sweep ≤ 4 min (currently 14 routes ~1 min; linear scaling acceptable).
- axe-core dep optional (only if maintainer accepts); fallback to manual a11y review.

## Architecture

```
Harness expansion         A11y polish              Code-standards doc
─────────────────         ────────────             ──────────────────
14 routes → 58            aria-pressed audit       docs/code-standards.md
+ preset click            aria-label finalize       ~30-line subsection
+ checker click           axe-core sample
```

## Related Code Files

### Modify
- `tests/simulation-interaction-engine.spec.js` (or split file)
- `js/sim-professional-lab.js` (a11y label finalization, ≤ 4 lines)
- `docs/code-standards.md` (subsection expansion)
- `package.json` (optional `@axe-core/playwright` dev dep)

### Create (optional)
- `tests/sim-a11y-axe-spotcheck.spec.js` — axe-core integration over 10 representative routes

### Read for context
- All renderer files for code-standards examples

## Implementation Steps

### Harness expansion

1. List existing 14 routes from `simulation-interaction-engine.spec.js`. Compare to 58. Find missing interaction patterns per route.
2. Add per-route descriptor table: `{ routeId, draggables, sliders, presets, checkers }`.
3. Loop over 58 routes; for each interaction type present, perform action and assert readout updates.
4. Run `npm run test:sim:browser` end-to-end; ensure ≤ 5 min.

### A11y polish

5. Add Playwright assertion in phase-03 spec: after mount of static route, `await expect(page.locator('[aria-pressed]')).toHaveCount(0)`.
6. Finalize canvas aria-label in `js/sim-professional-lab.js`:
   ```js
   lab.canvas.setAttribute('aria-label',
     scene.static
       ? `Sơ đồ tĩnh của ${scene.title}`
       : `Khu vực mô phỏng động: ${scene.title}`);
   ```
7. (Optional) install `@axe-core/playwright`, write 10-route spotcheck, fail on serious/critical violations.

### Code standards doc

8. Expand `docs/code-standards.md` "Sim renderer types" to:
   ```markdown
   ## Sim renderer types

   58 routes split into 3 renderer kinds. Pick by reading scene's intent:

   ### 1. Concept diagram (`scene.static === true`)
   Pure-state-of-now. Renderer never reads `state._t`. Reader hides Play button.
   Example: `js/sims/ch3/ch3-newton-laws-renderers.js renderCh323NewtonThird`.

   ### 2. Animation scene (no `scene.static`)
   Renderer MUST consume `state._t` and time-derived state. Reader shows Play.
   Example: `js/sims/ch3/ch3-theorems-renderers.js renderCh353AngularMomentum`.

   ### 3. Interactive-static (Ch1 statics)
   No time dimension. Renderer paints scalar state. Reader has no Play.
   Example: `js/sims/ch1/...renderCh111ForceLaw`.

   ### Decision tree
   - Lesson teaches "tại thời điểm" / instantaneous → concept diagram.
   - Lesson teaches "khi vật chuyển động" / over time → animation scene.
   - Lesson is statics (Ch1) → interactive-static.

   ### Recipe: convert concept diagram → animation scene
   1. Drop `static: true` from scene catalog.
   2. Add `_t`-driven term to renderer (e.g. `bodyX += v0 * state._t * pxPerMeter`).
   3. Add to `ANIMATED_ROUTES_EVOLVING` fixture.
   4. Update sweep baseline window to `[3, 4]`.

   ### Recipe: add static concept route
   1. Set `static: true` in scene catalog.
   2. Renderer reads `state` only.
   3. Add to `STATIC_ROUTES_CONCEPT_DIAGRAM` fixture.
   4. Sweep baseline window stays `[1, 2]`.

   See `docs/journals/2026-05-22-phase-09-canvas-evolution-harness-and-renderer-cleanup-closeout.md` for the verification finding that motivated this taxonomy.
   ```
9. Link from `docs/codebase-summary.md` to the new subsection.

## Tests

| Test | Asserts |
|---|---|
| `simulation-interaction-engine` 58-route sweep | Per-route readout updates after every interaction type present. |
| Playwright a11y assertion (phase 03 spec extended) | `aria-pressed` count = 0 on static routes. |
| `tools/audit.py` | Doc updates introduce no broken cross-references. |
| (Optional) axe-core 10-route spec | No serious/critical violations. |

## Todo List

- [x] Interaction sweep expanded 14 → 58 (already present via `ALL_ROUTES`; verified during implementation review)
- [x] aria-pressed orphan audit
- [x] aria-label finalize on canvas
- [ ] (Optional) axe-core spotcheck — skipped; dependency requires maintainer sign-off
- [x] Code-standards subsection expanded with recipes
- [x] Codebase-summary links updated

## Success Criteria

- [x] 58-route interaction sweep exists via `ALL_ROUTES`; no Phase 10 code change needed.
- [x] No orphan `aria-pressed` attrs on static routes.
- [x] Canvas aria-labels follow new format (verified by RED test).
- [x] `docs/code-standards.md` Sim renderer types ≥ 25 lines with recipes.
- [ ] (Optional) axe spotcheck green — skipped; dependency requires maintainer sign-off.

## Risk Assessment

- **Sweep flakes due to long-tail routes' slow init** → per-route timeout 8s already proven by phase 01 sweep harness; reuse `waitForCanvasMounted` helper.
- **axe-core surfaces unrelated existing a11y issues** → keep scope to "no serious/critical regressions"; existing minor issues tracked separately.
- **Code-standards doc duplicates phase 08 content** → phase 08 introduces 5–10 line subsection; phase 10 expands to 25–30 with recipes. Phase 10 supersedes phase 08 doc snippet.

## Security Considerations

None.

## Next Steps

After phase 10, plan dir is fully closed. Run `/ck:plan archive plans/260521-1100-phase-09-concept-diagram-cleanup-animation-parity` to write final journal and archive.
