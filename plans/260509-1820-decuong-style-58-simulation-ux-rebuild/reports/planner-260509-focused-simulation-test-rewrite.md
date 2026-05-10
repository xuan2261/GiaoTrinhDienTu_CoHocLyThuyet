# Focused Simulation Test Rewrite Plan

## Scope

Rewrite simulation `unit/e2e/interaction` tests to match the active DeCuong-style 58-route rebuild plan without touching production runtime code. Keep offline `file://`, static HTML/JS, no bundler, no fake route data.

## Verified Current State

- Route source of truth is already the manifest, not ad-hoc file scans: `tests/simulation-test-utils.js:20`, `js/sim-route-manifest.js:10`.
- Browser helpers already enforce real `file://` mount, block external HTTP, and read live lab DOM/canvas state: `tests/simulation-test-utils.js:51`, `tests/simulation-test-utils.js:112`, `tests/simulation-test-utils.js:130`, `tests/simulation-test-utils.js:148`.
- Active browser shell coverage already exists for 58 mount, DeCuong shell slots, representative responsive checks, localization, and static-server smoke: `tests/simulation-browser.spec.js:17`, `tests/simulation-browser.spec.js:47`, `tests/simulation-browser.spec.js:61`, `tests/simulation-browser.spec.js:92`, `tests/simulation-browser.spec.js:101`, `tests/simulation-browser.spec.js:113`.
- Active interaction coverage already exists for handle metadata, all-route first-handle drag audit, keyboard, touch, and paused-animation behavior: `tests/simulation-interaction-engine.spec.js:40`, `tests/simulation-interaction-engine.spec.js:58`, `tests/simulation-interaction-engine.spec.js:86`, `tests/simulation-interaction-engine.spec.js:95`, `tests/simulation-interaction-engine.spec.js:109`.
- Active visual/contract coverage already exists for all-route canvas bounds, route-owned handles, renderer/behavior/scene identity, and dark/light readability: `tests/simulation-visual-quality.spec.js:48`, `tests/simulation-visual-quality.spec.js:71`, `tests/simulation-visual-quality.spec.js:96`.
- Current `browser` package suite is broad and redundant: 80 Playwright tests across 3 files; current `visual-quality` suite is 10 tests across 5 files. Verified with `npx playwright test ... --list`.
- Python smoke already locks static contracts, so browser rewrite should not duplicate parser-level checks:
  - `smoke_simulation_manifest.py` PASS: 58 routes/objectives/direct interactions.
  - `smoke_simulation_routes.py --require-p1` PASS: 58/58 P1 coverage.
  - `smoke_simulation_scene_catalog.py --strict --require-routes 58` PASS.
  - `smoke_simulation_renderer_contract.py --strict --require-routes 58` PASS.

## Legacy / Misaligned / Redundant Tests

### Keep

- `tests/simulation-physics.test.js:26`
- `tests/simulation-runtime-regressions.test.js:24`
- `tests/simulation-browser.spec.js:17`
- `tests/simulation-interaction-engine.spec.js:40`
- `tests/simulation-visual-quality.spec.js:48`
- `tests/simulation-test-utils.js:20`

Reason: these files already exercise real current runtime contracts or shared helper physics/runtime behavior.

### Absorb Then Delete

- `tests/simulation-infrastructure-polish.spec.js:12`
  - Overlaps browser baseline + Python runtime smoke on script order, registry coverage, helper capability checks, and mobile affordances.
- `tests/simulation-visual-v2-infra.spec.js:6`
  - Overlaps browser/visual checks on structural marks, formula/hint text, and responsive resize.
- `tests/simulation-ch1-visual-upgrade.spec.js:5`
- `tests/simulation-ch2-visual-upgrade.spec.js:5`
- `tests/simulation-ch3-visual-upgrade.spec.js:5`
  - These three duplicate all-route assertions already covered by `simulation-browser.spec.js:47` and `simulation-visual-quality.spec.js:48`/`71`.

Reason: phase-by-phase visual-upgrade files were useful during rollout, but they now re-check route-specific renderer/behavior/formula/handle conditions already enforced globally.

## Target Compact Suite

### 1. Unit / Runtime

- Keep `tests/simulation-physics.test.js`.
- Keep `tests/simulation-runtime-regressions.test.js`.
- Do not add new mock-heavy unit files unless a browser regression cannot be isolated in real route tests.

Data flow:
- JS source files -> Node/VM harness -> exported helpers / mount lifecycle / paused animation contract -> assert numeric/runtime invariants.

### 2. Browser Shell / Mount

- Keep `tests/simulation-browser.spec.js` as the only shell/mount/offline/localization suite.
- Keep all 58 `@route-mount` cases.
- Keep representative static-server smoke.
- Absorb from old files:
  - one load-order sanity assertion from `simulation-infrastructure-polish.spec.js:12` if still needed after smoke coverage review;
  - one "controlled text only, no legacy HTML fragments" assertion from `simulation-visual-v2-infra.spec.js:14`.

Data flow:
- `ALL_ROUTES` from manifest -> `openRoute()` -> `.sim-lab` DOM -> `labState()` -> route/title/renderer/behavior/formula/hint/readout assertions.

### 3. Interaction / Semantics

- Keep `tests/simulation-interaction-engine.spec.js` as the only interaction suite.
- Keep current generic all-route audit `@direct-drag-audit`.
- Add route-semantic assertions from phase 03 instead of helper-existence/speculative interaction tests:
  - `ch1-2-3`: resultant/readout changes.
  - `ch1-3-1`: reaction/support value changes.
  - `ch2-1-1`: velocity/trajectory readout changes.
  - `ch2-5-2`: IC position or velocity-distribution changes.
  - `ch3-3-1`: spring displacement/energy/ODE state changes.
  - `ch3-6-2`: collision velocity/momentum changes.
  Evidence target: `phase-03-interaction-grammar-and-control-model.md:122`.
- Add at least one reset contract test on an animated route and one non-animated route.

Data flow:
- representative route -> first handle / named handle -> pointer/touch/keyboard input -> live readout snapshot -> paused/reset/play state assertions.

### 4. Visual / Theme / Identity

- Keep `tests/simulation-visual-quality.spec.js` as the only visual/identity suite.
- Keep:
  - all-route nonblank/bounded/route-owned canvas check,
  - renderer/behavior/scene identity uniqueness,
  - all-route dark/light readability + no overflow.
- Absorb from `simulation-visual-v2-infra.spec.js:6` only if current structural-mark assertions are weaker than needed.
- Delete chapter-split visual files after this suite proves equivalent coverage.

Data flow:
- representative or all routes -> canvas pixels + lab metadata -> ink/edge/contrast/identity assertions.

## Package Script Plan

Keep command names for backward compatibility. Change file membership only.

- `package.json:11`
  - Target: `tests/simulation-browser.spec.js tests/simulation-interaction-engine.spec.js`
  - Drop `tests/simulation-infrastructure-polish.spec.js`.
- `package.json:12`
  - Target: `tests/simulation-visual-quality.spec.js`
  - Drop `tests/simulation-ch1-visual-upgrade.spec.js`, `tests/simulation-ch2-visual-upgrade.spec.js`, `tests/simulation-ch3-visual-upgrade.spec.js`, `tests/simulation-visual-v2-infra.spec.js`.
- `package.json:14`
  - Keep `@baseline`, but source it only from the retained browser spec.
- `package.json:15`
  - Keep as-is; current 58 `@route-mount` coverage is already in `tests/simulation-browser.spec.js:47`.
- `package.json:16`
  - Keep as-is if `tests/simulation-visual-quality.spec.js:71` keeps `@scene-identity`.
- `package.json:17`
  - Keep as-is if `tests/simulation-visual-quality.spec.js:71` keeps `@renderer-contract`.
- `package.json:19`
  - Release gate stays unchanged in name/order; it just consumes the focused suites above.

Backward compatibility:
- Do not rename npm commands.
- Do not change route ids.
- Do not move away from `file://` + local static-server dual smoke.

## Dependency Graph

1. Consolidate retained assertions into `simulation-browser.spec.js`, `simulation-interaction-engine.spec.js`, `simulation-visual-quality.spec.js`, `simulation-test-utils.js`.
   Blockers: none.
2. Re-run `playwright --list` for each npm script target.
   Blocked by: step 1.
3. Remove absorbed redundant spec files from package scripts, then delete files.
   Blocked by: step 2.
4. Update README QA text and counts.
   Blocked by: step 3.

No parallel phase should touch `package.json`, `README.md`, or `tests/simulation-test-utils.js`.

## Test Matrix

| Layer | Keep/Add | Real Route Data | Purpose |
|---|---|---|---|
| Node unit | Keep | Yes | Physics helpers, paused animation runtime regression |
| Python smoke | Keep | Yes | 58-route manifest/scene/renderer/runtime contracts |
| Browser mount | Keep | Yes | `file://` mount, shell/readout/formula/hint, localization |
| Browser interaction | Extend | Yes | direct manipulation, touch, keyboard, paused animation, reset |
| Browser visual | Keep | Yes | nonblank bounded canvas, identity uniqueness, dark/light readability |
| Release gate | Keep | Yes | integrates unit + smoke + browser + visual without legacy file drift |

## Risks

- High: removing old spec files before absorbing unique assertions can silently drop coverage.
  - Mitigation: delete only after `playwright --list` and retained suites prove equivalent checks.
- High: direct-manipulation tests can flake on animated routes.
  - Mitigation: prefer paused-open routes, use `expect.poll`, and keep all-route generic drag audit plus 6 route-semantic checks.
- Medium: README/test script drift.
  - Mitigation: update `README.md:57` after final suite counts are known.
- Medium: over-testing same 58 routes in multiple files slows release.
  - Mitigation: one all-route mount suite, one all-route visual suite, one all-route generic drag audit; route-semantic tests stay representative only.

## Rollback Plan

- If semantic interaction rewrite flakes, revert only `tests/simulation-interaction-engine.spec.js` and keep current generic `@direct-drag-audit`.
- If visual consolidation loses coverage, restore deleted chapter/v2 spec files from git and keep `package.json:12` old membership temporarily.
- If baseline npm scripts break, restore previous `package.json` test file lists first; do not revert production runtime files.

## Success Criteria

- `package.json` browser suite references only focused retained spec files.
- No package script references chapter `*-visual-upgrade` or `*-v2-infra` specs.
- `npm run test:sim:browser:route-mount` still enumerates and runs 58 file-route mount cases.
- `npm run test:sim:renderer-contract`, `npm run test:sim:semantic`, and `npm run test:sim:release` all resolve to existing active tags/files.
- Interaction suite contains the 6 representative semantic route checks from phase 03 and at least 1 reset assertion.
- README QA section no longer claims the old "24 pass / 150 skip" state.

## Implementation TODOs

- [ ] Inventory each assertion in `simulation-infrastructure-polish.spec.js` and `simulation-visual-v2-infra.spec.js`; mark keep/drop/absorb.
- [ ] Extend `simulation-interaction-engine.spec.js` with 6 representative semantic route checks from phase 03.
- [ ] Add reset semantics coverage to `simulation-interaction-engine.spec.js`.
- [ ] Absorb any surviving controlled-text / resize assertions into retained suites.
- [ ] Trim `package.json` browser and visual-quality file lists.
- [ ] Delete absorbed redundant spec files.
- [ ] Run `npx playwright test ... --list` for `browser`, `visual-quality`, `browser:baseline`, `browser:route-mount`, `renderer-contract`, `scene-identity`.
- [ ] Update `README.md` QA section after final counts are stable.

## Unresolved Questions

Không có.
