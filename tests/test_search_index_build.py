import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from build_search_index import build_index, validate_index, visible_blocks, write_outputs


class SearchIndexBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "data/content-manifest.json").read_text(encoding="utf-8"))
        cls.index = build_index(ROOT)

    def test_schema_hash_route_coverage_and_unique_anchors(self):
        self.assertEqual(self.index["schemaVersion"], 1)
        self.assertEqual(self.index["contentManifestHash"], self.manifest["contentHash"])
        expected = [route["routeId"] for route in self.manifest["routes"]]
        self.assertEqual([route["routeId"] for route in self.index["routes"]], expected)
        anchors = [entry["anchor"] for entry in self.index["entries"]]
        identifiers = [entry["id"] for entry in self.index["entries"]]
        self.assertEqual(len(anchors), len(set(anchors)))
        self.assertEqual(len(identifiers), len(set(identifiers)))
        for entry in self.index["entries"]:
            prefix = f'search-{entry["routeId"]}-'
            self.assertTrue(entry["anchor"].startswith(prefix))
            if entry["field"] == "title":
                self.assertEqual(entry["anchor"], prefix + "title")
            elif "glossary" not in entry["anchor"]:
                self.assertEqual(entry["anchor"], prefix + f'{entry["blockIndex"]:04d}')
        self.assertFalse(validate_index(self.index, self.manifest))

    def test_nested_and_level_three_blocks_follow_dom_document_order(self):
        self.assertEqual(
            visible_blocks('<div class="l3-title">Title</div><ul><li>Outer <p>Inner</p> Tail</li></ul>'),
            [("l3-title", "Title"), ("li", "Outer Inner Tail"), ("p", "Inner")],
        )

    def test_body_text_vietnamese_folding_and_stable_output(self):
        matches = [entry for entry in self.index["entries"] if "vô cùng bé" in entry["text"].lower()]
        self.assertTrue(matches)
        self.assertTrue(any("vo cung be" in entry["folded"] for entry in matches))
        self.assertTrue(self.index["glossaryDigest"])
        self.assertTrue(any(entry["field"] == "heading" and entry["text"] == "Câu hỏi trắc nghiệm Chương 1" for entry in self.index["entries"]))
        self.assertEqual(self.index, build_index(ROOT))
        with tempfile.TemporaryDirectory() as temporary:
            output_root = Path(temporary)
            (output_root / "data").mkdir()
            (output_root / "js").mkdir()
            write_outputs(output_root, self.index)
            first = (output_root / "data/search-index.json").read_bytes()
            write_outputs(output_root, self.index)
            self.assertEqual(first, (output_root / "data/search-index.json").read_bytes())
            wrapper = (output_root / "js/search-index.js").read_text(encoding="utf-8")
            self.assertTrue(wrapper.startswith("window.SEARCH_INDEX = "))

    def test_schema_mutations_fail(self):
        stale = copy.deepcopy(self.index)
        stale["contentManifestHash"] = "0" * 64
        self.assertIn("content manifest hash mismatch", validate_index(stale, self.manifest))
        duplicate = copy.deepcopy(self.index)
        duplicate["entries"][1]["anchor"] = duplicate["entries"][0]["anchor"]
        self.assertIn("duplicate entry anchor", validate_index(duplicate, self.manifest))
        missing = copy.deepcopy(self.index)
        missing["routes"].pop()
        self.assertIn("route coverage mismatch", validate_index(missing, self.manifest))


if __name__ == "__main__":
    unittest.main()
