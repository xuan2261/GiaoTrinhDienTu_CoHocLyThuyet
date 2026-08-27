---
phase: 1
title: "Khóa bằng chứng"
status: completed
priority: P1
effort: "completed research"
dependencies: []
---

# Phase 1: Khóa bằng chứng

## Context links

- [Plan](./plan.md)
- [Repo scout](./research/repo-scout.md)
- [Story research](./research/story-research.md)
- [Design research](./research/design-research.md)
- [`DeCuongChiTietNop.docx`](../../DeCuongChiTietNop.docx)
- [`data/acceptance-report.json`](../../data/acceptance-report.json)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-27 | P1 | Completed |

Khóa đối tượng, tác giả, phạm vi, số liệu và ranh giới claim trước khi viết slide.

## Key Insights

- Đối tượng: học viên sĩ quan cấp phân đội, trình độ đại học.
- Ba chương: Tĩnh học, Động học, Động lực học.
- Ba tác giả: Nguyễn Lê Văn, Đinh Văn Tứ, Bùi Thanh Xuân.
- Sản phẩm: 3 chương, 21 phần, 75 tiểu mục, 300 câu hỏi, 25 Sim2, 10 Sim3 pilot, PDF 139 trang.
- Acceptance: 20 pass, 0 fail, 3 blocked, 1 not-run; overall blocked.
- ZIP hiện tại khác hash summary/evidence; đây là blocker mới.

## Requirements

- Functional: Mọi số liệu slide có source path trong notes.
- Functional: Phân biệt PASS hồ sơ Option B với gate sản phẩm còn mở.
- Non-functional: Không dùng tỷ lệ pass như điểm chất lượng.
- Non-functional: Không tuyên bố WCAG, LMS, 4D hoặc final release.

## Architecture

Sổ facts gồm bốn lớp: nguồn học thuật → candidate/package → acceptance/evidence → independent DOCX review. Khi nguồn xung đột, dùng trạng thái thận trọng hơn.

## Related files

- `DeCuongChiTietNop.docx`
- `release/2026.08.25-candidate/`
- `data/{acceptance-report,lms-targets,evidence-registry}.json`
- `plans/260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc/`

## Implementation Steps

1. Đọc thông tin tác giả và đối tượng từ DOCX.
2. Đếm nội dung/câu hỏi/mô phỏng từ manifest và route maps.
3. Đọc gate states và claim limits.
4. So sánh hash thực tế với summary/evidence.
5. Chốt thông điệp: xin thông qua có điều kiện.

## Todo

- [x] Khóa tác giả, đơn vị, đối tượng.
- [x] Khóa số liệu nội dung và tương tác.
- [x] Khóa gate states và giới hạn claim.
- [x] Xác minh ZIP hash drift.

## Success Criteria

- [x] Facts có nguồn cụ thể.
- [x] Không còn assumption về final release.
- [x] Hash drift trở thành điều kiện đóng.

## Risk Assessment

- Release summary stale: không dùng hash cũ như bằng chứng hiện tại.
- Runtime screenshot có finding: dùng ở slide giới hạn, không dùng làm success claim.

## Security/Integrity Considerations

Không đưa log thô, đường dẫn người dùng hoặc metadata cá nhân lên slide.

## Next steps

Phase 2 chuyển facts đã khóa thành storyboard 13+3 slide.