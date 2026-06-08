# Phase 05 — Tổng hợp triage report 3 trục (35 route)

**Plan:** [plan.md](plan.md) · **TDD:** không (tổng hợp) · **Status:** ✅ done · **Blocked by:** P2, P3, P4

## Context Links
- P2/P3 `visuals/interaction-probe.json` (probeA + probeB)
- P4 `visuals/visual-review-notes.md` + contact-sheet + test:sim:physics log
- P0 `research/sim-probe-route-map.json` (a-only/skip reasons)

## Overview
**Priority:** cao (deliverable cuối). Gom 3 trục thành 1 báo cáo triage: mỗi route 1 dòng, severity, bằng chứng. CHỈ báo cáo — user tự quyết sửa.

## Key Insights
- 3 trục: visual (P4), physics/nhãn (P4 + test:sim:physics), tương tác (P2 A + P3 B).
- Route `bSkipped` (a-only/sim3-no-readout) **phải xuất hiện** với lý do — user chốt B cho 35, không khả thi phải minh bạch.
- Severity rõ: high = lỗi chức năng (control chết, dấu sai, nhãn chồng, physics fail); low = polish/gu (dead-space, gradient nhạt).

## Requirements
**Functional:** `reports/sim-fullquality-triage-report.md`: bảng 35 route × {visual, physics/nhãn, tương tác A, tương tác B} + severity + link ảnh + ghi chú. Section đầu: tổng quan high-findings. Section cuối: unresolved questions.
**Non-functional:** đọc lướt được; high-findings nổi bật đầu báo cáo.

## Architecture
```
reports/sim-fullquality-triage-report.md
├── Tóm tắt: N high, M low, danh sách route high trước
├── Bảng 35 route × 3 trục (4 cột đánh giá)
├── Chi tiết high-findings (route, trục, bằng chứng, gợi ý hướng — KHÔNG sửa)
├── Route bSkipped + lý do
└── Unresolved questions
```

## Related Code Files
**Đọc:** interaction-probe.json, visual-review-notes.md, route-map.json, physics log.
**Tạo:** `reports/sim-fullquality-triage-report.md`.
**KHÔNG:** sửa bất kỳ sim/code nào.

## Implementation Steps
1. Parse `interaction-probe.json` → trục 3 (A liveness, B sign) per route.
2. Đọc `visual-review-notes.md` → trục 1 + trục 2 visual.
3. Map `test:sim:physics` kết quả → trục 2 nền tảng.
4. Gán severity mỗi cell (high/low/ok) theo rule rõ.
5. Sắp route high lên đầu; viết chi tiết high-findings + bằng chứng.
6. Liệt kê bSkipped + lý do; gom unresolved questions.
7. Cross-check: tổng route = 35; mỗi route đủ 4 cột.

## Todo List
- [ ] Parse probe JSON
- [ ] Gom visual notes
- [ ] Map physics log
- [ ] Gán severity 35×4
- [ ] Chi tiết high-findings
- [ ] bSkipped + unresolved
- [ ] Cross-check 35 đủ cột

## Success Criteria
35/35 route đủ 4 cột + severity + bằng chứng; high-findings có gợi ý hướng (không phải patch); báo cáo mở đọc rành mạch; KHÔNG có file sim nào bị sửa.

## Risk Assessment
- Severity không nhất quán → định nghĩa rule cụ thể trước khi gán (high = chức năng hỏng; low = thẩm mỹ).
- Mất route khi merge 3 nguồn → cross-check count = 35 bắt buộc.
- Cám dỗ "sửa luôn" → vi phạm scope. Chỉ ghi hướng đề xuất.

## Security Considerations
Không.

## Next Steps
Bàn giao user duyệt. Nếu user muốn sửa → brainstorm/plan round mới (ngoài scope này). Docs drift README 6→10 Sim3 ghi nhận để docs-manager sync sau.
