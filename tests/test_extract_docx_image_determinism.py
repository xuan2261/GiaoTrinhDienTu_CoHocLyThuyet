import shutil
import sys
import tempfile
import time
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from extract_docx import ImageWriter


DOCX = ROOT / "CoHocLyThuyet_Full_New.docx"
VECTOR_MEDIA = "word/media/image173.wmf"
VOLATILE_PNG_MARKERS = (b"tIME", b"date:create", b"date:modify", b"date:timestamp")
STABLE_PNG_MARKERS = (b"cHRM", b"pHYs", b"IDAT")


class ExtractDocxImageDeterminismTest(unittest.TestCase):
    @unittest.skipUnless(shutil.which("magick"), "ImageMagick is required for vector conversion")
    def test_vector_conversion_is_byte_deterministic(self):
        with zipfile.ZipFile(DOCX) as package:
            media = package.read(VECTOR_MEDIA)

        outputs = []
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for index, run in enumerate(("first", "second")):
                writer = ImageWriter(root / run, {"image173.wmf": media}, write=True)
                relative = writer.asset_for(1, "image173.wmf")
                self.assertEqual(writer.failures, [])
                outputs.append((root / run / relative).read_bytes())
                if index == 0:
                    time.sleep(1.1)

        self.assertEqual(outputs[0], outputs[1])
        for marker in VOLATILE_PNG_MARKERS:
            self.assertNotIn(marker, outputs[0])
        for marker in STABLE_PNG_MARKERS:
            self.assertIn(marker, outputs[0])


if __name__ == "__main__":
    unittest.main()
