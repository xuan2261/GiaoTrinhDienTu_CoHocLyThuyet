---
phase: 1
title: "Phase 1: Baseline & Overlay Architecture"
status: completed
priority: P1
effort: "5h"
dependencies: []
---

# Phase 1: Baseline & Overlay Architecture

## Context Links
- [Plan review](./reports/260507-1627-debug-brainstorm-plan-review.md)
- [README](../../README.md)
- [Code standards](../../docs/code-standards.md)
- [System architecture](../../docs/system-architecture.md)
- [Design guidelines](../../docs/design-guidelines.md)

## Overview
- **Priority:** P1
- **Status:** Done
- **Goal:** Add a minimal DOM overlay manager on top of existing `.sim-lab-overlay`; no duplicate overlay in `sim-core.js`, no KaTeX loading change.
- **Completion:** Reused `.sim-lab-overlay`, wired overlay frame lifecycle + keyed DOM reuse, and kept structural marks stable.
- **Validation:** `npm run test:sim:unit`, `npm run test:sim:renderer-contract`, `npm run test:sim:quality:baseline`.

## Key Insights
- `index.html` already loads KaTeX local first, CDN fallback.
- `js/sim-lab-ui.js` already creates `.sim-lab-scene` and `.sim-lab-overlay`.
- Current gates pass with 58 routes and strict renderer/behavior contracts.
- Overlay DOM must preserve renderer structural identity by marking DOM primitives.

## Requirements
- Functional: `SimProfessionalLab.draw()` begins/ends an overlay frame around each route renderer.
- Functional: `SimRouteRendererPrimitives` exposes `beginOverlay`, `endOverlay`, `domMath`, `domLabel`, and `domPanel`.
- Functional: Every coordinate formula uses `domMath` and KaTeX, not canvas `fillText`.
- Functional: Regular non-formula symbols may stay canvas unless they are user-visible UI terms requiring Vietnamese text.
- Non-functional: Keep `file://` offline support; no new CDN dependency.
- Non-functional: Avoid layout jitter; position overlay nodes with CSS transforms and canvas scale.
- Non-functional: Keep 58-route renderer contract unique after DOM migration.

## Architecture
- Existing `.sim-lab-overlay` remains the only coordinate overlay.
- `draw()` flow:
  1. compute derived state
  2. `P.beginOverlay(lab.overlay, lab.canvas, routeId)`
  3. call dedicated renderer
  4. `P.endOverlay()`
  5. update structural metadata and readout
- Overlay node identity uses stable keys: `{routeId}:{kind}:{key}`.
- `domMath` calls `katex.render(latex, node, { throwOnError: false })`; fallback text only if KaTeX unavailable.
- `domMath`/`domPanel` call `P.mark(...)` so browser renderer-contract still has route-specific structure.
- Default pointer behavior is `pointer-events: none`; only future interactive overlay widgets opt into `auto`.

## Related Code Files
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-renderer-primitives.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- Modify tests if needed: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- Do not modify by default: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html`
- Do not modify by default: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js`
- Create: none for runtime source.
- Delete: none.

## Implementation Steps
1. Run baseline gates before edits:
   - `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2`
   - `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58 --require-assessment-links --report-current`
   - `npm run test:sim:quality:baseline`
2. Add overlay frame state in `sim-route-renderer-primitives.js`.
3. Implement keyed DOM reuse, diffed content/style updates, and stale-node cleanup in `endOverlay`.
4. Add formula CSS scoped under `.sim-lab`: `.sim-overlay-formula`, `.sim-overlay-panel`, `.sim-overlay-label`.
5. Wrap renderer invocation in `sim-professional-lab.js` with begin/end overlay calls.
6. Add/adjust browser assertions for visible `.katex` nodes inside `.sim-lab-overlay` on one representative route.
7. Re-run syntax/unit and renderer-contract gates.

## Todo List
- [x] Baseline QA captured.
- [x] Overlay frame lifecycle implemented.
- [x] `domMath` renders KaTeX formulas.
- [x] Stale overlay nodes removed after redraw/navigation.
- [x] Responsive scale logic checked at 375, 768, 1280 widths.
- [x] Renderer structural marks remain unique.

## Success Criteria
- [x] No second overlay class such as generic `.sim-overlay` added.
- [x] No KaTeX load order change in `index.html`.
- [x] Representative coordinate formula appears as KaTeX inside `.sim-lab-overlay`.
- [x] `npm run test:sim:unit` passes.
- [x] `npm run test:sim:renderer-contract` passes.

## Risk Assessment
- DOM churn hurts frame rate. Mitigation: keyed reuse + update only changed text/transform/class.
- Canvas/DOM mismatch on mobile. Mitigation: compute scale from `canvas.getBoundingClientRect()` every overlay frame.
- Structural contract loses marks when formulas move to DOM. Mitigation: DOM primitives call `mark()`.

## Security Considerations
- Do not render raw HTML from route metadata.
- Use `textContent` for non-math text.
- KaTeX input must come from trusted source files only; `throwOnError: false` prevents route breakage.
- Do not add external network requirement.

## Next Steps
- Phase 2 localizes all user-visible UI text before broad renderer migration.
