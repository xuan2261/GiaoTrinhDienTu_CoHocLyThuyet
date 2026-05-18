"""Verify tools/bundle_pages.py reads chapters/ directly without cache (F1.4).

Heuristic scan for cache-related symbols (pickle, sqlite3, lru_cache, etc.).
If any are found inside bundle_pages.py we exit 1 so Phase 01 can document.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / 'tools' / 'bundle_pages.py'


def main():
    if not BUNDLE.exists():
        print(f'WARN: {BUNDLE} missing; skip')
        sys.exit(0)
    src = BUNDLE.read_text(encoding='utf-8')
    red_flags = [
        (r'\.cache\b', 'cache attribute found'),
        (r'\bpickle\.', 'pickle import'),
        (r'\bsqlite3\.', 'sqlite cache'),
        (r'@functools\.lru_cache', 'lru_cache decorator'),
        (r'CACHE_DIR', 'cache dir constant'),
    ]
    found = [(p, msg) for p, msg in red_flags if re.search(p, src)]
    if found:
        print('WARN: bundle_pages.py may have cache layer:')
        for p, msg in found:
            print(f'  - {msg}')
        sys.exit(1)
    print('OK: bundle_pages.py reads source directly, no cache layer')
    sys.exit(0)


if __name__ == '__main__':
    main()
