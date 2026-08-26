---
phase: 5
title: "Chuẩn hóa hierarchy, TOC và văn phong"
status: completed
priority: P1
effort: "completed 2026-08-26"
dependencies: ["phase-03", "phase-04"]
---

# Phase 5: Chuẩn hóa hierarchy, TOC và văn phong

## Context links

- [Plan index](./plan.md)
- [Phase 2 structure](./phase-02-thit-k-cu-trc-bo-co.md)
- [Phase 4 evidence layout](./phase-04-t-chc-hnh-bng-v-ph-lc.md)
- [Editorial review](./research-editorial-option-b.md)
- [`docs/code-standards.md`](../../docs/code-standards.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-26 | P1 | Completed |

Làm cho phần Option B xuất hiện đúng trong outline/TOC Word, có hệ thống đánh số và văn phong thống nhất với đề cương. Không sửa style dùng chung hoặc nội dung prefix ngoài allowlist.

## Key Insights

- `QC_Title`, `QC_Muc`, `QC_TieuMuc` hiện không có outline level; TOC đầu tài liệu bỏ sót toàn phần.
- Năm mục La Mã/ba phụ lục có thể đọc được nhưng tiểu mục chưa đánh số, gây khó dẫn chiếu.
- Thuật ngữ pha Anh–Việt và hai biến thể “3D thí điểm/4D chưa áp dụng” phải được chuẩn hóa.
- Tên lệnh/URI/identifier giữ nguyên dạng code và giải thích một lần; ngôn ngữ ký duyệt dùng tiếng Việt trước.
- Mọi câu phải giữ giọng candidate kỹ thuật, không biến “pass kỹ thuật” thành chứng nhận.

## Requirements

- Functional: Gán outline level cho tiêu đề, mục, tiểu mục và Phụ lục A–C; TOC tự động hiển thị đúng hierarchy.
- Functional: Đánh số mục ổn định; mã yêu cầu luôn ghi `TC x.y`.
- Functional: Chuẩn hóa caption, numbering, cross-reference, danh mục hình/bảng và viện dẫn [1]–[7].
- Non-functional: Không đổi style dùng chung được sử dụng trước `paraId 606D2659`; tạo/điều chỉnh style có scope QC khi cần.
- Non-functional: Không hard-code số trang hoặc mục lục.

## Architecture

- `QC_Title`: outline level 1 hoặc mức phù hợp vị trí phụ lục trong tài liệu.
- `QC_Muc`: cấp kế tiếp cho I–III và Phụ lục A–C.
- `QC_TieuMuc`: cấp cho II.1–II.10 và tiểu mục phụ lục cần dẫn chiếu.
- TOC lấy các outline level/style QC; caption dùng sequence field; cross-reference dùng bookmark/field thay văn bản số cứng.
- Glossary nội bộ khóa cách viết RC, smoke test, mã băm, tệp nén, route, 2D/3D/4D và thuật ngữ cơ học.

## Related files

- Modify: bản sao làm việc `DeCuongChiTietNop.docx`, style/field/numbering liên quan boundary.
- Preserve: prefix qua `paraId 606D2659`, styles dùng chung của prefix, header/footer relationships, final `sectPr`.
- Inspect: `word/styles.xml`, `word/numbering.xml`, TOC field, bookmarks/cross-references và captions trong package DOCX.
- No manually typed TOC/page-number artifact.

## Steps

1. Chụp baseline style ID, effective formatting, outline level, numbering và TOC field trước mutation.
2. Gán hierarchy QC theo Phase 2 mà không sửa style dùng chung ngoài boundary.
3. Đánh số I–III, II.1–II.10 và Phụ lục A–C; chuẩn hóa `TC x.y`.
4. Chuẩn hóa thuật ngữ Việt–Anh, trạng thái, phiên bản, ngày, số lượng và cách viết 2D/3D/4D.
5. Chuẩn hóa caption, nguồn rút gọn, sequence field, cross-reference và danh mục hình/bảng.
6. Cập nhật field TOC/numbering bằng Word trên bản sao; không nhập tay kết quả field.
7. Kiểm ngắt trang: heading không mồ côi, hình đi với caption, bảng giữ hàng tiêu đề và không tràn lề.
8. So sánh style/field/section trước và sau; rollback mọi thay đổi ngoài allowlist.

## Todo

- [x] Gán outline level cho `QC_Title/QC_Muc/QC_TieuMuc`.
- [x] Đưa toàn phần và Phụ lục A–C vào nguồn TOC; đặt `updateFields=true`.
- [x] Dùng 9 SEQ field + bookmark cho caption; nội dung dẫn chứng bằng IMG ID ổn định.
- [x] Chuẩn hóa thuật ngữ và ngôn ngữ technical-candidate.
- [x] Kiểm bố cục và diff style/section ngoài phạm vi.

## Success Criteria

- [x] Outline nhận diện đủ hierarchy; nguồn TOC đầy đủ, số trang chờ Word cập nhật field.
- [x] Caption không nhập tay số thứ tự; không nhập tay số trang hoặc kết quả TOC.
- [x] Trạng thái 3D/4D dùng một biến thể thống nhất.
- [x] Prefix/style dùng chung/header/footer/final `sectPr` không đổi ngoài allowlist.
- [x] Contact sheet và trang chi tiết không có caption tách hình hoặc bảng tràn lề.

## Risk Assessment

- Sửa style dùng chung có thể đổi toàn tài liệu; dùng style QC có scope và diff effective formatting.
- Word cập nhật field có thể thay pagination/TOC ngoài boundary; chỉ chấp nhận thay đổi field/pagination được ghi trong allowlist.
- Numbering bằng văn bản cứng dễ trôi; dùng numbering/field có kiểm soát.

## Security Considerations

- TOC/cross-reference không được tạo external relationship.
- Không thêm macro, ActiveX, template ngoài hoặc trường tự động truy xuất mạng.
- Xóa metadata tạm và đường dẫn local khỏi field/caption trước bàn giao.

## Next steps

Phase 6 chạy kiểm định nội dung, truy vết, package DOCX, render và Word standalone round-trip trên môi trường mục tiêu.