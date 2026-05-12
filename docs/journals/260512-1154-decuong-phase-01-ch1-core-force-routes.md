# DeCuong Phase 01 CH1 Core Force Routes

## Summary

Completed Phase 01 of `plans/260512-0845-decuong-simulation-full-rebuild`: rebuilt 6 CH1 core force routes to the DeCuong visual/interaction baseline.

## Changed

- Rebuilt `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, and `ch1-2-1` scene/renderer/behavior definitions.
- Kept canonical canvas coordinates at 760×440, with route-owned handles, trails, theme grid, DeCuong arrows, and KaTeX/DOM overlays.
- Hardened `SimProfessionalLab` readout/control sync: valid zero angles stay valid, route readout item `kind` is honored, generic readout append can be disabled, and slider displays sync from finite clamped values.
- Added regression coverage for `ch1-1-3` tail drag at canvas boundaries so `|F|`, `α`, sliders, and inline displays stay synchronized.

## Verification

- `npm run test:sim:unit` PASS.
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-1-3 tail drag keeps"` PASS.
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@control-audit"` PASS, 13 tests.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220` PASS.
- Strict 6-route scene catalog and renderer contract smokes PASS.
- `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"` PASS, 2 tests.
- Runtime smoke with mount/listener/RAF cleanup PASS.
- `python tools\audit.py` PASS.

## Next

- Continue CH1 Phase 02 for axioms/parallelogram routes, or start parallel CH2 Phase 06 / CH3 Phase 10 branch.
