---
type: brainstorm-summary
date: 2026-06-11
scope: "25 Sim2 + 10 Sim3 = 35 route"
goal: "Review chất lượng thực tế CÓ TƯƠNG TÁC (interactive), diệt false-fail từ capture tĩnh"
approach: "C — Hybrid đầy đủ"
status: approved
next: /ck:plan --tdd
---

# Brainstorm — Interactive Visual Quality Review 35 Sim

## Problem statement

User muốn "kiểm tra visual, chất lượng thực tế tất cả mô phỏng". Đã có 2 report soi visual 06-10:
`260610-1418` (self-review) + `260610-2231` (blind re-check 4 subagent + probe). Code `js/sim2`+`js/sim3`
KHÔNG đổi từ 06-09 → soi tĩnh lại sẽ ra y hệt finding cũ, value thấp.

**Root cause khiến review cũ "thực tế giả":** `capture-sims.spec.js` chỉ chụp 2 frame TĨNH
(`init`+`live`), KHÔNG kéo slider. Grader nhìn ảnh tĩnh → báo "đóng băng / no feedback / init==live".
Probe chứng minh đó là FALSE-FAIL (control chạy đúng, vd `r 0.8→3.5 ⇒ omega 14.06→0.73` match=true).
Chữ "chất lượng THỰC TẾ" của user = chất lượng lúc TƯƠNG TÁC → ảnh phải phản ánh trạng thái SAU khi kéo slider.

## Requirements (chốt qua AskUserQuestion)

- **Mục tiêu:** soi lại "thực tế" = CÓ tương tác (không phải soi tĩnh lần nữa, không phải sửa lỗi ngay).
- **Tiêu chí (3):** visual/bố cục · feedback tương tác · đúng vật lý/sư phạm.
- **Phạm vi:** toàn bộ 35 route (25 Sim2 + 10 Sim3).
- **2D vs 3D default:** NGOÀI phạm vi — chỉ ghi nhận, không quyết.
- **Cách làm:** Approach C (Hybrid đầy đủ).
- **Constraint cứng:** KHÔNG động physics/engine sim. Chỉ đổi cách QUAN SÁT (tooling dev-only) + cách CHẤM.

## Key finding kỹ thuật (quyết định cách làm)

`tools/sim-probe/probe-targets.js` ĐÃ có sẵn cấu hình kéo slider chính cho từng route
(control name + biên lo/hi + rowIndex readout), đã verify, dùng chung với probe.
→ Tái dùng làm nguồn để CHỤP ảnh sau khi kéo, không phải viết tay 25 route.

**Phủ sóng slider-target:** 16 Sim2 + 5 Sim3 = 21/35 route có entry. 9 route còn lại
bespoke-drag (ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2) hoặc animation-only → giữ frame
`init`/`step` cũ (ảnh tĩnh vốn đại diện đúng hình học; animation đã có step `⏭` deterministic).

## Approaches evaluated

| | Mô tả | Pros | Cons |
|---|---|---|---|
| A | Review trên artifact có sẵn (ảnh tĩnh + probe JSON + source) | Nhanh, 0 rủi ro tooling | KHÔNG nhìn được độ giàu feedback slider — đúng gap F2/F3 |
| B | Nâng capture kéo slider rồi chấm | Diệt false-fail, tái dùng lần sau | 9 route vẫn chỉ ảnh tĩnh/step |
| **C** | **Hybrid: slider-hi frame + step frame + probe JSON + source** | **Verdict đáng tin nhất cho cả 3 tiêu chí** | Công nhất |

C được chọn.

## Recommended solution — Approach C, 4 phase

**Phase 1 — Nâng capture (tooling dev-only, TDD).**
- Mở rộng `capture-plan.js` (pure, có unit test → khóa hành vi bằng test TRƯỚC) + `capture-sims.spec.js`.
- Thêm frame `slider-hi`: route có entry `probe-targets.js` → kéo control chính tới `hi`/max, chờ paint, chụp.
- Tái dùng `SimProbeTargets` làm nguồn control/biên (nhất quán với probe).
- 9 route không slider giữ frame cũ (đúng thiết kế).

**Phase 2 — Chụp + cổng toàn vẹn ảnh.**
- Chạy capture Sim2 + Sim3 (định vị spec capture Sim3 khi thực thi — glob chưa thấy).
- Verify mọi PNG đủ card (panel+legend+vector), không tile trắng/crop. Dựng contact-sheet.

**Phase 3 — Chấm đa tín hiệu độc lập (chống anchor).**
- Mỗi route gom: `init` + `slider-hi` + `step` (nếu động) + probe JSON + đối chiếu source physics.
- Chấm 3 tiêu chí. Dùng subagent chấm MÙ song song (cấm đọc report cũ).

**Phase 4 — Tổng hợp report.**
- Bảng grade 35 route, lỗi THẬT (đã lọc false-fail bằng slider-hi + probe), danh sách hành động ưu tiên.
- Ghi nhận quan sát 2D-vs-3D (chỉ ghi, không quyết).

## Implementation considerations & risks

- KHÔNG sửa sim nào. Lỗi thật phát hiện → danh sách hành động vòng SAU.
- Rủi ro: spec capture Sim3 chưa định vị (sẽ tìm); route animation không nhận slider-hi (đúng thiết kế).
- `capture-plan.js` là pure-logic có unit test sẵn → TDD tự nhiên: viết test slider-hi trước.
- Capture config riêng `playwright.visual.config.cjs`, KHÔNG vào `test:sim:release` → không ảnh hưởng gate offline.

## Success metrics

- Capture xanh: 25/25 Sim2 + 10/10 Sim3, có frame `slider-hi` cho 21 route eligible.
- Cổng toàn vẹn ảnh PASS (đủ card, không crop).
- Report 35 route chấm trên 3 tiêu chí, false-fail "đóng băng/no feedback" bị diệt (vì ảnh giờ phản ánh feedback thật).
- Danh sách lỗi thật + ưu tiên hành động cho vòng sửa kế tiếp.

## Next steps

1. `/ck:plan --tdd` với report này làm context (đã chọn).
2. Plan khóa hành vi capture slider-hi bằng test trước Phase 1.

## Unresolved questions

1. Spec capture Sim3 nằm ở đâu? (glob `*sim3*visual*` không thấy — cần định vị qua package.json script `test:sim3:visual:capture`).
2. Route animation-only (không slider, không trong probe-targets) — có cần thêm frame step riêng cho review, hay frame `step` hiện tại đã đủ?
3. Có route bespoke-drag nào mà giá trị học nằm ở kéo handle (không phải slider) cần capture trạng thái post-drag không? (vd ch2-1-3 curvature, ch2-5-2 IC).
