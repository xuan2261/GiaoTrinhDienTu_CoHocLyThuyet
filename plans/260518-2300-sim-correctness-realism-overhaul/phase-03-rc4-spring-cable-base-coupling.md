---
phase: 3
title: "RC4 Spring And Cable Base Coupling"
status: completed
priority: P1
effort: "5h"
dependencies: [1, 2]
---

# Phase 03: RC4 Spring And Cable Base Coupling

## Overview

Khắc phục RC4 — spring/cable rendering không bám theo mass body. Đầu của lò xo phải dính sát vào rìa của vật mà nó nối tới; thay đổi `state.x` phải đồng bộ cập nhật cả spring tail lẫn body left edge.

## Requirements

- Functional:
  - `P.spring(ctx, x1, y1, x2, y2, opts)` nhận `attachA: getAnchor`, `attachB: getAnchor` thay vì 2 cặp tọa độ rời.
  - Renderer ch3-3-1, ch3-3-2 (spring), ch1-1-8 mode 'Dây' (cable), ch1-2-1 (couple) phải tính `springEnd = bodyLeft - coilOffset` chứ không hardcode 80.
  - Thêm derived helper `derivedSpringGeometry(bodyAnchor, wallAnchor, coilCount, coilWidth) → {x1,y1,x2,y2,coilSpacing}` để tái sử dụng.
- Non-functional:
  - Visual gap giữa spring tail và body edge ≤ 2px ở mọi state.
  - Coil count khả biến tùy độ dài spring (giữ pitch tối ưu).

## Architecture

```
state.x ──┐
          ├─► getAnchor(state) ─► bodyLeft ─► springEnd = bodyLeft - 4
          ├─► springStart fixed (wall)
          └─► P.spring(springStart, springEnd, derivedCoilCount)
```

Helper signature:

```js
function derivedSpringGeometry(wallPoint, bodyAnchor, options) {
  const dx = bodyAnchor.x - wallPoint.x;
  const dy = bodyAnchor.y - wallPoint.y;
  const len = Math.hypot(dx, dy);
  const restLength = options.restLength || 100;
  const coilCount = Math.max(4, Math.round(len / 12));
  return {
    x1: wallPoint.x, y1: wallPoint.y,
    x2: bodyAnchor.x - 4, y2: bodyAnchor.y,
    coilCount, coilWidth: 8,
    stretchRatio: len / restLength
  };
}
```

## Related Code Files

- Modify: `js/sim-route-renderer-primitives.js` — replace `spring()` (line 260-284) signature to accept `{attachA, attachB, coils, width, color}`.
- Add helper: `js/sim-visual-helpers.js` — export `derivedSpringGeometry`, `derivedCableGeometry` (catenary).
- Modify: `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js` — ch3-3-1 (line 14-58) and ch3-3-2 (line 62-85).
- Modify: `js/sims/ch1/ch1-force-law-renderers.js` — `renderCh118ConstraintRelease` cable case.
- Modify: `js/sims/ch1/ch1-force-law-renderers.js` — `renderCh121TwoForceBody` if uses tension cable.
- Modify scene init for spring routes: add `state.springAnchor` and `state.springWall` constants used by both renderer and behavior.

## Implementation Steps

1. Update `tests/sim-handle-anchor-invariants.spec.js` `@rc4-spring-base` suite:
   - Mount ch3-3-1.
   - Get `data-structural-marks`, find `spring:x1:y1:x2:y2`.
   - Get body bounds via `realisticBody:x:y:w:h`.
   - Assert `|spring.x2 - body.x| ≤ 2`.
2. Add `derivedSpringGeometry` to `js/sim-visual-helpers.js`. Unit test in `tests/sim-correctness-realism.test.js`.
3. Refactor `P.spring` to accept `attachA`/`attachB` while keeping legacy 4-coord signature (deprecation path).
4. Update ch3-3-1 renderer to use:
   ```js
   const wall = { x: 80, y: 184 };
   const bodyX = 92 + state.x * 50;
   const geom = derivedSpringGeometry(wall, { x: bodyX, y: 184 }, { restLength: 12 });
   P.spring(ctx, geom.x1, geom.y1, geom.x2, geom.y2, geom);
   P.realisticBody(ctx, bodyX, 166, 60, 36, 'm', { material: 'metal', radius: 4 });
   ```
5. Update ch3-3-2 (coupled springs): 3 springs, each derives anchor from neighboring body.
6. Update ch1-1-8 'Dây' mode: cable from anchor to body, sag computed from horizontal distance.
7. Run `@rc4` suite → GREEN. Visual verify on local server: drag mass slider, lò xo co giãn theo.
8. Add visual snapshot to baseline: `tests/__snapshots__/sim-correctness-baseline.json`.

## Todo List

- [ ] Add `@rc4-spring-base` browser test asserting gap ≤ 2px (RED)
- [ ] Implement `derivedSpringGeometry` helper + unit test
- [ ] Refactor `P.spring` to attach-based API (back-compat)
- [ ] Update ch3-3-1 renderer
- [ ] Update ch3-3-2 coupled springs renderer
- [ ] Update ch1-1-8 cable mode
- [ ] Update other spring/cable callsites
- [ ] Run @rc4 suite GREEN
- [ ] Manual run-mode verify ch3-3-1: spring oscillates with mass
- [ ] Refresh visual baseline JSON for spring/cable routes (ch3-3-1, ch3-3-2, ch1-1-8, ch1-2-1) + commit `reports/baseline-delta-phase-03.md`

## Success Criteria

- [ ] All spring routes max `|spring.endX - body.leftX|` ≤ 2px across full slider range
- [ ] All cable routes catenary curve endpoints within 2px of body anchors
- [ ] Spring coil count visually pleasing (4-12 coils across full state range)
- [ ] No regression in `@rc1` invariants
- [ ] `npm run test:sim:visual-quality` GREEN

## Risk Assessment

- **Risk:** `P.spring` API change breaks routes outside the migration set.
  **Mitigation:** Keep legacy `(ctx,x1,y1,x2,y2,opts)` signature path; add new attach-based path optional.
- **Risk:** Coupled springs (ch3-3-2) might have inconsistent body sizes; coil count differs across springs.
  **Mitigation:** Compute coilCount per-spring inside renderer, not globally.

## Security Considerations
- N/A.

## Next Steps

- Phase 05 will replace zigzag with sinusoidal helix; this phase keeps current zigzag (just re-anchored).
