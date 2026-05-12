# Re-review prior findings

## Scope
- Files inspected: `js/sim-professional-lab.js`, `js/sims/ch2/ch2-kinematics-scenes.js`, `js/sims/ch2/ch2-kinematics-behaviors-a.js`, `js/sims/ch2/ch2-kinematics-behaviors-b.js`, `js/sims/ch2/ch2-kinematics-exercises-renderers.js`, `tests/phase-08-tdd.test.js`, `tests/phase-09-12-tdd.test.js`
- Focus: current uncommitted fixes for prior findings.
- Scout findings: affected paths are shared slider sync, route behavior ticks, direct-drag handlers, scene labels, and renderer visible text.

## Findings
- No blockers found.

## Prior Findings Verification
1. `ch2-5-3` L slider: resolved. Slider sync calls `syncCh2VelocityDistributionState` for `key === 'L'` in `js/sim-professional-lab.js:369`, and behavior derives endpoint geometry from `state.L` in `js/sims/ch2/ch2-kinematics-behaviors-b.js:164`. Locked by `tests/phase-08-tdd.test.js:91`.
2. `ch2-1-3` rho slider: resolved. Slider sync handles `rho` in `js/sim-professional-lab.js:338`, direct drag writes `state.rho` in `js/sim-professional-lab.js:765`, and behavior uses `state.rho` rather than hardcoded 104 in `js/sims/ch2/ch2-kinematics-behaviors-a.js:155`. Locked by `tests/phase-08-tdd.test.js:33`.
3. `ch2-7-2` valid `x0=0`: resolved. `finiteNumber` preserves zero in `js/sim-professional-lab.js:30`; direct drag uses it at `js/sim-professional-lab.js:685`; behavior uses it at `js/sims/ch2/ch2-kinematics-behaviors-b.js:205`. Locked by `tests/phase-09-12-tdd.test.js:66` and source guard at `tests/phase-09-12-tdd.test.js:75`.
4. CH2 checker English label leak: resolved for visible labels. Scene labels are Vietnamese at `js/sims/ch2/ch2-kinematics-scenes.js:29` and `js/sims/ch2/ch2-kinematics-scenes.js:30`; renderer visible status is Vietnamese at `js/sims/ch2/ch2-kinematics-exercises-renderers.js:84` and `js/sims/ch2/ch2-kinematics-exercises-renderers.js:137`. Remaining `verify/status/result` hits are internal ids, state keys, color keys, comments, or compatibility mappings.

## Verification
- `node tests\phase-08-tdd.test.js` PASS
- `node tests\phase-09-12-tdd.test.js` PASS
- `rg` check found no `(state.x0 || 5)`, no `Verify consistency`, no old scene-label tuple leak.

## Residual Risk
- Review was scoped to prior findings and targeted TDD. Full browser interaction/visual regression was not rerun.

## Unresolved Questions
- None.
