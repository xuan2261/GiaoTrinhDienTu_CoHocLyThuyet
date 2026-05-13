# Researcher 01 Layout Contract Report

## Summary

Scope: reading layout vs simulation layout separation.

Finding: current `content-area` max width is correct for reading. Simulation needs scoped widening only. Do not change text content width.

## Evidence

| Source | Finding |
|---|---|
| `css/style.css` | `content-area` uses `max-width: clamp(680px, 55vw, 900px)` |
| `layout_hientai.md` | Reading layout and simulation shell share content area |
| `docs/design-guidelines.md` | Content centered; simulation shell shared; no route-specific layout variants |
| `tests/simulation-browser.spec.js` | Existing responsive checks focus overflow, not reading/sim width split |

## Recommended Contract

- Reading pages keep current max width.
- Simulation pages may be wider through `.sim-container.sim-lab`.
- Desktop target: simulation panel wider than `content-area` where viewport supports.
- Mobile target: `width: 100%`, no page horizontal scroll.
- No canvas coordinate change.

## Rejected Ideas

| Idea | Reason |
|---|---|
| Widen `.content-area` globally | Makes paragraph lines too long |
| Add fullscreen mode first | Too much UX/JS complexity |
| Route-specific CSS per simulation | Violates shared-first shell |

## Tests Needed

- Reading width stays bounded.
- Simulation width is wider on desktop/tablet.
- Page overflow stays `<= 1px`.
- Same test runs dark/light if feasible.

## Unresolved Questions

- Exact desktop max width: `1040`, `1120`, or viewport formula. Start with `1120` cap, validate against screenshots.
