"""Phase 03 Front A verification: zero MathML+KaTeX duplicate pairs in HTML.

Re-uses the regex patterns from
scripts/dedupe-mathml-and-katex-render-pairs-keep-mathml.py and asserts that
no chapter HTML still contains a duplicate inline or block render pair.
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
chapter_files = helpers.chapter_files

DUP_FORWARD = re.compile(
    r'<span class="mathml-inline">.*?</math>\s*</span>'
    r'[^<]{0,30}<span class="math-tex">\\\([^)]+\\\)</span>',
    re.DOTALL,
)
DUP_REVERSE = re.compile(
    r'<span class="math-tex">\\\([^)]+\\\)</span>'
    r'[^<]{0,30}<span class="mathml-inline">.*?</math>\s*</span>',
    re.DOTALL,
)
DUP_BLOCK_FORWARD = re.compile(
    r'<div class="mathml-block">.*?</math>\s*</div>\s*'
    r'<span class="math-tex">\\\[[^\]]+\\\]</span>',
    re.DOTALL,
)
DUP_BLOCK_REVERSE = re.compile(
    r'<span class="math-tex">\\\[[^\]]+\\\]</span>\s*'
    r'<div class="mathml-block">.*?</math>\s*</div>',
    re.DOTALL,
)


def main():
    proj = project_root()
    total = 0
    per_file = []
    for f in chapter_files():
        html = f.read_text(encoding='utf-8')
        n = (
            len(DUP_FORWARD.findall(html))
            + len(DUP_REVERSE.findall(html))
            + len(DUP_BLOCK_FORWARD.findall(html))
            + len(DUP_BLOCK_REVERSE.findall(html))
        )
        if n:
            per_file.append((str(f.relative_to(proj)).replace('\\', '/'), n))
            total += n

    if total:
        print(f'FAIL: {total} duplicate pair(s) remain')
        for p, n in per_file:
            print(f'  {p}: {n}')
        sys.exit(1)
    print('PASS: 0 duplicate pairs in HTML (Front A verified)')
    sys.exit(0)


if __name__ == '__main__':
    main()
