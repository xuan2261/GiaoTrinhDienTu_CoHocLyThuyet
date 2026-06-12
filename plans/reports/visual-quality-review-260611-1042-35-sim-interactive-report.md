---
title: "Review chất lượng tương tác 35 sim (interaction-far capture) — kết quả"
date: 2026-06-11
plan: 260611-1042-interactive-slider-capture-35-sim-quality-review
scope: review-only (lỗi thật → mở plan sửa riêng SAU khi user xem)
verdict: 35/35 route ĐẠT · 0 real-bug · 2 minor-visual · 1 minor-3D-artifact · 2 false-fail minh oan
---

# Review chất lượng THỰC TẾ CÓ TƯƠNG TÁC — 35 route (25 Sim2 + 10 Sim3)

## Cổng kỹ thuật (đã qua)

| Gate | Kết quả |
|---|---|
| `test:sim:visual:unit` | XANH (8 assertion cũ + 5 mới interaction-far) |
| `test:sim:visual:capture` | 25/25 Sim2 · 16 slider-far + 5 drag-far có ảnh tương tác |
| `test:sim3:visual:capture` | 10/10 Sim3 · 5 slider-far (đường bespoke) · guard count afterAll XANH |
| `test:sim:release` | XANH (physics 110 + app 6 + content + quiz) → KHÔNG đụng physics/mount/contract |
| Integrity ảnh | mọi interaction PNG > 5KB; 5 drag-far DIFFERS vs init (drag thật sự kéo) |
| Contact-sheet | 25 route / 79 ảnh, renderer KHÔNG vỡ với images[] dài thêm |

## Phương pháp (diệt false-fail)

Capture cũ chỉ chụp frame TĨNH (init/live) → grader tưởng route "đóng băng" (false-fail). Vòng này
thêm frame **interaction-far**: kéo control tới **biên XA init nhất** (`init>=mid ? lo??min : hi??max`,
clamp local-monotonic), rồi chấm trên ảnh phản ánh feedback THẬT. Route dynamic+slider được **reset
playback (`.sim2-reset`, về t=0) TRƯỚC** khi set control → ảnh không trộn frame 120.

**Mọi finding "feedback" bind probe match-state per-route (HARD gate).** 26 route có target probe:
toàn bộ `probeA` live + `probeB` sign-match → bằng chứng cứng feedback đúng & sống.

## Bảng grade 35 route × 3 tiêu chí

Cột verdict: **ok** = đủ 3 tiêu chí; **minor** = lỗi thẩm mỹ nhẹ không ảnh hưởng chức năng.
Cột frame: `slider`/`drag` = interaction-far mới; `anim` = animation t0/mid/end; `3D` = Sim3.

### Sim2 (25)

| route | frame | visual | feedback | physics | probe-cite | verdict |
|---|---|---|---|---|---|---|
| ch1-1-3 | slider | good | good | good | F live · Fx=match(+) | ok |
| ch1-1-4 | slider | good | good | good | F live · M=match(+) | ok |
| ch1-1-5 | drag | good | good | good | drag live · Rx 20→94.7,\|R\|→132 | ok |
| ch1-1-6 | slider | good | good | good | d live · M_couple=match(+) | ok |
| ch1-1-8 | slider | good | good | good | P live · Ra=match(+) Rb=match(+) | ok |
| ch1-2-3 | drag | good | good | good | drag live · \|R\| 138→190 | ok |
| ch1-3-2 | slider | good | good | good | alpha live · T=match(+) (57.7→193 N) | ok |
| ch1-3-6 | slider | good | good | good | P live · M_ngam=match(+) | ok |
| ch1-5-3 | slider | good | good | good | mu live · phi=match(+) | ok |
| ch1-6-3 | drag | good | good | good | drag live · C dịch xa lỗ (đúng) | ok |
| ch2-1-1 | anim | good | good | good | playback animate parabol; \|a\|=9.8 const | ok |
| ch2-1-3 | drag | good | good | good | drag live · \|v\|3.21→4.0,R 3.3→6.38 — **false-fail cũ minh oan** | ok |
| ch2-2-2 | anim | good | good | good | đĩa quay φ tiến; ω=ω0+αt khớp | ok |
| ch2-3-2 | slider | good | good | good | r1 live+playback · beltV=match(+) | ok |
| ch2-4-4 | anim | good | good | good | Coriolis v_rel⊥a_cor; \|a_cor\|=2ωv_rel | ok |
| ch2-5-2 | drag | good | good | good | drag live · IC dời, v_P=0 — **false-fail cũ minh oan** | ok |
| ch2-5-3 | slider | good | good | good | omega live · vM=match(+) (3.91→9.76) | ok |
| ch3-1-3 | slider | good | good | good | a live · theta=match(+) inertiaForce=match(-) | ok |
| ch3-2-2 | slider | good | good | good | F+playback live · a=match(+) (feedback ở readout) | ok |
| ch3-2-3 | slider | **minor** | good | good | F live · pairMag=match(+) · *dead-space dưới viewport* | minor |
| ch3-3-1 | slider | good | good | good | k+playback live · omega=match(+) (feedback ở readout) | ok |
| ch3-5-2 | slider | good | good | good | F live · J=match(+) (12→40 N·s) | ok |
| ch3-5-3 | slider | good | good | good | r live · omega=match(-) · I 36→2.56,ω 1→14.06,L const | ok |
| ch3-5-4 | slider | **minor** | good | good | F live · W=match(+) · *dead-space dưới control* | minor |
| ch3-6-2 | anim | good | good | good | va chạm e=0.7; p=1.40 bảo toàn, T mất 3.13 J | ok |

### Sim3 (10)

| route | frame | visual-3D | feedback | physics | probe-cite | verdict |
|---|---|---|---|---|---|---|
| ch1-1-5 | 3D base | good | good | good | F/R/Mo 3D rõ, panel khớp | ok |
| ch1-5-3 | 3D slider | good | good | good | mu live · phiDeg=match(+) (24.2→45°), nón ma sát mở | ok |
| ch2-1-3 | 3D base | good | good | good | ellipse + vòng mật tiếp nghiêng | ok |
| ch2-2-2 | 3D base | good | good | good | quay quanh trục đứng (3D thắng 2D rõ) | ok |
| ch2-3-2 | 3D slider | good | good | good | r1 live · gearOmega2=match(-) (ngược chiều đúng) | ok |
| ch2-4-4 | 3D base | **minor** | good | good | Coriolis đúng · *artifact peach-sweep + crop góc đĩa* | minor |
| ch2-5-3 | 3D slider | good | good | good | omega live · vM.mag=match(+) (3.91→9.76) | ok |
| ch3-1-3 | 3D slider | good | good | good | a live · thetaDeg=match(+), con lắc lệch xa | ok |
| ch3-5-3 | 3D slider | good | good | good | r live · omega=match(-) · I 36→2.56, L=36 const | ok |
| ch3-6-2 | 3D base | good | good | good | va chạm 1D; p bảo toàn, T mất khớp | ok |

## Lỗi thật theo ưu tiên

**P1 (chức năng/feedback/physics): KHÔNG CÓ.** 0 route probe DEAD/mismatch; 0 route render vỡ.

**P2 (thẩm mỹ nhẹ — KHÔNG cản chức năng/sư phạm):**
1. `ch3-2-3` (Sim2): viewport dải mỏng ở đỉnh, dead-space lớn phía dưới.
2. `ch3-5-4` (Sim2): dead-space dưới control bar.
3. `ch2-4-4` (Sim3): mảng peach bán trong suốt (quạt quét) hơi thô + 1 mảnh cam crop góc dưới-phải đĩa.

→ 3 mục P2 gom được vào 1 plan polish-visual nhỏ nếu user muốn (review-only: chưa sửa vòng này).

**Post-review cook 2026-06-12:** mở plan `260612-visual-polish-p2-and-review-artifact-policy`.
`ch2-4-4` Sim3 đã giảm sector Coriolis thành cue nhỏ, mờ hơn, có TDD guard. `ch3-5-4`
đã có worldBox `minY:-0.4` + no-clip guard; không đổi thêm. `ch3-2-3` giữ nguyên vì khoảng dưới
là label-clearance cho nhãn A/B, đã có no-clip guard ở F max; ép thu viewport dễ clip nhãn.

## False-fail đã xác minh (KHÔNG hành động)

| route | nghi cũ | bằng chứng minh oan |
|---|---|---|
| ch2-1-3 | "đóng băng / no feedback" | drag-far: điểm dời, vòng mật tiếp phình, \|v\|3.21→4.0, R 3.3→6.38; probe drag **live** |
| ch2-5-2 | "đóng băng / no feedback" | drag-far: thanh đổi hướng, IC dời, B/IC readout đổi; probe drag **live** |

Cả 2 là bespoke-drag (0 slider) → capture tĩnh cũ không chạm → post-drag diệt tận gốc root-cause.

## Quan sát 2D-vs-3D (CHỈ ghi nhận — ngoài phạm vi quyết)

3D **giá trị rõ rệt** (đáng giữ/ưu tiên): `ch2-2-2` (trục quay không gian), `ch2-4-4` (ω⊥đĩa, a_cor⊥v_rel),
`ch1-5-3` (nón ma sát tròn xoay), `ch3-5-3` ("vũ công co tay" r↓→ω↑). 3D **chủ yếu bonus/trang trí**:
`ch3-6-2` (va chạm 1D), `ch1-1-5` (lực phẳng). Không đề xuất hành động — chỉ dữ liệu cho user quyết sau.

## Câu hỏi mở / Gap trung thực

1. **PNG bị `.gitignore`** (xác minh: `git check-ignore` hit, 0 PNG tracked) → mitigation Phase 3
   "so PNG carry-forward vs capture 2231 qua git" **không khả thi** (file không versioned + capture vòng
   này đã ghi đè baseline cũ). **Quyết định:** nâng scope grade-fresh TOÀN BỘ 35 route thay vì carry 9 —
   kết quả MẠNH hơn split 26+9 (mọi verdict dựa ảnh hiện tại, 0 verdict kế thừa mù). Đánh đổi: tốn thêm
   1 grader (5 Sim3 base) nhưng loại rủi ro carry giấu regression.
   **Policy sau cook:** tiếp tục ignore PNG; mỗi review phải track report + manifest/contact-sheet path rõ,
   và xuất zip artifact ngoài git khi cần nghiệm thu ảnh.
2. ch3-2-2 / ch3-3-1: scene hình học gần đứng yên khi kéo slider là ĐÚNG thiết kế — feedback nằm ở
   readout-số (a, ω). Probe live + grader đọc panel xác nhận. KHÔNG phải lỗi.
3. Lỗi thật vòng này = 0 → KHÔNG cần mở plan sửa P1. 3 mục P2 thẩm mỹ chờ user quyết có gom polish không.
