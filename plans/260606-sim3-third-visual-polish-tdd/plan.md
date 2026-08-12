---
title: "Sim3 third visual polish TDD"
description: "Concise TDD plan for third-pass Sim3 visual polish on ch1-1-5, ch3-6-2, and ch2-3-2."
status: cancelled
priority: P2
effort: 4h
branch: master
tags: [sim3, tdd, visual-polish, playwright]
created: 2026-06-06
supersededBy: 260713-1524-fix-all-sim2-sim3-defects-deep-tdd
---

# Sim3 third visual polish TDD

## Scope

- Target routes equally: `ch1-1-5`, `ch3-6-2`, `ch2-3-2`.
- Acceptance: target images visually better; metrics pass; `ch1` resultant `R` not too large/decorative; `ch3` ghost/live states clearer; `ch2` `Đai` label attaches to belt span, not gear/pulley face; new contact sheet; reviewer has no medium findings.
- Constraints: no physics changes, no new dependencies, no README/docs updates. Prefer route-local adapter edits; touch Sim3 core only if existing label/metric utilities cannot measure required semantics.
- Existing relevant files verified:
  - Prior second-pass plan: `plans/260605-sim3-strong-redesign-second-pass-tdd/plan.md`.
  - Validators: `package.json:10-18`.
  - Sim3 shell label/metric helpers: `js/sim3/core/three-shell.js:73`, `js/sim3/core/three-shell.js:145-180`.
  - RED helper already exists: `tests/sim3-pilot-fallback-dispose.spec.js:57-75`.
  - Capture writes manifest/contact sheet: `tools/sim3-visual/pilot-capture.spec.js:7-10`, `tools/sim3-visual/pilot-capture.spec.js:32-35`.

### Data flow

1. Playwright fixture mounts Sim2 route, then clicks 3D mode.
2. Route adapter receives existing Sim2 physics state; transforms state into Three.js meshes, DOM labels, and `window.__SIM3_DEBUG__[route].visualMetrics`.
3. RED tests read DOM label boxes plus `visualMetrics`; capture reads same metrics and emits screenshots/contact sheet.
4. No physics output changes; only camera, mesh scale/position, label targets, opacity, and debug metrics change.

## RED tests

Own `tests/sim3-pilot-fallback-dispose.spec.js` first. Add failing route-specific semantic checks on top of existing generic metrics at `tests/sim3-pilot-fallback-dispose.spec.js:57-75`.

| Route | Add metric/check | RED threshold |
|---|---|---|
| `ch1-1-5` | `resultantDecorativeRatio` or stricter `resultantDominanceRatio`; `resultantCueRole` | `1.05 <= resultantDominanceRatio <= 1.25`; cue role equals `functional-resultant-not-decoration`; keep existing `visibleLabelCount <= 3` from `tests/sim3-pilot-fallback-dispose.spec.js:505-510` |
| `ch3-6-2` | `ghostLiveSeparationPx`, `ghostStateCue`, `ghostOpacityBand` | separation `>= 48`; cue equals `ghost-before-after-live-current`; opacity `0.16..0.28` or explicit pass band; extend current ghost checks at `tests/sim3-pilot-fallback-dispose.spec.js:196-198` and phase checks at `tests/sim3-pilot-fallback-dispose.spec.js:207-212` |
| `ch2-3-2` | `beltLabelSemanticTarget`, `beltLabelSpanCoverage`, `labelFaceCoverageMax` | target equals `belt-span`; span coverage `>= 0.55`; face coverage `<= 0.05`; extend current label-face check at `tests/sim3-pilot-fallback-dispose.spec.js:233-239` |

Also update `tools/sim3-visual/pilot-capture.spec.js` target flags to surface these route-specific metrics in the new contact sheet; current target flags are generic at `tools/sim3-visual/pilot-capture.spec.js:94-97`.

RED success: `npm run test:sim3:pilot` fails before GREEN because new semantic metrics are absent or out of threshold.

## GREEN implementation by route

### `ch1-1-5`: make `F -> R + Mo` clearer without decorative `R`

- Own only `js/sim3/sims/ch1-1-5-3d.js`.
- Keep physics inputs/state unchanged: `forces` and `resultant` flow at `js/sim3/sims/ch1-1-5-3d.js:66-78`.
- Reduce `R` visual dominance: tune `resultantScale` at `js/sim3/sims/ch1-1-5-3d.js:15` and label/arrow placement at `js/sim3/sims/ch1-1-5-3d.js:53-55`; avoid oversized decorative orange arrow.
- Strengthen story: two force arrows visually converge toward one functional `R`, purple `Mo` stays near origin torque ring.
- Update debug metrics only in existing block `js/sim3/sims/ch1-1-5-3d.js:100-122`.

Done: route passes new bounded `resultantDominanceRatio`, safe crop, overlap, and label-count checks.

### `ch3-6-2`: clearer ghost/live semantics

- Own only `js/sim3/sims/ch3-6-2-3d.js`.
- Keep collision state unchanged: `state.collided`, `p1/p2`, `v1/v2` behavior at `js/sim3/sims/ch3-6-2-3d.js:91-113`.
- Make ghosts parse faster: separate before/after ghost positions from live bodies, adjust ghost material opacity currently at `js/sim3/sims/ch3-6-2-3d.js:37-42`, and preserve labels `Trước`, `Va chạm`, `Sau` at `js/sim3/sims/ch3-6-2-3d.js:62-64`.
- Update debug metrics in existing block `js/sim3/sims/ch3-6-2-3d.js:150-164`.

Done: route passes `ghostLiveSeparationPx`, `ghostStateCue`, opacity band, phase lane, safe crop, and overlap checks.

### `ch2-3-2`: attach `Đai` label to belt span

- Own only `js/sim3/sims/ch2-3-2-3d.js`.
- Keep transmission math unchanged: `r1/r2`, `gearPhi*`, `beltPhi2` flow at `js/sim3/sims/ch2-3-2-3d.js:135-158`.
- Move `beltLabelTarget` from generic upper midpoint to actual belt span midpoint between `beltTop`/`beltBottom`; current target is set at `js/sim3/sims/ch2-3-2-3d.js:142-143` and label added at `js/sim3/sims/ch2-3-2-3d.js:100-101`.
- Ensure `Đai` does not overlap gear/pulley face; preserve mechanism readability.
- Update debug metrics in existing block `js/sim3/sims/ch2-3-2-3d.js:173-195`.

Done: route passes `beltLabelSemanticTarget === 'belt-span'`, span coverage, face coverage, safe crop, and overlap checks.

## Capture/validators

Capture path:

```powershell
$env:SIM3_VISUAL_OUT_DIR='plans/260606-sim3-third-visual-polish-tdd/visuals/final'; npm run test:sim3:visual:capture
```

Expected generated artifacts:

- `plans/260606-sim3-third-visual-polish-tdd/visuals/final/ch1-1-5-sim3.png`
- `plans/260606-sim3-third-visual-polish-tdd/visuals/final/ch2-3-2-sim3.png`
- `plans/260606-sim3-third-visual-polish-tdd/visuals/final/ch3-6-2-sim3.png`
- `plans/260606-sim3-third-visual-polish-tdd/visuals/final/capture-manifest.json`
- `plans/260606-sim3-third-visual-polish-tdd/visuals/final/contact-sheet.html`

Run validators, in order:

1. `npm run test:sim3:pilot`
2. `$env:SIM3_VISUAL_OUT_DIR='plans/260606-sim3-third-visual-polish-tdd/visuals/final'; npm run test:sim3:visual:capture`
3. `npm run test:sim:visual:unit`
4. `npm run test:sim:physics`
5. `npm run test:sim:mount`

No build: repo is static HTML/CSS/JS; README says QA scripts only, no runtime bundler.

## Review gates

- New tests fail before GREEN and pass after.
- New contact sheet exists and target rows show route-specific flags as `ok`.
- Visual audit confirms:
  - `ch1`: `R` useful, not decorative/oversized; `F -> R + Mo` readable.
  - `ch3`: ghosts are distinguishable from live state within 3 seconds.
  - `ch2`: `Đai` label points to belt span, not pulley/gear face.
- Run code review after validators; ship only if no medium-or-higher findings. If reviewer flags medium findings, fix and rerun affected validator(s).

## Risks/rollback

| Risk | Likelihood x impact | Mitigation | Rollback |
|---|---:|---|---|
| Subjective polish overfit to numeric metrics | Medium x Medium | Pair route-specific metrics with contact-sheet human audit | Revert test threshold only, keep safe objective metrics |
| `ch1` too weak after shrinking `R` | Medium x Medium | Bound dominance ratio, not just max size | Revert `js/sim3/sims/ch1-1-5-3d.js` only |
| `ch3` ghosts become cluttered | Medium x Medium | Check overlap, separation, opacity band together | Revert `js/sim3/sims/ch3-6-2-3d.js` only |
| `ch2` label semantic fix causes crop | Low x Medium | Keep existing safe crop checks and `projectedMarginPx` | Revert `js/sim3/sims/ch2-3-2-3d.js` only |
| Sim3 core change leaks across routes | Low x High | Avoid core; use only if tests prove route-local impossible | Revert `js/sim3/core/three-shell.js` and rerun all Sim3 pilot/capture |

File ownership: RED/capture files are sequential; GREEN route files are parallel-safe because each route owns a distinct adapter. No migrations; Sim2 remains default and Sim3 remains optional fallback path.

## Unresolved questions

- None.
