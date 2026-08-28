import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools" / "gen_quiz_pages.py"


def load_module(script):
    spec = importlib.util.spec_from_file_location("quiz_page_generator", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class QuizPageGenerationTest(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        tools = self.root / "tools"
        tools.mkdir()
        shutil.copy2(SOURCE, tools / SOURCE.name)
        for chapter in (1, 2, 3):
            (self.root / "chapters" / f"ch{chapter}").mkdir(parents=True)
            (self.root / "chapters" / f"ch{chapter}" / "on-tap-trac-nghiem.html").write_text("obsolete", encoding="utf-8")
            (self.root / "chapters" / f"ch{chapter}" / "cau-hoi-on-tap.html").write_text("preserve", encoding="utf-8")

    def tearDown(self):
        self.tempdir.cleanup()

    def test_import_is_side_effect_free_and_generation_is_canonical_and_idempotent(self):
        module = load_module(self.root / "tools" / "gen_quiz_pages.py")
        for chapter in (1, 2, 3):
            chapter_dir = self.root / "chapters" / f"ch{chapter}"
            self.assertFalse((chapter_dir / "trac-nghiem.html").exists())
            self.assertEqual((chapter_dir / "on-tap-trac-nghiem.html").read_text(encoding="utf-8"), "obsolete")

        module.generate_quiz_pages(self.root)
        first = {}
        for chapter in (1, 2, 3):
            chapter_dir = self.root / "chapters" / f"ch{chapter}"
            canonical = chapter_dir / "trac-nghiem.html"
            self.assertTrue(canonical.exists())
            self.assertFalse((chapter_dir / "on-tap-trac-nghiem.html").exists())
            self.assertEqual((chapter_dir / "cau-hoi-on-tap.html").read_text(encoding="utf-8"), "preserve")
            text = canonical.read_text(encoding="utf-8")
            self.assertIn(f"id=\"quiz-ch{chapter}\"", text)
            self.assertIn(f"renderQuiz('quiz-ch{chapter}','ch{chapter}','all')", text)
            first[chapter] = text

        module.generate_quiz_pages(self.root)
        for chapter, expected in first.items():
            actual = (self.root / "chapters" / f"ch{chapter}" / "trac-nghiem.html").read_text(encoding="utf-8")
            self.assertEqual(actual, expected)


if __name__ == "__main__":
    unittest.main()
