# Phase 01 — Scaffold probe harness dev-only

**Plan:** [plan.md](plan.md) · **TDD:** ✅ · **Status:** ✅ done · **Blocked by:** P0

## Context Links
- `tools/sim2-visual/playwright.visual.config.cjs` — mẫu config dev-only tách release
- `tools/sim2-visual/capture-sims.spec.js` — mẫu mount qua SIM_MAP + fixture
- P0 `research/sim-probe-route-map.json`

## Overview
**Priority:** cao. Dựng khung probe + config riêng + lớp tiện ích đo delta. CHƯA enumerate logic A/B (P2/P3). TDD: pure helper trước.

## Key Insights
- Tách release: config riêng `tools/sim-probe/playwright.sim-probe.config.cjs`, KHÔNG thêm vào `test:sim:release` (mirror `playwright.visual.config.cjs`).
- Fixture sẵn `tests/fixtures/sim2-ch{1,2,3}.html` + `addStyleTag(css/style.css)` + `data-theme=light` (bài học Bug A/B/C).
- Helper đo delta = pure function (testable Node): `readDom(host, selector)`, `readDebug(id, path)`, `computeDelta(before, after)`.

## Requirements
**Functional:** runner mount 1 route qua `SIM_MAP[id]`, set control, đọc readout 2 kênh (DOM + `__SIM3_DEBUG__`), trả delta. Config emit JSON ra `plans/.../visuals/interaction-probe.json`.
**Non-functional:** dispose sạch sau mỗi route (không leak RAF/listener); chạy `npm run test:sim:probe` độc lập.

## Architecture
```
tools/sim-probe/
├── playwright.sim-probe.config.cjs   # config riêng, outDir plans/.../visuals
├── probe-delta.js                    # PURE: computeDelta, parseReadout, signOf
├── probe-runner.spec.js              # Playwright: mount + drive control (P2/P3 fill)
└── (P2/P3 thêm logic)
tests/sim-probe-delta.test.js          # Node test pure helper (TDD red→green)
```
Script `package.json`: `"test:sim:probe": "playwright test --config=tools/sim-probe/playwright.sim-probe.config.cjs"` + `"test:sim:probe:unit": "node tests/sim-probe-delta.test.js"`.

## Related Code Files
**Tạo:** 4 file trên + 1 node test + 2 script package.json.
**Đọc:** config/spec mẫu sim2-visual; `js/sim2/core/controls.js` (selector chuẩn).
**KHÔNG sửa:** sim, fixture, release config.

## Implementation Steps
1. **TDD red:** viết `tests/sim-probe-delta.test.js` assert `computeDelta`, `signOf`, `parseReadout` (số có đơn vị "12 N·m" → 12). Chạy → fail (chưa có module).
2. **Green:** viết `probe-delta.js` pure. Chạy node test → pass.
3. Viết `playwright.sim-probe.config.cjs` (outDir = plans visuals, headless chromium).
4. Viết `probe-runner.spec.js` skeleton: mount route, addStyleTag, data-theme light, host 960px; mount qua SIM_MAP; dispose afterEach. Chưa drive control (P2).
5. Thêm 2 script package.json.
6. Chạy `test:sim:release` → verify vẫn xanh (probe không lọt vào).

## Todo List
- [ ] Node test pure helper (red)
- [ ] probe-delta.js (green)
- [ ] sim-probe config tách release
- [ ] runner skeleton mount+dispose
- [ ] 2 script package.json
- [ ] Verify test:sim:release xanh

## Success Criteria
`test:sim:probe:unit` xanh; runner mount+dispose 1 route mẫu không leak; `test:sim:release` không đổi kết quả.

## Risk Assessment
- Helper parse readout đa định dạng ("ω = 2.5 rad/s", "−3.0") → test cover dấu âm, đơn vị, KaTeX label.
- Config lẫn vào release → bước 6 verify bắt buộc.

## Security Considerations
Không. Dev-only.

## Next Steps
P2 (A) + P3 (B) fill logic vào runner.
