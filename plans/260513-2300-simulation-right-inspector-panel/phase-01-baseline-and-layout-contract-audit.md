# Phase 01 - Baseline And Layout Contract Audit

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [System Architecture](../../docs/system-architecture.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 2h |
| Goal | Capture current DOM/layout contract before changing CSS |

## Key Insights

- Current wide container is already `1120px`.
- Main viewport is `.sim-lab-scene`; inspector candidates are direct children.
- Tests must prove no overflow before/after.

## Requirements

Functional:
- Identify direct-child order under `.sim-container.sim-lab`.
- Capture widths/heights of lab, scene, controls, readouts, formula, hint.
- Pick representative routes: 1 Ch1 static, 1 Ch2 animated/graph, 1 Ch3 dynamics.

Non-functional:
- No code behavior changes in this phase.
- Evidence saved under this plan `reports/`.

## Architecture

Data flow:

```text
route load -> SimProfessionalLab.mount -> SimLabUI DOM -> CSS layout -> Playwright measurement
```

## Related Code Files

Modify:
- None expected.

Create:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-2300-simulation-right-inspector-panel\reports\baseline-layout-audit.md`

Delete:
- None.

## Implementation Steps

1. Open representative routes via Playwright/static server or `file://` test helper.
2. Record DOM order and computed display/grid/flex values.
3. Record element rects at `1366x768`, `1024x768`, `768x900`, `390x844`.
4. Record document `scrollWidth` vs viewport width.
5. Note any route with unusually many controls/readouts.
6. Save audit findings to `reports/baseline-layout-audit.md`.

## Todo List

- [x] Select representative routes.
- [x] Capture DOM order.
- [x] Capture breakpoint measurements.
- [x] Capture overflow baseline.
- [x] Save report.

## Tests / Verify Gate

Commands:

```powershell
npm run test:sim:browser -- --grep "@route-mount"
npm run test:sim:visual-quality
```

Manual/measurement checks:
- `.sim-lab-scene` exists and is visible.
- `.sim-controls`, `.sim-readout-grid`, `.sim-formula-panel`, `.sim-lab-hint` exist and visible.
- `document.documentElement.scrollWidth <= window.innerWidth + 1` for target viewports.

## Success Criteria

- Baseline report exists.
- No current tests are failing before new work.
- Exact layout targets for Phase 02 are known.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Route selection misses dense controls | Include at least one route with play/pause and one with buttons |
| Baseline already has overflow | Document separately; do not hide it in later phases |

## Security Considerations

- No security-sensitive changes.
- Do not touch secrets or generated content.

## Next Steps

- Use baseline numbers to write failing-first layout tests in Phase 02.

## Unresolved Questions

- None.
