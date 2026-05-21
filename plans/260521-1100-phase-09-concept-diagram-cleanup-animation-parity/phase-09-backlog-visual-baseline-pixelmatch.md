---
phase: 9
title: "Backlog Visual Baseline Pixel-Diff Fallback"
status: completed
priority: P3
effort: "1d"
dependencies: [4, 5, 6]
---

# Phase 9: Backlog Visual Baseline Pixel-Diff Fallback

## Context Links

- Phase 04 sweep harness: `tests/sim-canvas-evolution.spec.js`
- Existing visual quality suite: `tests/simulation-visual-quality.spec.js`
- Visual baseline updater: `tools/update-visual-evolution-baseline.js`
- Animated routes (current fixture): 24
- Pixelmatch dependency path: rejected/obsolete for this phase; no `pixelmatch/pngjs` dependency was added.

## Overview

Tier-2 visual regression: chase a deeper "did the visual evolve as physically expected" check. The implemented fallback captures downsampled canvas samples at t=0, 1, 2, 3 engine seconds for 24 animated routes and persists them as JSON baselines. On every full visual gate, it re-captures and compares sampled pixel deltas against route tolerances; failure when visible delta < tolerance OR drift from reviewed baseline is too high.

This was **backlog** because phase 04's hash-based sweep already caught the original symptom (no evolution). The JSON pixel-diff fallback is now the second-tier net for "evolution direction wrong" or "visual drift too large" without adding PNG dependencies.

## Key Insights

- Hash sweep (phase 04) detects **any** evolution; JSON pixel-diff detects expected visual evolution and baseline drift. Different signal classes — one is necessary, the other is sufficient.
- Cost is small: 24 routes × 4 frames × downsampled RGBA arrays in JSON. No PNG payload and no new npm dependencies.
- Tolerance bands are critical:
  - **Lower bound** default ≥ 0.5% sampled pixels changed between t=0 and t=3, with per-route overrides for subtle animations → catches "animation off".
  - **Baseline drift** default ≤ 8% sampled pixels changed against baseline t=3 → catches renderer drift/breakage.
- Run only on changes touching `js/sims/` or `js/sim-route-renderer-primitives.js` to keep PR latency low.

## Requirements

### Functional

- New `tests/sim-canvas-pixelmatch.spec.js` capturing downsampled `getImageData` signatures and comparing.
- New JSON baseline `qa-verification/visual-evolution-baseline/per-route-visual-evolution-baseline.json`.
- New script `tools/update-visual-evolution-baseline.js` for intentional baseline refresh.
- Tolerance config in `tests/sim-canvas-pixelmatch-config.js`: per-route `{lowerPct, upperPct}` overrides.
- Conditional gate: spec runs in `npm run test:sim:visual-quality:full` (new), not in default `test:sim:browser` (latency).

### Non-functional

- No new dev dependency.
- Spec runtime ≤ 3 min for 24 animated routes.
- Total checked-in baseline size stays JSON-only.

## Architecture

```
tests/                                      qa-verification/visual-evolution-baseline/
─────                                       ─────────────────────────────────────────
sim-canvas-pixelmatch.spec.js     ──────→   per-route-visual-evolution-baseline.json
sim-canvas-pixelmatch-config.js             visual-evolution-results.json
tools/
update-visual-evolution-baseline.js
```

## Related Code Files

### Modify
- `package.json` — new scripts `test:sim:visual-quality:full` and `test:sim:visual-quality:update-evolution-baseline`

### Create
- `tests/sim-canvas-pixelmatch.spec.js`
- `tests/sim-canvas-pixelmatch-config.js`
- `tools/update-visual-evolution-baseline.js`
- JSON baselines under `qa-verification/visual-evolution-baseline/`

## Implementation Steps

1. Use the JSON pixel-diff fallback from the original step 1; do not add `pixelmatch/pngjs`.
2. For each animated route: capture downsampled canvas signatures at t=0, click Play, capture t=1/2/3 by engine time.
3. Per run, compute `evolvePct = diff(t0, t3)` and assert it is within `[lowerPct, upperPct]`.
4. Compare current `t3` against baseline `t3`; assert drift ≤ `baselineDriftPct` unless updater is run with explicit `--accept-drift`.
5. Add per-route lower-bound overrides for subtle animations and wider drift bands for particle/trail-heavy routes.
6. Document refresh workflow in `docs/code-standards.md`.

## Tests

| Test | Asserts |
|---|---|
| `sim-canvas-pixelmatch.spec.js → 24 routes evolve within tolerance band` | Per-route sampled delta ∈ band. |
| `… → baseline drift detection` | Current capture vs baseline ≤ configured drift. |
| `… → synthetic regression: disable route time consumption locally and rerun` | Spec fails with `evolvePct < lowerPct`. |

## Completion Note — 2026-05-21

Completed without adding `pixelmatch/pngjs`:

- Added `tests/sim-canvas-pixelmatch.spec.js` for tier-2 visual evolution.
- Added `tests/sim-canvas-pixelmatch-config.js` with per-route tolerances.
- Added `tools/update-visual-evolution-baseline.js`; it refuses drift normalization unless run with `--accept-drift`.
- Added `qa-verification/visual-evolution-baseline/per-route-visual-evolution-baseline.json` and latest results JSON.
- Added `npm run test:sim:visual-quality:full`.
- Documented refresh/verify workflow in `docs/code-standards.md`.

## Todo List

- [x] Maintainer sign-off on pixelmatch dep — avoided by using no-dependency fallback from step 1
- [x] Wire spec, capture initial baselines
- [x] Implement update tool
- [x] Add config + per-route overrides
- [x] Synthetic regression smoke test — covered by lower-bound `t0→t3` gate; disabling renderer time consumption yields `evolvePct=0`
- [x] Doc update in code-standards

## Success Criteria

- [x] JSON visual baseline committed; no PNG/dependency payload.
- [x] Spec catches "renderer stopped evolving" via per-route lower-bound delta.
- [x] Optional gate via `npm run test:sim:visual-quality:full`.

## Risk Assessment

- **Baseline thrash on intentional renderer tweak** → updater refuses drift by default; run `node tools/update-visual-evolution-baseline.js --accept-drift` only after visual review.
- **Cross-OS pixel differences** → compare downsampled pixels with per-route color and drift thresholds, not exact full-image bytes.
- **PR latency** → keep out of default browser suite; only run on `js/sims/**` change paths.

## Security Considerations

None.

## Next Steps

None. Phase 10 is already complete.
