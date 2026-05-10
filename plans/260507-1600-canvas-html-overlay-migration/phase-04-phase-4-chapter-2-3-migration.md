---
phase: 4
title: "Phase 4: Chapter 2 & 3 Formula Overlay Migration"
status: completed
priority: P2
effort: "6h"
dependencies: ["phase-01-phase-1-architecture-ui-setup.md", "phase-03-phase-3-chapter-1-statics-migration.md"]
---

# Phase 4: Chapter 2 & 3 Formula Overlay Migration

## Context Links
- [Phase 1 overlay architecture](./phase-01-phase-1-architecture-ui-setup.md)
- [Phase 2 localization glossary](./phase-02-phase-2-data-manifest-localization.md)
- [Phase 3 Ch1 migration](./phase-03-phase-3-chapter-1-statics-migration.md)

## Overview
- **Priority:** P2
- **Status:** Done
- **Goal:** Apply the validated Ch1 pattern to Ch2 kinematics and Ch3 dynamics.
- **Completion:** Migrated Ch2/Ch3 coordinate formulas and localized all user-visible UI text, preserving route ids, behavior ids, and assessment.
- **Validation:** `npm run test:sim:unit`, `npm run test:sim:semantic`, `npm run test:sim:browser:route-mount`, targeted overlay/localization/responsive checks.

## Key Insights
- Ch2/Ch3 formulas move more often than Ch1; DOM diffing must already be proven in Phase 1.
- Dynamics routes include higher-risk formulas: Newton II, work-energy, impulse-momentum, angular momentum, collision.
- User decision: every coordinate formula gets KaTeX, not only "important" formulas.

## Requirements
- Functional: Every Ch2/Ch3 coordinate formula uses `P.domMath`.
- Functional: All Ch2/Ch3 user-visible UI text is Vietnamese.
- Functional: Preserve route-specific renderer ids, behavior ids, scene identity, and assessment.
- Non-functional: Maintain responsive/touch behavior.
- Non-functional: Keep 60fps target by limiting DOM to formulas/panels, not geometric labels.

## Architecture
- Reuse `domMath`/`domPanel` API from Phase 1.
- Process Ch2 and Ch3 in separate batches; run gates between batches.
- Keep formulas spatially anchored to canvas coordinates; panels may use DOM only when they contain formulas or longer Vietnamese text.

## Related Code Files
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-particle-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-rotation-transmission-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-relative-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-plane-checker-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-dynamics-law-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-differential-solver-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-theorem-renderers.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-collision-checker-renderers.js`
- Modify if needed: Ch2/Ch3 scene catalog and behavior files in `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\` and `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\`
- Modify tests if needed: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- Create: none for runtime source.
- Delete: none.

## Implementation Steps
1. Ch2 inventory:
   - `rg -n "P\.(frame|label|panel|body|point|arrow|angleArc|dimension)|fillText" js\sims\ch2`
2. Convert every Ch2 coordinate formula to `P.domMath` with valid LaTeX.
3. Translate all Ch2 UI text to Vietnamese.
4. Run syntax/unit + renderer-contract gates.
5. Ch3 inventory:
   - `rg -n "P\.(frame|label|panel|body|point|arrow|angleArc|dimension)|fillText" js\sims\ch3`
6. Convert every Ch3 coordinate formula to `P.domMath`.
7. Translate all Ch3 UI text to Vietnamese.
8. Re-run syntax/unit + renderer-contract + route-mount gates.

## Todo List
- [x] Ch2 formula inventory complete.
- [x] Ch2 formulas converted to KaTeX overlay.
- [x] Ch2 UI text fully Vietnamese.
- [x] Ch2 gates pass.
- [x] Ch3 formula inventory complete.
- [x] Ch3 formulas converted to KaTeX overlay.
- [x] Ch3 UI text fully Vietnamese.
- [x] Ch3 gates pass.

## Success Criteria
- [x] Ch2 and Ch3 have no English user-visible UI terms from the glossary.
- [x] Every Ch2/Ch3 coordinate formula renders through KaTeX overlay.
- [x] `npm run test:sim:unit` passes.
- [x] `npm run test:sim:semantic` passes.
- [x] `npm run test:sim:browser:route-mount` passes or documented if skipped for time.

## Risk Assessment
- Fast-moving formulas may jitter. Mitigation: transform-only positioning and diffed updates.
- Formula density may reduce readability. Mitigation: compact font sizes and avoid converting non-formula symbols.
- Hidden English in behavior/readout files may remain. Mitigation: run global glossary grep after Ch2/Ch3.

## Security Considerations
- Same as Phase 3: trusted LaTeX source, no raw HTML labels, no remote dependency.
- Preserve localStorage assessment keys and schema.

## Next Steps
- Phase 5 runs full 58-route verification and final polish.
