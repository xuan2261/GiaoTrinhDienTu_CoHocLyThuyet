# Journal — Simulation Physics & Theory-Fidelity Fixes (23-route remediation)

Date: 2026-05-31 | Plan: `plans/260530-1811-simulation-physics-theory-fidelity-fixes` | Mode: `/ck:cook --auto --tdd`

## Outcome
10 phase, 23 route BROKEN/WEAK sửa xong. Full release gate `npm run test:sim:release` PASS. 38 file đổi (+504/−304). Code-reviewer: DONE_WITH_CONCERNS, 0 blocker.

## Quyết định & phát hiện đáng chú ý (không hiển nhiên từ code)

### 1. `SimStatics` adapter KHÔNG phải dead code (lật giả định của plan)
Plan Phase 10 giả định adapter "bị professional-lab ghi đè" → đề xuất xóa. Verify ngược lại: `js/simulations.js buildSimMap()` ưu tiên `SimRegistry` (nơi `statics-routes.js` đăng ký `lab.mount(routeId)`) TRƯỚC fallback `SimRouteRenderers`. Adapter là đường mount Ch1 thật. → Giữ + ghi chú (theo guidance "nếu còn dùng → giữ"), KHÔNG xóa. Xóa là high-risk (vỡ mount Ch1 + tests).

### 2. Empty-panel guard cần 2 vòng refine (over-flag)
Guard v1 chỉ tính `barGraph` là content → flag nhầm 16 panel (gồm panel khung diagram có body/arrow bên trong). Refine: (a) thêm body/point/arrow/spring... vào CONTENT_KINDS; (b) thêm ctx-draw (lineTo/arc/curve) NHƯNG chỉ tính nét vẽ sâu trong panel (inset 16px) để không nhầm viền `glassPanel`. Sau refine: 12 orphan thật (caption box chỉ chứa overlay đã suppress). Bài học: structural-mark guard phải phân biệt "panel khung diagram" vs "panel caption rỗng".

### 3. `panel()` không emit mark khi đi nhánh glassPanel
Root cause guard PASS sai ban đầu: `panel()` early-return qua `glassPanel` (luôn có trong browser) trước `mark('panel')`. Đã chuyển mark lên trước mọi nhánh vẽ — thay đổi global ảnh hưởng mọi sim, nhưng additive (baseline snapshot rỗng, visual-quality chỉ check length>=4). Reviewer lưu ý nếu sau này thêm test đếm panel mark.

### 4. 5 hồi quy thật phát hiện qua interaction-engine sweep (không phải test stale)
Sau Phase 02-06, full interaction spec bắt 5 fail là bug thật do thay đổi của tôi:
- ch3-5-3: đặt ω=L/I nên ω là hệ quả → slider ω độc lập mâu thuẫn → bỏ slider.
- ch2-5-2: initial theta=0 bị derived clamp về biên 12° → kéo không đổi → đặt theta=40 mid-range.
- ch1-5-1: clamp Fms=μN đúng vật lý nhưng cả 3 readout bão hòa → đổi readout sang "F kéo" (applied).
Bài học: sửa physics đúng có thể làm readout "đứng yên" theo cách test cũ không lường — phải đổi readout phản ánh đại lượng user điều khiển thật.

### 5. Cap 220 dòng buộc compact thay vì tách file
ch1-force-law-behaviors + ch1-support-spatial-behaviors vượt 220 sau khi thêm physics wiring. Theo KISS chọn compact (gộp dòng, xóa dead `setPrimary`/`routedForceLaw` Set, rút comment) thay vì tách file + re-register registry (rủi ro load-order cao hơn). 3 file giờ ở 217/219/220 — sát trần.

### 6. Tọa độ pixel: bỏ nhãn thay vì bịa SI (quyết định user, sticky)
ch2-5-2 IC_x/IC_y, ch3-5-1 x_C là pixel thuần không mốc → bỏ "m" qua `inferUnit` (loại `ic_|x_c` khỏi rule position). Spec cũ `readout-unit-audit.spec.js` (vòng review 2026-05-19) thưởng nhãn "m" sai → cập nhật spec thêm exemption pixel-coord có ghi chú, tôn trọng quyết định user thay vì để spec kéo ngược.

## Backlog (cắt — feature-add, không phải fix)
ch3-6-3 va chạm xiên 2D; ch2-4-1 hệ quy chiếu động; ch2-1-2 thêm vật chuyển động đồng bộ đồ thị.

## Unresolved
- ch3-6-2 quy đổi px→m/s dùng giả định 60fps + 50px/m; bảo toàn động lượng đúng (tuyến tính) nhưng giá trị tuyệt đối kg·m/s phụ thuộc giả định — chấp nhận cho mục đích minh họa.
- 3 file behavior sát trần 220 dòng — sửa nhỏ tiếp theo sẽ cần tách file.
