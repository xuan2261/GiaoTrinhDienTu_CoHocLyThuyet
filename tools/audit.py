"""
Comprehensive content audit script
Checks: file sizes, KaTeX formulas, placeholders, image paths, content quality
"""
import argparse
import os, re, glob, sys, json
from html.parser import HTMLParser
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'chapters'
MOJIBAKE_RE = re.compile(r'\u00e2[\u0080-\uffff]|\u00c3[\u0080-\uffff]|\u00c2[\u0080-\uffff]')
TAG_RE = re.compile(r'<[^>]+>')
CAPTION_RE = re.compile(
    r'<p\b[^>]*\bclass=["\'][^"\']*\bcaption\b[^"\']*["\'][^>]*>.*?</p>'
    r'|<p\b[^>]*>\s*<strong>\s*Hình\b.*?</p>',
    flags=re.I | re.S,
)
FIGURE_TEXT_EVIDENCE_RE = re.compile(
    r'\b(?:Hình\s*\d|hình\s*vẽ|như\s+hình|theo\s+hình|'
    r'Bài\s*(?:tập\s*)?\d+|Ví\s*dụ\s*\d+|Thí\s*nghiệm)\b',
    flags=re.I,
)
DOMAIN_CONTEXT_RE = re.compile(
    r'\b(?:chuyển\s*động|quỹ\s*đạo|vận\s*tốc|gia\s*tốc|lực|hệ\s*lực|'
    r'phản\s*lực|liên\s*kết|mô\s*men|động\s*năng|ròng\s*rọc|dây|'
    r'thanh|vật\s*rắn|cơ\s*cấu|truyền\s*động)\b',
    flags=re.I,
)
FIGURE_OPEN_RE = re.compile(
    r'(?:<div\b[^>]*\bclass=["\'][^"\']*\bfigure-container\b[^"\']*["\'][^>]*>'
    r'|<figure\b[^>]*>)\s*(?:<figcaption[^>]*>.*?</figcaption>\s*)?$',
    flags=re.I | re.S,
)
FIGURE_BLOCK_RE = re.compile(
    r'<div\b[^>]*\bclass=["\'][^"\']*\bfigure-container\b[^"\']*["\'][^>]*>.*?</div>'
    r'|<figure\b[^>]*>.*?</figure>',
    flags=re.I | re.S,
)
FIGURE_BLOCK_AT_RE = re.compile(
    r'\s*(?:<div\b[^>]*\bclass=["\'][^"\']*\bfigure-container\b[^"\']*["\'][^>]*>.*?</div>'
    r'|<figure\b[^>]*>.*?</figure>)',
    flags=re.I | re.S,
)
IMAGE_BOUNDARY_RE = re.compile(
    r'<div\b[^>]*\bclass=["\'][^"\']*\bfigure-container\b[^"\']*["\'][^>]*>'
    r'|<figure\b[^>]*>|<img\b',
    flags=re.I,
)
CAPTION_WINDOW = 4000
SHORT_INLINE_FIGURE_FRAGMENT_MAX = 90
INLINE_FIGURE_TEXT_BREAK_RE = re.compile(r'[.!?]')

FORMULA_IMAGE_KEYWORDS = re.compile(
    r'(?:kí hiệu là|kí hiệu|véc tơ|vector|phản lực|sức căng|lực|gia tốc|'
    r'vận tốc|mô men|đặt vào)',
    flags=re.I,
)
FORMULA_IMAGE_SIZE_THRESHOLD = 5 * 1024
FORMULA_IMAGE_TINY_W = 90
FORMULA_IMAGE_TINY_H = 30
FORMULA_IMAGE_BEFORE_WINDOW = 200


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--strict-equations',
        action='store_true',
        help='Fail unless all legacy equation images are replaced by reviewed semantic math mappings.',
    )
    parser.add_argument(
        '--strict-images',
        action='store_true',
        help='Fail publish if local images have invalid wrappers, missing files, tiny files, or unresolved artifact metadata.',
    )
    parser.add_argument(
        '--strict-formula-image',
        action=argparse.BooleanOptionalAction,
        default=True,
        help='Detect raster images that likely contain formulas/symbols (size<5KB + 1-bit + neighbor keywords, or tiny pixel dims). Default: on. Use --no-strict-formula-image to disable.',
    )
    parser.add_argument(
        '--root',
        default=None,
        help='Override project root (used by phase-06 audit-guard tests to inject suspect fixtures).',
    )
    return parser.parse_args(argv)


class StructureAuditParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        classes = attrs_dict.get('class', '')
        if tag == 'div' and 'figure-container' in classes.split() and self.stack and self.stack[-1] == 'ul':
            self.errors.append('❌ figure-container is direct child of <ul>')
        if tag == 'div' and 'mathml-block' in classes.split() and self.stack and self.stack[-1] == 'ul':
            self.errors.append('❌ mathml-block is direct child of <ul>')
        self.stack.append(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i] == tag:
                del self.stack[i:]
                break


def structure_errors(content):
    parser = StructureAuditParser()
    parser.feed(content)
    return sorted(set(parser.errors))


def image_errors(content):
    errors = []
    for src in re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', content, flags=re.I):
        if re.match(r'^(https?:|data:|blob:)', src, flags=re.I):
            continue
        clean_src = src.split('#', 1)[0].split('?', 1)[0].replace('\\', '/')
        if not clean_src:
            continue
        rel_src = clean_src.lstrip('/') if clean_src.startswith('/') else clean_src
        if not (ROOT / rel_src).exists():
            errors.append(f"❌ Missing image file: {src}")
    return sorted(set(errors))


def attr_value(tag, attr_name):
    match = re.search(rf'\b{re.escape(attr_name)}=["\']([^"\']*)["\']', tag, flags=re.I)
    return match.group(1) if match else ''


def normalize_src(src):
    clean_src = src.split('#', 1)[0].split('?', 1)[0].replace('\\', '/')
    if clean_src.startswith('/'):
        clean_src = clean_src.lstrip('/')
    return clean_src


def is_external_src(src):
    return bool(re.match(r'^(https?:|data:|blob:)', src, flags=re.I))


def figure_bounds(content, image_match):
    figure_start = content.rfind('<figure', 0, image_match.start())
    figure_close_before = content.rfind('</figure>', 0, image_match.start())
    if figure_start != -1 and figure_start > figure_close_before:
        figure_end = content.find('</figure>', image_match.end())
        if figure_end != -1:
            return figure_start, figure_end + len('</figure>'), True

    before = content[max(0, image_match.start() - 240):image_match.start()]
    figure_open = FIGURE_OPEN_RE.search(before)
    if not figure_open:
        return image_match.start(), image_match.end(), False

    block_start = image_match.start() - (len(before) - figure_open.start())
    closing = re.match(r'\s*</div>', content[image_match.end():], flags=re.I)
    block_end = image_match.end() + (closing.end() if closing else 0)
    return block_start, block_end, True


def bounded_after_segment(content, start):
    limit = min(len(content), start + CAPTION_WINDOW)
    segment = content[start:limit]
    boundary = IMAGE_BOUNDARY_RE.search(segment)
    if boundary:
        segment = segment[:boundary.start()]
    return segment


def visible_text(markup):
    return re.sub(r'\s+', ' ', TAG_RE.sub(' ', markup or '')).strip()


def is_short_inline_figure_fragment(markup):
    if CAPTION_RE.search(markup):
        return False
    text = visible_text(markup)
    if not text:
        return True
    return len(text) <= SHORT_INLINE_FIGURE_FRAGMENT_MAX and not INLINE_FIGURE_TEXT_BREAK_RE.search(text)


def bounded_before_segment(content, start):
    begin = max(0, start - CAPTION_WINDOW)
    segment = content[begin:start]
    cut_at = 0
    for match in reversed(list(FIGURE_BLOCK_RE.finditer(segment))):
        if is_short_inline_figure_fragment(segment[match.end():]):
            continue
        cut_at = match.end()
        break
    if cut_at:
        segment = segment[cut_at:]
    return segment


def caption_after_figure_group(content, start):
    end = min(len(content), start + CAPTION_WINDOW)
    position = start

    while position < end:
        whitespace = re.match(r'\s*', content[position:end])
        position += whitespace.end()
        if position >= end:
            return False

        caption = CAPTION_RE.match(content, position, end)
        if caption:
            return True

        next_figure = FIGURE_BLOCK_AT_RE.match(content, position, end)
        if next_figure:
            position = next_figure.end()
            continue

        return False
    return False


def previous_caption_matches_current_figure(before_segment):
    captions = list(CAPTION_RE.finditer(before_segment))
    if not captions:
        return False

    caption = captions[-1]
    if before_segment[caption.end():].strip():
        return False

    previous_figure = None
    for match in FIGURE_BLOCK_RE.finditer(before_segment[:caption.start()]):
        previous_figure = match
    if previous_figure and not before_segment[previous_figure.end():caption.start()].strip():
        return False
    return True


def has_nearby_caption(content, block_start, block_end):
    if re.search(r'<figcaption\b[^>]*>.*?</figcaption>', content[block_start:block_end], flags=re.I | re.S):
        return True
    if caption_after_figure_group(content, block_end):
        return True

    before_start = max(0, block_start - CAPTION_WINDOW)
    before = content[before_start:block_start]
    return previous_caption_matches_current_figure(before)


def has_nearby_text_context(content, block_start, block_end):
    nearby = " ".join([
        visible_text(bounded_before_segment(content, block_start)),
        visible_text(bounded_after_segment(content, block_end)),
    ])
    if FIGURE_TEXT_EVIDENCE_RE.search(nearby):
        return True
    return len(nearby) >= 80 and bool(DOMAIN_CONTEXT_RE.search(nearby))


def png_metadata(path):
    """Read PNG IHDR (width, height, bit_depth, color_type). Returns dict or None."""
    try:
        with open(path, 'rb') as fh:
            sig = fh.read(8)
            if sig[:8] != b'\x89PNG\r\n\x1a\n':
                return None
            fh.read(4)
            if fh.read(4) != b'IHDR':
                return None
            width = int.from_bytes(fh.read(4), 'big')
            height = int.from_bytes(fh.read(4), 'big')
            bit_depth = fh.read(1)
            color_type = fh.read(1)
            return {
                'width': width,
                'height': height,
                'bit_depth': bit_depth[0] if bit_depth else 0,
                'color_type': color_type[0] if color_type else 0,
            }
    except (OSError, IndexError):
        return None


def stripped_before_text(content, start, window=1000, take_last=200):
    begin = max(0, start - window)
    raw = content[begin:start]
    text = re.sub(r'\s+', ' ', TAG_RE.sub(' ', raw)).strip()
    return text[-take_last:] if len(text) > take_last else text


def collect_image_records(content, source):
    records = []
    for match in re.finditer(r'<img\b[^>]*>', content, flags=re.I):
        tag = match.group(0)
        src = attr_value(tag, 'src')
        if not src:
            records.append({
                'source': source, 'src': '', 'kind': 'invalid', 'alt': '',
                'exists': False, 'bytes': 0, 'external': False, 'caption': False, 'context': False,
                'before_text': '', 'png_meta': None,
            })
            continue
        classes = attr_value(tag, 'class').split()
        alt = attr_value(tag, 'alt')
        block_start, block_end, in_figure = figure_bounds(content, match)
        is_math = 'math-img-inline' in classes or 'math-img-block' in classes
        if is_math:
            kind = 'math-image'
        elif in_figure:
            kind = 'figure'
        else:
            kind = 'unwrapped'
        normalized = normalize_src(src)
        external = is_external_src(src)
        path = ROOT / normalized if normalized and not external else None
        exists = bool(external or (path and path.exists()))
        size = path.stat().st_size if path and path.exists() else 0
        caption = has_nearby_caption(content, block_start, block_end)
        context = has_nearby_text_context(content, block_start, block_end)
        meta = png_metadata(path) if path and path.exists() else None
        before_text = stripped_before_text(content, block_start)
        records.append({
            'source': source,
            'src': normalized or src,
            'kind': kind,
            'alt': alt,
            'exists': exists,
            'bytes': size,
            'external': external,
            'caption': caption,
            'context': context,
            'before_text': before_text,
            'png_meta': meta,
        })
    return records


def image_errors_from_records(records):
    errors = []
    for record in records:
        if not record['src']:
            errors.append(f"❌ Image tag missing src: {record['source']}")
        elif not record['exists']:
            errors.append(f"❌ Missing image file: {record['src']}")
    return sorted(set(errors))


def artifact_figure_outputs():
    outputs = set()
    for row in load_json_items(ROOT / 'data' / 'equation_mapping.json'):
        if not isinstance(row, dict):
            continue
        source = row.get('source') or ''
        notes = row.get('notes') or ''
        is_artifact_figure = (
            row.get('artifact') == 'figure'
            or 'artifact-figure' in source
            or 'keep as figure' in notes.lower()
        )
        if not is_artifact_figure:
            continue
        for example in row.get('examples') or []:
            output = example.get('output') if isinstance(example, dict) else None
            if output:
                outputs.add(normalize_src(output))
    return outputs


def strict_image_errors(records):
    errors = []
    artifact_outputs = artifact_figure_outputs()
    for record in records:
        src = record['src']
        if record['external']:
            errors.append(f"❌ Strict images: external image source is not publish-safe: {src} ({record['source']})")
            continue
        if not src:
            errors.append(f"❌ Strict images: image tag missing src ({record['source']})")
            continue
        if not record['exists']:
            errors.append(f"❌ Strict images: missing image file: {src} ({record['source']})")
            continue
        if record['bytes'] < 150:
            errors.append(f"❌ Strict images: tiny image file: {src} ({record['source']})")
        if record['kind'] not in ('figure', 'math-image'):
            errors.append(f"❌ Strict images: image must use figure/math wrapper: {src} ({record['source']})")
        if record['kind'] == 'figure' and not (record['caption'] or record.get('context')):
            errors.append(f"❌ Strict images: figure missing nearby caption/context: {src} ({record['source']})")
        if record['kind'] == 'figure' and src in artifact_outputs:
            if re.match(r'^\s*C[oô]ng th[uứ]c\b', record['alt'], flags=re.I):
                errors.append(f"❌ Strict images: artifact-figure uses generic formula alt: {src} ({record['source']})")
    return sorted(set(errors))


def load_equation_report():
    report_path = ROOT / 'tools' / 'equation_report.json'
    if not report_path.exists():
        return None
    with open(report_path, 'r', encoding='utf-8') as fh:
        return json.load(fh)


def load_json_items(path):
    if not path.exists():
        return []
    with open(path, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get('equations', data.get('items', []))
    return data if isinstance(data, list) else []


def reviewed_equation_hashes():
    mapping_path = ROOT / 'data' / 'equation_mapping.json'
    rows = load_json_items(mapping_path)
    return {
        row.get('hash')
        for row in rows
        if isinstance(row, dict)
        and row.get('reviewed')
        and (row.get('latex') or row.get('mathml') or row.get('artifact'))
    }


def equation_report_errors(content):
    data = load_equation_report()
    if data is None:
        return ["❌ tools/equation_report.json missing"]
    errors = []
    mapped_hashes = reviewed_equation_hashes()
    for item in data.get('items', []):
        prog_id = item.get('prog_id') or ''
        if not prog_id.startswith('Equation.'):
            continue
        kind = item.get('kind')
        output = item.get('output')
        if kind not in ('math-inline', 'math-display'):
            errors.append(f"❌ Equation media classified as {kind}: {item.get('media')}")
        if not output:
            errors.append(f"❌ Equation media has no output: {item.get('media')}")
            continue
        escaped = re.escape(output)
        if item.get('hash') in mapped_hashes:
            continue
        if re.search(rf'<div class="figure-container">\s*<img[^>]+src="{escaped}"', content):
            errors.append(f"❌ Equation rendered as figure-container: {output}")
        if kind == 'math-inline' and not re.search(rf'<img[^>]+class="[^"]*\bmath-img-inline\b[^"]*"[^>]+src="{escaped}"', content):
            errors.append(f"❌ Inline equation missing math-img-inline render: {output}")
        if kind == 'math-display' and not re.search(rf'<div class="math-img-block">\s*<img[^>]+src="{escaped}"', content):
            errors.append(f"❌ Display equation missing math-img-block render: {output}")
    return sorted(set(errors))


def strict_equation_errors(chapter_content):
    errors = []
    pages_path = ROOT / 'js' / 'pages.js'
    pages_content = pages_path.read_text(encoding='utf-8') if pages_path.exists() else ''
    combined = chapter_content + '\n' + pages_content

    inline_count = len(re.findall(r'\bmath-img-inline\b', combined))
    block_count = len(re.findall(r'\bmath-img-block\b', combined))
    if inline_count or block_count:
        errors.append(
            f"❌ Strict equations: remaining image fallback classes "
            f"math-img-inline={inline_count}, math-img-block={block_count}"
        )
    if MOJIBAKE_RE.search(combined):
        errors.append("❌ Strict equations: mojibake found in generated HTML/JS output")
    if re.search(r'<\?xml|</?mml:', combined):
        errors.append("❌ Strict equations: raw XML declaration or prefixed mml tags found in output")
    inline_block_mathml = len(re.findall(
        r'<span class="mathml-inline">\s*<math\b[^>]*\bdisplay=["\']block["\']',
        combined,
        flags=re.I,
    ))
    if inline_block_mathml:
        errors.append(f"❌ Strict equations: inline MathML contains display=block ({inline_block_mathml})")

    template_rows = load_json_items(ROOT / 'data' / 'equation_mapping.template.json')
    mapping_rows = load_json_items(ROOT / 'data' / 'equation_mapping.json')
    expected = len({row.get('hash') for row in template_rows if isinstance(row, dict) and row.get('hash')})
    reviewed = {}
    invalid = 0
    for index, row in enumerate(mapping_rows):
        if not isinstance(row, dict):
            invalid += 1
            continue
        media_hash = row.get('hash')
        if not media_hash:
            invalid += 1
            continue
        if row.get('reviewed') and (row.get('latex') or row.get('mathml') or row.get('artifact')):
            mathml = row.get('mathml') or ''
            if mathml and MOJIBAKE_RE.search(mathml):
                errors.append(f"❌ Strict equations: mojibake in mapping row index {index}")
            if mathml and re.search(r'<\?xml|</?mml:', mathml):
                errors.append(f"❌ Strict equations: raw XML/prefixed mml in mapping row index {index}")
            reviewed[media_hash] = row
        elif row.get('reviewed'):
            errors.append(f"❌ Strict equations: reviewed row missing latex/mathml at index {index}")

    if invalid:
        errors.append(f"❌ Strict equations: invalid mapping rows={invalid}")
    if expected and len(reviewed) != expected:
        errors.append(f"❌ Strict equations: reviewed mappings {len(reviewed)}/{expected}")
    if not expected:
        errors.append("❌ Strict equations: template mapping is missing or empty")
    return errors


def load_formula_image_allowlist():
    path = ROOT / 'data' / 'formula-image-allowlist.json'
    if not path.exists():
        return set()
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return set()
    if isinstance(data, list):
        return {normalize_src(s) for s in data if isinstance(s, str)}
    if isinstance(data, dict):
        return {normalize_src(s) for s in data.get('allow', []) if isinstance(s, str)}
    return set()


def strict_formula_image_errors(records):
    """Detect raster images that likely encode formulas/symbols.

    Heuristic per phase-06 spec:
      1. file<5KB AND mode=1 PNG (1-bit) AND inside figure/figure-container
         AND keyword (kí hiệu, véc tơ, lực, ...) within 200 chars before image
      2. tiny pixel dims (<90x30) inside figure (regardless of keyword)
    """
    errors = []
    allowlist = load_formula_image_allowlist()
    for rec in records:
        if rec['kind'] not in ('figure', 'unwrapped'):
            continue
        if not rec['exists'] or rec['external']:
            continue
        src = rec['src']
        if src in allowlist:
            continue
        meta = rec.get('png_meta')
        before = rec.get('before_text') or ''
        before_window = before[-FORMULA_IMAGE_BEFORE_WINDOW:]

        is_one_bit = bool(meta and meta.get('bit_depth') == 1)
        is_small_file = rec['bytes'] < FORMULA_IMAGE_SIZE_THRESHOLD
        has_keyword = bool(FORMULA_IMAGE_KEYWORDS.search(before_window))
        is_tiny_px = bool(
            meta
            and meta.get('width', 999) < FORMULA_IMAGE_TINY_W
            and meta.get('height', 999) < FORMULA_IMAGE_TINY_H
        )

        if is_small_file and is_one_bit and has_keyword:
            errors.append(
                f"❌ Strict formula-image: 1-bit small PNG near formula keyword: "
                f"{src} ({rec['source']})"
            )
            continue
        if is_tiny_px:
            errors.append(
                f"❌ Strict formula-image: tiny pixel dims "
                f"({meta['width']}x{meta['height']}): {src} ({rec['source']})"
            )
    return sorted(set(errors))


def main(argv=None):
    args = parse_args(argv)
    if args.root:
        global ROOT, BASE
        ROOT = Path(args.root).resolve()
        BASE = ROOT / 'chapters'
    stats = {'total': 0, 'ok': 0, 'warn': 0, 'error': 0}
    all_html = []
    all_image_records = []

    print("=" * 80)
    print("COMPREHENSIVE CONTENT AUDIT — ALL CHAPTERS")
    print("=" * 80)

    for ch in ['ch1', 'ch2', 'ch3']:
        ch_dir = os.path.join(BASE, ch)
        if not os.path.isdir(ch_dir):
            continue

        files = sorted(glob.glob(os.path.join(ch_dir, 'muc-*.html')))
        print(f"\n{'─' * 80}")
        print(f"📚 {ch.upper()} — {len(files)} files")
        print(f"{'─' * 80}")

        for f in files:
            stats['total'] += 1
            fname = os.path.basename(f)
            with open(f, 'r', encoding='utf-8') as fh:
                content = fh.read()
            all_html.append(content)
            image_records = collect_image_records(content, f"{ch}/{fname}")
            all_image_records.extend(image_records)

            size = len(content)

            inline_math = len(re.findall(r'\$[^$]+\$', content))
            block_math = len(re.findall(r'\$\$[^$]+\$\$', content))
            total_math = inline_math + block_math

            problems = []

            if size < 150:
                problems.append("⚠️ TINY (<150 bytes)")

            if 'cập nhật' in content.lower() or 'placeholder' in content.lower():
                problems.append("❌ PLACEHOLDER text found")

            text_only = re.sub(r'<[^>]+>', '', content).strip()
            if len(text_only) < 50:
                problems.append("⚠️ Very little text content")

            if re.match(r'muc-[IVX]+\.html$', fname):
                if 'sub-items' not in content and 'href' not in content and '<a ' not in content:
                    if len(text_only) < 100:
                        problems.append("⚠️ L2 file missing overview/links")

            problems.extend(structure_errors(content))
            problems.extend(image_errors_from_records(image_records))

            if any('❌' in p for p in problems):
                status = '❌'
                stats['error'] += 1
            elif problems:
                status = '⚠️'
                stats['warn'] += 1
            else:
                status = '✅'
                stats['ok'] += 1

            math_str = f"📐{total_math}" if total_math > 0 else "—"
            print(f"  {status} {fname:25s} {size:6d}B  {math_str:8s}  {'  '.join(problems) if problems else 'OK'}")

    print(f"\n{'─' * 80}")
    print("📄 SPECIAL FILES")
    print(f"{'─' * 80}")

    special = ['loi-noi-dau.html', 'tac-gia.html', 'tai-lieu-tham-khao.html']
    for sf in special:
        fp = os.path.join(BASE, sf)
        if os.path.exists(fp):
            with open(fp, 'r', encoding='utf-8') as fh:
                content = fh.read()
            all_html.append(content)
            image_records = collect_image_records(content, sf)
            all_image_records.extend(image_records)
            size = len(content)
            problems = image_errors_from_records(image_records)
            if problems:
                stats['error'] += 1
                print(f"  ❌ {sf:30s} {size:6d}B  {'  '.join(problems)}")
            else:
                has_img = '<img' in content
                print(f"  ✅ {sf:30s} {size:6d}B  {'⚠️ has img' if has_img else 'OK'}")
        else:
            stats['error'] += 1
            print(f"  ❌ {sf:30s} MISSING!")

    for ch in ['ch1', 'ch2', 'ch3']:
        rev = os.path.join(BASE, ch, 'on-tap.html')
        if os.path.exists(rev):
            with open(rev, 'r', encoding='utf-8') as fh:
                content = fh.read()
            all_html.append(content)
            image_records = collect_image_records(content, f"{ch}/on-tap.html")
            all_image_records.extend(image_records)
            size = len(content)
            problems = image_errors_from_records(image_records)
            if problems:
                stats['error'] += 1
                print(f"  ❌ {ch}/on-tap.html{' ':14s} {size:6d}B  {'  '.join(problems)}")
            else:
                print(f"  ✅ {ch}/on-tap.html{' ':14s} {size:6d}B  OK")
        else:
            stats['error'] += 1
            print(f"  ❌ {ch}/on-tap.html MISSING!")

    print(f"\n{'─' * 80}")
    print("🖼 IMAGE RENDERING")
    print(f"{'─' * 80}")
    valid_figures = sum(1 for record in all_image_records if record['kind'] == 'figure' and record['exists'])
    math_images = sum(1 for record in all_image_records if record['kind'] == 'math-image')
    unwrapped_images = sum(1 for record in all_image_records if record['kind'] == 'unwrapped')
    missing_images = sum(1 for record in all_image_records if not record['exists'])
    print(
        f"  Figures: {valid_figures} valid | "
        f"math-image fallbacks={math_images} | unwrapped={unwrapped_images} | missing={missing_images}"
    )

    if args.strict_images:
        print(f"\n{'─' * 80}")
        print("🖼 STRICT IMAGE PUBLISH")
        print(f"{'─' * 80}")
        strict_errors = strict_image_errors(all_image_records)
        if strict_errors:
            for error in strict_errors[:50]:
                print(f"  {error}")
            if len(strict_errors) > 50:
                print(f"  ... {len(strict_errors) - 50} more")
            stats['error'] += len(strict_errors)
        else:
            print("  ✅ All local images satisfy publish image gate")

    print(f"\n{'─' * 80}")
    print("∑ EQUATION RENDERING")
    print(f"{'─' * 80}")
    equation_data = load_equation_report()
    if equation_data:
        counts = equation_data.get('counts', {})
        print(
            "  Counts: "
            f"math-inline={counts.get('math-inline', 0)} | "
            f"math-display={counts.get('math-display', 0)} | "
            f"figure={counts.get('figure', 0)} | "
            f"unknown={counts.get('unknown', 0)}"
        )
    equation_errors = equation_report_errors("\n".join(all_html))
    if equation_errors:
        for error in equation_errors[:30]:
            print(f"  {error}")
        if len(equation_errors) > 30:
            print(f"  ... {len(equation_errors) - 30} more")
        stats['error'] += len(equation_errors)
    else:
        print("  ✅ Equation media classes/rendering OK")

    if args.strict_equations:
        print(f"\n{'─' * 80}")
        print("🔒 STRICT EQUATION PUBLISH")
        print(f"{'─' * 80}")
        strict_errors = strict_equation_errors("\n".join(all_html))
        if strict_errors:
            for error in strict_errors:
                print(f"  {error}")
            stats['error'] += len(strict_errors)
        else:
            print("  ✅ No equation image fallbacks and mapping is fully reviewed")

    if args.strict_formula_image:
        print(f"\n{'─' * 80}")
        print("🔒 STRICT FORMULA-AS-IMAGE GUARD")
        print(f"{'─' * 80}")
        guard_errors = strict_formula_image_errors(all_image_records)
        if guard_errors:
            for error in guard_errors[:50]:
                print(f"  {error}")
            if len(guard_errors) > 50:
                print(f"  ... {len(guard_errors) - 50} more")
            stats['error'] += len(guard_errors)
        else:
            print("  ✅ strict-formula-image: 0 suspects")

    print(f"\n{'=' * 80}")
    print(f"SUMMARY: {stats['total']} files | ✅ {stats['ok']} OK | ⚠️ {stats['warn']} warnings | ❌ {stats['error']} errors")
    print(f"{'=' * 80}")
    return 1 if stats['error'] else 0


if __name__ == "__main__":
    raise SystemExit(main())
