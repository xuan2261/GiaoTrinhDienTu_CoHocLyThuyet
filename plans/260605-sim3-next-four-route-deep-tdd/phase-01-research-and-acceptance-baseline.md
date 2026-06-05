---
phase: 1
title: "Research And Acceptance Baseline"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 01: Research And Acceptance Baseline

## Overview

Confirm current Sim3 route patterns, fixture loading order, and exact acceptance contract before writing failing tests.

## Requirements

- Functional: identify how existing Sim3 adapters wire into Sim2 state and lifecycle.
- Non-functional: no source behavior changes in this phase.

## Architecture

Use existing optional adapter pattern:

```text
Sim2 render/state -> Sim3Mode.attach -> route adapter create/setState -> Sim3Shell -> Three.js canvas
```

Sim2 remains owner of controls, readouts, physics, and route lifecycle.

## Related Code Files

- Read: `js/sim2/sims/ch1/ch1-5-3.js`
- Read: `js/sim2/sims/ch3/ch3-1-3.js`
- Read: `js/sim2/sims/ch2/ch2-1-3.js`
- Read: `js/sim2/sims/ch1/ch1-1-5.js`
- Read: `js/sim3/sims/*-3d.js`
- Read: `tests/sim3-pilot-fallback-dispose.spec.js`

## Implementation Steps

1. Re-check current six Sim3 route wiring for `Sim3Mode.attach`.
2. Record expected labels/debug metrics for the four new routes.
3. Confirm fixture script order for Ch1/Ch2/Ch3.
4. Define final test assertions before code.

## Success Criteria

- [x] Route state fields are identified for all 4 routes.
- [x] Required labels are listed.
- [x] Fixture changes are known.
- [x] No code changed except plan/report artifacts.

## Risk Assessment

Risk: unclear state handoff from route-local variables. Mitigation: assert only stable physics/readout state already used by Sim2.
