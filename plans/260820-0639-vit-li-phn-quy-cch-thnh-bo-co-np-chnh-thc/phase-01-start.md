---
phase: 1
title: "Kiểm kê nội dung và bằng chứng"
status: pending
priority: P1
effort: ""
dependencies: []
---

# Phase 1: Kiểm kê nội dung và bằng chứng

## Overview

Tạo bộ dữ liệu biên tập trước khi viết: nội dung hiện có, 31 tiêu chí, các tuyên bố thực tế, hình ảnh, bảng, nguồn B1–B12 và giới hạn đã xác nhận. Giai đoạn này ngăn việc rút gọn làm mất căn cứ hoặc tạo thêm kết luận không có bằng chứng.

## Requirements

- Functional: Mỗi tiêu chí hiện tại phải được ánh xạ sang một nhóm kết quả hoặc một phụ lục.
- Functional: Mỗi tuyên bố về chức năng, số lượng, phiên bản và mức đáp ứng phải có nguồn kiểm chứng.
- Non-functional: Không chỉnh sửa nội dung chuyên môn trước phần quy cách.
- Non-functional: Không dùng ảnh dựng, số liệu ước đoán hoặc biên bản chưa tồn tại.

## Architecture

Tạo ba bộ dữ liệu kiểm soát trước khi viết:

1. **Sổ đăng ký đường cơ sở:** đúng 31 tiêu chí, giữ nguyên câu yêu cầu, trạng thái hiện tại và vị trí; đúng 12 hồ sơ B1–B12, ghi tên, loại hiện vật, đường dẫn hoặc tài liệu, phiên bản/ngày và kết quả kiểm tra tồn tại.
2. **Ma trận truy vết hai chiều:** tiêu chí ↔ kết luận/giới hạn dự kiến ↔ B1–B12 ↔ hình/bảng ↔ vị trí mới. Một tiêu chí có thể dùng nhiều bằng chứng và một bằng chứng có thể hỗ trợ nhiều tiêu chí, nhưng mọi liên kết phải có lý do.
3. **Sổ tuyên bố–bằng chứng:** câu hoặc ý thực tế, hiện vật và phiên bản hỗ trợ, phương pháp kiểm tra, kết quả quan sát, mức diễn đạt được phép và vị trí cuối.

Đồng thời lưu đường cơ sở của toàn bộ nội dung trước tiêu đề đích: văn bản chuẩn hóa; số lượng và thứ tự đoạn/bảng/hình; quan hệ hình ảnh; style ID, định dạng trực tiếp và định dạng có hiệu lực; section properties; quan hệ header/footer. Ghi và khóa phiên bản/build Microsoft Word cùng Windows của máy nộp làm môi trường nghiệm thu DOCX. Đây là căn cứ phát hiện thay đổi ngoài phạm vi và kiểm tra tương thích sau khi cập nhật trường tài liệu.

## Related Code Files

- Modify later: `DeCuongChiTietNop.docx`
- Read-only evidence: `README.md`, `docs/`, `package.json`, `tests/`, `js/`, `data/`, `release/`
- Reference artifact: `DeCuongChiTietNop-final-contact.png`

## Implementation Steps

1. Trích toàn bộ phần quy cách hiện tại từ tiêu đề đến hết tài liệu tham khảo.
2. Lập sổ đăng ký đúng 31 tiêu chí với nguyên văn yêu cầu, trạng thái và vị trí ban đầu.
3. Lập sổ đăng ký đúng 12 hồ sơ B1–B12; kiểm tra hiện vật tồn tại, phiên bản/ngày và phạm vi chứng minh.
4. Phân loại 31 tiêu chí theo 5 nhóm kết quả; ghi rõ phần đạt, đáp ứng cơ bản, thí điểm và chưa áp dụng.
5. Lập ma trận truy vết hai chiều giữa tiêu chí, kết luận/giới hạn, B1–B12, hình/bảng và vị trí dự kiến.
6. Lập sổ tuyên bố–bằng chứng cho mọi số lượng, phiên bản, chức năng, mức đáp ứng, kết quả kiểm thử và giới hạn.
7. Lập danh sách hình hiện có; đánh dấu giữ ở thân bài, chuyển phụ lục hoặc loại bỏ, kèm lý do.
8. Chụp đường cơ sở phần ngoài phạm vi, gồm cấu trúc, style/định dạng có hiệu lực, section và header/footer; ghi phiên bản/build Word và Windows mục tiêu trước khi chỉnh sửa.
9. Khóa các giới hạn không được phép diễn giải rộng hơn hiện trạng.

## Success Criteria

- [ ] Sổ đăng ký có đúng 31/31 tiêu chí, không trùng mã, không mất nguyên văn yêu cầu hoặc trạng thái.
- [ ] Sổ đăng ký có đúng 12/12 hồ sơ B1–B12; từng hiện vật đã được kiểm tra tồn tại và ghi phiên bản/ngày.
- [ ] Ma trận hai chiều không có tiêu chí chưa xử lý; bằng chứng chưa dùng phải có lý do giữ hoặc loại.
- [ ] Mọi tuyên bố thực tế dự kiến đều có hiện vật, phương pháp kiểm tra, kết quả quan sát và mức diễn đạt cho phép.
- [ ] Mỗi hình đã có quyết định: thân bài, phụ lục hoặc loại bỏ, kèm lý do.
- [ ] Đường cơ sở ngoài phạm vi, môi trường Word/Windows mục tiêu và danh sách giới hạn bắt buộc đã được lưu; nếu Word mục tiêu không khả dụng, trạng thái kế hoạch phải được đánh dấu blocked trước khi viết.

## Risk Assessment

Rủi ro lớn nhất là mất chi tiết khi gom nhóm. Nếu một tiêu chí không có vị trí mới hoặc không còn căn cứ truy vết, dừng viết và cập nhật bảng ánh xạ trước.
