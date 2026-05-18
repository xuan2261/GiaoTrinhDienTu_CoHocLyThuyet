---
phase: 1
title: "Baseline & TDD Test Infrastructure (Plain Python)"
status: completed
priority: P1
effort: "3-4h"
dependencies: []
---

# Phase 01: Baseline & TDD Test Infrastructure (Plain Python)

## Overview

Thiết lập bộ test "executable spec" plain Python (không pytest, không lxml) làm nền cho 6 phase còn lại. Test chạy red trước khi implement, pass green sau khi fix. Đồng thời đo caption coverage trong DOCX (red-team F3.1) và verify bundle pipeline không có cache (F1.4).

## Validation Decisions (red-team 2026-05-18)

- **F2.1**: Đổi pytest + lxml → plain Python script asserts. Mỗi test = 1 file `scripts/test-phase-XX.py`, exit 0 = PASS, exit 1 = FAIL. HTML parse bằng regex (đã đủ cho invariant tests). Zero new dependency.
- **F3.1**: Phase 01 thêm `scripts/measure-caption-coverage.py` để đo trước Phase 05. Nếu coverage < 70%, mở rộng regex hoặc tăng manual override budget.
- **F1.4**: Verify `tools/bundle_pages.py` không có cache layer trước khi tin tưởng output.

## Requirements

### Functional
- 7 test scripts trong `scripts/test-phase-XX-*.py` chạy được trên Python 3.11 (đã có ở venv user).
- Mỗi script:
  - Read `chapters/**/*.html` + `data/equation_mapping.json` (không mock).
  - Print pass/fail + count summary.
  - Exit 0 = pass, exit 1 = fail.
- Common helpers tách vào `scripts/_test_helpers.py` (load_html, iter_imgs, project_root).
- `npm run test:equations` alias chạy tất cả 7 script tuần tự.
- `scripts/measure-caption-coverage.py` đếm match `Hình X.Y` trong DOCX → output coverage %.
- Document `tools/bundle_pages.py` không có cache (verify by reading code).

### Non-functional
- Tất cả test chạy < 5s tổng cộng (loại trừ phase 7 release gate).
- Không phụ thuộc network (offline).
- Không phụ thuộc browser.
- Không phụ thuộc dev dependency mới (zero `requirements-dev.txt`).

## Architecture

```
scripts/
├── _test_helpers.py                       (mới — common helpers)
│     ├── project_root() → Path
│     ├── load_mapping() → dict[hash, row]
│     ├── chapter_files() → list[Path]
│     ├── iter_imgs(html) → Iterator[ImgInfo]
│     ├── parse_img(tag) → ImgInfo(src, alt, in_figure_container_or_figure)
│     └── assert_or_exit(cond, msg)        # plain assert wrapper
├── test-phase-01-baseline.py              (mới — 4 baseline checks)
├── test-phase-02-critical-images.py       (mới — stub, fail trước fix)
├── test-phase-03-no-duplicates.py         (mới — stub)
├── test-phase-03-pipeline-no-regen.py     (mới — stub, slow)
├── test-phase-04-render-font.py           (mới — stub)
├── test-phase-05-alt-text.py              (mới — stub)
├── test-phase-06-audit-guard.py           (mới — stub)
├── test-phase-07-release.py               (mới — stub)
├── measure-caption-coverage.py            (mới — F3.1)
└── verify-bundle-no-cache.py              (mới — F1.4 verify, runs once)

tests/
├── visual/                                (mới folder cho Playwright specs ở Phase 04, 07)
└── (no equations/ folder — không dùng pytest)
```

`scripts/_test_helpers.py` parse HTML bằng regex thay vì lxml (đã đủ cho invariant tests, KISS).

## Related Code Files

- Create:
  - `scripts/_test_helpers.py`
  - `scripts/test-phase-01-baseline.py`
  - 6 stub script `scripts/test-phase-02..07-*.py` (skeleton, sẽ fill ở phase tương ứng)
  - `scripts/baseline-snapshot.json` (golden file)
  - `scripts/measure-caption-coverage.py`
  - `scripts/verify-bundle-no-cache.py`
- Modify:
  - `package.json` — thêm `"test:equations": "node scripts/run-all-equation-tests.cjs"` hoặc dùng PowerShell script chạy tuần tự
- Delete: none

## Implementation Steps

### TDD Step 1 — Helpers + baseline test

1. Tạo `scripts/_test_helpers.py`:
   ```python
   """Plain Python test helpers (no pytest, no lxml)."""
   import json, re, sys
   from pathlib import Path
   from collections import namedtuple

   ROOT = Path(__file__).resolve().parent.parent
   ImgInfo = namedtuple('ImgInfo', 'src alt in_figure container_tag')

   IMG_RE = re.compile(
       r'(<(div class="figure-container"|figure[^>]*)>)?\s*'
       r'<img\s+([^>]+)>\s*(</\2>)?',
       re.IGNORECASE,
   )
   ATTR_RE = re.compile(r'(\w+)="([^"]*)"')

   def project_root(): return ROOT

   def load_mapping():
       return json.loads((ROOT / 'data/equation_mapping.json').read_text(encoding='utf-8'))

   def chapter_files():
       return sorted((ROOT / 'chapters').rglob('*.html'))

   def iter_imgs(html):
       for m in re.finditer(r'<img\s+[^>]+>', html):
           tag = m.group(0)
           attrs = dict(ATTR_RE.findall(tag))
           pre = html[max(0, m.start() - 50):m.start()]
           in_figure = 'figure-container' in pre or '<figure' in pre
           yield ImgInfo(
               src=attrs.get('src', ''),
               alt=attrs.get('alt', ''),
               in_figure=in_figure,
               container_tag='figure' if '<figure' in pre else 'div',
           )

   def assert_or_exit(cond, msg):
       if not cond:
           print(f'FAIL: {msg}')
           sys.exit(1)
   ```

2. Viết `scripts/test-phase-01-baseline.py`:
   ```python
   """Phase 01 baseline assertions (plain Python, no pytest)."""
   import sys, re
   from _test_helpers import project_root, chapter_files, iter_imgs, assert_or_exit

   def main():
       files = chapter_files()
       assert_or_exit(len(files) == 102, f'Expected 102 HTML files, got {len(files)}')

       total_imgs = sum(1 for f in files for _ in iter_imgs(f.read_text(encoding='utf-8')))
       assert_or_exit(total_imgs == 136, f'Expected 136 imgs, got {total_imgs}')

       # 8 critical refs present (baseline before fix)
       CRITICAL = [
           ('ch1/muc-III-2.html', 'images/ch1/hinh-037.png'),
           ('ch1/muc-III-3.html', 'images/ch1/hinh-039.png'),
           ('ch3/muc-V-4.html', 'images/ch3/hinh-136.png'),
           ('ch3/muc-VII-1.html', 'images/ch3/hinh-240.png'),
           ('ch3/muc-VII-1.html', 'images/ch3/hinh-241.png'),
           ('ch3/muc-VII-2.html', 'images/ch3/hinh-266.png'),
           ('ch3/muc-VII-2.html', 'images/ch3/hinh-283.png'),
           ('ch3/muc-VII-2.html', 'images/ch3/hinh-289.png'),
       ]
       for rel, src in CRITICAL:
           html = (project_root() / 'chapters' / rel).read_text(encoding='utf-8')
           assert_or_exit(src in html, f'{rel} missing baseline ref {src}')

       print(f'PASS: 102 files, 136 imgs, 8 critical refs present (baseline)')
       sys.exit(0)

   if __name__ == '__main__':
       sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
       main()
   ```

### TDD Step 2 — Baseline snapshot

3. Sinh `scripts/baseline-snapshot.json`:
   ```json
   {
     "created_at": "2026-05-18",
     "total_files": 102,
     "total_imgs": 136,
     "critical_formula_image_count": 8,
     "duplicate_pair_count": 40,
     "generic_alt_count": 134
   }
   ```

### TDD Step 3 — Stub các phase test

4. Stub `scripts/test-phase-02-critical-images.py` ... `scripts/test-phase-07-release.py` với pattern:
   ```python
   """Phase NN: <description>."""
   import sys
   def main():
       print('SKIP: Phase NN chưa fix; sẽ implement sau.')
       sys.exit(0)
   if __name__ == '__main__':
       main()
   ```
   Khi phase tương ứng implement, fill assertions thực.

### TDD Step 4 — Caption coverage measurement (F3.1)

5. Viết `scripts/measure-caption-coverage.py`:
   ```python
   """Measure DOCX caption coverage for figure alt-text generation."""
   import re, sys, zipfile
   from pathlib import Path
   from xml.etree import ElementTree as ET

   ROOT = Path(__file__).resolve().parent.parent
   DOCX = ROOT / 'CoHocLyThuyet_Full_New.docx'
   NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

   CAPTION_VARIANTS = [
       re.compile(r'^Hình\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE),
       re.compile(r'^Hinh\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE),
       re.compile(r'^Figure\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE),
   ]

   def main():
       with zipfile.ZipFile(DOCX) as z:
           xml = z.read('word/document.xml').decode('utf-8')
       doc = ET.fromstring(xml)
       paragraphs = []
       for p in doc.iter(f'{{{NS["w"]}}}p'):
           runs = p.iter(f'{{{NS["w"]}}}t')
           text = ''.join(r.text or '' for r in runs).strip()
           paragraphs.append(text)

       # Find image-bearing paragraphs (containing w:drawing)
       img_indices = []
       for i, p in enumerate(doc.iter(f'{{{NS["w"]}}}p')):
           if any(p.iter(f'{{{NS["w"]}}}drawing')):
               img_indices.append(i)

       matched = 0
       failures = []
       for idx in img_indices:
           # Try paragraph after image
           for offset in (1, 2):
               if idx + offset < len(paragraphs):
                   t = paragraphs[idx + offset]
                   if any(p.match(t) for p in CAPTION_VARIANTS):
                       matched += 1
                       break
           else:
               failures.append((idx, paragraphs[idx + 1] if idx + 1 < len(paragraphs) else ''))

       coverage = matched / len(img_indices) if img_indices else 0
       print(f'Total images: {len(img_indices)}')
       print(f'Caption matched: {matched} ({coverage:.1%})')
       print(f'Threshold: 70%')

       if coverage < 0.7:
           print(f'WARN: coverage < 70%. Sample failures (5):')
           for idx, t in failures[:5]:
               print(f'  para[{idx}+1]: {t[:80]!r}')
           print(f'\nAction: extend regex variants in scripts/parse-docx-figure-captions.py BEFORE Phase 05')
           sys.exit(1)
       print('OK: coverage adequate, proceed to Phase 05')
       sys.exit(0)

   if __name__ == '__main__':
       main()
   ```

### TDD Step 5 — Bundle no-cache verify (F1.4)

6. Viết `scripts/verify-bundle-no-cache.py`:
   ```python
   """Verify tools/bundle_pages.py reads chapters/ directly without cache."""
   import re, sys
   from pathlib import Path

   ROOT = Path(__file__).resolve().parent.parent
   BUNDLE = ROOT / 'tools' / 'bundle_pages.py'

   def main():
       src = BUNDLE.read_text(encoding='utf-8')
       # Red flags for cache layer
       red_flags = [
           (r'\.cache', 'cache attribute found'),
           (r'pickle\.', 'pickle import'),
           (r'sqlite3\.', 'sqlite cache'),
           (r'@functools\.lru_cache', 'lru_cache decorator'),
           (r'CACHE_DIR', 'cache dir constant'),
       ]
       found = [(p, msg) for p, msg in red_flags if re.search(p, src)]
       if found:
           print(f'WARN: bundle_pages.py may have cache layer:')
           for p, msg in found:
               print(f'  - {msg}')
           sys.exit(1)
       print('OK: bundle_pages.py reads source directly, no cache layer')
       sys.exit(0)

   if __name__ == '__main__':
       main()
   ```

### TDD Step 6 — npm script

7. Update `package.json`:
   ```json
   "test:equations": "powershell -NoProfile -Command \"$ErrorActionPreference='Stop'; foreach ($s in (Get-ChildItem scripts/test-phase-*.py | Sort-Object Name)) { Write-Host \\\"=== $($s.Name) ===\\\"; python $s.FullName; if ($LASTEXITCODE -ne 0) { exit 1 } }\""
   ```

### TDD Step 7 — Verify Phase 01

```powershell
python scripts/test-phase-01-baseline.py             # PASS (baseline state)
python scripts/measure-caption-coverage.py           # PASS hoặc actionable WARN
python scripts/verify-bundle-no-cache.py             # PASS expected
npm run test:equations                                # 7 scripts run, 1 PASS + 6 SKIP
```

## Todo List

- [ ] Tạo `scripts/_test_helpers.py`
- [ ] Viết `scripts/test-phase-01-baseline.py` (4 assertions)
- [ ] Sinh `scripts/baseline-snapshot.json` từ kết quả audit hiện tại
- [ ] Stub 6 file test phase 02-07
- [ ] Viết `scripts/measure-caption-coverage.py` — verify ≥ 70% (F3.1)
- [ ] Nếu < 70%, mở rộng regex variants documented
- [ ] Viết `scripts/verify-bundle-no-cache.py` — confirm no cache (F1.4)
- [ ] Update `package.json` script `test:equations`
- [ ] Verify chạy được local: `python scripts/test-phase-01-baseline.py`
- [ ] Document trong `docs/code-standards.md` cách chạy test
- [ ] Tạo folder `tests/visual/` (sẽ dùng Phase 04 + 07)

## Success Criteria

- [ ] `python scripts/test-phase-01-baseline.py` PASS với 4 assertions
- [ ] `python scripts/measure-caption-coverage.py` PASS hoặc output coverage để dùng cho Phase 05
- [ ] `python scripts/verify-bundle-no-cache.py` PASS
- [ ] `npm run test:equations` chạy được, exit 0
- [ ] `scripts/baseline-snapshot.json` tồn tại, được commit
- [ ] 6 stub test phase tiếp theo hiện diện
- [ ] `scripts/_test_helpers.py` < 80 dòng (KISS)
- [ ] Zero new Python dependency (no `requirements-dev.txt`)

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Regex parse HTML bỏ sót edge case (nested div) | Test trên file phức tạp nhất `ch2/muc-I-1.html`; nếu false-positive, switch helper `iter_imgs` sang stdlib `html.parser` |
| Caption coverage measurement < 70% | Output actionable failures (paragraph texts), expand regex trong `parse-docx-figure-captions.py` Phase 05 |
| Plain Python asserts khó debug khi fail | Print verbose context (file path, expected vs actual) trong mỗi `assert_or_exit` |
| Test trên Windows path encoding | Force `encoding='utf-8'` mọi `read_text()` |
| `bundle_pages.py` có cache nhưng heuristic miss | Manual code review pass 1 lần ngoài auto-check |

## Security Considerations

- Test đọc-only, không ghi vào filesystem ngoài `scripts/baseline-snapshot.json`.
- Không exec arbitrary code từ HTML.
- DOCX zip extraction đã được Python `zipfile` validate.
