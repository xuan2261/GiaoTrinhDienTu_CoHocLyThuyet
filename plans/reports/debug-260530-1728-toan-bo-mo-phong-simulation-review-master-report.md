# Báo cáo tổng hợp — Review/Debug toàn bộ 52 mô phỏng giáo trình Cơ Học Lý Thuyết

Ngày: 2026-05-30 | Phạm vi: 52 route canonical (Ch1=23, Ch2=13, Ch3=16) | Chế độ: read-only audit
Phương pháp: chụp ảnh runtime cả 52 route (Playwright, server 8011) + 3 agent quét code/physics song song + đối chiếu lý thuyết HTML từng mục + verify trực tiếp root cause.

Báo cáo chi tiết theo chương:
- `debug-260530-1728-ch1-statics-sim-audit-report.md`
- `debug-260530-1728-ch2-kinematics-sim-audit-report.md`
- `debug-260530-1728-ch3-dynamics-sim-audit-report.md`
Ảnh chụp: `plans/reports/260530-sim-review-capture/sim-only/` + `index.html`.

---

## 1. Tóm tắt điều hành

**52/52 route mount OK, 0 crash, 0 blank canvas, 0 console error.** Vấn đề KHÔNG phải "vỡ kỹ thuật" mà là **sai physics / lệch lý thuyết / sai đơn vị / placeholder rỗng** — đúng như nhận xét "mô phỏng tệ, không liên hệ đúng lý thuyết".

| Chương | Tổng | GOOD | WEAK | BROKEN |
|---|---|---|---|---|
| Ch1 Tĩnh học | 23 | 13 | 5 | 5 |
| Ch2 Động học | 13 | 7 | 5 | 1 |
| Ch3 Động lực học | 16 | 9 | 6 | 1 |
| **Tổng** | **52** | **29 (56%)** | **16 (31%)** | **7 (13%)** |

**Kết luận gốc:** Cả 3 module toán dùng chung (`sim-physics-statics.js`, `sim-physics-kinematics.js`, `sim-physics-dynamics.js`) đều **đúng toán**. Lỗi nằm ở **lớp wiring/render từng route**: các hàm `derived`/`onTick` tự cài lại physics bằng heuristic pixel thay vì gọi helper đã verify. Nặng nhất là Ch1.

---

## 2. Năm pattern lỗi hệ thống (root cause)

### RC1 — Route logic bỏ qua module toán đúng, tự tính bằng pixel heuristic
Verify trực tiếp: trong toàn bộ `js/sims/ch1/`, số lần gọi `SimPhysicsStatics.` = **0** (grep). Adapter `statics-routes.js`→`SimStatics` là dead code (đăng ký vào `SimRegistry` riêng, engine `sim-professional-lab.js` không dùng). Hệ quả: giá trị "trông hợp lý" nhưng sai vật lý/sai đơn vị.

### RC2 — Tọa độ pixel in ra gắn nhãn SI ("m", "N")
Tọa độ canvas thô hiển thị như đại lượng vật lý:
- ch1-4-1: "Hình chiếu = 100 **m**" (hình chiếu lực phải là N)
- ch1-6-2/6-3: xG=295 **m**, "S lỗ=52 **m**" (diện tích phải m²)
- ch2-5-2: IC_x=270 **m**, IC_y=245 **m** (tọa độ pixel)
- ch3-5-1: x_C=211 **m**; ch2-5-1: |v_B|=245 m/s (pixel-scale phi lý)
- ch1-1-3/1-8/2-5-2: "Tọa độ (170;290)" pixel thô

### RC3 — Bảo toàn/cân bằng GIẢ TẠO (ép số liệu, che thực tế)
- **ch3-6-2** (verify line 75): `setCollisionMomentum(state, p0, p0, 0)` chạy **mỗi tick** → ép p_trước=p_sau=p0, residual=0 → panel **luôn** báo "bảo toàn" bất kể va chạm tường lật vx phá vỡ p hệ.
- **ch1-4-4**: sim "cân bằng" nhưng ΣF=116N, ΣM=100N·m **không bao giờ về 0**; `residual=|x−y|/100` vô nghĩa → dạy NGƯỢC điều kiện cân bằng (R=0 ∧ M=0).

### RC4 — Trạng thái mặc định/nhãn mâu thuẫn chính khái niệm đang dạy
- **ch3-2-1**: công thức đúng (`a=F·cosα/m`, F=0→v=const) NHƯNG default F=50→a=10, hiển thị mâu thuẫn tiêu đề "F=0 → v=const".
- **ch3-2-3**: ĐÍNH CHÍNH (verified `onTick_ch323` + scene m2=1): a1=10, a2=−50 là Newton III ĐÚNG — m1=5≠m2=1 nên gia tốc tỉ lệ nghịch khối lượng (lực bằng nhau). Đánh giá RC4 ban đầu (giả định m1=m2) SAI. Chỉ còn lỗi cosmetic nhãn chồng "FABFBA".
- Sai thứ nguyên: ch1-5-3 "tan α=0.34**°**", ch1-4-2 "MO=0**°**" (mô men gắn ký hiệu độ), ch1-3-6 slider "Mô men ngàm: 1**m**", ch2-2-2 "ω₀: 0 rad/s²".

### RC5 — Ô placeholder rỗng + véc tơ/nhãn trang trí không bám readout
- Panel rỗng to giữa canvas: ch3-5-3 "MÔ MEN ĐỘNG LƯỢNG", ch3-2-2 "GIA TỐC"/"V(T)", ch2-2-2 "QUAN HỆ QUAY", ch2-3-2 "QUAN HỆ TRUYỀN ĐỘNG", ch3-6-3 "KẾT QUẢ".
- Véc tơ vẽ cố định không bám số: ch1-1-5 (F1,F2,F3 hardcode), ch1-2-6 (Rx/Ry), ch1-3-3 (luôn vẽ cả Ax,Ay bất kể selector).
- Nhãn chồng đè: ch3-2-3 "FABFBA", ch2-5-1 "ω×AB v_B", ch1-1-8 "N N".
- Công thức render vỡ: ch3-5-1 "m·a_C M=ΣF_e xt", ch3-6-3 "bảotoànp,e", ch2-5-2/5-3 "IÁ".

---

## 3. Danh sách 7 route BROKEN (ưu tiên P0/P1 — sửa trước)

| # | Route | Mục | Lỗi cốt lõi | Bằng chứng | Sev |
|---|---|---|---|---|---|
| 1 | **ch1-4-4** | Cân bằng không gian | ΣF, ΣM không bao giờ →0; residual `|x−y|/100` bịa → dạy ngược điều kiện cân bằng | behaviors:98; ảnh 17 | P0 |
| 2 | **ch1-4-1** | Hợp lực không gian | 2 hợp lực mâu thuẫn cùng lúc (Rxyz=200 vs |R|3D=106); thành phần là pixel map; "100 m" | behaviors:80-88; ảnh 15 | P0 |
| 3 | **ch2-5-2** | Tâm vận tốc tức thời | IC là chấm kéo tự do (270,245), KHÔNG suy từ hình học; helper `locateInstantCenter` là dead code | behaviors-b.js:126-136; phys-kinematics.js:300 | P0 |
| 4 | **ch1-1-5** | Thu gọn hệ lực | F1,F2,F3 hardcode trang trí; R,M_O chỉ từ 1 véc tơ kéo, không phải ΣFi/ΣMi | renderers:94; behaviors:122 | P1 |
| 5 | **ch1-4-2** | Mô men 3D | Mô men giả `F·arm·cosα/120`; readout "MO" in bằng ĐỘ | behaviors:25; ảnh 16 | P1 |
| 6 | **ch1-3-3** | Phản lực bản lề | Ax,Ay = phân số cố định 0.55F/0.83F bất kể tải/góc; renderer phớt lờ selector | behaviors:94-95; renderers:105-106 | P1 |
| 7 | **ch3-3-2** | Cơ hệ 2 khối lò xo | Vẽ 3 lò xo nhưng PT chỉ mô hình lò xo giữa; 2 lò xo tường không tạo lực; dùng Euler thay RK4 | behaviors:98-99 vs spring-renderers:87-107 | P1 |

---

## 4. Danh sách 16 route WEAK (sửa sau BROKEN)

| Route | Mục | Lỗi chính | Sev |
|---|---|---|---|
| ch1-5-1 | Phân tích lực tiếp xúc | Fms không bị chặn → Fms=88N > μN=53.2N, vi phạm chính bất đẳng thức in ra | P1 |
| ch1-2-1 | Cân bằng 2 lực | balanceError=|dy| px, bỏ qua F1≠F2 | P2 |
| ch1-2-6 | Sơ đồ FBD | Rx/Ry trang trí; moment=(p.x−476)·F/60 tùy tiện | P2 |
| ch1-6-2 | Trọng tâm ghép | Kéo G thì gx=p.x → trọng tâm tách rời công thức | P2 |
| ch1-6-3 | Trọng tâm lỗ khoét | Sai đơn vị "m"; hình không vẽ lỗ khoét tương ứng %; mẫu số có thể →0 | P2 |
| ch2-4-4 | Gia tốc Coriolis | a_c đúng nhưng a_e BỊA (`hypot(px−280,py−180)·ω²/10`); P không trượt thực | P1 |
| ch2-3-2 | Truyền động | Slider r1 (0–80) bị clamp [0.56,1.6] → ~98% thanh trượt vô tác dụng; v=0 khi quay | P1 |
| ch2-1-2 | Đồ thị x/v/a | x/v/a hardcode 54·sin/cos(t), cố định bất kể control; không có vật để "đồng bộ" | P2 |
| ch2-4-1 | Hợp chuyển động | Tam giác đúng nhưng chỉ véc tơ trừu tượng, không có hệ quy chiếu động | P2 |
| ch2-5-1 | Tịnh tiến+quay | Cực A có v_A nhưng không bao giờ tịnh tiến → thành quay thuần | P2 |
| ch3-6-2 | Va chạm 2D | Bảo toàn p giả (ép mỗi tick); vx là px/frame nhưng nhãn kg·m/s | P1 |
| ch3-5-3 | Mô men động lượng | Cốt lõi "bảo toàn L" KHÔNG minh họa; I,ω,r slider độc lập dù I≡mr²; panel rỗng | P1 |
| ch3-5-1 | Định lý khối tâm | a_CM và ΣF_ext vẽ không song song; khối quay chỉ trang trí | P2 |
| ch3-5-2 | Xung-động lượng | Renderer pAfter có số hạng `0.25·F·t` tăng vô hạn, phi vật lý | P2 |
| ch3-4-2 | Ngược suy lực | Behavior sin(0.5t) vs renderer sin(2t) → đường cong a(t) lệch tần số với readout | P2 |
| ch3-6-3 | Giải va chạm | 1D đúng nhưng mục yêu cầu va chạm XIÊN — chưa có input góc/2D | P2 |

---

## 5. 29 route GOOD (đạt yêu cầu physics + lý thuyết)

- **Ch1 (13):** ch1-1-3, 1-1-4, 1-1-6, 1-1-8, 1-2-3, 1-3-1, 1-3-2, 1-3-4, 1-3-6, 1-3-7, 1-5-2, 1-5-3, 1-5-4
- **Ch2 (7):** ch2-1-1, 2-1-3, 2-1-4, 2-2-2, 2-4-2, 2-4-3, 2-5-3
- **Ch3 (9):** ch3-1-2, 3-1-3, 3-2-1, 3-2-2, 3-2-3, 3-2-5, 3-3-1, 3-4-1, 3-5-4

(Một số GOOD vẫn dính lỗi nhỏ về đơn vị/nhãn — ghi trong báo cáo chương.)

---

## 6. Lộ trình sửa đề xuất (theo độ ưu tiên)

**Đợt P0 (3 route — dạy ngược/mâu thuẫn khái niệm):**
1. ch1-4-4: dẫn ΣF, ΣM, residual từ `checkEquilibrium()` trên hệ lực thật để hội tụ →0.
2. ch1-4-1: một hợp lực duy nhất qua `spatialForceComponents`/tổng véc tơ; sửa đơn vị hình chiếu.
3. ch2-5-2: nối helper `locateInstantCenter()` (đã verify) để tính IC từ hình học; bỏ chấm kéo tự do.

**Đợt P1 (8 route — physics sai/bảo toàn giả/control hỏng):**
ch1-1-5, ch1-4-2, ch1-3-3, ch1-5-1, ch3-3-2, ch3-6-2, ch3-5-3, ch2-4-4, ch2-3-2.

**Đợt P2 (đồng loạt — quét toàn bộ):**
- Sửa RC2: thêm hằng px→SI scale, hoặc bỏ nhãn "m"/"N" cho tọa độ pixel; sửa thứ nguyên (bỏ "°" cho tan α và mô men, "rad/s²" cho ω₀, "m" cho mô men ngàm).
- Sửa RC5: điền nội dung các panel rỗng hoặc bỏ hẳn; sửa render công thức vỡ; xử lý nhãn chồng.
- Các WEAK P2 còn lại theo bảng mục 4.

**Phòng ngừa tái diễn (test harness):**
- Unit test: assert mọi readout của behavior đến từ helper physics dùng chung (bắt inline re-implementation + giá trị bịa như `a_e`).
- Invariant test va chạm: assert |p_sau−p_trước|<tol từ CÙNG state dùng để render (bắt class lỗi ch3-6-2).
- PT chuyển động và hình học phải dẫn từ MỘT config chung (bắt ch3-3-2, ch3-4-2).
- Dùng `rk4Step` ở mọi nơi tích phân ODE (ch3-3-2 còn Euler).

---

## 7. Câu hỏi chưa giải (cần quyết định của tác giả)

1. **Đơn vị pixel-as-SI:** Chấp nhận về mặt sư phạm (diagram định tính) hay phải gắn scale px→SI thật? Quyết định này chi phối toàn bộ RC2 (≥8 route).
2. **Panel rỗng (ch3-5-3, ch3-3-2):** Lỗi render DOM-math trên môi trường capture hay đặt nhãn ngoài canvas? Cần kiểm tra live browser để phân định.
3. **ch2-5-2/5-3 đang `static:true` (Phase-07):** Tác giả có muốn IC được *xác định tương tác từ hình học* (cần fix P0) hay chỉ trưng bày khái niệm tĩnh?
4. **Va chạm xiên (ch3-6-3):** Thuộc route này hay tách route riêng? Objective ngụ ý thuộc ch3-6-3.
5. **ch1-6-2 kéo-G đặt trọng tâm:** Tính năng "explore" có chủ đích hay bug? Xác nhận UX mong muốn.
6. **Adapter `SimStatics`:** Còn được nạp ở trang nào khác (entry page khác) không? Nếu còn sống thì cần review riêng.
