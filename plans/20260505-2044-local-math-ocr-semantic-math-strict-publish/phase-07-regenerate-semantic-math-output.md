---
title: "Phase 07 - Regenerate Semantic Math Output"
status: complete
priority: P1
effort: 3h
---

# Phase 07 - Regenerate Semantic Math Output

## Context Links

- `tools/extract_docx.py`
- `tools/update_nav.py`
- `tools/bundle_pages.py`
- `data/equation_mapping.json`
- `docs/docx-sync-pipeline.md`

## Overview

Regenerate fragments, nav, and offline bundle using strict-ready mapping.

## Key Insights

- Do not edit `chapters/` or `js/pages.js` manually.
- `extract_docx.py` should render mapped equations as `math-tex`, `math-tex-block`, `mathml-inline`, or `mathml-block`.
- Reviewed `artifact=figure` rows render as figures; `artifact=blank` rows render nothing.
- `js/pages.js` must be regenerated after fragments.

## Requirements

Functional:
- Run extractor with `--write`.
- Update nav maps.
- Bundle pages.
- Preserve quiz/simulations.

Non-functional:
- Deterministic generated output.
- Fail early if ImageMagick/OMML2MML missing.

## Architecture

```text
DOCX + reviewed mapping
  -> extract_docx.py --write
  -> chapters/images/manifest/equation report
  -> update_nav.py
  -> bundle_pages.py
  -> js/pages.js
```

## Related Code Files

Modify generated:
- `chapters/**`
- `images/**`
- `tools/docx_site_manifest.json`
- `tools/equation_report.json`
- `tools/image_mapping.json`
- `js/pages.js`
- possible route sections in `index.html`, `js/app.js`, `js/loader.js` via `update_nav.py`

Create:
- None expected.

Delete:
- Old generated files only via extractor cleanup.

## Implementation Steps

1. Confirm strict mapping:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict
   ```
2. Extract:
   ```powershell
   python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
   ```
3. Update nav:
   ```powershell
   python tools\update_nav.py
   ```
4. Bundle:
   ```powershell
   python tools\bundle_pages.py
   ```
5. Check generated math classes:
   ```powershell
   rg "math-img-inline|math-img-block" chapters js\pages.js
   rg "math-tex|math-tex-block|mathml-inline|mathml-block" chapters js\pages.js
   ```

## Todo List

- [x] Validate strict mapping.
- [x] Run DOCX extractor.
- [x] Run nav update.
- [x] Run bundle.
- [x] Verify no math image fallback remains.
- [x] Verify semantic math classes exist.

## Success Criteria

- Extract/update/bundle commands complete.
- `chapters/` and `js/pages.js` no longer contain `math-img-inline` or `math-img-block`.
- Semantic math class count matches expected math refs.

## Test And Validation

```powershell
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
rg "math-img-inline|math-img-block" chapters js\pages.js
```

Expected for final `rg`: no matches.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Extractor fails due dependency | Preflight checks, keep backup |
| Generated route drift | Run `update_nav.py`, audit |
| Bundle stale | Always run `bundle_pages.py` after fragments |

## Security Considerations

- No external calls.
- Generated HTML must escape LaTeX inserted into delimiters.

## Next Steps

Proceed to strict audit and runtime QA.
