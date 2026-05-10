# Phase 04 Direct Interaction Kernel

## Context Links

- [Plan](./plan.md)
- [Research Synthesis](./research/research-synthesis.md)

## Overview

Priority: P1. Status: Completed. Make on-scene interaction first-class: drag handles, snap guides, hit targets, touch support, keyboard nudging, synchronized precision controls.

## Key Insights

- Current interaction is slider-heavy: ~103 sliders vs ~7 drag hooks.
- User wants less drag-through-controls and more direct manipulation.
- Need shared abstraction to avoid 58 custom drag implementations.

## Requirements

Functional:
- Support pointer/mouse/touch with one API.
- Support draggable point, vector endpoint, angle handle, body, graph cursor.
- Sync scene drag state with sliders/readout.
- Support snap and constraints.

Non-functional:
- Touch target >= 24px visual/hit.
- Cleanup all listeners on route dispose.
- No route-specific memory leaks.

## Architecture

`SimInteractions`:
- `createInteractionLayer(canvas, config)`
- `addHandle({id, get, set, hitRadius, constraint, snap})`
- `addVectorHandle({base, tip, setTip})`
- `addBodyDrag({bounds, setPosition})`
- `addGraphCursor({domain, onChange})`
- `syncControl(input, setter, formatter)`

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-interactions.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-rendering.js`
- Representative route modules from Phase 3
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_runtime.py`

## Implementation Steps

1. Implement pointer abstraction with `pointerdown/move/up/cancel`.
2. Add scope cleanup integration.
3. Add handle rendering helpers.
4. Convert representative routes:
   - Force vector endpoint.
   - Friction incline angle/body.
   - Particle path cursor.
   - Instant center point.
   - Differential graph cursor.
   - Collision ball/aim handle.
5. Add browser tests that drag handles and assert readout changes.

## Todo List

- [x] Build interaction API.
- [x] Add render handles.
- [x] Add keyboard nudge for focused handle.
- [x] Convert 6 representative routes.
- [x] Add pointer/touch smoke tests.
- [x] Add cleanup/leak checks.

## Completion Notes

- `SimInteractions` now supports pointer/mouse/touch drag plus keyboard nudge.
- Representative routes pass `@direct-drag` and `@touch-viewports`.
- Runtime smoke now executes real listener cleanup check.
- Evidence: [Phase 04-05 Interaction Assessment Report](./reports/phase-04-05-interaction-assessment-report.md).

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
python tools\smoke_simulation_runtime.py --check-listener-cleanup
python tools\audit_simulation_quality.py --require-direct-interaction ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2
npm run test:sim:browser -- --grep @direct-drag
npm run test:sim:browser -- --grep @touch-viewports
```

## Success Criteria

- Representative routes no longer depend on sliders as primary interaction.
- Drag changes state and formula readout.
- Sliders remain fallback/precision controls where useful.
- Navigation away disposes listeners.

## Risk Assessment

Risk: touch scroll conflict. Mitigation: prevent default only while dragging a valid handle.

Risk: hidden handles confuse users. Mitigation: visible handle affordances and cursor changes.

## Security Considerations

No external input. Validate numeric state to finite values before drawing.

## Next Steps

Phase 5 adds assessment layer that can evaluate interactions.
