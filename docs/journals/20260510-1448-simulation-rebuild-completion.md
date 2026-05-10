# Hoàn tất xây dựng lại 58 mô phỏng theo phong cách DeCuong

**Date**: 2026-05-10 14:48
**Severity**: Low
**Component**: Simulations, Renderers, Primitives
**Status**: Resolved

## What Happened

Đã hoàn thành việc xây dựng lại toàn bộ 58 route mô phỏng để đạt được độ đồng nhất cao về thị giác và tương tác theo phong cách `DeCuong_CoHocLyThuyet.html`. Hệ thống `SimRouteRendererPrimitives` đã được nâng cấp mạnh mẽ với các primitive mới như `neonArrow`, `vectorTriangle`, `supportTriangle`, và `barGraph`.

## The Brutal Truth

Việc duy trì 58 renderer riêng biệt mà vẫn đảm bảo tính nhất quán là một thử thách về mặt mã nguồn. Trước đây, nhiều renderer sử dụng các hình khối generic làm giảm tính chuyên môn của giáo trình. Việc ép mọi renderer phải dùng chung một bộ "bút vẽ" chuẩn (primitives) giúp tăng tốc độ phát triển nhưng cũng yêu cầu sự tỉ mỉ khi tinh chỉnh từng tọa độ cho phù hợp với nội dung bài học.

## Technical Details

- **Primitives**: Thêm `P.neonArrow` cho các véc tơ lực/vận tốc, `P.vectorTriangle` cho các tam giác véc tơ/hình bình hành, `P.supportTriangle` cho gối tựa, và `P.barGraph` cho biểu đồ năng lượng/động lượng.
- **Theme**: Cập nhật `sceneColors` để khớp với mã màu CSS của DeCuong (`#091a33` cho dark mode).
- **Grid**: Chuẩn hóa lưới 30px cho mọi canvas.
- **Chapter Polish**: Tinh chỉnh toàn bộ 25 renderer Chương 1, 15 renderer Chương 2, và 18 renderer Chương 3.
- **QA**: Vượt qua `npm run test:sim:release` với 100% tỉ lệ thành công trên 58 route.

## What We Tried

- Đã thử dùng `P.arrow` cũ nhưng kết quả không đủ nổi bật trên nền theme tối. Chuyển sang `P.neonArrow` với shadow và glow giúp tăng độ tương phản rõ rệt.
- Đã thử copy-paste code từ `DeCuong_CoHocLyThuyet.html` nhưng nhận thấy cấu trúc registry hiện tại sạch sẽ hơn nhiều, nên đã chọn cách "port" phong cách vẽ thay vì port code logic.

## Root Cause Analysis

N/A - Đây là một đợt nâng cấp tính năng (feature upgrade) chứ không phải sửa lỗi.

## Lessons Learned

- Việc trừu tượng hóa các ký hiệu vật lý (statics symbols) thành các primitive dùng chung cực kỳ quan trọng để giữ cho codebase gọn nhẹ dưới 200 dòng/file.
- TDD giúp phát hiện sớm các lỗi nhỏ khi render (như việc quên `restore()` context).

## Next Steps

- Theo dõi phản hồi từ người dùng về độ nhạy của các handle mới trên thiết bị cảm ứng.
- Duy trì pipeline DOCX sync để đảm bảo text/công thức không bị lệch so với hình ảnh mô phỏng.
