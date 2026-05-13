---
type: scout
date: 2026-05-13
topic: simulation-right-inspector-panel
status: complete
---

# Codebase Scout Report

## Summary

Repo is static textbook app. Simulation UI is centralized enough for one shared layout change. Best target is CSS shell layout, with JS DOM wrapper only if CSS grid direct-child placement becomes brittle.

## Project Type

| Area | Finding |
|---|---|
| Runtime | Static `HTML/CSS/JS`, `file://` safe |
| QA | Node syntax/unit, Python smoke, Playwright browser/visual |
| Framework | None at runtime |
| Simulation count | 58 canonical active routes |

## Relevant Files

| File | Role |
|---|---|
| `css/style.css` | Simulation width, `.sim-lab` layout, readout/control styles |
| `js/sim-lab-ui.js` | Creates `.sim-lab`, scene, toolbar, readout, formula, hint DOM |
| `js/sim-professional-lab.js` | Builds controls, readout cards, reset/play, route draw lifecycle |
| `tests/simulation-browser.spec.js` | Browser mount, shell visibility, responsive checks |
| `tests/simulation-visual-quality.spec.js` | Canvas bounded, overflow, theme readability |
| `tests/simulation-test-utils.js` | Shared test helpers |
| `docs/design-guidelines.md` | Simulation visual/responsive rules |
| `docs/system-architecture.md` | Runtime contract |

## Current Patterns

- `.content-area .sim-container.sim-lab` already widened to `1120px`.
- Canvas logical size locked at `760x440`.
- `.sim-lab` direct children already have stable classes: `.sim-header`, `.sim-lab-scene`, `.sim-lab-toolbar`, `.sim-controls`, `.sim-readout-grid`, `.sim-formula-panel`, `.sim-lab-hint`.
- Controls/readouts already use semantic classes and `data-readout-kind`.
- Mobile rules already stack controls and readout grid under `<=560px`.

## Constraints

- No framework or bundler.
- No route-specific shell variants.
- No renderer/behavior changes unless a layout blocker is proven.
- Keep touch targets `>=44px`.
- Keep screen-reader hooks: region label, status live region, canvas described by hint.
- Avoid horizontal page scroll at `1366`, `1024`, `768`, `390`.

## Recommended Touchpoints

1. Add tests first in existing Playwright specs.
2. Update `css/style.css` scoped under `.sim-lab`.
3. Only edit `js/sim-lab-ui.js` if CSS-only layout cannot group inspector reliably.
4. Update docs and changelog after implementation.

## Unresolved Questions

- None.
