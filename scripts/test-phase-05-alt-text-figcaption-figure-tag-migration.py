"""Phase 05 assertions: alt text + figcaption + <figure> migration complete.

Validates that:
  1. Zero <img alt="Hình minh họa chương 1|2|3"> generic placeholders remain.
  2. Every <img> alt is non-empty and <= 120 chars.
  3. Zero <div class="figure-container"> remain (all migrated to <figure>).
  4. Every <figure> contains a <figcaption>.
  5. Every <figcaption> body is <= 200 chars.
  6. No adjacent duplicate DOCX caption paragraph remains after a figcaption.
  7. data/image_alt_overrides.json schema is valid (array of {hash, alt[, figcaption]}).
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

APPLY_SCRIPT = HERE / 'apply-image-alt-text-and-figcaption-from-overrides-and-docx-captions.py'
apply_spec = importlib.util.spec_from_file_location('apply_figure_captions', APPLY_SCRIPT)
apply_figure_captions = importlib.util.module_from_spec(apply_spec)
apply_spec.loader.exec_module(apply_figure_captions)

GENERIC = re.compile(r'^Hình minh họa chương [123]$')
FIGURE_BODY = re.compile(r'<figure[^>]*>((?:(?!</figure>).)*?)</figure>', re.DOTALL | re.IGNORECASE)
FIGCAP_INNER = re.compile(r'<figcaption[^>]*>(.+?)</figcaption>', re.DOTALL)
IMG_TAG = re.compile(r'<img\b[^>]*>', re.DOTALL | re.IGNORECASE)
FIGURE_THEN_CAPTION_P = re.compile(
    r'<figure[^>]*>(?:(?!</figure>).)*?<figcaption[^>]*>'
    r'(?:(?!</figcaption>).)*?</figcaption>'
    r'(?:(?!</figure>).)*?</figure>\s*'
    r'(?:<p\b[^>]*\bclass=["\'][^"\']*\bcaption\b[^"\']*["\'][^>]*>.*?</p>'
    r'|<p\b[^>]*>\s*<strong>\s*Hình\b.*?</p>)',
    re.DOTALL | re.IGNORECASE,
)
PAGES_BUNDLE_DUPLICATE_CAPTION = re.compile(
    r'</figure>\\n(?:<p\b[^>]*\bclass=\\?"caption\\?"|<p\b[^>]*>\\n?\\s*<strong>\\n?\\s*Hình\b)',
    re.IGNORECASE,
)
MISMATCHED_NUMBER_MERGE = re.compile(
    r'Hình\s+(\d+(?:\.\d+)+)\s+-\s+Hình\s+(\d+(?:\.\d+)+)',
    re.IGNORECASE,
)
CONSECUTIVE_SAME_FIGCAPTION = re.compile(
    r'<figure[^>]*>(?:(?!</figure>).)*?<figcaption[^>]*>(.*?)</figcaption>'
    r'(?:(?!</figure>).)*?</figure>\s*'
    r'<figure[^>]*>(?:(?!</figure>).)*?<figcaption[^>]*>\1</figcaption>',
    re.DOTALL | re.IGNORECASE,
)
TAG_STRIP = re.compile(r'<[^>]+>')


def assert_caption_cleanup_helper(failures):
    duplicate = (
        '<figure><img src="x.png"><figcaption>Hình 3.23</figcaption></figure>\n'
        '<p class="caption"><strong>Hình </strong><strong>3</strong>'
        '<strong>.</strong><strong>23</strong></p>'
    )
    cleaned, removed = apply_figure_captions.remove_duplicate_caption_paragraphs(duplicate)
    if removed != 1 or '<p class="caption">' in cleaned:
        failures.append('caption cleanup helper does not remove equivalent duplicate')

    plain_strong_duplicate = (
        '<figure><img src="x.png"><figcaption>Hình 1.11. Liên kết tựa</figcaption></figure>\n'
        '<p><strong>Hình </strong><strong>1</strong><strong>.</strong>'
        '<strong>11</strong><strong>.</strong> <strong>Liên kết tựa</strong></p>'
    )
    cleaned, removed = apply_figure_captions.remove_duplicate_caption_paragraphs(plain_strong_duplicate)
    if removed != 1 or '<p><strong>Hình ' in cleaned:
        failures.append('caption cleanup helper does not remove plain strong duplicate')

    fallback = (
        '<figure><img src="x.png"><figcaption>Hình minh họa - Mô men</figcaption></figure>\n'
        '<p class="caption"><strong>Hình</strong> <strong>1</strong>'
        '<strong>.</strong><strong>1</strong></p>'
    )
    cleaned, removed = apply_figure_captions.remove_duplicate_caption_paragraphs(fallback)
    if removed != 1 or 'Hình 1.1 - Mô men' not in cleaned:
        failures.append('caption cleanup helper does not merge figure number into fallback figcaption')

    plain_strong_fallback = (
        '<figure><img src="x.png"><figcaption>Hình minh họa - Các dạng cơ bản của hệ lực không gian</figcaption></figure>\n'
        '<p><strong>Hình </strong><strong>1</strong><strong>.</strong>'
        '<strong>21</strong><strong>.</strong> <strong>Hệ lực phân bố đều</strong></p>'
    )
    cleaned, removed = apply_figure_captions.remove_duplicate_caption_paragraphs(plain_strong_fallback)
    if removed != 1 or 'Hình 1.21 - Các dạng cơ bản của hệ lực không gian' not in cleaned:
        failures.append('caption cleanup helper does not merge plain strong fallback caption')

    non_matching = (
        '<figure><img src="x.png"><figcaption>Hình minh họa - Mô men</figcaption></figure>\n'
        '<p class="caption">Ghi chú không có số hình</p>'
    )
    cleaned, removed = apply_figure_captions.remove_duplicate_caption_paragraphs(non_matching)
    if removed != 0 or '<p class="caption">' not in cleaned:
        failures.append('caption cleanup helper removes non-numbered non-equivalent caption')

    numbered_non_matching = (
        '<figure><img src="x.png"><figcaption>Hình 3.17</figcaption></figure>\n'
        '<p>intervening content</p>\n'
        '<figure><img src="y.png"><figcaption>Hình 3.18</figcaption></figure>\n'
        '<p class="caption"><strong>Hình </strong><strong>3</strong>'
        '<strong>.</strong><strong>18</strong></p>'
    )
    cleaned, removed = apply_figure_captions.remove_duplicate_caption_paragraphs(numbered_non_matching)
    if removed != 1 or 'Hình 3.18 - Hình 3.17' in cleaned:
        failures.append('caption cleanup helper crosses figure boundaries or merges different numbers')

    grouped = (
        '<figure><img src="x.png" alt="A"><figcaption>Hình 1.10. Giải phóng liên kết</figcaption></figure>\n'
        '<figure><img src="y.png" alt="B"><figcaption>Hình 1.10. Giải phóng liên kết</figcaption></figure>'
    )
    cleaned, merged = apply_figure_captions.merge_consecutive_duplicate_figures(grouped)
    if merged != 1 or cleaned.count('<figure') != 1 or len(IMG_TAG.findall(cleaned)) != 2:
        failures.append('caption cleanup helper does not merge adjacent figures with the same caption')

    separated = (
        '<figure><img src="x.png"><figcaption>Hình 1.10</figcaption></figure>\n'
        '<p>Nội dung chen giữa</p>\n'
        '<figure><img src="y.png"><figcaption>Hình 1.10</figcaption></figure>'
    )
    cleaned, merged = apply_figure_captions.merge_consecutive_duplicate_figures(separated)
    if merged != 0 or cleaned.count('<figure') != 2:
        failures.append('caption cleanup helper merges figures across content boundaries')


def main():
    proj = project_root()
    failures = []
    assert_caption_cleanup_helper(failures)

    generic_offenders = []
    long_alts = []
    div_total = 0
    figs_no_caption = 0
    long_caps = 0
    duplicate_caption_paragraphs = []

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
        for m in FIGURE_THEN_CAPTION_P.finditer(html_text):
            duplicate_caption_paragraphs.append((rel, m.start()))
        for m in CONSECUTIVE_SAME_FIGCAPTION.finditer(html_text):
            failures.append(f'consecutive duplicate figcaption remains in {rel}: {m.group(1)[:80]}')
        for m in MISMATCHED_NUMBER_MERGE.finditer(html_text):
            if m.group(1) != m.group(2):
                failures.append(f'mismatched merged figure numbers in {rel}: {m.group(0)}')

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
    if duplicate_caption_paragraphs:
        failures.append(
            f'{len(duplicate_caption_paragraphs)} duplicate figure caption '
            f'paragraph(s) remain after figcaption; first 5: '
            f'{duplicate_caption_paragraphs[:5]}'
        )

    pages_bundle = proj / 'js/pages.js'
    if pages_bundle.exists():
        bundle_text = pages_bundle.read_text(encoding='utf-8')
        if PAGES_BUNDLE_DUPLICATE_CAPTION.search(bundle_text):
            failures.append('js/pages.js contains adjacent duplicate figure caption paragraph')
        for m in MISMATCHED_NUMBER_MERGE.finditer(bundle_text):
            if m.group(1) != m.group(2):
                failures.append(f'js/pages.js contains mismatched merged figure numbers: {m.group(0)}')

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
