---
phase: 0
title: "DeCuong Visual Foundation"
status: completed
priority: P1
effort: "18h"
dependencies: []
---

# Phase 00: DeCuong Visual Foundation

## Overview
Xây dựng shared visual foundation cho tất cả 58 routes: theme-aware canvas, DeCuong-style handles, color-coded readout cards, KaTeX equation panel, trail renderer, canvas 760×440. Đồng thời align contract scenes với manifest và fix clearCanvas theme bug.

**Completed 2026-05-12:** Phase 00 foundation shipped and reviewed. Runtime route contracts remain aligned at 58/58 and lifecycle cleanup now covers scoped professional-lab listeners/disposer.

## Context Links
- [DeCuong Source](../../DeCuong_CoHocLyThuyet.html) — 3 reference sims (L3209-3364, L3367-3499, L3502-3621)
- [Equation Mapping](../../data/equation_mapping.json) — 702 rows KaTeX equations
- [Manifest](../../js/sim-route-manifest.js) — 58 P1 route IDs (source of truth)

## Requirements
- Functional: shared rendering helpers đủ sức vẽ mọi DeCuong pattern (grid, handle, arrow, trail, arc, dashed line)
- Functional: readout cards color-coded theo loại (force/velocity/accel/result/angle/energy)
- Functional: KaTeX equation display panel per route
- Functional: canvas 760×440 responsive (scale down khi container nhỏ)
- Functional: contract scenes aligned with manifest 58 IDs
- Non-functional: không break existing 58 route mount/render cycle

## DeCuong Visual Spec (Extracted from Source)

### Grid
| Property | Dark | Light |
|----------|------|-------|
| Step | 30px | 30px |
| Color | `rgba(255,255,255,.04)` | `rgba(0,0,0,.06)` |
| Line width | 1 | 1 |

### Handle Dots
| Property | Value |
|----------|-------|
| Outer radius | 8px |
| Inner (white) radius | 3px |
| Mouse hit radius | 15px |
| Touch hit radius | 25px |

### Arrows
| Property | Value |
|----------|-------|
| Arrowhead angle | `Math.PI/7` ≈ 0.449 rad |
| Head length | 14px (forces), 12px (beam), 10px (particle) |
| Line width | 3 (forces), 3.5 (resultant), 2.5 (reactions/vectors) |

### Force Colors
| Type | Color |
|------|-------|
| F1 / Force / Velocity | `#e74c3c` |
| F2 / Blue readout | `#2980b9` |
| Result / Reaction | `#27ae60` |
| Angle / Gold | `var(--gold)` = `#c9963a` dark / `#8b6914` light |
| Tangential accel | `#e67e22` |
| Beam fill | dark `rgba(201,150,58,.15)` / light `.2` |
| Beam stroke | dark `rgba(201,150,58,.5)` / light `rgba(139,105,20,.5)` |

### Trail
| Property | Value |
|----------|-------|
| Points | 30 (last N) |
| Color | dark `rgba(231,76,60,.3)` / light `.25` |
| Line width | 3 |

### Canvas Background
| Method | Detail |
|--------|--------|
| Clear | `ctx.clearRect(0, 0, W, H)` (transparent) |
| CSS | `.sim-canvas-wrap { background: var(--bg) }` |
| **NOT** | `ctx.fillStyle = '#f8f9fa'` (current bug) |

### Theme Detection
```javascript
const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
// MutationObserver on data-theme → re-render
```

## Architecture

```
DeCuong Visual Stack:
  sim-scene-templates.js → W=760, H=440 (authoritative constants)
  sim-route-renderer-primitives.js → W=760, H=440
  sim-core.js → createSimContainer default 760×440, clearCanvas → clearRect
  sim-core.js → drawArrow arrowhead PI/7
  sim-rendering.js → drawThemeGrid, drawDragHandle, drawTrail, drawAngleArc, drawDeCuongArrow
  sim-professional-lab.js → reads W/H from templates, readout cards, equation panel
  css/style.css → .sim-info-card color variants, .sim-canvas-wrap responsive
  zz-simulation-contract-scenes.js → rewrite to match manifest 58 IDs

  CH1 behavior files (4):
    ch1-force-law-behaviors.js → W=760, H=440
    ch1-support-spatial-behaviors.js → W=760, H=440
    ch1-solver-exercises-behaviors.js → W=760, H=440
    ch1-friction-centroid-solver-behaviors.js → W=760, H=440
```

## Related Code Files
- Modify: `js/sim-scene-templates.js` — W=760, H=440
- Modify: `js/sim-route-renderer-primitives.js` — W=760, H=440
- Modify: `js/sim-core.js` — createSimContainer default, clearCanvas → clearRect, drawArrow PI/7
- Modify: `js/sim-rendering.js` — add DeCuong visual helpers
- Modify: `js/sim-professional-lab.js` — reads W/H from templates, readout cards, equation panel
- Modify: `css/style.css` — DeCuong simulation CSS
- Modify: `js/sims/ch1/ch1-force-law-behaviors.js` — W=760, H=440
- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js` — W=760, H=440
- Modify: `js/sims/ch1/ch1-solver-exercises-behaviors.js` — W=760, H=440
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` — W=760, H=440
- Modify: `js/sims/zz-simulation-contract-scenes.js` — rewrite route IDs to match manifest
- Modify: `js/sims/zz-simulation-contract-renderers.js` — update W/H if hardcoded

## Implementation Steps

### 1. W/H Constants Migration (7 files)
Update all files containing `const W = 560, H = 340`:

```javascript
// ALL 7 files: change to
const W = 760, H = 440;
```

Files:
1. `js/sim-scene-templates.js` L9
2. `js/sim-route-renderer-primitives.js` L3
3. `js/sims/ch1/ch1-force-law-behaviors.js` L13
4. `js/sims/ch1/ch1-support-spatial-behaviors.js` L10
5. `js/sims/ch1/ch1-solver-exercises-behaviors.js` L10
6. `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` L10
7. `js/sim-professional-lab.js` L21 — already uses `templates.W || 560` → templates will provide 760

### 2. clearCanvas Theme-Aware Fix
```javascript
// sim-core.js: BEFORE
function clearCanvas(ctx, w, h) {
  ctx.fillStyle = SIM_BG;       // '#f8f9fa' hardcoded light
  ctx.fillRect(0, 0, w, h);
}

// sim-core.js: AFTER (match DeCuong)
function clearCanvas(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);    // transparent → CSS var(--bg) handles theme
}
```

### 3. Arrowhead Angle Fix
```javascript
// sim-core.js drawArrow: BEFORE
ctx.lineTo(x2 - headLen * Math.cos(angle - 0.35), ...);
ctx.lineTo(x2 - headLen * Math.cos(angle + 0.35), ...);

// AFTER (match DeCuong PI/7)
const AH = Math.PI / 7;
ctx.lineTo(x2 - headLen * Math.cos(angle - AH), ...);
ctx.lineTo(x2 - headLen * Math.cos(angle + AH), ...);
```

### 4. Theme-Aware Grid Rendering
```javascript
// sim-rendering.js: drawThemeGrid(ctx, W, H, step)
function drawThemeGrid(ctx, W, H, step) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += (step || 30)) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += (step || 30)) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}
```

### 5. DeCuong Handle Drawing
```javascript
// sim-rendering.js: drawDragHandle(ctx, x, y, color)
// 8px outer + 3px white inner (exact DeCuong pattern)
function drawDragHandle(ctx, x, y, color) {
  ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}
```

### 6. Trail Renderer
```javascript
// sim-rendering.js: drawTrail(ctx, points, color, maxPoints)
function drawTrail(ctx, points, color, maxPoints) {
  if (!points || points.length < 2) return;
  const slice = points.slice(-(maxPoints || 30));
  ctx.beginPath();
  slice.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = color || 'rgba(231,76,60,.3)';
  ctx.lineWidth = 3;
  ctx.stroke();
}
```

### 7. Angle Arc Helper
```javascript
// sim-rendering.js: drawAngleArc(ctx, cx, cy, a1, a2, radius, color)
function drawAngleArc(ctx, cx, cy, a1, a2, radius, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius || 35, a1, a2, a2 < a1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
```

### 8. DeCuong Arrow (PI/7 arrowhead)
```javascript
// sim-rendering.js: drawDeCuongArrow(ctx, fx, fy, tx, ty, color, lw)
function drawDeCuongArrow(ctx, fx, fy, tx, ty, color, lw) {
  const a = Math.atan2(ty - fy, tx - fx);
  const hl = 14;
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty);
  ctx.strokeStyle = color; ctx.lineWidth = lw || 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx, ty);
  ctx.lineTo(tx - hl * Math.cos(a - Math.PI / 7), ty - hl * Math.sin(a - Math.PI / 7));
  ctx.lineTo(tx - hl * Math.cos(a + Math.PI / 7), ty - hl * Math.sin(a + Math.PI / 7));
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
```

### 9. Dashed Line Helper
```javascript
// sim-rendering.js: drawDashed(ctx, fx, fy, tx, ty, color)
function drawDashed(ctx, fx, fy, tx, ty, color) {
  ctx.beginPath(); ctx.setLineDash([6, 4]);
  ctx.moveTo(fx, fy); ctx.lineTo(tx, ty);
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4; ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
}
```

### 10. Color-Coded Readout Cards CSS
```css
/* style.css — match DeCuong .sim-info-card variants */
.sim-readout-card[data-readout-kind="force"] .sim-readout-value { color: #e74c3c; }
.sim-readout-card[data-readout-kind="velocity"] .sim-readout-value { color: #0d6efd; }
.sim-readout-card[data-readout-kind="accel"] .sim-readout-value { color: #198754; }
.sim-readout-card[data-readout-kind="result"] .sim-readout-value { color: #27ae60; }
.sim-readout-card[data-readout-kind="angle"] .sim-readout-value { color: var(--sim-gold, #b8860b); }
.sim-readout-card[data-readout-kind="energy"] .sim-readout-value { color: #6f42c1; }
.sim-readout-card[data-readout-kind="time"] .sim-readout-value { color: #fd7e14; }
```

### 11. KaTeX Equation Panel
```javascript
// sim-professional-lab.js: renderEquationPanel(lab, equations)
// equations = [{tex: 'R_A + R_B - P = 0', label: 'ΣF_y = 0'}]
// Cross-reference: data/equation_mapping.json (702 rows)
// Render using katex.renderToString() into .sim-equation-panel div
```

### 12. Hint Format Update
```javascript
function formatHint(text, handles) {
  const labels = (handles || []).map(h => h.label).filter(Boolean).slice(0, 2);
  const action = labels.length ? `💡 Kéo ${labels.join(' hoặc ')} để thay đổi mô hình.` : '';
  return action || '💡 ' + (text || 'Tương tác với canvas để khám phá.');
}
```

### 13. Contract Scenes Alignment
Rewrite `zz-simulation-contract-scenes.js` to use the 58 route IDs from `sim-route-manifest.js`:
- Replace 19 orphan IDs (ch1-1-1, ch1-1-2, ch1-2-2, etc.) with manifest IDs
- Ensure 1:1 mapping between contract scenes and manifest

### 14. Instant Reset Pattern
```javascript
// All routes use instant reset (no transition):
// state = makeState(scene, routeId); draw();
```

## Todo List
- [x] Update W=760, H=440 in sim-scene-templates.js
- [x] Update W=760, H=440 in sim-route-renderer-primitives.js
- [x] Update W=760, H=440 in 4 CH1 behavior files
- [x] Fix clearCanvas() → ctx.clearRect() in sim-core.js
- [x] Fix drawArrow() arrowhead 0.35 → PI/7 in sim-core.js
- [x] Add `drawThemeGrid()` to sim-rendering.js
- [x] Add `drawDragHandle()` to sim-rendering.js
- [x] Add `drawTrail()` to sim-rendering.js
- [x] Add `drawAngleArc()` to sim-rendering.js
- [x] Add `drawDeCuongArrow()` to sim-rendering.js
- [x] Add `drawDashed()` to sim-rendering.js
- [x] Add color-coded readout card CSS
- [x] Add KaTeX equation panel support
- [x] Update hint format with emoji
- [x] Rewrite contract scenes to match manifest 58 IDs
- [x] Verify all 58 routes still mount with new canvas size
- [x] Test dark/light theme toggle
- [x] Responsive scaling verification

## Completion Evidence
- `npm run test:sim:unit` PASS.
- `npm run test:sim:browser` PASS: 150 passed.
- `npm run test:sim:visual-quality` PASS: 4 passed.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup` PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` PASS.
- `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct` PASS.
- `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` PASS.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220` PASS.
- `python tools\audit.py` PASS.
- Code review re-check found no Critical/High/Medium issues after fixes.

## Verification / Tests
```powershell
# Verify W/H constants are 760/440 in all files
node -e "const fs=require('fs');['js/sim-scene-templates.js','js/sim-route-renderer-primitives.js','js/sims/ch1/ch1-force-law-behaviors.js','js/sims/ch1/ch1-support-spatial-behaviors.js','js/sims/ch1/ch1-solver-exercises-behaviors.js','js/sims/ch1/ch1-friction-centroid-solver-behaviors.js'].forEach(f=>{const c=fs.readFileSync(f,'utf8');console.log(f,/W\s*=\s*760/.test(c)?'OK':'FAIL')})"

# Verify contract scenes match manifest
node -e "const fs=require('fs');const m=fs.readFileSync('js/sim-route-manifest.js','utf8');const c=fs.readFileSync('js/sims/zz-simulation-contract-scenes.js','utf8');const mIds=[...m.matchAll(/'(ch\d+-\d+-\d+)':/g)].map(x=>x[1]).sort();const cIds=[...c.matchAll(/\['(ch\d+-\d+-\d+)'/g)].map(x=>x[1]).sort();console.log('Manifest:',mIds.length,'Contract:',cIds.length);const diff=mIds.filter(x=>!cIds.includes(x));console.log(diff.length===0?'ALIGNED':'MISMATCHED:',diff);"

# Verify runtime globals still export correctly
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup

# Verify no JS syntax errors
npm run test:sim:unit

# Verify visual quality baseline
npm run test:sim:visual-quality

# Verify CSS doesn't break
npm run test:sim:browser

# Manual: open index.html → navigate to any sim → toggle dark/light → check grid color
# Manual: verify canvas is 760×440 and scales down on narrow viewport
```

## Success Criteria
- [x] W=760, H=440 in ALL 7 files — verified by script
- [x] `clearCanvas` uses `clearRect` (transparent canvas)
- [x] `drawArrow` uses `PI/7` arrowhead angle
- [x] `drawThemeGrid`, `drawDragHandle`, `drawTrail`, `drawAngleArc`, `drawDeCuongArrow`, `drawDashed` exported from SimRender
- [x] Canvas 760×440 renders correctly and scales responsive
- [x] Readout cards show color-coded values
- [x] KaTeX equation panel renders when provided
- [x] Contract scenes match manifest 58 IDs exactly (0 orphans)
- [x] 58/58 routes still mount without error after size change
- [x] Dark/light toggle changes grid + canvas background immediately

## Risk Assessment
- Risk: canvas size change breaks existing renderer coordinates. Mitigation: scale factor X≈1.357 Y≈1.294 — update all scene initialState coords in later phases
- Risk: clearCanvas change causes white flash. Mitigation: CSS `.sim-canvas-wrap { background: var(--bg) }` handles background
- Risk: contract scenes rewrite breaks tests. Mitigation: run full test suite immediately after rewrite
- Risk: KaTeX not available offline. Mitigation: KaTeX already has local fallback in index.html

## Security Considerations
N/A — offline file:// application, no external API calls, no user data transmission.

## Next Steps
After foundation passes → proceed parallel: CH1 (Phase 01), CH2 (Phase 06), CH3 (Phase 10).
