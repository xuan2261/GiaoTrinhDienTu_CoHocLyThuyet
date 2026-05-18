"""Deduplicate MathML+KaTeX render pairs in chapter HTML (Phase 03 Front A).

Targets the 40 inline pairs that render the same equation twice (once as
mathml-inline, once as KaTeX math-tex span). Keeps the MathML and removes the
adjacent KaTeX span — preserves screen-reader semantics (MathML accessible),
matches the dominant rendering used across 645/702 mapping rows.

Modes:
  --check       (default) report planned changes, write nothing
  --apply       write changes
  --backup      write *.bak.{timestamp} alongside modified files
  --idempotent  exit 0 silently if already deduped (used by extract_docx
                post-processor to keep re-extract clean)
"""
import argparse
import datetime
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = sorted((ROOT / 'chapters').rglob('*.html'))

DUP_FORWARD = re.compile(
    r'(<span class="mathml-inline">.*?</math>\s*</span>)'
    r'(?P<gap>[^<]{0,30})'
    r'<span class="math-tex">\\\([^)]+\\\)</span>',
    re.DOTALL,
)
DUP_REVERSE = re.compile(
    r'<span class="math-tex">\\\([^)]+\\\)</span>'
    r'(?P<gap>[^<]{0,30})'
    r'(<span class="mathml-inline">.*?</math>\s*</span>)',
    re.DOTALL,
)
DUP_BLOCK_FORWARD = re.compile(
    r'(<div class="mathml-block">.*?</math>\s*</div>)\s*'
    r'<span class="math-tex">\\\[[^\]]+\\\]</span>',
    re.DOTALL,
)
DUP_BLOCK_REVERSE = re.compile(
    r'<span class="math-tex">\\\[[^\]]+\\\]</span>\s*'
    r'(<div class="mathml-block">.*?</math>\s*</div>)',
    re.DOTALL,
)


def dedupe(html):
    new = DUP_FORWARD.sub(lambda m: m.group(1) + m.group('gap'), html)
    new = DUP_REVERSE.sub(lambda m: m.group('gap') + m.group(1), new)
    new = DUP_BLOCK_FORWARD.sub(lambda m: m.group(1), new)
    new = DUP_BLOCK_REVERSE.sub(lambda m: m.group(1), new)
    return new


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true')
    p.add_argument('--idempotent', action='store_true')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    files_changed = 0
    total_pairs = 0
    for path in TARGETS:
        original = path.read_text(encoding='utf-8')
        new = original
        # Loop to fixed point in case of overlapping matches
        for _ in range(5):
            cand = dedupe(new)
            if cand == new:
                break
            new = cand
        if new == original:
            continue
        # Count removed math-tex span occurrences as a proxy for duplicate pairs
        pairs = original.count('<span class="math-tex">') - new.count('<span class="math-tex">')
        pairs += original.count('<div class="mathml-block">') - new.count('<div class="mathml-block">')
        # Above proxy may double-count; recount via regex differences in DUP_FORWARD/REVERSE on original
        explicit_pairs = (
            len(DUP_FORWARD.findall(original)) + len(DUP_REVERSE.findall(original))
            + len(DUP_BLOCK_FORWARD.findall(original)) + len(DUP_BLOCK_REVERSE.findall(original))
        )
        total_pairs += explicit_pairs
        files_changed += 1
        rel = str(path.relative_to(ROOT)).replace('\\', '/')
        if args.apply:
            if args.backup:
                shutil.copy2(path, f'{path}.bak.{ts}')
            path.write_text(new, encoding='utf-8')
            print(f'WRITE {rel}: removed {explicit_pairs} duplicate pair(s)')
        else:
            print(f'WOULD REMOVE {explicit_pairs} from {rel}')

    if args.idempotent and files_changed == 0:
        print('IDEMPOTENT: 0 duplicate pairs (already clean)')
        return 0
    print(f'\nFiles {("changed" if args.apply else "to change")}: {files_changed} | total pairs: {total_pairs}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
