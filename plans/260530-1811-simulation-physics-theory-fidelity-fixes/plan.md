# Plan: Simulation Physics & Theory-Fidelity Fixes (52-route audit remediation)

Status: completed | Mode: --deep --tdd | Scope: 23 route BROKEN+WEAK (Ch1/Ch2/Ch3) | Branch: master

## Mục tiêu
Sửa physics sai, lệch lý thuyết, sai đơn vị, panel rỗng trên các mô phỏng đã audit. Mỗi phase tests-first (RED→GREEN→verify). KHÔNG đảo ngược quyết định cleanup overlay 2026-05-14.

## Bối cảnh nguồn (đọc trước khi cook)
- Master report: `plans/reports/debug-260530-1728-toan-bo-mo-phong-simulation-review-master-report.md`
- Chi tiết chương: `plans/reports/debug-260530-1728-ch1-statics-sim-audit-report.md`, `...-ch2-kinematics-...md`, `...-ch3-dynamics-...md`
- Ảnh runtime 52 route: `plans/reports/260530-sim-review-capture/sim-only/`

## Quyết định đã chốt (user)
- Q1 đơn vị: **cả hai mức** — (A) sửa thứ nguyên sai + (B) gắn `pxPerMeter` scale px→SI.
- Q2 panel rỗng: **bỏ khung mồ côi** (`P.panel` không còn nội dung do overlay bị suppress), giữ readout panel phải. KHÔNG bật lại `SIM_ALLOW_CANVAS_FORMULA_OVERLAY` (verified: tắt có chủ đích — changelog L304, journal 260514).
- Phạm vi: **toàn bộ 23 route** (7 BROKEN + 16 WEAK).

## Nguyên nhân gốc (RC)
- RC1: route `derived`/`onTick` bỏ qua module toán đúng (`SimPhysics{Statics,Kinematics,Dynamics}`), tự tính pixel heuristic. Verified: `js/sims/ch1/` gọi `SimPhysicsStatics.` = 0 lần.
- RC2: tọa độ pixel in nhãn SI ("m","N","°").
- RC3: bảo toàn/cân bằng giả tạo (ép số liệu mỗi tick — ch3-6-2 L75; ch1-4-4 residual bịa).
- RC4: default-state/nhãn mâu thuẫn khái niệm.
- RC5: panel placeholder rỗng + véc tơ/nhãn trang trí không bám readout.

## Điều chỉnh sau red-team (verified)
- Helper TỒN TẠI: `checkEquilibrium`(L214), `reduceToResultant`(L140,2D), `spatialForceComponents`(L110), `spatialMoment`(L127); `locateInstantCenter`(kinematics:300, dead); `rk4Step`(L78), `restitutionVelocity`(L138).
- Helper THIẾU phải thêm ở Phase 01: `momentum2d` (vector 2D, hiện route-local) vào `sim-physics-dynamics.js`; `resultant3D` (Σ x/y/z) vào `sim-physics-statics.js` (reduceToResultant chỉ 2D).
- ch1-4-1 xử lý hợp lực 3D + nhãn N ở **Phase 02** (KHÔNG vào sweep Phase 07 — tránh mâu thuẫn).
- ch3-2-3: PHYSICS ĐÚNG (m1=5≠m2=1 → a1=10,a2=−50 là Newton III chuẩn; master RC4 nhầm giả định m1=m2) → chỉ sửa nhãn chồng ở Phase 09, KHÔNG đổi công thức.
- Phase 03 IC tính trong `derived()` (snapshot 1 lần), KHÔNG thêm tick (giữ `static:true`).
- Phase 07 mức B: route không có mốc độ dài (ch2-5-2 IC, ch3-5-1 x_C) → BỎ nhãn "m", không bịa scale SI.
- Phase 10 thêm bước refresh visual baseline (evolution hash + pixelmatch) sau review thủ công — nếu thiếu, release gate RED mọi route sửa renderer.
- File >220 dòng khi thêm code (Phase 02 `ch1-support-spatial-behaviors.js`=166, Phase 06 `ch2-kinematics-behaviors-a.js`=200) → tách file + re-register registry, nêu rõ trước khi cook.

## Backlog (cắt khỏi plan — feature-add, không phải fix)
- ch3-6-3 va chạm xiên 2D (1D đã đúng).
- ch2-4-1 minh họa hệ quy chiếu động (tam giác đã đúng).
- ch2-1-2 thêm vật chuyển động đồng bộ đồ thị (giữ fix đường cong phản ứng control trong Phase 09).

## Phases
Cột "Audit Sev" = mức nghiêm trọng theo audit (P0=dạy ngược/physics vỡ, P1=physics sai, P2=polish/đơn vị). Khác với `priority` trong frontmatter phase (thang thực thi P1-P3, P1=cao nhất).

| # | Phase | Routes | Audit Sev | Thứ tự thực thi | Trạng thái |
|---|---|---|---|---|---|
| 01 | TDD Foundation & Red Gates | (harness) | — | 1 | completed |
| 02 | P0 Statics Teaches-Wrong | ch1-4-4, ch1-4-1 | P0 | 2 | completed |
| 03 | P0 Instant-Center Geometry | ch2-5-2 | P0 | 3 | completed |
| 04 | P1 Statics Physics | ch1-1-5, ch1-4-2, ch1-3-3, ch1-5-1 | P1 | 4 | completed |
| 05 | P1 Dynamics Wiring | ch3-3-2, ch3-6-2, ch3-5-3 | P1 | 5 | completed |
| 06 | P1 Kinematics Controls | ch2-4-4, ch2-3-2 | P1 | 6 | completed |
| 07 | P2 Units & SI Scale Sweep | mức A: ch1-4-2/5-3/3-6, ch2-2-2; mức B có-mốc: ch2-1-1/5-1, ch1-6-2/6-3; bỏ-nhãn: ch2-5-2, ch3-5-1 | P2 | 7 | completed |
| 08 | P2 Empty-Panel Cleanup | ch3-5-3, ch3-2-2, ch2-2-2, ch2-3-2, ch3-6-3 + sweep | P2 | 8 | completed |
| 09 | P2 Remaining WEAK Polish | ch1-2-1, ch1-2-6, ch1-6-2, ch1-6-3, ch2-1-2(partial), ch2-5-1, ch3-5-1, ch3-5-2, ch3-4-2, ch3-2-1, ch3-2-3(nhãn) | P2 | 9 | completed |
| 10 | P2 Dead-Code & Final QA + Docs | statics-routes adapter, full release gate | P2 | 10 | completed |

## Dependencies
- 02..06 phụ thuộc 01 (harness). 07,08 chạy sau 02..06 (tránh đụng cùng renderer). 09 sau 07,08. 10 cuối cùng.
- Không có cross-plan blocker (plan sim trước đã `completed`).

## Quy ước kỹ thuật
- File code ≤220 dòng (audit_simulation_quality giới hạn). Sửa file hiện có, không tạo file "enhanced".
- Code comment giải thích WHY (invariant vật lý), KHÔNG tham chiếu phase/finding code.
- Gate release cuối: `npm run test:sim:release`.

## Tiêu chí nghiệm thu mỗi route (quyết định user)
- Mỗi route: pass 3 guard tự động (physics-source + unit-label + empty-panel) → tôi chụp lại capture route đã sửa + tự đối chiếu lý thuyết (theory fidelity).
- pxPerMeter route có-mốc: khớp số liệu bài toán mẫu trong `chapters/ch*/muc-*.html` (không round number tùy tiện).
- Cuối plan: tôi trình bản tổng hợp before/after để bạn duyệt.

## Success Criteria (toàn plan)
- [ ] 23 route hết verdict BROKEN/WEAK theo tiêu chí từng phase.
- [ ] Mọi readout đại lượng vật lý đến từ shared physics module (test assert).
- [ ] Không còn nhãn sai thứ nguyên; tọa độ pixel có scale SI hoặc bỏ nhãn.
- [ ] Không còn khung panel rỗng.
- [ ] `npm run test:sim:release` PASS; docs đồng bộ.
