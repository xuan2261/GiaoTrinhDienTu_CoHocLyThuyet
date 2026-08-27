---
phase: 5
title: "Demo backup and exports"
status: pending
priority: P1
date: 2026-08-27
dependencies: [4]
---

# Phase 05: Demo backup and exports

## Context links
- [Plan overview](plan.md)
- [Phase 02 slide/timing contract](phase-02-story-architecture-and-slide-map.md)
- [Phase 04 PPTX authoring](phase-04-deck-authoring-and-speaker-notes.md)
- [Repository scout](research/repo-scout.md)
- Next: [Phase 06](phase-06-independent-review-and-packaging.md)

## Overview
| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Priority | P1 |
| Status | pending |
| Objective | Rehearse a bounded backup demo and produce faithful PDF/preview deliverables. |

The main 15-minute presentation remains static and self-sufficient. Live demo is invoked only on request; local captures provide immediate fallback without changing the claim boundary.

## Key Insights
- A Council decision should survive a failed demo because evidence, status and sources are already in the main deck.
- Search “mô men” and `#ch1-quiz` are known findings, so they are not presented as successful demo steps.
- PowerPoint-native export on the target Windows environment provides the most faithful PDF and PNG render.
- The preview must expose all 16 slides at once for fast visual QA.

## Requirements
### Functional
- Rehearse backup slide 14 as a maximum 90-second sequence: package home → direct `#ch1-1-4` route → Sim2 interaction → PDF viewer.
- Provide a one-click verbal abort and static fallback using IMG-01, IMG-03, IMG-04 and IMG-06.
- Export the PPTX to `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9.pdf`.
- Export all 16 slides to temporary PNGs and assemble `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-preview.png` as a numbered 4 × 4 contact sheet.
- Retain speaker notes as a separate Markdown deliverable; do not expose presenter-only notes in the public PDF.

### Non-functional
- PDF and preview must preserve 16:9 framing, fonts, line wraps, image crops, source captions and backup markers.
- No network access or external CDN is required by presentation, demo or export.
- Main timing remains 15:00 even if demo is skipped; backup timing is documented separately.

## Architecture
```text
PPTX
  -> PowerPoint desktop/COM export
      -> PDF (16 pages)
      -> slide PNGs -> numbered 4x4 preview contact sheet

Candidate package (read-only)
  -> optional 90-second file:// demo
  -> immediate fallback to release-bound static captures
```

### Backup-demo runbook
| Time | Action | Proof | Abort/fallback |
|---:|---|---|---|
| 0:00–0:15 | Open `release/2026.08.25-candidate/package/index.html` via `file://`. | Offline shell loads. | Show IMG-01. |
| 0:15–0:35 | Navigate directly to `#ch1-1-4`. | Bound lesson route opens. | Show IMG-03. |
| 0:35–1:05 | Use the Sim2 moment interaction and identify `F=50 N`, `d=4.00 m`, `M=200.0 N·m`. | Canonical Sim2 responds. | Show IMG-04; do not improvise another route. |
| 1:05–1:25 | Open the integrated 139-page PDF viewer. | Local PDF opens without leaving context. | Show IMG-06. |
| 1:25–1:30 | Stop and return to Council question. | Demo stays evidence-bounded. | End immediately. |

Do not type search “mô men” or open `#ch1-quiz` during the success path. Demonstrate those only if answering a question about the disclosed open findings.

## Related files
### Read
- `release/2026.08.25-candidate/package/index.html`
- `backups/docx-option-b-20260826/captures/img-01-trang-chu-desktop-1440x1000.png`
- `backups/docx-option-b-20260826/captures/img-03-hoc-lieu-ch1-2-3-1440x1000.png`
- `backups/docx-option-b-20260826/captures/img-04-mo-men-ch1-1-4-1440x1000.png`
- `backups/docx-option-b-20260826/captures/img-06-pdf-viewer-1440x1000.png`

### Create during implementation
- `tools/slides/nghiem-thu/export-deck.ps1`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9.pdf`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-preview.png`
- Temporary only: `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/working/rendered-slides/slide-01.png` through `slide-16.png`.

## Implementation Steps
1. Prepare the read-only demo package on the actual presentation machine; disable opportunistic network access and preserve the package bytes.
2. Run the five-step backup demo twice under 90 seconds; record the actual time and any machine-specific limitation in speaker notes.
3. Verify each fallback capture is present and legible before the meeting; place all four on backup slide 14 or keep them adjacent to the deck package.
4. Implement `export-deck.ps1` with PowerPoint desktop/COM as the fidelity authority; fail clearly if PowerPoint is unavailable rather than silently changing renderers.
5. Export a 16-page PDF and one PNG per slide from the final PPTX.
6. Assemble a numbered 4 × 4 contact sheet at a minimum 1920 px width; retain slide order and mark backup slides visibly.
7. Compare PPTX slideshow, PDF pages and preview thumbnails for layout/crop/font parity; correct source deck and regenerate all derivatives together.
8. Remove temporary rendered slides only after Phase 06 review accepts the contact sheet.

## Todo
- [ ] Rehearse the backup demo twice under 90 seconds.
- [ ] Confirm all four static fallback captures are local and source-mapped.
- [ ] Export the final 16-page PDF through PowerPoint.
- [ ] Export all 16 slide PNGs and assemble the 4 × 4 preview.
- [ ] Confirm PPTX/PDF/preview parity and backup labels.
- [ ] Record export application/version and timestamp for the package manifest.

## Success Criteria
- [ ] Demo succeeds within 90 seconds or aborts cleanly to the correct static capture.
- [ ] Search and quiz-placeholder findings are not misrepresented as successful demo flows.
- [ ] PDF contains exactly 16 pages and no presenter-only notes.
- [ ] Preview shows all 16 numbered slides in correct order and is readable at full size.
- [ ] No missing font, changed line wrap, crop error or off-slide content appears across derivatives.

## Risk Assessment
| Risk | Signal | Response |
|---|---|---|
| Presentation machine blocks `file://` behavior | Shell or viewer fails | Stop live demo; use mapped captures and state environment limitation. |
| PowerPoint export changes layout | PDF differs from slideshow | Fix source layout/font usage; regenerate PPTX and every derivative. |
| Demo exceeds 90 seconds | Second rehearsal is late | Remove commentary, not evidence; use static slide if still late. |
| Contact sheet hides detail | Reviewer cannot read titles/status | Increase preview dimensions; keep 4 × 4 order and slide numbers. |

## Security/Integrity Considerations
- Demo the candidate package read-only; do not edit, rezip or overwrite evidence during rehearsal.
- Do not connect the presentation machine to external services to “fix” a missing asset at runtime.
- Record export tool/version because PDF/PNG are derivative artifacts with their own hashes.
- Static fallbacks must be release-bound captures, not newly edited composites that imply nonexistent states.

## Next steps
Proceed to Phase 06 only after the PPTX, notes, PDF and preview are synchronized and the demo/fallback runbook is rehearsed on the target environment.
