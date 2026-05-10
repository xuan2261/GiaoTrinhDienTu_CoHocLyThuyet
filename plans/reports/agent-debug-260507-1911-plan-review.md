# Plan Review — 58 Simulation Routes Rebuild

## Baseline Status (from smoke tests)

| Test | Result |
|------|--------|
| smoke_simulation_routes | PASS — 58 routes, 78 total coverage matrix |
| smoke_simulation_runtime | PASS — all globals load |
| smoke_simulation_manifest | PASS — 58/58 objectives, 58/58 direct interactions |

**Ground truth**: Ch1=25, Ch2=15, Ch3=18, Total=58

## Issues Fixed

### P0 — Critical

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | plan.md | Ch1 ghi 22 routes | Sửa → 25 |
| 2 | plan.md | Ch2 ghi 17 routes | Sửa → 15 |
| 3 | plan.md | Ch3 ghi 19 routes | Sửa → 18 |
| 4 | phase-02 | 12+ references sai 22→25 | Sửa hết |
| 5 | phase-03 | 6+ references sai 17→15 | Sửa hết |
| 6 | phase-04 | 6+ references sai 19→18 | Sửa hết |
| 7 | phase-02 | Flag `--check-chapter` không tồn tại | Bỏ flag |

### P1 — High

| # | File | Issue | Fix |
|---|------|-------|-----|
| 8 | phase-05 | Script load order conflict: anim-engine sau pro-lab | Đổi thứ tự: anim-engine trước pro-lab |
| 9 | plan.md | 3 unresolved questions | Resolved với decisions |

### P2 — Medium

| # | Item | Note |
|---|------|------|
| 10 | Animation API onFrame timing | Spec pattern đúng: register callback rồi gọi start() |
| 11 | Effort estimates | Ch1=25 routes trong 5 ngày ≈ 5 routes/ngày; có thể tight |

## Resolved Questions

1. **Animation baseline capture**: canvas-diff, threshold 5% pixels
2. **Particle density**: default 100, max 200, object pooling
3. **KaTeX fallback**: offline bundle + CDN check on load failure

## Remaining Items (Not Fixed)

- Filenames phase-02/03/04 chứa old counts (22/17/19) — **không đổi** vì break internal links
- Phase 06 QA summary: Ch1=58 checkpoints (should be 25) — QA artifact, low priority
- Effort estimates không đổi — timeline vẫn ~25 ngày nhưng ch1 = 25 routes thay vì 22

## Files Modified

- plan.md (3 fixes + 3 resolved questions)
- phase-01-infrastructure-animation-engine.md (1 fix)
- phase-02-chapter-1-statics-22-routes.md (12+ fixes)
- phase-03-chapter-2-kinematics-17-routes.md (6+ fixes)
- phase-04-chapter-3-dynamics-19-routes.md (6+ fixes)
- phase-05-integration-qa-polish.md (script order + smoke command)
- phase-06-docs-release-handoff.md (route coverage table + changelog)

## Next Steps

1. Rename phase-02/03/04 files để reflect correct counts (optional, low priority)
2. Verify animation engine API spec with actual implementation in Phase 01
3. Baseline smoke test trước Phase 01 start
