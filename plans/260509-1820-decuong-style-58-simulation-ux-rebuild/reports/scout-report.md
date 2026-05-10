---
title: "Scout Report"
status: complete
created: 2026-05-09
---

# Scout Report

## Relevant Files

| File | Role |
|---|---|
| `README.md` | Runtime, simulation QA, project constraints |
| `docs/code-standards.md` | Max JS line rule, registry contract, required validations |
| `docs/design-guidelines.md` | Simulation visual tokens and scoped `.sim-lab` rules |
| `docs/system-architecture.md` | Current simulation architecture |
| `docs/project-roadmap.md` | Current roadmap and completed simulation phases |
| `DeCuong_CoHocLyThuyet.html` | UX reference for direct manipulation and dark lab style |
| `css/style.css` | Existing `.sim-lab`, controls, readout, responsive CSS |
| `js/sim-lab-ui.js` | Shared lab shell creation |
| `js/sim-professional-lab.js` | Shared simulation orchestration, readout, controls, handles |
| `js/sim-route-manifest.js` | 58 route objective manifest |
| `js/sims/ch1/*` | Ch1 route scenes/renderers/behaviors |
| `js/sims/ch2/*` | Ch2 route scenes/renderers/behaviors |
| `js/sims/ch3/*` | Ch3 route scenes/renderers/behaviors |
| `tests/simulation-browser.spec.js` | Browser route/interaction QA |
| `tests/simulation-visual-quality.spec.js` | Visual route QA |
| `package.json` | Canonical simulation test scripts |

## Current Baseline

- Runtime already covers 58 P1 routes.
- Route-specific scene/renderer/behavior contracts already exist.
- Current shell is simple and testable, but not DeCuong-like enough visually.
- DeCuong reference has better student-facing affordance for 3 sample interactions.
- Current docs say browser suite has many skipped route-wide tests; new plan should reduce blind spots through representative + route group gates.

## Existing Plan Scan

| Plan | Status | Decision |
|---|---|---|
| `260507-1855-simulation-visual-ux-upgrade` | cancelled | Replaced by this plan intent; no update needed |
| `260508-simulation-visual-overhaul-v2` | cancelled | Not used; different neon/full redesign direction |
| `260508-2106-simulation-redesign` | completed | Foundation exists; this plan builds on current runtime, not rewrite |
| `260508-1921-simple-simulation-lab-debug-verification-hardening` | completed | Stable baseline for this work |
| `20260505-2044-local-math-ocr-semantic-math-strict-publish` | in-progress | No direct dependency for simulation UX implementation |

## Route Groups

| Group | Routes |
|---|---|
| Ch1 core statics | `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`, `ch1-2-3`, `ch1-2-6`, `ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4` |
| Ch1 applied | `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2` |
| Ch2 motion basics | `ch2-1-1`, `ch2-1-2`, `ch2-1-3`, `ch2-1-4`, `ch2-2-2`, `ch2-3-2` |
| Ch2 composition/plane motion | `ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4`, `ch2-5-1`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2` |
| Ch3 foundations | `ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`, `ch3-3-1`, `ch3-3-2`, `ch3-4-1`, `ch3-4-2` |
| Ch3 theorem/collision | `ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2` |

## Constraints

- Keep app static and offline-first.
- Do not edit generated `js/pages.js`.
- No runtime bundler/framework.
- Keep JS files under 220 lines when touched; split only if real need.
- Keep route ids and manifest coverage exactly 58.
- Maintain `data-theme` light/dark compatibility.

## Unresolved Questions

Không có.
