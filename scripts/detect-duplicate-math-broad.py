#!/usr/bin/env python3
"""Broader scan for duplicate MathML+KaTeX adjacency across all chapters."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding='utf-8')

CHAPTER_DIRS = [ROOT / 'chapters' / c for c in ('ch1', 'ch2', 'ch3')]

DUP_FORWARD = re.compile(
    r'<span class="mathml-inline">.*?</math>\s*</span>(?P<gap>[^<]{0,30})<span class="math-tex">\\\(([^)]+)\\\)</span>',
    re.DOTALL,
)
DUP_REVERSE = re.compile(
    r'<span class="math-tex">\\\(([^)]+)\\\)</span>(?P<gap>[^<]{0,30})<span class="mathml-inline">.*?</math>\s*</span>',
    re.DOTALL,
)
DUP_BLOCK_FORWARD = re.compile(
    r'<div class="mathml-block">.*?</math>\s*</div>\s*<span class="math-tex">\\\[([^\]]+)\\\]</span>',
    re.DOTALL,
)
DUP_BLOCK_REVERSE = re.compile(
    r'<span class="math-tex">\\\[([^\]]+)\\\]</span>\s*<div class="mathml-block">.*?</math>\s*</div>',
    re.DOTALL,
)

results = []
for cdir in CHAPTER_DIRS:
    for f in sorted(cdir.glob('*.html')):
        html = f.read_text(encoding='utf-8')
        n_inline = len(DUP_FORWARD.findall(html)) + len(DUP_REVERSE.findall(html))
        n_block = len(DUP_BLOCK_FORWARD.findall(html)) + len(DUP_BLOCK_REVERSE.findall(html))
        if n_inline or n_block:
            rel = str(f.relative_to(ROOT)).replace('\\', '/')
            results.append((rel, n_inline, n_block))

print(f'Files with duplicate-rendering: {len(results)}')
print(f"{'file':<40} {'inline_pairs':>12} {'block_pairs':>12}")
for r in results:
    print(f'{r[0]:<40} {r[1]:>12} {r[2]:>12}')

total_inline = sum(r[1] for r in results)
total_block = sum(r[2] for r in results)
print(f'\nTotal inline duplicate pairs: {total_inline}')
print(f'Total block duplicate pairs: {total_block}')
print(f'Grand total duplicates: {total_inline + total_block}')
