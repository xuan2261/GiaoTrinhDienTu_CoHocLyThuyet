---
title: "Scout Report - Simple Simulation Lab Assessment Removal"
type: scout-report
created: 2026-05-08
---

# Scout Report

## Summary

Scout từ `README.md`, docs, `DeCuong_CoHocLyThuyet.html`, runtime `js/`, `tests/`, `tools/`.

Kết quả chính:
- `DeCuong_CoHocLyThuyet.html` có 3 mô phỏng canvas inline: hình bình hành lực, dầm phản lực, chất điểm.
- App hiện tại có 58 simulation routes trong `SIM_MAP` và manifest.
- Coverage matrix có 78 routes, nhưng P1 hiện cover 58/58. Scope user chốt: chỉ 58 hiện có.
- Assessment/checkpoint đang dính vào runtime, storage, manifest, Playwright, QA scripts, docs.
- Visible generic drag handles đang đi qua `sim-professional-lab.js` -> `drawRouteHandles()` -> `SimRender.drawHandle()`, tạo vòng hit/marker tròn và label.

## Evidence

| Evidence | Finding |
|---|---|
| `python tools\smoke_simulation_routes.py --require-p1` | `SIM_MAP routes: 58`, `P1 covered: 58/58`, PASS |
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2` | Manifest 58 routes, objectives/direct/checkpoints PASS |
| `DeCuong_CoHocLyThuyet.html` search | 3 `.sim-container`, 3 `<canvas>`, 97 pages |
| `js/sim-lab-ui.js` | Creates formula/status/feedback/checkpoint panels and calls `SimAssessment.createAssessmentPanel` |
| `js/sim-assessment.js` | Owns `chlyt_sim_assessment_v2`, checkpoint checks, panel UI |
| `package.json` | `test:sim:quality` requires `--require-assessment`; `test:sim:release` includes assessment-era gates |
| `tests/simulation-browser.spec.js` | Expects `.sim-checkpoint-panel`; has assessment positive/precondition tests |
| `js/sim-rendering.js` | `drawHandle()` vẽ hit circle + marker tròn + label |
| `tests/simulation-visual-quality.spec.js` | Reads `data-handle-ids`/interaction diagnostics and legacy drag metrics |

## Relevant Files

| File | Role |
|---|---|
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\DeCuong_CoHocLyThuyet.html` | UX reference: simple canvas + readout cards + reset/play |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js` | Shell scaffold to simplify |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` | Mount, readout, objective/hint, renderer/behavior bridge |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-rendering.js` | Shared `drawHandle` helper; must not render generic handles by default after cleanup |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Convert from checkpoint manifest to lightweight route metadata |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-assessment.js` | Remove from runtime, then delete if no references remain |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` | Simulation shell CSS |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` | Script load order, remove `sim-assessment.js` |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` | Update shell/assertions, remove assessment tests |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js` | Update UI assumptions if needed |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_manifest.py` | Replace checkpoint gate with metadata gate |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\audit_simulation_quality.py` | Remove/replace `--require-assessment` |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_runtime.py` | Remove malformed assessment storage expectation |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json` | Update QA commands |
| `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\*.md` | Sync architecture, standards, roadmap, changelog |

## Constraints

- Offline-first, must run by `file://`.
- No runtime bundler/framework.
- Keep 58 renderer/behavior contracts.
- Keep interaction where useful, but hide/remove generic canvas marker layer.
- Do not edit generated `js/pages.js` by hand.
- Keep JS files under codebase line-size policy where practical.
- No assessment storage reads/writes after completion.

## Unresolved Questions

- None. User confirmed scope and removal depth.
