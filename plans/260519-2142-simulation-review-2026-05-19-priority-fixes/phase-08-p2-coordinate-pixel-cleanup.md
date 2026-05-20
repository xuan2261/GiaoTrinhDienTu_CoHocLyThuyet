---
phase: 8
title: "P2 Coordinate Pixel Cleanup"
status: pending
priority: P2
effort: "3h"
dependencies: [1, 4, 5]
---

# Phase 8: P2 Coordinate Pixel Cleanup

## Overview

6 route có readout toạ độ bằng pixel (S2 list): `Điểm đặt (170; 290)`, `IC_x: 270`, `xG: 295px`, `x_C: 211`. Decision (user 2026-05-19): convert sang m với coordinate có nghĩa (xG, IC, x_C); bỏ với toạ độ phụ ("Điểm đặt"). Bind via `state.pxPerMeter` per-route — **KHÔNG** ROUTE_SCALE central table (red-team M2 fix).

## Requirements

**Functional:**
- xG/yG, IC_x/IC_y, x_C: hiển thị `m` với precision 2 chữ số
- "Điểm đặt" trong ch1-1-3 và ch1-1-8: bỏ readout (chỉ giữ visual marker trên canvas)
- Mỗi route đọc `state.pxPerMeter` (đã computed cho renderer) — single source of truth per-route
- Conversion happens at readout boundary, không thay state internal

**Non-functional:**
- Không thêm conversion utility shared dùng central scale table
- Resize-safe: pxPerMeter recompute khi canvas resize → readout tự update
- KHÔNG hard-code factor cho route nào

## Architecture

```
Per-route scene config (existing, verified live):
  state.pxPerMeter = canvas.width / SCENE_WIDTH_M  // computed once per mount + on resize

Readout binding:
  formatReadout(state.xG_px / state.pxPerMeter, { unit: 'm', precision: 2 })
  → "2.95 m"

NO central ROUTE_SCALE table. Each route owns its own pxPerMeter.
```

**Why no central table (red-team M2):**
- Each route already owns its canvas scale (verified per-route `pxPerM` constants live).
- Central map = second source of truth that drifts on canvas resize.
- Phase 04 hard cutover đã đưa `pxPerUnit` vào per-route control config — coordinate readout reuse cùng convention.

## Related Code Files

**Real shared per-chapter behavior files (grep `xG\|IC_x\|x_C\|"Điểm đặt"`):**

- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js` (ch1-1-3, ch1-1-8 — bỏ "Điểm đặt" readout key)
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` (ch1-6-2, ch1-6-3 — xG/yG readout binding)
- Modify per-chapter behavior files cho ch2-5-2 (IC_x/IC_y) và ch3-5-1 (x_C):
  - `js/sims/ch2/...kinematics-rigid-body-behaviors.js` hoặc tương tự — locate via grep
  - `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` hoặc sibling — locate via grep
- Modify: route scene configs để confirm `state.pxPerMeter` computed at mount + resize handler
- Modify: `tests/sim-review-2026-05-19/coordinate-pixel-cleanup.spec.js` (RED → GREEN)

KHÔNG create: `js/sim-coord-convert.js` central table — drop entirely.

## Implementation Steps (TDD)

### RED
- `coordinate-pixel-cleanup.spec.js` confirm fail.

### GREEN
1. **Bỏ "Điểm đặt" readout** cho ch1-1-3, ch1-1-8: xoá readout key trong scene config, giữ visual marker trên canvas.
2. **xG/yG cho ch1-6-2, ch1-6-3:** thay readout binding:
   ```js
   // Before:
   readout.xG = `${state.xG_px}px`;
   // After (P05 formatter):
   readout.xG = formatReadout(state.xG_px / state.pxPerMeter, { unit: 'm', precision: 2 });
   ```
3. **IC_x/IC_y cho ch2-5-2:** cùng pattern.
4. **x_C cho ch3-5-1:** cùng pattern.
5. **Resize handler audit:** confirm `state.pxPerMeter` recompute khi `canvas.resize`. Nếu chưa, add per-route resize listener.

### REFACTOR
- Nếu thấy 3+ route cùng compute `state.pxPerMeter = canvas.width / scene.widthM`, có thể lift helper. Default: KHÔNG abstract.

## Success Criteria

- [ ] 4 route hiển thị toạ độ m (precision 2): ch1-6-2, ch1-6-3, ch2-5-2, ch3-5-1
- [ ] 2 route ch1-1-3, ch1-1-8 bỏ readout "Điểm đặt"
- [ ] `tests/sim-review-2026-05-19/coordinate-pixel-cleanup.spec.js` PASS
- [ ] **NO** `js/sim-coord-convert.js` central table created
- [ ] Resize test: kéo canvas resize → readout xG cập nhật đúng
- [ ] `npm run test:sim:renderer-contract` PASS
- [ ] Visual baseline refresh qua `npm run test:sim:visual-quality:update`

## Risk Assessment

| Risk | Mitigation |
|---|---|
| `state.pxPerMeter` chưa computed trong một số route | Audit qua grep; nếu thiếu, add at mount + resize |
| User quen toạ độ pixel, đổi sang m gây confusion docs | Update `simulation-list.md` row Readouts |
| Phase 04 + Phase 08 cùng đụng pxPerUnit/pxPerMeter naming | Reuse cùng field `state.pxPerMeter`; document trong P04 migration log |

## Verification Gate

Phase 08 đóng khi: 6 route done, spec PASS, resize test PASS, baseline refresh, doc updated, no central scale table.
