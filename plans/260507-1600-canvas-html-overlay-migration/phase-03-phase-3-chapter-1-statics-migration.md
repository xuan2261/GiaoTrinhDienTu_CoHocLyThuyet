---
phase: 3
title: "Phase 3: Chapter 1 Formula Overlay Migration"
status: completed
priority: P1
effort: "5h"
dependencies: ["phase-01-phase-1-architecture-ui-setup.md"]
---

# Phase 3: Chapter 1 Formula Overlay Migration

## Context Links
- [Phase 1 overlay architecture](./phase-01-phase-1-architecture-ui-setup.md)
- [Phase 2 localization glossary](./phase-02-phase-2-data-manifest-localization.md)
- [System architecture](../../docs/system-architecture.md)

## Overview
- **Priority:** P1
- **Status:** Done
- **Goal:** Convert all Ch1 coordinate formulas to KaTeX overlay and make Ch1 simulation UI fully Vietnamese.
- **Completion:** Migrated Ch1 formulas and visible UI text to the DOM/KaTeX overlay path; kept alignment and renderer contracts intact.
- **Validation:** `npm run test:sim:unit`, `npm run test:sim:renderer-contract`, targeted overlay/localization/responsive checks.

## Key Insights
- Ch1 has 5 renderer files, all under 200 lines.
- Current labels mix formulas, symbols, and English panel text.
- Every formula must use coordinate KaTeX. Simple force symbols such as `F`, `N`, `R`, `A`, `B` can remain canvas only when they are not formula text.

## Requirements
- Functional: Every Ch1 formula on the canvas coordinate system uses `P.domMath`.
- Functional: Every user-visible Ch1 UI term is Vietnamese.
- Functional: Preserve 58 route renderer/behavior registration and assessment links.
- Non-functional: Keep renderer files under current size discipline; no shared mega-map unless it removes real duplication.
- Non-functional: Keep formula positions visually tied to current canvas coordinates.

## Formula Scope
- Must convert: text with `=`, `+`, `-`, `×`, `·`, `Σ`, fraction, square root, power, subscript, vector relation, equilibrium relation.
- Examples: `M=F.a`, `ΣF=0`, `Rx + Fx = 0`, `RA=... RB=...`, `phi≈...`, `N=...`.
- May stay canvas: one-letter/vector labels that annotate arrows or points without an equation.

## Architecture
- Use `P.domMath(ctx, key, x, y, latex, options)` for formulas.
- Use `P.domPanel` only when a formula/panel benefits from DOM layout.
- Keep geometric drawing in canvas primitives.
- Maintain structural marks from both canvas and DOM primitives.

## Related Code Files
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-force-law-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-centroid-solver-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-friction-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-spatial-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-support-renderers.js`
- Modify if needed: Ch1 scene catalog files in `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\`
- Modify tests if needed: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- Create: none for runtime source.
- Delete: none.

## Implementation Steps
1. Search Ch1 renderer text:
   - `rg -n "P\.(frame|label|panel|body|point|arrow|angleArc|dimension)|fillText" js\sims\ch1`
2. For each formula, replace canvas label with `P.domMath` and valid LaTeX.
3. Translate all Ch1 panel/frame labels and user-visible text to Vietnamese.
4. Keep arrow/point symbols concise; translate words around them.
5. Verify formulas still align after drag/slider updates.
6. Run Ch1-focused browser route-mount if available, then full static gates.

## Todo List
- [x] Ch1 formula inventory complete.
- [x] Force law renderers migrated.
- [x] Support/spatial renderers migrated.
- [x] Friction/centroid/solver renderers migrated.
- [x] Ch1 scene catalog text checked.
- [x] Ch1 overlay alignment checked on mobile and desktop.

## Success Criteria
- [x] Ch1 has no English user-visible UI terms.
- [x] Every Ch1 coordinate formula renders through KaTeX overlay.
- [x] `npm run test:sim:unit` passes.
- [x] `npm run test:sim:renderer-contract` passes.
- [x] `npm run test:sim:browser:route-mount` passes or documented if skipped for time.

## Risk Assessment
- Too many DOM formulas clutter small canvas. Mitigation: use compact classes and move only formulas, not every single symbol.
- Formula node overlaps geometry. Mitigation: adjust formula anchor positions with existing coordinates.
- Renderer uniqueness changes unexpectedly. Mitigation: keep `P.mark` calls for DOM primitives and run renderer contract.

## Security Considerations
- Formula LaTeX is trusted source code text.
- Do not use `innerHTML` for translated labels.
- Keep `throwOnError: false` to avoid one bad formula breaking route mount.

## Next Steps
- Phase 4 repeats the same pattern for Ch2 and Ch3 after Ch1 gates pass.
