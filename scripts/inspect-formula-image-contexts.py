#!/usr/bin/env python3
"""Inspect surrounding HTML context for suspect formula-as-image candidates."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding='utf-8')

TARGETS = [
    ('chapters/ch1/muc-III-2.html', 'hinh-037.png'),
    ('chapters/ch1/muc-III-3.html', 'hinh-039.png'),
    ('chapters/ch1/muc-IV-3.html', 'hinh-078.png'),
    ('chapters/ch2/muc-V-3.html', 'hinh-211.png'),
    ('chapters/ch3/muc-V-4.html', 'hinh-136.png'),
    ('chapters/ch3/muc-VII-1.html', 'hinh-240.png'),
    ('chapters/ch3/muc-VII-1.html', 'hinh-241.png'),
    ('chapters/ch3/muc-VII-2.html', 'hinh-266.png'),
    ('chapters/ch3/muc-VII-2.html', 'hinh-283.png'),
    ('chapters/ch3/muc-VII-2.html', 'hinh-289.png'),
]

for fp, needle in TARGETS:
    html = (ROOT / fp).read_text(encoding='utf-8')
    for m in re.finditer(re.escape(needle), html):
        s = max(0, m.start() - 350)
        e = min(len(html), m.end() + 250)
        snippet = html[s:e].replace('\n', ' ').replace('\r', ' ')
        snippet = re.sub(r'\s+', ' ', snippet)
        print('=' * 78)
        print(f'{fp} :: {needle}')
        print(snippet[:700])
        print()
