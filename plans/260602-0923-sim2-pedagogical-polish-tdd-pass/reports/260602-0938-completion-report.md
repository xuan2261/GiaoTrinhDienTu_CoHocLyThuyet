# Completion Report

---
date: 2026-06-02
type: completion
scope: sim2-pedagogical-polish-tdd-pass
---

## Summary

Completed TDD pass for 3 Sim2 pedagogical polish targets and added selective visual baselines.

## Changes

| Area | Result |
|---|---|
| `ch2-4-4` | Added separated semantic callouts for `v_rel` and `a_cor`; label cluster is less dense. |
| `ch3-6-2` | Added explicit `Pha: Trước/Sau va chạm` readout and after-collision state label; reset clears cue. |
| `ch1-6-3` | Added `-A lỗ` readout and negative-area observe wording. |
| Visual baseline | Added dev-only selective baseline config/spec for 5 representative routes. |

## Verification

| Command | Result |
|---|---|
| Focused RED tests before implementation | Failed as expected |
| Focused route tests after implementation | PASS, 3/3 |
| `npm run test:sim:visual:baseline:update` | PASS, 5 snapshots created |
| `npm run test:sim:visual:baseline` | PASS, 5/5 |
| `npm run test:sim:mount` | PASS, 104/104 |
| `npm run test:sim:release` | PASS |
| `npm run test:sim:visual:capture` | PASS, 25/25 |
| `node tools/sim2-visual/build-contact-sheet.js` | PASS, 25 route, 58 images |

## Constraints

- No `js/sim2/physics/*` changes.
- No runtime dependency.
- Baseline command is dev-only, not part of `test:sim:release`.
- Mount contract unchanged.

## Unresolved Questions

- None.
