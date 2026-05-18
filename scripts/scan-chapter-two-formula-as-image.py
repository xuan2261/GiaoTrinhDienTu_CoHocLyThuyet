#!/usr/bin/env python3
"""Scan ch2 HTML files for formula-as-image issues."""
import json
import re
import os
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')

    with open('data/equation_mapping.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    ch2_map = {}
    for item in data:
        for ex in item.get('examples', []):
            output = ex.get('output', '')
            if 'ch2' in output:
                ch2_map[output] = {
                    'hash': item['hash'][:16],
                    'latex': item.get('latex', '').strip(),
                    'kind': ex.get('kind', ''),
                    'text_context': ex.get('text_context', '')[:120]
                }

    ch2_dir = 'chapters/ch2'
    files = sorted([f for f in os.listdir(ch2_dir) if f.endswith('.html')])

    total_formula_images = 0
    total_ok_images = 0
    total_unknown_images = 0
    all_results = []

    for fname in files:
        fpath = os.path.join(ch2_dir, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        img_pattern = r'<img[^>]*?src=["\']([^"\']+)["\'][^>]*?>'
        img_tags = re.findall(img_pattern, content, re.DOTALL)

        img_alt_pattern = r'<img[^>]*?(?:src=["\']([^"\']+)["\'][^>]*?alt=["\']([^"\']*?)["\']|alt=["\']([^"\']*?)["\'][^>]*?src=["\']([^"\']+)["\'])[^>]*?>'
        alt_map = {}
        for m in re.finditer(img_alt_pattern, content, re.DOTALL):
            src = m.group(1) or m.group(4)
            alt = m.group(2) or m.group(3) or ''
            alt_map[src] = alt

        total_imgs = len(img_tags)
        formula_imgs = []
        ok_imgs = []
        unknown_imgs = []

        for img_src in img_tags:
            norm = img_src.replace('\\', '/')
            if norm in ch2_map:
                entry = ch2_map[norm]
                if not entry['latex']:
                    formula_imgs.append((img_src, entry))
                else:
                    ok_imgs.append((img_src, entry))
            else:
                alt = alt_map.get(img_src, '')
                is_likely_formula = any(kw in img_src.lower() for kw in ['hinh-', 'equation', 'formula', 'math'])
                unknown_imgs.append((img_src, alt, is_likely_formula))

        total_formula_images += len(formula_imgs)
        total_ok_images += len(ok_imgs)
        total_unknown_images += len(unknown_imgs)

        result = {
            'file': fname,
            'total_images': total_imgs,
            'confirmed_formula_no_latex': len(formula_imgs),
            'confirmed_has_latex': len(ok_imgs),
            'not_in_mapping': len(unknown_imgs),
            'formula_details': [],
            'unknown_details': []
        }

        for src, entry in formula_imgs:
            result['formula_details'].append({
                'src': src,
                'kind': entry['kind'],
                'context': entry['text_context']
            })

        for src, alt, is_likely in unknown_imgs:
            result['unknown_details'].append({
                'src': src,
                'alt': alt,
                'likely_formula': is_likely
            })

        all_results.append(result)

    print("=" * 80)
    print("CHAPTER 2 FORMULA-AS-IMAGE AUDIT REPORT")
    print("=" * 80)
    print(f"\nTotal files scanned: {len(files)}")
    print(f"Total confirmed formula-as-image (empty latex): {total_formula_images}")
    print(f"Total images with latex (OK): {total_ok_images}")
    print(f"Total images not in mapping: {total_unknown_images}")

    for r in all_results:
        if r['total_images'] == 0:
            continue
        print(f"\n{'=' * 70}")
        print(f"FILE: {r['file']}")
        print(f"  Total images: {r['total_images']}")
        print(f"  Confirmed formula-as-image (no latex): {r['confirmed_formula_no_latex']}")
        print(f"  Has latex (OK): {r['confirmed_has_latex']}")
        print(f"  Not in mapping: {r['not_in_mapping']}")

        if r['formula_details']:
            print(f"\n  --- CONFIRMED FORMULA-AS-IMAGE ISSUES ---")
            for i, fd in enumerate(r['formula_details'], 1):
                print(f"  [{i}] {fd['src']}")
                print(f"      kind={fd['kind']}")
                print(f"      context: {fd['context'][:100]}")

        if r['unknown_details']:
            print(f"\n  --- NOT IN EQUATION MAPPING ---")
            for i, ud in enumerate(r['unknown_details'], 1):
                marker = "(LIKELY FORMULA)" if ud['likely_formula'] else ""
                print(f"  [{i}] {ud['src']} {marker}")
                if ud['alt']:
                    print(f"      alt: {ud['alt'][:80]}")

    print(f"\n{'=' * 80}")
    print("SUMMARY TABLE")
    print(f"{'=' * 80}")
    print(f"{'File':<35} {'Total':>5} {'NoLatex':>8} {'OK':>5} {'Unmapped':>8}")
    print("-" * 65)
    for r in all_results:
        if r['total_images'] == 0:
            continue
        print(f"{r['file']:<35} {r['total_images']:>5} {r['confirmed_formula_no_latex']:>8} {r['confirmed_has_latex']:>5} {r['not_in_mapping']:>8}")

    with open('plans/reports/ch2-formula-audit-details.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\nDetailed JSON saved to plans/reports/ch2-formula-audit-details.json")

if __name__ == '__main__':
    main()
