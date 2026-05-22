"""Apply alt text and figcaption to chapter HTML; migrate figure-container -> <figure>.

Reads data/image_alt_overrides.json (built by build-image-alt-overrides-...py
from the DOCX caption parser), then for every <div class="figure-container">
in chapters/**/*.html replaces it with a semantic
<figure><img alt><figcaption></figure> structure. The image hash key is the
SHA1[:12] of the on-disk PNG, which matches what the DOCX caption parser
emitted for each w:drawing.

The extractor also keeps DOCX paragraphs whose style is Caption. Once a
semantic figcaption exists, those immediately adjacent caption paragraphs are
duplicate visible captions and are removed in the same idempotent pass.

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
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OVERRIDES = ROOT / 'data/image_alt_overrides.json'

# Match either:
#   <div class="figure-container"><img ... ></div>
# or with whitespace variations.
FIGURE_DIV_RE = re.compile(
    r'<div class="figure-container">\s*<img\s+([^>]+?)\s*/?>\s*</div>',
)
FIGCAP_RE = re.compile(r'(<figcaption[^>]*>)(.*?)(</figcaption>)', re.DOTALL | re.IGNORECASE)
FIGURE_BLOCK_RE = re.compile(r'<figure[^>]*>.*?</figure>', re.DOTALL | re.IGNORECASE)
IMG_TAG_RE = re.compile(r'<img\b[^>]*>', re.DOTALL | re.IGNORECASE)
CAPTION_P_AT_RE = re.compile(
    r'\s*(<p\b[^>]*\bclass=["\'][^"\']*\bcaption\b[^"\']*["\'][^>]*>.*?</p>'
    r'|<p\b[^>]*>\s*<strong>\s*Hình\b.*?</p>)',
    re.DOTALL | re.IGNORECASE,
)
ATTR_RE = re.compile(r'(\w+)="([^"]*)"')
FIGURE_NUMBER_RE = re.compile(r'\bHình\s+\d+(?:\.\d+)+', re.IGNORECASE)
GENERIC_FIGCAP_PREFIX = 'Hình minh họa - '


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)

    def text(self):
        return ''.join(self.parts)


def parse_attrs(attr_blob):
    return dict(ATTR_RE.findall(attr_blob))


def sha1_short(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()[:12]


def html_text(fragment):
    parser = TextExtractor()
    parser.feed(fragment)
    return re.sub(r'\s+', ' ', parser.text()).strip()


def normalize_caption_text(value):
    value = value.replace('\xa0', ' ')
    value = re.sub(r'\s+', ' ', value).strip()
    value = re.sub(r'\s+([.,:;])', r'\1', value)
    return value


def merge_numbered_caption(figcaption_text, caption_text):
    figcaption_text = normalize_caption_text(figcaption_text)
    caption_text = normalize_caption_text(caption_text)
    if not caption_text:
        return None
    if figcaption_text == caption_text:
        return figcaption_text
    if caption_text in figcaption_text:
        return figcaption_text
    if figcaption_text in caption_text:
        return caption_text

    caption_number_match = FIGURE_NUMBER_RE.search(caption_text)
    if not caption_number_match:
        return None
    caption_number = caption_number_match.group(0)
    figcaption_number_match = FIGURE_NUMBER_RE.search(figcaption_text)
    if figcaption_number_match:
        figcaption_number = figcaption_number_match.group(0)
        if figcaption_number != caption_number:
            return None
        return figcaption_text

    if caption_number in figcaption_text:
        return figcaption_text

    if figcaption_text.startswith(GENERIC_FIGCAP_PREFIX):
        title = figcaption_text[len(GENERIC_FIGCAP_PREFIX):].strip()
        return f'{caption_number} - {title}' if title else caption_number
    return f'{caption_number} - {figcaption_text}'


def remove_duplicate_caption_paragraphs(content):
    parts = []
    last_end = 0
    removed = 0

    for match in FIGURE_BLOCK_RE.finditer(content):
        caption_match = CAPTION_P_AT_RE.match(content, match.end())
        if not caption_match:
            continue
        figure_html = match.group(0)
        figcap_match = FIGCAP_RE.search(figure_html)
        if not figcap_match:
            continue
        figcaption_text = html_text(figcap_match.group(2))
        caption_text = html_text(caption_match.group(1))
        merged = merge_numbered_caption(figcaption_text, caption_text)
        if not merged:
            continue
        parts.append(content[last_end:match.start()])
        if normalize_caption_text(merged) != normalize_caption_text(figcaption_text):
            figure_html = FIGCAP_RE.sub(
                lambda cap: cap.group(1) + html.escape(merged) + cap.group(3),
                figure_html,
                count=1,
            )
        parts.append(figure_html)
        last_end = caption_match.end()
        removed += 1

    if not removed:
        return content, 0
    parts.append(content[last_end:])
    return ''.join(parts), removed


def figure_caption_parts(figure_html):
    figcap_match = FIGCAP_RE.search(figure_html)
    if not figcap_match:
        return '', ''
    return html_text(figcap_match.group(2)), figcap_match.group(2).strip()


def merge_consecutive_duplicate_figures(content):
    matches = list(FIGURE_BLOCK_RE.finditer(content))
    if not matches:
        return content, 0

    parts = []
    last_end = 0
    merged_groups = 0
    index = 0

    while index < len(matches):
        current = matches[index]
        caption_text, caption_html = figure_caption_parts(current.group(0))
        group = [current]
        next_index = index + 1

        while caption_text and next_index < len(matches):
            next_match = matches[next_index]
            if content[group[-1].end():next_match.start()].strip():
                break
            next_caption_text, _ = figure_caption_parts(next_match.group(0))
            if normalize_caption_text(next_caption_text) != normalize_caption_text(caption_text):
                break
            group.append(next_match)
            next_index += 1

        if len(group) == 1:
            index += 1
            continue

        image_tags = []
        for figure_match in group:
            image_tags.extend(IMG_TAG_RE.findall(figure_match.group(0)))
        if not image_tags:
            index = next_index
            continue

        parts.append(content[last_end:group[0].start()])
        replacement = '<figure>\n'
        replacement += '\n'.join(f'  {tag}' for tag in image_tags)
        replacement += f'\n  <figcaption>{caption_html}</figcaption>\n</figure>'
        parts.append(replacement)
        last_end = group[-1].end()
        merged_groups += len(group) - 1
        index = next_index

    if not merged_groups:
        return content, 0
    parts.append(content[last_end:])
    return ''.join(parts), merged_groups


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
    duplicate_captions_removed = 0
    duplicate_figures_merged = 0
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

        new, removed = remove_duplicate_caption_paragraphs(new)
        if removed:
            duplicate_captions_removed += removed
            local_changes += removed

        new, merged = merge_consecutive_duplicate_figures(new)
        if merged:
            duplicate_figures_merged += merged
            local_changes += merged

        if new != original:
            files_changed += 1
            rel = str(html_path.relative_to(ROOT)).replace('\\', '/')
            if args.apply:
                if args.backup:
                    shutil.copy2(html_path, f'{html_path}.bak.{ts}')
                html_path.write_text(new, encoding='utf-8')
                print(f'WRITE {rel}: {local_changes} figure/caption change(s)')
            else:
                print(f'WOULD UPDATE {local_changes} figure/caption change(s) in {rel}')

    if args.idempotent and files_changed == 0:
        print('IDEMPOTENT: 0 figure/caption changes needed')
        return 0
    print(
        f'\nFiles {("changed" if args.apply else "to change")}: {files_changed} | '
        f'figures migrated: {figures_migrated} | with figcaption: '
        f'{figures_with_caption} | duplicate captions removed: '
        f'{duplicate_captions_removed} | duplicate figures merged: '
        f'{duplicate_figures_merged} | missing-img: {missing_hash}'
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
