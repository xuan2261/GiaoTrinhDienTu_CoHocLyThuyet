---
type: audit-report
date: 2026-08-20
scope: Todo_For_GiaoTrinhDienTu.txt
status: completed-with-one-failing-gate
---

# Báo cáo audit toàn diện Todo giáo trình điện tử

## 1. Hợp đồng đánh giá

- **Kết quả cần đạt:** đối chiếu toàn bộ 12 gói công việc trong `Todo_For_GiaoTrinhDienTu.txt` với source, dữ liệu, tài liệu, release và QA hiện hành; chạy kiểm thử; kết luận mức sẵn sàng nghiệm thu.
- **Ràng buộc:** không sửa source/generated artifacts; không suy diễn chức năng, chứng nhận, phê duyệt hoặc kết quả học thuật chưa có bằng chứng; phân biệt kỹ thuật với thẩm định chuyên gia/pháp lý.
- **Ngoài phạm vi:** không triển khai backlog; không sửa lỗi; không chứng nhận WCAG, pháp lý, học thuật hoặc LMS thay cho đơn vị có thẩm quyền.
- **Tiêu chí chấp nhận:** 12/12 gói có trạng thái, bằng chứng, khoảng trống; QA được chạy mới; failure có chẩn đoán nguyên nhân; khuyến nghị ưu tiên rõ.

## 2. Kết luận điều hành

- **Trạng thái chung:** chưa đủ điều kiện chốt nghiệm thu cuối.
- **Nền tảng mạnh:** runtime offline, DOCX pipeline, semantic math kỹ thuật, 25 Sim2, 10 Sim3 pilot, PDF viewer, GIF fallback và QA kỹ thuật.
- **Khoảng trống P0 quyết định:** ma trận yêu cầu/chuẩn đầu ra, thẩm định học thuật, full-text search, Simulation Specification, assessment metadata, WCAG 2.2 AA audit, release manifest/provenance/evidence package.
- **QA:** 205 Playwright tests đã pass; content, quiz schema, Sim2 physics, strict image/formula audit và PDF vendor contract pass. `npm run test:equations` fail tại baseline lịch sử.
- **Root cause failure:** `scripts/test-phase-01-baseline-html-chapter-formula-image-ref-counts.py` hard-code `117` HTML/`127` ảnh, trong khi tree hiện tại có `114` HTML/`126` ảnh sau các cleanup route/asset có chủ đích. Đây là test baseline lỗi thời, không phải lỗi render công thức hiện tại.

## 3. Ma trận 12 gói công việc

| # | Gói | Trạng thái | Bằng chứng hiện có | Khoảng trống chính |
|---|---|---|---|---|
| 1 | Pháp lý, học thuật, nghiệm thu | **Thiếu/P0** | PDR, docs trạng thái, plan báo cáo nộp | Không có RTM chính thức, mapping chuẩn đầu ra, SME/legal approval, sổ người kiểm tra/phê duyệt |
| 2 | DOCX → web pipeline | **Một phần mạnh/P0** | `extract_docx.py`, nav, bundle, audit, generated-file policy | Không có `build:release`; manifest thiếu `routeId/source/version`; chưa có reproducibility proof 100% |
| 3 | Nội dung chuyên môn và công thức | **Một phần/P0** | 702 mapping reviewed; MathML/KaTeX; strict formula guard | Chưa có xác nhận toàn bộ ký hiệu, SI, số phương trình, thuật ngữ và review chuyên gia |
| 4 | Hình ảnh/minh họa | **Một phần/P0** | 126 figure hợp lệ; strict image gate; alt/caption pipeline | Alt còn yếu ở một số record; thiếu provenance/quyền, extended description, DPI/SVG/blur/visual publish baseline |
| 5 | Full-text search | **Chưa triển khai/P0** | Search tiêu đề nav, keyboard, no-result, offline route | Không có index body/heading/glossary/caption, snippet, highlight, ranking, anchor, Unicode folding |
| 6 | Sim2 có kiểm chứng | **Một phần mạnh/P0** | 25 route; physics/core/factory; 110 mount tests; physics suites | Không có Simulation Specification đầy đủ cho 25 route; text alternative/device/visual gate chưa hoàn chỉnh |
| 7 | Sim3 và 4D | **Pilot/P1** | 10 adapter, 2D fallback, state sync, dispose tests | Thiếu review giá trị sư phạm từng route, camera reset/limit, low-end device, GLB pipeline; 4D chưa có artifact |
| 8 | Video/audio | **Chưa triển khai/P1** | 20 GIF chỉ là ảnh động | Không có video/audio, script, caption, transcript, metadata hoặc offline media QA |
| 9 | Assessment | **Một phần/P0** | 3 bank × 100 câu; all/random; feedback; schema/render tests | Thiếu stable ID, LO, difficulty/type/source/version, attempt history, timing, percent/pass/policy/persistence test |
| 10 | WCAG 2.2 AA | **Chưa đủ bằng chứng/P0** | `lang=vi`, reduced motion, một số ARIA/focus, native PDF dialog | Không skip link; quiz không keyboard-semantic; alt yếu; thiếu contrast/zoom/text-spacing/screen-reader/manual+automated audit |
| 11 | Release engineering | **Một phần/P0** | ZIP 20260816; clean runtime tree; PDF.js provenance; smoke docs | Không release manifest, VERSION, SHA256SUMS, notices/license/dependency inventory, release notes, commit/DOCX checksum |
| 12 | LMS interoperability | **Chưa triển khai/P2** | Không có artifact | Không SCORM/QTI/xAPI/cmi5/Common Cartridge; không phải defect của standalone hiện tại |

## 4. Phân tích chi tiết theo nhóm

### 4.1 Gói 1–4: nội dung, pipeline, công thức, hình

- `CoHocLyThuyet_Full_New.docx` được quy định là nguồn chuẩn; generated files có policy không sửa tay.
- Pipeline hiện là nhiều lệnh rời: analyze → extract → nav → bundle → audit. Không có orchestration phát hành fail-fast duy nhất.
- `tools/docx_site_manifest.json` là outline snapshot, chưa đạt schema truy vết yêu cầu; còn dấu vết absolute source path cũ, làm giảm tính portable.
- Strict audit hiện quan sát `96` content files, `126` figure hợp lệ, `515` math-inline, `276` math-display, `0` missing/unwrapped/formula-image suspects.
- Equation mapping/review chứng minh xử lý kỹ thuật, không chứng minh công thức đúng học thuật hoặc nhất quán SI trên toàn giáo trình.
- `chapters/tai-lieu-tham-khao.html` có danh mục sách nhưng chưa truy nguồn từng hình/bảng/trích dẫn.
- Cơ chế alt/caption tồn tại; tuy nhiên `data/image_alt_overrides.json` và bundle còn alt dạng số ở một số hình, chưa đạt text alternative tương đương mục đích.

### 4.2 Gói 5–8: search, mô phỏng, media

- `js/app.js` xây `SDB` chỉ từ `.l2/.l3` sidebar và bốn trang tĩnh; `doSearch()` chỉ `toLowerCase().includes()` và giới hạn 12 kết quả.
- Reproduction live: truy vấn nội dung thân bài `vô cùng bé` trả `KHÔNG TÌM THẤY`; truy vấn tiêu đề `Mô men` trả 3 mục. `SDB` có 106 entry nav.
- Sim2 có kiến trúc đúng hướng: physics tính state, shared transform/core render SVG/overlay, route factory trả `dispose()`.
- Manifest Sim2 chỉ có `id/chapter/name`; chưa lưu learning objective, assumption, input range/unit, invariant, expected result và sample test.
- Sim3 có fallback/dispose/state sync tốt; chưa có hồ sơ chứng minh 3D tăng hiểu bài trên từng route.
- Không tìm thấy video/audio/media pipeline; GIF là ảnh động và đã có reduced-motion + PNG fallback.

### 4.3 Gói 9–10: assessment và accessibility

- Quiz schema thực tế: `question`, `options`, `correct`, `section`, `feedbackCorrect`, `feedbackWrong`.
- Runtime chỉ lưu aggregate `correct/wrong/total/answered`; không có history, timing, raw/percent/pass hoặc restore attempt.
- Reproduction live: `.q-opt` là `DIV`, không `role`, không `tabindex`, dùng `onclick`; vùng quiz không có `aria-live`. Đây là blocker keyboard/screen-reader rõ.
- Trang có `lang="vi"`, không có skip link. Focus/reduced-motion hiện mới bao phủ từng component, chưa phải conformance toàn site.
- Không có artifact chứng minh test contrast AA, zoom 200%, text spacing, target size, screen reader hoặc audit kết hợp automated/manual.
- Cách diễn đạt an toàn hiện tại: **“Hướng tới WCAG 2.2 Level AA”**; chưa được ghi **“Đáp ứng WCAG 2.2 Level AA”**.

### 4.4 Gói 11–12: release và LMS

- Release 20260816 chứa runtime cần thiết và không thấy `node_modules/tests/tools/plans` trong tree đọc được.
- SHA-256 quan sát mới: ZIP `f5617ca6976403a88a44353543ab32434a192da3370090add102d63f03d638e4`; DOCX `6b02a5b03f56f2d1bcc228de27fed67454efc43502000757273a7a99eaac2e14`; PDF `b755b06cf919a979e278f635aa2fedfe249a97342ccd93d2d15875e87ff835d9`.
- Hash PDF khớp `lib/pdfjs/provenance.json`; provenance này chỉ bao phủ PDF/PDF.js, không thay thế release manifest.
- Tài liệu chưa đồng bộ: README nêu ZIP 20260816; PDR/deployment/codebase summary còn gọi 20260812 là hiện tại.
- Không tìm thấy LMS/QTI/SCORM/xAPI/cmi5/Common Cartridge. Giữ P2 cho đến khi standalone đạt P0 là quyết định đúng KISS/YAGNI.

## 5. Kết quả `/ak:debug` và `/ak:test`

| Lệnh/phạm vi | Kết quả |
|---|---|
| Syntax: `node --check` 3 JS + `python -m compileall -q tools` | PASS |
| `npm run test:content` | PASS, 3/3 gates |
| `npm run test:quiz` | PASS |
| `npm run test:equations` | FAIL tại phase 01: expected 117 HTML, got 114 |
| Equation phase 02, 03A, 03B, 04, 05, 06 chạy riêng | PASS, 6/6 |
| `npm run test:audit:strict` | PASS: 96 files, 126 figures, 0 warnings/errors |
| `npm run test:gif` | PASS: 20 GIF + 4 Playwright tests |
| `npm run test:sim:physics` | PASS: 25 route, 9 suites |
| `npm run test:sim:mount` | PASS: 110 tests |
| `npm run test:app` | PASS: 6 tests |
| `npm run test:quiz:browser` | PASS: 3 tests |
| `npm run test:sim3:pilot` | PASS: 19 tests |
| `npm run test:pdf:vendor` | PASS |
| `npm run test:pdf:transport` | PASS: 6 tests |
| `npm run test:pdf:browser` | PASS: 51 tests |
| `npm run test:pdf:installed` | PASS: 6 tests |

Tổng Playwright đã chạy và pass: **205 tests**. Cảnh báo duy nhất lặp lại: `NO_COLOR` bị bỏ qua do `FORCE_COLOR`; không ảnh hưởng kết quả.

### Chẩn đoán failure equation gate

1. Test phase 01 tự mô tả là baseline lịch sử và hard-code `EXPECTED_FILES=117`, `EXPECTED_IMGS=127`.
2. Changelog ghi baseline trước đó 120/127; sau đó dự án chủ động xóa ba route `ch*-7-3`, rồi tiếp tục xóa Chương 3 VII-4/VII-5/VII-6 và unused assets.
3. Tree hiện tại do chính helper của test quan sát là 114 HTML; strict audit quan sát 126 figure và không có lỗi equation/image.
4. Sáu phase test sau đều pass.
5. **Kết luận root cause:** baseline count không được migrate cùng content cleanup. Test đang khóa lịch sử, không khóa contract hiện hành.
6. Không sửa trong audit này. Cần quyết định contract mới trước khi cập nhật test: khóa manifest/routes có ý nghĩa thay vì khóa tổng file/image count dễ vỡ.

## 6. Kiểm chứng nguồn chuẩn bên ngoài

- Thông tư 35/2021: xác nhận đúng tên/phạm vi; tình trạng còn hiệu lực cần kiểm bằng toàn văn/cơ sở pháp luật chính thức.
- Thông tư 49/2026: xác nhận đúng tên/phạm vi; ngày hiệu lực 15/08/2026 chưa được xác nhận từ phần toàn văn reader trong lượt audit.
- WCAG 2.2 là W3C Recommendation; không suy ra sản phẩm đạt AA.
- glTF 2.0/2.0.1 là API-neutral runtime asset delivery format.
- QTI 3.0 là Final Release ngày 11/05/2022; repo chưa có QTI artifact.
- SCORM 2004 4th test suite tồn tại nhưng có prerequisite legacy Java 6/IE8; không nên mô tả là test stack hiện đại.
- Link ADL xAPI trong Todo là repo phiên bản cũ 1.0.3; current version được chính README trỏ sang xAPI 2.0/IEEE.
- Common Cartridge 1.4 được 1EdTech ghi **Candidate Final**, không phải Final.

Nguồn: <https://vanban.chinhphu.vn/default.aspx?docid=205065&pageid=27160>, <https://vanban.chinhphu.vn/?docid=218756&pageid=27160>, <https://www.w3.org/TR/2024/REC-WCAG22-20241212/>, <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html>, <https://www.1edtech.org/standards/qti/index>, <https://github.com/adlnet/SCORM-2004-4ed-Test-Suite>, <https://github.com/adlnet/xAPI-Spec>, <https://opensource.ieee.org/xapi/xapi-base-standard-documentation>, <https://www.1edtech.org/standards/cc>.

## 7. Khuyến nghị hành động

### P0 trước nghiệm thu

1. Lập RTM: yêu cầu → chức năng → phép kiểm → bằng chứng → trạng thái → owner/approver.
2. Ánh xạ chương, simulation và quiz tới mục tiêu học phần/chuẩn đầu ra; tổ chức SME review có biên bản.
3. Sửa contract equation gate lỗi thời; thay count tuyệt đối bằng manifest/route/content invariants có ý nghĩa.
4. Tạo `build:release` fail-fast: extract → nav → bundle → audit strict → tests → package → manifest/checksum.
5. Xây full-text search build-time, offline, có Unicode, snippet, highlight, ranking và anchor.
6. Viết 25 Simulation Specification và liên kết physics/visual/accessibility evidence.
7. Mở rộng quiz schema và attempt model; sửa option thành semantic keyboard controls.
8. Thực hiện WCAG 2.2 AA gap remediation + audit automated/manual + keyboard/screen-reader evidence.
9. Tạo release manifest, VERSION, SHA256SUMS, notices/license inventory, commit/source hashes và smoke evidence matrix.
10. Đồng bộ README/PDR/deployment/codebase summary về release hiện hành.

### P1 sau P0

- Review 10 Sim3 theo giá trị sư phạm; chuẩn hóa camera/device matrix.
- Chỉ bổ sung video/audio khi có learning objective, caption/transcript và offline QA.

### P2 khi có yêu cầu LMS

- Giữ core standalone độc lập; thêm adapter QTI/SCORM/xAPI/cmi5/Common Cartridge ngoài runtime canonical.

## 8. Câu hỏi chưa giải quyết

- Ai là chủ thể có thẩm quyền ký xác nhận học thuật, pháp lý, accessibility và nghiệm thu?
- Chuẩn đầu ra/mục tiêu học phần chính thức nằm trong tài liệu nào và phiên bản nào?
- Môi trường Word/Windows mục tiêu cho hồ sơ nộp và clean-machine release test là phiên bản/build nào?
- Thông tư 35/2021 còn hiệu lực và điều khoản hiệu lực của Thông tư 49/2026 cần được pháp chế xác nhận từ toàn văn chính thức.
