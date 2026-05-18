"""Apply alt text and figcaption to chapter HTML; migrate figure-container -> <figure>.

Reads data/image_alt_overrides.json (built by build-image-alt-overrides-...py
from the DOCX caption parser), then for every <div class="figure-container">
in chapters/**/*.html replaces it with a semantic
<figure><img alt><figcaption></figure> structure. The image hash key is the
SHA1[:12] of the on-disk PNG, which matches what the DOCX caption parser
emitted for each w:drawing.

Modes:
  --check       (default) report planned changes, write nothing
  --apply       write changes
  --backup      write *.bak.{timestamp} alongside modified files
  --idempotent  exit 0 silently if every <figure-container> is already migrated
"""
import argparse
import datetime
import hashlib
import html
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OVERRIDES = ROOT / 'data/image_alt_overrides.json'

# Match either:
#   <div class="figure-container"><img ... ></div>
# or with whitespace variations.
FIGURE_DIV_RE = re.compile(
    r'<div class="figure-container">\s*<img\s+([^>]+?)\s*/?>\s*</div>',
)
ATTR_RE = re.compile(r'(\w+)="([^"]*)"')


def parse_attrs(attr_blob):
    return dict(ATTR_RE.findall(attr_blob))


def sha1_short(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()[:12]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true')
    p.add_argument('--idempotent', action='store_true')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    overrides = {}
    if OVERRIDES.exists():
        for row in json.loads(OVERRIDES.read_text(encoding='utf-8')):
            overrides[row['hash']] = row

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    files_changed = 0
    figures_migrated = 0
    figures_with_caption = 0
    missing_hash = 0

    for html_path in sorted((ROOT / 'chapters').rglob('*.html')):
        original = html_path.read_text(encoding='utf-8')
        new = original
        local_changes = 0

        for m in FIGURE_DIV_RE.finditer(original):
            attrs = parse_attrs(m.group(1))
            src = attrs.get('src', '')
            img_disk = ROOT / src.replace('/', '\\') if '\\' in str(ROOT) else ROOT / src
            try:
                h = sha1_short(img_disk)
            except FileNotFoundError:
                missing_hash += 1
                continue
            override = overrides.get(h, {})
            alt_text = override.get('alt') or attrs.get('alt') or ''
            figcap_text = override.get('figcaption') or ''

            new_attrs = dict(attrs)
            new_attrs['alt'] = alt_text
            attr_str = ' '.join(
                f'{k}="{html.escape(v, quote=True)}"' for k, v in new_attrs.items()
            )
            replacement = f'<figure>\n  <img {attr_str}>'
            if figcap_text:
                replacement += f'\n  <figcaption>{html.escape(figcap_text)}</figcaption>'
                figures_with_caption += 1
            replacement += '\n</figure>'
            new = new.replace(m.group(0), replacement, 1)
            figures_migrated += 1
            local_changes += 1

        if new != original:
            files_changed += 1
            rel = str(html_path.relative_to(ROOT)).replace('\\', '/')
            if args.apply:
                if args.backup:
                    shutil.copy2(html_path, f'{html_path}.bak.{ts}')
                html_path.write_text(new, encoding='utf-8')
                print(f'WRITE {rel}: migrated {local_changes} figure(s)')
            else:
                print(f'WOULD MIGRATE {local_changes} figure(s) in {rel}')

    if args.idempotent and files_changed == 0:
        print('IDEMPOTENT: 0 figure-container migrations needed (already <figure>)')
        return 0
    print(
        f'\nFiles {("changed" if args.apply else "to change")}: {files_changed} | '
        f'figures migrated: {figures_migrated} | with figcaption: '
        f'{figures_with_caption} | missing-img: {missing_hash}'
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
