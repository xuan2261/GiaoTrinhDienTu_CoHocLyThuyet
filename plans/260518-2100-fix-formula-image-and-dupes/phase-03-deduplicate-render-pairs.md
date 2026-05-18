---
phase: 3
title: "Deduplicate 40 Render Pairs — Front B (Pipeline Fix) → Front A (HTML Verify)"
status: completed
priority: P1
effort: "3-4h"
dependencies: [1]
---

# Phase 03: Deduplicate 40 Render Pairs — Front B First, Front A Verify

## Overview

Khử 40 cặp render trùng (MathML + KaTeX cạnh nhau) bằng cách **fix root cause trong `tools/extract_docx.py` trước (Front B)**, sau đó re-extract DOCX để HTML tự sinh sạch. Nếu cần fix nhanh HTML hiện tại trước commit Front B (band-aid), Front A regex script vẫn có sẵn nhưng chạy sau Front B verify (red-team F1.2).

## Validation Decisions (red-team 2026-05-18)

- **Approach:** Hybrid — Front B (pipeline fix) là chính, Front A (HTML regex) là verify/fallback.
- **Order (F1.2):** **Đảo Front B trước Front A**. Lý do: nếu fix Front A trước rồi user chạy `extract_docx.py` (cho phase 05 hoặc bất kỳ) → 40 duplicate quay về. Front B fix root cause bảo vệ vĩnh viễn.
- **Strategy giữ lại:** Giữ MathML, bỏ KaTeX (645/702 row đã dùng MathML).
- **Test framework (F2.1):** Plain Python script asserts, không pytest.

## Requirements

### Functional

**Pipeline (Front B):**
- Re-run `python tools/extract_docx.py --input CoHocLyThuyet_Full_New.docx --write` không tái sinh duplicate.
- 8 file HTML sinh từ pipeline đạt `0 duplicate pairs` ngay lần đầu.
- 645 entry MathML render đúng, 53 entry LaTeX-only render đúng (KaTeX).

**HTML hiện tại (Front A — verify only):**
- Sau khi Front B fix + re-extract, HTML đã sạch.
- `python scripts/detect-duplicate-math-broad.py` báo `Grand total duplicates: 0`.
- Front A script (`scripts/dedupe-math-render-pairs.py`) chạy `--check` mode báo 0 changes (idempotent verify).

### Non-functional
- Front A script idempotent, dry-run available.
- Pipeline change tối thiểu (KISS), không phá render cho 645 entry hợp lệ.
- Backup `*.bak.{timestamp}` trước apply (HTML), commit-ready (F2.6).

## Architecture

### Two-front strategy (đảo thứ tự)

```
Front B — Pipeline root cause (LÀM TRƯỚC):
  tools/extract_docx.py modify
    → instrumented logging investigation
    → identify code path emit duplicate
    → fix: track emitted_mathml_hashes, skip KaTeX duplicate
    → re-extract → HTML sạch

Front A — HTML verify (LÀM SAU):
  scripts/dedupe-math-render-pairs.py
    → --check mode: assert 0 duplicate (verify Front B works)
    → --apply mode: chỉ dùng nếu cần fix HTML PRE-Front-B (band-aid)
    → idempotent
```

### Investigation (Front B)

Trước khi fix pipeline, cần xác định **chính xác** code path nào sinh ra cặp `<span class="mathml-inline">…</span><span class="math-tex">…</span>`. Hypotheses:

1. **H1:** Inline math symbol (`mtype:run` hoặc `<m:r>` trong OMML) được handle 2 cách: 1 lần qua `render_image_segment` (nếu là OLE), 1 lần qua một path riêng (paragraph text expansion).
2. **H2:** Pipeline xử lý 2 lần cho cùng `media_hash`: lần đầu render MathML từ mapping, lần 2 render fallback inline image (mà inline image cũng có mapping latex-only).
3. **H3:** OMML inline run được convert MathML qua `_convert_omml_inline()`, đồng thời `equation_mapping` cũng có entry latex cho cùng symbol → cả 2 emit ra HTML.

### Pattern khử (Front A — fallback)

**Forward pair:**
```
<span class="mathml-inline"><math…>…</math></span>[ws ≤ 30 chars]<span class="math-tex">\(LATEX\)</span>
```
→ giữ MathML, xoá `<span class="math-tex">…</span>`.

**Reverse pair:**
```
<span class="math-tex">\(LATEX\)</span>[ws ≤ 30]<span class="mathml-inline"><math…>…</math></span>
```
→ giữ MathML, xoá KaTeX.

### Sanity check

Convert MathML cạnh KaTeX → LaTeX (qua simple mapper), so sánh sau normalize. Nếu mismatch (ví dụ MathML là $\bar\omega$ nhưng KaTeX là $\vec\omega$), KHÔNG xoá, log warning. Bảo vệ khỏi xoá nhầm semantic.

## Related Code Files

- Modify:
  - `tools/extract_docx.py` (Front B — fix duplicate emit)
  - 8 file HTML qua re-extract (Front B sinh sạch tự động)
  - `js/pages.js` (qua bundle)
- Create:
  - `scripts/dedupe-math-render-pairs.py` (Front A fallback)
  - `scripts/test-phase-03-no-duplicates.py` (Front A verify)
  - `scripts/test-phase-03-pipeline-no-regen.py` (Front B verify, plain Python)
  - `reports/phase-03-pipeline-root-cause-investigation.md`
  - `reports/phase-03-completion-report.md`
- Delete: `*.bak.{timestamp}` sau commit

### File-level coverage

| File | Cặp trước | Cặp sau (Front B re-extract) | Front A check |
|---|---:|---:|---:|
| `ch1/muc-III-3.html` | 1 | 0 | verify |
| `ch1/muc-IV-3.html` | 1 | 0 | verify |
| `ch2/muc-I-1.html` | 12 | 0 | verify |
| `ch2/muc-II-2.html` | 9 | 0 | verify |
| `ch2/muc-V-3.html` | 1 | 0 | verify |
| `ch2/muc-VII-1.html` | 3 | 0 | verify |
| `ch3/muc-VII-1.html` | 5 | 0 | verify |
| `ch3/muc-VII-2.html` | 8 | 0 | verify |

## Implementation Steps

### Front B — TDD Step 1 (RED pipeline test, plain Python)

```python
# scripts/test-phase-03-pipeline-no-regen.py
"""Phase 03 Front B: re-extract pipeline does not regenerate 40 duplicate pairs."""
import shutil, subprocess, sys, tempfile
from pathlib import Path
from _test_helpers import project_root

def main():
    proj = project_root()
    backup_dir = proj.parent / f'_phase03_chapters_backup_{__import__("datetime").datetime.now().strftime("%Y%m%d%H%M%S")}'

    # Backup chapters
    shutil.copytree(proj / 'chapters', backup_dir)
    try:
        # Re-extract
        r = subprocess.run(
            ['python', 'tools/extract_docx.py',
             '--input', 'CoHocLyThuyet_Full_New.docx',
             '--write'],
            cwd=proj, capture_output=True, text=True, encoding='utf-8',
        )
        if r.returncode != 0:
            print(f'FAIL: extract_docx.py crashed: {r.stderr[:500]}')
            sys.exit(1)

        # Verify duplicate count
        r2 = subprocess.run(
            ['python', 'scripts/detect-duplicate-math-broad.py'],
            cwd=proj, capture_output=True, text=True, encoding='utf-8',
        )
        if 'Grand total duplicates: 0' not in r2.stdout:
            print(f'FAIL: duplicates regenerated. Output:\n{r2.stdout[:1000]}')
            sys.exit(1)

        print('PASS: re-extract produces 0 duplicate pairs (Front B verified)')
        sys.exit(0)
    finally:
        # Restore
        shutil.rmtree(proj / 'chapters')
        shutil.copytree(backup_dir, proj / 'chapters')
        shutil.rmtree(backup_dir)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

Chạy → expect FAIL (vì pipeline hiện tại sinh 40 duplicate).

### Front B — TDD Step 2 (Investigation)

Add debug logging tạm thời vào `tools/extract_docx.py`:
```python
# In render_image_segment(), log every emit
if 'math-tex' in result['html']:
    print(f"[DEBUG-EMIT] {chapter} {meta['paragraph_index']} {media_name}: {result['html'][:80]}")
```

Chạy `python tools/extract_docx.py --input ... --write` và quan sát:
- Vị trí nào emit `math-tex`?
- Có vị trí nào emit cả MathML lẫn KaTeX trong cùng paragraph?

Lưu phát hiện vào `reports/phase-03-pipeline-root-cause-investigation.md`.

### Front B — TDD Step 3 (GREEN pipeline fix)

Dựa trên investigation, sửa code path. Hypothesis cao nhất: paragraph text expansion (line ~664-666 trong `extract_docx.py`) emit raw KaTeX cho run có inline math symbol mà không check xem media đó đã được pipeline render thành MathML chưa.

Strategy:
1. Trong `render_image_segment`, nếu mapping có MathML → mark `media_hash` vào set `emitted_mathml`.
2. Trong text expansion path khi gặp inline KaTeX gắn với cùng media_hash → SKIP.

Pseudo:
```python
class ImageWriter:
    def __init__(self, ...):
        self.emitted_mathml_hashes = set()

    def render_image_segment(self, chapter, media_name, meta):
        ...
        if mapping and mapping.get('mathml'):
            self.emitted_mathml_hashes.add(media_hash)
        return rendered
```

Trong text expansion (locate vị trí emit KaTeX inline trong `extract_docx.py:600-700`):
```python
if media_hash in image_writer.emitted_mathml_hashes:
    continue  # already rendered as MathML, skip duplicate KaTeX
```

### Front B — TDD Step 4 (Verify)

```powershell
# Re-extract toàn bộ
python tools/extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools/bundle_pages.py
python tools/audit.py --strict-images
python scripts/detect-duplicate-math-broad.py     # expect 0
python scripts/test-phase-03-pipeline-no-regen.py  # PASS Front B
```

### Front A — TDD Step 5 (Verify, idempotent fallback)

Sau khi Front B đã pass và HTML đã sạch qua re-extract, Front A trở thành verify:

```python
# scripts/test-phase-03-no-duplicates.py
"""Phase 03 Front A: verify 0 duplicate pairs in current HTML."""
import re, sys
from _test_helpers import project_root, chapter_files

# Anchored patterns matching MathML+KaTeX adjacency (≤ 30 chars whitespace)
FWD = re.compile(
    r'<span class="mathml-inline">.*?</math>\s*</span>[^<]{0,30}<span class="math-tex">\\\([^)]+\\\)</span>',
    re.DOTALL,
)
REV = re.compile(
    r'<span class="math-tex">\\\([^)]+\\\)</span>[^<]{0,30}<span class="mathml-inline">.*?</math>\s*</span>',
    re.DOTALL,
)

def main():
    total = 0
    per_file = []
    for f in chapter_files():
        html = f.read_text(encoding='utf-8')
        n = len(FWD.findall(html)) + len(REV.findall(html))
        if n:
            per_file.append((str(f.relative_to(project_root())), n))
            total += n
    if total:
        print(f'FAIL: {total} duplicate pair(s) found')
        for p, n in per_file:
            print(f'  {p}: {n}')
        sys.exit(1)
    print('PASS: 0 duplicate pairs in HTML')
    sys.exit(0)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

### Front A — TDD Step 6 (Optional band-aid fallback)

Nếu Front B chưa xong nhưng cần demo HTML sạch ngay, viết `scripts/dedupe-math-render-pairs.py` (band-aid):

```python
"""Front A fallback: dedupe MathML/KaTeX pairs in current HTML (idempotent)."""
import argparse, datetime, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [
    'chapters/ch1/muc-III-3.html', 'chapters/ch1/muc-IV-3.html',
    'chapters/ch2/muc-I-1.html', 'chapters/ch2/muc-II-2.html',
    'chapters/ch2/muc-V-3.html', 'chapters/ch2/muc-VII-1.html',
    'chapters/ch3/muc-VII-1.html', 'chapters/ch3/muc-VII-2.html',
]

REMOVE_FWD = re.compile(
    r'(<span class="mathml-inline">.*?</math>\s*</span>)([^<]{0,30})<span class="math-tex">\\\([^)]+\\\)</span>',
    re.DOTALL,
)
REMOVE_REV = re.compile(
    r'<span class="math-tex">\\\([^)]+\\\)</span>([^<]{0,30})(<span class="mathml-inline">.*?</math>\s*</span>)',
    re.DOTALL,
)

def dedupe(html):
    new = REMOVE_FWD.sub(r'\1\2', html)
    new = REMOVE_REV.sub(r'\1\2', new)
    return new

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    total_removed = 0
    for rel in TARGETS:
        path = ROOT / rel
        original = path.read_text(encoding='utf-8')
        new = dedupe(original)
        # Idempotent loop
        while new != dedupe(new):
            new = dedupe(new)
        diff = original.count('math-tex') - new.count('math-tex')
        total_removed += diff
        if args.apply and diff:
            if args.backup:
                shutil.copy2(path, f'{path}.bak.{ts}')
            path.write_text(new, encoding='utf-8')
            print(f'WRITE {rel}: removed {diff} math-tex span(s)')
        elif args.check and diff:
            print(f'WOULD REMOVE {diff} from {rel}')
    print(f'\nTotal removed: {total_removed}')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
```

### Step 7 — Cleanup

```powershell
# Remove debug logging from extract_docx.py
git rm chapters/**/*.bak.*  # if any from band-aid use
```

### Step 8 — Document

`reports/phase-03-completion-report.md`:
- Front B order (đảo Front B trước, F1.2)
- Investigation timeline
- Code diff `tools/extract_docx.py`
- Trước/sau metric (40 → 0 sau re-extract)
- Re-extract verification (Front B test PASS)
- Front A verify (Front A test PASS, no changes needed)
- Sample diff per file

## Todo List

- [ ] Viết `scripts/test-phase-03-pipeline-no-regen.py` (Front B RED, plain Python)
- [ ] Add debug logging vào `extract_docx.py` để investigation
- [ ] Chạy investigation, lưu phát hiện
- [ ] Viết `reports/phase-03-pipeline-root-cause-investigation.md`
- [ ] Implement fix vào `extract_docx.py` (track `emitted_mathml_hashes`, skip duplicate KaTeX)
- [ ] Re-run extract, verify 0 duplicate (Front B test PASS)
- [ ] Viết `scripts/test-phase-03-no-duplicates.py` (Front A verify, plain Python)
- [ ] Front A test PASS (HTML đã sạch sau Front B re-extract)
- [ ] Viết `scripts/dedupe-math-render-pairs.py` (fallback only, dùng nếu cần)
- [ ] Remove debug logging
- [ ] `git rm` `*.bak.*` files nếu có
- [ ] Viết `reports/phase-03-completion-report.md`

## Success Criteria

- [ ] `python scripts/test-phase-03-pipeline-no-regen.py` PASS (re-extract test, Front B)
- [ ] `python scripts/test-phase-03-no-duplicates.py` PASS (HTML clean verify, Front A)
- [ ] `python scripts/detect-duplicate-math-broad.py` báo 0 pairs
- [ ] Sau re-extract toàn bộ, vẫn báo 0 pairs (Front B persistence)
- [ ] `audit.py --strict-images` PASS
- [ ] `bundle_pages.py` không lỗi
- [ ] `extract_docx.py` change ≤ 30 dòng (KISS)
- [ ] Investigation report ghi rõ code path trùng
- [ ] Số block MathML không giảm sau Front B fix

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Investigation Front B không tìm ra root cause trong thời gian dự kiến | Set timebox 2h; nếu không xong, document hypothesis + dùng Front A band-aid + flag debt |
| Fix pipeline làm mất MathML cho 645 entry hợp lệ | Test re-extract phải verify số block MathML không giảm; rollback git |
| Regex Front A ăn nhầm KaTeX đơn lẻ | Anchor pattern bắt buộc có MathML cạnh; verify count == 40 trước apply (nếu dùng band-aid) |
| Re-extract test xoá `chapters/` rồi crash → mất data | Backup vào folder timestamp ngoài project, finally restore; verify backup tồn tại trước extract |
| `.bak.*` files lọt vào commit | `.gitignore` thêm `*.bak.*`; test post-commit |

## Security Considerations

- Script chỉ ghi 8 file HTML đã liệt kê.
- Investigation logging xoá trước commit.
- Test script backup nằm ngoài project root để tránh lẫn vào git tracking.
- Không exec code từ HTML / DOCX.

## Cleanup

Files xoá: `*.bak.*` files (nếu có). Debug logging temporary trong `extract_docx.py`.

## Definition of Done (Phase 03)

- Front B: `extract_docx.py` không sinh duplicate ở re-extract
- Front A: HTML hiện tại 0 duplicate (verify sau Front B)
- Cả 2 test plain Python pass
- Investigation report ghi rõ root cause + fix decision
- Ready cho Phase 05 alt-text overhaul (cần re-extract pipeline an toàn)
