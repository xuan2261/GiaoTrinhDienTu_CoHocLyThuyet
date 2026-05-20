---
phase: 11
title: "P3 Redesign Dynamics — ch3-5-3 (ch3-7-2 split-plan)"
status: pending
priority: P3
effort: "3h"
dependencies: [1, 2, 4, 5, 6]
---

# Phase 11: P3 Redesign Dynamics ch3-5-3

## Overview

1 route Dynamics gần như rỗng/sơ sài ở default state:
- **ch3-5-3 Mô men động lượng**: panel `MÔ MEN ĐỘNG LƯỢNG` rỗng; chỉ vẽ 1 vector m/r; readout `L: 2` thiếu unit (P5 đã cover unit).

**ch3-7-2 đã tách sang plan riêng** (user-confirmed 2026-05-20). ch3-7-2 là input-check feature (bảng 4 hàng T/V/p/L + drag handle moc + RK4 reuse + sai lệch %) — không phải bug fix mà là graded-exercise UX. Lift sang plan riêng `plans/2606XX-...-ch1-2-3-7-2-graded-exercise-input-check/` cùng các sibling ch1-7-2, ch2-7-2.

Phase 11 chỉ scope ch3-5-3, single-route redesign.

## Requirements

ch3-5-3:
- Panel `MÔ MEN ĐỘNG LƯỢNG` có nội dung default: hiển thị `L = I·ω` công thức + giá trị hiện tại
- Vẽ rotating mass with arc trail thể hiện chuyển động quay
- Vector r và v đính kèm

## Related Code Files

**Real shared per-chapter behavior files (grep-verified):**

- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` — scene config + behavior cho ch3-5-3 (cohabit với ch3-5-1, ch3-5-2 — đã fix P02 mount-time evaluate, ch3-5-4 — đã thêm autoplay-pause P06, ch3-6-2 — đã thêm autoplay-pause P06).
- Modify: `js/sims/ch3/ch3-theorems-renderers.js:39,110` — render cho ch3-5-3.
- Modify: `tests/sim-review-2026-05-19/route-redesign-checks.spec.js` (ch3-5-3 only; ch3-7-2 EXCLUDED — split plan).

## Implementation Steps (TDD)

### RED
- spec confirm fail (panel empty + readout missing).

### GREEN

ch3-5-3:
1. Trong `ch3-dynamics-theorem-collision-behaviors.js` `routeId === 'ch3-5-3'` block: panel hiển thị `L = I·ω = 1.0 · 2.0 = 2.0 kg·m²/s` (live update với P05 formatter).
2. Renderer `ch3-theorems-renderers.js`: vẽ chuyển động quay — m điểm trên đường tròn, vector r, v, mv. Arc trail cho mass position history.
3. Auto-update khi user kéo I hoặc ω.
4. **Anti-regression**: ch3-5-1, ch3-5-2 (P02 mount-time evaluate), ch3-5-4 (P06 autoplay-pause), ch3-6-2 (P06 autoplay-pause) readout + visual bất biến.

### REFACTOR
- KHÔNG extract helpers ở phase này — single route, không có duplication signal.

## Success Criteria

- [ ] ch3-5-3 panel có content default `L = I·ω = ...`; capture mới
- [ ] Renderer vẽ rotating mass + arc trail + vectors r, v
- [ ] `tests/sim-review-2026-05-19/route-redesign-checks.spec.js` (ch3-5-3 portion) PASS
- [ ] **Anti-regression sibling**: ch3-5-1, ch3-5-2, ch3-5-4, ch3-6-2 readout + visual bất biến
- [ ] `npm run test:sim:browser` PASS
- [ ] Visual baseline refresh + side-by-side diff approved
- [ ] ch3-7-2 KHÔNG có thay đổi trong phase này (split plan note in commit)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Sửa shared file ch3-dynamics-theorem-collision-behaviors.js phá P02/P06 fixes | Anti-regression test fixtures cho ch3-5-1, ch3-5-2, ch3-5-4, ch3-6-2 trước commit |
| Arc trail render perf | Limit trail buffer tới 30 frames; clear khi reset |

## Verification Gate

Phase 11 đóng khi: ch3-5-3 redesign, spec PASS (ch3-5-3 portion), sibling anti-regression PASS, baseline refresh, ch3-7-2 split-plan note committed.

## ch3-7-2 Split-Plan Note

ch3-7-2 đã tách sang plan riêng. Scope của split-plan:
- Bảng 4 hàng (T, V, p, L) với cột "Đáp án bạn nhập" + "Engine value" + "Sai lệch %"
- Drag handle moc → t_check
- Engine compute giá trị tại t_check, so với input, hiển thị green/red
- Reuse RK4 integrator từ ch3-3-1
- Sibling routes ch1-7-2, ch2-7-2 cũng nằm trong split-plan (likely same graded-exercise pattern).

Tạo split-plan trước khi đóng plan này: `plans/2606XX-...-graded-exercise-input-check-ch1-2-3-7-2/`. Ngày khởi động sau khi plan 260519-2142 archive.
