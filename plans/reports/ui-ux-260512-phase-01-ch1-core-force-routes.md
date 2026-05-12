# UI/UX Review - Phase 01 CH1 Core Force Routes

## Scope
- Reviewed 6 routes: `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`.
- Compared against DeCuong reference patterns: 760px canvas, 30px theme grid, red/blue/green/gold force/readout language, handle dots, equation/readout blocks.
- Source refs: `DeCuong_CoHocLyThuyet.html` lines 1227-1235, 2480-2487, 2527-2539, 3209-3297, 3367-3465.

## Verdict
Phase 01 is aligned in principle with DeCuong visual quality. All 6 routes have dedicated scene/renderer/behavior contracts, render on `760x440`, use theme-aware grid, clear force arrows, route-owned handles, trails, KaTeX/formula panels, and no obvious legacy English UI leak in visible shell text.

## Verification
- PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
- Playwright inline check: each route `760x440`, nonblank canvas, route-owned handles present, dark/light overflow `0`, no legacy English leak by shell pattern.

## What Matches DeCuong
- Canvas sizing and interaction bounds: `js/sims/ch1/ch1-force-law-renderers.js:14`, `js/sims/ch1/ch1-force-law-behaviors.js:13`.
- Theme-aware grid + DeCuong arrows/handles/trail used by all 6 renderers: `js/sims/ch1/ch1-force-law-renderers.js:27`, `35`, `41`, `63`, `80`, `96`, `118`, `132`, `160`.
- Shell CSS supports `760 / 440` aspect, chapter accents, 44px controls, color-coded readout variants: `css/style.css:1283`, `1321`, `1334`, `1341-1364`.
- Route matrix is covered by dedicated registrations: `js/sims/ch1/ch1-force-law-renderers.js:209-214`, `js/sims/ch1/ch1-force-law-behaviors.js:201-206`.

## Actionable Concerns
1. `ch1-1-8` Vietnamese inside KaTeX `\text{...}` renders degraded diacritics.
   - Evidence: `js/sims/ch1/ch1-force-law-scenes.js:93` and `js/sims/ch1/ch1-force-law-renderers.js:150`.
   - Browser DOM text becomes `Lieˆn keˆˊt... khoˊa`, which hurts the "readable KaTeX/equation overlay" criterion.
   - Action: keep KaTeX math-only for this route, e.g. symbols `N, T, R_x, R_y, M`; move Vietnamese explanatory text to `domPanel`/hint/readout plain text.

2. Readout color kinds are inferred incorrectly for some Phase 01 cards.
   - Evidence: `js/sim-professional-lab.js:204` infers kind by regex, and `js/sim-professional-lab.js:291` does not honor explicit `item.kind`.
   - Observed examples: `α` from `forceAngle` becomes `force`, `Điểm đặt` becomes `energy`, `M_O` becomes `energy`, `d` stays `default`, `Khóa` becomes `force`.
   - Action: allow scene readouts to provide explicit `kind`, then mark Phase 01 readouts in `js/sims/ch1/ch1-force-law-scenes.js` as `force/result/angle/moment/default` as intended.

## Unresolved Questions
None.

**Status:** DONE_WITH_CONCERNS
**Summary:** Phase 01 visuals mostly meet DeCuong expectations; 6/6 routes mount as 760x440, are nonblank, use handles/grid/arrows/trails, and show no obvious English UI leak.
**Concerns/Blockers:** Two actionable polish issues remain: KaTeX Vietnamese readability in `ch1-1-8`, and readout kind inference causing several color-coded cards to use the wrong semantic color.
