# Phase 01 - RED Regression Guard

## Context Links
- Root cause source: `tools/extract_docx.py:830-831`
- Existing figure regression test: `scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py:27-34`
- Concrete duplicate samples: `chapters/ch1/muc-II-1.html:7-11`, `chapters/ch2/muc-I-3.html:8-12`
- Non-target caption sample to preserve: `chapters/ch2/muc-I-1.html:55`

## Overview
- Priority: P1
- Status: pending
- Goal: add a narrow regression that fails only when a `<figure>` with `<figcaption>` is immediately followed by a duplicate DOCX caption paragraph.

## Key Insights
- `p.caption` is not figure-only; equation numbering still uses the same class, so the assertion must be structure-based, not global-delete-based.
- Current WIP already points at the right regex seam in `scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py:30-33`.

## Requirements
- Functional: fail when generated HTML contains `<figure>...<figcaption>...</figcaption>...</figure>` followed by `<p class="caption">...</p>`.
- Non-functional: zero false positives for math blocks and non-figure captions.

## Architecture
- Input: generated chapter HTML from `chapter_files()`.
- Transform: regex scan per file, collect first offenders with offsets for debugging.
- Output: deterministic test failure before code fix.

## Related Code Files
- Modify: `scripts/test-phase-05-alt-text-figcaption-figure-tag-migration.py`
- Read only: `chapters/**/*.html`, `tools/extract_docx.py`
- Create/Delete: none

## Implementation Steps
1. Add a regex that matches `figure + figcaption + adjacent p.caption`.
2. Scan each chapter HTML and collect offender tuples `(relative_path, offset)`.
3. Fail with a short summary showing count and first 5 offenders.
4. Run the test once before the fix to confirm RED on a clean baseline; if current WIP already turns it GREEN, record that the RED step is already satisfied by prior local edits.

## Todo List
- [ ] Add narrow duplicate-caption matcher
- [ ] Exclude non-figure `p.caption` implicitly by structural matching
- [ ] Confirm RED on baseline or document that local WIP already passed it

## Success Criteria
- Test fails on known duplicate samples before the fixer change.
- Test does not fail on equation captions like `chapters/ch2/muc-I-1.html:55`.

## Risk Assessment
- High: false positive against non-figure caption paragraphs. Mitigation: require both `<figure>` and `<figcaption>` in the same match.
- Medium: grouped figures may hide the duplicate behind the last figure. Mitigation: regex must allow arbitrary figure body and rely on the final adjacent `p.caption`.

## Security Considerations
- None; content-only verification.

## Next Steps
- Blocker for Phase 02: RED guard must exist first.

## Unresolved Questions
- None.
