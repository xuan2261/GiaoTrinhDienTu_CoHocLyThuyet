---
title: "Fix duplicate image captions in DOCX HTML pipeline"
description: "Keep figcaption canonical and remove adjacent duplicate p.caption after figures."
status: pending
priority: P1
effort: 3h
branch: master
tags: [docx-pipeline, figure-caption, tdd, html]
created: 2026-05-22
blockedBy: []
blocks: []
---
# Plan
## Goal
- Keep `<figcaption>` as the single visible caption for figures.
- Remove only adjacent duplicate `<p class="caption">` after a `<figure>` that already has `<figcaption>`.
- Do not refactor extractor behavior; `tools/extract_docx.py` must stay generic because `Caption` style is also used for non-figure content such as equation numbering (`tools/extract_docx.py:830-831`, `chapters/ch2/muc-I-1.html:55`).

## Root Cause
- Extract emits `p.caption` from DOCX `Caption` paragraphs (`tools/extract_docx.py:830-831`).
- Phase-05 fixer is the correct seam because it already migrates `figure-container` to semantic `<figure>` and injects `<figcaption>` (`scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py:36-56`, `scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py:86-116`).
- Current duplicate pattern is confirmed in generated HTML, e.g. `chapters/ch1/muc-II-1.html:7-11` and `chapters/ch2/muc-I-3.html:8-12`.
- `tools/audit.py` currently validates nearby caption/context but does not fail duplicate visible captions (`tools/audit.py:199-245`, `tools/audit.py:367-390`).

## Phases
| Phase | Status | Output | File ownership |
|---|---|---|---|
| [01 RED](./phase-01-red-regression-guard.md) | pending | Failing regression for `<figure>...<figcaption>...</figure><p class="caption">` | `scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py` |
| [02 GREEN](./phase-02-fix-post-processor.md) | pending | Idempotent duplicate-caption cleanup in the phase-05 fixer only | `scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py` |
| [03 VERIFY](./phase-03-harden-audit-and-regenerate.md) | pending | Publish gate + regenerated chapter outputs and bundle | `tools/audit.py`, `tools/test_audit_image_gate.py`, `chapters/**/*.html`, `js/pages.js` |

## Data Flow
- Input: `CoHocLyThuyet_Full_New.docx` -> `tools/extract_docx.py` writes `chapters/**/*.html`.
- Transform: phase-05 fixer normalizes figure markup and removes duplicate adjacent caption paragraphs.
- Output: regenerated `chapters/**/*.html`; then `tools/update_nav.py` and `tools/bundle_pages.py` refresh navigation artifacts and `js/pages.js`.

## Success Criteria
- Zero matches of `<figure ... </figure><p class="caption">` in `chapters/**/*.html`.
- `python scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py` passes.
- `python -m unittest tools/test_audit_image_gate.py` passes.
- `python tools/audit.py --strict-images` passes.
- If any chapter file changes, `python tools/bundle_pages.py` regenerates `js/pages.js`.

## Rollback
- Revert only phase-specific source edits.
- Re-run DOCX extract + post-fix on the previous known-good script revision, then regenerate `js/pages.js`.

## Status Note
- Working tree already contains user/WIP edits in `scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py`, `scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py`, many `chapters/**/*.html`, and `js/pages.js`; implementation must preserve unrelated local changes.
