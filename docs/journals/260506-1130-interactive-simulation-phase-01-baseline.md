---
title: "Baseline Phase 01 Simulation Tương Tác"
date: "2026-05-06 11:30"
severity: "Medium"
component: "interactive simulation routes / QA harness"
status: "Resolved"
---

# Baseline Phase 01 Simulation Tương Tác

## Context
Phase 01 chạy khi plan semantic math vẫn còn in-progress. User đã chấp nhận release risk vì baseline route/QA đang chặn hướng mở rộng simulation, còn chờ math cleanup không làm giảm rủi ro chính của phần simulation.

## What Happened
- Baseline coverage và QA harness đã complete.
- Thêm `tools/smoke_simulation_routes.py` để check offline static cho `SIM_MAP`, `PAGE_MAP`, `pages` bundle, và coverage matrix.
- Baseline hiện tại: 18 route trong `SIM_MAP`, coverage 18/78, P1 covered 18/58, còn thiếu 40 P1 route.
- Validation pass: `node --check` cho 7 JS files, `python -m compileall`, `tools/audit.py` 0 errors / 50 warnings, smoke helper pass, và missing-matrix negative test fail đúng kỳ vọng.
- Code review bắt rủi ro false-pass; đã sửa missing/empty matrix handling, parser guard, wording của report command, Phase 01 verification, và Phase 02 lifecycle gate.
- Debugging tìm ra blocker thật cho Phase 02: runtime hiện chưa teardown `resize` listeners hoặc `requestAnimationFrame` loops khi navigation.
- Workspace không phải git repository, nên Phase 02 cần snapshot/backup trước khi implementation.

## Decisions
- Chốt Phase 01 baseline ngay, không chờ semantic math closure.
- Xem false-pass prevention là bắt buộc; silent green checks nguy hiểm hơn noisy failures.

## Next
- Tạo snapshot/backup trước vì không có git safety net.
- Implement mount/dispose teardown cho simulation pages trước khi mở rộng coverage.
- Chạy lại smoke và audit sau Phase 02, tiếp tục giữ 40 P1 gaps visible đến khi xử lý xong.
