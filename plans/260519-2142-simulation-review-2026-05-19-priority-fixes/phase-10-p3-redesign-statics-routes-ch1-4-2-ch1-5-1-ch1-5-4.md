---
phase: 10
title: "P3 Redesign Statics Group B — ch1-4-2 ch1-5-1 ch1-5-4"
status: pending
priority: P3
effort: "8h"
dependencies: [1, 2, 4, 5, 7]
---

# Phase 10: P3 Redesign Statics Group B

## Overview

3 route Statics khó hiểu nhất với người học:
- **ch1-4-2 Hình chiếu mô men không gian**: quá nhiều vector + dashed nhưng không nhãn rõ, không phân biệt được M_O, M_axis, e.
- **ch1-5-1 Phân tích lực tiếp xúc**: label R/RR/vật/N overlap trong khối nhỏ; panel `TAM GIÁC TIẾP XÚC` (tam giác xanh) ngồi sau khối, không gắn ngữ nghĩa.
- **ch1-5-4 Tự hãm nêm và vít**: vector N, label `tải` lơ lửng giữa canvas, không gắn đỉnh nêm.

**Phụ thuộc Phase 02 anti-regression cho ch1-4-2** — Phase 02 đã sửa `moment` derive trong `ch1-support-spatial-behaviors.js:77` cho ch1-3-6. ch1-4-2 cùng dùng derive này; P10 redesign scene KHÔNG được phá readout `M_O` / `M_axis` đã pass anti-regression test ở P02.

## Requirements

ch1-4-2:
- Legend rõ: `M_O` (mô men quanh O), `M_axis` (chiếu lên trục e), `e` (đơn vị trục)
- Mỗi vector có nhãn + màu đặc trưng
- Box "Cách đọc" bên phải canvas (hoặc inspector slot)

ch1-5-1:
- Tam giác tiếp xúc gắn vào điểm tiếp xúc body↔mặt sàn
- Vector R, N, F_ms tách rời (không overlap) bằng `drawLabelOffset` + per-route offset table từ P07
- Bỏ label `RR` (rõ là duplicate của R)

ch1-5-4:
- "Tải" gắn đỉnh nêm (drag handle on top of wedge)
- N vector từ tải hướng xuống, gắn body
- Hai cung α, φ rõ rệt với offset đủ

## Related Code Files

**Real shared per-chapter behavior files (grep-verified):**

- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js` — scene config cho ch1-4-2 (cohabit với ch1-3-1..ch1-3-7, ch1-4-1, ch1-4-4 family). **Anti-regression** với 7+ sibling routes.
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` — scene config + behavior cho ch1-5-1 và ch1-5-4 (cohabit với ch1-5-2, ch1-5-3 — sau P02 fix narrow scope).
- Modify: `js/sims/ch1/ch1-support-renderers.js` — render cho ch1-4-2.
- Modify: `js/sims/ch1/ch1-friction-renderers.js:86` — render cho ch1-5-1, ch1-5-4.
- Modify: `js/sim-label-tables.js` — offset entries cho new labels (R/N/F_ms cho ch1-5-1, M_O/M_axis/e cho ch1-4-2, tải/N/cung cho ch1-5-4).
- Modify: `tests/sim-review-2026-05-19/route-redesign-checks.spec.js` (RED → GREEN).

## Implementation Steps (TDD)

### RED
- spec confirm fail.

### GREEN

**ch1-4-2:**
1. Trong `ch1-support-spatial-behaviors.js` `routeId === 'ch1-4-2'` block: refactor scene để vector M_O ở O, vector e màu vàng, projection M_axis tô đậm.
2. Mỗi vector qua `drawLabelOffset` (Phase 07) với offset entries trong `js/sim-label-tables.js`.
3. Inspector slot bên phải có legend (axonometric projection, label color key).
4. **Anti-regression with P02**: readout `M_O`, `M_axis` giữ giá trị từ P02 fix (cùng `moment` derive line 77). Test fixtures pre/post.

**ch1-5-1:**
1. Trong `ch1-friction-centroid-solver-behaviors.js` `routeId === 'ch1-5-1'` block: tam giác tiếp xúc gắn `state.contactPoint` (anchor cụ thể).
2. Force decomposition R = N + F_ms với offset labels.
3. Bỏ readout `R` duplicate (phía panel + phía canvas chỉ giữ 1).

**ch1-5-4:**
1. Drag handle "tải" trên đỉnh nêm: `state.loadAnchor = wedgeApex(state.alpha)`.
2. Vector N nối handle xuống body.
3. Cung α tại đáy nêm, cung φ ở vị trí tự hãm reference.
4. **Anti-regression**: ch1-5-2, ch1-5-3 (đã sửa P02 narrow scope) bất biến.

### REFACTOR
- Extract `drawWedgeWithLoad`, `drawContactTriangle` chỉ nếu shared helper hợp lý sau khi cả 3 route GREEN — không tạo abstraction giả.

## Success Criteria

- [ ] 3 route redesign theo acceptance
- [ ] `tests/sim-review-2026-05-19/route-redesign-checks.spec.js` PASS
- [ ] **Anti-regression P02**: ch1-4-2 readout `M_O`, `M_axis` bất biến sau redesign
- [ ] **Anti-regression sibling**: ch1-3-x family + ch1-4-1, ch1-4-4 (cohabit với ch1-4-2 file) + ch1-5-2, ch1-5-3 (cohabit với ch1-5-1/5-4 file) readout + visual bất biến
- [ ] Visual baseline refresh + side-by-side diff approved
- [ ] Side-by-side diff trong phase report

## Risk Assessment

| Risk | Mitigation |
|---|---|
| ch1-4-2 vector không gian khó vẽ 2D | Sử dụng axonometric projection; inspector text giải thích |
| Sửa shared file ch1-support-spatial-behaviors.js phá ch1-3-x family | Anti-regression test fixtures cho 7 sibling routes ch1-3-1..ch1-3-7 + ch1-4-1, ch1-4-4 |
| ch1-5-4 wedge interaction phức tạp | Pilot drag handle trước, test với touch |
| ch1-4-2 redesign phá P02 moment derive fix | Test fixtures cho readout values từ P02 — bất biến |

## Verification Gate

Phase 10 đóng khi: 3 route redesign, spec PASS, sibling anti-regression PASS, P02 anti-regression PASS, baseline refresh approved.
