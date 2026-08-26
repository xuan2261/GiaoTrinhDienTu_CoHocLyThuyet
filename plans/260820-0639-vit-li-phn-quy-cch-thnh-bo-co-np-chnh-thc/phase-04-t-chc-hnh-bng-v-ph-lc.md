---
phase: 4
title: "Rút gọn bảng, hình, nguồn và phụ lục"
status: completed
priority: P1
effort: "completed 2026-08-26"
dependencies: ["phase-03"]
---

# Phase 4: Rút gọn bảng, hình, nguồn và phụ lục

## Context links

- [Plan index](./plan.md)
- [Phase 3 content rewrite](./phase-03-vit-li-ni-dung-bo-co.md)
- [Editorial review](./research-editorial-option-b.md)
- [`release/2026.08.25-candidate/release-summary.json`](../../release/2026.08.25-candidate/release-summary.json)
- [`data/evidence-registry.json`](../../data/evidence-registry.json)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-26 | P1 | Completed |

Giảm lặp và mật độ thị giác mà không mất truy vết. Bảng 7 vẫn là xương sống 31 tiêu chí; Phụ lục B vẫn là chỉ mục B1–B12; hình chỉ giữ khi chứng minh trực tiếp một kết luận.

## Key Insights

- Bảng 7 hiện 32 × 12, chữ 7 pt; kỹ thuật ngắt trang ổn nhưng không phù hợp đọc/ký duyệt.
- Bảng 2 lặp đường dẫn đã có ở Phụ lục B/Bảng 7; nên bỏ hoặc thay bằng sơ đồ gốc.
- Hình chụp Markdown/`package.json` không phải bằng chứng chính; log/hash candidate hoặc ảnh sản phẩm tái lập tốt hơn.
- Hình 1 lặp thông tin mục lục; có thể giảm từ 10 xuống khoảng 7 hình chức năng đại diện.
- Nguồn hiện thiếu RC/commit, route/tệp, viewport, ngày chụp và mã hồ sơ ảnh nhất quán.

## Requirements

- Functional: Bảng 7 giữ đúng 31 mã duy nhất, đầy đủ trạng thái và viện dẫn B1–B12.
- Functional: Rút Bảng 7 còn 7 cột: Mã; Tiêu chí; Trạng thái; Kết quả; Bằng chứng B; Phép kiểm + kết quả; Điều kiện đóng + chủ trì.
- Functional: Phụ lục A chuẩn hóa 7 tài liệu; Phụ lục B giữ B1–B12; Phụ lục C giữ ma trận 31 hàng.
- Non-functional: Toàn boundary giảm 25–35%; Phụ lục C mục tiêu khoảng 2.280 từ.
- Non-functional: Không dùng ảnh trang trí hoặc một-tiêu-chí–một-hình.

## Architecture

- **Thân bài:** tối đa một bảng tổng hợp ngắn và khoảng 7 hình đại diện.
- **Phụ lục A:** metadata tài liệu (cơ quan, số/năm/phiên bản, URL hoặc nơi lưu, ngày truy cập).
- **Phụ lục B:** B1–B12, mỗi mã một câu chức năng, phiên bản/ngày và phạm vi chứng minh.
- **Phụ lục C/Bảng 7:** 10 hàng tiêu đề nhóm + 31 hàng dữ liệu, 7 cột, không lặp đường dẫn.
- **Danh mục hình/bảng:** caption, candidate/commit, route/tệp, viewport, ngày, evidence ID; thân bài chỉ dùng nguồn rút gọn.

## Related files

- Modify: bản sao làm việc `DeCuongChiTietNop.docx`, trong boundary Phase 1.
- Reuse after provenance check: `tmp-docx-media/`, ảnh chức năng/candidate hiện hành, contact sheet tạm.
- Evidence: `release/2026.08.25-candidate/`, `data/evidence-registry.json`, command captures của plan release-readiness.
- Inspect: tài liệu nguồn của Hướng dẫn 2622/HĐ-QHNT trước khi hoàn tất metadata [7].
- Delete from final boundary: nguồn lặp, ảnh file cấu hình không có giá trị chứng minh; không xóa hiện vật gốc khỏi repo.

## Steps

1. Đối chiếu 31 hàng với sổ claim–evidence và trạng thái hiện hành; ghi decision cho mọi status change.
2. Chuyển Bảng 7 sang 7 cột, dùng hàng tiêu đề nhóm thay cột “Nhóm”, bỏ đường dẫn lặp.
3. Rút mô tả điều kiện chung chung; giữ điều kiện đóng cụ thể, chủ trì và evidence.
4. Rút B1–B12 còn một câu chức năng/mã, giữ phiên bản/ngày/phạm vi.
5. Chuẩn hóa Phụ lục A; bổ sung URL/nơi lưu và cơ quan ban hành khi có nguồn được xác nhận, nếu chưa có thì đánh dấu cần xác minh.
6. Chọn 6 hình chức năng có provenance; loại Hình 1 và ảnh Markdown/`package.json`.
7. Gắn mỗi hình với candidate, route, viewport, ngày và evidence ID; cập nhật dẫn chiếu và danh mục.
8. Kiểm caption, nguồn, liên kết hai chiều và số từ sau rút gọn.

## Todo

- [x] Rút ma trận còn 7 cột, 10 hàng nhóm và 31 hàng dữ liệu.
- [x] Bảo toàn/đối chiếu đủ B1–B12.
- [x] Chuẩn hóa 7 tài liệu nguồn; giữ gap [7] thay vì bịa metadata.
- [x] Dùng 6 hình candidate, loại ảnh không có giá trị chứng minh.
- [x] Gắn provenance đầy đủ và đạt 5.246 từ, giảm 25,6%.

## Success Criteria

- [x] Có đúng 31 mã duy nhất và B1–B12; không có liên kết mồ côi.
- [x] Ma trận 7 cột đọc được trên trang ngang, giữ điều kiện đóng.
- [x] Mỗi hình có route, protocol, viewport, ngày và candidate hash.
- [x] Tài liệu [1]–[7] nhất quán; gap [7] được nêu rõ, không bịa dữ liệu.
- [x] Tổng dung lượng giảm 25,6% so với 7.054 từ.

## Risk Assessment

- Thu hẹp bảng có thể làm mất phép kiểm/giới hạn; gộp trường nhưng không xóa semantics.
- Nguồn Hướng dẫn 2622 có thể chưa xác minh; giữ trạng thái pending thay vì tự điền.
- Ảnh candidate sai phiên bản làm hỏng truy vết; chỉ dùng asset có provenance khớp `2026.08.25`.

## Security Considerations

- Redact tên người dùng, đường dẫn máy, token và chi tiết hệ thống không cần thiết khỏi caption/log.
- Không nhúng tệp ngoài hoặc liên kết theo dõi; ưu tiên ảnh nhúng có hash/evidence ID.
- Không công bố log nội bộ đầy đủ nếu chỉ cần mã capture và kết quả.

## Next steps

Phase 5 áp dụng hierarchy/TOC, numbering, thuật ngữ và bố cục lên nội dung đã ổn định.