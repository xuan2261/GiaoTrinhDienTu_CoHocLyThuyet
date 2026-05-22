# Project Roadmap

Roadmap này phản ánh trạng thái hiện tại của project và các bước cần làm tiếp cho bản static textbook.

## Snapshot hiện tại

| Mục | Trạng thái |
|---|---|
| Reader shell | Đã ổn định |
| DOCX sync pipeline | Đã có |
| Offline bundle | Đã có |
| Quiz/progress/notes/glossary/simulations | Đã có |
| Semantic math strict publish | Strict pass; browser QA representative responsive/touch và `file://` pass |
| Interactive simulation expansion | Done: 52/52 P1 routes have canonical registry contracts; Section VII `BÀI TẬP` pages are content-only |
| Professional simulation architecture split | Done: shared kernels, `js/sim-professional-lab.js`, thin adapters, registry route modules, executable registry gate, mount rollback gate |
| Professional simulation lab shell | Done: 52/52 canonical routes have lab contracts, `.sim-lab` shell, manifest gate, responsive browser checks, và route identity gate |
| Canvas HTML overlay migration | Done: reuse existing `.sim-lab-overlay`, route renderers dùng DOM overlay/KaTeX qua `domMath`, overlay bám canvas rect + transform scale, late KaTeX fallback rerender, visible UI/objectives localized |
| Simulation canvas overlay cleanup | Done: 52 canonical routes block formula/value DOM in `.sim-lab-overlay`; right inspector owns formula/readout UI; `@overlay-contract`, browser, visual, semantic, and release gates pass |
| Professional direct interaction kernel | Done: 52 canonical routes có direct drag/readout stability audit, touch gesture guard, keyboard nudge, autoplay-safe pause, và listener cleanup gate |
| Simulation Interaction & Visual Quality Hardening | Done: route-owned handles, `data-handle-ids`, deduped Ch2/Ch1 runtime registrations, bounded edge ink, và `test:sim:visual-quality` |
| Simple lab shell baseline | Done: 52-route objective/interaction manifest and DOM shell (header/readout-cards/hint), readout cards, reset/play-pause controls, no checkpoint/assessment runtime |
| Shared-first DeCuong simulation UX sweep | Done: chapter accent tokens in `.sim-lab`, 44px touch controls, visible route-owned drag handles, compact handle legend, semantic readout card metadata/styling, explicit readout policy for controls/time/generic values, formula/hint left accent, shell `role`/`aria-label`/`aria-live`/`aria-describedby`, action-oriented hint text from route handles, segmented `aria-pressed` controls, and route control metadata |
| DeCuong full rebuild foundation | Done: Phase 00 sets 760×440 canvas baseline, DeCuong shared render helpers, KaTeX equation panel fallback, scoped mount disposer cleanup, and manifest-aligned 52-route contract scenes/renderers/behaviors |
| DeCuong CH1 core force rebuild | Done: Phase 01 rebuilt 6 CH1 force/moment/couple/support/equilibrium routes with DeCuong visual stack, route-owned direct drag, KaTeX/DOM overlays, synchronized readouts/sliders, and strict 6-route gates |
| DeCuong CH1 axioms/parallelogram rebuild | Done: Phase 02 rebuilt `ch1-2-3`, `ch1-2-6`, `ch1-3-1`, and `ch1-3-2` with DeCuong parallelogram/FBD/support visuals, F1/F2 handles, support alpha geometry, KaTeX overlays, and strict 4-route gates |
| DeCuong CH1 support/spatial rebuild | Done: Phase 03 rebuilt `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, and `ch1-4-4` with DeCuong beam/support/spatial visuals, route-owned direct drag, KaTeX overlays, synchronized controls/readouts, and strict 7-route gates |
| DeCuong CH1 friction/centroid rebuild | Done: Phase 04 active registry now keeps friction and centroid routes through `ch1-6-3`; former `ch1-7-*` exercise checker routes were deleted from simulation contracts and remain textbook content-only |
| DeCuong CH1 full QA gate | Done: Phase 05 release-ready gate passed for 25/25 CH1 routes, with CH1 static gates, runtime smoke, semantic/browser/visual-quality suites, quality/content audits, and 50 light/dark screenshot evidence images |
| DeCuong CH2 particle trajectory rebuild | Done: Phase 06 rebuilt `ch2-1-1` to `ch2-1-4` with DeCuong particle trajectory, graph cursor, natural coordinates, motion presets, KaTeX overlays, route-owned handles, synchronized readouts, and strict/browser/visual gates |
| DeCuong CH2 relative/plane motion rebuild | Done: Phase 08 rebuilt `ch2-4-1` to `ch2-4-4` and `ch2-5-1` to `ch2-5-3` with relative-motion velocity composition, Coriolis vector invariants, plane-body velocity, instant-center distribution, KaTeX equations, and route-owned handles/readouts |
| DeCuong CH2 active QA gate | Done: 13/13 CH2 simulation routes pass manifest/scene/renderer/runtime gates; former `ch2-7-*` exercise checker routes are content-only |
| DeCuong CH3 full rebuild | Done: Phase 10-12 active CH3 routes now cover 16/16 contracts; Newton/ODE, theorem/collision routes pass strict gates and 52-route release |
| Promax simulation correctness pilot | Done: 6 pilot routes complete; shared shell invariant status, diagnostics toggles, local challenge mode, formula summaries, route-owned mini graph summaries for 3 high-value routes, focused diagnostic overlays, and 52 remaining routes classified only in the rollout matrix |
| Phase 09 canvas evolution cleanup | Done (2026-05-21, updated 2026-05-22): concept routes use `scene.static`/`tickWithoutButton`, misleading Play is suppressed, static/animated canvas labels are exact, silent ticks survive drag; engine-time sweep covers 52 canonical routes / 0 defects / 0 drift |
| Simulation correctness & realism overhaul | Done (2026-05-18): `resolveHandles` fail-loud (legacy fallback removed); per-route ARIA overlay layer (`.sim-handle-a11y-layer`), keyboard nudge (Arrow + Shift), Escape blur, polite `sim-aria-live` region; `lab.prefersReducedMotion` flag; `P.spring` `opts.anchor`/`opts.wallAnchor`; `P.realisticBody` `ao:`/`rim:` marks; `P.realisticWheel` `shine:` mark; `P.magnitudeArrow` PhET-scaled length-only arrows; `getPattern`/`clearPatternCache` OffscreenCanvas + seeded LCG noise in `sim-visual-helpers.js`; new a11y CSS classes (`.sim-handle-a11y-layer`, `.sim-handle-a11y`, `.sim-aria-live`, `.sr-only`); reduced-motion media query suppresses focus shadow; `test:sim:correctness` and `test:sim:correctness:browser` scripts; `tests/sim-correctness-realism.test.js`, `tests/sim-handle-anchor-invariants.spec.js`, `tests/sim-correctness-realism-fixtures.js` |
| Layout simulation responsive refinement | Done: reading width preserved, simulation scoped wide on desktop/tablet, mobile contained width, topbar compact non-overlap, responsive/touch/visual/runtime/audit gates pass |
| Route-specific simulation scene registry repair | Done: 52 scene contracts cover active routes; shared professional lab route mount lazy-resolves scene configs, keeps assessment keys compatible, và 52-route scene/browser gates pass |
| Route unique renderer rebuild | Done: 52/52 routes có dedicated renderer function, 52 behavior contracts, manifest/checkpoint renderer links, browser structural marks, `Family dispatch: no`, `npm run test:sim:semantic` và `npm run test:sim:release` pass |
| Route-specific simulation rebuild | Done: Hoàn tất tinh chỉnh chi tiết active 52 routes với shared visual primitives mới, polish Ch1/Ch2/Ch3 và interaction hardening 100% |
| Ch1 DeCuong interaction upgrade | Done: 25/25 Ch1 routes có physical handle labels, Ch1 route-filter gates pass, pilot parallelogram reference-only |
| Rich animated full-physics rebuild (Phases 01-06) | **Done**: foundation architecture — Physics (Vec2/RigidBody/Spring/World), Scene (SceneNode/BodyNode/ArrowNode), Render (Primitives/Effects/Camera), Interaction (HandleManager/Gesture/Guide/Nudge), Animation (Animator/Timeline/Interpolator/Tween/PlaybackUI); active registry covers 52 P1 routes from coverage matrix |
| Legacy route files | Active source is `js/sims/ch*/`; indexed `js/routes/ch*/*` legacy files are removed from current worktree; Ch1 pilot is reference-only |
| Formula-as-image, duplicate render & alt-text hardening | Done (2026-05-18): 8 OCR-verified raster formulas migrated/deleted, 40 MathML+KaTeX duplicate render pairs removed, 134 generic alts replaced with DOCX-caption + section-title fallback, `<div class="figure-container">` → `<figure>/<figcaption>` migration, audit guard `--strict-formula-image` default ON, KaTeX `output: 'htmlAndMathml'`, 7-phase plain-Python TDD scripts + Playwright smoke spec, `extract_docx.py --auto-fix-known-issues` for re-extract idempotency |
| Simulation rewrite (v2) | Historical/legacy track only; current canonical 52 P1 routes use `.sim-lab` canvas + registries |
| QA harness | Đã có `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:renderer-contract`, `npm run test:sim:browser`, `npm run test:sim:visual-quality`, `npm run test:sim:release`, `npm run test:sim:browser:install`, `npm run test:sim:browser:baseline`, `npm run test:sim:browser:route-mount`, `npm run test:sim:scene-identity`, `npm run test:sim:correctness`, `npm run test:sim:correctness:browser`; `test:sim:browser` hiện chạy Section VII no-simulation guard + 52-route mass mount + shell/browser + control/drag/animation suites, `test:sim:release` bao gồm quality + visual-quality gates |

## Phases

| Phase | Status | Mục tiêu | Exit criteria |
|---|---|---|---|
| P0 | Done | Shell đọc được nội dung và điều hướng cơ bản | `index.html` load ổn, route hoạt động |
| P1 | Done | Đồng bộ fragment từ DOCX | `extract_docx.py`, `update_nav.py`, `bundle_pages.py` chạy xong |
| P2 | Done | Semantic math review và strict publish | `equation_mapping.json` đủ reviewed, `audit.py --strict-equations` pass |
| P3 | Done | Professional simulation labs | 52/52 canonical route contracts, direct drag, readout cards, reset/play-pause, runtime smoke, browser QA pass |
| P3.1 | Done | Simulation Interaction & Visual Quality Hardening | Route-owned handles, deduped registrations, 52-route direct drag audit, strict visual-quality gate pass |
| P3.5 | Done | Strict route renderer rebuild | 52 distinct renderer functions, behavior contracts, semantic QA, release gate pass |
| P3.6 | Done | Canvas HTML overlay migration | Single `.sim-lab-overlay`, `domMath` DOM/KaTeX render path, responsive overlay scaling, late KaTeX rerender |
| P3.7 | Done | Simulation canvas overlay cleanup | No formula/value learner UI in canvas overlay; formula panel/readout cards own explanatory data; release gate pass |
| P6 | Done | Phase 06 Polish: deprecated legacy, docs updated, responsive canvas | Legacy files → `js/deprecated/`, docs synced, responsive + touch targets |
| P7 | Done | Route-specific simulation rebuild | Polish chi tiết 52 routes, shared visual primitives, interaction hardening, release pass |
| P8 | Done | Ch1 DeCuong interaction upgrade | 25 Ch1 routes có route-owned physical handles, QA tool prefix gates, docs/runtime architecture synced |
| P9 | Done | DeCuong simulation full rebuild | Phase 00-12 complete; final review fixes landed for canonical route contracts; final release gate pass with 52 registered routes |
| P10 | Done | Promax simulation correctness pilot | 6-route invariant/challenge shell, diagnostic overlays, route-owned mini graph summaries, targeted unit/browser gates, and 52 remaining routes classified only in the rollout matrix |
| P11 | Done | Phase 09 concept-diagram cleanup and animation parity | `scene.static` UX cleanup, animated route parity, engine-time canvas evolution baseline, browser drift gate pass |

## P2 breakdown

| Việc | Trạng thái | Ghi chú |
|---|---|---|
| Export equation review queue | Done | Có `tools/equation_report.json` và template mapping |
| OCR prefill | Done | `data/equation_mapping.ocr.json`: 563 KaTeX-renderable prefill, 139 failed/manual rows |
| Semantic MathType auto-review | Done | `data/equation_mapping.reviewed.json`: 645/702 rows có MathML từ DOCX OLE |
| Manual review/triage | Done | 53 LaTeX manual rows, 4 reviewed artifacts |
| Merge publish mapping | Done | `data/equation_mapping.json`: 702/702 reviewed |
| Strict audit | Done | `tools/audit.py --strict-equations` pass, 0 math image fallback |

## Near-term priorities

1. Tạo clean package folder/zip theo release checklist nội bộ trước khi bàn giao.
2. Chạy `npm run test:sim:browser:route-mount`, `npm run test:sim:browser:baseline`, `python tools\audit.py --strict-images`, và `python tools\audit.py --strict-equations` trên máy mục tiêu trước khi bàn giao.
3. Quyết định release đích dùng student/offline package hay maintainer package.
4. Bổ sung final screenshot evidence all chapters nếu cần artifact nghiệm thu trực quan.

## Long-term backlog

| Hạng mục | Mục đích |
|---|---|
| Dọn backup/legacy | Giảm context nặng và tránh nhầm source of truth |
| Route-specific visual polish | Giữ backlog riêng cho các route cần art/layout đặc thù; không tách shell shared-first thành variant theo route |
| Tinh gọn docs | Giữ mỗi file ngắn, focus một chủ đề |
| QA checklist rõ hơn | Giảm rủi ro khi regenerate từ DOCX |
| Chuẩn hóa release package | Dễ copy sang USB hoặc static hosting |
| Simulation delta routes | Chỉ thêm route mới khi DOCX hoặc scenario thật sự phát sinh |
| Promax rollout | Mở rộng invariant/readout/diagnostic theo family sau pilot, không mass rewrite 52 routes |

## Success metrics

| Metric | Mục tiêu |
|---|---|
| Content correctness | Audit không báo lỗi content thật |
| Equation readiness | Strict equation pass |
| Offline readiness | Mở được bằng `file://` |
| Maintainability | Mọi file docs và code standards đều phản ánh behavior thật |

## Câu hỏi chưa rõ

| Câu hỏi | Ảnh hưởng |
|---|---|
| Bản phát hành cuối cùng có giữ `backups/` và `Old/` trong repo chính không | Ảnh hưởng kích thước repo và maintenance |
