---
title: "Baseline Command Output"
description: "Phase 01 baseline snapshot and validation outputs."
status: complete
created: 2026-05-05
---

# Baseline Command Output

## Snapshot

Backup path:

```text
backups\20260505-214149-pre-local-ocr-strict-publish
```

Absolute path:

```text
D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\backups\20260505-214149-pre-local-ocr-strict-publish
```

Copied planned targets:

```text
data, tools, docs, chapters, js, equation-review.html
```

Copied extra rollback targets because no git repo:

```text
index.html, README.md, css, images, lib
```

Backup size:

```text
Files: 1683
Bytes: 42117439
```

## Baseline Counts

`python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes`

Excerpt from full command output:

```text
Paragraphs: 2230
Media files: 844
OMML math objects: 17
OLE objects: 741
Equation.DSMT4: 617
Equation.3: 124
```

## Mapping Validation

`python tools\validate_equation_mapping.py --input data\equation_mapping.template.json`

```text
Rows: 702
Unique hashes: 702
Reviewed: 0
OK
```

`python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json`

```text
Rows: 702
Unique hashes: 702
Reviewed: 0
OK
```

`python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict`

```text
Rows: 0
Unique hashes: 0
Reviewed: 0
Errors: 2
ERROR strict mode requires 702 unique rows, found 0
ERROR strict mode requires a non-empty mapping
```

Strict publish failure is expected baseline before reviewed mapping merge.

## Environment Check

`python -c "import importlib.util as u; print({m: bool(u.find_spec(m)) for m in ['torch','pix2tex','pix2text']})"`

```text
{'torch': False, 'pix2tex': False, 'pix2text': False}
```

`Select-String -Path equation-review.html -Pattern "confidence"`

```text
No matches.
```

`python -m compileall -q tools`

```text
Pass.
```

No OCR dependency/artifact mixed into release tree at baseline:

```text
.venv-ocr: absent
torch: absent
pix2tex: absent
pix2text: absent
```

Runtime/generated rollback targets were compared after Phase 01:

```text
Current files: 1683
Backup files: 1683
Diff: 0
```

## Unresolved Questions

- None for Phase 01.
