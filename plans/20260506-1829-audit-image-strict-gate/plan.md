---
title: "Audit Image Strict Gate"
description: "Lam sach audit image signal: figure hop le khong tinh warning, them strict image gate cho publish."
status: completed
priority: P1
created: 2026-05-06
tags: [tools, audit, qa, docs]
---

# Audit Image Strict Gate

## Overview

`tools/audit.py` hien warn moi file co `<img>`, ke ca textbook figures hop le. Scope nay tach audit thuong va publish gate: audit thuong khong tinh figure hop le la warning; `--strict-images` bat loi image metadata/wrapper/path khi publish.

## Requirements

- Default `python tools/audit.py` khong con 50 warning gia do figure hop le.
- Them `python tools/audit.py --strict-images`.
- Strict image gate fail neu image thieu file, tiny, wrapper khong hop le, figure khong co caption/context gan ke, hoac artifact-figure co alt generic `Cong thuc ...`.
- Khong sua tay `chapters/` hay `js/pages.js`.
- Cap nhat docs validation va changelog.

## Implementation Steps

1. Them regression tests cho audit image behavior.
2. Refactor `tools/audit.py` de parse `<img>` context va thu thap image metrics.
3. Doi default warning: valid figure images thanh info count.
4. Them `--strict-images` section va exit non-zero khi co strict image errors.
5. Cap nhat `docs/code-standards.md` va `docs/project-changelog.md`.

## Validation

- `python tools/test_audit_image_gate.py`
- `python tools/audit.py`
- `python tools/audit.py --strict-images`
- `python tools/audit.py --strict-equations`
- `python tools/validate_equation_mapping.py --input data/equation_mapping.json --strict --katex`
- `python -m compileall -q tools`

## Success Criteria

- Audit thuong exit 0, `0 warnings`, `0 errors`.
- Strict image gate pass corpus hien tai va van fail voi orphan figure thieu caption/context.
- Strict equations van pass.

## Completion Notes

- Default `python tools\audit.py` pass: 99 files, 99 OK, 0 warnings, 0 errors; `Figures: 136 valid`.
- `python tools\audit.py --strict-images` pass: 99 files, 99 OK, 0 warnings, 0 errors; all local images satisfy publish image gate.
- Caption/context detection now stops at real text boundaries, accepts adjacent figure groups that share one caption, accepts nearby text context/evidence, and handles short inline figure fragments such as `hinh-240`.
- `tools/audit.py` is import-safe for unit tests.
- Artifact-figure rows now carry reviewed alt text in `data/equation_mapping*.json`; DOCX pipeline regenerates those alts without generic `Công thức ...`.
- Strict equation gate remains separate and pass.

## Risks

- Caption proximity tu DOCX co the khong dong nhat; gate chap nhan caption ngay truoc/sau gan figure, caption nhom cho cac figure lien ke khong co text xen giua, hoac nearby textbook context/evidence.
- Strict image gate khong nen thanh default de tranh can workflow daily.

## Unresolved Questions

- None.
