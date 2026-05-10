---
title: "Codebase Scout Report"
description: "Scout trạng thái repo cho semantic math strict publish."
status: complete
created: 2026-05-05
---

# Codebase Scout Report

## Summary

Repo là static textbook offline-first. Nội dung chính sinh từ `CoHocLyThuyet_Full_New.docx`. Equation flow đã có đủ script: report, template, OCR prefill, review HTML, merge, strict audit.

## Relevant Files

| Path | Role |
|---|---|
| `CoHocLyThuyet_Full_New.docx` | Source of truth |
| `tools/analyze_docx.py` | Count outline/media/OMML/OLE |
| `tools/extract_docx.py` | Generate fragments/images/equation report |
| `tools/equation_report.json` | 925 media records, 791 math refs |
| `tools/export_equations_for_review.py` | Create 702-row template |
| `tools/ocr_equation_mapping.py` | Local/cloud OCR prefill |
| `tools/build_equation_review_html.py` | Offline review UI |
| `tools/merge_equation_mapping.py` | Merge reviewed rows |
| `tools/validate_equation_mapping.py` | Mapping validation |
| `tools/audit.py` | Content/equation audit |
| `data/equation_mapping.template.json` | 702 unique hash queue |
| `data/equation_mapping.ocr.json` | Current OCR queue, reviewed 0 |
| `data/equation_mapping.json` | Publish mapping, currently empty |
| `equation-review.html` | Review UI generated |
| `chapters/`, `js/pages.js` | Generated runtime content |

## Current Counts

| Metric | Value |
|---|---:|
| DOCX paragraphs | 2230 |
| Media files | 844 |
| OMML math objects | 17 |
| OLE objects | 741 |
| Equation.DSMT4 | 617 |
| Equation.3 | 124 |
| Math refs | 791 |
| Unique math hashes | 702 |
| Inline math refs | 515 |
| Display math refs | 276 |
| Figure records | 134 |

## By Chapter

| Chapter | Refs | Unique | Inline | Display |
|---:|---:|---:|---:|---:|
| 1 | 217 | 174 | 148 | 69 |
| 2 | 296 | 264 | 206 | 90 |
| 3 | 278 | 264 | 161 | 117 |

## Environment

| Tool | Status |
|---|---|
| Python 3.11 | Available |
| Node 22 | Available |
| ImageMagick | Available |
| uv | Available |
| `pix2tex` | Not installed |
| `Pix2Text` | Not installed |
| `torch` | Not installed |
| Pandoc/Tesseract/LibreOffice CLI | Not found |

## Constraints

- No git repository detected in current folder.
- No package manager files: no `package.json`, `pyproject.toml`, `requirements.txt`.
- Generated files must not be manually edited except via generator.
- `data/equation_mapping.json` only uses rows with `reviewed=true`.
- Strict publish must eliminate `math-img-inline` and `math-img-block`.

## Recommended Work Boundaries

| Area | Ownership |
|---|---|
| OCR setup | External `.venv-ocr`, do not pollute main Python |
| Mapping data | `data/equation_mapping*.json` through scripts only |
| Review UI | Generated from `tools/build_equation_review_html.py` |
| Runtime output | Regenerate `chapters/`, `js/pages.js`; do not edit manually |

Unresolved questions:
- Repo lacks `.gitignore`; if `.venv-ocr` is created in root, should add ignore policy or create outside repo.
