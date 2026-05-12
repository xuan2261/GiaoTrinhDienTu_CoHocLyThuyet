# System Architecture

## Current Simulation Runtime

Runtime simulation hiện tại là static `HTML/CSS/JS`, chạy được bằng `file://`. Active path không dùng Matter.js/SVG V2; path đó chỉ còn là legacy/pilot reference nếu xuất hiện trong file cũ.

| Layer | File | Trách nhiệm |
|---|---|---|
| Shell | `js/sim-lab-ui.js` | Tạo `.sim-lab`, canvas, controls, readout cards, hint, reset/play-pause |
| Lifecycle/core | `js/sim-core.js` | Scope cleanup, canvas helpers, sliders/buttons, RAF/listener cleanup |
| Interaction | `js/sim-interactions.js` | Pointer/touch/keyboard handle layer, active handle metadata |
| Shared DeCuong rendering | `js/sim-rendering.js`, `js/sim-visual-helpers.js` | Theme-aware grid, drag handle dots, trails, PI/7 arrows, dashed guides, and readable panels |
| Scene data | `js/sim-scene-registry.js`, `js/sims/ch*/*-scenes.js` | Route-scoped scene catalog and deterministic signatures |
| Rendering | `js/sim-route-renderer-registry.js`, `js/sims/ch*/*-renderers.js` | Dedicated renderer per route; no family final dispatch |
| Behavior | `js/sim-route-behavior-registry.js`, `js/sims/ch*/*-behaviors.js` | Derived model ids, route-owned handles, interaction semantics |
| Lab orchestration | `js/sim-professional-lab.js` | Resolve scene/renderer/behavior, bind controls/handles, render readouts |
| Thin adapters | `js/sim-statics.js`, `js/sim-kinematics.js`, `js/sim-dynamics.js` | Chapter route adapters into `SimProfessionalLab.mount(routeId)` |
| Registry map | `js/sims/ch*/*-routes.js`, `js/simulations.js` | Build `window.SIM_MAP` for 58 canonical P1 routes |

## Load Flow

1. `index.html` loads shared simulation foundation modules.
2. `index.html` loads `js/sims/ch*/` scene, renderer, behavior, and route modules.
3. `js/simulations.js` builds `window.SIM_MAP` from chapter registries.
4. `js/loader.js` resolves the page id, injects the fragment, then calls the matching simulation route.
5. The thin adapter calls `SimProfessionalLab.mount(routeId)`.
6. The lab resolves route scene + renderer + behavior, creates `.sim-lab`, binds sliders/buttons/handles, and draws canvas/readout state.
7. On route change, `loader.js` disposes the active simulation before replacing content.

## Runtime Contract

- Canonical route count: 58 P1 routes.
- Ch1 active route count: 25.
- Canvas logical size: 760×440; responsive CSS scales visually without changing simulation coordinates.
- Canvas clear path is transparent `clearRect()`, with `.sim-canvas-wrap` owning theme background.
- Each route must have a unique renderer id, behavior id, named renderer function, and scene signature.
- Route-owned handles must expose meaningful ids/labels through `data-handle-ids`; fallback `legacy-primary` is not acceptable for active routes.
- Readouts use `.sim-readout-card` and semantic `data-readout-kind` values.
- Route scenes may provide explicit readout item `kind` metadata or set `appendGenericReadouts: false` when their physics model owns all displayed values.
- Drag handlers must update canonical state, sliders, inline control values, readout cards, and overlays from the same clamped model state.
- DeCuong CH1 route rebuilds must keep direct geometry and readouts coupled: `ch1-2-3` uses F1/F2 endpoint state for canvas, `|F₁|`, `|F₂|`, `|R|`, and `α`; support routes use alpha/handle state to redraw normal/tension geometry.
- `SimProfessionalLab.mount(routeId)` must return an idempotent disposer and clean route-scoped listeners/RAF on route change or mount rollback.
- No runtime bundler is required; `package.json` is dev-only QA.

## Legacy/Pilot Policy

- `js/routes/ch1/*`, `js/routes/ch2/*`, and `js/routes/ch3/*` are not the active source for canonical routes.
- `js/routes/pilot-ch1-parallelogram.js` is reference-only and must not self-register into `window.SIM_MAP`.
- Do not revive Matter.js/SVG V2 route files unless a new plan explicitly promotes them through the current registry/test contracts.

## QA Gates

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
```

## Persistence Layer

| Key | Module | Nội dung |
|---|---|---|
| `theme` | `js/app.js` | Sáng/tối |
| `fontZoom` | `js/app.js` | Mức zoom chữ |
| `readPages` | `js/app.js` | Trang đã đọc |
| `quizScores` | `js/quiz.js` | Score quiz |
| `chlyt_progress` | `js/progress.js` | Visit/read state |
| `chlyt_bookmarks` | `js/progress.js` | Bookmark |
| `chlyt_notes` | `js/notes.js` | Highlight và note |
| `chlyt_activity_progress_v1` | `js/sim-activities.js` | Micro-checker progress |
