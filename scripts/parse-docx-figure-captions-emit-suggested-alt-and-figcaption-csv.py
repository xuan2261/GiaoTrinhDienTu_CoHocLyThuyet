"""Parse DOCX figure captions and emit suggested alt + figcaption per image hash.

Reads CoHocLyThuyet_Full_New.docx, walks its paragraphs, and for each paragraph
that contains a w:drawing tries the next 1-2 paragraphs against three caption
regex variants ('Hình X.Y', 'Hinh X.Y', 'Figure X.Y'). For each blip rId we
also resolve the embedded media path so we can compute the SHA1[:12] hash that
Phase 02/05/06 use as the cross-reference key into image_alt_overrides.json
and formula-image-allowlist.json.

Outputs CSV at plans/260518-2100-fix-formula-image-and-dupes/reports/
alt-text-suggested.csv with columns:
  paragraph_idx, media_hash, suggested_alt, suggested_figcaption,
  variant_matched, next_paragraph_text.
"""
import csv
import hashlib
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DOCX = ROOT / 'CoHocLyThuyet_Full_New.docx'
OUT_CSV = (
    ROOT
    / 'plans/260518-2100-fix-formula-image-and-dupes/reports/'
    'docx-figure-caption-suggested-alt-and-figcaption-per-image.csv'
)

W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
W_TAG = lambda n: f'{{{W_NS}}}{n}'
A_TAG = lambda n: f'{{{A_NS}}}{n}'

CAPTION_VARIANTS = [
    ('hinh_dau', re.compile(r'^H[ìi]nh\s+(\d+)\.(\d+)\s*[\-:.–—]?\s*(.+?)$', re.IGNORECASE)),
    ('figure_en', re.compile(r'^Figure\s+(\d+)\.(\d+)\s*[\-:.–—]?\s*(.+?)$', re.IGNORECASE)),
]


def main():
    if not DOCX.exists():
        print(f'WARN: DOCX missing at {DOCX}; skip')
        sys.exit(0)

    with zipfile.ZipFile(DOCX) as z:
        xml_bytes = z.read('word/document.xml')
        rels_bytes = z.read('word/_rels/document.xml.rels')
        media_files = [n for n in z.namelist() if n.startswith('word/media/')]
        media_hashes = {}
        for mp in media_files:
            base = mp.split('/')[-1]
            media_hashes[base] = hashlib.sha1(z.read(mp)).hexdigest()[:12]

    # Build rId -> media filename mapping from rels
    rels = ET.fromstring(rels_bytes)
    rid_to_media = {}
    for rel in rels:
        target = rel.get('Target', '')
        if target.startswith('media/'):
            rid_to_media[rel.get('Id')] = target.split('/')[-1]

    doc = ET.fromstring(xml_bytes)
    paragraphs = []
    for p in doc.iter(W_TAG('p')):
        text = ''.join((r.text or '') for r in p.iter(W_TAG('t'))).strip()
        rids = [
            b.get(f'{{{R_NS}}}embed')
            for b in p.iter(A_TAG('blip'))
            if b.get(f'{{{R_NS}}}embed')
        ]
        paragraphs.append({'text': text, 'rids': rids})

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow([
            'paragraph_idx', 'media_hash', 'suggested_alt',
            'suggested_figcaption', 'variant_matched', 'next_paragraph_text',
        ])
        for i, para in enumerate(paragraphs):
            if not para['rids']:
                continue
            for rid in para['rids']:
                media_name = rid_to_media.get(rid)
                media_hash = media_hashes.get(media_name, '') if media_name else ''
                matched = None
                for offset in (1, 2):
                    j = i + offset
                    if j >= len(paragraphs):
                        continue
                    nt = paragraphs[j]['text']
                    if not nt:
                        continue
                    for variant, pat in CAPTION_VARIANTS:
                        m = pat.match(nt)
                        if m:
                            matched = (variant, m.group(3).strip()[:120], nt)
                            break
                    if matched:
                        break
                if matched:
                    variant, alt, figcaption = matched
                    w.writerow([i, media_hash, alt, figcaption, variant, figcaption])
                else:
                    nxt = paragraphs[i + 1]['text'] if i + 1 < len(paragraphs) else ''
                    w.writerow([i, media_hash, '', '', 'NO_MATCH', nxt[:200]])

    print(f'Wrote {OUT_CSV}')
    print('Review CSV, then transform -> data/image_alt_overrides.json')


if __name__ == '__main__':
    main()
