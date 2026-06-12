---
phase: 2
title: "Wire slider-far into capture specs (Sim2 plan-driven + Sim3 bespoke) + run"
status: complete
priority: P1
effort: "3.5h"
dependencies: [1]
---

# Phase 2: Wire slider-far vào capture — Sim2 (plan-driven) + Sim3 (bespoke) + chạy

## Overview
Nối `slider-far` vào 2 đường capture KHÁC NHAU: Sim2 (plan-driven qua buildCapturePlan) và Sim3
(pilot hardcode riêng). Đọc slider-target từ `probe-targets.js`, set slider tới biên XA init, chụp.

## DISCOVERY red-team (ĐỌC TRƯỚC KHI CODE — đã verify file:line)

- **Sim3 spec KHÔNG mirror Sim2.** `tools/sim3-visual/pilot-capture.spec.js:12-23` là mảng 10 case
  hardcode, KHÔNG dùng `buildCapturePlan`/manifest/shots, mỗi case chụp 1 ảnh `${id}-sim3.png`
  (`:63`) + audit cố định (`:84-106`), afterAll KHÔNG có guard count (`:33-36`). → Sim3 là đường
  code ĐỘC LẬP, viết slider-far riêng, KHÔNG tái dùng buildCapturePlan.
- **Key probe-targets Sim3 có hậu tố `#sim3`** (`probe-targets.js:57-63`) còn pilot dùng `cfg.id` trần
  (`:13`). → Tra `SIM3[cfg.id + '#sim3']` hoặc `targetsFor(cfg.id+'#sim3')`. Tra `cfg.id` trần → undefined → 0 slider-far âm thầm.
- **Route vừa dynamic vừa có slider** (ch2-3-2, ch3-2-2, ch3-3-1, ch3-5-3 — route-map playback +
  probe-targets.js:40,46,48,51): capture mount 1 LẦN, step tích luỹ tới frame 120
  (`capture-sims.spec.js:76,90-104`). Set slider lúc này = frame TRỘN (120-frame-evolved + param mới)
  → grader không tách được hiệu ứng slider → rơi đúng false-fail. Probe remount mỗi control vì lý do
  này (`probe-runner.spec.js:243-251`).

## Requirements
- Functional: route eligible sinh ảnh tương tác (slider-far/drag-far) phản ánh trạng thái sau khi
  set control tới biên XA init.
- Non-functional: invariant count GIỮ ở Sim2 + THÊM ở Sim3; mọi PNG đủ card; route dynamic reset trước chụp.

## Architecture

### Sim2 (capture-sims.spec.js)
1. Build `interactionTargets`:
   - slider (16): `SimProbeTargets.SIM2[id].targets[0]` → `{kind:'slider', control, lo, hi}`.
   - drag (5): route-map controls `kind:'drag-handle'` cho ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2
     → `{kind:'drag', selector}` (default `.sim2-handle`).
   Truyền vào `buildCapturePlan`.
2. Vòng shot: **đặt check shot tương tác (`slider-far`/`drag-far`) TRƯỚC nhánh `job.kind==='dynamic'`**
   (red-team #2 — nếu sau, shot frame-null rơi vào nhánh dynamic → chỉ waitRaf, KHÔNG set control).
3. Nhánh slider-far:
   a. Nếu `job.kind==='dynamic'`: click `.sim2-reset` (về t=0, stop) TRƯỚC. Nếu reset KHÔNG sạch
      (verify step 1) → BỎ shot, log, fallback (ràng buộc #7).
   b. Đọc biên DOM (`input[data-id=control].min/max`) + giá trị init slider.
   c. Resolve target = biên XA init nhất (clamp lo/hi): `init>=mid ? (lo??min) : (hi??max)`.
   d. setSlider (dispatch 'input') → chờ readout ổn định (poll 2 lần giống nhau, fallback waitRaf(4)).
   e. screenshot `#host`.
4. Nhánh drag-far:
   a. Reset-if-dynamic như trên.
   b. `dragHandle(page, selector)` (tái dùng probe-runner:127-147 — kéo handle 28% bề rộng SVG).
   c. Nếu drag fail/handle 0 → BỎ shot, log, fallback ảnh init (ràng buộc #9, KHÔNG fail capture).
   d. waitRaf(2) → screenshot `#host`.

### Sim3 (pilot-capture.spec.js — đường riêng)
1. Sau ảnh `${id}-sim3.png` hiện có, nếu `targetsFor(cfg.id+'#sim3')` tồn tại:
   a. click `.sim2-reset` (về trạng thái sạch) + đảm bảo đang ở 3D.
   b. setSlider tới biên XA init (cùng heuristic Sim2).
   c. poll 1 field `__SIM3_DEBUG__` ổn định (KHÔNG chỉ waitRaf — 3D settle bất đồng bộ, theo
      pattern `expect.poll` pilot `:58-61`).
   d. screenshot → file `${cfg.id}-sim3__slider-far.png`, push vào `images[]`.
2. afterAll: THÊM guard count (đếm ảnh kỳ vọng = base 10 + Σ slider-far eligible) — vá red-team #5.

## Related Code Files
- Modify: `tools/sim2-visual/capture-sims.spec.js`
- Modify: `tools/sim3-visual/pilot-capture.spec.js`
- Read-only: `tools/sim-probe/probe-targets.js`, `probe-runner.spec.js` (setSlider/poll ref), `js/sim2/sims/*.js` (verify onInput reset behavior — câu hỏi mở #1)

## Implementation Steps
1. Verify câu hỏi mở: đọc onInput của ch2-3-2/ch3-2-2/ch3-3-1/ch3-5-3 source — áp param tại frame
   hiện tại hay reset? Xác nhận `.sim2-reset` đưa về t=0 sạch. Verify 1-2 sim có dùng CSS/rAF easing slider không (chốt poll vs waitRaf).
2. Sim2: build interactionTargets (16 slider + 5 drag), sửa thứ tự nhánh, thêm nhánh slider-far +
   drag-far (reset-if-dynamic + resolve biên xa/dragHandle + poll + shot + fallback-log).
3. Sim3: thêm slider-far vào pilot loop + guard count afterAll.
4. Chạy `npm run test:sim:visual:capture` + `npm run test:sim3:visual:capture`.
5. Cổng toàn vẹn: mọi PNG > vài KB, không tile trắng/crop; 16+5 Sim2 + 5 Sim3 có ảnh tương tác.
6. Dựng/refresh contact-sheet (verify renderer Sim3 không vỡ khi images[] dài thêm).
7. `npm run test:sim:release` xanh.
8. drag-far cho 5 route bespoke-drag (ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2 — validation Q1):
   verify ảnh post-drag có đổi rõ so init; ch2-1-3 + ch2-5-2 là false-fail cũ (2231:38) → post-drag
   diệt tận gốc. Nếu dragHandle không đo được → fallback init + probe (red-team #8, ràng buộc #9).

## Success Criteria
- [ ] `test:sim:visual:capture` 25/25 + `test:sim3:visual:capture` 10/10 pass.
- [ ] 16 slider-far + 5 drag-far (Sim2) + 5 slider-far (Sim3) có ảnh tương tác; CẢ Sim2 lẫn Sim3
      afterAll có guard count pass.
- [ ] Route dynamic eligible: ảnh tương tác chụp SAU reset (không trộn frame 120); route reset không
      sạch → bỏ shot + log.
- [ ] `npm run test:sim:release` xanh (KHÔNG đụng physics/mount/contract).

## Risk Assessment
- Risk: `.sim2-reset` không tồn tại/không sạch ở vài route dynamic. Mitigation: guard `if(resetBtn) click`;
  reset không sạch → bỏ shot tương tác route đó + log (ràng buộc #7), KHÔNG tạo frame trộn.
- Risk: dragHandle brittle (kéo tọa độ pixel). Mitigation: handle 0/drag fail → fallback init + log (ràng buộc #9).
- Risk: Sim3 slider lúc fallback-2d (WebGL fail) → 3D-state vô nghĩa. Mitigation: chỉ chụp khi
  channel='sim3-webgl' (kiểm như probe `sim3Channel`); fallback thì bỏ qua + log.
- Risk: contact-sheet renderer giả định 1 ảnh/route Sim3. Mitigation: đọc renderer trước, sửa nếu cần.
