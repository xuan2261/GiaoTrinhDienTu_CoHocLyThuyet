# Debug Review Report - DeCuong Simulation Full Rebuild

Date: 2026-05-13

## Scope

- Plan: `plans/260512-0845-decuong-simulation-full-rebuild/plan.md`
- Target: 58 simulation routes sau rebuild.
- Method: `ck:debug` verification-first + project Playwright browser QA + `agent-browser` live browser check.
- Skill fallback: `browser-sub` không có trong catalog; dùng `ck:agent-browser`.

## Commands

| Gate | Result |
|---|---|
| `npm run test:sim:release` | PASS |
| `npm run test:sim:browser` | PASS, 163/163 |
| `npm run test:sim:visual-quality` | PASS, 4/4 |
| `npm run test:sim:browser:route-mount` | PASS, 59/59 by sub-agent |
| `python tools\smoke_simulation_routes.py --require-p1` | PASS, P1 58/58 |
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct` | PASS |
| `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup` | PASS |
| `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` | PASS |
| `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` | PASS |

## Coverage Confirmed

- Route mount: 58 manifest routes, CH1 25, CH2 15, CH3 18.
- Console/runtime crash: all 58 via `mass-conversion-audit`.
- Interaction all-route: sliders, buttons, handles, play state via `@control-audit`.
- Direct drag all-route: route-owned handles + stable readout after drag via `@direct-drag-audit`.
- Visual all-route: nonblank canvas, bounded ink, route-owned handles.
- Identity all-route: unique rendererId, behaviorId, scene structure.
- Theme/responsive all-route: dark/light contrast and horizontal overflow.
- Extra focused checks: keyboard, touch, reset, animation, semantic readouts.

## Live Browser Evidence

Static server: `http://127.0.0.1:8765/` during check only, stopped after verification.

Screenshots:

- `reports/debug-browser-check/ch1-2-3-live.png`
- `reports/debug-browser-check/ch2-5-2-live-sim.png`
- `reports/debug-browser-check/ch3-6-2-live-sim.png`

Manual live interaction:

- Route `ch1-2-3` mounted as `data-route-id="ch1-2-3"`.
- Canvas count: 1.
- Readout cards: 5.
- Slider `|F1|` keyboard nudge changed value `190 -> 195`.
- Readout changed with it: `|R| 353.9N`, `|F1| 195N`.

## Findings

Không phát hiện lỗi.

Không có route fail. Không có console/runtime fail. Không có renderer/behavior/scene mismatch. Không có visual blank/overflow failure theo gate hiện có.

## Notes

- Worktree dirty trước khi kiểm tra. Không revert thay đổi có sẵn.
- Tạo thêm thư mục evidence: `plans/260512-0845-decuong-simulation-full-rebuild/reports/debug-browser-check/`.
- Không sửa code runtime/test.

## Unresolved Questions

Không có.
