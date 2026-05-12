# Reviewer Report - 260512 Phase 01 CH1 Core Force Routes

## Code Review Summary

### Scope
- Files: `js/sim-professional-lab.js`, `js/sims/ch1/ch1-force-law-scenes.js`, `js/sims/ch1/ch1-force-law-renderers.js`, `js/sims/ch1/ch1-force-law-behaviors.js`
- LOC: 1817 total (`sim-professional-lab.js` 1209; scene 168; renderer 220; behavior 220)
- Focus: final Phase 01 review, shared-lab side effects, spec compliance, semantic regressions
- Diff note: requested files are currently untracked/new relative to git, so `git diff HEAD~1 -- <files>` is empty. Review used current file contents plus dependent runtime paths.

### Scout Findings
- Dependents checked: `index.html` script order, `js/sim-statics.js`, `js/sims/ch1/statics-routes.js`, `js/simulations.js`, `js/sim-interactions.js`, `js/sim-route-renderer-primitives.js`, browser/unit QA reports.
- Main data path: route id -> `SimStatics` -> `SimProfessionalLab.mount()` -> scene/renderer/behavior registries -> controls/handles -> readout cards/overlay.
- Edge risks found: formula/readout semantic gaps not covered by current smoke/visual tests; bidirectional control sync gap after direct drag; `ch1-1-5` spec says multiple-vector drag but implementation exposes one resultant handle.

### Verification Run
- PASS `node --check` on all 4 scoped files.
- PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\audit_simulation_quality.py --all --max-js-lines 220`
- PASS `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup`
- Manual browser probe confirmed: `ch1-1-4` shows `F=110N`, `d=3m`, `M_O=198N.m`; `ch1-1-6` shows `F=90N`, `d=3m`, `M=162N.m`; `ch1-1-5` slider `|R|=125` but readout `|R|=237.2N`.

### Overall Assessment
Runtime wiring is stable and current QA gates pass. No security/auth/data leak issue in this static local simulation surface. Main risk is educational correctness: several readouts and controls look polished but do not represent the same physical quantity, so CI can pass while users see wrong mechanics.

### Critical Issues
- None.

### High Priority

1. `[js/sims/ch1/ch1-force-law-behaviors.js:113]` / `[js/sims/ch1/ch1-force-law-scenes.js:55]` / `[js/sims/ch1/ch1-force-law-scenes.js:89]` Moment routes mix `d` meters with moment scaled from pixels.
   - Impact: `ch1-1-4` displays `F=110N`, `d=3m`, but `M_O=198N.m`; expected formula display says `M=F*d`, which would be `330N.m` if `d=3m`. `ch1-1-6` has same class: `F=90N`, `d=3m`, `M=162N.m` instead of `270N.m`.
   - Fix: define one `PX_PER_M` constant, compute `distanceMeters = px / PX_PER_M`, compute `moment = F * distanceMeters`, and remove the readout/render `scale: 0.01` workaround. Add a semantic test asserting displayed `M` equals displayed `F*d`.

2. `[js/sims/ch1/ch1-force-law-renderers.js:101]` / `[js/sims/ch1/ch1-force-law-behaviors.js:121]` / `[js/sims/ch1/ch1-force-law-behaviors.js:174]` `ch1-1-5` resultant model is internally inconsistent and misses plan intent.
   - Impact: renderer labels the draggable vector as `R`, scene labels slider as `|R|`, but behavior computes readout by adding extra hardcoded `f2/f3` vectors to that same `R`. Initial UI: slider `125`, readout `237.2N`. Plan also asks "Drag nhiều véc tơ"; implementation exposes only one `reducer-resultant-r` handle.
   - Fix: choose one model. Either drag individual forces and derive/draw `R`, or make draggable vector the true `R` and stop adding hidden vectors to its readout. Add a focused test comparing `R` readout to overlay/handle geometry and handle-count/spec for this route.

### Medium Priority

1. `[js/sim-professional-lab.js:969]` / `[js/sim-professional-lab.js:1104]` Slider controls do not sync after route-owned handle drag.
   - Impact: after dragging `ch1-1-3` force tip, readout changes from `|F|:260N` to `171.2N`, but sliders remain `force=260`, `angle=32`. Next slider touch jumps from stale control state. This is shared-lab behavior, likely affects any route where handles mutate slider-backed state.
   - Fix: call `syncControlDisplays(lab, scene, state)` after direct handle `set()` or inside `draw()` when `lab.forceReadoutSync` is set. Clamp display value to control min/max to avoid invalid HTML range values.

2. `[js/sim-professional-lab.js:762]` Shared engine still contains route-specific CH1/CH2/CH3 handle logic.
   - Impact: Phase 01 behavior-owned handles work, but shared engine remains high-blast-radius; future route edits can regress unrelated chapters. Current file is 1209 lines, while route files are compressed to exactly 220-line gate.
   - Fix: after Phase 01 fixes, move remaining fallback route handle blocks into chapter behavior modules. Do not expand the 220-line files further; split before adding semantic fixes.

### Low Priority
- `[js/sims/ch1/ch1-force-law-scenes.js:18]` `routeSceneTokens` is unused. Harmless, but it is line-count noise in a file already under pressure.

### Checklist Review
- Concurrency: no async race found in scoped route code; RAF/listener cleanup smoke passed.
- Error boundaries: mount rollback path passed; renderer draw errors during later interaction still propagate to browser console, existing pattern.
- API contracts: issue found in control/readout contract after drag.
- Backwards compatibility: no route-id break found for the 6 Phase 01 routes.
- Input validation: all interaction points clamped; no external user input boundary in scope.
- Auth/authz, N+1, PII: not applicable to static local simulation.
- Data leaks/XSS: no user-controlled `innerHTML`; readouts/panels use `textContent`, KaTeX formulas are static scene strings.

### Plan Follow-up
- Appears complete: 6 route registrations, DeCuong grid/handles/readouts, KaTeX overlays, trails, instant reset, 760x440 scene coordinates.
- Needs correction before marking Phase 01 done: `ch1-1-4`/`ch1-1-6` `F*d` semantics, `ch1-1-5` multi-vector/resultant semantics, shared slider sync after direct drag.
- Plan metadata stale: phase file status/TODOs remain pending/unchecked. Not edited per instruction.

### Metrics
- Type Coverage: N/A (plain JS)
- Test Coverage: not collected
- Linting Issues: 0 syntax issues on scoped files

### Unresolved Questions
- Should `d` be displayed in meters or pixels for Phase 01? Current UI mixes both; pick one canonical unit before fixing tests.
