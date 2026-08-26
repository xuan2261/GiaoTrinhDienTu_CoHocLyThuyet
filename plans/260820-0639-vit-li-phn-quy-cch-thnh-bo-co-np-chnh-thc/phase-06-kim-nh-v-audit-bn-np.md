---
phase: 6
title: "Kiểm định bản ứng viên kỹ thuật"
status: in-progress
priority: P1
effort: "75%; blocked by Word round-trip and independent final review"
dependencies: ["phase-05"]
---

# Phase 6: Kiểm định bản ứng viên kỹ thuật

## Context links

- [Plan index](./plan.md)
- [Phase 5 hierarchy/TOC](./phase-05-chun-ha-vn-phong-v-nh-dng.md)
- [Editorial review](./research-editorial-option-b.md)
- [`data/acceptance-report.json`](../../data/acceptance-report.json)
- [`docs/qa-gate-matrix.md`](../../docs/qa-gate-matrix.md)
- [`docs/academic-certification.md`](../../docs/academic-certification.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-26 | P1 | In progress |

Xác nhận bản sửa đạt bốn lớp: boundary toàn vẹn, nội dung/truy vết đúng, hierarchy/bố cục đọc được và Word round-trip trên môi trường mục tiêu. Cổng Word hiện not-run nên kế hoạch không được kết thúc bằng tuyên bố tương thích Word trước khi cổng thực sự chạy đạt.

## Key Insights

- OpenXML hợp lệ không chứng minh Word mở–cập nhật field–lưu–mở lại đúng.
- Candidate hiện hành vẫn blocked: 20/24 pass, 3 blocked, Word not-run; rewrite báo cáo không tự đóng các gate sản phẩm.
- Audit phải bắt các claim stale: tìm kiếm toàn văn đã có; QTI 3/Common Cartridge có adapter/package local; không có import LMS; SCORM/xAPI/cmi5/4D chưa triển khai; 3D là pilot.
- Mục tiêu rút gọn và truy vết là machine-checkable: 4.585–5.291 từ, 31 mã duy nhất, đủ B1–B12.

## Requirements

- Functional: So sánh XML/package ngoài boundary, prefix, final `sectPr`, styles, relationships và header/footer.
- Functional: Kiểm số từ, 31 mã, B1–B12, claim–evidence, nguồn/hình và TOC/outline.
- Functional: Render toàn tài liệu và kiểm các trang có bảng dài/hình/phụ lục.
- Non-functional: Word standalone round-trip phải chạy trên đúng build/môi trường mục tiêu; nếu không chạy/timeout thì giữ not-run/blocked.
- Non-functional: Reviewer độc lập dùng rubric cố định; không phải tác giả trực tiếp tự chấp nhận.

## Architecture

Sáu cổng theo thứ tự:

1. **Boundary/package:** diff ngoài `B512–B633` bằng rỗng trừ allowlist field/pagination.
2. **Nội dung:** thể loại Option B, technical-candidate, không lặp/checklist.
3. **Truy vết:** 31 tiêu chí, B1–B12, trạng thái và claim–evidence.
4. **Hierarchy/visual:** outline, TOC, caption, nguồn, hình/bảng, contact sheet.
5. **Word:** mở, update fields, lưu, đóng, mở lại, repaginate và render.
6. **Independent audit:** severity, vị trí, xử lý, recheck và quyết định.

## Related files

- Verify: bản sao làm việc/final candidate của `DeCuongChiTietNop.docx`.
- Compare against: `DeCuongChiTietNop.docx` baseline và boundary metadata Phase 1.
- Evidence: `data/acceptance-report.json`, `data/evidence-registry.json`, `release/2026.08.25-candidate/`.
- Temporary only: extracted package diff, rendered pages/contact sheet, audit checklist and Word round-trip output.
- Do not modify product release or QA data to make the report pass.

## Steps

1. Kiểm package/DOCX schema và diff XML ngoài boundary; xác nhận prefix qua `606D2659` và final `sectPr` giữ nguyên.
2. Tìm toàn văn các nhãn lặp/câu cấm và claim stale; đọc liên tục tóm tắt → kết quả → điều kiện đóng.
3. Đếm từ; kiểm 31 mã unique, B1–B12, status/evidence joins và mọi thay đổi trạng thái có decision.
4. Kiểm outline/TOC, numbering, captions, cross-references, nguồn [1]–[7], danh mục hình/bảng.
5. Render contact sheet; review trang mở đầu, Bảng 7, hình lớn, kết luận và Phụ lục A–C.
6. Chạy Word standalone round-trip trên build mục tiêu; ghi stage, thời gian, output path, reopen/repagination/render result.
7. Thực hiện audit độc lập; sửa mọi Critical/High/Medium và chạy lại các cổng bị ảnh hưởng.
8. Cập nhật acceptance note: giữ nguyên 20/24, 3 blocked và Word result thực tế; không tự đóng gate độc lập.
9. Chỉ thay nguồn chuẩn khi bản sao đạt tất cả cổng tài liệu và có rollback/checksum.

## Todo

- [x] Diff boundary/package và kiểm vùng bất biến.
- [x] Kiểm nội dung, 5.246 từ, 31 tiêu chí, B1–B12 và claims hiện hành.
- [x] Kiểm outline/TOC, nguồn/hình/bảng và render 36 trang.
- [ ] Chạy Word standalone round-trip trên môi trường mục tiêu.
- [ ] Hoàn tất audit độc lập và recheck lỗi.

## Success Criteria

- [x] Chỉ boundary/allowlist thay đổi; prefix và final `sectPr` giữ nguyên.
- [x] Dung lượng giảm 25,6%; đủ 31 mã duy nhất và B1–B12.
- [x] Outline/TOC source và bố cục toàn tài liệu đạt kiểm tra trực quan.
- [x] Claim candidate/search/QTI/CC/LMS/3D/4D khớp evidence hiện hành.
- [ ] Word round-trip chạy đạt; hiện vẫn not-run.
- [ ] Audit độc lập không còn Critical/High/Medium.

## Risk Assessment

- Word có thể timeout hoặc thay pagination; ghi stage và giữ blocker thay vì dùng công cụ khác thay thế.
- Một sửa visual cuối có thể phá boundary/truy vết; mọi sửa phải chạy lại cổng liên quan.
- Rewrite report có thể bị hiểu là closing gate; acceptance status chỉ đổi từ evidence của đúng gate owner.

## Security Considerations

- Chạy Word trên bản sao trong thư mục kiểm soát; không mở macro hoặc external links.
- Redact đường dẫn người dùng và metadata cá nhân khỏi evidence bàn giao.
- Giữ checksum baseline/final; không ghi đè artifact candidate hoặc log acceptance hiện có.

## Next steps

Nếu tất cả cổng tài liệu đạt, bàn giao bản candidate và audit checklist cho chủ nhiệm/independent reviewers; ba gate độc lập còn blocked chỉ được đóng bởi đúng chủ thể.