# Plan — Pipeline đánh giá visual + chất lượng thực tế 25 sim SVG-first

- Ngày: 2026-05-31 · Mode: `--deep --tdd` · Trạng thái: **completed** (đã chạy e2e + báo cáo)
- Brainstorm nguồn: `plans/reports/brainstorm-design-260531-2122-sim2-visual-quality-eval-pipeline-report.md`
- Mục tiêu: dựng pipeline DEV-ONLY chụp ảnh thật 25 sim → Claude soi lỗi thô → contact-sheet → user duyệt mắt → báo cáo danh sách lỗi. **CHỈ đánh giá, KHÔNG sửa sim.**

## Phát hiện then chốt (đã verify, không đoán)
1. Manifest KHÔNG có cờ static/dynamic → **phân loại tại runtime** bằng detect `.sim2-playback` sau mount (`controls.js:79`). Số sim động THỰC có thể >9 (Ch2+Ch3 nhiều animation). KHÔNG hardcode.
2. Sim động có nút step `⏭` → `onStep()` tiến đúng 1 frame deterministic (`ch3-6-2.js:96`). Dùng **nút step** làm cơ chế tua chính; Clock API + tick RAF thủ công chỉ là fallback.
3. Cảnh báo wrap-around: `frame()` tự reset khi vật ra khung → mốc frame phải có nghĩa, có per-sim override.
4. Tái dùng fixture `tests/fixtures/sim2-ch{1,2,3}.html` + mount qua `SIM_MAP` + count từ manifest length.

## Ràng buộc bất biến
- DEV-ONLY: không vào runtime `file://`, 0 dependency runtime mới (Playwright đã có devDeps).
- KHÔNG sửa code `js/sim2/` (chỉ đọc). `npm run test:sim:release` phải vẫn xanh.
- Đếm route từ manifest, KHÔNG hardcode 25 / 43.

## Phases

| # | Phase | Trạng thái | File |
|---|---|---|---|
| 01 | Test-first: capture-plan builder + contact-sheet gen (pure logic) | completed | [phase-01](phase-01-test-first-pure-logic.md) |
| 02 | Playwright capture script (classify + screenshot + step-capture) | completed | [phase-02](phase-02-playwright-capture-script.md) |
| 03 | Contact-sheet generator + Claude soi lỗi thô | completed | [phase-03](phase-03-contact-sheet-and-claude-triage.md) |
| 04 | Chạy end-to-end → user duyệt → báo cáo danh sách lỗi | completed | [phase-04](phase-04-run-review-eval-report.md) |

## Quyết định cho câu hỏi mở (ĐÃ CHỐT 2026-05-31)
- **(1) Mốc frame sim động:** ✅ mẫu cơ học (frame 0 / step×N1 / step×N2; default N1=60, N2=120) + Claude điền override per-sim cho sim wrap sớm sau khi soi (vd ch3-6-2 → mốc va chạm). KISS cho v1.
- **(2) Lưu ảnh:** ✅ `plans/260531-2122-.../visuals/`; gitignore PNG (nặng), commit `contact-sheet.html` + `findings-report.md`.

## Dependencies
- Phase 02 blockedBy 01 · Phase 03 blockedBy 02 · Phase 04 blockedBy 03.

## Success (toàn plan)
- Mọi route trong manifest có ảnh thật; sim động có ≥3 frame mốc.
- Contact-sheet đủ N route + cờ nghi vấn Claude. User duyệt → báo cáo lỗi phân mức + ảnh kèm.
- `test:sim:release` xanh; pipeline dev-only không phá ràng buộc offline.

## Out of scope
- Sửa bất kỳ sim nào. Adopt `toHaveScreenshot` baseline (để phase sau, sau khi sửa lỗi).
