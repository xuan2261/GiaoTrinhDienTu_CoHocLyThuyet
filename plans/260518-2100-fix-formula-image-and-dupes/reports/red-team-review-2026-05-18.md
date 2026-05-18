# Red-Team Review — Plan Fix Formula-as-Image (260518-2100)

**Ngày:** 2026-05-18
**Reviewer:** 3 hostile personas (mode --hard)
**Plan dir:** `plans/260518-2100-fix-formula-image-and-dupes/`

---

## Reviewer 1 — Senior Pipeline Engineer (Pessimist)

**Mindset:** Tôi đã chạy pipeline DOCX → HTML 5 năm. Bug pipeline sẽ ngầm regenerate những thứ vừa fix.

### F1.1 — DOCX vẫn còn 8 raster (CRITICAL)

Plan dùng Approach A: chỉ chỉnh HTML, KHÔNG đụng DOCX. Hệ luỵ:
- Khi user (hoặc CI) chạy lại `python tools/extract_docx.py --write`, pipeline regenerate `chapters/`, **8 raster images quay về**.
- Pipeline cũng `shutil.rmtree(chapter_dir)` ở line 374 → 8 PNG đã `git rm` BỊ TÁI XUẤT HIỆN.
- Audit `--strict-formula-image` (Phase 06) sẽ FAIL → CI block forever cho đến khi chạy lại `scripts/replace-eight-formula-images.py`.

**Mức độ:** CRITICAL. Phase 06 sẽ false-positive sau mỗi re-extract.

**Fix khuyến nghị:**
- **Option A:** Chỉnh DOCX (Approach B). Nhưng plan đã loại approach này.
- **Option B:** Thêm post-processor vào `tools/extract_docx.py`: sau khi sinh HTML, tự động chạy `replace-eight-formula-images.py` if `--auto-fix-known-issues` flag set. Mặc định ON.
- **Option C:** Document trong `docs/docx-sync-pipeline.md` rằng workflow re-extract LUÔN phải:
  ```
  extract_docx.py → bundle_pages.py → replace-eight-formula-images.py --apply → apply-alt-overrides.py --apply → bundle_pages.py
  ```
  Và CI gate enforce thứ tự này.

**Quyết định cần user:** chọn B (auto-fix trong pipeline) hay C (documented manual workflow).

### F1.2 — Phase 03 Front A và Front B race (HIGH)

Phase 03 nói "làm Front A trước, Front B test vào tmp dir". Nhưng:
- Nếu user chạy Front A xong, commit, rồi sau Phase 05 chạy `extract_docx.py` (vì bất kỳ lý do gì), Front B chưa fix root cause → 40 duplicate quay lại.
- Test `test_re_extract_does_not_regenerate_duplicates` chạy trong tmp dir nên khi pass cũng không guarantee state thật.

**Mức độ:** HIGH.

**Fix khuyến nghị:**
- Front B PHẢI làm trước Front A (đảo thứ tự).
- Sau Front B, Front A trở thành: "verify HTML hiện tại sạch sau khi pipeline fix" — nếu pipeline fix đúng, re-extract trên DOCX hiện tại sẽ tự sinh HTML không duplicate, có thể skip Front A.
- Hoặc: ràng buộc Phase 05 PHẢI dùng direct HTML patch, KHÔNG re-extract — đã update trong plan.

### F1.3 — `tools/equation_report.json` overwrite (MEDIUM)

`extract_docx.py:511-513` ghi `tools/equation_report.json` mỗi lần chạy. Phase 06 audit guard sẽ phụ thuộc file này (qua `equation_mapping.json`?). Cần verify dependency tree.

Plan không nói rõ Phase 06 đọc gì. Nếu Phase 06 đọc `equation_mapping.json` (immutable trong plan) → OK. Nếu đọc `equation_report.json` → lệch sau re-extract.

**Fix khuyến nghị:** Phase 06 chỉ đọc `equation_mapping.json` + scan HTML; KHÔNG đụng `equation_report.json`.

### F1.4 — Bundle order assumption (MEDIUM)

Plan giả định `bundle_pages.py` đọc `chapters/**/*.html` thẳng. Nếu bundle có cache hoặc đọc qua intermediate file → fix HTML không reflect vào `pages.js`.

**Action:** Verify `tools/bundle_pages.py` không có cache layer trước implement.

---

## Reviewer 2 — Release Engineer (Paranoid)

**Mindset:** Tôi quản lý 173 browser tests. Một change nhỏ làm flaky 1 test = block release 2 tuần.

### F2.1 — pytest dependency mới (HIGH)

Plan thêm pytest + lxml. Project hiện tại:
- `package.json` chỉ có `@playwright/test`.
- Không có `requirements*.txt`, `pyproject.toml`.
- Tests Python existing chạy raw script (`python tools/audit.py`).

Thêm pytest:
- Phải tạo `requirements-dev.txt`.
- User mới clone repo phải `pip install pytest lxml` thêm.
- CI workflow (nếu có) phải `pip install` step mới.
- README phải document.

**Mức độ:** HIGH (friction install).

**Fix khuyến nghị 1:** Dùng pytest từ `tools/skills/.venv/` đã có (CLAUDE.md có nói `%USERPROFILE%/.claude/skills/.venv/Scripts/python.exe`). Nhưng venv user có pytest không? Cần verify.

**Fix khuyến nghị 2:** Đổi sang **plain Python script asserts** như `scripts/audit-all-formula-as-image.py` đã có. Mỗi script chạy `python scripts/test-phase-XX.py`, exit 0 = pass. Không cần pytest, không cần lxml (regex đã đủ cho HTML statics). Giảm dependency.

**Quyết định cần user:** chọn pytest (idiomatic) hay plain script (zero-dep)?

### F2.2 — Browser smoke 9 file × 3 browsers (HIGH)

Phase 07 yêu cầu manual browser smoke trên Chrome + Firefox + Edge cho 9 file. Đây là 27 manual interactions — không scalable, dễ skip.

**Mức độ:** HIGH (testing gap).

**Fix khuyến nghị:** Convert manual smoke thành Playwright spec:
```javascript
// tests/visual/test_phase_07_smoke.spec.js
const TARGETS = ['chapters/ch1/muc-III-2.html', ...];
for (const url of TARGETS) {
  for (const browser of ['chromium', 'firefox', 'webkit']) {
    test(`${browser} - ${url}`, async ({ page }) => {
      await page.goto(`http://localhost:8000/${url}`);
      // assert no <img src="hinh-037.png"> etc
      // assert KaTeX rendered (presence of .katex-html element)
      // screenshot diff
    });
  }
}
```

### F2.3 — Tag git collide (LOW)

Plan tag `v-2026-05-18-formula-fix`. Nếu chạy phase 07 nhiều lần (do retry), tag collision.

**Fix:** `git tag -l v-2026-05-18-formula-fix` check trước; nếu tồn tại, tag-name suffix `-r1`, `-r2`.

### F2.4 — `npm run test:sim:release` chạy `validate_equation_mapping.py` (MEDIUM)

Lệnh release gate có:
```
python tools/validate_equation_mapping.py --input data/equation_mapping.json --strict --katex
```
Plan chưa verify rule `--strict --katex` này có pass sau Phase 02 không. Nếu Phase 02 thay 8 ảnh → 8 entry trong `equation_mapping.json` có thể trở thành "orphan" (mapping còn nhưng HTML không dùng), validator có flag không?

**Fix:** Verify `validate_equation_mapping.py` logic. Nếu có check "every mapping row có ít nhất 1 ref trong HTML" → orphan rows fail. Cần thêm step: sau Phase 02, mark 8 rows trong mapping là `obsolete=true` hoặc xoá hẳn.

### F2.5 — `--strict-images` flag (CRITICAL)

Lệnh `tools/audit.py --strict-images` được plan reference nhiều lần. Nhưng `npm run test:sim:release` lại chỉ chạy `python tools/audit.py` (không strict). Kiểm tra audit.py:

`python tools/audit.py` (no args) đã PASS hiện tại → strict gate trong Phase 06 thêm `--strict-formula-image` cần ON cả khi không có `--strict-images`. Hiện tại plan code:
```python
if args.strict_formula_image or args.strict_images:
    findings = strict_formula_image_check(...)
```
→ Default audit (no args) không chạy guard. CI release gate cũng không chạy guard. **Guard không bao giờ run trong release flow!**

**Mức độ:** CRITICAL.

**Fix:**
- Default `--strict-formula-image` = True (mặc định ON).
- Update `package.json` `test:sim:release` thêm `--strict-images --strict-formula-image`.
- Hoặc gộp guard vào default audit flow.

### F2.6 — Backup `.bak` race (LOW)

Plan dùng `.bak` cho rollback. Nếu chạy script 2 lần, lần 2 overwrite `.bak`. Mất rollback gốc.

**Fix:** Backup name có timestamp `.bak.YYYYMMDDHHMMSS`. Hoặc skip backup: dùng git directly (`git stash` trước apply).

---

## Reviewer 3 — Accessibility/UX Auditor

**Mindset:** Screen reader của tôi đọc 134 ảnh. "Hình minh hoạ chương 1" 134 lần là failure mode tệ nhất.

### F3.1 — Auto-caption parser fallback yếu (HIGH)

Phase 05 fallback chain:
1. Caption "Hình X.Y …" trong DOCX → parser
2. Keyword paragraph kế tiếp
3. Manual override

Vấn đề: bước 1 cần regex chính xác Word caption format, mà Word có nhiều format. Plan không enumerate.

**Mức độ:** HIGH.

**Fix:** Cung cấp regex pattern cụ thể trong Phase 05:
```python
CAPTION_RE = re.compile(
    r'^Hình\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$',  # Vietnamese
    re.IGNORECASE,
)
# Variants: "Hình 1.12 Liên kết dây", "Hình 1.12. Liên kết dây", "Hình 1.12 - Liên kết dây"
```

Chạy parser trên DOCX hiện tại → đếm số match. Nếu < 70%, plan cần manual review batch lớn. Cần biết con số trước khi commit.

**Action:** Phase 01 (baseline) bổ sung script `scripts/measure-caption-coverage.py` để có baseline trước Phase 05.

### F3.2 — Alt text "F vector" không đủ (MEDIUM)

Phase 02 thay `hinh-289` thành `\(\vec F\)`. Khi MathML/KaTeX render trong screen reader, screen reader đọc gì?
- KaTeX có `aria-hidden="true"` mặc định → screen reader bỏ qua ENTIRELY.
- MathML thực có `<math role="math">` → screen reader đọc theo MathML semantic.

→ **6 vị trí Phase 02 thay bằng KaTeX sẽ "câm" với screen reader.**

**Mức độ:** MEDIUM.

**Fix:** Cấu hình KaTeX render với `output: 'mathml'` thay vì `output: 'html'`. Hoặc dual rendering (`output: 'htmlAndMathml'`). Verify `index.html` có config:
```javascript
renderMathInElement(document.body, {
  output: 'htmlAndMathml',
  trust: false,
});
```

### F3.3 — Vietnamese diacritics trong screen reader (LOW)

Phase 05 alt text tiếng Việt. NVDA đọc tiếng Việt cần Vietnamese voice profile. Một số screen reader (VoiceOver) có thể đọc lệch.

**Mức độ:** LOW (out of scope).

**Action:** Document trong `code-standards.md` rằng alt text dùng tiếng Việt là chấp nhận; không tối ưu cho non-Vietnamese screen reader.

### F3.4 — `figcaption` không có (MEDIUM)

Plan focus alt text nhưng bỏ qua `<figcaption>`. Audit đã phát hiện 136/136 figure thiếu figcaption. Phase 05 chỉ fix alt → figcaption vẫn missing.

**Mức độ:** MEDIUM (accessibility gap).

**Fix:** Phase 05 expand scope: vừa update alt vừa add figcaption từ caption DOCX. HTML format:
```html
<figure>
  <img src="..." alt="Sơ đồ liên kết dây">
  <figcaption>Hình 1.12 — Liên kết dây mềm</figcaption>
</figure>
```
Thay vì `<div class="figure-container">` đang dùng.

**Quyết định cần user:** Có mở rộng Phase 05 để add figcaption không, hay defer?

---

## Tổng hợp Findings

| ID | Severity | Phase | Issue | Đề xuất |
|---|---|---|---|---|
| F1.1 | CRITICAL | 02, 06 | DOCX còn 8 raster, re-extract regen | Auto-fix post-processor hoặc enforced workflow |
| F1.2 | HIGH | 03 | Front A/B race khi re-extract | Đảo thứ tự: Front B trước |
| F1.3 | MEDIUM | 06 | Audit guard data source unclear | Phase 06 đọc equation_mapping.json only |
| F1.4 | MEDIUM | All | Bundle cache assumption | Verify bundle_pages.py no-cache |
| F2.1 | HIGH | 01 | pytest + lxml dependency mới | Plain script alternative |
| F2.2 | HIGH | 07 | Manual browser smoke không scalable | Playwright spec |
| F2.3 | LOW | 07 | Tag collision retry | Suffix timestamp |
| F2.4 | MEDIUM | 02 | validate_equation_mapping.py orphan rows | Mark obsolete |
| F2.5 | CRITICAL | 06, 07 | --strict-formula-image không tự ON | Default ON hoặc gộp release gate |
| F2.6 | LOW | 03 | .bak race | Timestamp suffix hoặc git stash |
| F3.1 | HIGH | 05 | Caption parser regex chưa enumerate | Đo coverage trước commit |
| F3.2 | MEDIUM | 02 | KaTeX câm screen reader | output: 'htmlAndMathml' |
| F3.3 | LOW | 05 | Vietnamese SR support | Documented |
| F3.4 | MEDIUM | 05 | figcaption thiếu | Mở rộng scope hoặc defer |

**Severity count:** 2 CRITICAL, 4 HIGH, 5 MEDIUM, 3 LOW.

---

## Action Items (cần resolve trước /ck:cook)

### Bắt buộc (CRITICAL/HIGH)

1. **F1.1:** Quyết định pipeline strategy cho 8 raster persistence
2. **F1.2:** Đảo Phase 03 Front B trước Front A
3. **F2.1:** Quyết định pytest vs plain script
4. **F2.2:** Convert manual browser smoke → Playwright spec
5. **F2.5:** `--strict-formula-image` default ON + add vào release gate
6. **F3.1:** Đo caption coverage trong DOCX trước Phase 05

### Tùy chọn (MEDIUM/LOW)

7. **F1.3:** Document data source rõ ràng trong Phase 06
8. **F1.4:** Verify bundle_pages.py
9. **F2.4:** Mark obsolete rows trong mapping (Phase 02)
10. **F2.6:** Backup convention timestamp
11. **F3.2:** Verify KaTeX output config
12. **F3.4:** Quyết định scope figcaption

---

## Open Questions

1. Pipeline strategy: F1.1 — auto-fix hay enforced workflow?
2. Test framework: F2.1 — pytest hay plain script?
3. Scope figcaption: F3.4 — mở rộng Phase 05 hay defer?
4. Phase 03 thứ tự: F1.2 — chấp nhận đảo Front B trước?
