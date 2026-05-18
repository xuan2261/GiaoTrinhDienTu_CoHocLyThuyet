"""Build data/image_alt_overrides.json from the suggested-alt CSV (Phase 05).

Reads the CSV produced by parse-docx-figure-captions-...py and emits a JSON
array of {hash, alt, figcaption} entries for every CSV row whose
variant_matched is not 'NO_MATCH'. Idempotent: re-runs overwrite the file in
the same shape so manual hand-edits to the JSON should be applied as a
post-step (or via a separate manual-overrides JSON layered on top).

Output: data/image_alt_overrides.json (array)
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = (
    ROOT
    / 'plans/260518-2100-fix-formula-image-and-dupes/reports/'
    'docx-figure-caption-suggested-alt-and-figcaption-per-image.csv'
)
OUT_JSON = ROOT / 'data/image_alt_overrides.json'


def main():
    if not CSV_PATH.exists():
        print(f'FAIL: {CSV_PATH} missing; run parse-docx-figure-captions... first')
        sys.exit(1)

    seen = {}
    with CSV_PATH.open(encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            if r['variant_matched'] == 'NO_MATCH':
                continue
            h = r['media_hash']
            if not h or h in seen:
                continue
            alt = (r['suggested_alt'] or '').strip()[:120]
            cap = (r['suggested_figcaption'] or '').strip()[:200]
            if not alt:
                continue
            seen[h] = {'hash': h, 'alt': alt, 'figcaption': cap}

    rows = sorted(seen.values(), key=lambda r: r['hash'])
    OUT_JSON.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    print(f'Wrote {len(rows)} overrides -> {OUT_JSON}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
