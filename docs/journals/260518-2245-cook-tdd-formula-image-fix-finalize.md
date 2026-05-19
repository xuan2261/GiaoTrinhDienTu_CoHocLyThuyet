---
date: 2026-05-18
slug: cook-tdd-formula-image-fix-finalize
plan: plans/260518-2100-fix-formula-image-and-dupes/
mode: /cook --tdd
---

# /cook --tdd Finalize: Formula-as-Image Plan

## Context

Plan was ~95% done before this session. Earlier work (in uncommitted state) had already:
- Replaced 6 / deleted 2 raster formulas
- Stripped 40 MathML+KaTeX duplicate pairs
- Migrated 127 figures to `<figure>/<figcaption>`
- Added `--strict-formula-image` audit, KaTeX `htmlAndMathml`, alt-overrides, CSS sync
- Wired `tools/extract_docx.py --auto-fix-known-issues` post-processor
- 7 plain-Python phase tests + 1 Playwright smoke spec
- Updated docs/changelog/standards

This session's job: verify everything green, fill the only remaining stub (Phase 03 Front B), finalize.

## What I actually wrote

One file: `scripts/test-phase-03-pipeline-extract-docx-no-duplicate-regeneration.py` (61 lines, plain stdlib).

Asserts the auto-fix wiring in `tools/extract_docx.py` exists:
- `--auto-fix-known-issues` flag
- `def _run_auto_fix_known_issues` helper (tightened from substring `_run_auto_fix_known_issues` after code-review feedback to avoid docstring false-match)
- dedupe script in candidate list
- `--idempotent` invocation

Then runs `dedupe ... --check` as subprocess and parses output. Tightened to assert both `Files to change: 0` AND `total pairs: 0` (format-regression coverage) per code-review.

## Non-obvious bits

**Phase 03 was the real risk.** Front A (HTML regex) was idempotent and clean. But re-extract from DOCX (Front B) could re-introduce the 40 pairs if pipeline never fixed the root cause. The plan resolved this without an `extract_docx.py` rewrite by adding a post-processor (`--auto-fix-known-issues`, default ON) that re-runs `replace-eight-...py`, `dedupe-mathml-...py`, `apply-image-alt-...py`, `fill-remaining-...py` after every `--write` extract. This is the correct pragmatic call: a post-processor is auditable and idempotent; rewriting the OMML→HTML path would be much higher-risk for 645 valid MathML rows.

The Front B test verifies the wiring is intact, NOT that re-extract was actually run (which would be destructive on this session). Re-extract idempotency is gated by the post-processor invocation list.

**Plain Python > pytest** confirmed correct. Each phase test = single file, exit 0/1, no fixtures, no conftest, no plugin. Reads regex straight off HTML. Total runtime for all 7 < 5s. Zero new requirements file. The `npm run test:equations` PowerShell wrapper just iterates them. KISS won.

**Allowlist exception** for `images/ch1/hinh-172.png`: 1-bit + small + sits next to keyword `phản lực`. Heuristic flags it as a formula glyph but it is the actual mechanics-problem line drawing of a clamped beam AC. Allowlisting is correct; tightening the heuristic would be over-engineering.

## What didn't happen

User chose to skip:
- `npm run test:sim:release` (heavy gate, ~2-5min, requires Chromium) — none of this plan touches the simulation engine, so it was the right call to defer to CI.
- Git tag `v-2026-05-18-formula-fix` — premature locally; tag after CI.

## Result

Commit `15bc0d5` on master: 115 files (49 modified, 58 created, 8 deleted). `.gitignore` extended to cover `*.rar`. 4 ad-hoc `review-*.png` screenshots left untracked at user's discretion.

Phase TDD: 7/7 PASS.
Audit: `--strict-images --strict-formula-image` PASS (0 suspects, 0 errors, 102 OK).
Playwright Phase 07 smoke: 9/9 PASS in 4.3s.
`scripts/audit-all-formula-as-image.py`: 0 references to deleted images.
`scripts/detect-duplicate-math-broad.py`: 0 duplicates.
`tools/validate_equation_mapping.py --strict --katex`: 702/702 reviewed, OK.

## Unresolved (carried over from release-gate report)

- 2 pre-existing critical formula-as-image entries (`hinh-078.png`, `hinh-211.png`) still flagged by `audit-all-formula-as-image.py` — out of plan scope (Phase 02 was OCR-bounded to 8 entries).
- 42 alt strings from section-title fallback are accurate-but-generic; user noted manual hand-tuning is optional follow-up.
- Playwright `npm run test:sim:release` not wet-tested — defer to CI per user choice.
