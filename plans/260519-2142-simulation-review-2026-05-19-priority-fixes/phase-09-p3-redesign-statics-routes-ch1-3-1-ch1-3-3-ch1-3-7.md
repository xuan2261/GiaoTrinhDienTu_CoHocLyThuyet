---
phase: 9
title: "P3 Redesign Statics Group A — ch1-3-1 ch1-3-3 ch1-3-7"
status: pending
priority: P3
effort: "8h"
dependencies: [1, 2, 4, 5, 7]
---

# Phase 9: P3 Redesign Statics Group A

## Overview

3 route Statics có lỗi visual/hình học rõ rệt cần redesign scene:
- **ch1-3-1 Phản lực pháp tuyến tựa trơn**: block "vật" lơ lửng giữa hai bề mặt, không tiếp xúc rõ với mặt nào.
- **ch1-3-3 Thành phần phản lực bản lề**: vector đỏ (F?) không có nhãn; readout "Loại liên kết: 98" raw number.
- **ch1-3-7 Thanh hai lực theo trục**: mũi tên xanh trái bị clip ra ngoài canvas; thanh trắng vẽ lệch trục dashed.

ch1-3-3 ordering pinned: P04 widget choice → P05 mapper → **P09 scene refresh** (cuối chuỗi). Phase 09 chỉ refresh scene SAU KHI value space + mapper đã chốt ở P04/P05.

## Requirements

**Functional per route:**

ch1-3-1:
- Block "vật" tiếp xúc rõ với một mặt cụ thể (mặt phẳng nghiêng hoặc mặt ngang)
- Cung 90° gắn trực tiếp vào điểm tiếp xúc, không lơ lửng
- N vector vẽ từ điểm tiếp xúc, vuông góc bề mặt

ch1-3-3:
- Loại liên kết = label thay vì raw number (Phase 05 đã cover qua DISCRETE_MAPPERS)
- Widget value space `{0..4}` (P04 đã chốt)
- Vector force tác dụng (F) có nhãn rõ ràng
- A_x, A_y đặt tách biệt với offset đủ (qua `drawLabelOffset` từ P07)

ch1-3-7:
- Mũi tên N nằm hoàn toàn trong canvas (clamp endpoint hoặc shrink scale)
- Thanh trắng nằm chính xác trên trục dashed cam (geometry alignment)

## Related Code Files

**Real shared per-chapter behavior files (grep-verified — ch1-3-1..ch1-3-7 cohabit cùng file):**

- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js` — scene config + behavior cho ch1-3-1, ch1-3-3, ch1-3-7 (cùng 4 route khác cùng file: ch1-3-2, ch1-3-4, ch1-3-5, ch1-3-6 — anti-regression mandatory)
- Modify: `js/sims/ch1/ch1-support-renderers.js:160,163` — render code cho ch1-3-x family
- Modify: `tests/sim-review-2026-05-19/route-redesign-checks.spec.js` (RED → GREEN cho 3 route)

**Cross-phase coupling on ch1-3-3:**
- P04 đã chốt widget value space `{0..4}` + xoá legacy slider plumbing
- P05 đã build DISCRETE_MAPPERS['ch1-3-3-link-type']
- P09 build scene around new value space — không revisit widget choice

## Implementation Steps (TDD)

### RED
- `route-redesign-checks.spec.js` đã có check riêng cho 3 route, confirm fail.

### GREEN

**ch1-3-1:**
1. Trong `ch1-support-spatial-behaviors.js`, scene config cho `routeId === 'ch1-3-1'`:
   - Decide canonical surface: vật trên mặt nghiêng (giữ thanh nghiêng dashed, vật snap lên trục).
   - Anchor `state.contactPoint = { x, y }` tính từ slider angle + body position.
2. Renderer (`ch1-support-renderers.js:160`): vẽ N từ `state.contactPoint`, vuông góc trục.
3. Cung 90° gắn vào `state.contactPoint`.

**ch1-3-3:**
1. Widget = button-group (P04 đã chốt). Confirm value space `{0..4}` mapping cho `Tựa/Dây/Bản lề/Gối/Ngàm`.
2. Renderer: vẽ F vector với nhãn `F` qua `drawLabelOffset` từ P07.
3. A_x, A_y labels: per-route offset table trong `js/sim-label-tables.js` để tách biệt.

**ch1-3-7:**
1. Geometry alignment: thanh trắng vẽ parametric từ điểm A trên trục dashed cam, kéo dài theo direction.
2. Vector N magnitude clamp: `min(state.N_magnitude, canvasBounds.maxArrowLength - 20)`.
3. Marker xác định endpoint trong frame.

**Anti-regression cho 4 route sibling cùng file** (ch1-3-2, ch1-3-4, ch1-3-5, ch1-3-6):
- Test fixtures so sánh readout values pre/post fix → bất biến.
- Visual snapshot diff cho 4 route — chỉ chấp nhận thay đổi nếu là byproduct cố ý của P09.

### REFACTOR
- Nếu 3 route share helper "vẽ vật lên mặt nghiêng", extract trong `js/sim-route-renderer-primitives.js`.

## Success Criteria

- [ ] 3 route capture mới tuân acceptance criteria
- [ ] `tests/sim-review-2026-05-19/route-redesign-checks.spec.js` PASS cho 3 route
- [ ] **Anti-regression**: ch1-3-2, ch1-3-4, ch1-3-5, ch1-3-6 readout + visual bất biến
- [ ] ch1-3-3 widget+mapper alignment confirmed (no raw "Loại liên kết: 98")
- [ ] `npm run test:sim:browser:route-mount` PASS
- [ ] Visual baseline refresh + side-by-side diff approved trong PR
- [ ] Đối chiếu nội dung với `simulation-list.md` (giữ ý nghĩa khoa học)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Redesign thay đổi scene baseline > 50% | Cảnh báo reviewer, attach side-by-side diff trong phase report |
| Sửa `ch1-support-spatial-behaviors.js` phá 4 sibling routes | Anti-regression test fixtures cho ch1-3-2/3-4/3-5/3-6 readouts; visual snapshot diff manual review |
| ch1-3-3 widget value space khác với P05 mapper | Hard-pin ordering P04 → P05 → P09; nếu drift, escalate user trước GREEN |
| Học viên đã quen scene cũ | Cảnh báo trong changelog |

## Verification Gate

Phase 09 đóng khi: 3 route redesign, spec PASS, sibling anti-regression PASS, baseline refresh, side-by-side diff included in phase report.
