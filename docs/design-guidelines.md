# Design Guidelines

Thiết kế của project này nên giữ đúng phong cách học thuật, rõ ràng, và ổn định trên nhiều kích thước màn hình. CSS hiện tại đã chọn hướng `dark navy + gold` với accent chapter riêng.
Professional simulation lab hiện dùng chung một shell cho toàn bộ 58 route, nên visual language của shell phải đồng nhất từ chapter 1 đến chapter 3.

## Visual direction

| Yếu tố | Quy ước |
|---|---|
| Tông chính | Xanh navy đậm, mặt nền tối, nhấn vàng |
| Chapter accents | Chương 1 xanh dương, Chương 2 xanh lá, Chương 3 tím |
| Cảm giác | Học thuật, gọn, có độ tương phản cao |
| Motion | Nhẹ, chỉ hover/accordion/slide-out cần thiết |

## Design tokens

| Token | Giá trị hiện tại | Dùng cho |
|---|---|---|
| `--bg` | `#091a33` | Background dark mode |
| `--nav` | `#0d2447` | Surface chính |
| `--nav2` | `#142e56` | Surface phụ, search, math block |
| `--gold` | `#c9963a` | Accent chính |
| `--gold-l` | `#dbb36a` | Accent sáng hơn |
| `--tx` | `#e8ecf1` | Text chính |
| `--tx2` | `#8ea0b8` | Text phụ |
| `--ch1` | `#2980b9` | Chapter 1 |
| `--ch2` | `#27ae60` | Chapter 2 |
| `--ch3` | `#8e44ad` | Chapter 3 |

## Simulation design tokens

### Current Simulation Architecture (engine SVG-first `js/sim2/`)

| Yếu tố | Quy ước |
|---|---|
| Runtime | `createSimShell` (`js/sim2/core/sim-shell.js`) — SVG + overlay HTML + canvas underlay tùy chọn, RAF loop, `dispose()` gỡ sạch listener+RAF+DOM |
| Rendering | SVG primitives (`core/svg-render.js`) qua transform `world→screen` dùng chung; nhãn = HTML overlay tuyệt đối (`core/overlay.js`), KHÔNG vẽ chữ trong canvas → hết chồng nhãn |
| Theory panel | `core/panel.js` — công thức KaTeX **tô màu khớp vector** + legend (swatch) + readout sống (tabular-nums) + dòng quan sát; luôn hiện cạnh viewport (xuống dưới khi hẹp) |
| Controls | `core/controls.js` — slider có `<output>` value+đơn vị; playback ▶/⏸ + ⏭ step + ↺ reset; **start paused** (quy ước PhET, không autoplay) |
| Interaction | Drag handle (`shell.addHandle`) ↔ slider đồng bộ 2 chiều; `setValue` set property KHÔNG bắn `input` → tránh vòng lặp cập nhật |
| Touch Target | Nút playback 32px, slider accent-color theme; reduced-motion tắt transition |

### Palette mô phỏng (token `--sim-c-*` / `Sim2Palette`)

1 nguồn ý nghĩa màu, 2 mặt dùng: CSS class cho DOM + JS hằng cho SVG stroke. Mọi màu ý nghĩa tương phản ≥3:1 trên nền viewport `#fdfdfb`.

| Ý nghĩa | Màu | Key |
|---|---|---|
| Lực / lực tác dụng | `#e03030` đỏ | `force` |
| Vận tốc | `#159c3a` lục | `v` |
| Gia tốc | `#0074d9` lam | `a` |
| Hợp lực / R | `#e06a00` cam | `resultant` |
| Phản lực / pháp tuyến | `#b10dc9` tím | `reaction` |
| Mô men / ω / α | `#7c3aed` tím đậm | `moment` |
| Coriolis | `#d97706` hổ phách | `coriolis` |
| Thành phần X / Y | `#d81b60` / `#1565c0` | `x` / `y` |
| Handle kéo | `#e8501e` coral | `handle` |
| Trục / lưới | `#64748b` / `#cbd5e1` | `axis` / `grid` |

Thành phần X/Y vẽ **nét đứt** cùng màu parent. KaTeX term tô cùng màu vector qua `\textcolor{#...}` (literal bắt buộc — mirror palette, không đọc được CSS var).

### Legacy Reference

| Token | Trạng thái |
|---|---|
| `.sim-lab` shell / `js/sim-professional-lab.js` / Matter.js | ĐÃ GỠ khỏi master (bộ 52 sim cũ) — tag `archive/52-sims-pre-removal` giữ điểm quay đầu |

## Typography

| Thành phần | Quy ước |
|---|---|
| Body | System stack `Segoe UI, Tahoma, Geneva, Verdana, sans-serif` |
| Body size | `clamp(...)` theo viewport, body line-height `1.7` |
| Headings | Đậm, rõ, không trang trí quá mức |
| Hero text | Có thể uppercase, letter spacing nhẹ |
| Paragraph | Justify để giữ nhịp đọc tài liệu học thuật |

## Layout

| Khu vực | Quy ước |
|---|---|
| Topbar | Fixed, cao `52px`, chứa menu, search, theme, zoom, breadcrumb |
| Sidebar | Fixed, collapsible, có sub-menu và l3-menu |
| Content | Centered, max-width clamp, padding vừa phải |
| Simulation width | Text/math vẫn giữ nhịp đọc hẹp; `.sim-container.sim-lab` được phép nới riêng trên desktop/tablet, không đổi canvas logical size |
| Cards | Dùng cho stats, authors, notes, progress, quiz, simulations |
| Figures | Dùng `figure-container` cho ảnh minh họa thật |
| Math | Dùng `math-block`, `mathml-block`, `math-img-inline`, `math-img-block` theo loại render |

## Component rules

| Component | Quy ước thiết kế |
|---|---|
| Search | Có dropdown kết quả, highlight hover, keyboard shortcut `Ctrl K` |
| Breadcrumb | Ngắn, nằm sát topbar, ưu tiên nhãn route rõ |
| Sidebar | Accordion rõ trạng thái open/active, không nhồi quá nhiều motion |
| Page nav | Hai nút trước/sau, rõ label và title |
| Quiz | Thẻ đáp án dễ bấm, feedback rõ đúng/sai |
| Simulations | Nền sáng, canvas bo góc, control dễ chạm |
| Simple simulation lab shell | Dùng `.sim-lab` scoped shell cho toàn bộ 58 route: layout wide chia scene trái + right inspector phải (readouts, controls, formula, hint), header + title, readout cards grid, hint; no checkpoint/feedback panels; reset/play-pause controls cho animated routes |
| Glossary | Tooltip nhỏ, không che nội dung chính |
| Notes | Panel nổi ở góc phải, không phá layout đọc |

## Simple simulation lab shell

| Slot | Quy ước |
|---|---|
| `.sim-header` | Route title bar, scoped under `.sim-lab` |
| `.sim-readout-grid` | Display cards: short label/value pairs align on one compact row when space allows; long labels/values wrap naturally without horizontal overflow |
| `.sim-lab-hint` | Single-line objective/formula hint text |
| Right inspector | Desktop/tablet stack cho readouts, controls, formula, hint ở cột phải; `<=768px` phải collapse sang bố cục stacked dọc, không được tạo horizontal overflow |
| Promax slots | Pilot-only diagnostics toggles, invariant status, formula summary, mini graph summary, and challenge feedback stay scoped under `.sim-lab`; only 6 routes mount them today, with the remaining 52 routes classified in the rollout matrix |
| Canvas overlay | Learner-facing formulas and dynamic values are forbidden in `.sim-lab-overlay`; use `.sim-formula-panel` and `.sim-readout-card` |
| `.sim-handle-a11y-layer` | Per-route ARIA overlay layer (positioned over canvas, `overflow: hidden`); contains `.sim-handle-a11y` focusable buttons for each drag handle; keyboard nudge via Arrow + Shift, Escape to blur; `.sim-aria-live` polite region for screen-reader feedback; `.sr-only` for visually-hidden labels |
| `lab.setHint(text)` | Update hint at runtime (used by route behaviors) |
| `lab.reset()` | Reset route state to initial snapshot |
| `lab.isPlaying` | Boolean flag: animation running state for play/pause toggle |
| `lab.pause()` / `lab.resume()` | Animation pause/resume for animated routes |
| `lab.prefersReducedMotion` | Boolean flag: mirrors `prefers-reduced-motion` media query; animation engine suppresses non-essential motion when true |

CSS mới cho lab phải scope dưới `.sim-lab`; tránh selector global như `.toolbar`, `.panel`, `.status`.

## Shared-first DeCuong UX sweep

- Chapter accent tokens phải đi qua `.sim-lab[data-route-id^="ch1"]`, `.sim-lab[data-route-id^="ch2"]`, và `.sim-lab[data-route-id^="ch3"]` để tô chip, active control, và left border của readout/formula/hint.
- Touch controls phải giữ `min-height: 44px` trên mobile; không giảm dưới mức thumb-friendly này.
- Readout cards phải gắn `data-readout-kind` để metadata và accent left border phản ánh đúng loại giá trị; layout card dùng shared compact name-value CSS, không thêm variant riêng theo route.
- Readout cards ưu tiên output/status vật lý cốt lõi; slider/control không được tự động mirror vào readout nếu scene chưa khai báo explicit hoặc opt-in qua policy.
- Formula và dynamic numeric values phải nằm trong right inspector (`.sim-formula-panel`, `.sim-readout-card`), không nằm trên canvas overlay.
- Equal values chỉ được giữ khi là ý nghĩa vật lý có chủ đích, ví dụ đối xứng phản lực hoặc bảo toàn động lượng; duplicate aliases như cùng một lực dưới hai label phải bị loại.
- Route-owned handles phải được vẽ bởi shared lab sau renderer output, có hit ring, label ngắn, và legend compact lấy từ handle descriptors.
- Mọi slider, segmented button, handle kéo, và nút play animation phải tạo phản hồi nhìn thấy được qua canvas hoặc readout trong cùng route.
- Canonical geometry sliders phải là nguồn state chính cho route; không dùng proxy slider khiến canvas và readout lệch nhau.
- Direct drag phải giữ các giá trị hợp lệ bằng 0, không ép `0` thành trạng thái rỗng hoặc giá trị mặc định khác.
- Visible checker labels phải được localize theo ngôn ngữ giáo trình, không giữ label kỹ thuật tiếng Anh nếu UI đã Việt hóa.
- Shell phải giữ semantic hooks: `role="region"`, route `aria-label`, status `aria-live`, canvas `aria-describedby`.
- Hint text phải ưu tiên câu chủ động, lấy từ route handles khi có thể; tránh hint chung chung nếu route metadata đã đủ.
- Segmented buttons phải đồng bộ state bằng `aria-pressed`, `data-control-key`, và `data-value`.
- Promax pilot controls phải dùng Vietnamese labels, `aria-pressed`, polite live feedback, và không ghi persistence mặc định.

## Responsive behavior

| Breakpoint | Hành vi |
|---|---|
| `<= 900px` | Topbar ưu tiên menu, brand, search, theme/bookmark; ẩn breadcrumb và font zoom để tránh overlap |
| `<= 768px` | Sidebar trượt ra overlay, main full-width, content padding nhỏ hơn; simulation dùng gần full viewport khi đủ chỗ và right inspector phải xếp dọc, không được tràn ngang |
| `<= 560px` | Simulation quay về contained width trong content, controls dễ chạm, readout 2 cột |
| `<= 480px` | Ẩn breadcrumb, thu topbar, ẩn kbd hint trong search, stats grid xuống 2 cột |
| `>= 2000px` | Tăng sidebar width và content max-width |
| `>= 2560px` | Nới thêm content width, giữ nhịp đọc thoáng |

## Content styling rules

| Loại nội dung | Quy ước |
|---|---|
| Figure | Ảnh có border nhẹ, shadow nhỏ, caption italic |
| Equation ảnh | Không render như figure thường; dùng class math riêng |
| MathML | Centered block, bọc bởi `mathml-block` |
| KaTeX | Render gọn, không phá line-height paragraph |
| Images | `max-width: 100%`, không tràn content area |

## Do / Don't

| Do | Don't |
|---|---|
| Reuse CSS variables hiện có | Thêm palette mới không có lý do |
| Giữ theme attr `data-theme` | Đổi sang cơ chế theme riêng lẻ |
| Giữ simulation panel nhẹ và sáng | Ép simulations vào dark card nặng nề |
| Giữ control rõ chữ, dễ chạm | Nhét quá nhiều micro-interaction |
| Giữ visual hierarchy theo chapter | Dùng style ngẫu nhiên giữa các chapter |

## Ghi chú

- `dark-mode` chỉ là fallback style cho một số output generated, còn primary switch là `data-theme`.
- Nếu thêm component mới, nên bám cùng token và spacing system hiện tại trước khi nghĩ đến redesign lớn.
- Với simulation labs, đừng tạo layout variant riêng cho từng route; chỉ thay topic/data, không thay shell.
- Không nới `.content-area` toàn cục để làm simulation rộng hơn; chỉ dùng rule scoped cho `.content-area .sim-container.sim-lab`.
