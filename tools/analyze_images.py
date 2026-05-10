"""
Phase 3: Extract ALL images from DOCX (including EMF) and convert to PNG.
DOCX is just a ZIP file — extract directly from word/media/ folder.
Then map each image to the correct paragraph position.
"""
import sys, os, zipfile, io, re, struct
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

DOCX_PATH = r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\CoHocLyThuyet_Full.docx'
OUTPUT_DIR = r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\images\docx_raw'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Step 1: Extract all images from ZIP
print("=== STEP 1: Extract images from DOCX ZIP ===")
type_counter = Counter()
extracted = []

with zipfile.ZipFile(DOCX_PATH, 'r') as zf:
    for name in zf.namelist():
        if name.startswith('word/media/'):
            basename = os.path.basename(name)
            ext = os.path.splitext(basename)[1].lower()
            type_counter[ext] += 1
            
            # Extract to output dir
            data = zf.read(name)
            out_path = os.path.join(OUTPUT_DIR, basename)
            with open(out_path, 'wb') as f:
                f.write(data)
            extracted.append({'name': basename, 'ext': ext, 'size': len(data), 'path': out_path})

print(f"\nTotal images extracted: {len(extracted)}")
for ext, count in type_counter.most_common():
    total_size = sum(e['size'] for e in extracted if e['ext'] == ext) / 1024 / 1024
    print(f"  {ext:8s}: {count:3d} images ({total_size:.1f} MB)")

# Step 2: For EMF files, check if Pillow can handle them
print("\n=== STEP 2: Test EMF conversion ===")
try:
    from PIL import Image
    has_pillow = True
    print("  Pillow available")
except ImportError:
    has_pillow = False
    print("  Pillow NOT available")

# Check if pyemf or emf2svg is available for conversion
emf_files = [e for e in extracted if e['ext'] == '.emf']
wmf_files = [e for e in extracted if e['ext'] == '.wmf']
png_files = [e for e in extracted if e['ext'] == '.png']
jpeg_files = [e for e in extracted if e['ext'] in ('.jpg', '.jpeg')]

print(f"\n  EMF files: {len(emf_files)}")
print(f"  WMF files: {len(wmf_files)}")
print(f"  PNG files: {len(png_files)}")
print(f"  JPEG files: {len(jpeg_files)}")

# Try converting one EMF with Pillow (may work on Windows)
if emf_files and has_pillow:
    test_emf = emf_files[0]
    try:
        img = Image.open(test_emf['path'])
        test_out = os.path.join(OUTPUT_DIR, 'test_emf.png')
        img.save(test_out, 'PNG')
        print(f"\n  ✓ Pillow EMF→PNG works! ({test_emf['name']} → test_emf.png, {os.path.getsize(test_out)/1024:.1f} KB)")
        print("  Will use Pillow for all EMF conversions")
    except Exception as e:
        print(f"\n  ✗ Pillow EMF→PNG failed: {e}")
        print("  Will try alternative methods")

# Step 3: Parse word/document.xml to map images to paragraphs
print("\n=== STEP 3: Analyze image positions in document ===")
import xml.etree.ElementTree as ET

with zipfile.ZipFile(DOCX_PATH, 'r') as zf:
    doc_xml = zf.read('word/document.xml').decode('utf-8')

# Quick namespace extraction
ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'v': 'urn:schemas-microsoft-com:vml',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
}

root = ET.fromstring(doc_xml)
body = root.find('w:body', ns)

# Count images per paragraph  
para_img_count = 0
total_paras = 0
for para in body.findall('.//w:p', ns):
    total_paras += 1
    # Check for blip (modern images)
    blips = para.findall('.//a:blip', ns)
    # Check for VML images (w:pict/v:imagedata)
    vml_imgs = para.findall('.//v:imagedata', ns)
    if blips or vml_imgs:
        para_img_count += 1

print(f"  Total paragraphs: {total_paras}")
print(f"  Paragraphs with images: {para_img_count}")

# Parse relationship file to map rId → image filenames
with zipfile.ZipFile(DOCX_PATH, 'r') as zf:
    rels_xml = zf.read('word/_rels/document.xml.rels').decode('utf-8')

rels_root = ET.fromstring(rels_xml)
rid_to_file = {}
for rel in rels_root:
    target = rel.get('Target', '')
    rId = rel.get('Id', '')
    if 'media/' in target:
        rid_to_file[rId] = target.replace('media/', '')

print(f"  Image relationships: {len(rid_to_file)}")

# Count how many images are via blip vs VML
blip_imgs = set()
vml_imgs_set = set()
for para in body.findall('.//w:p', ns):
    for blip in para.findall('.//a:blip', ns):
        rId = blip.get(f'{{{ns["r"]}}}embed')
        if rId and rId in rid_to_file:
            blip_imgs.add(rid_to_file[rId])
    for vid in para.findall('.//v:imagedata', ns):
        rId = vid.get(f'{{{ns["r"]}}}id')
        if rId and rId in rid_to_file:
            vml_imgs_set.add(rid_to_file[rId])

print(f"\n  Images via DrawingML (blip): {len(blip_imgs)}")
print(f"  Images via VML (imagedata): {len(vml_imgs_set)}")
all_used = blip_imgs | vml_imgs_set
unused = set(e['name'] for e in extracted) - all_used
print(f"  Used in document: {len(all_used)}")
print(f"  Unused (maybe headers/footers): {len(unused)}")

print("\n✅ Analysis complete")
