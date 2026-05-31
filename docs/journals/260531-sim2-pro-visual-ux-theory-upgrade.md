# Nâng cấp 25 sim SVG-first: pro · trực quan · gắn lý thuyết (6 phase TDD)

**Ngày:** 2026-05-31
**Plan:** `plans/260531-1657-sim2-pro-visual-ux-theory-upgrade/`
**Kết quả:** DONE — 6 phase (P0–P5), `test:sim:release` xanh (86 Playwright + 8 node physics + content + quiz), code-review không blocker.

## Đã làm

Thêm **tầng UI dùng chung** cho 25 sim SVG-first (`js/sim2/`) — KHÔNG dựng lại, KHÔNG đụng kiến trúc 3 tầng:
- 3 module core mới: `palette.js` (token màu, mirror CSS `--sim-c-*`), `panel.js` (theory panel: công thức KaTeX tô màu khớp vector + legend + readout sống tabular-nums), `controls.js` (slider + playback ▶/⏸/⏭/↺, start-paused).
- `sim-shell.js` thêm `setTheory()`/`addControls()` + `reservePanel` (co viewport 60% upfront → transform đúng ngay, không recompute → giữ canvas↔SVG ≤1px).
- Retrofit 25 sim: slider cho sim tham số, bespoke drag cho 5 sim hình-học, playback cho sim động.
- Harness manifest-driven phủ 25 route + guard cấm hex rải rác.

## Sự kiện đáng nhớ nhất — bug trong code "verified-sticky"

Lúc duyệt pilot, user thấy 2 vật ở ch3-6-2 **xuyên qua nhau** thay vì bật ra. Đây là va chạm với code `resolveCollision2D` trong `js/sim2/physics/` — vùng đã đánh dấu "verified, đừng đụng".

Thay vì vá quanh ở tầng sim, tôi trace số học từ gốc: guard `if (vrn >= 0) return {v1,v2}` bị **ngược dấu**. Với n̂ trỏ vật1→vật2 và v_rel = v₁−v₂, đang-lao-vào ⟺ vrn>0 — nhưng guard cũ lại bỏ qua xử lý xung lực đúng lúc đó → trả nguyên vận tốc → xuyên vật. Sửa 1 ký tự (`>=`→`<=`).

**Vì sao test verified bỏ sót:** test cũ chỉ kiểm bảo toàn động lượng. Identity-return (trả nguyên vận tốc) thỏa mãn bảo toàn động lượng một cách tầm thường → test xanh nhưng nhánh xử lý va chạm **chưa bao giờ chạy thật**. Đây là khe hở kiểm thử kinh điển: "test xanh" ≠ "code đúng" khi assertion quá yếu.

Bài học: "verified-sticky" bảo vệ khỏi đảo chiều quyết định tùy tiện, KHÔNG miễn nhiễm với bug mà verification ban đầu bỏ sót. Khi audit/quan sát lộ ra hành vi sai *mới* (không phải counter-argument suông), đó chính là tín hiệu được phép sửa. Đã đóng khe hở bằng assert vận tốc-sau đúng giá trị (v₁'=−1.6, v₂'=1.4) + bảo toàn động năng e=1 + 2 vật tách nhau.

## Quyết định chốt với user
- Palette PhET: 4 màu fail tương phản ≥3:1 → làm đậm giữ hue (v, resultant, handle, axis).
- Panel lý thuyết: LUÔN hiện cạnh viewport (không nút thu gọn) — đúng quy ước PhET.

## Khác
- KaTeX render `\vec` thành `<svg>` nội bộ → phải scope assertion mount vào `svg.sim2-svg` thay vì mọi `<svg>`.
- code-review: 1 finding thấp-TB (T₀ lệch khi đổi m₁/m₂ giữa chừng ch3-6-2) → đã sửa (onInput gọi reset).
