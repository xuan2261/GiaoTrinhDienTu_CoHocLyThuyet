---
title: "Red Team Review"
description: "Adversarial review cho plan semantic math strict publish."
status: complete
created: 2026-05-05
---

# Red Team Review

## Verdict

Plan khả thi nếu giữ strict gates. Rủi ro lớn nhất không phải code, mà là chất lượng review 702 formulas. Không được publish strict chỉ vì scripts pass nếu LaTeX sai nội dung học thuật.

## Attack Points

| Concern | Severity | Why It Matters | Required Mitigation |
|---|---|---|---|
| OCR sai dấu vector, prime, subscript | High | Sai kiến thức cơ học | Manual review with KaTeX preview, batch QA |
| Reviewer fatigue after 702 rows | High | Sai sót cuối batch | Batch size nhỏ, checklist, random second pass |
| Local OCR install breaks Python env | Medium | Toolchain hỏng | Isolated `.venv-ocr`, no global install |
| `equation_mapping.json` merge partial | High | Strict publish fail or mixed output | Validate strict before regenerate |
| Generated files edited manually | Medium | Non-deterministic output | Only scripts write generated files |
| Cloud fallback leaks image content | Medium | Privacy/cost | Default local, explicit opt-in for cloud |
| Strict audit passes but visual layout bad | Medium | Formula overflow/mobile issue | Browser QA desktop/mobile sample |
| Duplicated hashes reviewed inconsistently | Medium | Reused formula wrong everywhere | Hash-level review, examples context check |
| Empty LaTeX accepted accidentally | High | Missing formula | Validator, review UI, fail empty result |
| Formula number/caption mismatch | Medium | Broken references | Spot-check numbered display equations |

## Plan Changes Required

- Include sample accuracy gate before full OCR.
- Include second-pass QA, especially display equations and numbered formulas.
- Include rollback backup before merge/regenerate.
- Include no-API local-first policy, cloud fallback explicit only.
- Include test commands per phase.

## Stop Conditions

- Local OCR sample quality below threshold.
- `validate_equation_mapping.py --strict` fails.
- `audit.py --strict-equations` fails.
- Any chapter has known wrong formulas after review.
- Runtime KaTeX errors show in console on sampled pages.

## Residual Risk

Even with all tests passing, semantic correctness still depends on human review. Mitigation is not automation; it is batch discipline and second-pass spot checks.

Unresolved questions:
- Ai là reviewer cuối cùng cho correctness học thuật?
