import copy
import hashlib
import subprocess
import sys
import tempfile
import unittest
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from unittest.mock import patch
from tools.generate_scientific_report_docx import (
    DEFAULT_OUTPUT,
    build_report,
    candidate_evidence_binding,
    decision_profile,
    evidence_input_hashes,
    load_evidence,
    main,
    validate_gif_inventory,
)


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
WP = "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}"
ROOT = Path(__file__).resolve().parents[1]


def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.iter(W + "t"))


def paragraph_style(paragraph):
    style = paragraph.find("./" + W + "pPr/" + W + "pStyle")
    return style.get(W + "val") if style is not None else None


class ScientificReportContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        cls.output = Path(cls.temp_dir.name) / "scientific-report.docx"
        build_report(cls.output)
        cls.archive = zipfile.ZipFile(cls.output)
        cls.document = ET.fromstring(cls.archive.read("word/document.xml"))
        cls.settings = ET.fromstring(cls.archive.read("word/settings.xml"))
        cls.text = "\n".join(
            paragraph_text(paragraph)
            for paragraph in cls.document.iter(W + "p")
        )
        cls.evidence = load_evidence()

    @classmethod
    def tearDownClass(cls):
        cls.archive.close()
        cls.temp_dir.cleanup()

    def test_report_uses_current_candidate_snapshot_and_gate_counts(self):
        acceptance = self.evidence["acceptance"]
        summary = acceptance["gateSummary"]
        self.assertEqual("blocked", acceptance["overallStatus"])
        self.assertTrue(self.evidence["candidateEvidence"]["current"])
        self.assertIn(
            "DỰ THẢO — 20 CỔNG ĐẠT, CHỜ 4 ĐÁNH GIÁ ĐỘC LẬP",
            self.text,
        )
        self.assertIn("Ràng buộc snapshot–candidate: current", self.text)
        self.assertIn(
            f"{summary['pass']}/{summary['total']} pass; "
            f"{summary['fail']} fail; {summary['blocked']} blocked; "
            f"{summary['notRun']} not run",
            self.text,
        )
        self.assertNotIn(
            "Acceptance snapshot không ràng buộc candidate hiện hành",
            self.text,
        )
        for gate in acceptance["gates"]:
            self.assertIn(gate["gateId"], self.text)

    def test_decision_profiles_distinguish_approved_rejected_and_blocked(self):
        def acceptance(decision):
            return {"releaseDecision": {"decision": decision}}

        self.assertEqual(
            "approved",
            decision_profile(acceptance("approved"), True)["key"],
        )
        rejected = decision_profile(acceptance("rejected"), True)
        self.assertEqual("rejected", rejected["key"])
        self.assertIn("bị từ chối", rejected["conclusion"])
        blocked = decision_profile(acceptance("blocked"), True)
        self.assertEqual("blocked", blocked["key"])
        self.assertIn("thiếu điều kiện", blocked["conclusion"])
        self.assertEqual(
            "evidence-mismatch",
            decision_profile(acceptance("approved"), False)["key"],
        )

    def test_evidence_log_bytes_must_match_registry_hash(self):
        evidence_root = Path(self.temp_dir.name) / "evidence-log"
        evidence_root.mkdir()
        log_path = evidence_root / "candidate.log"
        original = b"sha256:" + b"1" * 64 + b" summary.json\n"
        log_path.write_bytes(original)
        record = {
            "artifact": "candidate.log",
            "hash": "sha256:" + hashlib.sha256(original).hexdigest(),
        }
        self.assertEqual(
            {"summary.json": "1" * 64},
            evidence_input_hashes(record, root=evidence_root),
        )
        log_path.write_bytes(original + b"tampered\n")
        with self.assertRaisesRegex(ValueError, "stale evidence log"):
            evidence_input_hashes(record, root=evidence_root)

    def test_report_gif_inventory_must_equal_runtime_and_release_sets(self):
        rows = [("assets/gifs/a.gif", "A", "images/a.png")]
        runtime = {"images/a.png": "assets/gifs/a.gif"}
        release = {"assets/gifs/a.gif"}
        self.assertEqual(
            runtime,
            validate_gif_inventory(rows, runtime, release),
        )
        with self.assertRaisesRegex(ValueError, "runtime manifest"):
            validate_gif_inventory(
                rows,
                {**runtime, "images/b.png": "assets/gifs/b.gif"},
                release,
            )
        with self.assertRaisesRegex(ValueError, "release manifest"):
            validate_gif_inventory(
                rows,
                runtime,
                {"assets/gifs/a.gif", "assets/gifs/b.gif"},
            )

    def test_candidate_binding_requires_acceptance_join_paths_and_hashes(self):
        gate = {
            "gateId": "release-candidate-inventory",
            "status": "pass",
            "artifact": "candidate.log",
            "hash": "sha256:" + "a" * 64,
            "observedAt": "2026-09-01T00:00:00Z",
        }
        acceptance = {"gates": [dict(gate)]}
        record = {**gate, "inputs": ["summary.json", "manifest.json", "package.zip"]}
        expected = {
            "summary.json": "1" * 64,
            "manifest.json": "2" * 64,
            "package.zip": "3" * 64,
        }
        self.assertTrue(
            candidate_evidence_binding(
                acceptance,
                record,
                dict(expected),
                expected,
            )["current"]
        )
        bad_hashes = dict(expected)
        bad_hashes["package.zip"] = "4" * 64
        self.assertIn(
            "package.zip",
            candidate_evidence_binding(
                acceptance,
                record,
                bad_hashes,
                expected,
            )["hashMismatches"],
        )
        stale_acceptance = {"gates": [{**gate, "hash": "sha256:" + "b" * 64}]}
        self.assertIn(
            "hash",
            candidate_evidence_binding(
                stale_acceptance,
                record,
                dict(expected),
                expected,
            )["joinMismatches"],
        )

    def test_full_reports_render_approved_rejected_and_blocked_states(self):
        def render(name, mutate, current=True):
            evidence = copy.deepcopy(self.evidence)
            evidence["candidateEvidence"] = {
                "current": current,
                "observedAt": "2026-09-01T00:00:00Z",
                "missingInputs": [] if current else ["candidate.zip"],
                "hashMismatches": [],
                "joinMismatches": [],
            }
            mutate(evidence["acceptance"])
            output = Path(self.temp_dir.name) / f"{name}.docx"
            build_report(output, evidence=evidence)
            with zipfile.ZipFile(output) as archive:
                document = ET.fromstring(archive.read("word/document.xml"))
            return "\n".join(
                paragraph_text(paragraph)
                for paragraph in document.iter(W + "p")
            )

        def approve(acceptance):
            for gate in acceptance["gates"]:
                gate["status"] = "pass"
            total = len(acceptance["gates"])
            acceptance["gateSummary"] = {
                "total": total,
                "pass": total,
                "fail": 0,
                "blocked": 0,
                "notRun": 0,
            }
            acceptance["overallStatus"] = "pass"
            acceptance["releaseDecision"] = {
                "decision": "approved",
                "rationale": "synthetic approved contract",
            }

        def reject(acceptance):
            target = next(
                gate for gate in acceptance["gates"]
                if gate["gateId"] == "lms-adapters"
            )
            target["status"] = "fail"
            summary = acceptance["gateSummary"]
            summary["pass"] -= 1
            summary["fail"] += 1
            acceptance["overallStatus"] = "fail"
            acceptance["releaseDecision"] = {
                "decision": "rejected",
                "rationale": "synthetic rejected contract",
            }

        def block(acceptance):
            acceptance["overallStatus"] = "blocked"
            acceptance["releaseDecision"] = {
                "decision": "blocked",
                "rationale": "synthetic blocked contract",
            }

        approved_text = render("approved-report", approve)
        self.assertIn("TRẠNG THÁI: ĐÃ ĐỦ CỔNG BẰNG CHỨNG", approved_text)
        rejected_text = render("rejected-report", reject)
        self.assertIn("BỊ TỪ CHỐI — CÓ CỔNG KIỂM TRA THẤT BẠI", rejected_text)
        self.assertIn(
            "Gate adapter LMS có trạng thái fail; không tuyên bố đã đạt.",
            rejected_text,
        )
        self.assertNotIn(
            "Gate adapter QTI 3/Common Cartridge 1.4 đã pass",
            rejected_text,
        )
        blocked_text = render("blocked-report", block)
        self.assertIn(
            "DỰ THẢO — 20 CỔNG ĐẠT, CHỜ 4 ĐÁNH GIÁ ĐỘC LẬP",
            blocked_text,
        )
        mismatch_text = render("mismatch-report", block, current=False)
        self.assertIn(
            "DỰ THẢO — BẰNG CHỨNG KHÔNG CÙNG SNAPSHOT",
            mismatch_text,
        )

    def test_report_does_not_restore_unsupported_claims_or_branding(self):
        banned = (
            "100% Technical Release Readiness",
            "đáp ứng toàn diện các tiêu chuẩn kiểm định giáo dục đại học",
            "tuân thủ WCAG 2.1/2.2 AA",
            "sẵn sàng import vào Canvas, Moodle, Blackboard",
            "độ tin cậy tuyệt đối",
            "hoàn thành 100% các tiêu chí kỹ thuật, sư phạm và mỹ thuật",
            "BÁO CÁO KHOA HỌC\nĐÁNH GIÁ TOÀN DIỆN QUI CÁCH",
            "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
            "HỘI ĐỒNG THẨM ĐỊNH VÀ NGHIỆM THU",
            "trạng thái phát hành của đúng candidate",
        )
        for claim in banned:
            self.assertNotIn(claim, self.text)
        self.assertIn("Không phải chứng nhận học thuật, WCAG, CDIO/ABET", self.text)
        self.assertIn("Không có target LMS hoặc execution evidence", self.text)

    def test_semantic_navigation_fields_and_captions_exist(self):
        style_ids = [
            style.get(W + "val")
            for style in self.document.iter(W + "pStyle")
        ]
        self.assertIn("Heading1", style_ids)
        self.assertIn("Heading2", style_ids)
        self.assertIn("Caption", style_ids)

        document_fields = " ".join(
            node.text or "" for node in self.document.iter(W + "instrText")
        )
        self.assertIn("TOC", document_fields)
        self.assertIn("SEQ Figure", document_fields)
        self.assertIn("SEQ Table", document_fields)
        self.assertIn("SEQ Diagram", document_fields)
        for number in range(1, 8):
            self.assertIn(f"Hình {number}.", self.text)
        for number in range(1, 7):
            self.assertIn(f"Bảng {number}.", self.text)
        for number in range(1, 4):
            self.assertIn(f"Sơ đồ {number}.", self.text)

        footer_parts = [
            name for name in self.archive.namelist()
            if name.startswith("word/footer") and name.endswith(".xml")
        ]
        footer_fields = " ".join(
            node.text or ""
            for part in footer_parts
            for node in ET.fromstring(self.archive.read(part)).iter(W + "instrText")
        )
        self.assertIn("PAGE", footer_fields)
        self.assertIn("NUMPAGES", footer_fields)
        update_fields = self.settings.find(W + "updateFields")
        self.assertIsNotNone(update_fields)
        self.assertEqual("true", update_fields.get(W + "val"))

    def test_every_embedded_image_has_hash_bound_provenance(self):
        properties = list(self.document.iter(WP + "docPr"))
        self.assertEqual(11, len(properties))
        self.assertTrue(all(item.get("descr") and item.get("title") for item in properties))

        captions = [
            paragraph_text(paragraph)
            for paragraph in self.document.iter(W + "p")
            if paragraph_style(paragraph) == "Caption"
            and "Nguồn:" in paragraph_text(paragraph)
        ]
        provenance = self.evidence["imageProvenance"]
        self.assertEqual(len(provenance), len(captions))
        for relative_path, record in provenance.items():
            matches = [caption for caption in captions if relative_path in caption]
            self.assertEqual(1, len(matches), relative_path)
            self.assertIn(record["sha256"], matches[0])
            self.assertIn(record["authority"], matches[0])

    def test_generation_is_byte_reproducible(self):
        second_output = Path(self.temp_dir.name) / "scientific-report-second.docx"
        build_report(second_output)
        self.assertEqual(self.output.read_bytes(), second_output.read_bytes())

    def test_cli_output_and_default_contract(self):
        nested_output = Path(self.temp_dir.name) / "nested" / "cli-report.docx"
        result = subprocess.run(
            [
                sys.executable,
                str(ROOT / "tools/generate_scientific_report_docx.py"),
                "--output",
                str(nested_output),
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertTrue(nested_output.is_file())
        with patch.object(sys, "argv", ["generate_scientific_report_docx.py"]):
            with patch(
                "tools.generate_scientific_report_docx.build_report"
            ) as mocked_build:
                main()
                mocked_build.assert_called_once_with(DEFAULT_OUTPUT)


if __name__ == "__main__":
    unittest.main()
