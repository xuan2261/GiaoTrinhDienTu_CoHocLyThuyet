# Phase 04 — Visual capture + soi multimodal (Sim2 25 + Sim3 10)

**Plan:** [plan.md](plan.md) · **TDD:** không (chạy tool sẵn + soi) · **Status:** ✅ done · **Blocked by:** — (song song probe)

## Context Links
- `tools/sim2-visual/` — pipeline capture Sim2 25 route (sẵn)
- `tools/sim3-visual/pilot-capture.spec.js` — capture Sim3 10 route (sẵn)
- Memory `sim2-visual-qa-pipeline` — bài học Bug A/B/C ảnh hỏng

## Overview
**Priority:** trung. Chạy 2 pipeline capture sẵn → 35 ảnh runtime thật → soi multimodal trục 1 (visual) + đối chiếu trục 2 (physics/nhãn trên ảnh).

## Key Insights
- KHÔNG viết tool mới — pipeline sẵn đã chụp full card + app CSS + theme light.
- **Verify ảnh hợp lệ TRƯỚC khi tin** (bài học cũ): mỗi ảnh phải thấy panel + legend chấm-màu + control. Ảnh crop/thiếu CSS → triage sai.
- Soi multimodal = `ai-multimodal` skill mô tả chi tiết từng ảnh.

## Requirements
**Functional:** 35 ảnh PNG + 2 contact-sheet HTML vào `plans/.../visuals/`. Mỗi ảnh có nhận xét visual: bố cục, dead-space, nhãn chồng, chiều sâu/màu, tương phản ≥3:1, crop an toàn; + đối chiếu công thức-tô-màu/readout.
**Non-functional:** ảnh offline mở được.

## Architecture
1. `npm run test:sim:visual:capture` → Sim2 25 ảnh + contact-sheet.
2. `npm run test:sim3:visual:capture` → Sim3 10 ảnh + contact-sheet.
3. Copy/point outDir vào `plans/260608-1559-sim-fullquality-triage/visuals/`.
4. Soi từng ảnh (multimodal) → ghi `visuals/visual-review-notes.md` (route × nhận xét × severity).

## Related Code Files
**Đọc/chạy:** 2 pipeline sẵn.
**Tạo:** `visuals/visual-review-notes.md`, ảnh + contact-sheet.
**KHÔNG sửa:** sim, fixture, spec (trừ chỉnh outDir qua env nếu cần).

## Implementation Steps
1. Chạy `test:sim:physics` (9 node test) → ghi pass/fail trục 2 nền tảng.
2. Chạy 2 capture spec → sinh ảnh.
3. **Gate verify ảnh:** mỗi ảnh có panel+legend+control? Thiếu → debug capture (env host/CSS) trước khi soi.
4. Soi multimodal 35 ảnh → nhận xét + severity.
5. Đối chiếu công thức tô màu khớp vector + readout hợp lý trên ảnh (trục 2 visual).
6. Ghi `visual-review-notes.md`.

## Todo List
- [ ] test:sim:physics → log kết quả
- [ ] Capture Sim2 25 ảnh
- [ ] Capture Sim3 10 ảnh
- [ ] Gate verify ảnh hợp lệ
- [ ] Soi multimodal 35 ảnh
- [ ] Đối chiếu physics/nhãn trên ảnh
- [ ] visual-review-notes.md

## Success Criteria
35 ảnh hợp lệ (panel+legend+control); mỗi route có nhận xét visual + severity; `test:sim:physics` kết quả ghi nhận; contact-sheet mở offline.

## Risk Assessment
- Ảnh hỏng kiểu Bug A/B/C tái diễn → gate bước 3 chặn; nếu hỏng, sửa env capture (KHÔNG sửa sim).
- Sim3 WebGL fail trong capture → ảnh fallback 2D; ghi nhận route nào không lên 3D được.
- Soi mắt chủ quan → bám tiêu chí cụ thể (dead-space %, overlap count, contrast) thay vì "đẹp/xấu".

## Security Considerations
Không.

## Next Steps
P5 gom visual-review-notes + probe JSON → triage tổng.
