---
phase: 1
title: "Fix ch3-5-2 nhãn đồ thị p(t)"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Fix ch3-5-2 nhãn đồ thị p(t)

## Overview
Sửa nhãn lệch chỗ trên đồ thị xung lượng: nhãn "p(t)" hiện đặt ở baseline trùng đường cam (xung lượng), trong khi đường lục p(t) dâng lên không có nhãn. Người đọc tưởng đường cam là p(t).

## Requirements
- Functional: nhãn "p(t)" bám gần đỉnh đường lục (`pLine`); đường cam `impulseSpan` có nhãn riêng (vd "J = F·t" / "xung lượng"). Màu nhãn khớp màu đường.
- Non-functional: KHÔNG đổi màu đường, KHÔNG đổi physics/công thức. Không thêm dependency.

## Architecture
File `js/sim2/sims/ch3/ch3-5-2.js`. Hiện:
- `pLine` = `Pal.v` (lục), điểm cuối đồ thị ở `(gx0+gw, gy ≈ pMax-scaled)`.
- nhãn `p(t)` đặt cố định `{x: gx0+gw, y: gy0}` = baseline (`ch3-5-2.js:33`) → trùng đường cam.
- `impulseSpan` = `Pal.resultant` (cam) ở `y=gy0` baseline, không nhãn.

Sửa:
1. Giữ tham chiếu nhãn p(t) (`const lblP = overlay.label(...)`) thay vì tạo rồi quên.
2. Trong `render2()`, sau khi tính `pts`, `moveLabel(lblP, ...)` tới điểm cuối đường lục (`x = gx0+gw`, `y` = giá trị p cuối đã scale) + offset nhẹ lên trên.
3. Thêm `lblJ = overlay.label('J = F·t', {baseline}, {color: Pal.resultant, anchor})` cho đường cam.

## Related Code Files
- Modify: `js/sim2/sims/ch3/ch3-5-2.js`

## Implementation Steps
1. **TDD (capture-as-check):** chụp `ch3-5-2` trước sửa (đã có `__live.png` từ triage) làm before.
2. Gán `lblP` cho nhãn p(t); trong `render2()` move nó tới đỉnh đường lục (tính lại `gy` điểm cuối = `gy0 + (pMax/(pMax||1))*gh`).
3. Thêm nhãn cam `J = F·t` ở baseline đường impulse.
4. Chạy `npm run test:sim:mount` (tests ch3 mount + ui-coverage) → xanh.
5. Capture lại `ch3-5-2` → nhãn p(t) ở đường lục, nhãn J ở đường cam, không chồng.

## Success Criteria
- [ ] Nhãn "p(t)" nằm cạnh đường lục, không cạnh đường cam
- [ ] Đường cam có nhãn xung lượng riêng
- [ ] `test:sim:mount` xanh; physics không đổi
- [ ] Capture mới xác nhận bằng mắt

## Risk Assessment
- Nhãn p(t) ở đỉnh đường có thể tràn mép card khi pMax nhỏ → clamp y trong play-area. Mitigate: dùng cùng pattern clamp như label khác, kiểm bằng capture ở F thấp/cao.
