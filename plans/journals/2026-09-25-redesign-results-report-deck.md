---
title: Redesign results report deck
date: 2026-09-25
summary: "Rebuilt the Council deck as a clear, scientifically accurate report of results."
---

# Redesign results report deck

## What happened
- Re-audited the 19-slide deck for result-report narrative, scientific accuracy, simple Vietnamese, and evidence boundaries.
- Independent reviews found the prior deck was accurate but too close to an acceptance-control dossier.
- Rebuilt the 13-slide main narrative as results first, limits later; retained six appendices for academic and technical detail.

## Decision
- Final Council ask is only to acknowledge the constructed results and provide improvement feedback.
- Main slides contain no release approval request or conditional acceptance request.
- Technical release status remains in Slides 17–18; current decision is stated as not approved for release.

## Key changes
- Corrected area-centroid wording, Coriolis component/vector wording, one-dimensional collision conditions, and moment lever-arm notation.
- Replaced internal English workflow jargon with plain Vietnamese in the main deck.
- Rewrote PPTX, Web Slides, handout, presenter guide, and operation guide from one content model.
- Fixed visual overflows on Slides 3–4 and aligned Slide 5 speaker/QR instructions.

## Verification
- `node --test tests/presentation-deck-contract.test.js`: 15/15 passed.
- Main deck: 13 slides and 12:00; appendices: 6 slides; session: 15:00.
- Final PDF: 19 pages; 19 PowerPoint-exported review images.
- Independent final review findings were repaired and visually rechecked.

## Next steps
- Rehearse the 12-minute talk and use Slides 14–19 only when asked.
- Record Council feedback separately; do not convert silence into academic approval.

## Unresolved questions
- None for the presentation build.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
