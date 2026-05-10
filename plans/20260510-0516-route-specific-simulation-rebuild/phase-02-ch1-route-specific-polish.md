# Phase 02: Ch1 Route-Specific Polish

## Context Links

- Overview: [plan.md](./plan.md)
- Route registry: `js/sims/ch1/statics-routes.js:15`
- Scene/control/readout sources: `js/sims/ch1/ch1-force-law-scenes.js:43`, `js/sims/ch1/ch1-support-spatial-scenes.js:40`, `js/sims/ch1/ch1-friction-centroid-solver-scenes.js:35`, `js/sims/ch1/ch1-centroid-solver-scenes.js:33`, `js/sims/ch1/ch1-solver-exercises-scenes.js:32`
- Behavior sources: `js/sims/ch1/ch1-force-law-behaviors.js:13`, `js/sims/ch1/ch1-support-spatial-behaviors.js:10`, `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js:10`, `js/sims/ch1/ch1-solver-exercises-behaviors.js:10`

## Overview

- Priority: P1
- Status: pending
- Brief description: polish all 25 Ch1 statics routes so each one feels like a direct teaching instrument, not a reused family sketch.

## Key Insights

- Ch1 already splits renderers by concept group, which keeps file ownership clean: `ch1-force-law-renderers.js`, `ch1-support-renderers.js`, `ch1-spatial-renderers.js`, `ch1-friction-renderers.js`, `ch1-centroid-solver-renderers.js`, `ch1-solver-exercises-renderers.js`.
- Most Ch1 routes are static by nature, so polish should focus on better anchors, guides, decomposition overlays, and live readouts, not perpetual animation.
- DeCuong reference shows the right interaction weight: visible canvas target, obvious reset button, and tiny supporting controls around the scene rather than around the shell (`DeCuong_CoHocLyThuyet.html:2479`, `DeCuong_CoHocLyThuyet.html:2526`, `DeCuong_CoHocLyThuyet.html:3321`).

## Requirements

- Keep all 25 canonical Ch1 route ids and dedicated renderer/behavior identity unchanged.
- Replace generic-looking drag affordances with route-owned handles and geometry-specific guides wherever feasible.
- Keep static routes stable when idle; readouts may update on drag but must not drift afterward (`tests/simulation-interaction-engine.spec.js:94`, `tests/simulation-interaction-engine.spec.js:97`).

## Architecture

- Data in: drag or button/slider input updates route state through behavior or scene control metadata.
- Transform: Ch1 scenes continue to own control/readout definitions; behavior files own semantic derivation; renderers own the scene-specific drawing language.
- Data out: readout cards must surface actual statics quantities such as resultant, reaction, moment arm, centroid, or solver step, not generic coordinates.

## Related Code Files

- Modify: `js/sims/ch1/ch1-force-law-renderers.js`, `js/sims/ch1/ch1-support-renderers.js`, `js/sims/ch1/ch1-spatial-renderers.js`, `js/sims/ch1/ch1-friction-renderers.js`, `js/sims/ch1/ch1-centroid-solver-renderers.js`, `js/sims/ch1/ch1-solver-exercises-renderers.js`, `js/sims/ch1/ch1-force-law-behaviors.js`, `js/sims/ch1/ch1-support-spatial-behaviors.js`, `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js`, `js/sims/ch1/ch1-solver-exercises-behaviors.js`, and scene files only where labels/readouts/controls need correction.
- Do not modify: `js/sims/ch1/statics-routes.js`

## Implementation Steps

1. Force-law/support/spatial routes: add clearer line-of-action guides, decomposition ghosts, reaction anchors, and bounded handle placement.
2. Friction routes: make cone, wedge, and contact-state visuals explicit; animate only state emphasis, not the whole scene.
3. Centroid/solver routes: show center markers, balance references, and step cues directly on canvas with matching readout labels.
4. Adjust scene readouts and hints only when current labels do not match the polished interaction.

## Todo List

- [ ] Polish force-law renderer group
- [ ] Polish support/spatial renderer group
- [ ] Polish friction renderer group
- [ ] Polish centroid/solver renderer group
- [ ] Align Ch1 behavior-derived readouts and hint text

## Success Criteria

- All 25 Ch1 routes still mount through the canonical registry and keep unique renderer/behavior ids.
- Representative semantic cards such as `|R|` and `N` still change on drag (`tests/simulation-interaction-engine.spec.js:12`, `tests/simulation-interaction-engine.spec.js:15`, `tests/simulation-interaction-engine.spec.js:103`).
- No Ch1 route falls back to legacy handle ids or common structural marks (`tests/simulation-visual-quality.spec.js:58`, `tests/simulation-visual-quality.spec.js:84`).

## Risk Assessment

- High: over-animating statics routes makes them less legible. Mitigation: prefer highlight, pulse, and ghost overlays over continuous motion.
- Medium: scene/readout labels drift from renderer meaning. Mitigation: update scene readout definitions in the same route group pass.
- Medium: copy/paste between similar statics routes risks duplicate structure. Mitigation: keep each renderer visually distinct and re-run identity checks before moving on.

## Security Considerations

- No external media or dynamic HTML.
- Keep all user-visible state derived from local route state only.

## Test Matrix

- Unit: `npm run test:sim:unit`
- Quality: `npm run test:sim:quality`
- Browser: `npm run test:sim:visual-quality`, `npm run test:sim:browser -- --grep @direct-drag`

## Rollback Plan

- Restore only the Ch1 snapshots plus any shared-file snapshot if a shared hook had to be amended during the chapter pass.

## Next Steps

- After Ch1 is green, move to Ch2 motion-heavy routes without reopening Ch1 files unless a shared regression forces it.
