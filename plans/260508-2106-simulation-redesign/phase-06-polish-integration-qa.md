---
phase: 06
title: "Polish Integration QA"
status: completed
priority: P1
effort: 1 tuần
dependencies: [03, 04, 05]
---

# Phase 06: Polish Integration QA

## Overview

Hoàn thiện toàn bộ: polish UI, responsive, accessibility, deprecate old sim-*.js files, integration test, QA suite, update docs.

## Requirements

- **Functional:** Tất cả 58 routes hoạt động; Old files deprecated; Docs updated
- **Non-functional:** QA suite pass; Responsive 320px+; Touch targets ≥ 44px; 60fps

## Architecture

### UI Polish Tasks

```
Polish checklist:
□ Responsive: canvas tự scale cho viewport 320px → 2560px
□ Touch: tất cả hit targets ≥ 44px (CSS + JS)
□ Ghost preview: consistent dashed ghost trên tất cả drag interactions
□ Snap guides: grid + angle snap đồng nhất
□ Color coding: Ch1=xanh dương, Ch2=xanh lá, Ch3=tím — nhất quán
□ Readout cards: uniform styling, font size, spacing
□ Timeline scrubber: consistent width, thumb size, touch target
□ Equation display: consistent positioning, background, font size
□ Loading state: skeleton/placeholder khi route loading
□ Error state: graceful fallback nếu route không mount
□ Dark mode: verify tất cả elements đúng trên cả dark + light theme
```

### Responsive Canvas Strategy

```js
// Tính canvas scale factor dựa trên container width
function computeCanvasScale(canvas, targetWidth = 760) {
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth - 32; // padding
  const scale = Math.min(1, containerWidth / targetWidth);
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = 'top left';
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth * 0.57); // 760:440 ratio
  return scale;
}
```

## Related Code Files

- **Modify:** `js/sim-lab-ui.js`, `css/style.css`
- **Delete (deprecate):** `js/sim-kinematics.js`, `js/sim-statics.js`, `js/sim-dynamics.js`, old route files in `js/sims/`
- **Update:** `docs/system-architecture.md`, `docs/codebase-summary.md`, `docs/project-roadmap.md`, `docs/design-guidelines.md`

## Implementation Steps

1. **Responsive canvas** — fix tất cả routes:
   - Canvas aspect ratio cố định: 760:440 ≈ 1.73
   - CSS: `canvas { max-width: 100%; height: auto; }`
   - JS: compute scale factor từ container width, apply transform
   - Test: 320px, 480px, 768px, 1024px, 1440px, 1920px, 2560px

2. **Touch target audit** — kiểm tra tất cả interactive elements:
   - Buttons: min 44×44px
   - Handles: radius visual 12px, hit area 22px (44px diameter)
   - Sliders: track height ≥ 8px, thumb ≥ 44px
   - Scrubber: full-width, thumb ≥ 44px
   - Sidebar items: min height 44px

3. **Ghost preview audit** — kiểm tra tất cả drag interactions:
   - Ghost phải là dashed line/arrow, semi-transparent
   - Ghost không được flicker khi drag
   - Ghost disappers on release

4. **Snap guide audit** — kiểm tra:
   - snapToGrid(10px) hoạt động khi drag bodies
   - snapToAngle(15°) hoạt động khi rotate
   - Visual indicator (small dots/lines) hiển thị snap targets

5. **Deprecate old sim-*.js files**:
   - Backup: copy vào `js/deprecated/` (thay vì xóa)
   - Remove `<script>` tags from `index.html`
   - Remove entries from `js/simulations.js` legacy compatibility layer
   - Update loader flow: chỉ load new modules

6. **Integration smoke test**:
   - Mount từng route từ 1→58, verify canvas renders
   - Test navigation: sidebar → route → next → prev → breadcrumb → search
   - Test theme switch: dark → light → dark, verify simulation colors
   - Test font zoom: 80% → 120% → 100%, verify readout text

7. **QA suite run**:
   ```
   python tools/smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
   python tools/audit_simulation_quality.py --all --max-js-lines 220
   python tools/smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
   npm run test:sim:unit
   npm run test:sim:quality
   npm run test:sim:semantic
   npm run test:sim:renderer-contract
   npm run test:sim:browser
   ```
   Target: ≥ 268 pass + 1 skipped (baseline)

8. **Update documentation**:
   - `docs/system-architecture.md` — cập nhật diagram với new layers
   - `docs/codebase-summary.md` — cập nhật JS file list
   - `docs/design-guidelines.md` — thêm simulation design tokens mới
   - `docs/project-roadmap.md` — đánh dấu redesign hoàn thành

9. **Offline verification**:
   - Copy repo folder → USB
   - Open `index.html` via `file://` (no server)
   - Test 3 routes (1 per chapter) — all must work

10. **Performance profiling**:
    - Chrome DevTools Performance tab
    - Profile: load page → navigate 3 routes → drag interaction → animation
    - Verify: no main-thread blocking > 50ms, no GC pauses > 16ms

11. **Final browser QA**:
    - Chrome: full suite
    - Firefox: smoke test (mount 3 routes)
    - Mobile Chrome (if available): touch interaction test

12. **Release package**:
    - Create clean zip/folder theo release checklist
    - Verify file count: js/physics/, js/scene/, js/render/, js/interaction/, js/animation/, js/routes/ total files
    - Verify total JS LOC ≤ baseline + new LOC (don't bloat)

## Success Criteria

- [ ] 58/58 routes mount + render + interact đúng
- [ ] QA suite: `npm run test:sim:browser` ≥ 268 pass + 1 skip
- [ ] Responsive: canvas scale đúng trên 320px → 2560px
- [ ] Touch targets: tất cả ≥ 44px
- [ ] Ghost preview: consistent trên tất cả drag interactions
- [ ] Snap guides: hoạt động đồng nhất
- [ ] Dark/light theme: verified
- [ ] Font zoom: verified
- [ ] Offline: works via `file://`
- [ ] Performance: 60fps, no main-thread blocking > 50ms
- [ ] Old sim-*.js files: deprecated in `js/deprecated/`
- [ ] Docs: updated system-architecture, codebase-summary, design-guidelines, project-roadmap
- [ ] Chrome DevTools Console: 0 errors (Error level)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| QA regression (fewer pass than baseline) | Run baseline first, track delta, fix regressions before shipping |
| Responsive regression | Test on actual devices if possible, use browser DevTools device mode |
| Deprecated files still loaded | Verify script tags removed from index.html |

## Context Links

- Phases 01-05: `phase-01-foundation-architecture.md` through `phase-05-ch3-dynamics.md`
- Baseline QA: `package.json` test scripts
- Reference: `docs/docx-sync-pipeline.md` (for release checklist)
