---
title: "Viết lại phần quy cách theo Option B"
description: "Viết lại tại chỗ phần quy cách thành phụ lục báo cáo kỹ thuật cô đọng, truy vết đủ 31 tiêu chí và B1–B12."
status: in-progress
progress: 96
priority: P1
created: 2026-08-20
updated: 2026-08-26
tags: [docx, bao-cao, bien-tap, option-b]
blockedBy: [word-standalone-roundtrip]
blocks: []
---

# Viết lại phần quy cách theo Option B

## Overview

Option B giữ phần này trong `DeCuongChiTietNop.docx` như **phụ lục báo cáo kỹ thuật của bản ứng viên**, không giả lập một báo cáo hành chính độc lập hoặc quyết định nghiệm thu. Chỉ thay boundary `B512–B633`, từ `paraId 7FE19132` đến `paraId 7FE19654`; giữ nguyên prefix qua `paraId 606D2659` và giữ `sectPr` cuối tài liệu.

Research: [phản biện biên tập](./research-editorial-option-b.md); [trạng thái kỹ thuật](./research-current-state-option-b.md); [independent final review](./independent-final-review.md); [contact sheet 35 trang](./evidence/option-b-contact-sheet-195caea3.png).

## Baseline đã khóa

| Hạng mục | Giá trị |
|---|---|
| Phạm vi hiện tại | 122 khối: 115 đoạn, 7 bảng, 10 chú thích hình; khoảng 7.054 từ |
| Truy vết | 31 mã tiêu chí duy nhất; đủ B1–B12 |
| Mục tiêu dung lượng | 4.585–5.291 từ, giảm 25–35%; mục tiêu điều hành khoảng 4.950 từ |
| Bản ứng viên | `release/2026.08.25-candidate/`, 374 tệp |
| Cổng chấp nhận | 20/24 pass; 3 blocked; Word standalone round-trip not-run |
| Kết quả biên tập | 5.280 từ theo tokenizer baseline, giảm 25,1%; 3 bảng, 6 ảnh đúng tỷ lệ; contact sheet 35 trang gắn DOCX hash |

Ba blocker độc lập: thẩm định học thuật, rà soát khả năng tiếp cận và smoke review bản ứng viên. QTI 3/Common Cartridge chưa có bằng chứng nhập LMS đích; SCORM, xAPI/cmi5 và 4D chưa triển khai; 3D vẫn là thí điểm.

## Quyết định biên tập

- Đổi thể loại/tên theo nội dung thực: phụ lục kết quả rà soát kỹ thuật, không dùng ngôn ngữ “đủ điều kiện nghiệm thu chính thức”.
- Giữ 10 nhóm tiêu chí để dẫn chiếu ngắn; mỗi nhóm dùng mạch kết luận → bằng chứng/phép kiểm → điều kiện đóng.
- Rút Bảng 7 từ 12 xuống 7 cột nhưng giữ đủ 31 hàng, trạng thái, B1–B12 và điều kiện đóng.
- Gán outline level, cập nhật TOC tự động; chuẩn hóa nguồn, viện dẫn, hình đại diện và danh mục hình/bảng.
- Không thay đổi prefix, section/header/footer ngoài allowlist trường TOC/phân trang; không tạo hoặc suy diễn phê duyệt.

## Phases

| # | Phase | Status | Progress | Depends on |
|---|---|---:|---:|---|
| 1 | [Khóa phạm vi và baseline](./phase-01-start.md) | Completed | 100% | — |
| 2 | [Chốt Option B và cấu trúc](./phase-02-thit-k-cu-trc-bo-co.md) | Completed | 100% | 1 |
| 3 | [Viết lại boundary báo cáo](./phase-03-vit-li-ni-dung-bo-co.md) | Completed | 100% | 1, 2 |
| 4 | [Rút gọn bảng, hình, nguồn và phụ lục](./phase-04-t-chc-hnh-bng-v-ph-lc.md) | Completed | 100% | 3 |
| 5 | [Chuẩn hóa hierarchy, TOC và văn phong](./phase-05-chun-ha-vn-phong-v-nh-dng.md) | Completed | 100% | 3, 4 |
| 6 | [Kiểm định bản ứng viên kỹ thuật](./phase-06-kim-nh-v-audit-bn-np.md) | In progress | 95% | 5 |

## Dependencies

`Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6`. Word round-trip là cổng cuối độc lập; thiếu kết quả phải giữ trạng thái not-run/blocked, không thay bằng kiểm tra OpenXML.

## Success criteria

- [x] Chỉ boundary đã khóa thay đổi; prefix qua `606D2659` và `sectPr` cuối giữ nguyên.
- [x] Dung lượng giảm 25,1%; đủ 31 mã duy nhất và B1–B12.
- [x] Outline nhận diện toàn phần/phụ lục; 9 caption dùng SEQ + bookmark; TOC đặt cập nhật field khi Word mở.
- [x] Báo cáo phản ánh đúng candidate `2026.08.25`, 20/24 pass, 3 blocked, Word not-run.
- [x] Search fallback, QTI 3/Common Cartridge và giới hạn LMS/final acceptance được ghi đúng evidence.

## Risks

| Risk | Control |
|---|---|
| Rút gọn mất truy vết | Đối chiếu máy 31 mã, B1–B12 và trạng thái trước/sau |
| Sửa lan ngoài boundary | So sánh XML/paraId và giữ nguyên `sectPr` |
| Kết luận vượt bằng chứng | Khóa sổ tuyên bố–bằng chứng theo acceptance report hiện hành |
| Word chưa chạy | Giữ cổng not-run; không chốt tương thích Word |

## Next step

Chạy Word standalone round-trip trên Office khỏe. Giữ technical candidate cho đến khi Word gate và các gate sản phẩm độc lập có evidence hợp lệ.