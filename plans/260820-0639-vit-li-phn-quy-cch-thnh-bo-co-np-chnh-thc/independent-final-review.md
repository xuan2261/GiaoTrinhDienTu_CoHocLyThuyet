# Independent final review – Option B DOCX

Ngày: 2026-08-26  
Orca Run: `run_afa35f7f64de`  
Phạm vi: `DeCuongChiTietNop.docx`, plan Option B và contact sheet liên quan.  
Chế độ: read-only; reviewer không sửa, stage, commit hoặc thay acceptance evidence.

## Lần review đầu

### Factual/spec reviewer

- Task: `task_5c11dcb37562`
- Dispatch: `ctx_a74babbe4243`
- Verdict: `NEEDS_CHANGES`
- Critical: 0; High: 0; Medium: 2; Low: 0.
- Medium 1: claim 5.246 từ/25,6% không có tokenizer tái lập nhất quán với baseline 7.054.
- Medium 2: plan claim contact sheet 36 trang nhưng evidence cuối có trang 37 chưa nằm trong sheet.
- Các mục khác pass: boundary, prefix/final `sectPr`, 31 TC, B1–B12, candidate/hash, 20 pass/3 blocked/1 not-run, QTI/CC/LMS limits, search/quiz caveats và không giả signoff.

### DOCX quality reviewer

- Task: `task_74d5c58b3139`
- Dispatch: `ctx_e6762fb1accf`
- Verdict: `NEEDS_CHANGES`
- Critical: 0; High: 1; Medium: 2; Low: 1.
- High: IMG-01/03/04/05 bị biến dạng tỷ lệ 13,5%–70,4% do extent không khớp pixel nguồn.
- Medium 1: contact sheet chưa gắn đúng hash/tập trang cuối.
- Medium 2: Phase 5 claim numbering/cross-reference nhưng boundary chưa có SEQ field hoặc bookmark.
- Low: 65 media relationship kế thừa không được dùng; không có target hỏng.
- Structural pass: prefix/final `sectPr`, QC outline/TOC source, 3 bảng, 6 ảnh, 42-row/7-column matrix, 31 TC, B1–B12, provenance, alt text và không có placeholder leak.

## Remediation

- Sửa extent của 6 ảnh về đúng tỷ lệ pixel; không crop.
- Chuyển 9 caption sang complex `SEQ` field và bookmark `_QC_*` duy nhất.
- Rút nội dung và công bố tokenizer tái lập: nối `w:t` trong mỗi block cấp thân, nối block bằng một khoảng trắng, đếm regex Unicode `\w+(?:-\w+)*`.
- Metric: baseline 7.054; final 5.280; giảm 25,1%.
- Sinh contact sheet đầy đủ 35 trang từ đúng DOCX hash.

## Re-review

### Factual re-review

- Task: `task_e09cd0d31a16`
- Dispatch: `ctx_98e01650ef34`
- Verdict: `PASS`.
- Critical: 0; High: 0; Medium: 0.
- Xác nhận metric 7.054 → 5.280 = 25,1%, 31 TC, B1–B12, release state 20/3/1, DOCX/contact-sheet hashes và plan alignment.

### DOCX quality re-review

- Task: `task_9a0a22c27ea9`
- Dispatch: `ctx_426cac408da8`
- Verdict: `PASS`.
- Critical: 0; High: 0; Medium: 0; Low: 1.
- Xác nhận 6 ảnh đúng tỷ lệ gần nhất theo EMU, 9 SEQ chains + 9 unique bookmarks, đủ 35 trang, không clipping/orphan/low-density final page, boundary/tables/31 TC/B1–B12 không regress.
- Low còn lại: 65 media relationship kế thừa không dùng; non-blocking và không có broken target.

## Hash-bound evidence

- DOCX SHA-256: `2522bbc41994a1e018f567d2ad89d3593d6a56a371ce95e37d5bfd4e39335571`.
- Contact sheet: `evidence/option-b-contact-sheet-2522bbc4.png`.
- Contact sheet SHA-256: `bc864d821a59e920c1754feea32522ade597455b330c783ecc38ca1d245dc3b5`.

## Final verdict

`PASS` cho independent final review của tài liệu Option B: Critical 0, High 0, Medium 0.

Review này không đóng các gate sản phẩm độc lập trong `data/acceptance-report.json`. Word standalone round-trip vẫn `not-run`; OpenXML schema validation vẫn chưa có do `officecli validate` lỗi dependency. Không công bố final institutional release hoặc LMS certification.