# Simulation browser audit - 2026-05-08

## Scope

- App: `http://127.0.0.1:8765/index.html`
- Tooling: `ck:agent-browser` (`npx -y agent-browser` fallback), Playwright runtime sweep.
- Routes checked: 58/58 simulation routes.
- Evidence folder: `plans/reports/260508-0846-simulation-browser-audit/`

## Commands run

- `npm run test:sim:quality:baseline` -> PASS
- `npm run test:sim:browser:baseline` -> 12 passed
- `npm run test:sim:browser` -> 268 passed, 1 skipped
- `npm run test:sim:renderer-contract` -> PASS
- Runtime sweep output:
  - `all-route-runtime-metrics.json`
  - `all-route-runtime-summary.json`

## Summary

The automated gates pass, but they do not measure the visual quality users are complaining about. Current simulations are structurally mounted and route-unique, but interaction and visual contracts are weak. Main failure: global generic handles are drawn for all route families, not the actual simulated objects.

## Findings

### 1. Critical - Drag handles are generic and detached from route visuals

Evidence:
- `js/sim-professional-lab.js:358` draws `state.primary` as `kéo` for every route.
- `js/sim-professional-lab.js:360` draws `state.vector` as `v/F` for every route.
- `js/sim-professional-lab.js:261` binds default hit handlers to the same generic state.
- 33 routes report unchanged default `điểm kéo=(190; 255)` in runtime readout: all Ch2 + all Ch3.
- Screenshot: `screenshots/ch2-1-1-sim.png`

Impact:
- Ch2/Ch3 animated objects move, but the visible orange/red drag handles often stay unrelated.
- Existing tests pass because they assert `sim-info` changes, not actual visual object movement.

### 2. High - Duplicate scene/renderer registration causes overwrite warnings

Evidence:
- Browser console: 93 warnings, including `Simulation scene overwritten` and `Route renderer overwritten`.
- `index.html:354` loads `ch2-particle-rotation-transmission-scenes.js`
- `index.html:360` loads `ch2-kinematics-scenes.js`
- `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js:51` registers scenes.
- `js/sims/ch2/ch2-kinematics-scenes.js:141` registers overlapping scenes.
- `js/sims/ch2/ch2-particle-renderers.js:91` and `js/sims/ch2/ch2-trajectory-graph-renderers.js:215` both register `ch2-1-1`.

Impact:
- Runtime result depends on script load order.
- QA contract still passes because final registry is unique after overwrite.

### 3. High - Canvas drawings are clipped or touch canvas edges

High edge-ink routes:
- `ch1-2-3`: bottom edge ink 81, screenshot `screenshots/ch1-2-3-sim.png`
- `ch1-2-6`: bottom edge ink 107, screenshot `screenshots/ch1-2-6-sim.png`
- `ch2-1-1`: left edge ink 43, screenshot `screenshots/ch2-1-1-sim.png`
- `ch3-5-3`: left/top/bottom edge ink high, screenshot `screenshots/ch3-5-3-sim.png`
- `ch3-6-2`: right edge ink 64, screenshot `screenshots/ch3-6-2-sim.png`

Likely sources:
- `js/sims/ch3/ch3-theorems-renderers.js:93` scales `mv` by `* 10`, making vector leave canvas.
- `js/sims/ch3/ch3-collision-exercises-renderers.js:36` and `:37` draw velocity arrows without viewport clamp.

Impact:
- Visual looks broken/cropped.
- Users see objects and vectors cut by frame.

### 4. Medium - Animation coverage exists but is not experience-complete

Runtime sweep:
- 33/58 routes changed canvas over time.
- 25/58 routes did not change over time; mostly Ch1 static routes.
- Existing browser test checks animation hash on only `ch2-1-1`.

Impact:
- Gates do not detect routes that feel like static diagrams.
- Ch2/Ch3 animation can run while handles/readouts remain generic.

### 5. Medium - Controls and copy are still generic/uneven

Evidence:
- `ch3-7-2`: only 1 slider, 0 preset buttons.
- 6 dynamics routes share the same controls: `Lực F`, `m`.
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js:69` uses `verify theorems`.
- `js/sims/ch2/ch2-kinematics-behaviors-a.js:64` checks `state.mode === 'Thang'`, while UI button is `Thẳng`.
- Screenshot: `screenshots/ch3-7-2-sim.png`, `screenshots/ch2-1-4-sim.png`

Impact:
- Some simulations feel like placeholder panels, not route-specific lab tools.
- Localization is not fully clean.

## Recommended Fix Order

1. Replace global default handles with route-owned handle descriptors.
2. Make route behavior declare `handles: [{ id, get, set, hitTest, draw }]`; render handles from the same state used by the renderer.
3. Fail duplicate scene/renderer registration in QA instead of warning silently.
4. Add edge-ink/canvas-bounds visual gate for all 58 routes.
5. Expand animation QA by family: Ch2/Ch3 must have meaningful visual delta; Ch1 must show construction/interaction delta if no passive animation.
6. Clean Ch2 duplicated renderer/scene modules; keep one canonical registration per route.
7. Localize formulas/readouts and remove placeholder copy.

## Unresolved Questions

- Should Ch1 static routes auto-animate construction, or stay static but improve drag/feedback only?
- Should all 58 routes be upgraded now, or prioritize route families with user-facing issues first: Ch2 trajectory, Ch3 collision, Ch3 theorem visualizations?
