# Sim2 Visual Motion Polish v1

Date: 2026-06-02

## Summary

Completed approved rollout after Phase 02 pilot sign-off. The work kept the SVG-first engine and physics modules intact while adding shared visual feedback primitives and route-family cues.

## Key Changes

- Shared core: handle pulse/active state, output/readout flash, formula highlight hooks, fade trail opt-in, reduced-motion guards.
- Ch1: handle affordance plus semantic guide lines for moment arm, couple distance, support reactions, friction cone, and centroid axes.
- Ch2: fade/current markers, angle marker, IC radius guides, and preserved transmission semantic hooks.
- Ch3: graph cursors, action-reaction pairing, equilibrium/impulse/work/angular momentum guides, and reset-clean collision impact cue.

## Verification

- `npm run test:sim:release`: PASS.
- `npm run test:sim:visual:capture`: PASS, 25/25.
- `node tools\sim2-visual\build-contact-sheet.js`: PASS.

## Follow-Up Polish Pass

- Added route-local teaching polish for `ch2-4-4`, `ch3-6-2`, and `ch1-6-3`.
- Added dev-only selective screenshot baseline command for 5 representative routes.
- Verification: `test:sim:visual:baseline`, `test:sim:mount`, `test:sim:release`, and `test:sim:visual:capture` all PASS.

## Unresolved Questions

- Cross-OS screenshot baselines may need OS-specific snapshots if this dev-only command is run outside Windows.
