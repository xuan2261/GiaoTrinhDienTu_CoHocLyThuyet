---
phase: 4
title: "Verify probe + capture + release"
status: completed
priority: P1
effort: "1h"
dependencies: [1, 2, 3]
---

# Phase 4: Verify probe + capture + release

## Overview
Gom verify cuối sau 3 fix: chạy đủ gate (physics/mount/release), probe xác nhận e-slider chuyển live, capture lại 3 route đối chiếu visual before/after.

## Requirements
- Functional: `test:sim:release` xanh; `test:sim:physics` 9/9 không đổi; `test:sim:probe` ch3-6-2 e-slider live (2 dead→0), không phát sinh dead/mismatch mới; capture 3 route mới rõ nhãn.
- Non-functional: KHÔNG sửa thêm sim ở phase này (chỉ verify). Nếu phát hiện regression → quay lại phase tương ứng.

## Architecture
Chỉ chạy lệnh + soi, không sửa code (trừ khi verify lộ lỗi → về P1/P2/P3).
```
npm run test:sim:physics      # 9/9 giữ nguyên (chốt physics bất biến)
npm run test:sim:mount        # nhãn không chồng, canvas khớp, start-paused
npm run test:sim:release      # gate tổng offline
npm run test:sim:probe        # ch3-6-2 e live; tổng dead giảm, 0 mismatch mới
npm run test:sim:visual:capture  # chụp lại 25 route (gồm ch2-4-4, ch3-5-2, ch3-6-2)
```

## Related Code Files
- KHÔNG sửa. Đọc: interaction-probe.json mới, ảnh capture mới.

## Implementation Steps
1. Chạy `test:sim:physics` → xác nhận 9/9 PASS không đổi.
2. Chạy `test:sim:mount` → xanh (nhãn ch2-4-4/ch3-5-2 không chồng; ch3-6-2 panel thêm row vẫn pass).
3. Chạy `test:sim:probe` → so với baseline triage: ch3-6-2/e + #sim3/e chuyển live; tổng dead 2→0; B vẫn 23/23 match, 0 mismatch mới.
4. Chạy `test:sim:release` → xanh.
5. Capture lại; soi `ch2-4-4__mid`, `ch3-5-2__live`, `ch3-6-2` → nhãn rõ, không chồng, p(t) đúng đường.
6. Nếu bước nào fail → ghi rõ route+trục, quay lại phase nguồn sửa, KHÔNG patch ở đây.

## Success Criteria
- [ ] `test:sim:physics` 9/9 không đổi
- [ ] `test:sim:mount` + `test:sim:release` xanh
- [ ] `test:sim:probe`: ch3-6-2 e-slider live; 0 mismatch mới; tổng dead giảm
- [ ] Capture 3 route xác nhận visual sửa đúng

## Risk Assessment
- **Probe B rowIndex dịch do P3 thêm row** → false mismatch ở ch3-6-2 (nhưng ch3-6-2 bMode scene-delta = skip B, nên an toàn). Kiểm route khác không thêm row → B không đổi.
- **Capture brittle**: chỉ soi mắt 3 route đổi, không so pixel toàn bộ (tránh false diff). Dùng before từ triage làm đối chiếu.
