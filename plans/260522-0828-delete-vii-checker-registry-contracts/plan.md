---
title: "Xóa hẳn 6 route checker VII khỏi registry và contract"
description: "Plan TDD chi tiết để loại bỏ hoàn toàn 6 dormant Section VII checker routes khỏi manifest, adapters, scene/renderer/behavior contracts, QA tools, tests, và docs; canonical simulation route count chuyển từ 58 xuống 52."
status: completed
priority: P1
effort: 1-2 days
branch: master
tags: [plan, simulation, route-contract, vii-exercise, tdd]
created: 2026-05-22
blockedBy: []
blocks: []
predecessor: plans/260522-0744-remove-vii-exercise-simulations
---

# Xóa hẳn 6 route checker VII khỏi registry và contract

## Context

Plan trước `plans/260522-0744-remove-vii-exercise-simulations/` đã hoàn tất phần user-facing: toàn bộ Section VII `BÀI TẬP` là content-only, không mount simulation UI. Tuy nhiên 6 route checker vẫn còn trong internal registry/contract để giữ gate 58 routes:

- `ch1-7-1`, `ch1-7-2`
- `ch2-7-1`, `ch2-7-2`
- `ch3-7-1`, `ch3-7-2`

Plan này xóa hẳn 6 route đó khỏi simulation subsystem. Section VII pages trong `index.html`, `chapters/`, `js/pages.js` vẫn là nội dung giáo trình; chỉ bỏ simulation route contracts.

## Goal

- Canonical simulation routes còn 52, không còn split "58 canonical / 52 mountable".
- Không còn 6 route checker VII trong `SIM_ROUTE_MANIFEST`, `SIM_MAP`, route adapters, scene registry, renderer registry, behavior registry.
- Browser/visual/canvas sweeps chạy trực tiếp trên 52 canonical routes.
- Các tests cũ đang khóa checker math của 6 route được xóa hoặc retarget sang route còn active.
- Docs và QA commands chuyển sang `--require-routes 52`.

## Non-Goals

- Không xóa sidebar/page route Section VII trong `index.html` hoặc content fragments.
- Không regenerate `js/pages.js` nếu không sửa fragment content.
- Không dọn lịch sử changelog/journal cũ, trừ phần docs hiện hành đang mô tả trạng thái hiện tại.
- Không rewrite engine `SimProfessionalLab`, chỉ prune branch/handle dành riêng cho 6 route nếu không còn reachable.

## Phases

1. [Phase 01 - Baseline và red tests](phase-01-baseline-and-red-tests.md): completed.
2. [Phase 02 - Xóa manifest, adapters, route maps](phase-02-remove-runtime-manifest-and-adapters.md): completed.
3. [Phase 03 - Prune scene, renderer, behavior contracts](phase-03-prune-scene-renderer-behavior-contracts.md): completed.
4. [Phase 04 - Cập nhật tools, counts, baselines](phase-04-update-tools-route-counts-and-baselines.md): completed.
5. [Phase 05 - Cập nhật unit/browser tests](phase-05-update-browser-unit-tests.md): completed.
6. [Phase 06 - Docs và release verification](phase-06-docs-and-release-verification.md): completed.

## Dependency Graph

Phase 01 must land first as TDD red. Phase 02 and Phase 03 are tightly coupled but should be implemented sequentially to keep failure scope readable. Phase 04 depends on canonical count being actually 52. Phase 05 depends on tests/tools taxonomy settled. Phase 06 is last.

## Files In Scope

Runtime:

- `js/sim-route-manifest.js`
- `js/sim-statics.js`, `js/sim-kinematics.js`, `js/sim-dynamics.js`
- `js/simulations.js`
- `js/sim-professional-lab.js`
- `js/sims/ch1/*`, `js/sims/ch2/*`, `js/sims/ch3/*`
- `index.html` only if script tags for now-empty checker modules must be removed

Tests/tools/docs:

- `tests/*simulation*`, `tests/phase-09-*`, `tests/phase-09-12-tdd.test.js`
- `tools/smoke_simulation_*.py`, `tools/test_simulation_*.py`
- `package.json`
- `README.md`, `docs/codebase-summary.md`, `docs/code-standards.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`

## Success Criteria

- `rg "ch1-7-1|ch1-7-2|ch2-7-1|ch2-7-2|ch3-7-1|ch3-7-2" js tests tools package.json README.md docs` returns only allowed content-page references, historical docs, and this plan.
- `window.SIM_ROUTE_MANIFEST`, `window.SIM_MAP`, scene registry, renderer registry, behavior registry expose exactly 52 routes.
- Section VII pages still load as content-only and do not create `.sim-mount`, `.sim-lab`, `canvas`, Play/Pause controls, or simulation readouts.
- Full release gate passes with 52-route contract.

## Full Verification Gate

Run after Phase 06:

```powershell
python tools\smoke_simulation_manifest.py --require-routes 52 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 52
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 52
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 52 --check-mount-rollback --check-listener-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:audit
npm run test:sim:semantic
npm run test:sim:renderer-contract
npm run test:sim:visual-quality
npm run test:sim:browser
npm run test:sim:disposal
npm run test:sim:release
python tools\audit.py
python -m compileall -q tools
```

## Risks

- Route-count churn touches many tests. Keep changes mechanical and centralized.
- Some files mix deleted Section VII routes with active Chapter 3 collision routes; prune only exact route branches.
- Legacy files under `js/routes/` may be inactive. Verify script loading before deleting or editing.
- Historical QA artifacts may contain old route ids. Do not rewrite archival files unless active tests consume them.

## Handoff Command

```powershell
$ck:cook "plans/260522-0828-delete-vii-checker-registry-contracts/plan.md"
```

## Unresolved Questions

- None.
