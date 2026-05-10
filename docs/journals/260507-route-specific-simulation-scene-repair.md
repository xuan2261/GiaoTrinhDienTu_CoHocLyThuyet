---
title: Route-Specific Simulation Scene Repair
date: 2026-05-07 08:46
severity: Medium
component: SimProfessionalLab / simulation scene routing
status: Resolved
---

# Route-Specific Simulation Scene Repair

## Context

Lỗi nằm ở lớp scene routing cho 58 simulation routes. Mục tiêu là tách scene theo route nhưng vẫn giữ compatibility với `SIM_MAP`, adapters cũ, `file://` static app, và các assessment state keys đang dùng trong runtime.

## What Happened

Tôi đã repair luồng mount để `SimProfessionalLab.mount(routeId)` lookup scene theo route thay vì phụ thuộc wiring thủ công. Cụ thể:

- Thêm `SimSceneRegistry` để quản lý scene identity.
- Thêm `SimSceneTemplates` để chuẩn hóa scene contract.
- Tạo lazy scene lookup trong `SimProfessionalLab.mount(routeId)`.
- Bổ sung 7 scene catalog files để cover đủ 58 simulation routes.
- Thêm static/browser scene identity gates để chặn drift giữa hai runtime path.

Phần khó chịu nhất là bài toán này không được phép phá compatibility. Nếu đụng `SIM_MAP` hoặc storage keys thì sẽ kéo theo regression dây chuyền ở browser QA và assessment state.

## Decisions

- Chọn registry-based routing thay vì gắn scene trực tiếp trong từng adapter. Cách này giảm manual wiring và dễ audit hơn.
- Giữ nguyên `SIM_MAP`, adapters, `file://` static app, và assessment storage keys. Đổi contract ở runtime mà không đổi các điểm tích hợp cũ là hướng ít rủi ro nhất.
- Dùng lazy lookup thay vì eager import toàn bộ scene để tránh lock-in và giữ mount path gọn.

## Validation

- `npm run test:sim:release` PASS.
- `npm run test:sim:browser` PASS, 262 tests.
- `npm run test:sim:scene-identity` PASS.
- Scene catalog strict validation PASS.
- Unit validation PASS.
- Docs validation PASS.
- Workspace không phải git repo, nên không có commit/push.

## Next

Rủi ro còn lại không phải technical gate failure mà là pedagogical review quality. Cần reviewer nội dung rà lại xem mapping scene có đủ sát mục tiêu sư phạm của từng route hay không.

Unresolved questions: none.
