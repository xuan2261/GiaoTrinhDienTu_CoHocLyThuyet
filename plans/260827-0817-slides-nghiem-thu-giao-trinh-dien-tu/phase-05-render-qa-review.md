---
phase: 5
title: "Render, QA và review"
status: pending
priority: P1
effort: "high"
dependencies: [phase-04]
---

# Phase 5: Render, QA và review

## Context links

- [Plan](./plan.md)
- [PPTX phase](./phase-04-dung-pptx-va-notes.md)
- [Evidence lock](./phase-01-khoa-bang-chung.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-27 | P1 | Pending |

Kiểm cấu trúc, render, projector readability, factual claims, timing và independent verdict.

## Key Insights

- PPTX validate không bắt lỗi thẩm mỹ; thumbnail grid và trang chi tiết đều cần.
- Reviewer phải kiểm ZIP hash drift, không chỉ layout.
- Slide chính 15:00; backup không tính.

## Requirements

- Functional: Validate PPTX package và slide count.
- Functional: Render PDF/PNG và thumbnail grid 4 cột.
- Functional: Kiểm số liệu/source/claim trên từng slide.
- Functional: Dry-run timing 15:00 bằng notes.
- Non-functional: Projector/grayscale/read order/contrast đạt.

## Architecture

Bốn gate: package → visual → factual/timing → independent review. Finding Critical/High/Medium phải sửa và re-run gate bị ảnh hưởng.

## Related files

- `assets/designs/.../bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx`
- `assets/designs/.../thumbnail-grid.png`
- `data/acceptance-report.json`
- `plans/.../research/*.md`

## Implementation Steps

1. Validate PPTX/PDF opens and slide count.
2. Render 16 PNG + thumbnail grid.
3. Inspect all slides; zoom dense slides.
4. Audit facts, wording and sources.
5. Simulate 15-minute narration.
6. Dispatch independent content and visual reviewers.
7. Fix/re-render/re-review until C/H/M = 0.

## Todo

- [ ] Validate package/slide count.
- [ ] Render 16 slides và grid.
- [ ] Check cutoff/overlap/contrast.
- [ ] Check facts/claims/timing.
- [ ] Independent final review.

## Success Criteria

- [ ] 16/16 slide render đúng.
- [ ] Không cutoff, overlap, placeholder, unreadable chart.
- [ ] 13 slide chính ≤15:00.
- [ ] Reviewer Critical 0, High 0, Medium 0.

## Risk Assessment

- Render engine khác máy Hội đồng: dùng font web-safe và PDF fallback.
- Live demo lỗi: backup screenshot giữ mạch báo cáo.

## Security/Integrity Considerations

Không xuất speaker notes chứa đường dẫn cá nhân hoặc log nhạy cảm.

## Next steps

Phase 6 đóng gói file dùng trình chiếu, PDF và hướng dẫn.