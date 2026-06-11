---
type: scout-phase4-confirm
date: 2026-06-11
plan: 260611-0006-sim2-phet-grade-real-visual-fixes
scope: P2 polish findings — scout-only, defer fix
status: completed
---

# Phase 4 Scout — Xác nhận P2 findings (defer fix)

Đọc 5 file, đối chiếu finding P2 từ blind re-check report. KHÔNG sửa (đúng diện scout-only sau red-team #4).

## Kết quả per-finding

| Route | Finding report | Code thật | Phán quyết |
|---|---|---|---|
| ch3-3-1 | x(t) trace chạm mép đáy (borderline clip) | worldBox minY=−5; trace đáy y=−4.6 (biên độ x=2 cố định, SHM bảo toàn năng lượng) → margin 0.4 world-unit | **Thật nhưng KHÔNG clip.** Borderline framing. Defer (nới minY→−5.2 nếu sửa sau). |
| ch1-1-8 | dead-space dưới dầm, reaction arrow ngắn | minY=−1.5; content thấp nhất −0.8 (chân gối) → dead-space ~0.7. Reaction VIS=0.02, P mặc định 100 → arrow ~1.0 u | **Thật, nhẹ.** Defer (thu minY hoặc tăng VIS reaction). |
| ch3-2-3 | nửa dưới viewport trống | minY=−1.7; nhãn A/B tại y=−0.9, block tới −0.6 → dead-space ~0.8 dưới | **Thật, nhẹ.** Defer (thu minY→−1.1). |
| ch3-5-4 | nửa dưới trống, no graph | minY=−0.8; content 0..1.7 → dead-space ~0.8 dưới. "no graph" = thiết kế tĩnh work-energy | **Dead-space thật nhẹ; "no graph" BÁC BỎ** (không phải defect). Defer dead-space. |
| ch1-1-3 | legend Fx màu ambiguity | — | **DROP** (A-, red-team #4). |
| ch1-5-3 | green dùng cho equilibrium | — | **BÁC BỎ** — cố ý theo decision #2 (giữ convention). |

## Tổng kết

4 finding dead-space/framing CONFIRMED thật nhưng đều **nhẹ, không clip, không sai semantic**. Đòn bẩy chung (nếu sửa follow-up): thu `minY` worldBox ~0.6–0.8 u cho ch1-1-8/ch3-2-3/ch3-5-4; nới `minY` nhẹ cho ch3-3-1. Tất cả palette-neutral, không đụng physics.

2 finding BÁC BỎ (ch3-5-4 "no graph", ch1-5-3 green) + 1 DROP (ch1-1-3) — không phải defect.

## Câu hỏi mở

- Follow-up dead-space P2 (4 route): gộp 1 phase nhỏ hay để cùng `__slider-hi` capture tooling (Phase 5 deferred)? — chờ user quyết, ngoài phạm vi plan này.

## Cập nhật follow-up (2026-06-11 09:36, user yêu cầu thực hiện)

Đã sửa **3/4** route P2 (bottom-only `minY`, palette-neutral, TDD, release gate xanh):

| Route | minY | Kết quả |
|---|---|---|
| ch1-1-8 | −1.5 → −1.2 | bỏ dead-space dưới gối; soi OK |
| ch3-5-4 | −0.8 → −0.4 | bỏ nửa dưới trống; soi OK |
| ch3-3-1 | −5 → −5.25 | nới margin, trace x(t) hết chạm mép đáy; soi OK |
| ch3-2-3 | **giữ −1.7** | **DROP** — nhãn A/B `anchor:'top'` (chữ dưới điểm y=−0.9) → thu minY làm clip chữ ở no-clip test (slider F max). 2 lần thu (−1.15, −1.4) đều fail gate. Dead-space cosmetic nhẹ, không đáng đánh đổi no-clip. Revert. |

Bài học: nhãn anchor 'top' ở mép dưới worldBox = ràng buộc no-clip cứng, không thu minY được. Route nào nhãn nằm trong vùng nội dung mới thu an toàn.
