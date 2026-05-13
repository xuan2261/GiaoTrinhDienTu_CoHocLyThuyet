# Code Standards

Mục tiêu của file này là giữ code ổn định, dễ regenerate, và không làm lệch nguồn sự thật từ DOCX.

## Quy tắc chung

| Quy tắc | Ý nghĩa |
|---|---|
| KISS | Giữ module nhỏ, rõ vai trò |
| DRY | Không nhân đôi logic route, render, hay mapping |
| YAGNI | Không thêm layer hay abstraction chưa cần |
| Kebab-case | Dùng cho filename mới trong repo |
| No manual generated files | Không sửa tay file sinh tự động |

## Cấu trúc code

| Khu vực | Chuẩn |
|---|---|
| `index.html` | Shell, chỉ giữ markup và script load order |
| `js/app.js` | Chức năng shell, không trộn loader hay quiz logic |
| `js/loader.js` | Chỉ lo route map, load page, render math, hook UI sau load |
| `js/quiz.js` | Chỉ lo quiz state và render quiz |
| `js/progress.js` | Chỉ lo progress/bookmark persistence |
| `js/glossary.js` | Chỉ lo tooltip term highlight |
| `js/notes.js` | Chỉ lo highlight + note UI |
| `js/sim-core.js` | Shared simulation helpers, lifecycle scope, canvas/control helpers |
| `js/sim-vector-math.js` | Vector/math helpers dùng chung cho simulation |
| `js/sim-rendering.js` | Rendering helpers dùng chung cho canvas |
| `js/sim-interactions.js` | Pointer/handle interaction scaffold |
| `js/sim-lab-ui.js` | Professional lab UI shell; keep selectors scoped under `.sim-lab`, and reuse one `.sim-lab-overlay` synced to canvas rect/scale |
| `js/sim-animation-engine.js` | Animation loop, easing, particles; binds to lab lifecycle |
| `js/sim-physics-statics.js` | Statics helper formulas: force components, moments, reactions, friction, centroid |
| `js/sim-physics-kinematics.js` | Kinematics helpers: trajectories, derivatives, rotation, transmission, instant center |
| `js/sim-physics-dynamics.js` | Dynamics helpers: Newton, ODE solvers, collision, energy, D'Alembert |
| `js/sim-visual-helpers.js` | Glow, gradients, enhanced arrows/grid |
| `js/sim-interaction-enhancements.js` | Snap guides, ghost state, drag visual feedback |
| `js/sim-scene-registry.js` | Route-scoped scene catalog registry; keep scene ids/signatures deterministic |
| `js/sim-scene-templates.js` | Legacy scene template fallback và deterministic signature helpers |
| `js/sim-route-renderer-primitives.js` | Low-level drawing helpers only; `domMath`/overlay render helpers ở đây, không đăng ký final route renderer |
| `js/sim-route-renderer-registry.js` | 58 dedicated route renderer contracts; renderer id/function/body phải unique |
| `js/sim-route-behavior-registry.js` | Route behavior contracts: behavior id, derived/interaction metadata, assessment link |
| `js/sim-professional-lab.js` | Shared professional lab shell orchestration; resolve scene metadata, renderer contract, behavior contract, route-owned handle descriptors, và active handle metadata qua `data-active-handle-id` |
| `js/sim-statics.js` | Thin Ch1 adapter cho `SimProfessionalLab.mount(routeId)` |
| `js/sim-kinematics.js` | Thin Ch2 adapter cho `SimProfessionalLab.mount(routeId)` |
| `js/sim-dynamics.js` | Thin Ch3 adapter cho `SimProfessionalLab.mount(routeId)` |
| `js/sims/ch*/` | Scene catalog registrations + route registration modules theo chương |
| `js/sim-activities.js` | Shared activity/checker namespace và progress guard |
| `js/sim-route-manifest.js` | 58-route manifest: objective + interaction metadata |
| `js/simulations.js` | Chỉ lo compatibility registry và runtime route map; route discovery cho QA chỉ đếm canonical P1 routes, compatibility routes vẫn load để fallback |
| `tools/` | Python script độc lập, một task chính mỗi file |
| `tests/` | Dev-only QA; focused simulation suites: browser shell/mount, interaction, visual-quality, unit physics/runtime |

## Quy ước đặt tên

| Loại | Pattern |
|---|---|
| File docs mới | `kebab-case.md` |
| Route id | `ch{chapter}-{section}-{subsection}` |
| Chapter special pages | `ch{chapter}-rev`, `ch{chapter}-quiz` |
| Generated bundle | `js/pages.js` |
| Review outputs | `equation-review.html`, `tools/equation_report.json` |

## Các key state phải giữ ổn định

| Key | Nguồn | Mục đích |
|---|---|---|
| `theme` | `js/app.js` | Ghi mode sáng/tối |
| `fontZoom` | `js/app.js` | Ghi level zoom |
| `readPages` | `js/app.js` | Track trang đã đọc |
| `quizScores` | `js/quiz.js` | Lưu score quiz |
| `chlyt_progress` | `js/progress.js` | Track visits/read per page |
| `chlyt_bookmarks` | `js/progress.js` | Lưu bookmark |
| `chlyt_notes` | `js/notes.js` | Lưu highlight và note |
| `chlyt_activity_progress_v1` | `js/sim-activities.js` | Lưu tiến trình micro-checker theo route |

## Generated file policy

| File | Cách xử lý |
|---|---|
| `js/pages.js` | Luôn regenerate bằng `tools/bundle_pages.py` |
| `chapters/*.html` | Sinh từ `tools/extract_docx.py`, không sửa tay khi DOCX còn là source of truth |
| `images/ch*/` | Sinh từ extractor, audit path trước khi publish |
| `tools/docx_site_manifest.json` | Manifest sinh tự động từ extractor |
| `tools/equation_report.json` | Output review, dùng làm input cho mapping review |
| `data/equation_mapping.json` | Update qua `merge_equation_mapping.py`, không tự bịa schema |

## JavaScript standards

| Chủ đề | Chuẩn |
|---|---|
| Load order | `app.js` trước `pages.js`, rồi `loader.js`, sau đó module phụ |
| Professional lab order | `sim-lab-ui.js` -> scene/templates/primitives -> animation/physics/visual helpers -> renderer/behavior registries -> `sim-professional-lab.js` -> thin adapters |
| Scene catalog order | `js/sims/ch*/` route modules, scene catalogs, renderer modules, và behavior modules phải load trước `sim-route-manifest.js`/`simulations.js` |
| Renderer contract | Mỗi route trong runtime route map phải có một `rendererId` riêng, named renderer function riêng, và normalized function body hash riêng |
| Max file size | **Tối đa 220 dòng mỗi file JS**; nếu vượt thì split thành 2+ file theo nhóm route |
| Route module naming | `ch{n}-{group}-{type}.js` ví dụ: `ch2-kinematics-behaviors-a.js`, `ch3-newton-laws-renderers.js`; khi split thì thêm suffix: `-a`, `-b` hoặc mô tả nhóm: `-theorems`, `-collision` |
| DOM hooks | Chỉ inject sau khi fragment đã vào `#content-area` |
| Error handling | Fail rõ ràng, log `console.warn`/`console.error` có ngữ cảnh |
| Math render | Ưu tiên KaTeX/MathML hợp lệ; formula hiển thị qua `primitives.domMath` trên DOM overlay, không cache fallback text vĩnh viễn; không dùng figure style cho equation |
| Legacy routes | Giữ redirect `ch1-8*` và `ch2-8*` |
| No duplicate registrations | Mỗi route có đúng 1 renderer registration; xóa file cũ/split khi tạo file mới, và cập nhật `index.html` script load order tương ứng |
| Route-owned handles | Route simulation mới phải ưu tiên handle descriptors do behavior cung cấp; active handle hiện tại phải được expose qua `data-active-handle-id`, và phải clear khi release/dispose/removeHandle; không phụ thuộc vào generic default handle text khi route đã có handle thật |
| No motion trails | Active simulation routes không lưu hoặc vẽ motion trail; drag/redraw chỉ hiển thị trạng thái hiện tại |

## Python/tool standards

| Chủ đề | Chuẩn |
|---|---|
| Entrypoint | Mỗi script có `main()` và `if __name__ == "__main__"` |
| Output | In rõ mode, số file, và kết quả chính |
| Dependencies | Nếu write mode cần dependency ngoài, phải fail sớm |
| Safety | Không âm thầm nuốt lỗi khi xuất bản content |
| Filesystem | Dùng path tương đối root-based, không hardcode lung tung |

## Validation bắt buộc

```powershell
npm run test:sim:unit
python -m compileall -q tools
python tools\audit.py
npm run test:sim:audit
npm run test:sim:disposal
python tools\smoke_simulation_routes.py
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors,SimAnimationEngine,SimPhysicsStatics,SimPhysicsKinematics,SimPhysicsDynamics,SimVisualHelpers --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:scene-identity
npm run test:sim:browser:route-mount
```

`tools\audit.py` mặc định không tính textbook figure hợp lệ là warning; section `IMAGE RENDERING` phải ghi số figure hợp lệ, `unwrapped=0`, `missing=0`.

Khi làm phase mở rộng simulation, `tools\smoke_simulation_routes.py` là gate Phase 01 cho route wiring và coverage matrix. Script này fail nếu matrix thiếu hoặc rỗng, trừ khi bật `--allow-missing-matrix`.
`tools\smoke_simulation_runtime.py` là gate Phase 02 cho script order, module globals, executable registry count, mount rollback, và lifecycle dispose tokens.
Khi chốt P1 simulation expansion, chạy thêm `python tools\smoke_simulation_routes.py --require-p1`. Browser smoke phải mở toàn bộ route trong runtime route map qua `file://`; responsive/touch matrix tối thiểu dùng route đại diện theo chapter/topic.

Khi làm professional simulation labs, chạy thêm:

```powershell
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --max-js-lines 220
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:browser
npm run test:sim:release
npm run test:sim:quality:baseline
npm run test:sim:browser:install
npm run test:sim:browser:baseline
npm run test:sim:browser:route-mount
```

`package.json` chỉ dùng cho QA dev-only. Không thêm runtime bundler; app vẫn phải chạy được bằng `file://`.
`npm run test:sim:release` phải bao gồm `test:sim:quality` và `test:sim:visual-quality` để khóa line-count active simulation sources, 58-route discovery, bounded canvas, route-owned handles, renderer/behavior/scene identity, dark/light readability, và overflow.

Khi chỉnh DOCX sync hoặc equation flow, chạy thêm:

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.json
python tools\validate_equation_mapping.py --input data\equation_mapping.json --katex
python tools\audit.py --strict-equations
```

Khi chốt publish hình ảnh, chạy thêm:

```powershell
python tools\audit.py --strict-images
```

`--strict-images` là gate publish-readiness cho ảnh local: wrapper hợp lệ, file tồn tại, không tiny, figure có caption gần hoặc nearby text context/evidence trong cùng boundary ảnh, chấp nhận caption nhóm cho các figure liền kề và mảnh text inline ngắn giữa các figure, và artifact-figure dùng reviewed alt thay vì generic `Công thức ...`. Gate này không thay thế audit thường.

## Content editing rules

| Việc | Cách làm |
|---|---|
| Sửa nội dung textbook | Sửa DOCX nguồn, rồi regenerate |
| Sửa điều hướng | Chạy `tools/update_nav.py` |
| Sửa offline bundle | Chạy `tools/bundle_pages.py` |
| Sửa equation publish | Đi qua review flow, rồi merge mapping |
| Sửa docs | Cập nhật `docs/` và giữ file ngắn, rõ, đồng bộ |

## Ghi chú

- `package.json` chỉ chứa QA scripts/dev dependencies; không biến repo thành npm runtime app.
- Không thêm framework hoặc build step mới nếu chưa có lý do thật.
- Nếu một file code mới vượt mức vừa phải, tách thành module nhỏ hơn trước khi tích lũy thêm logic.
- Browser QA professional dùng focused suite không còn skipped rollout tests: `test:sim:browser` hiện 173 tests trong `mass-conversion-audit.spec.js`, `simulation-browser.spec.js`, `simulation-interaction-engine.spec.js`, và `promax-pilot-shell.spec.js`; `test:sim:visual-quality` hiện 4 all-route visual/identity/theme tests; `test:sim:scene-identity` và `test:sim:renderer-contract` là hai gate riêng cho identity/contract.
