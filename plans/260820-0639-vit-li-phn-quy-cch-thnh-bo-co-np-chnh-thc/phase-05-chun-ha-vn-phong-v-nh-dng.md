---
phase: 5
title: "Chuẩn hóa văn phong và định dạng"
status: pending
priority: P1
effort: ""
dependencies: ["phase-03", "phase-04"]
---

# Phase 5: Chuẩn hóa văn phong và định dạng

## Overview

Biên tập bản thảo thành văn bản tiếng Việt chuyên nghiệp và đồng bộ với thể thức tài liệu hiện có. Skill `viet-chuyen-nghiep` không có trong kho hiện tại; áp dụng tương đương bằng nguyên tắc viết hành chính–học thuật, `ak:write` và quy tắc báo cáo Word của OfficeCLI.

## Requirements

- Functional: Thuật ngữ, chủ thể, thời gian, phiên bản và trạng thái nhất quán.
- Functional: Câu và đoạn thể hiện rõ quan hệ giữa việc thực hiện, kết quả, bằng chứng và giới hạn.
- Non-functional: Hạn chế tiếng Anh ngoài tên chuẩn, lệnh và tên tệp bắt buộc.
- Non-functional: Định dạng phải hòa hợp với tài liệu gốc, không tạo một “tài liệu con” có phong cách khác biệt.
- Non-functional: Không sửa style dùng chung nếu style đó được dùng trước tiêu đề đích; khi cần khác biệt, tạo style chỉ áp dụng cho phần báo cáo.

## Architecture

Quy tắc văn phong:

- Dùng “Nhóm biên soạn”, “sản phẩm”, “bản chạy hiện hành”, “gói phát hành” với nghĩa ổn định.
- Ưu tiên động từ có nội dung: xây dựng, kiểm tra, đối chiếu, xác nhận, ghi nhận, chưa triển khai.
- Tránh các câu mẫu lặp như “Tiểu mục đáp ứng…”, “Hình minh chứng kèm theo…”.
- Mỗi đoạn có một luận điểm; câu cuối xác định kết quả hoặc giới hạn của luận điểm đó.
- Tách rõ sự việc đã kiểm chứng với kiến nghị phải thực hiện sau.

Quy tắc định dạng:

- Dùng hệ thống Heading thống nhất và mục lục cập nhật được.
- Thân bài theo font, cỡ chữ, căn lề và giãn dòng của hồ sơ hiện hành.
- Hình, bảng có đánh số liên tục; không dùng quá nhiều kiểu nhấn mạnh.
- Không tạo khoảng trắng bằng chuỗi đoạn rỗng.

## Related Code Files

- Modify: `DeCuongChiTietNop.docx`
- Inspect: styles, headings, captions, headers, footers and TOC in the same DOCX

## Implementation Steps

1. Rà từng mục theo ba lớp: độ rõ nghĩa, tính hành chính–học thuật, tính nhất quán thuật ngữ.
2. Loại câu lặp, từ đệm, cụm “kèm theo” không cần thiết và các nhận xét tự giải thích hiển nhiên.
3. Chuyển thuật ngữ ngoại lai sang tiếng Việt khi không phải tên chuẩn, tên lệnh hoặc tên tệp.
4. Chuẩn hóa cách ghi ngày, phiên bản, số lượng, ký hiệu tài liệu và mã bằng chứng.
5. Áp dụng style thống nhất cho tiêu đề, thân bài, chú thích hình, nguồn và bảng trong phần đích; không sửa style dùng chung được dùng trước tiêu đề, thay vào đó tạo style riêng có phạm vi báo cáo.
6. Kiểm tra ngắt trang: tiêu đề không đứng cuối trang, hình không tách chú thích, bảng lặp hàng tiêu đề khi cần.
7. Cập nhật trường mục lục và số trang bằng cơ chế của Word/OfficeCLI, không gõ số thủ công.
8. Sau khi làm gọn câu chữ, tái kiểm tra sổ tuyên bố–bằng chứng; mọi câu mạnh hơn nguồn phải được hạ mức hoặc loại bỏ.

## Success Criteria

- [ ] Văn bản không còn giọng mẫu biểu hoặc ghi chú kỹ thuật vụn.
- [ ] Không có đoạn nào chỉ lặp lại tiêu đề hoặc mô tả điều hiển nhiên trong hình.
- [ ] Thuật ngữ và số liệu nhất quán toàn phần.
- [ ] Hệ thống tiêu đề, hình, bảng, nguồn và phụ lục đồng bộ.
- [ ] Bản render không có trang trắng, tiêu đề mồ côi, chú thích tách hình hoặc bảng tràn lề.
- [ ] Sổ tuyên bố–bằng chứng phản ánh đúng câu chữ cuối, không còn bản ghi trỏ tới nội dung đã bị thay đổi hoặc loại bỏ.

## Risk Assessment

Chỉnh văn phong có thể vô tình thay đổi phạm vi kỹ thuật của tuyên bố. Mọi câu được làm mạnh hơn hoặc ngắn hơn phải đối chiếu lại nguồn; nếu ý nghĩa rộng hơn bằng chứng, giữ cách diễn đạt thận trọng.
