---
title: "Phase 01 - Baseline Overlay Inventory"
status: completed
priority: P1
effort: 5h
---

# Phase 01 - Baseline Overlay Inventory

## Context Links

- [Root Cause Report](./reports/root-cause-report.md)
- [Research Synthesis](./research/research-synthesis.md)
- `js/sim-route-renderer-primitives.js`
- `js/sims/ch*/*-renderers.js`
- `tests/simulation-test-utils.js`

## Overview

Capture exact current overlay state before implementation. No runtime behavior changes in this phase.

## Key Insights

- There are 135 `P.domMath(...)` call sites.
- Browser probe shows 58/58 routes have overlay nodes.
- Need classification before deleting/migrating anything.

## Requirements

- Generate route-level matrix: route id, overlay count, formula nodes, panel nodes, text samples, source file/call-site if possible.
- Classify each overlay item: static formula, dynamic value, diagram label, solver/checker panel, unknown.
- Save outputs in `plans/260514-1900-simulation-canvas-overlay-cleanup/reports/`.

## Architecture

Use existing Playwright utilities to mount routes through `file://`. Use `rg`/AST-light regex to map `P.domMath` call sites. Do not create runtime dependencies.

## Related Code Files

Modify: none expected.

Create:
- Optional `plans/260514-1900-simulation-canvas-overlay-cleanup/reports/overlay-inventory.md`
- Optional `plans/260514-1900-simulation-canvas-overlay-cleanup/reports/overlay-inventory.json`

Delete: none.

## Implementation Steps

1. Use `rg -n "P\\.domMath\\(" js\\sims` to export call-site list.
2. Run Playwright probe for all `ALL_ROUTES`.
3. Save route matrix with DOM text samples and bounding boxes.
4. Classify overlay content using pattern rules from research synthesis.
5. Identify high-risk routes with more than 4 overlay nodes or solver/checker formula panels.

## Todo List

- [x] Capture static call-site list.
- [x] Capture browser DOM overlay matrix.
- [x] Classify overlay purpose per route.
- [x] Flag high-risk routes.
- [x] Save report artifacts.

## Success Criteria

- Inventory covers 58/58 routes.
- 135 `P.domMath` calls accounted for or explained.
- High-risk route list exists before any code change.

## Verify And Tests

```powershell
rg -n "P\\.domMath\\(" js\sims
npx playwright test tests\simulation-browser.spec.js --grep "@route-mount"
```

Manual verify: compare inventory route count against `ALL_ROUTES.length`.

## Risk Assessment

- Risk: dynamic overlay text only appears after interaction. Mitigation: capture initial plus one drag/slider change for representative routes.

## Security Considerations

No user input, no network, no persistence changes.

## Next Steps

Proceed to Phase 02 only after matrix is complete.
