---
title: "Fix visual + sư phạm Sim2 từ deep-review (TDD)"
status: completed
mode: "--deep --tdd"
created: 2026-06-09
source: plans/260609-0811-sim-deep-visual-pedagogy-review/reports/sim-deep-visual-pedagogy-review-report.md
blockedBy: []
blocks: []
---

# Plan — Fix visual + sư phạm Sim2 (TDD)

**Nguồn:** deep-review report [../260609-0811-sim-deep-visual-pedagogy-review/reports/sim-deep-visual-pedagogy-review-report.md](../260609-0811-sim-deep-visual-pedagogy-review/reports/sim-deep-visual-pedagogy-review-report.md) — soi mắt 35/35 sim. Plan đã qua red-team (xem cuối file).

## Mục tiêu

Fix finding VISUAL/SƯ PHẠM từ deep-review. Physics/binding ĐÃ verified (9/9 physics + 23/23 sign + 0 chồng nhãn) — **KHÔNG đụng** `physics/`, `transform.js`, `palette.js`. TDD: test trước, sửa sau. Gate cuối: `test:sim:release` + `test:sim:probe` xanh + soi ảnh capture.

## Scope

| Vào scope | Ngoài scope |
|---|---|
| HIGH-1 clip đồ thị · MEDIUM-2 dead-space (4 sim) · MEDIUM-3 nón 2D · LOW-4 arc mô men | LOW-5 Coriolis (red-team: chỉ là 1 hằng số VS + rủi ro clip > lợi → nudge nhỏ + guard ở P4 verify, không thành phase) · Đổi default Sim2→Sim3 (quyết định sản phẩm) |

## Phases

| Phase | Tên | File | TDD | Status | Phụ thuộc |
|---|---|---|---|---|---|
| P1 | worldBox no-clip ch3 (ch3-3-1, ch3-5-4, ch3-2-3) | [phase-01-worldbox-noclip-ch3.md](phase-01-worldbox-noclip-ch3.md) | ✅ | completed | — |
| P2 | Dead-space + arc mô men ch1 (ch1-1-4, ch1-3-6) | [phase-02-deadspace-moment-arc-ch1.md](phase-02-deadspace-moment-arc-ch1.md) | ✅ | completed | — |
| P3 | Vẽ nón ma sát 2D ch1-5-3 | [phase-03-friction-cone-2d-ch1-5-3.md](phase-03-friction-cone-2d-ch1-5-3.md) | ✅ | completed | P2 (cùng spec ch1) |
| P4 | Verify capture + release + probe gate | [phase-04-verify-capture-release-gate.md](phase-04-verify-capture-release-gate.md) | — | completed | P1, P2, P3 |

**Đồ thị phụ thuộc (sửa từ red-team H3):** P1 (spec ch3) ∥ P2 (spec ch1) chạy song song. **P3 blockedBy P2** — cả hai sửa `tests/sim2-ch1-mount.spec.js`, chạy nối tiếp tránh conflict. P4 gom verify, blockedBy P1+P2+P3.

## Ràng buộc chung (mọi phase)

- Engine SVG-first `js/sim2/`, mount contract `window.SIM_MAP[pageId]→factory→{dispose}` giữ nguyên.
- KHÔNG đụng physics/transform/palette. Nhãn LUÔN qua `overlay.label()`.
- **KHÔNG thêm/đổi/sắp lại readout row** (red-team H4): probe-B đọc readout theo rowIndex — thêm row làm lệch index → vỡ ngầm vì probe KHÔNG nằm trong release gate. Thông tin mới (chiều mô men, trạng thái) đi vào ARC/legend/nhãn SVG, KHÔNG vào readout. Nếu buộc đổi row → cập nhật `tools/sim-probe/probe-targets.js` cùng phase.
- **Vẽ arc/cung = inline** `render.el('path',{d:'M…A…', class, stroke, fill})` trong từng sim (red-team H6) — `svg-render.path()` chỉ vẽ đoạn thẳng. KHÔNG thêm helper vào `core/svg-render.js`, KHÔNG đụng `ensureDefs`/`createSvg`. Màu qua `Sim2Palette`.
- **Test chỉ assert no-clip** (bbox content-element ⊆ `.sim2-root` ở slider/drag CỰC TRỊ), KHÔNG dùng ngưỡng fill-ratio số (red-team H5: brittle + axis span hết khung làm bbox≈100% → không fail-first). "Cân khung" để mắt soi ở P4.
- No-clip test phải **enumerate cả `.sim2-label`** (không chỉ arrow/poly) — nhãn dễ clip nhất.
- `test:sim:mount` assert nhãn không chồng + canvas≈SVG ≤1px + start-paused → mỗi phase chạy mount sau sửa.
- **Comment & tên test KHÔNG ghi finding/phase code** (H1, P3…) — mô tả scenario (rule review-audit-self-decision #5).

## Rủi ro chính

- **worldBox đổi → scale tăng → nhãn chồng** (regression mount no-overlap, tolerance 1px). Mitigation: chạy lại no-overlap hiện có sau mỗi shrink; chừa margin nhãn.
- **Arc mô men sai chiều → DẠY SAI** (red-team C2): chiều phải lấy từ tích có hướng `rx·fy−ry·fx`, KHÔNG từ độ lớn `computeMoment`/`P·a` (cả hai luôn dương). Xem P2.
- **Nón ma sát chỉ-điểm sai vector → vô nghĩa sư phạm** (red-team C1): nón cố định quanh pháp tuyến; vector ra/vào nón là PHẢN LỰC (thẳng đứng), không phải pháp tuyến. Xem P3.
- Thêm path arc → coverage guard hex: dùng `Sim2Palette`, fill `rgba` whitelist.

## Red-team (2026-06-09)

4 reviewer thù địch, tất cả finding có evidence file:line. **2 Critical (lỗi vật lý trong plan gốc) + 6 High + 5 Medium — accept hầu hết.** Đã bake vào ràng buộc + phase. LOW-5 cắt (giữ LOW-4 theo đề xuất). Bảng chi tiết: cuối các phase file tương ứng.

| # | Finding (rút gọn) | Sev | Áp vào |
|---|---|---|---|
| C1 | Nón ma sát: vector ra/vào nón là PHẢN LỰC, không phải pháp tuyến (trục nón) | Crit | P3 |
| C2 | Arc mô men ch1-3-6 sai chiều nếu lấy dấu từ độ lớn — phải dùng tích có hướng | Crit | P2 |
| H1 | P1 Option B values (gh1.2/gy0−2.7) vẫn clip → dùng minY=−5 hoặc gh≤1.0 | High | P1 |
| H2 | (Coriolis) VS≥0.5 clip — cắt LOW-5 thành phase, chỉ nudge + guard | High | scope/P4 |
| H3 | "P1–P5 song song" SAI: cùng spec ch1/ch3 → serialize | High | cấu trúc phase |
| H4 | Probe rowIndex vỡ ngầm (probe ngoài release gate) → cấm đổi readout row + probe bắt buộc P4 | High | ràng buộc + P4 |
| H5 | Fill-ratio over-spec/brittle → chỉ no-clip | High | ràng buộc test |
| H6 | Helper arc dùng chung premature → inline path | High | ràng buộc |
| M1-5 | ch3-2-3 minY=−1.4 + enumerate label; P1 pin k/m step deterministic; P3 reaction bắt buộc; P4 per-phase mount + rollback; capture path note | Med | phase tương ứng |

## Validation Log

### Session 1 — 2026-06-09 (sau red-team)
Verification pass SKIPPED — red-team đã verify với evidence file:line (guard validate workflow). Chỉ hỏi điểm quyết định CÒN MỞ.

| Câu hỏi | Quyết định | Tác động plan |
|---|---|---|
| P3 nón ma sát phạm vi? | **Nón + vector phản lực R** (đầy đủ) | Xác nhận P3 as-written (R đã bắt buộc) — không đổi |
| Code 4 phase thế nào? | **Cả 4 phase trong 1 session** (P1∥P2→P3→P4) | Không đổi cấu trúc; verify gom P4 |

Cả 2 xác nhận plan hiện tại, 0 mâu thuẫn phát sinh. Recommendation: **proceed**.

### Session 2 — 2026-06-09 (thực thi TDD, 4/4 phase DONE)
TDD fail-first → fix → re-pass cho cả 4 phase. Gate cuối xanh toàn bộ:
- physics 9/9 (không đổi); mount 110; probe 35/35 + unit 68 (rowIndex không lệch); capture 25 + soi mắt 6 route đạt từng finding.
- Chiều mô men đúng vật lý: ch1-1-4 CCW, ch1-3-6 CW (tích có hướng `momentFromVectors`, không |M|). Nón ma sát ch1-5-3 quanh pháp tuyến + R thẳng đứng ra/vào theo β vs φ.
- 2 sai khác nhỏ so plan (đều no-regression, không phạm intent): ch3-2-3 nới ngang ±5→±6 (nhãn left-anchor cần pixel-room; dead-space gốc là dọc); ch1-3-6 maxY 3→3.6 (label P anchor-bottom ở P=150 chạm 3.45). Chi tiết: phase-04 "Kết quả verify".

### Whole-Plan Consistency Sweep
Re-read plan.md + 4 phase. Phases table link đúng 4 file tồn tại; 6 file cũ đã xóa; dependency nhất quán (P3 blockedBy P2, P4 blockedBy P1+P2+P3); LOW-5 cắt nhất quán ở scope + red-team table; tham chiếu "Coriolis"/"P5" còn lại đều là giải thích chủ ý trong bảng red-team, không phải link gãy. 0 mâu thuẫn chưa giải quyết.

## Success

4 finding fixed (HIGH-1 + MEDIUM-2 + MEDIUM-3 + LOW-4); `test:sim:physics` 9/9 giữ nguyên; `test:sim:mount` + `test:sim:release` + `test:sim:probe` xanh (probe xác nhận rowIndex không lệch); capture soi: ch3-3-1 đồ thị không cụt, 4 sim tĩnh cân khung không clip, ch1-5-3 hiện nón + phản lực ra/vào theo β, ch1-1-4/ch1-3-6 arc mô men ĐÚNG CHIỀU.
