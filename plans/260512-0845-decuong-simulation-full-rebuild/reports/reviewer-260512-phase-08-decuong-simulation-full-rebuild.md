# Code Review Summary

## Scope
- Files: `js/sims/ch2/ch2-kinematics-behaviors-b.js`, `js/sims/ch2/ch2-kinematics-scenes.js`, `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`, `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`, `tests/phase-08-tdd.test.js`, `package.json`
- Focus: Phase 08 diff, ch2-4-1..ch2-4-4 and ch2-5-1..ch2-5-3 runtime contracts
- Scout findings: readout/control path uses scene keys plus `SimProfessionalLab` generic derived values; physics unit tests cover behavior invariants but not final readout values after scene merge.

## Overall Assessment
Behavior formulas mostly encode required invariants, but there are blocking UI-contract regressions: route readouts and controls can show/update values that are not the actual route model. These pass current tests because `tests/phase-08-tdd.test.js` calls behavior `onTick` directly and skips the scene/readout merge path.

## Critical Issues
None found.

## High Priority
1. `ch2-5-1` readouts can display the wrong `|v_A|` and `|v_B|`. `ch2-kinematics-scenes.js:26` maps `|v_A|`/`|v_B|` through `readKey()` to `va`/`vb` at `ch2-kinematics-scenes.js:156-157`, while behavior writes correct numeric magnitudes at `ch2-kinematics-behaviors-b.js:113-114`. At runtime, `SimProfessionalLab` merges generic derived values after state; `d.va` falls back to particle speed when `state.va` is numeric, and `d.vb` is `|AB|*omega`, ignoring translational `v_A`. Impact: plane-motion readouts violate required `vB = vA + omega x AB` even though the renderer arrow uses `state.vB`. Fix: use route-specific keys such as `vAMag`/`vBMag`, or change the formatter contract so route state magnitudes are not overwritten by generic `d.va`/`d.vb`.

2. `ch2-4-4` "Vận tốc tương đối" control is not connected to the Coriolis model. Scene control uses key `vrMag` at `ch2-kinematics-scenes.js:25`, but behavior ignores `state.vrMag` and recomputes `state.vr` only from `state.vrx/state.vry` at `ch2-kinematics-behaviors-b.js:92-96`. Impact: moving the relative-velocity slider changes the displayed control value but not `v_r`, `a_c`, or the arrows, so the main invariant `a_c = 2 omega x v_r` is not user-controllable through the labeled control. Fix: either bind the slider to vector magnitude by rescaling `vrx/vry`, or expose separate vector controls/handle-only interaction and remove the inert `vrMag` slider.

3. Several Phase 08 angle/phase controls are overwritten or ignored by `onTick`. `ch2-4-3` exposes `phi` at `ch2-kinematics-scenes.js:24`, then overwrites it every tick at `ch2-kinematics-behaviors-b.js:77`. `ch2-5-2` exposes `theta` at `ch2-kinematics-scenes.js:27`, but behavior forces fixed `ax/ay/bx/by` at `ch2-kinematics-behaviors-b.js:128-132`, so renderer fallback geometry using `theta` is bypassed. Impact: controls appear to work in generic readout/control smoke tests but do not drive the model. Fix: make controls authoritative when changed, or rename them as read-only phase/status and avoid exposing inert sliders.

## Medium Priority
1. `tests/phase-08-tdd.test.js` misses the production readout/control contract. It validates direct behavior state only (`tests/phase-08-tdd.test.js:33-87`) and never instantiates scenes, readout keys, generic derived merge, sliders, or renderers. Add a focused regression that mounts/uses `formatReadoutItems` path for ch2-4/ch2-5 and asserts readout values match route-specific physics after `onTick`, slider changes, and handle drag.

2. Drag handlers update geometry without recomputing route-specific derived vectors until a later tick. Example: `plane-point-b` changes only `bx/by` in `sim-professional-lab.js:880-882`, while `vBA/vB/vb` are recomputed only in `ch2-kinematics-behaviors-b.js:110-114`. If the route has already ticked, renderer code prefers stale `state.vBA/state.vB` at `ch2-instant-center-plane-motion-renderers.js:41-46`. Impact: post-drag canvas arrows can briefly disagree with the dragged body. Fix: recompute route vectors in handle setters or a shared route-derived function used by both tick and drag.

## Low Priority
None material.

## Edge Cases Found by Scout
- Readout keys collide with generic derived names (`va`, `vb`, `ac`), so final UI values may differ from behavior state.
- Controls that only change a raw scene key can pass "readout changed" smoke tests while leaving the actual physics vector unchanged.
- Route-owned handle setters and animation ticks update different subsets of state.

## Positive Observations
- Core behavior formulas for `v_a = v_e + v_r`, `a_c = 2 omega x v_r`, and `v = omega x r` are present and directly tested.
- New unit test is wired into `npm run test:sim:unit`.
- Renderer registrations remain route-specific.

## Recommended Actions
1. Fix Phase 08 readout keys to avoid generic `va/vb` collisions, especially `ch2-5-1`.
2. Rewire or remove inert controls (`vrMag`, `phi`, `theta`) so UI controls drive model state.
3. Add runtime-level tests for mounted scene readouts after tick, slider, and direct drag.
4. Recompute derived vectors in handle setters or centralize route derived state.

## Metrics
- Type Coverage: N/A, plain JS
- Test Coverage: targeted Phase 08 behavior tests added; missing mounted UI/readout coverage
- Linting Issues: not run in this review; local verification reported passed by requester

## Unresolved Questions
- Should `phi/theta` sliders be manual controls, or just animated phase readouts?
