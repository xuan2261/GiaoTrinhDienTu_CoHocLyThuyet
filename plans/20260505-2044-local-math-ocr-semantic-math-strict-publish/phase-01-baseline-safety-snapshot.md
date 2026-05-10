---
title: "Phase 01 - Baseline Safety Snapshot"
status: complete
priority: P1
effort: 2h
---

# Phase 01 - Baseline Safety Snapshot

## Context Links

- [Plan](./plan.md)
- [Codebase Scout](./reports/codebase-scout-report.md)
- `README.md`
- `docs/docx-sync-pipeline.md`
- `tools/equation_report.json`

## Overview

Create a recoverable baseline before installing OCR dependencies or regenerating generated outputs.

## Key Insights

- No git repository detected, so filesystem backup is mandatory.
- Generated files are large and should be reproducible.
- Current `data/equation_mapping.json` is empty.

## Requirements

Functional:
- Snapshot current `data/`, `tools/`, `docs/`, `equation-review.html`, `chapters/`, `js/pages.js`.
- Record baseline counts and command outputs.

Non-functional:
- No destructive commands.
- Backup path timestamped.
- No manual edits to generated runtime files.

## Architecture

```text
current repo state -> backup folder -> baseline report -> phase gate
```

## Related Code Files

Modify:
- None.

Create:
- `backups/{timestamp}-pre-local-ocr-strict-publish/`
- Optional `plans/.../reports/baseline-command-output.md`

Delete:
- None.

## Implementation Steps

1. Create backup folder:
   ```powershell
   $ts = Get-Date -Format "yyyyMMdd-HHmmss"
   New-Item -ItemType Directory -Force "backups\$ts-pre-local-ocr-strict-publish"
   ```
2. Copy high-risk files/folders:
   ```powershell
   Copy-Item data,tools,docs,chapters,js,equation-review.html "backups\$ts-pre-local-ocr-strict-publish" -Recurse
   ```
3. Record current counts:
   ```powershell
   python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
   python tools\validate_equation_mapping.py --input data\equation_mapping.template.json
   python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
   ```
4. Confirm no local OCR package installed:
   ```powershell
   python -c "import importlib.util as u; print({m: bool(u.find_spec(m)) for m in ['torch','pix2tex','pix2text']})"
   ```
5. Confirm generated review UI has no schema drift:
   ```powershell
   Select-String -Path equation-review.html -Pattern "confidence"
   ```

## Todo List

- [x] Create backup folder.
- [x] Copy high-risk files.
- [x] Save baseline command outputs.
- [x] Validate template and OCR queue.
- [x] Confirm no untracked local OCR artifacts are mixed into repo release.

## Success Criteria

- Backup exists and contains target files.
- Baseline validates: template 702 rows, OCR queue 702 rows.
- Current failure state understood: publish mapping not strict-ready.

## Test And Validation

```powershell
python -m compileall -q tools
python tools\validate_equation_mapping.py --input data\equation_mapping.template.json
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
```

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Backup incomplete | Use explicit folder list and verify sizes |
| Accidentally overwrite backup | Timestamped folder |
| No git history | Keep backup before every generated-output phase |

## Security Considerations

- Do not copy `.env` or API keys if they appear later.
- Backup is local only; do not publish model caches or secrets.

## Next Steps

Proceed to Phase 02 only after backup and baseline validation pass.
