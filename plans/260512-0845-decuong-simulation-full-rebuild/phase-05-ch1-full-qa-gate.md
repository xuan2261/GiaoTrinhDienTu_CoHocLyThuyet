---
phase: 5
title: "CH1 Full QA Gate"
status: pending
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
- [ ] CH1 static gates pass
- [ ] CH1 browser gates pass
- [ ] CH1 visual-quality pass
- [ ] Full shared runtime gates pass
- [ ] Docs/changelog synced
- [ ] Screenshot evidence saved

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
- [ ] 25/25 CH1 routes DeCuong quality
- [ ] All test suites green
- [ ] No fallback scene/renderer/behavior
- [ ] No English text in visible UI
