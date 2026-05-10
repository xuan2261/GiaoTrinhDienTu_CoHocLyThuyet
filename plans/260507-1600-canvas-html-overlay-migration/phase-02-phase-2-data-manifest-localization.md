---
phase: 2
title: "Phase 2: Full UI Localization Inventory"
status: completed
priority: P1
effort: "4h"
dependencies: ["phase-01-phase-1-architecture-ui-setup.md"]
---

# Phase 2: Full UI Localization Inventory

## Context Links
- [Plan review](./reports/260507-1627-debug-brainstorm-plan-review.md)
- [Design guidelines](../../docs/design-guidelines.md)
- [Code standards](../../docs/code-standards.md)

## Overview
- **Priority:** P1
- **Status:** Done
- **Goal:** Việt hóa 100% user-visible simulation UI before/alongside renderer migration.
- **Completion:** Localized assessment prompts/objectives, visible simulation UI terms, and all agreed glossary labels while preserving keys/contracts.
- **Validation:** `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2`, `npm run test:sim:quality:baseline`.

## Key Insights
- Manifest prompts are already mostly Vietnamese, but not enough.
- English remains in shell defaults, legends, readouts, scene catalogs, renderer literals, fallback diagnostics, and handle labels.
- User decision: terms like `handle`, `readout`, `mode` must be Vietnamese 100%.

## Requirements
- Functional: Translate all user-visible UI terms to Vietnamese across simulation runtime.
- Functional: Preserve code identifiers, route ids, keys, `rendererId`, `behaviorId`, `expectedRendererId`, and assessment semantics.
- Functional: Use a consistent glossary for repeated terms.
- Non-functional: Keep academic tone; concise labels that fit mobile controls.
- Non-functional: No generated file editing.

## Glossary
| English/UI Term | Vietnamese |
|---|---|
| handle | điểm điều khiển |
| readout | bảng thông số |
| mode | chế độ |
| drag | kéo |
| Vector | véc tơ |
| Route | mô phỏng |
| Simulation lab | phòng mô phỏng |
| Legacy scene | cảnh dự phòng |
| fallback | dự phòng |
| checkpoint | điểm kiểm tra |
| cursor | con trỏ |
| preset | mẫu thiết lập |
| timeline | dòng thời gian |
| force | lực |
| velocity | vận tốc |
| acceleration | gia tốc |
| restitution | hệ số phục hồi |
| momentum | động lượng |
| impulse | xung lượng |

## Architecture
- Treat localization as data/text cleanup, not behavior rewrite.
- Keep all route/assessment keys stable.
- Use `textContent` for runtime UI text.
- Renderer formulas are handled in Phases 3-4; this phase localizes shell/catalog text and validates no English UI terms remain.

## Related Code Files
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-rendering.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\*-scenes.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\*-scenes.js`
- Modify: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\*-scenes.js`
- Modify if needed: `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- Create: none for runtime source.
- Delete: none.

## Implementation Steps
1. Inventory text:
   - `rg -n "handle|readout|mode|drag|Vector|Route|Simulation lab|Legacy scene|fallback|Particle path|Newton|Static, sliding|Readout" js\sims js\sim-*.js tests`
2. Translate shell defaults in `sim-professional-lab.js` and `sim-lab-ui.js`.
3. Translate scene catalog titles/formulas/feedback/readouts/legends/control labels.
4. Translate manifest prompts/objectives where any English UI term remains.
5. Keep code-facing keys unchanged, including `mode` state key and assessment keys.
6. Update tests that assert English UI copy; assert Vietnamese UI copy instead.
7. Run syntax and simulation quality baseline.

## Todo List
- [x] Inventory complete.
- [x] Shell defaults translated.
- [x] Manifest prompts/objectives translated.
- [x] Scene catalog titles/formulas/readouts/legends translated.
- [x] Browser test expectations updated.
- [x] No English UI terms from glossary remain in rendered simulation UI.

## Success Criteria
- [x] `handle`, `readout`, `mode`, `drag`, `Vector`, `Route`, `Simulation lab`, and `Legacy scene` do not appear as user-visible English text.
- [x] `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2` passes.
- [x] `npm run test:sim:quality:baseline` passes.
- [x] No assessment key or route contract changed by translation.

## Risk Assessment
- Translating keys instead of labels breaks logic. Mitigation: only edit values shown to users; preserve object keys.
- Vietnamese labels overflow compact controls. Mitigation: short terms and existing wrap CSS.
- Tests expect old English text. Mitigation: update assertions intentionally.

## Security Considerations
- Use `textContent`, not `innerHTML`, for translated text.
- Keep translations in trusted source files.
- Do not introduce remote translation service dependency.

## Next Steps
- Phase 3 migrates Ch1 coordinate formulas to KaTeX overlay using localized text.
