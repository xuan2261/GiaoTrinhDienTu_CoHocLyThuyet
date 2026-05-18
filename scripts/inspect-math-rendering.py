#!/usr/bin/env python3
"""Inspect math-rendering counts per file (MathML, KaTeX, $$, \\(, \\[)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding='utf-8')

FILES = [
    'chapters/ch1/muc-I-1.html', 'chapters/ch1/muc-I-4.html',
    'chapters/ch1/muc-III-2.html', 'chapters/ch1/muc-III-3.html',
    'chapters/ch1/muc-IV-3.html', 'chapters/ch1/muc-IV-5.html',
    'chapters/ch2/muc-I-1.html', 'chapters/ch2/muc-II-2.html',
    'chapters/ch2/muc-V-3.html', 'chapters/ch2/muc-VII-1.html',
    'chapters/ch3/muc-II-2.html', 'chapters/ch3/muc-V-3.html',
    'chapters/ch3/muc-V-4.html', 'chapters/ch3/muc-VI-3.html',
    'chapters/ch3/muc-VII-1.html', 'chapters/ch3/muc-VII-2.html',
]

INLINE_PAREN = re.compile(r'\\\(')
DISPLAY_BRACK = re.compile(r'\\\[')

for fp in FILES:
    p = ROOT / fp
    if not p.exists():
        print(f'MISS {fp}'); continue
    html = p.read_text(encoding='utf-8')
    n_math = len(re.findall(r'<math\b', html))
    n_math_tex_class = len(re.findall(r'class="math-tex"', html))
    n_math_block_class = len(re.findall(r'class="math-block"', html))
    n_paren = len(INLINE_PAREN.findall(html))
    n_brack = len(DISPLAY_BRACK.findall(html))
    n_dollar2 = html.count('$$')
    n_img_in_fig = len(re.findall(r'<div class="figure-container">', html))
    print(f'{fp}')
    print(f'  <math>={n_math}  math-tex={n_math_tex_class}  math-block={n_math_block_class}  \\(={n_paren}  \\[={n_brack}  $$={n_dollar2}  fig-container={n_img_in_fig}')
