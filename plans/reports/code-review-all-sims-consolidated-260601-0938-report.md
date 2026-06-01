# Code review tổng hợp — 25 mô phỏng SVG-first + engine dùng chung

Ngày: 2026-06-01 · Phạm vi: `js/sim2/` (core engine 8 file + physics 3 file + registry + 25 sim ch1/ch2/ch3)
Phương pháp: orchestrator đọc tầng dùng chung + 2 sim mẫu → 3 reviewer song song theo chương → orchestrator verify trực tiếp 2 bug physics nặng nhất.

Sub-report:
- `from-code-reviewer-to-orchestrator-ch1-10-sims-review-260601-0938-report.md`
- `from-code-reviewer-to-orchestrator-ch2-7-sims-review-260601-0938-report.md`
- `from-code-reviewer-to-orchestrator-ch3-8-sims-review-260601-0938-report.md`

## Điểm tổng

| Tầng | Critical | Important | Minor | Ghi chú |
|---|---|---|---|---|
| Core engine + physics + registry | 0 | 0 | 1 | sạch; chỉ 1 minor markerId collision (rủi ro thấp) |
| Chương 1 (10 sim, tĩnh học) | 0 | 1 | 8 | ch1-5-3 reimplement physics inline |
| Chương 2 (7 sim, động học) | 0 | 2 | 4 | ch2-4-4 + ch2-5-2 |
| Chương 3 (8 sim, động lực học) | 0 | 2 | 7 | cả 2 ở ch3-1-3 |
| **Tổng** | **0** | **5** | **20** | |

Syntax `node --check`: 25/25 PASS. Contract `{dispose}`: 25/25 đúng. Listener/RAF/handle gỡ sạch qua shell helper (0 addEventListener trần). Sim động start-paused đúng. Không leak, không Critical.

---

## MUST FIX (orchestrator verify trực tiếp — confidence cao)

### 1. ch3-1-3 — con lắc lệch NGƯỢC chiều lực quán tính (dạy sai)
`js/sim2/sims/ch3/ch3-1-3.js:38`
```js
const bobPt = { x: pivot.x + L * Math.sin(theta), y: pivot.y - L * Math.cos(theta) };
```
Gia tốc toa trỏ +x (mũi `aArrow` vẽ sang phải, `state.aFrame*VIS>0`). Lực quán tính F* = −m·a trỏ −x (`fIner.fx<0`, mũi `finArrow` vẽ sang trái). Con lắc PHẢI lệch theo F* (sang trái). Code đang `+ L*sin` → lệch phải, ngược chiều mũi tên F* vẽ ngay cạnh nó.
**Sửa:** `x: pivot.x - L * Math.sin(theta)`.
Verify: đọc trực tiếp file:38 + đối chiếu `dalembertForce` (dynamics.js:128 trả `fx=-m*ax`) + hướng `aArrow`/`finArrow`. Confidence 95%.

### 2. ch2-5-2 — clamp A.x sai biên → thanh giãn quá độ dài, IC suy biến
`js/sim2/sims/ch2/ch2-5-2.js:72` (clamp) ↔ `:38-39` (dựng B)
```js
A = { x: Math.min(1.5, Math.max(-4.5, wp.x)), y: 0 };   // cho phép A.x tới -4.5
...
const dyy = Math.sqrt(Math.max(0, Llen * Llen - dx * dx)); // Llen=5, Bx=2
```
`dx = 2 - A.x`. Khi `A.x < -3` → `dx > 5` → `Llen²-dx² < 0` → `dyy=0`: thanh nằm bẹt, khoảng cách A→B = `dx > 5 ≠ Llen` (thanh "giãn"), IC suy biến/nhảy. Biên clamp `-4.5` không nhất quán ràng buộc thanh cứng dài 5.
**Sửa:** `Math.max(-3, wp.x)` (hoặc -2.99 để `dyy>0`).
Verify: đọc trực tiếp + tính dx tại A.x=-4.5 → dx=6.5 > 5. Confidence 95%.

---

## NÊN FIX (reviewer báo, chưa verify tay — confidence trung bình)

### 3. ch2-4-4 — hướng a_cor vẽ ngược nửa chu kỳ
`js/sim2/sims/ch2/ch2-4-4.js:39,49-54`. Chuyển động thực `rRel = 2 + 1.5·sin(vRel·t·0.5)` có vận tốc radial đổi dấu, nhưng mũi `v_rel` vẽ hướng cố định ra ngoài + độ lớn hằng `params.vRel`. a_cor = 2ω×v_rel suy ra từ v_rel hằng → nửa chu kỳ (khi rRel giảm) vẽ ngược chiều Coriolis thực. Vì đây là sim DẠY hướng Coriolis, lệch hướng = dạy sai.
**Đề xuất:** v_rel = đạo hàm `rRel` theo t (có dấu), hoặc đổi mô hình sang radial đều (xem câu hỏi mở).

### 4. ch1-5-3 — reimplement physics inline thay vì gọi module
`js/sim2/sims/ch1/ch1-5-3.js`. Tự viết `atan(mu)` + `beta>phi` thay vì `SimPhysicsDynamics.staticLimitAngle(mu)` + `slipCondition(alphaDeg,mu)` (đã có sẵn, đúng chính sim này). Output đúng nhưng vi phạm invariant "readout derive từ shared module" (RC1) + reimplementation song song (DRY).
**Đề xuất:** wire vào 2 hàm dùng chung.

---

## MINOR (20 mục — không chặn ship)

Phần lớn là **tái dùng token màu lệch ngữ nghĩa nhẹ** (nhất quán nội bộ từng sim nên không vi phạm cứng):
- ch3-1-3:24 — gia tốc thẳng dùng `Pal.moment` (tím) thay `Pal.a` (lam). *Nên đổi cùng đợt fix bug #1.*
- ch3 đường đồ thị x(t)/p(t) dùng `Pal.v` (lục); khối vật ch3-2-3/ch3-5-3 dùng đỏ; nhãn 'd' ch3-5-4 tím.
- ch1-2-3 lực độc lập dùng x/y; ch1-5-3 khối ma sát dùng `a`/lam; ch1-3-2 tension dùng `reaction`.

Còn lại:
- core `svg-render.js:73` markerId = `floor(width*7+height*13)` — 2 sim cùng w/h mount đồng thời sẽ trùng id. Loader mount 1 sim/route nên rủi ro thấp; marker fill `context-stroke` nên kể cả trùng vẫn đúng màu. Để nguyên được.
- ch2-1-1 quỹ đạo vượt khung khi v₀/α lớn (clip, không sai).
- ch2-1-3 cap vòng mật tiếp là dead-code.
- ch2-2-2 / ch2-4-4 mũi vector phình to khi chạy lâu (marker scale theo strokeWidth, không reset).
- ch2-3-2 `i` (gear ratio) bỏ dấu chiều quay ngược.
- ch3-2-2 animation kẹp biên.
- Hằng hardcode chủ ý: F ở ch1-1-6, hole.r ch1-6-3, `#fff` lỗ khoét, dt=1/60.

---

## Câu hỏi mở (cần user/tài liệu gốc quyết)

1. **ch2-4-4**: `rRel` dao động (sin) là CỐ Ý minh họa v_rel đổi dấu, hay nên đổi sang radial đều để hướng a_cor luôn đúng? (ảnh hưởng cách fix #3)
2. **ch3-1-3**: chiều dương gia tốc toa theo tài liệu gốc DeCuong §1.3 — xác nhận con lắc lệch ngược chiều chuyển động toa (đúng vật lý) để chốt dấu fix #1.
3. **ch2-5-2**: mô hình thanh trượt (A trên sàn, B trên tường) có đúng ý đồ "ladder §5.2" không — quyết biên clamp.
4. Quy ước màu đường đồ thị (x-t, p-t): dùng `Pal.v` (lục) có cố ý không, hay cần token riêng cho "đại lượng theo thời gian"?
5. Các hằng hardcode (F, hole.r) có định thêm slider ở đợt sau không?

---

**Status:** DONE — review 25/25 sim + engine hoàn tất.
**Summary:** 0 Critical, 5 Important (2 đã verify tay là bug dạy-sai cần fix trước ship: ch3-1-3 con lắc ngược dấu, ch2-5-2 clamp sai biên), 20 Minor (chủ yếu tái dùng token màu, không chặn). Engine + physics + contract dispose vững toàn bộ.
