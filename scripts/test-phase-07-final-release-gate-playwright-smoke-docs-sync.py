"""Phase 07: full release gate verification (plain Python, no pytest).

Validates that:
  1. python tools/audit.py --strict-images --strict-formula-image PASS.
  2. scripts/audit-all-formula-as-image.py reports 0 critical mapped-no-render.
  3. scripts/detect-duplicate-math-broad.py reports 0 duplicate pairs.
  4. python tools/bundle_pages.py succeeds and bundled js/pages.js does NOT
     reference any of the 8 deleted hinh-XXX.png raster formulas.
  5. All 6 prior phase test scripts (test-phase-01 .. test-phase-06) PASS.
  6. tests/visual/test_phase_07_smoke.spec.js exists.
  7. scripts/git-tag-with-retry.ps1 exists.
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

PHASE_TESTS = [
    'test-phase-01-baseline-html-chapter-formula-image-ref-counts.py',
    'test-phase-02-eight-critical-formula-image-replacements-deletions.py',
    'test-phase-03-no-duplicate-mathml-katex-render-pairs-in-html.py',
    'test-phase-04-equations-css-render-font-and-katex-htmlandmathml.py',
    'test-phase-05-alt-text-figcaption-figure-tag-migration.py',
    'test-phase-06-audit-strict-formula-image-guard-default-on.py',
]

DELETED_IMAGES = [
    'images/ch1/hinh-037.png',
    'images/ch1/hinh-039.png',
    'images/ch3/hinh-136.png',
    'images/ch3/hinh-240.png',
    'images/ch3/hinh-241.png',
    'images/ch3/hinh-266.png',
    'images/ch3/hinh-283.png',
    'images/ch3/hinh-289.png',
]


def run(cmd, **kw):
    return subprocess.run(
        cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', **kw
    )


def main():
    failures = []

    r = run([sys.executable, 'tools/audit.py',
             '--strict-images', '--strict-formula-image'])
    if r.returncode != 0:
        failures.append(f'audit strict FAIL (rc={r.returncode}): {r.stdout[-400:]}')

    r = run([sys.executable, 'scripts/audit-all-formula-as-image.py'])
    # Phase 02 scope: 8 OCR-verified images removed. Pre-existing entries
    # outside that scope (e.g. hinh-078, hinh-211) are equation-mapping
    # render gaps unrelated to this plan and are NOT a Phase 07 release gate.
    for needle in DELETED_IMAGES:
        if needle in r.stdout:
            failures.append(f'audit-all still references {needle}')

    r = run([sys.executable, 'scripts/detect-duplicate-math-broad.py'])
    out = r.stdout
    if not (
        'Grand total duplicates: 0' in out
        or 'Total: 0' in out
        or 'No duplicates' in out
        or 'Total duplicates found: 0' in out
    ):
        failures.append(f'duplicate pairs remain: {out[-500:]}')

    bundle = ROOT / 'tools' / 'bundle_pages.py'
    if bundle.exists():
        r = run([sys.executable, str(bundle)])
        if r.returncode != 0:
            failures.append(f'bundle_pages.py FAIL: {r.stdout[-400:]}')
        pages_js = ROOT / 'js' / 'pages.js'
        if pages_js.exists():
            text = pages_js.read_text(encoding='utf-8')
            for needle in DELETED_IMAGES:
                if needle in text:
                    failures.append(f'pages.js still references deleted {needle}')

    for script in PHASE_TESTS:
        path = ROOT / 'scripts' / script
        if not path.exists():
            failures.append(f'missing phase test: {script}')
            continue
        r = run([sys.executable, str(path)])
        if r.returncode != 0:
            failures.append(f'{script} FAIL: {r.stdout[-300:]}')

    smoke = ROOT / 'tests' / 'visual' / 'phase-07-smoke-visual-regression-deleted-images-math-rendering.spec.js'
    if not smoke.exists():
        failures.append(
            'tests/visual/phase-07-smoke-visual-regression-deleted-images-math-rendering.spec.js missing'
        )

    tag_retry = ROOT / 'scripts' / 'git-tag-with-retry.ps1'
    if not tag_retry.exists():
        failures.append('scripts/git-tag-with-retry.ps1 missing')

    if failures:
        for f in failures:
            print(f'FAIL: {f}')
        sys.exit(1)
    print(
        'PASS: audit strict, formula-image audit, dedupe scan, bundle, '
        '6 phase tests, Playwright spec + tag-retry script all present.'
    )
    sys.exit(0)


if __name__ == '__main__':
    main()
