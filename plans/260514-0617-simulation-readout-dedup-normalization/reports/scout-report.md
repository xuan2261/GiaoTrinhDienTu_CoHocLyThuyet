---
type: scout-report
created: 2026-05-14
---

# Readout Dedup Scout Report

## Summary

- Runtime check opened `58/58` routes with Playwright.
- Readout cards extracted from `.sim-readout-card` under `.sim-container.sim-lab`.
- Confirmed duplicate alias bugs and broad generic/control noise.
- No implementation done.

## Key Files

| File | Role |
|---|---|
| `js/sim-professional-lab.js` | Builds readout item list and appends generic/control/time cards |
| `js/sims/ch1/ch1-force-law-scenes.js` | `ch1-2-3` explicit readouts + control `|F1|` |
| `js/sims/ch1/ch1-support-spatial-scenes.js` | Ch1 support/spatial row factory causing duplicate aliases |
| `js/sims/ch2/ch2-kinematics-scenes.js` | Ch2 scene readouts, generic/control/time noise, `ch2-1-3` seed |
| `js/sims/ch3/ch3-dynamics-all-18-scenes.js` | Ch3 default control `F`, route readouts, conservation equalities |
| `tests/simulation-test-utils.js` | `labState()` already extracts readout cards |
| `tests/simulation-browser.spec.js` | Browser shell/readout/regression tests live here |

## Runtime Evidence

| Route | Problem | Evidence |
|---|---|---|
| `ch1-2-3` | Duplicate alias | `|F₁|=192.1N`, `|F1|=192.1N` |
| `ch1-3-1` | Duplicate alias | `N=76N`, `|N|=76N` |
| `ch1-3-2` | Duplicate alias | `Lực căng=81N`, `|T|=81N` |
| `ch1-3-7` | Duplicate alias | `N dọc trục=101N`, `|N| dọc trục=101N` |
| `ch1-4-4` | Duplicate alias | `ΣF=116N`, `|R| cân bằng=116N` |
| `ch2-1-3` | Misleading equality | `a_n=104`, `Bán kính cong=104` |
| `ch3-7-1` | Duplicate alias | `F=50N`, `Lực F=50N` |
| Ch2 all | Generic/control noise | `chế độ`, `α`, `omega`, route slider, `thời gian` frequently appended |
| Ch3 all | Generic/control noise | `chế độ`, `Lực F`, route sliders, `thời gian` frequently appended |

## Root Cause

- `formatReadoutItems()` in `js/sim-professional-lab.js` appends in this order:
  `scene.readouts` -> generic `mode/alpha` -> control readouts -> time readout.
- `hasReadout()` only exact-matches `key` or `label`; it does not know semantic aliases.
- Scene catalogs mix output readouts and control definitions without a route policy flag.

## Intentional Equalities To Allow

| Route | Equality | Reason |
|---|---|---|
| `ch1-3-4` | `R_A = R_B` | Symmetric load/default can be valid |
| `ch3-5-1` | `m1 = m2` | Equal default masses valid |
| `ch3-6-2` | `p trước = p sau` | Momentum conservation valid |
| `ch3-6-3` | `p trước = p sau` | Momentum conservation valid |

## Unresolved Questions

- None. User asked to plan from this report.
