"""Phase 03 Front B: re-extract pipeline does not regenerate duplicates.

Verifies the auto-fix post-processor wiring in tools/extract_docx.py and that
the dedupe script in --check mode reports zero residual pairs (Front A verify).

Plain Python, no pytest. Exit 0 = pass, exit 1 = fail.
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
EXTRACT = ROOT / 'tools' / 'extract_docx.py'
DEDUPE = ROOT / 'scripts' / 'dedupe-mathml-and-katex-render-pairs-keep-mathml.py'


def fail(msg: str) -> None:
    print(f'FAIL: {msg}')
    sys.exit(1)


def main() -> None:
    if not EXTRACT.exists():
        fail(f'extract_docx.py missing: {EXTRACT}')
    if not DEDUPE.exists():
        fail(f'dedupe script missing: {DEDUPE}')

    src = EXTRACT.read_text(encoding='utf-8')
    if '--auto-fix-known-issues' not in src:
        fail('extract_docx.py missing --auto-fix-known-issues flag (Front B wiring)')
    if 'def _run_auto_fix_known_issues' not in src:
        fail('extract_docx.py missing _run_auto_fix_known_issues() helper')
    if 'dedupe-mathml-and-katex-render-pairs-keep-mathml.py' not in src:
        fail('extract_docx.py auto-fix list missing dedupe script entry')
    if not re.search(r"['\"]--idempotent['\"]", src):
        fail('extract_docx.py auto-fix not invoking scripts in --idempotent mode')

    r = subprocess.run(
        [sys.executable, str(DEDUPE), '--check'],
        cwd=ROOT, capture_output=True, text=True, encoding='utf-8',
    )
    if r.returncode != 0:
        fail(f'dedupe --check exited {r.returncode}: {(r.stderr or "")[:200]}')
    out = (r.stdout or '').strip()
    if not re.search(r'Files to change:\s*0', out):
        fail(f'dedupe --check expected "Files to change: 0", got: {out!r}')
    m = re.search(r'total pairs:\s*(\d+)', out)
    if not m:
        fail(f'dedupe --check unexpected output: {out!r}')
    pairs = int(m.group(1))
    if pairs != 0:
        fail(f'dedupe --check still reports {pairs} pairs; Front A not idempotent yet')

    print('PASS: Front B wired (--auto-fix-known-issues + dedupe --idempotent), Front A reports 0 pairs.')
    sys.exit(0)


if __name__ == '__main__':
    main()
