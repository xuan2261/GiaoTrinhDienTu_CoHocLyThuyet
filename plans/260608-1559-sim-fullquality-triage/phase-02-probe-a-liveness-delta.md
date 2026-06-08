# Phase 02 — Probe A: liveness delta ≠ 0 toàn 35 route

**Plan:** [plan.md](plan.md) · **TDD:** ✅ · **Status:** ✅ done · **Blocked by:** P1

## Context Links
- P0 `research/sim-probe-route-map.json`
- P1 `tools/sim-probe/probe-runner.spec.js` + `probe-delta.js`

## Overview
**Priority:** cao. Chứng minh **binding sống**: kích từng control → readout/output/scene đổi ≠ 0. Bắt control chết, binding đứt, playback không chạy.

## Key Insights
- A đồng nhất mọi route — không cần dấu, chỉ cần `|delta| > epsilon`.
- 2 kênh: Sim2 DOM `.sim2-readout-value`/`.sim2-output`; Sim3 `__SIM3_DEBUG__[id]`.
- Playback: bấm ▶ → poll `__SIM3_DEBUG__.updatedAt` hoặc readout đổi qua vài frame → đo có chuyển động.

## Requirements
**Functional:** mỗi route, mỗi control: capture before → drive (slider set+dispatch 'input' giữa range; drag-handle mousedown/move/up; playback ▶+settle) → capture after → `delta = computeDelta`. Ghi `{route, control, channel, before, after, deltaNonZero}`.
**Non-functional:** deterministic (drag tọa độ cố định, playback tua `⏭` n bước cố định).

## Architecture
Runner đọc route-map P0, loop control. Slider: `input.value=mid; input.dispatchEvent(new Event('input'))`. Drag: `mouse.move`/`down`/`up` theo handle bbox. Playback: click `.sim2-playpause` → `⏭`×N → đọc delta. Kết quả push `interaction-probe.json` field `probeA`.

## Related Code Files
**Sửa:** `tools/sim-probe/probe-runner.spec.js` (fill A logic).
**Tạo:** `tests/sim-probe-a-logic.test.js` (pure: chọn mid-value, epsilon).
**Đọc:** route-map, controls.js.

## Implementation Steps
1. **TDD red:** node test cho `midValue(min,max,step)`, `isLive(delta,epsilon)` → fail.
2. **Green:** thêm vào probe-delta.js, pass.
3. Fill runner: loop route × control, drive theo `kind`, đo 2 kênh.
4. Playback route động: ▶ → ⏭×N deterministic → assert readout/`updatedAt` đổi.
5. Drag route: tính handle bbox, mô phỏng drag, đo.
6. Emit `probeA` vào JSON. Route control chết → `deltaNonZero:false` (flag high P5).
7. Verify `test:sim:release` xanh.

## Todo List
- [ ] Node test midValue/isLive (red→green)
- [ ] Runner: slider drive + đo
- [ ] Runner: drag drive + đo
- [ ] Runner: playback drive + đo
- [ ] Sim3 kênh __SIM3_DEBUG__
- [ ] Emit probeA JSON
- [ ] release xanh

## Success Criteria
35/35 route có `probeA` mọi control; control sống → `deltaNonZero:true`; control chết phát hiện đúng (test với 1 route cố ý sai để verify probe nhạy).

## Risk Assessment
- Epsilon quá nhỏ → nhiễu float; quá lớn → bỏ sót đổi nhỏ. Calibrate qua route đã biết sống.
- Drag bbox sai → false negative. Cross-check handle visible trước drag.
- Sim3 WebGL fail → ghi `channel:fallback-2d`, đo trên DOM Sim2 thay thế.

## Security Considerations
Không.

## Next Steps
P3 thêm dấu B trên cùng cơ chế drive.
