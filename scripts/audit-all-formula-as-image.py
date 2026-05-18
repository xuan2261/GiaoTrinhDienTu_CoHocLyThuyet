#!/usr/bin/env python3
"""Comprehensive audit: find all formula-as-image issues across ch1/ch2/ch3 + special files."""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
sys.stdout.reconfigure(encoding='utf-8')


def load_equation_mapping():
    with open('data/equation_mapping.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    img_to_entry = {}
    for item in data:
        for ex in item.get('examples', []) or []:
            out = (ex.get('output') or '').replace('\\', '/').strip()
            if out and out.startswith('images/'):
                img_to_entry[out] = {
                    'has_latex': bool((item.get('latex') or '').strip()),
                    'has_mathml': bool((item.get('mathml') or '').strip()),
                    'kind': ex.get('kind', ''),
                    'context': (ex.get('text_context') or '')[:120],
                    'hash': item.get('hash', '')[:16],
                }
    return img_to_entry


IMG_RE = re.compile(r'<img\b[^>]*>', re.IGNORECASE | re.DOTALL)
SRC_RE = re.compile(r'src=["\']([^"\']+)["\']', re.IGNORECASE)
ALT_RE = re.compile(r'alt=["\']([^"\']*)["\']', re.IGNORECASE)
WIDTH_RE = re.compile(r'\bwidth=["\']?(\d+)', re.IGNORECASE)
CLASS_RE = re.compile(r'class=["\']([^"\']*)["\']', re.IGNORECASE)


def scan_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    results = []
    for m in IMG_RE.finditer(html):
        tag = m.group(0)
        s = SRC_RE.search(tag)
        if not s:
            continue
        src = s.group(1).replace('\\', '/')
        alt_m = ALT_RE.search(tag)
        alt = alt_m.group(1) if alt_m else ''
        w_m = WIDTH_RE.search(tag)
        width = int(w_m.group(1)) if w_m else None
        class_m = CLASS_RE.search(tag)
        klass = class_m.group(1) if class_m else ''

        start = m.start()
        # Look back for figure-container in last 500 chars
        preceding = html[max(0, start - 600):start]
        in_figure = ('figure-container' in preceding[-500:]) or 'figure-container' in tag
        # check if next 200 chars include figcaption to support figure context
        following = html[m.end():m.end() + 400]
        has_figcaption = 'figcaption' in following
        results.append({
            'src': src,
            'alt': alt,
            'width': width,
            'class': klass,
            'in_figure': in_figure,
            'has_figcaption': has_figcaption,
            'tag': tag[:200],
        })
    return results


def find_duplicates(filepath):
    """Detect MathML and KaTeX rendering close to each other (duplicate)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    # look for adjacent MathML <math>...</math> followed by .math-tex \\(...\\) within ~200 chars
    duplicates = 0
    has_mathml = '<math' in html
    has_katex_inline = re.search(r'\\\\\([^)]+\\\\\)', html) is not None or 'class="math-tex"' in html
    has_katex_display = '\\[' in html and '\\]' in html

    # crude duplicate detection: two consecutive math representations of same content
    # find pattern: <math>...</math>...<span class="math-tex">\(...\)</span>
    pattern = re.compile(r'<math\b[^>]*>(.*?)</math>\s*[^<]{0,80}<(?:span|div)[^>]*class=["\'][^"\']*math-tex', re.DOTALL | re.IGNORECASE)
    duplicates = len(pattern.findall(html))
    # also look for $$...$$ <math>...</math>
    pattern2 = re.compile(r'\$\$[^$]+\$\$\s*[^<]{0,80}<math', re.IGNORECASE)
    duplicates += len(pattern2.findall(html))
    return {
        'has_mathml': has_mathml,
        'has_katex_inline': has_katex_inline,
        'has_katex_display': has_katex_display,
        'duplicates_near': duplicates,
    }


def main():
    img_map = load_equation_mapping()
    print(f'Equation mapping entries with image output: {len(img_map)}')

    chapters = ['ch1', 'ch2', 'ch3']
    summary = {
        'per_chapter': {},
        'critical_formula_images': [],
        'inline_no_figure': [],
        'tiny_images': [],
        'unmapped_images': [],
        'mapped_no_render': [],  # has entry but no latex AND no mathml
        'mapped_no_latex_only': [],  # has mathml but no latex (OK case but listed)
        'duplicate_files': [],
        'mixed_render_files': [],
        'generic_alt_count': 0,
        'all_imgs_total': 0,
        'no_alt_count': 0,
        'no_figcaption_count': 0,
    }

    chapter_files = []
    for chap in chapters:
        cdir = Path('chapters') / chap
        files = sorted(p for p in cdir.iterdir() if p.suffix == '.html')
        chapter_files.append((chap, files))
    # Also include special root files
    extra_files = []
    for fname in ['loi-noi-dau.html', 'tac-gia.html', 'tai-lieu-tham-khao.html']:
        p = Path('chapters') / fname
        if p.exists():
            extra_files.append(p)

    for chap, files in chapter_files:
        per = {'total_imgs': 0, 'critical': 0, 'inline': 0, 'tiny': 0,
               'unmapped': 0, 'mapped_no_render': 0,
               'duplicate_count': 0, 'mixed_files': 0,
               'generic_alt': 0, 'no_alt': 0, 'no_figcaption': 0}
        for f in files:
            imgs = scan_html(f)
            dup = find_duplicates(f)
            per['total_imgs'] += len(imgs)
            mixed = dup['has_mathml'] and (dup['has_katex_inline'] or dup['has_katex_display'])
            if mixed:
                per['mixed_files'] += 1
                summary['mixed_render_files'].append(f'{chap}/{f.name}')
            if dup['duplicates_near']:
                per['duplicate_count'] += dup['duplicates_near']
                summary['duplicate_files'].append((f'{chap}/{f.name}', dup['duplicates_near']))
            for img in imgs:
                summary['all_imgs_total'] += 1
                src = img['src']
                alt = img['alt']
                fsize = None
                # resolve image file size
                cand = ['', src]
                for prefix in ['', 'chapters/', f'chapters/{chap}/']:
                    p_try = Path(prefix + src)
                    if p_try.is_file():
                        fsize = p_try.stat().st_size
                        break
                # generic alt detection
                generic = bool(re.match(r'^\s*Hình minh họa chương', alt))
                if generic:
                    per['generic_alt'] += 1
                    summary['generic_alt_count'] += 1
                if not alt.strip():
                    per['no_alt'] += 1
                    summary['no_alt_count'] += 1
                if not img['has_figcaption'] and img['in_figure']:
                    per['no_figcaption'] += 1
                    summary['no_figcaption_count'] += 1
                # Check mapping
                entry = img_map.get(src)
                row = {
                    'chapter': chap,
                    'file': f.name,
                    'src': src,
                    'alt': alt,
                    'size': fsize,
                    'in_figure': img['in_figure'],
                    'width': img['width'],
                }
                if entry:
                    row['kind'] = entry['kind']
                    row['has_latex'] = entry['has_latex']
                    row['has_mathml'] = entry['has_mathml']
                    row['ctx'] = entry['context']
                    if not entry['has_latex'] and not entry['has_mathml']:
                        per['critical'] += 1
                        summary['mapped_no_render'].append(row)
                        summary['critical_formula_images'].append(row)
                else:
                    # unmapped suspicious if small AND inline OR very tiny
                    per['unmapped'] += 1
                    summary['unmapped_images'].append(row)
                if not img['in_figure']:
                    per['inline'] += 1
                    summary['inline_no_figure'].append(row)
                if fsize and fsize < 2000:
                    per['tiny'] += 1
                    summary['tiny_images'].append(row)
        summary['per_chapter'][chap] = per

    # Save artifact
    Path('plans/reports').mkdir(parents=True, exist_ok=True)
    with open('plans/reports/formula-as-image-comprehensive-audit.json', 'w', encoding='utf-8') as out:
        json.dump(summary, out, ensure_ascii=False, indent=2)

    print('\n=== PER-CHAPTER SUMMARY ===')
    for chap, per in summary['per_chapter'].items():
        print(f"{chap}: {per}")

    print(f"\nGrand total imgs: {summary['all_imgs_total']}")
    print(f"Critical mapped-no-render: {len(summary['mapped_no_render'])}")
    print(f"Inline (not in figure-container): {len(summary['inline_no_figure'])}")
    print(f"Tiny (<2KB): {len(summary['tiny_images'])}")
    print(f"Unmapped images (not in equation_mapping.json): {len(summary['unmapped_images'])}")
    print(f"Generic alt count: {summary['generic_alt_count']}")
    print(f"Mixed render files: {len(set(summary['mixed_render_files']))}")
    print(f"Duplicate near-pairs total: {sum(x[1] for x in summary['duplicate_files'])}")

    print('\n=== CRITICAL FORMULA-AS-IMAGE (mapped but no latex+no mathml) ===')
    for r in summary['mapped_no_render']:
        print(f"  [{r['chapter']}] {r['file']:<25} {r['src']:<40} size={r['size']}B kind={r.get('kind','')}")

    print('\n=== INLINE (not inside figure-container) ===')
    for r in summary['inline_no_figure']:
        print(f"  [{r['chapter']}] {r['file']:<25} {r['src']:<40} size={r['size']}B alt={r['alt'][:30]}")

    print('\n=== TINY <2KB (very likely a tiny formula glyph) ===')
    for r in summary['tiny_images']:
        print(f"  [{r['chapter']}] {r['file']:<25} {r['src']:<40} size={r['size']}B in_figure={r['in_figure']}")

    print('\n=== MIXED-RENDER FILES (both MathML + KaTeX) ===')
    for f in sorted(set(summary['mixed_render_files'])):
        print(f"  {f}")

    print('\n=== DUPLICATE-NEAR (math block rendered twice) ===')
    for f, n in summary['duplicate_files']:
        print(f"  {f}  ×{n}")


if __name__ == '__main__':
    main()
