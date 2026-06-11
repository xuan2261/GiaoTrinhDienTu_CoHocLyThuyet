---
phase: 5
title: "__slider-hi capture tooling"
status: deferred
priority: P3
effort: "2h"
dependencies: []
---

# Phase 5: __slider-hi capture tooling — DEFERRED (sau red-team)

## Trạng thái: DEFER khỏi plan này → follow-up tooling riêng

Red-team (Finding 3) bác bỏ đưa vào plan hiện tại vì:
1. **Phá test gate đang bảo vệ.** Thêm shot runtime trong spec nhưng `buildCapturePlan` đếm riêng → `totalImgs === plannedShotTotal` (capture-sims.spec.js:124-127) đỏ trên mọi route có slider. Và làm đỏ unit test `['init','live']` (capture-plan.test.js:27).
2. **Acceptance tự mâu thuẫn.** "kéo slider tới MAX" (phase nháp:16) vs SC "r=min → ω lớn" (:45). Với ch3-5-3: max r=3.5 ⇒ ω min (ít kịch tính); init r=3 vs 3.5 chỉ lệch 17% → frame gần trùng init → **làm false-fail TỆ HƠN** đúng route ví dụ.
3. **Sửa vấn-đề-chấm, không phải defect sản phẩm.** Probe đã minh oan ch3-5-3/ch3-1-3 rồi (plan.md:31-35). Bỏ 2h tooling để chứng minh lại = YAGNI.

## Nếu làm follow-up (ghi chú cho sau)
- Một nguồn sự thật: detect slider TRƯỚC `buildCapturePlan`, truyền cờ qua opts thứ 4 (không nhét vào classifyMap string-union) → plan sinh shot, runner chỉ chụp theo plan.
- Frame nên là biên TƯƠNG PHẢN init mạnh nhất (ch3-5-3 → min), hoặc cả min+max; sửa SC cho khớp.
- Thêm test case MỚI cho label slider, không sửa case `init/live` cũ.

## Success Criteria (khi follow-up)
- [ ] `buildCapturePlan` + runner đồng bộ count; unit test cũ KHÔNG đỏ.
- [ ] Frame slider thật sự khác init; ch3-5-3 frame chứng minh feedback.
