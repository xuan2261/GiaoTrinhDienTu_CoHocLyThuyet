# Visual Assessment — Đánh Giá Giao Diện 52 Mô Phỏng

**Date:** 2026-05-31 11:17
**Method:** Xem trực tiếp 52/52 ảnh `sim-only` (crop canvas+readout) trạng thái hiện tại (gồm 5 route vừa fix phiên trước).
**Capture:** `plans/reports/260531-1117-visual-assess/` (52/52 ok).
**Rubric:** layout/spacing · nhãn rõ (không chồng/đúp) · nội dung đủ (không panel/readout rỗng) · readability · polish.
**Thang:** GOOD (sạch, không sửa) · OK (đọc được, lỗi nhẹ) · WEAK (defect rõ, nên sửa).

---

## FIXES APPLIED (2026-05-31, cùng phiên)

3 fix an toàn (bug dữ liệu + nhãn trục) đã áp + verify bằng ảnh. KHÔNG đụng physics/quyết định verified/tương tác.

| Pattern | Route | Fix | File | Verified |
|---|---|---|---|---|
| C | ch2-4-3 | thêm `veMag:60` vào initialState (readout `\|v_e\|` hết trống) + `noUnit:true` cho "Quan hệ vận tốc" (hết nối "m/s" vào công thức) | `ch2-kinematics-scenes.js:82,124` | ✅ `\|v_e\|=60 m/s` |
| A | ch1-4-1, ch1-4-2, ch1-4-4 | dời nhãn trục x/y/z ra đầu mũi tên (hàm `axes()` dùng chung) — hết "x R_x" dính | `ch1-spatial-renderers.js:38` | ✅ nhãn tách rời |
| B | ch3-5-3 | căn giữa orbit (148,242)→(360,215) + phóng bán kính 40-80→90-160px — hết dồn góc, lấp canvas | `ch3-theorems-renderers.js:90` | ✅ orbit giữa canvas |

**Còn lại CHƯA fix (cần user quyết — xem §Unresolved):** Pattern D (nhãn đúp — tầng drag-handle dùng chung), ch1-6-3 (rescale đụng mapping điểm kéo), ch2-4-1 Pattern A (mức OK, không WEAK), 4 item P3.

---

## Tổng quan

| Mức | Số route | % |
|---|---|---|
| GOOD | 28 | 54% |
| OK | 16 | 31% |
| WEAK | 8 | 15% |

**0 route BROKEN.** Đa số giao diện sạch. 8 route WEAK gom về **4 pattern**. Các lỗi "tệ" nặng (sai số, formula vỡ, N N, ε lệch) đã fix phiên trước — phần còn lại là **layout + nhãn chen + 1 readout trống + graph rỗng**.

---

## Scorecard từng route

### Ch1 — Tĩnh học (23)
| Route | Mức | Ghi chú visual |
|---|---|---|
| ch1-1-3 | GOOD | F/Fx/Fy + cung α sạch |
| ch1-1-4 | OK | nhãn "M_O" đè đường gạch ngang gần O |
| ch1-1-5 | OK | slider đã fix; **chấm "R" drag-handle trôi góc phải** (P3) |
| ch1-1-6 | GOOD | ngẫu lực +F/-F, cung M |
| ch1-1-8 | GOOD | "N N" đã fix → "N" |
| ch1-2-1 | GOOD | thanh 2 lực đồng trục, "Cân bằng: đúng" |
| ch1-2-3 | GOOD | hình bình hành lực, R đường chéo |
| ch1-2-6 | OK | FBD 2 panel; nhãn "Rx"/"M_O R_y" sát đáy box |
| ch1-3-1 | OK | nhãn "N" xuất hiện 2 lần (mũi tên + trong vòng) |
| ch1-3-2 | OK | nhãn "tải/P" chật trong box; tường góc trái tối |
| ch1-3-3 | OK | bản lề Ax/Ay + R đỏ, rõ |
| ch1-3-4 | GOOD | gối di động/cố định, dầm cân |
| ch1-3-6 | GOOD | ngàm MA/Rx/Ry |
| ch1-3-7 | GOOD | thanh 2 lực N dọc trục |
| ch1-4-1 | **WEAK** | **nhãn trục "x" đè nhãn vector "R_x" → "x R_x"** dính (3D) |
| ch1-4-2 | OK | mô men chiếu; nhãn trục x/y/z chen vector + "chiếu"+"F" |
| ch1-4-4 | OK | bảng cân bằng KG; nhãn trục gần vector R/P |
| ch1-5-1 | OK | box "vật" chứa N,R,R̂ hơi chật |
| ch1-5-2 | GOOD | ma sát nghỉ/trượt/lăn 3 panel + ngưỡng MN |
| ch1-5-3 | GOOD | nón ma sát mặt nghiêng |
| ch1-5-4 | GOOD | nêm tự hãm α<φ |
| ch1-6-2 | OK | trọng tâm ghép; nhãn "G1,2" chen chấm |
| ch1-6-3 | **WEAK** | **hình dồn góc trái-trên, ~50% canvas trống**; nhãn S₀/dịch chen |

### Ch2 — Động học (13)
| Route | Mức | Ghi chú visual |
|---|---|---|
| ch2-1-1 | GOOD | quỹ đạo elip + v/a_n |
| ch2-1-2 | GOOD | 3 đồ thị x/v/a dạng sin |
| ch2-1-3 | OK | tọa độ tự nhiên; nhãn "n ρ"/"P ρ" sát |
| ch2-1-4 | GOOD | 3 preset Tròn/Elip/Parabol |
| ch2-2-2 | GOOD | ε=0 đã fix (khớp slider) |
| ch2-3-2 | **WEAK** | **box "QUAN HỆ TRUYỀN ĐỘNG" mồ côi** (P3); 2 readout omega (omega2=1, ω=1.5) gây rối |
| ch2-4-1 | OK | hợp vận tốc; nhãn trục "x" chen "v_r", "M" sát chấm |
| ch2-4-2 | GOOD | 3 panel loại vận tốc |
| ch2-4-3 | **WEAK** | **readout "\|v_e\| = — m/s" TRỐNG**; "Quan hệ vận tốc: v_a=v_e+v_r **m/s**" nối đơn vị vào công thức |
| ch2-4-4 | OK | Coriolis; nhãn "a_e ω" chen giữa |
| ch2-5-1 | OK | chuyển động phẳng; nhãn "ω×AB"+"v_B" chen ở B |
| ch2-5-2 | GOOD | tâm vận tốc tức thời, vuông góc rõ |
| ch2-5-3 | GOOD | phân bố vận tốc IC→P1→P2→P3 mũi tên dài dần |

### Ch3 — Động lực học (16)
| Route | Mức | Ghi chú visual |
|---|---|---|
| ch3-1-2 | GOOD | F=ma, vật+F+a |
| ch3-1-3 | GOOD | hệ quán tính vs phi quán tính 2 panel |
| ch3-2-1 | OK | định luật quán tính; nhãn "vật vật" đúp |
| ch3-2-2 | **WEAK** | **box "v(T)" trục rỗng** khi chưa Chạy (P3); bất nhất autoplay vs ch3-3-1 |
| ch3-2-3 | GOOD | Newton III F_AB/F_BA tách rời |
| ch3-2-5 | GOOD | FBD động lực 2 panel |
| ch3-3-1 | GOOD | lò xo RK4 autoplay có đường cong |
| ch3-3-2 | GOOD | 2 khối nối lò xo m1-lò xo-m2 |
| ch3-4-1 | GOOD | D'Alembert SƠ ĐỒ LỰC |
| ch3-4-2 | GOOD | ngược động lực 2 panel |
| ch3-5-1 | **WEAK** | nhãn vector chen; **x_C=211 thiếu đơn vị**; hình dồn trái |
| ch3-5-2 | GOOD | xung lượng F(t) hình thang + động lượng trước/sau |
| ch3-5-3 | **WEAK** | **hình nhỏ dồn góc trái-trên, ~70% canvas trống**; nhãn O/L/m/mv chen chùm |
| ch3-5-4 | OK | biểu đồ năng lượng 3 thanh; chấm "vật" chen thanh T |
| ch3-6-2 | OK | va chạm 2D; nhãn "m1 1"/"m2 2" đúp nhẹ |
| ch3-6-3 | GOOD | formula "bảo toàn p, e" đã fix |

---

## 4 Pattern lỗi visual (8 route WEAK)

### PATTERN A — Nhãn trục tọa độ chồng nhãn vector (route 3D/đa vector)
**Route:** ch1-4-1 (nặng), ch1-4-2, ch1-4-4, ch2-4-1, ch3-5-1 (nhẹ)
Nhãn trục `x`/`y`/`z` vẽ tại gốc trục trùng vùng với nhãn vector (`R_x`, `v_r`, `a_CM`) → đọc thành "x R_x".
**Root:** renderer vẽ nhãn trục cố định gần gốc, không tránh nhãn vector. **Fix:** dời nhãn trục ra mép xa (đầu trục), hoặc nhãn vector lùi theo hướng mũi tên.

### PATTERN B — Bố cục dồn góc, phí canvas (hình nhỏ lệch trái-trên)
**Route:** ch1-6-3 (~50% trống), ch3-5-3 (~70% trống), ch3-5-1 (nhẹ)
Hình vẽ co cụm 1 góc, phần lớn canvas trống → trông sơ sài, nhãn chen vì thiếu chỗ.
**Root:** toạ độ vẽ hardcode nhỏ/lệch, không scale theo canvas. **Fix:** căn giữa + phóng to scale hình cho lấp canvas.

### PATTERN C — Readout/box rỗng (content thiếu)
**Route:** ch2-4-3 (`|v_e| = —`), ch3-2-2 (graph "v(T)" rỗng), ch2-3-2 (box mồ côi)
- ch2-4-3: readout `|v_e|` không có giá trị (`—`) — derived thiếu key `veMag`/tính sai.
- ch3-2-2: graph rỗng vì không autoplay (ch3-3-1 cùng kiểu lại autoplay → **bất nhất**).
- ch2-3-2: box overlay rỗng (P3, cần inspect runtime).
**Fix:** ch2-4-3 cấp giá trị |v_e|; ch3-2-2 autoplay HOẶC vẽ placeholder/đường cong tĩnh; ch2-3-2 xem runtime DOM.

### PATTERN D — Nhãn đúp nhẹ (cùng object 2 nhãn)
**Route:** ch1-3-1 ("N" ×2), ch3-2-1 ("vật vật"), ch3-6-2 ("m1 1"/"m2 2"), ch1-6-2 ("G1,2")
Renderer vẽ nhãn ký hiệu + nhãn caption sát nhau, hoặc chấm kéo có nhãn riêng đè nhãn object.
**Fix:** gộp/giãn nhãn, bỏ nhãn trùng.

---

## Prioritized Recommendations

**P1 (content thiếu — học sinh thấy ngay):**
1. ch2-4-3 readout `|v_e|` trống → cấp giá trị.
2. ch3-2-2 graph rỗng → autoplay hoặc vẽ đường cong tĩnh (đồng bộ chính sách với ch3-3-1).

**P2 (layout — ảnh hưởng cảm nhận "tệ" rõ nhất):**
3. PATTERN B: ch1-6-3, ch3-5-3 căn giữa + phóng to hình (lấp canvas).
4. PATTERN A: ch1-4-1 dời nhãn trục khỏi nhãn vector (nặng nhất); kéo theo ch1-4-2/4-4/ch2-4-1/ch3-5-1.

**P3 (polish — nhẹ):**
5. PATTERN D: bỏ nhãn đúp (ch1-3-1, ch3-2-1, ch3-6-2, ch1-6-2).
6. ch2-3-2 box mồ côi (inspect runtime), ch2-3-2 dual omega readout (bỏ 1).
7. ch1-1-5 chấm R drag-handle trôi (interaction design — cần chốt hướng).
8. ch3-5-1 x_C thêm đơn vị (lưu ý: quyết định trước là pixel coord KHÔNG gắn đơn vị SI — cần xác nhận trước khi đổi).

---

## Unresolved Questions

1. **ch3-2-2 / graph rỗng:** chính sách mong muốn là autoplay (như ch3-3-1) hay giữ "đợi Chạy"? Nếu giữ đợi thì có nên vẽ placeholder text/đường cong mờ để không trông như lỗi?
2. **ch3-5-1 x_C đơn vị:** report phiên trước ghi pixel-coord KHÔNG gắn đơn vị SI là quyết định cố ý. Có muốn đảo không, hay giữ?
3. **ch1-1-5 chấm R:** dời/ẩn drag-handle ở chế độ "Thu gọn" = đụng interaction. Đồng ý hướng ẩn handle khi không phải điểm kéo chính?
4. **Phạm vi:** bạn muốn tôi sửa luôn P1+P2 (5-6 route), hay chỉ báo cáo để bạn chọn?
