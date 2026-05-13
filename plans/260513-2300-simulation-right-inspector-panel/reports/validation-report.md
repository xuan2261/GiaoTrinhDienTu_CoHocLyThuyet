---
type: validation
date: 2026-05-13
topic: simulation-right-inspector-panel
status: complete
---

# Validation Report

## Locked Decisions

| Item | Decision |
|---|---|
| Expected output | Implementation plan with phases and tests for right-side simulation inspector |
| Main UX decision | Put readouts, controls, formula, and hint in right inspector |
| Desktop behavior | Canvas left, inspector right |
| Mobile behavior | Keep stacked layout, no forced side panel |
| Tech constraints | Static `HTML/CSS/JS`, offline `file://`, no framework |
| Architecture constraint | Shared `.sim-lab` shell only; no route variants |
| Canvas constraint | Keep logical `760x440` |

## Acceptance Criteria

- Desktop/wide layout clearly uses right inspector.
- Formula/hint are in inspector group.
- Controls and values remain touch-friendly and readable.
- No horizontal scroll at common breakpoints.
- Existing 58-route simulation gates pass.
- Docs reflect new layout contract.

## Scope Boundary

In scope:
- CSS layout and focused shell tests.
- Minimal `sim-lab-ui.js` wrapper only if needed.
- Docs/changelog updates.

Out of scope:
- Physics/rendering/behavior route polish.
- Fullscreen/modal mode.
- New design palette.
- Framework/bundler.

## Unresolved Questions

- None.
