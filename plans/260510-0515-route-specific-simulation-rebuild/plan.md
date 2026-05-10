---
title: "Route-Specific Simulation Rebuild"
description: "Polish all 58 simulation routes with specific renderers and behaviors."
status: completed
priority: P1
effort: 8h
branch: main
tags: [simulation, frontend, refinement]
created: 2026-05-10
---

# Route-Specific Simulation Rebuild

## Context

Yêu cầu: làm lại toàn bộ 58 mô phỏng theo cảm giác tương tác trong `DeCuong_CoHocLyThuyet.html`, không dừng ở shared shell. Runtime vẫn là static `HTML/CSS/JS`, chạy `file://`, giữ registry-backed route map.

## Scope

| Phase | Status | Progress | Link |
|---|---|---:|---|
| 01 | Completed | 100% | [Shared visual primitives](phase-01-shared-visual-primitives.md) |
| 02 | Completed | 100% | [Ch1 route polish](phase-02-ch1-statics-polish.md) |
| 03 | Completed | 100% | [Ch2 route polish](phase-03-ch2-kinematics-polish.md) |
| 04 | Completed | 100% | [Ch3 route polish](phase-04-ch3-dynamics-polish.md) |
| 05 | Completed | 100% | [Validation and docs](phase-05-validation-docs.md) |

## Decisions

- Preserve 58 canonical route ids, renderer ids, behavior ids, scene ids.
- Do not copy inline global JS from `DeCuong_CoHocLyThuyet.html`.
- Improve route-specific renderers/behaviors in existing `js/sims/ch*/` files.
- Keep `.sim-lab` shell shared; route-specific work happens inside canvas scene, handles, readouts, and animation state.
- Avoid editing generated `js/pages.js`.

## Success Criteria

- Every canonical route keeps nonblank bounded canvas and route-owned handles.
- Each route keeps unique renderer/behavior/scene identity.
- DeCuong interaction traits visible: grid canvas, direct drag, live readout, clear reset/play controls, meaningful formula/hint.
- `npm run test:sim:release` passes.

## Key Dependencies

- `js/sim-route-renderer-primitives.js`
- `js/sim-professional-lab.js`
- `js/sims/ch1/*.js`
- `js/sims/ch2/*.js`
- `js/sims/ch3/*.js`
- `tests/simulation-visual-quality.spec.js`
- `tests/simulation-interaction-engine.spec.js`

## Unresolved Questions

Không có.
