---
phase: 4
title: "Chương 3 — retrofit 7 sim động lực còn lại"
status: done
priority: P2
effort: "1.5d"
dependencies: [1]
---

# Phase 4: Chương 3 — 7 sim động lực còn lại

## Overview
Retrofit 7 sim Ch3 còn lại (pilot ch3-6-2 xong ở P1): ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1,
ch3-5-2, ch3-5-3, ch3-5-4. Trọng tâm: định luật + định lý, nhiều sim animation/ODE.

## Requirements
- Functional: slider + playback + panel + legend + readout sống cho mỗi sim:
  - ch3-2-2 (Newton F=ma: F, m), ch3-2-3 (lực–phản lực), ch3-1-3 (HQC quán tính vs phi quán tính),
    ch3-3-1 (ODE RK4: điều kiện đầu — ném xiên/dao động), ch3-5-2 (động lượng & xung lượng),
    ch3-5-3 (bảo toàn mô men động lượng: đổi bán kính → ω), ch3-5-4 (động năng: công vs T).
- Non-functional: KHÔNG đụng physics RK4/port; `Sim2Palette` thay hex; canvas↔SVG khớp.

## Architecture
ODE sim (ch3-3-1): slider đặt điều kiện đầu, ↺ tích phân lại từ t=0. Bảo toàn mô men (ch3-5-3):
slider bán kính → ω cập nhật theo `L=Iω` (đọc từ physics port, không tự tính lại).

## Related Code Files
- Modify: `js/sim2/sims/ch3/{ch3-2-2,ch3-2-3,ch3-1-3,ch3-3-1,ch3-5-2,ch3-5-3,ch3-5-4}.js`
- Modify test: `tests/sim2-ch3-mount.spec.js`

## Implementation Steps (TDD)
1. Mở rộng `sim2-ch3-mount.spec.js`: control + panel + playback + readout sống cho 7 route. Chạy đỏ.
2. Retrofit từng sim; giữ lời gọi physics port nguyên trạng (chỉ wrap UI quanh).
3. `npm run test:sim:mount` xanh Ch3.

## Success Criteria
- [ ] 8 route Ch3 (gồm pilot ch3-6-2) đồng bộ component.
- [ ] physics port KHÔNG đổi (grep diff `js/sim2/physics/*` = rỗng).
- [ ] `npm run test:sim:mount` xanh; dispose sạch.

## Risk Assessment
- **ODE reset không sạch state** → mitigation: ↺ khởi tạo lại mảng trail + t=0 + vận tốc đầu.
- **Đổi tham số phá bảo toàn (test physics)** → mitigation: chỉ đổi initial, không đổi giữa tích phân; physics Node test giữ nguyên.
- **[RED-TEAM] start-paused phá test graph verified**: `tests/sim2-ch3-mount.spec.js:46-56` chờ 400ms rồi assert `ch3-2-2` graph có >2 điểm — giả định autoplay. **Mitigation (bắt buộc)**: test bấm ▶ trước `waitForTimeout` rồi mới assert graph; giữ nguyên ngưỡng >2 điểm.
