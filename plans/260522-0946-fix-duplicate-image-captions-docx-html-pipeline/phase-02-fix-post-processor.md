# Phase 02 - GREEN Fix In Post-Processor

## Context Links
- Extract seam to leave untouched: `tools/extract_docx.py:830-831`
- Post-fix seam: `scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py:36-56`
- Migration loop: `scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py:81-125`
- Duplicate sample: `chapters/ch1/muc-II-1.html:7-11`

## Overview
- Priority: P1
- Status: pending
- Goal: fix the duplication in the existing phase-05 HTML fixer, not in the extractor.

## Key Insights
- The extractor must stay generic because `Caption` style still labels equations and possibly future non-figure artifacts.
- The fixer already owns figure semantics and idempotent chapter rewrites, so dedupe belongs there.
- Current WIP already sketches the minimal implementation via `FIGURE_WITH_DUPLICATE_CAPTION_RE` and `remove_duplicate_caption_paragraphs()` (`scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py:39-56`).

## Requirements
- Functional: remove adjacent `<p class="caption">` only when the preceding block is a `<figure>` containing `<figcaption>`.
- Functional: handle both newly migrated `<div class="figure-container">` cases and already-migrated `<figure>` files in the same pass.
- Non-functional: remain idempotent; rerunning the fixer must report zero extra changes once clean.

## Architecture
- Input: chapter HTML plus image overrides JSON.
- Transform 1: migrate `figure-container` to `<figure>` and inject `figcaption`.
- Transform 2: run a whole-file dedupe pass that strips only duplicate caption paragraphs after semantic figures.
- Output: updated chapter HTML with one visible caption source per figure.

## Related Code Files
- Modify: `scripts/apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py`
- Read only: `tools/extract_docx.py`, `data/image_alt_overrides.json`
- Create/Delete: none

## Implementation Steps
1. Add a focused regex/helper for `figure + adjacent p.caption`.
2. Run the helper after the figure migration loop so already-migrated files are also cleaned.
3. Keep a dedicated `duplicate_captions_removed` counter for observability in `--check` and `--apply` output.
4. Do not touch `tools/extract_docx.py`; rely on the existing auto-fix hook (`tools/extract_docx.py:1136-1147`) to invoke the cleaner after each extract.

## Todo List
- [ ] Keep fix scoped to phase-05 fixer
- [ ] Clean both migrated and pre-existing `<figure>` duplicates
- [ ] Preserve equation numbering and prose
- [ ] Preserve idempotent behavior and readable counters

## Success Criteria
- After running the fixer, known duplicate files no longer contain adjacent `p.caption`.
- A second run reports no further figure/caption changes.

## Risk Assessment
- High: over-match deletes legitimate post-figure prose. Mitigation: only match `<p class="caption">`, never generic `<p>`.
- Medium: fix only applied to `figure-container` would miss already-migrated files. Mitigation: run dedupe on full file after migration loop.
- Medium: current worktree is dirty. Mitigation: implement by extending existing WIP, not rewriting the file wholesale.

## Security Considerations
- None; no new external input or executable surface.

## Next Steps
- Blocker for Phase 03: phase-05 fixer must turn Phase 01 GREEN first.

## Unresolved Questions
- None.
