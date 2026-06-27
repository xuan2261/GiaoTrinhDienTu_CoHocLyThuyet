---
type: independent-blind-recheck
date: 2026-06-10
scope: "25 Sim2 + 10 Sim3"
method: "4 blind grader subagents (no access to 14:18 report) + interaction-probe reconciliation"
baseline-compared: plans/reports/260610-1418-phet-grade-35-sim-visual-review.md
status: completed
---

# Independent Blind Re-check — 35 Sim Routes vs 14:18 Review

## Vì sao có report này

User yêu cầu kiểm lại visual/chất lượng thực tế "độc lập, khắt khe hơn". Đã có review PhET-grade toàn bộ 35 route lúc 14:18 cùng ngày, nhưng đó là **self-review** (Claude tự soi) → bị neo lạc quan. Lần này: chụp ảnh tươi + **4 subagent chấm mù** (cấm đọc report 14:18, cấm đọc của nhau) + đối chiếu interaction-probe để phân định false-fail.

Code `js/sim2`/`js/sim3` KHÔNG đổi từ 06-09 → ảnh tươi ≈ ảnh 14:18. Giá trị lần này nằm ở **cách chấm độc lập**, không ở pixel mới.

## Cổng kỹ thuật (tươi 22:54)

| Gate | Kết quả |
|---|---|
| `test:sim:visual:capture` | 25/25 Sim2 pass |
| `test:sim3:visual:capture` | 10/10 Sim3 pass |
| Cổng toàn vẹn ảnh | PASS — mọi PNG 21-88KB (Sim2)/32-66KB (Sim3), không tile trắng/crop, contact-sheet đủ panel+legend+vector |

## Kết luận lớn nhất: blind thấp hơn 14:18 một cách hệ thống

~15/35 route blind chấm thấp hơn 1 bậc so với 14:18. Phân tích cho thấy độ lệch tách thành 3 nhóm — **chỉ 1 nhóm là vấn đề thật**:

### Nhóm A — FALSE-FAIL do capture tĩnh (KHÔNG phải lỗi sim)

Blind chấm từ frame tĩnh → phạt nặng các route mà giá trị nằm ở tương tác (slider/playback). **Probe chứng minh control chạy đúng:**

| Route | Blind | Cáo buộc mù | Probe phán quyết |
|---|---|---|---|
| ch3-5-3 | C+ | "readout đóng băng, không demo bảo toàn L" | `r` 0.8→3.5 ⇒ `omega` 14.06→0.73, match=true. **Sim ĐÚNG.** |
| ch3-1-3 | C+ | "no feedback, init==live" | `a` drive `theta` 0→39.2, match=true. Feedback ĐÚNG. |
| ch3-2-3, ch3-5-2, ch3-5-4, ch2-5-3, ch2-1-3, ch2-5-2 | B/B+ | "static, init==live, limited feedback" | Đều là frame tĩnh không kéo slider; probe trước đó 35/35 route pass. |

→ Các điểm trừ "thiếu feedback/đóng băng" này **không hành động được** — chúng phản ánh spec capture không tua slider, không phản ánh runtime thật.

### Nhóm B — Vấn đề THẬT, cả hai lần đều thấy (CONFIRMED)

| Route | 14:18 | Blind | Đồng thuận |
|---|---|---|---|
| ch2-4-4 (Coriolis) | B | **C+** | Đĩa tím nuốt viewport, cụm v_rel/a_cor quá nhỏ. Blind escalate nặng hơn. F1 cũ được xác nhận độc lập. |
| ch1-1-8 | B+ | B | Dead-space lớn dưới dầm ngang, reaction arrow ngắn. |
| ch1-3-6 | B+ | B | Dead-space dưới trục + (mới) legend mismatch. |

### Nhóm C — Vấn đề THẬT mà 14:18 BỎ SÓT (NEW — giá trị chính của lần này)

| Route | 14:18 | Blind | Phát hiện mới |
|---|---|---|---|
| ch2-2-2 | A- | **B-** | Cùng bệnh đĩa tím như ch2-4-4: đĩa nuốt viewport, mũi tên tiếp tuyến v=ωR tí xíu/khó thấy. 14:18 cho A- là quá rộng tay. |
| ch1-3-6 | B+ | B | **Legend ≠ canvas:** legend ghi "R-ngàm pink / M-ngàm blue" nhưng cả hai vẽ MÀU TÍM. Lỗi màu thật, không phải gu. |
| ch1-1-3 | A | A- | Legend liệt Fx màu đỏ nhưng canvas vẽ Fx dashed hồng — ambiguity màu nhẹ. |
| ch3-1-3 | A | C+(một phần) | Framing thật: sim dồn góc dưới-trái, nền xám đục thấp tương phản, dead-space upper-right lớn. (Phần "no feedback" là false-fail — xem Nhóm A.) |

## Bảng grade đối chiếu đầy đủ

### Sim2 (25)

| Route | 14:18 | Blind | Δ | Ghi chú |
|---|---|---|---|---|
| ch1-1-3 | A | A- | ↓ | legend màu Fx ambiguity |
| ch1-1-4 | A- | B+ | ↓ | empty panel phải |
| ch1-1-5 | A | B+ | ↓ | R-orange không strict-semantic (chấp nhận được) |
| ch1-1-6 | A | B+ | ↓ | dead-space bottom-right |
| ch1-1-8 | B+ | B | ↓ | **dead-space dưới dầm (confirmed)** |
| ch1-2-3 | A | A- | ↓ | mạnh nhất set ch1 |
| ch1-3-2 | A | A- | ↓ | cân đối, tốt |
| ch1-3-6 | B+ | B | ↓ | **legend R/M mismatch màu tím (NEW bug)** |
| ch1-5-3 | A- | B+ | ↓ | green dùng cho equilibrium (semantic misuse nhẹ) |
| ch1-6-3 | A | B+ | ↓ | composite centroid rõ |
| ch2-1-1 | A- | A- | = | projectile tốt; t0 dồn góc nhẹ |
| ch2-1-3 | A | B | ↓ | drag-only, không control bar |
| ch2-2-2 | A- | **B-** | ↓↓ | **đĩa nuốt viewport, v tiếp tuyến tí xíu (NEW)** |
| ch2-3-2 | A | A- | ↓ | gear+belt rõ |
| ch2-4-4 | B | **C+** | ↓ | **Coriolis: disk dominates (confirmed+escalated)** |
| ch2-5-2 | A | B+ | ↓ | IC crisp; dead-space top-right |
| ch2-5-3 | A | A- | ↓ | velocity field tốt |
| ch3-1-3 | A | C+ | ↓↓ | **framing đục/dồn góc (NEW visual); feedback OK (false-fail)** |
| ch3-2-2 | B | A- | ↑ | blind thấy v(t) grow rõ → tốt hơn 14:18 nghĩ |
| ch3-2-3 | A- | B | ↓ | nửa dưới viewport trống |
| ch3-3-1 | A- | B | ↓ | x(t) trace chạm mép đáy (borderline clip) |
| ch3-5-2 | A | B+ | ↓ | p(t)/J rõ; static |
| ch3-5-3 | A | C+→A* | * | **C+ là FALSE-FAIL; probe chứng minh r→ω đúng → thực chất A** |
| ch3-5-4 | A- | B | ↓ | nửa dưới trống, no graph |
| ch3-6-2 | B+ | A- | ↑ | blind thấy "T mất 3.13J" readout rõ → tốt hơn |

### Sim3 (10)

| Route | 14:18 | Blind | dim5 (3D) | Ghi chú |
|---|---|---|---|---|
| ch1-1-5 | B | B- | risky-planar | hệ lực phẳng, tilt foreshorten arrow |
| ch1-5-3 | A | A- | helps | nón ma sát — 3D đáng giá |
| ch2-1-3 | B | B- | risky-planar | osculating circle méo thành oval |
| ch2-2-2 | A- | B | helps | sphere đục che điểm M, vector nhỏ |
| ch2-3-2 | A | A- | helps | gear+belt 3D thật, mạnh |
| ch2-4-4 | A | B+ | helps | Coriolis cross-product hợp 3D; a_cor xám/mảnh |
| ch2-5-3 | B+ | B- | risky-planar | field arrow xám rất mờ |
| ch3-1-3 | A- | B+ | helps | frame-box giúp HQC phi quán tính |
| ch3-5-3 | A | A- | helps | L axial vector — 3D mạnh |
| ch3-6-2 | A- | C+ | neutral | 2 cầu chồng nhau lúc va chạm, không vector |

## Chính sách default 3D (blind đồng thuận 14:18)

- **Nên 3D-default:** ch1-5-3, ch2-3-2, ch3-5-3, ch2-4-4, ch3-1-3 (concept axial/nón/cross-product — perspective đáng giá).
- **Giữ 2D-default:** ch1-1-5, ch2-1-3, ch2-5-3 (concept phẳng — tilt làm méo hình học phẳng).
- **ch3-6-2 3D yếu nhất** (C+): cầu chồng, 1D không lợi gì từ 3D.

## Hành động thật (đã lọc false-fail)

Ưu tiên theo mức độ "lỗi thật + ảnh hưởng học":

**P1 — lỗi/khuyết thật:**
1. **ch1-3-6 legend màu sai** — legend ghi pink/blue, canvas vẽ tím. Lỗi rõ ràng, rẻ, sửa ngay.
2. **ch2-2-2 + ch2-4-4 đĩa nuốt viewport** — shrink/shift đĩa hoặc scale up vector để vector thành đối tượng chính. ch2-2-2 là phát hiện MỚI.
3. **ch3-1-3 framing** — nền xám đục → tăng tương phản; sim dồn góc → dùng worldBox lại; bỏ dead-space upper-right.

**P2 — polish:**
4. ch1-1-3 legend Fx màu ambiguity; ch1-5-3 green dùng cho equilibrium (semantic).
5. ch3-3-1 x(t) trace chạm mép đáy — nới worldBox y.
6. Dead-space dưới dầm/trục: ch1-1-8, ch3-2-3, ch3-5-4 (sim dồn top strip).

**KHÔNG hành động (false-fail đã xác minh):**
- ch3-5-3 "đóng băng", ch3-1-3 "no feedback", và mọi điểm trừ "static init==live limited feedback" — probe chứng minh control chạy. Đây là giới hạn capture, KHÔNG sửa sim.

## Đề xuất capture (để lần soi sau không false-fail nữa)

Capture spec hiện chụp init/live KHÔNG kéo slider → grader tĩnh luôn tưởng route static "đóng băng". Nên thêm frame `__slider-hi` (kéo slider chính tới max) cho route có slider quan trọng, để ảnh phản ánh feedback thật. Đây là sửa tooling dev-only, không động sim.

## Câu hỏi chưa giải quyết

1. ch1-1-5 dùng R-orange (resultant) và ch1-5-3 dùng green cho equilibrium — đây là quy ước cố ý hay nên sửa về strict semantic (đỏ=lực, lục=vận tốc)?
2. ch2-2-2/ch2-4-4: sửa Sim2 (shrink đĩa) hay promote Sim3 làm default cho 2 route này?
3. Có muốn thêm `__slider-hi` frame vào capture spec để diệt false-fail lần sau không?
