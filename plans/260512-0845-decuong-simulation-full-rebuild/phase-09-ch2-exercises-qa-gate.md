---
phase: 9
title: "CH2 Exercises QA Gate"
status: pending
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
- [ ] ch2-7-1 exercise solver
- [ ] ch2-7-2 result checker
- [ ] CH2 full QA gate pass

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
- [ ] 15/15 CH2 routes DeCuong quality
- [ ] Animation lifecycle stable (no drift after reset)
- [ ] All test suites green for CH2
