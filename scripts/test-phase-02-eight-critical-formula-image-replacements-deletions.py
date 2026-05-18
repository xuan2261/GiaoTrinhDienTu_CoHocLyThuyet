"""Phase 02 assertions: 8 critical formula-as-image refs replaced or deleted.

The plan's F2.4 obsolete-marking step does not apply: data/equation_mapping.json
catalogs equations (latex/mathml + examples), and none of the 8 raster PNGs
appear as an equation example output. Instead, those PNGs are figure-artifact
images that the Phase 06 audit guard reaches via SHA1 + allowlist. This test
covers: (1) eight raster refs no longer present in figure-container, (2) seven
KaTeX inline replacements (vec T, vec R, vec v, vec P_2, vec P_1, vec N,
vec F), (3) two deletions (hinh-266, hinh-283), (4) no orphan empty <p></p>.
"""
import importlib.util
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
HELPERS = HERE / 'equations-fix-shared-test-helpers-html-image-utilities.py'
spec = importlib.util.spec_from_file_location('eq_test_helpers', HELPERS)
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
project_root = helpers.project_root

DELETE_LIST = ['images/ch3/hinh-266.png', 'images/ch3/hinh-283.png']

REPLACE_LIST = [
    ('chapters/ch1/muc-III-2.html', 'images/ch1/hinh-037.png', r'\\vec T'),
    ('chapters/ch1/muc-III-3.html', 'images/ch1/hinh-039.png', r'\\vec R'),
    ('chapters/ch3/muc-V-4.html', 'images/ch3/hinh-136.png', r'\\vec v'),
    ('chapters/ch3/muc-VII-1.html', 'images/ch3/hinh-241.png', r'\\vec N'),
    ('chapters/ch3/muc-VII-2.html', 'images/ch3/hinh-289.png', r'\\vec F'),
]

ALL_8_REFS = [
    ('chapters/ch1/muc-III-2.html', 'images/ch1/hinh-037.png'),
    ('chapters/ch1/muc-III-3.html', 'images/ch1/hinh-039.png'),
    ('chapters/ch3/muc-V-4.html', 'images/ch3/hinh-136.png'),
    ('chapters/ch3/muc-VII-1.html', 'images/ch3/hinh-240.png'),
    ('chapters/ch3/muc-VII-1.html', 'images/ch3/hinh-241.png'),
    ('chapters/ch3/muc-VII-2.html', 'images/ch3/hinh-266.png'),
    ('chapters/ch3/muc-VII-2.html', 'images/ch3/hinh-283.png'),
    ('chapters/ch3/muc-VII-2.html', 'images/ch3/hinh-289.png'),
]


def main():
    failures = []
    proj = project_root()

    # Test 1: 8 critical refs removed from <img> within figure-container
    for rel, src in ALL_8_REFS:
        path = proj / rel
        if not path.exists():
            failures.append(f'{rel} missing')
            continue
        html = path.read_text(encoding='utf-8')
        pattern = (
            r'<div class="figure-container"><img[^>]*'
            + re.escape(src)
        )
        if re.search(pattern, html):
            failures.append(f'{rel}: still uses {src} as <img> in figure-container')

    # Test 2: 5 single-position replacements
    for rel, src, latex_re in REPLACE_LIST:
        html = (proj / rel).read_text(encoding='utf-8')
        if not re.search(rf'<span class="math-tex">\\\({latex_re}\\\)</span>', html):
            failures.append(f'{rel}: missing KaTeX for {src}')

    # Test 3: hinh-240 dual replacement (P_2 + P_1)
    html = (proj / 'chapters/ch3/muc-VII-1.html').read_text(encoding='utf-8')
    if html.count(r'\vec P_2') != 1:
        failures.append('hinh-240: missing P_2')
    if html.count(r'\vec P_1') != 1:
        failures.append('hinh-240: missing P_1')

    # Test 4: 2 deleted unreferenced anywhere in chapters/
    for src in DELETE_LIST:
        for f in (proj / 'chapters').rglob('*.html'):
            if src in f.read_text(encoding='utf-8'):
                failures.append(f'{f.relative_to(proj)}: still references {src}')

    # Test 5: no orphan empty paragraphs in 5 modified files
    for rel in [
        'chapters/ch1/muc-III-2.html',
        'chapters/ch1/muc-III-3.html',
        'chapters/ch3/muc-V-4.html',
        'chapters/ch3/muc-VII-1.html',
        'chapters/ch3/muc-VII-2.html',
    ]:
        html = (proj / rel).read_text(encoding='utf-8')
        if re.search(r'<p>\s*</p>', html):
            failures.append(f'{rel}: empty <p></p>')

    if failures:
        for f in failures:
            print(f'FAIL: {f}')
        sys.exit(1)
    print(
        'PASS: 8 critical fixed (5 replace + 2 delete + 1 hinh-240 dual P2/P1), '
        'no orphan paragraphs.'
    )
    sys.exit(0)


if __name__ == '__main__':
    main()
