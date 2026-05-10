# Researcher 02 Report - Visual QA Gates

## Summary

Existing QA proves mount, uniqueness, localization, and partial animation. It does not prove professional visual quality. Need browser-level gates for detached handles, edge clipping, duplicate registry warnings, and meaningful animation by route family.

## Findings From Audit

| Signal | Result |
|---|---|
| Browser tests | `268 passed`, `1 skipped` |
| Animated route count | 33/58 |
| Non-animated route count | 25/58 |
| High edge-ink routes | `ch1-2-3`, `ch1-2-6`, `ch2-1-1`, `ch3-5-3`, `ch3-6-2` |
| Duplicate warnings | 93 console warnings |
| Sparse controls | `ch3-7-2` has 1 slider, 0 preset buttons |

## Gate Design

Add focused Playwright visual quality suite:

| Gate | What it checks |
|---|---|
| Console overwrite gate | No route registry overwrite warnings on app boot |
| Edge ink gate | Non-background pixels do not touch canvas border beyond tolerance |
| Detached handle gate | Handle centers must be near route-declared visual anchors |
| Animation family gate | Ch2/Ch3 dynamic routes must have canvas delta over time |
| Route semantic control gate | Route controls must not be generic placeholders when route requires topic controls |

## Implementation Target

Prefer new focused test file:

- `tests/simulation-visual-quality.spec.js`

Reason: `tests/simulation-browser.spec.js` is already large; adding more would worsen context and maintenance. This is not an "enhanced duplicate"; it is a separate quality gate.

Add package script:

- `test:sim:visual-quality`

## Edge Detection Notes

Reuse audit method:
- sample canvas pixels after mount;
- classify near-white/light-gray background as non-ink;
- count ink on border strips `x <= 2`, `x >= width - 3`, `y <= 2`, `y >= height - 3`;
- fail high border ink except known frame strokes if explicitly whitelisted.

## Unresolved Questions

- Tolerance should be strict after fixes; suggested start: max edge ink <= 12 per side.

