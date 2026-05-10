---
title: "Validation Report"
description: "Critical questions và gates cho semantic math strict publish."
status: complete
created: 2026-05-05
---

# Validation Report

## Critical Decisions

| Question | Current Answer | Impact |
|---|---|---|
| API key required? | No. Local OCR first. | Satisfies user preference |
| Model download allowed? | Yes. User approved. | Enables `pix2tex`/`Pix2Text` |
| Publish without manual review? | No. Never. | Protects correctness |
| Strict publish required? | Plan targets strict. | No equation image fallback in release |
| Keep cloud fallback? | Optional, explicit fallback only. | Useful for hard rows |

## Phase Gates

| Gate | Must Pass Before |
|---|---|
| Baseline backup exists | Local OCR setup |
| OCR env smoke test pass | OCR sample |
| Sample review accepted | Full OCR batch |
| OCR output validates | Review UI generation |
| 702 rows reviewed | Merge publish mapping |
| Strict mapping validate pass | Regenerate textbook |
| Strict audit pass | Release QA |
| Browser QA pass | Release package |

## Validation Commands

```powershell
python -m compileall -q tools
python tools\validate_equation_mapping.py --input data\equation_mapping.template.json
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict
node --check js\app.js
node --check js\loader.js
node --check js\pages.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\simulations.js
python tools\audit.py
python tools\audit.py --strict-equations
```

## Unresolved Questions

| Question | Default Assumption |
|---|---|
| Minimum OCR sample accuracy? | >= 80 percent usable after minor edits |
| Batch size for manual review? | 50 rows per batch |
| Second reviewer available? | If not, do self second-pass random 10 percent |
| Cloud fallback allowed for hard rows? | No unless explicitly approved |
| `.venv-ocr` location? | Prefer project root ignored or external temp path |
