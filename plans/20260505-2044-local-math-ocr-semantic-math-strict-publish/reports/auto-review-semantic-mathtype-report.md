---
title: "Auto Review Semantic MathType Report"
description: "Phase 05 local Equation Native auto-review results."
status: complete
created: 2026-05-06
---

# Auto Review Semantic MathType Report

## Summary

Local semantic auto-review was run from DOCX embedded `Equation Native` OLE data. It reviewed 645/702 rows with MathML from MathType/Microsoft Equation sources. A follow-up debug/manual pass resolved the remaining 57 rows; strict publish now passes.

```text
Input rows: 702
Unique hashes: 702
Auto-reviewed: 645
Resolved by follow-up manual/debug pass: 57
MathML rows: 645
Failure records: 11
```

## Method

`tools\auto_review_equation_mapping.py` maps equation preview media to embedded OLE objects in `word/document.xml` and `word/_rels/document.xml.rels`, extracts `Equation Native`, then converts it with local Ruby `mathtype_to_mathml_plus`.

The converter uses a patched XSL rule for MTEF v3 objects that omit `equation_options`:

```text
mtef[not(equation_options) or equation_options = 'inline']
```

Rows are marked `reviewed=true` only when conversion returns non-empty valid MathML. OCR-only rows remain unreviewed.

## Commands

```powershell
python -m compileall -q tools
python tools\auto_review_equation_mapping.py --ruby C:\Ruby33-x64\bin\ruby.exe
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json --strict --katex
python tools\build_equation_review_html.py --input data\equation_mapping.reviewed.json --output equation-review.html
```

## Validation Result

Non-strict validation passed:

```text
Rows: 702
Unique hashes: 702
Reviewed: 645
OK
```

Initial strict validation failed as expected because 57 rows remained unreviewed:

```text
Reviewed: 645
KaTeX checked: 50
Errors: 57
ERROR row ... strict mode requires reviewed=true
```

`equation-review.html` was rebuilt from `data\equation_mapping.reviewed.json`; schema check found 0 `confidence` field occurrences.

## Follow-Up Resolution

The remaining queue was resolved in [Debug Remaining Equations Report](./debug-remaining-equations-report.md):

```text
Manual LaTeX rows: 53
Reviewed artifact rows: 4
Reviewed total: 702/702
Strict validation: OK
Strict audit: OK
```

## Original Remaining Queue

```text
No matching OLE object: 46
Converter failed/error: 9
Empty MathML/blank conversion: 2
```

Visual contact sheets for unresolved rows:

```text
plans\20260505-2044-local-math-ocr-semantic-math-strict-publish\reports\remaining-unreviewed-contact-sheet-1.png
plans\20260505-2044-local-math-ocr-semantic-math-strict-publish\reports\remaining-unreviewed-contact-sheet-2.png
plans\20260505-2044-local-math-ocr-semantic-math-strict-publish\reports\remaining-unreviewed-contact-sheet-3.png
```

Some unresolved rows are raster-only formulas. A small subset appears to be non-formula or blank artifacts, for example the beam load diagram `images/ch1/hinh-078.png`, the acceleration diagram `images/ch2/hinh-211.png`, and blank equation objects `images/ch1/hinh-065.png`, `images/ch1/hinh-009.png`. These must not be forced into formula mappings.

## Output Files

```text
tools\auto_review_equation_mapping.py
data\equation_mapping.reviewed.json
data\equation_mapping.auto-review-failures.json
equation-review.html
```

## Next Steps

1. Keep `data\equation_manual_reviews.json` as the auditable manual review source.
2. Run browser visual QA before release packaging.

## Unresolved Questions

- Browser visual QA on representative desktop/mobile pages remains useful before release packaging.
