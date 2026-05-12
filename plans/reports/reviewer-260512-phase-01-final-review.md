# Reviewer Report - 260512 Phase 01 Final Review

## Code Review Summary

### Scope
- Files: `js/sim-professional-lab.js`, `js/sims/ch1/ch1-force-law-scenes.js`, `js/sims/ch1/ch1-force-law-renderers.js`, `js/sims/ch1/ch1-force-law-behaviors.js`
- LOC: 1817 total (`sim-professional-lab.js` 1210; scenes 168; renderers 220; behaviors 219)
- Focus: re-review after semantic fixes, Phase 01 CH1 force routes, real runtime correctness
- Scout findings: 4 scoped files are still untracked/new in git; `git diff HEAD~1` covers larger rebuild, so review used current file contents plus dependents.

### Overall Assessment
Previous semantic blockers mostly resolved: moment routes now use `PX_PER_M=60` and direct N.m values; Phase 01 moment readouts no longer use `scale: 0.01`; `ch1-1-5` `resultantMagnitude` is now true draggable `R`; direct handle set calls `syncControlDisplays`; `ch1-1-3` and `ch1-2-1` tip drags update `state.angle`.

Still one real behavioral bug remains in direct-drag/control sync at route boundaries. It passes current smoke/visual tests because tested drags are moderate, but users can trigger inconsistent readout/control state by dragging handles farther.

### Critical Issues
- None.

### High Priority
1. `[js/sims/ch1/ch1-force-law-behaviors.js:44]` / `[js/sim-professional-lab.js:276]` / `[js/sims/ch1/ch1-force-law-behaviors.js:169]` Direct drag can leave control state outside slider/domain contracts.
   - Evidence: browser probe after dragging `ch1-1-4` point `P` to `x=90` shows readouts `F=110N|d=1m|M=110N.m`, but `d` slider still displays `180px`. `setVerticalForce()` updates `primary/vector`, not `state.load`, while `syncControlDisplays()` reads `state[control.key]`.
   - Evidence: dragging vector tips to canvas edge:
     - `ch1-1-3`: readout `|F|=300N`, slider input clamped to max `260`, inline label `614.758N`.
     - `ch1-1-5`: readout `|R|=300N`, slider max `180`, inline label `328.661N`.
     - `ch1-2-1`: readout `|F|=300N`, slider max `170`, inline label `325.220N`; angle readout `37.5°` while slider max is `30°`.
   - Impact: visual vector, readout cards, and controls disagree. Next slider interaction jumps from stale/clamped control state, so student sees a polished but physically inconsistent model.
   - Fix: make handle setters preserve the same canonical state keys as sliders. For `ch1-1-4`, update/clamp `state.load` from `primary.x - originO.x` or constrain `P` to the slider domain. For vector routes, either clamp direct-drag magnitude/angle to route control ranges before setting `state.vector/state.force/state.angle`, or expand controls/readouts to the real direct-drag domain. `syncControlDisplays()` should format/clamp display from canonical state, not print raw out-of-range values.

### Medium Priority
- None found beyond the high-priority direct-drag domain issue.

### Low Priority
- None.

### Edge Cases Found by Scout
- Dependents checked: `index.html` script order, `js/sim-statics.js`, `js/sims/ch1/statics-routes.js`, `js/sim-route-manifest.js`, `tests/simulation-interaction-engine.spec.js`, `tests/simulation-test-utils.js`.
- Data path checked: `routeId -> SimProfessionalLab.mount() -> scene/renderer/behavior -> direct handles -> syncControlDisplays -> readout cards`.
- Edge case found: direct handle setters mutate geometric state, but not always the slider-backed canonical keys; range inputs clamp internally while inline labels show raw state.

### Positive Observations
- Moment semantics verified: fresh browser probe shows `ch1-1-4` initial `F=110N|d=3m|M_O=330N.m`; `ch1-1-6` initial `F=90N|d=3m|M=270N.m`.
- No hidden-force addition remains in `ch1-1-5` `resultantMagnitude`.
- No auth/authz, N+1, PII, secret, or external data trust boundary in this static local simulation surface.
- DOM text rendering uses `textContent` for readouts; no user-controlled `innerHTML` found in scoped path.

### Recommended Actions
1. Fix direct-drag canonical state sync and domain clamping for `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, and `ch1-2-1`.
2. Add focused regression test: drag handle to near canvas boundary, assert readout card, slider `value`, and inline slider label agree or are intentionally clamped with same value.
3. Decide signed vs constrained moment for `ch1-1-4` when direct drag crosses left of `O`.

### Validation
- PASS `node --check` on all 4 scoped files.
- PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- Targeted Playwright probes: moment initial semantics pass; direct-drag boundary mismatch reproduced.

### Metrics
- Type Coverage: N/A (plain JS)
- Test Coverage: not collected
- Linting Issues: 0 syntax issues in scoped files

### Plan Follow-up
- Appears complete: 6 Phase 01 route registrations, dedicated renderers/behaviors, DeCuong visuals, KaTeX overlays, trails, reset path, 760x440 scene coords.
- Not complete for done status: direct-drag/control contract still has boundary correctness gap.
- Plan file status/TODOs remain pending/unchecked. Not edited per instruction.

### Checklist Review
- Concurrency: checked; no async race found in scoped code; listener/RAF cleanup covered by provided runtime smoke.
- Error boundaries: mount rollback path covered by provided validation; renderer errors still propagate to console by existing pattern.
- API contracts: issue found in handle-to-control state contract.
- Backwards compatibility: no route id or registry break found for 6 Phase 01 routes.
- Input validation: direct-drag boundary validation incomplete.
- Auth/authz: not applicable.
- N+1/query efficiency: not applicable.
- Data leaks: none found.
- Fact-checked: file paths, symbol names, and behavior claims grep/browser verified.

### Unresolved Questions
- Should `ch1-1-4` direct drag allow `P` left of `O` and show signed moment/arc direction, or should it constrain `P` to positive `d` like the slider?
- Should direct drag share slider limits, or should sliders expand to the full canvas-reachable force/angle domain?

**Status:** DONE_WITH_CONCERNS
**Summary:** Previous semantic blockers are resolved, but final review found one remaining high-priority direct-drag/control contract bug at boundary values.
**Concerns/Blockers:** Fix direct-drag canonical state sync/domain clamping before marking Phase 01 done.
