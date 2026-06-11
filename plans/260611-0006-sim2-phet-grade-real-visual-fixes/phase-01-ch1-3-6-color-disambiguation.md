---
phase: 1
title: "ch1-3-6 R/M — verify-bằng-mắt trước"
status: pending
priority: P3
effort: "0.5h"
dependencies: []
---

# Phase 1: ch1-3-6 R/M — verify-bằng-mắt TRƯỚC (hạ cấp sau red-team)

## Overview
Report blind chấm R/M ch1-3-6 "cùng tím khó phân biệt". Red-team (3 reviewer) phản biện: shape đã phân biệt triệt để + 2 màu thực ra khác hue. Nhiều khả năng blind over-grade. → KHÔNG sửa mù; verify bằng mắt trước, chỉ sửa nếu thật sự còn lẫn.

## DIVERGENCE (red-team — đọc kỹ)
- `rArrow` = mũi tên THẲNG đứng (ch1-3-6.js:27); `momentArc` = CUNG 270° + marker-end (dòng 31-42). **Đã khác hình triệt để.**
- `Pal.reaction=#b10dc9` (magenta-tím) vs `Pal.moment=#7c3aed` (lam-tím) — **khác hue rõ**, không "cùng tím" như report.
- Đề xuất dash ban đầu = đòn bẩy có thể vô hiệu (giống ch2-4-4 trước); test "dasharray!=none" là phantom (assert thuộc tính, không chứng minh phân biệt).

## Requirements
- Xác nhận bằng mắt (re-capture sau Phase 2/3) R vs M có thật sự lẫn không.
- Chỉ sửa NẾU còn lẫn; KHÔNG đổi token global.

## Implementation Steps
1. Sau khi Phase 2+3 xong + re-capture, soi ảnh ch1-3-6 ở kích thước thật.
2. Nếu R (mũi tên) và M (cung) phân biệt rõ → ĐÓNG phase, không sửa (blind over-grade).
3. Nếu vẫn lẫn (2 hình nhỏ chụm góc ngàm, pixel-space r=14-34px — ch1-3-6.js:63): cân nhắc tách bằng width/opacity (R đậm liền, M mảnh) HOẶC dời M ra xa ngàm. KHÔNG đổi token. Thêm 1 assertion behavioral (không phantom) nếu sửa.

## Success Criteria
- [ ] Quyết định dựa trên ảnh thật, không dựa blind grade.
- [ ] Nếu không sửa: ghi lý do (shape+hue đã phân biệt). Nếu sửa: assertion behavioral + `test:sim:release` xanh.

## Risk Assessment
- Risk: sửa thừa một non-problem. Mitigation: verify-bằng-mắt là cổng bắt buộc trước khi chạm code.
