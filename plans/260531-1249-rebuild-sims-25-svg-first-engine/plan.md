---
title: "Gỡ 52 mô phỏng, dựng lại 25 trên engine SVG-first"
status: completed
created: 2026-05-31
mode: deep+tdd
blockedBy: []
blocks: []
source: brainstorm
---

# Plan — Rebuild 25 simulations on a new SVG-first engine

## Mục tiêu
Gỡ sạch 52 mô phỏng cũ khỏi master (giữ git tag archive), dựng lại **25 sim "ít mà tinh"**
trên **engine SVG-first 3 tầng mới**, build lần lượt theo chương 1→2→3. Physics PORT công
thức đã verify (commit 6783b08) — tính đúng gắn vào *công thức*, không vào engine render.

**Nguồn:** `plans/reports/brainstorm-sim-rebuild-260531-1240-remove-52-build-25-svg-first-engine-report.md`

## Quyết định khóa (đã chốt với user)
- **Test**: Node physics per-sim (bảo toàn E/p, khớp dạng đóng) + Playwright smoke mỏng
  (mount OK · 0 console error · test bounding-box DOM nhãn không chồng). **Bỏ** pixel-baseline.
- **Readout/nhãn**: HTML overlay định vị tuyệt đối qua transform `world→screen` dùng chung.
- **Test cũ**: xóa sạch `test:sim:*` + `tools/*sim*` ngay trong P0.
- **Engine dir**: `js/sim2/` (namespace mới, không đụng glob xóa `js/sim-*.js` / `js/sims/`).
- **Mount contract giữ nguyên**: `window.SIM_MAP[pageId] → factory`; `loader.js initSimulations()`.

## GOTCHA bắt buộc (P0)
Glob `js/sim-*.js` **bao gồm** `sim-physics-statics.js` / `-kinematics.js` / `-dynamics.js`
— **nguồn công thức cần port**. P0 **loại trừ** 3 file này khỏi lệnh xóa. Xóa nốt ở P5 sau khi
P1 đã port xong và verify.

## Phases

| # | Phase | Trạng thái | Verify chính |
|---|-------|-----------|--------------|
| P0 | [Gỡ 52 sim + test/tool cũ](phase-00-remove-52-sims.md) | ✅ completed | App content-only · 0 console error · test:quiz+test:content xanh |
| P1 | [Scaffold engine SVG-first](phase-01-scaffold-svg-engine.md) | ✅ completed | 1 sim "hello" mount qua SIM_MAP · transform round-trip test · physics port require() được trong Node |
| P2 | [Chương 1 — 10 sim tĩnh học](phase-02-chapter1-statics-10-sims.md) | ✅ completed | 10/10: physics Node test + smoke mount + nhãn không chồng |
| P3 | [Chương 2 — 7 sim động học](phase-03-chapter2-kinematics-7-sims.md) | ✅ completed | 7/7 nt + canvas underlay #11/#15/#17 khớp toạ độ SVG |
| P4 | [Chương 3 — 8 sim động lực](phase-04-chapter3-dynamics-8-sims.md) | ✅ completed | 8/8 nt + underlay #25 |
| P5 | [Test harness 25 route + docs](phase-05-test-harness-and-docs.md) | ✅ completed | `test:sim:*` mới xanh (25 route) · docs/README khớp · xóa physics cũ |

## Kiến trúc tóm tắt (chi tiết ở P1)
```
SIM_MAP[pageId] → factory(container) → { dispose }
   │
   ├─ PHYSICS  js/sim2/physics/*  (port IIFE→UMD, pure, RK4 sn, test Node)
   ├─ TRANSFORM js/sim2/core/transform.js  (scale+translate+flipY — DÙNG CHUNG)
   ├─ SVG RENDER js/sim2/core/svg-render.js  (<line>+marker, <circle>, <path>)
   ├─ OVERLAY  js/sim2/core/overlay.js  (HTML nhãn+readout tuyệt đối qua transform)
   └─ CANVAS UNDERLAY (tùy chọn) js/sim2/core/canvas-underlay.js  (#11/#15/#17/#25)
```

## Dependency chain
P0 → P1 → P2 → P3 → P4 → P5 (tuần tự; P2/P3/P4 đều phụ thuộc engine P1).

## 25 route-id (đúng thứ tự build)
**Ch1:** ch1-1-3, ch1-1-4, ch1-1-5, ch1-1-6, ch1-2-3, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch1-6-3
**Ch2:** ch2-1-1, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-2, ch2-5-3
**Ch3:** ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4, ch3-6-2

## Unresolved questions
- Tên dir `js/sim2/` — user có muốn đổi (vd `js/sim-engine/`)? Không chặn, đổi 1 chỗ.
- P5: có archive thành **nhánh** (ngoài tag) để bảo trì bộ cũ song song không? (tag đủ quay đầu).
