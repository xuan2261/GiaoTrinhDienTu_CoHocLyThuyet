"""Phase 04 assertions: equations CSS rules consistent + KaTeX outputs htmlAndMathml.

Verifies that:
  1. css/equations-...css exists and contains font-sync rules for both <math>
     and KaTeX (.math-tex, .math-tex-block) plus figure/figcaption styling.
  2. The KaTeX renderMathInElement call (in js/loader.js or index.html) is
     configured with output: 'htmlAndMathml' so screen readers can access the
     MathML representation (red-team F3.2).
  3. The CSS file stays under 80 lines (KISS budget).
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

REQUIRED_CSS_TOKENS = [
    'math',
    '.math-tex',
    '.math-tex-block',
    '.mathml-inline',
    '.mathml-block',
    'Cambria Math',
    'KaTeX_Main',
    'figure',
    'figcaption',
]

CSS_CANDIDATES = [
    'css/equations-and-figure-styling-mathml-katex-font-sync-figure-figcaption.css',
    'css/style.css',
]


def main():
    proj = project_root()
    failures = []

    css = ''
    css_path = None
    for rel in CSS_CANDIDATES:
        p = proj / rel
        if p.exists():
            css = p.read_text(encoding='utf-8')
            if 'KaTeX_Main' in css and '.math-tex' in css:
                css_path = p
                break

    if not css_path:
        failures.append('No equations CSS found containing required font-sync rules')
    else:
        for token in REQUIRED_CSS_TOKENS:
            if token not in css:
                failures.append(f'CSS missing token: {token!r}')
        line_count = css.count('\n')
        if line_count > 80:
            failures.append(f'CSS exceeds 80-line KISS budget: {line_count} lines')

    # KaTeX renderMathInElement must use output: 'htmlAndMathml'
    js_loader = (proj / 'js/loader.js').read_text(encoding='utf-8')
    if 'renderMathInElement' in js_loader and 'htmlAndMathml' not in js_loader:
        failures.append(
            "js/loader.js: KaTeX renderMathInElement missing output: 'htmlAndMathml'"
        )

    if failures:
        for f in failures:
            print(f'FAIL: {f}')
        sys.exit(1)
    print(
        'PASS: equations CSS rules consistent (under 80 lines), '
        "KaTeX configured with output: 'htmlAndMathml'."
    )
    sys.exit(0)


if __name__ == '__main__':
    main()
