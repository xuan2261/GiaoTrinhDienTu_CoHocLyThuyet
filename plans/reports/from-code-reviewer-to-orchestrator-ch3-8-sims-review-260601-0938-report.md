# Review 8 sim chương 3 (động lực học) — sim2

Scope: js/sim2/sims/ch3/{ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4, ch3-6-2}.js
Bối cảnh API (sim-shell, dynamics, palette) đã đọc, không review.
Ngày: 2026-06-01. KHÔNG sửa code.

## Tổng quan
- Contract `{dispose}`: cả 8 file đạt — đều `return { dispose: shell.dispose }`; handle/control/panel/listener/RAF gỡ qua shell cleanups. Không leak.
- Start-paused: 4 sim động (ch3-2-2, ch3-3-1, ch3-5-3, ch3-6-2) đều `shell.onFrame(frame)` rồi `shell.stop()` → đạt. 4 sim tĩnh (2-3, 1-3, 5-2, 5-4) không onFrame → không cần.
- Physics readout: tất cả derive từ SimPhysicsDynamics, không faked (khớp RC1). ch3-5-3 đúng invariant: I là slider, ω=L/I derive, không có slider ω độc lập.
- NaN/divide-by-zero: không phát hiện — mọi `m` đều min≥0.5, `r` min 0.8, các mẫu số đều >0 hoặc có `|| 1` guard.

---

## ch3-1-3 (HQC quán tính vs phi quán tính)

### Important — hướng lệch con lắc NGƯỢC với lực quán tính (lỗi minh hoạ vật lý)
Dòng 38: `bobPt = { x: pivot.x + L * Math.sin(theta), ... }` với `theta = Math.atan2(state.aFrame, g) > 0` → bob lệch về +x.
Dòng 44-45: `fIner = D.dalembertForce(m, aFrame, 0)` → `fx = -m·a < 0`, mũi tên F* trỏ −x.
Toa gia tốc +x (mũi tên `a` trỏ +x) ⇒ lực quán tính −x ⇒ con lắc PHẢI lệch về −x (lùi lại). Hiện bob lệch +x, ngược chiều mũi tên F* và sai vật lý.
Sửa: `bobPt.x = pivot.x - L * Math.sin(theta)` (cùng phía với F*).

### Important — màu gia tốc dùng token sai (vi phạm quy ước lam=a)
Dòng 24,27,58: gia tốc toa vẽ bằng `Pal.moment` (tím #7c3aed) cho cả mũi tên + legend + LaTeX; còn `Pal.a` (lam) lại dùng cho quả bob (dòng 22). Quy ước bắt buộc: lam=gia tốc, tím=mô men/ω. Đây là gia tốc thẳng, phải dùng `Pal.a`.
Nội bộ nhất quán (legend+formula+arrow cùng tím) nên không sai legend, nhưng lệch quy ước token toàn cục. Sửa: đổi mũi tên+legend+`\textcolor` gia tốc sang `Pal.a` (#0074d9), bob đổi token khác.

---

## ch3-2-2 (Định luật II F=ma)
Physics đúng: `a=accelerationFromForce(F,m)`, v=a·t, đồ thị v(t) chuẩn, màu khớp legend.

### Minor — animation kẹp vị trí trong khi readout vẫn tăng
Dòng 42: `const cx = Math.min(9, x)` (x đã nhân hệ số hiển thị 0.4). Với F lớn/m nhỏ (a≈20) hộp chạm biên x=9 rất sớm rồi đứng yên, nhưng đồ thị v(t) + readout v vẫn tăng → lệch trực giác. Cân nhắc co `tMax` hoặc scale theo vMax để hộp không kẹt.

---

## ch3-2-3 (Định luật III lực–phản lực)
Cặp lực đối nhau đúng; clamp drag 20-80 ok; LaTeX `\textcolor` khớp palette.

### Minor — dùng `inertialForce` chỉ để đảo dấu
Dòng 40: `react = D.inertialForce(1, state.Fmag, 0)` chỉ để lấy `fx=-Fmag`. Hàm này nghĩa là lực quán tính d'Alembert, dùng ở đây để negate là hợp lệ về số nhưng lỏng ngữ nghĩa. Có thể thay `-state.Fmag` trực tiếp cho rõ ý.

### Minor — block B trùng đỏ với mũi tên lực
Dòng 24: block B `gradient:'force'`, `stroke:Pal.force` (đỏ) trùng màu mũi tên F_AB (đỏ). Khối vật nên dùng token trung tính để tách khỏi vector lực.

---

## ch3-1-3 — đã nêu ở trên.

## ch3-3-1 (RK4 ODE dao động)
RK4 đúng: `integrateMotion(m,k,()=>0,s.v,s.x,dt)` → deriv `{dx:v, dv:-(k/m)x}` đúng dạng `{dx,dv}`, bước từ trạng thái hiện tại mỗi frame. dt=1/60 cố định, ω·dt≪1 (k≤12,m≥0.5) → không phân kỳ. ω=√(k/m) ok.

### Minor — đồ thị x(t) vẽ bằng màu vận tốc
Dòng 27,30,70: đường x(t) (vị trí) dùng `Pal.v` (lục = token vận tốc). Khớp legend nội bộ nhưng lục mang nghĩa vận tốc; cùng pattern lặp ở ch3-5-2 (p(t) lục). Thống nhất: cân nhắc token riêng cho "đường đồ thị" hoặc chấp nhận như quy ước chung của dự án.

---

## ch3-5-2 (Động lượng & xung lượng)
Đúng: J=F·t và Δp=m·a·t=F·t ⇒ J≡Δp (định lý đúng, derive cùng nguồn `a`, không faked). pMax có `|| 1` guard. clamp 2-20 ok.

### Minor — p(t) vẽ bằng `Pal.v` (xem ghi chú ch3-3-1). Không chặn.

---

## ch3-5-3 (Bảo toàn mô men động lượng)
Đạt RC1: `Ltot` hằng (dòng 17), `ω=Ltot/I` derive (dòng 30-31,35), r là slider duy nhất, không slider ω. L readout = I·ω = const đúng. I=2·m·r², r min 0.8 → không chia 0. ω/cánh tay = tím (khớp quy ước mô men). Start-paused ok.

### Minor — khối lượng dùng token lực (đỏ)
Dòng 24-25,58: hai khối `gradient:'force'`, `stroke:Pal.force` (đỏ). Sim không có lực; đỏ là token lực. Khớp legend nội bộ nhưng đỏ mang nghĩa lực. Cân nhắc token trung tính cho khối.

---

## ch3-5-4 (Định lý động năng công–năng)
Đúng: W=F·d, v2=√(v1²+2W/m) (speed dương → `kineticEnergy` nhận speed, không vận tốc có dấu ✓), ΔT=½m(v2²−v1²)=W (derive nhất quán). clamp 1-15 ok.

### Minor — nhãn 'd' dùng `Pal.moment` (tím)
Dòng 27: nhãn quãng đường `d` màu tím (token mô men). 'd' là độ dài, không phải mô men; tím gây hiểu nhầm. Dùng `Pal.axis`/màu trung tính.

---

## ch3-6-2 (Va chạm hệ số phục hồi e) — sim trọng tâm
- collided guard (dòng 62-65): resolve đúng 1 lần, set `collided=true` → không dính-dính/không re-resolve mỗi frame. Đạt.
- reset khi ra biên (dòng 66): `p1.x>6 || p2.x<-6` → reset, `collided=false`. Đạt.
- `resolveCollision2D` chỉ xử lý khi `vrn>0` (đang lao vào) — dấu đúng, xung lượng bảo toàn (impulse đối nhau). p tổng readout tính thật mỗi frame từ v1,v2 → bảo toàn thật, không faked (khớp RC1). Đạt.
- T0 chụp ở reset từ speed `Math.hypot`; T mất = `max(0, T0−T) ≥ 0` đúng; với e<1 → T mất>0. `max(0,…)` chỉ chặn nhiễu float, không che lỗi vì va chạm e≤1 không thể tăng T. Đạt.
- Slider e KHÔNG reset (dòng 86-87) — chủ ý để đổi e quan sát; m1/m2 reset → T0 tính lại. Thiết kế đúng.
- Màu: m₁ `Pal.x`/rose, m₂ `Pal.y`/blue, trail rgba khớp hex palette (216,27,96=#d81b60; 21,101,192=#1565c0). Khớp legend.
- Không tunnel (Δ/frame≈0.053 ≪ R1+R2=1.4). m1,m2 min 1 → không chia 0.

**Sạch.** Không có issue.

---

## Tổng kết issue
| Mức | Số lượng |
|-----|----------|
| Critical | 0 |
| Important | 2 (đều ở ch3-1-3) |
| Minor | 7 (2-2:1, 2-3:2, 3-1:1, 5-2:1, 5-3:1, 5-4:1) |

File sạch hoàn toàn: **ch3-6-2**. Sạch ở mức Critical/Important: 6/8 (mọi file trừ ch3-1-3).

## Câu hỏi chưa giải quyết
1. Quy ước màu cho ĐƯỜNG ĐỒ THỊ (x(t)/p(t)) — dự án cố tình dùng `Pal.v` lục cho mọi đường đồ thị, hay nên có token riêng? Ảnh hưởng ch3-2-2/3-3-1/5-2.
2. ch3-1-3: xác nhận quy ước chiều — toa gia tốc +x là chuẩn, hay tài liệu gốc dùng chiều khác? Hướng lệch bob phải thống nhất với chiều này.

---
**Status:** DONE_WITH_CONCERNS
**Summary:** 8 sim chương 3 vững về contract/dispose/start-paused/physics-derive (khớp RC1); ch3-6-2 sạch tuyệt đối. Lỗi đáng kể duy nhất: ch3-1-3 vẽ con lắc lệch NGƯỢC chiều lực quán tính + dùng token tím cho gia tốc thẳng (phải lam).
**Concerns:** 2 Important ở ch3-1-3 (hướng lệch sai vật lý + sai token màu gia tốc) cần sửa trước khi ship; 7 Minor phần lớn là tái dùng token màu (lục cho đồ thị, đỏ cho khối) — không chặn.
