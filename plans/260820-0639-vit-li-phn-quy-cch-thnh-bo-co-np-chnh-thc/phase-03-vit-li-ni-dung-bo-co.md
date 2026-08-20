---
phase: 3
title: "Viết lại nội dung báo cáo"
status: pending
priority: P1
effort: ""
dependencies: ["phase-01", "phase-02"]
---

# Phase 3: Viết lại nội dung báo cáo

## Overview

Viết lại toàn bộ thân báo cáo theo lối trình bày liên tục, có luận điểm và kết luận. Không chắp nối các đoạn “mức độ–kết quả–minh chứng–nhận xét” hiện tại.

## Requirements

- Functional: Mỗi nhóm kết quả phải nêu được việc đã làm, kết quả quan sát, bằng chứng chính và giới hạn.
- Functional: Kết luận tổng hợp phải phân biệt rõ phần đã đáp ứng, đáp ứng cơ bản, thí điểm và chưa áp dụng.
- Non-functional: Giọng văn hành chính–học thuật; không khẩu ngữ, không quảng bá, không phóng đại.
- Non-functional: Đoạn văn là đơn vị trình bày chính; danh sách chỉ dùng khi thông tin thực sự song song.
- Functional: Sau mỗi lượt viết và biên tập, sổ tuyên bố–bằng chứng phải được cập nhật theo đúng câu chữ cuối; câu không có căn cứ phải bỏ hoặc hạ mức diễn đạt.

## Architecture

Mẫu lập luận cho mỗi nhóm kết quả:

1. Nêu yêu cầu hoặc vấn đề cần giải quyết.
2. Trình bày cách sản phẩm đã được tổ chức hoặc hoàn thiện.
3. Nêu kết quả quan sát được từ bản chạy và hồ sơ.
4. Dẫn một hoặc hai bằng chứng đại diện.
5. Kết luận phạm vi đáp ứng và giới hạn còn lại.

Mỗi nhóm có nhiều đoạn liên kết bằng quan hệ nguyên nhân, bổ sung, đối chiếu hoặc giới hạn; không dùng cùng một câu mở đầu cho mọi đoạn.

## Related Code Files

- Modify: `DeCuongChiTietNop.docx`
- Read-only sources: `README.md`, `docs/project-overview-pdr.md`, `docs/system-architecture.md`, `docs/deployment-guide.md`, `docs/project-changelog.md`

## Implementation Steps

1. Viết mới phần mở đầu: lý do, mục đích, phạm vi, đối tượng và phương pháp rà soát.
2. Viết nhóm “Tổ chức nội dung và kiến trúc sản phẩm”, kết hợp các tiêu chí 1.x và 2.x.
3. Viết nhóm “Giao diện, điều hướng và khả năng tiếp cận”, kết hợp các tiêu chí 3.x và phần trực quan liên quan.
4. Viết nhóm “Học liệu trực quan, công thức và mô phỏng”, kết hợp 4.x và 5.x.
5. Viết nhóm “Kiểm tra, đánh giá và hỗ trợ người học”, kết hợp 6.x.
6. Viết nhóm “Đóng gói, phát hành và kiểm soát chất lượng”, kết hợp 7.x, 8.x, 9.x và 10.x.
7. Viết phần đánh giá chung theo ba lớp: kết quả nổi bật, hạn chế, mức sẵn sàng.
8. Viết kết luận và kiến nghị ngắn, trực tiếp, không lặp toàn bộ thân bài.
9. Đối chiếu ngược với bảng ánh xạ 31 tiêu chí; bổ sung nội dung bị thiếu nhưng không phá vỡ cấu trúc báo cáo.
10. Tái lập sổ tuyên bố–bằng chứng từ bản thảo cuối; không tái sử dụng máy móc sổ của bản trước khi viết.

## Success Criteria

- [ ] Không còn bốn nhãn lặp tại từng tiêu chí.
- [ ] Mỗi mục lớn có câu mở, các đoạn phân tích và câu kết.
- [ ] Kết quả và giới hạn được trình bày trong cùng mạch lập luận, không tách thành phiếu.
- [ ] Người đọc hiểu được mức hoàn thiện chung mà không phải đọc từng mã B1–B12.
- [ ] Không có chức năng hoặc kết quả nào được suy diễn ngoài nguồn.
- [ ] Mỗi tuyên bố về chức năng, số lượng, phiên bản, mức đáp ứng, kết quả thử nghiệm hoặc giới hạn có một bản ghi truy vết tới hiện vật và phương pháp kiểm tra cụ thể.

## Risk Assessment

Hai lỗi dễ xảy ra: đổi nhãn nhưng vẫn giữ cấu trúc cũ; hoặc rút gọn quá mức làm mất giới hạn. Kiểm tra bằng cách đọc riêng thân bài không có phụ lục: nếu vẫn giống checklist hoặc kết luận quá tuyệt đối, phải viết lại.
