"""The legacy Ch1 generator must never replace the reviewed v2 bank with 50 v1 items."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StaticsQuizExport(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root/'tools').mkdir()
        (self.root/'data').mkdir()
        self.script = self.root/'tools/gen_quiz_ch1.py'
        shutil.copyfile(ROOT/'tools/gen_quiz_ch1.py', self.script)
        self.source = self.root/'data/quiz-ch1.json'
        shutil.copyfile(ROOT/'data/quiz-ch1.json', self.source)
        self.before = self.source.read_bytes()

    def test_default_validates_without_overwriting_canonical(self):
        result = subprocess.run([sys.executable, str(self.script)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.source.read_bytes(), self.before)
        self.assertEqual(len(json.loads(self.source.read_text())['items']), 100)

    def test_explicit_export_preserves_all_items_and_metadata(self):
        export = self.root/'export.json'
        result = subprocess.run([sys.executable, str(self.script), '--output', str(export)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(export.is_file())
        self.assertEqual(json.loads(export.read_text()), json.loads(self.before))
        self.assertEqual(self.source.read_bytes(), self.before)

    def test_rejects_overwriting_source(self):
        result = subprocess.run([sys.executable, str(self.script), '--output', str(self.source)], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.source.read_bytes(), self.before)


if __name__ == '__main__':
    unittest.main()
