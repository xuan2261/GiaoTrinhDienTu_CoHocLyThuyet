# Plan — Đánh giá visual + chất lượng thực tế toàn bộ 35 mô phỏng

**Status:** ✅ complete (2026-06-08) — triage report: [reports/sim-fullquality-triage-report.md](reports/sim-fullquality-triage-report.md)
**Mode:** `--deep --tdd`
**Brainstorm:** [reports/brainstorm-260608-1559-sim-fullquality-triage-summary.md](reports/brainstorm-260608-1559-sim-fullquality-triage-summary.md)
**Discipline:** CHỈ đánh giá → triage report. KHÔNG sửa sim. Probe dev-only, KHÔNG vào `test:sim:release`.

## Mục tiêu

Triage 35 route (Sim2 25 SVG + Sim3 10 Three.js) trên 3 trục: (1) visual render, (2) physics/nhãn, (3) tương tác sống. Probe tương tác mức **A** (delta ≠ 0) + **B** (dấu đơn điệu khớp finite-difference của physics đã verify) cho cả 35 route.

## Quyết định kiến trúc chốt (từ scout)

- **Sim3 = mode-toggle trên Sim2**, KHÔNG phải engine riêng. Control luôn của Sim2; `setState` cùng state đẩy sang adapter 3D (`mode-toggle.js:84-87`).
- **Kênh đo delta:** Sim2 = DOM `.sim2-readout-value`/`.sim2-output`; Sim3 = `window.__SIM3_DEBUG__[id]` (state spread).
- **Oracle B = finite-difference của hàm physics** `js/sim2/physics/` — KHÔNG đoán tay. P0 map control→input→readout/route.
- DOM contract: slider `input[data-id]`+`.sim2-output`; readout `.sim2-readout-value`; playback `.sim2-playpause`/`.sim2-step`/`.sim2-reset`; formula `.sim2-formula[data-key]`.

## Phases

| Phase | Tên | TDD | Status | Blocked by |
|---|---|---|---|---|
| P0 | [Research: mapping control↔physics↔readout + sign oracle](phase-00-research-control-physics-readout-mapping.md) | — | ✅ done | — |
| P1 | [Scaffold probe harness dev-only](phase-01-scaffold-probe-harness.md) | ✅ | ✅ done | P0 |
| P2 | [Probe A — delta ≠ 0 toàn 35](phase-02-probe-a-liveness-delta.md) | ✅ | ✅ done | P1 |
| P3 | [Probe B — dấu đơn điệu toàn 35](phase-03-probe-b-semantic-sign.md) | ✅ | ✅ done | P0, P2 |
| P4 | [Visual capture + soi multimodal](phase-04-visual-capture-review.md) | — | ✅ done | — |
| P5 | [Tổng hợp triage report 3 trục](phase-05-synthesize-triage-report.md) | — | ✅ done | P2, P3, P4 |

## Kết quả (2026-06-08)

35/35 route × 3 trục. **0 lỗi physics, 0 dấu B sai (23/23 item match), 0 mount fail, 0 WebGL fallback** (10/10 Sim3 true-3D). Liveness **81/83 control sống**; 2 dead = cùng `ch3-6-2/slider:e` (Sim2+Sim3) — deferred-effect theo thiết kế, không phải binding hỏng. `test:sim:release` xanh; repo sạch (chỉ thêm probe dev-only); probe harness qua code-review clean (68 assertion). **2 high (đều visual):** ch2-4-4 nhãn chồng, ch3-5-2 lệch màu p(t). **1 medium:** ch3-6-2 e-slider deferred-effect (user quyết re-render hay giữ hoãn). 14 route skip B (hình học/động, flag minh bạch).

P4 chạy song song được (tool sẵn, độc lập probe). P0 mở khóa cả nhánh probe.

## Rủi ro chính

- **Route không có readout số map sạch** (sim hình học thuần: ch1-1-8 FBD, ch1-2-3 hình bình hành). B degrade sang "dấu delta vị trí scene/label" hoặc A-only. P0 phân loại; route không có B ý nghĩa → **flag trong report, KHÔNG drop âm thầm** (user chốt B cho cả 35).
- **Sim động cần settle**: đo sau `⏭` deterministic (pattern `test:sim:visual:capture`).
- **WebGL fail trong Playwright**: Sim3 probe guard fallback 2D — phân biệt "fallback hợp lệ" vs "lỗi mount".
- **Bespoke-drag (5 route)**: ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2 — input qua mouse-drag, không slider. P0 confirm handle DOM class.

## Dependencies

Playwright+chromium đã cài; Three.js vendored `lib/three/three.umd.min.js`. Không thêm runtime dep.

## Success

35/35 route × 3 trục có hàng triage + severity + bằng chứng (ảnh/delta số/node-test). `test:sim:release` vẫn xanh. Contact-sheet mở offline đủ panel+legend+control.
