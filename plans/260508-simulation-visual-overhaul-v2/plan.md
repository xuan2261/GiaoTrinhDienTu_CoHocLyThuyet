---
title: "[CANCELLED] Đại tu Hình ảnh & Tương tác Mô phỏng (TDD)"
description: "Nâng cấp toàn diện 58 mô phỏng sang phong cách Modern Neon, tương tác Rigid không độ trễ và hiệu ứng High-Juice."
cancelReason: "Hủy 2026-05-08: Kiến trúc Phương án B — Scene Graph + Constraint-based redesign được chọn. Plan này là in-place visual overhaul trên kiến trúc cũ, không phù hợp. Thay thế bởi 260508-2106-simulation-redesign."
status: cancelled
priority: P1
effort: "40h"
branch: "main"
tags: [simulation, visual, interaction, tdd, mechanics]
blockedBy: [260508-1435-simple-simulation-lab-assessment-removal]
blocks: []
created: 2026-05-08
---

# Kế hoạch: Đại tu Hình ảnh & Tương tác Mô phỏng (TDD)

## Tổng quan
Mục tiêu là biến các mô phỏng hiện tại từ dạng "sơ đồ tĩnh" thành các "phòng thí nghiệm ảo" sống động, chuyên nghiệp. Tập trung vào 3 trụ cột: Hình ảnh hiện đại (Neon/Glassmorphism), Tương tác tức thì (Rigid Bind), và Hiệu ứng vật lý chân thực (High-Juice).

Blocked update 2026-05-08: plan này phải chờ [Simple Simulation Lab and Assessment Removal](../260508-1435-simple-simulation-lab-assessment-removal/plan.md). Shell và assessment contract sẽ đổi trước; visual overhaul không nên chạy trên UI cũ.

Unblocked update 2026-05-08: [Simple Simulation Lab Debug Verification Hardening](../260508-1921-simple-simulation-lab-debug-verification-hardening/plan.md) đã completed với release gate pass, nên visual overhaul không còn bị chặn bởi debug verification baseline.

## Lộ trình các Giai đoạn

| Phase | Tên Giai đoạn | Trạng thái | Ưu tiên | Ước lượng |
| :--- | :--- | :--- | :--- | :--- |
| 01 | [Nghiên cứu & Hạ tầng Visual](./phase-01-research-visual-infra.md) | pending | P1 | 6h |
| 02 | [Lõi Tương tác Rigid](./phase-02-rigid-interaction-engine.md) | pending | P1 | 4h |
| 03 | [Đại tu Chương 1 (Tĩnh học)](./phase-03-chapter-1-statics.md) | pending | P2 | 10h |
| 04 | [Đại tu Chương 2 (Động học)](./phase-04-chapter-2-kinematics.md) | pending | P2 | 10h |
| 05 | [Đại tu Chương 3 (Động lực học)](./phase-05-chapter-3-dynamics.md) | pending | P2 | 10h |
| 06 | [QA & Tối ưu Performance](./phase-06-qa-final-polish.md) | pending | P1 | 4h |

## Rủi ro Kỹ thuật
- **Hiệu năng:** Hiệu ứng Glow và Particles có thể làm giảm FPS trên các trình duyệt cũ.
- **Khối lượng:** 58 mô phỏng cần cập nhật thủ công các Renderer.
- **Độ ổn định:** Thay đổi lõi tương tác có thể làm hỏng các logic cũ nếu không kiểm thử kỹ.

## Chiến lược Kiểm thử (TDD)
- Mỗi Phase bắt đầu bằng việc viết Spec/Test case.
- Sử dụng Playwright để tự động hóa việc kiểm tra Visual (Screenshots) và Interaction (Mouse events).
- Smoke tests cho tất cả 58 routes sau mỗi Phase lớn.
