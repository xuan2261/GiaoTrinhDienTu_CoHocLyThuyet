# Reviewer Report - 260512 Phase 01 Post Regression Review

## Code Review Summary

### Findings First

#### Critical Issues
- None found.

#### High Priority
1. `js/sims/ch1/ch1-force-law-behaviors.js:32` / `js/sims/ch1/ch1-force-law-behaviors.js:156` - `ch1-1-3` controls can still diverge from geometry/readouts when slider state asks for an endpoint outside canvas bounds.
   - Evidence: reviewer Playwright probe on current worktree, route `ch1-1-3`, initial state `force=260`. Setting angle slider to `-45` yields readout `|F|=220.6N`, `α=-34°`, while slider + inline controls still show `260N`, `-45°`.
   - Evidence: drag `force-tail-a` to top edge `{x:732,y:28}`, then set angle slider to `75`: readout `|F|=153.3N`, `α=64°`, while controls still show `260N`, `75°`. Drag to bottom edge then set angle `-45` gives readout `183.8N`, `0°`, controls `260N`, `-45°`.
   - Root cause: `setForceByAngle()` stores requested `state.force/state.angle`, then clamps only `state.vector` via `bounded(...)`. `forceLawDerived()` reads real geometry from `primary/vector`, while `syncControlDisplays()` reads canonical slider keys from state.
   - Impact: route passes drag-only tests but a normal slider action can produce inconsistent visual vector, readout cards, and controls. This violates the readout/control consistency requirement.
   - Fix: make `setForceByAngle()` preserve one canonical contract. Prefer constraining/moving `state.primary` so requested force/angle remain drawable, like `moveForceTail()` does; alternatively recompute `state.force/state.angle` from final bounded geometry and sync controls to that final value.

#### Medium Priority
1. `tests/simulation-interaction-engine.spec.js:120` / `tests/simulation-interaction-engine.spec.js:238` - regression coverage misses combined boundary sequences for `ch1-1-3`.
   - Current control audit toggles each slider to only one opposite endpoint and resets after each control; for `ch1-1-3`, it tests angle max but not angle min while force remains max.
   - Current `force-tail-a` regression checks drag-only consistency, then resets; it does not check slider operations after tail is clamped to top/bottom canvas edges.
   - Fix: add a targeted case that asserts readout force/angle, slider value, and inline display after `angle=-45` from initial max force, and after `force-tail-a` top/bottom drag followed by angle min/max.

### Scope
- Files reviewed: `js/sims/ch1/ch1-force-law-scenes.js`, `js/sims/ch1/ch1-force-law-renderers.js`, `js/sims/ch1/ch1-force-law-behaviors.js`, `js/sim-professional-lab.js`, `tests/simulation-interaction-engine.spec.js`
- LOC: 2174 scoped lines. CH1 route files: scenes 168, renderers 220, behaviors 220.
- Focus: post-regression review of Phase 01 CH1 core force routes, direct drag, boundary sync, readout/control consistency, KaTeX, test gaps.
- Scout findings: previous `force-tail-a` drag-only bug is fixed; remaining edge is slider-after-boundary and initial infeasible slider angle. Dependents checked: `index.html`, `sim-statics.js`, `statics-routes.js`, `sim-route-manifest.js`, `sim-interactions.js`, renderer primitives, test utils.

### Overall Assessment
The six Phase 01 routes are registered and render with dedicated scenes/renderers/behaviors. Formula panels render KaTeX on all six routes; overlay KaTeX exists on five math-heavy routes, while `ch1-1-8` uses a text reaction panel plus KaTeX formula panel. `force-tail-a` drag-only sync now holds at tested edges. The remaining blocker-class concern is `ch1-1-3` slider feasibility after geometry is near boundaries.

### Low Priority
- None.

### Edge Cases Found by Scout
- `ch1-1-3` initial state allows `force=260`, `angle=-45`, but that endpoint cannot fit inside current canvas from point `A=(170,290)`.
- `ch1-1-3` tail edge drag is consistent immediately after drag, but top/bottom tail positions make later angle slider extremes infeasible.
- `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, and `ch1-2-1` did not show the same scoped control/readout mismatch in this review pass.

### Positive Observations
- No auth/authz, DB, N+1 query, secret, or PII exposure surface in this static simulation path.
- Readouts and handle legends use `textContent`; no user-controlled HTML injection found in the reviewed path.
- Active handle lifecycle is explicitly cleared in `sim-interactions.js`; current tests cover the attribute lifecycle.
- CH1 route files satisfy the 220-line gate exactly: `168/220/220`.

### Verification
- PASS `node --check` for all five scoped JS/spec files.
- PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\audit_simulation_quality.py --all --max-js-lines 220`
- FAIL reviewer probe for `ch1-1-3` angle slider/readout consistency at infeasible boundary states, as described above.

### Recommended Actions
1. Fix `setForceByAngle()` so bounded geometry and canonical slider state cannot diverge.
2. Add the missing `ch1-1-3` slider-after-boundary regression tests.
3. Re-run the final validation suite after the fix, especially `@direct-drag|@control-audit`.

### Metrics
- Type Coverage: N/A (plain JS).
- Test Coverage: not collected.
- Linting Issues: 0 syntax issues in scoped files.

### Checklist Review
- Concurrency: checked; no shared async race found.
- Error boundaries: mount rollback/listener cleanup covered by existing runtime smoke; renderer errors intentionally propagate.
- API contracts: one handle/control/readout contract bug found.
- Backwards compatibility: no route id or registry break found for the six Phase 01 routes.
- Input validation: incomplete for infeasible `ch1-1-3` slider/geometry combinations.
- Auth/authz: not applicable.
- N+1/query efficiency: not applicable.
- Data leaks: none found.
- Fact-checked: file paths, symbol names, route ids, and behavior claims verified against current code and browser probes.

### Plan Follow-up
- Appears complete: six Phase 01 route registrations, dedicated renderer/behavior/scene entries, DeCuong-style canvas visuals, KaTeX formula panels, trail effect, direct handles, reset path, 760x440 route coordinates.
- Not ready for clean completion: `ch1-1-3` readout/control contract still fails at boundary slider states.
- Plan file status/TODOs remain pending/unchecked. Not edited per instruction.

### Unresolved Questions
- Should `ch1-1-3` slider changes move point `A` when needed to keep the requested `|F|/α` drawable, or should sliders snap to the final bounded geometry after clipping?

**Status:** DONE_WITH_CONCERNS
**Summary:** Phase 01 is mostly clean after final validation, but `ch1-1-3` still has a real boundary readout/control mismatch through angle slider states, including after `force-tail-a` edge drag.
**Concerns/Blockers:** Fix `setForceByAngle()` canonical geometry sync and add targeted regression tests before marking Phase 01 fully clean.
