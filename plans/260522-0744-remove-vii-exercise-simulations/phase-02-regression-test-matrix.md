---
title: "Phase 02 Regression Test Matrix"
description: "Cập nhật taxonomy registered-vs-mountable routes và nối regression VII no-sim vào test gates."
status: completed
priority: P1
effort: 1.5h
branch: master
tags: [phase, tests, playwright, regression, vii-exercise]
created: 2026-05-22
---

# Phase 02 Regression Test Matrix

## Context links

- `tests/exercise-section-no-simulation.spec.js:7`
- `tests/simulation-test-utils.js:22`, `tests/simulation-test-utils.js:51`, `tests/simulation-test-utils.js:77`
- `tests/mass-conversion-audit.spec.js:10`
- `tests/simulation-browser.spec.js:310`, `tests/simulation-browser.spec.js:366`, `tests/simulation-browser.spec.js:474`
- `tests/simulation-visual-quality.spec.js:43`, `tests/simulation-visual-quality.spec.js:48`
- `tests/sim-canvas-evolution-fixtures.js:17`, `tests/sim-canvas-evolution-fixtures.js:48`
- `tests/phase-09-static-routes-no-play-button.spec.js:19`
- `tests/simulation-interaction-engine.spec.js:131`, `tests/simulation-interaction-engine.spec.js:208`, `tests/simulation-interaction-engine.spec.js:435`
- `package.json:15`, `package.json:26`, `package.json:31`

## Overview

- Priority: P1
- Status: completed
- Mục tiêu: browser/test gates phản ánh đúng fact mới: manifest vẫn 58 registered routes, nhưng chỉ còn 52 mountable simulation routes.

## Key insights

- Browser helpers hiện discover routes từ manifest rồi coi tất cả đều mountable: `tests/simulation-test-utils.js:22`, `tests/simulation-test-utils.js:51`, `tests/simulation-test-utils.js:77`.
- Repo đã có regression spec đúng intent nhưng chưa được nối vào npm browser gates: `tests/exercise-section-no-simulation.spec.js:20`, `package.json:15`.
- Một số suite browser đang hard-code VII sim routes; nếu không chỉnh taxonomy sẽ fail ngay sau Phase 01: `tests/sim-canvas-evolution-fixtures.js:24`, `tests/phase-09-static-routes-no-play-button.spec.js:19`, `tests/simulation-interaction-engine.spec.js:435`.

## Requirements

- Functional:
  1. Có shared source of truth cho `registered routes` vs `mountable routes`.
  2. `exercise-section-no-simulation.spec.js` chạy trong gate chính.
  3. Browser suites mount-only phải bỏ VII routes ra khỏi loops.
- Non-functional:
  1. Giữ manifest assertions 58 registered routes.
  2. Giữ unit coverage cho dormant VII sim code nếu đang còn giá trị (`tests/phase-09-12-tdd.test.js:45`, `tests/phase-09-12-tdd.test.js:135`).

## Architecture

- Data in:
  discovered manifest routes từ `js/sim-route-manifest.js` qua `tests/simulation-test-utils.js:22`.
- Transform:
  helper export `REGISTERED_SIM_ROUTES` (58) + `MOUNTABLE_SIM_ROUTES` (52) + `NO_SIM_VII_ROUTES` (15 page routes).
- Data out:
  mount/browser specs iterate `MOUNTABLE_SIM_ROUTES`; manifest/contract assertions vẫn check `REGISTERED_SIM_ROUTES`.

## Related code files

- Modify:
  - `tests/simulation-test-utils.js`
  - `tests/exercise-section-no-simulation.spec.js`
  - `tests/mass-conversion-audit.spec.js`
  - `tests/simulation-browser.spec.js`
  - `tests/simulation-visual-quality.spec.js`
  - `tests/sim-canvas-evolution-fixtures.js`
  - `tests/sim-canvas-evolution.spec.js`
  - `tests/phase-09-static-routes-no-play-button.spec.js`
  - `tests/simulation-interaction-engine.spec.js`
  - `package.json`
- Optional if review suite must stay green:
  - `tests/sim-review-2026-05-19/readout-unit-audit.spec.js`
  - `tests/sim-review-2026-05-19-fixtures.js`

## Implementation steps

1. Centralize route taxonomy in `tests/simulation-test-utils.js`; prefer keeping existing `ALL_ROUTES` alias for mountable routes to minimize churn.
2. Update `simulation-browser.spec.js` và `simulation-visual-quality.spec.js` để assert 58 registered routes separately, nhưng mount loops chỉ dùng 52 mountable routes.
3. Remove 6 VII mount routes khỏi `sim-canvas-evolution-fixtures.js`; total expected đổi từ 58 xuống 52 cho canvas-evolution matrix.
4. Remove `ch3-7-1` / `ch2-7-2` khỏi static no-play browser list; drop or retarget `ch3-7-2` browser control-audit case vì route này thành content-only UI. Nếu cần behavior coverage, rely on existing node tests.
5. Wire `playwright test tests/exercise-section-no-simulation.spec.js` vào `package.json` gate, ideally inside `test:sim:browser`.

## Todo list

- [x] Export registered vs mountable taxonomy.
- [x] Make no-sim VII spec part of browser gate.
- [x] Re-baseline canvas-evolution route totals to 52 mountable routes.
- [x] Remove hard-coded VII browser mounts.
- [x] Keep unit-only VII behavior checks intact.

## Success criteria

- `test:sim:browser:route-mount` green cho 52 mountable routes.
- `exercise-section-no-simulation.spec.js` green cho đủ 15 route VII.
- `simulation-browser.spec.js` vẫn xác nhận 58 registered manifest routes.

## Risk assessment

- High: helper taxonomy sai làm test bỏ sót regression ngoài VII.
  Mitigation: explicit count asserts cho cả 58 registered và 52 mountable; dedicated VII no-sim spec.
- Medium: quên update một browser suite dùng `ALL_ROUTES`.
  Mitigation: grep toàn bộ callers trước khi sửa; hiện đã thấy ít nhất `mass-conversion`, `simulation-browser`, `simulation-visual-quality`, `simulation-interaction-engine`.
- Medium: review/dev-only suites vẫn đỏ.
  Mitigation: decide upfront whether optional suites thuộc acceptance hay follow-up.

## Backwards compatibility

- Manifest/scene/behavior contracts không đổi; Python/Node smoke contract vẫn có thể giữ coverage 58 registered routes.
- Chỉ browser mount matrix đổi sang 52 mountable routes.

## Rollback plan

- Revert route taxonomy split.
- Revert added browser spec in `package.json`.
- Restore route totals/buckets về 58 nếu cần trả VII về mountable state.

## Security considerations

- Test-only changes; không thêm quyền/network.

## Test matrix

- Unit:
  - `npm run test:sim:unit`
- Focused browser:
  - `playwright test tests/exercise-section-no-simulation.spec.js`
  - `npm run test:sim:browser:route-mount`
- Full regression:
  - `npm run test:sim:browser`
  - `npm run test:sim:visual-quality`

## Next steps

- Nếu user muốn xóa hẳn dormant VII sim code sau khi UI đã sạch, tạo plan follow-up riêng cho manifest/registry/doc churn.
