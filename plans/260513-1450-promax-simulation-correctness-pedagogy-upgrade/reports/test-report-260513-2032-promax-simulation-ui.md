---
title: "Test Report - Promax Simulation UI"
date: 2026-05-13
scope: "plans/260513-1450-promax-simulation-correctness-pedagogy-upgrade/plan.md and simulation visual UI"
status: PASS
---

# Test Report - 2026-05-13 - Promax Simulation UI

## Test Results Overview

- **Status**: PASS
- **Failed**: 0
- **Skipped**: 0 observed in executed gates
- **Release gate**: `npm run test:sim:release` PASS

## Gates Executed

| Gate | Result | Notes |
|---|---:|---|
| `python tools\smoke_simulation_routes.py --require-p1` | PASS | 58/58 P1 routes covered |
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct` | PASS | 58 objectives, 58 direct interactions |
| `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` | PASS | 58 unique scene signatures |
| `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` | PASS | 58 renderer + 58 behavior registrations |
| `python tools\smoke_simulation_runtime.py ... --check-raf-cleanup` | PASS | globals, rollback, listener cleanup, runtime routes |
| `npm run test:sim:unit` | PASS | 104 JS syntax checks + simulation/Promax unit tests |
| `npm run test:sim:quality` | PASS | quality audit gate |
| `npm run test:sim:semantic` | PASS | scene identity + renderer contract browser checks |
| `npm run test:sim:browser` | PASS | 173 Playwright tests |
| `npm run test:sim:visual-quality` | PASS | 4 Playwright visual quality tests |
| `npm run test:sim:release` | PASS | unit + quality + browser + visual + disposal + content/equation audits |

## UI Test Results

- **Routes tested by browser mount**: 58 canonical simulation routes.
- **Promax pilot routes checked**: `ch1-2-3`, `ch1-5-3`, `ch2-1-2`, `ch2-5-2`, `ch3-3-1`, `ch3-6-2`.
- **Interaction coverage**: direct drag, semantic readout updates, controls, animation pause/play state, reset, keyboard nudge, touch drag.
- **Responsive coverage**: 375px, 768px, 1280px representative shell checks; visual suite checks dark/light readability and no responsive overflow.
- **Visual coverage**: all 58 canvases nonblank, bounded, route-owned; renderer/behavior/scene identities unique.
- **Console errors**: none observed in executed route load audits.

## Build Status

- **Syntax/build equivalent**: PASS via `node --check` on 104 JS files.
- **Content audit**: PASS, 102 HTML/content files OK, 0 warnings, 0 errors.
- **Equation audit**: PASS, 702 reviewed equation mapping rows, strict KaTeX validation OK.

## Critical Issues

- None.

## Recommendations

1. Keep `npm run test:sim:release` as canonical gate before handoff/publish.
2. For future 52-route Promax rollout, add route-specific invariant tests before visual polish.
3. Consider separate non-blocking refactor plan for large shared JS files reported by quality audit; current gate passes.

## Unresolved Questions

- None.
