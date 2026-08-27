---
phase: 3
title: "Chuẩn bị tài sản"
status: pending
priority: P1
effort: "standard"
dependencies: [phase-02]
---

# Phase 3: Chuẩn bị tài sản

## Context links

- [Plan](./plan.md)
- [Repo scout](./research/repo-scout.md)
- [Design system](./phase-02-storyboard-design-system.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-27 | P1 | Pending |

Chọn và chuẩn hóa capture/figure thật, chart data và source captions; không tạo ảnh AI.

## Key Insights

- IMG-01…06 có provenance; IMG-05 chỉ dùng cho slide khoảng trống.
- Figure cơ học phải giữ trục, mũi tên, ký hiệu và màu canonical.
- ZIP hash drift cần một visual so sánh summary vs actual.

## Requirements

- Functional: Tối thiểu 4 capture thật và 1 figure cơ học.
- Functional: Mỗi asset có source path/route/date trong notes.
- Functional: Chart 20/0/3/1 và 7/21/2/1 dùng số tuyệt đối.
- Non-functional: Giữ aspect ratio; không upscale AI; crop không mất nhãn.
- Non-functional: Không đưa đường dẫn cá nhân lên slide.

## Architecture

Asset pipeline: source image → crop/resize bằng ImageMagick/Sharp → PNG trong thư mục deck → kiểm tỷ lệ/độ đọc → nhúng PPTX. Dữ liệu chart lấy trực tiếp từ JSON/DOCX, không gõ lại không kiểm.

## Related files

- `backups/docx-option-b-20260826/captures/img-01…06`
- `release/2026.08.25-candidate/package/images/`
- `data/acceptance-report.json`
- `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/`

## Implementation Steps

1. Copy asset được chọn vào output assets.
2. Chuẩn hóa PNG và kích thước.
3. Tạo chart data JSON từ evidence.
4. Tạo sơ đồ/vector native cho pipeline và gate flow.
5. Lập asset inventory và provenance.

## Todo

- [ ] Chuẩn bị IMG-01/02/03/04/05/06.
- [ ] Chọn figure cơ học canonical.
- [ ] Tạo chart 20/0/3/1 và 7/21/2/1.
- [ ] Tạo visual ZIP hash drift.
- [ ] Kiểm asset provenance/aspect ratio.

## Success Criteria

- [ ] Không asset giả hoặc mơ hồ nguồn.
- [ ] Capture đọc được ở projector.
- [ ] Chart khớp nguồn máy kiểm.

## Risk Assessment

- Capture downsample: hiển thị không vượt kích thước nguồn.
- Screenshot finding bị hiểu là success: dùng caption “điều kiện còn mở”.

## Security/Integrity Considerations

Redact đường dẫn người dùng, token và metadata cá nhân khỏi caption/notes.

## Next steps

Phase 4 dựng deck bằng PPTX source và speaker notes.