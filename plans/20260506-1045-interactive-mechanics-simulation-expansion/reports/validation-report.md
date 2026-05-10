---
type: report
topic: validation
created: 2026-05-06
---

# Validation Report

## Assumptions

| Decision | Default |
|---|---|
| Execution order | Finish current semantic math/release plan first |
| Technology | Plain JS + Canvas/SVG; no framework |
| Coverage | Implement P1 first, keep P2/P3 as backlog unless time allows |
| Content editing | Do not hand-edit generated fragments |
| Testing | Syntax + audit + route smoke + mobile + file mode |

## Critical Questions Answered By Plan Defaults

| Question | Default Answer | Reason |
|---|---|---|
| Need WebGL/3D? | No | 2D/2.5D enough for current objectives |
| Need external libraries? | No | Offline/file mode and no package manager |
| Split `js/simulations.js`? | Yes | Existing file too large |
| Add simulations to every page? | No | Add only meaningful, P1/P2 route interactions |
| Add scoring? | Yes, but separate from quiz engine | Preserve current quiz state |
| Update docs? | Yes after implementation | Architecture/standards change |

## Validation Checklist For Implementers

- Each sim has reset state.
- Each sim has deterministic default parameters.
- Each sim avoids hidden network/API use.
- Each route has no duplicate `.sim-container`.
- Each formula shown in UI matches textbook notation where possible.
- Each canvas has visible nonblank output at desktop and mobile width.
- Each activity checker gives correct/incorrect feedback without storing sensitive data.

## Unresolved Questions

- User may choose P1-only release or full P1+P2 coverage. Plan defaults to P1 first, P2/P3 after.
