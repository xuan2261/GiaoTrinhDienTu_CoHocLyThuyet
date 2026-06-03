---
title: "Sim3 Two Route Three.js Pilot"
description: "Add an offline Three.js 3D pilot layer for two Sim2 routes while preserving SVG fallback and tested physics."
status: done
priority: P1
effort: 14h
branch: master
tags: [feature, simulation, threejs, tdd, offline]
blockedBy: []
blocks: []
created: 2026-06-02
---

# Sim3 Two Route Three.js Pilot

## Overview

Build a limited 3D teaching-demo pilot for `ch2-2-2` and `ch3-6-2`. Keep Sim2 SVG-first and `js/sim2/physics/*` canonical. Add local/offline Three.js only as an optional viewport layer with deterministic fallback to 2D.

## Source Context

- Brainstorm: [Sim3 Pilot Report](../reports/260602-2057-brainstorm-sim3-pilot-two-route-upgrade.md)
- Architecture: [System Architecture](../../docs/system-architecture.md)
- Design rules: [Design Guidelines](../../docs/design-guidelines.md)
- Standards: [Code Standards](../../docs/code-standards.md)

## Cross-Plan Dependencies

| Relationship | Plan | Status | Note |
|---|---|---|---|
| Related | [Sim2 pro visual UX](../260531-1657-sim2-pro-visual-ux-theory-upgrade/plan.md) | frontmatter pending, phases done | Treat as completed foundation |
| None | [DOCX duplicate captions](../260522-0946-fix-duplicate-image-captions-docx-html-pipeline/plan.md) | pending | Different files/scope |

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [RED: Sim3 Contract And Fallback Tests](./phase-01-red-sim3-contract-and-fallback-tests.md) | Done |
| 02 | [Vendor Three.js Offline](./phase-02-vendor-threejs-offline.md) | Done |
| 03 | [Build Sim3 Core Shell](./phase-03-build-sim3-core-shell.md) | Done |
| 04 | [Pilot `ch2-2-2` Fixed Axis Rotation](./phase-04-pilot-ch2-2-2-fixed-axis-rotation.md) | Done |
| 05 | [Pilot `ch3-6-2` Collision](./phase-05-pilot-ch3-6-2-collision.md) | Done |
| 06 | [Visual QA, Docs, And Release Gates](./phase-06-visual-qa-docs-and-release-gates.md) | Done |

## Dependency Graph

```text
Phase 01 -> Phase 02 -> Phase 03 -> Phase 04 -> Phase 05 -> Phase 06
```

Keep sequential. Each phase depends on the prior contract/test foundation.

## Key Constraints

- No full 25-route 3D rollout in this plan.
- No physics rewrite.
- No runtime bundler.
- Three.js must load offline from local files.
- WebGL unavailable/init failure must not break 2D route mount.
- Existing `SIM_MAP[pageId] -> factory(container) -> { dispose }` unchanged.

## Success Criteria

- `ch2-2-2` and `ch3-6-2` have working offline 3D pilot mode.
- Existing 2D SVG mode remains available.
- Controls/readouts remain Sim2-owned and sync 3D scene state.
- WebGL fallback/dispose tests pass.
- `npm run test:sim:physics` passes.
- `npm run test:sim:mount` passes.
- `npm run test:sim:release` passes.
- `npm run test:sim3:visual:capture` passes and screenshots exist in `plans/260602-2103-sim3-two-route-threejs-pilot/visuals/`.

## Cook Handoff

Run:

```powershell
/ck:cook C:\Work\GiaoTrinhDienTu_CoHocLyThuyet\plans\260602-2103-sim3-two-route-threejs-pilot\plan.md
```
