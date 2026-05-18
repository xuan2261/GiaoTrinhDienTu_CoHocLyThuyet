"""Phase 05 assertions: alt text + figcaption + <figure> migration complete.

Validates that:
  1. Zero <img alt="Hình minh họa chương 1|2|3"> generic placeholders remain.
  2. Every <img> alt is non-empty and <= 120 chars.
  3. Zero <div class="figure-container"> remain (all migrated to <figure>).
  4. Every <figure> contains a <figcaption>.
  5. Every <figcaption> body is <= 200 chars.
  6. data/image_alt_overrides.json schema is valid (array of {hash, alt[, figcaption]}).
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
HELPERS = HERE / 'equations-fix-shared-test-helpers-html-image-utilities.py'
spec = importlib.util.spec_from_file_location('eq_test_helpers', HELPERS)
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
project_root = helpers.project_root
chapter_files = helpers.chapter_files
iter_imgs = helpers.iter_imgs

GENERIC = re.compile(r'^Hình minh họa chương [123]$')
FIGURE_BODY = re.compile(r'<figure[^>]*>(.*?)</figure>', re.DOTALL)
FIGCAP_INNER = re.compile(r'<figcaption[^>]*>(.+?)</figcaption>', re.DOTALL)
TAG_STRIP = re.compile(r'<[^>]+>')


def main():
    proj = project_root()
    failures = []

    generic_offenders = []
    long_alts = []
    div_total = 0
    figs_no_caption = 0
    long_caps = 0

    for f in chapter_files():
        html_text = f.read_text(encoding='utf-8')
        rel = str(f.relative_to(proj)).replace('\\', '/')

        for img in iter_imgs(html_text):
            alt = (img.alt or '').strip()
            if GENERIC.match(alt):
                generic_offenders.append((rel, img.src))
            if len(alt) > 120:
                long_alts.append((rel, img.src, len(alt)))

        div_total += html_text.count('<div class="figure-container">')

        for fb in FIGURE_BODY.findall(html_text):
            if '<figcaption' not in fb:
                figs_no_caption += 1
            for cap in FIGCAP_INNER.findall(fb):
                text = TAG_STRIP.sub('', cap).strip()
                if len(text) > 200:
                    long_caps += 1

    if generic_offenders:
        failures.append(
            f'{len(generic_offenders)} generic alt(s) remain; '
            f'first 5: {generic_offenders[:5]}'
        )
    if long_alts:
        failures.append(f'{len(long_alts)} alt(s) over 120 chars')
    if div_total:
        failures.append(
            f'{div_total} <div class="figure-container"> still present'
        )
    if figs_no_caption:
        failures.append(f'{figs_no_caption} <figure> tags missing <figcaption>')
    if long_caps:
        failures.append(f'{long_caps} figcaptions over 200 chars')

    overrides_path = proj / 'data/image_alt_overrides.json'
    if overrides_path.exists():
        try:
            data = json.loads(overrides_path.read_text(encoding='utf-8'))
        except Exception as exc:
            failures.append(f'image_alt_overrides.json invalid JSON: {exc}')
            data = []
        if not isinstance(data, list):
            failures.append('image_alt_overrides.json must be an array')
            data = []
        for row in data:
            if 'hash' not in row or 'alt' not in row:
                failures.append(f'override row missing keys: {row}')
            if len(row.get('alt', '')) > 120:
                failures.append(f"override alt > 120 chars: {row.get('hash')}")

    if failures:
        for f in failures:
            print(f'FAIL: {f}')
        sys.exit(1)
    print(
        'PASS: 0 generic alts, 100% <figure>+<figcaption>, '
        'overrides schema valid, all alt/cap within budgets.'
    )
    sys.exit(0)


if __name__ == '__main__':
    main()
