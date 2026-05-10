---
title: "Local Math OCR Semantic Math Strict Publish"
description: "Đưa 702 công thức legacy trong DOCX sang LaTeX/KaTeX bằng local OCR, manual review, merge mapping, strict audit, và release QA."
status: in-progress
priority: P1
effort: 40h
issue:
branch: none
tags: [docs, tooling, semantic-math, qa, release]
blockedBy: []
blocks: [20260506-1045-interactive-mechanics-simulation-expansion]
created: 2026-05-05
---

# Local Math OCR Semantic Math Strict Publish

## Overview

Plan này hoàn tất P2 semantic math strict publish cho giáo trình. Phạm vi: local OCR không API key, review thủ công 702 unique formulas, publish mapping đã review, regenerate static textbook, strict audit, QA, docs sync.

## Current Baseline

`CoHocLyThuyet_Full_New.docx` có 741 OLE equations, 17 OMML objects, 791 math refs, 702 unique hashes. Publish mapping hiện có 702/702 rows `reviewed=true`: 645 MathML từ DOCX OLE, 53 LaTeX manual review, và 4 reviewed artifact rows. Static output đã regenerate, `audit.py --strict-equations` pass, và không còn `math-img-inline`/`math-img-block`.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Blocks | [Interactive Mechanics Simulation Expansion](../20260506-1045-interactive-mechanics-simulation-expansion/plan.md) | Unblocked | Semantic math strict baseline is closed; release package/rollback remains tracked in Phase 10. |

## Research & Reports

| Report | Purpose |
|---|---|
| [Local Math OCR Research](./research/local-math-ocr-research.md) | So sánh `pix2tex`, `Pix2Text`, fallback cloud |
| [Codebase Scout Report](./reports/codebase-scout-report.md) | Files, data, constraints, baseline |
| [Red Team Review](./reports/red-team-review.md) | Failure modes, objections, mitigations |
| [Validation Report](./reports/validation-report.md) | Critical questions, answers, gates |
| [Baseline Command Output](./reports/baseline-command-output.md) | Phase 01 backup and baseline validation |
| [Local OCR Environment Report](./reports/local-ocr-environment-report.md) | Phase 02 `.venv-ocr`, dependency pins, smoke |
| [OCR Sampling And Model Selection Report](./reports/ocr-sampling-model-selection-report.md) | Phase 03 sample quality and provider gate |
| [Batch OCR Prefill Report](./reports/batch-ocr-prefill-report.md) | Phase 04 full OCR prefill counts and validation |
| [Auto Review Semantic MathType Report](./reports/auto-review-semantic-mathtype-report.md) | Phase 05 semantic OLE auto-review counts and remaining queue |
| [Debug Remaining Equations Report](./reports/debug-remaining-equations-report.md) | Root cause and fix for the final 57 unresolved rows |
| [Runtime QA Report](./reports/runtime-qa-report.md) | Phase 08 browser QA, KaTeX font path fix, and `file://` verification |

## Phases

| Phase | Name | Status |
|---:|---|---|
| 1 | [Baseline Safety Snapshot](./phase-01-baseline-safety-snapshot.md) | Complete |
| 2 | [Local OCR Environment](./phase-02-local-ocr-environment.md) | Complete |
| 3 | [OCR Sampling And Model Selection](./phase-03-ocr-sampling-and-model-selection.md) | Complete |
| 4 | [Batch OCR Prefill](./phase-04-batch-ocr-prefill.md) | Complete |
| 5 | [Manual Review Workflow](./phase-05-manual-review-workflow.md) | Complete |
| 6 | [Merge Reviewed Mapping](./phase-06-merge-reviewed-mapping.md) | Complete |
| 7 | [Regenerate Semantic Math Output](./phase-07-regenerate-semantic-math-output.md) | Complete |
| 8 | [Strict Audit And Runtime QA](./phase-08-strict-audit-and-runtime-qa.md) | Complete |
| 9 | [Docs And Release Notes Sync](./phase-09-docs-and-release-notes-sync.md) | Complete |
| 10 | [Release Package And Rollback](./phase-10-release-package-and-rollback.md) | In Progress |

## Execution Strategy

Sequential. Shared outputs: `data/equation_mapping.json`, `chapters/`, `js/pages.js`, `equation-review.html`. Manual review có thể chia batch, merge chỉ sau khi validated. Dependencies: Python 3.11, Node.js, ImageMagick, `OMML2MML.XSL`, browser, model weights local. OCR commands must use `--provider pix2tex` unless cloud fallback is explicitly approved.

## Definition Of Done

- `data/equation_mapping.json` có đủ 702 unique rows, all `reviewed=true`, mỗi row có `latex`, `mathml`, hoặc reviewed `artifact`.
- `python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex` pass.
- `python tools\audit.py --strict-equations` pass.
- `chapters/` và `js/pages.js` không còn `math-img-inline` hoặc `math-img-block`.
- `index.html` mở offline và render KaTeX/MathML ổn cho sample pages.

## Cook Handoff

Sau khi duyệt plan, chạy:

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260505-2044-local-math-ocr-semantic-math-strict-publish\plan.md
```

Unresolved questions: xem [Validation Report](./reports/validation-report.md).
