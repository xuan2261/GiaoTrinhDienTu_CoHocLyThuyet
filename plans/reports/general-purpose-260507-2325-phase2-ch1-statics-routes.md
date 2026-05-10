# Phase 2 Report — Ch1 All Statics Routes Implementation

## Status: DONE

## What was done

### Pre-existing (already complete, no changes needed)
- **ch1-support-spatial-behaviors.js** — already had all 9 behavior registrations (ch1-3-1 through ch1-4-4) ✓
- **ch1-spatial-renderers.js** — already had all 3 spatial renderers (ch1-4-1, ch1-4-2, ch1-4-4) ✓
- **ch1-support-renderers.js** — already had all 6 support renderers ✓

### Created: ch1-centroid-solver-scenes.js (NEW)
- Scene registry for ch1-6-2 (Trọng tâm diện tích ghép) and ch1-6-3 (Trọng tâm khi có lỗ khoét)
- Extracted from ch1-friction-centroid-solver-scenes.js

### Created: ch1-solver-exercises-scenes.js (NEW)
- Scene registry for ch1-7-1 (Chuỗi giải tĩnh học) and ch1-7-2 (Kiểm tra số liệu tĩnh học)
- Includes initialState with `buoc`, `inputRA`, `inputRB` fields

### Created: ch1-solver-exercises-renderers.js (NEW)
- `renderCh171GuidedEquilibriumSolver`: 4-panel step-by-step solver (FBD → ΣFx=0 → ΣFy&ΣM → Nghiệm)
- `renderCh172StaticsNumericChecker`: FBD with beam A/B supports, reaction arrows, equation panel, input slots

### Created: ch1-solver-exercises-behaviors.js (NEW)
- Behavior contracts for ch1-7-1 and ch1-7-2

### Modified: ch1-centroid-solver-renderers.js
- Removed duplicate ch1-7-1 and ch1-7-2 render functions and registrations (moved to dedicated solver-exercises file)

### Modified: ch1-friction-centroid-solver-behaviors.js
- Removed duplicate ch1-7-1 and ch1-7-2 behavior entries (moved to dedicated solver-exercises file)

### Modified: ch1-friction-centroid-solver-scenes.js
- Removed ch1-7-1 and ch1-7-2 scene rows (moved to dedicated solver-exercises file)

## Final route registry (22 routes, all complete)

| Route | Scene | Renderer | Behavior |
|-------|-------|----------|----------|
| ch1-1-3 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-1-4 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-1-5 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-1-6 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-1-8 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-2-1 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-2-3 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-2-6 | ch1-force-law-scenes | ch1-force-law-renderers | ch1-force-law-behaviors |
| ch1-3-1 | ch1-support-spatial-scenes | ch1-support-renderers | ch1-support-spatial-behaviors |
| ch1-3-2 | ch1-support-spatial-scenes | ch1-support-renderers | ch1-support-spatial-behaviors |
| ch1-3-3 | ch1-support-spatial-scenes | ch1-support-renderers | ch1-support-spatial-behaviors |
| ch1-3-4 | ch1-support-spatial-scenes | ch1-support-renderers | ch1-support-spatial-behaviors |
| ch1-3-6 | ch1-support-spatial-scenes | ch1-support-renderers | ch1-support-spatial-behaviors |
| ch1-3-7 | ch1-support-spatial-scenes | ch1-support-renderers | ch1-support-spatial-behaviors |
| ch1-4-1 | ch1-support-spatial-scenes | ch1-spatial-renderers | ch1-support-spatial-behaviors |
| ch1-4-2 | ch1-support-spatial-scenes | ch1-spatial-renderers | ch1-support-spatial-behaviors |
| ch1-4-4 | ch1-support-spatial-scenes | ch1-spatial-renderers | ch1-support-spatial-behaviors |
| ch1-5-1 | ch1-friction-centroid-solver-scenes | ch1-friction-renderers | ch1-friction-centroid-solver-behaviors |
| ch1-5-2 | ch1-friction-centroid-solver-scenes | ch1-friction-renderers | ch1-friction-centroid-solver-behaviors |
| ch1-5-3 | ch1-friction-centroid-solver-scenes | ch1-friction-renderers | ch1-friction-centroid-solver-behaviors |
| ch1-5-4 | ch1-friction-centroid-solver-scenes | ch1-friction-renderers | ch1-friction-centroid-solver-behaviors |
| ch1-6-2 | ch1-centroid-solver-scenes | ch1-centroid-solver-renderers | ch1-friction-centroid-solver-behaviors |
| ch1-6-3 | ch1-centroid-solver-scenes | ch1-centroid-solver-renderers | ch1-friction-centroid-solver-behaviors |
| ch1-7-1 | ch1-solver-exercises-scenes | ch1-solver-exercises-renderers | ch1-solver-exercises-behaviors |
| ch1-7-2 | ch1-solver-exercises-scenes | ch1-solver-exercises-renderers | ch1-solver-exercises-behaviors |

## Syntax checks
All 8 files pass `node --check`:
- ch1-support-spatial-behaviors.js ✓
- ch1-spatial-renderers.js ✓
- ch1-centroid-solver-renderers.js ✓
- ch1-centroid-solver-scenes.js ✓
- ch1-solver-exercises-scenes.js ✓
- ch1-solver-exercises-renderers.js ✓
- ch1-solver-exercises-behaviors.js ✓
- ch1-friction-centroid-solver-behaviors.js ✓
- ch1-friction-centroid-solver-scenes.js ✓

## Files created (3)
- `js/sims/ch1/ch1-centroid-solver-scenes.js`
- `js/sims/ch1/ch1-solver-exercises-scenes.js`
- `js/sims/ch1/ch1-solver-exercises-renderers.js`
- `js/sims/ch1/ch1-solver-exercises-behaviors.js`

## Files modified (3)
- `js/sims/ch1/ch1-centroid-solver-renderers.js` — removed duplicate ch1-7-1/7-2
- `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` — removed duplicate ch1-7-1/7-2
- `js/sims/ch1/ch1-friction-centroid-solver-scenes.js` — removed ch1-7-1/7-2 rows

## Unresolved questions
- None
