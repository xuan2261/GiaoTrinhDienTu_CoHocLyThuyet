---
phase: 4
title: "P0 Regression Harness CI Hook"
status: completed
priority: P0
effort: "2h"
dependencies: [1, 2, 3]
---

# Phase 4: P0 Regression Harness CI Hook

> ⚠ RED TEAM 2026-05-21 — see plan.md ## Red Team Review (F9, F15).
> - F9 (scope concern, partial accept): the harness adds maintenance burden disproportionate to a one-time fix. Plan keeps the harness but Sprint 1 lands as a single PR (1 → 2 → 3 → 4 collapsed). Phase 04 ceremony reduced — see "Modified Implementation Steps" below.
> - F15 fixed inline: sweep harness becomes engine-time-coupled (poll `lab.smoothedState._t` until it crosses 1, 2, 3) instead of wall-clock-coupled (`sleep(1000)`). This decouples `uniqueFrames` from CI host RAF rate; otherwise headed/DPR=2/slow-CI runs collapse the `[3,4]` window to `[1,2]`.

## Context Links

- Phase 1 spec: `tests/sim-canvas-evolution.spec.js`
- Baseline: `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`
- npm gate: `package.json` script `test:sim:browser`
- Existing release gate: `npm run test:sim:release` chain
- Sweep tools dir parallels: `tools/run-sim-review-2026-05-19-tests.js`

## Overview

After phases 2 and 3 land, the baseline JSON has zero `knownDefect` tags for the routes we touched (ch3-2-1 + 7 static-concept routes; ch3-7-2's `knownDefect` clears in Phase 05). Phase 4 (a) regenerates the baseline with all 33 dynamic routes asserting their bucket invariants, (b) wires the spec into `npm run test:sim:browser` permanently, (c) adds a `tools/check-canvas-evolution-baseline.js` Node wrapper that diffs current sweep against baseline and fails CI on drift, (d) documents the workflow in `tests/README` adjacent or inline header.

## Key Insights

- Two layers: (1) per-route bucket invariant (static vs animated, asserted by Playwright spec), (2) baseline JSON drift detection (Node wrapper compares JSON keys + lastSeenFrames windows).
- `expectedUniqueFrames` is a **window** `[min, max]`, not a single value — accommodates renderer randomness (e.g. particle subpixel jitter) without flakiness. Animated routes: `[3,4]`. Static: `[1,2]`. Concept-static (post-phase-3): `[1,1]`.
- ⚠ [F15] **Sample by engine time, not wall time.** Original sweep driver sleeps 1 s between samples, but the engine RAF only ticks at host frame rate; on CI 2-vCPU runners or DPR=2 canvases, RAF drops to ~30 Hz and `state._t` only advances ~0.5 s per wall second. Spec must poll `lab.smoothedState._t` until it crosses 1, 2, 3 before sampling each hash. This makes the test "did the renderer evolve through 1, 2, 3 seconds of *simulation* time" instead of wall time, which is what we actually care about pedagogically.
- Drift detection writes a fresh `sweep-results.json` and diffs by routeId; Node script exits 1 on schema delta or out-of-window count.
- Baseline file is **checked in**; updates are intentional (e.g. animating a new route) and require a deliberate `npm run test:sim:browser:update-evolution-baseline` script.

## Modified Implementation Steps (per F9)

Sprint 1 lands as a single PR collapsing phases 1 → 2 → 3 → 4 into one branch. Phase 04 retains the harness + drift script + baseline JSON, but:
- Drop `tools/update-canvas-evolution-baseline.js` for v1 — manual `cp sweep-results.json baseline.json` after human review is sufficient at this scale (58 routes). Re-add only if drift becomes routine.
- Drop `tests/sim-canvas-evolution-baseline-check.test.js` for v1 — schema validation is folded into `tools/check-canvas-evolution-baseline.js`'s pre-flight checks (one less test file to maintain).
- Result: Phase 04 ships 1 new tool + 1 baseline JSON + 2 npm scripts (down from 2 tools, 1 test, 3 scripts).

## Requirements

### Functional

- `npm run test:sim:browser` runs `sim-canvas-evolution.spec.js` last (after the 4 existing specs).
- New script `tools/check-canvas-evolution-baseline.js`:
  - Reads `qa-verification/animation-sweep/sweep-results.json` (written by spec).
  - Reads `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`.
  - Diffs by routeId: any new/missing route → exit 1; any `lastSeenFrames` outside `expectedUniqueFrames` window → exit 1.
  - Prints diff table on failure.
- New script `tools/update-canvas-evolution-baseline.js` — runs spec, copies `sweep-results.json` → `baseline.json` after human eyeball.
- New `npm` scripts:
  - `test:sim:browser:evolution` (runs spec + baseline check)
  - `test:sim:browser:update-evolution-baseline` (regenerates baseline; intentional)
- `test:sim:release` chain includes evolution check.

### Non-functional

- Total spec runtime ≤ 120s on dev hardware (already validated phase 1).
- Baseline JSON sorted by routeId for stable diffs (`JSON.stringify(obj, Object.keys(obj).sort(), 2)` style).

## Architecture

```
package.json scripts                       tools/
─────────────────                          ──────
"test:sim:browser":                        check-canvas-evolution-baseline.js
  "playwright test ... && node tools/check-canvas-evolution-baseline.js"
                                           update-canvas-evolution-baseline.js

tests/                                     qa-verification/animation-sweep/
─────                                      ─────────────────────────────────
sim-canvas-evolution.spec.js  ──writes──→  sweep-results.json
                                            └── compared to ──→ baseline.json
```

## Related Code Files

### Modify
- `package.json` (new scripts, chain into release)
- `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` (regenerate clean — all `knownDefect` cleared)

### Create
- `tools/check-canvas-evolution-baseline.js`
- `tools/update-canvas-evolution-baseline.js`
- `tests/sim-canvas-evolution-baseline-check.test.js` — Node test asserting baseline JSON shape (58 entries, valid bucket, well-formed window)

### Read for context
- `tools/run-sim-review-2026-05-19-tests.js` — copy structure for npm wrapper
- `tools/sim-visual-baseline-update.js` — copy update workflow

### Delete
- (none)

## Implementation Steps

### RED

1. Author `tests/sim-canvas-evolution-baseline-check.test.js`:
   - Loads `per-route-animation-sweep-baseline.json`.
   - Asserts `Object.keys(json.routes).length === 58`.
   - Asserts every route has `bucket ∈ {static-ch1, static-concept, animated}`, `expectedUniqueFrames` is `[number, number]` ordered ascending, `lastSeenFrames` ∈ window.
   - Run: **fails** today (baseline still has `knownDefect` tags from RED state).
2. Author `tools/check-canvas-evolution-baseline.js` skeleton with `process.exit(1)` for schema mismatch — verify it fails on a hand-edited bad baseline.

### GREEN

3. After phases 02 + 03 merge, regenerate `per-route-animation-sweep-baseline.json` by running spec + manually pruning `knownDefect` keys for cleared routes.
4. Implement `tools/check-canvas-evolution-baseline.js`:
   ```js
   #!/usr/bin/env node
   const fs = require('fs');
   const path = require('path');
   const baselinePath = path.join(__dirname, '..', 'qa-verification', 'animation-sweep', 'per-route-animation-sweep-baseline.json');
   const resultsPath = path.join(__dirname, '..', 'qa-verification', 'animation-sweep', 'sweep-results.json');
   if (!fs.existsSync(resultsPath)) {
     console.error('No sweep-results.json — run playwright test tests/sim-canvas-evolution.spec.js first.');
     process.exit(1);
   }
   const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
   const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
   const failures = [];
   for (const routeId of Object.keys(baseline.routes).sort()) {
     const b = baseline.routes[routeId];
     const r = results.routes && results.routes[routeId];
     if (!r) { failures.push(`${routeId}: missing from sweep results`); continue; }
     const [min, max] = b.expectedUniqueFrames;
     if (r.uniqueFrames < min || r.uniqueFrames > max) {
       failures.push(`${routeId} (${b.bucket}): uniqueFrames=${r.uniqueFrames} outside [${min},${max}]`);
     }
   }
   for (const routeId of Object.keys(results.routes || {})) {
     if (!baseline.routes[routeId]) failures.push(`${routeId}: not in baseline (new route?)`);
   }
   if (failures.length) {
     console.error('Canvas evolution baseline drift:');
     for (const f of failures) console.error('  - ' + f);
     console.error(`Run: npm run test:sim:browser:update-evolution-baseline (after human review)`);
     process.exit(1);
   }
   console.log(`Canvas evolution baseline OK (58 routes).`);
   ```
5. Implement `tools/update-canvas-evolution-baseline.js`: invokes spec, copies results to baseline, prints diff for review, exits 0.
6. Edit `package.json`:
   ```json
   "test:sim:browser": "playwright test tests/mass-conversion-audit.spec.js tests/simulation-browser.spec.js tests/simulation-interaction-engine.spec.js tests/promax-pilot-shell.spec.js tests/sim-canvas-evolution.spec.js && node tools/check-canvas-evolution-baseline.js",
   "test:sim:browser:evolution": "playwright test tests/sim-canvas-evolution.spec.js && node tools/check-canvas-evolution-baseline.js",
   "test:sim:browser:update-evolution-baseline": "node tools/update-canvas-evolution-baseline.js"
   ```
7. Re-run baseline check Node test → passes.

### REFACTOR

8. Add inline JSDoc header in `tools/check-canvas-evolution-baseline.js` explaining how to update baseline (3-line block, no markdown comment files).
9. Run `npm run test:sim:release` end-to-end. Confirm overall green: 173+1 browser tests, baseline check, visual quality.
10. Stage `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` so it's tracked under git (was previously gitignored — confirm `.gitignore` per `chore(gitignore): update local artifact ignores` commit doesn't exclude it; if so, allowlist via `!qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`).

## Tests

| Test | Asserts |
|---|---|
| `sim-canvas-evolution-baseline-check.test.js` | Baseline schema valid, 58 entries, no `knownDefect` left for phases 02+03 routes. |
| Synthetic CI smoke (manual) — corrupt one route's `lastSeenFrames` to 0, run `npm run test:sim:browser:evolution` | Exit code 1, prints offending route. |
| `npm run test:sim:browser` | Passes; spec output written to `sweep-results.json`; baseline check passes. |
| `npm run test:sim:release` | Full chain green. |

## Todo List

- [x] RED: baseline schema test fails on dirty baseline
- [x] GREEN: regenerate clean baseline (post phases 02+03)
- [x] GREEN: implement `tools/check-canvas-evolution-baseline.js`
- [x] GREEN: implement `tools/update-canvas-evolution-baseline.js`
- [x] GREEN: wire 3 new npm scripts; chain into `test:sim:browser`
- [x] REFACTOR: synthetic corruption smoke test passes (exit 1)
- [x] REFACTOR: confirm baseline JSON tracked under git
- [x] `npm run test:sim:release` green

## Success Criteria

- [x] `npm run test:sim:browser` runs the new spec; total runtime ≤ 5 min.
- [x] `tools/check-canvas-evolution-baseline.js` exits 0 on green baseline, 1 on drift.
- [x] Baseline JSON checked in, sorted, ≤ 200 lines (58 routes × ~3 lines/each).
- [x] `npm run test:sim:release` chain green.

## Risk Assessment

- **Baseline JSON in git might thrash on every visual baseline update** → only `lastSeenFrames` should drift; if it does, that's a real regression — exactly what we want to catch. Document this in journal.
- **CI environment slower than dev → frame timing flake** → window `[3,4]` already tolerates 1-frame jitter; if recurring flake, widen to `[2,4]` per route only.
- **`.gitignore` may already exclude `qa-verification/`** → step 10 verifies and allowlists if needed.

## Security Considerations

None.

## Next Steps

Phase 5 begins Sprint 2 — animate the four candidate renderers; each animation phase clears its own baseline window from `[1,1]` to `[3,4]`.
