# Tester Report - 2026-06-02

Scope:
- `tests/sim2-visual-motion-polish.spec.js`
- `tools/sim2-visual/selective-baseline.spec.js`
- `tools/sim2-visual/playwright.baseline.config.cjs`
- `package.json`
- `js/sim2/sims/ch1/ch1-6-3.js`
- `js/sim2/sims/ch2/ch2-4-4.js`
- `js/sim2/sims/ch3/ch3-6-2.js`

Validation:
- `npm run test:sim:visual:baseline` PASS
- `npm run test:sim:mount` PASS
- `npm run test:sim:release` PASS
- `npm run test:sim:visual:capture` PASS

Acceptance check:
- Focused pedagogy tests for `ch2-4-4`, `ch3-6-2`, `ch1-6-3` pass
- `test:sim:visual:baseline` is dev-only and not included in `test:sim:release`
- No `js/sim2/physics/*` files touched in diff

Notes:
- Baseline config points only to `tools/sim2-visual/selective-baseline.spec.js`
- `package.json` release gate remains `test:sim:physics && test:sim:mount && test:content && test:quiz`
- No failing tests observed
