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
| Interactive simulation expansion | Done: 58/58 P1 routes mount `.sim-lab` simple shell; direct drag/readout cards; reset/play-pause for animated routes; no checkpoint/assessment |
| Professional simulation architecture split | Done: shared kernels, `js/sim-professional-lab.js`, thin adapters, registry route modules, executable registry gate, mount rollback gate |
| Professional simulation lab shell | Done: 58/58 routes dùng `.sim-lab` shell, manifest gate, responsive browser checks, và route identity gate |
| Canvas HTML overlay migration | Done: reuse existing `.sim-lab-overlay`, route renderers dùng DOM overlay/KaTeX qua `domMath`, overlay bám canvas rect + transform scale, late KaTeX fallback rerender, visible UI/objectives localized |
| Professional direct interaction kernel | Done: 58/58 routes có direct drag/readout stability audit, touch gesture guard, keyboard nudge, autoplay-safe pause, và listener cleanup gate |
| Simulation Interaction & Visual Quality Hardening | Done: route-owned handles, `data-handle-ids`, deduped Ch2/Ch1 runtime registrations, bounded edge ink, và `test:sim:visual-quality` |
| Simple lab shell baseline | Done: 58-route objective/interaction manifest, simple DOM shell (header/readout-cards/hint), readout cards, reset/play-pause controls, no checkpoint/assessment runtime |
| Shared-first DeCuong simulation UX sweep | Done: chapter accent tokens in `.sim-lab`, 44px touch controls, visible route-owned drag handles, compact handle legend, semantic readout card metadata/styling, control/time readout feedback for every slider and animation, formula/hint left accent, shell `role`/`aria-label`/`aria-live`/`aria-describedby`, action-oriented hint text from route handles, segmented `aria-pressed` controls, and route control metadata |
| DeCuong full rebuild foundation | Done: Phase 00 sets 760×440 canvas baseline, DeCuong shared render helpers, KaTeX equation panel fallback, scoped mount disposer cleanup, and manifest-aligned 58-ID contract scenes/renderers/behaviors |
| DeCuong CH1 core force rebuild | Done: Phase 01 rebuilt 6 CH1 force/moment/couple/support/equilibrium routes with DeCuong visual stack, route-owned direct drag, trails, KaTeX/DOM overlays, synchronized readouts/sliders, and strict 6-route gates |
| DeCuong CH1 axioms/parallelogram rebuild | Done: Phase 02 rebuilt `ch1-2-3`, `ch1-2-6`, `ch1-3-1`, and `ch1-3-2` with DeCuong parallelogram/FBD/support visuals, F1/F2 handles, support alpha geometry, trails, KaTeX overlays, and strict 4-route gates |
| DeCuong CH1 support/spatial rebuild | Done: Phase 03 rebuilt `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, and `ch1-4-4` with DeCuong beam/support/spatial visuals, route-owned direct drag, trails, KaTeX overlays, synchronized controls/readouts, and strict 7-route gates |
| DeCuong CH1 friction/centroid/exercises rebuild | Done: Phase 04 rebuilt 8 routes `ch1-5-1` to `ch1-7-2` with friction thresholds, friction cone/self-locking wedge, centroid composite/cutout visuals, guided solver/checker boards, route-owned direct drag, trails, KaTeX overlays, synchronized controls/readouts, and semantic regression tests |
| DeCuong CH1 full QA gate | Done: Phase 05 release-ready gate passed for 25/25 CH1 routes, with CH1 static gates, runtime smoke, semantic/browser/visual-quality suites, quality/content audits, and 50 light/dark screenshot evidence images |
| DeCuong CH2 particle trajectory rebuild | Done: Phase 06 rebuilt `ch2-1-1` to `ch2-1-4` with DeCuong particle trajectory, graph cursor, natural coordinates, motion presets, 30-point trails, KaTeX overlays, route-owned handles, synchronized readouts, and strict/browser/visual gates |
| DeCuong CH2 relative/plane motion rebuild | Done: Phase 08 rebuilt `ch2-4-1` to `ch2-4-4` and `ch2-5-1` to `ch2-5-3` with relative-motion velocity composition, Coriolis vector invariants, plane-body velocity, instant-center distribution, KaTeX equations, trails, and route-owned handles/readouts |
| DeCuong CH2 exercises QA gate | Done: Phase 09 hardened `ch2-7-1` and `ch2-7-2`, 15/15 CH2 routes pass manifest/scene/renderer/runtime gates |
| DeCuong CH3 full rebuild | Done: Phase 10-12 complete for 18/18 CH3 routes; Newton/ODE, theorem/collision, and exercise/checker routes pass strict gates and final 58-route release |
| Route-specific simulation scene registry repair | Done: 7 scene catalogs cover 58 routes; shared professional lab route mount lazy-resolves scene configs, keeps assessment keys compatible, và QA 2026-05-07 pass với `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58`, `npm run test:sim:scene-identity`, `npm run test:sim:browser` |
| Route unique renderer rebuild | Done: 58/58 routes có dedicated renderer function, 58 behavior contracts, manifest/checkpoint renderer links, browser structural marks, `Family dispatch: no`, `npm run test:sim:semantic` và `npm run test:sim:release` pass |
| Route-specific simulation rebuild | Done: Hoàn tất tinh chỉnh chi tiết 58 routes (Plan 260510) với shared visual primitives mới, polish Ch1/Ch2/Ch3 và interaction hardening 100% |
| Ch1 DeCuong interaction upgrade | Done: 25/25 Ch1 routes có physical handle labels, Ch1 route-filter gates pass, pilot parallelogram reference-only |
| Rich animated full-physics rebuild (Phases 01-06) | **Done**: foundation architecture — Physics (Vec2/RigidBody/Spring/World), Scene (SceneNode/BodyNode/ArrowNode), Render (Primitives/Effects/Camera), Interaction (HandleManager/Gesture/Guide/Nudge), Animation (Animator/Timeline/Interpolator/Tween/PlaybackUI); active runtime covers 58 P1 routes from coverage matrix |
| Legacy route files | Active source is `js/sims/ch*/`; indexed `js/routes/ch*/*` legacy files are removed from current worktree; Ch1 pilot is reference-only |
| Simulation rewrite (v2) | Historical/legacy track only; current canonical 58 P1 routes use `.sim-lab` canvas + registries |
| QA harness | Đã có `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:renderer-contract`, `npm run test:sim:browser`, `npm run test:sim:visual-quality`, `npm run test:sim:release`, `npm run test:sim:browser:install`, `npm run test:sim:browser:baseline`, `npm run test:sim:browser:route-mount`, `npm run test:sim:scene-identity`; `test:sim:browser` hiện chạy mass mount + shell/browser + control/drag/animation suites, `test:sim:release` bao gồm quality + visual-quality gates |

## Phases

| Phase | Status | Mục tiêu | Exit criteria |
|---|---|---|---|
| P0 | Done | Shell đọc được nội dung và điều hướng cơ bản | `index.html` load ổn, route hoạt động |
| P1 | Done | Đồng bộ fragment từ DOCX | `extract_docx.py`, `update_nav.py`, `bundle_pages.py` chạy xong |
| P2 | Done | Semantic math review và strict publish | `equation_mapping.json` đủ reviewed, `audit.py --strict-equations` pass |
| P3 | Done | Professional simulation labs | 58/58 route mount, direct drag, readout cards, reset/play-pause, runtime smoke, browser QA pass |
| P3.1 | Done | Simulation Interaction & Visual Quality Hardening | Route-owned handles, deduped registrations, all-58-route direct drag audit, strict visual-quality gate pass |
| P3.5 | Done | Strict route renderer rebuild | 58 distinct renderer functions, behavior contracts, semantic QA, release gate pass |
| P3.6 | Done | Canvas HTML overlay migration | Single `.sim-lab-overlay`, `domMath` DOM/KaTeX render path, responsive overlay scaling, late KaTeX rerender |
| P6 | Done | Phase 06 Polish: deprecated legacy, docs updated, responsive canvas | Legacy files → `js/deprecated/`, docs synced, responsive + touch targets |
| P7 | Done | Route-specific simulation rebuild | Polish chi tiết 58 routes, shared visual primitives, interaction hardening, release pass |
| P8 | Done | Ch1 DeCuong interaction upgrade | 25 Ch1 routes có route-owned physical handles, QA tool prefix gates, docs/runtime architecture synced |
| P9 | Done | DeCuong simulation full rebuild | Phase 00-12 complete; final review fixes landed for `ch2-1-3`, `ch2-5-3`, `ch2-7-2`, and CH2 checker labels; final 58-route release gate pass |

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

1. Tạo clean package folder/zip theo [release checklist](../plans/20260505-2044-local-math-ocr-semantic-math-strict-publish/reports/release-checklist.md).
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
