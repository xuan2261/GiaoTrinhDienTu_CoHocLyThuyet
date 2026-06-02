---
title: "Sim2 pedagogical polish TDD pass"
description: "TDD-first plan to polish 3 Sim2 routes and add selective visual baselines without broad brittle coverage."
status: complete
priority: P2
effort: 5h
branch: master
tags: [sim2, tdd, visual-regression, offline]
created: 2026-06-02
---

# Overview

Goal: add narrow pedagogical polish to `ch2-4-4`, `ch3-6-2`, `ch1-6-3`, then add selective screenshot baselines for a few representative routes only. Keep `file://` offline, no runtime dependency, no bundler, no `js/sim2/physics/*` edits, and preserve `window.SIM_MAP[pageId] -> factory(container) -> { dispose }` contract from [README.md](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/README.md:60) and [js/sim2/registry.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/registry.js:2).

## Phase 1. Lock failing tests first

Status: complete

Files to modify:
- [tests/sim2-visual-motion-polish.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tests/sim2-visual-motion-polish.spec.js:200)
- [tests/sim2-ch2-mount.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tests/sim2-ch2-mount.spec.js:123)
- [tests/sim2-ch3-mount.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tests/sim2-ch3-mount.spec.js:96)
- [tests/sim2-ch1-mount.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tests/sim2-ch1-mount.spec.js:82)

Data flow:
- Input: mounted route DOM via chapter fixtures `tests/fixtures/sim2-ch{1,2,3}.html` referenced by existing Playwright tests.
- Transform: tests step sim deterministically through `.sim2-step`, query overlay labels, theory/observe text, semantic cue classes.
- Output: red tests proving desired pedagogy before implementation.

Test additions:
1. `ch2-4-4`: assert label density mitigation is externally observable, not pixel-opinion. Prefer checking one or both:
   - route exposes a dedicated semantic callout class for Coriolis label cluster, or
   - Coriolis / `v_rel` labels are moved to distinct anchors with minimum separation after several steps.
2. `ch3-6-2`: extend current pilot to require explicit before/after teaching cue beyond split trail alone.
   - Example assertions: an impact-state label/legend/observe line changes after collision, and reset clears it.
3. `ch1-6-3`: require explicit negative-area wording in theory/readout/legend.
   - Example assertions: readout includes signed removed area indicator like `-A_lỗ` or observe/formula text mentions subtraction.
4. Guard mount/dispose remains valid on each touched route.

Dependency graph:
- Blocks Phase 2.
- Must reuse existing test harness and fixture loading in [tests/sim2-visual-motion-polish.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tests/sim2-visual-motion-polish.spec.js:5).

Risks:
- High: tests overfit layout pixels and become brittle.
  - Mitigation: assert semantic hooks, text, class presence, and relative behavior; avoid absolute screenshot assertions here.
- Medium: extending mount tests duplicates checks already in polish spec.
  - Mitigation: keep route-specific pedagogy assertions in `sim2-visual-motion-polish.spec.js`; only add mount assertions if contract/regression gap remains.

Rollback:
- Revert only new failing assertions in test files; no production effect.

Success criteria:
- Complete. Focused tests failed RED on missing cues, then passed after route-local polish.

## Phase 2. Implement minimal route-local polish

Status: complete

Files to modify:
- [js/sim2/sims/ch2/ch2-4-4.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/sims/ch2/ch2-4-4.js:10)
- [js/sim2/sims/ch3/ch3-6-2.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/sims/ch3/ch3-6-2.js:11)
- [js/sim2/sims/ch1/ch1-6-3.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/sims/ch1/ch1-6-3.js:9)

Data flow:
- `ch2-4-4`: slider/playback state enters `draw()` via `params` + `t`; route computes `p`, `v_rel`, `a_cor`, then pushes positions into canvas trail and label positions into overlay via `overlay.moveLabel(...)` at [js/sim2/sims/ch2/ch2-4-4.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/sims/ch2/ch2-4-4.js:61). Polish should stay in label/callout/readout/panel wording, not physics math.
- `ch3-6-2`: playback advances positions and collision state in `frame()` at [js/sim2/sims/ch3/ch3-6-2.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/sims/ch3/ch3-6-2.js:95); route already splits trail and shows impact cue. Polish should add explicit before/after teaching state tied to `collided`, cleared by `reset()`.
- `ch1-6-3`: handle drag updates `hole` then `render2()` recomputes centroid via `P.centroidWithHole(...)` at [js/sim2/sims/ch1/ch1-6-3.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/sim2/sims/ch1/ch1-6-3.js:37); polish should expose removed area as signed contribution in readout/legend/observe, no statics engine change.

Implementation guidance:
1. `ch2-4-4`
   - Add route-local label offset or callout rule when vector endpoints crowd together.
   - Keep `panel.setReadout(...)` and `shell.setTheory(...)` as main teaching surface; do not add shared-core complexity unless reused elsewhere.
2. `ch3-6-2`
   - Introduce one explicit state cue keyed off `collided`: `Trước va chạm` / `Sau va chạm`, or equivalent observe/readout row.
   - Ensure reset removes cue and impact artifact together.
3. `ch1-6-3`
   - Add signed removed-area readout and/or formula wording that clearly communicates subtraction.
   - Keep drag handle + mount/dispose unchanged.

Backwards compatibility:
- No route id changes.
- No changes under `js/sim2/physics/*`.
- Preserve shell/panel/controls APIs used by other routes.

Risks:
- Medium: route-local semantic classes might tempt shared style changes.
  - Mitigation: prefer existing overlay/panel primitives; add minimal route-local class names only if tests need stable selectors.
- Medium: text changes can break strict text-based tests elsewhere.
  - Mitigation: grep existing tests for exact strings before editing; scope assertions to new phrases only.

Rollback:
- Revert per-route file independently; no schema or shared runtime migration needed.

Success criteria:
- Complete. `npm run test:sim:mount` passed with new assertions.
- Complete. No changes needed in `js/sim2/physics/*`.

## Phase 3. Add selective screenshot baselines only

Status: complete

Files to modify:
- [tools/sim2-visual/selective-baseline.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tools/sim2-visual/selective-baseline.spec.js:1)
- [tools/sim2-visual/playwright.baseline.config.cjs](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tools/sim2-visual/playwright.baseline.config.cjs:1)
- [package.json](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/package.json:12)
- Added a new focused baseline spec; broad contact-sheet capture remains separate.

Data flow:
- Input: representative route list, existing chapter fixtures, current DOM render under `file://`.
- Transform: Playwright mounts only selected routes, normalizes host size/theme like current capture spec at [tools/sim2-visual/capture-sims.spec.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/tools/sim2-visual/capture-sims.spec.js:61), then captures `#host` screenshots.
- Output: a small baseline set stored under Playwright snapshot convention or a dedicated visual folder, gated by a dev-only script.

Plan:
1. Keep existing `capture-sims.spec.js` for broad contact-sheet generation unchanged or nearly unchanged; it is 25-route artifact capture, not a baseline gate.
2. Add a separate focused visual regression spec for 3-6 routes max, likely including:
   - `ch1-6-3` for negative-area pedagogy
   - `ch2-4-4` for label-density clarity
   - `ch3-6-2` for before/after impact cue
   - optionally 1-2 stable control routes from other chapters for guard diversity
3. Wire a dev-only npm script such as `test:sim:visual:baseline` without adding it to `test:sim:release` at [package.json](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/package.json:14).

Representative-route selection rule:
- One static geometry route.
- One dense vector route.
- One dynamic collision route.
- Optional one non-polished control route for false-positive guard.

Risks:
- High: `toHaveScreenshot()` on all 25 routes would churn and become brittle.
  - Mitigation: separate script, 3-6 routes only, fixed host size/theme, deterministic step counts, no release gating.
- Medium: offline `file://` rendering may vary if fonts/CSS settle differently.
  - Mitigation: reuse current visual harness, fixed `workers:1`, deterministic stepping, capture whole `#host`.

Rollback:
- Remove focused visual-baseline spec and npm script; broad capture workflow remains intact.

Success criteria:
- Complete. `npm run test:sim:visual:baseline` runs independently from release.
- Complete. Baseline covers 5 representative routes only, not full manifest.

## Verification matrix

Unit / pure:
- Existing `tests/sim2-visual-capture-plan.test.js` remains green if visual tooling stays compatible.

Integration / Playwright:
- `tests/sim2-visual-motion-polish.spec.js`
- `tests/sim2-ch1-mount.spec.js`
- `tests/sim2-ch2-mount.spec.js`
- `tests/sim2-ch3-mount.spec.js`

Dev-only visual:
- Existing `npm run test:sim:visual:capture`
- New focused baseline command, not part of release gate

Release safety:
- `npm run test:sim:mount`
- Avoid forcing `npm run test:sim:release` to depend on screenshot baselines.

## Files likely untouched

- `js/sim2/physics/*` by requirement.
- `js/loader.js` unless a contract regression is discovered; current loader mount path is already correct at [js/loader.js](/C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/js/loader.js:396).

## Open questions

- Resolved: baseline storage uses Playwright snapshot convention under `tools/sim2-visual/selective-baseline.spec.js-snapshots/`.
- Resolved: route count is 5 representative routes.
