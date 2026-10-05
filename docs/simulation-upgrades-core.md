# Hợp đồng dùng chung của nâng cấp mô phỏng

## Thay đổi đã thực hiện

- Mỗi slider cũ có input số tương đương và đơn vị, label liên kết, cùng callback vật lý; số đang gõ giữ nguyên dạng nháp tới change (blur/Enter), range cập nhật ngay; input rỗng/không hữu hạn không sửa thí nghiệm; giá trị ngoài miền được đánh dấu và giới hạn khi xác nhận. Giá trị giải tích truyền bằng setValue không bị âm thầm làm tròn theo step. Số nhập cho phép thập phân; native range/number dùng step=any để biểu diễn chính xác state mà không tự snap hoặc phát stepMismatch. Bước vật lý khai báo được giữ trong data-physical-step: kéo range vào lưới bước, Arrow/Page tăng từ giá trị hiện tại đúng bước. Input số nhận thập phân liên tục. Bước handle được mô tả riêng theo route
- API addNumberControl và addAction luôn đặt ngoài root hình 2D, có listener cleanup khi dispose; các route chỉ-handle dùng được khi root 2D ẩn
- addControls hỗ trợ actions và setActionLabel. start/stop của shell đồng bộ cả trạng thái chạy và nhãn playback, bao gồm dừng tự động tại sự kiện, reset từ tham số và replay
- Hai API kéo giữ pointerId đang hoạt động; bỏ pointer khác, xử lý pointercancel/lostpointercapture đúng một lần, giải phóng capture, không giữ trạng thái đang kéo
- Handle một đại lượng có pointFromValue/valueFromPoint/step: Home/End và mũi tên làm việc trong miền vật lý, không ép giá trị theo tọa độ màn hình
- seekTime(t) chỉ nhận số hữu hạn không âm, đồng bộ thời gian vật lý và xóa accumulator/timestamp cũ. Route vẫn chịu trách nhiệm đặt state tương ứng; không coi seek clock là tích phân mô hình
- Bridge 2D→3D clone và đóng băng sâu snapshot JSON theo lần gửi. Renderer lazy mount/fallback nhận đúng trạng thái đã chốt, không giữ tham chiếu mutable sang state mô phỏng. Không tạo engine vật lý 3D riêng
- Panel readout tái sử dụng node theo key; chỉ sửa chữ đổi, gỡ key không còn, timer được cleanup. Không tuyên bố cải thiện FPS khi chưa benchmark
- Nút “Đọc trạng thái hiện tại” phát một snapshot bằng live-status theo yêu cầu. announce(text) chỉ được route gọi ở sự kiện có nghĩa; không đọc bảng 60 lần/giây. Friction chỉ báo khi đổi miền, collision khi đến sự kiện/impact/giữ kết quả
- Numeric input dùng theme tokens có sẵn --tx/--bg và focus ring, target tối thiểu 44px. Contrast/layout thực vẫn cần Q0

## Bằng chứng

TDD production-core dùng DOM tối thiểu, không giả là browser: controls, panel, shell, clock và mode-toggle chạy chính source mới. Các ca kiểm pointer khác/cancel/capture-loss, scalar HomeEnd, keyed node identity, request-only status, empty/range numeric, disposal, exact clock seek, deep snapshot retention, programmatic playback và CSS theme tokens. Log đỏ ban đầu và log đỏ phát hiện sau review được lưu riêng, cùng log xanh revision cuối.

Các route test dùng production adapters/kernels/clock với render/DOM ghi hình học. Three r160 CPU test chạy geometry thật nhưng renderer/DOM stand-in. Không có ảnh hoặc video của candidate từ WebGL thật.

## Còn lại và lý do

- Full typed schema SI/modelVersion/time/phase cho tất cả route, preset/CSV/replay chưa mở: cần hợp đồng format độc lập và dữ liệu state đầy đủ, không xuất pixels/capped vectors làm vật lý
- Context loss thực, 20-cycle actual lifecycle, screenshot full bounds + DOM labels, touch/AT, zoom 200/400%, two-engine/mobile còn pending vì runtime browser hiện tại bị chặn trước render
- Không công nhận mục tiêu margin/FPS/drawcalls là số đo; bộ producer Q0 tách targets khỏi measurements, source/run/state hash và giữ formalAcceptance=pending
- Chưa benchmark 60s warm-up trên thiết bị mục tiêu, nên không đổi renderer, instancing, WebGPU, GLTF, postprocessing hoặc orbit tự do
