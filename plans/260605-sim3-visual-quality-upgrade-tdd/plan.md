---
title: "Sim3 visual-quality upgrade TDD plan"
description: "Upgrade contact-sheet audit and polish 3 Sim3 target routes without physics changes."
status: completed
priority: P2
effort: 6h
branch: master
tags: [sim3, visual-qa, tdd, playwright]
created: 2026-06-05
---

# Sim3 visual-quality upgrade TDD plan

## Scope / acceptance

- Output: upgraded visual contact-sheet audit + polish `ch2-3-2`, `ch3-6-2`, `ch1-1-5`.
- Acceptance: 0 visible Sim3 label overlaps, safe crop, new screenshots visibly better.
- Boundary: no physics formula/state changes. Keep `window.SIM_MAP[id](container) -> { dispose }`.
- Primary touch files: target adapters only; shared core/test/tool support only if required.

## Verified code map

- Static, no runtime bundler; QA scripts in `package.json:10-18`.
- Sim3 shell creates WebGL renderer/label layer at `js/sim3/core/three-shell.js:29`, label API at `js/sim3/core/three-shell.js:112`, label projection/clamp at `js/sim3/core/three-shell.js:147` and edge clamp at `js/sim3/core/three-shell.js:163`.
- Shared visual metrics/offset helpers at `js/sim3/core/visual-kit.js:27`, `js/sim3/core/visual-kit.js:61`, `js/sim3/core/visual-kit.js:67`.
- Target 2D routes attach optional 3D:
  - `ch1-1-5`: register `js/sim2/sims/ch1/ch1-1-5.js:9`, attach `js/sim2/sims/ch1/ch1-1-5.js:70-73`, 3D debug `js/sim3/sims/ch1-1-5-3d.js:77`, global `js/sim3/sims/ch1-1-5-3d.js:95`.
  - `ch2-3-2`: register `js/sim2/sims/ch2/ch2-3-2.js:10`, attach `js/sim2/sims/ch2/ch2-3-2.js:111-114`, 3D debug `js/sim3/sims/ch2-3-2-3d.js:156`, global `js/sim3/sims/ch2-3-2-3d.js:173`.
  - `ch3-6-2`: register `js/sim2/sims/ch3/ch3-6-2.js:11`, attach `js/sim2/sims/ch3/ch3-6-2.js:128-131`, 3D debug `js/sim3/sims/ch3-6-2-3d.js:119`, global `js/sim3/sims/ch3-6-2-3d.js:153`.
- Existing RED/GREEN base: label overlap helper `tests/sim3-pilot-fallback-dispose.spec.js:13`; target assertions at `tests/sim3-pilot-fallback-dispose.spec.js:124-156`, `159-194`, `423-457`; fallback at `526-538`.
- Existing Sim3 capture writes fixed output to `tools/sim3-visual/pilot-capture.spec.js:6`, includes targets at `:9`, `:13`, `:18`, captures `#host` at `:53`.
- Existing Sim2 contact-sheet renderer at `tools/sim2-visual/contact-sheet.js:56`; Sim2 builder reads manifest/triage and writes HTML at `tools/sim2-visual/build-contact-sheet.js:17-19`, `:57-60`.

## Data flow

1. User opens route fixture/page -> Sim2 factory from `SIM_MAP` mounts 2D shell -> optional `Sim3Mode.attach` adds toggle.
2. 3D click -> target adapter `create({host, referenceEl, onFallback})` -> `Sim3Shell.create` builds scene/camera/renderer/label layer -> adapter `setState(state)` maps existing Sim2 state to visual-only meshes/labels/debug.
3. Visual QA -> Playwright mounts route, toggles 3D, steps deterministic controls, reads DOM boxes/debug metrics, screenshots `#host`.
4. Contact sheet -> capture manifest records old/new image paths + route metadata + audit flags -> HTML renderer outputs offline audit sheet for human comparison.

## Dependency graph / file ownership

1. Phase 1 tests/tools first. Own: `tests/sim3-pilot-fallback-dispose.spec.js`, `tools/sim3-visual/pilot-capture.spec.js`, optional `tools/sim3-visual/contact-sheet*.js`.
2. Phase 2 shared core only if tests expose generic issue. Own: `js/sim3/core/three-shell.js`, `js/sim3/core/visual-kit.js`.
3. Phase 3 route polish. Own in parallel-safe lanes:
   - Lane A: `js/sim3/sims/ch2-3-2-3d.js`
   - Lane B: `js/sim3/sims/ch3-6-2-3d.js`
   - Lane C: `js/sim3/sims/ch1-1-5-3d.js`
4. Phase 4 validators/captures. Own: generated visuals only under new plan dir.

## Phase 1 — RED tests and audit tooling (1.5h)

### RED tests to write

- Add `expectSim3SafeCrop(page, route, minMarginPx)` in `tests/sim3-pilot-fallback-dispose.spec.js` near existing overlap helper at line 13.
  - Compute visible `.sim3-label` boxes + `canvas.sim3-canvas` box.
  - Assert labels inside host/canvas by >= 8px where possible; assert no mesh debug crop flags below threshold via `window.__SIM3_DEBUG__[route].visualMetrics.minSafeMarginPx >= 24`.
- Strengthen target tests:
  - `ch2-3-2`: assert `minSafeMarginPx >= 24`, `labelOverlapTarget === 0`, belt/gear hierarchy still present; existing route test starts at line 159.
  - `ch3-6-2`: assert after-impact safe crop at `phaseCue === 'after'`, `minSafeMarginPx >= 24`, labels not clustered; existing route test starts at line 124.
  - `ch1-1-5`: assert resultant/moment labels separated and all force labels in crop; existing route test starts at line 423.
- Add a targeted visual-audit test or extend capture spec to emit `capture-manifest.json` for only 3 target routes, with old/new labels and audit flags. Do not baseline pixel-perfect.

### Implementation steps

- Make Sim3 capture output configurable with env/default path instead of hard-coded `OUT_DIR` at `tools/sim3-visual/pilot-capture.spec.js:6`; default to new plan visuals dir.
- Add target-only contact sheet builder reusing `renderContactSheet` from `tools/sim2-visual/contact-sheet.js:56`; include flags: `overlap`, `crop`, `before/after`, `human-review`.

### Success criteria

- New/changed tests fail before adapter/core polish due missing stricter metrics and/or crop assertions.
- Capture produces 3-route manifest + HTML audit with screenshots.

### Risks / rollback

- Risk: brittle DOM-box crop checks on different GPU/font. Likelihood M, impact M. Mitigate with route debug metrics + >=8px DOM tolerance, not pixel baseline.
- Rollback: revert only test/tool files; no runtime behavior affected.

## Phase 2 — Shared label/crop support if needed (1h)

### Implementation steps

- Prefer KISS: do not introduce layout engine unless RED tests show generic label/crop issue.
- If needed, extend `Sim3Shell.addLabel` opts with `anchor`, `clampPadding`, or per-label `transform`; keep default behavior unchanged.
- If needed, extend `Sim3VisualKit.visualMetrics()` defaults from current `{labelOverlapTarget:0,minSafeMarginPx:24}` at `js/sim3/core/visual-kit.js:67`.

### Tests

- Existing kit availability test checks helper presence at `tests/sim3-pilot-fallback-dispose.spec.js:72`.
- Add unit-ish Playwright assertion that default label behavior remains for non-target routes already covered in same spec.

### Success criteria

- No regressions in all existing Sim3 route tests.
- Backward compatibility: adapters that pass old label opts still render/dispose.

### Risks / rollback

- Risk: changing global label clamp masks labels at edges. Likelihood M, impact H. Mitigate with defaults unchanged + opt-in per target label.
- Rollback: revert core changes; keep route-specific offsets.

## Phase 3 — Polish target adapters, no physics changes (2h)

### `ch2-3-2`

- Adjust camera/object scale/positions only in `js/sim3/sims/ch2-3-2-3d.js`.
- Goals: show gear/pulley/belt with better depth, belt not cropped, labels not over wheels.
- Update debug `visualMetrics` at line 158 with concrete metrics: `minSafeMarginPx`, `labelOverlapTarget`, `gearBeltSeparation`, `cameraFit`.
- Do not touch state formulas (`r1`, `r2`, `gearPhi*`, `gearOmega2`, `beltOmega2`).

### `ch3-6-2`

- Adjust camera, rail length/scale, ghost opacity/offset, label lanes in `js/sim3/sims/ch3-6-2-3d.js`.
- Goals: before/impact/after phases readable in one crop, trail visible but subdued, no label pileup after 112 steps.
- Update debug `visualMetrics` at line 131 with `minSafeMarginPx`, `labelOverlapTarget`, `phaseLaneSeparationPx`.
- Do not touch collision state, velocities, `trail` semantics except visual-only retention/opacity if needed.

### `ch1-1-5`

- Adjust force/resultant/moment cue positions, camera, vector scale bounds in `js/sim3/sims/ch1-1-5-3d.js`.
- Goals: F1/F2/R/Mo labels all readable, resultant dominant, moment ring not clipped.
- Update debug `visualMetrics` at line 77 with `minSafeMarginPx`, `labelOverlapTarget`, `resultantClearancePx`.
- Do not touch `forces`, `resultant`, or `Mo` calculations from Sim2 state.

### Success criteria

- Target tests pass; existing physics assertions in route tests remain unchanged.
- Screenshot sheet shows clear visible improvement vs prior capture.

### Risks / rollback

- Risk: route-specific polish hurts teaching semantics. Likelihood M, impact M. Mitigate with unchanged debug physics assertions and side-by-side contact sheet.
- Rollback: revert one adapter independently; lanes do not share files.

## Phase 4 — Validators and audit artifacts (1.5h)

Run in order:

1. `npm run test:sim3:pilot`
2. `npm run test:sim3:visual:capture`
3. `npm run test:sim:visual:unit`
4. `npm run test:sim:physics`
5. `npm run test:sim:mount`

Manual/human acceptance:

- Open new Sim3 contact sheet.
- Confirm all 3 target rows have 0 overlap flags, safe crop flags, and visibly better new screenshots.
- Keep old screenshots only as audit inputs; do not overwrite approved baselines unless explicitly requested.

## Backwards compatibility / migration

- No data/schema migration. Static app remains file/offline compatible.
- Sim2 remains default; Sim3 remains optional. Fallback behavior from tests at `tests/sim3-pilot-fallback-dispose.spec.js:526-538` must still pass.
- Mount/dispose contract unchanged.

## Test matrix

| Area | Unit-ish | Integration | Visual/E2E |
|---|---|---|---|
| Label overlap | DOM-box helper | target Sim3 route tests | contact sheet flags |
| Safe crop | DOM/canvas bounds + debug metrics | target route after state changes | screenshots reviewed |
| Physics unchanged | existing debug formula assertions | `npm run test:sim:physics` | N/A |
| Fallback/dispose | existing Sim3 fallback tests | repeated toggles/dispose | N/A |
| Audit output | contact-sheet renderer/unit | capture manifest builder | generated HTML sheet |

## Measurable done

- `npm run test:sim3:pilot` passes.
- Target capture produces 3 new PNGs and contact sheet HTML.
- Contact sheet/audit flags show `overlap=0`, `safeCrop=true` for all 3 routes.
- Human review marks new screenshots visibly better.
- No files outside listed touchpoints changed except generated visuals/plan artifacts.

## Unresolved questions

- Exact destination for final visual artifacts should be chosen by implementer; recommended: `plans/260605-sim3-visual-quality-upgrade-tdd/visuals/`.
