---
title: "Route-Specific Simulation Rebuild"
description: "One-pass plan to polish all 58 registry-backed simulations with DeCuong-style direct manipulation and route-specific renderer/behavior upgrades."
status: pending
priority: P1
effort: 46h
branch: no-git
tags: [plan, simulations, decuong, route-specific, qa, offline]
blockedBy: []
blocks: [260509-1820-decuong-style-58-simulation-ux-rebuild]
created: 2026-05-10
---

# Route-Specific Simulation Rebuild

## Goal

- Finish the remaining route-specific pass after the shared shell sweep: keep the registry-backed mount path in `js/sims/ch1/statics-routes.js:15`, `js/sims/ch2/kinematics-routes.js:15`, `js/sims/ch3/dynamics-routes.js:15`, but upgrade route renderers, behaviors, readouts, and animation cues toward the direct-manipulation style evidenced in `DeCuong_CoHocLyThuyet.html:2479`, `DeCuong_CoHocLyThuyet.html:2699`, `DeCuong_CoHocLyThuyet.html:3321`, `DeCuong_CoHocLyThuyet.html:3608`.
- Non-goals: no framework/build step, no `js/pages.js` edits (`README.md:79`, `docs/code-standards.md:80`), no route id churn, no family-level renderer fallback, no shell redesign.

## Locked Constraints

- Runtime stays offline-first and `file://`-safe (`README.md:3`, `docs/system-architecture.md:5`, `docs/project-roadmap.md:75`).
- Every canonical route keeps unique scene, renderer, and behavior identity (`README.md:29`, `tests/simulation-visual-quality.spec.js:71`).
- The shared mount chain stays `scene -> renderer -> behavior -> controls/readouts -> interaction layer` (`js/sim-professional-lab.js:841`, `js/sim-professional-lab.js:925`, `js/sim-professional-lab.js:949`, `js/sim-professional-lab.js:965`).
- Canonical coverage stays 25 Ch1 + 15 Ch2 + 18 Ch3 = 58 routes (`js/sims/ch1/statics-routes.js:15`, `js/sims/ch2/kinematics-routes.js:15`, `js/sims/ch3/dynamics-routes.js:15`).

## Data Flow

- Input enters through canvas pointer/touch/keyboard in `js/sim-interactions.js:57` and simple controls built in `js/sim-professional-lab.js:340`.
- State transforms through route behavior `derived`, `updateStateFromSlider`, `onTick`, and route-owned handles in `js/sim-professional-lab.js:221`, `js/sim-professional-lab.js:229`, `js/sim-professional-lab.js:800`.
- Output exits through dedicated route renderers plus DOM overlay/readout/hint primitives in `js/sim-route-renderer-primitives.js:48`, `js/sim-professional-lab.js:290`, `js/sim-professional-lab.js:330`, `js/sim-professional-lab.js:925`.

## Phases

| Phase | Status | Scope | Detail |
|---|---|---|---|
| 01 | pending | Shared polish hooks only | [phase-01-shared-primitives-and-route-polish-hooks.md](./phase-01-shared-primitives-and-route-polish-hooks.md) |
| 02 | pending | Ch1 25-route statics polish | [phase-02-ch1-route-specific-polish.md](./phase-02-ch1-route-specific-polish.md) |
| 03 | pending | Ch2 15-route kinematics polish | [phase-03-ch2-route-specific-polish.md](./phase-03-ch2-route-specific-polish.md) |
| 04 | pending | Ch3 18-route dynamics polish | [phase-04-ch3-route-specific-polish.md](./phase-04-ch3-route-specific-polish.md) |
| 05 | pending | All-route QA, docs, rollback pack | [phase-05-all-route-regression-and-doc-sync.md](./phase-05-all-route-regression-and-doc-sync.md) |

## Validation Gates

- Fast gates: `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:visual-quality`, `npm run test:sim:browser` (`package.json:7`, `package.json:10`, `package.json:11`, `package.json:12`, `package.json:18`).
- Final gate: `npm run test:sim:release` (`package.json:19`).
- Manual spot gate: open representative routes via `file://` and verify drag/readout/play-pause parity against the DeCuong reference interaction grammar (`README.md:73`, `tests/simulation-interaction-engine.spec.js:74`, `tests/simulation-interaction-engine.spec.js:149`).

## Rollback

- Workspace currently has no `.git` metadata, so each phase must start with a file snapshot under `backups/` before edits; rollback is file-set restore per phase, not blind mass revert.
- Shared phase rollback restores only shared helpers; chapter rollback restores only that chapter's scene/behavior/renderer files; final phase rollback restores docs/tests only.

## Unresolved Questions

- None.
