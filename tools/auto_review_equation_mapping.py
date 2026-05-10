"""
Auto-review equation mappings from DOCX embedded MathType OLE objects.

Rows are marked reviewed only when a matching Equation Native OLE object
converts to valid MathML. OCR-only rows remain unreviewed.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from collections import Counter
from pathlib import Path

from lxml import etree

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
DOCX_RELS = "word/_rels/document.xml.rels"
DOCX_DOCUMENT = "word/document.xml"
MATHML_NS = "http://www.w3.org/1998/Math/MathML"
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "v": "urn:schemas-microsoft-com:vml",
    "o": "urn:schemas-microsoft-com:office:office",
}
RUBY_SCRIPT = r"""
require 'json'
require 'nokogiri'
require 'mathtype_to_mathml_plus'

class PatchedConverter < MathTypeToMathMLPlus::Converter
  def path_to_xslt
    ENV.fetch('MT_PATCHED_XSL')
  end
end

results = {}
ARGV.each do |path|
  begin
    results[path] = PatchedConverter.new(path).convert
  rescue => e
    results[path] = "<!-- ERROR: #{e.message.to_s.gsub(/[<>]/, '_')} -->"
  end
end
puts JSON.generate(results)
"""


def load_rows(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data


def write_rows(path, rows):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)


def append_note(current, addition):
    addition = (addition or "").strip()
    if not addition:
        return current or ""
    current = (current or "").strip()
    return f"{current} | {addition}" if current else addition


def resolve_ruby(explicit):
    candidates = [
        explicit,
        os.getenv("RUBY_EXE"),
        shutil.which("ruby"),
        r"C:\Ruby33-x64\bin\ruby.exe",
        r"C:\Ruby34-x64\bin\ruby.exe",
        r"C:\Ruby32-x64\bin\ruby.exe",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(Path(candidate))
    raise SystemExit("Ruby not found. Install Ruby and mathtype_to_mathml_plus first.")


def check_ruby_converter(ruby_exe):
    check = subprocess.run(
        [ruby_exe, "-e", "require 'mathtype_to_mathml_plus'; puts 'ok'"],
        text=True,
        encoding="utf-8",
        capture_output=True,
        timeout=30,
        check=False,
    )
    if check.returncode != 0:
        detail = (check.stderr or check.stdout or "").strip()
        raise SystemExit(f"Ruby gem mathtype_to_mathml_plus is not available: {detail}")


def docx_media_to_ole(docx_path):
    with zipfile.ZipFile(docx_path) as archive:
        relroot = etree.fromstring(archive.read(DOCX_RELS))
        rels = {node.get("Id"): node.get("Target") for node in relroot}
        document = etree.fromstring(archive.read(DOCX_DOCUMENT))

    mapping = {}
    for obj in document.xpath(".//w:object", namespaces=NS):
        image_ids = obj.xpath(".//v:imagedata/@r:id", namespaces=NS)
        ole_ids = obj.xpath(".//o:OLEObject/@r:id", namespaces=NS)
        prog_ids = obj.xpath(".//o:OLEObject/@ProgID", namespaces=NS)
        prog_id = prog_ids[0] if prog_ids else ""
        for image_id in image_ids:
            media = Path(rels.get(image_id, "")).name
            for ole_id in ole_ids:
                target = rels.get(ole_id)
                if media and target:
                    mapping.setdefault(media, []).append({"target": target, "prog_id": prog_id})
    return mapping


def prepare_patched_xsl(work_dir, ruby_exe):
    ruby = (
        "require 'mathtype_to_mathml_plus'; "
        "puts File.join(Gem::Specification.find_by_name('mathtype_to_mathml_plus').full_gem_path, 'lib')"
    )
    completed = subprocess.run(
        [ruby_exe, "-e", ruby],
        text=True,
        encoding="utf-8",
        capture_output=True,
        timeout=30,
        check=False,
    )
    if completed.returncode != 0:
        raise SystemExit((completed.stderr or completed.stdout or "").strip())

    gem_lib = Path(completed.stdout.strip())
    patched_lib = work_dir / "mathtype-lib"
    shutil.copytree(gem_lib / "xsl", patched_lib / "xsl")
    source = (gem_lib / "transform.xsl").read_text(encoding="utf-8")
    source = source.replace(
        "match=\"mtef[equation_options = 'inline']\"",
        "match=\"mtef[not(equation_options) or equation_options = 'inline']\"",
    )
    patched_xsl = patched_lib / "transform.xsl"
    patched_xsl.write_text(source, encoding="utf-8")
    return patched_xsl


def run_converter(ruby_exe, ruby_script, patched_xsl, paths, chunk_size):
    results = {}
    env = os.environ.copy()
    env["MT_PATCHED_XSL"] = str(patched_xsl)
    for start in range(0, len(paths), chunk_size):
        chunk = paths[start:start + chunk_size]
        completed = subprocess.run(
            [ruby_exe, str(ruby_script), *map(str, chunk)],
            text=True,
            encoding="utf-8",
            cwd=ROOT,
            env=env,
            capture_output=True,
            timeout=240,
            check=False,
        )
        if completed.returncode != 0:
            detail = (completed.stderr or completed.stdout or "").strip()
            raise SystemExit(f"Ruby MathType converter failed: {detail[:1000]}")
        results.update(json.loads(completed.stdout or "{}"))
    return results


def unprefix_mathml(root):
    for element in root.iter():
        if not isinstance(element.tag, str):
            continue
        qname = etree.QName(element)
        if qname.namespace == MATHML_NS:
            element.tag = qname.localname
    etree.cleanup_namespaces(root)
    root.set("xmlns", MATHML_NS)
    return root


def clean_mathml(value):
    if not value or ("<math" not in value and "<mml:math" not in value):
        return ""
    start = value.find("<math")
    close = "</math>"
    end = value.rfind(close)
    if start == -1:
        start = value.find("<mml:math")
        close = "</mml:math>"
        end = value.rfind(close)
    if start == -1 or end == -1:
        return ""
    mathml = value[start:end + len(close)].strip()
    try:
        root = etree.fromstring(mathml.encode("utf-8"))
    except etree.XMLSyntaxError:
        return ""
    if not root.tag.endswith("math"):
        return ""
    root = unprefix_mathml(root)
    return etree.tostring(root, encoding="unicode", pretty_print=False)


def first_ole_for_row(row, media_to_ole):
    for example in row.get("examples", []):
        media = example.get("media")
        choices = media_to_ole.get(media)
        if choices:
            return choices[0]
    return None


def auto_review(args):
    ruby_exe = resolve_ruby(args.ruby)
    check_ruby_converter(ruby_exe)

    rows = load_rows(args.input)
    media_to_ole = docx_media_to_ole(args.docx)
    reviewed_rows = []
    counts = Counter()
    failures = []

    with tempfile.TemporaryDirectory() as tmp:
        work_dir = Path(tmp)
        ruby_script = work_dir / "mathtype_batch.rb"
        ruby_script.write_text(RUBY_SCRIPT, encoding="utf-8")
        patched_xsl = prepare_patched_xsl(work_dir, ruby_exe)

        target_to_path = {}
        row_to_ole = {}
        with zipfile.ZipFile(args.docx) as archive:
            for row in rows:
                ole = first_ole_for_row(row, media_to_ole)
                if not ole:
                    counts["missing_ole"] += 1
                    continue
                target = ole["target"]
                row_to_ole[row.get("hash")] = ole
                if target not in target_to_path:
                    path = work_dir / Path(target).name
                    path.write_bytes(archive.read(f"word/{target}"))
                    target_to_path[target] = path

        converted = run_converter(
            ruby_exe,
            ruby_script,
            patched_xsl,
            list(target_to_path.values()),
            args.chunk_size,
        )

        for row in rows:
            updated = dict(row)
            ole = row_to_ole.get(row.get("hash"))
            if not ole:
                updated["reviewed"] = False
                updated["notes"] = append_note(updated.get("notes"), "Auto-review skipped: no matching OLE object")
                reviewed_rows.append(updated)
                continue

            result = converted.get(str(target_to_path[ole["target"]]), "")
            mathml = clean_mathml(result)
            if mathml:
                updated["latex"] = ""
                updated["mathml"] = mathml
                updated["source"] = f"mathtype-native:auto:{ole.get('prog_id') or 'unknown'}"
                updated["reviewed"] = True
                updated["notes"] = append_note(
                    updated.get("notes"),
                    f"Auto-reviewed from DOCX Equation Native ({ole.get('prog_id') or 'unknown'})",
                )
                counts["reviewed"] += 1
            else:
                updated["reviewed"] = False
                reason = result.strip() or "empty conversion result"
                reason = reason.replace("\n", " ")[:300]
                updated["notes"] = append_note(updated.get("notes"), f"Auto-review skipped: {reason}")
                counts["converter_failed"] += 1
                failures.append({
                    "hash": updated.get("hash"),
                    "media": (updated.get("examples") or [{}])[0].get("media"),
                    "ole": ole.get("target"),
                    "prog_id": ole.get("prog_id"),
                    "reason": reason,
                })
            reviewed_rows.append(updated)

    counts["rows"] = len(reviewed_rows)
    counts["unreviewed"] = sum(1 for row in reviewed_rows if not row.get("reviewed"))
    if not args.dry_run:
        write_rows(args.output, reviewed_rows)
        if args.failures_output:
            write_rows(args.failures_output, failures)

    print("=== EQUATION AUTO REVIEW FROM OLE ===")
    print(f"Input rows: {len(rows)}")
    print(f"Reviewed: {counts['reviewed']}")
    print(f"Unreviewed: {counts['unreviewed']}")
    print(f"Missing OLE: {counts['missing_ole']}")
    print(f"Converter failed: {counts['converter_failed']}")
    print(f"Dry-run: {'yes' if args.dry_run else 'no'}")
    if not args.dry_run:
        print(f"Output: {os.path.abspath(args.output)}")
        if args.failures_output:
            print(f"Failures: {os.path.abspath(args.failures_output)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--docx", default="CoHocLyThuyet_Full_New.docx")
    parser.add_argument("--input", default="data/equation_mapping.ocr.json")
    parser.add_argument("--output", default="data/equation_mapping.reviewed.json")
    parser.add_argument("--failures-output", default="data/equation_mapping.auto-review-failures.json")
    parser.add_argument("--ruby")
    parser.add_argument("--chunk-size", type=int, default=40)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if args.chunk_size <= 0:
        parser.error("--chunk-size must be a positive integer")
    auto_review(args)


if __name__ == "__main__":
    main()
