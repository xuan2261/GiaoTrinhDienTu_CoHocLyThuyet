# Phase 04 Topbar Responsive Refinement

## Context Links

- [Phase 02](./phase-02-tdd-layout-gates.md)
- [CSS topbar rules](../../css/style.css)
- [App shell behavior](../../js/app.js)
- [Index shell](../../index.html)

## Overview

Priority: P2. Status: Complete. Reduce topbar crowding on tablet/mobile while preserving core controls.

## Key Insights

- Current topbar has many visible controls.
- `<=480px` hides breadcrumb and brand icon, but tablet width can still crowd.
- Prefer CSS reflow/hide secondary controls before markup changes.

## Requirements

- Functional: topbar children do not overlap at `768px` and `390px`.
- Functional: search remains reachable.
- Functional: theme remains reachable.
- Non-functional: no new JS interaction unless unavoidable.

## Architecture

Priority order:

1. Menu button.
2. Brand.
3. Search.
4. Theme.
5. Font zoom.
6. Breadcrumb.

Potential CSS rules:

```css
@media (max-width: 900px) {
  .bc { display: none; }
  .font-zoom { display: none; }
  .search { flex: 1 1 auto; min-width: 0; }
}
```

If search still crowds at mobile width, reduce placeholder/kbd visibility via CSS. Do not remove search.

## Related Code Files

Modify:

- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` only if markup label/structure must support CSS.
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\app.js` only if behavior requires a compact search toggle.

Create:

- None expected.

Delete:

- None.

## Implementation Steps

1. Use Phase 01 topbar overlap metrics to identify exact breakpoint.
2. Add CSS rules for `<=900px` or `<=820px` if needed:
   - Hide `.bc`.
   - Hide or compact `.font-zoom`.
   - Allow `.search` `min-width: 0`.
   - Hide `.kbd` on small screens if needed.
3. Preserve `Ctrl K` behavior and search dropdown positioning.
4. Verify theme button still accessible.
5. Verify sidebar button still accessible and tap target is usable.

## Todo List

- [x] Add topbar overlap test if not already in Phase 02.
- [x] Add responsive CSS for tablet.
- [x] Confirm mobile compact behavior.
- [x] Confirm search dropdown still usable.
- [x] Confirm font zoom hidden only where necessary.

## Tests

Run:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
```

Manual checks:

- `Ctrl+K` focuses search on desktop.
- Search input/dropdown visible at `768`.
- Menu opens sidebar overlay at mobile width.
- Theme toggle works in compact layout.

Optional JS syntax if `app.js` touched:

```powershell
node --check js\app.js
```

## Success Criteria

- No topbar overlap at `768x812` and `390x844`.
- Search and theme are still available.
- Breadcrumb/font zoom can be hidden on compact viewports without breaking desktop.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Hiding font zoom hurts accessibility | Hide only at cramped width; body zoom state still persists |
| Search dropdown clipped | Verify `.sr` positioning after flex changes |
| Placeholder text overflows | Hide `.kbd`, reduce placeholder impact by flex min-width |

## Security Considerations

No security impact.

## Next Steps

Run mobile simulation polish checks in Phase 05.
