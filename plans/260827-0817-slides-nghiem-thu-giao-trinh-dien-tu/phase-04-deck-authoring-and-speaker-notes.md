---
phase: 4
title: "Deck authoring and speaker notes"
status: pending
priority: P1
date: 2026-08-27
dependencies: [1, 2, 3]
---

# Phase 04: Deck authoring and speaker notes

## Context links
- [Plan overview](plan.md)
- [Phase 01 factual gates](phase-01-evidence-lock-and-factual-gates.md)
- [Phase 02 slide map](phase-02-story-architecture-and-slide-map.md)
- [Phase 03 visual system](phase-03-visual-system-and-slide-templates.md)
- Next: [Phase 05](phase-05-demo-backup-and-exports.md)

## Overview
| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Priority | P1 |
| Status | pending |
| Objective | Generate the complete 16-slide PPTX and synchronized speaker-notes artifact. |

Authoring is programmatic and source-driven: immutable theme tokens plus content records plus claim IDs produce a reproducible PPTX. Human editorial review remains mandatory; generation alone is not acceptance.

## Key Insights
- PptxGenJS is suitable for deterministic wide-layout authoring, reusable primitives and embedded speaker notes.
- Slide content must consume the source map rather than retyping numerical claims in layout code.
- The PPTX and standalone notes file are two views of the same notes records; drift between them is a release blocker.
- Cover identity is text, not a logo substitute.

## Requirements
### Functional
- Generate exactly 16 slides in locked order: `S01`–`S13`, `B14`–`B16`.
- Set wide layout to `13.333 × 7.5 in` / `720 × 405 pt` and document properties/language for Vietnamese.
- Generate `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9.pptx`.
- Generate `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-speaker-notes.md` from the same notes records embedded in PPTX.
- Include source/candidate/date captions, slide numbers, main/backup markers and alt text.

### Non-functional
- No external/network asset at build or presentation time.
- No text below 10.5 pt; no clipping, overlap, off-slide element or inaccessible status-by-color-only.
- Do not add decorative content, new claims, invented institutional marks or unsourced author details.
- Main-deck timing metadata must sum to 900 seconds.

## Architecture
```text
source-map.csv + deck-content.mjs + deck-theme.mjs
            -> build-deck.mjs
            -> 16-slide PPTX
            -> notes records -> embedded notes + speaker-notes.md
```

Authoring modules:
- `deck-theme.mjs`: tokens, geometry, typography and primitive layout helpers.
- `deck-content.mjs`: slide IDs, times, claims, visual IDs, spoken script, alt text and Q&A.
- `build-deck.mjs`: PptxGenJS assembly, validation assertions, image fitting and output writing.
- `export-deck.ps1`: Office/LibreOffice export and rendering, owned by Phase 05.

### Content lock by section
| Slides | Authoring focus | Required guardrail |
|---|---|---|
| 01–03 | Cover, mandate, accountable scope | Three authors; no logo; no final-release claim. |
| 04–07 | Learner journey, offline, interaction, simulation | Feature counts remain bounded; Sim3 labeled pilot/fallback. |
| 08–09 | Integrity and accessibility | Automated evidence does not become human certification. |
| 10–12 | Candidate, acceptance, closure conditions | Both ZIP hashes; `blocked`; four gates + hash reconciliation + two findings. |
| 13 | Proposed resolution | Conditional academic–pedagogical approval only. |
| 14–16 | Demo, evidence, Q&A | Marked backup and excluded from 15:00. |

## Related files
### Read
- `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-source-map.csv`
- Release-bound captures and canonical figures registered in Phase 01.

### Create during implementation
- `tools/slides/nghiem-thu/deck-theme.mjs`
- `tools/slides/nghiem-thu/deck-content.mjs`
- `tools/slides/nghiem-thu/build-deck.mjs`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9.pptx`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-speaker-notes.md`

### Modify during implementation
- `package.json` and lockfile: pin PptxGenJS as a dev-only authoring dependency and expose one explicit deck-build command.

## Implementation Steps
1. Create the authoring modules and centralize all paths relative to repository root; reject missing inputs before writing outputs.
2. Configure PptxGenJS wide layout, theme fonts, document title/subject/author, `vi-VN` metadata where supported and no automatic slide transitions.
3. Implement tokenized primitives and template functions from Phase 03 with deterministic z-order and reading order.
4. Convert Phase 02 rows into 16 typed content records; assert unique IDs, exact order and a 900-second main sum.
5. Build slide 01 with full author strings, Council/unit/location text and no logo placeholder.
6. Build slides 02–09 using source-mapped statements and release-bound visuals; retain canonical image colors/aspect ratios.
7. Build slide 10 with both full hashes in notes and unambiguous visible mismatch/open-condition treatment.
8. Build slides 11–13 with exact status taxonomy, closure owners/evidence and conditional resolution wording.
9. Build backup slides 14–16 with the demo sequence, evidence drill-down and Q&A boundaries.
10. Embed notes from each content record and render the same records to standalone Markdown; compare slide IDs/times/source IDs one-to-one.
11. Write the PPTX only after structural assertions pass; leave PDF/preview generation to Phase 05.

## Todo
- [ ] Add and pin the authoring dependency.
- [ ] Implement shared theme/layout/content modules.
- [ ] Author all 13 main slides in locked order.
- [ ] Author all three backup slides and markers.
- [ ] Embed and export synchronized notes for all 16 slides.
- [ ] Assert slide count, IDs, source IDs and timing totals.
- [ ] Confirm output opens without repair warnings before export.

## Success Criteria
- [ ] PPTX opens as 16:9, contains exactly 16 slides and preserves intended fonts/layout.
- [ ] Cover contains all three authors and no logo/crest/seal graphic or empty placeholder.
- [ ] Notes Markdown and embedded notes have 16 matching records with identical claim IDs and timings.
- [ ] Slides 10–13 preserve hash mismatch, blocked state and conditional-decision boundaries.
- [ ] All visuals have alt text and source captions; no slide contains overflow or tiny type.

## Risk Assessment
| Risk | Signal | Response |
|---|---|---|
| PptxGenJS output differs in PowerPoint | Font substitution, crop or line wrap changes | Use system fonts only; inspect actual PowerPoint render and adjust primitives. |
| Notes drift from slides | Different source IDs/timing/text | Generate both from one content record; block export on mismatch. |
| Author title wraps badly | Cover exceeds allocated block | Use a structured three-row author block; never abbreviate identity to save space. |
| Builder silently omits image | Missing path or unsupported format | Fail before output; do not use blank placeholder or synthetic replacement. |

## Security/Integrity Considerations
- Treat DOCX, JSON, PNG and ZIP inputs as untrusted files for path resolution; allow only expected repo-relative inputs.
- Do not execute embedded content/macros from source documents while extracting facts or images.
- Strip local filesystem prefixes and build-machine metadata from PPTX properties and notes.
- Do not reuse the candidate release hash as the presentation package hash; they identify different artifacts.

## Next steps
When PPTX and notes open cleanly and structural assertions pass, proceed to Phase 05 for backup-demo rehearsal, PDF export and visual preview generation.
