---
title: Canvas HTML Overlay Migration
date: 2026-05-07 16:00
severity: Medium
component: sim-lab overlay / KaTeX / route manifest
status: Resolved
---

# Canvas HTML Overlay Migration

## Context

Canvas overlay đã được chuyển sang DOM/KaTeX path trên `sim-lab` shell. Mục tiêu là giữ offline-first/local-first behavior nhưng bỏ lệ thuộc vào canvas text cho formula và readout. Pipeline này cũng chốt luôn localization cho visible simulation UI và `sim-route-manifest` prompts/objectives.

## What Changed

- Reused existing `.sim-lab-overlay`, không tạo shell mới.
- Migrate coordinate formulas từ canvas math sang DOM + KaTeX qua route primitives.
- Fix overlay sizing theo canvas rect/scale, không còn lệch khi resize.
- Thêm late KaTeX fallback handling: CDN script bắn `sim:katex-ready`, `SimProfessionalLab` redraw rồi remove listener khi dispose, `domMath` rerender fallback nodes nếu `.katex` chưa có.
- Localize visible simulation UI và assessment prompts/objectives sang tiếng Việt.
- Fix `undefined` trong readout, bỏ duplicate title prefix, fallback adapters không còn show `Simulation ...`.

## Decisions

- Giữ `.sim-lab-overlay` hiện tại thay vì refactor shell. Ít rủi ro hơn, ít blast radius hơn.
- Chọn route primitives làm lớp chuyển đổi giữa coordinate logic và DOM render. Đây là điểm sạch nhất để giữ consistency giữa 58 routes.
- Chấp nhận KaTeX fallback theo kiểu event-driven thay vì hard sync load order. Lý do: CDN/local race vẫn có thật, nên redraw sau `sim:katex-ready` là cách ít brittle hơn.
- Không đụng evergreen docs ngoài validation sync tối thiểu; focus vào behavior đã ship.

## Validation

- Targeted overlay/localization/responsive: 9 passed.
- `npm run test:sim:unit`
- `npm run test:sim:quality`
- `npm run test:sim:semantic`
- `npm run test:sim:renderer-contract`
- Runtime smoke
- `npm run test:sim:browser`: 267 passed, 1 skipped
- `compileall` tools
- Docs validation pass
- Final code review: no findings

## Follow-up

- Không có mở rộng bắt buộc ngay. Nếu muốn giảm tech debt tiếp, bước sau là gom các DOM math fallback path vào helper chung để tránh lặp logic giữa routes.

Unresolved questions: none.

**Status:** DONE; **Summary:** Ghi journal cho canvas HTML overlay migration, nêu rõ quyết định, fallback KaTeX, localization, và validation đã pass.; **Concerns/Blockers:** None; repo không có `.git` nên không commit được.
