---
phase: 5
title: "Visual QA Release Gates"
status: completed
priority: P1
effort: "4h"
dependencies: [4]
---

# Phase 05: Visual QA Release Gates

## Overview

Run focused and release validators, inspect blast radius, and capture any final visual evidence needed for acceptance.

## Requirements

- Functional: all Sim3 contract tests and Sim2 release gates pass.
- Non-functional: no regression to existing six Sim3 routes or 25 Sim2 routes.

## Architecture

Validation order favors fast focused checks first, then full release:

```powershell
npx playwright test tests/sim3-pilot-fallback-dispose.spec.js
npm run test:sim3:pilot
npm run test:sim3:visual:capture
npm run test:sim:release
```

Visual capture is mandatory after adding the four new routes; update output path to this plan directory if the capture spec is extended.

## Related Code Files

- Validate: `tests/sim3-pilot-fallback-dispose.spec.js`
- Validate: `tests/fixtures/*.html`
- Validate: `js/sim2/sims/**`
- Validate: `js/sim3/**`
- Optional modify: `tools/sim3-visual/pilot-capture.spec.js`

## Implementation Steps

1. Run focused Sim3 suite and fix failures.
2. Run visual capture for 10 total Sim3 routes or documented selected coverage; store output under this plan.
3. Run existing Sim2 physics/mount/release gates and fix regressions.
4. Check `git diff` for unintended public contract or dependency changes.
5. Spawn code review focused on acceptance criteria and side effects.
6. Produce concise closeout report.

## Success Criteria

- [x] `npm run test:sim3:pilot` passes.
- [x] `npm run test:sim3:visual:capture` passes for existing and new Sim3 coverage.
- [x] `npm run test:sim:release` passes.
- [x] No new dependency or CDN introduced.
- [x] Existing six Sim3 routes keep prior regression coverage.
- [x] Code review finds no high-confidence regression.
- [x] User sees 4 optional 3D routes and unchanged 2D defaults.

## Risk Assessment

Risk: full release gate slow or flaky in browser. Mitigation: isolate focused Sim3 failures first, then rerun full gate only after deterministic pass.
