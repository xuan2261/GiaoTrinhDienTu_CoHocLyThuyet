import html
import json
import re
import unittest
from pathlib import Path

from lxml import etree

try:
    from validate_equation_mapping import mathml_errors
    from extract_docx import render_mapped_equation
except ImportError:
    from tools.validate_equation_mapping import mathml_errors
    from tools.extract_docx import render_mapped_equation


ROOT = Path(__file__).resolve().parents[1]
MATHML_NS = "http://www.w3.org/1998/Math/MathML"
MOJIBAKE_RE = re.compile(r"\u00e2[\u0080-\uffff]|\u00c3[\u0080-\uffff]|\u00c2[\u0080-\uffff]")
INLINE_MATH_AFTER_RE = re.compile(r"(?:</math>\s*</span>|\\\)</span>)(?=[^\W\d_])")
INLINE_MATH_BEFORE_RE = re.compile(r"[^\W\d_]<span class=\"(?:mathml-inline|math-tex)\"")
INLINE_BLOCK_MATHML_RE = re.compile(
    r"<span class=\"mathml-inline\">\s*<math\b[^>]*\bdisplay=[\"']block[\"']",
    flags=re.I,
)


def load_rows(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data


def generated_content():
    parts = []
    for path in (ROOT / "chapters").rglob("*.html"):
        parts.append(path.read_text(encoding="utf-8"))
    parts.append((ROOT / "js" / "pages.js").read_text(encoding="utf-8"))
    return "\n".join(parts)


class DocxEquationPipelineTest(unittest.TestCase):
    def test_reviewed_mathml_mapping_is_clean(self):
        for relative in ("data/equation_mapping.json", "data/equation_mapping.reviewed.json"):
            with self.subTest(file=relative):
                rows = load_rows(ROOT / relative)
                for index, row in enumerate(rows):
                    mathml = row.get("mathml") or ""
                    if not row.get("reviewed") or not mathml:
                        continue

                    self.assertIsNone(MOJIBAKE_RE.search(mathml), f"row {index} has mojibake")
                    self.assertNotRegex(mathml, r"<\?xml|</?mml:", f"row {index} has raw XML/prefix")

                    root = etree.fromstring(mathml.encode("utf-8"))
                    qname = etree.QName(root)
                    self.assertEqual(qname.localname, "math", f"row {index} root is not math")
                    self.assertEqual(qname.namespace, MATHML_NS, f"row {index} namespace mismatch")

    def test_generated_math_output_is_clean(self):
        content = generated_content()
        self.assertIsNone(MOJIBAKE_RE.search(content))
        self.assertNotRegex(content, r"<\?xml|</?mml:")
        self.assertEqual(len(INLINE_BLOCK_MATHML_RE.findall(content)), 0)

    def test_mathml_validator_rejects_unsafe_attributes(self):
        unsafe = (
            '<math xmlns="http://www.w3.org/1998/Math/MathML">'
            '<mtext onclick="alert(1)">x</mtext>'
            "</math>"
        )
        self.assertTrue(any("event handler" in error for error in mathml_errors(unsafe)))

    def test_inline_math_keeps_word_spacing(self):
        content = "\n".join(
            path.read_text(encoding="utf-8")
            for path in (ROOT / "chapters").rglob("*.html")
        )
        decoded = html.unescape(content)
        self.assertEqual(len(INLINE_MATH_AFTER_RE.findall(decoded)), 0)
        self.assertEqual(len(INLINE_MATH_BEFORE_RE.findall(decoded)), 0)

    def test_front_matter_is_transferred_to_author_page(self):
        content = html.unescape((ROOT / "chapters" / "tac-gia.html").read_text(encoding="utf-8"))
        content = re.sub(r"<[^>]+>", "", content)
        required = [
            "QUÂN CHỦNG HẢI QUÂN",
            "HỌC VIỆN HẢI QUÂN",
            "KHÁNH HÒA - 2026",
            "HỘI ĐỒNG THẨM ĐỊNH",
            "Chủ biên: Đại tá, TS Nguyễn Lê Văn",
            "Bùi Thanh Xuân",
        ]
        for text in required:
            with self.subTest(text=text):
                self.assertIn(text, content)
        excluded = [
            "MỤC LỤC",
            "Trang",
            "LỜI NÓI ĐẦU",
            "Chương 1 TĨNH HỌC",
        ]
        for text in excluded:
            with self.subTest(excluded=text):
                self.assertNotIn(text, content)

    def test_artifact_figure_mapping_uses_reviewed_alt_text(self):
        rendered = render_mapped_equation(
            {"artifact": "figure", "alt": "Sơ đồ hệ lực phân bố trên dầm"},
            "math-display",
            rel="images/ch1/hinh-078.png",
            alt="Công thức image78.png",
        )
        self.assertIn('alt="Sơ đồ hệ lực phân bố trên dầm"', rendered["html"])
        self.assertNotIn("Công thức image78.png", rendered["html"])


if __name__ == "__main__":
    unittest.main()
