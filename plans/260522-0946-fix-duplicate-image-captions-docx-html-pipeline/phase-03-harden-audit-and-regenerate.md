# Phase 03 - Harden Audit And Regenerate Outputs

## Context Links
- Audit caption logic: `tools/audit.py:199-245`
- Strict image gate: `tools/audit.py:367-390`
- Audit tests to extend: `tools/test_audit_image_gate.py:30-103`
- Pipeline commands: `README.md`

## Overview
- Priority: P2
- Status: pending
- Goal: add a focused publish guard, then rerun the chapter/bundle pipeline so generated outputs match the source fix.

## Key Insights
- `tools/audit.py` currently passes even when duplicate visible captions existed because it only checks for nearby caption/context, not duplicated rendering.
- Existing audit tests already cover caption leakage, grouped figures, and previous-caption behavior; the new guard should reuse those semantics instead of introducing a parser rewrite.
- `js/pages.js` is generated and must be rebuilt if any chapter HTML changes.

## Requirements
- Functional: under `--strict-images`, fail if a semantic `<figure>` with `<figcaption>` is immediately followed by duplicate `<p class="caption">`.
- Functional: keep existing acceptance for nearby caption/context on non-duplicate figure scenarios.
- Non-functional: no change to default audit mode unless required; keep blast radius in strict publish path only.

## Architecture
- Input: chapter HTML after fixer output.
- Transform 1: audit strict mode adds one duplicate-caption rule.
- Transform 2: pipeline regenerates navigation and bundle artifacts from cleaned chapters.
- Output: clean chapter fragments plus refreshed `js/pages.js`.

## Related Code Files
- Modify: `tools/audit.py`, `tools/test_audit_image_gate.py`
- Regenerate: `chapters/**/*.html`, `js/pages.js`
- Read only: `README.md`
- Create/Delete: none

## Implementation Steps
1. Add a small helper or strict-rule check for `figure + figcaption + adjacent p.caption`; keep it inside `--strict-images`.
2. Add unit coverage in `tools/test_audit_image_gate.py` for duplicate rejection while preserving current group/previous-caption tests.
3. Run the pipeline in order:
   1. `python tools/extract_docx.py --input CoHocLyThuyet_Full_New.docx --write`
   2. `python tools/update_nav.py`
   3. `python tools/bundle_pages.py`
4. Re-run verification:
   1. `python scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py`
   2. `python -m unittest tools/test_audit_image_gate.py`
   3. `python tools/audit.py --strict-images`
   4. `rg -n -U -P '<figure\\b[\\s\\S]{0,500}?</figure>\\s*<p class=\"caption\"' chapters`

## Todo List
- [ ] Add strict duplicate-caption audit rule
- [ ] Extend audit unit tests
- [ ] Regenerate chapter outputs and `js/pages.js`
- [ ] Re-run focused verification commands

## Success Criteria
- Strict audit fails on a synthetic duplicate fixture and passes on cleaned real chapters.
- `rg` returns zero duplicate figure-caption matches in `chapters/`.
- `js/pages.js` is regenerated after chapter changes.

## Risk Assessment
- High: false positives against legitimate grouped figure caption semantics. Mitigation: keep existing group-aware logic (`tools/audit.py:199-245`) and only fail when a semantic figure already has its own `figcaption`.
- Medium: implementer forgets bundle refresh, leaving runtime content stale. Mitigation: `bundle_pages.py` is a mandatory verification step, not optional.
- Low: stats in audit tests may drift if file counts change. Mitigation: keep new assertions scoped to the duplicate-caption rule, not file-count numerics.

## Security Considerations
- None; local content validation only.

## Next Steps
- After completion, docs impact is minor at most; update docs only if the team wants the stricter publish rule recorded in `docs/docx-sync-pipeline.md`.

## Unresolved Questions
- None.
