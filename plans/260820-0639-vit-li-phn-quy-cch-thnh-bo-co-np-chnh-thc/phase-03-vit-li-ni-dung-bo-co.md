---
phase: 3
title: "Viết lại boundary báo cáo"
status: completed
priority: P1
effort: "completed 2026-08-26"
dependencies: ["phase-01", "phase-02"]
---

# Phase 3: Viết lại boundary báo cáo

## Context links

- [Plan index](./plan.md)
- [Phase 1 baseline](./phase-01-start.md)
- [Phase 2 structure](./phase-02-thit-k-cu-trc-bo-co.md)
- [Editorial review](./research-editorial-option-b.md)
- [`data/acceptance-report.json`](../../data/acceptance-report.json)
- [`README.md`](../../README.md)

## Overview

| Date | Priority | Status |
|---|---|---|
| 2026-08-26 | P1 | Completed |

Viết mới nội dung Option B trong đúng boundary `B512–B633`. Kết quả phải đọc như phụ lục báo cáo kỹ thuật cô đọng, không phải 31 phiếu kiểm kê và không phải báo cáo hành chính độc lập.

## Key Insights

- Candidate `2026.08.25` là bản ứng viên kỹ thuật, chưa phải bản được nghiệm thu.
- Acceptance report: 20/24 pass, 3 blocked (`academic-review-currentness`, `accessibility-independent-review`, `release-independent-smoke`), Word `word-standalone-roundtrip` not-run.
- Tìm kiếm toàn văn đã tồn tại và phải thay tuyên bố cũ nói chưa có.
- QTI 3 và Common Cartridge 1.4 đã có adapter/gói kiểm tra cục bộ; chưa có target LMS hoặc bằng chứng import, nên không được gọi là tích hợp LMS thành công.
- SCORM, xAPI/cmi5 và 4D chưa triển khai; 3D là pilot kỹ thuật.

## Requirements

- Functional: Viết tóm tắt, phương pháp, 10 nhóm kết quả, điều kiện đóng và kiến nghị theo hierarchy Phase 2.
- Functional: Giữ 31 mã tiêu chí duy nhất và liên kết tới B1–B12; cập nhật mọi claim theo evidence hiện hành.
- Functional: Ghi rõ mọi thay đổi trạng thái so với baseline, nguồn và người/điều kiện xác nhận; không đổi trạng thái chỉ vì sửa câu.
- Non-functional: Tổng toàn boundary sau Phase 4 nằm trong 4.585–5.291 từ.
- Non-functional: Tiếng Việt hành chính–học thuật, thuật ngữ kỹ thuật giải thích ở lần đầu, không dùng giọng quảng bá.

## Architecture

Mỗi nhóm tiêu chí là một đơn vị lập luận ba phần:

1. **Kết luận có phạm vi:** sản phẩm/candidate làm được gì.
2. **Bằng chứng:** mã B, phép kiểm, phiên bản/ngày và kết quả quan sát.
3. **Điều kiện đóng:** reviewer/gate nào còn thiếu và câu kết luận tối đa được phép.

Sổ claim–evidence là nguồn kiểm soát câu chữ; ma trận 31 tiêu chí là lớp kiểm soát đầy đủ, không phải thân bài thứ hai.

## Related files

- Modify: bản sao làm việc của `DeCuongChiTietNop.docx`, chỉ `B512–B633` / `7FE19132…7FE19654`.
- Preserve: prefix qua `paraId 606D2659`; final `sectPr`.
- Evidence: `data/acceptance-report.json`, `data/evidence-registry.json`, `data/search-index.json`, `data/lms-targets.json`, `release/2026.08.25-candidate/`.
- Reference: `README.md`, `docs/academic-certification.md`, `docs/qa-gate-matrix.md`.
- No file creation beyond temporary working/render artifacts.

## Steps

1. Tạo bản sao làm việc và xác nhận lại hai `paraId` biên trước mutation.
2. Dựng skeleton hierarchy và chèn nội dung mới chỉ trong boundary.
3. Viết tóm tắt: candidate, 20/24 pass, 3 blocked, Word not-run, quyết định chưa đủ final acceptance.
4. Viết mục phương pháp và quy tắc trạng thái; tách “không áp dụng theo phạm vi”, “chưa triển khai”, “chưa đánh giá/blocked”.
5. Viết 10 nhóm tiêu chí theo mẫu ba phần, dùng `TC x.y` để dẫn chiếu.
6. Cập nhật các claim tìm kiếm toàn văn, QTI 3/Common Cartridge, LMS, SCORM/xAPI/cmi5, 3D/4D theo phạm vi bằng chứng.
7. Viết điều kiện đóng và kiến nghị: hoàn thiện/review candidate, không nghiệm thu chính thức.
8. Đối chiếu sổ claim–evidence; hạ hoặc bỏ câu không có hiện vật, phiên bản và phép kiểm.
9. Kiểm số từ sơ bộ, loại lặp giữa tóm tắt, kết quả và ma trận.

## Todo

- [x] Tạo bản sao làm việc và guard boundary.
- [x] Viết tóm tắt/phương pháp/10 nhóm/điều kiện đóng.
- [x] Cập nhật claim search và QTI 3/Common Cartridge theo evidence runtime.
- [x] Ghi đúng 20/24, 3 blocked, Word not-run.
- [x] Hoàn tất sổ claim–evidence và kiểm ngân sách 5.280 từ bằng tokenizer baseline.

## Success Criteria

- [x] Không còn chuỗi bốn nhãn kiểm kê lặp theo 31 tiêu chí.
- [x] Mỗi nhóm có kết luận, bằng chứng/phép kiểm và điều kiện đóng.
- [x] Search được mô tả đúng: chỉ mục có, runtime capture còn fallback.
- [x] Không có claim import LMS, chứng nhận LMS hoặc final acceptance.
- [x] Mọi thay đổi trạng thái kỹ thuật có evidence và điều kiện chủ trì xác nhận.
- [x] Diff XML ngoài boundary bằng rỗng.

## Risk Assessment

- Claim mới có thể mạnh hơn evidence: ràng buộc mức diễn đạt bằng `acceptance-report.json` và `lms.scope`.
- Rewrite trực tiếp có thể phá relationship/style: thao tác trên bản sao và so sánh package trước/sau.
- Giảm từ sớm có thể làm mất điều kiện đóng: ưu tiên bảo toàn claim–evidence rồi cắt câu lặp.

## Security Considerations

- Không nhúng log thô có đường dẫn cá nhân, token hoặc metadata reviewer.
- Không tạo hyperlink/macro/relationship ngoài; ảnh và nguồn phải là hiện vật nội bộ được kiểm soát.
- Không giả chữ ký hoặc danh tính người xác nhận độc lập.

## Next steps

Bàn giao bản nháp boundary và sổ claim–evidence cho Phase 4 để rút Bảng 7, chọn hình và chuẩn hóa nguồn.