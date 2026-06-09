# Deep visual + pedagogy review — 35 mô phỏng (read-only)

**Date:** 2026-06-09 · **Scope:** đánh giá SÂU bằng MẮT trên 3 trục automation BỎ SÓT (sư phạm / thẩm mỹ / Sim2-vs-Sim3). CHỈ đánh giá → report. KHÔNG sửa sim.
**Chuẩn chấm:** PhET-strict (user chốt). 🟢 đạt PhET-grade · 🟡 dùng được nhưng dưới chuẩn · 🔴 lỗi sư phạm/thị giác.
**Nguồn:** chụp tươi state SAU-fix (2026-06-08) — 66 PNG Sim2 (`plans/260531-2122-.../visuals`, full card + app CSS) + 10 PNG Sim3 (`./visuals/sim3`). Mỗi static soi init+live; mỗi dynamic soi t0/mid/end.

---

## 1. Tóm tắt

**Soi 35/35 bằng mắt. Nền tảng đúng như automation báo: 0 lỗi physics, 0 nối nhầm biến, 0 chồng nhãn.** Phần soi-mắt tìm ra thứ automation KHÔNG bắt được:

- **1 bug thị giác thật (HIGH, verified code):** ch3-3-1 đồ thị x(t) bị clip dưới play-area.
- **4 route dead-space lớn (MEDIUM):** worldBox chưa tối ưu cho sim tĩnh đơn giản → cảnh dồn nửa trên, nửa dưới trống.
- **1 khoảng-trống sư phạm (MEDIUM):** ch1-5-3 "nón ma sát" 2D chỉ hiện φ dạng SỐ, không vẽ nón — khái niệm cốt lõi không trực quan hóa (Sim3 fix đúng việc này).
- **2 polish nhỏ (LOW):** mô men thiếu mũi tên cong chỉ chiều; cụm vector Coriolis 2D nhỏ ở rìa đĩa to.
- **Sim2-vs-Sim3:** 5 route 3D THẮNG rõ về giá trị sư phạm; 2 route 3D có thể HẠI khái niệm (vốn phẳng).

**3 fix hôm qua xác nhận đạt bằng mắt:** ch3-5-2 (J=F·t cam + p(t) lục đều có nhãn), ch2-4-4 (a_cor/v_rel tách), ch3-6-2 ("ΔT dự đoán" live).

**Báo động giả đã loại (verify code, KHÔNG report):** ch1-1-8 mũi tên phản lực TRÔNG bằng nhau — nhưng code `r.ra*VIS` (`ch1-1-8.js:46-47`) CÓ scale theo độ lớn, tỉ lệ 60:40 đúng, chỉ subtle ở scale nhỏ. Không phải bug.

---

## 2. Bảng 35 route × 3 trục

Cột: **SP** sư phạm (dạy đúng/rõ?) · **TM** thẩm mỹ (bố cục/chiều sâu/PhET-grade?) · **Sev**. 🟢/🟡/🔴.

### Sim2 (25)

| Route | Tên | SP | TM | Sev | Ghi chú soi-mắt |
|---|---|---|---|---|---|
| ch1-1-3 | Véc tơ lực | 🟢 | 🟢 | ⚪ | Fx/Fy nét đứt rõ, tô màu khớp |
| ch1-1-4 | Mô men & cánh tay đòn | 🟢 | 🟡 | 🟡 | M chỉ là SỐ, thiếu mũi tên cong chiều quay; dead-space phải lớn |
| ch1-1-5 | Thu gọn hệ lực → R+Mo | 🟢 | 🟢 | ⚪ | R hợp lực cam nổi bật |
| ch1-1-6 | Ngẫu lực | 🟢 | 🟢 | ⚪ | Cặp F đối song rõ |
| ch1-2-3 | Hình bình hành lực | 🟢 | 🟢 | ⚪ | Đường chéo dựng đẹp, 3 màu tách |
| ch1-1-8 | Phản lực + FBD | 🟢 | 🟢 | ⚪ | Arrow CÓ scale (verified); ratio subtle |
| ch1-3-2 | Lực căng dây | 🟢 | 🟢 | ⚪ | T₁/T₂ đối xứng, W rõ |
| ch1-3-6 | Phản lực & mô men ngàm | 🟢 | 🟡 | 🟡 | M ngàm chỉ SỐ; hatching ngàm nhỏ; dead-space phải |
| ch1-5-3 | Nón ma sát mặt nghiêng | 🟡 | 🟢 | 🟡 | **F-Cone**: "nón" φ chỉ là SỐ, KHÔNG vẽ nón ở 2D — concept cốt lõi vô hình |
| ch1-6-3 | Trọng tâm ghép/khoét | 🟢 | 🟢 | ⚪ | Lỗ khoét + C lệch rõ; badge §6.3 (content-owner) |
| ch2-1-1 | Quỹ đạo + v,a | 🟢 | 🟢 | ⚪ | v tiếp tuyến / a xuống rõ |
| ch2-1-3 | Tiếp/pháp tuyến + R cong | 🟢 | 🟢 | ⚪ | Vòng mật tiếp tím đẹp, τ/n tách |
| ch2-2-2 | Quay quanh trục | 🟢 | 🟢 | ⚪ | Đĩa tím + M biên |
| ch2-3-2 | Truyền động răng-đai-puli | 🟢 | 🟢 | ⚪ | 2 cụm răng/puli, đai cam |
| ch2-4-4 | Hợp CĐ & Coriolis | 🟢 | 🟡 | 🟡 | Nhãn đã tách (fix); cụm vector NHỎ ở rìa đĩa TO → concept khó thấy |
| ch2-5-2 | Tâm vận tốc tức thời IC | 🟢 | 🟢 | ⚪ | IC = giao 2 pháp tuyến, dạy chuẩn PhET |
| ch2-5-3 | Trường vận tốc vật rắn | 🟢 | 🟢 | ⚪ | Field arrows tỉ lệ r đẹp |
| ch3-2-2 | F=m·a | 🟢 | 🟡 | ⚪ | Khối + đồ thị v(t); dead-space dưới |
| ch3-2-3 | Lực & phản lực | 🟢 | 🟡 | 🟡 | F_AB/F_BA rõ; dead-space dưới ~40% |
| ch3-1-3 | HQC quán tính | 🟢 | 🟢 | ⚪ | Con lắc lệch θ trong toa |
| ch3-3-1 | Giải ODE RK4 | 🟢 | 🔴 | 🔴 | **Đồ thị x(t) CLIP** — lobe âm tràn dưới play-area (verified `ch3-3-1.js:11,55`) |
| ch3-5-2 | Động lượng & xung lượng | 🟢 | 🟢 | ⚪ | Fix hôm qua đạt: J=F·t cam + p(t) lục có nhãn |
| ch3-5-3 | Bảo toàn mô men ĐL | 🟢 | 🟢 | ⚪ | Cánh tay r + khối quay |
| ch3-5-4 | Định lý động năng | 🟢 | 🟡 | 🟡 | W=F·d rõ; dead-space dưới RẤT lớn (~45%) |
| ch3-6-2 | Va chạm e | 🟢 | 🟢 | ⚪ | Fix hôm qua đạt: "ΔT dự đoán" live khi kéo e |

### Sim3 (10)

| Route | SP | TM | vs Sim2 | Ghi chú |
|---|---|---|---|---|
| ch1-1-5#3d | 🟡 | 🟢 | ⚠️ HẠI | Bài "hệ lực **PHẲNG**" — vẽ vector nổi 3D phản khái niệm (dù Mo cong đẹp) |
| ch1-5-3#3d | 🟢 | 🟢 | ✅ THẮNG đậm | **Vẽ nón ma sát THẬT** (tím trong suốt) — đúng concept Sim2 bỏ lỡ |
| ch2-1-3#3d | 🟡 | 🟢 | ⚠️ HẠI nhẹ | Độ cong là concept phẳng; nghiêng 3D → ellipse gây nhiễu |
| ch2-2-2#3d | 🟢 | 🟢 | ✅ thắng nhẹ | Trục quay dọc hiện rõ trong không gian |
| ch2-3-2#3d | 🟢 | 🟢 | ✅ THẮNG | Răng cưa thật, chiều sâu cơ khí |
| ch2-4-4#3d | 🟢 | 🟢 | ✅ THẮNG | Đĩa quay trong KG; pill-badge tách; concept Coriolis dễ thấy hơn 2D |
| ch2-5-3#3d | 🟢 | 🟢 | ➖ hòa | Field 3D đẹp nhưng 2D đã đủ rõ |
| ch3-1-3#3d | 🟢 | 🟢 | ✅ thắng nhẹ | Toa-hộp 3D + con lắc lệch trực quan |
| ch3-5-3#3d | 🟢 | 🟢 | ✅ THẮNG | 2 khối quay quanh trục dọc — bảo toàn L rõ hơn 2D phẳng |
| ch3-6-2#3d | 🟢 | 🟢 | ➖ hòa | Va chạm 3D ổn; 2D cũng đủ |

Cross-check: 25 Sim2 + 10 Sim3 = 35. ✓

---

## 3. Findings xếp ưu tiên

### 🔴 HIGH-1 — ch3-3-1 đồ thị x(t) bị clip [VERIFIED code]
Đồ thị dao động vẽ tại `gy = gy0 + (x/2)*gh` = −3 ± 1.6 → biên dưới **−4.6**, nhưng `worldBox.minY = −4` (`ch3-3-1.js:11, 26, 55`). Lobe âm của dao động điều hòa bị cắt ~0.6 world-unit dưới khung. Học sinh thấy đồ thị "cụt đáy" → hiểu sai biên độ đối xứng. **Hướng (không sửa):** nới `minY` xuống ~−5, hoặc giảm `gh`/`gy0` để đồ thị nằm gọn. Đây là bug thị giác thật, không phải gu.

### 🟡 MEDIUM-2 — Dead-space lớn ở 4 sim tĩnh
ch3-5-4 (~45%), ch3-2-3 (~40%), ch1-1-4, ch1-3-6 (phải lớn). Cảnh dồn nửa khung, nửa còn lại trống. Memory ghi worldBox-shrink CHỈ áp cho sim tĩnh dồn-góc — 4 route này lọt lưới. **Hướng:** co worldBox sát nội dung (chỉ sim TĨNH, không đụng sim động kẻo clip quỹ đạo).

### 🟡 MEDIUM-3 — ch1-5-3 "nón ma sát" 2D vô hình
Khái niệm trung tâm của bài (nón ma sát góc φ) ở Sim2 CHỈ là con số "φ=24.2°". Sim3 vẽ hẳn nón tím trong suốt — đúng việc. **Hướng (chọn 1):** (a) đặt Sim3 làm default route này; hoặc (b) thêm cung/hình nón góc φ vào bản 2D. Quyết định thuộc user (ảnh hưởng default engine).

### 🟡 LOW-4 — Mô men thiếu mũi tên cong chỉ chiều
ch1-1-4, ch1-3-6: M/M-ngàm chỉ hiện số + mũi tên thẳng. PhET thường thêm cung tròn có đầu mũi tên chỉ chiều quay (CW/CCW). **Hướng:** thêm arc-arrow semantic cho moment (polish, không bắt buộc).

### 🟡 LOW-5 — ch2-4-4 2D cụm vector nhỏ ở rìa đĩa to
Đĩa tím chiếm ~70% khung, cụm a_cor/v_rel ở mép trên nhỏ. Nhãn đã tách (fix hôm qua OK) nhưng tỉ lệ đĩa/vector lệch. **Hướng:** thu đĩa hoặc phóng cụm vector. Sim3 xử lý không gian tốt hơn.

---

## 4. Sim2 vs Sim3 — khuyến nghị default (chỉ gợi ý)

**3D THẮNG rõ → cân nhắc default 3D (5 route):**
- ch1-5-3 (nón ma sát) — thắng đậm nhất, vá đúng MEDIUM-3
- ch2-3-2 (bánh răng) · ch2-4-4 (Coriolis) · ch3-5-3 (bảo toàn L) · ch2-2-2 (quay trục)

**3D có thể HẠI khái niệm → GIỮ 2D default (2 route):**
- ch1-1-5 (thu gọn hệ lực **phẳng**) — 3D phản tên bài
- ch2-1-3 (bán kính cong) — concept phẳng, 3D thành ellipse gây nhiễu

**Hòa (3 route):** ch2-5-3, ch3-1-3, ch3-6-2 — để 2D default, 3D là tùy chọn.

> Lưu ý: đây là phán xét sư phạm, KHÔNG phải lỗi. Default engine là quyết định của user. Mọi route 3D hiện đều fallback 2D khi WebGL fail (an toàn).

---

## 5. Câu hỏi mở (user quyết)

1. **ch3-3-1 clip (HIGH-1):** fix round sau không? (bug thị giác thật, dễ sửa — nới worldBox.)
2. **ch1-5-3 nón 2D (MEDIUM-3):** đổi default sang 3D, hay thêm hình nón vào 2D, hay để nguyên?
3. **Default 3D cho 5 route thắng rõ (mục 4):** có muốn đổi mặc định không, hay giữ 2D-default toàn bộ + 3D opt-in như hiện tại?
4. **Dead-space 4 sim tĩnh (MEDIUM-2):** đáng gom 1 round polish worldBox không, hay chấp nhận?
5. **Mô men arc-arrow (LOW-4):** polish hay bỏ qua (YAGNI)?

Không finding nào chạm physics/binding (automation đã khóa 9/9 + 23/23). Toàn bộ là visual/sư phạm — đúng phần "chất lượng thực tế" mà test xanh không phản ánh.
