---
phase: 5
title: "Phase 5: 58-Route Verification & Polish"
status: completed
priority: P2
effort: "4h"
dependencies: ["phase-04-phase-4-chapter-2-3-migration.md"]
---

# Phase 5: 58-Route Verification & Polish

## Context Links
- [README QA commands](../../README.md)
- [Code standards validation](../../docs/code-standards.md)
- [Design guidelines](../../docs/design-guidelines.md)
- [Plan review](./reports/260507-1627-debug-brainstorm-plan-review.md)

## Overview
- **Priority:** P2
- **Status:** Done
- **Goal:** Verify 58 routes, offline behavior, overlay alignment, full Vietnamese UI, and KaTeX formula rendering.
- **Completion:** Full 58-route verification passed; overlay alignment, offline behavior, and final polish were validated without adding new runtime scope.
- **Validation:** `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:renderer-contract`, `npm run test:sim:browser`, runtime smoke, route-mount, baseline, and targeted checks.

## Key Insights
- Current browser suite covers 58 route mount, lab shell, scene identity, renderer contract, direct drag, assessment, responsive, `file://`, and server smoke.
- Manual sweep is still useful, but it cannot replace existing gates.
- Polish must stay scoped under `.sim-lab`; avoid broad redesign.

## Requirements
- Functional: 58/58 simulation routes open without console/page errors.
- Functional: All route checkpoints remain usable.
- Functional: Every coordinate formula is KaTeX-rendered in `.sim-lab-overlay`.
- Functional: No English user-visible UI text remains for the agreed glossary.
- Non-functional: No required external network request.
- Non-functional: Responsive overlay alignment at 375, 768, 1280 widths.
- Non-functional: CSS remains consistent with existing academic dark navy/gold design.

## Architecture
- Verification-first closeout: static gates, browser gates, then manual spot sweep.
- Polish only in `css/style.css`, scoped under `.sim-lab`.
- Avoid changes to `sim-core.js` unless a verified overlay resize bug requires it.

## Related Code Files
- Modify if needed: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- Modify if needed: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- Modify docs if implementation changed architecture: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`
- Modify docs if milestone complete: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md`
- Modify docs if changes shipped: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md`
- Create: none for runtime source.
- Delete: none.

## Implementation Steps
1. Run required validation:
   - `npm run test:sim:unit`
   - `npm run test:sim:quality`
   - `npm run test:sim:semantic`
   - `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage`
   - `npm run test:sim:browser:route-mount`
   - `npm run test:sim:browser:baseline`
2. If broad renderer/CSS changes occurred, run:
   - `npm run test:sim:browser`
3. Check English UI terms:
   - `rg -n "handle|readout|mode|drag|Vector|Route|Simulation lab|Legacy scene|fallback" js\sims js\sim-*.js`
4. Add/adjust Playwright checks for:
   - `.sim-lab-overlay .katex`
   - no stale overlay nodes after route navigation
   - overlay alignment after resize 375 -> 1280
5. Manual sweep representative routes from Ch1/Ch2/Ch3 and note issues before closeout.
6. Update docs/roadmap/changelog only if implementation changes runtime architecture or milestone status.

## Todo List
- [x] Unit/quality/semantic gates pass.
- [x] Runtime smoke passes.
- [x] Route-mount and baseline browser gates pass.
- [x] Full browser suite run if needed.
- [x] English UI grep clean or justified with non-user-visible code keys.
- [x] KaTeX overlay visible in representative routes.
- [x] Resize alignment verified.
- [x] Docs impact evaluated.

## Success Criteria
- [x] 58/58 routes mount through `file://`.
- [x] No external network request is required for simulation formula rendering.
- [x] No English user-visible UI terms remain from the agreed glossary.
- [x] Every coordinate formula renders as KaTeX overlay.
- [x] No stale overlay DOM after navigation.
- [x] Renderer contract still reports 58 unique renderer ids and 58 unique behavior ids.

## Risk Assessment
- Full browser suite may be slow. Mitigation: run route-mount/baseline first, full browser when broad changes landed.
- English grep can catch code keys. Mitigation: distinguish rendered text vs internal key, document justified leftovers.
- CSS polish can break responsive layout. Mitigation: scoped `.sim-lab` rules and browser responsive tests.

## Security Considerations
- No remote dependency required.
- Preserve localStorage schemas.
- Keep KaTeX content trusted and static.
- Avoid `innerHTML` for Vietnamese UI text.

## Next Steps
- If all gates pass, mark phase complete and update `docs/project-roadmap.md` + `docs/project-changelog.md`.
- No unresolved user decisions remain for this plan.
