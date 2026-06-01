# Phase 02 — Playwright capture script (classify + screenshot + step-capture)

## Context links
- Plan: [plan.md](plan.md) · Phase 01 (builder) là dependency.
- Fixture: `tests/fixtures/sim2-ch{1,2,3}.html` · Controls: `js/sim2/core/controls.js` · Sim mẫu động: `js/sim2/sims/ch3/ch3-6-2.js`

## Overview
- Priority: P0 · Status: completed · blockedBy: Phase 01
- Script Playwright DEV-ONLY: mount từng route, phân loại runtime, chụp ảnh thật, lưu PNG.

## Key Insights
- **Phân loại runtime:** sau mount, `#host .sim2-playback` tồn tại → `dynamic`, ngược lại `static`. KHÔNG đọc source sim, KHÔNG hardcode 9.
- **Tua deterministic:** ưu tiên bấm nút step `#host .sim2-step` (`onStep`→1 frame `dt=1/60`, lặp lại y hệt — verify `ch3-6-2.js:96`). Fallback nếu sim không có step: `clock.install()` + tick, hoặc `page.evaluate` gọi RAF n lần.
- **Wrap-around:** `frame()` vài sim tự reset khi vật ra khung → mốc "end" có thể nhảy về t0. Mốc mặc định N1/N2 nhỏ (vd 60/120); per-sim override ở Phase 03 sau khi Claude soi.
- Static "live": bấm `#host .sim2-playpause` (▶) rồi chờ 1-2 frame chụp (sim tĩnh phần lớn không đổi nhiều nhưng readout sống cập nhật).

## Requirements
- `tools/sim2-visual/capture-sims.spec.js` (Playwright test, chạy ngoài release):
  - Đọc manifest → mount từng route trên fixture đúng chapter.
  - Classify; build shots qua `buildCapturePlan` (Phase 01) với classification thật.
  - Static: chụp `init` (ngay sau mount) + `live` (sau ▶, chờ `requestAnimationFrame` 2 nhịp).
  - Dynamic: `t0` (sau mount/reset) → bấm step ×N1 → `mid` → bấm step ×(N2−N1) → `end`.
  - `page.locator('#host .sim2-root').screenshot()` (chụp đúng vùng sim, không cả viewport).
  - Lưu `plans/260531-2122-.../visuals/<route>__<label>.png` (tên từ `artifactName`).
  - Ghi `visuals/capture-manifest.json` = list record (route,chapter,section,kind,images) cho Phase 03.
  - Assert: tổng ảnh === Σ shots theo plan; 0 console error mỗi route (tái dùng pattern `sim2-ui-coverage.spec.js`).

## Architecture
```
playwright (dev) → fixture file:// → SIM_MAP[route](host)
   ├─ classify by .sim2-playback
   ├─ static: init + (▶ → live)
   └─ dynamic: t0 → step×N1 → mid → step×N2 → end
        ↓ locator('.sim2-root').screenshot()
   visuals/<route>__<label>.png  +  capture-manifest.json
```

## Related code files
- Create: `tools/sim2-visual/capture-sims.spec.js`.
- Read: manifest, fixtures, `core/controls.js`, `playwright.config` (xác minh testDir/baseURL không nuốt spec này).
- Reuse: `buildCapturePlan`, `artifactName` (Phase 01).

## Implementation Steps
1. Xác minh `playwright.config.js`: spec mới KHÔNG bị `test:sim:mount` nhặt vào release (đặt ngoài `tests/`, hoặc grep loại trừ). Tài liệu lệnh chạy riêng `npx playwright test tools/sim2-visual/capture-sims.spec.js`.
2. Viết spec: loop manifest, mount, classify, capture theo plan, lưu PNG + json.
3. Chạy thử Ch1 (10 sim) trước → kiểm file PNG sinh ra, mở 1-2 ảnh xác nhận không trắng.
4. Mở rộng Ch2/Ch3; xử lý route không có step (fallback RAF tick).
5. Assert count + 0 console error.

## Todo
- [x] Xác minh config không nuốt spec vào release
- [x] Spec mount+classify+capture+save
- [x] Smoke Ch1 → ảnh thật
- [x] Ch2/Ch3 + fallback tick
- [x] Assert count + 0 error

## Success Criteria
- Mọi route manifest sinh đủ ảnh theo kind; PNG mở được, không trắng toàn bộ.
- `capture-manifest.json` đủ N record. `test:sim:release` KHÔNG đổi (spec này ngoài release).

## Risk Assessment
- Clock/step không bắt loop vài sim → fallback RAF tick (`page.evaluate` gọi sim frame). Nếu vẫn kẹt → log route đó "uncaptured-dynamic", Claude soi thủ công.
- Ảnh nặng (×43+) → screenshot chỉ `.sim2-root`, nén PNG mặc định; cân nhắc gitignore.

## Security Considerations
- Chỉ đọc file local qua `file://`; không request mạng. Không secret.

## Next steps
- Phase 03: render contact-sheet từ `capture-manifest.json` + Claude đọc PNG.
