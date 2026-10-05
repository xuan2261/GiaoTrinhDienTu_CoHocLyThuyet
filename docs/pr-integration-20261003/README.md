# Bằng chứng tích hợp bản sửa Cơ học lý thuyết

## Phạm vi

Commit `887b3181db99aa5d1c5ad6e10ab2f633f740897d` đặt nguyên cây nguồn đã review `3adb06550659d621eda4d28c688e75795bee2007` lên commit upstream `36e92895a69a82f9744c544cd166fc06e7e45c3c`. Cây nguồn gồm toàn bộ bản sửa, runtime `70ba017b3d9156d19c1676e6a3babe478aa5b7e0` và đúng năm tệp bổ sung kiểm thử. Đây không phải chỉ gói 413 tệp runtime phát hành.

Cây tích hợp có 3.170 tệp được Git theo dõi; so với upstream có 107 tệp thêm, 114 tệp sửa, không xóa tệp. Tree SHA `4c56de0bbd05b2001d7530f16071a9aefaa4a926` khớp chính xác nguồn đã review. Commit tài liệu sau đó chỉ bổ sung thư mục bằng chứng này.

`integration-manifest.json` khóa 221 tệp thay đổi. `source-manifest.json` khóa 498 tệp sản phẩm với hash `887e06b655981f2a4d3285f68a548b011440352d6e8c4167fb4455d889cdca9d`. Collector có hash `36a93e2bb90517cca487da21af6bd07cc0e06fa8d0ad6a066fd5c12b0652191a`.

## Kiểm tra mới ngày 2026-10-03 UTC

- `node --test --test-concurrency=1 --test-reporter=tap tests/sim*.test.js`: 41 tệp, **360/360 TAP đạt**, không thất bại/bỏ qua. Hai test mới production-three-chains và preparation-oracles được bao gồm trực tiếp bằng glob; không suy ra rằng các script npm cũ đã gọi chúng.
- `python tools/run_audit_regressions.py`: **14/14 lệnh đạt**, gồm kiểm nội dung, quiz, ký hiệu, bảo mật ghi chú, toán hiển thị và nguồn metadata.
- Replay control CPU: **25 route, 61 ca, 133/133 tiêu chí đạt**, 1.153 phép kiểm có giới hạn; không cộng các mẫu số này vào 360 TAP. Các receipt theo route và source bundle kèm hash được lưu cùng tài liệu.
- Preflight byte nguồn: `source-verified`; browser không được khởi chạy.
- Đối chiếu năm tệp test với patch-manifest gốc: hash đều khớp. Kiểm tra whitespace sạch. Rà mẫu bí mật trên các dòng thêm mới không phát hiện khớp; đây là rà heuristic, không phải bảo đảm an ninh tuyệt đối. Không có cache/log/archive đầu ra mới trong phần mã tích hợp. 40 binary thêm là font KaTeX.

Các bản ghi mới nằm cạnh README này. Replay được chạy trên commit tích hợp sạch; transcript TAP được chạy trên cùng tree trước commit. Những bản sao nguồn trước đó không bị chỉnh sửa.

## Giới hạn

CPU dùng DOM/canvas/backend renderer kiểm thử. Browser DOM/input/layout thật, WebGL/GPU/pixel, AT, hiệu năng và nghiệm thu học thuật vẫn **chưa được xác nhận**. Chưa có bằng chứng merge hoặc deploy. Việc tạo PR trên GitHub phải được xác minh riêng; thư mục bằng chứng này không tuyên bố PR đã tồn tại.
