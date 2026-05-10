---
title: "Phase 02 Simulation Runtime Foundation"
date: "2026-05-06 12:37"
severity: "Medium"
component: "interactive simulation runtime / loader.js"
status: "Resolved"
---

# Phase 02 Simulation Runtime Foundation

## Context
Phase 02 complete. Chốt tầng `simulation` runtime trước khi mở rộng theo chương. Mục tiêu là tách `js/simulations.js` khỏi trạng thái monolith nhưng vẫn giữ compatibility với `loader.js`, `file://`, và 18 route hiện có trong `SIM_MAP`.

## What Happened
- Runtime đã split thành `sim-core`, `sim-statics`, `sim-kinematics`, `sim-dynamics`, `sim-activities`, và `simulations`.
- `loader.js` thêm lifecycle disposal cho simulation đang active và stale guard để chặn load cũ ghi đè page mới.
- `window.SIM_MAP` vẫn giữ contract cũ; 18 existing routes preserved.
- Không có Git commit vì work context này không phải Git repo, nên không có git safety net.

## Validation
- `node --check` cho toàn bộ JS runtime files: pass.
- `python -m compileall -q tools`: pass.
- `python tools\smoke_simulation_runtime.py`: pass.
- `python tools\smoke_simulation_routes.py`: pass.
- `python tools\audit.py`: `0 errors / 50 warnings`.
- Browser lifecycle smoke trên route đại diện `ch2-1-1`: pass, `RAF` và `resize` cleanup đúng khi điều hướng.

## Decisions
- Giữ registry tương thích thay vì chuyển sang dynamic import/bundler. Offline `file://` quan trọng hơn kiến trúc sạch trên giấy.
- Chấp nhận tạm thời các chapter modules còn lớn, vì ưu tiên là ổn định behavior và chặn regression.
- Stale guard chỉ hardening mức nhẹ. Chưa siết sâu vì chưa có defect blocking thực tế.

## Residual Risks
- `sim-statics.js` 541 lines, `sim-kinematics.js` 585 lines, `sim-dynamics.js` 613 lines: vẫn to, vẫn khó review.
- Invalid-hash stale-load hardening vẫn low, non-blocking.
- Browser smoke chưa sweep đủ 18 route, mới cover route đại diện.

## Next Steps
- Split tiếp chapter modules theo từng simulation/topic khi phase sau bắt đầu nở.
- Mở rộng browser smoke từ route đại diện sang full 18-route sweep nếu có regression mới.
- Giữ route IDs và `SIM_MAP` contract ổn định khi thêm content mới.

## Unresolved Questions
- Không có.

**Status:** DONE_WITH_CONCERNS
**Summary:** Phase 02 hoàn tất, runtime đã tách module và thêm lifecycle dispose/stale guard, validation pass đầy đủ.
**Concerns/Blockers:** Modules vẫn còn lớn; browser smoke chưa cover toàn bộ 18 route; invalid-hash hardening chưa cần siết sâu.
