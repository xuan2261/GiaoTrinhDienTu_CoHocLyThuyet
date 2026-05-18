---
phase: 2
title: "Fix 8 Critical Formula-as-Image (Hybrid A + Pipeline-Aware)"
status: completed
priority: P1
effort: "3-4h"
dependencies: [1]
---

# Phase 02: Fix 8 Critical Formula-as-Image (Hybrid A)

## Overview

Khử 8 ảnh raster trong HTML bằng **Approach A** (chỉnh HTML trực tiếp). OCR đã verify trước (xem `reports/ocr-tiny-glyph-verification-2026-05-18.md`): 6 ảnh thay bằng KaTeX, **2 ảnh xoá hoàn toàn** (duplicate text). Đồng thời **integrate auto-fix post-processor** vào `tools/extract_docx.py` để re-extract idempotent (red-team F1.1). Phase 03 đảm nhiệm fix root cause duplicate trong pipeline.

## Validation Decisions

- **Approach:** Hybrid A (HTML edit) — không phụ thuộc Ruby gem.
- **OCR:** done. Kết quả lưu trong `reports/ocr-tiny-glyph-verification-2026-05-18.md`.
- **2 ảnh đặc biệt:** `hinh-266` và `hinh-283` là **duplicate raster của text đã render đúng paragraph trước** → xoá hoàn toàn, không thay equation mới.
- **Red-team F1.1:** `tools/extract_docx.py` thêm flag `--auto-fix-known-issues` (default ON). Sau khi sinh HTML, pipeline tự gọi `replace-eight-formula-images.py --apply`. Re-extract idempotent, CI không false-positive.
- **Red-team F2.4:** sau replace, mark 8 rows trong `equation_mapping.json` là `obsolete=true` (giữ row để audit trail, không xoá).
- **Red-team F2.6:** backup naming `*.bak.{YYYYMMDDHHMMSS}` để tránh race khi chạy script nhiều lần.

## Requirements

### Functional

| Ảnh | Hành động | LaTeX/Action |
|---|---|---|
| `images/ch1/hinh-037.png` | Replace | `\vec T` |
| `images/ch1/hinh-039.png` | Replace | `\vec R` |
| `images/ch3/hinh-136.png` | Replace | `\vec v` |
| `images/ch3/hinh-240.png` (vị trí 1) | Replace | `\vec P_2` |
| `images/ch3/hinh-240.png` (vị trí 2) | Replace | `\vec P_1` |
| `images/ch3/hinh-241.png` | Replace | `\vec N` |
| `images/ch3/hinh-266.png` | **Delete tag** | (text đã có) |
| `images/ch3/hinh-283.png` | **Delete tag** | (text đã có) |
| `images/ch3/hinh-289.png` | Replace | `\vec F` |

- Tag delete = xoá `<div class="figure-container"><img...></div>`, không thay gì.
- Replace = `<div class="figure-container"><img...></div>` → `<span class="math-tex">\(LATEX\)</span>` (giữ inline-flow paragraph).
- Đảm bảo paragraph trước/sau gộp lại nếu image làm vỡ paragraph.

### Non-functional
- 8 PNG files xoá khỏi `images/` (sau khi verify không còn reference).
- `js/pages.js` regenerate sạch.
- `audit.py --strict-images` PASS.
- Browser smoke `file://` PASS.

## Architecture

### Decision tree per image

```
For each (file, src) in CRITICAL_8:
  ├── If src == 'hinh-266.png' or src == 'hinh-283.png':
  │     → DELETE: replace '<div class="figure-container"><img src="{src}" ...></div>'
  │              with ''  (empty string, paragraphs merge naturally)
  │
  └── Else:
        → REPLACE: replace '<div class="figure-container"><img src="{src}" ...></div>'
                   with '<span class="math-tex">\\({LATEX}\\)</span>'
        → Verify paragraph before/after still coherent
```

### Sample diff cho hinh-289 (cần merge paragraph)

```diff
- <p><strong>Bài 2: </strong>Một rơ moóc chở hàng chuyển động trên đường ngang dưới tác dụng của lực</p>
- <div class="figure-container"><img src="images/ch3/hinh-289.png" alt="Hình minh họa chương 3" loading="lazy"></div>
- <p>nằm ngang, có giá trị không đổi. Thùng xe ...</p>
+ <p><strong>Bài 2: </strong>Một rơ moóc chở hàng chuyển động trên đường ngang dưới tác dụng của lực <span class="math-tex">\(\vec F\)</span> nằm ngang, có giá trị không đổi. Thùng xe ...</p>
```

### Sample diff cho hinh-266 (chỉ xoá)

```diff
  <p>Dây không dãn: a<sub>2</sub>= a<sub>1</sub></p>
- <div class="figure-container"><img src="images/ch3/hinh-266.png" alt="Hình minh họa chương 3" loading="lazy"></div>
  <p>Từ 1 và 2: <span class="mathml-inline"><math>...</math></span></p>
```

## Related Code Files

- Modify:
  - `chapters/ch1/muc-III-2.html`
  - `chapters/ch1/muc-III-3.html`
  - `chapters/ch3/muc-V-4.html`
  - `chapters/ch3/muc-VII-1.html`
  - `chapters/ch3/muc-VII-2.html`
  - `js/pages.js` (qua bundle)
  - `tools/extract_docx.py` (thêm `--auto-fix-known-issues` post-processor — F1.1)
  - `data/equation_mapping.json` (mark 8 row `obsolete=true` — F2.4)
- Create:
  - `scripts/test-phase-02-critical-images.py` (plain Python, không pytest)
  - `scripts/replace-eight-formula-images.py`
  - `reports/phase-02-completion-report.md`
- Delete (sau verify):
  - `images/ch1/hinh-037.png`
  - `images/ch1/hinh-039.png`
  - `images/ch3/hinh-136.png`
  - `images/ch3/hinh-240.png`
  - `images/ch3/hinh-241.png`
  - `images/ch3/hinh-266.png`
  - `images/ch3/hinh-283.png`
  - `images/ch3/hinh-289.png`

## Implementation Steps

### TDD Step 1 — RED test trước (plain Python)

```python
# scripts/test-phase-02-critical-images.py
"""Phase 02 assertions: 8 critical formula-as-image fixed."""
import re, sys
from _test_helpers import project_root, assert_or_exit

DELETE_LIST = ['images/ch3/hinh-266.png', 'images/ch3/hinh-283.png']
REPLACE_LIST = [
    ('chapters/ch1/muc-III-2.html', 'images/ch1/hinh-037.png', r'\\vec T'),
    ('chapters/ch1/muc-III-3.html', 'images/ch1/hinh-039.png', r'\\vec R'),
    ('chapters/ch3/muc-V-4.html',   'images/ch3/hinh-136.png', r'\\vec v'),
    ('chapters/ch3/muc-VII-1.html', 'images/ch3/hinh-241.png', r'\\vec N'),
    ('chapters/ch3/muc-VII-2.html', 'images/ch3/hinh-289.png', r'\\vec F'),
]
ALL_8_REFS = [
    ('chapters/ch1/muc-III-2.html', 'hinh-037.png'),
    ('chapters/ch1/muc-III-3.html', 'hinh-039.png'),
    ('chapters/ch3/muc-V-4.html',   'hinh-136.png'),
    ('chapters/ch3/muc-VII-1.html', 'hinh-240.png'),
    ('chapters/ch3/muc-VII-1.html', 'hinh-241.png'),
    ('chapters/ch3/muc-VII-2.html', 'hinh-266.png'),
    ('chapters/ch3/muc-VII-2.html', 'hinh-283.png'),
    ('chapters/ch3/muc-VII-2.html', 'hinh-289.png'),
]

def main():
    failures = []
    # Test 1: 8 critical refs no longer in figure-container
    for rel, src in ALL_8_REFS:
        html = (project_root() / rel).read_text(encoding='utf-8')
        pattern = rf'<div class="figure-container"><img[^>]*{re.escape(src)}'
        if re.search(pattern, html):
            failures.append(f'{rel}: still uses {src} as <img>')

    # Test 2: 5 single-position replacements
    for rel, src, latex_re in REPLACE_LIST:
        html = (project_root() / rel).read_text(encoding='utf-8')
        if not re.search(rf'<span class="math-tex">\\\({latex_re}\\\)</span>', html):
            failures.append(f'{rel}: missing KaTeX for {src}')

    # Test 3: hinh-240 replaced twice (P_2 + P_1)
    html = (project_root() / 'chapters/ch3/muc-VII-1.html').read_text(encoding='utf-8')
    if html.count(r'\vec P_2') != 1: failures.append('hinh-240: missing P_2')
    if html.count(r'\vec P_1') != 1: failures.append('hinh-240: missing P_1')

    # Test 4: 2 deleted unreferenced
    for src in DELETE_LIST:
        for f in (project_root() / 'chapters').rglob('*.html'):
            if src in f.read_text(encoding='utf-8'):
                failures.append(f'{f.name}: still references {src}')

    # Test 5: no orphan empty paragraphs
    for rel in ['chapters/ch1/muc-III-2.html', 'chapters/ch3/muc-VII-1.html', 'chapters/ch3/muc-VII-2.html']:
        html = (project_root() / rel).read_text(encoding='utf-8')
        if re.search(r'<p>\s*</p>', html):
            failures.append(f'{rel}: empty <p></p>')

    # Test 6: equation_mapping.json marks 8 rows obsolete=true (F2.4)
    import json
    mapping = json.loads((project_root() / 'data/equation_mapping.json').read_text(encoding='utf-8'))
    obsolete_hashes_expected = {'hinh-037', 'hinh-039', 'hinh-136', 'hinh-240', 'hinh-241', 'hinh-266', 'hinh-283', 'hinh-289'}
    obsolete_marked = {row.get('media_name', '').replace('.png', '') for row in mapping if row.get('obsolete')}
    missing = obsolete_hashes_expected - obsolete_marked
    if missing:
        failures.append(f'equation_mapping.json: missing obsolete=true for {missing}')

    if failures:
        for f in failures: print(f'FAIL: {f}')
        sys.exit(1)
    print(f'PASS: 8 critical images fixed (5 replace + 2 delete + 1 hinh-240 dual + obsolete marked)')
    sys.exit(0)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

Chạy: `python scripts/test-phase-02-critical-images.py` → expect FAIL.

### TDD Step 2 — GREEN: viết script replace

`scripts/replace-eight-formula-images.py`:

```python
"""Replace/Delete 8 formula-as-image entries per OCR verification."""
import argparse, datetime, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Each entry: (file_rel, action, old_pattern, new_replacement)
# Use precise old_pattern to ensure uniqueness in file.
EDITS = [
    # ch1/muc-III-2.html: hinh-037 → \vec T
    {
        'file': 'chapters/ch1/muc-III-2.html',
        'action': 'replace',
        'old': '<p>Phản lực của dây tác dụng lên phần khảo sát bao giờ cũng đặt vào chỗ buộc dây và hướng vào dây. Phản lực của dây được gọi là sức căng của dây, kí hiệu là</p> <div class="figure-container"><img src="images/ch1/hinh-037.png" alt="Hình minh họa chương 1" loading="lazy"></div> <p>. Trong trường hợp dây vòng qua vật thì phản lực dây hướng dọc dây và hướng ra đối với mặt cắt dây như hình 1.12.</p>',
        'new': '<p>Phản lực của dây tác dụng lên phần khảo sát bao giờ cũng đặt vào chỗ buộc dây và hướng vào dây. Phản lực của dây được gọi là sức căng của dây, kí hiệu là <span class="math-tex">\\(\\vec T\\)</span>. Trong trường hợp dây vòng qua vật thì phản lực dây hướng dọc dây và hướng ra đối với mặt cắt dây như hình 1.12.</p>',
    },
    # ch1/muc-III-3.html: hinh-039 → \vec R
    {
        'file': 'chapters/ch1/muc-III-3.html',
        'action': 'replace',
        'old': '<p>Phản lực liên kết</p> <div class="figure-container"><img src="images/ch1/hinh-039.png" alt="Hình minh họa chương 1" loading="lazy"></div> <p>trong trường hợp này',
        'new': '<p>Phản lực liên kết <span class="math-tex">\\(\\vec R\\)</span> trong trường hợp này',
    },
    # ch3/muc-V-4.html: hinh-136 → \vec v
    {
        'file': 'chapters/ch3/muc-V-4.html',
        'action': 'replace',
        'old': 'chuyển động với véc tơ <div class="figure-container"><img src="images/ch3/hinh-136.png" alt="Hình minh họa chương 3" loading="lazy"></div> . Trong trường hợp này',
        'new': 'chuyển động với véc tơ <span class="math-tex">\\(\\vec v\\)</span>. Trong trường hợp này',
    },
    # ch3/muc-VII-1.html: hinh-240 (1) → \vec P_2
    {
        'file': 'chapters/ch3/muc-VII-1.html',
        'action': 'replace',
        'old': 'của trục mất cân bằng</p> <div class="figure-container"><img src="images/ch3/hinh-240.png" alt="Hình minh họa chương 3" loading="lazy"></div> <p><sub>2</sub>, của vỏ động cơ</p>',
        'new': 'của trục mất cân bằng <span class="math-tex">\\(\\vec P_2\\)</span>, của vỏ động cơ</p>',
    },
    # ch3/muc-VII-1.html: hinh-240 (2) → \vec P_1
    {
        'file': 'chapters/ch3/muc-VII-1.html',
        'action': 'replace',
        'old': '<div class="figure-container"><img src="images/ch3/hinh-240.png" alt="Hình minh họa chương 3" loading="lazy"></div> <p><sub>1</sub> và phản lực của nền lên động cơ</p>',
        'new': ' <span class="math-tex">\\(\\vec P_1\\)</span> và phản lực của nền lên động cơ</p>',
    },
    # ch3/muc-VII-1.html: hinh-241 → \vec N
    {
        'file': 'chapters/ch3/muc-VII-1.html',
        'action': 'replace',
        'old': '<div class="figure-container"><img src="images/ch3/hinh-241.png" alt="Hình minh họa chương 3" loading="lazy"></div>',
        'new': '<span class="math-tex">\\(\\vec N\\)</span>',
    },
    # ch3/muc-VII-2.html: hinh-266 → DELETE
    {
        'file': 'chapters/ch3/muc-VII-2.html',
        'action': 'delete',
        'old': ' <div class="figure-container"><img src="images/ch3/hinh-266.png" alt="Hình minh họa chương 3" loading="lazy"></div>',
        'new': '',
    },
    # ch3/muc-VII-2.html: hinh-283 → DELETE
    {
        'file': 'chapters/ch3/muc-VII-2.html',
        'action': 'delete',
        'old': ' <div class="figure-container"><img src="images/ch3/hinh-283.png" alt="Hình minh họa chương 3" loading="lazy"></div>',
        'new': '',
    },
    # ch3/muc-VII-2.html: hinh-289 → \vec F (paragraph merge)
    {
        'file': 'chapters/ch3/muc-VII-2.html',
        'action': 'replace',
        'old': 'dưới tác dụng của lực</p> <div class="figure-container"><img src="images/ch3/hinh-289.png" alt="Hình minh họa chương 3" loading="lazy"></div> <p>nằm ngang, có giá trị không đổi.',
        'new': 'dưới tác dụng của lực <span class="math-tex">\\(\\vec F\\)</span> nằm ngang, có giá trị không đổi.',
    },
]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true', help='write *.bak.{timestamp} before apply')
    p.add_argument('--idempotent', action='store_true', help='no-op if already applied (used by extract_docx post-processor)')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    files_modified = {}
    skip_count = 0
    for edit in EDITS:
        path = ROOT / edit['file']
        original = files_modified.get(edit['file']) or path.read_text(encoding='utf-8')
        count = original.count(edit['old'])
        if count == 0 and args.idempotent:
            # Already applied
            skip_count += 1
            continue
        if count != 1:
            if args.idempotent:
                continue
            print(f"[ERROR] {edit['file']}: pattern matches {count} times (expected 1)")
            print(f"        action={edit['action']}")
            print(f"        snippet: {edit['old'][:80]}...")
            return 1
        new_content = original.replace(edit['old'], edit['new'])
        files_modified[edit['file']] = new_content
        print(f"[{edit['action'].upper()}] {edit['file']}: 1 match")

    if args.idempotent and not files_modified:
        print(f'IDEMPOTENT: all 8 edits already applied (skipped {skip_count})')
        return 0

    if args.apply:
        for rel, content in files_modified.items():
            path = ROOT / rel
            if args.backup:
                shutil.copy2(path, f'{path}.bak.{ts}')
            path.write_text(content, encoding='utf-8')
            print(f"WRITE {rel}")
    else:
        print(f"\nDry-run mode. Use --apply to write {len(files_modified)} files.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
```

### TDD Step 3 — Verify uniqueness, then apply

```powershell
python scripts/replace-eight-formula-images.py --check    # verify all patterns unique
python scripts/replace-eight-formula-images.py --apply --backup
```

### TDD Step 4 — Mark 8 rows obsolete (F2.4)

Tạo `scripts/mark-mapping-obsolete.py`:

```python
"""Mark 8 replaced/deleted formula-image rows as obsolete=true."""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAPPING = ROOT / 'data/equation_mapping.json'
OBSOLETE = {'hinh-037.png', 'hinh-039.png', 'hinh-136.png',
            'hinh-240.png', 'hinh-241.png', 'hinh-266.png',
            'hinh-283.png', 'hinh-289.png'}

def main():
    data = json.loads(MAPPING.read_text(encoding='utf-8'))
    changed = 0
    for row in data:
        if row.get('media_name') in OBSOLETE and not row.get('obsolete'):
            row['obsolete'] = True
            row['obsolete_reason'] = 'Replaced/deleted in Phase 02 (2026-05-18 formula-as-image fix)'
            changed += 1
    MAPPING.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'OK: marked {changed} rows obsolete=true')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
```

Chạy: `python scripts/mark-mapping-obsolete.py`.

### TDD Step 5 — Pipeline auto-fix integration (F1.1)

Modify `tools/extract_docx.py` thêm post-processor:

```python
# Near argparse setup
ap.add_argument('--auto-fix-known-issues', action=argparse.BooleanOptionalAction, default=True,
                help='Auto-run replace-eight-formula-images.py + apply-alt-and-figcaption.py after extract (default: True)')

# After main extract write loop, before bundle
if args.write and args.auto_fix_known_issues:
    import subprocess
    print('[AUTO-FIX] Running post-extract fixers...')
    for script in ('scripts/replace-eight-formula-images.py',
                   'scripts/apply-alt-and-figcaption.py'):
        if (ROOT / script).exists():
            r = subprocess.run(['python', script, '--apply', '--idempotent'],
                               cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
            if r.returncode != 0:
                print(f'[AUTO-FIX WARN] {script} failed: {r.stderr}')
            else:
                print(f'[AUTO-FIX] {script}: {r.stdout.strip().splitlines()[-1] if r.stdout else "OK"}')
        else:
            print(f'[AUTO-FIX SKIP] {script} not yet created')
```

Verify:
```powershell
# Re-extract, expect auto-fix to keep HTML clean
python tools/extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
# 8 raster should NOT reappear
python scripts/test-phase-02-critical-images.py    # PASS
```

### TDD Step 6 — Bundle + audit + tests

```powershell
python tools/bundle_pages.py
python tools/audit.py --strict-images
python scripts/test-phase-02-critical-images.py   # GREEN
```

### TDD Step 7 — Verify image references gone, delete orphan PNGs

```powershell
# Search if any HTML still references the 8 PNGs (should be 0)
python -c "import os, re; [print(f) for f in __import__('pathlib').Path('chapters').rglob('*.html') if any(s in f.read_text(encoding='utf-8') for s in ['hinh-037.png','hinh-039.png','hinh-136.png','hinh-240.png','hinh-241.png','hinh-266.png','hinh-283.png','hinh-289.png'])]"

# Then delete
git rm images/ch1/hinh-037.png images/ch1/hinh-039.png images/ch3/hinh-136.png images/ch3/hinh-240.png images/ch3/hinh-241.png images/ch3/hinh-266.png images/ch3/hinh-283.png images/ch3/hinh-289.png
```

### TDD Step 8 — Browser smoke

Mở dev server `python -m http.server 8000`, navigate qua 5 file đã sửa, screenshot lưu trong `visuals/phase-02-after/`:
- `ch1/muc-III-2` — đoạn "kí hiệu là $\vec T$"
- `ch1/muc-III-3` — đoạn "Phản lực liên kết $\vec R$"
- `ch3/muc-V-4` — "véc tơ $\vec v$"
- `ch3/muc-VII-1` — "$\vec P_2$, ... $\vec P_1$, ... $\vec N$"
- `ch3/muc-VII-2` — bài 1 không còn duplicate ảnh, bài 2 có "$\vec F$"

### TDD Step 9 — Document

Viết `reports/phase-02-completion-report.md` với:
- Trước/sau diff per file
- Browser screenshot links
- 8 PNG đã xoá
- 8 mapping rows obsolete=true
- Verify re-extract idempotent (auto-fix post-processor active)
- Tham chiếu OCR report

## Todo List

- [ ] Viết `scripts/test-phase-02-critical-images.py` (RED, plain Python)
- [ ] Verify test fail trước fix
- [ ] Viết `scripts/replace-eight-formula-images.py` (with `--idempotent` flag)
- [ ] Chạy `--check` mode, fix nếu pattern không unique
- [ ] Chạy `--apply --backup` (backup naming `*.bak.{timestamp}` — F2.6)
- [ ] Viết + chạy `scripts/mark-mapping-obsolete.py` (F2.4: mark 8 rows obsolete=true)
- [ ] Modify `tools/extract_docx.py` thêm `--auto-fix-known-issues` post-processor (F1.1)
- [ ] Verify re-extract test: chạy `tools/extract_docx.py --write` không tái sinh 8 raster
- [ ] `python tools/bundle_pages.py`
- [ ] `python tools/audit.py --strict-images` PASS
- [ ] `python scripts/test-phase-02-critical-images.py` PASS GREEN (6 assertion groups)
- [ ] Verify 0 reference đến 8 PNG bằng grep
- [ ] `git rm` 8 PNG files
- [ ] Browser smoke 5 file
- [ ] Screenshot vào `visuals/phase-02-after/`
- [ ] Cleanup `*.bak.{timestamp}` sau verify
- [ ] Viết `reports/phase-02-completion-report.md`

## Success Criteria

- [ ] `scripts/test-phase-02-critical-images.py` PASS với 6 assertion groups:
  - 8 critical refs no longer in figure-container
  - 5 single-position replacements present (\vec T, \vec R, \vec v, \vec N, \vec F)
  - hinh-240 dual-position (P_2 + P_1)
  - 2 deleted (hinh-266, hinh-283) unreferenced
  - No empty `<p></p>` orphan paragraphs
  - 8 rows in `equation_mapping.json` marked `obsolete=true`
- [ ] `audit.py --strict-images` PASS
- [ ] `bundle_pages.py` không lỗi
- [ ] 0 reference đến 8 PNG trong toàn bộ HTML
- [ ] 8 PNG xoá khỏi `images/`
- [ ] **Re-extract DOCX → HTML không tái sinh 8 raster** (auto-fix post-processor verified)
- [ ] Browser visual: 6 vị trí render đúng KaTeX, 2 vị trí xoá không còn ảnh, không paragraph break dư
- [ ] Report đầy đủ với diff + screenshot + auto-fix verification

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Pattern `old` không unique → script ăn nhầm | `--check` mode assert count == 1 trước apply |
| Paragraph merge làm vỡ ngữ pháp | Pattern lấy đủ context trước/sau, manual review diff |
| Xoá `hinh-266`/`hinh-283` rồi user phản đối vì là equation thật | OCR đã verify duplicate text — kèm reference report; rollback bằng git |
| Bundle pages.js encode UTF-8 lệch | Re-run bundle, audit, browser smoke |
| Auto-fix post-processor crash khiến extract fail | Wrap subprocess error → log warning, không return non-zero (extract phải succeed dù post-processor fail) |
| `--idempotent` mode false-positive (HTML đã đúng nhưng pattern lệch) | Test cả idempotent path: chạy 2 lần, lần 2 báo "all 8 already applied" |
| Mapping rows obsolete=true gây validate_equation_mapping.py warn | Update validator skip rows có `obsolete=true` (Phase 06) |

## Security Considerations

KaTeX inline render qua `\(...\)` đã được KaTeX library escape an toàn. Không injection. Auto-fix subprocess chỉ chạy script từ `scripts/` directory đã được commit.

## Cleanup

- 8 PNG xoá khỏi `images/`
- `*.bak.{timestamp}` files xoá sau verify (gitignore `*.bak.*`)
- Patterns hardcode trong script được commit để có audit trail; script chạy 1 lần là xong (idempotent verify pass mỗi re-extract)
