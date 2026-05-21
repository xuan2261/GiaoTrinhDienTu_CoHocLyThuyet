---
phase: 1
title: "Foundation TDD Setup"
status: completed
priority: P0
effort: "3h"
dependencies: []
---

# Phase 1: Foundation TDD Setup

> ⚠ RED TEAM 2026-05-21 — see plan.md ## Red Team Review (F4, F10, F12, F14).
> - F4 fixed inline: utils `clickPlay` no longer relies on `[data-sim-play]` as the only selector — uses `button:has-text("▶ Chạy")` as primary, with `[data-sim-play]` as a positive-control hook (the attribute is added in Phase 03 GREEN).
> - F10 fixed inline: `knownDefect` bypass replaced with explicit `test.fixme()` for the 13 RED routes — fail visibly until each phase clears its tag.
> - F12 fixed inline: ≤90 s sequential budget removed; targeting ~4 min sequential single-page-context with explicit budget bump in Phase 04. Worker parallelism still forbidden (state pollution).
> - F14 fixed inline: 16×16 hash grid is too coarse for ch3-1-2's slow-pulse animation (`0.8 rad/s` — see Phase 05). Drop to step=8 with full-image FNV digest fallback (matches the verification driver's proven pattern).

## Context Links

- Sweep driver (skeleton to lift): `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js`
- Existing 58-route mount harness pattern: `tests/simulation-browser.spec.js`
- TDD invariant pattern reference: `tests/phase-09-12-tdd.test.js`, `tests/phase-08-tdd.test.js`
- Animation engine bind: `js/sim-professional-lab.js:1559-1675`

## Overview

Stand up the test infrastructure that every later phase consumes. Lift the verification driver into a Playwright spec, define `tests/sim-canvas-evolution-fixtures.js` (route allowlist tables), record the **current** baseline pixel-hash JSON, and run it once to confirm the harness reproduces the report's findings (13 RED routes). No production code changes in this phase.

## Key Insights

- Sweep driver already does in-page async loop to avoid CDP round-trip per frame — keep that pattern, port it into Playwright `page.evaluate`.
- Frame hash sampling: 8×8 grid via `getImageData(0, 0, w, h, step=8)` plus full-image FNV digest fallback — fine-grained enough for slow-pulse animations like ch3-1-2's `0.8 rad/s` arrow modulation; insensitive to anti-aliasing jitter. (F14: step=16 aliased the slow pulse.)
- Allowlist tables are the source of truth. Three buckets: `STATIC_ROUTES_INTENT_KH1` (Ch1 25 routes), `STATIC_ROUTES_CONCEPT_DIAGRAM` (8 Ch2/Ch3 routes), `ANIMATED_ROUTES_EVOLVING` (the remaining 25). Phases 2/3/5 mutate these as work lands.
- This phase **records** the baseline that phases 2, 3, 5 will *break* (RED state). Phase 4 wires CI to fail on diff once baseline is corrected.

## Requirements

### Functional

- New file `tests/sim-canvas-evolution-fixtures.js` exporting three route allowlist arrays + helper `routeBucket(routeId)`.
- New Playwright spec `tests/sim-canvas-evolution.spec.js` mounting all 58 routes via shared harness, sampling canvas hash at t=0,1,2,3s and writing per-route `uniqueFrames` count.
- New baseline file `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` capturing today's truth (with the 13 known defects flagged).
- New helper `tests/canvas-evolution-utils.js` exposing `samplePixelGrid`, `clickPlay`, `waitForCanvas`, `pause`.

### Non-functional

- Spec target runtime ~4 min on dev hardware sequential single-page-context (~58 routes × 4 s + mount overhead). Worker parallelism remains forbidden (state pollution between routes). Phase 04 budgets the CI total accordingly.
- File sizes ≤ 220 lines per `audit_simulation_quality.py --max-js-lines 220` policy.
- Hash grid step=8 (not 16) — finer sampling avoids aliasing on slow-pulse animations like ch3-1-2 (`0.8 rad/s`); falls back to full-image FNV digest if step=8 still aliases. The verification driver's full-image digest is the proven pattern.

## Architecture

```
tests/
├── sim-canvas-evolution-fixtures.js      # route bucket tables + bucket helper
├── canvas-evolution-utils.js             # sampleGridHash, clickPlay, waitCanvas
├── sim-canvas-evolution.spec.js          # Playwright spec, drives all 58 routes
qa-verification/animation-sweep/
└── per-route-animation-sweep-baseline.json  # checked-in baseline
```

Spec flow per route:
1. `page.goto file://index.html#<route>`
2. `waitForCanvas(8s)`
3. Sample `t0 = grid hash`; `clickPlay()`; sleep 1s; sample `t1`; sleep 1s; sample `t2`; sleep 1s; sample `t3`
4. Compute `uniqueFrames = new Set([t0,t1,t2,t3]).size`
5. Compare against baseline bucket: STATIC → `uniqueFrames ∈ {1, 2}` (2 allowed for one-shot snap); ANIMATED → `uniqueFrames ≥ 3`
6. Aggregate failures into single AssertionError with route table at end of spec.

## Related Code Files

### Create
- `tests/sim-canvas-evolution-fixtures.js`
- `tests/canvas-evolution-utils.js`
- `tests/sim-canvas-evolution.spec.js`
- `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`

### Modify
- (none in phase 1 — production code untouched)

### Delete
- (none)

## Implementation Steps

### RED — write failing tests first

1. **Verify naming clash absence**: `grep -r "phase-09-canvas-evolution\|sim-canvas-evolution" tests/` returns nothing. If hit, choose alternative slug `tests/sim-evolution-58-route-sweep`.
2. Author `tests/sim-canvas-evolution-fixtures.js`:
   - `STATIC_ROUTES_INTENT_KH1` = the 25 Ch1 ids from `js/sims/ch1/` scene catalog (lift from `js/sim-route-manifest.js`).
   - `STATIC_ROUTES_CONCEPT_DIAGRAM` = `['ch3-1-3', 'ch3-2-3', 'ch3-2-5', 'ch3-4-1', 'ch3-6-3', 'ch3-7-1', 'ch3-7-2', 'ch2-7-2']`.
   - `ANIMATED_ROUTES_EVOLVING` = the rest (computed = manifest − above two arrays); export. Assert length 58 = 25 + 8 + 25 in module-load self-check.
   - Export `routeBucket(routeId): 'static-ch1' | 'static-concept' | 'animated' | null`.
3. Author `tests/canvas-evolution-utils.js`:
   - `async sampleGridHash(page)` — runs in-page `getImageData` step=8, returns 32-bit FNV hash hex; falls back to full-image FNV digest when grid hash collides.
   - `async clickPlay(page)` — primary selector `page.locator('button:has-text("▶ Chạy")')`; positive-control hook `[data-sim-play]` added by Phase 03 GREEN; short-circuits if static route.
   - `async waitForCanvasMounted(page, routeId, timeoutMs=8000)`.
4. Author `tests/sim-canvas-evolution.spec.js`:
   - Single `test.describe('Canvas evolution sweep — 58 routes', …)` with one `test()` looping fixtures.
   - For each route, capture (t0,t1,t2,t3) hashes, push into `results[routeId]`.
   - Assert per-bucket `uniqueFrames` constraint. **Expected to fail** with 13 routes in `static-concept`/`animated` violating animation constraint.

### Capture current truth (sub-RED)

5. Run spec once with `playwright test tests/sim-canvas-evolution.spec.js --reporter=json > /tmp/sweep.json`.
6. Convert results to baseline JSON sorted by routeId, schema:
   ```json
   {
     "generated": "2026-05-21",
     "routes": {
       "ch1-1-1": { "bucket": "static-ch1", "expectedUniqueFrames": [1,2], "lastSeenFrames": 1 },
       "ch3-2-1": { "bucket": "animated", "expectedUniqueFrames": [3,4], "lastSeenFrames": 1, "knownDefect": "phase-02-fix" }
       ...
     }
   }
   ```
7. Mark all 13 RED routes with `"knownDefect": "phase-02-fix" | "phase-03-suppress" | "phase-05-animate"` mapping per the verification report classification.

### GREEN — explicit fixme for known defects (no silent bypass)

8. Mark each of the 13 RED routes with `test.fixme(routeId, 'phase-02-fix' | 'phase-03-suppress' | 'phase-05-animate')`. The spec lands GREEN on commit but the fixme entries are visible in CI output and unblocked by phases 02/03/05 as each one clears its tag. **No `if (!route.knownDefect) assert(...)` bypass** — that would silently green a regression.

### REFACTOR

9. Extract repeated `await page.goto / waitForCanvasMounted / sampleGrid` into `runSweepForRoute(page, routeId)`.
10. Confirm spec completes <120s; if slower, switch to in-page async loop matching the verification driver pattern.
11. Run `node --check` on all new JS (already covered by `npm run test:sim:unit` first step).

## Tests (this phase delivers tests, no impl)

| Test | Asserts |
|---|---|
| `sim-canvas-evolution.spec.js` `mounts all 58 routes without console errors` | Every routeId mounts, `page.on('pageerror')` empty. |
| `… records hashes at t=0/1/2/3 for every route` | `results[routeId].length === 4`. |
| `… enforces bucket-specific uniqueFrames invariant (13 RED routes wrapped in test.fixme until each phase clears its tag)` | Pass on commit; fixme entries shrink as phases 02/03/05 land. |
| `… emits machine-readable summary to qa-verification/animation-sweep/sweep-results.json` | File written; round-trips JSON.parse without throw. |

## Todo List

- [x] Step 1: naming-clash grep clean
- [x] Step 2: fixtures file with self-check
- [x] Step 3: utils file (`sampleGridHash`, `clickPlay`, `waitForCanvasMounted`)
- [x] Step 4: spec file mounting 58 routes
- [x] Step 5–6: capture baseline JSON
- [x] Step 7: tag 13 RED routes with `knownDefect`
- [x] Step 8: guard assertions for clean commit
- [x] Step 9: extract `runSweepForRoute` helper
- [x] Step 10: timing budget verified
- [x] Step 11: `npm run test:sim:unit` green

## Success Criteria

- [x] `npm run test:sim:unit` passes (node --check on new JS).
- [x] `npx playwright test tests/sim-canvas-evolution.spec.js` passes with 13 RED routes documented (not skipped).
- [x] Baseline JSON committed; round-trips through `JSON.parse` without warning.
- [x] No new files exceed 220 lines.
- [x] No production `js/` file modified.

## Risk Assessment

- **Spec timing variance** → use single-page-context pattern with predictable 1s sleeps; do not parallelize across workers (state pollution between routes). Sequential ~4 min budget — Phase 04 budget aligns.
- **Canvas grid hash false-positive on antialiasing** → step=8 (not 16) per F14; fall back to full-image FNV digest if step=8 still aliases on slow-pulse animations.
- **`data-sim-play` selector missing in source today** → primary selector is `button:has-text("▶ Chạy")` (textContent match); `[data-sim-play]` becomes a positive-control hook once Phase 03 GREEN adds the attribute. Tests do not depend on the attribute existing pre-Phase-03.

## Security Considerations

None. Local file:// browser context, no network.

## Next Steps

Phase 02 (ch3-2-1 fix) and Phase 03 (static flag) consume this baseline; both must clear their `knownDefect` tag and re-emit the baseline JSON before merge.
