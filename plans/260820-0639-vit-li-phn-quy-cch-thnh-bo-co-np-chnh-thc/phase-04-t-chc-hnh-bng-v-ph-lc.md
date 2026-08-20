---
phase: 4
title: "Tổ chức hình, bảng và phụ lục"
status: pending
priority: P2
effort: ""
dependencies: ["phase-02", "phase-03"]
---

# Phase 4: Tổ chức hình, bảng và phụ lục

## Overview

Giảm hình và bảng trong thân bài xuống mức cần thiết; chuyển chi tiết truy vết sang phụ lục. Mỗi hình phải làm rõ một kết luận cụ thể, không xuất hiện chỉ để trang trí hoặc đủ số lượng.

## Requirements

- Functional: Thân bài có bộ hình đại diện cho các kết quả chính.
- Functional: Phụ lục giữ đầy đủ ma trận 31 tiêu chí, B1–B12 và nguồn hình.
- Non-functional: Không áp dụng mô hình một tiểu mục–một hình.
- Non-functional: Chú thích ngắn, trực tiếp; thông tin nguồn chi tiết đặt trong danh mục hình hoặc ghi chú cuối phụ lục.
- Functional: Mỗi hồ sơ B1–B12 phải có liên kết tới ít nhất một kết luận/giới hạn hoặc được ghi rõ là không dùng kèm lý do.

## Architecture

Bộ hình thân bài dự kiến gồm 8–12 hình:

- Giao diện tổng thể trên máy tính.
- Giao diện màn hình hẹp hoặc chế độ sáng.
- Một bài học thể hiện văn bản, hình và công thức.
- Một mô phỏng 2D đại diện.
- Mô phỏng 3D thí điểm.
- Phản hồi câu hỏi trắc nghiệm.
- Trình đọc PDF hoặc chức năng hỗ trợ học tập.
- Gói phát hành/kiểm thử hoặc ma trận bằng chứng.

Các hình còn lại chuyển vào phụ lục hình minh chứng hoặc loại nếu trùng nội dung.

## Related Code Files

- Modify: `DeCuongChiTietNop.docx`
- Reuse: `tmp-report-evidence-v2-png/` hoặc ảnh nguồn tương ứng sau khi xác nhận phiên bản
- Evidence: `release/`, `docs/`, `package.json`, `data/`, bản chạy hiện hành

## Implementation Steps

1. Chọn hình theo thông điệp báo cáo, không theo số thứ tự tiêu chí.
2. Loại các hình chỉ chụp tệp văn bản khi một hình sản phẩm trực tiếp có giá trị hơn.
3. Đặt hình sau đoạn đã giải thích kết quả; trong đoạn phải có câu dẫn đến hình.
4. Viết chú thích một câu, nêu đúng nội dung nhìn thấy; không biến chú thích thành đoạn đánh giá.
5. Chuyển nguồn chi tiết, đường dẫn, ngày chụp và phạm vi chứng minh sang phụ lục danh mục hình.
6. Giữ một bảng tổng hợp kết quả trong thân bài; chuyển ma trận 31 tiêu chí và danh mục B1–B12 xuống phụ lục nhưng bảo toàn liên kết hai chiều tới kết luận, giới hạn, hình/bảng và vị trí cuối.
7. Kiểm tra kích thước hình, độ đọc được, ngắt trang và không lặp nội dung giữa hình với bảng.

## Success Criteria

- [ ] Thân bài không quá 12 hình và không có hình trùng công dụng.
- [ ] Mỗi hình được nhắc và phân tích trong văn bản liền trước hoặc liền sau.
- [ ] Chú thích ngắn, nguồn chi tiết có vị trí riêng.
- [ ] Phụ lục có đúng 31/31 tiêu chí và 12/12 hồ sơ B1–B12; không có mã trùng, thiếu, sai trạng thái hoặc không có liên kết được giải thích.
- [ ] Không có trang bị chiếm bởi hình nhưng thiếu lập luận báo cáo.

## Risk Assessment

Giảm hình có thể khiến người thẩm định khó truy vết. Biện pháp là không xóa bằng chứng gốc; chuyển hình bổ sung xuống phụ lục và duy trì danh mục ánh xạ tiêu chí–hình–nguồn.
