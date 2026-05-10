---
title: "Research Synthesis"
status: complete
created: 2026-05-09
---

# Research Synthesis

## Summary

Direction: keep current simulation architecture, rebuild UX and route interactions in-place. This is the only pragmatic path. Full rewrite wastes current 58-route registry, renderer/behavior contract, route QA, `file://` support, and release gates.

## Inputs

| Source | Finding |
|---|---|
| `README.md` | Static textbook, no runtime bundler, simulation QA already established |
| `docs/system-architecture.md` | Active runtime: `SimProfessionalLab` + route scene/renderer/behavior registries |
| `docs/design-guidelines.md` | Existing design tokens, scoped `.sim-lab`, dark navy/gold, light mode fallback |
| `docs/project-roadmap.md` | 58-route simulation architecture complete, release gate exists |
| `DeCuong_CoHocLyThuyet.html` | Strong direct manipulation examples: parallelogram, beam reaction, particle motion |
| Browser screenshots | DeCuong dark shell is clearer; current shell has stronger architecture but weaker visual hierarchy |

## DeCuong Patterns To Keep

| Pattern | Apply As |
|---|---|
| Dark lab card with high contrast canvas | Shared `.sim-lab` shell visual language |
| Few controls | Per-route controls limited to what changes learning outcome |
| Readout cards | Structured cards with color-coded values and units |
| Formula/equation near canvas | Optional formula panel below readout or overlay where useful |
| Direct drag | Route-owned handles; pointer movement updates state immediately |
| Reset/play controls | Standard control positions for all animated routes |

## DeCuong Patterns Not To Copy Blindly

| Pattern | Reason |
|---|---|
| Inline JS per simulation | Cannot scale to 58 routes, hard to test |
| Global reset functions | Conflicts with SPA route lifecycle |
| Single hardcoded canvas ids | Breaks multiple route/component contract |
| Dark-only UI | User requires light theme |
| Emoji-heavy controls as core semantics | Use text/icons conservatively; keep accessible names |

## Recommended Architecture

Keep:
- `SimProfessionalLab.mount(routeId)`
- `SimLabUI.createLab()`
- `SimRouteRenderers`
- `SimRouteBehaviors`
- `SimSceneRegistry`
- `SimInteractions`
- existing Playwright/Python gates

Change:
- Shell CSS and DOM slots for DeCuong-style dark/light visual language.
- Shared control model: primary action, reset, play/pause, route presets, numeric sliders.
- Behavior contracts: route-owned handles define state, formulas, readout labels.
- Renderer polish by topic group, not all 58 independently from scratch.
- Tests to fail on generic readouts, unreadable theme, clipped objects, and no-op drag.

## Trade-Offs

| Option | Verdict | Why |
|---|---|---|
| Shell-only polish | Insufficient | Looks better but leaves generic/weak route interactions |
| Route-group UX rebuild | Chosen | Best balance: visible quality + correct physics + safe QA |
| Engine rewrite | Rejected | High risk, low immediate learning value, breaks stable gates |

## Implementation Principle

Each phase should improve actual student behavior:
1. Understand what to drag.
2. See the physical quantity update.
3. Read the formula/equation.
4. Reset or run motion predictably.
5. Work in dark and light theme.

## Unresolved Questions

Không có.
