# Phase 01 — Test-first: pure logic (capture-plan builder + contact-sheet gen)

## Context links
- Plan: [plan.md](plan.md) · Brainstorm: `plans/reports/brainstorm-design-260531-2122-sim2-visual-quality-eval-pipeline-report.md`
- Manifest: `js/sim2/sim2-route-manifest.js` (nguồn count)

## Overview
- Priority: P0 (TDD gốc — viết test TRƯỚC implement) · Status: completed
- Tách phần logic THUẦN (chạy Node, không browser) ra khỏi script Playwright để test nhanh + xác định hợp đồng.

## Key Insights
- Phần testable không-browser: (a) **capture-plan builder** — từ manifest + bảng phân loại → danh sách job chụp + tên file kỳ vọng; (b) **contact-sheet generator** — từ list bản ghi ảnh → HTML chứa đủ N route.
- Phân loại static/động xảy ra ở RUNTIME (detect `.sim2-playback`) → builder nhận `classification` như tham số, KHÔNG tự đoán. Test bơm classification giả.
- Count LẤY từ `manifest.length`, test fail nếu builder bỏ sót route.

## Requirements
- `tools/sim2-visual/capture-plan.js` (UMD/CommonJS, Node-able): `buildCapturePlan(manifest, classifyMap, opts)` → `[{ route, chapter, section, kind:'static'|'dynamic', shots:[{label, frame}] }]`.
  - static → shots `[{label:'init',frame:0},{label:'live',frame:null}]`.
  - dynamic → shots `[{label:'t0',frame:0},{label:'mid',frame:N1},{label:'end',frame:N2}]`; N1/N2 từ `opts.stepDefaults` hoặc `opts.overrides[route]`.
- `tools/sim2-visual/contact-sheet.js`: `renderContactSheet(records)` → HTML string. `records=[{route,chapter,section,kind,images:[{label,src}],flags:[]}]`.
- `artifactName({route,label})` → `"<route>__<label>.png"` (dùng chung capture script + sheet).

## Architecture
```
tools/sim2-visual/
  capture-plan.js     ← pure, Node + browser (UMD)
  contact-sheet.js    ← pure, Node (HTML string builder)
tests/
  sim2-visual-capture-plan.test.js   ← node assert
  sim2-visual-contact-sheet.test.js  ← node assert
```

## Related code files
- Create: 2 lib + 2 test trên.
- Read: `js/sim2/sim2-route-manifest.js`.

## Implementation Steps (TDD)
1. Viết `sim2-visual-capture-plan.test.js` TRƯỚC (đỏ): assert `buildCapturePlan(manifest,{}).length === manifest.length`; mọi route có ≥1 shot; route được mark dynamic trong classifyMap có ≥3 shot; override áp đúng N1/N2; `artifactName` đúng format.
2. Viết `sim2-visual-contact-sheet.test.js` (đỏ): `renderContactSheet(recordsN)` chứa đủ N `route` id + section badge + chỗ chèn flag; HTML hợp lệ (1 `<html>`, đủ `<img>` = tổng shots).
3. Implement `capture-plan.js` + `contact-sheet.js` cho test xanh.
4. Thêm npm script `test:sim:visual:unit` = chạy 2 node test; nối vào tài liệu (chưa nối release).

## Todo
- [x] capture-plan test (đỏ → xanh)
- [x] contact-sheet test (đỏ → xanh)
- [x] 2 lib implement
- [x] npm script `test:sim:visual:unit`

## Success Criteria
- 2 node test xanh; builder đọc count từ manifest (đổi manifest → test phản ánh, không hardcode).
- Lib thuần, 0 phụ thuộc browser/Playwright.

## Risk Assessment
- Rủi ro: over-engineer builder. Mitigation: chỉ 3 hàm, YAGNI.

## Security Considerations
- HTML contact-sheet nhúng tên route nội bộ — escape text để tránh vỡ markup (dù nguồn tin cậy).

## Next steps
- Phase 02 dùng `buildCapturePlan` + `artifactName` để điều khiển Playwright.
