# Kiểm core và thao tác Sim2 ở mức nguồn

Đợt tiếp tục ngày 03/10/2026. Bộ test mới `tests/sim-production-controls.test.js` nạp toàn bộ production registry, kernels, transform, SVG render, overlay, canvas underlay, clock, controls, panel, shell và route. Mô hình DOM/event tối thiểu nằm tại `tests/helpers/production-sim2-dom.cjs`.

## Phạm vi 25 route
- Nhập số rỗng giữ nguyên vật lý; xác nhận rỗng trở về giá trị trước
- Enter xác nhận tham số hữu hạn trong miền; range và input số biểu diễn cùng tham số sau callback của route
- Nút U1 thật của mã nguồn được gọi, gồm các thao tác capture, sự kiện, reset và thay hiển thị; không tạo NaN/Infinity trong số đọc
- Chọn/cancel handle khi không dịch chuyển không thay số đọc, kể cả sau nhập số thập phân
- Điều khiển số không nằm trong root hình bị ẩn khi đổi 3D; số đọc không đổi khi chuyển chế độ
- Nút đọc trạng thái có dữ liệu; dispose gỡ node, RAF, timers và callback của controls mồ côi

## Ranh giới bằng chứng

Đây là kiểm hợp đồng tích hợp nguồn, không phải browser test. DOM tối thiểu không mô phỏng native sanitization, CSS layout, focus/AT thực, pixels, SVG marker extent hoặc WebGL. Adapter 3D trong bộ này là bộ nhận state; các suite Three CPU riêng vẫn kiểm geometry. Các nút có thể gọi thành công không tự chứng minh chúng đạt mục tiêu học tập; oracle route và bộ thu Q0 kiểm riêng.

Trong đợt này không khởi chạy lại browser, không dùng cờ giảm bảo mật và không chuyển sang môi trường người dùng. Q0 vẫn chờ runtime được phép.

```sh
node --test tests/sim-production-controls.test.js
```

## Khoảng trống U1 đã đóng trong đợt 2

Bốn sơ đồ tĩnh Ch3 chưa có reset riêng dù mô tả dùng chung nói có. Đã thêm nút Đặt lại thí nghiệm, kiểm thất bại trước sửa rồi đạt sau sửa:
- ch3-1-3: a = 3 m/s², trở về hệ toa
- ch3-2-3: F = 60 N, trở về xét hệ A+B
- ch3-5-2: F = 6 N, Δt = 2 s
- ch3-5-4: F = 4 N

Mỗi reset đồng bộ input số/range và trạng thái hình, có thể nhấn lặp lại; không đổi mô hình hoặc tự chuyển chế độ 2D/3D. Bộ kiểm nguồn hiện có 79 test, gồm 75 kiểm xuyên suốt 25 route và 4 hồi quy reset. Các con số này không phải chứng nhận browser.
