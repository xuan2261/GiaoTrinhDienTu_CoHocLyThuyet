---
title: "Slides báo cáo nghiệm thu Giáo trình điện tử Cơ học lý thuyết"
description: "Deck 15 phút xin Hội đồng Khoa học Khoa KTCS thông qua có điều kiện."
status: completed
progress: 100
priority: P1
created: 2026-08-27
updated: 2026-08-27
tags: [pptx, nghiem-thu, hoc-vien-hai-quan, co-hoc-ly-thuyet]
blockedBy: [release-zip-hash-drift]
---

# Slides báo cáo nghiệm thu Giáo trình điện tử Cơ học lý thuyết

## Overview

Deck 16:9, tiếng Việt, 13 slide chính đúng 15 phút và 3 slide phụ lục/demo dự phòng. Mục tiêu: đề nghị Hội đồng Khoa học Khoa Kỹ thuật cơ sở thông qua có điều kiện về mặt khoa học–sư phạm; không gọi candidate hiện tại là bản phát hành cuối.

## Decisions

- Bìa ghi ba tác giả; không tự dựng logo khi chưa có asset chính thức.
- Mạch kể: nhu cầu → giá trị học tập → bằng chứng → giới hạn → quyết nghị.
- Art direction “Hồ sơ Hải quân”: paper/navy/gold, Georgia + Arial, capture thật.
- Không demo trong ngân sách 15 phút; 3 slide backup dùng khi Hội đồng yêu cầu.
- Nêu thẳng 20 pass, 0 fail, 3 blocked, 1 not-run và ZIP hash drift.

## Outputs

- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx`
- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pdf`
- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/thumbnail-grid.png`
- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/huong-dan-trinh-bay.txt`

## Phases

| # | Phase | Status | Progress | Depends on |
|---|---|---:|---:|---|
| 1 | [Khóa bằng chứng](./phase-01-khoa-bang-chung.md) | Completed | 100% | — |
| 2 | [Storyboard và design system](./phase-02-storyboard-design-system.md) | Completed | 100% | 1 |
| 3 | [Chuẩn bị tài sản](./phase-03-chuan-bi-tai-san.md) | Completed | 100% | 2 |
| 4 | [Dựng PPTX và notes](./phase-04-dung-pptx-va-notes.md) | Completed | 100% | 2, 3 |
| 5 | [Render, QA và review](./phase-05-render-qa-review.md) | Completed | 100% | 4 |
| 6 | [Đóng gói bàn giao](./phase-06-dong-goi-ban-giao.md) | Completed | 100% | 5 |

## Dependencies

`Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6`.

## Success criteria

- [x] 13 slide chính trình bày trong 15:00; 3 slide backup không tính thời lượng.
- [x] Mọi số liệu có nguồn; không tuyên bố final release, WCAG hoặc LMS compatibility.
- [x] ZIP hash mismatch được trình bày như điều kiện đóng, không che giấu.
- [x] Không text cutoff/overlap; body ≥15 pt, chart/table ≥12 pt, caption ≥10,5 pt.
- [x] PPTX mở được; PDF/thumbnail khớp; speaker notes đủ cho ba tác giả.
- [x] Independent review: Critical 0, High 0, Medium 0.

## Risks

- ZIP hiện tại `b3e4f359…` khác summary/evidence `6b48834f…`; cấm gọi hash-locked RC.
- Ba gate review độc lập và Word round-trip chưa đóng; chỉ đề nghị thông qua có điều kiện.
- Không có logo chính thức; dùng wordmark chữ, không phát minh biểu trưng.

## Next step

Nhóm tác giả sử dụng bộ file bàn giao để tập dượt báo cáo 15 phút.