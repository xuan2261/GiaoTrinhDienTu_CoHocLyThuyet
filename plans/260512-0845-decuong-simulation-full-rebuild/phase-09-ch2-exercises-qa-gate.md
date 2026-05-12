---
phase: 9
title: "CH2 Exercises QA Gate"
status: complete
priority: P1
effort: "8h"
dependencies: [8]
---

# Phase 09: CH2 Exercises + QA Gate

## Overview
Rebuild 2 exercise routes + run full CH2 quality gate (15/15 routes).

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch2-7-1` | Bài tập step-by-step | Step solver with progress |
| `ch2-7-2` | Đối chiếu kết quả | Result verification |

## Implementation Steps
1. ch2-7-1: step-by-step solver, each step reveals next
2. ch2-7-2: numerical comparison panel
3. KaTeX for solution formulas
4. Run full CH2 test suite

## Todo List
- [x] ch2-7-1 exercise solver
- [x] ch2-7-2 result checker
- [x] CH2 full QA gate pass

## Verification / Tests
```powershell
python tools\smoke_simulation_manifest.py --routes ch2 --require-routes 15 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2 --require-routes 15
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2 --require-routes 15
python tools\smoke_simulation_runtime.py --routes ch2 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:semantic
python tools\audit.py
```

## Success Criteria
- [x] 15/15 CH2 routes DeCuong quality
- [x] Animation lifecycle stable (no drift after reset)
- [x] All test suites green for CH2

## Completion Notes

- `ch2-7-1` solver now keeps steps bounded to the 3 visible panels and computes `v/a` from the same `omega` derivative chain as the displayed KaTeX formula.
- `ch2-7-2` checker now verifies canonical sinusoid data consistently for `x(t)`, `v(t)`, and `a(t)`.
- Verification passed: CH2 manifest/scene/renderer/runtime smokes, `npm run test:sim:unit`, `npm run test:sim:browser`, `npm run test:sim:visual-quality`, and final `npm run test:sim:release`.
- Final sync-back: Phase 09 remains complete after code-review fixes; CH2 checker labels now stay localized, no phase metadata change.
