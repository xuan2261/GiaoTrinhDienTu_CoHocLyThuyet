---
title: "Phase 4: Chứng nhận công thức, hình và nội dung học thuật"
status: pending
priority: P0
effort: "5-10 ngày kỹ thuật + thời gian SME review"
dependencies: [phase-02, phase-03]
---

# Phase 4: Chứng nhận công thức, hình và nội dung học thuật

## Overview

Bổ sung ledger/review record độc lập, gắn hash và re-review trigger lên pipeline equation/image đã có. Automation xác nhận bằng chứng hiện hành; SME xác nhận đúng học thuật.

## Requirements

- Mỗi equation/image/content item có stable ID, source/output hash, route/source ref, technical status và academic status.
- `accepted` chỉ hợp lệ khi có independent review record đúng scope/hash; vai trò/đơn vị reviewer là đủ trừ khi quy trình yêu cầu danh tính/chữ ký.
- Mọi thay đổi source/mapping/alt/caption/output hash làm review record stale.
- Verifier phải in rõ: PASS kỹ thuật không tương đương đúng học thuật.
- Ledger/review records append-only hoặc có `supersedes`; không ghi đè lịch sử quyết định.

## Architecture

Generated observations (`equation_report`, `image_mapping`, content manifest) được join với curated `academic_review_ledger.json` và `academic_signoffs.json`. `tools/academic_review.py` là read-only verifier; reviewer artifacts nằm ngoài generated pipeline.

## Related Code Files

- Reuse: `tools/extract_docx.py`, `tools/audit.py`, `tools/validate_equation_mapping.py`, `tools/equation_report.json`, `tools/image_mapping.json`.
- Curated existing: `data/equation_mapping.json`, `data/equation_manual_reviews.json`, `data/image_alt_overrides.json`.
- Create: `data/academic_review_ledger.json`, `data/academic_signoffs.json`, `tools/academic_review.py`, `tests/test_academic_review_ledger.py`, `docs/academic-certification.md`.

## Tests Before

1. Prove technical strict equation/image gates pass without an academic review record.
2. Show changing an equation mapping or image alt currently does not invalidate an external review.
3. Create fixture where `technicalStatus=pass` but no academic review record; require RED.

## Implementation Steps

1. **RED:** tests for stale source/output hashes, missing reviewer role, unknown evidence, duplicate/conflicting review and technical-pass overclaim.
2. Define ledger item and review schemas: reviewer role/affiliation, optional identity, decision, scope hash, evidence refs, `supersedes`.
3. Generate stable item inventory from Phase 2 manifest + equation/image reports.
4. Implement hash binding and re-review invalidation rules.
5. Produce equation contact sheets/source-vs-render views and image alt/caption/context review packets.
6. Execute SME review; record actual decision, reviewer role/unit and unresolved items. Record personal identity only when the institution requires it.
7. **GREEN:** accepted records validate only with current source/output and an independent review record.
8. **Refactor:** keep review tool read-only; generated pipeline never writes curated decisions.

## Tests After

- Existing equation/image pipeline unit tests and `npm run test:audit:strict`.
- `python -m unittest tests/test_academic_review_ledger.py`.
- `python tools/academic_review.py --strict-current`.
- Manual review sample reconciliation against rendered DOCX/HTML/PDF.

## Todo

- [ ] Freeze review scope and reviewer role/unit.
- [ ] Generate item inventory and hashes.
- [ ] Add ledger/review-record validator and mutation tests.
- [ ] Conduct equation, image and representative content review.
- [ ] Resolve or explicitly block rejected/stale items.

## Success Criteria

- 100% scoped items exist in ledger with current source/output hashes.
- Zero accepted item lacks an independent review record.
- Zero stale or conflicting review record in release scope.
- Technical and academic status remain visibly distinct in reports.
- Every unresolved item blocks only the affected claim/artifact, never silently passes.

## Risk Assessment

- Risk: reviewer identity/privacy. Mitigation: role/unit is the default; collect minimal personal identity only when the formal process requires it, with restricted evidence storage.
- Risk: normalized versus raw hash mismatch. Mitigation: specify exact bytes/canonicalization per artifact type.
- Risk: automation treated as SME. Mitigation: hard-coded non-claiming language and review-status gate.

## Next Steps

Phase 9 may use LO/content có review status phù hợp cho media; Phase 10 consumes the current certification summary.