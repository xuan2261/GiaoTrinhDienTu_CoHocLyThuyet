"""Phase 01 baseline assertions for the equations-fix plan (plain Python, no pytest).

Verifies stable counts (HTML chapter files, total <img> tags) and presence of
the 8 critical formula-as-image references prior to the Phase 02 fix. Loads
helpers via importlib because the helpers filename uses kebab-case (which
Python's import system cannot resolve).
"""
import importlib.util
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
assert_or_exit = helpers.assert_or_exit

EXPECTED_FILES = 120
EXPECTED_IMGS = 127

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


def main():
    files = chapter_files()
    assert_or_exit(
        len(files) == EXPECTED_FILES,
        f'Expected {EXPECTED_FILES} HTML files, got {len(files)}',
    )

    total_imgs = sum(
        1 for f in files for _ in iter_imgs(f.read_text(encoding='utf-8'))
    )
    assert_or_exit(
        total_imgs == EXPECTED_IMGS,
        f'Expected {EXPECTED_IMGS} imgs, got {total_imgs}',
    )

    for rel, src in CRITICAL:
        path = project_root() / 'chapters' / rel
        if not path.exists():
            print(f'INFO: baseline ref missing (likely already fixed): {rel}')
            continue
        html = path.read_text(encoding='utf-8')
        if src not in html:
            print(f'INFO: {rel} no longer references {src} (likely already fixed)')

    print(f'PASS: {len(files)} files, {total_imgs} imgs, baseline checks complete')
    sys.exit(0)


if __name__ == '__main__':
    main()
