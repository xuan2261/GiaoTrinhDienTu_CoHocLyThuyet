---
phase: 2
title: "Fix ch2-4-4 nhãn Coriolis chồng"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 2: Fix ch2-4-4 nhãn Coriolis chồng

## Overview
Nhãn `a_cor` chồng `v_rel` trên cụm vector ngắn ở đỉnh đĩa quay. Tăng khoảng tách + đẩy nhãn theo hướng vector để không đè nhau.

## Requirements
- Functional: nhãn `v_rel` và `a_cor` không chồng nhau ở mọi pha quay; mỗi nhãn nằm gần đúng vector của nó (lục=v_rel, hổ phách=a_cor).
- Non-functional: KHÔNG đổi physics (coriolis fn), KHÔNG đổi vector vẽ. Chỉ chỉnh vị trí/offset nhãn DOM.

## Architecture
File `js/sim2/sims/ch2/ch2-4-4.js`. Hiện (`:59-60`):
```
overlay.moveLabel(lblVr, { x: p.x + ur.x*0.9,  y: p.y + ur.y*0.9 });
overlay.moveLabel(lblAc, { x: p.x + acDir.x*1.15, y: p.y + acDir.y*1.15 });
```
`v_rel` đẩy dọc hướng bán kính `ur`; `a_cor` dọc hướng `acDir` (vuông góc). Khi cả hai vector ngắn, 0.9 và 1.15 quá gần → 2 pill chồng.

Sửa: tăng hệ số đẩy nhãn (vd v_rel 0.9→1.1, a_cor 1.15→1.7) để tách rõ theo 2 hướng vuông góc; vì 2 hướng đã ⊥ nhau, tăng độ dài đẩy là đủ tách. Tùy chọn: thêm `fontSize` nhỏ hơn nếu vẫn chật.

## Related Code Files
- Modify: `js/sim2/sims/ch2/ch2-4-4.js`

## Implementation Steps
1. **TDD (capture-as-check):** before = `ch2-4-4__mid.png` (triage đã có, thấy chồng).
2. Tăng hệ số đẩy nhãn `lblVr` và `lblAc` (đẩy xa tâm điểm hơn theo hướng riêng); giữ nguyên anchor.
3. Nếu cần, thêm offset vuông góc nhỏ cho 1 nhãn để chống chồng khi 2 vector gần song song ở pha nào đó.
4. `npm run test:sim:mount` (ch2 mount + ui-coverage: nhãn DOM không chồng) → xanh.
5. Capture lại `ch2-4-4` ở vài pha (mid) → 2 nhãn tách rõ.

## Success Criteria
- [ ] `a_cor` và `v_rel` không chồng ở pha mid (và các pha khác qua step)
- [ ] Nhãn vẫn gần vector tương ứng (không trôi xa gây mơ hồ)
- [ ] `test:sim:mount` xanh; physics/vector không đổi
- [ ] Capture mới xác nhận

## Risk Assessment
- Đẩy nhãn quá xa → trôi khỏi đĩa hoặc xa vector gây khó liên hệ. Mitigate: tăng vừa phải, kiểm bằng capture nhiều pha (step ⏭).
- Pha quay làm 2 hướng đôi lúc gần song song → vẫn chồng. Mitigate: thêm offset vuông góc nhỏ cố định cho a_cor.
