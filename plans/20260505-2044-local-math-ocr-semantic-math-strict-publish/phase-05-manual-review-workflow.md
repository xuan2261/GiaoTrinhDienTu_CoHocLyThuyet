---
title: "Phase 05 - Manual Review Workflow"
status: complete
priority: P1
effort: 18h
---

# Phase 05 - Manual Review Workflow

## Context Links

- `equation-review.html`
- `data/equation_mapping.ocr.json`
- `data/equation_mapping.reviewed.json`
- `data/equation_mapping.auto-review-failures.json`
- [Red Team](./reports/red-team-review.md)
- [Auto Review Semantic MathType Report](./reports/auto-review-semantic-mathtype-report.md)

## Overview

Review all 702 unique formula candidates. Auto semantic review from DOCX `Equation Native` completed 645 rows with MathML. The remaining 57 rows were resolved by manual LaTeX review or artifact triage.

## Key Insights

- This is the correctness-critical phase.
- OCR is only a draft.
- DOCX OLE MathType/Microsoft Equation data is a stronger source than OCR and can auto-review rows only when conversion returns valid MathML.
- Some unresolved rows are raster-only formulas; a few appear to be non-formula or blank artifacts and need classification before publish.
- Reused hashes can affect multiple locations, so examples/context matter.

## Requirements

Functional:
- Each real equation row reviewed.
- Non-equation/blank artifacts explicitly classified before publish.
- Each reviewed row has valid `latex` or `mathml`.
- Export `data/equation_mapping.reviewed.json`.

Non-functional:
- Batch discipline to reduce fatigue.
- Track progress.
- Avoid publishing partial reviewed file as final mapping.

## Architecture

```text
equation-review.html
  -> semantic OLE auto-review
  -> human review/triage remaining rows
  -> equation_mapping.reviewed.json
  -> validate non-strict
  -> strict validation after full reviewed
```

## Related Code Files

Modify:
- `data/equation_mapping.reviewed.json`

Create:
- `data/equation_mapping.auto-review-failures.json`
- `plans/.../reports/auto-review-semantic-mathtype-report.md`

Delete:
- None.

## Implementation Steps

1. Run semantic auto-review from DOCX OLE:
   ```powershell
   python tools\auto_review_equation_mapping.py --ruby C:\Ruby33-x64\bin\ruby.exe
   ```
2. Validate partial reviewed mapping:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json
   ```
3. Open `equation-review.html` directly in browser.
4. Review unresolved rows in batches.
5. For each unresolved real equation row:
   - compare image with OCR LaTeX.
   - fix vector arrows, dots, primes, fractions, subscripts, superscripts.
   - ensure display vs inline preview readable.
   - set source to `manual-review`.
   - tick `reviewed`.
6. For non-formula/blank artifacts:
   - do not force a fake formula.
   - record classification decision before merge/publish.
7. Export after each batch and save timestamped backup:
   ```powershell
   Copy-Item data\equation_mapping.reviewed.json backups\equation_mapping.reviewed-{batch}.json
   ```
8. Validate after each export:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json
   ```
9. At full reviewed/resolved state, run strict validation:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json --strict --katex
   ```
10. Second pass:
   - all display equations.
   - all rows with OCR failed notes.
   - random 10 percent of reviewed rows.
   - all numbered formulas context `(1.x)`, `(2.x)`, `(3.x)`.

## Todo List

- [x] Run DOCX Equation Native auto-review.
- [x] Generate `data/equation_mapping.reviewed.json`.
- [x] Generate unresolved failure queue.
- [x] Validate partial reviewed mapping non-strict.
- [x] Rebuild `equation-review.html` from reviewed mapping.
- [x] Review/triage 57 unresolved rows.
- [x] Decide handling for non-formula/blank artifacts.
- [x] Validate after each remaining batch.
- [x] Perform second pass via strict validator and contact sheet review.
- [x] Export final reviewed JSON.

## Success Criteria

- `data/equation_mapping.reviewed.json` validates strict after all real equations are resolved.
- Reviewed/resolved count covers the full equation template.
- Formula rows have `latex` or `mathml`; artifact rows use explicit `artifact`.
- No schema drift fields like `confidence`.

## Test And Validation

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json --strict --katex
```

Manual checks:
- 20 random inline formulas.
- 20 random display formulas.
- 10 formulas from each chapter.
- All formulas with multi-line systems/fractions.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Fatigue causes wrong formulas | Batch size 50, second pass |
| Browser export lost | Backup after each batch |
| KaTeX unsupported syntax | Use compatible LaTeX or MathML |
| Context missing for repeated hash | Check `examples` list |

## Security Considerations

- Review file remains local.
- Do not paste full textbook content into third-party services without approval.

## Next Steps

Proceed to merge only after strict validation of reviewed JSON passes.

Unresolved questions:
- Browser visual QA on representative desktop/mobile pages remains useful before release packaging.
