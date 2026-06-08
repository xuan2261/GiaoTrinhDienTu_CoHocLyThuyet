---
title: "Sim3 strong visual redesign second-pass TDD"
description: "TDD plan for route-local Sim3 redesign on ch1-1-5, ch3-6-2, and ch2-3-2 with clearer physical scenes."
status: completed
priority: P2
effort: 5h
branch: master
tags: [sim3, tdd, visual-redesign, playwright]
created: 2026-06-05
---

# Sim3 strong visual redesign second-pass TDD

## Scope / acceptance

- Target routes only: `ch1-1-5`, `ch3-6-2`, `ch2-3-2`.
- User goal: **strong redesign**. Done means large clear scene, fewer labels, immediate physical meaning.
- Hard boundary: **no physics changes**, **no new dependency**, prefer route-local adapter changes.
- Do not touch Sim3 core unless RED tests prove route-local layout cannot pass.
- Output artifacts: RED tests/metrics first, route redesign, captures/contact sheet, validators.

## Verified code map

- QA scripts exist: `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, `npm run test:sim:visual:unit`, `npm run test:sim:physics`, `npm run test:sim:mount` in `package.json:15-19`.
- Existing Sim3 pilot tests already include label overlap helper at `tests/sim3-pilot-fallback-dispose.spec.js:13`, safe-crop helper at `tests/sim3-pilot-fallback-dispose.spec.js:33`, and target route assertions at `tests/sim3-pilot-fallback-dispose.spec.js:148`, `tests/sim3-pilot-fallback-dispose.spec.js:184`.
- Existing capture tool is env-configurable via `SIM3_VISUAL_OUT_DIR` at `tools/sim3-visual/pilot-capture.spec.js:7`, captures target routes declared at `tools/sim3-visual/pilot-capture.spec.js:10`, `tools/sim3-visual/pilot-capture.spec.js:13`, `tools/sim3-visual/pilot-capture.spec.js:17`, `tools/sim3-visual/pilot-capture.spec.js:22`, and writes manifest/contact sheet at `tools/sim3-visual/pilot-capture.spec.js:34-35`.
- `ch1-1-5` route-local scene creates force/resultant/moment labels at `js/sim3/sims/ch1-1-5-3d.js:48-51`; physics inputs remain `forces`/`resultant` at `js/sim3/sims/ch1-1-5-3d.js:62-73`; visual metrics written at `js/sim3/sims/ch1-1-5-3d.js:88-101`.
- `ch2-3-2` route-local scene creates gear/belt labels at `js/sim3/sims/ch2-3-2-3d.js:96-98`; physics state values derive from `state.r1`, `state.r2`, `gearPhi*`, `beltPhi2` at `js/sim3/sims/ch2-3-2-3d.js:130-154`; visual metrics written at `js/sim3/sims/ch2-3-2-3d.js:165-180`.
- `ch3-6-2` route-local scene creates phase/velocity labels at `js/sim3/sims/ch3-6-2-3d.js:60-64`; collision state remains `state.collided`, `state.p1/p2`, `state.v1/v2` at `js/sim3/sims/ch3-6-2-3d.js:87-117`; visual metrics written at `js/sim3/sims/ch3-6-2-3d.js:139-153`.
- Prior plan/artifacts are under `plans/260605-sim3-visual-quality-upgrade-tdd/plan.md` and final captures under `plans/260605-sim3-visual-quality-upgrade-tdd/visuals/final/`.

## Data flow

1. Sim2 route fixture mounts `window.SIM_MAP[id](host)` -> Sim2 remains default.
2. User/test clicks 3D mode -> route adapter `create(opts)` builds Three scene through existing Sim3 shell.
3. Adapter receives existing Sim2 state -> transforms it into **visual-only** camera/object/label placement -> writes `window.__SIM3_DEBUG__[route].visualMetrics`.
4. Playwright RED tests read DOM label boxes + debug metrics -> fail if scene is small/cluttered/ambiguous even when overlap is 0.
5. Capture tool screenshots `#host` -> manifest/contact sheet records audit flags for human review.

## Dependency graph / ownership

1. Phase 1 owns only `tests/sim3-pilot-fallback-dispose.spec.js` and optionally `tools/sim3-visual/pilot-capture.spec.js`.
2. Phase 2 owns route adapters only, parallel-safe:
   - Lane A: `js/sim3/sims/ch1-1-5-3d.js`
   - Lane B: `js/sim3/sims/ch3-6-2-3d.js`
   - Lane C: `js/sim3/sims/ch2-3-2-3d.js`
3. Phase 3 owns generated visuals only under this plan folder.
4. Phase 4 owns no source files; validators only.

## Phase 1 — RED tests/metrics first (1.25h)

Add tests that fail on the **latest critique**, not just label overlap:

| Metric | Why | RED threshold |
|---|---|---|
| `primarySceneFillRatio` | scene must be large/clear | `>= 0.58` target routes |
| `visibleLabelCount` | fewer labels | `ch1 <= 3`, `ch2 <= 3`, `ch3 <= 4` |
| `physicalMeaningCue` | immediate meaning | route-specific string, not boolean-only |
| `primaryObjectDominanceRatio` | main object must dominate scaffolding | `>= 1.4` |
| `projectedMarginPx` / `minSafeMarginPx` | no crop | `>= 24` |
| `labelOverlapTarget` | no clutter | `0` |

Implementation:

- Extend existing safe-crop/overlap assertions near `tests/sim3-pilot-fallback-dispose.spec.js:13` and `tests/sim3-pilot-fallback-dispose.spec.js:33`.
- Add `expectSim3StrongRedesign(page, route, expected)` helper that reads `window.__SIM3_DEBUG__[route].visualMetrics`.
- Strengthen target tests:
  - `ch1-1-5`: assert `physicalMeaningCue === 'force-system-resultant-moment'`, `visibleLabelCount <= 3`, `resultantDominanceRatio >= 1.35`.
  - `ch3-6-2`: after 112 steps, assert `physicalMeaningCue === 'before-impact-after-lane'`, `visibleLabelCount <= 4`, `phaseLaneSeparationPx >= 36`.
  - `ch2-3-2`: assert `physicalMeaningCue === 'gear-contact-belt-transfer'`, `visibleLabelCount <= 3`, `gearBeltSeparationPx >= 44`.
- Capture spec already has env output and target marking; only change it if needed to add RED flags for the new metrics.

Success: `npm run test:sim3:pilot` fails before redesign because new readability metrics are missing/too weak.

Risk: subjective quality becomes fake numeric. Mitigation: metrics gate only minimums; final contact sheet is still required.
Rollback: revert test-only changes; runtime untouched.

## Phase 2 — Route-local strong redesign (2.25h)

### `ch1-1-5`: force system as one clear resultant story

- Keep formulas/state untouched: preserve `forces`, `resultant`, `Mo` flow at `js/sim3/sims/ch1-1-5-3d.js:62-73`.
- Reduce labels from `F1`, `F2`, `R`, `Mo` to max 3 visible: e.g. `F`, `R`, `Mo` or hide point labels unless selected.
- Enlarge geometry: bigger force arrows/resultant, wider camera safe crop, moment ring visibly attached to origin.
- Make physical meaning immediate: base points + two red forces combine into dominant orange resultant + purple moment ring.
- Update visual metrics only in debug block at `js/sim3/sims/ch1-1-5-3d.js:88-101`.

Done: RED helper passes; screenshot reads as “forces reduce to R + Mo” without reading all labels.

### `ch3-6-2`: collision as before/impact/after lane

- Keep collision physics/state untouched at `js/sim3/sims/ch3-6-2-3d.js:87-117`.
- Make one large horizontal lane: before ghost left, impact cue center, after ghost/live bodies right.
- Reduce label pile: keep `Trước`, `Va chạm`, `Sau`; hide or replace `v1/v2` with clear arrows/colors if labels exceed count.
- Increase phase lane separation and object scale while keeping safe crop.
- Update visual metrics only in debug block at `js/sim3/sims/ch3-6-2-3d.js:139-153`.

Done: after 112 steps screenshot reads as “before -> impact -> after” immediately.

### `ch2-3-2`: gear contact + belt transfer as one mechanism

- Keep kinematics untouched at `js/sim3/sims/ch2-3-2-3d.js:130-154`.
- Make mechanism large: gear pair and belt pair occupy most scene, supports muted.
- Reduce labels to `Bánh răng`, `Đai`, optional `ω`; remove per-wheel duplicate labels if cluttered.
- Emphasize physical meaning: contact gears counter-rotate, belt pulleys co-rotate; visible belt run not cropped.
- Update visual metrics only in debug block at `js/sim3/sims/ch2-3-2-3d.js:165-180`.

Done: screenshot reads as “gear reverses, belt preserves direction” without dense annotations.

Risk: route-specific numbers may overfit 960px capture. Mitigation: DOM/canvas safe-crop tolerance plus existing fixture dimensions; no pixel baseline.
Rollback: each adapter reverts independently; no shared file coupling.

## Phase 3 — Captures and human audit (0.75h)

- Run target capture to a new folder, do not overwrite prior approved artifacts:
  - PowerShell: `$env:SIM3_VISUAL_OUT_DIR='plans/260605-sim3-strong-redesign-second-pass-tdd/visuals/final'; npm run test:sim3:visual:capture`
- Inspect `contact-sheet.html` for only target routes first.
- Acceptance flags:
  - `overlap=0`
  - `safeCrop=true margin>=24px`
  - new strong metrics present and pass
  - human-readable scene: large, few labels, physical meaning clear

Risk: capture includes non-target reference routes. Mitigation: ignore non-target rows for acceptance unless source changes touched them.
Rollback: delete/regenerate visuals only after checking git status; never delete untracked user files casually.

## Phase 4 — Validators (0.75h)

Run in order:

1. `npm run test:sim3:pilot`
2. `$env:SIM3_VISUAL_OUT_DIR='plans/260605-sim3-strong-redesign-second-pass-tdd/visuals/final'; npm run test:sim3:visual:capture`
3. `npm run test:sim:visual:unit`
4. `npm run test:sim:physics`
5. `npm run test:sim:mount`

Do not run a build; repo is static and README says no runtime bundler/build step.

## Backwards compatibility / migration

- No data migration.
- No dependency migration.
- Sim2 remains default; Sim3 remains optional.
- Existing mount contract and fallback/dispose behavior must continue passing through `tests/sim3-pilot-fallback-dispose.spec.js`.
- Existing physics assertions must continue passing; all redesign values are visual-only metrics/camera/mesh/label choices.

## Test matrix

| Area | RED | GREEN verification |
|---|---|---|
| Large clear scene | `primarySceneFillRatio >= 0.58` | pilot test + screenshot |
| Fewer labels | `visibleLabelCount` thresholds | DOM labels + contact sheet |
| Physical meaning | `physicalMeaningCue` exact route strings | pilot test + human audit |
| No crop | safe-crop helper + debug margin | pilot test + capture flags |
| Physics unchanged | existing debug physics checks | `npm run test:sim:physics` |
| Lifecycle | existing dispose/fallback checks | `npm run test:sim3:pilot` |

## Measurable done

- RED tests fail before route redesign and pass after.
- Only target route adapters changed for GREEN unless core necessity is proven.
- Final contact sheet shows all 3 targets large, uncluttered, and semantically clear.
- All validators in Phase 4 pass.

## Unresolved questions

- None.
