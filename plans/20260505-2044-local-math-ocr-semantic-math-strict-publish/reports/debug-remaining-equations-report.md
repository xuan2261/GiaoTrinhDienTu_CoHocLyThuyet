---
title: "Debug Remaining Equations Report"
description: "Root cause and fix for the 57 previously unresolved equation rows."
status: complete
created: 2026-05-06
---

# Debug Remaining Equations Report

## Summary

The 57 unresolved rows were handled without fake formula mappings.

```text
Reviewed mapping rows: 702
Unique hashes: 702
Reviewed: 702
MathML rows: 645
Manual LaTeX rows: 53
Reviewed artifacts: 4
```

## Root Cause

| Cause | Count | Resolution |
|---|---:|---|
| Raster/formula image without own OLE mapping | 42 | Manual LaTeX review from image/context |
| WMF formula not independently mapped to OLE | 4 | Manual LaTeX review from image/context |
| MathType converter failed on valid OLE | 9 | Manual LaTeX review from image/context |
| Blank/figure artifact, not semantic formula | 4 | Marked reviewed artifact, not converted to fake formula |

A few media were equation candidates because nearby paragraph OLE data existed, but the media itself was a figure or blank placeholder. Those are now represented with `artifact: "figure"` or `artifact: "blank"`.

## Fixes

Added:

```text
tools\apply_manual_equation_reviews.py
data\equation_manual_reviews.json
```

Updated:

```text
tools\validate_equation_mapping.py
tools\merge_equation_mapping.py
tools\extract_docx.py
tools\audit.py
```

Formula rows still require valid LaTeX or MathML. Reviewed artifacts are resolved rows: figures stay as figures, blank placeholders render nothing.

## Verification

```text
validate reviewed strict: OK, 702 reviewed, KaTeX checked 53
validate publish strict: OK, 702 reviewed, KaTeX checked 53
extract_docx.py --write: Reviewed equation mappings 702, image conversion failures 0
audit.py: 0 errors
audit.py --strict-equations: 0 errors, no equation image fallbacks
math-img-inline/math-img-block in chapters + js/pages.js: 0/0
```

JS and Python syntax checks also passed.

## Unresolved Questions

- Browser visual QA on a representative mobile/desktop sample is still useful before release packaging.
