# Chương 1: nâng cấp U1 có kiểm chứng nguồn

Ngày: 2026-10-03 (UTC). Phạm vi: 10 adapter Sim2 chương 1 và hai adapter Sim3 đi kèm. Không sửa kernel vật lý, dữ liệu bài học, câu hỏi/đáp án, hoặc trạng thái nghiệm thu của 65 sửa lỗi cũ. Không commit/push/deploy trong công việc này.

Đối chiếu: mục 4, 5A, 6.2.1 và 6.2.2 của `simulation-upgrade-review.md` ngày 03/10/2026. Tài liệu này ghi từng mục U1/U2 đã làm hoặc còn lại; không gọi tồn đọng là đã hoàn thành chỉ vì có test CPU.

## Hợp đồng mô hình và điều khiển

- Các mô hình chương 1 vẫn là sơ đồ tĩnh, render theo thay đổi; không thêm vòng RAF hay tích phân chuyển động
- Hệ trục 2D x sang phải, y lên trên; mômen dương là CCW. Adapter 3D giữ ánh xạ tọa độ đã sửa, không tạo engine vật lý thứ hai
- Các slider dùng input số tương đương từ core. Route chỉ thêm `addNumberControl` cho tham số chưa có slider và `addAction` cho reset/ngưỡng. Điều khiển nằm ngoài root hình 2D để không bị ẩn khi chuyển sang 3D
- F/α ở ch1-1-3 lượng tử 1 N/1°; d ở ch1-1-4 là 0,1 m; ngẫu lực d là 0,5 m; a dầm hai gối là 0,1 m; a ngàm 0,5 m; α dây 1°; tọa độ lỗ 0,1 m; các thành phần lực có bước 0,1 N. Drag và số đọc cùng đọc trạng thái đã lượng tử hóa
- Nón ma sát dùng `step=any` cho β/μₛ để giữ giá trị chính xác tại β=atan μₛ. Góc trong readout làm tròn để đọc; trạng thái và input giữ số đầy đủ. Không suy trạng thái từ chuỗi đã làm tròn
- Thu gọn hệ lực vẫn giữ giới hạn đầu lực và R trong ±3,5 đơn vị hình. Input thành phần cũng dùng cùng hàm giới hạn; bảng ghi rõ đây là giới hạn khung. Hình bình hành giữ góc phần tư I và tổng mỗi thành phần ≤137,5 N. Đây không phải miền vật lý tổng quát
- Nút reset trả về đúng mặc định hiện hữu, giữ mode 2D/3D đang dùng và không tạo clock

## Ma trận từng route

### ch1-1-3 · Vectơ lực

**Đã làm U1:** sửa tên ARIA từ P sang F; nói rõ điểm đặt O cố định; valuetext đọc F (N), α (độ); cùng lượng tử hóa giữa kéo, slider, số đọc; nhập số qua core và reset; công khai thang 0,04 đơn vị hình/N.

**Kiểm:** test `U1 vector` xác nhận label/giả thiết; drag không nguyên rồi kiểm độ dài và góc của chính đầu vector khớp số đọc. Các test kernel hiện hữu kiểm Fx²+Fy²=F².

**U2 còn lại:** cung α, nhãn Fx/Fy trực tiếp trên hình, mở bốn góc phần tư, trượt lực trên giá. Đường chiếu hiện hữu được giữ; không gọi là mới. Những mở rộng này cần thêm miền trạng thái và ca dấu/zero độc lập, không thuộc U1.

**Q0 còn lại:** nhãn tại F max, pointer/touch thực, focus/AT và contrast/zoom. Render vẫn demand-driven; chưa có benchmark mới về batch/readout.

### ch1-1-4 · Mômen lực

**Đã làm U1:** d được định nghĩa là khoảng cách vuông góc tới giá lực hướng lên; CCW dương; đọc M có dấu và chiều bằng chữ; nhập d, reset 50 N/4 m; ARIA d bằng m và bounds riêng. Cung chỉ chiều, bán kính không có thang vật lý và không biểu thị biến dạng/góc quay.

**Kiểm:** `U1 moment` kiểm M=F·d từ input độc lập, dấu/chiều, reset. Cấu hình lực hướng lên và d>0 được giữ.

**U2 còn lại:** góc θ/điểm đặt 2D, r/chân vuông góc, lực qua O, đảo chiều và ca zero. Chưa thêm input θ vì chưa mở mô hình đó.

### ch1-1-5 · Thu gọn hệ lực

**Đã làm U1:** cung M₀ có dấu tại O; legend nhấn mạnh R và M₀; bốn input F₁x/F₁y/F₂x/F₂y (N) luôn dùng được trong 3D; hai điểm đặt cố định hiển thị theo m; valuetext phân biệt lực, thành phần và vị trí. R=0 hoặc M₀=0 không có mũi tên/cung giả. Reset mặc định R=(20,60) N, M₀=−20 N·m.

**Bổ sung U2 nhỏ đã làm:** phân loại cân bằng và ngẫu lực thuần để diễn giải zero vốn đã vào được trong miền hiện tại. Không thêm miền hoặc engine. Có bảng hai lực và tọa độ cố định; x/y điểm đặt là readout, chưa là input.

**Kiểm:** `U1 reduction` dùng input số tạo ngẫu lực R=0, M₀=−160; kiểm tổng r×F độc lập trên state gửi 3D, zero hides, reset. Giữ ràng buộc viewport cũ.

**U2 còn lại:** các nút preset cùng/ngược chiều/cân bằng, di chuyển tâm thu gọn, đổi điểm đặt, đường tác dụng của hợp lực và quy tắc M′=M−a×R. Cần oracle và thiết kế khung/điều khiển riêng; không âm thầm mở bằng input.

### ch1-1-6 · Ngẫu lực

**Đã làm U1:** M=−Fd theo cặp trái lên/phải xuống, CCW dương; cung CW; ΣF ghi N. Bounds handle x=[0,5;3] và y=0; Home→d=1, End→d=6; không lấy trị tuyệt đối x làm cả hai phím về cùng đầu. Label là khoảng cách d toàn phần, valuetext d bằng m. Input d và reset, bước Arrow d=0,5 m, Shift×5.

**Kiểm:** `U1 couple` lấy options/callback của route, chạy keydown trong **production sim-shell** với DOM tối thiểu, kiểm Home/End/Arrow/Shift, ARIA, M=−50d, SVG sweep CW. Đây là kiểm tích hợp nguồn, chưa phải event trình duyệt/AT thật.

**U2 còn lại:** tịnh tiến cả cặp, đổi tâm O, đảo chiều cặp và thay F. Không thêm animation quay khi chưa có mômen quán tính.

### ch1-1-8 · Dầm hai gối

**Đã làm U1:** công khai ký hiệu giản lược cho khớp A và gối lăn B; Ax=0; giả thiết dầm nhẹ/tải đứng; ΣFy và ΣMA tính từ các phản lực; nhập a/reset; bảng kích thước a, L−a, L bằng m; ARIA a từ A.

**Kiểm:** `U1 beam` quét 9 tổ hợp P/a, oracle Ra+Rb=P và residual lực/mômen. Biên a=[0,3;9,7] m vẫn giữ như trước.

**U2 còn lại:** toggle vật thể/FBD, từng bước thay liên kết bằng phản lực, nhiều tải, mở a=0/L. Ký hiệu roller riêng chưa vẽ lại; phương án U1 được chọn là chú thích rõ ký hiệu giản lược. Kích thước được ghi trong bảng để tránh thêm label chồng lên tải trước khi có QA hình thật.

### ch1-2-3 · Hình bình hành lực

**Đã làm U1:** góc với vectơ 0 ghi “không xác định”; zero có tên trong readout, không hiện đầu mũi tên giả; input thành phần của từng lực giải quyết trường hợp handle trùng nhau bằng bàn phím; valuetext theo N; reset. Không đổi clamp góc phần tư I.

**Bổ sung U2 nhỏ đã làm:** Rx/Ry và góc R từ +x, với R=0 cũng không xác định góc. Đây là readout từ trạng thái hiện hữu, không mở thêm trường hợp vật lý.

**Kiểm:** `U1 parallelogram` tạo F₁=0 rồi cả hai bằng 0, kiểm góc, zero visibility, R thành phần và không NaN.

**U2 còn lại:** lực âm/đối nhau, đầu–đuôi, các preset; input độ lớn/góc. U1 dùng component input có cùng ý nghĩa lực và ràng buộc khung, tránh hai hệ điều khiển cực/cartesian tranh trạng thái trong lần nâng cấp này. Browser vẫn phải kiểm nhãn/handle chồng.

### ch1-3-2 · Hai dây đối xứng

**Đã làm U1:** đường đứng và cung α; dây nhẹ, không dãn, chiều dài cố định 3 m; vật đứng yên; cảnh báo T tăng nhanh gần 90° trong giới hạn đang cho. Input α từ core và reset. Có độ dài dây đo từ hình học và residual ΣFx/ΣFy. Giữ nguyên inverse asin và lượng tử 1° của sửa R2D-04.

**Kiểm:** `U1 ropes` quét 71 góc từ 5–75°, residual lực, chiều dài 3 m và callback start/end không làm thay đổi trạng thái. Test repair hiện hữu vẫn kiểm round-trip. Chưa gọi đây là click/down/up thật.

**U2 còn lại:** mũi tên lực căng và các thành phần, thay W, dây bất đối xứng. Nhãn T₁/T₂ hiện hữu được mô tả rõ không phải vector có thang. Keyboard x-step 0,05 được giữ để bảo toàn sửa trước; input α có bước đúng 1°. Chuyển handle sang bước góc chính xác là tùy chọn cần thử riêng.

**Q0 bắt buộc còn lại:** click/down/up thật tại 5/30/49/60/75°, Home/End và AT cảm ứng.

### ch1-3-6 · Dầm ngàm

**Đã làm U1:** giữ dấu và cung R2D-02; bảng M_tải có dấu, M_ngàm+M_tải và ΣFy; giả thiết dầm nhẹ/tải đứng. Input P/a qua core, reset; a theo m, bounds riêng; lượng tử kéo a khớp step 0,5 m. Nêu cung không phải góc quay/biến dạng, bán kính chỉ minh họa.

**Kiểm:** `U1 cantilever` quét P=20/80/150 và a=0,5/5/8, kiểm r×F độc lập và chiều CCW. Test repair R2D-02 tiếp tục kiểm sweep/marker.

**U2 còn lại:** FBD, bật từng phản lực, tải xiên/đa tải, Ax/Ay/M, đồ thị V/M. Cần đầy đủ ΣFx/ΣFy/ΣM, không mở trong lần U1.

### ch1-5-3 · Nón ma sát

**Đã làm U1:** vector đứng được gọi R cần để cân bằng; ngoài nón ghi “không tồn tại cân bằng tĩnh” và cảnh báo nó không phải phản lực thực khi trượt. Thêm P, N, Fₜ cần; N/P=cosβ, Fₜ cần/P=sinβ, |Fₜ cần|/N=tanβ và margin (μₛN−|Fₜ cần|)/P. Ba miền khả thi/giới hạn/không thể; nút chính xác β=atanμₛ; reset. Bounds hình mở xuống để P không bị cắt tại β thấp.

**Giả thiết/đơn vị:** không thêm khối lượng giả. P=mg>0 tùy ý; vectors và readout chuẩn hóa theo P. Các tỉ số không thứ nguyên. Thang 2D = 2,2 đơn vị hình cho một P. Tolerance phân loại là 10⁻⁹ trên margin chuẩn hóa, không trên readout góc làm tròn. Input step=any giữ ngưỡng chính xác; không suy chuyển động đều tại β=φ.

**Kiểm:** `U1 friction` quét 12 β/μ, kiểm cos/sin/tan độc lập; trường hợp ngoài nón và action ngưỡng chính xác. Không suy vận tốc/gia tốc từ sơ đồ.

**U2 còn lại:** động lực học trượt thực với μₛ/μₖ, m/g, tích phân; không có cơ sở để thêm chuyển động bằng mũi tên hiện tại. Đã bổ sung thông báo một lần khi chuyển miền cân bằng sau mount; thay tham số trong cùng miền không đọc lại. Core status không phát ở mỗi frame.

### ch1-6-3 · Trọng tâm tấm khoét lỗ

**Đã làm U1:** m, m² và m³ đúng loại đại lượng; tấm đồng chất, chiều dày đều, trọng trường đều; công thức xC/yC; đóng góp +A và −A, mômen diện tích theo cả x/y, diện tích còn; trục O/x/y và kích thước 6×4 m; input x_lỗ/y_lỗ và reset; valuetext m; lỗ r=1 m luôn trong tấm. Giữ quy tắc C dịch xa phần khoét.

**Kiểm:** `U1 centroid` thử bốn góc miền lỗ và vị trí trung tâm (3,2), dùng công thức độc lập (72−πx)/(24−π) và (48−πy)/(24−π), kiểm đơn vị/công thức/contributions.

**U2 còn lại:** r thay đổi, nhiều mảnh/lỗ, mật độ khác nhau, diện tích/mass không dương. Chưa expose input r vì cố định 1 m; miền hiện tại luôn có diện tích dương, nên không chạm fallback netArea=0 của kernel. Mở rộng sau phải có trạng thái không xác định thay vì coi fallback là trọng tâm hợp lệ.

## Hai adapter Sim3

### ch1-1-5-3d

**Đã làm U1:** labels F₁/F₂ riêng, R/M₀, axes định hướng x/y và CCW+; cùng thang F/R = 0,03 scene/N thay cho thang R khác. Position scale 0,78 scene/m, M scale 0,026 scene/(N·m) được công khai trong diagnostic; readout Sim2 vẫn luôn hiển thị. Moment vector biểu thị dấu; ring ẩn khi M₀=0. Geometry/camera-fit/dispose sửa trước được giữ.

**Kiểm:** `U1 reduction 3D` dùng Three r160 thật với renderer/DOM stand-in: equal scales, zero moment visibility, labels. Regression cũ kiểm full force/moment frustum, arrow base-to-tip và disposal.

**U2 còn lại:** preset, ring có arrowhead chiều quay (vector M₀ có dấu đã có), thao tác tâm O và camera chuẩn. Chưa khẳng định chữ không chồng hay lực nhỏ đọc được khi M lớn: cần pixels/WebGL thật ở 320/768/1280 và 20 lần toggle.

### ch1-5-3-3d

**Đã làm U1:** P/N/Fₜ cần/R cần theo cùng thang lực chuẩn hóa 0,8 scene/P, label rõ; marker xuống dốc ghi xu hướng, không phải vận tốc; phân loại ba miền tính độc lập từ β/μ và cùng tolerance 10⁻⁹. Nón và contact geometry sửa S3-02/S3-06 giữ nguyên. β=atanμ action ở Sim2 truyền cùng state vào 3D; thay cho preset μ=tan30° riêng, bất kỳ μ hợp lệ đều tới đúng ngưỡng.

**Hiệu năng nhỏ đã làm:** `setCone` chỉ thay geometry khi μ thay đổi; β-only/same-state tái sử dụng geometry, vẫn cập nhật contact/quaternion. Chưa có số đo FPS/GPU, không gọi đó là đóng rò bộ nhớ.

**Kiểm:** `U1 friction 3D` kiểm trạng thái limit/impossible và normalized required components. Regression cũ kiểm apex, mọi section cone, block contact và disposal. Readout ký hiệu “cần” là điều kiện cân bằng, không phải mô hình tiếp xúc trượt.

**U2 còn lại:** mặt cắt 2D xuyên nón, x-ray/toggle block, bài dự đoán μ_min, mô hình trượt. Alpha-sorting và khả năng nhìn apex cần Q0 thực.

## Bằng chứng và giới hạn

Lệnh source/unit chính:

```sh
node --test --test-reporter=tap tests/sim-upgrades-ch1.test.js
node --test tests/sim2-audit-repairs.test.js tests/sim2-audit-domain-sweep.test.js
node tests/sim2-ch1-physics.test.js
node --test tests/sim3-audit-regression.test.js tests/sim3-coordinate-system.test.js
```

- RED trước thay đổi nguồn: 13/13 nhóm test mới thất bại, không skip (`ch1-u1-red.tap` trong evidence của workspace nâng cấp)
- GREEN cuối sau khi core tích hợp: 15/15 nhóm U1 đạt (`ch1-u1-green.tap`), 12/12 nhóm repair/domain Sim2 đạt (`ch1-sim2-regression.tap`), kernel Ch1 10/10 đạt (`ch1-physics.log`), 14/14 nhóm regression/coordinate Sim3 đạt (`ch1-sim3-regression.tap`), không skip
- Test bổ sung numeric/drag phát hiện numeric mới có thể giữ số lẻ ngoài bước rồi click dây bị làm tròn lại: receipt RED riêng `ch1-numeric-roundtrip-red.tap` có 13 pass/1 fail trước sửa; callbacks nay lượng tử một lần và đồng bộ input. Test 15 kiểm trực tiếp vector transform Three N+Fₜ=R, R+P=0 và reuse geometry khi chỉ đổi β
- Các receipt cuối chạy trên nguồn hiện tại sau khi core control/harness tích hợp; `git diff --check` sạch. Three r160 thật với renderer/labels/DOM stand-in, không phải WebGL
- Q0 vẫn riêng: browser/WebGL actual candidate, input thật, screenshot, 320 CSS px, zoom 200/400%, hai theme, contrast, screen reader và touch-AT; bằng chứng CPU không thay thế các mục đó
- Các nâng cấp common ở mục 4 (pointercancel/lost capture, readout node reuse, status/read-state, common numeric sanitation, fallback lifecycle) do core xử lý và có test riêng. Tài liệu này không nhận sở hữu hoặc tự xác nhận chúng
- U3 material/GLTF/postprocessing/WebGPU/instancing/free orbit/động lực học mới không làm: chưa có đo đạc hoặc nhu cầu bài học chứng minh lợi ích
