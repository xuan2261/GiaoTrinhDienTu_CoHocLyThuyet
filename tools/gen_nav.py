"""
Generate updated sidebar HTML and PAGE_MAP/PAGE_ORDER from extracted chapter files.
"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

BASE = r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\chapters'

# Scan actual files and build structure
ROMAN_TO_NUM = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10}

def get_section_title_from_file(filepath):
    """Extract title from fragment's <h2> or <div class=l3-title>"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read(2000)
        # Look for h2
        m = re.search(r'<h2>([^<]+)</h2>', content)
        if m: return m.group(1).strip()
        # Look for l3-title
        m = re.search(r'class="l3-title">([^<]+)<', content)
        if m: return m.group(1).strip()
    except:
        pass
    return None

chapters = {}  # ch_num -> {sections: {roman -> {title, subs: {num -> title}}}}

for ch_num in [1, 2, 3]:
    ch_dir = os.path.join(BASE, f'ch{ch_num}')
    if not os.path.exists(ch_dir):
        continue
    
    files = sorted(os.listdir(ch_dir))
    sections = {}
    
    for f in files:
        if f == 'index.html': continue
        m = re.match(r'muc-([IVXLC]+)\.html', f)
        if m:
            roman = m.group(1)
            title = get_section_title_from_file(os.path.join(ch_dir, f))
            sections.setdefault(roman, {'title': title or roman, 'subs': {}})
            continue
        
        m = re.match(r'muc-([IVXLC]+)-(\d+)\.html', f)
        if m:
            roman = m.group(1)
            sub_num = int(m.group(2))
            title = get_section_title_from_file(os.path.join(ch_dir, f))
            sections.setdefault(roman, {'title': roman, 'subs': {}})
            sections[roman]['subs'][sub_num] = title or f'{sub_num}.'
    
    chapters[ch_num] = sections

# Print summary
for ch_num, secs in chapters.items():
    print(f"\n=== CHƯƠNG {ch_num} ===")
    for roman in sorted(secs.keys(), key=lambda r: ROMAN_TO_NUM.get(r, 99)):
        sec = secs[roman]
        num = ROMAN_TO_NUM.get(roman, 0)
        print(f"  {roman}. {sec['title']}")
        for sub_num in sorted(sec['subs'].keys()):
            print(f"    {sub_num}. {sec['subs'][sub_num]}")

# ====================================================================
# Generate PAGE_MAP for loader.js
# ====================================================================
print("\n\n// ===== PAGE_MAP =====")
print("const PAGE_MAP = {")
print("  'home': null,")
print("  'lnd': 'chapters/loi-noi-dau.html',")
print("  'authors': 'chapters/tac-gia.html',")
print("  'refs': 'chapters/tai-lieu-tham-khao.html',")

for ch_num in [1, 2, 3]:
    secs = chapters.get(ch_num, {})
    print(f"\n  // Chapter {ch_num}")
    print(f"  'ch{ch_num}': 'chapters/ch{ch_num}/index.html',")
    
    for roman in sorted(secs.keys(), key=lambda r: ROMAN_TO_NUM.get(r, 99)):
        num = ROMAN_TO_NUM[roman]
        print(f"  'ch{ch_num}-{num}': 'chapters/ch{ch_num}/muc-{roman}.html',")
        for sub_num in sorted(secs[roman]['subs'].keys()):
            print(f"  'ch{ch_num}-{num}-{sub_num}': 'chapters/ch{ch_num}/muc-{roman}-{sub_num}.html',")

print("};")

# ====================================================================
# Generate PAGE_ORDER
# ====================================================================
print("\n\n// ===== PAGE_ORDER =====")
order = ["'home'", "'lnd'"]

for ch_num in [1, 2, 3]:
    secs = chapters.get(ch_num, {})
    order.append(f"'ch{ch_num}'")
    for roman in sorted(secs.keys(), key=lambda r: ROMAN_TO_NUM.get(r, 99)):
        num = ROMAN_TO_NUM[roman]
        order.append(f"'ch{ch_num}-{num}'")
        for sub_num in sorted(secs[roman]['subs'].keys()):
            order.append(f"'ch{ch_num}-{num}-{sub_num}'")
    order.append(f"'ch{ch_num}-rev'")
    order.append(f"'ch{ch_num}-quiz'")

order.extend(["'authors'", "'refs'"])
print(f"const PAGE_ORDER = [\n  {', '.join(order)}\n];")
