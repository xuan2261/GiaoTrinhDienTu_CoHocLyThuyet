"""Measure DOCX caption coverage for figure alt-text generation (Phase 01 F3.1).

Reads CoHocLyThuyet_Full_New.docx, finds image-bearing paragraphs, attempts to
match the next 1-2 paragraphs against three caption regex variants
('Hinh X.Y', 'Hinh X.Y', 'Figure X.Y'). Reports coverage % vs the 70%
threshold so Phase 05 can decide whether to widen regex variants.
"""
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DOCX = ROOT / 'CoHocLyThuyet_Full_New.docx'
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

CAPTION_VARIANTS = [
    re.compile(r'^H[ìi]nh\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE),
    re.compile(r'^Figure\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE),
]


def main():
    if not DOCX.exists():
        print(f'WARN: DOCX missing at {DOCX}; skip')
        sys.exit(0)
    with zipfile.ZipFile(DOCX) as z:
        xml = z.read('word/document.xml').decode('utf-8')
    doc = ET.fromstring(xml)
    paragraphs = []
    img_indices = []
    for i, p in enumerate(doc.iter(f'{{{NS["w"]}}}p')):
        text = ''.join(
            (r.text or '') for r in p.iter(f'{{{NS["w"]}}}t')
        ).strip()
        paragraphs.append(text)
        if any(p.iter(f'{{{NS["w"]}}}drawing')):
            img_indices.append(i)

    matched = 0
    failures = []
    for idx in img_indices:
        hit = False
        for offset in (1, 2):
            j = idx + offset
            if j >= len(paragraphs):
                continue
            t = paragraphs[j]
            if any(p.match(t) for p in CAPTION_VARIANTS):
                matched += 1
                hit = True
                break
        if not hit:
            nxt = paragraphs[idx + 1] if idx + 1 < len(paragraphs) else ''
            failures.append((idx, nxt))

    coverage = matched / len(img_indices) if img_indices else 0
    print(f'Total image-bearing paragraphs: {len(img_indices)}')
    print(f'Caption matched: {matched} ({coverage:.1%})')
    print('Threshold: 70%')

    if coverage < 0.7:
        print('WARN: coverage < 70%. Sample failures (5):')
        for idx, t in failures[:5]:
            print(f'  para[{idx}+1]: {t[:80]!r}')
        print('Action: extend regex variants in apply-alt-and-figcaption script BEFORE Phase 05')
        sys.exit(1)
    print('OK: coverage adequate, proceed to Phase 05')
    sys.exit(0)


if __name__ == '__main__':
    main()
