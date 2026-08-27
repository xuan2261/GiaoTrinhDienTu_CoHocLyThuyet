---
phase: 4
title: "Dựng PPTX và notes"
status: pending
priority: P1
effort: "high"
dependencies: [phase-02, phase-03]
---

# Phase 4: Dựng PPTX và notes

## Context links

- [Plan](./plan.md)
- [Storyboard](./phase-02-storyboard-design-system.md)
- [Assets](./phase-03-chuan-bi-tai-san.md)
- [PowerPoint skill](../../README.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-27 | P1 | Pending |

Dựng 16 slide bằng PowerPoint-compatible tooling, có notes và metadata nguồn.

## Key Insights

- 13 slide chính phải tự đủ nghĩa không cần demo.
- Notes phải cho phép ba tác giả chia phần và giữ câu chữ an toàn.
- ZIP mismatch làm slide candidate chuyển từ “hash cố định” sang “hash cần khóa lại”.

## Requirements

- Functional: 13 main + 3 backup, 16:9, Vietnamese.
- Functional: Speaker notes nêu mục tiêu, thời gian, lời thoại, source và handoff.
- Functional: Slide backup demo có URL/route và fallback screenshot.
- Non-functional: Web-safe Georgia/Arial; không dependency font ngoài.
- Non-functional: Không text cutoff; không slide placeholder.

## Architecture

Source generator tạo PPTX deterministic từ content model và asset inventory. Layout helpers quản lý title/footer, paper/navy variants, image fit, chart, table, process flow và notes.

## Related files

- `tools/build-acceptance-presentation.js`
- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/`
- `plans/.../research/`

## Implementation Steps

1. Tạo content model 16 slide.
2. Tạo design tokens và layout helpers.
3. Dựng 13 main slides.
4. Dựng 3 backup slides.
5. Thêm notes, alt text, language và metadata.
6. Xuất PPTX và PDF preview.

## Todo

- [ ] Tạo generator và asset inventory.
- [ ] Dựng 13 main slides.
- [ ] Dựng 3 backup slides.
- [ ] Thêm speaker notes/time/source.
- [ ] Xuất PPTX/PDF.

## Success Criteria

- [ ] Deck mở được trong PowerPoint/LibreOffice.
- [ ] Notes đủ cho 15:00 và ba người trình bày.
- [ ] Main deck không phụ thuộc demo.
- [ ] Không claim vượt evidence.

## Risk Assessment

- Notes không tương thích export: giữ thêm `huong-dan-trinh-bay.txt`.
- PDF renderer khác PowerPoint: kiểm PPTX và PDF riêng.

## Security/Integrity Considerations

Không nhúng external link tự động, macro, OLE hoặc remote media.

## Next steps

Phase 5 render thumbnail, kiểm visual/factual và independent review.