# Kết quả nâng cấp mô phỏng Cơ học lý thuyết — 03/10/2026

## Kết luận

Đã triển khai một đợt U1 có giới hạn rõ trên **25 Sim2 và 10 adapter Sim3**, giữ kiến trúc hiện hữu và các sửa kiểm toán trước. Đây là bản vá mã nguồn đã kiểm CPU và rà soát độc lập; **chưa phải nghiệm thu browser/WebGL, accessibility hay học thuật**. Toàn bộ roadmap chưa hoàn tất: Q0 còn bị môi trường chặn, các U2/U3 chưa làm có lý do và điều kiện tiếp tục trong ma trận từng chương.

Không push, mở PR, merge hoặc deploy trong đợt này. PR sửa kiểm toán đang chờ riêng, không bị trộn thay đổi. Làm việc trên bản sao độc lập trong máy dot; không dùng máy người dùng hay dịch vụ mô hình ngoài.

## Các thay đổi người học sử dụng được trong mã mới

- Điều khiển số và nút thao tác vẫn hiện trong 3D; state truyền qua bridge được chụp và đóng băng sâu. Có đọc trạng thái theo yêu cầu, báo sự kiện có ý nghĩa, kéo có pointer cancel/capture-loss và nhãn play/pause đúng trạng thái
- Chương 1: sửa Home/End ngẫu lực, dấu M và chiều CW; hiển thị cả R và M₀; góc vectơ 0 không xác định; phân biệt phản lực cần để cân bằng với tiếp xúc thực khi trượt; nút tới đúng ngưỡng ma sát; đơn vị, giả thiết và residual cân bằng/trọng tâm
- Chương 2: tới đỉnh/chạm đất chính xác và giữ kết quả ném xiên; pha elip/IC dùng được trong 3D; gia tốc tiếp/pháp tuyến; tổng thành phần Coriolis; giải thích scale/cap; marker đai có oracle no-slip; từng bước dựng tâm vận tốc
- Chương 3: Newton A/B trên cùng thang cố định; dao động chồng nghiệm giải tích, thời gian/chu kỳ/năng lượng/sai số; đồ thị lực–thời gian/xung lượng và lực–quãng đường/công; số liệu năng lượng độc lập; FBD; công khi co bán kính; trước/đúng/sau va chạm, tùy chọn dừng tiếp xúc và giữ kết quả cuối làn
- Metadata nháp được cập nhật hash và công thức đúng mô hình đang chạy; không biến bằng chứng cũ thành chứng nhận mới

## Kết quả kiểm tra cuối

| Lớp bằng chứng | Kết quả | Phạm vi thật |
|---|---:|---|
| Bộ test nâng cấp | **79/79 đạt** | Core, 25 route, 10 adapter, metadata và collector/source-binding; CPU/DOM bộ đỡ |
| Rà soát độc lập | **110/110 đạt** | 64 tệp giữ hash trước/sau lượt kiểm; các phát hiện đã sửa; không còn P1/P2 đã xác nhận trong phạm vi đọc |
| Regression rộng | **66/69 lệnh đạt** | Ba lệnh còn thất bại đã tồn tại ở candidate sửa trước, nêu bên dưới |
| Bridge toàn bộ Sim3 | **10 adapter × 20 lượt chuyển** | Adapter thật + Three r160 CPU, state bất biến/readout không đổi; không phải thao tác browser thực |
| Bảo toàn dữ liệu | **130 tệp được bảo vệ không đổi; 300/300 ID quiz duy nhất** | Nội dung chương, quiz, canonical DOCX/PDF và các guard sửa nội dung; kiểm SHA-256 |
| Giữ bản sửa riêng | **3.137/3.137 tệp gốc không đổi** | Candidate sửa kiểm toán không bị sửa khi làm nâng cấp |
| Kế hoạch Q0 | **420 ca mặc định đã lập, 0 ca đã render** | 35 × 12 tổ hợp viewport/DPR/theme; source/run/collector hash; trạng thái not-run |

Các số test là những bộ có giao nhau, không cộng thành tổng bằng chứng độc lập hoặc tỷ lệ đúng của sản phẩm. Có log thất bại trước sửa và log đạt sau sửa. Không suy hiệu quả học tập từ số test.

Ba lệnh chưa đạt:
1. acceptance-report-contract: bằng chứng acceptance/traceability cũ chưa khớp current source
2. presentation-deck-contract: hồ sơ trình bày/nghiệm thu cũ chưa khớp candidate hiện tại
3. Python unittest discover: nhóm release/acceptance/scientific-report còn hash staging/evidence cũ; chuyển WMF còn lỗi delegate trong môi trường. Không sửa canonical DOCX/PDF để làm xanh các cổng này

Chưa có CI PR mới được chạy; việc repository chưa có workflow PR CI không phải một kết quả pass.

## Q0 và giới hạn

Browser cloud chặn preview cục bộ với ERR_BLOCKED_BY_CLIENT; Chromium không tạo được tiến trình render do socket EPERM. Không có screenshot hoặc phép đo GPU của candidate. Các cờ launch không phù hợp đã xuất hiện trong thử thất bại; không có render/thay đổi thiết lập thành công, và không tiếp tục thử đường vòng hay hạ bảo mật.

Đã viết bộ thu bằng chứng chạy production loader, ràng buộc byte nguồn, run, state và ảnh; phân biệt giá trị đích với quan sát thực. Nó báo unsupported/not-run khi thiếu WebGL, không tự cấp acceptance. Cần chạy ở runtime dot được phép có WebGL bình thường, rồi kiểm pixels, labels, tương tác, focus, native numeric/range, touch/AT, context loss/dispose và profile hiệu năng.

## Ma trận đầy đủ

- `docs/simulation-upgrades-ch1.md`: 10 Sim2 + 2 Sim3; từng U1/U2 đã làm, phép kiểm, phần còn lại
- `docs/simulation-upgrades-ch2.md`: 7 Sim2 + 5 Sim3; cùng cấu trúc
- `docs/simulation-upgrades-ch3.md`: 8 Sim2 + 3 Sim3; cùng cấu trúc
- `docs/simulation-upgrades-core.md`: hợp đồng trạng thái/điều khiển/đọc số và giới hạn
- `docs/simulation-upgrade-qualification.md`: bộ thu Q0, cách chạy, 420 ca dự kiến và các lớp chưa được kiểm
- `docs/simulation-upgrade-independent-review.md`: phát hiện, sửa và receipt rà soát cuối

## Bước tiếp theo đề xuất

1. Giải quyết việc xuất bản PR sửa kiểm toán đang chờ riêng; đối chiếu preimage hash trước khi áp bản vá nâng cấp sau đó
2. Chạy Q0 trên runtime dot hỗ trợ WebGL và trình duyệt ở cấu hình bảo mật bình thường. Ưu tiên ngàm, Coriolis, Newton II và va chạm, rồi phủ đủ 35 mô phỏng/hai engine/mobile theo ma trận. Không mở rộng tính năng trong lúc bằng chứng này còn thiếu
3. Cho người chịu trách nhiệm môn học duyệt giả thiết, dấu, đơn vị và nhiệm vụ học; thử người học dự đoán → đo → giải thích → phản ví dụ
4. Sau U1/Q0, triển khai từng U2 có oracle: miền lực/tốc độ có dấu và zero; preset/CSV/replay có version/hash; camera góc chuẩn; lực biến thiên. U3 chỉ thực hiện khi có đo hiệu năng hoặc nhu cầu học chứng minh lợi ích

## Lệnh tái chạy

```sh
npm run test:simulation-upgrades
node --test tests/sim2-audit-repairs.test.js tests/sim2-audit-domain-sweep.test.js tests/sim3-audit-regression.test.js
npm run qa:simulation-upgrades:plan
# Chỉ ở runtime được phép, khi browser/WebGL thực sự dùng được:
npm run qa:simulation-upgrades
```

Bản vá chỉ chứa delta nâng cấp so với snapshot repair `dc79ba69ac0d3653f3329960e202a9f176dfad24`, không phải delta trực tiếp từ upstream `36e92895a69a82f9744c544cd166fc06e7e45c3c`. Phải có các byte repair tương ứng trước khi áp. Commit baseline trên là mốc cục bộ của bản sao, không phải commit đã xuất bản.
