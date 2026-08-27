---
phase: 6
title: "Independent review and packaging"
status: pending
priority: P1
date: 2026-08-27
dependencies: [5]
---

# Phase 06: Independent review and packaging

## Context links
- [Plan overview](plan.md)
- [Phase 01 factual gates](phase-01-evidence-lock-and-factual-gates.md)
- [Phase 03 visual system](phase-03-visual-system-and-slide-templates.md)
- [Phase 05 exports/demo](phase-05-demo-backup-and-exports.md)
- [All research](research/)

## Overview
| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Priority | P1 |
| Status | pending |
| Objective | Obtain independent factual/visual/timing approval and package immutable presentation deliverables. |

This is the release gate for the presentation package, not for the textbook candidate. Presentation approval cannot close the candidate’s academic, accessibility, smoke, Word or ZIP-integrity conditions.

## Key Insights
- Author self-review is necessary but insufficient for a Council-facing evidence deck.
- Visual QA must inspect the real PowerPoint slideshow and exported PDF, not only source coordinates.
- Packaging happens only after all derivatives are synchronized and reviewed.
- The presentation package receives its own checksums; these must never be confused with candidate-release hashes.

## Requirements
### Functional
- Assign a reviewer who did not author the deck or prepare the Phase 01 evidence ledger.
- Review all 16 slides, 16 notes entries, source-map rows, PDF pages, preview tiles and the backup-demo runbook.
- Produce `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-independent-review.md` with reviewer, environment, findings, disposition and evidence paths.
- Produce `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-manifest.sha256` over approved deliverables.
- Produce `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-package.zip` only after review disposition is PASS.

### Non-functional
- Any Critical/High factual, integrity or readability finding blocks packaging.
- Any change to PPTX, notes or source map invalidates prior PDF/preview hashes and requires re-export/re-review.
- Package must be self-contained for presentation review but must not embed the unresolved candidate ZIP.

## Architecture
```text
PPTX + PDF + preview + notes + source map
  -> author QA
  -> independent factual / visual / timing / integrity review
  -> remediation loop if any blocker
  -> independent-review.md
  -> manifest.sha256
  -> presentation package ZIP
```

### Review gates
| Gate | Checks | Pass condition |
|---|---|---|
| R1 Structure/timing | 13 main + 3 backup; notes timings | Main totals exactly 15:00; backup excluded. |
| R2 Factual | Every claim/source/status/visual | Source map resolves; no unsupported or stale claim. |
| R3 Decision boundary | Slides 1, 10–13 and notes | Conditional approval only; final release remains blocked. |
| R4 ZIP integrity wording | Both hashes, sizes, status | Mismatch visible; no confirmed hash-lock wording anywhere. |
| R5 Visual | PowerPoint slideshow, PDF, preview, projector/grayscale | No overflow; type ≥10.5 pt; readable status/captions; no invented logo. |
| R6 Accessibility | Contrast, reading order, alt text, color redundancy | Required information survives grayscale/PDF; alt text and notes exist. |
| R7 Demo | 90-second runbook and fallback | Direct route/Sim2/PDF succeeds or aborts to static evidence. |
| R8 Package integrity | File inventory and checksums | Approved files only; hashes recompute; no local secrets/paths. |

### Package inventory
1. `giao-trinh-dien-tu-nghiem-thu-16x9.pptx`
2. `giao-trinh-dien-tu-nghiem-thu-16x9.pdf`
3. `giao-trinh-dien-tu-nghiem-thu-16x9-preview.png`
4. `giao-trinh-dien-tu-nghiem-thu-16x9-speaker-notes.md`
5. `giao-trinh-dien-tu-nghiem-thu-16x9-source-map.csv`
6. `giao-trinh-dien-tu-nghiem-thu-16x9-independent-review.md`
7. `giao-trinh-dien-tu-nghiem-thu-16x9-manifest.sha256`

The package ZIP contains these seven files at its root. Candidate release files remain external/read-only and are referenced by repo-relative path in notes/source map.

## Related files
### Review inputs
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9.pptx`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9.pdf`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-preview.png`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-speaker-notes.md`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-source-map.csv`

### Create during implementation
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-independent-review.md`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-manifest.sha256`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-package.zip`

## Implementation Steps
1. Freeze candidate presentation inputs and record PPTX/PDF/preview/notes/source-map hashes before review.
2. Run author QA for slide count, page count, notes count, 900-second total, source-map coverage and forbidden wording.
3. Inspect PowerPoint slideshow on the target 16:9 display at 100% and simulated projector distance; repeat in grayscale.
4. Inspect every PDF page and preview tile against the PowerPoint render; log slide-specific findings with severity.
5. Have the independent reviewer execute R1–R8 and explicitly confirm the two ZIP hashes, four open gates, two runtime findings, three-author cover and no invented logo.
6. Remediate any finding in the source deck/content; regenerate all derivatives and restart affected review gates.
7. Write the independent review report only after evidence is current; disposition must be PASS or BLOCKED, never implied.
8. Generate SHA-256 manifest over the six approved artifacts excluding the manifest itself; verify each entry against the packaged copy.
9. Create the final package ZIP with the seven-file root inventory and no candidate ZIP/source documents/local temporary files.
10. Compute and report the presentation-package ZIP hash separately; label it `presentation package`, never `textbook candidate`.

## Todo
- [ ] Complete author factual/visual/timing checklist.
- [ ] Complete independent R1–R8 review with named environment and evidence.
- [ ] Resolve every Critical/High and all integrity/readability blockers.
- [ ] Regenerate synchronized derivatives after any deck change.
- [ ] Generate and verify the six-artifact checksum manifest.
- [ ] Build the seven-file presentation package ZIP.
- [ ] Record the package ZIP hash with an unambiguous artifact label.

## Success Criteria
- [ ] Independent review disposition is PASS with Critical/High/Medium blockers at zero.
- [ ] Main delivery is exactly 15:00 and all backup material is outside that budget.
- [ ] PPTX/PDF/preview/notes/source map agree on slide order, content, status and sources.
- [ ] No artifact claims the candidate ZIP is hash-locked; both conflicting hashes remain traceable.
- [ ] Package contains exactly the seven approved root files and manifest verification succeeds.
- [ ] Research reports remain unchanged and are not copied into the handoff package.

## Risk Assessment
| Risk | Signal | Response |
|---|---|---|
| Reviewer is not independent | Same person authored deck/evidence ledger | Reassign review; prior disposition is invalid. |
| Last-minute content edit bypasses re-export | PPTX hash changes after PDF/preview | Invalidate derivatives and review; regenerate as one set. |
| Package hash is confused with candidate hash | Label says only “SHA-256” | Prefix every value with explicit artifact name and path. |
| Institutional terminology remains uncertain | Reviewer cannot confirm Council authority phrase | Keep package BLOCKED until official wording is supplied. |

## Security/Integrity Considerations
- Scan notes, source map, properties and review report for local usernames, absolute paths, credentials and private metadata before packaging.
- Use deterministic file names and root-only inventory; reject unexpected files, macros or executables.
- Do not include the mismatched candidate ZIP, source DOCX or release evidence in the presentation package.
- Checksums prove package identity only; the review report states scope and does not certify the textbook candidate.

## Next steps
After R1–R8 PASS and manifest verification, hand the seven-file package to the coordinator/presenter with the external candidate path and explicit open-condition briefing. Do not mark the textbook release final until its own gates and ZIP provenance are independently closed.
