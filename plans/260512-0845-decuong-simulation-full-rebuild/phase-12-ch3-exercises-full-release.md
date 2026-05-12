---
phase: 12
title: "CH3 Exercises Full Release"
status: pending
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
- [ ] ch3-7-1 theorem selector + solver
- [ ] ch3-7-2 result checker
- [ ] Full 58/58 release gate pass
- [ ] Update docs/changelog
- [ ] Update docs/system-architecture
- [ ] Final screenshot evidence (dark + light, all chapters)

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
- [ ] **58/58 routes** render DeCuong-quality visuals
- [ ] **ALL test suites green** — no skips, no xfails for P1 routes
- [ ] **Canvas 760×440** across all routes, responsive on mobile
- [ ] **KaTeX equations** display for applicable routes
- [ ] **Trail effect** visible on all routes
- [ ] **Theme toggle** instant for all routes (grid + handles + readouts)
- [ ] **Touch interaction** responsive (hit area ≥ 25px)
- [ ] **Instant reset** for all routes
- [ ] **No English text leak** in visible UI
- [ ] **No fallback scene/renderer/behavior** usage
- [ ] **file:// mount** works offline
- [ ] **docs/** synced with final state

## Risk Assessment
- Risk: late-phase discovery of shared infrastructure bugs. Mitigation: phases 05 and 09 catch chapter-level issues early
- Risk: KaTeX offline not loading. Mitigation: KaTeX already bundled locally

## Post-Release
- Update `docs/project-changelog.md` with DeCuong rebuild completion
- Update `docs/system-architecture.md` with new canvas/rendering architecture
- Archive old plans (`260512-0544-ch1/ch2/ch3-decuong-interaction-upgrade`)
