---
phase: 2
title: "Storyboard và design system"
status: pending
priority: P1
effort: "standard"
dependencies: [phase-01]
---

# Phase 2: Storyboard và design system

## Context links

- [Plan](./plan.md)
- [Story research](./research/story-research.md)
- [Design research](./research/design-research.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-27 | P1 | Pending |

Chốt 13 slide chính/15 phút, 3 slide backup và hệ visual “Hồ sơ Hải quân”.

## Key Insights

- Hội đồng cần lập luận nghiệm thu, không cần tour tính năng.
- Slide title phải là kết luận, không là nhãn chủ đề.
- 65–75% nền paper; navy cho bìa/divider/kết luận.
- Không có logo chính thức; dùng wordmark chữ.

## Requirements

- Functional: Tổng time budget chính xác 15:00.
- Functional: Slide 13 chứa quyết nghị đề xuất nguyên văn rút gọn.
- Functional: Backup có demo, Q&A và nguồn/hash.
- Non-functional: 16:9; Georgia heading, Arial body; không dưới 10,5 pt.
- Non-functional: Không gradient/glow/stock/AI imagery.

## Architecture

13 slide chính: bìa; bài toán; phạm vi/tác giả; hành trình học; offline; tương tác; mô phỏng; toàn vẹn nội dung; tiếp cận; candidate/inventory; 20/24; điều kiện đóng; quyết nghị. Backup: demo 90 giây; bảng gate; Q&A/source.

## Related files

- `docs/design-guidelines.md`
- `research/{story-research,design-research,repo-scout}.md`
- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/`

## Implementation Steps

1. Viết one-sentence takeaway mỗi slide.
2. Phân bổ thời lượng 15:00.
3. Chọn archetype và visual cho từng slide.
4. Khóa token màu, type scale, grid và footer.
5. Chốt nội dung backup/demo.

## Todo

- [ ] Chốt 13 title kết luận.
- [ ] Chốt 15:00 time budget.
- [ ] Chốt 3 backup slides.
- [ ] Chốt token và slide archetypes.

## Success Criteria

- [ ] Mỗi slide trả lời một câu hỏi Hội đồng.
- [ ] Không slide nào chứa quá một chart hoặc một luận điểm chính.
- [ ] Quyết nghị và blocker không bị làm nhẹ.

## Risk Assessment

- Quá nhiều tính năng: đẩy chi tiết sang backup.
- Chữ nhỏ: tách slide, không nén.
- Navy quá nặng: giữ tỷ lệ paper chiếm ưu thế.

## Security/Integrity Considerations

Không dùng logo, huy hiệu hoặc ảnh quân sự không có quyền sử dụng.

## Next steps

Phase 3 chuẩn hóa capture, figure và chart data theo storyboard.