import re
import subprocess
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory


ROOT = Path(__file__).resolve().parents[1]


def run_audit(*args):
    return subprocess.run(
        [sys.executable, "tools/audit.py", *args],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        capture_output=True,
    )


class AuditImageGateTest(unittest.TestCase):
    def test_default_audit_does_not_warn_for_valid_figures(self):
        result = run_audit()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertRegex(result.stdout, r"Figures:\s+136 valid")
        self.assertRegex(result.stdout, r"SUMMARY: 99 files \| .* 0 warnings \| .* 0 errors")
        self.assertNotIn("<img> tags remain", result.stdout)

    def test_strict_images_passes_current_publish_context_gate(self):
        result = run_audit("--strict-images")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertRegex(result.stdout, r"STRICT IMAGE PUBLISH")
        self.assertIn("All local images satisfy publish image gate", result.stdout)
        self.assertRegex(result.stdout, r"SUMMARY: 99 files \| .* 0 errors")
        self.assertNotIn("artifact-figure uses generic formula alt", result.stdout)
        self.assertNotIn("figure missing nearby caption/context", result.stdout)

    def test_strict_caption_does_not_leak_across_next_image(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            tmp_path = Path(tmp)
            chapter = tmp_path / "chapter.html"
            image = tmp_path / "figure.png"
            image.write_bytes(b"x" * 200)
            relative = image.relative_to(ROOT).as_posix()
            chapter.write_text(
                f'''
<div class="figure-container"><img src="{relative}" alt="first" loading="lazy"></div>
<p>Text between figures.</p>
<div class="figure-container"><img src="{relative}" alt="second" loading="lazy"></div>
<p class="caption"><strong>Hình</strong> 1.1</p>
''',
                encoding="utf-8",
            )
            import audit

            content = chapter.read_text(encoding="utf-8")
            records = audit.collect_image_records(content, "tmp/chapter.html")
            self.assertEqual(len(records), 2)
            self.assertFalse(records[0]["caption"])
            self.assertTrue(records[1]["caption"])

    def test_strict_caption_accepts_adjacent_figure_group_caption(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            tmp_path = Path(tmp)
            chapter = tmp_path / "chapter.html"
            image = tmp_path / "figure.png"
            image.write_bytes(b"x" * 200)
            relative = image.relative_to(ROOT).as_posix()
            chapter.write_text(
                f'''
<div class="figure-container"><img src="{relative}" alt="first" loading="lazy"></div>
<div class="figure-container"><img src="{relative}" alt="second" loading="lazy"></div>
<p class="caption"><strong>Hình</strong> 1.1</p>
''',
                encoding="utf-8",
            )
            import audit

            records = audit.collect_image_records(chapter.read_text(encoding="utf-8"), "tmp/chapter.html")
            self.assertEqual(len(records), 2)
            self.assertTrue(records[0]["caption"])
            self.assertTrue(records[1]["caption"])

    def test_strict_caption_accepts_nearby_previous_caption(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            tmp_path = Path(tmp)
            chapter = tmp_path / "chapter.html"
            image = tmp_path / "figure.png"
            image.write_bytes(b"x" * 200)
            relative = image.relative_to(ROOT).as_posix()
            chapter.write_text(
                f'''
<p class="caption"><strong>Hình</strong> 1.1</p>
<div class="figure-container"><img src="{relative}" alt="diagram" loading="lazy"></div>
''',
                encoding="utf-8",
            )
            import audit

            records = audit.collect_image_records(chapter.read_text(encoding="utf-8"), "tmp/chapter.html")
            self.assertEqual(len(records), 1)
            self.assertTrue(records[0]["caption"])

    def test_strict_context_accepts_nearby_text_reference(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            tmp_path = Path(tmp)
            chapter = tmp_path / "chapter.html"
            image = tmp_path / "figure.png"
            image.write_bytes(b"x" * 200)
            relative = image.relative_to(ROOT).as_posix()
            chapter.write_text(
                f'''
<div class="figure-container"><img src="{relative}" alt="diagram" loading="lazy"></div>
<p>Ví dụ 1: Vật rắn chịu lực như hình vẽ. Xác định phản lực liên kết.</p>
''',
                encoding="utf-8",
            )
            import audit

            records = audit.collect_image_records(chapter.read_text(encoding="utf-8"), "tmp/chapter.html")
            self.assertEqual(len(records), 1)
            self.assertFalse(records[0]["caption"])
            self.assertTrue(records[0]["context"])
            self.assertEqual(audit.strict_image_errors(records), [])

    def test_strict_context_accepts_short_inline_figure_group_text(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            tmp_path = Path(tmp)
            chapter = tmp_path / "chapter.html"
            image = tmp_path / "figure.png"
            image.write_bytes(b"x" * 200)
            relative = image.relative_to(ROOT).as_posix()
            chapter.write_text(
                f'''
<p>Khảo sát chuyển động cơ hệ gồm vỏ mô tơ, rô to và khối lượng lệch tâm.</p>
<p>Các ngoại lực tác dụng lên cơ hệ gồm các trọng lực của trục mất cân bằng</p>
<div class="figure-container"><img src="{relative}" alt="first" loading="lazy"></div>
<p><sub>2</sub>, của vỏ động cơ</p>
<div class="figure-container"><img src="{relative}" alt="second" loading="lazy"></div>
<p><sub>1</sub> và phản lực của nền lên động cơ</p>
<div class="figure-container"><img src="{relative}" alt="third" loading="lazy"></div>
''',
                encoding="utf-8",
            )
            import audit

            records = audit.collect_image_records(chapter.read_text(encoding="utf-8"), "tmp/chapter.html")
            self.assertEqual(len(records), 3)
            self.assertTrue(all(record["context"] for record in records))
            self.assertEqual(audit.strict_image_errors(records), [])

    def test_strict_context_rejects_orphan_figure_without_caption(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            tmp_path = Path(tmp)
            chapter = tmp_path / "chapter.html"
            image = tmp_path / "figure.png"
            image.write_bytes(b"x" * 200)
            relative = image.relative_to(ROOT).as_posix()
            chapter.write_text(
                f'<div class="figure-container"><img src="{relative}" alt="orphan" loading="lazy"></div>',
                encoding="utf-8",
            )
            import audit

            records = audit.collect_image_records(chapter.read_text(encoding="utf-8"), "tmp/chapter.html")
            self.assertEqual(len(records), 1)
            self.assertFalse(records[0]["caption"])
            self.assertFalse(records[0]["context"])
            self.assertRegex(
                "\n".join(audit.strict_image_errors(records)),
                r"figure missing nearby caption/context",
            )


if __name__ == "__main__":
    unittest.main()
