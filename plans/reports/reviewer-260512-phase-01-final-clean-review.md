# Reviewer Report - 260512 Phase 01 Final Clean Re-review

## Code Review Summary

### Scope
- Files: `js/sim-professional-lab.js`, `js/sims/ch1/ch1-force-law-scenes.js`, `js/sims/ch1/ch1-force-law-renderers.js`, `js/sims/ch1/ch1-force-law-behaviors.js`
- LOC: 1821 scoped JS lines (`sim-professional-lab.js` 1215; scenes 168; renderers 220; behaviors 218)
- Focus: final re-review sau direct-drag/control boundary fix, Phase 01 CH1 force routes
- Scout findings: tip handles và `ch1-1-4` moment load fixed; còn edge case ở tail handle `force-tail-a` của `ch1-1-3`

### Overall Assessment
Các blocker trước với vector tip handles đã được xử lý cho `ch1-1-3`, `ch1-1-5`, `ch1-2-1`; `ch1-1-4` đã clamp `load` về domain slider; `syncControlDisplays()` không tạo key state vắng mặt, nên regression `ch2-4-3` không tái hiện trong probe.

Tuy nhiên còn một bug cùng lớp ở `ch1-1-3`: kéo điểm đặt `A` sát mép canvas làm endpoint bị bounding sau khi canonical `state.force/state.angle` đã sync, khiến readout geometry và controls lệch nhau.

### Critical Issues
- None.

### High Priority
1. `js/sims/ch1/ch1-force-law-behaviors.js:75` - `moveForceTail()` vẫn có thể tạo mismatch readout/control khi tail `A` bị kéo sát biên phải/trên/dưới.
   - Evidence: isolated Playwright probe, route `ch1-1-3`, drag `force-tail-a` từ `{x:170,y:290}` tới `{x:732,y:412}`: readout `|F|=133.1N|α=90°`, controls `force value=140 inline=137.8N`, `angle value=75 inline=75°`.
   - Evidence: drag `force-tail-a` tới `{x:732,y:28}`: readout `|F|=1N|α=11°`, controls `force value=40 inline=40N`, `angle value=11 inline=10.6°`.
   - Root cause: `moveForceTail()` moves `state.primary` independently, clips `state.vector`, then `setVectorFromPoint()` / `setForceByAngle()` can clip the endpoint again. Final geometry no longer matches canonical `state.force/state.angle`.
   - Impact: a student can create a visibly inconsistent vector lab by dragging the point of application to the canvas boundary. This is same class as previous direct-drag/control blocker, just through the tail handle instead of the tip handle.
   - Fix: constrain the tail candidate so the desired vector endpoint remains inside the drawable bounds, or recompute canonical force/angle from the final bounded geometry and keep those values inside slider domains. Add a regression test for dragging `force-tail-a` to canvas edges.

### Medium Priority
- None.

### Low Priority
- None.

### Edge Cases Found by Scout
- Checked data path: `handle.set()` -> `syncControlDisplays()` -> `draw()` -> `forceLawDerived()` -> readout cards.
- Verified fixed cases:
  - `ch1-1-3` tip edge: readout `|F|=260N|α=25°`, controls `260N / 25°`.
  - `ch1-1-5` tip edge: readout `|R|=180N`, control `180N`.
  - `ch1-2-1` tip edge: readout/control clamp to `170N / 30°`.
  - `ch1-1-4` left/right edge: `load` control clamps to `60px` / `220px`, readout `d=1m` / `3.7m`.
  - `ch2-4-3` direct drag leaves `phi` control at fallback `0°`; no absent state key creation observed.
- New edge case: `ch1-1-3` tail edge still desyncs geometry/readout/control.

### Positive Observations
- No auth/authz, database, PII, secret, or external input trust boundary in scoped static simulation code.
- DOM readouts use `textContent`; no user-controlled `innerHTML` found in scoped path.
- Runtime cleanup gates pass for listener/mount/RAF cleanup.

### Recommended Actions
1. Fix `moveForceTail()` boundary handling for `ch1-1-3`.
2. Add Playwright regression: drag `force-tail-a` to right/top/bottom canvas edges and assert readout force/angle, slider value, and inline slider label stay consistent.
3. Re-run the provided final validation suite after the tail fix.

### Validation
- PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `npm run test:sim:unit`
- PASS `python tools\audit_simulation_quality.py --all --max-js-lines 220`
- PASS `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct`
- PASS `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup`
- PASS `python tools\audit.py`
- FAIL targeted reviewer probe for `ch1-1-3` tail boundary consistency as described above.

### Metrics
- Type Coverage: N/A (plain JS)
- Test Coverage: not collected
- Linting Issues: 0 syntax issues from `npm run test:sim:unit`

### Plan Follow-up
- Appears complete: 6 Phase 01 route registrations, dedicated scene/renderer/behavior files, DeCuong visuals, KaTeX overlays, trails, reset path, 760x440 coordinates.
- Not complete for final clean status: `ch1-1-3` tail direct-drag boundary still breaks the readout/control contract.
- Plan file status/TODOs remain pending/unchecked. Not edited per instruction.

### Checklist Review
- Concurrency: checked; no async race found in scoped path.
- Error boundaries: runtime mount/listener/RAF cleanup smoke passes; renderer errors follow existing propagation.
- API contracts: issue found in handle geometry -> canonical state -> control/readout contract.
- Backwards compatibility: no route id or registry break found for Phase 01 routes.
- Input validation: tail direct-drag boundary validation incomplete.
- Auth/authz: not applicable.
- N+1/query efficiency: not applicable.
- Data leaks: none found.
- Fact-checked: file paths, symbol names, and behavior claims verified against current code/probes.

### Unresolved Questions
- Should `ch1-1-3` tail drag be constrained so the vector remains representable inside the slider angle/force domain, or should the endpoint be allowed to clip and the controls expand to represent that clipped geometry?

**Status:** DONE_WITH_CONCERNS
**Summary:** Tip-handle/control fixes are real, and validation gates pass, but final clean review found one remaining boundary desync through `ch1-1-3` tail handle.
**Concerns/Blockers:** Fix `moveForceTail()` boundary handling before marking Phase 01 final-clean.
