---
title: "Validation Report - Canvas Overlay Cleanup"
type: report
created: 2026-05-14
status: done
---

# Validation Report - Canvas Overlay Cleanup

## Locked Decisions

| Decision | Value |
|---|---|
| Canvas policy | No learner-facing formula/value overlay in `.sim-lab-overlay` |
| Formula target | `.sim-formula-panel` in right inspector |
| Dynamic value target | `.sim-readout-card` |
| Allowed scene text | Short labels only, no equation/value panels |
| Scope | 58 canonical P1 simulation routes |
| Runtime constraints | Static HTML/CSS/JS, `file://`, no bundler |

## Acceptance Criteria

- All 58 routes mount successfully.
- `document.querySelectorAll('.sim-lab-overlay .sim-overlay-formula').length === 0` after route settle.
- `.sim-lab-overlay` panels/labels do not contain formula/value patterns.
- Dynamic values previously rendered in canvas exist in explicit readout cards where pedagogically needed.
- Route formula/hint remains accessible through right inspector and `aria-describedby`.
- Existing release gates pass.

## Required Tests By Phase

| Phase | Required Tests |
|---|---|
| 01 | Inventory script/probe outputs 58-route matrix; no code change |
| 02 | New overlay contract test fails before implementation |
| 03 | Overlay contract test passes for `.sim-overlay-formula` count |
| 04 | Formula panel route tests pass for declared formulas |
| 05 | Readout parity tests pass for dynamic values |
| 06 | Equation-like overlay text test passes |
| 07 | Full simulation browser/visual/semantic/release gates pass |
| 08 | Docs links/dates/changelog checked |

## Verification Commands

```powershell
node --check js\sim-route-renderer-primitives.js
npm run test:sim:unit
npx playwright test tests\simulation-browser.spec.js --grep "overlay contract"
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:semantic
npm run test:sim:release
```

## Unresolved Questions

- None.
