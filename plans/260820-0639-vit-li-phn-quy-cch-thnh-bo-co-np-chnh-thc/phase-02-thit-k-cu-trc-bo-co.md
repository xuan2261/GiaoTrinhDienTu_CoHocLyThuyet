---
phase: 2
title: "Chốt Option B và cấu trúc"
status: completed
priority: P1
effort: "completed discovery"
dependencies: ["phase-01"]
---

# Phase 2: Chốt Option B và cấu trúc

## Context links

- [Plan index](./plan.md)
- [Phase 1 baseline](./phase-01-start.md)
- [Editorial review](./research-editorial-option-b.md)
- [`docs/qa-gate-matrix.md`](../../docs/qa-gate-matrix.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-26 | P1 | Completed |

Chốt Option B: giữ phần rà soát trong đề cương như một phụ lục báo cáo kỹ thuật của bản ứng viên. Không nâng nó thành báo cáo hành chính độc lập và không tạo thể thức hoặc chữ ký giả.

## Key Insights

- Tên “Quy cách trình bày” sai thể loại; nội dung thực là kết quả rà soát mức độ đáp ứng.
- Cấu trúc hiện có đủ nền khoa học nhưng outline/TOC không nhận diện các style `QC_*`.
- Phương án rút gọn tốt nhất giữ 10 nhóm tiêu chí ngắn, không gom thành 5 nhóm làm yếu dẫn chiếu `TC x.y`.
- Kết luận an toàn: đủ cơ sở hoàn thiện/đánh giá bản ứng viên kỹ thuật; chưa đủ điều kiện nghiệm thu chính thức.
- Mục tiêu 4.585–5.291 từ; mốc điều hành khoảng 4.950 từ (giảm 29,8%).

## Requirements

- Functional: Có tóm tắt điều hành, phạm vi/phương pháp, kết quả theo 10 nhóm, điều kiện đóng, kiến nghị và Phụ lục A–C.
- Functional: Mỗi nhóm dùng ba ý: kết luận; bằng chứng/phép kiểm; điều kiện còn lại.
- Non-functional: Phân biệt `TC x.y` với số mục báo cáo.
- Non-functional: Giữ ngôn ngữ technical-candidate; không dùng tỷ lệ tiêu chí như bằng chứng đủ điều kiện nghiệm thu.

## Architecture

Hierarchy mục tiêu:

1. Tiêu đề phụ lục: “KẾT QUẢ RÀ SOÁT MỨC ĐỘ ĐÁP ỨNG YÊU CẦU ĐỐI VỚI GIÁO TRÌNH ĐIỆN TỬ”.
2. Tóm tắt điều hành và trạng thái phê duyệt.
3. I. Mục đích, phạm vi, căn cứ, phương pháp và quy tắc trạng thái.
4. II. Kết quả theo 10 nhóm tiêu chí, đánh số II.1–II.10.
5. III. Tổng hợp điều kiện đóng và kiến nghị quyết định.
6. Phụ lục A: căn cứ/tiêu chuẩn; B: B1–B12; C: ma trận 31 tiêu chí.

## Related files

- Modify later: boundary trong `DeCuongChiTietNop.docx`.
- Inspect/update later: Word styles, outline levels, TOC field, caption/numbering definitions.
- Evidence: `data/acceptance-report.json`, `release/2026.08.25-candidate/release-summary.json`.
- No standalone report DOCX is created under Option B.

## Steps

1. Chọn Option B và ghi rõ hệ quả thể loại/phạm vi.
2. Chốt hierarchy, tên phần và sơ đồ đánh số.
3. Phân bổ ngân sách từ theo phản biện: phần chính khoảng 2.270 từ; Phụ lục A/B khoảng 400; Phụ lục C khoảng 2.280.
4. Chốt nguyên tắc 10 nhóm × một đoạn ba ý.
5. Chốt kết luận kỹ thuật có điều kiện và các câu cấm về final acceptance/LMS certification.
6. Chuyển yêu cầu hierarchy/TOC, nguồn/hình và ma trận sang các phase thực thi.

## Todo

- [x] Chọn Option B thay vì báo cáo hành chính độc lập.
- [x] Chốt hierarchy và 10 nhóm tiêu chí.
- [x] Chốt ngân sách giảm 25–35%.
- [x] Chốt ngôn ngữ technical-candidate và kết luận an toàn.
- [x] Chốt vị trí Phụ lục A–C và Bảng 7 bảy cột.

## Success Criteria

- [x] Cấu trúc mục tiêu giải quyết sai lệch thể loại và thiếu TOC/outline.
- [x] Mỗi trong 31 tiêu chí vẫn có chỗ dẫn chiếu rõ.
- [x] Scope không đòi số/ký hiệu, nơi nhận hoặc khối ký của báo cáo độc lập.
- [x] Các phase pending có ranh giới và dependency rõ.

## Risk Assessment

- Tên phụ lục cuối cùng có thể phụ thuộc số thứ tự trong toàn tài liệu; implementation phải dùng numbering/field hiện có thay vì hard-code số.
- Gom quá mạnh làm mất dẫn chiếu; giữ 10 nhóm là guardrail.

## Security Considerations

- Không tạo chữ ký, con dấu, tên người xác nhận hoặc trạng thái phê duyệt không có hồ sơ.
- Không đưa đường dẫn hệ thống cục bộ vào báo cáo; chỉ dùng mã hồ sơ và định danh phát hành đã công khai nội bộ.

## Next steps

Phase 3 viết lại nội dung trong boundary theo hierarchy đã khóa; Phase 4 xử lý ma trận, hình và nguồn.