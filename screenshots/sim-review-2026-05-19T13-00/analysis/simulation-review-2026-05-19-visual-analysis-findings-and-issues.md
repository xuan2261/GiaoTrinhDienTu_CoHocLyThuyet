# Tự đánh giá 58 mô phỏng — Báo cáo tổng hợp

**Capture batch**: `screenshots/sim-review-2026-05-19T13-00/`
**Kỹ thuật**: Playwright Chromium 1440×900, viewport screenshot từng `.sim-container.sim-lab` ở trạng thái default sau 800ms settle.
**Pipeline khoẻ**: 58/58 OK · canvas 760×440 đồng nhất · 0 console error · 0 page error.
**Pháp tuyến**: ảnh chụp default state (t=0, slider mặc định), chưa kéo handle / chưa Chạy. Một số vấn đề có thể chỉ xuất hiện ở default state và biến mất khi tương tác — cần kéo lại để khẳng định.

---

## 1. Vấn đề HỆ THỐNG (xuất hiện ở >5 route)

### S1 — Slider hiển thị `px` thay vì đơn vị vật lý
Readout panel ghi N, m, °, kg·m² — slider lại ghi pixel. Học viên thấy **hai con số khác nhau cho cùng một đại lượng**.

| Route | Readout | Slider |
|---|---|---|
| ch1-1-4 | `d = 3 m` | `d: 180px` |
| ch1-1-6 | `d = 3 m` | `d: 180px` |
| ch1-3-3 | `Loại liên kết: 98` | `Chọn loại: 98px` (thực ra là discrete chooser) |
| ch1-3-4 | `a = 2.5 m` | `Vị trí tải a: 250px` |
| ch1-3-6 | `MA = 0.9 N·m` | `Mô men ngàm: 116px` |
| ch1-4-1 | `Hình chiếu: 134` | `Tỉ lệ Fz: 134px` |
| ch1-4-4 | `ΣM: 152` | `Tải phương trình: 152px` |
| ch1-6-2 | `xG: 295px`, `yG: 198px` | (cả readout lẫn slider px) |
| ch1-6-3 | `xG: 314px`, `Dịch G: 15.2px` | px |
| ch2-3-2 | `r1: 50px` | `Bán kính r1: 50px` (px ở mọi nơi) |
| ch2-5-3 | — | `Chiều dài thanh: 220px` |
| ch2-5-2 | `IC_x: 270`, `IC_y: 245` | px |

**Action**: chuẩn hoá slider sang m / N / deg.

### S2 — Toạ độ "Điểm đặt" / IC / xG báo bằng pixel canvas
Học viên dễ hiểu nhầm là toạ độ vật lý.
- ch1-1-3 `Điểm đặt (170; 290)`, ch1-1-8 `(380; 140)`
- ch1-6-2/3, ch2-5-2 (IC), ch3-5-1 (`x_C = 211`)

**Action**: chuyển sang m hoặc bỏ readout (giữ lại làm debug only).

### S3 — Readout / slider thiếu đơn vị, hoặc số raw thay cho label
- `ch1-3-3` `Loại liên kết: 98` ⇒ phải là `bản lề / gối / ngàm`
- `ch1-4-2` `MO: 0` thiếu đơn vị
- `ch1-4-4` `ΣM: 152` thiếu đơn vị
- `ch3-5-2` `J: —N·s` (em-dash thay số ⇒ chưa tính)
- `ch3-5-3` `L: 2`, `I: 1 kg·m²` (L thiếu đơn vị `kg·m²/s`)
- `ch3-5-4` `T: 22.5 J`, `V: 0 J` (OK), nhưng ε mong đợi không có
- `ch3-7-1` `Bài toán: 0` (số bài toán hay chỉ số?)
- `ch3-7-2` `điểm: 100`, `r1: 0` (mơ hồ)

**Action**: thống nhất đơn vị (kèm SI), dùng label rõ nghĩa.

### S4 — Label vector / cung đè hình
Lỗi xếp chồng visual nghiêm trọng nhất ở các route hình nhỏ:
- ch1-1-4 (`M_O` đè cung); ch1-1-5 (`F3` đè `vật rắn`); ch1-2-1 (`F2` xuất hiện 2 lần)
- ch1-2-6 panel FBD `R_x`, `M_O`, `R_y` đè cạnh khối
- ch1-3-3 `A_x`/`A_y` quá khít, ch1-3-6 `R_y`, `M_A` chồng cung
- ch1-4-2 `chiều x` chồng vector trục x; ch1-5-1 (`R, RR, vật, N` overlap)
- ch2-1-1 `v` và `M` cùng chỗ; ch2-2-2 `θ`/`v_p`/`a_t`/`a_n` xếp chồng
- ch2-4-1 `v_e`, `v_a`, `v_r`, `x` overlap quanh điểm M
- ch3-2-3 `F_AB`, `F_BA` viết liền `FA EBA` — không đọc được
- ch3-2-2 `F`, `vật`, `F_net=50` chồng nhau

**Action**: thêm offset cố định cho label; dùng leader line (đường dẫn nhãn) khi vector ngắn.

### S5 — Helper graphic tách rời ngữ cảnh
Cung mô men / tam giác / panel phụ đặt **cách xa** vật thể nó mô tả ⇒ học viên không hiểu nó thuộc về gì.
- ch1-1-6: cung `M` đặt ngoài body bên phải
- ch1-5-1: panel `TAM GIÁC TIẾP XÚC` (tam giác xanh) ngồi sau khối
- ch1-5-3: nón ma sát dashed cam vẽ tách cách xa khối
- ch1-5-4: vector `N`, label `tải` lơ lửng giữa canvas, không gắn đỉnh nêm
- ch1-3-1: block "vật" lơ lửng giữa hai bề mặt, không tiếp xúc rõ

### S6 — Panel placeholder rỗng ở default state
Nhiều route có hộp chú thích viết trước (`QUAN HỆ TRUYỀN ĐỘNG`, `MÔ MEN ĐỘNG LƯỢNG`, `PHƯƠNG TRÌNH HỆ`, `BẢNG SAI LỆCH`, `KẾT QUẢ`, `CÁC ĐỊNH LÝ`, `CÂN BẰNG`, `QUÁN TÍNH`, `BĂNG CÂN BẰNG`, `CỘN SAI LỆCH`, `BẢNG SỐ LIỆU`...) nhưng **rỗng** ở t=0. Học viên mở mô phỏng nhưng không thấy gì cho đến khi Chạy.
- ch2-2-2 `QUAN HỆ QUAY` rỗng
- ch2-3-2 `QUAN HỆ TRUYỀN ĐỘNG` rỗng
- ch3-2-1 `QUÁN TÍNH` rỗng
- ch3-2-2 `GIA TỐC`, `V(T)` rỗng
- ch3-2-3 `CẶP LỰC` rỗng
- ch3-3-2 `PHƯƠNG TRÌNH HỆ` rỗng
- ch3-4-1 `CÂN BẰNG` rỗng
- ch3-5-3 `MÔ MEN ĐỘNG LƯỢNG` rỗng
- ch3-5-4 `CÁC ĐỊNH LÝ` rỗng
- ch3-6-3 `KẾT QUẢ` rỗng
- ch3-7-2 `BẢNG SAI LỆCH` rỗng (4 ô empty)

**Action**: hoặc bỏ panel khi rỗng, hoặc fill default content (placeholder hint) để học viên biết nó là gì.

### S7 — DeCuong shell ghi đè header simulator
Một vài route khi mount đã hiển thị header DeCuong ("chương/mục… Ctrl K", icon font + theme + bookmark) **nằm chồng** lên `.sim-header`, làm mất tag `Mô phỏng chX-Y-Z` và badge interaction.
- ch2-1-1, ch2-1-4, ch2-7-2 (3/58)

**Action**: sim-only screenshot crop chuẩn `.sim-container.sim-lab`, vấn đề có thể nằm ở route mount ưu tiên DeCuong; cần check `js/loader.js` route map.

### S8 — Lỗi physics khả nghi (cần kiểm tra)
- **ch1-3-2**: slider `Hướng dây 20°` nhưng readout `α = 28°` ⇒ không khớp
- **ch1-5-3**: trạng thái `trượt` ở `α=19°, μ=0.46` ⇒ tan(19°)=0.34 < 0.46 ⇒ phải là `không trượt`
- **ch1-3-6**: `MA = 0.9 N·m` ở `Rx/Ry: 116` quá nhỏ — nghi sai đơn vị/scale
- **ch3-6-2**: `p trước (5;0)` và `p sau (5;0)` ở default state ⇒ chưa Chạy nên đúng, nhưng readout không show được sau khi chạy là vấn đề kiểm chứng
- **ch3-5-2**: `J: —N·s` ở `Δp = 20` ⇒ **không nhất quán**: phải là `J = Δp = 20 N·s`

---

## 2. Liệt kê chi tiết theo Chương

### CH1 — Tĩnh học (25 route)

| Route | Đánh giá ngắn | Vấn đề |
|---|---|---|
| ch1-1-3 | 🟢 OK | S2 |
| ch1-1-4 | 🟡 | S1, S4, S5 |
| ch1-1-5 | 🟡 | S4 (F3 đè "vật rắn") |
| ch1-1-6 | 🟡 | S5 (cung M tách body), S1 |
| ch1-1-8 | 🟡 | N vẽ trong body, mặt tựa không tiếp xúc, S2 |
| ch1-2-1 | 🟡 | F2 hiển thị 2 lần, S1 |
| ch1-2-3 | 🟢 **đẹp** | nhãn O hơi khít |
| ch1-2-6 | 🟢 **bố cục 2 panel tốt** | S4 trong FBD |
| ch1-3-1 | 🔴 | block vật lơ lửng, không tiếp xúc bề mặt nào |
| ch1-3-2 | 🟡 | tải nhỏ khó đọc, S8 (slider≠readout) |
| ch1-3-3 | 🔴 | S3 (loại liên kết là số), S1, vector đỏ không nhãn |
| ch1-3-4 | 🟢 OK | S1 |
| ch1-3-6 | 🟡 | S4, S1, **S8 (MA=0.9 nghi sai)** |
| ch1-3-7 | 🔴 | mũi tên trái clip ngoài canvas, thanh không nằm trên trục |
| ch1-4-1 | 🟡 | S4, S1 |
| ch1-4-2 | 🔴 | quá nhiều vector không nhãn rõ, route khó hiểu nhất CH1 |
| ch1-4-4 | 🟡 | vector chen góc, S1, S3 |
| ch1-5-1 | 🔴 | S4 nghiêm trọng (R/RR/vật/N overlap), tam giác tách |
| ch1-5-2 | 🟢 **3 panel demo tốt** | spokes "LĂN" khó đọc |
| ch1-5-3 | 🔴 | **S8 lỗi physics trạng thái**, S4 |
| ch1-5-4 | 🔴 | tải lơ lửng, không gắn đỉnh nêm, label rời |
| ch1-6-2 | 🟡 | S1 (xG/yG px) |
| ch1-6-3 | 🟡 | label `dịch` cùng `S` chồng, S1 |
| ch1-7-1 | 🟢 4 bước rõ | bước 1/4 chỉ FBD; cần thêm preview các bước sau |
| ch1-7-2 | 🟢 panel kiểm tra OK | S6 (`BẢNG CÂN BẰNG`, `CỘN SAI LỆCH` rỗng) |

### CH2 — Động học (15 route)

| Route | Đánh giá ngắn | Vấn đề |
|---|---|---|
| ch2-1-1 | 🟡 | S7 (DeCuong header), elip dashed mờ |
| ch2-1-2 | 🟢 **3 đồ thị x/v/a tốt** | đồ thị a phía dưới-trái lệch, các trục y không có scale |
| ch2-1-3 | 🟢 OK | gần như không có nhãn cong, ρ chỉ chấm xanh nhỏ |
| ch2-1-4 | 🟢 3 preset đẹp | S7 (DeCuong header) |
| ch2-2-2 | 🟡 | S6 panel rỗng, label θ/v_p/a_t/a_n chen ở P |
| ch2-3-2 | 🟡 | S1 (px ở r1 readout), S6, hai bánh răng nhưng không răng (chỉ vành) |
| ch2-4-1 | 🟢 trục Oxy + 3 vector | S4 (v_e/v_r/v_a/x đè nhau) |
| ch2-4-2 | 🟢 **3 panel tách 3 loại vận tốc tốt** | đơn vị/mũi tên rõ |
| ch2-4-3 | 🟢 tam giác A/B/v_a/v_e/v_r rõ | `\|v_e\|: —m/s` (thiếu giá trị) |
| ch2-4-4 | 🟢 vòng tròn quay, a_c vuông góc | a_e label nhỏ |
| ch2-5-1 | 🟢 vật rắn AB, v_A/v_B | label `ω×AB v_B` đè lên nhau |
| ch2-5-2 | 🟡 | thanh AB ở trên, IC dưới, nhưng vị trí O lạ; S2 |
| ch2-5-3 | 🟢 **profile vận tốc tăng dần đẹp** | S1 |
| ch2-7-1 | 🟢 3 panel x(T)/V(T)/A(T) | đồ thị X(T) chỉ vẽ 1/4 đường cong |
| ch2-7-2 | 🟢 bảng số liệu sinh động | S7 (DeCuong header), 1 số ô màu sai |

### CH3 — Động lực học (18 route)

| Route | Đánh giá ngắn | Vấn đề |
|---|---|---|
| ch3-1-2 | 🟡 | label `m=5 vật`, `F` chen, gia tốc `a=10.0` thiếu unit; S6 (`QUAN HỆ LỰC-GIA TỐC` rỗng) |
| ch3-1-3 | 🟢 **2 panel quán tính/phi quán tính tốt** | nhãn `m`, `vật`, `F` rất nhỏ |
| ch3-2-1 | 🟡 | label `vật vật F_net=50` chồng; S6 (`QUÁN TÍNH` rỗng) |
| ch3-2-2 | 🟡 | S6 (`GIA TỐC`, `V(T)` rỗng); `m=5` chồng `a=10.00` |
| ch3-2-3 | 🟡 | nhãn `FA EBA` viết dính (bug glyph); S6 |
| ch3-2-5 | 🟢 2 panel "lực thật" / "D'Alembert" | label `m` trong khung quá lớn |
| ch3-3-1 | 🟢 RK4 chạy, `T=2.53 J`, `V=3.87 J` | đường cong xanh dương rõ; tổng cơ năng không hiển thị (cần thêm panel) |
| ch3-3-2 | 🟢 lò xo + 2 khối nối tường | S6 (`PHƯƠNG TRÌNH HỆ` rỗng), label `m`/`vật`/`m2` chen |
| ch3-4-1 | 🟡 | panel `CÂN BẰNG` rỗng (S6); F+F* không hiển thị |
| ch3-4-2 | 🟢 **2 panel a(t) → F tốt** | label `vật` chồng, F arrow không có magnitude readout |
| ch3-5-1 | 🟢 m1/m2/m3 + `a_CM` + `ΣF_ext` | S2 (x_C px) |
| ch3-5-2 | 🟡 | **S8: J: —N·s khi Δp=20**; S6 (`F(T) XUNG LƯỢNG` rỗng); `p_truoc`, `p_sau` không có giá trị số |
| ch3-5-3 | 🔴 | S6 (`MÔ MEN ĐỘNG LƯỢNG` rỗng); chỉ vẽ 1 vector m/r ; readout `L: 2` thiếu unit |
| ch3-5-4 | 🟢 thanh `Động năng T` đầy 100% xanh | S6 (`CÁC ĐỊNH LÝ` rỗng), `Cơ năng E` thanh cam (chuẩn dùng cho V) |
| ch3-6-2 | 🟢 **2 bi sắp va chạm** | S6 (panel KẾT QUẢ thường rỗng default), p trước (5;0) p sau (5;0) đúng vì t=0 |
| ch3-6-3 | 🟡 | hiển thị v1/v1' và v2/v2' tốt; S6 (`KẾT QUẢ` rỗng) |
| ch3-7-1 | 🟢 4 thẻ chọn định lý | thẻ "KHỐI TÂM" highlight đỏ ; nhưng `Bài toán: 0` mơ hồ |
| ch3-7-2 | 🔴 | gần như rỗng (chỉ `BẢNG SAI LỆCH` 4 ô trống + mốc cam); chưa có nội dung gì để học viên đọc |

---

## 3. Tổng kết & priorities

### Tỉ lệ ngay từ ánh nhìn đầu (default state):
- 🟢 **OK / Tốt**: 28 / 58 (48%)
- 🟡 **Cần điều chỉnh nhỏ (label, slider unit, layout)**: 22 / 58 (38%)
- 🔴 **Cần redesign / sửa physics**: 8 / 58 (14%) — `ch1-3-1`, `ch1-3-3`, `ch1-3-7`, `ch1-4-2`, `ch1-5-1`, `ch1-5-3`, `ch1-5-4`, `ch3-5-3`, `ch3-7-2`

### Top fixes có lợi nhất (ROI cao):
1. **Đổi tất cả slider px → đơn vị vật lý** (S1) — sửa toàn bộ engine slider, ảnh hưởng ~12 route. Một change point.
2. **Standardize unit display ở readout panel** (S3) — 1 utility format, ảnh hưởng ~10 route.
3. **Sửa logic `ch1-5-3` (trạng thái trượt sai)** (S8) — bug physics check, độc lập route.
4. **Fix nhãn vector overlap** (S4) — text-baseline + offset systematic; ưu tiên các route 🔴.
5. **Loại / điền placeholder panel rỗng** (S6) — UX clarity ở default state.

### Câu hỏi cần xác nhận với user:
1. Có chấp nhận **slider mới hiển thị đơn vị vật lý** (đổi luồng renderer + i18n) hay chỉ relabel ngoài bề mặt?
2. Toạ độ "Điểm đặt" — bỏ luôn hay convert sang m?
3. Các panel rỗng (`KẾT QUẢ`, `MÔ MEN ĐỘNG LƯỢNG`...) — đã có nội dung sau khi Chạy chưa? (nếu có, default state nên có hint chữ chứ không phải hộp đen rỗng)
4. Mặc định khi mount, có nên **autoplay 2-3 frames** rồi pause để screenshot/UX có nội dung sẵn?
5. CH2-1-1 / CH2-1-4 / CH2-7-2 mount với DeCuong shell — confirm xem có phải bug hay route gốc thực sự dùng shell đó.

---

*Ảnh đầy đủ: `screenshots/sim-review-2026-05-19T13-00/index.html` (mở browser duyệt 58 sim).*
*Manifest JSON: `screenshots/sim-review-2026-05-19T13-00/capture-manifest.json`.*
