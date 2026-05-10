---
title: "[CANCELLED] Simulation Visual & UX Upgrade"
description: "Nâng cấp giao diện (Visual) và trải nghiệm tương tác (UX) cho các mô phỏng Canvas, hỗ trợ Dark Mode và cải thiện Hitbox/Drag."
cancelReason: "Hủy 2026-05-08: Kiến trúc Phương án B — Scene Graph + Constraint-based redesign được chọn. Plan này là in-place upgrade, không phù hợp với ground-up redesign. Thay thế bởi 260508-2106-simulation-redesign."
description: "Nâng cấp giao diện (Visual) và trải nghiệm tương tác (UX) cho các mô phỏng Canvas, hỗ trợ Dark Mode và cải thiện Hitbox/Drag."
status: cancelled
priority: P1
branch: ""
tags: [simulation, frontend, visual, ux, dark-mode]
blockedBy: [260508-0913-simulation-interaction-visual-quality-hardening, 260508-1435-simple-simulation-lab-assessment-removal]
blocks: []
created: "2026-05-07T11:55:47.073Z"
createdBy: "ck:plan"
source: skill
---

# Simulation Visual & UX Upgrade

## Overview

Dựa trên kết quả debug và đánh giá thực trạng (Visual rỗng, lỗi Dark Mode, UX tương tác kém, chữ đè hình), dự án sẽ tiến hành nâng cấp toàn diện tầng Rendering & Interaction của engine mô phỏng. 
Mục tiêu là "Make it Pop" - tái sử dụng core toán học/vật lý hiện tại để đảm bảo tính ổn định, đồng thời cải thiện giao diện hiển thị cho trực quan, sinh động và dễ thao tác hơn.

Blocked update 2026-05-08: plan này phải chờ [Simulation Interaction & Visual Quality Hardening](../260508-0913-simulation-interaction-visual-quality-hardening/plan.md) và [Simple Simulation Lab and Assessment Removal](../260508-1435-simple-simulation-lab-assessment-removal/plan.md). Audit mới cho thấy cần sửa route-owned interaction contract; user cũng đã duyệt đổi shell đơn giản và xóa assessment trước khi polish visual/dark-mode.

Unblocked update 2026-05-08: [Simple Simulation Lab Debug Verification Hardening](../260508-1921-simple-simulation-lab-debug-verification-hardening/plan.md) đã completed với release gate pass, nên không còn là blocker của visual work.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [UI Design & Dark Mode](./phase-01-ui-design-dark-mode.md) | Pending |
| 2 | [UX Hitbox & Drag Refactor](./phase-02-ux-hitbox-drag-refactor.md) | Pending |
| 3 | [Anti-Overlap Logic](./phase-03-anti-overlap-logic.md) | Pending |
| 4 | [Verification & Testing](./phase-04-verification-testing.md) | Pending |

## TODO (Để làm sau)

### Hướng 3: Áp dụng Engine Vật lý chuyên dụng (Matter.js / p5.js)
* **Cách làm**: Nhúng một thư viện vật lý 2D chuẩn công nghiệp (như Matter.js) để xử lý toàn bộ Tĩnh học, Động lực học.
* **Ưu điểm**: Trải nghiệm tương tác vật lý cực kỳ chân thực (ví dụ: thả một quả nặng, nó sẽ đung đưa và va chạm như thật).
* **Nhược điểm**: Overkill (quá mức cần thiết). Tốn rất nhiều thời gian để "thuần hóa" thư viện vật lý sao cho nó đứng im hoặc chạy đúng theo các kịch bản lý tưởng của giáo trình lý thuyết.

## Dependencies

- Yêu cầu mã nguồn hiện tại của `sim-rendering.js` và `sim-interactions.js`.
- Cần chạy đầy đủ các Unit Tests của hệ thống mô phỏng sau mỗi phase để tránh làm hỏng các route hiện tại.
