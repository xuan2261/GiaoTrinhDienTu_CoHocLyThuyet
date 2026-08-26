# Báo cáo phản biện biên tập Option B

Ngày: 2026-08-26  
Phạm vi: phần từ “QUY CÁCH TRÌNH BÀY GIÁO TRÌNH ĐIỆN TỬ” đến hết Phụ lục C trong `DeCuongChiTietNop.docx`.

## Kết luận

- Phần cũ có nền kỹ thuật tốt nhưng chưa đạt thể loại báo cáo chính thức để ký nguyên trạng.
- Chọn Option B: giữ trong đề cương như phụ lục rà soát kỹ thuật; không tạo báo cáo hành chính hoặc chữ ký giả.
- Đổi tên theo chức năng thực; hạ kết luận về mức hoàn thiện/review bản ứng viên kỹ thuật.
- Giảm 25–35% nhưng giữ đủ 31 tiêu chí và B1–B12.

## Baseline định lượng

- Boundary: `B512–B633`, `paraId 7FE19132…7FE19654`.
- 122 khối: 115 đoạn, 7 bảng, 10 chú thích hình.
- Khoảng 7.054 từ; Phụ lục C khoảng 3.048 từ.
- Bảng 7: 32 × 12, chữ 7 pt, đúng 31 mã duy nhất.
- Phụ lục B: đủ B1–B12; ma trận viện dẫn đủ 12 mã.
- Trạng thái cũ: 8 “Đã đáp ứng”, 19 “Đáp ứng cơ bản”, 3 “Chưa áp dụng”, 1 hỗn hợp 3D/4D.
- `QC_Title`, `QC_Muc`, `QC_TieuMuc` chưa có outline level; TOC không nhận diện phần này.

## Điểm cần giữ

- Phân biệt yêu cầu quy phạm, tài liệu tham chiếu và bằng chứng triển khai.
- Chuỗi mục đích → phạm vi → phương pháp → kết quả → kết luận → phụ lục.
- Phụ lục B tách chỉ mục bằng chứng khỏi ma trận.
- Phụ lục C có phép kiểm, kết quả, giới hạn và chủ trì/xác nhận.
- Điều kiện đóng gồm RC, QA, thẩm định, ảnh, SHA-256 và chữ ký.

## Điểm phải sửa

- Tên “Quy cách trình bày” sai thể loại; nội dung thực là kết quả rà soát mức độ đáp ứng.
- Bỏ ngôn ngữ “đủ điều kiện nghiệm thu” khi còn thiếu RC cuối và review độc lập.
- Tách “không áp dụng theo phạm vi” khỏi “chưa triển khai/chưa đánh giá”.
- Dùng `TC x.y` để tránh nhầm mã yêu cầu với số mục.
- Mỗi nhóm tiêu chí chỉ giữ kết luận, bằng chứng/phép kiểm và điều kiện đóng.
- Rút ma trận còn 7 cột; dùng hàng tiêu đề nhóm thay cột “Nhóm”.
- Loại ảnh chụp Markdown/`package.json`; ưu tiên ảnh sản phẩm có provenance.
- Chuẩn hóa nguồn hình: RC/hash, route, viewport, ngày và evidence ID.
- Chuẩn hóa tài liệu [1]–[7]; không tự điền metadata chưa xác minh của Hướng dẫn 2622/HĐ-QHNT.
- Gán outline level và dùng TOC field, không gõ tay số trang.

## Cấu trúc đề xuất

1. Tóm tắt điều hành và trạng thái phê duyệt.
2. I. Mục đích, phạm vi, căn cứ, phương pháp và quy tắc trạng thái.
3. II. Kết quả theo 10 nhóm tiêu chí.
4. III. Điều kiện đóng và kiến nghị.
5. Phụ lục A: căn cứ/tiêu chuẩn.
6. Phụ lục B: B1–B12.
7. Phụ lục C: ma trận 31 tiêu chí.

## Ngân sách từ

- Mục tiêu: 4.585–5.291 từ.
- Giữ thân bài cô đọng; dành phần lớn dung lượng cho ma trận truy vết.
- Bỏ câu trạng thái chung chung, đường dẫn lặp và mô tả đã có trong phụ lục.

## Rủi ro

- Rút gọn làm mất truy vết: kiểm máy 31 mã và B1–B12.
- Sửa lan ngoài boundary: so sánh XML và giữ final `sectPr`.
- Claim vượt evidence: khóa theo acceptance report/candidate hiện hành.
- Word chưa chạy: giữ not-run, không dùng OpenXML thay Word round-trip.

## Câu hỏi còn mở

- Cơ quan ban hành và bản lưu chính thức của Hướng dẫn 2622/HĐ-QHNT.
- Word standalone round-trip trên Office khỏe.
- Independent academic/accessibility/release review.