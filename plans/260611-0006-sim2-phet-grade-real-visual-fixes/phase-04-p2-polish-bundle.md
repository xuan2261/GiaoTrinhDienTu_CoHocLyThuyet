---
phase: 4
title: "P2 — scout-only"
status: pending
priority: P3
effort: "1h"
dependencies: []
---

# Phase 4: P2 — SCOUT-ONLY (defer fix sau red-team)

## Overview
Red-team: bản nháp lập kế + TDD cho 5 file CHƯA đọc → ngưỡng đoán mò (anti-pattern: test đo theo kết quả). Hạ thành SCOUT-ONLY: đọc file, xác nhận finding nào còn THẬT, rồi mới lập phase sửa riêng (hoặc gộp re-capture sau Phase 2/3).

## Scope
- ch3-3-1 (x(t) trace chạm mép đáy — "borderline", chưa chắc clip thật)
- ch1-1-8, ch3-2-3, ch3-5-4 (dead-space dưới dầm/trục)
- **DROP ch1-1-3** (A- — quá nhẹ, không đáng fix; red-team Finding 7).

## Implementation Steps
1. Đọc 4 file: `js/sim2/sims/ch3/ch3-3-1.js`, `ch1/ch1-1-8.js`, `ch3/ch3-2-3.js`, `ch3/ch3-5-4.js`.
2. Với mỗi route: xác nhận finding còn thật không (đọc worldBox + content layout). ch3-3-1: trace y-min có chạm mép viewport thật không.
3. Sau Phase 2/3 re-capture: soi 4 route ở ảnh thật.
4. Ghi danh sách finding CÒN THẬT + ngưỡng worldBox có CƠ SỞ HÌNH HỌC (không phải số khớp ảnh).
5. Nếu còn finding thật → lập phase sửa riêng (TDD với ngưỡng đã có cơ sở). Nếu không → đóng.

## Success Criteria
- [ ] 4 file đã đọc; mỗi finding được xác nhận thật/giả dựa trên code + ảnh.
- [ ] KHÔNG viết test ngưỡng trước khi có cơ sở hình học.
- [ ] Output: danh sách fix thật (nếu có) để lập phase kế.

## Risk Assessment
- Risk: scout xong vẫn muốn sửa ngay → quay lại anti-pattern. Mitigation: phase này CHỈ scout; fix là phase mới với ngưỡng có cơ sở.
