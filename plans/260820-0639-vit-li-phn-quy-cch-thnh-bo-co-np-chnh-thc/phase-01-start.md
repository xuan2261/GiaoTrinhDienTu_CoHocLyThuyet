---
phase: 1
title: "Khóa phạm vi và baseline"
status: completed
priority: P1
effort: "completed discovery"
dependencies: []
---

# Phase 1: Khóa phạm vi và baseline

## Context links

- [Plan index](./plan.md)
- [Editorial review](./research-editorial-option-b.md)
- [`README.md`](../../README.md)
- [`data/acceptance-report.json`](../../data/acceptance-report.json)
- [`release/2026.08.25-candidate/release-summary.json`](../../release/2026.08.25-candidate/release-summary.json)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-26 | P1 | Completed |

Khóa phạm vi thay thế và hiện trạng kỹ thuật trước khi biên tập. Discovery hoàn thành bằng phản biện định lượng, acceptance report hiện hành và boundary do chủ nhiệm giao.

## Key Insights

- Chỉ thay `B512–B633`, từ `paraId 7FE19132` đến `paraId 7FE19654`.
- Giữ nguyên mọi nội dung qua `paraId 606D2659` và `sectPr` cuối tài liệu.
- Baseline phần đích: 122 khối, 115 đoạn, 7 bảng, 10 chú thích hình, khoảng 7.054 từ.
- Bảng 7 có 31 mã duy nhất; Phụ lục B có đủ B1–B12 và ma trận viện dẫn đủ 12 mã.
- Candidate hiện hành là `2026.08.25`; acceptance report ghi 20/24 pass, 3 blocked, 1 not-run (Word).

## Requirements

- Functional: Mọi thay đổi nằm trong boundary đã khóa; không sửa prefix hoặc `sectPr`.
- Functional: Duy trì sổ kiểm 31 tiêu chí, B1–B12, trạng thái, nguồn và vị trí cuối.
- Non-functional: Không chỉnh sửa nội dung chuyên môn hoặc phát hành tính năng mới.
- Non-functional: Không suy diễn phê duyệt, chứng nhận hoặc kết quả kiểm thử chưa có.

## Architecture

Dùng ba lớp kiểm soát: (1) boundary XML/paraId; (2) baseline nội dung và truy vết; (3) baseline kỹ thuật từ candidate/acceptance report. Bản sửa sau này phải đi qua phép so sánh boundary, thống kê nội dung và sổ tuyên bố–bằng chứng trước khi render.

## Related files

- Modify later: `DeCuongChiTietNop.docx` trên bản sao làm việc.
- Preserve: prefix qua `paraId 606D2659`, final `sectPr`.
- Evidence: `data/acceptance-report.json`, `data/qa-gates.json`, `release/2026.08.25-candidate/`.
- Review input: `research-editorial-option-b.md`, `research-current-state-option-b.md`.
- No new production files required.

## Steps

1. Xác nhận boundary bắt đầu/kết thúc bằng block index và `paraId`.
2. Ghi số khối, đoạn, bảng, chú thích, từ, 31 mã và B1–B12.
3. Khóa candidate và acceptance summary hiện hành.
4. Ghi allowlist duy nhất: thay boundary; cập nhật trường TOC/phân trang ở Phase 5 nếu cần.
5. Ghi rollback path: luôn thao tác trên bản sao, giữ `DeCuongChiTietNop.docx` nguồn đến cổng cuối.

## Todo

- [x] Ghi boundary `B512–B633` và hai `paraId` biên.
- [x] Ghi phạm vi preserve qua `606D2659` và final `sectPr`.
- [x] Xác nhận 31 tiêu chí duy nhất và B1–B12.
- [x] Xác nhận candidate `2026.08.25` và gate summary 20/24, 3 blocked, Word not-run.
- [x] Ghi baseline dung lượng và cấu trúc.

## Success Criteria

- [x] Phạm vi thay thế và vùng bất biến có định danh máy kiểm được.
- [x] Baseline định lượng đủ để đo mục tiêu giảm 25–35%.
- [x] Baseline truy vết và kỹ thuật phản ánh dữ liệu ngày 2026-08-25/26.
- [x] Không cần chỉnh DOCX để hoàn thành discovery.

## Risk Assessment

- Boundary lệch một block có thể xóa nội dung ngoài phạm vi; giảm thiểu bằng kiểm đồng thời block index và `paraId`.
- Acceptance report có thể thay đổi sau này; implementation phải khóa hash/mtime hoặc chụp lại số liệu trước khi viết.

## Security Considerations

- Không đưa đường dẫn người dùng, log nội bộ hoặc metadata cá nhân vào nội dung ký duyệt.
- Không bật macro, liên kết ngoài tự động hoặc nội dung nhúng không kiểm soát trong DOCX.
- Giữ bản gốc và checksum để phát hiện sửa ngoài phạm vi.

## Next steps

Phase 2 dùng baseline này để chốt Option B, hierarchy và ngân sách từ; mọi thay đổi phạm vi phải quay lại Phase 1.