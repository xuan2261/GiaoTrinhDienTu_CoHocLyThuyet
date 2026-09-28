---
title: Redesign scientific pedagogical acceptance deck
date: 2026-09-25
summary: Reframed and verified the acceptance deck for truthful scientific-pedagogical review.
---

# Redesign scientific pedagogical acceptance deck

## What happened
- Audited the 19-slide acceptance deck and found it was framed primarily as a technical release report rather than a scientific–pedagogical review.
- Identified overclaims around independent signoff and approval, plus inconsistent separation between academic judgment and technical release gates.

## Changes
- Reframed the deck as 13 scientific–pedagogical review slides plus 6 backup slides.
- Derived provisional outcomes, zero signoffs, blocked academic review, and technical release status from canonical JSON sources.
- Moved technical release counts and decision to Slides 17–18 only.
- Updated PPTX, PDF, Web Slides, council handout, presenter guidance, and the 4-column thumbnail grid.
- Added contract tests for narrative order, timing, evidence boundaries, truthful wording, web/handout completeness, and reproducible builds.

## Verification
- `node --test tests/presentation-deck-contract.test.js`: 12/12 passed.
- Generated PDF contains 19 pages.
- Independent review found no remaining Critical, High, or Medium issues after the Slide 11/19 fix.
- Final thumbnail review found no visible clipping or overlap.
- Final design audit enlarged the runtime evidence on Slides 6–8, added three focused capture assets, and moved each formula/check summary into a full-width lower panel.

## Decision
- Scientific–pedagogical acceptance may be considered conditionally by the Council if its criteria are met.
- That decision remains separate from technical release approval, which is still represented only in the backup section.

## Next steps
- Rehearse the 12-minute main presentation and test the QR/demo in the meeting room.
- Record the Council decision and any required changes in the authoritative academic signoff records after the meeting.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
