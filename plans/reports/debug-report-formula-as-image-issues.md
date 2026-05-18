# Báo Cáo Debug: Vấn Đề Công Thức/Symbol Bị Chèn Dạng Image

**Ngày:** 2026-05-17
**Phạm vi:** Toàn bộ giáo trình điện tử Cơ Học Lý Thuyết (3 chương, 104 file HTML)

---

## 1. Tổng Quan Tình Trạng

| Chỉ số | Giá trị |
|--------|---------|
| Tổng phương trình trong equation_mapping.json | 702 |
| Có MathML (render native browser) | 645 (91.9%) |
| Có LaTeX (render KaTeX) | 53 (7.5%) |
| Artifact (hình/blank) | 4 (0.6%) |
| Tổng ảnh trong HTML files | 135 |
| Ảnh là diagram hợp lệ | 124 |
| **Ảnh là công thức bị chèn sai** | **11** |
| File HTML dùng cả MathML + KaTeX | 14 files |
| Block toán bị duplicate | 8 instances |
| Alt text generic (không mô tả) | 134 images |

---

## 2. Vấn Đề CRITICAL: Công Thức Dạng Image

### 2.1 Chương 1 - Tĩnh học (3 issues)

| # | File | Ảnh | Kích thước | Vấn đề |
|---|------|------|-----------|--------|
| 1 | muc-III-2.html | hinh-037.png | 1,135B | Ảnh rất nhỏ, có thể là ký hiệu/công thức inline |
| 2 | muc-III-3.html | hinh-039.png | 1,478B | Ảnh rất nhỏ, có thể là ký hiệu/công thức inline |
| 3 | muc-IV-3.html | hinh-078.png | 11KB | Trong equation_mapping, kind=math-display, không có LaTeX |

### 2.2 Chương 2 - Động học (1 issue)

| # | File | Ảnh | Kích thước | Vấn đề |
|---|------|------|-----------|--------|
| 4 | muc-V-3.html | hinh-211.png | 82KB | Trong equation_mapping, kind=math-display, không có LaTeX (Sơ đồ gia tốc pháp tuyến) |

### 2.3 Chương 3 - Động lực học (7 issues)

| # | File | Ảnh | Kích thước | Vấn đề |
|---|------|------|-----------|--------|
| 5 | muc-V-4.html | hinh-136.png | 1,135B | Ảnh rất nhỏ, inline vector v trong danh sách |
| 6 | muc-VII-1.html | hinh-240.png | 1,333B | Ảnh nhỏ, công thức trong bài tập |
| 7 | muc-VII-1.html | hinh-241.png | 1,642B | Ảnh nhỏ, công thức trong bài tập |
| 8 | muc-VII-2.html | hinh-266.png | 407B | Ảnh cực nhỏ, chắc chắn là công thức |
| 9 | muc-VII-2.html | hinh-283.png | 765B | Ảnh rất nhỏ, chắc chắn là công thức |
| 10 | muc-VII-2.html | hinh-289.png | 1,277B | Ảnh nhỏ, công thức trong bài tập |

---

## 3. Vấn Đề HIGH: Duplicate Math Rendering

Có 8 instances trong 7 file HTML where cùng một phương trình được render CẢ hai lần (MathML + KaTeX):

| File | Số duplicate |
|------|-------------|
| ch1/muc-I-1.html | 1 |
| ch1/muc-IV-3.html | 1 |
| ch1/muc-IV-5.html | 2 |
| ch2/muc-II-2.html | 3 |
| ch2/muc-V-3.html | 1 |
| ch3/muc-VI-3.html | 1 |

**Hậu quả:** Phương trình hiển thị 2 lần, gây confusion cho người đọc.

---

## 4. Vấn Đề MEDIUM: Mixed Rendering Approach

14 file HTML sử dụng CẢ MathML lẫn KaTeX trong cùng 1 file:

- ch1: muc-I-4.html, muc-III-3.html, muc-IV-3.html, muc-IV-5.html
- ch2: muc-I-1.html, muc-II-2.html, muc-V-3.html
- ch3: muc-V-4.html, muc-VI-3.html, muc-VII-1.html, muc-VII-2.html

**Rủi ro:** Font-size, spacing, baseline alignment khác nhau giữa MathML và KaTeX gây mất thẩm mỹ.

---

## 5. Vấn Đề LOW: Generic Alt Text

134/135 ảnh sử dụng alt text generic "Hình minh họa chương X" thay vì mô tả nội dung thực tế.

**Tác động:** Accessibility kém, screen reader không thể mô tả nội dung hình.

---

## 6. Nguyên Nhân Gốc (Root Cause)

### 6.1 Pipeline xử lý DOCX

Pipeline `extract_docx.py` xử lý phương trình theo flow:

```
DOCX MathType OLE → auto_review_equation_mapping.py → MathML (preferred)
                                                   → LaTeX (fallback, 53 entries)
                                                   → Image (last resort)
```

**Vấn đề:** `auto_review_equation_mapping.py` (line 274) xóa trắng field `latex` khi tìm thấy MathML:

```python
updated["latex"] = ""        # LaTeX bị xóa
updated["mathml"] = mathml   # Chỉ giữ MathML
```

### 6.2 Tại sao có ảnh công thức trong HTML

Mặc dù 645/702 phương trình đã convert sang MathML, vẫn còn 11 ảnh công thức trong HTML vì:

1. **extract_docx.py** tạo HTML fragment với MathML inline/block cho phần lớn công thức
2. Nhưng một số công thức (đặc biệt trong bài tập/exercise) vẫn giữ dạng `<img>` tag
3. Có thể do: DOCX gốc dùng hình ảnh (WMF/EMF) thay vì MathType OLE cho một số công thức

### 6.3 pix2tex OCR quality

`data/equation_mapping.ocr.json` có 563 entries với LaTeX từ pix2tex, nhưng chất lượng kém:
- Vector arrows (`\vec{}`) bị nhận sai
- Multi-character identifiers bị tách
- Greek letters đôi khi sai

Pipeline quyết định đúng khi ưu tiên MathML over OCR LaTeX.

---

## 7. Khuyến Nghị Fix

### Ưu tiên 1: Fix 11 ảnh công thức (CRITICAL)

**Approach A - Convert sang KaTeX (Recommended):**
- Viết script đọc 11 ảnh công thức, dùng Vision LLM (Gemini/GPT-4o) để OCR → LaTeX
- Thay `<div class="figure-container"><img ...></div>` bằng `<span class="math-tex">\(LaTeX\)</span>`
- Verify rendering trong browser

**Approach B - Convert sang MathML:**
- Dùng MathType OLE trực tiếp từ DOCX cho 11 ảnh này
- Thêm MathML vào equation_mapping.json

### Ưu tiên 2: Fix duplicate math blocks (HIGH)

- Xóa block KaTeX duplicate, chỉ giữ MathML
- Hoặc ngược lại, tùy approach chính

### Ưu tiên 3: Standardize rendering approach (MEDIUM)

- Chọn 1 trong 2:
  - **Option A:** Toàn bộ MathML (native browser) - giữ nguyên 645 entries
  - **Option B:** Toàn bộ KaTeX - cần convert 645 MathML → LaTeX (effort lớn)
- Khuyến nghị: Option A (MathML) vì đã hoạt động tốt trên browser modern

### Ưu tiên 4: Update alt text (LOW)

- Thay alt text generic bằng mô tả nội dung thực tế
- Ví dụ: "Sơ đồ hệ lực phân bố trên dầm" thay vì "Hình minh họa chương 1"

---

## 8. Thống Kê Theo Chương

| Chương | Tổng ảnh HTML | Ảnh hợp lệ | Ảnh công thức sai | Duplicate | Mixed rendering |
|--------|--------------|------------|-------------------|-----------|-----------------|
| Ch1 - Tĩnh học | 48 | 45 | 3 | 4 | 4 files |
| Ch2 - Động học | 47 | 46 | 1 | 4 | 3 files |
| Ch3 - Động lực học | 40 | 33 | 7 | 1 | 4 files |
| **Tổng** | **135** | **124** | **11** | **9** | **11 files** |

---

## 9. Files Cần Sửa

### Cần fix ảnh công thức:
1. `chapters/ch1/muc-III-2.html` - hinh-037.png
2. `chapters/ch1/muc-III-3.html` - hinh-039.png
3. `chapters/ch1/muc-IV-3.html` - hinh-078.png
4. `chapters/ch2/muc-V-3.html` - hinh-211.png
5. `chapters/ch3/muc-V-4.html` - hinh-136.png
6. `chapters/ch3/muc-VII-1.html` - hinh-240.png, hinh-241.png
7. `chapters/ch3/muc-VII-2.html` - hinh-266.png, hinh-283.png, hinh-289.png

### Cần fix duplicate math:
1. `chapters/ch1/muc-I-1.html`
2. `chapters/ch1/muc-IV-3.html`
3. `chapters/ch1/muc-IV-5.html`
4. `chapters/ch2/muc-II-2.html`
5. `chapters/ch2/muc-V-3.html`
6. `chapters/ch3/muc-VI-3.html`

---

## 10. Câu Hỏi Chưa Giải Quyết

1. 11 ảnh công thức kia có cần convert sang MathML/KaTeX không, hay giữ nguyên là ảnh?
2. Nếu convert, nên dùng KaTeX hay MathML?
3. 647 ảnh orphan (có trong equation_mapping nhưng không dùng trong HTML) có nên xóa để giảm size repo?
4. Có cần update alt text cho tất cả 134 ảnh không?
