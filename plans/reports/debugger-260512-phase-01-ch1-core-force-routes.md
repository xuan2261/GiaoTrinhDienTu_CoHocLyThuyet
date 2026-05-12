# Debugger Report - Phase 01 CH1 Core Force Routes

## Executive Summary

Phạm vi: `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`.

Kết luận chính:

1. Route wiring/registry không hỏng. Static scene/renderer contract cho 6 route PASS.
2. Có 4 rủi ro gốc đã xác nhận:
   - `ch1-2-1` mount sai góc ban đầu nên mở route đã ở trạng thái `lệch`, mất DeCuong parity.
   - `ch1-1-8` direct drag đổi hình nhưng không đổi readout nào; sẽ đụng tiêu chí `@direct-drag-audit`.
   - `ch1-1-4` và `ch1-1-8` có force/readout desync khi vector đứng bị clamp sát đáy canvas.
   - Shell shared đang tự chèn readout generic `chế độ` và `α` cho mọi route CH1 này; lệch spec Phase 01.
3. Có 2 rủi ro phụ:
   - Slider/value step lệch ngay từ mount ở `ch1-1-3`, `ch1-1-5`, `ch1-1-6`.
   - `ch1-1-8` dùng `domMath` cho text Việt không phải công thức; DOM text cho thấy overlay source bị leak/garble.
4. Monitoring gap: test reset hiện chỉ check readout cho `ch2-5-2`, `ch3-3-1`; chưa khóa visual reset cho 6 route Phase 01.

## Timeline

- T0: đọc `README.md`, Phase plan, `docs/codebase-summary.md`.
- T1: chạy static gate:
  - `python tools\smoke_simulation_scene_catalog.py --strict --routes ... --require-routes 6` -> PASS
  - `python tools\smoke_simulation_renderer_contract.py --strict --routes ... --require-routes 6` -> PASS
- T2: trace code path qua `js/sim-professional-lab.js`, `js/sims/ch1/ch1-force-law-*.js`.
- T3: chạy Playwright hẹp trên đúng 6 route, dump readout/buttons/handles/overlay/sliders trước-sau drag-reset-button.
- T4: đối chiếu với test intent trong `tests/simulation-interaction-engine.spec.js`.

## Hypotheses

### H1. Route registry/scene wiring lỗi
Loại bỏ.

Chứng cứ:
- `tools/smoke_simulation_scene_catalog.py` PASS.
- `tools/smoke_simulation_renderer_contract.py` PASS.
- 6 route đều mount được dedicated renderer + behavior, không rơi fallback.

### H2. Lỗi nằm ở shell shared: control/readout/overlay injection
Xác nhận một phần.

Chứng cứ:
- `js/sim-professional-lab.js:293-303` + `js/sim-professional-lab.js:285-292` format readout từ scene/state.
- `js/sim-professional-lab.js:295-302` luôn append thêm `chế độ`.
- `js/sim-professional-lab.js:296-300` luôn append thêm `α` nếu `d.alpha` hữu hạn.
- Browser dump cho cả 6 route đều có extra cards ngoài spec:
  - `ch1-1-3`: `|F|`, `α`, `Điểm đặt`, thêm `chế độ`, thêm `α` lần nữa.
  - `ch1-1-5`: `Chế độ` từ scene, lại thêm `chế độ` từ shell.
  - `ch1-1-6`, `ch1-1-8`, `ch1-2-1`: thêm `α` dù plan route không yêu cầu.

### H3. Lỗi geometry/state trong behavior/mount path
Xác nhận.

Chứng cứ chi tiết ở Findings 1, 2, 3.

### H4. Reset/trail path hỏng
Chưa chốt toàn bộ, nhưng có visual-reset instability đã xác nhận trên `ch1-1-8`.

Chứng cứ:
- No-op reset trên `ch1-1-8` giữ nguyên readout nhưng canvas hash đổi.
- Cùng check này trên `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-2-1` thì hash giữ nguyên.
- Chưa đủ chứng cứ tách chắc chắn trail hay primitive draw non-idempotent; cần follow-up targeted visual diff cho riêng `ch1-1-8`.

## Findings

### 1. `ch1-2-1` mở route đã sai cân bằng do fallback góc dùng toán tử `||`
Mức độ: cao

Chứng cứ:
- Scene khai báo góc ban đầu bằng `0` tại `js/sims/ch1/ch1-force-law-scenes.js:111-115`.
- Mount chuẩn hóa force/vector ở `js/sim-professional-lab.js:98-100`:
  - `if (Number.isFinite(Number(state.force))) setForceMagnitude(state, Number(state.force), scene.angle || -0.58);`
- Vì `scene.angle = 0`, biểu thức `scene.angle || -0.58` trả `-0.58`, không phải `0`.
- Browser evidence:
  - route mở ra có readout `|F|:105N | Lệch:57.5px | Cân bằng:lệch | α:-33°`
  - expected theo route spec là cặp lực cân bằng, mở ra phải ở trạng thái cân bằng.

Root cause:
- Mount path dùng falsy fallback cho giá trị hợp lệ `0`.

Tác động:
- Mất visual parity ngay first paint.
- Reset quay về cùng trạng thái sai vì source state ban đầu đã sai từ mount normalization.

### 2. `ch1-1-8` direct drag không đổi readout nào
Mức độ: cao

Chứng cứ:
- Handle `constraint-load-p` chỉ đổi `primary/vector` tại `js/sims/ch1/ch1-force-law-behaviors.js:182`.
- Derived model `forceLawDerived()` không map vị trí/force của handle vào các readout scene của route này; readout chỉ lấy `supportKind`, `supportDof`, `supportReaction` từ `supportInfo(state.mode)` tại `js/sims/ch1/ch1-force-law-behaviors.js:98-141`.
- Scene readouts của `ch1-1-8` tại `js/sims/ch1/ch1-force-law-scenes.js:98-103` không có đại lượng nào phụ thuộc drag.
- Browser evidence:
  - Drag handle `P` -> canvas hash đổi.
  - Readout trước/sau drag giữ nguyên: `Loại:Tựa trơn | Khóa:khóa pháp tuyến | Phản lực:N`.
- Test intent tại `tests/simulation-interaction-engine.spec.js:196-221` yêu cầu mọi route direct-drag phải đổi `readoutSnapshot`; route này đang đi ngược tiêu chí đó.

Root cause:
- Interaction schema có drag handle nhưng semantic readout set không gắn với biến nào drag làm thay đổi.

Tác động:
- Direct drag trông sống nhưng readout “đứng yên”.
- Dễ fail browser audit hoặc tạo cảm giác route giả lập nửa vời.

### 3. `ch1-1-4` và `ch1-1-8` force/readout desync khi vector đứng bị clamp
Mức độ: cao

Chứng cứ:
- `setVerticalForce()` ở `js/sims/ch1/ch1-force-law-behaviors.js:45-50` đặt `state.vector = bounded({ x: p.x, y: p.y + force })`.
- Khi kéo `P` xuống gần đáy canvas, `bounded()` ở `js/sims/ch1/ch1-force-law-behaviors.js:22` kẹp `y <= H - 28`, làm vector thực tế ngắn hơn force state.
- Nhưng slider display vẫn phản ánh `state.force` qua shared control code `js/sim-core.js:163-191`.
- Browser evidence `ch1-1-4`:
  - trước drag: slider `F = 110N`, readout `F = 110N`
  - kéo `P` xuống đáy: slider vẫn `110N`, readout tụt còn `12N`, `M_O` tụt còn `21.6N.m`
- `ch1-1-8` cùng cơ chế clamp, chỉ chưa lộ ra qua readout vì scene không hiển thị `F`.

Root cause:
- State nguồn của slider là force mong muốn.
- Derived/readout dùng độ dài vector sau clamp.
- Hai nguồn không được reconcile.

Tác động:
- Người dùng thấy control nói một đằng, readout nói một nẻo.
- Với `ch1-1-4`, công thức mô men cũng bị kéo theo force đã clamp, làm bài học sai trực giác.

### 4. Shared shell chèn readout generic ngoài spec Phase 01
Mức độ: trung bình

Chứng cứ:
- `js/sim-professional-lab.js:293-303` append cứng `chế độ` và `α`.
- Browser evidence:
  - `ch1-1-3` có `α` hai lần.
  - `ch1-1-5` có `Chế độ` và `chế độ` đồng thời.
  - `ch1-1-6`, `ch1-1-8`, `ch1-2-1` có `α` dù spec route không yêu cầu trong Phase plan.
- Phase plan chỉ mô tả readout cụ thể theo route, không có generic card bắt buộc.

Root cause:
- Shared formatter thêm global cards không theo route capability/spec.

Tác động:
- Mất DeCuong parity.
- Readout grid bị nhiễu, khó đọc.

### 5. Slider step/value lệch ngay từ mount ở nhiều route
Mức độ: trung bình

Chứng cứ:
- `js/sim-core.js:174-178` set `input.step` rồi set `input.value = value`; browser range input tự lượng tử hóa về step hợp lệ.
- Một số `scene.controls` dùng step `5`, nhưng `initialState.force` không chia hết cho `5`:
  - `ch1-1-3`: force `258`, slider value browser = `260`, display/readout = `258N`
  - `ch1-1-5`: force `124`, slider value browser = `125`, display/readout = `124N`
  - `ch1-1-6`: force `92`, slider value browser = `90`, display/readout = `92N`
- Scene refs: `js/sims/ch1/ch1-force-law-scenes.js:32, 64, 80`.

Root cause:
- Initial state numeric không snap theo `control.step`.
- Shared slider dùng native range input, value thật bị browser lượng tử hóa.

Tác động:
- Vừa mount đã có control/readout mismatch.
- Người dùng chạm slider lần đầu có thể thấy jump bất ngờ.

### 6. `ch1-1-8` KaTeX overlay đang đi sai primitive cho text Việt không phải công thức
Mức độ: trung bình

Chứng cứ:
- Renderer dùng `P.domMath(ctx, 'constraint-equation', ..., '\\text{liên kết}\\Rightarrow\\text{phản lực}', ...)` tại `js/sims/ch1/ch1-force-law-renderers.js:150`.
- `domMath()` luôn set `node.textContent = latex` trước khi render KaTeX tại `js/sim-route-renderer-primitives.js:89-108`.
- Browser dump `data-sim-overlay-key="ch1-1-8:math:constraint-equation"` cho text:
  - `lieˆn keˆˊt⇒phản lực\\text{liên kết}\\Rightarrow\\text{phản lực}...`
- Cùng route đã có `P.domPanel` cho state text sạch tại `js/sims/ch1/ch1-force-law-renderers.js:151`.

Root cause:
- Text giải thích tiếng Việt bị đẩy qua math overlay thay vì plain label/panel.
- KaTeX source + fallback text bị lộ trong DOM text; với Unicode tiếng Việt đây là điểm dễ garble nhất.

Tác động:
- Offline/local KaTeX fallback có nguy cơ hiển thị khó đọc.
- A11y/text extraction bị bẩn.

### 7. `ch1-1-8` visual reset không idempotent dù readout không đổi
Mức độ: thấp-trung bình

Chứng cứ:
- No-op reset riêng `ch1-1-8`:
  - readout trước = sau
  - canvas hash khác
- 5 route còn lại trong cùng check no-op reset giữ nguyên hash.
- Reset path ở `js/sim-professional-lab.js:1083-1102` là shared; khác biệt nhiều khả năng nằm ở route renderer state/draw side effect của `ch1-1-8`.

Root cause hiện tại:
- Chưa cô lập dứt điểm trong phạm vi điều tra này.
- Điểm vào cần soi đầu tiên: `trackTrail(state, p)` tại `js/sims/ch1/ch1-force-law-renderers.js:45-50` và toàn bộ draw branch `renderCh118ConstraintRelease()`.

Tác động:
- Reset có thể “đúng số liệu” nhưng không hoàn toàn đúng hình.

## Test Coverage Gaps

1. Direct-drag audit có intent đúng (`tests/simulation-interaction-engine.spec.js:196-221`), nhưng chưa có assertion route-specific cho 6 route này nên lúc fail khó triage nhanh.
2. Reset test chỉ cover `ch2-5-2` và `ch3-3-1` tại `tests/simulation-interaction-engine.spec.js:270-280`; không khóa visual reset cho Phase 01 CH1.
3. Visual-quality suite hiện tập trung contrast/overflow/nonblank; chưa có check “scene-spec parity” cho readout cards dư/thiếu.

## Recommended Actions

1. Sửa mount fallback góc ở `js/sim-professional-lab.js:98-100` bằng nullish/finite check thay cho `||`.
2. Với `ch1-1-8`, hoặc:
   - bỏ direct drag nếu route này chỉ intended cho button tabs, hoặc
   - thêm readout drag-coupled như `Điểm đặt`, `F`, hoặc `cánh tay đòn`.
3. Với `ch1-1-4`/`ch1-1-8`, hợp nhất source of truth cho force đứng:
   - hoặc slider/state phải snap theo vector clamp,
   - hoặc không cho kéo vào vùng làm force bị cắt.
4. Chặn shared generic readout injection cho Phase 01 routes; readout phải theo scene contract, không append cứng `chế độ`/`α`.
5. Snap `initialState` theo `control.step` cho các route có range input.
6. Đổi `ch1-1-8` `constraint-equation` từ `domMath` sang `domLabel` hoặc `domPanel`.
7. Thêm targeted browser tests cho 6 route:
   - direct drag changes intended semantic readout
   - no-op reset keeps canvas hash
   - drag + reset restores canvas hash
   - no duplicate readout labels

## Commands Run

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6
# Playwright hẹp qua inline node scripts: dump readouts/controls/overlays, drag/reset/no-op-reset hash checks
```

## Unresolved Questions

1. `ch1-1-8` no-op reset đổi canvas hash do trail, overlay side effect, hay primitive draw không idempotent? Chưa isolate 100%.
2. Tester đang chạy full suite; cần đối chiếu xem `@direct-drag-audit` hiện đã fail đúng `ch1-1-8` hay còn masked bởi thay đổi concurrent khác.

**Status:** DONE_WITH_CONCERNS
**Summary:** Đã xác nhận 4 rủi ro gốc và 2 rủi ro phụ trên 6 route CH1; nặng nhất là `ch1-2-1` mount sai góc, `ch1-1-8` drag không đổi readout, và `ch1-1-4`/`ch1-1-8` force-readout desync do clamp.
**Concerns/Blockers:** `ch1-1-8` visual reset instability chưa tách được 100% trail hay draw side effect; không chỉnh code theo yêu cầu nên dừng ở mức chứng cứ + root-cause path ưu tiên.
