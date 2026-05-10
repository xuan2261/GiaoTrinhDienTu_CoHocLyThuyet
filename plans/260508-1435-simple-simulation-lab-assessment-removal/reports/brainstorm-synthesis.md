---
title: "Brainstorm Synthesis - Simple Simulation Lab"
type: brainstorm-synthesis
created: 2026-05-08
---

# Brainstorm Synthesis

## User Decisions

| Decision | Final |
|---|---|
| Scope | 58 mô phỏng hiện có |
| Checkpoints | Xóa hẳn assessment/storage/test gate |
| Approach | Hướng 2: giữ engine hiện tại, làm lại shell đơn giản kiểu `DeCuong_CoHocLyThuyet.html` |
| Interaction visual | Không giữ marker kéo tròn/điểm đặt kéo generic trên canvas |

## Evaluated Approaches

| Approach | Verdict | Reason |
|---|---|---|
| Hide checkpoint bằng CSS | Reject | Nhanh nhưng không xóa runtime/storage/test gate. Debt còn nguyên. |
| Simple lab shell over current engine | Accept | KISS/DRY. Giữ 58 renderer/behavior/physics, giảm UI noise, xóa assessment sạch. |
| Rewrite all simulations inline like DeCuong | Reject | Duplicate logic lớn, phá registry/QA, khó maintain. |

## UX Target

Reference from DeCuong:
- Header ngắn: title + badge + reset/play controls.
- Canvas là trung tâm.
- Readout cards 2-4 chỉ số chính.
- Hint/công thức một dòng, không panel nặng.
- Tương tác trực tiếp giữ lại khi hit target ẩn hoặc gắn vào vật/véc tơ thật.
- Nếu còn drag thì hit target ẩn hoặc gắn vào vật/véc tơ thật, không vẽ thêm chấm tròn.
- No checkpoint, no progress, no assessment feedback.

## Architecture Target

Keep:
- `SimRegistry`, `SIM_MAP`.
- `SimProfessionalLab.mount(routeId)`.
- 58 route renderers and 58 behavior contracts.
- Scene catalogs, primitives, physics helpers, animation helpers.
- Route identity and visual quality gates.

Remove:
- `SimAssessment` runtime load.
- `chlyt_sim_assessment_v2` reads/writes.
- `.sim-checkpoint-panel`.
- `checkpoints` metadata and checkpoint button UI.
- QA flags/tests requiring assessment.
- visible generic `drawHandle`/round drag marker layer.
- visible generic handle copy like `điểm kéo`/`điểm điều khiển`.

Transform:
- `sim-route-manifest.js` becomes lightweight route metadata: objective, interaction, renderer/behavior links.
- `sim-lab-ui.js` becomes simple shell: scene, controls, readout cards, hint/formula.
- `sim-professional-lab.js` emits structured readout items, not one dense sentence.
- `sim-professional-lab.js` keeps interaction diagnostics/hit targets without drawing generic markers by default.

## Success Metrics

| Metric | Target |
|---|---|
| Runtime routes | 58/58 mount |
| Assessment UI | 0 visible `Điểm kiểm tra`, 0 `.sim-checkpoint-panel` |
| Storage | 0 runtime access to `chlyt_sim_assessment_v2` |
| Shell UX | readout cards visible, controls usable, canvas nonblank |
| Clean interaction | 0 visible generic circular handle markers or `điểm kéo` text |
| Animation | animated routes support pause/resume/reset and stay physically bounded |
| Offline | `file://` route-mount pass |
| QA | release gate updated and pass without assessment |

## Unresolved Questions

- None.
