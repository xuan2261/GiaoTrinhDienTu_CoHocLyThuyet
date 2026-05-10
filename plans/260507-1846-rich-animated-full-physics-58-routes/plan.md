---
title: "Rich Animated Full Physics - 58 Simulation Routes Rebuild"
description: "Rebuild toàn bộ 58 simulation routes: rich animation, full physics, excellent quality"
status: completed
priority: P1
effort: "~25-30 ngày"
tags: [simulation, physics, animation, canvas, quality]
created: 2026-05-07
---

# Rich Animated Full Physics — 58 Simulation Routes Rebuild

## Overview

Rebuild toàn bộ 58 simulation routes từ hollow framework thành production-quality labs với:
- **Visual: Rich animated** — animation liên tục, particle effects, smooth transitions, glow effects
- **Physics: Full physics** — tính đầy đủ, ODE solvers, ma sát, va chạm
- **Quality: Excellent** — mỗi route có scene riêng, renderer riêng, physics riêng

## Root Cause

`sim-scene-registry.js` TRỐNG, `sim-scene-templates.js` chỉ có 14 template chung, tất cả 58 route dùng generic fallback. Infrastructure tốt đã có — chỉ thiếu implementation.

## Phases

| # | Phase | Status | Effort | Deliverable |
|---|-------|--------|--------|-------------|
| 1 | Infrastructure & Animation Engine | ✅ Complete | ~3 ngày | Animation engine, physics helpers, enhanced primitives |
| 2 | Chapter 1 — 25 Statics Routes | ✅ Complete | ~5 ngày | Ch1 × excellent |
| 3 | Chapter 2 — 15 Kinematics Routes | ✅ Complete | ~5 ngày | Ch2 × excellent |
| 4 | Chapter 3 — 18 Dynamics Routes | ✅ Complete | ~6 ngày | Ch3 × excellent |
| 5 | Integration, QA & Polish | ✅ Complete | ~4 ngày | Tất cả smoke tests pass, visual polish |
| 6 | Docs & Release Handoff | ✅ Complete | ~2 ngày | Docs updated, QA summary added |

**Total: ~25 ngày**

## Dependencies

- Phase 1 phải hoàn thành trước Phase 2/3/4
- Phase 2/3/4 có thể chạy song song (2 team)
- Phase 5 chỉ bắt đầu khi Phase 2+3+4 xong
- Phase 6 chỉ bắt đầu khi Phase 5 pass hết gates

## Quality Gates

Mỗi phase phải pass:
1. `node --check` cho mọi file JS mới/sửa
2. `python tools/smoke_simulation_routes.py` — route coverage
3. `python tools/smoke_simulation_runtime.py` — module globals, mount/cleanup
4. `python tools/smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2`
5. `python tools/audit_simulation_quality.py --all --max-js-lines 220 --require-assessment`
6. `npm run test:sim:unit` — physics unit tests
7. `npm run test:sim:browser` — Playwright smoke (268+ pass)
8. Visual baseline verification

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Canvas 2D + requestAnimationFrame | Đủ cho cơ học, không cần 3D engine |
| Animation engine như module riêng | Tái sử dụng, không duplicate animation logic |
| Physics helpers per-domain | Statics/Kinematics/Dynamics tách rõ, DRY |
| Route modules per chapter | Mỗi chapter có ~4-6 files, max 220 lines/file |
| DOM overlay cho math labels | KaTeX rendering trên overlay, không trộn canvas + DOM |
| No bundler | Offline-first, file:// compatible |

## Unresolved Questions

1. **[RESOLVED — canvas-diff approach]** Animation baseline capture — dùng canvas-diff (so sánh pixel-by-pixel canvas output). Rationale: tự động hóa được, không cần screenshot, nhẹ hơn. Canvas-diff threshold: 5% diff pixels = fail.
2. **[RESOLVED — 100 particles default, cap 200]** Particle effects density. Benchmark target: 30fps trên tablet thấp nhất (1.5GHz dual-core). Default: 100 particles, max: 200 với object pooling.
3. **[RESOLVED — offline bundle]** KaTeX CDN fallback — dùng offline bundle (`katex.min.js` local). CDN chỉ là fallback nếu local fail. Thêm check: `if (typeof renderMathInElement === 'undefined') loadCDN()`.

## Notes

- Design guidelines (dark navy + gold) apply cho shell/UI, simulation canvas dùng **light background** (.sim-container: #f8f9fa)
- Chapter accents: Ch1 #2980b9, Ch2 #27ae60, Ch3 #8e44ad — dùng cho glow effects và color coding
- Max 220 lines/file (code-standards.md) — tách file nếu cần
- Generated files (js/pages.js) không sửa tay
