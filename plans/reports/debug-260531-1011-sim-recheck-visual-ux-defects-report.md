# Debug Report — Re-audit 52 Mô Phỏng (Visual / Content / UX)

**Date:** 2026-05-31 10:11
**Scope:** Re-audit toàn bộ 52 route sau plan `260530-1811-simulation-physics-theory-fidelity-fixes` (commit 6783b08).
**Tầng debug:** Visual, nội dung trống, UX — KHÔNG physics (physics đã sửa & verify ở plan trước).
**Capture:** `plans/reports/260531-sim-recheck-capture/` (52/52 PNG, trạng thái SAU plan, server đúng project port 8023).

---

## FIXES APPLIED & VERIFIED (2026-05-31, cùng phiên)

5 defect P1+P2 đã sửa + xác minh bằng ảnh tươi (`verify-fixes/`) + regression (`verify-regression/`). Tất cả file `node --check` OK.

| # | Route | Defect | Fix | File | Verified |
|---|---|---|---|---|---|
| 1 | ch3-5-1 | formula "m·a_C M" vỡ subscript | LaTeX `m\vec{a}_{CM}=\sum\vec{F}_{ext}` | `ch3-dynamics-all-18-scenes.js:36` | ✅ subscript đúng |
| 2 | ch3-6-3 | "bảotoànp,e" mất dấu cách | `\text{bảo toàn } p,\ e` | `ch3-dynamics-all-18-scenes.js:51` | ✅ "bảo toàn p, e" |
| 3 | ch1-1-5 | slider nhãn "\|R\|" lệch readout 248.3N | nhãn → "Độ lớn lực" | `ch1-force-law-scenes.js:74` | ✅ không còn mâu thuẫn |
| 4 | ch1-1-8 | readout "N N" (nhân đôi đơn vị) | thêm opt-in `noUnit:true` (additive, backward-compat) | `sim-readout-format.js:75` + `ch1-force-law-scenes.js:113` | ✅ "Phản lực: N" |
| 5 | ch2-2-2 | ε readout=37 (derived shadow) ≠ slider 0 | mở rộng nhánh trust-state cho ch2-2-2 | `sim-professional-lab.js:143-149` | ✅ ε=0 khớp slider |

**Regression check** (route đi qua code path đã sửa): ch1-5-3 (α-from-state branch), ch1-1-3 (generic readout), ch1-3-6 (units), ch2-3-2 (sibling) — tất cả ĐÚNG, 0 regression.

**Shared-module edits an toàn:**
- `noUnit` flag: default falsy → 51 route khác đi đúng path cũ (`inferUnit` chạy như trước).
- `derived` alpha: chỉ THÊM `ch2-2-2` vào nhánh đọc `state.alpha`; ch1- không đổi.

**Còn lại (P3 — chưa sửa, cần runtime/ý kiến user):** xem §Unresolved.

---

## Executive Summary

Physics-layer fix của plan trước **áp dụng đúng & xác minh thật** (xem §Verified). Toàn bộ 52 route mount canvas, `hasContent=true`, **0 console error** (manifest). Cái còn "tệ" thuần tầng **visual/UX/content** — chỉ mắt người chấm được, không vỡ kỹ thuật.

Defect quy về **5 nhóm root-cause**, đa số là lỗi cấu hình scene + 1 lỗi framework (readout shadow). Không cái nào là regression physics.

**Mức độ:** 0 BROKEN physics. ~8 route có defect visual/UX rõ; phần còn lại minor (layout/nhãn).

---

## Verified — Physics đã sửa thật (đối chứng ảnh tươi)

| Route | Bằng chứng (ảnh mới) | Trước plan |
|---|---|---|
| ch1-4-4 | báo "chưa cân bằng" (ΣF/ΣM thật) | luôn báo cân bằng giả |
| ch1-4-1 | 1 hợp lực nhất quán 106N | mâu thuẫn nhiều giá trị |
| ch1-4-2 | M = 199.8 N.m | in "0°" (nhãn sai đơn vị) |
| ch1-5-1 | Fms = 53.2N = μN (chặn đúng) | tràn 88N (không chặn) |
| ch2-4-4 | a_e = 3.75 thật | bịa số |
| ch2-5-2 | IC suy từ giao 2 đường vuông góc | bịa vị trí |
| ch1-5-3 | tan α = 0.34 (không "°") | nhãn sai đơn vị |
| ch3-2-3 | nhãn F_AB / F_BA tách rời | "FABFBA" chồng |

→ **Rule:** các quyết định physics trên đã verified bằng ảnh; không đảo ngược.

---

## Defect Inventory — 5 nhóm Root-Cause

### NHÓM 1 — Nhãn slider gán tên đại lượng OUTPUT (sai ngữ nghĩa)
**Route:** ch1-1-5
**Triệu chứng:** slider ghi "|R|: 125N" nhưng readout |R| = 248.3N (lệch hẳn).
**Root cause:** `js/sims/ch1/ch1-force-law-scenes.js:74`
```js
controls: [slider('force', '|R|', 50, 180, 125, 'N', 5), ...]
```
Slider điều khiển biến **input** `force` nhưng gán nhãn `'|R|'` (đại lượng **output** = ΣFᵢ). Readout `resultantMagnitude` (line 76) tính từ tổng vector → luôn ≠ nhãn slider.
**Fix:** đổi nhãn slider thành `'|F| vào'` / `'Lực thành phần'` (KHÔNG đổi key `force`, KHÔNG đổi readout).

---

### NHÓM 2 — Readout shadow: derived `d` đè state slider (framework + key collision)
**Route:** ch2-2-2
**Triệu chứng:** readout ε = 37 rad/s² nhưng slider "Gia tốc góc ε: 0 rad/s²".
**Root cause (2 tầng):**
1. `js/sim-professional-lab.js:143-145` — với route KHÔNG phải ch1-, `alpha` bị tính lại thành đại lượng **hình học**:
```js
const alpha = routeId.startsWith('ch1-') && Number.isFinite(Number(state.alpha))
  ? c(Number(state.alpha), 0, 55)
  : c(Math.round((H - state.primary.y) / 5), 0, 55);  // ← ch2-2-2 rơi vào nhánh này
```
   `37 = round((H − primary.y)/5)` — số rác từ vị trí điểm kéo, vô nghĩa với ε.
2. `js/sim-professional-lab.js:338` — `source = Object.assign({}, state, d)` → `d.alpha`(=37) **đè** `state.alpha`(=0, giá trị slider). Readout ch2-2-2 key `'alpha'` (`ch2-kinematics-scenes.js:78`) đọc trúng `d.alpha`.
**Fix (chọn 1):**
- (a) Readout ch2-2-2 dùng key riêng (vd `epsilonCtrl`) map thẳng `state.alpha`, không trùng `d.alpha`; HOẶC
- (b) Sửa derived: nhánh geometric `alpha` chỉ áp cho family cần (ch1 friction/support), route rotation đọc `state.alpha`.
**Lưu ý:** đây là root-cause dùng chung — quét các route ch2-/ch3- khác có readout key trùng tên field trong `derived()` return (dx, dy, force, alpha, moment, va, vb, ac, ae, …).

---

### NHÓM 3 — Giá trị categorical (string) format như numeric → nhân đôi đơn vị
**Route:** ch1-1-8
**Triệu chứng:** readout "Phản lực: N N".
**Root cause:** behavior trả `supportReaction = 'N'` (ký hiệu phản lực, là **chuỗi**) — `js/sims/ch1/ch1-force-law-behaviors.js:106`, map mode→`row[2]`. Readout khai `kind: 'result'` (`ch1-force-law-scenes.js:113`) → formatter tự nối đơn vị "N" vào value đã là "N" ⇒ "N N".
**Fix:** đổi `kind: 'result'` → `kind: 'mode'`/`'default'` (value là nhãn, không phải lực số); HOẶC formatReadoutCardValue bỏ nối unit khi value non-numeric.
**Quét lan:** mọi readout có value chuỗi + kind numeric (`result/force/moment`).

---

### NHÓM 4 — Formula plain-text/unicode đưa vào KaTeX → vỡ subscript & mất dấu cách
**Routes:** ch3-5-1, ch3-6-3
**Triệu chứng:**
- ch3-5-1: "m· a_C M = ΣF_e xt" — `a_CM`→ chỉ subscript `C`, lòi `M`; `F_ext`→ `F_e` rồi `xt`.
- ch3-6-3: "bảotoànp, e" — chuỗi prose mất hết dấu cách, chữ thành biến italic.
**Root cause:** trường `formula` của scene là **prose + unicode + `_`**, bị render bằng KaTeX (math mode):
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js:36` → `'m·a_CM = ΣF_ext'`
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js:51` → `'bảo toàn p, e'`
KaTeX: `_CM` chỉ nhận 1 ký tự subscript; space bị nuốt trong math mode.
**Fix:** viết LaTeX đúng:
- ch3-5-1: `m\,\vec{a}_{CM} = \sum \vec{F}_{ext}`
- ch3-6-3: `\text{bảo toàn } p,\ e`
**Quét lan:** kiểm mọi `formula:` field chứa prose tiếng Việt / `_` nhiều ký tự (grep các scene file).

---

### NHÓM 5 — Visual phụ / layout (minor, không sai số liệu)
| Route | Defect | Vị trí |
|---|---|---|
| ch1-1-5 | chấm "R" + vòng quỹ đạo trôi tự do góc phải (trang trí rời rạc); nhãn "vật rắn" chồng F3 | renderer force-system |
| ch2-3-2 | hộp canvas "QUAN HỆ TRUYỀN ĐỘNG" trông rỗng (domMath overlay lệch panel `ch2-rotation-gear-renderers.js:65-68`); 2 readout omega (omega2=1, ω=1.5) gây rối | renderer + scene readouts |
| ch3-2-2 | hộp "v(T)" chỉ có trục, rỗng khi chưa chạy → trông như placeholder | newton renderer (graph) |
| ch3-5-1 | x_C = 211 thiếu đơn vị | scene readout `:150` |
| ch1-3-3 | renderer vẽ cả Aₓ+A_y bất kể selector (Rx/Ry=31.4N đúng) | support renderer |

**Lưu ý ch2-3-2 box rỗng:** renderer active (`ch2-rotation-gear-renderers.js`) CÓ ghi domMath vào panel; nghi KaTeX overlay lệch toạ độ canvas↔DOM. **Cần kiểm runtime DOM** để chốt (chưa root-cause chắc 100% từ static PNG).

---

## Prioritized Recommendations

**P1 (sai số liệu hiển thị — học sinh đọc nhầm):**
1. NHÓM 2 ch2-2-2 ε shadow — fix derived/readout key.
2. NHÓM 3 ch1-1-8 "N N" — fix kind.
3. NHÓM 1 ch1-1-5 nhãn slider "|R|"→"|F| vào".

**P2 (vỡ công thức — mất nghĩa):**
4. NHÓM 4 ch3-5-1, ch3-6-3 — viết LaTeX đúng. Quét toàn bộ `formula:` prose.

**P3 (visual/layout — thẩm mỹ):**
5. NHÓM 5: bỏ chấm trang trí trôi (ch1-1-5), thêm đơn vị x_C (ch3-5-1), kiểm domMath overlay ch2-3-2, gợi ý autoplay/placeholder text cho graph rỗng (ch3-2-2).

**Cross-cutting:** NHÓM 2 & 3 & 4 là root-cause **dùng chung** → fix 1 chỗ + quét regex toàn repo, không vá lẻ từng route.

---

## Method Notes

- Capture script: `tools/capture-all-58-simulations-screenshots.js`, `SIM_BASE_URL=http://127.0.0.1:8023/` (port 8000 bị process khác chiếm, phục vụ thư mục sai → canvas không mount; phát hiện & chuyển 8023).
- Manifest `capture-manifest.json`: 52/52 ok, hasContent=true, errors=[].
- Cấu trúc sim: `js/sims/chX/*-scenes.js` (config) / `*-renderers.js` (vẽ) / `*-behaviors*.js` (physics) / `derived()` & readout pipeline ở `js/sim-professional-lab.js`.
- Files legacy KHÔNG load (bỏ qua khi fix): `ch2-particle-rotation-transmission-scenes.js`, `ch2-rotation-transmission-renderers.js` (đánh dấu "Legacy draft"). Active scene cho ch2-2-2/ch2-3-2 là `ch2-kinematics-scenes.js` + `ch2-rotation-gear-renderers.js`.

---

## Unresolved Questions

1. **ch2-3-2 box rỗng:** static PNG không phân biệt được "domMath overlay lệch" vs "math render async chưa kịp capture". Cần mở route trên trình duyệt + inspect DOM KaTeX node để chốt. (Các formula chip ở thanh dưới render OK ⇒ nghiêng về lệch toạ độ in-canvas, chưa chắc.)
2. **ch3-2-2 graph rỗng:** là defect hay "đợi bấm Chạy"? Cần xác nhận intended UX — có nên autoplay/đặt placeholder text không.
3. **Phạm vi fix:** user muốn tôi (a) chỉ báo cáo, hay (b) tiến hành sửa P1/P2 luôn? Nếu sửa: NHÓM 2 fix tầng framework (`derived`) hay tầng scene (đổi readout key) — ảnh hưởng khác nhau, cần chốt hướng (a) hay (b) ở NHÓM 2.
