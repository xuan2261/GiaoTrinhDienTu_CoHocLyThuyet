"""
Comprehensive fix script:
1. Remove broken img-container lines from all HTML files
2. Find pages that show "(Nội dung đang được cập nhật)" - i.e. missing from bundle
3. Report all issues found
"""
import os, re, glob

chapters_dir = r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\chapters'
js_dir = r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js'

# === STEP 1: Remove broken img tags ===
print("=" * 60)
print("STEP 1: Removing broken <img> tags")
print("=" * 60)
fixed_files = []
for f in glob.glob(os.path.join(chapters_dir, '**', '*.html'), recursive=True):
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if '<img' in content:
        lines = content.split('\n')
        new_lines = [l for l in lines if '<img' not in l]
        removed = len(lines) - len(new_lines)
        if removed > 0:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write('\n'.join(new_lines))
            rel = os.path.relpath(f, chapters_dir)
            fixed_files.append(rel)
            print(f'  Fixed: {rel} (-{removed} lines)')

print(f'\nTotal fixed: {len(fixed_files)} files')

# === STEP 2: Check for placeholder/empty content ===
print("\n" + "=" * 60)
print("STEP 2: Checking for placeholder/empty content")
print("=" * 60)

for f in glob.glob(os.path.join(chapters_dir, '**', '*.html'), recursive=True):
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    rel = os.path.relpath(f, chapters_dir)
    size = len(content)
    
    if 'cập nhật' in content.lower() or 'l3-placeholder' in content:
        print(f'  PLACEHOLDER: {rel} ({size} bytes)')
    elif size < 80:
        print(f'  TINY (<80b): {rel} ({size} bytes)')

# === STEP 3: Check pages.js bundle vs PAGE_MAP ===
print("\n" + "=" * 60)
print("STEP 3: Bundle vs PAGE_MAP check")
print("=" * 60)

pages_js = os.path.join(js_dir, 'pages.js')
with open(pages_js, 'r', encoding='utf-8') as fh:
    bundle = fh.read()

bundle_ids = set(re.findall(r"PAGES\['([^']+)'\]", bundle))
print(f'Pages in bundle: {len(bundle_ids)}')

loader_js = os.path.join(js_dir, 'loader.js')
with open(loader_js, 'r', encoding='utf-8') as fh:
    loader = fh.read()

map_entries = re.findall(r"'([^']+)':\s*'(chapters/[^']+)'", loader)
print(f'Pages in PAGE_MAP: {len(map_entries)}')

missing_bundle = []
missing_file = []
for pid, path in map_entries:
    if pid not in bundle_ids:
        missing_bundle.append(pid)
    full = os.path.join(r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet', path)
    if not os.path.exists(full):
        missing_file.append(f'{pid} -> {path}')

if missing_bundle:
    print(f'\nMISSING from bundle ({len(missing_bundle)}):')
    for p in sorted(missing_bundle): print(f'  - {p}')
else:
    print('All pages in bundle ✅')

if missing_file:
    print(f'\nMISSING HTML files ({len(missing_file)}):')
    for p in missing_file: print(f'  - {p}')
else:
    print('All HTML files exist ✅')

print("\nDONE")
