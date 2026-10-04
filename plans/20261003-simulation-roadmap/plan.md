# Nâng cấp mô phỏng — kế hoạch thực hiện 03/10/2026

## Phạm vi đã chốt
- Chỉ bản sao riêng trong máy dot; không dùng máy người dùng, dịch vụ mô hình ngoài, không push/merge/deploy
- Nền bất biến dc79ba6 là snapshot 3.137 tệp của candidate sửa kiểm toán, gồm guard DOCX và diagnostic contact va chạm mới nhất; base upstream 36e9289
- Đọc và theo ma trận 25 Sim2 + 10 Sim3 trong báo cáo simulation-upgrade-review.md (SHA256 ghi trong evidence)
- Giữ nội dung/300 ID quiz/canonical DOCX/PDF và 65 sửa kỹ thuật cũ. Không đổi pending học thuật/WebGL/a11y thành accepted

## Các pha và điều kiện đạt
1. Q0: kiểm runtime dot/browser mới; tạo bộ thu bằng chứng production-route gắn hash nguồn/run/state; unsupported giữ not-run, không giả GPU pass
2. U1 nền dùng chung: pointerId/cancel/capture-loss, input số hợp lệ và thao tác ngoài viewport, scalar keyboard/HomeEnd đúng đại lượng, snapshot 2D/3D bất biến, node readout tái sử dụng và đọc trạng thái theo yêu cầu
3. U1 route: Ch1 10 route ngữ nghĩa/dấu/đơn vị/điều khiển; Ch2 7 route trạng thái/sự kiện/readout; Ch3 8 route đồ thị/A-B/oracle/sự kiện. Worker sở hữu tệp theo chương, không sửa core chéo
4. Verification: từng thay đổi có test đỏ trước/xanh sau; chạy regression cũ có căn cứ, kiểm bảo toàn hash, review độc lập revision cuối
5. Giao: patch chỉ upgrade so với snapshot repair; matrix từng route implemented/tested/deferred và lý do; report tiếng Việt; không gọi code-only là nghiệm thu sản phẩm

## Giới hạn có chủ ý
U2 chỉ thực hiện khi là mở rộng nhỏ có oracle chắc chắn và phục vụ U1 (gia tốc thành phần, lực/động năng đọc độc lập, sự kiện). Signed domains mới, lực biến thiên, CSV/replay/camera presets mở rộng ghi deferred với phụ thuộc cụ thể. U3 đòi baseline profile hoặc bài học chứng minh lợi ích, không tự nâng Three.js r160/WebGPU hay đại tu kiến trúc.

## Thực thi
- Core/control/state: integration lead
- Ch1 + Sim3 Ch1: statics worker
- Ch2 + Sim3 Ch2: kinematics worker
- Ch3 + Sim3 Ch3: dynamics worker
- Q0 collector/schema: qualification worker
- UI thật/WebGL/assistive technology chỉ được đánh dấu đã chạy khi có artifact tương ứng

## Trạng thái cuối đợt
- Pha 1: producer/plan hash-bound hoàn thành; browser/WebGL thực blocked, giữ not-run
- Pha 2–3: U1 source toàn bộ 25 Sim2+10Sim3 đã thực hiện trong giới hạn ma trận; U2/U3 còn lại có lý do tại docs từng chương
- Pha 4: 79/79 nâng cấp; 110/110 rà soát; 66/69 lệnh rộng với3blocker cũ không che giấu; dữ liệu bảo vệ không đổi
- Pha 5: gói delta/receipt/report chuẩn bị giao; không có push/PR/merge/deploy
