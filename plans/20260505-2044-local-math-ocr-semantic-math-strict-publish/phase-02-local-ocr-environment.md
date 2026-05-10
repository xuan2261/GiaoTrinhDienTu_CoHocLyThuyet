---
title: "Phase 02 - Local OCR Environment"
status: complete
priority: P1
effort: 4h
---

# Phase 02 - Local OCR Environment

## Context Links

- [Local Math OCR Research](./research/local-math-ocr-research.md)
- `tools/ocr_equation_mapping.py`
- `docs/docx-sync-pipeline.md`

## Overview

Set up isolated OCR environment without API key. Avoid polluting the main Python environment.

## Key Insights

- `pix2tex` install pulls heavy ML dependencies.
- Current project has no package manager lockfile.
- Local model download is allowed.

## Requirements

Functional:
- Create isolated environment.
- Install `pix2tex` first.
- Optional: install `Pix2Text` only if `pix2tex` sample is weak.
- Confirm `ocr_equation_mapping.py --provider pix2tex --limit 1` can start.

Non-functional:
- Keep model/dependency cache out of release package.
- Fail clearly if install unavailable.

## Architecture

```text
main repo Python tools
  -> external/local .venv-ocr
  -> local OCR package
  -> data/equation_mapping.ocr.sample.json
```

## Related Code Files

Modify:
- `tools/ocr_equation_mapping.py` to reject invalid OCR LaTeX before writing mapping rows.
- Optional `.gitignore` if repository becomes git-managed and `.venv-ocr` is placed in root.

Create:
- `.venv-ocr/` or external OCR venv.
- Optional `data/equation_mapping.ocr.sample.json`.

Delete:
- None.

## Implementation Steps

1. Prefer external venv if release folder must stay clean:
   ```powershell
   python -m venv .venv-ocr
   .\.venv-ocr\Scripts\python.exe -m pip install --upgrade pip
   .\.venv-ocr\Scripts\python.exe -m pip install pix2tex
   ```
2. Smoke import:
   ```powershell
   .\.venv-ocr\Scripts\python.exe -c "from pix2tex.cli import LatexOCR; print('pix2tex import ok')"
   ```
3. Run dry-run using OCR venv:
   ```powershell
   .\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.sample.json --dry-run --limit 1
   ```
4. Run actual local OCR for 1 row:
   ```powershell
   .\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.sample.json --provider pix2tex --limit 1
   ```
5. Validate sample:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.sample.json
   ```

## Todo List

- [x] Create isolated OCR environment.
- [x] Install `pix2tex`.
- [x] Import `LatexOCR`.
- [x] Run 1-row OCR sample.
- [x] Validate output schema.
- [x] Document install time/model size if notable.

## Success Criteria

- Local provider runs without API key.
- Sample output has schema: `hash, latex, mathml, source, reviewed, notes, examples`.
- Sample row remains `reviewed=false`.

## Test And Validation

```powershell
.\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --provider pix2tex --limit 1 --output data\equation_mapping.ocr.sample.json
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.sample.json
```

## Risk Assessment

| Risk | Mitigation |
|---|---|
| `pix2tex` install huge or fails | Try `Pix2Text`, or use cloud fallback only with approval |
| Venv committed/released | Exclude from release package |
| First run downloads model slowly | Run sample before scheduling full batch |

## Security Considerations

- No API keys required.
- Do not upload images to remote providers in this phase.
- Keep caches local.

## Next Steps

If `pix2tex` works, continue Phase 03. If not, install/test `Pix2Text`.
