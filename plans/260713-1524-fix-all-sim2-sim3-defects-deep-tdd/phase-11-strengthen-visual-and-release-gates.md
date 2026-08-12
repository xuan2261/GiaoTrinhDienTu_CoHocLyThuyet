---
phase: 11
title: "Strengthen Visual and Release Gates"
status: pending
priority: P1
dependencies: [5, 8, 9, 10]
effort: "4-5 days"
---

# Phase 11: Strengthen Visual and Release Gates

## Overview

Eliminate QA false confidence. Exercise all 35 engine-route paths through production integration, verify actual RAF/GPU disposal, require complete responsive/fallback/capture/probe matrices, triage existing baseline failures, and compose deterministic plus full visual release gates.

## Requirements

- Production `index.html`/loader E2E for 25 Sim2 and 10 Sim3 routes.
- Strict lifecycle assertions observe callbacks/resources, not only DOM removal.
- Forced WebGL fallback for 10/10 routes and every shared failure reason.
- Capture/contact-sheet/probe tools fail on missing/dead/stale/error states.
- Existing 3/5 baseline failures are classified/fixed before any approved update.
- Release gate includes Sim3 and objective contracts; full gate includes visual artifacts.

## File Inventory

| Action | File | Purpose |
|---|---|---|
| Create | `tests/simulation-production-e2e.spec.js` | 25+10 production route matrix |
| Create | `tests/simulation-lifecycle.spec.js` | RAF/GPU/observer/resource disposal |
| Create | `tests/simulation-responsive.spec.js` | All-route mobile/DPR/resize matrix |
| Create | `tests/sim2-visual-capture-validation.test.js` | Exact capture manifest/files/shots |
| Create | `tests/sim-probe-validation.test.js` | Strict 35-record validation |
| Create | `tools/sim2-visual/validate-capture.js` | Run-specific strict validator |
| Create | `tools/sim-probe/probe-validation.js` | Error/control/sign/mount validation |
| Create | `playwright.production.config.cjs`, `playwright.responsive.config.cjs` | Deterministic configs |
| Modify | `package.json` | New scripts/release composition |
| Modify | `tests/sim2-route-coverage.test.js` | Consume executed contract results |
| Modify | `tests/sim3-pilot-fallback-dispose.spec.js` | 10/10 generated fallback matrix |
| Modify | Sim2/Sim3 visual capture/contact-sheet tools | Fatal warnings, exact sets, fresh outputs |
| Modify | probe runner/targets | Fatal dead controls/errors/sign mismatch |
| Review/update | five selective baseline PNGs | Only after human triage |

## Architecture

```text
Fast/objective release
 contracts + physics + route physics + mount + production + lifecycle
 + responsive + all fallback + app/content/quiz

Full shipping release
 fast release + strict probes + fresh Sim2/Sim3 captures
 + exact contact sheets + selective deterministic baselines
```

Artifact writers use one worker and a fresh run-specific output directory. Validators compare manifests to canonical route contracts and expected shot plans; stale files cannot satisfy coverage.

## Function and Interface Checklist

- [ ] Production tests use `index.html`, `loadPage`, real script order, and navigation.
- [ ] Every route mounts exactly once and disposes on navigation/back.
- [ ] RAF instrumentation proves zero owned pending callbacks/post-dispose ticks.
- [ ] GPU spies prove geometry/material/texture/renderer/render-list/context disposal.
- [ ] Fallback callback once, 2D remains interactive, status announced.
- [ ] Capture missing control/drag is fatal; no fallback-frame masquerading as far state.
- [ ] Contact-sheet rejects missing/extra/duplicate/unknown routes/shots/files.
- [ ] Probe rejects page/console errors, dead controls, missing sign delta, fallback-only Sim3.
- [ ] Snapshot update command remains explicit and outside release.

## Dependency Map

- Requires all implementation phases.
- Blocks documentation/final sign-off.
- Does not modify runtime unless RED production/lifecycle tests expose a remaining defect; such fixes return to owning phase tests first.

## Test Scenario Matrix

| Gate | Coverage |
|---|---|
| Production Sim2 | 25 routes, mount, one meaningful action, navigate away/back |
| Production Sim3 | 10 routes, default 2D, toggle 3D, action, navigate/dispose |
| Loader | bundled offline plus representative HTTP fetch fallback |
| Lifecycle | static/dynamic/paused/playing, dispose during callback, double dispose, repeated toggle |
| Responsive | all 25+10 at 360×800 DPR2; representative resize cycles |
| Fallback | 10 route WebGL failure + missing THREE/adapter + renderer/setup/update/render/resize failures |
| Captures | meaningful default/dynamic/far state for every engine-route |
| Baselines | current five desktop plus reviewed mobile DPR2 representatives |
| Soak | deterministic release three runs, retries disabled |

## Tests Before

1. Add RED proof that comment-only physics coverage no longer passes.
2. Add RED lifecycle spies showing DOM-only tests miss current loops/resources.
3. Make capture warning and incomplete contact sheet fail.
4. Add strict probe mutation tests.
5. Re-run baseline and preserve actual/expected/diff for three current failures.

## Refactor

1. Build production and lifecycle test utilities.
2. Generate route matrices from manifests/contracts.
3. Harden capture/contact/probe validation.
4. Add deterministic Playwright configs with retries off and pinned state.
5. Compose npm scripts without hiding failures in PowerShell pipelines.
6. Triage baseline differences, fix unexplained regressions, then update only approved snapshots.

## Tests After

- Unknown/duplicate/stale artifact mutations.
- Missing control and no-op control.
- Console warning/error/pageerror.
- Rapid navigation and 20 toggle cycles.
- Three-run flake soak.
- Fresh checkout/output-directory behavior.

## Implementation Steps

1. Add production 35-route RED suite.
2. Add objective lifecycle/resource suite.
3. Complete responsive and fallback matrices.
4. Harden capture/contact/probe tools.
5. Triage current baseline failures with actual/diff images.
6. Add release scripts and run retry-free soak.
7. Run full visual gate from fresh artifacts.

## Planned Commands

```powershell
npm run test:sim:contracts
npm run test:sim:route-physics
npm run test:sim:production
npm run test:sim:lifecycle
npm run test:sim:responsive
npm run test:sim3:pilot
npm run test:sim:probe:strict
npm run test:sim:visual:unit
npm run test:sim:visual:capture
npm run test:sim3:visual:capture
npm run test:sim:visual:baseline
npm run test:sim:release
npm run test:sim:release:full
```

Snapshot update remains manual:

```powershell
npm run test:sim:visual:baseline:update
npm run test:sim:visual:baseline
```

## Regression Gate

```powershell
1..3 | ForEach-Object {
  npm run test:sim:release
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
npm run test:sim:release:full
```

## Success Criteria

- [ ] 35/35 production engine-route paths pass.
- [ ] Objective lifecycle tests show zero CPU/GPU/listener/observer residue.
- [ ] 10/10 route fallback and all shared failure branches pass.
- [ ] Strict captures/probes/contact sheets reject every tested incomplete/stale mutation.
- [ ] Baseline has 0 unexplained differences.
- [ ] Deterministic release passes three consecutive runs; full shipping gate passes fresh.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Full gate too slow for iteration | Keep scoped scripts; full gate only milestone/pre-release |
| GPU pixel baselines flaky | Semantic geometry tests for Sim3; pixel baselines only pinned deterministic surfaces |
| Stale files pass artifact gate | Fresh run directory + exact manifest/file set |
| Snapshot update hides defects | Human triage required; never increase thresholds as fix |

## Security and Reliability

Serve only repository root on loopback during tests. Use known route IDs, sanitize generated HTML text, avoid exposing local paths in learner-facing errors. Preserve exit codes before PowerShell formatting/pipelines.

## Next Steps

Phase 12 updates documentation from verified final behavior and performs the whole-project sign-off.
