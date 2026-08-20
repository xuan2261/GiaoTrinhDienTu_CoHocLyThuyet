---
phase: 2
title: "Thiết kế cấu trúc báo cáo"
status: pending
priority: P1
effort: ""
dependencies: ["phase-01"]
---

# Phase 2: Thiết kế cấu trúc báo cáo

## Overview

Chốt khung báo cáo trước khi viết câu chữ. Trọng tâm là tạo mạch đọc từ mục đích, phương pháp, kết quả, đánh giá đến kết luận; chi tiết kiểm kê được chuyển xuống phụ lục.

## Requirements

- Functional: Thân báo cáo chỉ có các nhóm nội dung phục vụ lập luận tổng hợp.
- Functional: Cấu trúc phải chứa đủ kết quả, hạn chế, mức sẵn sàng và kiến nghị.
- Non-functional: Không dùng bốn nhãn lặp lại ở từng tiểu mục.
- Non-functional: Không dùng bảng lớn làm nội dung chính của báo cáo.

## Architecture

Cấu trúc mục tiêu:

1. **Mở đầu**
   - Mục đích lập báo cáo.
   - Phạm vi sản phẩm và hồ sơ được rà soát.
   - Căn cứ và phương pháp đánh giá.
2. **Kết quả xây dựng và hoàn thiện**
   - Tổ chức nội dung và kiến trúc sản phẩm.
   - Giao diện, điều hướng và khả năng tiếp cận.
   - Học liệu trực quan, công thức và mô phỏng.
   - Kiểm tra, đánh giá và hỗ trợ người học.
   - Đóng gói, phát hành và kiểm soát chất lượng.
3. **Đánh giá chung**
   - Kết quả nổi bật.
   - Hạn chế và nội dung chưa áp dụng.
   - Mức sẵn sàng của sản phẩm và hồ sơ.
4. **Kết luận và kiến nghị**
5. **Phụ lục truy vết**

## Related Code Files

- Modify later: `DeCuongChiTietNop.docx`
- Input: bảng ánh xạ hoàn thành ở Phase 1

## Implementation Steps

1. Chốt tiêu đề phần theo tính chất báo cáo, dự kiến: “BÁO CÁO KẾT QUẢ XÂY DỰNG VÀ HOÀN THIỆN QUY CÁCH TRÌNH BÀY GIÁO TRÌNH ĐIỆN TỬ”.
2. Xác định thông điệp trung tâm của từng mục lớn; mỗi mục chỉ trả lời một nhóm câu hỏi.
3. Sắp xếp các nhóm kết quả theo hành trình sản phẩm: nội dung → giao diện → học liệu/tương tác → đánh giá → phát hành/kiểm soát.
4. Chuyển trạng thái 31 tiêu chí sang bảng tổng hợp ở phụ lục.
5. Quy định vị trí hình và bảng ngay trong khung, không chèn hình theo số lượng tiểu mục.
6. Kiểm tra rằng người đọc có thể hiểu kết luận chung mà chưa cần mở phụ lục.

## Success Criteria

- [ ] Khung báo cáo có mở đầu, phương pháp, kết quả, đánh giá, kết luận và phụ lục.
- [ ] Thân bài chỉ còn 5 nhóm kết quả chính.
- [ ] Mỗi tiêu chí cũ có một vị trí mới rõ ràng.
- [ ] Phụ lục chịu trách nhiệm truy vết; thân bài chịu trách nhiệm lập luận.

## Risk Assessment

Nếu cấu trúc mới chỉ đổi tên các mục cũ mà vẫn chứa 31 đơn vị nội dung độc lập, phương án đã thất bại. Khi đó phải tiếp tục gom theo thông điệp, không viết ngay.
