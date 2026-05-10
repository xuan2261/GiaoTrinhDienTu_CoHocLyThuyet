# Simulation Gap Analysis Report

**Date**: 2026-05-10
**Status**: ⚠️ CRITICAL GAPS IDENTIFIED
**Target**: 58/58 Standalone V2 Routes (P1 Coverage)

## Summary
A comprehensive audit of the simulation system revealed that while the project documentation (plans) marks the V2 migration as "Completed", there are significant discrepancies between the planned routes, the canonical coverage matrix, and the actual files on disk. 

Legacy-V2 routes (Canvas-based) are still being used for several key topics, but these are NOT loaded by the current `loader.js` architecture, effectively breaking those simulations in the production-ready build.

## Discrepancies Found

### 1. ID Mismatch & Misplacement
Several standalone files are using IDs that don't match the `simulation-coverage-matrix.md` or are mapped to the wrong topic:
- `js/routes/ch1/ch1-3-1.js` (FBD Single Body) should be `ch1-2-6` (Giải phóng liên kết).
- `js/routes/ch1/ch1-8-1.js` exists but is not in the canonical `PAGE_ORDER`.

### 2. Missing Standalone V2 Modules
The following 13 routes have legacy-V2 implementations but MISSING standalone SVG/Matter.js modules:

#### Chapter 1 (Statics) - 5 missing
- `ch1-1-4` (Mô men) - *Note: marked as existing in matrix but file missing.*
- `ch1-1-5` (Hệ lực)
- `ch1-2-1` (Hai lực cân bằng)
- `ch1-3-3` (Bản lề)
- `ch1-4-3` (Dạng hệ lực)

#### Chapter 2 (Kinematics) - 6 missing
- `ch2-4-4` (Hợp gia tốc / Coriolis)
- `ch2-6-1` (Quay quanh điểm cố định)
- `ch2-6-2` (Phân tích chuyển động)
- `ch2-6-3` (Gia tốc Coriolis)
- `ch2-7-1` (Hướng dẫn bài tập)
- `ch2-7-2` (Bài tập)

#### Chapter 3 (Dynamics) - 2 missing
- `ch3-7-1` (Hướng dẫn bài tập)
- `ch3-7-2` (Bài tập)

## Verified Broken Routes (Production)
Since `loader.js` and `index.html` DO NOT load `chapter-statics-routes.js` or other legacy bundles, any route missing a standalone file in `js/routes/ch*/` will show a blank simulation area or a 404 warning in the console.

## Recommendation
1. **Reopen Plan**: Mark `plans/260510-1615-batch-simulation-conversion-v2/plan.md` and its phases as `in-progress`.
2. **Batch Porting**: Systematically extract the logic from legacy files and implement the 13 missing standalone modules.
3. **ID Alignment**: Rename/Relocate mismatched files to follow the P1 Matrix strictly.

**Next Step**: Begin with Phase 02 (Statics) missing routes.
