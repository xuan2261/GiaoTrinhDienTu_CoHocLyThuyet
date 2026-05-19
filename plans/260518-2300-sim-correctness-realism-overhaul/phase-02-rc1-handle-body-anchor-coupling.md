---
phase: 2
title: "RC1 Handle Body Anchor Coupling"
status: completed
priority: P1
effort: "8h"
dependencies: [1]
---

# Phase 02: RC1 Handle Body Anchor Coupling

## Overview

Khắc phục root cause RC1 — handle kéo lệch khỏi thân vật. Mỗi route phải tự khai báo `getAnchor(state)` chỉ ra điểm gốc visual của vật mà handle phải bám theo. Engine assert `|handle.get() - getAnchor()| ≤ 8px` cho mọi state mutation.

## Requirements

- Functional:
  - Mỗi handle config trong `js/sim-professional-lab.js#ch1Handles/ch2Handles/ch3Handles` có thuộc tính `getAnchor(state) → {x, y}`.
  - Renderer sử dụng cùng `getAnchor` để vẽ vật, đảm bảo chỉ có 1 nguồn truth.
  - Loại bỏ `legacyHandles` fallback (`js/sim-professional-lab.js:1086-1091`); thay bằng fail-loud console error nếu route trả handle rỗng.
  - Bỏ thuộc tính `data-active-handle-id` khi không kéo (đã có).
- Non-functional:
  - Không thay đổi visual định lượng vượt quá 8px ở state mặc định của 58 route.
  - Không phá readout/formula contract.
  - Drag latency không tăng > 5%.

## Architecture

```
+---- behavior.handles(scene, state, d, lab) ---------+
|     [{ id, label, get, set, getAnchor, ... }, ...]  |
+-----------------+-----------------------------------+
                  |
                  v
+---- bindInteractions ---------+   +---- renderer ---+
| invokes set/get during drag   |   | reads getAnchor |
| asserts get() ~ getAnchor()   |   | draws body      |
+-------------------------------+   +-----------------+
```

State flow ch1-2-3 trước/sau:

| Aspect | Before | After |
|---|---|---|
| F1 handle source | `state.primary` | `getAnchor: s => s.f1End` |
| F1 vector draw | `PARA_O → state.primary` | `PARA_O → getAnchor()` |
| F2 handle source | derived from `state.alpha` | `getAnchor: s => s.f2End` |
| F2 vector draw | `PARA_O → state.secondary` | `PARA_O → getAnchor()` |

## Related Code Files

- Modify: `js/sim-professional-lab.js`
  - Replace `handle()` factory to require `getAnchor` (line ~580).
  - Remove `legacyHandles` and `legacy-primary/legacy-vector` fallback (line ~1086-1091).
  - Add console.error if `resolveHandles()` returns empty for active route.
- Modify: `js/sims/ch1/ch1-force-law-renderers.js` — all 8 renderer functions read anchor from passed state, no longer reach into `state.primary` directly.
- Modify: `js/sims/ch1/ch1-friction-renderers.js`, `ch1-spatial-renderers.js`, `ch1-support-renderers.js`, `ch1-centroid-solver-renderers.js`, `ch1-solver-exercises-renderers.js` — consistent anchor reads.
- Modify: `js/sims/ch2/ch2-trajectory-graph-renderers.js`, `ch2-rotation-transmission-renderers.js`, `ch2-rotation-gear-renderers.js`, `ch2-relative-renderers.js`, `ch2-relative-motion-velocity-renderers.js`, `ch2-instant-center-plane-motion-renderers.js`, `ch2-plane-checker-renderers.js`, `ch2-kinematics-exercises-renderers.js`.
- Modify: `js/sims/ch3/ch3-newton-laws-renderers.js`, `ch3-spring-mass-coupled-springs-dalembert-renderers.js`, `ch3-theorems-renderers.js`, `ch3-collision-exercises-renderers.js`.
- Modify: scene catalogs only if anchor depends on derived state per scene.

## Implementation Steps

1. Update `tests/sim-handle-anchor-invariants.spec.js` to assert exact pattern: every handle config object has function `getAnchor`. Run → RED.
2. Add `getAnchor` parameter to `handle()` helper in `js/sim-professional-lab.js:580-594`. If missing, default to `() => state.primary` (transition aid; remove default at end of phase).
3. Migrate ch1 routes one chapter at a time:
   - 3a. ch1 force/law: 8 renderer pairs.
   - 3b. ch1 friction/centroid: ~8 renderer pairs.
   - 3c. ch1 support/spatial/exercises: ~9 renderer pairs.
   After each batch: run `npm run test:sim:correctness:browser` filtered to chapter. Should turn GREEN incrementally.
4. Migrate ch2 routes:
   - 4a. trajectory + graph (5 routes)
   - 4b. rotation + gear + transmission (3 routes)
   - 4c. relative + plane motion (4 routes)
   - 4d. exercises + checker (3 routes)
5. Migrate ch3 routes:
   - 5a. newton-laws (5 routes)
   - 5b. spring/coupled/d'alembert (4 routes) — coordinate with Phase 03 (RC4)
   - 5c. theorems + collision + exercises (5 routes)
6. Remove default fallback in `handle()`. Confirm all handles declare `getAnchor`.
7. Remove `legacyHandles` and replace with **throwing fail** (red-team P0-2: `console.error` does not fail tests):
   ```js
   function resolveHandles(scene, state, d, behavior, lab) {
     const handles = (typeof behavior.handles === 'function') ? behavior.handles(scene, state, d, lab) : [];
     if (!Array.isArray(handles) || !handles.length) {
       throw new Error(`[sim] route ${scene.routeId} returned no handles — registry violation`);
     }
     handles.forEach(h => {
       if (typeof h.getAnchor !== 'function') {
         throw new Error(`[sim] route ${scene.routeId} handle ${h.id} missing getAnchor`);
       }
     });
     return handles;
   }
   ```
   Add `tests/sim-correctness-realism.test.js` assertion: mounting an empty-handles route MUST throw, caught by Playwright `page.on('pageerror')`. This makes regression mechanically detectable.
8. Run full `npm run test:sim:correctness:browser` → all `@rc1-*` GREEN.
9. Run `npm run test:sim:browser` and `npm run test:sim:visual-quality` → no regression.
10. Manual visual verify on 6 representative routes via local server.

## Todo List

- [ ] Update test spec to assert getAnchor presence (RED)
- [ ] Add getAnchor param to handle() helper
- [ ] Migrate ch1 force/law renderers (8 routes)
- [ ] Migrate ch1 friction/centroid/support routes
- [ ] Migrate ch2 trajectory/rotation routes
- [ ] Migrate ch2 relative/exercise routes
- [ ] Migrate ch3 newton/spring/d'alembert routes
- [ ] Migrate ch3 theorems/collision/exercise routes
- [ ] Remove default fallback in handle()
- [ ] Remove legacyHandles fallback (fail-loud)
- [ ] Run @rc1 suite GREEN
- [ ] Run release gate (browser/visual-quality), no regression
- [ ] Manual visual verify on ch1-2-3, ch1-2-6, ch2-1-1, ch3-3-1, ch3-6-2
- [ ] Refresh visual baseline JSON for ch1/ch2/ch3 affected routes + commit `reports/baseline-delta-phase-02.md`

## Success Criteria

- [ ] `npm run test:sim:correctness:browser -- --grep "@rc1"` GREEN (all 58 routes)
- [ ] `data-handle-ids` does not contain `legacy-primary` or `legacy-vector` on any active route
- [ ] Drag distance test: 100 random drag points → max `|handle.get() - getAnchor()|` ≤ 8px
- [ ] Drag latency benchmark not regressed > 5% (ch3-6-2 collision balls fast drag)
- [ ] Visual gates: `npm run test:sim:browser`, `npm run test:sim:visual-quality` GREEN

## Risk Assessment

- **Risk:** Some routes derive handle position from animated state (`ch2-2-2` rotation), `getAnchor` must read animation phase.
  **Mitigation:** `getAnchor(state, d)` receives both raw and derived state; for animated routes, return computed position from the same chain `derived` produces.
- **Risk:** Removing `legacyHandles` causes regression in unknown routes.
  **Mitigation:** Phase 01 baseline snapshot lists routes that hit fallback; all must be migrated explicitly before removal.
- **Risk:** Renderer files are huge (220+ lines), edits risk merge conflicts.
  **Mitigation:** Migrate one chapter at a time; commit per chapter with focused diff.

## Security Considerations

- No external input; pure refactor of internal state ownership.
- Console errors must NOT leak sensitive data (none expected).

## Next Steps

- Phase 03 builds on Phase 02 — spring/cable also use `getAnchor` for base coupling.
- Phase 06 magnitude arrow needs `getAnchor` to know the body edge (start of arrow).
