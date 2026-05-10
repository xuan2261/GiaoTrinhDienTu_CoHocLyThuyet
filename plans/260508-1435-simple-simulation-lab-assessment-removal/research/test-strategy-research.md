---
title: "Test Strategy Research"
type: research
created: 2026-05-08
---

# Test Strategy Research

## Testing Principle

Replace assessment tests with simple-shell tests. Do not lower total confidence.

Keep coverage for:
- 58 route discovery.
- 58 route mount.
- renderer/behavior uniqueness.
- hidden/object-bound direct interaction.
- canvas nonblank.
- animation tick.
- animation pause/resume/reset.
- representative physics/readout consistency.
- responsive/mobile.
- `file://`.
- lifecycle cleanup.
- no visible generic round drag handles, hit circles, or handle labels.

Remove coverage for:
- checkpoint panel existence.
- checkpoint precondition.
- positive assessment save.
- malformed assessment storage.
- manifest checkpoint count.
- visible generic handle-marker UI over canvas.

## Proposed Test Updates

| Existing | Change |
|---|---|
| `tests/simulation-browser.spec.js` | Replace `expectLabShell` checkpoint assertion with simple shell assertions |
| `tests/simulation-browser.spec.js` | Delete or replace `ASSESSMENT_PASS_CASES` |
| `tests/simulation-browser.spec.js` | Add reset/play-pause/readout card assertions |
| `tests/simulation-visual-quality.spec.js` | Add no checkpoint UI/text and no visible generic handle marker assertions |
| `tests/simulation-physics.test.js` | Extend helper/readout consistency coverage for representative Ch1/Ch2/Ch3 cases |
| `tools/smoke_simulation_manifest.py` | Rename semantics internally: objectives/direct/route metadata; no checkpoint min |
| `tools/audit_simulation_quality.py` | Remove `--require-assessment`, add `--forbid-assessment` or no assessment scan |
| `tools/smoke_simulation_runtime.py` | Remove malformed assessment storage gate |
| `package.json` | Update `test:sim:quality` and `test:sim:release` |

## New Assertions

- `.sim-readout-grid` has at least 2 cards on every route.
- `.sim-lab-hint` or equivalent is visible.
- `.sim-checkpoint-panel` count is 0.
- Visible text does not contain `Điểm kiểm tra`.
- Visible text does not contain generic `điểm kéo`, `điểm điều khiển`, `handle`, or `cursor`.
- `render.drawHandle()` is not used for default visible route handles.
- Hidden interaction diagnostics may exist for tests; visible handle markers must not.
- `localStorage.getItem('chlyt_sim_assessment_v2')` remains null after route interaction in a fresh browser context.
- Slider/button/reset changes update `.sim-readout-value`.
- Animated route play/pause freezes/resumes canvas hash or readout state.
- Physics helper assertions cover statics resultant/reactions, kinematics trajectory/rotation, and dynamics energy/collision.

## Phase Gates

Use small gates after each phase, full release only at end.

## Unresolved Questions

- None.
