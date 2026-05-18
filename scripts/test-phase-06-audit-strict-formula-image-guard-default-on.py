"""Phase 06 assertions: audit strict-formula-image guard is default ON.

Validates that:
  1. tools/audit.py exposes --strict-formula-image (BooleanOptionalAction, default True).
  2. Helper function strict_formula_image_errors(records) is exported and detects
     1-bit small PNGs near formula keywords AND tiny pixel dims inside <figure>.
  3. data/formula-image-allowlist.json exists, is valid JSON (list of paths).
  4. python tools/audit.py (default flags) exits 0 on the current chapters/* tree.
  5. A synthetic 1-bit, <5KB PNG inside a <figure> with keyword "vec to" before it
     is flagged when present in chapters under a tmp --root, and clears once the
     PNG path is added to formula-image-allowlist.json.
"""
import importlib.util
import json
import struct
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
AUDIT = ROOT / 'tools' / 'audit.py'
ALLOWLIST = ROOT / 'data' / 'formula-image-allowlist.json'


def load_audit_module():
    spec = importlib.util.spec_from_file_location('audit_mod', AUDIT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def make_one_bit_png(width, height):
    """Build minimal valid 1-bit grayscale PNG bytes."""
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 1, 0, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    ihdr = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    row_bytes = (width + 7) // 8
    raw = b''.join(b'\x00' + b'\x00' * row_bytes for _ in range(height))
    compressed = zlib.compress(raw)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    idat = (
        struct.pack('>I', len(compressed))
        + b'IDAT'
        + compressed
        + struct.pack('>I', idat_crc)
    )
    iend_crc = zlib.crc32(b'IEND')
    iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    return sig + ihdr + idat + iend


def fail(msg):
    print(f'FAIL: {msg}')
    sys.exit(1)


def main():
    mod = load_audit_module()

    args = mod.parse_args([])
    if args.strict_formula_image is not True:
        fail('--strict-formula-image must default to True')
    args_off = mod.parse_args(['--no-strict-formula-image'])
    if args_off.strict_formula_image is not False:
        fail('--no-strict-formula-image must flip flag to False')

    if not callable(getattr(mod, 'strict_formula_image_errors', None)):
        fail('audit.py missing strict_formula_image_errors(records)')

    if not ALLOWLIST.exists():
        fail('data/formula-image-allowlist.json missing')
    try:
        allow = json.loads(ALLOWLIST.read_text(encoding='utf-8'))
    except Exception as exc:
        fail(f'formula-image-allowlist.json invalid JSON: {exc}')
    if not isinstance(allow, list):
        fail('formula-image-allowlist.json must be a JSON array')

    proc = subprocess.run(
        [sys.executable, str(AUDIT)],
        capture_output=True, text=True, encoding='utf-8',
    )
    if proc.returncode != 0:
        print(proc.stdout[-1500:])
        fail(f'tools/audit.py default flags exited {proc.returncode}')

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        (tmp / 'chapters' / 'ch1').mkdir(parents=True)
        (tmp / 'chapters' / 'ch2').mkdir(parents=True)
        (tmp / 'chapters' / 'ch3').mkdir(parents=True)
        (tmp / 'images' / 'ch1').mkdir(parents=True)
        (tmp / 'data').mkdir()
        (tmp / 'tools').mkdir()
        (tmp / 'data' / 'equation_mapping.json').write_text('[]', encoding='utf-8')
        (tmp / 'data' / 'equation_mapping.template.json').write_text('[]', encoding='utf-8')
        (tmp / 'tools' / 'equation_report.json').write_text(
            '{"items": [], "counts": {}}', encoding='utf-8'
        )
        suspect = tmp / 'images' / 'ch1' / 'hinh-suspect.png'
        suspect.write_bytes(make_one_bit_png(40, 20))
        if suspect.stat().st_size >= 5 * 1024:
            fail('synthetic suspect PNG too large (>=5KB)')

        html = (
            '<!doctype html><html><body>'
            '<p>Cho véc tơ lực với kí hiệu là</p>'
            '<figure><img src="images/ch1/hinh-suspect.png" alt="x">'
            '<figcaption>Hinh minh hoa</figcaption></figure>'
            '</body></html>'
        )
        (tmp / 'chapters' / 'ch1' / 'muc-I-1.html').write_text(html, encoding='utf-8')
        for ch in ('ch1', 'ch2', 'ch3'):
            (tmp / 'chapters' / ch / 'on-tap.html').write_text('<p>x</p>', encoding='utf-8')
        for stub in ('loi-noi-dau.html', 'tac-gia.html', 'tai-lieu-tham-khao.html'):
            (tmp / 'chapters' / stub).write_text('<p>x</p>', encoding='utf-8')

        (tmp / 'data' / 'formula-image-allowlist.json').write_text('[]', encoding='utf-8')
        proc = subprocess.run(
            [sys.executable, str(AUDIT), '--root', str(tmp)],
            capture_output=True, text=True, encoding='utf-8',
        )
        if proc.returncode == 0 or 'Strict formula-image' not in proc.stdout:
            print(proc.stdout[-2000:])
            fail('synthetic suspect should be flagged by guard')

        (tmp / 'data' / 'formula-image-allowlist.json').write_text(
            json.dumps(['images/ch1/hinh-suspect.png']), encoding='utf-8'
        )
        proc = subprocess.run(
            [sys.executable, str(AUDIT), '--root', str(tmp)],
            capture_output=True, text=True, encoding='utf-8',
        )
        if 'Strict formula-image' in proc.stdout and 'suspects' not in proc.stdout:
            print(proc.stdout[-2000:])
            fail('allowlist must clear the synthetic suspect')

    print(
        'PASS: --strict-formula-image default ON, helper exists, '
        'allowlist works, synthetic suspect flagged then suppressed.'
    )


if __name__ == '__main__':
    main()
