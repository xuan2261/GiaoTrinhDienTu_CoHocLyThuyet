---
title: Siết ranh giới bằng chứng gói trình bày
date: 2026-09-25
summary: "Sửa toàn bộ phát hiện audit, đồng bộ bốn đầu ra và xác nhận 15/15 kiểm thử."
---

# Siết ranh giới bằng chứng gói trình bày

## What happened
Audit khoa học–sư phạm phát hiện mô hình nội dung dùng ngôn ngữ mạnh hơn bằng chứng hiện có, và một số ranh giới bị mất khi sinh Web Slides hoặc handout.

## Root cause
PPTX, Web Slides và handout dùng chung nội dung nhưng các bộ dựng không tuần tự hóa cùng một tập thông tin. Lời miễn trừ nằm trong ghi chú hoặc mã dựng PPT nên không xuất hiện ở đầu ra HTML; handout còn cắt Slide 19 ở năm mục.

## Changes
- Đổi các ca kỹ thuật thành “ca đối chiếu khoa học”, nêu rõ chưa thẩm định độc lập.
- Tách bản web trình diễn khỏi gói ứng viên đang kiểm tra.
- Làm rõ điều kiện trọng tâm, Coriolis, va chạm thẳng một chiều thụ động và mô men tại θ = 90°.
- Gọi 108 là mục/trang hiển thị trong manifest, gồm 45/29/31 + 3 bổ trợ.
- Giới hạn yêu cầu Hội đồng ở ghi nhận việc xây dựng hiện vật và góp ý; không xin chấp thuận học thuật, nghiệm thu cuối hoặc phát hành.
- Đồng bộ cảnh báo, điều kiện cập nhật kết luận và ngôn ngữ Việt trong PPTX, Web Slides, handout và hai hướng dẫn.
- Sửa bố cục các Slide 8, 14, 18 và 19; loại mã kiểm tra nội bộ khỏi đầu ra trình bày.
- Bổ sung kiểm thử hồi quy cho toàn bộ các phát hiện, gồm kiểm tra đầu ra dẫn xuất.

## Validation
- `node --test tests/presentation-deck-contract.test.js`: 15/15 passed.
- Dựng cô lập khớp PPTX/Web Slides/handout đã giao.
- PowerPoint xuất 19 slide và PDF 19 trang; ảnh liên hệ 19 slide không còn tràn hoặc chồng chữ đáng kể.
- `git diff --check` qua trên phạm vi sửa đổi.
- Phản biện độc lập cuối xác nhận không còn phát hiện mức chặn hoặc mức trung bình.

## Decision
Các ca trình bày chỉ là mẫu đối chiếu kỹ thuật chưa thẩm định độc lập. Chỉ cập nhật kết luận học thuật khi có bằng chứng được ủy quyền; chỉ cập nhật quyết định phát hành sau khi chạy lại đủ 24 điều kiện và không còn “không đạt”, “chưa thể thực hiện” hoặc “chưa chạy”.

## Next steps
Không tự động cam kết hoặc phát hành. Hội đồng xem hiện vật, ghi nhận việc đã xây dựng và cho ý kiến hoàn thiện.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
