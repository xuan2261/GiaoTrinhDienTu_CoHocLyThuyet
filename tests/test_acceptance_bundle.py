import csv
import hashlib
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from tools import build_acceptance_bundle as bundle


ROOT = Path(__file__).resolve().parents[1]


class AcceptanceBundleTest(unittest.TestCase):
    def setUp(self):
        self.temp = Path(tempfile.mkdtemp(prefix="acceptance-bundle-")).resolve()
        self.originals = (bundle.PLAN, bundle.EVIDENCE_DIR, bundle.REPORTS_DIR)
        bundle.PLAN = self.temp
        bundle.EVIDENCE_DIR = self.temp / "evidence"
        bundle.REPORTS_DIR = self.temp / "reports"

    def tearDown(self):
        bundle.PLAN, bundle.EVIDENCE_DIR, bundle.REPORTS_DIR = self.originals
        shutil.rmtree(self.temp)

    def test_bundle_is_hash_bound_and_preserves_blockers(self):
        rows, records = bundle.evidence_rows()
        bundle.write_rtm(records)
        bundle.write_command_log(rows)
        bundle.write_manual_reports(records)
        inventory = bundle.write_release_inventory(None)
        bundle.write_report("2026-08-21T00:00:00Z", rows, inventory)
        bundle.write_checksums()

        requirements = json.loads((ROOT / "data/requirement-traceability.json").read_text(encoding="utf-8"))["requirements"]
        with (bundle.EVIDENCE_DIR / "requirement-traceability-matrix.csv").open(encoding="utf-8", newline="") as handle:
            rtm = list(csv.DictReader(handle))
        self.assertEqual(len(rtm), len(requirements))
        self.assertTrue(all(row["ownerRole"] and row["reviewRole"] for row in rtm))

        report = (bundle.REPORTS_DIR / "phase-12-acceptance-report.md").read_text(encoding="utf-8")
        self.assertIn("Overall: **blocked**", report)
        self.assertIn("No unsupported WCAG AA", report)
        self.assertIn("no executed LMS import", report)
        self.assertIn("pending external review", (bundle.EVIDENCE_DIR / "independent-review.md").read_text(encoding="utf-8"))

        checksum_file = bundle.EVIDENCE_DIR / "checksums" / "SHA256SUMS"
        entries = checksum_file.read_text(encoding="utf-8").splitlines()
        self.assertGreater(len(entries), 5)
        for entry in entries:
            digest, relative = entry.split(" *", 1)
            self.assertEqual(hashlib.sha256((bundle.PLAN / relative).read_bytes()).hexdigest(), digest)

        all_pass = [{**row, "status": "pass"} for row in rows]
        bundle.write_report("2026-08-21T00:00:00Z", all_pass, {"status": "not-built", "summary": None, "derivatives": []})
        no_release = (bundle.REPORTS_DIR / "phase-12-acceptance-report.md").read_text(encoding="utf-8")
        self.assertIn("Overall: **blocked**", no_release)
        self.assertIn("release inventory: not-built", no_release)


if __name__ == "__main__":
    unittest.main()
