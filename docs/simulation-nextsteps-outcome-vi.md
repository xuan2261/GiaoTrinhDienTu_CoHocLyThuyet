# Kết quả bước tiếp theo: kiểm chứng và bài học ω có dấu

Ngày 03/10/2026. Tiếp tục từ đợt U1 đã bàn giao, commit cục bộ `2b87d7ab57171129a490f069a844649830a48bb3`.

## Đã làm

1. **Kiểm hợp đồng chuyên môn kỹ thuật cho đủ 25 Sim2**
   - Thay mô tả đơn vị/giả thiết chung chung bằng công thức, đại lượng SI, miền điều khiển, giá trị mặc định và cách reset đúng từng mô hình
   - Kiểm bằng công thức đóng, cân bằng lực/mômen, hình học, sai phân và nghiệm giải tích độc lập
   - Nói rõ số đọc là kết quả tính toán mô hình; hai cách tính cùng công thức không phải phép đo thực nghiệm độc lập
   - Giữ trạng thái draft; đây không phải chứng nhận học thuật hoặc nghiệm thu của giảng viên

2. **Kiểm xuyên suốt production core và thao tác của 25 Sim2**
   - Nhập nháp/xác nhận, đồng bộ range–số, nút thao tác, click/cancel không dịch chuyển, controls không ẩn theo hình 2D, đọc trạng thái và cleanup
   - Đóng khoảng trống bốn reset tĩnh: hệ toa a=3/hệ toa; lực tương tác F=60/xét hệ; xung lượng F=6, Δt=2; công F=4
   - Có test thất bại trước khi thêm bốn nút reset và đạt sau sửa

3. **Hoàn thiện bộ thu bằng chứng cho các nút U1/U2**
   - Khám phá 45 action handlers và lập 61 trường hợp/133 thao tác ở mức nguồn, gồm A/B, FBD, một chu kỳ, sự kiện, reset và bài ω có dấu
   - Lưu requested/actual, state trước/ngay sau/sau dừng, hash nguồn/collector/run; tự tính lại các oracle số trong phạm vi đã khai báo
   - Dùng schema chung cho các ca not-run, ngăn chúng bị nhầm thành ca đã chụp ảnh hoặc đã đạt
   - Kế hoạch 420 ca browser mặc định vẫn ghi not-run, không có PNG hay render WebGL mới

4. **Chỉ mở một bài U2 nhỏ đã đề xuất: trường vận tốc vật rắn**
   - ω từ −2,5 tới +2,5 rad/s; thêm Đảo chiều và Đứng yên
   - vₓ=−ωrᵧ, vᵧ=ωrₓ, tốc độ |ω|r; đảo dấu đổi hướng nhưng giữ độ lớn
   - ω=0: mọi vận tốc bằng 0, IC không duy nhất; P chỉ còn là mốc chọn. P=M thì hướng của vectơ vận tốc 0 không xác định
   - Giữ mặc định, geometry, camera, thang/cap và controls IC. Quy ước trường này là XY/+Z; chiều kim đồng hồ được nói theo nhìn từ +Z, không theo góc camera

## Bằng chứng hiện tại

- Lệnh `npm run test:simulation-nextsteps`: **228/228 test đạt**, gồm 92 của bộ U1/collector mở rộng và 136 bổ sung (79 tích hợp production controls, 50 hợp đồng/chuyên môn kỹ thuật, 7 bài ω có dấu)
- Rà soát độc lập revision cuối: **275/275 test đạt**, không còn P1/P2 đã xác nhận trong phạm vi; hash 498 tệp runtime, 5 tệp collector và 11 tệp test không đổi trong lượt kiểm
- Các cổng metadata/source-drift/media liên quan: **26/26 đạt**
- Regression repair/physics/Three liên quan: **30/30 đạt**
- Bài ω có dấu kiểm 2.807 cặp ±ω, 63 điểm trường 2D, 606 trạng thái Three CPU và 20 lượt chuyển chế độ. Đây là độ phủ theo mẫu, không phải chứng minh toàn miền liên tục
- Bốn reset tĩnh trả về cả tham số và lựa chọn hiển thị mặc định, đồng bộ input và nhấn lặp lại được

Các bộ có giao nhau; không cộng các lượt chạy lại thành số phép thử độc lập. Báo cáo rà soát độc lập và receipt hash-bound đi kèm ghi phạm vi chính xác.

## Những gì vẫn chưa được nghiệm thu

Trong đợt này không khởi chạy lại browser đã bị chặn, không đổi flags, network hay sandbox và không dùng máy người dùng. **Browser/WebGL, pixels, native input/touch, screen reader, zoom/reflow, context loss và hiệu năng thực vẫn pending**. Các bộ đỡ DOM/renderer trong test CPU không thay thế chúng.

Ba blocker ở kiểm tra rộng của đợt U1 là hồ sơ acceptance, presentation và nhóm release/WMF cũ. Không giả làm mới bằng chứng hoặc sửa canonical DOCX/PDF chỉ để biến chúng thành pass. Đợt này chạy lại các cổng trực tiếp liên quan và giữ rõ ranh giới; không tuyên bố đã chạy/đạt toàn bộ release pipeline.

Nội dung chương, quiz/các ID và canonical DOCX/PDF được giữ nguyên. Cây repair riêng không bị sửa; các thay đổi bước này nằm trong cây nâng cấp. Không push, mở PR, merge hay deploy.

## Áp dụng đúng bản vá

Gói có hai phương án; chọn một, không áp cả hai:
- Đã có đúng U1 `2b87d7a`: dùng `buoc2-tu-U1.patch`
- Mới có đúng candidate repair theo preimage manifest: dùng `tong-hop-sau-repair.patch`

Không áp trực tiếp lên upstream chưa có repair. Đối chiếu preimage SHA-256 trong manifest tương ứng, giữ bản sao thay đổi riêng, chạy `git apply --check` trước `git apply`. Sau đó:

```sh
npm run test:simulation-nextsteps
npm run qa:simulation-upgrades:plan
```

Lệnh plan chỉ lập bằng chứng chưa chạy. Chỉ chạy collector thật khi có runtime dot được phép với browser/WebGL và bảo mật bình thường.

## Bước tiếp theo nên làm

**Giữ phạm vi tính năng ở đây và chuyển sang nghiệm thu Q0**, không tiếp tục thêm mô hình chỉ để tránh blocker môi trường:
1. Chạy bộ thu trên runtime dot hỗ trợ WebGL bình thường; ưu tiên ngàm, Coriolis, Newton II, va chạm và các biên âm/0 mới của trường vận tốc, sau đó phủ đủ ma trận
2. Rà ảnh, nhãn, thao tác native/AT, context lifecycle và số đo hiệu năng; sửa các lỗi có bằng chứng thực
3. Người chịu trách nhiệm môn học duyệt giả thiết/công thức/nhiệm vụ học; approval đó vẫn cần người thật
4. Giải quyết việc xuất bản repair đang chờ riêng trước khi ghép delta nâng cấp. Chưa có bằng chứng PR hoặc CI mới trong đợt này

CSV/replay có version/hash, camera góc chuẩn và các mô hình U2/U3 còn lại tiếp tục được giữ trong ma trận, chưa triển khai trong đợt giới hạn này.
