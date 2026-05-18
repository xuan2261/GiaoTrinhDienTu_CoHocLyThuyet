#!/usr/bin/env python3
"""Detect duplicate math rendering: same equation rendered as both MathML and KaTeX."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding='utf-8')

# Files known from the prior report to have suspected duplicates
DUP_CANDIDATES = [
    'chapters/ch1/muc-I-1.html',
    'chapters/ch1/muc-IV-3.html',
    'chapters/ch1/muc-IV-5.html',
    'chapters/ch2/muc-II-2.html',
    'chapters/ch2/muc-V-3.html',
    'chapters/ch3/muc-VI-3.html',
]

def normalize_math(html_chunk):
    txt = re.sub(r'<[^>]+>', ' ', html_chunk)
    txt = re.sub(r'\s+', ' ', txt)
    return txt.strip()

# Pattern: KaTeX inline \\(...\\)
KATEX_INLINE_RE = re.compile(r'\\\(([^()]+?)\\\)')
KATEX_DISPLAY_RE = re.compile(r'\\\[([^\[\]]+?)\\\]')
MATHML_INLINE_RE = re.compile(r'<span class="mathml-inline">\s*<math[^>]*>(.*?)</math>\s*</span>', re.DOTALL)
MATHML_BLOCK_RE = re.compile(r'<div class="mathml-block">\s*<math[^>]*>(.*?)</math>\s*</div>', re.DOTALL)

# Look for sequential pairs (within ~120 chars)
ADJ_PAIR_INLINE = re.compile(
    r'<span class="mathml-inline">\s*<math[^>]*>.*?</math>\s*</span>[^<]{0,150}<span class="math-tex">\\\([^)]+\\\)</span>',
    re.DOTALL,
)
ADJ_PAIR_INLINE_REV = re.compile(
    r'<span class="math-tex">\\\([^)]+\\\)</span>[^<]{0,150}<span class="mathml-inline">\s*<math[^>]*>.*?</math>\s*</span>',
    re.DOTALL,
)
ADJ_PAIR_BLOCK = re.compile(
    r'<div class="mathml-block">\s*<math[^>]*>.*?</math>\s*</div>[\s]{0,200}<span class="math-tex">\\\[[^\[\]]+\\\]</span>',
    re.DOTALL,
)
ADJ_PAIR_BLOCK_REV = re.compile(
    r'<span class="math-tex">\\\[[^\[\]]+\\\]</span>[\s]{0,200}<div class="mathml-block">\s*<math[^>]*>.*?</math>\s*</div>',
    re.DOTALL,
)

for fp in DUP_CANDIDATES:
    p = ROOT / fp
    if not p.exists():
        print(f'MISS {fp}'); continue
    html = p.read_text(encoding='utf-8')
    n_pair_inline = len(ADJ_PAIR_INLINE.findall(html)) + len(ADJ_PAIR_INLINE_REV.findall(html))
    n_pair_block = len(ADJ_PAIR_BLOCK.findall(html)) + len(ADJ_PAIR_BLOCK_REV.findall(html))
    print(f'{fp}: adj_inline_pairs={n_pair_inline}  adj_block_pairs={n_pair_block}')
    if n_pair_inline + n_pair_block:
        for m in ADJ_PAIR_INLINE.finditer(html):
            snippet = re.sub(r'\s+', ' ', html[m.start():m.end()])
            print('  INLINE  pair: ' + snippet[:300])
        for m in ADJ_PAIR_INLINE_REV.finditer(html):
            snippet = re.sub(r'\s+', ' ', html[m.start():m.end()])
            print('  INLINE-REV pair: ' + snippet[:300])
        for m in ADJ_PAIR_BLOCK.finditer(html):
            snippet = re.sub(r'\s+', ' ', html[m.start():m.end()])
            print('  BLOCK pair: ' + snippet[:300])
        for m in ADJ_PAIR_BLOCK_REV.finditer(html):
            snippet = re.sub(r'\s+', ' ', html[m.start():m.end()])
            print('  BLOCK-REV pair: ' + snippet[:300])
