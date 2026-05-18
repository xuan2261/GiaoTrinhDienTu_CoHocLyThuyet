#!/usr/bin/env python3
"""Classify ch2 images by size, context, and mapping status."""
import json
import re
import os
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')

    with open('data/equation_mapping.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    ch2_images_in_mapping = {}
    for item in data:
        for ex in item.get('examples', []):
            output = ex.get('output', '')
            if 'ch2' in output:
                norm = output.replace('\\', '/')
                ch2_images_in_mapping[norm] = {
                    'has_latex': bool(item.get('latex', '').strip()),
                    'kind': ex.get('kind', ''),
                    'text_context': ex.get('text_context', '')[:100]
                }

    ch2_dir = 'chapters/ch2'
    files = sorted([f for f in os.listdir(ch2_dir) if f.endswith('.html')])

    all_images = []
    for fname in files:
        fpath = os.path.join(ch2_dir, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        for m in re.finditer(r'<img[^>]*?src=["\']([^"\']+)["\'][^>]*?>', content, re.DOTALL):
            src = m.group(1)
            full_tag = m.group(0)

            width_m = re.search(r'width=["\']?(\d+)', full_tag)
            height_m = re.search(r'height=["\']?(\d+)', full_tag)
            width = int(width_m.group(1)) if width_m else None
            height = int(height_m.group(1)) if height_m else None

            start = m.start()
            preceding = content[max(0, start - 800):start]
            in_figure = 'figure-container' in preceding

            alt_m = re.search(r'alt=["\']([^"\']*)["\']', full_tag)
            alt = alt_m.group(1) if alt_m else ''

            img_path = src.replace('\\', '/')
            file_size = None
            abs_path = os.path.join('.', img_path)
            if os.path.exists(abs_path):
                file_size = os.path.getsize(abs_path)

            mapping_info = ch2_images_in_mapping.get(img_path)

            all_images.append({
                'file': fname,
                'src': src,
                'width': width,
                'height': height,
                'alt': alt,
                'in_figure': in_figure,
                'file_size': file_size,
                'in_mapping': mapping_info is not None,
                'mapping_info': mapping_info
            })

    print('TOTAL IMAGES IN CH2:', len(all_images))
    print()

    # By file size
    by_size = {}
    for img in all_images:
        fs = img['file_size']
        if fs is None:
            cat = 'file-not-found'
        elif fs < 2000:
            cat = 'tiny (<2KB)'
        elif fs < 8000:
            cat = 'small (2-8KB)'
        elif fs < 30000:
            cat = 'medium (8-30KB)'
        else:
            cat = 'large (>30KB)'
        by_size.setdefault(cat, []).append(img)

    print('=== BY FILE SIZE ===')
    for cat in ['tiny (<2KB)', 'small (2-8KB)', 'medium (8-30KB)', 'large (>30KB)', 'file-not-found']:
        imgs = by_size.get(cat, [])
        if not imgs:
            continue
        print(f'\n{cat}: {len(imgs)} images')
        for i in imgs:
            mapping_status = ''
            if i['in_mapping']:
                mi = i['mapping_info']
                if mi['has_latex']:
                    mapping_status = ' [MAPPED: has latex, OK]'
                else:
                    mapping_status = ' [MAPPED: NO latex, FORMULA-AS-IMAGE]'
            print(f"  {i['file']:<25} {i['src']:<35} {str(i['file_size'])+'B':>8}  w={str(i['width'] or '?'):>5}  fig={i['in_figure']}  {mapping_status}")

    # By context
    print('\n=== BY CONTEXT ===')
    fig_imgs = [i for i in all_images if i['in_figure']]
    inline_imgs = [i for i in all_images if not i['in_figure']]
    print(f'Inside figure-container: {len(fig_imgs)}')
    print(f'NOT in figure-container (inline): {len(inline_imgs)}')
    if inline_imgs:
        print('  Inline images (likely formulas):')
        for i in inline_imgs:
            print(f"    {i['file']:<25} {i['src']:<35} {str(i['file_size'] or '?')+'B':>8}")

    # Formula-as-image candidates
    print('\n=== FORMULA-AS-IMAGE CANDIDATES ===')
    candidates = []
    for i in all_images:
        is_formula = False
        reason = ''
        if i['in_mapping'] and not i['mapping_info']['has_latex']:
            is_formula = True
            reason = 'mapped-no-latex'
        elif not i['in_figure'] and i['file_size'] and i['file_size'] < 15000:
            is_formula = True
            reason = f"inline-small-{i['file_size']}B"
        elif i['in_figure'] and i['file_size'] and i['file_size'] < 5000:
            is_formula = True
            reason = f"fig-container-but-tiny-{i['file_size']}B"

        if is_formula:
            candidates.append((i, reason))

    print(f'Total candidates: {len(candidates)}')
    for img, reason in candidates:
        print(f"  {img['file']:<25} {img['src']:<35} {str(img['file_size'] or '?')+'B':>8}  reason={reason}")

if __name__ == '__main__':
    main()
