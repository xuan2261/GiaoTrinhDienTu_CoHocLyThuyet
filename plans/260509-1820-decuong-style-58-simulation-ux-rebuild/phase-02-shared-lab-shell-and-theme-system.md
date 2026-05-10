# Phase 02 - Shared Lab Shell And Theme System

## Context Links

- [Phase 01](./phase-01-baseline-ux-audit-and-test-gates.md)
- `DeCuong_CoHocLyThuyet.html` sample shell
- `docs/design-guidelines.md`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 14h |
| Goal | Make the shared simulation shell look and behave like a polished DeCuong-style lab in both dark and light theme |

## Key Insights

- Shell is the multiplier: fix once, all 58 routes improve.
- Dark-only DeCuong copy is not acceptable; simulation must respect existing `data-theme`.
- Keep `.sim-lab` selectors scoped. Avoid global `.toolbar`, `.panel`, `.status`.

## Requirements

### Functional

- Header has route title, route badge/status, reset/play controls.
- Canvas section has DeCuong-like grid, framed scene, no nested card clutter.
- Readout cards use label/value/unit, color by physical type.
- Formula/equation panel available as optional slot.
- Hint text is short, one line when possible.
- Light theme has proper contrast and no dark-only text.

### Non-Functional

- No new framework.
- No route behavior changes in this phase unless needed to expose shell data.
- Maintain responsive layout at desktop, tablet, mobile.

## Architecture

```text
SimLabUI.createLab(host, cfg)
  -> .sim-lab[data-route-id]
  -> .sim-header
  -> .sim-lab-scene + canvas + overlay
  -> .sim-controls
  -> .sim-readout-grid
  -> .sim-formula-panel (optional)
  -> .sim-lab-hint

CSS variables:
  default app vars
  + scoped simulation vars for dark/light
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js` |

## Implementation Steps

1. Add scoped simulation theme variables under `.sim-lab`.
2. Add `data-theme="light"` compatible selectors using existing app theme mechanism.
3. Refactor shell DOM minimally:
   - keep existing class names where tests depend on them.
   - add optional `.sim-formula-panel` without requiring every route to fill it.
4. Update button/control styles:
   - reset and play/pause consistent.
   - min-height 44px on touch widths.
   - visible focus ring.
5. Update readout cards:
   - stable min height.
   - no layout shift between values.
   - `tabular-nums`.
6. Update canvas scene wrapper:
   - DeCuong-like grid/surface tokens.
   - no hardcoded dark text.
7. Verify 58 route shell still mounts.

## Todo List

- [x] Add scoped dark/light simulation CSS tokens.
- [x] Add optional formula panel DOM slot.
- [x] Polish header/control/readout/hint layout.
- [x] Update tests for dark and light theme.
- [x] Check mobile width `375x812`.

## Tests / Verify

```powershell
npm run test:sim:unit
npm run test:sim:browser:route-mount
npx playwright test tests/simulation-browser.spec.js --grep "@sim-shell-theme"
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npm run test:sim:visual-quality
```

Manual browser verify:

```powershell
python -m http.server 8000
# Open http://localhost:8000/#ch1-2-3
# Toggle dark/light theme
# Repeat: #ch1-3-1, #ch2-1-1, #ch3-6-2
```

## Success Criteria

- Shell visually matches DeCuong direction but works in light theme.
- 58/58 routes still show `.sim-container.sim-lab`.
- No text overflow in controls/readout on mobile.
- Visual-quality edge/blank checks pass.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| CSS affects non-simulation UI | Scope under `.sim-lab` |
| Light theme unreadable | Dedicated Playwright theme test |
| Existing tests expect old text | Keep class names and accessible button names stable |

## Security Considerations

- Use `textContent`, not raw HTML, for route text.
- Formula panel must render only controlled KaTeX/DOM overlay content.

## Next Steps

Phase 03 standardizes the interaction/control grammar on top of the new shell.

## Unresolved Questions

Không có.
