---
title: Fix deterministic DOCX image extraction
date: 2026-08-28
summary: Removed volatile ImageMagick PNG date/time metadata and proved consecutive canonical builds are byte-identical
---

# Fix deterministic DOCX image extraction

## What happened

Audit found that repeated WMF/EMF conversion changed PNG bytes although dimensions and IDAT payloads were identical. ImageMagick injected volatile `tIME` and `date:*` text chunks.

## Decision

`tools/extract_docx.py` now excludes only PNG `date,time` chunks. Stable `cHRM`, `pHYs`, and `IDAT` chunks remain. A real-data regression converts `word/media/image173.wmf` twice and requires byte equality plus metadata invariants.

## Verification

- Pre-fix regression failed on byte inequality.
- Post-fix focused tests passed.
- Two consecutive canonical builds produced zero hash changes across 248 generated artifacts.
- Reader, content, manifest, release, syntax, and 96-file audit gates passed.

## Next steps

Commit and push the deterministic extraction fix after user approval.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
