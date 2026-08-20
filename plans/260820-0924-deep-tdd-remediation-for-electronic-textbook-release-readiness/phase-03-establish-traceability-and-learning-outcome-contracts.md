---
title: "Phase 3: Thiết lập ma trận truy vết và chuẩn đầu ra"
status: pending
priority: P0
effort: "5-8 ngày kỹ thuật + thời gian review khi cần"
dependencies: [phase-02]
---

# Phase 3: Thiết lập ma trận truy vết và chuẩn đầu ra

## Overview

Thiết lập join chính thức `requirement -> learning outcome -> content -> assessment -> simulation -> evidence`. Kỹ thuật kiểm tra schema/coverage; nội dung LO trở thành authoritative khi review status được xác nhận theo quy trình áp dụng, không bắt buộc điền trước danh tính người ký.

## Requirements

- Stable IDs, version, status, owner role và review role cho requirement/LO; danh tính cá nhân là tùy chọn trừ khi quy trình chính thức yêu cầu.
- Mỗi requirement ở trạng thái confirmed có ít nhất một LO, content và evidence.
- Mỗi LO confirmed có content và assessment hoặc ngoại lệ được ghi nhận.
- Quiz/simulation/content refs phải resolve tới manifest chuẩn.
- Baseline kỹ thuật có thể ở trạng thái `provisional` khi dùng tài liệu chính thức mới nhất; chỉ formal acceptance claim mới yêu cầu trạng thái `confirmed`.
- Requirement từ quy định pháp lý phải có nguồn chính thức, ngày truy cập và trạng thái review trong legal register; approval ref chỉ bắt buộc khi quy trình của đơn vị yêu cầu.

## Architecture

Curated JSON sidecars: `data/legal-standards-register.json`, `data/requirement-traceability.json`, `data/learning-outcomes.json`, `data/content-learning-map.json`, `data/quiz-learning-map.json`, `data/simulation-learning-map.json`, `data/evidence-registry.json`. Validator chỉ kiểm tra shape, joins, coverage, nguồn và review status; không đòi dữ liệu cá nhân không cần thiết.

## Related Code Files

- Create: các manifest trên, `tools/validate_traceability.py`.
- Tests: `tests/traceability-schema.test.js`, `tests/traceability-referential-integrity.test.js`, `tests/traceability-coverage.test.js`, `tests/learning-outcome-status-gate.test.js`.
- Consume: `data/content-manifest.json`, `js/sim2/sim2-route-manifest.js`, `data/quiz-ch*.json`.
- Reference: `Todo_For_GiaoTrinhDienTu.txt`, căn cứ/chuẩn đầu ra chính thức do owner cung cấp.

## Tests Before

1. Run the future validator against an empty/draft fixture and require failure for absent usable LO baseline; repository absence is discovery evidence, not the behavioral assertion.
2. Use a legacy quiz fixture without stable IDs/LO refs and require referential validation failure.
3. Build fixtures with dangling page/sim/evidence IDs and require validator RED.
4. Build a regulation-derived requirement without an official-source legal-register row and require the affected legal claim to remain unconfirmed.

## Implementation Steps

1. **RED:** schema/duplicate/ID-format tests.
2. **RED:** mutation tests for dangling content, quiz, simulation and evidence refs.
3. Define requirement and LO schemas with `version`, `status`, `ownerRole`, `reviewRole`, optional `approvalRef`, observable verb/condition/criterion.
4. Import Todo requirements as draft. Import the latest official requirement/LO source available; record source and review status. If authority is not yet confirmed, use `provisional` rather than inventing details or blocking technical work.
5. Map canonical page IDs from Phase 2; create quiz/sim sidecars pending Phase 6/7 enrichment.
6. Implement coverage report with explicit states: complete, incomplete, provisional, blocked, not-applicable.
7. **GREEN:** valid confirmed fixture achieves 100% joins; provisional real data remains usable for technical validation while formal claims stay limited.
8. **Refactor:** shared ID/path/status validators; avoid duplicate schemas in LMS layer.

## Tests After

- `python tools/validate_traceability.py --strict-claims`.
- `node --test tests/traceability-schema.test.js tests/traceability-referential-integrity.test.js tests/traceability-coverage.test.js tests/learning-outcome-status-gate.test.js`.
- Check every evidence command/path exists and every canonical ID resolves.

## Todo

- [ ] Record requirement/LO owner roles and current official source.
- [ ] Author draft requirement and LO registries.
- [ ] Add content/quiz/simulation/evidence joins.
- [ ] Add mutation-based referential tests.
- [ ] Record review status; add named approval evidence only when required by the institution.

## Success Criteria

- 0 duplicate/dangling IDs.
- 100% confirmed requirements map to confirmed LO + content + evidence.
- 100% confirmed LOs map to content and assessment or recorded exception.
- 25 Sim2 IDs and all quiz IDs can be joined without runtime imports.
- Technical release accepts a truthful provisional baseline; formal acceptance claims require confirmed status.

## Risk Assessment

- Risk: fabricated LO authority. Mitigation: technical team records the latest official source and role-level review status; no invented approver identity or approval claim.
- Risk: unstable quiz IDs. Mitigation: Phase 6 migration owns stable item IDs; sidecar remains blocked until then.
- Risk: RTM becomes paperwork with dead links. Mitigation: executable referential validator and evidence hashes.

## Next Steps

Phase 4 binds academic reviews to these IDs; Phase 6 and 7 enrich assessment/simulation evidence.