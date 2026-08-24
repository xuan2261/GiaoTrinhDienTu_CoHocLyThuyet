# Code Standards

Các chuẩn này giữ runtime offline ổn định và output đồng bộ với DOCX.

## Nguyên tắc

- KISS, DRY, YAGNI; module có một trách nhiệm rõ.
- Không thêm runtime framework hoặc bundler. `package.json` chỉ phục vụ QA.
- Filename mới dùng kebab-case; route dùng `ch{chapter}-{section}-{subsection}`.
- Không sửa tay generated files.
- Không đưa bộ `.sim-lab` 52 route lịch sử trở lại runtime hiện tại.

## Ranh giới module

| Khu vực | Chuẩn |
|---|---|
| `index.html` | Shell và script load order |
| `js/app.js` | UI shell, search, breadcrumb, theme, zoom |
| `js/loader.js` | Route, fragment, math và lifecycle hook |
| `js/{quiz,progress,glossary,notes}.js` | Mỗi module giữ đúng feature của mình |
| `js/sim2/physics/` | Nguồn công thức canonical, dùng được Node/browser |
| `js/sim2/core/` | Transform, SVG, overlay, panel, controls, lifecycle |
| `js/sim2/sims/ch*/` | Factory theo route; registry phải khớp manifest 25 route |
| `js/sim3/` | Pilot 10 route, optional, không thay default Sim2 |
| `js/pdf-viewer*.js` | Controller dialog/lifecycle tách khỏi canvas/text render queue |
| `tools/pdf-viewer/` | Build source duy nhất cho artifact PDF.js/data |
| `tools/` | Python script độc lập, có `main()` và fail rõ |
| `tests/` | Node/Playwright dev-only QA |

## Contract simulation

- Mount public: `window.SIM_MAP[pageId] -> factory(container) -> { dispose }`; route change phải dispose trước khi thay content.
- Sim2 playback dùng duy nhất `Sim2AnimationClock`: fixed step `1/60 s`, timestamp RAF, cap catch-up; playback và manual step dùng cùng update path. Không tích phân trực tiếp bằng số frame.
- Sim2 giữ logical viewport/transform ổn định khi resize; SVG scale bằng CSS, canvas resize theo display size với DPR cap, pointer remap về logical coordinates. Resize không được rebuild hoặc reset canonical route state.
- `dispose()` phải hủy listener, observer, timer, RAF và DOM do simulation tạo. Sim3 phải giải phóng geometry, material, texture, render target, renderer và WebGL context qua shared disposal.
- Sim2 bắt đầu paused khi có playback; Sim2/Sim3 không autoplay mặc định và phải hỗ trợ `prefers-reduced-motion`.
- Nhãn dùng HTML overlay, geometry dùng SVG; canvas underlay chỉ opt-in cho trail/field. Nhãn/readout phải giải thích vector/sign/unit, không chỉ dựa vào màu.
- Handle phải có accessible name, focus-visible, Arrow/Home/End, clamp domain và pointer/keyboard đồng bộ; slider phải nối `<label>` + `<output>`.
- Màu semantic dùng `Sim2Palette`/`--sim-c-*`, không rải hex tùy ý.
- Sim3 dùng hệ tay phải canonical: `+X` phải, `+Y` lên, `+Z` hướng người xem; horizontal `(x,y)->(x,elevation,-y)`, vertical `(x,y)->(x,y,depth)`. Adapter không tự định nghĩa trục/plane thứ hai.
- Sim3 render theo nhu cầu; continuous RAF chỉ khi adapter khai báo rõ. Mọi lỗi Three/WebGL/create/setup/update/render/resize phải fallback về Sim2 với status tiếng Việt và không để blank state.
- Test correctness phải dùng independent numeric/geometric oracle. `__SIM3_DEBUG__`, DOM text, tên route hoặc snapshot không được là oracle duy nhất.
- Capture/probe phải run-specific, fresh, đủ exact route/shot set, không duplicate/fallback-only/console error. Snapshot update chỉ chạy thủ công sau review actual/expected/diff; không nới threshold để che lỗi.

## Generated file policy

| Output | Cách cập nhật |
|---|---|
| `chapters/*.html`, `images/` | `tools/extract_docx.py --write` |
| `tools/docx_site_manifest.json`, `tools/equation_report.json` | Extractor |
| Nav/route maps | `tools/update_nav.py` |
| `js/pages.js` | `tools/bundle_pages.py` |
| `data/equation_mapping.json` | Review, validate và merge qua tools |
| `lib/pdfjs/{pdfjs-runtime.iife.min.js,pdf-data.js,provenance.json}` | `npm run build:pdf-assets` |

Extractor phải chuẩn hóa tên ảnh, không phát sinh tên asset không ổn định, và không render placeholder số công thức `(.)`. Content test phải giữ guard cho placeholder và route Section VII đã xóa, gồm Chương 3 VII-4/VII-5/VII-6.

Không sửa tay artifact trong `lib/pdfjs/`, không thêm CDN/runtime module import. PDF.js phải pin chính xác; builder phải giữ `enableScripting:false`, `useWasm:false`, preload fake-worker handler và ghi SHA/provenance/license.

## State keys ổn định

`theme`, `fontZoom`, `chlyt_quiz_attempts`, `chlyt_progress`, `chlyt_bookmarks`, `chlyt_notes`. `quizScores` chỉ được đọc để lazy-migrate aggregate cũ; không ghi song song. Không đổi key nếu chưa có migration rõ.

## JavaScript và Python

- DOM hook chỉ chạy sau khi fragment vào `#content-area`.
- Error phải có ngữ cảnh, không âm thầm nuốt lỗi publish.
- Math ưu tiên KaTeX/MathML accessible; không dùng raster figure cho công thức.
- Python dùng path root-relative, không hardcode máy cụ thể ngoài tham số CLI.
- Write mode phải fail sớm khi thiếu dependency bắt buộc.

## Validation theo phạm vi

```powershell
npm run test:content
npm run test:quiz
npm run test:quiz:browser
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim:release:full
npm run test:sim:release:soak
npm run test:sim3:pilot
node tools/sim-validation/validate-simulation-drift.js --require-verified
npm run test:pdf:release
npm run test:equations
npm run test:audit:strict
python -m compileall -q tools
python tools\audit.py
```

Khi publish semantic math hoặc ảnh, chạy thêm `python tools\audit.py --strict-equations` và `python tools\audit.py --strict-images`.

## Content rules

- Sửa textbook trong DOCX rồi regenerate, không vá fragment bằng tay.
- Chạy nav, bundle và audit sau mỗi thay đổi fragment.
- Figure dùng `<figure><img alt><figcaption></figure>`; alt/caption phải cụ thể.
- Không dùng `backups/`, `Old/` hoặc tag lịch sử làm source of truth hiện tại.
