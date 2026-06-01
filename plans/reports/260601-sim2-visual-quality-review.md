# Sim2 Visual Quality Review

---
date: 2026-06-01
type: review
scope: 25 current sim2 simulations
status: completed
---

## Summary

Đánh giá hiện trạng 25 mô phỏng `js/sim2/`: kỹ thuật ổn, visual đạt mức dùng được để bàn giao nội bộ/offline. Không thấy lỗi blocking: không trắng màn, không crash, không nhãn chồng rõ, không panel/control mất trên desktop capture.

Điểm yếu chính không nằm ở engine mà ở độ khớp sư phạm vài route: một số mô phỏng còn tối giản, chưa biểu đạt đủ tất cả ý trong tiêu đề. Route đáng chú ý nhất: `ch2-3-2`.

## Evidence

| Gate | Kết quả |
|---|---|
| `npm run test:sim:physics` | PASS |
| `npm run test:sim:mount` | PASS, 88/88 |
| `npm run test:sim:visual:unit` | PASS |
| `npm run test:sim:visual:capture` | PASS, 25/25 |
| `node tools/sim2-visual/build-contact-sheet.js` | PASS, 25 route, 58 ảnh |
| `npm run test:sim:release` | PASS |

Artifact review:

- `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet.html`
- `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet-full.png`
- `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/capture-manifest.json`

## Findings

### High

Không có.

### Medium

Không có lỗi medium đã thấy trong desktop capture hiện tại.

### Low

| Route | Nhận xét | Tác động |
|---|---|---|
| `ch2-3-2` | Tiêu đề là "Truyền động bánh răng-dai-puli", nhưng visual hiện chỉ minh họa 2 bánh răng ăn khớp. Công thức/observe có nhắc `v đai`, gây cảm giác thiếu ca đai/puli. | Không sai physics nếu coi đây là ca ăn khớp. Nhưng learner có thể kỳ vọng thấy đai/puli thật. |

### Observations

- Ch1 tĩnh học: rõ, dễ đọc, vector/phản lực/mô men/trọng tâm đủ ý. Visual đơn giản nhưng đúng mục tiêu "ít mà tinh".
- Ch2 động học: dynamic routes có frame tiến thật qua step capture; quỹ đạo, Coriolis, IC, phân bố vận tốc đọc được. `ch2-3-2` là route duy nhất có mismatch tiêu đề-visual.
- Ch3 động lực học: các route chính biểu đạt đúng ý cốt lõi: Newton II/III, hệ quy chiếu phi quán tính, RK4 lò xo, động lượng, mô men động lượng, công-năng, va chạm.
- Shared shell tốt: panel công thức, legend, readout, control thống nhất; giảm mạnh cảm giác "mỗi route một kiểu".
- Capture hiện tại chủ yếu kiểm desktop 960px. Mobile/responsive có guideline và mount tests, nhưng chưa có contact-sheet mobile đầy đủ cho 25 route.

## Recommendations

1. Chốt hiện trạng là acceptable cho review nội bộ/offline release nếu không yêu cầu minh họa cao cấp.
2. Sửa hoặc đổi tên `ch2-3-2`: hoặc chỉ gọi là "Truyền động bánh răng ăn khớp", hoặc thêm mode/visual đai-puli thật. Ưu tiên đổi tên nếu cần KISS.
3. Thêm một capture pass mobile/tablet cho 25 route nếu mục tiêu là nghiệm thu visual chính thức.
4. Giữ hướng SVG-first/shared shell. Không nên quay lại canvas-heavy hoặc route-specific shell trừ khi có yêu cầu sư phạm rõ.

## Unresolved Questions

- Có cần `ch2-3-2` thể hiện đủ cả bánh răng, đai, puli trong cùng route không, hay đổi tên để đúng visual hiện tại?
- Nghiệm thu visual có yêu cầu mobile screenshot evidence 25/25 không?
