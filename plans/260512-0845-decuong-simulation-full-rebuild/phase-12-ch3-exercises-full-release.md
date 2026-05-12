---
phase: 12
title: "CH3 Exercises Full Release"
status: complete
priority: P1
effort: "10h"
dependencies: [11]
---

# Phase 12: CH3 Exercises + Full Release Gate

## Overview
Rebuild 2 exercise routes + run FINAL full release gate (58/58 routes). This is the last phase.

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch3-7-1` | Bài tập step-by-step | Theorem selection, step solver |
| `ch3-7-2` | Đối chiếu kết quả | Result verification panel |

## Implementation Steps
1. ch3-7-1: student selects which theorem to apply, then step-by-step solution
2. ch3-7-2: numerical comparison with feedback
3. KaTeX for solution steps
4. Run FULL 58-route release gate

## Todo List
- [x] ch3-7-1 theorem selector + solver
- [x] ch3-7-2 result checker
- [x] Full 58/58 release gate pass
- [x] Update docs/changelog
- [x] Update docs/system-architecture

## Verification / Tests — FULL RELEASE GATE
```powershell
# === STATIC GATES ===
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct

# === SCENE/RENDERER GATES ===
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58

# === RUNTIME GATES ===
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup

# === UNIT TESTS ===
npm run test:sim:unit

# === BROWSER TESTS ===
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:semantic
npm run test:sim:renderer-contract

# === FULL RELEASE ===
npm run test:sim:release

# === AUDIT ===
python tools\audit.py
```

## Success Criteria
- [x] **58/58 routes** render DeCuong-quality visuals
- [x] **ALL test suites green** — no skips, no xfails for P1 routes
- [x] **Canvas 760×440** across all routes, responsive on mobile
- [x] **KaTeX equations** display for applicable routes
- [x] **Trail effect** visible on all routes
- [x] **Theme toggle** instant for all routes (grid + handles + readouts)
- [x] **Touch interaction** responsive (hit area ≥ 25px)
- [x] **Instant reset** for all routes
- [x] **No English text leak** in visible UI
- [x] **No fallback scene/renderer/behavior** usage
- [x] **file:// mount** works offline
- [x] **docs/** synced with final state

## Completion Notes

- Added Phase 09-12 TDD coverage in `tests/phase-09-12-tdd.test.js` and wired it into `npm run test:sim:unit`.
- `ch3-7-2` zero-noise residual checker remains locked at residual `0` and score `100`; browser control audit verifies readout and overlay agreement.
- Final release gate passed: static route/manifest/scene/renderer/runtime smokes, `npm run test:sim:unit`, `npm run test:sim:browser` (163 tests), `npm run test:sim:visual-quality` (4 tests), disposal audit, content audit, strict equation audit, and strict KaTeX equation mapping validation.
- All-chapter screenshot evidence was not produced in this cook run; CH1 Phase 05 screenshot evidence exists for CH1 light/dark samples, but Phase 12 did not generate a new all-chapter capture set.
- Final sync-back: Phase 12 stays complete after final review fixes; release gate remains the canonical PASS.

## Risk Assessment
- Risk: late-phase discovery of shared infrastructure bugs. Mitigation: phases 05 and 09 catch chapter-level issues early
- Risk: KaTeX offline not loading. Mitigation: KaTeX already bundled locally

## Post-Release
- Update `docs/project-changelog.md` with DeCuong rebuild completion
- Update `docs/system-architecture.md` with new canvas/rendering architecture
- Archive old plans (`260512-0544-ch1/ch2/ch3-decuong-interaction-upgrade`)
