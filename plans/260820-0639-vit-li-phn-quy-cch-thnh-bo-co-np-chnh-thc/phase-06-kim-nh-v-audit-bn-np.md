---
phase: 6
title: "Kiểm định và audit bản nộp"
status: pending
priority: P1
effort: ""
dependencies: ["phase-05"]
---

# Phase 6: Kiểm định và audit bản nộp

## Overview

Xác nhận bản sửa đổi đạt cả ba lớp: đúng hình thức báo cáo, đúng hiện trạng kỹ thuật và hợp lệ về DOCX. Kiểm định phải tìm lỗi, không chỉ xác nhận các bước đã làm.

## Requirements

- Functional: Báo cáo không còn cấu trúc phiếu kiểm tra lặp lại; 5 nhóm kết quả đều có yêu cầu/thực trạng, việc đã làm, kết quả, bằng chứng và giới hạn.
- Functional: Ma trận truy vết có đúng 31/31 tiêu chí và 12/12 hồ sơ B1–B12; mọi liên kết tới kết luận, hình/bảng và vị trí cuối đều kiểm tra được.
- Functional: Mỗi tuyên bố thực tế trong bản cuối có hiện vật, phiên bản/ngày, phương pháp kiểm tra và kết quả quan sát.
- Non-functional: Nội dung, bảng, hình, thứ tự, style ID, định dạng trực tiếp/có hiệu lực, section và header/footer trước tiêu đề đích không đổi ngoài allowlist đã khóa.
- Non-functional: DOCX hợp lệ và mở–cập nhật trường–lưu–đóng–mở lại–render đạt trên đúng phiên bản/build Microsoft Word và Windows đã ghi ở Phase 1; thiếu môi trường này là blocker, không được thay bằng tuyên bố tương thích từ công cụ khác.
- Non-functional: Audit độc lập theo rubric cố định không còn lỗi Critical, High hoặc Medium.

## Architecture

Bốn cửa kiểm soát:

1. **Cửa nội dung:** mạch báo cáo, luận điểm, kết luận, giới hạn.
2. **Cửa bằng chứng:** hình, bảng, mã B1–B12, tài liệu tham chiếu.
3. **Cửa ngôn ngữ:** tiếng Việt chuyên nghiệp, thuật ngữ và số liệu nhất quán.
4. **Cửa tài liệu:** schema DOCX, heading, mục lục, ngắt trang và render toàn bộ.

Rubric audit cố định:

- **Cấu trúc:** đủ mở đầu, phương pháp, 5 nhóm kết quả, đánh giá chung, kết luận và phụ lục; mỗi nhóm đủ 5 thành phần lập luận bắt buộc.
- **Mẫu trình bày bị cấm:** không còn chuỗi bốn nhãn cũ trong thân bài; không có hình không được dẫn và phân tích; không có đoạn chỉ lặp tiêu đề hoặc chú thích.
- **Truy vết:** đúng 31 tiêu chí, 12 hồ sơ B1–B12, không mồ côi; mọi tuyên bố thực tế có bản ghi kiểm chứng.
- **Ngôn ngữ:** thuật ngữ, chính tả, số liệu, ngày, phiên bản và mức đáp ứng nhất quán.
- **DOCX:** mục lục, số trang, chú thích, tham chiếu chéo, hình nhúng, bảng, thay đổi theo dõi, nhận xét, style dùng chung, section/header/footer và khả năng mở lại trên môi trường Word/Windows đã khóa.

Định nghĩa mức độ:

- **Critical:** hỏng hoặc mất nội dung/tệp; tạo kết quả, phê duyệt hoặc bằng chứng không tồn tại.
- **High:** thiếu tiêu chí hoặc hồ sơ B; mâu thuẫn kết luận lớn; thay đổi ngoài phạm vi; tệp không mở/lưu lại được.
- **Medium:** tuyên bố không đủ bằng chứng, tham chiếu gãy, cấu trúc checklist còn trong thân bài hoặc lỗi bố cục cản trở đọc.
- **Low:** lỗi câu chữ hoặc trình bày cục bộ không đổi nghĩa và không cản trở đọc.

Tính độc lập được đáp ứng khi người/agent audit không phải là tác giả trực tiếp của bản sửa và chỉ sử dụng rubric đã khóa; kết quả phải lưu thành checklist có vị trí, mức độ, cách xử lý và trạng thái kiểm tra lại.

## Related Code Files

- Verify: `DeCuongChiTietNop.docx`
- Generate for QA only: contact sheet và ảnh các trang có bố cục phức tạp

## Implementation Steps

1. Dùng tìm kiếm nội dung để xác nhận không còn chuỗi bốn nhãn cũ trong thân bài.
2. Đọc riêng thân báo cáo; với từng nhóm, đánh dấu đủ yêu cầu/thực trạng, việc đã làm, kết quả, bằng chứng và giới hạn.
3. Kiểm sổ đăng ký và ma trận: đúng 31/31 tiêu chí, 12/12 hồ sơ B1–B12, mã duy nhất, trạng thái bảo toàn, liên kết hai chiều không mồ côi.
4. Tái lập và kiểm sổ tuyên bố–bằng chứng từ câu chữ cuối; kiểm tra riêng WCAG, tìm kiếm toàn văn, QTI, LMS, SCORM, xAPI, 3D, 4D, video, âm thanh và gói bàn giao.
5. So sánh đường cơ sở trước/sau đối với phần trước tiêu đề đích: văn bản, đoạn/bảng/hình, style ID, định dạng trực tiếp/có hiệu lực, section properties và quan hệ header/footer; chỉ chấp nhận khác biệt nằm trong allowlist đã khóa.
6. Chạy `officecli view ... issues`, `outline`, `text` và `validate`.
7. Trên đúng phiên bản/build Microsoft Word và Windows đã ghi ở Phase 1: mở tệp, cập nhật toàn bộ trường, kiểm mục lục/số trang/chú thích/tham chiếu chéo, xử lý Track Changes và comments, xác nhận ảnh được nhúng; lưu, đóng, mở lại và render. Công cụ khác chỉ là kiểm tra bổ sung, không thay thế cổng tương thích Word.
8. Render toàn bộ tài liệu thành contact sheet; kiểm tra riêng trang mở đầu báo cáo, hình lớn, bảng dài, kết luận và phụ lục.
9. Thực hiện audit độc lập theo rubric và định nghĩa mức độ đã khóa; lưu checklist có vị trí, cách xử lý và trạng thái kiểm tra lại.
10. Chỉ chốt tệp khi mọi lỗi Critical/High/Medium đã được xử lý và toàn bộ cửa kiểm soát được chạy lại.

## Success Criteria

- [ ] Không còn chuỗi “Mức độ đáp ứng/Kết quả thực hiện/Minh chứng/Nhận xét, đánh giá” trong thân bài.
- [ ] Cả 5 nhóm kết quả đều có đủ 5 thành phần lập luận bắt buộc.
- [ ] Sổ đăng ký và ma trận có đúng 31/31 tiêu chí, 12/12 hồ sơ B1–B12, mã duy nhất, trạng thái bảo toàn và không có liên kết mồ côi.
- [ ] Sổ tuyên bố–bằng chứng bao phủ mọi câu nêu chức năng, số lượng, phiên bản, mức đáp ứng, kết quả thử nghiệm và giới hạn.
- [ ] So sánh ngoài phạm vi không phát hiện thay đổi văn bản, cấu trúc, style/định dạng có hiệu lực, section hoặc header/footer ngoài allowlist.
- [ ] `officecli validate` không báo lỗi; kiểm tra mở–cập nhật trường–lưu–đóng–mở lại–render đạt trên đúng Word/Windows mục tiêu đã khóa.
- [ ] Contact sheet không có lỗi ngắt trang hoặc bố cục nghiêm trọng.
- [ ] Audit độc lập theo rubric cố định có checklist hoàn chỉnh và không còn Critical, High hoặc Medium.

## Risk Assessment

Một bản có thể hợp lệ về OpenXML nhưng vẫn không đạt chất lượng báo cáo. Vì vậy không dùng `validate` làm bằng chứng duy nhất; bắt buộc có đọc nội dung liên tục và kiểm tra trực quan toàn tài liệu.
