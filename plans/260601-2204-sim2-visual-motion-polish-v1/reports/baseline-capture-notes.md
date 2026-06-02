# Baseline Capture Notes

Date: 2026-06-01

## Baseline Before Polish

- `npm run test:sim:physics`: PASS.
- `npm run test:sim:mount`: PASS, 89 tests before adding polish spec.
- `npm run test:sim:visual:capture`: PASS, 25/25 routes.

## TDD Red Evidence

- Added `tests/sim2-visual-motion-polish.spec.js`.
- Initial run failed as expected for missing output/readout flash, handle pulse/active state, fade trail, and pilot route hooks/cues.
- Reduced-motion opt-out test passed before implementation because no transient classes existed yet; it became a regression guard after implementation.
- Post-review tests now also lock formula highlight hooks and timer replacement for rapid readout updates.

## Artifact Paths

- Capture directory: `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/`.
- Contact sheet: `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet.html`.

## Unresolved Questions

- None.
