---
title: "Phase 12: Hoàn tất bằng chứng nghiệm thu standalone và báo cáo"
status: pending
priority: P0
effort: "5-8 ngày + thời gian review khi cần"
dependencies: [phase-04, phase-05, phase-06, phase-07, phase-08, phase-09, phase-10]
---

# Phase 12: Hoàn tất bằng chứng nghiệm thu standalone và báo cáo

## Overview

Đóng mọi requirement của sản phẩm standalone bằng evidence có thể kiểm tra độc lập, audit bản release, chạy gate Word/DOCX và đồng bộ tài liệu/báo cáo. Phase này có thể kết luận “sẵn sàng nghiệm thu standalone” về mặt kỹ thuật; review theo vai trò/đơn vị giới hạn hoặc xác nhận từng claim, còn tên/chữ ký cá nhân chỉ bắt buộc nếu quy trình tiếp nhận yêu cầu. Phase 11 tự nghiệm thu các derivative LMS packages và không chặn kết luận standalone.

## Requirements

- RTM row-level: requirement, owner role, implementation/artifact, command/manual check, evidence/hash, status và review role/status; tên cá nhân chỉ bắt buộc khi quy trình chính thức yêu cầu.
- Immutable command log và artifact inventory/checksums.
- Manual smoke: file://, HTTP, search, quiz restore, Sim2, Sim3 fallback, PDF, media, removed routes/assets.
- Word-specific gate trên môi trường Word/Windows thực tế dùng để hoàn thiện hoặc nộp: open/update fields/save/close/reopen/render; version/build được ghi lúc chạy.
- Independent reviewer report với severity/disposition; zero unresolved Critical/High/Medium technical.
- Academic/legal/accessibility/Word review evidence hoặc giới hạn tuyên bố rõ ràng. LMS evidence được báo cáo riêng theo Phase 11 và không phải precondition standalone.
- Đồng bộ README, deployment, architecture, codebase summary, changelog và luồng báo cáo DOCX `260820-0639`.
- Mọi evidence record có classification: `containsPII`, `redactionStatus`, `storageLocation`, `accessOwner`, `retentionPolicy`, `hash`.

## Evidence Layout

- `reports/phase-12-acceptance-report.md`.
- `evidence/requirement-traceability-matrix.csv`.
- `evidence/qa-command-log.txt`.
- `evidence/manual-smoke-checklist.md`.
- `evidence/independent-review.md`.
- `evidence/word-docx-gate.md`.
- `evidence/release-artifact-inventory.json`.
- `evidence/checksums/SHA256SUMS`.
- `evidence/review-status-and-limitations.md`.

All paths are inside this plan directory unless release policy requires a separately archived evidence ZIP; screenshots/binaries may remain outside git with hashed manifest refs.

## Related Code Files

- Read/verify: audit report, Todo, all phase manifests/evidence, final release package.
- Modify after product final: `README.md`, `docs/deployment-guide.md`, `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`, `docs/project-changelog.md` when present.
- Coordinate, do not overwrite blindly: plan `260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc` and its DOCX evidence workflow.
- Do not duplicate simulation final-verification owned by `260713-1524`; import its recorded review evidence.

## Tests Before

1. Re-run original audit checklist and classify every 12 package row as open/closed/blocked.
2. Verify stale equation baseline is resolved by source-derived contract.
3. Assert docs/release version drift and missing required review role/status are visible as claim limitations, not blanket technical blockers.
4. Validate evidence bundle schema with intentionally missing command/hash/review-role fixture.

## Implementation Steps

1. **RED:** acceptance validator fails for missing RTM row, missing hash/log, stale artifact, unresolved severity, missing actual Word environment, or a formal claim lacking its required review status.
2. Run Phase-10 release from clean staging; freeze release/evidence checksums.
3. Execute all automated gates and capture exact command, environment, output and artifact hash.
4. Execute manual browser/offline/accessibility/media checks and record reviewer role/unit; record personal identity only when required. Import Phase-11 LMS evidence only as a separate derivative-package appendix when available.
5. Execute Word/DOCX gate on the actual submission/finalization environment; record version/build during the run and compare rendered/report structure and provenance.
6. Commission independent review; remediate findings in owning phase, rebuild and re-audit.
7. **GREEN:** acceptance report contains no unsupported claim and all technical rows close.
8. Sync durable docs and report narrative to final version/artifact; remove stale version references.
9. Record applicable review/approval status by role or unit; add named signatures only when the institution's formal process requires them.

## Tests After

- Release manifest/checksum validator and complete QA registry.
- Original Todo/audit matrix replay with evidence links.
- Independent reviewer rerun of sampled commands and full manual critical paths.
- Microsoft Word compatibility record; PDF/browser comparison where specified.
- Whole-plan consistency: every checkbox/claim/file/command matches current repository and release.

## Todo

- [ ] Build and validate evidence bundle.
- [ ] Run automated/manual/Word standalone gates; attach LMS derivative evidence only when a Phase-11 package is in scope.
- [ ] Complete independent review and remediate findings.
- [ ] Synchronize docs and formal report.
- [ ] Record review status and exact claim limitations; attach named approvals only when required.

## Success Criteria

- 100% standalone Todo/requirement rows closed or explicitly limited by external role/unit where applicable; LMS derivative rows are reported separately.
- Zero unsupported “đạt”, “đã nghiệm thu”, “WCAG AA”, “đúng học thuật” or LMS-conformance claim.
- Zero unresolved Critical/High/Medium technical finding.
- Release archive/folder, manifests, docs and report all identify one artifact/version/hash set.
- Word/DOCX opens, updates, saves, reopens and renders acceptably on the recorded actual environment.
- Independent technical review records role/unit and disposition; formal signatures are included only when required by the receiving institution.

## Risk Assessment

- Evidence assembled after the fact: require command logs/manifests during each phase, not recreated from memory.
- Formal approval unavailable: final technical/standalone state may still close; only the affected acceptance/compliance claim remains pending or explicitly limited.
- Report plan concurrent edits: use its baseline/traceability workflow and coordinate file ownership before DOCX mutation.
- Binary/private evidence: classify, redact, control access/retention, store outside git when required, and keep hashed manifest refs.

## Final Handoff

Only after this phase closes should the project mark the roadmap milestone complete or publish a final-acceptance claim.