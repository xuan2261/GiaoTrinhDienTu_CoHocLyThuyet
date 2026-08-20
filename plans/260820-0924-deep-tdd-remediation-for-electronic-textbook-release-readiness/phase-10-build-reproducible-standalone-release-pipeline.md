---
title: "Phase 10: Xây pipeline release standalone tái lập"
status: pending
priority: P0
effort: "6-9 ngày"
dependencies: [phase-02, phase-04, phase-05, phase-06, phase-07, phase-08, phase-09]
---

# Phase 10: Xây pipeline release standalone tái lập

## Overview

Tạo một lệnh fail-fast chạy trong staging sạch: regenerate, validate, test, package, manifest, checksums, notices và smoke. Không đóng gói trực tiếp từ worktree bẩn hoặc sửa release lịch sử.

## Requirements

- Build order: DOCX analyze/extract -> nav -> bundle -> search -> manifests -> strict audits -> focused contracts/browser gates -> PDF provenance -> package -> hash/manifest -> smoke.
- Staging mới mỗi run; ship-list allowlist và exclusion denylist.
- `VERSION`, `release-manifest.json`, `SHA256SUMS`, `THIRD_PARTY_NOTICES.txt`, evidence summary.
- Same inputs, version, pinned packaging tool/config and `SOURCE_DATE_EPOCH` must produce identical unpacked inventory hashes and identical final ZIP SHA-256 across two clean builds on the same recorded Windows environment.
- Standalone release không chứa `node_modules`, tests, tools, plans, screenshots/review source hoặc LMS adapter internals.
- File:// + HTTP smoke, zero external network, local PDF/search/quiz/sim/media paths.
- Phase 9 dependency is satisfied by either reviewed publish assets or a recorded no-go media-scope decision; optional production may not block standalone release.

## Architecture

`tools/build_release.py` là orchestrator nhỏ gọi các generator/gate hiện có; không reimplement logic. `tools/package_release.py` áp ship-list và tạo ZIP theo sorted path, fixed timestamp/permissions/compression settings. `SOURCE_DATE_EPOCH` là nguồn thời gian duy nhất cho metadata tái lập. Package script trong `package.json` là public entrypoint.

## Related Code Files

- Modify: `package.json`, `docs/deployment-guide.md`, `docs/docx-sync-pipeline.md`.
- Create: `tools/build_release.py`, `tools/package_release.py`, `tools/build_release_manifest.py`, `tools/validate_release_manifest.py`, `tests/build-release-smoke.test.js`, `tests/release-package-contents.test.js`, `tests/test_release_reproducibility.py`.
- Consume: Phase-2 manifests, academic/sim/WCAG/media evidence, `lib/pdfjs/provenance.json`.
- Preserve immutable: existing `release/GiaoTrinhDienTu_CoHocLyThuyet_release_*`.

## Tests Before

1. Assert no single release command exists.
2. Assert current release lacks top-level version/manifest/checksums/notices.
3. Compare README/deployment release references and record drift.
4. Build fixture package with forbidden/missing file and require RED.

## Implementation Steps

1. **RED:** tests for missing source hash, missing required gate, forbidden path, stale manifest, bad checksum and nondeterministic inventory.
2. Define version policy, required `SOURCE_DATE_EPOCH`, clean staging location, allowlist/denylist and normalized metadata; volatile wall-clock fields are excluded from reproducibility hashes.
3. Implement orchestrator with explicit ordered steps, captured logs and immediate nonzero exit.
4. Implement package inventory/checksum/notices aggregation; link rather than duplicate PDF provenance.
5. Add focused Playwright smoke against staged folder via file:// and HTTP.
6. Run two clean builds from identical inputs; compare unpacked inventories, archive bytes and final ZIP SHA-256. Any difference is RED, not an allowed metadata exception.
7. **GREEN:** public command such as `npm run build:release -- --version 2026.08.20` creates complete verified output.
8. **Refactor:** delete ad-hoc duplicate release commands/docs; keep phase-specific tools independently runnable.

## Tests After

- `node --test tests/build-release-smoke.test.js tests/release-package-contents.test.js`.
- `python -m unittest tests/test_release_reproducibility.py`.
- All registry-required content/search/quiz/sim/WCAG/PDF/media gates.
- File:// and HTTP release smoke on target Chrome/Edge; verify no external requests.
- Validate every line in `SHA256SUMS` and manifest inventory.

## Todo

- [ ] Record version/build-epoch and ship-list policies.
- [ ] Implement fail-fast orchestrator/staging.
- [ ] Generate manifest/checksums/notices/evidence summary.
- [ ] Add reproducibility and package-content tests.
- [ ] Reconcile docs and preserve historical releases.

## Success Criteria

- One command from clean inputs yields a complete, verified standalone package and final ZIP.
- Two identical builds have identical normalized artifact inventory/checksums and identical final ZIP SHA-256 on the same recorded environment.
- Zero forbidden or undeclared file; zero missing required artifact.
- File:// and HTTP primary workflows pass with no external network.
- Release docs, VERSION and folder/archive name agree.

## Risk Assessment
- Windows archive variability: use a single pinned deterministic ZIP writer with sorted entries, fixed timestamps, permissions and compression settings; exact archive SHA-256 is an acceptance gate.
- Word/Office nondeterminism: source DOCX hash and Word manual gate are recorded separately from deterministic web package.
- Long gate time: fail-fast tiers and captured evidence; never skip required release gates.
- Dirty worktree contamination: copy from explicit manifest into clean staging only.

## Next Steps

Phase 11 builds derivative LMS packages from canonical data; Phase 12 independently audits the release.