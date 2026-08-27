---
phase: 6
title: "Đóng gói bàn giao"
status: pending
priority: P1
effort: "standard"
dependencies: [phase-05]
---

# Phase 6: Đóng gói bàn giao

## Context links

- [Plan](./plan.md)
- [QA phase](./phase-05-render-qa-review.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-27 | P1 | Pending |

Bàn giao deck, PDF, thumbnail, notes và hướng dẫn trình bày; không gộp vào candidate ZIP.

## Key Insights

- PPTX là file chỉnh sửa/trình chiếu chính; PDF là fallback.
- Guide phải chỉ rõ slide main/backup, phân công ba tác giả và demo 90 giây.
- Deck không sửa candidate ZIP hoặc acceptance evidence.

## Requirements

- Functional: Có PPTX, PDF, thumbnail grid và guide TXT.
- Functional: Guide có kiểm tra máy chiếu, font, offline demo và phương án lỗi.
- Functional: Ghi hash các deliverable.
- Non-functional: Tên file kebab-case, không timestamp trong tên dùng cuối.
- Non-functional: Không package tài sản thừa hoặc source tạm.

## Architecture

Output tự chứa trong `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/`; source generator nằm `tools/`; evidence/plan nằm `plans/`.

## Related files

- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/`
- `tools/build-acceptance-presentation.js`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/`

## Implementation Steps

1. Xóa artifact tạm khỏi output.
2. Tính SHA-256 deliverables.
3. Viết hướng dẫn trình bày và demo dự phòng.
4. Mở PPTX/PDF lần cuối.
5. Cập nhật plan/review status.

## Todo

- [ ] Đóng gói 4 deliverables.
- [ ] Ghi hash và slide count.
- [ ] Viết guide cho ba tác giả.
- [ ] Final smoke mở PPTX/PDF.
- [ ] Cập nhật plan status.

## Success Criteria

- [ ] Người dùng biết file nào để trình chiếu.
- [ ] PDF fallback giống PPTX.
- [ ] Demo không phụ thuộc internet.
- [ ] Output sạch, hash xác định.

## Risk Assessment

- Copy nhầm backup slide vào luồng chính: guide ghi rõ 1–13 main, 14–16 backup.
- Dùng ZIP mismatch trong demo: demo từ `package/`, không phân phối ZIP như hash-locked artifact.

## Security/Integrity Considerations

Không nhúng macro, credential, external media hoặc thông tin cá nhân ngoài danh sách tác giả đã công bố.

## Next steps

Bàn giao cho nhóm tác giả dry-run; chỉ commit/push khi người dùng yêu cầu.