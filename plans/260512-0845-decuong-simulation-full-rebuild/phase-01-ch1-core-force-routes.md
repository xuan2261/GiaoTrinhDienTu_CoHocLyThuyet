---
phase: 1
title: "CH1 Core Force Routes"
status: complete
priority: P1
effort: "16h"
dependencies: [0]
---

# Phase 01: CH1 Core Force Routes

## Overview
Rebuild 6 routes cơ bản về lực, mô men, ngẫu lực, liên kết theo chuẩn DeCuong visual. Đây là nhóm routes đầu tiên mà sinh viên gặp, ấn tượng đầu phải tốt.

## Route Matrix

| Route | Tên VN | Interaction Pattern | Key Visual |
|---|---|---|---|
| `ch1-1-3` | Véc tơ lực | Drag đầu véc tơ | Arrow + handle dot, `\|F\|`, `α` readout |
| `ch1-1-4` | Mô men | Drag cánh tay đòn | Moment arm line, arc, `M_O = F × d` KaTeX |
| `ch1-1-5` | Hệ lực | Drag nhiều véc tơ | Multiple arrows, resultant, equivalent moment |
| `ch1-1-6` | Ngẫu lực | Drag khoảng cách | Couple arrows, distance marker, `M = F × d` |
| `ch1-1-8` | Phản lực liên kết | Button tabs | Tab buttons chọn loại, reaction arrows |
| `ch1-2-1` | Cặp lực cân bằng | Drag 1 lực | 2 opposing arrows, auto-mirror |

## Related Code Files
- Modify: `js/sims/ch1/ch1-force-law-renderers.js`
- Modify: `js/sims/ch1/ch1-force-law-behaviors.js`
- Modify: `js/sims/ch1/ch1-force-law-scenes.js`

## Implementation Steps

### ch1-1-3: Véc tơ lực
1. Renderer: clear canvas → `drawThemeGrid(ctx, 760, 440, 30)` → draw force vector with `drawDeCuongArrow()` → `drawDragHandle()` at tail and tip
2. Readout: `|F| = xxx N`, `α = xx°`, `Điểm đặt: (x, y)`
3. KaTeX equation: `\vec{F} = F(\cos\alpha \cdot \vec{i} + \sin\alpha \cdot \vec{j})`
4. Trail: record last 20 tip positions, draw with `drawTrail()`
5. Hint: `💡 Kéo đầu mũi tên để thay đổi độ lớn và phương của lực.`

### ch1-1-4: Mô men
1. Renderer: draw fixed point O → draw force F arrow → draw moment arm (perpendicular) → draw moment arc with direction arrow
2. Readout: `F = xx N`, `d = xx m`, `M_O = xx N·m`
3. KaTeX: `M_O(\vec{F}) = \pm F \cdot d`
4. Trail: drag path of force application point
5. Hint: `💡 Kéo điểm đặt lực để thay đổi cánh tay đòn.`

### ch1-1-5: Hệ lực
1. Renderer: draw 3-4 force vectors from different points → draw resultant → draw equivalent moment
2. Readout: `R = xx N`, `M_O = xx N·m`, mode
3. KaTeX: `\vec{R} = \sum \vec{F}_i`, `M_O = \sum M_O(\vec{F}_i)`
4. Button tabs: "Thu gọn" / "Phân tích"

### ch1-1-6: Ngẫu lực
1. Renderer: draw 2 parallel opposite arrows → distance marker → moment arc
2. Drag: adjust distance between forces
3. KaTeX: `M = F \cdot d`

### ch1-1-8: Phản lực liên kết
1. Button tabs: Tựa | Dây | Bản lề | Gối | Ngàm
2. Each tab: different constraint diagram + reaction arrows
3. Readout: loại liên kết, bậc tự do bị hạn chế

### ch1-2-1: Cặp lực cân bằng
1. Renderer: 2 forces same line, opposite direction
2. Drag one → other mirrors
3. KaTeX: `\vec{F}_1 + \vec{F}_2 = \vec{0}`

## Todo List
- [x] Refactor ch1-1-3 renderer with DeCuong visual
- [x] Refactor ch1-1-4 renderer with moment arm + arc
- [x] Refactor ch1-1-5 renderer with force system
- [x] Refactor ch1-1-6 renderer with couple
- [x] Refactor ch1-1-8 renderer with tab buttons
- [x] Refactor ch1-2-1 renderer with equilibrium pair
- [x] Add KaTeX equations for each route
- [x] Add trail effect for each route
- [x] Update scene configs with new W=760, H=440 coordinates
- [x] Update behavior handle positions for new canvas size

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-1-3|ch1-1-4|ch1-1-5|ch1-1-6|ch1-1-8|ch1-2-1"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
# Manual: dark/light toggle on each route, check grid + handle + readout colors
# Manual: drag test on touch device or Chrome DevTools touch emulation
```

## Success Criteria
- [x] 6/6 routes render DeCuong-style: theme grid, handle dots, color readouts
- [x] KaTeX equations display correctly for each route
- [x] Trail visible on drag interaction
- [x] Instant reset returns to initial state
- [x] No English text leak in visible UI

## Verification Summary
- 2026-05-12: `npm run test:sim:unit` PASS.
- 2026-05-12: `npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-1-3 tail drag keeps"` PASS.
- 2026-05-12: `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@control-audit"` PASS, 13 tests.
- 2026-05-12: `python tools\audit_simulation_quality.py --all --max-js-lines 220` PASS; Ch1 force-law files stay <=220 lines.
- 2026-05-12: strict scene catalog and renderer contract for 6 Phase 01 routes PASS.
- 2026-05-12: `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"` PASS, 2 tests.
- 2026-05-12: runtime smoke with mount/listener/RAF cleanup PASS.
- 2026-05-12: `python tools\audit.py` PASS.

## Risk Assessment
- Risk: handle position coordinates broken by 760×440 change. Mitigation: scale factor = 760/560 ≈ 1.357 for x, 440/340 ≈ 1.294 for y — update all scene initialState coords
