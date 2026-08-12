---
title: "Nâng cấp 25 sim SVG-first: pro · trực quan · sinh động · gắn lý thuyết"
status: cancelled
created: 2026-05-31
mode: deep+tdd
blockedBy: []
blocks: []
source: brainstorm
supersededBy: 260713-1524-fix-all-sim2-sim3-defects-deep-tdd
---

# Plan — Nâng cấp diện mạo + UX + lý thuyết cho 25 sim SVG-first

## Mục tiêu
Nâng cấp **25 sim hiện có** (`js/sim2/`) trên 4 mặt: tương tác đầy đủ (slider + play/pause/reset),
gắn lý thuyết (công thức KaTeX + giá trị sống), thẩm mỹ pro (token màu + legend + card đẹp),
affordance UX (drag gợi ý, responsive). **KHÔNG dựng lại, KHÔNG đụng physics đã verify.**

**Nguồn:** `plans/reports/brainstorm-design-260531-1657-sim2-pro-visual-ux-theory-upgrade-report.md`

## Quyết định khóa (đã chốt với user)
- Nâng cấp ở **tầng chung** (3 module core mới + mở rộng shell + CSS token) → 25 sim cùng hưởng (DRY).
- Tương tác **đầy đủ cho mọi sim**; **cho phép control bespoke** ở ~3-5 sim hình-học (slider gượng).
- Pilot **ch1-1-3 (tĩnh) + ch3-6-2 (động)** trước → user duyệt look&feel → mới nhân ra 25.
- Phong cách chuẩn sim giáo dục (PhET/oPhysics): rõ, ít nhiễu, tương phản tốt, tabular-nums.

## Palette CHỐT (chuẩn PhET — user duyệt 2026-05-31)
Token `--sim-c-*` + `Sim2Palette` JS mirror. Term KaTeX tô cùng màu vector.

| Ý nghĩa | Màu | Key |
|---|---|---|
| Lực / lực tác dụng | đỏ `#e03030` | force |
| Vận tốc | lục `#2ecc40` | v |
| Gia tốc | lam `#0074d9` | a |
| Hợp lực / R | cam `#ff851b` | resultant |
| Phản lực / pháp tuyến | tím `#b10dc9` | reaction |
| Mô men / ω / α | tím đậm `#7c3aed` | moment |
| Coriolis | hổ phách `#d97706` | coriolis |
| Thành phần X/Y | cùng màu parent + **nét đứt** 50% | (dùng dash, không key riêng) |
| Handle kéo | coral `#ff7043` | handle |
| Trục / lưới | `#cbd5e1` / `#e2e8f0` | axis / grid |

Lưu ý: hex cần check tương phản ≥3:1 trên nền viewport `#fdfdfb` trước khi chốt cứng (concern của researcher).

## Quy ước UX (từ research PhET/oPhysics — `plans/reports/researcher-260531-1657-educational-physics-sim-ux-conventions-report.md`)
- **Start paused**: sim animation khởi động ở trạng thái TĨNH, người dùng bấm ▶ mới chạy (autoplay giết tương tác). → ĐỔI hành vi ~8 sim đang autoplay; thêm **nút step (⏭)** cho sim động lực.
- **tabular-nums + min-width** mọi readout → hết nhảy layout (CSS 2 dòng, gần như free).
- **`<output>` gắn mỗi slider**, hiện value + đơn vị, cập nhật trên `input` realtime.
- **Color-match KaTeX ↔ vector**: term trong công thức tô cùng màu mũi tên (`\color{...}{F}`) → nối công thức–hình không cần giải thích.
- **prefers-reduced-motion**: check `matchMedia` lúc init → start paused, tắt auto-advance (CSS media query KHÔNG dừng RAF, phải check JS).
- **Default params phải DEMO khái niệm** (góc non-trivial, motion thấy rõ); **min vector stub 6px** (vector gần 0 vẫn thấy hướng).
- **Legend luôn hiện** (swatch + 1 từ), không giấu sau toggle.

## Ràng buộc bất biến
- Offline `file://`, **0 dependency mới**. Không đụng `js/sim2/physics/*`.
- Giữ mount contract `window.SIM_MAP[pageId] → factory(container) → { dispose }` + route-id cũ.
- `dispose()` gỡ sạch listener (kể cả slider) + RAF + DOM — `test:sim:mount` khóa điều này.
- KaTeX có thể vắng (fallback text) — degrade như `overlay.readoutCard` đang làm.

## Phases (TDD: tests-first mỗi phase)

| # | Phase | Trạng thái | Verify chính |
|---|-------|-----------|--------------|
| P0 | [Foundation: core + CSS token](phase-00-foundation-core-css.md) | done | test ui-components xanh · transform round-trip giữ · dispose sạch |
| P1 | [Pilot 2 sim + DUYỆT](phase-01-pilot-2-sims.md) | done | ch1-1-3 + ch3-6-2: control + panel + legend + dispose sạch · **user duyệt look** |
| P2 | [Ch1 — 9 sim còn lại](phase-02-chapter1-remaining-8-sims.md) | done | 9/9 retrofit · mount xanh · bespoke cho hình-học |
| P3 | [Ch2 — 7 sim](phase-03-chapter2-7-sims.md) | done | 7/7 retrofit · canvas↔SVG khớp |
| P4 | [Ch3 — 7 sim còn lại](phase-04-chapter3-7-sims.md) | done | 7/7 retrofit · underlay khớp |
| P5 | [Harness 25 route + docs](phase-05-harness-docs.md) | done | `test:sim:release` xanh 25 route · docs/README khớp |

## Kiến trúc tóm tắt (chi tiết ở P0)
```
sim2-card
 ├─ header (tên + badge §mục)
 ├─ viewport-host → sim2-root [canvas? + svg + overlay]   ← engine cũ, giữ nguyên
 ├─ theory panel  js/sim2/core/panel.js  (KaTeX công thức + readout sống + legend + quan sát)
 └─ control bar   js/sim2/core/controls.js  (slider + ▶/⏸/↺ — TÁCH khỏi viewport)
palette          js/sim2/core/palette.js  (token màu dùng chung, hết hex rải rác)
shell            js/sim2/core/sim-shell.js  (compose 4 vùng + tính lại screenBox + responsive)
```

## Dependency chain
P0 → P1 (DUYỆT) → P2 → P3 → P4 → P5. P1 là cổng duyệt; P2-P4 độc lập tương đối sau P1.

## 25 route-id
**Ch1:** ch1-1-3*, ch1-1-4, ch1-1-5, ch1-1-6, ch1-2-3, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch1-6-3
**Ch2:** ch2-1-1, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-2, ch2-5-3
**Ch3:** ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4, ch3-6-2*
(`*` = pilot P1)

## Nhóm sim hình-học (control bespoke, không ép slider)
ch1-1-8 (đổi loại gối → FBD), ch1-6-3 (trọng tâm ghép/khoét), ch1-2-3 (kéo 2 vector đồng quy),
ch2-5-2/ch2-5-3 (kéo vật rắn). Chốt rõ sau pilot P1.

## Unresolved questions
- ~~Panel lý thuyết mặc định mở (rộng) / thu gọn (hẹp)~~ → **CHỐT (P1, user duyệt)**: panel LUÔN hiện cạnh viewport (xuống dưới khi khung hẹp), không nút thu gọn — đúng quy ước PhET.
- Nhóm hình-học cần chuẩn hóa 1-2 mẫu control bespoke hay để tự do — chốt sau P1.
- ~~Hex palette PhET cần check tương phản ≥3:1 trên nền `#fdfdfb`~~ → **ĐÃ GIẢI QUYẾT (P0)**: giữ hue, làm đậm 4 màu fail (v `#2ecc40`→`#159c3a`, resultant `#ff851b`→`#e06a00`, handle `#ff7043`→`#e8501e`, axis `#94a3b8`→`#64748b`). Mọi màu ý nghĩa nay ≥3:1; grid là đường phụ (miễn).

## Bug fix phát sinh (P1)
- **`resolveCollision2D` guard ngược dấu** (`dynamics.js`): n̂ trỏ vật1→vật2, v_rel=v₁−v₂ → đang lao vào ⟺ vrn>0, nhưng code cũ `if(vrn>=0) return identity` → bỏ qua xử lý va chạm → **2 vật xuyên nhau**. Sửa `>=0`→`<=0`. Test verified cũ chỉ kiểm bảo toàn động lượng (identity-return vẫn xanh) → khe hở. Đã thêm assert vận tốc-sau đúng giá trị + 2 vật tách nhau để đóng khe.
