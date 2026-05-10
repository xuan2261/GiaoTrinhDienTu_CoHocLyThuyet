# Phase 03 - Build Simple Lab Shell

## Context Links

- [Simple Shell Architecture Research](./research/simple-shell-architecture-research.md)
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\DeCuong_CoHocLyThuyet.html`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md`

## Overview

Priority: P1  
Status: Done  Goal: replace professional multi-panel shell with simple student-facing shell: compact header, canvas, controls, readout cards, short hint.

## Key Insights

- DeCuong UX is better because it reduces cognitive load.
- Keep `.sim-lab-scene` and `.sim-lab-overlay` to avoid renderer/KaTeX regressions.
- CSS must stay scoped under `.sim-lab`.
- Simple shell must not reintroduce visible route chips, legends, or handle labels as primary UI.

## Requirements

Functional:
- `SimLabUI.createLab()` creates:
  - `.sim-container.sim-lab`
  - `.sim-header`
  - `.sim-lab-scene`
  - `.sim-lab-overlay`
  - `.sim-controls`
  - `.sim-readout-grid`
  - `.sim-lab-hint` or `.sim-lab-formula-panel` simplified
- No toolbar route chip as primary visible UI.
- No legend dominance.
- No feedback/checkpoint panel.
- No visible canvas-level "điểm điều khiển", "điểm kéo", or round drag-marker affordance created by the shell.

Non-functional:
- Canvas remains responsive.
- Overlay remains synced to canvas.
- Touch targets remain >= 44px on mobile where buttons exist.
- Text no overlap.
- Interaction diagnostics may remain as hidden `data-*` attributes only.

## Architecture

`sim-core.createSimContainer()` can remain low-level, but `SimLabUI.createLab()` should reorder/wrap DOM into simple shell.

Proposed DOM:

```html
<div class="sim-container sim-lab" data-route-id="...">
  <div class="sim-header">
    <span class="sim-title">Mô phỏng: ...</span>
    <div class="sim-header-actions">...</div>
  </div>
  <div class="sim-lab-scene">
    <canvas class="sim-canvas"></canvas>
    <div class="sim-lab-overlay"></div>
  </div>
  <div class="sim-controls"></div>
  <div class="sim-readout-grid"></div>
  <div class="sim-lab-hint"></div>
</div>
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-renderer-primitives.js` |

## Implementation Steps

1. Refactor `createLab()` DOM assembly.
2. Keep `lab.scene`, `lab.overlay`, `lab.canvas`, `lab.controls`, `lab.info`.
3. Add `lab.hint` and helper `lab.setHint(text)`.
4. Remove heavy toolbar/legend creation or move it to non-visible metadata if tests still need route id via data attributes.
5. Update CSS under simulation section to match DeCuong-like compact cards.
6. Ensure `data-route-id`, `data-renderer-id`, `data-behavior-id`, and hidden interaction diagnostics still set by engine.
7. Do not draw shell-owned canvas markers; object/vector visuals belong to route renderers only.

## Todo List

- [ ] Simplify `createLab` DOM.
- [ ] Preserve canvas/overlay references.
- [ ] Add simple hint slot.
- [ ] Adjust CSS for header, canvas, controls, readout grid.
- [ ] Remove obsolete `.sim-lab-panels`, `.sim-feedback-panel`, `.sim-checkpoint-panel` CSS.
- [ ] Remove visible legend/route-chip dominance.
- [ ] Confirm no shell-created visible drag marker or handle label.
- [ ] Check desktop/mobile layout.

## Validation & Tests

```powershell
node --check js\sim-lab-ui.js
node --check js\sim-professional-lab.js
npm run test:sim:unit
npx playwright test tests\simulation-browser.spec.js --grep "@lab-shell"
npx playwright test tests\simulation-browser.spec.js --grep "@responsive"
```

New/updated browser assertions:
- `.sim-container.sim-lab` visible.
- `.sim-lab-scene` visible.
- `.sim-lab-overlay` visible.
- `.sim-readout-grid` visible.
- `.sim-lab-hint` visible.
- `.sim-checkpoint-panel` count is 0.
- text does not contain `Điểm kiểm tra`.
- visible lab text does not contain `điểm kéo` or generic `điểm điều khiển`.
- no visible `.sim-lab-route-chip` or `.sim-lab-legend` dominates the shell.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Overlay detaches from canvas | Preserve `.sim-lab-scene` structure and run overlay tests. |
| Tests assume toolbar route chip | Move route identity assertions to `data-route-id` or info metadata. |
| CSS affects non-sim cards | Scope all new CSS under `.sim-lab`. |

## Security Considerations

- Use `textContent` for dynamic hint/title/readout.
- No HTML injection from route metadata.

## Next Steps

Phase 04 converts readout content from dense string to useful cards.

## Unresolved Questions

None.
