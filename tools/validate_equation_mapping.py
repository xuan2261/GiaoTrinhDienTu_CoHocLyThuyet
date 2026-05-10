"""
Validate equation mapping files used by the DOCX extraction pipeline.

Examples:
  python tools/validate_equation_mapping.py --input data/equation_mapping.template.json
  python tools/validate_equation_mapping.py --input data/equation_mapping.json --strict
"""
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from lxml import etree

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_ARTIFACTS = {"figure", "blank"}
MATHML_NS = "http://www.w3.org/1998/Math/MathML"
XML_NS = "http://www.w3.org/XML/1998/namespace"
MOJIBAKE_RE = re.compile(r"\u00e2[\u0080-\uffff]|\u00c3[\u0080-\uffff]|\u00c2[\u0080-\uffff]")
ALLOWED_MATHML_TAGS = {
    "math", "maction", "menclose", "merror", "mfenced", "mfrac", "mi", "mmultiscripts",
    "mn", "mo", "mover", "mpadded", "mphantom", "mprescripts", "mroot", "mrow",
    "ms", "mspace", "msqrt", "mstyle", "msub", "msubsup", "msup", "mtable", "mtd",
    "mtext", "mtr", "munder", "munderover", "none", "semantics",
}
ALLOWED_MATHML_ATTRS = {
    "accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines",
    "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle",
    "edge", "equalcolumns", "equalrows", "fence", "form", "frame", "framespacing",
    "height", "largeop", "linethickness", "lspace", "mathbackground", "mathcolor",
    "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation",
    "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace",
    "scriptlevel", "selection", "separator", "separators", "stretchy", "symmetric",
    "width", "xmlns",
}
ALLOWED_XML_ATTRS = {"space"}
UNSAFE_ATTR_VALUE_RE = re.compile(r"(?:javascript|vbscript|data)\s*:", re.I)


def load_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data


def template_count():
    path = ROOT / "data" / "equation_mapping.template.json"
    if not path.exists():
        return None
    data = load_json(path)
    return len(data) if isinstance(data, list) else None


def latex_balanced(latex):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    escaped = False
    for char in latex:
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char in "([{":
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return not stack


def katex_parse_errors(rows, node_command="node", strict_mode="warn", timeout=45):
    items = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            continue
        latex = (row.get("latex") or "").strip()
        if latex:
            items.append({
                "index": index,
                "latex": latex,
                "displayMode": row.get("_kind") == "math-display",
            })

    if not items:
        return []

    katex_path = ROOT / "lib" / "katex" / "katex.min.js"
    if not katex_path.exists():
        raise RuntimeError(f"missing local KaTeX bundle: {katex_path}")

    script = r"""
const fs = require('fs');
const payload = JSON.parse(fs.readFileSync(0, 'utf8'));
const katex = require(payload.katexPath);
const errors = [];
for (const item of payload.items) {
  try {
    katex.renderToString(item.latex, {
      throwOnError: true,
      strict: payload.strictMode,
      displayMode: item.displayMode
    });
  } catch (error) {
    errors.push({
      index: item.index,
      message: String(error && error.message ? error.message : error).slice(0, 500)
    });
  }
}
process.stdout.write(JSON.stringify(errors));
"""
    payload = {
        "katexPath": katex_path.as_posix(),
        "strictMode": strict_mode,
        "items": items,
    }
    try:
        completed = subprocess.run(
            [node_command, "-e", script],
            input=json.dumps(payload, ensure_ascii=False),
            text=True,
            encoding="utf-8",
            cwd=ROOT,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
    except FileNotFoundError as exc:
        raise RuntimeError(f"Node.js command not found: {node_command}") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("KaTeX parse check timed out") from exc

    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        raise RuntimeError(f"KaTeX parse check failed: {detail[:500]}")
    return json.loads(completed.stdout or "[]")


def mathml_errors(mathml):
    errors = []
    if "<math" not in mathml:
        errors.append("mathml does not contain a <math> element")
        return errors
    if "<?xml" in mathml or "<mml:" in mathml or "</mml:" in mathml:
        errors.append("mathml must not contain XML declaration or prefixed mml tags")
    if MOJIBAKE_RE.search(mathml):
        errors.append("mathml contains mojibake; check UTF-8 decoding")
    if "<script" in mathml.lower() or "</script" in mathml.lower():
        errors.append("mathml contains forbidden HTML script content")
    try:
        root = etree.fromstring(mathml.encode("utf-8"))
    except etree.XMLSyntaxError as exc:
        errors.append(f"mathml is not parseable XML: {str(exc).splitlines()[0]}")
        return errors
    qname = etree.QName(root)
    if qname.localname != "math" or qname.namespace != MATHML_NS:
        errors.append("mathml root must be MathML <math xmlns=\"http://www.w3.org/1998/Math/MathML\">")
    for element in root.iter():
        if not isinstance(element.tag, str):
            continue
        element_name = etree.QName(element)
        if element_name.namespace != MATHML_NS:
            errors.append(f"mathml contains foreign namespace element: {element_name.localname}")
            continue
        if element_name.localname not in ALLOWED_MATHML_TAGS:
            errors.append(f"mathml contains disallowed tag: {element_name.localname}")
        for raw_name, value in element.attrib.items():
            attr_name = etree.QName(raw_name)
            local = attr_name.localname
            if attr_name.namespace:
                if attr_name.namespace == XML_NS and local in ALLOWED_XML_ATTRS:
                    continue
                errors.append(f"mathml contains disallowed namespaced attribute: {local}")
                continue
            if local.lower().startswith("on"):
                errors.append(f"mathml contains event handler attribute: {local}")
            elif local not in ALLOWED_MATHML_ATTRS:
                errors.append(f"mathml contains disallowed attribute: {local}")
            if UNSAFE_ATTR_VALUE_RE.search(value or ""):
                errors.append(f"mathml contains unsafe attribute value: {local}")
    return errors


def validate(path, strict=False, expected_count=None, katex=False):
    rows = load_json(path)
    if not isinstance(rows, list):
        raise SystemExit("Mapping root must be a list or an object containing an equations/items list.")

    errors = []
    warnings = []
    by_hash = {}
    reviewed = 0

    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            errors.append(f"row {index}: must be an object")
            continue
        media_hash = row.get("hash")
        latex = row.get("latex") or ""
        mathml = row.get("mathml") or ""
        artifact = row.get("artifact") or ""
        is_reviewed = bool(row.get("reviewed"))

        if not media_hash or not re.fullmatch(r"[0-9a-f]{64}", media_hash):
            errors.append(f"row {index}: invalid hash")
            continue
        if media_hash in by_hash:
            previous = by_hash[media_hash]
            if (previous.get("latex") or "") != latex or (previous.get("mathml") or "") != mathml:
                errors.append(f"row {index}: duplicate hash with conflicting mapping: {media_hash}")
        else:
            by_hash[media_hash] = row

        if "examples" in row and not isinstance(row["examples"], list):
            errors.append(f"row {index}: examples must be a list")
        if latex and not latex_balanced(latex):
            errors.append(f"row {index}: latex delimiters/braces are not balanced")
        if latex and any(token in latex.lower() for token in ("<script", "</script")):
            errors.append(f"row {index}: latex contains forbidden HTML script content")
        if mathml:
            for error in mathml_errors(mathml):
                errors.append(f"row {index}: {error}")
        if artifact and artifact not in ALLOWED_ARTIFACTS:
            errors.append(f"row {index}: invalid artifact type")

        if is_reviewed:
            reviewed += 1
            if not latex and not mathml and not artifact:
                errors.append(f"row {index}: reviewed row must contain latex or mathml")
            if not row.get("source"):
                errors.append(f"row {index}: reviewed row must contain source")
        elif strict:
            errors.append(f"row {index}: strict mode requires reviewed=true")

    katex_checked = 0
    if katex:
        katex_checked = sum(
            1 for row in rows
            if isinstance(row, dict) and (row.get("latex") or "").strip()
        )
        try:
            for error in katex_parse_errors(rows):
                errors.append(
                    f"row {error['index']}: latex is not KaTeX-renderable: {error['message']}"
                )
        except RuntimeError as exc:
            errors.append(f"katex check unavailable: {exc}")

    if strict:
        expected = expected_count if expected_count is not None else template_count()
        if expected is not None and len(by_hash) != expected:
            errors.append(f"strict mode requires {expected} unique rows, found {len(by_hash)}")
        if not rows:
            errors.append("strict mode requires a non-empty mapping")

    print("=== EQUATION MAPPING VALIDATION ===")
    print(f"Input: {os.path.abspath(path)}")
    print(f"Rows: {len(rows)}")
    print(f"Unique hashes: {len(by_hash)}")
    print(f"Reviewed: {reviewed}")
    if katex:
        print(f"KaTeX checked: {katex_checked}")
    if warnings:
        print(f"Warnings: {len(warnings)}")
        for warning in warnings[:20]:
            print(f"  WARN {warning}")
    if errors:
        print(f"Errors: {len(errors)}")
        for error in errors[:50]:
            print(f"  ERROR {error}")
        if len(errors) > 50:
            print(f"  ... {len(errors) - 50} more")
        raise SystemExit(1)
    print("OK")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--expected-count", type=int)
    parser.add_argument("--katex", action="store_true", help="Require non-empty LaTeX to parse with local KaTeX.")
    args = parser.parse_args()
    validate(args.input, strict=args.strict, expected_count=args.expected_count, katex=args.katex)


if __name__ == "__main__":
    main()
