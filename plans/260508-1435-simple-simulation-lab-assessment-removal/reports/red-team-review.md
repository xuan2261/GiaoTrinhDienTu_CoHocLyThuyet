---
title: "Red Team Review - Simple Simulation Lab Assessment Removal"
type: red-team-review
created: 2026-05-08
---

# Red Team Review

## Findings

| Severity | Risk | Mitigation |
|---|---|---|
| High | Removing `sim-assessment.js` can break script order or global expectations. | First remove call sites and tests, then remove script load, then delete file only after `rg SimAssessment` clean. |
| High | Existing QA commands can false-fail because they require checkpoints. | Update `package.json`, `tools/smoke_simulation_manifest.py`, `audit_simulation_quality.py`, `smoke_simulation_runtime.py` in same phase as assessment removal. |
| High | Readout refactor can hide route-specific state and weaken teaching value. | Derive readout cards from existing `scene.readouts` plus named mechanics quantities, not generic handle coordinates; add all-route browser assertion. |
| High | Removing visible round drag handles can accidentally break actual pointer/touch/keyboard interaction. | Keep interaction diagnostics and invisible/object-bound hit targets; add representative pointer/touch/keyboard tests that verify readout/canvas change. |
| High | Animation can look active while formulas/readouts drift from physics. | Pair animation hash tests with pause/resume/reset and representative physics/readout assertions. |
| Medium | CSS simplification can break responsive/mobile canvas sizing. | Preserve `.sim-lab-scene`, `.sim-lab-overlay`, `.sim-canvas`; run responsive and route-mount Playwright tests. |
| Medium | Deleting checkpoints removes a learning affordance some users may use. | Replace with short passive objective/hint, no scoring. |
| Medium | Stale localStorage key remains on existing browsers. | Do not read/write it; optional docs note. No migration unless user requires cleanup. |
| Low | Plan conflicts with pending visual overhaul plans. | Mark visual plans blocked by this baseline simplification. |

## Rejected Shortcuts

- CSS-only hiding checkpoints.
- Keeping `sim-assessment.js` loaded but dormant.
- Rewriting renderers route-by-route before shell is stable.
- Keeping generic round drag handles and only changing colors.
- Removing all interactions just to eliminate handle markers.
- Adding a new UI framework or bundler.

## Required Gates

- Static search must prove no runtime/test gate still depends on `SimAssessment`.
- Browser must prove no checkpoint panel or text visible on representative and all-route cases.
- Static/browser checks must prove generic round handle markers and generic handle text are not visible.
- Browser must prove sliders/buttons/reset/play-pause and retained object-bound interactions update visible readout cards.
- Physics/unit and browser checks must cover representative statics, kinematics, and dynamics formulas.
- Runtime smoke must still prove mount rollback and listener cleanup.

## Unresolved Questions

- None.
