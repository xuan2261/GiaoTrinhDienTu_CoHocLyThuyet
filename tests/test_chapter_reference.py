import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from chapter_reference import load_chapter_reference, render_chapter_reference, validate_chapter_reference


ROUTES = {
    "ch1": {"ch1-1-3", "ch1-1-4", "ch1-4-1"},
    "ch2": {"ch2-1-1", "ch2-2-2"},
    "ch3": {"ch3-1-1", "ch3-1-2", "ch3-1-3", "ch3-2-2"},
}


class ChapterReferenceTest(unittest.TestCase):
    def test_curated_input_is_valid_and_rendering_is_deterministic(self):
        data = load_chapter_reference(ROOT / "data" / "chapter-reference.json")
        validate_chapter_reference(data, ROUTES)
        for chapter in ("ch1", "ch2", "ch3"):
            rendered = render_chapter_reference(chapter, data["chapters"][chapter]["entries"])
            self.assertEqual(rendered, render_chapter_reference(chapter, data["chapters"][chapter]["entries"]))
            self.assertEqual(rendered.count('class="chapter-reference"'), 1)
            self.assertIn("<details open>", rendered)
            self.assertIn("<thead>", rendered)
            self.assertIn("scope=\"col\"", rendered)
            self.assertIn(f'href="#{data["chapters"][chapter]["entries"][0]["sourceRoutes"][0]}"', rendered)

    def test_renderer_escapes_all_curated_text_fields(self):
        rendered = render_chapter_reference("ch1", [{
            "id": "ch1-escaped-label",
            "kind": "abbreviation",
            "label": '<img src=x onerror=alert(1)>',
            "meaning": "A & B < C",
            "unit": 'm"',
            "sourceRoutes": ["ch1-1-3"],
        }])
        self.assertNotIn("<img", rendered)
        self.assertIn("&lt;img src=x onerror=alert(1)&gt;", rendered)
        self.assertIn("A &amp; B &lt; C", rendered)
        self.assertIn('m&quot;', rendered)

    def test_validation_rejects_cross_chapter_routes_and_raw_html_field(self):
        data = {
            "schemaVersion": 1,
            "chapters": {
                "ch1": {"entries": [{"id": "ch1-cross-route", "kind": "symbol", "tex": "x", "meaning": "x", "sourceRoutes": ["ch2-1-1"]}, {"id": "ch1-unit", "kind": "unit", "label": "m", "meaning": "mét", "sourceRoutes": ["ch1-1-3"]}, {"id": "ch1-abbr", "kind": "abbreviation", "label": "Oxyz", "meaning": "hệ trục", "sourceRoutes": ["ch1-1-3"]}]},
                "ch2": {"entries": [{"id": "ch2-symbol", "kind": "symbol", "tex": "x", "meaning": "x", "sourceRoutes": ["ch2-1-1"]}, {"id": "ch2-unit", "kind": "unit", "label": "m", "meaning": "mét", "sourceRoutes": ["ch2-1-1"]}, {"id": "ch2-abbr", "kind": "abbreviation", "label": "Oxyz", "meaning": "hệ trục", "sourceRoutes": ["ch2-1-1"]}]},
                "ch3": {"entries": [{"id": "ch3-symbol", "kind": "symbol", "tex": "x", "meaning": "x", "sourceRoutes": ["ch3-1-1"]}, {"id": "ch3-unit", "kind": "unit", "label": "m", "meaning": "mét", "sourceRoutes": ["ch3-1-1"]}, {"id": "ch3-abbr", "kind": "abbreviation", "label": "HQT", "meaning": "hệ quy chiếu", "sourceRoutes": ["ch3-1-1"], "html": "<b>x</b>"}]},
            },
        }
        with self.assertRaisesRegex(ValueError, "ch1-cross-route.*ch2-1-1"):
            validate_chapter_reference(data, ROUTES)
        data["chapters"]["ch1"]["entries"][0]["sourceRoutes"] = ["ch1-1-3"]
        with self.assertRaisesRegex(ValueError, "ch3-abbr.*unexpected"):
            validate_chapter_reference(data, ROUTES)


if __name__ == "__main__":
    unittest.main()
