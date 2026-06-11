---
title: "Sim2 PhET-grade real visual fixes (blind-recheck)"
status: complete
created: 2026-06-11
mode: deep+tdd
blockedBy: []
blocks: []
source: independent-blind-recheck
---

# Plan — Sửa visual THẬT cho Sim2 (từ blind re-check 35 sim)

## Mục tiêu

Sửa các finding visual **đã xác minh là lỗi/khuyết thật** từ independent blind re-check (4 subagent chấm mù + đối chiếu probe). Engine SVG-first Sim2 (`js/sim2/`), GIỮ Sim2 default. **KHÔNG đổi physics. KHÔNG đụng chính sách Sim3/WebGL default-mode.** TDD per phase, mỗi phase giữ `test:sim:release` xanh.

**Nguồn:** `plans/reports/independent-blind-recheck-260610-2231-35-sim-vs-1418-visual-report.md`

## Quyết định khóa (user đã chốt — KHÔNG hỏi lại)

1. **ch2-2-2 + ch2-4-4 đĩa nuốt viewport** → sửa Sim2 (thu nhỏ đĩa + scale up vector). Giữ Sim2 default. KHÔNG promote Sim3.
2. **Màu semantic** → giữ quy ước hiện có (ch1-1-5 R-orange, ch1-5-3 green-equilibrium là cố ý). CHỈ sửa lỗi màu thật.
3. **Capture spec** → thêm frame `__slider-hi` (dev-only tooling), diệt false-fail "static/đóng băng".

## DIVERGENCE so với report (scout code phát hiện — ĐỌC KỸ)

- **ch1-3-6 KHÔNG phải "legend↔canvas mismatch".** Code thật: legend dùng đúng token `Pal.reaction`/`Pal.moment`. Bug thật = `Pal.reaction=#b10dc9` (tím-magenta) và `Pal.moment=#7c3aed` (tím-violet) **cả hai đều tím**, R và M trong cùng sim mắt không phân biệt nổi. Đây là **đụng độ 2 token tím trong 1 sim**, không phải sai gán. Fix trong ràng buộc "giữ convention": disambiguate bằng SHAPE/DASH (không recolor token global).
- **ch2-4-4 đã sửa 2 lần trước** (plan 260608-1938: label offset; comment code: worldBox ±5→±5.6) mà blind vẫn C+. → Lần này BẮT BUỘC đổi đòn bẩy: **bán kính đĩa world-space + vector scale**, KHÔNG đụng label/worldBox nữa.
- **ch3-1-3 "no feedback" là FALSE-FAIL** (probe: a→theta 0→39.2 match=true). CHỈ phần framing (nền xám đục + dồn góc) là thật.

## KHÔNG HÀNH ĐỘNG (false-fail probe đã minh oan — ghi để tránh "sửa" nhầm)

- ch3-5-3 "đóng băng": probe r 0.8→3.5 ⇒ ω 14.06→0.73 match=true. **Sim ĐÚNG.**
- ch3-1-3 "no feedback": probe a→theta match=true.
- Mọi điểm trừ "static init==live limited feedback" khác — là giới hạn capture, KHÔNG sửa sim. Phase 5 sửa capture để lần soi sau không nhầm.

## Phases (đã restructure sau red-team)

| Phase | Tên | Ưu tiên | TDD | Status | Ghi chú |
|---|---|---|---|---|---|
| 2 | ch2-2-2 + ch2-4-4 disk-dominance (đòn bẩy đã sửa) | P1 | yes | done | CORE. ch2-4-4 đĩa 4→**3.6** (DIVERGENCE: KHÔNG 2.8 vì rRel max=3.5, hạt sẽ văng ra ngoài) + worldBox ±6.4 + VREL_VS 1.6 + VS 0.42. ch2-2-2 GIỮ R=3, worldBox ±5.5 + v-scale 0.2. |
| 3 | ch3-1-3 framing (chỉ minY/maxY + tương phản) | P1 | yes | done | CORE. worldBox dọc −1..6 → −0.5..5.5 (giữ maxX=5) + viền thân toa width 3.5. KHÔNG đụng gradient 'axis' shared. |
| 1 | ch1-3-6 R/M — verify-bằng-mắt TRƯỚC | P3 | no | done | KHÔNG sửa: re-capture cho thấy R(mũi tên thẳng) vs M(cung 270°+marker) phân biệt rõ bằng shape. Red-team #5 đúng. |
| 4 | P2 — SCOUT-only (đọc 5 file, confirm finding) | P3 | no | done | Scout 5 file. 4 dead-space nhẹ (không clip) → defer; ch3-5-4 "no graph" + ch1-5-3 green BÁC BỎ; ch1-1-3 DROP. Report: `scout-phase4-260611-0825-...`. |
| 5 | `__slider-hi` capture tooling | — | — | deferred | Tách sang follow-up; sửa vấn-đề-chấm không phải defect; acceptance cũ hỏng |

**Thứ tự:** Phase 2 → Phase 3 (CORE P1, ship + re-capture verify) → Phase 1 (chỉ nếu mắt còn thấy lẫn) → Phase 4 (scout). Phase 5 ra khỏi plan này.

**Vì sao restructure:** red-team (3 reviewer, đều cite file:line) bắt 2 CRITICAL + đồng thuận plan phình scope. Chi tiết ở `## Red Team Review` cuối file.

## Acceptance criteria (toàn plan)

- [ ] `npm run test:sim:release` xanh sau MỖI phase (physics + mount + content + quiz).
- [ ] `npm run test:sim:visual:capture` 25/25 pass; re-capture cho thấy đĩa ch2-2-2/ch2-4-4 không còn nuốt khung, vector đọc được; R vs M ch1-3-6 phân biệt rõ; ch3-1-3 nền tương phản + cân khung.
- [ ] KHÔNG đổi bất kỳ giá trị physics nào (test:sim:physics port snapshot verified-sticky vẫn pass).
- [ ] Token `Sim2Palette` global KHÔNG đổi (decision #2).
- [ ] Phase 5: `npm run test:sim:visual:unit` pass với assertion `__slider-hi` mới.

## Ràng buộc kỹ thuật

- Mount contract: `window.SIM_MAP[pageId] → factory(container) → { dispose }` giữ nguyên.
- Visual assertion thêm vào `tests/sim2-ui-coverage.spec.js` (hoặc spec mới) — không làm brittle 25-route baseline.
- Mọi sim chạm phải giữ `dispose()` gỡ sạch listener + RAF (mount-robustness test).
- `prefers-reduced-motion` tôn trọng (không thêm animation thiết yếu).

## Liên quan plan khác

- `260608-1938-sim-visual-interaction-fixes` (complete) — đã sửa ch2-4-4 label/redraw; phase 2 ở đây là lần kế, KHÔNG lặp lại label fix.
- `260531-1657-sim2-pro-visual-ux-theory-upgrade` (pending, coi như stale) — nâng cấp toàn 25 sim đã thực hiện trên tinh thần; plan này là polish hẹp, không block.

## Câu hỏi mở

Không. 3 quyết định user + red-team adjudication đã giải quyết toàn bộ.

## Red Team Review

3 reviewer hostile (assumption-destroyer, failure-mode, scope-critic), tất cả finding cite file:line. User chọn "áp dụng hết + restructure" + "ch2-4-4 giữ nguyên quỹ đạo".

### Findings accepted

| # | Sev | Finding | Evidence | Resolution |
|---|---|---|---|---|
| 1 | CRITICAL | Co biên `rRel` (1.5→1.0) mà không sửa hệ số `radialSpeed` (0.75) → readout v_rel + a_cor SAI (radialSpeed là đạo hàm rRel) | ch2-4-4.js:40-41 | **Giữ nguyên rRel/radialSpeed.** Phase 2 chỉ thu bán kính ĐĨA (4→2.8) + boost VS. User chốt "giữ nguyên quỹ đạo". |
| 2 | CRITICAL | Thu world `R` ch2-2-2 đổi `v=ωR` + desync `sim3.setState({radius:R})` | ch2-2-2.js:38,50 | **KHÔNG thu world R.** Thu đĩa-trên-màn bằng worldBox + boost vector VIZ-scale (số nhân hiển thị, không physics). |
| 3 | HIGH | Phase 5 phá `totalImgs===plannedShotTotal` + unit test `['init','live']`; chiều slider MAX mâu thuẫn SC "r=min→ω lớn"; ch3-5-3 frame gần trùng init | capture-sims.spec.js:124-127; capture-plan.test.js:27; phase-05:16,45; ch3-5-3.js:71 | **Defer Phase 5** khỏi plan này (follow-up tooling riêng). |
| 4 | HIGH | Phase 4 lập kế + TDD cho 5 file CHƯA đọc → ngưỡng đoán mò | phase-04:20 | **Phase 4 = scout-only.** Defer fix. Drop ch1-1-3 (A-). |
| 5 | MED | Phase 1 dash thừa: R(mũi tên thẳng) vs M(cung 270°+marker) đã khác hình; `#b10dc9` vs `#7c3aed` khác hue, không "cùng tím" → blind có thể over-grade; test phantom | ch1-3-6.js:27,31-42; palette.js:20-21 | **Hạ Phase 1 → verify-bằng-mắt TRƯỚC.** Chỉ sửa nếu re-capture vẫn lẫn. Bỏ spec file riêng. |
| 6 | MED | Phase 3 "dead-space upper-right" thực ra là THÂN TOA; thu maxX → clip toa. "Thêm gradient key" bất khả thi (ensureDefs auto-gen + decision #2) | ch3-1-3.js:11,20; svg-render.js:45-53 | **Phase 3 chỉ thu minY/maxY** (giữ maxX) + tập trung tương phản viền. KHÔNG đụng gradient 'axis' (shared ch1-1-8/ch1-3-2/ch1-6-3). |
| 7 | MED | Assertion pixel-ratio flaky: vector dao động qua 0 (cos) | ch2-4-4.js:41; ch2-2-2.js:39 | Dùng invariant TĨNH (attribute bán kính đĩa giảm + VS tăng) hoặc đo tại frame xác định, không assert ratio động. |
| 8 | MED | Phase 2 ch2-2-2 bỏ sót coupling vt=ωR | ch2-2-2.js:38 | Giữ R → vt không đổi; chỉ boost VIZ-scale. Coupling tự biến mất khi không thu R. |

### Verified-positive (reviewer xác nhận plan ĐÚNG)
- Đòn bẩy thu-đĩa Phase 2 đúng cơ chế (transform.js:23 scale theo worldBox cố định) — KHÁC 2 lần nới-worldBox vô hiệu trước. Áp cho ch2-4-4 (đĩa độc lập physics) an toàn.
- Phase 3 handle/arrow KHÔNG desync khi đổi worldBox (dùng world-coords qua tf).
- "first input[type=range]" heuristic an toàn cho 25 route (playback là button).
- Plan chặn đúng false-fail (ch3-5-3, ch3-1-3 feedback).

### Whole-Plan Consistency Sweep
Sau khi áp findings: Phase 2 đổi đòn bẩy (đĩa không vector-via-R); Phase 3 bỏ maxX/gradient; Phase 1/4 hạ cấp; Phase 5 defer. Đã reconcile bảng phase + acceptance criteria toàn plan. Acceptance criteria gốc "đĩa ch2-2-2/ch2-4-4 không nuốt khung, vector đọc được" vẫn đúng (đạt qua đòn bẩy mới). Không còn mâu thuẫn.

## Validation Log

Verification pass SKIP (guard): `## Red Team Review` đã có evidence file:line đầy đủ; không còn `[UNVERIFIED]` tag. Hỏi 2 decision point thật (ít hơn min — plan đã rõ sau red-team, không pad).

### Quyết định

1. **Phạm vi vòng này = làm HẾT 4 phase**: 2→3 (CORE P1) → 1 (verify ch1-3-6) → 4 (scout P2). Phase 5 vẫn deferred.
2. **Cổng nghiệm thu visual = Claude tự soi re-capture** (không chờ user duyệt mắt). Lưu ý đã biết: Claude tự-soi bị neo lạc quan → bù bằng test cấu trúc (độ dài vector ≥px, stroke-width, worldBox) là cổng cứng; soi mắt chỉ là lớp phụ. Nếu Claude nghi ngờ, báo user.

### Propagation
- Phase 1 + 4: "verify-bằng-mắt" / "soi ảnh thật" → do CLAUDE thực hiện (không chờ user).
- Success criteria các phase: re-capture + Claude soi, đóng phase khi test cấu trúc xanh + soi không thấy regression.

### Whole-Plan Consistency Sweep (validation)
Re-read 6 file: 2 quyết định không tạo mâu thuẫn mới. Thứ tự "làm hết 4 phase" đã khớp dòng thứ tự trong bảng Phases. Cổng "Claude tự soi" thống nhất với success criteria (test cấu trúc cứng + soi phụ). Không còn mâu thuẫn → plan sẵn sàng implement.
