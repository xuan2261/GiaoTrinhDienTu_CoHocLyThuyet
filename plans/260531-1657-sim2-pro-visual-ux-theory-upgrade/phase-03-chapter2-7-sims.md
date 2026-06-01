---
phase: 3
title: "Chương 2 — retrofit 7 sim động học"
status: done
priority: P2
effort: "1.5d"
dependencies: [1]
---

# Phase 3: Chương 2 — 7 sim động học

## Overview
Retrofit 7 sim Ch2: ch2-1-1, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-2, ch2-5-3.
Nhiều sim có animation + canvas underlay → trọng tâm playback + slider tham số động.

## Requirements
- Functional:
  - **Playback + slider**: ch2-1-1 (quỹ đạo: v,a), ch2-1-3 (tiếp/pháp tuyến + bán kính cong), ch2-2-2 (quay: ω, α), ch2-3-2 (truyền động: tỉ số), ch2-4-4 (Coriolis: ω, v_rel — đang hardcode, thêm slider thật).
  - **Bespoke/kéo**: ch2-5-2 (kéo vật rắn → IC), ch2-5-3 (phân bố vận tốc).
  - Panel lý thuyết + legend (v green, a orange, a_cor amber) + readout sống + quan sát.
- Non-functional: canvas trail đồng bộ SVG (giữ contract ≤1px); `Sim2Palette` thay hex.

## Architecture
Sim canvas: playback gọi `shell.start/stop`; slider đổi tham số áp ngay frame kế. Reset xóa trail + về t=0.

## Related Code Files
- Modify: `js/sim2/sims/ch2/{ch2-1-1,ch2-1-3,ch2-2-2,ch2-3-2,ch2-4-4,ch2-5-2,ch2-5-3}.js`
- Modify test: `tests/sim2-ch2-mount.spec.js`

## Implementation Steps (TDD)
1. Mở rộng `sim2-ch2-mount.spec.js`: control + panel + playback (⏸ dừng RAF) + canvas↔SVG khớp giữ. Chạy đỏ.
2. Retrofit từng sim; ch2-4-4 chuyển hardcode ω/v_rel → slider.
3. `npm run test:sim:mount` xanh Ch2.

## Success Criteria
- [ ] 7 route Ch2 có control + panel; ch2-4-4 hết hardcode (slider thật).
- [ ] canvas↔SVG ≤1px giữ; dispose sạch (RAF + listener).
- [ ] `npm run test:sim:mount` xanh.

## Risk Assessment
- **Slider giữa animation gây giật** → mitigation: áp tham số ở đầu frame, không reset trail trừ khi ↺.
- **Coriolis đổi từ auto sang điều khiển** → mitigation: giữ giá trị mặc định cũ làm initial slider value.
- **[RED-TEAM] start-paused phá test canvas verified**: `tests/sim2-ch2-mount.spec.js:48-58` chờ 350ms rồi assert canvas (ch2-1-1, ch2-4-4, ch2-5-3) có pixel — giả định autoplay. **Mitigation (bắt buộc)**: test bấm ▶ trước `waitForTimeout` rồi mới assert hasContent; giữ nguyên kiểm tra canvas↔SVG ≤1px.
