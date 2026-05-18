# OCR Verification — 3 Tiny Glyph Images Pre-Phase-02

**Ngày:** 2026-05-18
**Phương pháp:** Read trực tiếp PNG bằng Claude vision (Read tool)
**Phạm vi:** 3 ảnh nhỏ trong `chapters/ch3/muc-VII-2.html` cần verify nội dung trước khi quyết định fix

---

## Kết quả

### `images/ch3/hinh-266.png` — 42×22 px, 407B, mode=RGB

**Nội dung:** $a_2 = a_1$

**Ngữ cảnh HTML:**
```html
<p>Bỏ qua khối lượng của ròng rọc, của dây và ma sát ở ròng rọc: T<sub>1</sub>= T<sub>2</sub></p>
<p>Dây không dãn: a<sub>2</sub>= a<sub>1</sub></p>
<div class="figure-container"><img src="images/ch3/hinh-266.png" ...></div>
<p>Từ 1 và 2: <span class="mathml-inline"><math>...</math></span></p>
```

**Quyết định:** **XOÁ ảnh khỏi HTML**. Text "$a_2 = a_1$" đã được render đúng ngay paragraph trước (`<p>Dây không dãn: a<sub>2</sub>= a<sub>1</sub></p>`). Ảnh là raster duplicate dư thừa từ DOCX gốc.

### `images/ch3/hinh-283.png` — 89×24 px, 765B, mode=RGB

**Nội dung:** $P_2 - T_2 = 0$

**Ngữ cảnh HTML:**
```html
<p>Chiếu lên trục Ox: <em>P</em><sub><em>2</em></sub> <em>- T</em><sub><em>2</em></sub><em>=0</em> (5)</p>
<div class="figure-container"><img src="images/ch3/hinh-283.png" ...></div>
<p>Bỏ qua khối lượng của ròng rọc, của dây và ma sát ở ròng rọc: ...</p>
```

**Quyết định:** **XOÁ ảnh khỏi HTML**. Text "P₂ - T₂ = 0 (5)" đã có ngay paragraph trước. Ảnh raster duplicate.

### `images/ch3/hinh-289.png` — 416×544 px, 1277B, mode=1

**Nội dung:** $\vec F$ (chữ F italic với mũi tên trên đầu)

**Ngữ cảnh HTML:**
```html
<p><strong>Bài 2: </strong>Một rơ moóc chở hàng chuyển động trên đường ngang dưới tác dụng của lực</p>
<div class="figure-container"><img src="images/ch3/hinh-289.png" ...></div>
<p>nằm ngang, có giá trị không đổi. ...</p>
```

**Quyết định:** **REPLACE ảnh bằng `<span class="math-tex">\(\vec F\)</span>`**. Ảnh là vector lực $\vec F$, ngữ pháp đoạn văn là "dưới tác dụng của lực $\vec F$ nằm ngang", tức ảnh nằm giữa câu để chỉ tên vector lực.

Sau replace, ngữ pháp:
```html
<p><strong>Bài 2: </strong>Một rơ moóc chở hàng chuyển động trên đường ngang dưới tác dụng của lực <span class="math-tex">\(\vec F\)</span> nằm ngang, có giá trị không đổi. ...</p>
```
(Gộp lại 1 paragraph, không còn paragraph break vì image đã hết.)

---

## Update mapping cho Phase 02

| Ảnh | Hành động cũ trong plan | Hành động mới (sau OCR) |
|---|---|---|
| `hinh-037` | Replace `\vec T` | Giữ nguyên: Replace `\vec T` |
| `hinh-039` | Replace `\vec R` | Giữ nguyên: Replace `\vec R` |
| `hinh-136` | Replace `\vec v` | Giữ nguyên: Replace `\vec v` |
| `hinh-240` (×2) | Replace `\vec P_2` / `\vec P_1` | Giữ nguyên |
| `hinh-241` | Replace `\vec N` | Giữ nguyên |
| `hinh-266` | Replace với LaTeX TBD | **XOÁ** (duplicate text) |
| `hinh-283` | Replace `T_1=T_2` (guess) | **XOÁ** (duplicate text "P₂-T₂=0") |
| `hinh-289` | Replace `\vec F` | Giữ nguyên: Replace `\vec F` |

→ Tổng 8 ảnh: 6 replace + 2 xoá hoàn toàn.

---

## Note kỹ thuật

- **hinh-266 và hinh-283** kích thước thực ~42×22 và ~89×24 pixel, mode RGB → **rất khả năng là DOCX user copy-paste rendered equation từ Word equation editor sang dạng image** (Word đôi khi render equation thành PNG inline khi paste cross-document). Đây là pattern khác với 6 ảnh còn lại (1-bit raster scan từ MathType cũ).
- Đây cũng giải thích vì sao 2 ảnh này có pixel rất nhỏ (~80×24) và xuất hiện ngay sau khi text đã viết equation tương ứng — DOCX user gõ equation rồi vô tình paste lại 1 ảnh y hệt.

---

## Câu hỏi đã giải quyết

- Ảnh hinh-266/283 có công thức gì? → Đã OCR
- Có cần thay bằng KaTeX hay xoá? → Xoá vì duplicate
- hinh-289 là gì? → $\vec F$
