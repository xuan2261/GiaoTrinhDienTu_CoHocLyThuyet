"""Second-pass enhancement: fill remaining generic alt + missing figcaption.

After apply-image-alt-text-and-figcaption-...py runs, ~40 figures still carry
the generic 'Hình minh họa chương X' alt (their image hash was NO_MATCH from
the DOCX caption parser) and ~42 figures lack a <figcaption>. This script
takes a second pass: for any figure whose alt is still the generic chapter
placeholder, it derives an alt + figcaption from the nearest preceding section
title — div.l3-title for L3 sections, falling back to the page <h2>. Result is
deterministic, idempotent, and stays under the 120/200 char budgets.

Modes:
  --check       (default) report planned changes, write nothing
  --apply       write changes
  --backup      write *.bak.{timestamp}
  --idempotent  exit 0 silently if no enhancement is needed
"""
import argparse
import datetime
import html
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERIC_ALT_RE = re.compile(
    r'^Hình minh họa chương [123]$', re.UNICODE,
)
FIGURE_RE = re.compile(r'(<figure[^>]*>)(.*?)(</figure>)', re.DOTALL)
IMG_RE = re.compile(r'<img\s+([^>]+?)\s*/?>')
ATTR_RE = re.compile(r'(\w+)="([^"]*)"')
L3_TITLE_RE = re.compile(r'<div class="l3-title">([^<]+)</div>')
H2_RE = re.compile(r'<h2[^>]*>([^<]+)</h2>')


def attrs_to_str(attrs):
    return ' '.join(f'{k}="{html.escape(v, quote=True)}"' for k, v in attrs.items())


def best_section_title(html_text, before_offset):
    """Find nearest preceding l3-title (or h2 fallback) above offset."""
    head = html_text[:before_offset]
    for m in L3_TITLE_RE.finditer(head):
        last = m
    last_l3 = locals().get('last')
    if last_l3:
        return last_l3.group(1).strip()
    h2_match = list(H2_RE.finditer(head))
    if h2_match:
        return h2_match[-1].group(1).strip()
    return ''


def enhance_figure(match, html_text, fig_index_per_file):
    head, body, tail = match.group(1), match.group(2), match.group(3)
    img_match = IMG_RE.search(body)
    if not img_match:
        return match.group(0), False
    attrs = dict(ATTR_RE.findall(img_match.group(1)))
    alt = attrs.get('alt', '')
    has_caption = '<figcaption' in body
    needs_alt = bool(GENERIC_ALT_RE.match(alt) or not alt)
    needs_caption = not has_caption
    if not (needs_alt or needs_caption):
        return match.group(0), False

    title = best_section_title(html_text, match.start())
    if not title:
        title = 'Hình minh họa'
    new_alt = title[:120] if needs_alt else alt
    if needs_alt:
        attrs['alt'] = new_alt

    new_body = body
    if needs_alt:
        new_attrs_str = attrs_to_str(attrs)
        new_body = new_body.replace(
            img_match.group(0),
            f'<img {new_attrs_str}>',
            1,
        )
    if needs_caption:
        figcap = (
            f'\n  <figcaption>Hình minh họa - {html.escape(title)}</figcaption>'
        )
        # Insert figcaption before closing tag
        if new_body.rstrip().endswith('>'):
            new_body = new_body.rstrip() + figcap + '\n'
        else:
            new_body = new_body + figcap + '\n'

    return head + new_body + tail, True


def process_file(path, ts, args):
    original = path.read_text(encoding='utf-8')
    new_parts = []
    last_end = 0
    changed = 0
    for m in FIGURE_RE.finditer(original):
        new_parts.append(original[last_end:m.start()])
        replacement, did = enhance_figure(m, original, None)
        new_parts.append(replacement)
        last_end = m.end()
        if did:
            changed += 1
    new_parts.append(original[last_end:])
    new = ''.join(new_parts)
    if new == original:
        return 0
    if args.apply:
        if args.backup:
            shutil.copy2(path, f'{path}.bak.{ts}')
        path.write_text(new, encoding='utf-8')
    return changed


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
    figs_enhanced = 0
    for path in sorted((ROOT / 'chapters').rglob('*.html')):
        n = process_file(path, ts, args)
        if n:
            files_changed += 1
            figs_enhanced += n
            rel = str(path.relative_to(ROOT)).replace('\\', '/')
            verb = 'WRITE' if args.apply else 'WOULD ENHANCE'
            print(f'{verb} {rel}: {n} figure(s)')

    if args.idempotent and files_changed == 0:
        print('IDEMPOTENT: no enhancement needed')
        return 0
    print(
        f'\n{("Enhanced" if args.apply else "Would enhance")} '
        f'{figs_enhanced} figure(s) across {files_changed} file(s)'
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
