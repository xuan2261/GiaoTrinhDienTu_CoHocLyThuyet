---
type: research
date: 2026-05-13
topic: right-inspector-ui-ux
status: complete
---

# UI UX Right Inspector Research

## Summary

Right-side inspector is appropriate for desktop educational simulations because it separates manipulation viewport from values/context. It must stay data-dense but not dashboard-heavy.

## UI UX Findings

| Topic | Recommendation |
|---|---|
| Product type | Educational interactive lab, data-dense tool surface |
| Layout | Canvas primary, inspector secondary |
| Inspector contents | Readouts first, controls second, formula/hint third |
| Density | Compact spacing, tabular numbers, no nested card stacks |
| Accessibility | Keyboard order remains DOM order; focus visible; live status preserved |
| Responsive | Side panel only when enough width; stack on tablet/mobile |
| Motion | No decorative animation; keep existing transitions/reduced-motion |

## Layout Rules

- Use 2-column grid only at wide breakpoint.
- Suggested wide breakpoint: `min-width: 1040px`.
- Suggested columns: `minmax(0, 760px) minmax(300px, 1fr)`.
- Suggested gap: `16px`.
- Inspector should not use fixed height or internal scroll in first pass.
- Formula/hint belong in inspector because they explain current state and reduce viewport clutter.

## Anti-Patterns

- Do not place controls above canvas and readouts right; this splits interaction context.
- Do not add a fullscreen mode now.
- Do not shrink canvas below readable size just to force side panel.
- Do not use hover-only controls.
- Do not add new color palette.

## Acceptance Implications

- Right inspector activates only when enough width exists.
- Tablet/mobile must remain stacked.
- Values must be readable in both light/dark themes.
- Controls remain reachable without precision taps.

## Unresolved Questions

- None.
