# Project Changelog

## 2026-05-13

### Fixed
- Removed motion trail rendering and route-owned trail state from active simulations so direct drag redraws only the current object/vector state.
- Removed the unused legacy CH2 particle draft renderer module from runtime script order and source tree; canonical CH2 particle route renderers remain in `ch2-trajectory-graph-renderers.js`.
- Narrowed CH3 theorem/collision behavior reset state so work-energy and theorem routes do not seed collision balls or center-of-mass masses they do not use.
- Narrowed CH3 scene initial states so runtime reset restores only route-relevant center-of-mass or collision state.

### Added
- TDD regression coverage in `tests/simulation-runtime-regressions.test.js` to block `drawTrail` helpers/calls and route-owned trail state from returning.
- Regression coverage for CH2 dead renderer removal and CH3 route-specific reset profiles in `tests/phase-09-12-tdd.test.js`.

### Verified
- `node tests/simulation-runtime-regressions.test.js` PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` PASS.
- `npx playwright test "tests/simulation-interaction-engine.spec.js" --grep "tail drag"` PASS.
- `npm run test:sim:visual-quality` PASS.
- `npm run test:sim:unit` PASS.
- `npm run test:sim:quality` PASS.
- `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` PASS.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup` PASS.

## 2026-05-12

### Changed
- DeCuong full rebuild Phase 00 foundation complete: active simulation canvas baseline is now 760×440, transparent canvas background is reset through the CSS theme, shared arrows use `Math.PI / 7`, and `sim-rendering.js` exposes DeCuong helpers for grid, handles, trail, angle arc, arrows, and dashed guides.
- DeCuong full rebuild Phase 01 complete: 6 CH1 core force routes (`ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`) now use rebuilt 760×440 scenes with DeCuong grid/handles/trails, KaTeX/DOM overlays, and route-specific readouts.
- DeCuong full rebuild Phase 02 complete: `ch1-2-3`, `ch1-2-6`, `ch1-3-1`, and `ch1-3-2` now use rebuilt DeCuong-style parallelogram, FBD, support normal, and cable tension visuals with route-owned handles, trails, KaTeX overlays, and synchronized controls/readouts.
- DeCuong full rebuild Phase 03 complete: `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, and `ch1-4-4` now use rebuilt DeCuong-style support/spatial visuals, beam reactions, pseudo-3D axes, route-owned handles, trails, KaTeX overlays, and synchronized controls/readouts.
- DeCuong full rebuild Phase 04 complete: `ch1-5-1` through `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, and `ch1-7-2` now use DeCuong-style friction, centroid, and solver visuals with route-owned handles, trails, KaTeX overlays, synchronized controls/readouts, and Phase 04 semantic regression coverage.
- DeCuong full rebuild Phase 05 complete: CH1 is release-ready with 25/25 routes passing static, runtime, semantic, browser, visual-quality, quality, and content audit gates.
- DeCuong full rebuild Phase 06 complete: CH2 particle routes `ch2-1-1` to `ch2-1-4` now use DeCuong-style particle trajectory, graph cursor, natural-coordinate, and motion-preset visuals with 30-point trails, KaTeX overlays, route-owned handles, synchronized controls/readouts, and frame-rate independent animation.
- DeCuong full rebuild Phase 08 complete: `ch2-4-1` to `ch2-4-4` and `ch2-5-1` to `ch2-5-3` now use rebuilt relative-motion and plane/instant-center visuals with velocity-composition triangles, absolute/transport/relative vectors, Coriolis vector invariant `2*omega*|vr|`, plane-body `vB = vA + omega x AB`, instant-center velocity distribution, KaTeX equations, trails, and route-owned handles/readouts.
- DeCuong full rebuild Phase 09 complete: `ch2-7-1` and `ch2-7-2` exercise/checker routes now keep solver steps bounded to 3 panels and verify canonical `x(t)`, `v(t)`, `a(t)` with consistent `omega` derivatives.
- DeCuong full rebuild Phase 10 complete: CH3 Newton/ODE routes `ch3-1-2` to `ch3-4-2` pass strict scene/renderer gates; spring routes now open with meaningful energy state and record coupled trajectories deterministically.
- DeCuong full rebuild Phase 11 complete: CH3 theorem/collision routes `ch3-5-1` to `ch3-6-3` pass strict gates and browser interaction checks; collision solver behavior is locked by signed momentum conservation TDD.
- DeCuong full rebuild Phase 12 complete: CH3 exercise/checker routes `ch3-7-1` and `ch3-7-2` are included in the final 58-route release gate, with zero-residual checker state locked to score 100.
- Final code-review fixes landed for the DeCuong rebuild: `ch2-1-3` now treats `rho` as the canonical radius slider, `ch2-5-3` uses `L` as the canonical endpoint geometry and `vBMag` slider, `ch2-7-2` keeps valid `x0=0` during direct drag, and CH2 checker visible labels are localized.
- Professional lab mount lifecycle is now scoped/idempotent: route mounts return `{ dispose }`, clean resize and `sim:katex-ready` listeners, and dispose on mount failure.
- Professional lab control sync now preserves valid zero angles, supports explicit readout item kinds, allows route scenes to suppress generic readouts, and keeps finite slider display values synchronized without creating absent state keys.
- `npm run test:sim:release` now includes `test:sim:quality`, so the canonical release gate catches active simulation line-count regressions before browser/visual release checks.
- Contract scene, renderer, and behavior route sets are aligned to the manifest 58 IDs, including `zz-simulation-contract-*` modules.
- Ch1 DeCuong interaction upgrade: 25/25 Ch1 routes now expose physical route-owned handle labels (`F`, `F2`, `N`, `T`, `R`, `M`, `P`, `G`, `α`) instead of generic `điểm` construction handles.
- QA tools now honor route prefix filters for chapter-scoped gates: `smoke_simulation_manifest.py`, `smoke_simulation_scene_catalog.py`, and `audit_simulation_quality.py`.
- `js/routes/pilot-ch1-parallelogram.js` is reference-only and no longer self-registers `window.SIM_MAP`.
- `ch1-2-3` parallelogram law now derives `|R|` readout from the same geometry used by the canvas overlay, so dragging `F2` cannot show conflicting resultant values.
- `audit_v2_disposal.js` now uses CDP heap metrics, self-starts its static server, and fails non-zero when heap growth exceeds the release threshold.
- Docs synced to current `.sim-lab` canvas + registry architecture; stale Matter.js/SVG V2 wording scoped as legacy/historical.

### Fixed
- Fixed post-cook quality gate regression: `js/sims/ch2/ch2-kinematics-behaviors-b.js` is back at the 220-line active-source limit.
- Fixed post-review DeCuong regressions: CH2 exercise renderers now preserve visible `x=0`, CH3 collision solver preserves valid zero `v1`/`v2`/`e` values, remaining CH3 visible checker/collision English labels are localized, and blank `ch1-7-1` Phase 05 screenshots were regenerated from runtime.

### Added
- KaTeX equation panel styling and runtime fallback for simulation equations; late KaTeX load can rerender fallback math instead of caching plain text permanently.
- Regression coverage for professional-lab disposer/listener cleanup and 58-ID contract alignment.
- Ch1 route baseline matrix and representative screenshots under `plans/260512-0544-ch1-decuong-interaction-upgrade/reports/`.
- Playwright regression requiring Ch1 handles to avoid legacy/generic labels.
- Playwright regression locking `ch1-2-3` readout/overlay resultant consistency after direct `F2` drag.
- Playwright regression locking `ch1-1-3` force-tail drag so `|F|`/`α` readouts, sliders, and inline displays remain synchronized at canvas boundaries.
- Playwright regressions locking `ch1-2-3` F1 drag slider/readout sync and support-route alpha controls changing real canvas geometry.
- Playwright regressions locking direct-drag state updates for all 7 Phase 03 support/spatial routes.
- Playwright regressions locking Phase 04 `ch1-5-1` friction readout drag, `ch1-6-2` centroid G drag, and `ch1-5-4` self-locking readout/overlay plus wedge-base geometry.
- Unit regression for disposal audit leak-threshold and unavailable-metric branches.
- Phase 05 screenshot evidence for all 25 CH1 routes in light and dark themes under `plans/260512-0845-decuong-simulation-full-rebuild/reports/phase-05-screenshots/`.
- Phase 06 CH2 particle trajectory review hardening: `ch2-1-4` drag syncs full trajectory state, preset preview panels use bounded mini trajectories, graph `x/v/a` derivatives are consistent, and initial `a_n` readouts are seeded.
- Phase 08 TDD coverage added in `tests/phase-08-tdd.test.js` and wired into `npm run test:sim:unit`.
- Phase 09-12 TDD coverage added in `tests/phase-09-12-tdd.test.js` and wired into `npm run test:sim:unit`.
- Phase 09-12 regression coverage now locks zero-value collision inputs, visible zero-value checker output, and localized checker/collision labels.

### Verified
- DeCuong Phase 00 gates PASS: unit, browser, visual-quality, renderer contract, runtime lifecycle, manifest, scene catalog, quality audit, and content audit.
- `npm run test:sim:browser` PASS: 150 tests.
- `npm run test:sim:visual-quality` PASS: 4 tests.
- `npm run test:sim:unit` PASS.
- `python tools\test_simulation_qa_tools.py` PASS: 14 tests.
- Ch1 manifest, scene catalog, renderer contract, runtime, quality, interaction, and mass-mount gates PASS.
- `npm run test:sim:release` PASS after code-review fixes; browser suite now has 150 tests.
- `npm run test:sim:quality`, `npm run test:sim:semantic`, and `git diff --check` PASS.
- Final review fixes revalidated: `npm run test:sim:release` PASS, focused tester re-validation PASS, reviewer re-review no blockers.
- Phase 01 final gates PASS: `npm run test:sim:unit`, targeted `ch1-1-3` tail-drag regression, full `@direct-drag|@control-audit`, strict 6-route scene catalog, strict 6-route renderer contract, `@visual-all|@theme-all`, runtime smoke, `audit_simulation_quality.py --all --max-js-lines 220`, and `python tools\audit.py`.
- Phase 02 final gates PASS: `npm run test:sim:unit`, strict 4-route scene catalog, strict 4-route renderer contract, `audit_simulation_quality.py --all --max-js-lines 220`, targeted `ch1-2-3|ch1-2-6|ch1-3` interaction suite, and `@visual-all|@theme-all`.
- Phase 03 final gates PASS: `npm run test:sim:unit`, strict 7-route scene catalog, targeted renderer contract, targeted `ch1-3|ch1-4` interaction suite (10 tests), all-route `@control-audit|@direct-drag-audit`, `@visual-all|@theme-all`, runtime/manifest/route smokes, quality audit, and code re-review.
- Phase 04 final gates PASS: `npm run test:sim:unit`, strict 8-route manifest/scene/renderer gates, runtime smoke, all-route `@direct-drag-audit`, Phase 04 semantic interaction regressions, `@visual-all|@theme-all|@renderer-contract|@scene-identity`, tester re-validation, and code re-review.
- Phase 05 final gates PASS: `python tools\smoke_simulation_routes.py --require-p1`, CH1 manifest/scene/renderer strict gates, CH1 runtime smoke, `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:browser` (163 tests), `npm run test:sim:visual-quality` (4 tests), and `python tools\audit.py`.
- Phase 06 final gates PASS: `npm run test:sim:unit`, strict 4-route scene catalog, strict 4-route renderer contract, `audit_simulation_quality.py --all --max-js-lines 220`, targeted `ch2-1` interaction/animation/direct-drag suite, visual-quality `@visual-all|@theme-all`, manifest smoke, `npm run test:sim:browser` (163 tests), and `python tools\audit.py`.
- Phase 08 final gates PASS: `npm run test:sim:unit`, strict `ch2-4/ch2-5` scene catalog, strict `ch2-4/ch2-5` renderer contract, runtime smoke, route smoke, `audit_simulation_quality`, all-route direct-drag/control audit, `npm run test:sim:browser` (163 tests), `npm run test:sim:visual-quality` (4 tests), `python tools\audit.py`, and independent tester re-validation.
- Phase 09-12 final gates PASS: CH2 15-route manifest/scene/renderer/runtime smokes, CH3 Phase 10 strict 10-route scene/renderer gates, CH3 Phase 11 strict 6-route scene/renderer gates, `npm run test:sim:unit`, focused CH3 interaction/animation checks, `npm run test:sim:browser` (163 tests), and `npm run test:sim:visual-quality` (4 tests).
- DeCuong full rebuild final release PASS: `python tools\smoke_simulation_routes.py --require-p1`, 58-route manifest/scene/renderer/runtime smokes, `npm run test:sim:release`, disposal audit, content audit, strict equation audit, and strict KaTeX equation mapping validation.
- Post-cook review/debug PASS: `npm run test:sim:quality`, `npm run test:sim:unit`, runtime smoke, and updated `npm run test:sim:release` all pass after the line-count fix.
- Post-review DeCuong fixes PASS: `npm run test:sim:unit` and `npm run test:sim:release`.

## 2026-05-11

### Changed
- Tightened simulation browser QA scripts:
  - `test:sim:browser` now runs mass mount, shell/browser, and interaction/control suites instead of only the minimal mass audit.
  - `test:sim:browser:route-mount` now targets the canonical `@route-mount` suite.
  - `test:sim:release` now includes `test:sim:visual-quality`.
- Improved weak-control routes found during full control audit:
- `ch2-1-4` now exposes a dedicated motion-state slider in addition to motion mode buttons.
  - `ch3-7-2` now exposes a `Độ nhiễu` slider and direct handle that scale residuals in the numeric dynamics checker.
- Refresh shared DeCuong-style simulation UX across 58 P1 routes:
- The shared professional lab shell now draws the route-owned drag handle layer after each renderer pass, so all simulations expose visible direct-manipulation targets.
  - Shared lab status now reflects hover/drag handle state, and the shell renders a compact handle legend from route descriptors.
  - Readout cards now emphasize values with semantic colors matching force/velocity/acceleration/result/angle/energy metadata and expose active slider/time values so controls always give visible feedback.
  - Slider factories now set `step` before `value`, preventing browser range rounding from desynchronizing UI value and simulation state.
  - `audit_simulation_quality.py` now scans active simulation runtime sources instead of dormant `js/routes/**` experiments.

### Added
- Browser regression `@control-audit` checks every slider, segmented button, route-owned handle, and play animation state across all 58 routes.
- Targeted regression locks `ch3-7-2` residual scale so readout and overlay agree at `Độ nhiễu = 0` and high-noise states.

### Verified
- `npm run test:sim:browser` pass: 148/148 tests.
- `npm run test:sim:visual-quality` pass: 4/4 tests.
- `python tools\smoke_simulation_runtime.py ... --check-mount-rollback --check-listener-cleanup` pass.
- Focused probe confirmed `ch2-1-4` and `ch3-7-2` each expose 2 sliders after the control patch.
- `@control-audit` passed across 58/58 routes with no control failures.

## 2026-05-10

### Added
- **Simulation V2 Architecture**: Triển khai kiến trúc simulation mới dựa trên **Headless Matter.js + SVG/DOM Sync**.
  - **js/sim-engine-v2.js**: Engine lõi quản lý vật lý qua Matter.js và đồng bộ trạng thái sang SVG/DOM.
  - **js/sim-ui-v2.js**: Hệ thống UI chuẩn hóa (sliders, buttons) và tích hợp **Chart.js** cho đồ thị thời gian thực.
  - Hỗ trợ `flipY` và `originOffset` trong coordinate transformation để phù hợp với quy ước cơ học lý thuyết.

### Changed
- **Major Architectural Shift**: Thay thế toàn bộ hệ thống custom physics engine (5-layer design) bằng Matter.js để tăng độ ổn định và chính xác trong tính toán vật lý.
- **SVG-based Rendering**: Chuyển từ vẽ trực tiếp lên Canvas sang thao tác thuộc tính `transform` của SVG elements, giúp cải thiện styling qua CSS và khả năng truy cập.
- **Registry Update**: Cập nhật `js/simulations.js` để khởi tạo các simulation theo chuẩn V2.

### Removed
- Di chuyển các file engine cũ (`js/physics/`, `js/scene/`, `js/render/`, v.v.) vào thư mục `js/deprecated/` để làm sạch codebase chính.
- Loại bỏ các logic rendering Canvas thủ công phức tạp trong các route cũ.

### Verified
- Toàn bộ 80 simulation routes (standalone modules) đã được chuyển đổi sang V2 và kiểm thử thành công.
- `npm run test:sim:release` PASS trên kiến trúc mới cho toàn bộ 80 routes.
- Các legacy bundles và engine cũ đã được dọn dẹp và di chuyển vào `js/deprecated/`.

## 2026-05-10 (Legacy Architecture)

### Changed
- **Hoàn tất Route-Specific Simulation Rebuild (Plan 260510)**: Toàn bộ 58 routes đã được tinh chỉnh với renderer và behavior contract riêng biệt, đạt 100% kế hoạch rebuild.
  - **Shared Visual Primitives**: Tích hợp hệ thống primitives hình ảnh mới (grid background, vector helpers, rotated beams, supports, graph/bar helpers) vào `js/sim-route-renderer-primitives.js`.
  - **Ch1 Polish**: Cập nhật 25/25 route Tĩnh học với ký hiệu lực, liên kết, ma sát và centroid chuyên nghiệp.
  - **Ch2 Polish**: Cập nhật 15/15 route Động học với đồ thị chuyển động, cơ cấu truyền động và tâm vận tốc tức thời, ổn định hóa direct-drag readout.
  - **Ch3 Polish**: Cập nhật 18/18 route Động lực học với biểu đồ năng lượng, va chạm và hệ phương trình vi phân, tối ưu hóa tương tác trực tiếp.
  - **Interaction Hardening**: Đảm bảo mọi route có direct manipulation ổn định, readout cập nhật ngay lập tức và không bị trôi khi pause.

### Verified
- `npm run test:sim:release` PASS 100%.
- Toàn bộ 58/58 route P1 vượt qua các bài test về visual quality và interaction engine.
- Browser sync QA xác nhận giao diện tương tác và hiển thị KaTeX overlay đạt chuẩn DeCuong trên mọi thiết bị.

## 2026-05-09

### Changed
- Hoàn tất shared-first DeCuong simulation UX sweep trên toàn bộ 58 routes: `.sim-lab` dùng chapter accent tokens, touch controls đạt 44px trên mobile, readout cards có `data-readout-kind` để accent theo ngữ nghĩa, formula và hint giữ left accent theo chapter, shell có `role="region"`, route `aria-label`, status `aria-live`, canvas `aria-describedby`, hint text lấy từ route handles, và segmented controls ghi `aria-pressed` cùng control metadata.

### Fixed
- Rewired simulation runtime to the canonical 58 P1 route set: `index.html` now loads active `js/sims/ch*/` scene, renderer, behavior, and route modules plus `sim-statics.js`, `sim-kinematics.js`, and `sim-dynamics.js`.
- Removed stale simulation route aliases in `loader.js` so pages such as `ch1-1-5`, `ch1-7-2`, and `ch2-4-4` mount their exact route simulations.
- Updated `sim-route-manifest.js` to match the P1 coverage matrix 58/58 and changed `simulations.js` so registry-backed routes take precedence over legacy property assignments.
- Updated `tools/smoke_simulation_routes.py` to parse route modules from `index.html` script order, so static route smoke matches browser runtime wiring.
- Fixed `ch2-1-1` clipped edge ink by adding a frame edge guard in the legacy renderer retained for compatibility.
- Hardened the simple simulation UX shell: `.sim-lab` CSS selectors are scoped, mobile formula overlays wrap instead of overflowing, active handle metadata is exposed through `data-active-handle-id`, and `SimLabUI.createLab()` guards fake DOM `setAttribute`.
- Restored immediate derived energy updates for `ch3-3-1` so direct drag recomputes `T/V` from current `x/v/k/m` instead of waiting for a stale snapshot.
- Browser regression coverage now checks representative direct-drag readout changes, active-handle metadata, theme shell behavior, and canonical P1 route discovery for renderer-contract smoke.
- Hardened post-plan simulation control UX across 58 routes: animated routes open paused, direct drag auto-pauses running animation, active/hover handles redraw visibly, canvas drag disables native touch gestures, and Ch3 readouts now derive from current drag state instead of animation tick snapshots.
- Added all-58-route Playwright direct-drag audit so first handle drag must update readout and remain stable without pressing Play.
- Rebuilt simulation QA into focused current-runtime suites: removed obsolete phase/v2 Playwright specs, kept manifest-based route discovery, and moved active checks into browser, interaction, visual-quality, physics, and runtime regression tests.
- Fixed keyboard nudge redraw by focusing the registered interaction wrapper handle in `sim-professional-lab.js`; changed Ch3 KaTeX overlay strings to math-safe labels so route mount has no KaTeX warnings.

### Verified
- `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:visual-quality`, `npm run test:sim:browser`, và runtime smoke PASS cho sweep này.
- `npm run test:sim:release` PASS.
- `python tools\smoke_simulation_routes.py --require-p1` PASS: P1 covered 58/58.
- `npm run test:sim:browser` PASS inside release: 87 passed, 0 skipped.
- `npm run test:sim:visual-quality` PASS: 4 passed, 0 skipped.
- `npx playwright test tests/simulation-browser.spec.js tests/simulation-interaction-engine.spec.js --list` reports 87 tests in 2 files.
- `npx playwright test tests/simulation-visual-quality.spec.js --list` reports 4 tests in 1 file.
- `npm run test:sim:renderer-contract` PASS.

## 2026-05-08

### Changed
- **Simple Simulation Lab Shell Refactor (Plan 260508)**: Loại bỏ assessment runtime, chuyển sang simple DOM shell cho 58 routes.
  - **Xóa**: `js/sim-assessment.js` (293 lines), `chlyt_sim_assessment_v2` localStorage, checkpoint panel/feedback panel.
  - **Simple shell**: `js/sim-lab-ui.js` giờ tạo `.sim-header` + `.sim-readout-grid` + `.sim-lab-hint` thay vì multi-panel professional shell.
  - **Readout cards**: `sim-professional-lab.js` thêm shared readout helpers — readout text → structured cards (label/value/unit).
  - **Reset/Play-Pause**: Thêm `lab.reset()`, `lab.pause()`, `lab.resume()`, `lab.isPlaying` cho animated routes.
  - **Manifest stripped**: `js/sim-route-manifest.js` giờ chỉ chứa `objective` + `interaction` cho 58 routes, không còn checkpoints/assessment.
  - **CSS cleaned**: `.sim-feedback-panel`, `.sim-checkpoint-panel`, `.sim-lab-panels` CSS removed; readout cards CSS added.
  - **QA gates rewritten**: Python tools và Playwright tests loại bỏ tất cả `--require-assessment`, `--require-checkpoints-min`, `--malformed-assessment-storage`; test manifest đã cập nhật.
  - **Docs synced**: README, code-standards, design-guidelines, system-architecture, codebase-summary, roadmap đều cập nhật mô tả simple shell.
- **Simulation Visual Overhaul (Plan 260508)**: Hoàn tất nâng cấp toàn diện visual lab cho 58 routes.
  - Hạ tầng: Thêm `emitCollisionSparks`, `emitEnergyBurst`, `drawGlassBar` vào `js/sim-visual-helpers.js`.
  - Chapter 2: Thêm `realisticWheel` vào primitives và nâng cấp renderer `ch2-3-2` chuyên nghiệp hơn.
  - Chapter 3: Nâng cấp renderer `ch3-5-4` với thanh năng lượng glassmorphism và tích hợp hiệu ứng tia lửa va chạm vào behavior của Ch3.
  - QA: Đạt 83/83 bài test Playwright vượt qua trên toàn bộ 58 routes.
- Added `test:sim:visual-quality` and wired it into `test:sim:release`; visual-quality suite now checks 58-route discovery, no registry overwrite warnings, bounded canvas metrics, known clipped route edge ink, no detached default handle/readout, and route-owned Ch2/Ch3 drag state.
- Phase 5 integration: split 7 oversized JS files (>220 lines) into 14 properly-sized files. Files split: ch2-kinematics-behaviors.js (233L→104L+125L), ch2-relative-ic-renderers.js (346L→101L+92L), ch3-dynamics-all-18-behaviors.js (444L→173L+163L), ch3-ode-renderers.js (345L→121L+144L), ch3-theorem-collision-renderers.js (292L→136L+123L), ch2-trajectory-graph-renderers.js (221L→220L trimmed), sim-route-renderer-primitives.js (227L→216L trimmed). Updated `index.html` script load order for all new split files.
- Synced rich animated full-physics plan docs: Phase 01-04/06 now reflect completed implementation, and QA summary added under `plans/260507-1846-rich-animated-full-physics-58-routes/reports/`.
- Updated `test:sim:unit` to recursively syntax-check current `js/**/*.js` files instead of hardcoding split route module names.
- Updated renderer contract smoke discovery to include split route files matching `*-scenes*.js`, `*-renderers*.js`, and `*-behaviors*.js`.
- Added runtime regressions for actual primitive arrow drawing, animation tick wiring, renderer contract runtime script order, and browser canvas animation progression.
- Added hardening regressions for simple simulation lab direct readouts: paused `ch2-1-1` preset redraw, `ch2-1-2` graph cursor `x(t)`/`v(t)`, `ch3-5-3` angular momentum reset, and `ch3-6-2` collision diagonal/vertical drag plus reset.

### Fixed
- Post-plan simple simulation lab debug: `SimLabUI.createLab()` no longer assumes DOM `querySelector` / `Element.remove`, so runtime fake-DOM smoke and browser DOM both remove the legacy header safely.
- Restored interaction correctness found after Plan 260508 verification: `ch2-1-1` trajectory preset readout redraws, `ch2-1-2` graph cursor drag updates `X(T)`/`V(T)`, `ch3-5-3` radius drag updates `I`/`L`, and `ch3-6-2` ball drag updates momentum.
- Hardened user-driven readout sync in `sim-professional-lab.js`: slider/handle/reset updates now sync cards immediately, reset clears runtime-only state, `ch3-6-2` drag velocity uses pointer-down state with valid zero components, and `ch3-5-3` derives finite `L=Iω` after reset.
- Shared professional lab shell now resolves route-owned handle descriptors instead of unconditional generic state handles, exposes handle ids via `data-handle-ids`, and readout uses the active route handle.
- Resolved post-review simulation hardening concerns: Ch2/Ch3 no longer show detached `(190; 255)` readout, default handles use radius hit testing, Ch3 derived wrappers match the route behavior contract, legacy Ch2 draft modules no longer register duplicate source renderers, and `ch2-5-2` instant-center plus Ch2 slider state are covered by regression tests.
- Removed duplicate Ch2 script loads and duplicate Ch1 centroid scene rows from runtime registration.
- Duplicate route registration conflict in Ch3: old partial renderer files (ch3-dynamics-law-renderers.js, ch3-differential-solver-renderers.js, ch3-theorem-renderers.js, ch3-collision-checker-renderers.js) were loading AFTER new complete files in index.html, overwriting route registrations. **Fix**: deleted all old partial files from disk. All 58 routes now have exactly one renderer registration.
- `npm run test:sim:unit` no longer fails on deleted split files such as `js/sims/ch2/ch2-kinematics-behaviors.js`.
- `tests/simulation-physics.test.js` now loads and checks Phase 01 physics namespaces directly.
- Restored `clean(value)` in `sim-route-renderer-primitives.js`, fixing overlay key crashes in the math overlay path that could roll back simulation mount before canvas creation.
- Hardened route readout in the shared professional lab shell so route-specific derived models still update direct-drag readout through `điểm kéo=...` and no longer assume `d.alpha`.
- Restored Ch2-1-1 trajectory preset controls so the preset redraw browser regression has real UI targets.
- Restored actual canvas vector drawing in `P.arrow()`; structural marks no longer mask invisible force/velocity/acceleration vectors.
- Wired route behavior tick contracts into the animation engine so animated routes advance without user input.
- Updated renderer contract static smoke to follow `index.html` script order, matching browser runtime overwrite order for split route files.
- Default keyboard nudge focus now starts on the primary scene handle, keeping readout/assessment-visible state in sync for keyboard-only interaction.

### Verified
- `npm run test:sim:release` PASS after post-plan debug hardening: canonical release gate, browser suite 211 passed and 1 skipped, visual-quality 69 passed, unit `node --check` scanned 69 JS files.
- Agent-browser manual QA saved evidence under `plans/260508-1435-simple-simulation-lab-assessment-removal/reports/`: `ch2-1-1` preset switching, `ch2-1-2` graph drag, `ch3-5-3` radius drag, `ch3-6-2` ball drag.
- All smoke gates pass: `smoke_simulation_routes` (58/58), `smoke_simulation_manifest` (58 objectives, 58 interactions), `smoke_simulation_runtime` (globals + mount OK), `audit_simulation_quality` (0 failures, max 220 lines enforced), `node --check` (69 JS files).
- `npm run test:sim:unit` PASS: recursive `node --check` scanned 69 JS files, physics helper assertions pass.
- `npm run test:sim:renderer-contract` PASS: 58 renderer registrations, 58 behavior registrations, unique ids, no family dispatch.
- `npx playwright test tests/simulation-browser.spec.js --grep @direct-drag` PASS: 70 direct-drag tests, including paused readout/reset regressions for `ch2-1-1`, `ch2-1-2`, `ch3-5-3`, and `ch3-6-2`.

## 2026-05-07

### Changed
- Rebuild simulation renderer architecture: thêm shared renderer/behavior registry, route renderer primitives, và 58 dedicated route renderer functions under `js/sims/ch*/`; shared professional lab engine giờ resolve renderer/behavior contract theo route id thay vì dùng `family` làm final selector cho registered routes.
- Hoàn tất canvas HTML overlay migration: professional lab shell tái dùng một `.sim-lab-overlay`, route renderers chuyển formula hiển thị qua `primitives.domMath`/KaTeX DOM overlay, và overlay bám canvas rect + transform scale khi resize responsive.
- Sửa `domMath` fallback để không cache text fallback vĩnh viễn; khi KaTeX load muộn thì rerender lại đúng math overlay.
- Localize visible simulation UI và assessment manifest prompts/objectives sang tiếng Việt.
- Thêm strict semantic QA: `tools/smoke_simulation_renderer_contract.py`, browser `@renderer-contract`, `npm run test:sim:renderer-contract`, `npm run test:sim:semantic`, và release gate bắt renderer id/function/body uniqueness + manifest/checkpoint links.
- Hardening renderer contract sau review: renderer primitives layer ghi structural draw marks runtime, browser `@renderer-contract` dùng marks này thay vì raw canvas text/hash và loại common frame metadata khỏi identity, static gate bắt 58 explicit non-empty unique `behaviorId`.
- Đồng bộ `sim-route-manifest.js` với runtime renderer/behavior ids và checkpoint `expectedRendererId`, giữ `chlyt_sim_assessment_v2` compatible.
- Thêm scene registry/fallback layer và 7 scene catalog files under `js/sims/ch*/`; shared professional lab route mount giờ lazy-resolve route-specific scene configs, giữ assessment state keys compatible, và `tools/smoke_simulation_scene_catalog.py` khóa coverage 58 routes.
- Hợp nhất shared engine vào `js/sim-professional-lab.js`; `js/sim-statics.js`, `js/sim-kinematics.js`, và `js/sim-dynamics.js` giờ là thin adapters, còn `index.html` load `js/sim-lab-ui.js` trước rồi mới tới engine và adapters.
- Roll out `.sim-lab` professional shell cho 58/58 routes, với direct scene drag cập nhật readout, route identity khớp route id, và checkpoint đầu tiên không pre-completed.
- Nâng browser QA lên 267 pass + 1 skipped, cover route discovery guard 58 unique routes, all-route lab shell, all-route route identity, all-route direct drag, assessment precondition, positive assessment save path đại diện Ch1/Ch2/Ch3, scene identity, responsive, `file://`, server smoke, late KaTeX fallback, và adapter fallback localization.
- Chuẩn hóa QA scripts: `npm run test:sim:quality` giờ là release-oriented quality gate, `npm run test:sim:quality:baseline` giữ baseline nhanh, và `npm run test:sim:release` bọc full release verification.
- Thêm release package/rollback checklist cho semantic math strict publish, tách student/offline package khỏi maintainer package và loại `.venv-ocr*`, `node_modules`, backups khỏi gói học viên.

### Fixed
- Sửa lỗ hổng QA route-specific simulation: scene identity cũ có thể pass nhờ text/metadata dù renderer vẫn collapse theo 14 `family`; strict renderer contract hiện fail nếu thiếu renderer riêng, duplicate function/body hash, hoặc manifest không link renderer.
- Bỏ family-level render fallback khỏi `SimSceneTemplates.renderScene()`; missing renderer giờ hiện diagnostic canvas, strict contract báo `Family dispatch: no`, và detector bắt cả direct `scene.family` / `switch (scene.family)` nếu bị đưa lại.
- Sửa `tools/smoke_simulation_routes.py` fallback parser chỉ đọc `*-routes.js`, tránh đếm nhầm renderer/behavior registrations thành route map entries.
- Sửa responsive canvas resize trong `SimCore.createSimContainer`: canvas reset inline size khi chuyển từ mobile width về desktop width.
- Sửa `SimCore.addSlider` để dựng DOM bằng `createElement`/`textContent`, không còn dùng raw `innerHTML` cho label/value/input.
- Sửa collision 2D double-click: nút `▶ Bắn` cancel RAF chain cũ trước khi restart shot.
- Sửa professional lab readout để dùng `textContent` thay vì `innerHTML`, tránh render HTML từ route metadata/status text.
- Sửa route-specific scene mount: shared professional lab route mount resolve scene config từ scene registry, fallback legacy khi route scene missing, và không đổi assessment state keys.
- Siết `tools/smoke_simulation_runtime.py --routes`: unknown route filter giờ fail thật thay vì false green.
- Siết direct interaction gate: token generic như `canvas-scene` không còn được tính là direct manipulation; chỉ kiểm `--require-direct` cho route có thao tác trực tiếp thật.
- Sửa strict image publish gate để chấp nhận nearby text context/evidence và cụm figure có mảnh inline ngắn; `python tools\audit.py --strict-images` hiện pass corpus với 99 files, 0 errors.

### Tests
- `npm run test:sim:semantic` PASS.
- `npm run test:sim:renderer-contract` PASS: static 58 renderer + 58 behavior contracts, browser runtime structural identity PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58 --require-assessment-links` PASS: 58 unique rendererId, 58 unique behaviorId, `Family dispatch: no`.
- `npm run test:sim:unit` PASS.
- `npm run test:sim:browser` PASS: 267 passed, 1 skipped.
- `npm run test:sim:release` PASS.
- `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-checkpoints-min 2` PASS.
- `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` PASS.
- `python tools\audit_simulation_quality.py --all` PASS, direct interaction 58/58, max JS 220 lines.
- `python tools\audit.py` PASS; `python tools\audit.py --strict-equations` PASS.
- `npm run test:sim:scene-identity` PASS.
- `python tools\test_simulation_qa_tools.py` PASS 11 tests, gồm regression cho direct/switch family dispatch và explicit blank `behaviorId`.
- Thêm regression Playwright cho resize `375 -> 1280`.
- Thêm browser regressions cho late KaTeX fallback qua `sim:katex-ready`, fallback adapter localization, all-route visible localization/no undefined, và responsive overlay tracking.
- Thêm runtime smoke cho fake DOM lab shell compatibility và collision double-click.
- Thêm unit tests cho runtime route filter và manifest direct gate false-positive.
- Thêm regression `tools/test_audit_image_gate.py` cho cụm figure inline kiểu `hinh-240`.

## 2026-05-06

### Changed
- Hoàn tất Phase 04-05 professional simulation foundation: thêm `js/sim-interactions.js` pointer/mouse/touch/keyboard kernel, visible handle rendering, `js/sim-assessment.js` storage v2/typed checkpoint panel, và 58-route objective/checkpoint manifest.
- Convert direct drag cho 6 representative lab routes: `ch1-1-5`, `ch1-5-3`, `ch2-1-1`, `ch2-5-2`, `ch3-3-1`, `ch3-6-2`.
- Mở rộng Playwright simulation suite với `@direct-drag`, CDP touch `@touch-viewports`, keyboard nudge, preset redraw, và state-based `@assessment`; full suite hiện pass 90 tests.
- Hoàn tất Phase 03 professional lab shell: thêm scene/overlay/toolbar/formula/status/feedback/checkpoint slots, `.sim-lab` scoped CSS, manifest `labShell` gate, và Playwright `@lab-shell`/`@responsive` checks cho 6 route đại diện.
- Convert 6 representative simulation routes sang lab shell: `ch1-1-5`, `ch1-5-3`, `ch2-1-1`, `ch2-5-2`, `ch3-3-1`, `ch3-6-2`.
- Thêm Phase 01 QA harness cho simulation: `npm run test:sim:quality`, `npm run test:sim:browser`, `npm run test:sim:browser:install`, `npm run test:sim:browser:baseline`; Python gates `tools/smoke_simulation_manifest.py` và `tools/audit_simulation_quality.py` cover manifest/quality baseline.
- Hoàn tất Phase 02 professional simulation architecture split: thêm shared kernels, simulation registry, route modules `js/sims/ch*/`, và registry-backed route map compatibility.
- Mở rộng runtime smoke với executable registry count `--expect-runtime-routes 58`, route module discovery từ `js/sims/`, index script-order execution, và DOM rollback gate `--check-mount-rollback`.
- Làm sạch image audit signal: `tools/audit.py` không còn tính textbook figure hợp lệ là warning và thêm `--strict-images` cho publish image metadata/caption gate.
- Hoàn tất P1 interactive simulation expansion: mở rộng route map lên 58 route, đạt 58/58 P1 route trong coverage matrix.
- Thêm Ch1 labs cho force vector, hệ lực phẳng/2.5D, DOF/liên kết, FBD, support reactions, ma sát, tự hãm, trọng tâm lỗ khoét, và checker bài tập tĩnh học.
- Thêm Ch2 labs cho đồ thị tọa độ Đề các, motion presets, hợp chuyển động, Coriolis, tâm vận tốc tức thời, slider-crank, belt/pulley mode, và checker bài tập động học.
- Thêm Ch3 labs cho hệ quy chiếu, quán tính, dynamic FBD, tích phân phương trình vi phân, cơ hệ lò xo, bài toán ngược, khối tâm, mô men động lượng, hệ số phục hồi va chạm, collision solver, và checker bài tập động lực học.
- Thêm checker layer trong `js/sim-activities.js` với `chlyt_activity_progress_v1`, numeric/vector checks, route reset, và malformed localStorage guard.
- Thêm plot/integration helpers trong `sim-core.js`, đồng thời cleanup listener drag theo active simulation scope.
- Cập nhật `tools/smoke_simulation_runtime.py` để bắt lỗi schema activity progress bẩn.
- Hoàn tất Phase 02 simulation runtime foundation: tách runtime thành `sim-core`, `sim-statics`, `sim-kinematics`, `sim-dynamics`, `sim-activities`, giữ registry route map tương thích.
- Thêm `tools/smoke_simulation_runtime.py` để gate script order, module globals, registry, và lifecycle dispose.
- Hoàn tất baseline Phase 01 cho kế hoạch mở rộng simulation: ghi nhận 18 route hiện có, 40 P1 route còn thiếu, thêm `tools/smoke_simulation_routes.py`, và đưa teardown lifecycle vào entry gate Phase 02.
- Chạy full local `pix2tex` rough prefill cho 702 công thức unique, giữ toàn bộ `reviewed=false`.
- Thêm KaTeX parse validation cho equation mapping qua `tools/validate_equation_mapping.py --katex`.
- Thêm KaTeX filter mặc định cho `tools/ocr_equation_mapping.py`; 96 OCR rows không render được đã chuyển thành `OCR failed`.
- Regenerate `equation-review.html` từ queue đã lọc: 563 LaTeX render được, 139 row cần sửa/nhập thủ công.
- Thêm `tools/auto_review_equation_mapping.py` để auto-review bằng DOCX `Equation Native` OLE qua local Ruby `mathtype_to_mathml_plus`.
- Tạo `data/equation_mapping.reviewed.json` với 645/702 rows đã review bằng MathML semantic từ MathType/Microsoft Equation.
- Tạo `data/equation_mapping.auto-review-failures.json` và contact sheets cho 57 rows ban đầu fail auto-review.
- Thêm `tools/apply_manual_equation_reviews.py` và `data/equation_manual_reviews.json` để xử lý 57 rows còn lại bằng 53 LaTeX manual reviews và 4 reviewed artifacts.
- Cập nhật validator/merge/extractor/audit để artifact `figure` giữ hình thật, artifact `blank` không render placeholder trắng, và strict audit vẫn tính là resolved.
- Merge publish mapping vào `data/equation_mapping.json`: 702 unique rows, 702 reviewed.
- Regenerate `chapters/`, `images/`, `tools/equation_report.json`, nav và `js/pages.js` từ DOCX với strict-ready mapping.

### Fixed
- Sửa `SimCore.createSimContainer` để dựng DOM bằng `createElement`/`textContent`, tránh interpolate route title qua raw `innerHTML`.
- Sửa `tools/audit.py --strict-images` để caption association bị chặn theo boundary ảnh kế tiếp, không false-pass khi ảnh trước mượn caption của ảnh sau.
- Chấp nhận caption nhóm cho các figure liền kề không có text xen giữa trong `--strict-images`, giảm false positive của image publish gate.
- Thêm reviewed alt text cho artifact-figure mapping và cập nhật DOCX extractor để không render alt generic kiểu `Công thức ...` cho artifact figure.
- Sửa edge case `simCollision2D`: guard va chạm khi hai tâm bi trùng nhau, tiếp tục animation khi chỉ còn vận tốc theo `y`, và thêm regression smoke tương ứng.
- Sửa risk false-pass Phase 02: browser `@route-mount` scan `js/sims/` recursively, runtime smoke chạy JS thật, và failed simulation mount không để lại `.sim-container` orphan.
- Giữ compatibility cleanup của route map: adapter mới gọi được cả cleanup function cũ và object `{ dispose }`.
- Sửa lifecycle simulation: `loader.js` dispose simulation đang active trước khi đổi route; `sim-core.js` hủy RAF pending và remove `resize` listener.
- Consolidate duplicate `.sim-*` CSS, giữ một block simulation canvas UI.
- Sửa local KaTeX font URL trong `lib/katex/katex.min.css` để không còn request sai `lib/katex/lib/katex/fonts/...` khi chạy `http://` hoặc `file://`.
- Thêm empty favicon data URL trong `index.html` để browser QA không còn `favicon.ico` 404.
- Sửa MathML mojibake trong publish mapping/output bằng cách rebuild `data/equation_mapping.reviewed.json` qua Ruby MathType converter UTF-8, merge lại `data/equation_mapping.json`, rồi regenerate `chapters/` và `js/pages.js`.
- Sửa spacing bị dính chữ quanh inline math trong `tools/extract_docx.py`; generated fragments hiện còn 0 case `</span>` sát chữ hoặc chữ sát inline math span.
- Siết `tools/audit.py` và `tools/validate_equation_mapping.py` để bắt mojibake thật kiểu `â†`, `âˆ`, `Ã...`, `Â...` nhưng không false positive với tiếng Việt hợp lệ như `CÂU`, `TRỌNG TÂM`, `PHƯƠNG TRÌNH`.
- Chuẩn hóa MathML theo context render: inline `mathml-inline` không còn giữ `display="block"` trên root `<math>`.
- Thêm allowlist tag/attribute cho MathML validator để chặn event handler attribute, unsafe URL scheme, namespace lạ trước khi publish HTML.
- Regenerate existing `chapters/tac-gia.html` từ front matter DOCX trước `MỤC LỤC`, gồm bìa, quyết định, hội đồng thẩm định, và dòng tác giả nguồn.
- Thêm regression test `tools/test_docx_equation_pipeline.py` cho mapping MathML sạch, generated output sạch, inline math spacing, validator security guard, và front matter transfer.

### Notes
- Browser QA: Chrome headless `file://` smoke pass 58 simulation routes x 3 viewports (`1280x900`, `375x812`, `768x1024`).
- `python tools\smoke_simulation_routes.py --require-p1` pass: P1 covered 58/58.
- Residual simulation backlog at that point: P2/P3 routes trong coverage matrix chưa triển khai; resolved by 2026-05-07 professional lab rollout for the current 58 routes.
- Backup trước filter: `data/equation_mapping.ocr.before-katex-filter.json`.
- Backup trước publish merge: `data/equation_mapping.before-manual-debug.json`.
- `tools/smoke_simulation_routes.py` là smoke Phase 01 cho route wiring; matrix thiếu hoặc rỗng fail hard trừ khi bật `--allow-missing-matrix`.
- `tools/smoke_simulation_runtime.py` pass; Chrome CDP route smoke pass 18 simulation routes, lifecycle smoke xác nhận RAF active về 0 sau navigation.
- Follow-up resolved 2026-05-07: `sim-statics.js`, `sim-kinematics.js`, và `sim-dynamics.js` đã thành thin adapters.
- `python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex` pass: 702 reviewed, KaTeX checked 53.
- `python tools\audit.py --strict-equations` pass; `chapters/` và `js/pages.js` còn 0 `math-img-inline`/`math-img-block`.
- `python tools\test_docx_equation_pipeline.py` pass: 5 regression tests.
- Runtime QA pass 24 lượt: 6 sample routes × desktop/mobile × `http://`/`file://`, 0 console/page/network error sau fix.

## 2026-05-05

### Changed
- Đồng bộ nội dung giáo trình theo `CoHocLyThuyet_Full_New.docx`.
- Rebuild toàn bộ fragments trong `chapters/` theo outline DOCX mới.
- Rebuild sidebar, breadcrumb, route map, và page order theo 3 chương, mỗi chương 7 phần.
- Giữ quiz JSON và simulations hiện có như nội dung bổ trợ.
- Regenerate `js/pages.js` để hỗ trợ chạy offline qua `file://`.
- Refactor DOCX extractor sang run-level rendering để giữ đúng vị trí công thức legacy trong câu.
- Thêm class riêng cho công thức ảnh: `math-img-inline`, `math-img-block`; `figure-container` chỉ dành cho hình minh họa.
- Thêm `tools/equation_report.json`, `data/equation_mapping.json`, và `tools/export_equations_for_review.py` cho lộ trình chuyển công thức sang LaTeX/MathML đã review.
- Thêm tooling Phase 2 cho semantic math: validate mapping, local math OCR prefill với Vision LLM fallback tùy chọn, review HTML offline, merge mapping reviewed, và strict equation audit.
- Thêm `equation-review.html` generated từ `data/equation_mapping.ocr.json` để review 702 công thức unique trước khi publish.
- Thêm local math OCR provider cho `tools/ocr_equation_mapping.py`: ưu tiên `pix2tex`, chỉ dùng Vision API làm fallback tùy chọn.

### Fixed
- Loại route cũ khỏi điều hướng chính: `ch1-8*`, `ch2-8*`.
- Thêm legacy redirect trong `js/loader.js` cho route cũ.
- Sửa lệch route Chương 2, gồm `ch2-6-1`, `ch2-6-2`, `ch2-7-3`.
- Sửa `tools/audit.py` để dùng project root tương đối, kiểm tra ảnh theo runtime SPA, và trả non-zero khi có lỗi thật.
- Sửa lỗi công thức `Equation.DSMT4` / `Equation.3` bị tách thành từng hình minh họa rời và chèn sau đoạn văn.
- Sửa `tools/audit.py --strict-equations` để fail thật khi còn công thức ảnh fallback hoặc mapping publish chưa đủ reviewed.
- Sửa review UI export để không phát sinh field ngoài schema mapping công thức.

### Notes
- Backup trước đồng bộ: `backups/20260505-150438-pre-docx-sync`.
- Backup trước Phase 2 OCR tooling: `backups/20260505-163648-pre-phase2-ocr-tooling`.
- Image extraction từ DOCX mới: 835 ảnh, 0 lỗi chuyển đổi.
- Chưa publish semantic math strict vì `data/equation_mapping.json` chưa có 702 rows `reviewed=true`; cần chạy OCR thật và review thủ công trước.
