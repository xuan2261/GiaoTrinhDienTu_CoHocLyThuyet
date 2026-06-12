---
title: "Interactive slider-hi capture + 35-sim quality review"
status: complete
created: 2026-06-11
mode: tdd
blockedBy: []
blocks: []
source: plans/reports/brainstorm-260611-1042-35-sim-interactive-visual-quality-review-report.md
---

# Plan — Interactive (slider-hi) capture + review chất lượng thực tế 35 sim

## Mục tiêu

Review chất lượng THỰC TẾ CÓ TƯƠNG TÁC toàn bộ 35 route (25 Sim2 + 10 Sim3) trên 3 tiêu chí:
**visual/bố cục · feedback tương tác · đúng vật lý/sư phạm.**

**Root cause cần giải:** capture hiện chỉ chụp frame TĨNH (init/live), KHÔNG kéo slider → grader
tưởng route "đóng băng/no feedback" (false-fail, probe đã minh oan). Vòng này nâng capture để
chụp trạng thái sau khi kéo slider chính tới biên XA init nhất (`slider-far`), rồi chấm trên ảnh
phản ánh feedback thật.

**Đây CHÍNH LÀ Phase 5 đã bị DEFER** khỏi plan `260611-0006-sim2-phet-grade-real-visual-fixes`
(complete). Plan này là follow-up tooling đó, đã hấp thụ các finding red-team của plan cũ + 1 vòng
red-team riêng (xem `## Red Team Review`).

## Ràng buộc cứng (KHÔNG vi phạm)

1. **KHÔNG sửa physics/engine sim nào.** Chỉ đổi tooling capture (dev-only) + cách chấm.
2. **Giữ invariant count.** Sim2 có `totalImgs === plannedShotTotal` (capture-sims.spec.js:124-127) →
   slider-far PHẢI thêm vào `buildCapturePlan` (pure), KHÔNG chỉ thêm shot ở spec. **Sim3 KHÔNG có
   invariant này** (pilot-capture.spec.js:33-36) → Phase 2 THÊM guard count vào Sim3 afterAll (red-team #5).
3. **KHÔNG assert frame-difference / sceneChanged.** Frame slider-far gần-trùng-init KHÔNG phải lỗi
   — đó là tín hiệu "feedback yếu" (F2/F3) để grader diễn giải. Capture vô điều kiện cho route eligible.
   NHƯNG: chọn biên XA init nhất (không mù quáng "hi") để frame thuyết phục nhất có thể (red-team #4).
4. **Tái dùng nguồn target có sẵn**: slider qua `probe-targets.js` + `setSlider` (`input[data-id]`);
   drag qua route-map `kind:'drag-handle'` + `dragHandle()` (probe-runner.spec.js:127-147).
   Sim3 key có hậu tố `#sim3` (`probe-targets.js:57-63`) → tra `id+'#sim3'`, KHÔNG tra id trần.
5. Capture config riêng, KHÔNG vào `test:sim:release` → không ảnh hưởng gate offline.
6. **Mọi test cũ phải xanh nguyên.** `opts.interactionTargets` default rỗng → `buildCapturePlan` hành vi
   cũ không đổi (8 assertion trong sim2-visual-capture-plan.test.js gọi `buildCapturePlan(manifest,{})`).
7. **Route vừa dynamic vừa có target** (ch2-3-2, ch3-2-2, ch3-3-1, ch3-5-3): RESET playback (`.sim2-reset`,
   về t=0) TRƯỚC khi set slider/drag, để ảnh không trộn với trạng thái đã step 120 frame (red-team #2).
   **Nếu verify (Phase 2) thấy route nào reset KHÔNG sạch về t=0 → BỎ frame tương tác route đó, log lại,
   fallback frame dynamic cũ + probe** (validation Q2 — trung thực hơn frame trộn gây hiểu nhầm).
8. **Sim2 plan-driven, Sim3 bespoke.** Sim3 spec là pilot hardcode, KHÔNG dùng buildCapturePlan →
   viết frame tương tác đường riêng cho Sim3 (user chốt) (red-team #1).
9. **drag-far cho 5 route bespoke-drag** (validation Q1): tái dùng `dragHandle()`. Brittle (kéo tọa độ
   pixel SVG) → nếu drag fail/không đo được, fallback ảnh init + probe, log (KHÔNG fail capture).

## Phủ sóng interaction-target

Frame tương tác mới = `slider-far` (kéo slider tới biên xa init) HOẶC `drag-far` (kéo handle SVG).

- **Sim2 slider-far (16):** ch1-1-3, ch1-1-4, ch1-1-6, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch2-3-2,
  ch2-5-3, ch3-1-3, ch3-2-2, ch3-2-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4. (nguồn `probe-targets.js` SIM2)
- **Sim2 drag-far (5):** ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2 (bespoke-drag, 0 slider).
  Nguồn selector: route-map controls `kind:'drag-handle'` + `dragHandle()` từ probe-runner.
  (user chốt thêm post-drag — ch2-1-3 + ch2-5-2 là false-fail cũ 2231:38, post-drag diệt tận gốc).
- **Sim3 slider-far (5):** ch1-5-3#sim3, ch2-3-2#sim3, ch2-5-3#sim3, ch3-1-3#sim3, ch3-5-3#sim3.
- **9 route KHÔNG có interaction-target** (animation-only: ch2-1-1, ch2-2-2, ch2-4-4, ch3-6-2 + Sim3
  animation ch1-1-5#sim3, ch2-2-2#sim3, ch2-4-4#sim3, ch3-6-2#sim3 + ...) → giữ frame t0/mid/end cũ
  (animation đã có step ⏭). Trong đó ch2-2-2/ch2-4-4 pixel ĐÃ đổi do fix 0006 → grade-fresh bằng mắt.

**Tổng fresh-grade: 26** (16 slider Sim2 + 5 drag Sim2 + 5 slider Sim3). **Carry-forward: 9.**

**Lưu ý biên slider (red-team #4):** chọn biên XA giá trị init nhất (heuristic probe `init>=mid?min:max`),
clamp vào `lo/hi` override khi có (local-monotonic: ch1-3-2 alpha∈[5,75], ch1-5-3 mu∈[0.1,1.0] tránh
singularity). ch3-5-3 (ω~1/r²): init r nhỏ → slider-far kéo r→max ⇒ ω nhỏ; init r lớn → kéo r→min ⇒ ω lớn.
KHÔNG mù quáng "hi" — frame phải tương phản mạnh nhất so init để grader thấy feedback rõ.

## Phases

| Phase | Tên | Ưu tiên | TDD | Status |
|---|---|---|---|---|
| 1 | Extend `buildCapturePlan` interaction-far (slider+drag, pure, test-first) | P1 | yes | complete |
| 2 | Wire interaction-far: Sim2 plan-driven + Sim3 bespoke, chạy capture | P1 | yes | complete |
| 3 | Grade 26 route fresh + carry-forward 9 route | P1 | no | complete (nâng 35 fresh — PNG gitignore) |
| 4 | Tổng hợp report + danh sách hành động | P2 | no | complete |

**Thứ tự:** 1 → 2 → 3 → 4 (tuyến tính, mỗi phase chặn phase sau).

## Acceptance criteria (toàn plan)

- [ ] `npm run test:sim:visual:unit` xanh với assertion `interaction-far` MỚI + 8 assertion cũ KHÔNG đổi.
- [ ] `npm run test:sim:visual:capture` 25/25 Sim2 pass; 16 slider-far + 5 drag-far có ảnh tương tác.
- [ ] `npm run test:sim3:visual:capture` 10/10 Sim3 pass; 5 route slider-far (đường bespoke).
- [ ] Invariant count GIỮ ở Sim2 + THÊM guard ở Sim3 afterAll (cả 2 pass).
- [ ] Route dynamic eligible: ảnh tương tác chụp SAU reset playback (không trộn frame 120); route không
      reset sạch → BỎ frame + log (không tạo frame trộn).
- [ ] `npm run test:sim:release` xanh (chứng minh KHÔNG đụng physics/mount/contract).
- [ ] Report 35 route: bảng grade 3 tiêu chí (26 fresh + 9 carried) + lỗi thật (lọc false-fail
      bằng probe-cite) + ưu tiên hành động.
- [ ] Mọi finding "feedback yếu/none" kèm probe match-state của đúng route (HARD gate).
- [ ] Ghi nhận quan sát 2D-vs-3D (CHỈ ghi, KHÔNG quyết — ngoài phạm vi).
- [ ] Vòng này CHỈ review + report; lỗi thật → quyết mở plan sửa riêng SAU khi user xem report
      (validation Q3 report-only).

## Liên quan plan khác

- `260611-0006-sim2-phet-grade-real-visual-fixes` (complete) — Phase 5 của nó deferred chính là
  plan này. Đã hấp thụ red-team finding #3 (invariant + chiều slider). KHÔNG block (nó đã xong).
- `260608-1559-sim-fullquality-triage` — nguồn `interaction-probe.json` + route-map; plan này đọc
  artifact đó ở Phase 3, KHÔNG sửa.

## Câu hỏi mở

1. ~~14 route không slider-target có cần post-drag?~~ → GIẢI (validation Q1): 5 bespoke-drag nhận
   drag-far; 9 animation-only carry-forward. Còn 9 route carry: trước carry phải so PNG chắc pixel không đổi.
2. onInput của sim dynamic (ch2-3-2/ch3-2-2/ch3-3-1/ch3-5-3): áp param tại frame hiện tại hay
   reset t=0? `.sim2-reset` có đưa về sạch không? → verify source ở Phase 2 step 1. (validation Q2:
   nếu KHÔNG sạch → bỏ frame route đó + log + fallback, KHÔNG ép frame trộn).
3. Có sim nào ease slider bằng CSS/rAF transition không (ảnh hưởng poll-vs-waitRaf)? → verify Phase 2 step 1.

## Red Team Review

3 reviewer hostile (assumption-destroyer, scope-critic, failure-mode-analyst) qua `subagent_type:
code-reviewer`, tất cả finding cite file:line → qua evidence filter. Dedupe còn 8. User chốt 2
decision (Sim3: viết slider-far riêng; scope: grade 21 fresh + carry 14).

### Findings accepted

| # | Sev | Finding | Evidence | Resolution |
|---|---|---|---|---|
| 1 | CRIT | Sim3 spec là pilot hardcode 10 case, KHÔNG dùng buildCapturePlan/manifest/shots → Phase 1+2 sinh 0 slider-far cho Sim3 nếu giả định mirror | pilot-capture.spec.js:12-23,63 | **Sim3 đường code RIÊNG** (user chốt). Phase 2 viết slider-far bespoke vào pilot loop. Ràng buộc cứng #8. |
| 2 | CRIT | Route vừa dynamic vừa slider chụp slider-far trên trạng thái đã step 120 frame → frame trộn → grader rơi đúng false-fail (self-defeating). Probe remount vì lý do này | capture-sims.spec.js:76,90-104; probe-runner.spec.js:243-251 | **RESET `.sim2-reset` TRƯỚC slider-far cho route dynamic** + đặt nhánh slider-far TRƯỚC nhánh kind==='dynamic'. Ràng buộc #7. |
| 3 | HIGH | Phase 3 grade mù 35 route + Phase 4 report mới phần lớn lặp report 2231 + fix 0006 đã ship; 14/35 route frame y hệt | independent-blind-recheck...:5,116-128; plan.md:45 | **Grade 21 fresh + carry-forward 14** (user chốt). Trước carry, so PNG để chắc pixel không đổi. |
| 4 | HIGH | ch3-5-3 kéo r→hi ⇒ ω nhỏ = frame tương phản YẾU NHẤT so init, trên đúng route false-fail ví dụ | plan.md:50-52; probe-targets.js:51 | **`slider-hi` → `slider-far`**: chọn biên XA init nhất (heuristic `init>=mid?min:max`), không mù quáng hi. Ràng buộc #3. |
| 5 | HIGH | Invariant count chỉ có ở Sim2, không ở Sim3 → acceptance "Sim3 invariant pass" rỗng nghĩa | capture-sims.spec.js:124-127 vs pilot-capture.spec.js:33-36 | **THÊM guard count vào Sim3 afterAll.** Ràng buộc #2. |
| 6 | MED | Phase 3 hand-wave "controller đối chiếu probe"; không bind probe match per-route vào verdict | phase-03:26,36 | **HARD gate:** mọi finding "feedback yếu/none" bắt buộc kèm probe match-state đúng route; thiếu → reject. |
| 7 | MED | waitRaf(2) có thể chụp giữa transition; slider tốc-độ/số (k,ω) scene gần đứng yên | phase-02:37; route-map ch3-3-1/ch2-5-3 | Verify transition ở Phase 2 step 1 → poll readout ổn định thay waitRaf cứng. Rubric Phase 3 ghi "feedback có thể ở readout-số". |
| 8 | MED | 2/8 route false-fail (ch2-1-3, ch2-5-2) là bespoke-drag → slider-far không chạm → root-cause không phủ hết | 2231:38; plan.md:45 | Ghi nhận: probe (live 83/83) là lớp chống false-fail phủ 100%; ảnh chỉ phụ. Câu hỏi mở #1. |

### Verified-rejected (reviewer tự kiểm, KHÔNG phải defect)
- `input[data-id]` selector chạy cho cả 21 route (probe drove thành công, 0 lỗi slider-not-found).
- `targets[0]` đúng control chính (route đa-target dùng cùng control: ch1-1-8 'P', ch3-1-3 'a').
- max DOM an toàn cho route không lo/hi (probe-B readoutHigh hữu hạn, 0 NaN); route singularity đã có hi override.
- Claim "giữ 8 test cũ xanh" ĐÚNG (default opts rỗng → nhánh mới không chạy).

### Whole-Plan Consistency Sweep
Sau khi áp 8 finding: đổi tên `slider-hi`→`slider-far` toàn bộ (plan.md + 4 phase file); Sim3 tách
đường bespoke (phase-02 + ràng buộc #8); scope grade 21+14 (phase-03 + ràng buộc, bảng phase); guard
count Sim3 (ràng buộc #2 + phase-02 + acceptance); reset-trước-slider-far (ràng buộc #7 + phase-02);
biên-xa-init (ràng buộc #3 + phase-01/02); probe-bind HARD gate (phase-03/04 + acceptance). Đã
reconcile: bảng phase, acceptance, 4 phase file đều dùng `slider-far`; effort Phase 2 nâng 2h→3.5h
(Sim3 bespoke). Câu hỏi mở chuyển thành verify-step trong Phase 2. Không còn mâu thuẫn → sẵn sàng implement.

## Validation Log

Verification pass SKIP (guard): `## Red Team Review` đã có evidence file:line đầy đủ, 0 tag `[UNVERIFIED]`.
Hỏi 3 decision-point thật.

### Quyết định
1. **5 route bespoke-drag NHẬN frame post-drag** (drag-far), KHÔNG chỉ probe+ảnh tĩnh. → scope fresh
   21→26, carry 14→9. Thêm `kind:'drag'` vào interactionTargets + nhánh drag-far dùng `dragHandle()`.
2. **Route dynamic reset KHÔNG sạch về t=0** → BỎ frame tương tác route đó + log + fallback frame cũ
   (KHÔNG ép frame trộn gây hiểu nhầm). Ràng buộc #7 + #9.
3. **Report-only**: vòng này CHỈ review + report; lỗi thật → quyết mở plan sửa riêng SAU khi user xem report.

### Propagation
- interactionTargets gồm slider(16)+drag(5): phase-01 (opts+test), phase-02 (build+nhánh drag-far), plan phủ sóng.
- scope 26 fresh + 9 carried: phase-03 (title/scope/steps/success/risk), phase-04 (overview/steps), bảng phase, acceptance.
- reset-fallback + drag-fallback: ràng buộc #7/#9, phase-02 risk.

### Whole-Plan Consistency Sweep (validation)
Re-read 5 file. Đổi `sliderTargets`→`interactionTargets` (gồm drag) toàn bộ; số 21/14→26/9 mọi nơi;
thêm nhánh drag-far + 2 fallback. Còn `slider-far` ở vài chỗ là ĐÚNG (label riêng cho kind slider,
song song `drag-far` cho kind drag) — không phải stale. Tên file phase-01/02 giữ "slider-hi" (chỉ
filename, nội dung dùng interaction-far/slider-far/drag-far). Acceptance + bảng phase + 4 phase file
khớp scope 26+9. Không còn mâu thuẫn → sẵn sàng implement.
