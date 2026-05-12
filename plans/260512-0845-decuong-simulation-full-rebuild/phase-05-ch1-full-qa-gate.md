---
phase: 5
title: "CH1 Full QA Gate"
status: complete
priority: P1
effort: "6h"
dependencies: [4]
---

# Phase 05: CH1 Full QA Gate

## Overview
Lock CH1 quality: tất cả 25 routes đạt DeCuong standard. Chạy full test suite, update docs.

## Implementation Steps
1. Run CH1-filtered static gates
2. Run unit and browser gates
3. Run full route discovery if shared files changed
4. Screenshot all 25 CH1 routes (dark + light)
5. Update docs/changelog with CH1 rebuild status
6. Mark CH1 as release-ready

## Todo List
- [x] CH1 static gates pass
- [x] CH1 browser gates pass
- [x] CH1 visual-quality pass
- [x] Full shared runtime gates pass
- [x] Docs/changelog synced
- [x] Screenshot evidence saved

## Verification / Tests
```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch1 --require-routes 25 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1 --require-routes 25
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1 --require-routes 25
python tools\smoke_simulation_runtime.py --routes ch1 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:renderer-contract
python tools\audit.py
```

## Success Criteria
- [x] 25/25 CH1 routes DeCuong quality
- [x] All test suites green
- [x] No fallback scene/renderer/behavior
- [x] No English text in visible UI

## Completion Notes

- Completed: 2026-05-12.
- Screenshot evidence: `plans/260512-0845-decuong-simulation-full-rebuild/reports/phase-05-screenshots/` (25 CH1 routes x light/dark = 50 PNG).
- Static gates pass: route smoke, CH1 manifest, CH1 scene catalog, CH1 renderer contract.
- Runtime/content gates pass: CH1 runtime smoke, `npm run test:sim:unit`, `npm run test:sim:quality`, `python tools\audit.py`.
- Browser gates pass: `npm run test:sim:semantic`, `npm run test:sim:browser` (163 tests), `npm run test:sim:visual-quality` (4 tests).
