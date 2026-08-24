---
title: "Phase 1: Khóa baseline nghiệm thu và quản trị TDD"
status: completed
priority: P0
effort: "2-3 ngày"
dependencies: []
---

# Phase 1: Khóa baseline nghiệm thu và quản trị TDD

## Overview

Tái hiện gate đang đỏ, phân biệt defect với baseline lịch sử, rồi khóa một baseline lấy từ nguồn/manifest thay vì số đếm cứng. Phase này tạo test matrix và evidence registry dùng chung cho 11 phase sau.

## Requirements

- Functional: tái hiện `npm run test:equations` fail 117/127 so với 114/126; xác nhận các strict gate khác vẫn pass.
- Functional: structural baseline phải suy ra từ DOCX manifest, chapter tree, local image references, quiz/sim/PDF manifests.
- Functional: mọi gate có owner, command, expected output, artifact path và hash policy.
- Non-functional: không sửa generated output để làm test xanh; không thay count stale bằng count stale mới.
- Non-functional: giữ nguyên scope runtime Sim2/Sim3 của plan `260713-1524`.

## Architecture

`source inventories -> baseline contract -> evidence registry -> focused gates -> downstream manifests`. Count được phép hard-code chỉ khi là policy được phê duyệt và có manifest làm nguồn, ví dụ 100 câu/chương hoặc 25 Sim2; count lịch sử không còn là acceptance oracle.

## Related Code Files

- Modify: `scripts/test-phase-01-baseline-html-chapter-formula-image-ref-counts.py`.
- Reuse: `scripts/equations-fix-shared-test-helpers-html-image-utilities.py`, `tools/audit.py`, `package.json`.
- Create: `tests/release-baseline-contract.test.js`, `data/schemas/evidence-registry.schema.json`, `docs/qa-gate-matrix.md`.
- Inspect only: `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260816/`, `lib/pdfjs/provenance.json`.

## Tests Before

1. Run failing script directly and capture exact assertion 117/127 versus derived 114/126.
2. Run `npm run test:equations` to prove propagation through aggregate gate.
3. Run `npm run test:audit:strict` to prove content/math/image tree itself is clean.
4. Record focused content, quiz, sim, PDF commands and current pass/fail without changing source.

## Implementation Steps

1. **RED:** add fixture/mutation tests proving missing manifest entry, missing referenced image, orphan generated file and duplicate route must fail.
2. **Diagnose:** classify Phase-01 constants as historical migration evidence, not current product acceptance.
3. **GREEN:** replace literal file/image totals with a two-way join among the existing generated `tools/docx_site_manifest.json`, `chapter_files()`/`iter_imgs()`, local asset references and current route inventory. Phase 2 later enriches the manifest; Phase 1 must be executable without Phase 2.
4. Add evidence-registry schema/template: `gateId`, owner, command, inputs, expected, artifact, hash, status, observedAt. Phase 3 owns the populated curated `data/evidence-registry.json`.
5. Define command tiers: fast contract, focused browser, simulation upstream, release/full manual.
6. **Refactor:** remove duplicate count logic; reuse `chapter_files()`/`iter_imgs()` and manifest readers.
7. Preserve the old 117/127 values only in a migration fixture/comment explaining intentional route removal.

## Tests After

- `python scripts/test-phase-01-baseline-html-chapter-formula-image-ref-counts.py`.
- `npm run test:equations`.
- `npm run test:audit:strict`.
- `node --test tests/release-baseline-contract.test.js`.
- Focused evidence-registry schema/command existence test.

## Todo

- [x] Capture failing baseline evidence before edits.
- [x] Define source-derived invariants and policy counts.
- [x] Add baseline mutation tests.
- [x] Add evidence registry and QA gate matrix.
- [x] Remove stale acceptance dependency without suppressing real drift.

## Success Criteria

- Current intentional 114 HTML/126 image state passes because existing generated source inventory, route inventory and filesystem agree bidirectionally, not because literals were changed.
- Deleting/adding an unmanifested route or local image reliably fails.
- `npm run test:equations` is green and still catches formula/image regressions.
- Every planned release gate appears once in `docs/qa-gate-matrix.md` with a schema-valid evidence contract.

## Risk Assessment

- Risk: filesystem-only derivation blesses accidental deletion. Mitigation: compare source manifest, PAGE_MAP, bundle and tree both directions.
- Risk: broad gate remains slow. Mitigation: keep fast contracts separate; release command composes them later.
- Risk: old plan status causes duplicate work. Mitigation: record plan owner boundaries before implementation.

## Next Steps

Phase 2 enriches the existing structural inventory with portable route/version/content hashes without changing Phase 1 ownership.